-- ============================================================
-- 008_assessment_sessions.sql — Anonymous assessment sessions
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id          UUID        PRIMARY KEY,
  type        TEXT        NOT NULL CHECK (type IN ('popia','security')),
  score       INTEGER     NOT NULL,
  risk_level  TEXT        NOT NULL,
  answers     JSONB       NOT NULL DEFAULT '{}',
  compliant   INTEGER     NOT NULL DEFAULT 0,
  partial     INTEGER     NOT NULL DEFAULT 0,
  critical    INTEGER     NOT NULL DEFAULT 0,
  gaps        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service-role-only access (no public reads/writes via RLS)
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
