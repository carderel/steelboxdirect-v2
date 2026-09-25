/**
 * LEAD SCORING GUARD: bulk orders must outrank single unit orders
 * ===============================================================
 *
 * WHY THIS FILE EXISTS. On 2026-09-24 a real lead asked for a bulk quotation on 20 to 40 used 40ft
 * containers, a 50k to 120k order. The system scored it 43 and labelled it "Standard", because the
 * quote form had no quantity field at all and the timeline option "researching" was worth 3 points.
 * A procurement buyer collecting competitive bids is the most valuable state a buyer can be in, and
 * the site could not see it.
 *
 * These tests pin the three things that fix cost:
 *   1. the real lead now scores 88 and reads BULK - Priority,
 *   2. a lead that predates the quantity field, or one that leaves it at 1 and writes the number in
 *      prose, is still caught by the notes heuristic,
 *   3. an ordinary single unit lead scores EXACTLY what it scored before, apart from the deliberate
 *      researching +5. The five historical lead scores have to stay comparable.
 *
 * Every assertion here was mutation tested: the source was deliberately broken and each test was
 * watched to fail before being kept.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  calculateLeadScore,
  getPriorityLabel,
  isBulkLead,
  notesSuggestBulk,
  quantityLabel,
} from '../pages/api/submit-quote';

/** The minimum a full (non callback) quote carries. Individual tests override what they are about. */
function lead(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Buyer',
    email: 'buyer@example.com',
    phone: '5135550101',
    size_preference: '40ft',
    condition_preference: 'wind_water_tight',
    primary_use: 'workshop',
    delivery_zip: '45202',
    site_access: 'easy',
    timeline: 'asap',
    ...overrides,
  } as any;
}

/**
 * The 2026-09-24 lead, reconstructed from the submission that exposed the bug. The notes carry both
 * a bulk phrase and a size token, which is precisely the combination the heuristic has to tell apart.
 */
const REAL_LEAD_NOTES =
  "We are seeking a bulk quotation for 20 - 40 used 40' shipping/storage containers to be delivered to our plant.";

function realLead(overrides: Record<string, unknown> = {}) {
  return lead({
    size_preference: '40ft',
    condition_preference: 'wind_water_tight',
    primary_use: 'manufacturing storage',
    timeline: 'researching',
    site_access: 'easy',
    buyer_notes: REAL_LEAD_NOTES,
    ...overrides,
  });
}

describe('the 2026-09-24 bulk lead that scored 43 and read Standard', () => {
  it('scores 88 and reads BULK - Priority when the buyer picks 20 or more', () => {
    const data = realLead({ quantity: '20_plus' });
    const score = calculateLeadScore(data);
    expect(score).toBe(88);
    expect(getPriorityLabel(score, isBulkLead(data))).toBe('BULK - Priority');
  });

  it('still reads BULK - Priority with no quantity at all, via the notes heuristic', () => {
    const data = realLead();
    expect(data.quantity).toBeUndefined();
    expect(isBulkLead(data)).toBe(true);
    const score = calculateLeadScore(data);
    // 15 heuristic + 10 size + 10 condition + 8 researching + 10 storage + 5 access + 5 notes.
    expect(score).toBe(63);
    expect(getPriorityLabel(score, isBulkLead(data))).toBe('BULK - Priority');
  });

  it('is not paid twice: declaring 20 or more AND writing "bulk" scores 40, not 55', () => {
    const declared = calculateLeadScore(realLead({ quantity: '20_plus' }));
    const withoutNotes = calculateLeadScore(realLead({ quantity: '20_plus', buyer_notes: undefined }));
    // The notes line is worth its own +5 (length bonus) and nothing more.
    expect(declared - withoutNotes).toBe(5);
  });

  it('would have scored 43 under the old rules, which is the bug this file records', () => {
    // Old model: no quantity points, no heuristic, researching worth 3.
    const oldScore = 10 + 10 + 3 + 10 + 5 + 5;
    expect(oldScore).toBe(43);
    expect(getPriorityLabel(oldScore)).toBe('Standard');
  });
});

