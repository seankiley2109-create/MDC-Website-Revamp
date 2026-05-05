import { NextResponse }          from 'next/server';
import { z }                     from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';

const schema = z.object({
  session_id: z.string().uuid(),
  type:       z.enum(['popia', 'security']),
  score:      z.number().min(0).max(20),
  answers:    z.record(z.string(), z.number()),
});

// Question-to-category mappings — mirrors the form page question arrays.
const QUESTION_CATEGORIES: Record<'security' | 'popia', string[]> = {
  security: [
    'Data Protection', 'SaaS Resilience', 'Ransomware', 'Recovery',
    'Endpoint Security', 'Device Compliance', 'Threat Detection',
    'Data Visibility', 'Business Continuity', 'Integration',
  ],
  popia: [
    'Governance', 'Governance', 'Lawful Processing', 'Lawful Processing',
    'Consent', 'Processing Integrity', 'Data Quality', 'Transparency',
    'Security', 'Data Subject Rights',
  ],
};

function computeGaps(type: 'popia' | 'security', answers: Record<string, number>): string[] {
  const categories = QUESTION_CATEGORIES[type];
  const catScores: Record<string, { total: number; count: number }> = {};
  categories.forEach((cat, i) => {
    const s = answers[String(i)] ?? 0;
    if (!catScores[cat]) catScores[cat] = { total: 0, count: 0 };
    catScores[cat].total += s;
    catScores[cat].count += 1;
  });
  return Object.entries(catScores)
    .filter(([, v]) => v.total / v.count < 2)
    .sort(([, a], [, b]) => a.total / a.count - b.total / b.count)
    .map(([cat]) => cat);
}

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
    const gaps         = computeGaps(type, answers);

    const serviceRole = createServiceRoleClient();

    // Keep legacy assessment_sessions upsert for backward compatibility.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sessionError } = await (serviceRole.from('assessment_sessions') as any)
      .upsert(
        {
          id:         session_id,
          type,
          score,
          risk_level: riskLevel,
          answers,
          gaps,
          compliant,
          partial,
          critical,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    if (sessionError) {
      console.error('[assessment-session] session upsert failed:', sessionError.message);
    }

    // Insert into assessments table for stable ID-based results page.
    let assessmentId: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertError } = await (serviceRole.from('assessments') as any)
        .insert({
          user_id:    null,
          type,
          score,
          risk_level: riskLevel,
          answers,
          gaps,
          compliant,
          partial,
          critical,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[assessment-session] assessments insert failed:', insertError.message);
      } else {
        assessmentId = (inserted as { id: string }).id;
        console.log(`[assessment-session] assessments row created — id: ${assessmentId}, session: ${session_id}`);
      }
    } catch (err) {
      console.error('[assessment-session] unexpected assessments insert error:', err);
    }

    console.log(`[assessment-session] processed — session: ${session_id}, type: ${type}, score: ${score}`);
    return NextResponse.json({ success: true, assessmentId });
  } catch (err) {
    console.error('[assessment-session] unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected error.' }, { status: 500 });
  }
}
