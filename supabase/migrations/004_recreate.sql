-- ============================================================
-- 004_recreate.sql — Full schema rebuild after accidental drop
--
-- Run this in:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS).
-- billing_cycle column is intentionally omitted — it was removed
-- from the codebase in favour of per-entry contract_term inside
-- the subscribed_services JSONB array.
-- ============================================================


-- ── 1. profiles table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                         UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                      TEXT         NOT NULL,
  full_name                  TEXT,
  plan_status                TEXT         NOT NULL DEFAULT 'inactive'
                                          CHECK (plan_status IN ('active','inactive','past_due','cancelled')),
  paystack_customer_code     TEXT,
  paystack_subscription_code TEXT,
  current_period_end         TIMESTAMPTZ,
  company_name               TEXT,
  company_size               TEXT
    CHECK (company_size IN ('1-10','11-50','51-200','201-500','500+')),
  industry                   TEXT,
  subscribed_services        JSONB        NOT NULL DEFAULT '[]'::jsonb,
  subscribed_quantity        INTEGER      NOT NULL DEFAULT 0,
  popia_score                INTEGER,
  popia_risk_level           TEXT
    CHECK (popia_risk_level IN ('low','medium','high')),
  last_popia_assessment_at   TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ── 2. updated_at auto-stamp ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 3. Row-Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access"     ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ── 4. Auto-create profile row on every sign-up ───────────────────────────────
--
-- SECURITY DEFINER lets this function insert into public.profiles even though
-- it is triggered from auth.users (a different schema).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 5. downloads table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.downloads (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL
    CHECK (category IN ('software','compliance','whitepapers','tools')),
  file_path   TEXT        NOT NULL,
  file_size   BIGINT,
  file_type   TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read active downloads" ON public.downloads;
DROP POLICY IF EXISTS "Service role full access on downloads"         ON public.downloads;

CREATE POLICY "Authenticated users can read active downloads"
  ON public.downloads FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role full access on downloads"
  ON public.downloads FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- ── 6. Storage bucket (safe to re-run) ───────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('client-assets', 'client-assets', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Service role manages client-assets"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read client-assets" ON storage.objects;

CREATE POLICY "Service role manages client-assets"
  ON storage.objects FOR ALL TO service_role
  USING      (bucket_id = 'client-assets')
  WITH CHECK (bucket_id = 'client-assets');

CREATE POLICY "Authenticated users can read client-assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-assets');
