-- ============================================================
-- 009_assessments.sql — Persistent assessment results store
--
-- Creates a universal assessments table that stores full results
-- (including server-computed gap data) for both authenticated
-- and anonymous users. Results pages use the UUID primary key
-- instead of URL query params, making results stable and revisitable.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL CHECK (type IN ('popia','security')),
  score       INTEGER     NOT NULL,
  risk_level  TEXT        NOT NULL,
  answers     JSONB       NOT NULL DEFAULT '{}',
  gaps        TEXT[]      NOT NULL DEFAULT '{}',
  compliant   INTEGER     NOT NULL DEFAULT 0,
  partial     INTEGER     NOT NULL DEFAULT 0,
  critical    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service-role-only access; results pages fetch via server-side service role client.
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS assessments_type_idx    ON public.assessments(type);
CREATE INDEX IF NOT EXISTS assessments_created_idx ON public.assessments(created_at DESC);
