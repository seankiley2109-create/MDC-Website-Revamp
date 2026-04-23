/**
 * Support Ticket API  —  POST /api/support
 *
 * Accepts a support ticket from an authenticated portal user and creates an
 * item on the "Support Tickets" monday.com board.
 *
 * Requires authentication — unauthenticated requests are rejected with 401.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createSupportTicket } from '@/lib/monday';
import { sendSupportTicketEmails, type SupportTicketPayload } from '@/lib/email';

const schema = z.object({
  subject:  z.string().min(5,  'Subject must be at least 5 characters.').max(200),
  category: z.enum(['technical', 'billing', 'compliance', 'general']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  message:  z.string().min(20, 'Please provide at least 20 characters of detail.').max(5000),
});

export async function POST(request: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorised.' }, { status: 401 });
  }

  // ── 2. Validate body ───────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { subject, category, priority, message } = parsed.data;

  // ── 3. Fetch profile for display name / company ────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase.from('profiles') as any)
    .select('full_name, email, company_name')
    .eq('id', user.id)
    .single();
  const profile = profileRaw as { full_name: string | null; email: string; company_name: string | null } | null;

  const ticketPayload = {
    name:     (profile?.full_name  ?? user.email ?? 'Portal User') as string,
    email:    user.email as string,
    company:  (profile?.company_name ?? 'Unknown Organisation') as string,
    subject,
    category,
    priority,
    message,
  };

  // ── 4. Push to monday.com Support Tickets board ────────────────────────────
  const [mondayResult] = await Promise.allSettled([
    createSupportTicket(ticketPayload),
  ]);

  if (mondayResult.status === 'rejected') {
    console.error('[api/support] monday.com threw:', mondayResult.reason);
  } else if (!mondayResult.value.success && !mondayResult.value.skipped) {
    console.error('[api/support] monday.com error:', mondayResult.value.error);
  } else if (!mondayResult.value.skipped) {
    console.log('[api/support] Ticket created:', mondayResult.value.itemId);
  }

  // ── 5. Send routing email ──────────────────────────────────────────────────
  const emailPayload: SupportTicketPayload = {
    name:     ticketPayload.name,
    email:    ticketPayload.email,
    company:  ticketPayload.company,
    subject,
    category,
    priority,
    message,
  };

  const emailResult = await sendSupportTicketEmails(emailPayload);
  if (!emailResult.success) {
    console.error('[api/support] Email send failed:', emailResult.error);
  }

  // Non-critical — always return success so the user knows their message arrived.
  return NextResponse.json({
    success: true,
    message: 'Your support ticket has been submitted. We\'ll be in touch within 1 business day.',
  });
}
