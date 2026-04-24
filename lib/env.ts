import { z } from 'zod';

const serverSchema = z.object({
  RESEND_API_KEY:                z.string().min(1),
  MONDAY_API_KEY:                z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(1),
  MONDAY_CONTACT_BOARD_ID:       z.string().min(1),
  MONDAY_POS_BOARD_ID:           z.string().min(1),
  MONDAY_ASSESSMENT_BOARD_ID:    z.string().min(1),
  MONDAY_SUPPORT_BOARD_ID:       z.string().min(1),
  PAYSTACK_SECRET_KEY:           z.string().min(1),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:         z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:    z.string().min(1),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:  z.string().min(1),
});

function validate() {
  const serverResult = serverSchema.safeParse(process.env);
  const publicResult = publicSchema.safeParse(process.env);

  const missing: string[] = [];

  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      missing.push(String(issue.path[0]));
    }
  }
  if (!publicResult.success) {
    for (const issue of publicResult.error.issues) {
      missing.push(String(issue.path[0]));
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing or invalid environment variables:\n  ${missing.join('\n  ')}\n` +
      `Check your .env.local file.`,
    );
  }

  return {
    ...serverResult.data!,
    ...publicResult.data!,
  };
}

export const env = validate();
