/**
 * RENT-TO-OWN QUANTITY RULE (owner decision 2026-10-08, pending supplier confirmation)
 * ==================================================================================
 *
 * Rent-to-own is for orders up to RTO_MAX_QUANTITY containers. Above that, Doug quotes bulk terms.
 * The form blocks the option client-side; these tests pin the server half: an over-cap RTO request
 * is never rejected, still saves and emails, is recorded as not_sure, scores the same, and puts one
 * line in the seller email. The buyer email must not promise an RTO application.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  RTO_MAX_QUANTITY,
  RTO_QUANTITY_NOTE,
  RTO_BULK_SELLER_LINE,
  exceedsRtoQuantity,
} from './rto-eligibility';

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

const { POST, applyRtoQuantityRule, calculateLeadScore } = await import('../pages/api/submit-quote');

const base = {
  name: 'Test Buyer',
  email: 'buyer@example.com',
  phone: '5135550100',
  size_preference: '40ft',
  condition_preference: 'wind_water_tight',
  primary_use: 'storage',
  delivery_zip: '45202',
  site_access: 'easy',
  timeline: 'asap',
};

async function submit(body: object) {
  const res = await POST({
    request: new Request('http://localhost/api/submit-quote', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  } as any);
  return { status: res.status, json: await res.json() };
}

const sellerText = () => sendMock.mock.calls.find(([m]) => m.to !== base.email)?.[0].text ?? '';
const buyerText = () => sendMock.mock.calls.find(([m]) => m.to === base.email)?.[0].text ?? '';

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue({ error: null });
  updateEqMock.mockReset().mockResolvedValue({ error: null });
  sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('exceedsRtoQuantity', () => {
  it('allows 1 and 2 to 4, blocks 5 and up', () => {
    expect(exceedsRtoQuantity('1')).toBe(false);
    expect(exceedsRtoQuantity('2_4')).toBe(false);
    expect(exceedsRtoQuantity('5_9')).toBe(true);
    expect(exceedsRtoQuantity('10_19')).toBe(true);
    expect(exceedsRtoQuantity('20_plus')).toBe(true);
  });

  it('treats missing or unknown quantity as eligible, never throws', () => {
    expect(exceedsRtoQuantity(undefined)).toBe(false);
    expect(exceedsRtoQuantity(null)).toBe(false);
    expect(exceedsRtoQuantity('')).toBe(false);
    expect(exceedsRtoQuantity('lots')).toBe(false);
  });

  it('the cap is one constant that both messages interpolate', () => {
    expect(RTO_MAX_QUANTITY).toBe(4);
    expect(RTO_QUANTITY_NOTE).toBe(
      'Rent-to-own covers orders of up to 4 containers. For 5 or more, Doug will quote bulk terms.',
    );
    expect(RTO_BULK_SELLER_LINE).toBe('Asked for rent-to-own on a 5+ order: quote bulk terms instead.');
  });

  it('the quote form and endpoint read the cap from the shared module, not a literal', () => {
    const form = readFileSync('src/pages/quote/index.astro', 'utf8');
    const api = readFileSync('src/pages/api/submit-quote.ts', 'utf8');
    expect(form).toContain("from '../../lib/rto-eligibility'");
    expect(form).toContain('aria-live="polite"');
    expect(api).toContain("from '../../lib/rto-eligibility'");
  });
});

describe('applyRtoQuantityRule', () => {
  it('rewrites over-cap rent-to-own to not_sure and flags it', () => {
    const input = { ...base, payment_intent: 'rent_to_own', quantity: '10_19' };
    const { data, rtoBulkRequested } = applyRtoQuantityRule(input);
    expect(data.payment_intent).toBe('not_sure');
    expect(rtoBulkRequested).toBe(true);
    expect(input.payment_intent).toBe('rent_to_own'); // input not mutated
  });

  it('leaves under-cap rent-to-own and over-cap buy-outright alone', () => {
    const small = applyRtoQuantityRule({ ...base, payment_intent: 'rent_to_own', quantity: '2_4' });
    expect(small.data.payment_intent).toBe('rent_to_own');
    expect(small.rtoBulkRequested).toBe(false);
    const bulkCash = applyRtoQuantityRule({ ...base, payment_intent: 'buy_outright', quantity: '20_plus' });
    expect(bulkCash.data.payment_intent).toBe('buy_outright');
    expect(bulkCash.rtoBulkRequested).toBe(false);
  });

  it('does not change the lead score', () => {
    const input = { ...base, payment_intent: 'rent_to_own', quantity: '5_9' };
    expect(calculateLeadScore(applyRtoQuantityRule(input).data)).toBe(calculateLeadScore(input));
  });
});

describe('submit-quote with rent-to-own on a 5+ order', () => {
  it('saves, emails the seller with the bulk line, and never rejects', async () => {
    const { status, json } = await submit({ ...base, payment_intent: 'rent_to_own', quantity: '5_9' });
    expect(status).toBe(200);
    expect(json.saved).toBe(true);
    expect(json.sellerNotified).toBe(true);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const text = sellerText();
    expect(text).toContain(RTO_BULK_SELLER_LINE);
    expect(text).toContain('Payment intent: Not sure yet');
    expect(text).not.toContain('PAYMENT INTENT: RENT-TO-OWN');
  });

  it('still emails the seller when the database save fails', async () => {
    insertMock.mockResolvedValue({ error: { message: 'down' } });
    const { status, json } = await submit({ ...base, payment_intent: 'rent_to_own', quantity: '20_plus' });
    expect(status).toBe(200);
    expect(json.saved).toBe(false);
    expect(sellerText()).toContain(RTO_BULK_SELLER_LINE);
  });

  it('does not promise the buyer a rent-to-own application', async () => {
    await submit({ ...base, payment_intent: 'rent_to_own', quantity: '10_19' });
    expect(buyerText()).not.toMatch(/rent-to-own/i);
  });

  it('under the cap, rent-to-own is unchanged and the bulk line is absent', async () => {
    await submit({ ...base, payment_intent: 'rent_to_own', quantity: '2_4' });
    const text = sellerText();
    expect(text).toContain('PAYMENT INTENT: RENT-TO-OWN');
    expect(text).not.toContain(RTO_BULK_SELLER_LINE);
    expect(buyerText()).toMatch(/rent-to-own/i);
  });
});
