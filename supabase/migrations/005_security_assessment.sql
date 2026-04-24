-- ============================================================
-- 005_security_assessment.sql — Add security assessment columns
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (uses ADD COLUMN IF NOT EXISTS).
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS security_score              INTEGER,
  ADD COLUMN IF NOT EXISTS security_risk_level         TEXT
    CHECK (security_risk_level IN ('low','moderate','high')),
  ADD COLUMN IF NOT EXISTS last_security_assessment_at TIMESTAMPTZ;