describe('quantity scoring', () => {
  it.each([
    ['1', 0],
    ['2_4', 10],
    ['5_9', 20],
    ['10_19', 30],
    ['20_plus', 40],
  ])('quantity %s adds %i points', (quantity, points) => {
    const base = calculateLeadScore(lead({ quantity: '1' }));
    expect(calculateLeadScore(lead({ quantity })) - base).toBe(points);
  });

  it('a missing quantity adds nothing, so old leads are not inflated', () => {
    expect(calculateLeadScore(lead())).toBe(calculateLeadScore(lead({ quantity: '1' })));
  });

  it('an unknown quantity value adds nothing rather than NaN', () => {
    const score = calculateLeadScore(lead({ quantity: 'fifty' }));
    expect(Number.isNaN(score)).toBe(false);
    expect(score).toBe(calculateLeadScore(lead({ quantity: '1' })));
  });
});

describe('no regression for an ordinary single unit lead', () => {
  it('scores exactly what it scored before the change', () => {
    // 10 size + 10 condition + 20 asap + 10 workshop + 5 easy access = 55, unchanged.
    expect(calculateLeadScore(lead({ quantity: '1' }))).toBe(55);
    expect(getPriorityLabel(55, false)).toBe('Priority');
  });

  it('is never labelled bulk', () => {
    const data = lead({ quantity: '1', buyer_notes: 'Is the driveway width a problem?' });
    expect(isBulkLead(data)).toBe(false);
    expect(getPriorityLabel(calculateLeadScore(data), isBulkLead(data))).toBe('Priority');
  });

  it('changes by exactly +5 when the timeline is researching, and by nothing otherwise', () => {
    const oldPoints: Record<string, number> = { asap: 20, '1_3_months': 15, '3_6_months': 10, researching: 3 };
    for (const [timeline, old] of Object.entries(oldPoints)) {
      const oldTotal = 10 + 10 + old + 10 + 5;
      const delta = calculateLeadScore(lead({ timeline, quantity: '1' })) - oldTotal;
      expect(delta).toBe(timeline === 'researching' ? 5 : 0);
    }
  });

  it('keeps the existing bands when the lead is not bulk', () => {
    expect(getPriorityLabel(50)).toBe('Priority');
    expect(getPriorityLabel(49)).toBe('Standard');
    expect(getPriorityLabel(30)).toBe('Standard');
    expect(getPriorityLabel(29)).toBe('Lower');
  });

  it('bulk beats the bands: even a low score reads BULK - Priority', () => {
    expect(getPriorityLabel(12, true)).toBe('BULK - Priority');
  });
});

describe('the bulk notes heuristic', () => {
  it.each([
    'We need a bulk price please',
    'BULK purchase, 3 sites',
    'Do you offer a volume discount?',
    'Do you offer volume discounts on repeat orders?',
    'Looking for 10 containers for a jobsite',
    'quote me on 5 units',
    'need 25 containers by spring',
  ])('flags %s', (notes) => {
    expect(notesSuggestBulk(notes)).toBe(true);
  });

  it.each([
    'Interested in 40ft containers for storage',
    'Two 20 foot containers side by side',
    "Can you deliver 40' containers to a gravel pad?",
    'I need 40 ft containers',
    'Driveway is narrow, please call first',
    'Just 2 containers for now',
    'one container, 4 containers max later',
  ])('does NOT flag %s', (notes) => {
    expect(notesSuggestBulk(notes)).toBe(false);
  });

  it('does not flag empty or missing notes', () => {
    expect(notesSuggestBulk(undefined)).toBe(false);
    expect(notesSuggestBulk('')).toBe(false);
  });

  it('a size token in the notes does not earn heuristic points', () => {
    const sized = calculateLeadScore(lead({ quantity: '1', buyer_notes: 'Interested in 40ft containers for storage' }));
    const plain = calculateLeadScore(lead({ quantity: '1', buyer_notes: 'Interested in something for storage' }));
    expect(sized).toBe(plain);
  });

  it('the heuristic is ignored once the buyer states 2 or more, so no signal is counted twice', () => {
    const data = lead({ quantity: '5_9', buyer_notes: 'bulk order please, thanks' });
    const sameLengthNonBulk = lead({ quantity: '5_9', buyer_notes: 'rush order please, thanks' });
    // Identical apart from the bulk word, so the +15 heuristic would show up here if it fired.
    expect(calculateLeadScore(data)).toBe(calculateLeadScore(sameLengthNonBulk));
    // 20 quantity points and nothing else beyond the notes length bonus both leads share.
    expect(calculateLeadScore(data) - calculateLeadScore(lead({ quantity: '1', buyer_notes: 'rush order please, thanks' }))).toBe(20);
    // 5_9 is not one of the override tiers, so the label falls back to the score bands.
    expect(isBulkLead(data)).toBe(false);
  });
});

