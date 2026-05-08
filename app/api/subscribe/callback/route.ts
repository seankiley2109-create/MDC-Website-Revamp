/**
 * GET /api/subscribe/callback
 *
 * Paystack redirects here after the user completes (or abandons) checkout.
 *
 * After verifying the transaction we immediately write the purchase data to
 * Supabase — this is the GUARANTEED synchronous path.  The webhook fires
 * asynchronously and may arrive later (or not at all in local dev).
 *
 * Stacking semantics:
 *   Each successful checkout is APPENDED to `subscribed_services` as one or
 *   more entries (one per cart line item).  Two separate purchases of Druva
 *   Endpoint result in two distinct entries — they are never merged.
 *   De-duplication is by `paystack_reference` so the webhook can't double-stack.
 *
 * What we write here:
 *   plan_status            → 'active'
 *   subscribed_services    → EXISTING entries + new entries from cart
 *   subscribed_quantity    → SUM of all entry quantities (display only)
 *   paystack_customer_code → from data.customer.customer_code
 *   current_period_end     → purchase date + contract term (1 month / 12 months)
 *                            (informational — Sage is the billing authority)
 */

import { NextRequest, NextResponse }             from 'next/server';
import { createServiceRoleClient }               from '@/lib/supabase/server';
import { updateOrderPaymentStatus, createTechnicalOnboardingItem } from '@/lib/monday';
import type { CartLineItem }                     from '@/app/api/subscribe/route';
import { sendCheckoutConfirmationEmails, type CheckoutPayload, type CheckoutLineItem } from '@/lib/email';

// ─── Paystack verify response shape ──────────────────────────────────────────

interface PaystackVerifyData {
  status:    string;
  reference: string;
  amount:    number;
  paid_at:   string | null;
  customer: {
    email:         string;
    customer_code: string;
  };
  metadata: {
    user_id?:       string;
    order_id?:      string;
    contract_term?: string;
    cart?:          CartLineItem[];
    /** Legacy field — retained for backward compat */
    services?:      Array<{ service_id: string; plan_id: string; quantity?: number } | string>;
    quantity?:      number;
    total_zar?:     number;
    discount_zar?:  number;
  } | null;
}

interface PaystackVerifyResponse {
  status: boolean;
  data:   PaystackVerifyData;
}

// ─── Stored subscription entry shape ─────────────────────────────────────────

export type StoredEntry = {
  /** Actual service ID e.g. 'druva-m365'. Older entries may store the label here. */
  service_id:         string;
  /** Composite plan key e.g. '50gb-standard-monthly'. Older entries store the Sage code. */
  plan_id:            string;
  /** Human-readable Sage label — present on entries created after the productized rework. */
  label?:             string;
  quantity:           number;
  unit_price:         number;
  line_total:         number;
  contract_term:      'monthly' | 'yearly';
  purchased_at:       string;
  paystack_reference: string | null;
};

