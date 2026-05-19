import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Lead {
  id: string;
  created_at: string;

  // Contact
  name: string;
  email: string;
  phone: string;

  // Decisions
  size_preference: '20ft' | '40ft' | '40ft_hc' | 'not_sure';
  condition_preference: 'new' | 'used_good' | 'used_budget' | 'not_sure';
  primary_use: string;
  delivery_zip: string;
  site_access: 'easy' | 'challenging' | 'not_sure';
  timeline: 'asap' | '1_3_months' | '3_6_months' | 'researching';
  buyer_notes?: string;

  // Attribution
  first_touch_source?: string;
  first_touch_medium?: string;
  landing_page?: string;
  pages_visited: string[];
  calculator_result?: string;
  time_on_site_seconds?: number;
  referrer?: string;

  // Computed
  lead_score: number;
  in_service_area: boolean;
  distance_miles?: number;

  // Email
  confirmation_email_sent_at?: string;
  confirmation_email_id?: string;

  // Seller fields
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  status_changed_at?: string;
  outcome_date?: string;
  sale_amount?: number;
  lost_reason?: 'price' | 'timing' | 'competitor' | 'unqualified' | 'no_response' | 'other';
  seller_notes?: string;
}

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'status' | 'status_changed_at'>;
