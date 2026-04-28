-- ── Capture full_name from user metadata on sign-up ───────────────────────────
--
-- Supabase passes `options.data` from signUp() into auth.users.raw_user_meta_data.
-- The previous trigger only inserted id + email.  This version also reads
-- full_name so the profile row is complete from the moment it is created.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name
    WHERE profiles.full_name IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
