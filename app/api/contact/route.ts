import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmails, type ContactPayload, type EnquiryType } from '@/lib/email';
import { createContactLead } from '@/lib/monday';

const schema = z.object({
  name:        z.string().min(2),
  email:       z.string().email(),
  company:     z.string().min(1),
  enquiryType: z.enum(['enterprise-backup', 'ransomware', 'archiving', 'quantum', 'guardium', 'existing-client', 'partnership', 'compliance', 'general']),
  message:     z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload: ContactPayload = {
      name:        parsed.data.name,
      email:       parsed.data.email,
      company:     parsed.data.company,
      enquiryType: parsed.data.enquiryType as EnquiryType,
      message:     parsed.data.message,
    };

    // Run email delivery and CRM creation in parallel — neither blocks the other
    const [emailResult, mondayResult] = await Promise.allSettled([
      sendContactEmails(payload),
      createContactLead(payload),
    ]);

    if (emailResult.status === 'rejected') {
      console.error('[contact] Email send threw:', emailResult.reason);
    } else if (!emailResult.value.success) {
      console.error('[contact] Email send failed:', emailResult.value.error);
    }

    // monday.com is non-critical — log but don't surface to user
    if (mondayResult.status === 'rejected') {
      console.error('[contact] monday.com item creation threw:', mondayResult.reason);
    } else if (!mondayResult.value.success) {
      console.error('[contact] monday.com item creation failed:', mondayResult.value.error);
    } else if (!mondayResult.value.skipped) {
      console.log('[contact] monday.com item created:', mondayResult.value.itemId);
    }

    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully.' });
  } catch (error) {
    console.error('[contact] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
