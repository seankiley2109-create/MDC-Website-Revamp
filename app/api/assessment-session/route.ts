import { NextResponse }          from 'next/server';
import { z }                     from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';

const schema = z.object({
  session_id: z.string().uuid(),
  type:       z.enum(['popia', 'security']),
  score:      z.number().min(0).max(20),
  answers:    z.record(z.string(), z.number()),
});

function resolveRiskLevel(type: 'popia' | 'security', score: number): string {
  if (type === 'security') {
    if (score <= 7)  return 'High Risk';
    if (score <= 14) return 'Moderate Risk';
    return 'Low Risk';
  }
  if (score <= 8)  return 'High Risk';
  if (score <= 14) return 'Medium Risk';
  return 'Low Risk';
}

export async function POST(request: Request) {
  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid session data.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { session_id, type, score, answers } = parsed.data;

    const answerValues = Object.values(answers);
    const compliant    = answerValues.filter(v => v === 2).length;
    const partial      = answerValues.filter(v => v === 1).length;
    const critical     = answerValues.filter(v => v === 0).length;
    const riskLevel    = resolveRiskLevel(type, score);

    const serviceRole = createServiceRoleClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (serviceRole.from('assessment_sessions') as any)
      .upsert(
        {
          id:         session_id,
          type,
          score,
          risk_level: riskLevel,
          answers,
          compliant,
          partial,
          critical,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    if (error) {
      console.error('[assessment-session] upsert failed:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[assessment-session] upserted — id: ${session_id}, type: ${type}, score: ${score}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[assessment-session] unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected error.' }, { status: 500 });
  }
}
