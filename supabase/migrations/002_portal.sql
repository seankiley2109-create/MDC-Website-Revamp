-- ============================================================
-- 002_portal.sql — Portal & Downloads schema
-- Run this in your Supabase SQL editor after 001_init.sql
-- ============================================================

-- ── Extend profiles: organisation details + subscription metadata ─────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name         TEXT,
  ADD COLUMN IF NOT EXISTS company_size         TEXT
    CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  ADD COLUMN IF NOT EXISTS industry             TEXT,
  ADD COLUMN IF NOT EXISTS subscribed_services  JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subscribed_quantity  INTEGER NOT NULL DEFAULT 1;

-- ── Downloads asset registry ──────────────────────────────────────────────────
--
-- Each row describes one file hosted in the 'client-assets' Supabase Storage
-- bucket. The page generates signed URLs at request time; nothing public is
-- stored here.

CREATE TABLE IF NOT EXISTS public.downloads (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL
    CHECK (category IN ('software', 'compliance', 'whitepapers', 'tools')),
  file_path   TEXT        NOT NULL,   -- relative path inside client-assets bucket
  file_size   BIGINT,                  -- bytes (optional, informational)
  file_type   TEXT,                    -- 'pdf' | 'exe' | 'dmg' | 'sh' | 'ps1' | …
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active assets (middleware enforces active plan)
CREATE POLICY "Authenticated users can read active downloads"
  ON public.downloads
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role has full access (for admin tooling / seed scripts)
CREATE POLICY "Service role full access on downloads"
  ON public.downloads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Supabase Storage: client-assets bucket ────────────────────────────────────
--
-- Run the INSERT below only if the bucket does not already exist.
-- You can also create it via the Supabase dashboard:
--   Storage → New Bucket → "client-assets" → toggle Private ON
--
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-assets', 'client-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only service role can upload (handled server-side)
-- Signed URLs are generated server-side and are time-limited (15 min)
CREATE POLICY "Service role manages client-assets"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'client-assets')
  WITH CHECK (bucket_id = 'client-assets');

-- Authenticated users with active plan can read via signed URLs
-- (The signed URL itself is the auth token — no extra policy needed for SELECT
--  because signed URLs bypass RLS. This policy is a defence-in-depth layer.)
CREATE POLICY "Authenticated users can read client-assets"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-assets');