// ─── GET /api/subscribe/callback ─────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.redirect(new URL('/pos?error=payment_failed', request.url));
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) {
    console.error('[subscribe/callback] PAYSTACK_SECRET_KEY is not set');
    return NextResponse.redirect(new URL('/pos?error=payment_failed', request.url));
  }

  // ── 1. Verify the transaction with Paystack ───────────────────────────────
  let verifyData: PaystackVerifyData;
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackKey}` },
        cache:   'no-store',
      },
    );

    if (!res.ok) {
      console.error('[subscribe/callback] Paystack verify error:', await res.text());
      return NextResponse.redirect(new URL('/pos?error=payment_failed', request.url));
    }

    verifyData = ((await res.json()) as PaystackVerifyResponse).data;
  } catch (err) {
    console.error('[subscribe/callback] Paystack verify request failed:', err);
    return NextResponse.redirect(new URL('/pos?error=payment_failed', request.url));
  }

  if (verifyData.status !== 'success') {
    console.warn('[subscribe/callback] Transaction not successful:', verifyData.status, reference);
    return NextResponse.redirect(new URL('/pos?error=payment_failed', request.url));
  }

  // ── 2. Stack the new purchase onto the existing profile ───────────────────
  const userId = verifyData.metadata?.user_id;

  if (userId) {
    // Hoist shared state so each phase can access it and failures in one phase
    // cannot prevent later phases (especially the email send) from running.
    const contractTerm = (verifyData.metadata?.contract_term === 'yearly'
      ? 'yearly'
      : 'monthly') as 'monthly' | 'yearly';
    const orderId = verifyData.metadata?.order_id;

    type ExistingProfile = {
      subscribed_services?: unknown;
      full_name?:           string | null;
      company_name?:        string | null;
    };
    type PurchaseRow = {
      monday_item_id?:      string;
      customer_name?:       string;
      customer_phone?:      string;
      order_notes?:         string;
      paystack_reference?:  string | null;
      vat_number?:          string;
      address_line1?:       string;
      address_line2?:       string;
      city?:                string;
      province?:            string;
      postal_code?:         string;
      country?:             string;
      discount_amount?:     number;
      discount_code?:       string;
    };

    let alreadyStacked   = false;
    let existingProfile: ExistingProfile | null = null;
    let purchaseRow:     PurchaseRow    | null = null;

    const supabase = createServiceRoleClient();

    // ── Phase 1: Stack new entries onto the profile ───────────────────────────
    try {
      const customerCode = verifyData.customer?.customer_code ?? null;
      const purchasedAt  = verifyData.paid_at ?? new Date().toISOString();

      const newEntries: StoredEntry[] = buildNewEntries(
        verifyData.metadata,
        contractTerm,
        purchasedAt,
        reference,
      );

      const baseDate  = new Date(purchasedAt);
      const periodEnd = new Date(baseDate);
      if (contractTerm === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase.from('profiles') as any)
        .select('subscribed_services, subscribed_quantity, full_name, company_name')
        .eq('id', userId)
        .single();

      existingProfile = existing as ExistingProfile | null;

      const existingEntries = normaliseExisting(existingProfile?.subscribed_services);

      // De-dupe: skip if this reference is already stacked (webhook beat us)
      alreadyStacked = existingEntries.some(
        (e) => e.paystack_reference && e.paystack_reference === reference,
      );
      const mergedEntries = alreadyStacked
        ? existingEntries
        : [...existingEntries, ...newEntries];
      const totalQuantity = mergedEntries.reduce((s, e) => s + (e.quantity ?? 0), 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any).update({
        plan_status:            'active',
        subscribed_services:    mergedEntries,
        subscribed_quantity:    totalQuantity,
        paystack_customer_code: customerCode,
        current_period_end:     periodEnd.toISOString(),
        updated_at:             new Date().toISOString(),
      }).eq('id', userId);

      if (error) {
        console.error('[subscribe/callback] Supabase write error:', error.message);
      } else {
        console.log(
          `[subscribe/callback] Profile updated for user: ${userId} — ` +
          `stacked ${newEntries.length} new entries (total now ${mergedEntries.length})`,
        );
      }
    } catch (err) {
      console.error('[subscribe/callback] Unexpected error updating profile:', err);
    }

    // ── Phase 2: Stamp reference + update Monday (checkout flow only) ─────────
    // Isolated in its own try/catch — failures here must NOT prevent the email.
    if (orderId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: pRow } = await (supabase.from('purchases') as any)
          .select('monday_item_id, customer_name, customer_phone, order_notes, paystack_reference, vat_number, address_line1, address_line2, city, province, postal_code, country, discount_amount, discount_code')
          .eq('order_id', orderId)
          .eq('user_id', userId)
          .single();
        purchaseRow = pRow as PurchaseRow | null;

        // True only on the very first callback hit — paystack_reference is null until stamped below
        const isFirstProcessing = !purchaseRow?.paystack_reference;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: purchaseErr } = await (supabase.from('purchases') as any)
          .update({ paystack_reference: reference })
          .eq('order_id', orderId)
          .eq('user_id', userId);
        if (purchaseErr) {
          console.error('[subscribe/callback] Failed to stamp paystack_reference on purchases:', purchaseErr.message);
        }

        const mondayItemId = purchaseRow?.monday_item_id;
        if (mondayItemId) {
          try {
            await updateOrderPaymentStatus(mondayItemId, 'completed');
            console.log('[subscribe/callback] Monday.com order status → completed:', mondayItemId);
          } catch (err) {
            console.error('[subscribe/callback] Failed to update Monday.com order status:', err);
          }
        }

        // ── Create technical onboarding item — first hit only ────────────────
        if (isFirstProcessing) {
          const userEmailContext = (verifyData.metadata as Record<string, unknown> | null)
            ?.user_email_context as { serviceId: string; emails: string[] }[] | undefined;

          const onboardingCart = (verifyData.metadata?.cart ?? [])
            .filter(l => l.product_code !== 'DISCOUNT')
            .map(l => ({
              name:         l.name,
              product_code: l.product_code,
              quantity:     l.quantity,
              emails:       userEmailContext?.find(ctx => ctx.serviceId === l.service_id)?.emails,
            }));

          const nameParts = (purchaseRow?.customer_name ?? existingProfile?.full_name ?? '').trim().split(' ');
          const firstName = nameParts[0] ?? '';
          const lastName  = nameParts.slice(1).join(' ') || firstName;
          const company   = existingProfile?.company_name ?? 'Unknown Organisation';

          try {
            const onboardingResult = await createTechnicalOnboardingItem({
              orderId,
              company,
              firstName,
              lastName,
              contactEmail: verifyData.customer.email,
              contactPhone: purchaseRow?.customer_phone ?? '',
              orderNotes:   purchaseRow?.order_notes,
              cart:         onboardingCart,
            });
            if (onboardingResult.skipped) {
              console.warn('[subscribe/callback] Technical onboarding skipped — MONDAY_SUPPORT_BOARD_ID not set');
            } else if (onboardingResult.success) {
              console.log('[subscribe/callback] Technical onboarding item created:', onboardingResult.itemId);
            } else {
              console.error('[subscribe/callback] Technical onboarding item failed:', onboardingResult.error);
            }
          } catch (err) {
            console.error('[subscribe/callback] createTechnicalOnboardingItem threw:', err);
          }
        }
      } catch (err) {
        console.error('[subscribe/callback] Unexpected error processing purchase row:', err);
      }
    }

    // ── Phase 3: Send purchase confirmation email ─────────────────────────────
    // Checkout flow (orderId present): email already sent by processOrder server action.
    // Subscribe flow (no orderId): send here as this is the only reliable trigger point.
    // alreadyStacked guards against duplicates on repeated callback hits.
    if (!alreadyStacked && !orderId) {
      const checkoutCart: CheckoutLineItem[] = (verifyData.metadata?.cart ?? [])
        .filter(l => l.product_code !== 'DISCOUNT')
        .map(l => ({
          name:       l.name,
          quantity:   l.quantity,
          unit_price: l.unit_price,
          line_total: l.line_total,
        }));

      if (checkoutCart.length === 0) {
        console.warn('[subscribe/callback] Checkout email: cart is empty for reference', reference);
      }

      const checkoutPayload: CheckoutPayload = {
        customer: {
          name:      existingProfile?.full_name    ?? verifyData.customer.email,
          email:     verifyData.customer.email,
          company:   existingProfile?.company_name ?? 'Unknown Organisation',
          vatNumber: purchaseRow?.vat_number       ?? undefined,
        },
        billing: purchaseRow?.address_line1 ? {
          address1:   purchaseRow.address_line1,
          address2:   purchaseRow.address_line2  ?? undefined,
          city:       purchaseRow.city            ?? '',
          province:   purchaseRow.province        ?? '',
          postalCode: purchaseRow.postal_code     ?? '',
          country:    purchaseRow.country         ?? 'ZA',
        } : undefined,
        orderId:      orderId                                 ?? undefined,
        cart:         checkoutCart,
        totalZAR:     verifyData.metadata?.total_zar         ?? verifyData.amount / 100,
        discountZAR:  purchaseRow?.discount_amount           ?? verifyData.metadata?.discount_zar ?? 0,
        discountCode: purchaseRow?.discount_code             ?? undefined,
        contractTerm,
        reference,
      };

      console.log('[subscribe/callback] Sending checkout email to:', verifyData.customer.email, 'cart items:', checkoutCart.length);
      const [emailResult] = await Promise.allSettled([
        sendCheckoutConfirmationEmails(checkoutPayload),
      ]);
      if (emailResult.status === 'rejected') {
        console.error('[subscribe/callback] Checkout email threw:', emailResult.reason);
      } else if (!emailResult.value.success) {
        console.error('[subscribe/callback] Checkout email failed:', emailResult.value.error);
      } else {
        console.log('[subscribe/callback] Checkout confirmation email sent for order:', orderId ?? reference);
      }
    }
  } else {
    console.warn('[subscribe/callback] No user_id in metadata — profile not updated. reference:', reference);
  }

  // ── 3. Redirect to billing success page ──────────────────────────────────
  return NextResponse.redirect(new URL('/billing?welcome=1', request.url));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds StoredEntry[] from the transaction metadata.
 * Prefers metadata.cart (new productized format) and falls back to the
 * legacy metadata.services format for older transactions.
 */
function buildNewEntries(
  metadata:     PaystackVerifyData['metadata'],
  contractTerm: 'monthly' | 'yearly',
  purchasedAt:  string,
  reference:    string,
): StoredEntry[] {
  // New format — cart line items
  if (Array.isArray(metadata?.cart) && metadata.cart.length > 0) {
    return metadata.cart
      .filter((l) => l.product_code !== 'DISCOUNT') // discount lines are not services
      .map((l) => ({
        // Prefer the explicit service_id/plan_id fields added in the productized rework.
        // Fall back to the label/product_code for entries created before the fix.
        service_id:         l.service_id  ?? l.name,
        plan_id:            l.plan_id     ?? l.product_code,
        label:              l.name,       // always store label for display
        quantity:           l.quantity,
        unit_price:         l.unit_price,
        line_total:         l.line_total,
        contract_term:      contractTerm,
        purchased_at:       purchasedAt,
        paystack_reference: reference,
      }));
  }

  // Legacy format — services array
  const rawServices = metadata?.services ?? [];
  const quantity    = metadata?.quantity ?? 1;
  return rawServices
    .map((s) => (typeof s === 'string' ? { service_id: s, plan_id: '' } : s))
    .filter((s): s is { service_id: string; plan_id: string; quantity?: number } =>
      Boolean(s?.service_id),
    )
    .map(({ service_id, plan_id, quantity: q }) => ({
      service_id,
      plan_id,
      quantity:           q ?? quantity,
      unit_price:         0,
      line_total:         0,
      contract_term:      contractTerm,
      purchased_at:       purchasedAt,
      paystack_reference: reference,
    }));
}

/**
 * Normalises a row's `subscribed_services` to an array of StoredEntry.
 * Accepts all historical shapes:
 *   string[]                                   (very old)
 *   {service_id, plan_id}[]                    (intermediate)
 *   {service_id, plan_id, quantity, ...}[]     (current / productized)
 */
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
          quantity:           typeof e.quantity    === 'number' ? e.quantity    : 1,
          unit_price:         typeof e.unit_price  === 'number' ? e.unit_price  : 0,
          line_total:         typeof e.line_total  === 'number' ? e.line_total  : 0,
          contract_term:      e.contract_term === 'yearly' ? 'yearly' : 'monthly',
          purchased_at:       typeof e.purchased_at === 'string' ? e.purchased_at : '',
          paystack_reference: typeof e.paystack_reference === 'string' ? e.paystack_reference : null,
        };
      }
      return null;
    })
    .filter((e): e is StoredEntry => e !== null && Boolean(e.service_id));
}
