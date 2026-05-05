import { NextResponse }         from 'next/server';
import { z }                    from 'zod';
import {
  sendAssessmentEmails,
  type AssessmentPayload,
  type AssessmentType,
  type RiskLevel,
} from '@/lib/email';
import { createAssessmentLead } from '@/lib/monday';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { PopiaRiskLevel, SecurityRiskLevel } from '@/lib/supabase/types';

const schema = z.object({
  type:    z.enum(['security', 'popia']),
  lead:    z.object({
    name:    z.string().min(1),
    email:   z.string().email(),
    company: z.string().min(1),
  }),
  answers: z.record(z.string(), z.number()),
  score:   z.number().min(0).max(20),
  user_id: z.string().uuid().optional(),
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

function computeGaps(type: 'security' | 'popia', answers: Record<string, number>): string[] {
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

function resolveRiskLevel(type: AssessmentType, score: number): RiskLevel {
  if (type === 'security') {
    if (score <= 7)  return 'High Risk';
    if (score <= 14) return 'Moderate Risk';
    return 'Low Risk';
  }
  if (score <= 8)  return 'High Risk';
  if (score <= 14) return 'Moderate Risk';
  return 'Low Risk';
}

export async function POST(request: Request) {
  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment data.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { type, lead, answers, score, user_id } = parsed.data;

    const answerValues   = Object.values(answers) as number[];
    const fullyCompliant = answerValues.filter(v => v === 2).length;
    const partial        = answerValues.filter(v => v === 1).length;
    const criticalGaps   = answerValues.filter(v => v === 0).length;
    const riskLevel      = resolveRiskLevel(type as AssessmentType, score);
    const gaps           = computeGaps(type, answers);

    const payload: AssessmentPayload = {
      type: type as AssessmentType,
      lead,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [Number(k), v]),
      ),
      score,
      riskLevel,
      fullyCompliant,
      partial,
      criticalGaps,
    };

    // ── Shared Supabase clients ───────────────────────────────────────────
    const supabase     = await createServerClient();
    const serviceRole  = createServiceRoleClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    const resolvedUserId = sessionUser?.id ?? user_id ?? null;

    // ── Persist assessment summary to profiles ────────────────────────────
    try {
      if (type === 'popia') {
        const dbRiskLevel: PopiaRiskLevel =
          riskLevel === 'High Risk'     ? 'high'   :
          riskLevel === 'Moderate Risk' ? 'medium' : 'low';

        const assessmentUpdate = {
          popia_score:              score,
          popia_risk_level:         dbRiskLevel,
          last_popia_assessment_at: new Date().toISOString(),
          updated_at:               new Date().toISOString(),
        };

        if (sessionUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('id', sessionUser.id);
          if (error) console.error('[assessment] POPIA profile update (auth) failed:', error.message);
          else console.log(`[assessment] POPIA profile updated — user: ${sessionUser.id}, score: ${score}`);
        } else if (user_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('id', user_id);
          if (error) console.error('[assessment] POPIA profile update (user_id) failed:', error.message);
          else console.log(`[assessment] POPIA profile updated — user_id: ${user_id}, score: ${score}`);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error, count } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('email', lead.email)
            .select('id', { count: 'exact', head: true });
          if (error) console.error('[assessment] POPIA anon email-match failed:', error.message);
          else console.log(`[assessment] POPIA anon sync — email: ${lead.email}, rows: ${count ?? 0}`);
        }
      }

      if (type === 'security') {
        const dbRiskLevel: SecurityRiskLevel =
          riskLevel === 'High Risk'     ? 'high'     :
          riskLevel === 'Moderate Risk' ? 'moderate' : 'low';

        const assessmentUpdate = {
          security_score:              score,
          security_risk_level:         dbRiskLevel,
          last_security_assessment_at: new Date().toISOString(),
          updated_at:                  new Date().toISOString(),
        };

        if (sessionUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('id', sessionUser.id);
          if (error) console.error('[assessment] Security profile update (auth) failed:', error.message);
          else console.log(`[assessment] Security profile updated — user: ${sessionUser.id}, score: ${score}`);
        } else if (user_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('id', user_id);
          if (error) console.error('[assessment] Security profile update (user_id) failed:', error.message);
          else console.log(`[assessment] Security profile updated — user_id: ${user_id}, score: ${score}`);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error, count } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate).eq('email', lead.email)
            .select('id', { count: 'exact', head: true });
          if (error) console.error('[assessment] Security anon email-match failed:', error.message);
          else console.log(`[assessment] Security anon sync — email: ${lead.email}, rows: ${count ?? 0}`);
        }
      }
    } catch (err) {
      console.error('[assessment] Unexpected error saving to profile:', err);
    }

    // ── Insert full results into assessments table ────────────────────────
    let assessmentId: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertError } = await (serviceRole.from('assessments') as any)
        .insert({
          user_id:    resolvedUserId,
          type,
          score,
          risk_level: riskLevel,
          answers,
          gaps,
          compliant:  fullyCompliant,
          partial,
          critical:   criticalGaps,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[assessment] assessments insert failed:', insertError.message);
      } else {
        assessmentId = (inserted as { id: string }).id;
        console.log(`[assessment] assessments row created — id: ${assessmentId}`);
      }
    } catch (err) {
      console.error('[assessment] Unexpected error inserting into assessments:', err);
    }

    // ── Email delivery and CRM creation (non-critical, run in parallel) ───
    const [emailResult, mondayResult] = await Promise.allSettled([
      sendAssessmentEmails(payload),
      createAssessmentLead(payload),
    ]);

    if (emailResult.status === 'rejected') {
      console.error('[assessment] Email send threw:', emailResult.reason);
    } else if (!emailResult.value.success) {
      console.error('[assessment] Email send failed:', emailResult.value.error);
    }

    if (mondayResult.status === 'rejected') {
      console.error('[assessment] monday.com item creation threw:', mondayResult.reason);
    } else if (!mondayResult.value.success) {
      console.error('[assessment] monday.com item creation failed:', mondayResult.value.error);
    } else if (!mondayResult.value.skipped) {
      console.log('[assessment] monday.com item created:', mondayResult.value.itemId);
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment processed successfully.',
      riskLevel,
      score,
      fullyCompliant,
      partial,
      criticalGaps,
      assessmentId,
    });
  } catch (error) {
    console.error('[assessment] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
