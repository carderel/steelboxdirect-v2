import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Service area config
const CINCINNATI_LAT = 39.1031;
const CINCINNATI_LNG = -84.5120;
const SERVICE_RADIUS_MILES = 250;

interface QuoteFormData {
  // Contact
  name: string;
  email: string;
  phone: string;

  // Decisions
  size_preference: string;
  condition_preference: string;
  primary_use: string;
  delivery_zip: string;
  site_access: string;
  timeline: string;
  buyer_notes?: string;

  // Attribution (from client)
  first_touch_source?: string;
  first_touch_medium?: string;
  landing_page?: string;
  pages_visited?: string[];
  calculator_result?: string;
  time_on_site_seconds?: number;
  referrer?: string;
}

/**
 * Calculate lead score
 */
function calculateLeadScore(data: QuoteFormData): number {
  let score = 0;

  // Size preference
  score += data.size_preference !== 'not_sure' ? 10 : 5;

  // Condition preference
  score += data.condition_preference !== 'not_sure' ? 10 : 5;

  // Timeline
  switch (data.timeline) {
    case 'asap':
      score += 20;
      break;
    case '1_3_months':
      score += 15;
      break;
    case '3_6_months':
      score += 10;
      break;
    default:
      score += 3;
  }

  // Use case (agricultural = target segment)
  const use = data.primary_use.toLowerCase();
  if (use.includes('farm') || use.includes('equipment') || use.includes('agricultural')) {
    score += 15;
  } else if (use.includes('storage') || use.includes('workshop')) {
    score += 10;
  } else {
    score += 5;
  }

  // Site access
  if (data.site_access === 'easy') score += 5;
  else if (data.site_access === 'challenging') score += 3;
  else score += 2;

  // Notes provided
  if (data.buyer_notes && data.buyer_notes.trim().length > 10) score += 5;

  return score;
}

/**
 * Simple ZIP to approximate coordinates (subset for demo)
 * In production, use a geocoding API
 */
function getZipDistance(zip: string): number | null {
  // For now, return null to flag for manual review
  // TODO: Integrate proper geocoding
  return null;
}

/**
 * Get priority tier label
 */
function getPriorityLabel(score: number): string {
  if (score >= 50) return 'Priority';
  if (score >= 30) return 'Standard';
  return 'Lower';
}

/**
 * Send confirmation email to buyer
 */
async function sendBuyerConfirmation(data: QuoteFormData): Promise<string | null> {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Steel Box Direct <noreply@steelboxdirect.com>', // Update with actual domain
      to: data.email,
      subject: 'We received your quote request',
      text: `Hi ${data.name},

We received your request for a shipping container quote.

Your request summary:
- Size: ${data.size_preference === 'not_sure' ? 'Not sure yet' : data.size_preference}
- Condition: ${data.condition_preference === 'not_sure' ? 'Not sure yet' : data.condition_preference.replace('_', ' ')}
- Delivery to: ${data.delivery_zip}
- Timeline: ${data.timeline.replace('_', '-')}

What happens next:
A seller will review your request and contact you within 1 business day with pricing and availability for your area.

No action needed from you. If you have questions, reply to this email.

---
Container Guide`,
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

/**
 * Send notification email to seller
 */
async function sendSellerNotification(
  data: QuoteFormData,
  leadId: string,
  score: number,
  distance: number | null
): Promise<void> {
  const priority = getPriorityLabel(score);
  const inServiceArea = distance === null || distance <= SERVICE_RADIUS_MILES;

  const pagesVisited = data.pages_visited?.join(', ') || 'Unknown';

  try {
    await resend.emails.send({
      from: 'Steel Box Direct <noreply@steelboxdirect.com>', // Update with actual domain
      to: process.env.SELLER_EMAIL || 'seller@example.com', // Update with actual seller email
      subject: `New Quote Request - ${data.name} - ${data.size_preference} - Score: ${score}`,
      text: `NEW QUOTE REQUEST

LEAD DETAILS
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

DECISIONS
Size: ${data.size_preference}
Condition: ${data.condition_preference}
Use: ${data.primary_use}
Timeline: ${data.timeline}

DELIVERY
Location: ${data.delivery_zip}${distance ? ` (${distance}mi from Cincinnati)` : ''}
Service Area: ${inServiceArea ? 'Yes' : 'OUTSIDE AREA - Review'}
Access: ${data.site_access}

NOTES
${data.buyer_notes || 'None provided'}

ATTRIBUTION
Source: ${data.first_touch_source || 'Unknown'} / ${data.first_touch_medium || 'Unknown'}
Landing Page: ${data.landing_page || 'Unknown'}
Pages Visited: ${pagesVisited}
Calculator Result: ${data.calculator_result || 'Not used'}
Time on Site: ${data.time_on_site_seconds ? Math.round(data.time_on_site_seconds / 60) + ' minutes' : 'Unknown'}

SCORE: ${score} - ${priority}

Lead ID: ${leadId}
`,
    });
  } catch (err) {
    console.error('Seller notification error:', err);
    // Don't fail the request if seller notification fails
  }
}

/**
 * Main handler
 */
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse body
    const data: QuoteFormData = JSON.parse(event.body || '{}');

    // Validate required fields
    const required = [
      'name',
      'email',
      'phone',
      'size_preference',
      'condition_preference',
      'primary_use',
      'delivery_zip',
      'site_access',
      'timeline',
    ];

    for (const field of required) {
      if (!data[field as keyof QuoteFormData]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Calculate score and service area
    const leadScore = calculateLeadScore(data);
    const distance = getZipDistance(data.delivery_zip);
    const inServiceArea = distance === null || distance <= SERVICE_RADIUS_MILES;

    // Insert lead into database
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
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save lead' }),
      };
    }

    // Send confirmation email to buyer
    const emailId = await sendBuyerConfirmation(data);

    // Update lead with email confirmation
    if (emailId) {
      await supabase
        .from('leads')
        .update({
          confirmation_email_sent_at: new Date().toISOString(),
          confirmation_email_id: emailId,
        })
        .eq('id', lead.id);
    }

    // Send notification to seller
    await sendSellerNotification(data, lead.id, leadScore, distance);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        leadId: lead.id,
        score: leadScore,
        priority: getPriorityLabel(leadScore),
      }),
    };
  } catch (err) {
    console.error('Handler error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
