-- Container Decision Engine - Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- === IMMUTABLE FIELDS (System-controlled) ===

  -- Contact information (captured at submission)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Buyer decisions (captured at submission)
  size_preference TEXT NOT NULL CHECK (size_preference IN ('20ft', '40ft', '40ft_hc', 'not_sure')),
  condition_preference TEXT NOT NULL CHECK (condition_preference IN ('new', 'used_good', 'used_budget', 'not_sure')),
  primary_use TEXT NOT NULL,
  delivery_zip TEXT NOT NULL,
  site_access TEXT NOT NULL CHECK (site_access IN ('easy', 'challenging', 'not_sure')),
  timeline TEXT NOT NULL CHECK (timeline IN ('asap', '1_3_months', '3_6_months', 'researching')),
  buyer_notes TEXT,

  -- Attribution data (captured at submission)
  first_touch_source TEXT,
  first_touch_medium TEXT,
  landing_page TEXT,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  calculator_result TEXT,
  time_on_site_seconds INTEGER,
  referrer TEXT,

  -- Computed fields (system-generated)
  lead_score INTEGER NOT NULL DEFAULT 0,
  in_service_area BOOLEAN NOT NULL DEFAULT true,
  distance_miles INTEGER,

  -- Email confirmation tracking
  confirmation_email_sent_at TIMESTAMPTZ,
  confirmation_email_id TEXT,

  -- === SELLER-EDITABLE FIELDS ===

  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  status_changed_at TIMESTAMPTZ,
  outcome_date DATE,
  sale_amount DECIMAL(10,2),
  lost_reason TEXT CHECK (lost_reason IS NULL OR lost_reason IN ('price', 'timing', 'competitor', 'unqualified', 'no_response', 'other')),
  seller_notes TEXT
);

-- Index for common queries
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_in_service_area ON leads(in_service_area);

-- ============================================
-- IMMUTABILITY TRIGGER
-- Prevents modification of system fields
-- ============================================
CREATE OR REPLACE FUNCTION prevent_immutable_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if any immutable field is being changed
  IF (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.phone IS DISTINCT FROM NEW.phone OR
    OLD.size_preference IS DISTINCT FROM NEW.size_preference OR
    OLD.condition_preference IS DISTINCT FROM NEW.condition_preference OR
    OLD.primary_use IS DISTINCT FROM NEW.primary_use OR
    OLD.delivery_zip IS DISTINCT FROM NEW.delivery_zip OR
    OLD.site_access IS DISTINCT FROM NEW.site_access OR
    OLD.timeline IS DISTINCT FROM NEW.timeline OR
    OLD.buyer_notes IS DISTINCT FROM NEW.buyer_notes OR
    OLD.first_touch_source IS DISTINCT FROM NEW.first_touch_source OR
    OLD.first_touch_medium IS DISTINCT FROM NEW.first_touch_medium OR
    OLD.landing_page IS DISTINCT FROM NEW.landing_page OR
    OLD.pages_visited IS DISTINCT FROM NEW.pages_visited OR
    OLD.calculator_result IS DISTINCT FROM NEW.calculator_result OR
    OLD.time_on_site_seconds IS DISTINCT FROM NEW.time_on_site_seconds OR
    OLD.referrer IS DISTINCT FROM NEW.referrer OR
    OLD.lead_score IS DISTINCT FROM NEW.lead_score OR
    OLD.in_service_area IS DISTINCT FROM NEW.in_service_area OR
    OLD.distance_miles IS DISTINCT FROM NEW.distance_miles OR
    OLD.confirmation_email_sent_at IS DISTINCT FROM NEW.confirmation_email_sent_at OR
    OLD.confirmation_email_id IS DISTINCT FROM NEW.confirmation_email_id OR
    OLD.created_at IS DISTINCT FROM NEW.created_at
  ) THEN
    RAISE EXCEPTION 'Cannot modify immutable fields. Only status, outcome_date, sale_amount, lost_reason, and seller_notes can be updated.';
  END IF;

  -- Auto-update status_changed_at when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutability
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION prevent_immutable_update();

-- ============================================
-- STATUS HISTORY TABLE (Audit Log)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_lead_id ON lead_status_history(lead_id);
CREATE INDEX idx_status_history_changed_at ON lead_status_history(changed_at DESC);

-- Trigger to log status changes (Power-Fix: SECURITY DEFINER bypasses user RLS for audit logging)
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO lead_status_history (lead_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_status_changes
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Master Admin Policies
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_status_history ENABLE ROW LEVEL SECURITY;

-- Master Policy: Authenticated users (Admins) have full access to everything
DROP POLICY IF EXISTS "Service role full access on leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
CREATE POLICY "Master Admin leads access" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on history" ON lead_status_history;
DROP POLICY IF EXISTS "Authenticated users can read history" ON lead_status_history;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON lead_status_history;
CREATE POLICY "Master Admin history access" ON lead_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- API Access (remains service_role)
CREATE POLICY "Service role full access" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role history access" ON lead_status_history FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Lead summary for list display
CREATE OR REPLACE VIEW lead_summary AS
SELECT
  id,
  created_at,
  name,
  email,
  size_preference,
  timeline,
  lead_score,
  in_service_area,
  status,
  status_changed_at
FROM leads
ORDER BY created_at DESC;

-- View: Attribution report
CREATE OR REPLACE VIEW attribution_report AS
SELECT
  first_touch_source,
  first_touch_medium,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'won') as won,
  COUNT(*) FILTER (WHERE status = 'lost') as lost,
  COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'quoted')) as open,
  COALESCE(SUM(sale_amount) FILTER (WHERE status = 'won'), 0) as total_revenue,
  ROUND(AVG(lead_score), 1) as avg_score
FROM leads
GROUP BY first_touch_source, first_touch_medium
ORDER BY total_leads DESC;

-- ============================================
-- SAMPLE DATA (Remove in production)
-- ============================================
-- Uncomment to insert test data:
/*
INSERT INTO leads (
  name, email, phone,
  size_preference, condition_preference, primary_use, delivery_zip, site_access, timeline,
  first_touch_source, first_touch_medium, landing_page,
  lead_score, in_service_area, distance_miles
) VALUES (
  'Test User', 'test@example.com', '555-555-5555',
  '40ft', 'used_good', 'Farm equipment storage', '45202', 'easy', '1_3_months',
  'google', 'organic', '/size/guide/',
  65, true, 12
);
*/
