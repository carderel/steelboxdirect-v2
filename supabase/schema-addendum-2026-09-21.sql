-- ============================================================================
-- SCHEMA ADDENDUM — 2026-09-21
-- ============================================================================
--
-- WHY THIS FILE EXISTS
-- --------------------
-- supabase/schema.sql has not been touched since the initial commit (ab0690c,
-- 2026-05-18). It therefore predates commit bf7ee70, "copy(condition): sell
-- Wind & Water Tight (used) only; drop Cargo Worthy/One-Trip sitewide", and has
-- drifted away from the live application code. Run unmodified against a fresh
-- project, schema.sql produces a database that rejects the most common quote
-- path and silently blocks the confirmation-email write on every lead.
--
-- HOW TO RUN
-- ----------
-- Run this file in the Supabase SQL Editor IMMEDIATELY AFTER schema.sql, in the
-- same restore session, before any traffic reaches the new project. It assumes
-- every object schema.sql creates already exists.
--
-- THIS IS A PATCH, NOT THE FIX
-- ----------------------------
-- The proper long-term fix is to correct supabase/schema.sql at source, so a
-- future restore is a single file with no addendum to remember. That correction
-- is recorded as follow-up work and is deliberately NOT done here: this file is
-- written for an in-progress restore that needs a working database now, and
-- editing schema.sql mid-restore would leave the owner running a file different
-- from the one already pasted into the editor.
--
-- VERIFIED BY
-- -----------
-- Static parity check, 2026-09-21. Static analysis only — the Supabase project
-- had been deleted, so no live database existed to test any of this against.
-- Every line-number reference below points at the repository as of that date.
--
-- ============================================================================


-- ============================================================================
-- FIX 1 (BLOCKER) — condition_preference rejects the form's own default
-- ----------------------------------------------------------------------------
-- The quote form at src/pages/quote/index.astro:45 ships
-- 'wind_water_tight' as the selected default. schema.sql:24 allows only
-- ('new','used_good','used_budget','not_sure'). Every quote submitted by a
-- buyer who does not change the Condition dropdown violates the CHECK and the
-- insert fails.
-- ============================================================================

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_condition_preference_check;
ALTER TABLE leads ADD CONSTRAINT leads_condition_preference_check
  CHECK (condition_preference IN ('wind_water_tight','not_sure','new','used_good','used_budget'));
-- The last three values are legacy. They are retained so that any restored
-- historical rows still validate.


-- ============================================================================
-- FIX 2 (HIGH) — the immutability trigger blocks the confirmation-email write
-- ----------------------------------------------------------------------------
-- schema.sql:93-94 lists confirmation_email_sent_at and confirmation_email_id
-- inside the immutable-field check. The update at
-- src/pages/api/submit-quote.ts:344-350 writes exactly those two columns right
-- after insert, so the trigger raises an exception on every single lead. The
-- failure is silent: that call never destructures `error`, so nothing surfaces
-- and the two columns stay null forever.
--
-- The function below is schema.sql's prevent_immutable_update() recreated
-- identically, MINUS those two columns.
-- ============================================================================

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
    OLD.created_at IS DISTINCT FROM NEW.created_at
    -- confirmation_email_sent_at and confirmation_email_id are intentionally
    -- omitted: the API writes them exactly once, immediately after insert.
  ) THEN
    RAISE EXCEPTION 'Cannot modify immutable fields. Only status, outcome_date, sale_amount, lost_reason, seller_notes, and the confirmation-email fields can be updated.';
  END IF;

  -- Auto-update status_changed_at when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FIX 3 (SECURITY) — helper views leak leads to the anon key
-- ----------------------------------------------------------------------------
-- The views lead_summary (schema.sql:171-184) and attribution_report
-- (schema.sql:187-199) are security-definer by default, so they bypass the RLS
-- policies on leads. Supabase grants SELECT on new public-schema objects to
-- anon, and lead_summary exposes name and email. The anon key ships inside the
-- browser bundle, so anyone who views source can read the lead list.
--
-- NOTE: this is INFERRED from standard Supabase defaults. It was NOT executed
-- against a live database and the anon grant was never observed directly.
--
-- Nothing in the codebase references either view — a repo-wide grep returned
-- zero hits — so dropping them costs nothing. That is Option A, active below.
-- ============================================================================

-- Option A (active): drop them. Nothing reads them.
DROP VIEW IF EXISTS lead_summary;
DROP VIEW IF EXISTS attribution_report;

-- Option B (keep them instead): comment out Option A above and uncomment this.
-- ALTER VIEW lead_summary SET (security_invoker = on);
-- ALTER VIEW attribution_report SET (security_invoker = on);
-- REVOKE ALL ON lead_summary FROM anon;
-- REVOKE ALL ON attribution_report FROM anon;


-- ============================================================================
-- FIX 4 (LOW) — the dashboard posts an empty string for lost_reason
-- ----------------------------------------------------------------------------
-- The "Select reason..." option in AdminDashboard.tsx:200 posts '', which is
-- neither NULL nor a member of the CHECK list at schema.sql:55, so marking a
-- lead lost without picking a reason fails the constraint.
-- ============================================================================

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_lost_reason_check;
ALTER TABLE leads ADD CONSTRAINT leads_lost_reason_check
  CHECK (lost_reason IS NULL OR lost_reason IN ('price','timing','competitor','unqualified','no_response','other'));
ALTER TABLE leads ALTER COLUMN lost_reason SET DEFAULT NULL;
UPDATE leads SET lost_reason = NULL WHERE lost_reason = '';
-- The cleaner long-term fix belongs in the component: send null instead of ''.


-- ============================================================================
-- FIX 5 (BELT AND BRACES) — explicit table grants
-- ----------------------------------------------------------------------------
-- RLS is the real control; these grants make the intent explicit and close the
-- gap if a policy is ever dropped.
-- ============================================================================

GRANT ALL ON leads, lead_status_history TO authenticated, service_role;
REVOKE ALL ON leads, lead_status_history FROM anon;


-- ============================================================================
-- POST-RUN VERIFICATION
-- ============================================================================
--
-- 1. Create the admin user in Supabase Auth. schema.sql creates none. Without
--    it the dashboard is unreachable, and because an unauthenticated select
--    returns [] with NO error, broken auth looks exactly like "no leads yet".
--    Check this first or you will misdiagnose everything after it.
--
-- 2. Submit a real quote through /quote/, leaving Condition at its default
--    (Wind & Water Tight). Confirm the response JSON contains saved:true
--    (submit-quote.ts:370) — NOT merely success:true. success is true whenever
--    EITHER the database write OR the seller email worked (submit-quote.ts:366),
--    so success:true alone does not prove Fix 1 landed.
--
-- 3. Query that row and confirm confirmation_email_id is non-null. That single
--    field is the proof that Fix 2 landed; under the old trigger it is always
--    null.
--
-- 4. Using the anon key with no session, run: select * from lead_summary;
--    It must error or return nothing. If it returns rows, Fix 3 did not apply.
--
-- ============================================================================
