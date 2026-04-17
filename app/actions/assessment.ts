'use server';

/**
 * submitAssessment — Next.js Server Action
 *
 * Triple-sync: Website form → Monday.com board → Supabase profiles table.
 *
 * Rollback / resilience model
 * ───────────────────────────
 * Monday.com and Supabase are treated as non-critical side-effects.
 * The assessment result is ALWAYS returned to the user; failures in either
 * integration are logged server-side but never surfaced as user errors.
 *
 *   ┌─────────────┐     always runs     ┌──────────────┐
 *   │  Form data  │ ──────────────────► │ Validate (zod)│
 *   └─────────────┘                     └──────┬───────┘
 *                                              │ parallel (Promise.allSettled)
 *                              ┌───────────────┴───────────────┐
 *                    ┌─────────▼──────────┐         ┌──────────▼──────────┐
 *                    │   monday.com API   │         │  Supabase profiles  │
 *                    │  (Assessment Leads │         │  UPDATE by email     │
 *                    │   board #5094033566│         │  (upsert if authed) │
 *                    └─────────┬──────────┘         └──────────┬──────────┘
 *                              │ fail?                          │ fail?
 *                              ▼                                ▼
 *                         log + continue                  log + continue
 *                              │                                │
 *                              └─────────────┬──────────────────┘
 *                                            ▼
 *                                  return { success, riskLevel, score, … }
 *
 * If Monday.com fails: Supabase still receives the data (and vice versa).
 * The user always gets their results. Both failures are logged for ops.
 */

import { z }                    from 'zod';
import { headers, cookies }     from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { createAssessmentLead } from '@/lib/monday';
import type { AssessmentType, RiskLevel } from '@/lib/email';
import type { PopiaRiskLevel }  from '@/lib/supabase/types';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(['security', 'popia']),
  lead: z.object({
    name:    z.string().min(1),
    email:   z.string().email(),
    company: z.string().min(1),
  }),
  answers: z.record(z.string(), z.number()),
  score:   z.number().int().min(0).max(20),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveRiskLevel(type: AssessmentType, score: number): RiskLevel {
  if (type === 'security') {
    if (score <= 7)  return 'High Risk';
    if (score <= 14) return 'Moderate Risk';
    return 'Low Risk';
  }
  // popia
  if (score <= 8)  return 'High Risk';
  if (score <= 14) return 'Medium Risk';
  return 'Low Risk';
}

function toDbRiskLevel(r: RiskLevel): PopiaRiskLevel {
  if (r === 'High Risk' || r === 'Moderate Risk') return 'high';
  if (r === 'Medium Risk')                        return 'medium';
  return 'low';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssessmentActionInput {
  type:    'security' | 'popia';
  lead:    { name: string; email: string; company: string };
  answers: Record<string, number>;
  score:   number;
}

export interface AssessmentActionResult {
  success:        boolean;
  error?:         string;
  riskLevel?:     RiskLevel;
  score?:         number;
  fullyCompliant?: number;
  partial?:        number;
  criticalGaps?:   number;
  /** Diagnostic — ops visibility only, never shown to users */
  _sync?: {
    monday:   'ok' | 'skipped' | 'error';
    supabase: 'ok' | 'skipped' | 'error';
  } | undefined;
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function submitAssessment(
  input: AssessmentActionInput,
): Promise<AssessmentActionResult> {

  // 1. Validate ────────────────────────────────────────────────────────────────
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid assessment data.' };
  }

  const { type, lead, answers, score } = parsed.data;

  // 2. Derive stats ────────────────────────────────────────────────────────────
  const answerValues   = Object.values(answers);
  const fullyCompliant = answerValues.filter(v => v === 2).length;
  const partial        = answerValues.filter(v => v === 1).length;
  const criticalGaps   = answerValues.filter(v => v === 0).length;
  const riskLevel      = resolveRiskLevel(type as AssessmentType, score);

  // 3. Fan-out: Monday.com + Supabase in parallel ──────────────────────────────
  //    Promise.allSettled — both are attempted regardless of the other's outcome.
  const [mondayResult, supabaseResult] = await Promise.allSettled([

    // ── Monday.com ────────────────────────────────────────────────────────────
    createAssessmentLead({
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
    }),

    // ── Supabase ──────────────────────────────────────────────────────────────
    (async () => {
      if (type !== 'popia') return { skipped: true };

      const dbRiskLevel    = toDbRiskLevel(riskLevel);
      const assessmentData = {
        popia_score:              score,
        popia_risk_level:         dbRiskLevel,
        last_popia_assessment_at: new Date().toISOString(),
        updated_at:               new Date().toISOString(),
      };

      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const serviceRole = createServiceRoleClient();

      if (user) {
        // Authenticated: update by auth user ID — guaranteed single row.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (serviceRole.from('profiles') as any)
          .update(assessmentData)
          .eq('id', user.id);

        if (error) throw new Error(error.message);
        return { userId: user.id };
      }

      // Anonymous: update any existing profile matching the lead's email.
      // Existing clients retaking the assessment without being logged in
      // still get their portal data refreshed. Brand-new leads are a no-op
      // here — their record in monday.com is the source of truth.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error, count } = await (serviceRole.from('profiles') as any)
        .update(assessmentData)
        .eq('email', lead.email)
        .select('id', { count: 'exact', head: true });

      if (error) throw new Error(error.message);
      return { rowsUpdated: count ?? 0 };
    })(),
  ]);

  // 4. Log integration outcomes ────────────────────────────────────────────────
  type SyncStatus = 'ok' | 'skipped' | 'error';
  let mondaySync:   SyncStatus = 'ok';
  let supabaseSync: SyncStatus = 'ok';

  if (mondayResult.status === 'rejected') {
    console.error('[assessment:action] monday.com threw:', mondayResult.reason);
    mondaySync = 'error';
  } else if (!mondayResult.value.success) {
    console.error('[assessment:action] monday.com error:', mondayResult.value.error);
    mondaySync = 'error';
  } else if (mondayResult.value.skipped) {
    mondaySync = 'skipped';
  } else {
    console.log('[assessment:action] monday.com item:', mondayResult.value.itemId);
  }

  if (supabaseResult.status === 'rejected') {
    console.error('[assessment:action] Supabase threw:', supabaseResult.reason);
    supabaseSync = 'error';
  } else {
    const v = supabaseResult.value as Record<string, unknown>;
    if (v.skipped)      supabaseSync = 'skipped';
    else if (v.userId)  console.log('[assessment:action] Supabase updated auth user:', v.userId);
    else                console.log('[assessment:action] Supabase anonymous rows updated:', v.rowsUpdated ?? 0);
  }

  // 5. Always return the computed results ──────────────────────────────────────
  return {
    success: true,
    riskLevel,
    score,
    fullyCompliant,
    partial,
    criticalGaps,
    _sync: { monday: mondaySync, supabase: supabaseSync },
  };
}
