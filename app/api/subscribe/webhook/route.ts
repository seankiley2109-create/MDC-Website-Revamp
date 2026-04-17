/**
 * Paystack Webhook Handler  —  POST /api/subscribe/webhook
 *
 * Paystack signs every webhook payload with an HMAC-SHA512 hash of the raw
 * request body using your secret key.  We verify this before touching the DB.
 *
 * Register this URL in your Paystack dashboard:
 *   Settings → Webhooks → Add New → https://montanadc.com/api/subscribe/webhook
 *
 * Events handled:
 *   charge.success   → stack purchased products onto the profile (primary writer
 *                       is the synchronous /callback handler — this is the safety net)
 *
 * Events intentionally NOT handled (Sage is the billing authority):
 *   subscription.*        — no subscriptions are created
 *   invoice.payment_failed — recurring billing managed by Sage, not Paystack
 *
 * De-duplication:
 *   Before stacking we check whether the reference is already present in
 *   subscribed_services.  If the /callback handler already ran, we skip.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto                        from 'crypto';
import { createServiceRoleClient }   from '@/lib/supabase/server';
import type { CartLineItem }         from '@/app/api/subscribe/route';
import type { StoredEntry }          from '@/app/api/subscribe/callback/route';

export const runtime = 'nodejs';

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
  const hash   = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1 — Authenticate the request
  const signature = request.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const rawBody = await request.text();
  if (!verifySignature(rawBody, signature)) {
    console.warn('[webhook/paystack] Invalid HMAC signature — request rejected.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 2 — Parse event payload
  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { event: eventType, data } = event;
  const supabase = createServiceRoleClient();

  console.log(`[webhook/paystack] Event received: ${eventType}`);

  try {
    switch (eventType) {

      // ── Payment successful → stack purchased products ──────────────────────
      //
      // The synchronous /callback handler is the primary writer.  This fires
      // asynchronously and may arrive before or after callback.  We skip if
      // the reference is already stacked.
      case 'charge.success': {
        const metadata    = data.metadata as Record<string, unknown> | undefined;
        const userId      = metadata?.user_id as string | undefined;
        const reference   = data.reference   as string | undefined;

        if (!userId) {
          console.warn('[webhook/paystack] charge.success: no user_id in metadata — skipping.');
          break;
        }

        const paidAt        = (data.paid_at as string | undefined) ?? new Date().toISOString();
        const customer      = data.customer as Record<string, unknown> | undefined;
        const customerCode  = customer?.customer_code as string | undefined;
        const contractTerm  = (metadata?.contract_term as 'monthly' | 'yearly' | undefined) ?? 'monthly';

        // Build new entries — prefer cart (productized) over legacy services
        const newEntries = buildNewEntries(metadata, contractTerm, paidAt, reference ?? null);

        // Read existing stack
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase.from('profiles') as any)
          .select('subscribed_services')
          .eq('id', userId)
          .single();

        const existingArr: StoredEntry[] = normaliseExisting(
          (existing as { subscribed_services?: unknown } | null)?.subscribed_services,
        );

        // De-dupe by reference
        const alreadyStacked = reference
          ? existingArr.some((e) => e.paystack_reference === reference)
          : false;

        const mergedEntries = alreadyStacked
          ? existingArr
          : [...existingArr, ...newEntries];

        const totalQuantity = mergedEntries.reduce(
          (s, e) => s + (typeof e.quantity === 'number' ? e.quantity : 0),
          0,
        );

        // Compute a contract end date (informational — Sage is authoritative)
        const baseDate  = new Date(paidAt);
        const periodEnd = new Date(baseDate);
        if (contractTerm === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('profiles') as any)
          .update({
            plan_status:             'active',
            subscribed_services:     mergedEntries,
            subscribed_quantity:     totalQuantity,
            current_period_end:      periodEnd.toISOString(),
            ...(customerCode && { paystack_customer_code: customerCode }),
            updated_at:              new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('[webhook/paystack] charge.success — DB update error:', error.message);
        } else {
          console.log(
            `[webhook/paystack] Products stacked for user: ${userId} — ` +
            `${alreadyStacked ? 'already stacked by callback (skipped)' : `${newEntries.length} new entries`}`,
          );
        }
        break;
      }

      default:
        // Acknowledge silently — Paystack will not retry on 200
        console.log(`[webhook/paystack] Unhandled event type acknowledged: ${eventType}`);
    }
  } catch (err) {
    // Return 200 even on unexpected errors so Paystack does not retry endlessly.
    console.error('[webhook/paystack] Unexpected processing error:', err);
  }

  return NextResponse.json({ received: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildNewEntries(
  metadata:     Record<string, unknown> | undefined,
  contractTerm: 'monthly' | 'yearly',
  purchasedAt:  string,
  reference:    string | null,
): StoredEntry[] {
  // New format — cart line items
  const cart = metadata?.cart as CartLineItem[] | undefined;
  if (Array.isArray(cart) && cart.length > 0) {
    return cart
      .filter((l) => l.product_code !== 'DISCOUNT')
      .map((l) => ({
        service_id:         l.service_id  ?? l.name,
        plan_id:            l.plan_id     ?? l.product_code,
        label:              l.name,
        quantity:           l.quantity,
        unit_price:         l.unit_price,
        line_total:         l.line_total,
        contract_term:      contractTerm,
        purchased_at:       purchasedAt,
        paystack_reference: reference,
      }));
  }

  // Legacy format — services array
  const rawServices = metadata?.services as Array<string | { service_id: string; plan_id: string; quantity?: number }> | undefined;
  const legacyQty   = typeof metadata?.quantity === 'number' ? metadata.quantity : 1;
  return (rawServices ?? [])
    .map((s) => (typeof s === 'string' ? { service_id: s, plan_id: '' } : s))
    .filter((s): s is { service_id: string; plan_id: string; quantity?: number } =>
      Boolean(s?.service_id),
    )
    .map(({ service_id, plan_id, quantity }) => ({
      service_id,
      plan_id,
      quantity:           quantity ?? legacyQty,
      unit_price:         0,
      line_total:         0,
      contract_term:      contractTerm,
      purchased_at:       purchasedAt,
      paystack_reference: reference,
    }));
}

function normaliseExisting(raw: unknown): StoredEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): StoredEntry | null => {
      if (typeof entry === 'string') {
        return {
          service_id:         entry,
          plan_id:            '',
          quantity:           1,
          unit_price:         0,
          line_total:         0,
          contract_term:      'monthly',
          purchased_at:       '',
          paystack_reference: null,
        };
      }
      if (entry && typeof entry === 'object' && 'service_id' in entry) {
        const e = entry as Record<string, unknown>;
        return {
          service_id:         String(e.service_id ?? ''),
          plan_id:            String(e.plan_id ?? ''),
          quantity:           typeof e.quantity   === 'number' ? e.quantity   : 1,
          unit_price:         typeof e.unit_price === 'number' ? e.unit_price : 0,
          line_total:         typeof e.line_total === 'number' ? e.line_total : 0,
          contract_term:      e.contract_term === 'yearly' ? 'yearly' : 'monthly',
          purchased_at:       typeof e.purchased_at === 'string' ? e.purchased_at : '',
          paystack_reference: typeof e.paystack_reference === 'string' ? e.paystack_reference : null,
        };
      }
      return null;
    })
    .filter((e): e is StoredEntry => e !== null && Boolean(e.service_id));
}
