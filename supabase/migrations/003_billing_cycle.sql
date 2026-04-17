-- ============================================================
-- 003_billing_cycle.sql — Track subscription billing cycle
-- Run this in your Supabase SQL editor after 002_portal.sql
-- ============================================================
--
-- Why:
--   The upgrade flow needs to know whether an existing subscription is billed
--   monthly or yearly in order to re-price correctly when adding seats.
--   Until now, this was only available on the Paystack-side plan code.
--
-- Written by:
--   /api/subscribe/callback        (immediately after a successful payment)
--   /api/subscribe/webhook         (on subscription.create / charge.success)
--   /api/subscribe/upgrade         (on plan changes)
--

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT
    CHECK (billing_cycle IN ('monthly', 'yearly'));
