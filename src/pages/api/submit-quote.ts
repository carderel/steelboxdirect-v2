import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Service area config
const CINCINNATI_LAT = 39.1031;
const CINCINNATI_LNG = -84.5120;
const SERVICE_RADIUS_MILES = 250;

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  size_preference: string;
  condition_preference: string;
  primary_use: string;
  delivery_zip: string;
  site_access: string;
  timeline: string;
  buyer_notes?: string;
  first_touch_source?: string;
  first_touch_medium?: string;
  landing_page?: string;
  pages_visited?: string[];
  calculator_result?: string;
  time_on_site_seconds?: number;
  referrer?: string;
}

// Helper to get clients on demand
function getClients() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

  console.log('API: Checking env vars...', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey, 
    hasResend: !!resendKey 
  });

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    throw new Error(`Missing environment variables: URL:${!!supabaseUrl}, KEY:${!!supabaseKey}, RESEND:${!!resendKey}`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);
  
  return { supabase, resend };
}

function calculateLeadScore(data: QuoteFormData): number {
  let score = 0;
  score += data.size_preference !== 'not_sure' ? 10 : 5;
  score += data.condition_preference !== 'not_sure' ? 10 : 5;
  switch (data.timeline) {
    case 'asap': score += 20; break;
    case '1_3_months': score += 15; break;
    case '3_6_months': score += 10; break;
    default: score += 3;
  }
  const use = data.primary_use.toLowerCase();
  if (use.includes('farm') || use.includes('equipment') || use.includes('agricultural')) {
    score += 15;
  } else if (use.includes('storage') || use.includes('workshop')) {
    score += 10;
  } else {
    score += 5;
  }
  if (data.site_access === 'easy') score += 5;
  else if (data.site_access === 'challenging') score += 3;
  else score += 2;
  if (data.buyer_notes && data.buyer_notes.trim().length > 10) score += 5;
  return score;
}

function getZipDistance(zip: string): number | null {
  return null;
}

function getPriorityLabel(score: number): string {
  if (score >= 50) return 'Priority';
  if (score >= 30) return 'Standard';
  return 'Lower';
}

async function sendBuyerConfirmation(data: QuoteFormData): Promise<string | null> {
  try {
    const { resend } = getClients();
    const { data: emailData, error } = await resend.emails.send({
      from: 'Steel Box Direct <noreply@steelboxdirect.com>',
      to: data.email,
      subject: 'We received your quote request',
      text: `Hi ${data.name},\n\nWe received your request for a shipping container quote.\n\nYour request summary:\n- Size: ${data.size_preference === 'not_sure' ? 'Not sure yet' : data.size_preference}\n- Condition: ${data.condition_preference === 'not_sure' ? 'Not sure yet' : data.condition_preference.replace('_', ' ')}\n- Delivery to: ${data.delivery_zip}\n- Timeline: ${data.timeline.replace('_', '-')}\n\nWhat happens next:\nA seller will review your request and contact you within 1 business day with pricing and availability for your area.\n\nNo action needed from you. If you have questions, reply to this email.\n\n---\nSteel Box Direct`,
    });
    if (error) {
      console.error('Email send error:', error);
      return null;
    }
    return emailData?.id || null;
  } catch (err) {
    console.error('Email send exception:', err);
    return null;
  }
}