describe('isBulkLead tiers', () => {
  it.each([
    ['20_plus', true],
    ['10_19', true],
    ['5_9', false],
    ['2_4', false],
    ['1', false],
  ])('quantity %s is bulk: %s', (quantity, expected) => {
    expect(isBulkLead({ quantity } as any)).toBe(expected);
  });
});

describe('quantityLabel', () => {
  it.each([
    ['1', '1 container'],
    ['2_4', '2 to 4'],
    ['5_9', '5 to 9'],
    ['10_19', '10 to 19'],
    ['20_plus', '20 or more'],
  ])('%s reads %s', (value, label) => {
    expect(quantityLabel(value)).toBe(label);
  });

  it('defaults to 1 container when absent, so the seller email never shows a blank', () => {
    expect(quantityLabel(undefined)).toBe('1 container');
    expect(quantityLabel('')).toBe('1 container');
  });

  it('degrades an unknown value to readable text rather than undefined', () => {
    expect(quantityLabel('50_plus')).toBe('50 plus');
  });
});

/**
 * Structural checks. The quantity field is scored and emailed but must NEVER reach the leads
 * insert: the table has no quantity column, and an unknown column makes every insert fail. That is
 * the class of bug that cost this project 104 days of leads in June, so it is pinned in a test
 * rather than left to review.
 */
describe('quantity is an email only pass through', () => {
  const source = readSource();

  it('is not in the leads insert', () => {
    const insert = source.slice(source.indexOf(".from('leads')"), source.indexOf('.select()'));
    expect(insert).toContain('size_preference: data.size_preference');
    expect(insert).not.toContain('quantity');
  });

  it('is in the seller email body, above Size', () => {
    expect(source).toContain('Quantity: ${quantityLabel(data.quantity)}\\nSize:');
  });

  it('puts a [BULK] prefix in the seller subject without losing [ACTION NEEDED]', () => {
    const subject = source.split('\n').find((l) => l.includes('New Quote Request - ${data.name}')) || '';
    expect(subject).toContain("dbSaved ? '' : '[ACTION NEEDED] '");
    expect(subject).toContain("bulk ? '[BULK] ' : ''");
  });
});

describe('the quote form asks the question', () => {
  it('renders a quantity select with the five scored values and 1 preselected', () => {
    const page = readQuotePage();
    expect(page).toContain('name="quantity"');
    expect(page).toContain('<option value="1" selected>1 container</option>');
    for (const value of ['2_4', '5_9', '10_19', '20_plus']) {
      expect(page).toContain(`<option value="${value}">`);
    }
  });

  it('is not required, because it carries a default', () => {
    const page = readQuotePage();
    const select = page.slice(page.indexOf('<select id="quantity"'));
    expect(select.slice(0, select.indexOf('>') + 1)).not.toContain('required');
  });

  it('submits through FormData, so the named field is picked up with no handler change', () => {
    expect(readQuotePage()).toContain('new FormData(form)');
  });
});

function readSource(): string {
  return readFileSync(new URL('../pages/api/submit-quote.ts', import.meta.url), 'utf8');
}

function readQuotePage(): string {
  return readFileSync(new URL('../pages/quote/index.astro', import.meta.url), 'utf8');
}
