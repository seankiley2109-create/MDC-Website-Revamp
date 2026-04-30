import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendResourceDownloadEmails } from '@/lib/email';

const schema = z.object({
  name:          z.string().min(2).max(100),
  email:         z.string().email(),
  resourceTitle: z.string().min(1).max(200),
  resourceFile:  z.string().startsWith('/resources/').max(200),
});

export async function POST(request: Request) {
  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data.' },
        { status: 400 },
      );
    }

    const result = await sendResourceDownloadEmails(parsed.data);

    if (!result.success) {
      console.error('[resource-download] Email send failed:', result.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[resource-download] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