async function sendSellerNotification(
  data: QuoteFormData,
  leadId: string,
  score: number,
  distance: number | null
): Promise<void> {
  try {
    const { resend } = getClients();
    const priority = getPriorityLabel(score);
    const inServiceArea = distance === null || distance <= SERVICE_RADIUS_MILES;
    const pagesVisited = data.pages_visited?.join(', ') || 'Unknown';
    const sellerEmail = import.meta.env.SELLER_EMAIL || process.env.SELLER_EMAIL || 'seller@example.com';

    await resend.emails.send({
      from: 'Steel Box Direct <noreply@steelboxdirect.com>',
      to: sellerEmail,
      subject: `New Quote Request - ${data.name} - ${data.size_preference} - Score: ${score}`,
      text: `NEW QUOTE REQUEST\n\nLEAD DETAILS\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nDECISIONS\nSize: ${data.size_preference}\nCondition: ${data.condition_preference}\nUse: ${data.primary_use}\nTimeline: ${data.timeline}\n\nDELIVERY\nLocation: ${data.delivery_zip}${distance ? ` (${distance}mi from Cincinnati)` : ''}\nService Area: ${inServiceArea ? 'Yes' : 'OUTSIDE AREA - Review'}\nAccess: ${data.site_access}\n\nNOTES\n${data.buyer_notes || 'None provided'}\n\nATTRIBUTION\nSource: ${data.first_touch_source || 'Unknown'} / ${data.first_touch_medium || 'Unknown'}\nLanding Page: ${data.landing_page || 'Unknown'}\nPages Visited: ${pagesVisited}\nCalculator Result: ${data.calculator_result || 'Not used'}\nTime on Site: ${data.time_on_site_seconds ? Math.round(data.time_on_site_seconds / 60) + ' minutes' : 'Unknown'}\n\nSCORE: ${score} - ${priority}\n\nLead ID: ${leadId}\n`,
    });
  } catch (err) {
    console.error('Seller notification error:', err);
  }
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('API: POST request received');
  
  let data: QuoteFormData;
  try {
    // Try to get the body. In some environments, it might be safer to clone or read as text first.
    const bodyText = await request.text();
    if (!bodyText) {
      console.error('API: Empty request body');
      return new Response(JSON.stringify({ error: 'Empty request body' }), { status: 400 });
    }
    data = JSON.parse(bodyText);
    console.log('API: Processing lead for:', data.email);
  } catch (err: any) {
    console.error('API: Request parsing error:', err.message);
    return new Response(JSON.stringify({ error: 'Invalid request body', details: err.message }), { status: 400 });
  }

  try {
    const { supabase } = getClients();

    const required = [
      'name', 'email', 'phone', 'size_preference', 'condition_preference',
      'primary_use', 'delivery_zip', 'site_access', 'timeline',
    ];

    for (const field of required) {
      if (!data[field as keyof QuoteFormData]) {
        console.warn(`API: Missing field: ${field}`);
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { status: 400 });
      }
    }

    const leadScore = calculateLeadScore(data);
    const distance = getZipDistance(data.delivery_zip);
    const inServiceArea = distance === null || distance <= SERVICE_RADIUS_MILES;

    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        size_preference: data.size_preference,
        condition_preference: data.condition_preference,
        primary_use: data.primary_use,
        delivery_zip: data.delivery_zip,
        site_access: data.site_access,
        timeline: data.timeline,
        buyer_notes: data.buyer_notes || null,
        first_touch_source: data.first_touch_source || null,
        first_touch_medium: data.first_touch_medium || null,
        landing_page: data.landing_page || null,
        pages_visited: data.pages_visited || [],
        calculator_result: data.calculator_result || null,
        time_on_site_seconds: data.time_on_site_seconds || null,
        referrer: data.referrer || null,
        lead_score: leadScore,
        in_service_area: inServiceArea,
        distance_miles: distance,
      })
      .select()
      .single();

    if (dbError) {
      console.error('API: Database error details:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save lead', details: dbError.message }), { status: 500 });
    }

    const emailId = await sendBuyerConfirmation(data);

    if (emailId) {
      await supabase
        .from('leads')
        .update({
          confirmation_email_sent_at: new Date().toISOString(),
          confirmation_email_id: emailId,
        })
        .eq('id', lead.id);
    }

    await sendSellerNotification(data, lead.id, leadScore, distance);

    return new Response(JSON.stringify({
      success: true,
      leadId: lead.id,
      score: leadScore,
      priority: getPriorityLabel(leadScore),
    }), { status: 200 });

  } catch (err: any) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: err?.message }), { status: 500 });
  }
};