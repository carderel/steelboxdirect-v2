/**
 * PHONE GUARD: a phone Doug cannot dial is rejected with a 400 before any insert or email.
 * Live lead 2026-11-20 arrived with phone "225". Both the full quote and the callback path.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const sendMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: insertMock,
      update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
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
const { PHONE_ERROR_MESSAGE } = await import('./phone');

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
const callback = { leadType: 'callback', name: 'Caller', email: 'caller@example.com', phone: '5135550101' };

async function submit(body: object) {
  const res = await POST({
    request: new Request('http://localhost/api/submit-quote', { method: 'POST', body: JSON.stringify(body) }),
  } as any);
  return { status: res.status, json: await res.json() };
}

beforeEach(() => {
  insertMock.mockReset().mockResolvedValue({ error: null });
  sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('submit-quote phone validation', () => {
  it.each(['225', '5555555555', '0135550123'])('quote path rejects %s with no insert and no email', async (phone) => {
    const { status, json } = await submit({ ...fullQuote, phone });
    expect(status).toBe(400);
    expect(json.error).toBe(PHONE_ERROR_MESSAGE);
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('callback path rejects 225 with no email', async () => {
    const { status, json } = await submit({ ...callback, phone: '225' });
    expect(status).toBe(400);
    expect(json.error).toBe(PHONE_ERROR_MESSAGE);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('accepts a formatted number and shows it formatted in the seller email', async () => {
    const { status } = await submit({ ...fullQuote, phone: '+1 513-555-0100' });
    expect(status).toBe(200);
    expect(insertMock.mock.calls[0][0].phone).toBe('+1 513-555-0100');
    const seller = sendMock.mock.calls.find(([m]) => m.to !== fullQuote.email)?.[0];
    expect(seller.text).toContain('Phone: (513) 555-0100');
  });

  it('callback seller subject carries the formatted number', async () => {
    const { status } = await submit({ ...callback, phone: '513.555.0101' });
    expect(status).toBe(200);
    const seller = sendMock.mock.calls.find(([m]) => m.to !== callback.email)?.[0];
    expect(seller.subject).toContain('(513) 555-0101');
  });
});
