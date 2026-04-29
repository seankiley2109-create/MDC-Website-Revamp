-- ============================================================
-- 007_profile_contact_fields.sql — Extend profiles with full
-- contact and organisation fields required by the portal
-- profile form.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url         TEXT,
  ADD COLUMN IF NOT EXISTS company_reg_number TEXT,
  ADD COLUMN IF NOT EXISTS vat_number         TEXT,
  ADD COLUMN IF NOT EXISTS address_line1      TEXT,
  ADD COLUMN IF NOT EXISTS address_line2      TEXT,
  ADD COLUMN IF NOT EXISTS city               TEXT,
  ADD COLUMN IF NOT EXISTS province           TEXT,
  ADD COLUMN IF NOT EXISTS postal_code        TEXT,
  ADD COLUMN IF NOT EXISTS country            TEXT;
