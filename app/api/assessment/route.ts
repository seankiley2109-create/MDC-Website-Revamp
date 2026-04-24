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

function resolveRiskLevel(type: AssessmentType, score: number): RiskLevel {
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

    // ── Persist assessment results to Supabase ───────────────────────────
    try {
      const supabase = await createServerClient();
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      const serviceRole = createServiceRoleClient();

      if (type === 'popia') {
        const dbRiskLevel: PopiaRiskLevel =
          riskLevel === 'High Risk'   ? 'high'   :
          riskLevel === 'Medium Risk' ? 'medium' : 'low';

        const assessmentUpdate = {
          popia_score:              score,
          popia_risk_level:         dbRiskLevel,
          last_popia_assessment_at: new Date().toISOString(),
          updated_at:               new Date().toISOString(),
        };

        if (sessionUser) {
          // Path A — server-side session: update by auth user ID
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate)
            .eq('id', sessionUser.id);
          if (error) {
            console.error('[assessment] POPIA Supabase update (auth) failed:', error.message);
          } else {
            console.log(`[assessment] POPIA profile updated — user: ${sessionUser.id}, score: ${score}`);
          }
        } else if (user_id) {
          // Path B — client-provided user_id (auth bypass flow): update by ID
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate)
            .eq('id', user_id);
          if (error) {
            console.error('[assessment] POPIA Supabase update (user_id) failed:', error.message);
          } else {
            console.log(`[assessment] POPIA profile updated — user_id: ${user_id}, score: ${score}`);
          }
        } else {
          // Path C — anonymous: update existing profile by email match if present
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error, count } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate)
            .eq('email', lead.email)
            .select('id', { count: 'exact', head: true });
          if (error) {
            console.error('[assessment] POPIA Supabase update (email match) failed:', error.message);
          } else {
            console.log(`[assessment] POPIA anon sync — email: ${lead.email}, rows: ${count ?? 0}`);
          }
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
            .update(assessmentUpdate)
            .eq('id', sessionUser.id);
          if (error) {
            console.error('[assessment] Security Supabase update (auth) failed:', error.message);
          } else {
            console.log(`[assessment] Security profile updated — user: ${sessionUser.id}, score: ${score}`);
          }
        } else if (user_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate)
            .eq('id', user_id);
          if (error) {
            console.error('[assessment] Security Supabase update (user_id) failed:', error.message);
          } else {
            console.log(`[assessment] Security profile updated — user_id: ${user_id}, score: ${score}`);
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error, count } = await (serviceRole.from('profiles') as any)
            .update(assessmentUpdate)
            .eq('email', lead.email)
            .select('id', { count: 'exact', head: true });
          if (error) {
            console.error('[assessment] Security Supabase update (email match) failed:', error.message);
          } else {
            console.log(`[assessment] Security anon sync — email: ${lead.email}, rows: ${count ?? 0}`);
          }
        }
      }
    } catch (err) {
      // Non-fatal — lead capture and results page still work
      console.error('[assessment] Unexpected error saving to profile:', err);
    }

    // Run email delivery and CRM creation in parallel
    const [emailResult, mondayResult] = await Promise.allSettled([
      sendAssessmentEmails(payload),
      createAssessmentLead(payload),
    ]);

    // Email is non-critical for assessments — don't block the results page
    if (emailResult.status === 'rejected') {
      console.error('[assessment] Email send threw:', emailResult.reason);
    } else if (!emailResult.value.success) {
      console.error('[assessment] Email send failed:', emailResult.value.error);
    }

    // monday.com is non-critical
    if (mondayResult.status === 'rejected') {
      console.error('[assessment] monday.com item creation threw:', mondayResult.reason);
    } else if (!mondayResult.value.success) {
      console.error('[assessment] monday.com item creation failed:', mondayResult.value.error);
    } else if (!mondayResult.value.skipped) {
      console.log('[assessment] monday.com item created:', mondayResult.value.itemId);
    }

    // Always return the computed results so the assessment page can display them
    return NextResponse.json({
      success: true,
      message: 'Assessment processed successfully.',
      riskLevel,
      score,
      fullyCompliant,
      partial,
      criticalGaps,
    });
  } catch (error) {
    console.error('[assessment] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
