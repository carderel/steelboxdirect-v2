/**
 * Quote form quantity 1 / 2 / 3 / 4 / 5 or more, one size per container (owner-approved
 * 2026-11-19, after a buyer sent the form twice, 20ft then 40ft, because size took one answer).
 *
 * Pins: the new scoring buckets; "5 or more" is bulk and blocks rent-to-own; the seller email and
 * subject list every size; a blank extra size is not_sure; selects past the quantity are ignored;
 * bulk_details reaches the seller email; legacy buckets still read. The new fields are email only
 * (never in the leads insert), and the seller email still fires when the database save fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  QUANTITY_LABELS,
  QUANTITY_ORDER,
  containerSizes,
  sizeSummary,
  sizeSlotCount,
  bulkDetailsOneLine,
} from './quote-quantity';
import { exceedsRtoQuantity, RTO_BULK_SELLER_LINE } from './rto-eligibility';

const insertMock = vi.fn();
const updateEqMock = vi.fn();
const sendMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: insertMock,
      update: () => ({ eq: updateEqMock }),
    }),
  }),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.RESEND_API_KEY = 'test-resend';
process.env.SELLER_EMAIL = 'doug@example.com';

const { POST, calculateLeadScore, isBulkLead, quantityLabel, applyRtoQuantityRule, sellerSubject } = await import(
  '../pages/api/submit-quote'
);

const base = {
  name: 'Test Buyer',
  email: 'buyer@example.com',
  phone: '5135550100',
  size_preference: '20ft',
  condition_preference: 'wind_water_tight',
  primary_use: 'storage',
  delivery_zip: '45202',
  site_access: 'easy',
  timeline: 'asap',
};

async function submit(body: object) {
  const res = await POST({
    request: new Request('http://localhost/api/submit-quote', { method: 'POST', body: JSON.stringify(body) }),
  } as any);
  return { status: res.status, json: await res.json() };
}

const sellerMail = () => sendMock.mock.calls.find(([m]) => m.to !== base.email)?.[0] ?? { text: '', subject: '' };
const buyerMail = () => sendMock.mock.calls.find(([m]) => m.to === base.email)?.[0] ?? { text: '', subject: '' };
const row = () => insertMock.mock.calls[0][0];

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue({ error: null });
  updateEqMock.mockReset().mockResolvedValue({ error: null });
  sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('scoring buckets', () => {
  it.each([
    ['1', 0],
    ['2', 5],
    ['3', 8],
    ['4', 10],
    ['5_plus', 20],
    // Legacy buckets keep their points.
    ['2_4', 10],
    ['5_9', 20],
    ['10_19', 30],
    ['20_plus', 40],
  ])('quantity %s adds %i points', (quantity, points) => {
    const one = calculateLeadScore({ ...base, quantity: '1' } as any);
    expect(calculateLeadScore({ ...base, quantity } as any) - one).toBe(points);
  });
});

describe('5 or more is bulk', () => {
  it.each([
    ['5_plus', true],
    ['4', false],
    ['3', false],
    ['2', false],
    ['1', false],
    ['20_plus', true],
    ['10_19', true],
    ['5_9', false],
  ])('quantity %s is bulk: %s', (quantity, expected) => {
    expect(isBulkLead({ quantity } as any)).toBe(expected);
  });

  it('the notes heuristic still only counts when quantity is 1 or unstated', () => {
    expect(isBulkLead({ quantity: '1', buyer_notes: 'bulk order' } as any)).toBe(true);
    expect(isBulkLead({ buyer_notes: 'bulk order' } as any)).toBe(true);
    expect(isBulkLead({ quantity: '3', buyer_notes: 'bulk order' } as any)).toBe(false);
  });

  it('a 5 or more lead gets [BULK] and "(5+ units)" in the subject', async () => {
    const { json } = await submit({ ...base, quantity: '5_plus', size_preference: '40ft' });
    expect(json.priority).toBe('BULK - Priority');
    expect(sellerMail().subject).toBe(`[BULK] New Quote Request - Test Buyer - 40ft (5+ units) - Score: ${json.score}`);
  });
});

describe('rent-to-own is blocked on 5 or more', () => {
  it('exceedsRtoQuantity: 1..4 allowed, 5_plus blocked', () => {
    for (const q of ['1', '2', '3', '4']) expect(exceedsRtoQuantity(q)).toBe(false);
    expect(exceedsRtoQuantity('5_plus')).toBe(true);
  });

  it('rewrites a 5_plus rent-to-own request to not_sure and flags it for Doug', async () => {
    const r = applyRtoQuantityRule({ ...base, quantity: '5_plus', payment_intent: 'rent_to_own' } as any);
    expect(r.data.payment_intent).toBe('not_sure');
    expect(r.rtoBulkRequested).toBe(true);
    await submit({ ...base, quantity: '5_plus', payment_intent: 'rent_to_own' });
    expect(sellerMail().text).toContain(`🔶 ${RTO_BULK_SELLER_LINE}`);
    expect(buyerMail().text).not.toContain('Rent-to-own');
  });

  it('a 4 container rent-to-own request is left alone', () => {
    const r = applyRtoQuantityRule({ ...base, quantity: '4', payment_intent: 'rent_to_own' } as any);
    expect(r.rtoBulkRequested).toBe(false);
    expect(r.data.payment_intent).toBe('rent_to_own');
  });
});

describe('mixed sizes reach the seller email, subject and buyer email', () => {
  it('lists every size in container order, with counts for repeats', async () => {
    const { json } = await submit({ ...base, quantity: '3', size_preference: '20ft', size_2: '40ft', size_3: '20ft' });
    const { subject, text } = sellerMail();
    expect(text).toContain('Quantity: 3 containers\nSize: 20ft x2, 40ft\nCondition:');
    expect(subject).toBe(`New Quote Request - Test Buyer - 20ft x2, 40ft (3 units) - Score: ${json.score}`);
    // Container 1 is still the CHECK-constrained column.
    expect(row().size_preference).toBe('20ft');
    const buyer = buyerMail().text;
    expect(buyer).toContain('- Quantity: 3 containers\n- Size: 20ft Standard x2, 40ft Standard\n');
  });

  it('two different sizes read "20ft, 40ft"', async () => {
    await submit({ ...base, quantity: '2', size_preference: '20ft', size_2: '40ft' });
    expect(sellerMail().text).toContain('Size: 20ft, 40ft\n');
    expect(sellerMail().subject).toContain(' - 20ft, 40ft (2 units) - ');
  });

  it('a blank or missing extra size is not_sure, never a failure', async () => {
    const { status } = await submit({ ...base, quantity: '4', size_preference: '40ft_hc', size_2: '', size_3: '  ' });
    expect(status).toBe(200);
    expect(sellerMail().text).toContain('Size: 40ft_hc, not_sure x3\n');
  });

  it('selects past the chosen quantity are ignored', async () => {
    await submit({ ...base, quantity: '2', size_preference: '20ft', size_2: '40ft', size_3: '40ft_hc', size_4: '40ft_hc' });
    expect(sellerMail().text).toContain('Size: 20ft, 40ft\n');
    expect(sellerMail().text).not.toContain('40ft_hc');
  });

  it('a single container email, subject and buyer email are unchanged', async () => {
    const { json } = await submit({ ...base, quantity: '1', size_preference: '40ft', size_2: '20ft' });
    expect(sellerMail().subject).toBe(`New Quote Request - Test Buyer - 40ft - Score: ${json.score}`);
    expect(sellerMail().text).toContain('Size: 40ft\nCondition:');
    expect(buyerMail().text).toContain('Your request summary:\n- Size: 40ft Standard\n');
  });
});

describe('5 or more free text', () => {
  it('reaches the seller email on one line', async () => {
    const details = 'Six 40ft HC\nand two 20ft\n\nfor two sites';
    await submit({ ...base, quantity: '5_plus', size_preference: 'not_sure', bulk_details: details });
    const text = sellerMail().text;
    expect(text).toContain('Size: not_sure\nBulk details: Six 40ft HC / and two 20ft / for two sites\nCondition:');
    expect(buyerMail().text).toContain('- Quantity: 5 or more\n');
  });

  it('a blank box adds no line', async () => {
    await submit({ ...base, quantity: '5_plus', bulk_details: '   ' });
    expect(sellerMail().text).not.toContain('Bulk details');
  });

  it('bulkDetailsOneLine collapses newlines and trims', () => {
    expect(bulkDetailsOneLine(' a \r\n b ')).toBe('a / b');
    expect(bulkDetailsOneLine('')).toBeUndefined();
  });
});

describe('legacy values stay readable', () => {
  it.each([
    ['1', '1 container'],
    ['2', '2 containers'],
    ['3', '3 containers'],
    ['4', '4 containers'],
    ['5_plus', '5 or more'],
    ['2_4', '2 to 4'],
    ['5_9', '5 to 9'],
    ['10_19', '10 to 19'],
    ['20_plus', '20 or more'],
  ])('%s reads %s in the email', (value, label) => {
    expect(quantityLabel(value)).toBe(label);
  });

  it('every label has a place in the order: current values first, then the legacy buckets', () => {
    expect(QUANTITY_ORDER.slice(0, 5)).toEqual(['1', '2', '3', '4', '5_plus']);
    expect(Object.keys(QUANTITY_LABELS).sort()).toEqual([...QUANTITY_ORDER].sort());
  });

  it('legacy buckets show one size and a subject exactly as before', () => {
    expect(sizeSlotCount('2_4')).toBe(1);
    expect(sellerSubject({ ...base, quantity: '2_4' } as any, 40, true)).toBe('New Quote Request - Test Buyer - 20ft - Score: 40');
  });
});

describe('helpers', () => {
  it('containerSizes / sizeSummary', () => {
    expect(containerSizes({ quantity: 3, size_preference: '40ft' })).toEqual(['40ft', 'not_sure', 'not_sure']);
    expect(sizeSummary(['40ft'])).toBe('40ft');
    expect(sizeSummary(['20ft', 'not_sure'], { '20ft': '20ft Standard', not_sure: 'Not sure yet' })).toBe('20ft Standard, Not sure yet');
  });
});

describe('the quote form', () => {
  const page = readFileSync(new URL('../pages/quote/index.astro', import.meta.url), 'utf8');
  const tagOf = (id: string) => {
    const at = page.indexOf(`id="${id}"`);
    expect(at, id).toBeGreaterThan(-1);
    return page.slice(page.lastIndexOf('<', at), page.indexOf('>', at) + 1);
  };

  it('has a labelled control for every container size and the bulk box', () => {
    for (const id of ['size_preference', 'size_2', 'size_3', 'size_4', 'bulk_details']) {
      expect(page, id).toContain(`<label for="${id}">`);
    }
    expect(page).toContain('Tell us about what you need');
    expect(tagOf('size_2')).toContain('name="size_2"');
    expect(tagOf('bulk_details')).toContain('name="bulk_details"');
  });

  it('container 1 stays required; the extra selects and bulk box are not (CSS cannot toggle required)', () => {
    expect(tagOf('size_preference')).toContain('required');
    for (const id of ['size_2', 'size_3', 'size_4', 'bulk_details']) expect(tagOf(id), id).not.toContain('required');
  });

  it('shows and hides with CSS :has, keeping the 10ft note and the RTO live region', () => {
    expect(page).toContain('.quote_form:has(#quantity option[value="2"]:checked) .quote_size_2');
    expect(page).toContain('.quote_form:has(#quantity option[value="5_plus"]:checked) .quote_bulk');
    expect(page).toContain('Need a 10ft?');
    expect(page).toContain('id="rto_quantity_note" class="quote_field_note" aria-live="polite"');
  });
});

describe('the new fields never touch the database insert', () => {
  it('size_2..size_4 and bulk_details stay out of the leads row', async () => {
    await submit({ ...base, quantity: '5_plus', size_2: '40ft', size_3: '40ft', size_4: '40ft', bulk_details: 'six' });
    await submit({ ...base, quantity: '3', size_2: '40ft', size_3: '40ft_hc' });
    for (const [r] of insertMock.mock.calls) {
      for (const col of ['quantity', 'size_2', 'size_3', 'size_4', 'bulk_details', 'raw_fields']) {
        expect(r, col).not.toHaveProperty(col);
      }
      expect(r.size_preference).toBe('20ft');
    }
  });
});

/**
 * The live database can be down (it was during the 2026-11 Supabase outage). The seller email is the
 * safety net: it MUST still go out, flagged, with every new field, and the buyer still gets a 200.
 */
