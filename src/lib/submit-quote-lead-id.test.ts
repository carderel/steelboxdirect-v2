/**
 * LEAD ID GUARD: a lead id exists even when the database save fails
 * ==================================================================
 *
 * The id used to come back from Supabase, so every failed save produced leadId: null, and the
 * seller email said "NOT SAVED" with nothing to backfill under. The id is now minted with
 * crypto.randomUUID() before the insert and passed in as leads.id. These tests mock Supabase and
 * Resend and pin: the id is a UUID in the response on a failed insert, on a thrown insert, and on
 * a good one; the inserted row carries that same id; the seller email shows it with the NOT SAVED
 * marker only when the save failed; the callback path still works.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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

const { POST } = await import('../pages/api/submit-quote');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const fullQuote = {
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

function sellerEmailText(): string {
  const call = sendMock.mock.calls.find(([msg]) => msg.to !== fullQuote.email);
  return call?.[0].text ?? '';
}

beforeEach(() => {
  insertMock.mockReset();
  updateEqMock.mockReset().mockResolvedValue({ error: null });
  sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('submit-quote lead id', () => {
  it('returns a UUID leadId when the insert returns an error', async () => {
    insertMock.mockResolvedValue({ error: { message: 'getaddrinfo ENOTFOUND' } });
    const { status, json } = await submit(fullQuote);
    expect(status).toBe(200);
    expect(json.leadId).toMatch(UUID);
    expect(json.saved).toBe(false);
    expect(insertMock.mock.calls[0][0].id).toBe(json.leadId);
    const text = sellerEmailText();
    expect(text).toContain(`Lead ID: ${json.leadId} (NOT SAVED to database)`);
    expect(updateEqMock).not.toHaveBeenCalled();
  });

  it('returns a UUID leadId when the insert throws', async () => {
    insertMock.mockRejectedValue(new Error('fetch failed'));
    const { status, json } = await submit(fullQuote);
    expect(status).toBe(200);
    expect(json.leadId).toMatch(UUID);
    expect(json.saved).toBe(false);
  });

  it('inserts the minted id and reports saved on success', async () => {
    insertMock.mockResolvedValue({ error: null });
    const { json } = await submit(fullQuote);
    expect(json.leadId).toMatch(UUID);
    expect(json.saved).toBe(true);
    expect(insertMock.mock.calls[0][0].id).toBe(json.leadId);
    const text = sellerEmailText();
    expect(text).toContain(`Lead ID: ${json.leadId}\n`);
    expect(text).not.toContain('NOT SAVED');
    expect(updateEqMock).toHaveBeenCalledWith('id', json.leadId);
  });

  it('mints a fresh id per request', async () => {
    insertMock.mockResolvedValue({ error: null });
    const a = await submit(fullQuote);
    const b = await submit(fullQuote);
    expect(a.json.leadId).not.toBe(b.json.leadId);
  });

  it('callback leads still skip the insert and succeed with an id', async () => {
    const { status, json } = await submit({
      leadType: 'callback',
      name: 'Caller',
      email: 'caller@example.com',
      phone: '5135550101',
    });
    expect(status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
    expect(json.saved).toBe(false);
    expect(json.sellerNotified).toBe(true);
    expect(json.leadId).toMatch(UUID);
  });
});