describe('database save failure still emails the seller with every field', () => {
  const multi = { ...base, quantity: '3', size_preference: '20ft', size_2: '40ft', size_3: '40ft_hc' };

  it.each([
    ['returns an error', () => insertMock.mockResolvedValue({ error: { message: 'connection refused' } })],
    ['throws', () => insertMock.mockRejectedValue(new Error('fetch failed'))],
  ])('when the insert %s', async (_label, breakDb) => {
    breakDb();
    const { status, json } = await submit(multi);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.saved).toBe(false);
    expect(json.sellerNotified).toBe(true);
    const { subject, text } = sellerMail();
    expect(subject).toBe(`[ACTION NEEDED] New Quote Request - Test Buyer - 20ft, 40ft, 40ft_hc (3 units) - Score: ${json.score}`);
    expect(text).toContain('DATABASE SAVE FAILED');
    expect(text).toContain('Quantity: 3 containers\nSize: 20ft, 40ft, 40ft_hc\nCondition:');
    expect(text).toContain('(NOT SAVED to database)');
    expect(updateEqMock).not.toHaveBeenCalled();
  });

  it('a 5 or more lead keeps its bulk details when the insert fails', async () => {
    insertMock.mockResolvedValue({ error: { message: 'connection refused' } });
    const { status, json } = await submit({ ...base, quantity: '5_plus', bulk_details: 'Ten 40ft HC\nfor a farm' });
    expect(status).toBe(200);
    expect(json.saved).toBe(false);
    const { subject, text } = sellerMail();
    expect(subject).toBe(`[ACTION NEEDED] [BULK] New Quote Request - Test Buyer - 20ft (5+ units) - Score: ${json.score}`);
    expect(text).toContain('DATABASE SAVE FAILED');
    expect(text).toContain('Bulk details: Ten 40ft HC / for a farm\n');
  });
});
