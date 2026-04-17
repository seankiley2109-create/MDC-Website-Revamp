/**
 * POST /api/subscribe
 *
 * Initiates a Paystack checkout for one or more self-serve products.
 * This endpoint is purely a payment gateway — it does NOT create Paystack
 * Plans or Subscriptions.  Recurring billing is managed by Sage.
 *
 * Flow:
 *   1. Validate the request body (line items, contract term, optional discount)
 *   2. Build a cart — one line per service/plan with unit price × quantity
 *   3. Apply discount if a valid code is provided
 *   4. Authenticate the current user
 *   5. Create or retrieve the Paystack customer record (for Sage CRM linking)
 *   6. Initialise a Paystack transaction (NO line_items — see step 6 comment)
 *   7. Return the authorization_url for the frontend to redirect to
 *
 * NOTE: We do NOT use Paystack's `line_items` field.  That field is wired into
 * Paystack's Product Catalog and causes `product.create` webhook events for every
 * transaction — spawning phantom catalog entries — without updating the "Sold"
 * count on existing products (which only works via Product Payment Pages).
 *
 * The transaction metadata.cart is the source of truth for Sage line items
 * and Monday.com deal data — consumed by the charge.success webhook.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@/lib/supabase/server';
import { z }                         from 'zod';
import {
  getProductEntry,
  isSelfServeService,
} from '@/lib/paystack-products';

// ─── Request schema ───────────────────────────────────────────────────────────

const LineItemSchema = z.object({
  service_id: z.string().min(1),
  plan_id:    z.string().min(1),
  /** Per-service quantity — users, endpoints, devices, or 1 for server tiers */
  quantity:   z.number().int().min(1),
});

const UserEmailContextSchema = z.array(z.object({
  serviceId: z.string().max(64),
  emails:    z.array(z.string().max(254)).max(500),
})).max(4).optional();

const BodySchema = z.object({
  services:      z.array(LineItemSchema).min(1, 'At least one service is required'),
  /**
   * contract_term is kept for metadata / period_end calculation only.
   * It does NOT affect pricing — prices are fixed per SKU in paystack-products.ts.
   * The billing period is encoded in the plan_id itself (e.g. '50gb-standard-annual').
   */
  contract_term:     z.enum(['monthly', 'yearly']).optional().default('monthly'),
  /** Optional promo / discount code */
  discount_code:     z.string().optional(),
  contact: z
    .object({ name: z.string().optional(), company: z.string().optional() })
    .optional(),
  userEmailContext:  UserEmailContextSchema,
});

// ─── Paystack response shapes ─────────────────────────────────────────────────

interface PaystackCustomerResponse {
  status: boolean;
  data:   { customer_code: string };
}

interface PaystackInitializeResponse {
  status: boolean;
  data:   { authorization_url: string; reference: string };
}

// ─── Cart line item (stored in metadata + forwarded to Sage) ──────────────────

export interface CartLineItem {
  /** Sage product code, e.g. DMS50M2M */
  product_code: string;
  /** Human-readable Sage line-item label */
  name:         string;
  unit:         string;
  unit_price:   number;   // ZAR
  quantity:     number;
  line_total:   number;   // ZAR
  /**
   * Actual self-serve service ID, e.g. 'druva-m365'.
   * Used by the portal/billing to look up rich catalog metadata.
   * Absent on discount lines.
   */
  service_id?:  string;
  /**
   * Composite plan key, e.g. '50gb-standard-monthly'.
   * Together with service_id uniquely identifies the product entry.
   */
  plan_id?:     string;
}

// ─── Discount lookup ──────────────────────────────────────────────────────────
//
// Discount codes are stored in the environment variable DISCOUNT_CODES as a
// JSON object mapping code → percentage (0-100).
// Example: DISCOUNT_CODES={"LAUNCH20":20,"PARTNER15":15}
//
// If DISCOUNT_CODES is not set, no codes are accepted.

function lookupDiscount(code: string | undefined): number {
  if (!code) return 0;
  const raw = process.env.DISCOUNT_CODES;
  if (!raw) return 0;
  try {
    const map = JSON.parse(raw) as Record<string, unknown>;
    const pct = map[code.toUpperCase()];
    return typeof pct === 'number' && pct > 0 && pct <= 100 ? pct : 0;
  } catch {
    return 0;
  }
}

// ─── POST /api/subscribe ──────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse + validate
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 },
    );
  }

  const { services, discount_code, contact, userEmailContext } = parsed.data;

  // Derive the effective billing period from the plan_ids.
  // If any item is annual the contract_term metadata is set to 'yearly' so the
  // callback calculates the period_end correctly.  The request's contract_term
  // field is accepted for backward-compat but the plan_id is authoritative.
  const hasAnnualItem  = services.some(s => s.plan_id.endsWith('-annual'));
  const contract_term  = hasAnnualItem ? 'yearly' : 'monthly';

  // Validate every line item has a known product entry
  for (const { service_id, plan_id } of services) {
    if (!isSelfServeService(service_id)) {
      return NextResponse.json(
        { error: `${service_id} is not a self-serve product — use the quote form` },
        { status: 400 },
      );
    }
    if (!getProductEntry(service_id, plan_id)) {
      return NextResponse.json(
        { error: `No product found for ${service_id} / ${plan_id}` },
        { status: 400 },
      );
    }
  }

  // 2. Build cart line items.
  //
  //    Prices come DIRECTLY from the product entry — no multiplication.
  //    Annual prices are separate SKUs with their own fixed price in the catalog.
  //    The plan_id encodes the billing period (e.g. '50gb-standard-annual').
  const cart: CartLineItem[] = services.map(({ service_id, plan_id, quantity }) => {
    const entry        = getProductEntry(service_id, plan_id)!;
    // Server tiers are flat-rate — quantity is always 1
    const effectiveQty = entry.unit === 'server' ? 1 : quantity;
    const unitPrice    = entry.unitPrice; // fixed price from catalog, no recalculation
    return {
      product_code: entry.product_code,
      name:         entry.label,
      unit:         entry.unit,
      unit_price:   unitPrice,
      quantity:     effectiveQty,
      line_total:   unitPrice * effectiveQty,
      // Include IDs so the portal can do rich catalog lookups on the stored entry
      service_id,
      plan_id,
    };
  });

  // 3. Calculate subtotal and apply discount
  const subtotal      = cart.reduce((s, l) => s + l.line_total, 0);
  const discountPct   = lookupDiscount(discount_code);
  const discountAmt   = discountPct > 0 ? Math.round(subtotal * discountPct / 100) : 0;
  const totalZAR      = subtotal - discountAmt;

  if (totalZAR <= 0) {
    return NextResponse.json(
      { error: 'Calculated total is zero — check your product configuration' },
      { status: 400 },
    );
  }

  // Add discount as a negative line item so it appears in Sage
  if (discountAmt > 0) {
    cart.push({
      product_code: 'DISCOUNT',
      name:         `Discount (${discountPct}% — ${discount_code?.toUpperCase()})`,
      unit:         'once',
      unit_price:   -discountAmt,
      quantity:     1,
      line_total:   -discountAmt,
    });
  }

  const totalKobo = Math.round(totalZAR * 100);

  // 4. Authenticate user
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) {
    console.error('[subscribe] PAYSTACK_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
  }

  const appUrl = process.env.APP_URL ?? 'https://montanadc.com';

  // 5. Create or retrieve Paystack customer
  //    Paystack deduplicates by email — safe to call on every checkout.
  let customerCode: string;
  try {
    const res = await fetch('https://api.paystack.co/customer', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:      user.email,
        first_name: contact?.name?.split(' ')[0] ?? '',
        last_name:  contact?.name?.split(' ').slice(1).join(' ') ?? '',
        metadata:   { company: contact?.company ?? '' },
      }),
    });

    if (!res.ok) {
      console.error('[subscribe] Paystack customer error:', await res.text());
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 502 });
    }

    customerCode = ((await res.json()) as PaystackCustomerResponse).data.customer_code;
  } catch (err) {
    console.error('[subscribe] Paystack customer request failed:', err);
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 502 });
  }

  // 6. Initialise the Paystack transaction — NO plan, NO line_items.
  //
  //    Why no line_items:
  //      Paystack's `line_items` field in transaction/initialize is wired into
  //      their Product Catalog system — every item (with or without an `id`) causes
  //      Paystack to emit `product.create` + `product.update` webhook events and
  //      spawns new phantom catalog entries.  It does NOT link to or update
  //      existing products, and it does NOT increment the "Sold" count on existing
  //      products (that only works through Paystack-hosted Product Payment Pages,
  //      a completely separate checkout flow).
  //
  //    metadata.cart is the source of truth for all line-item data.
  //    It is consumed by the charge.success webhook to build Sage line items
  //    and Monday.com deal data.  The Paystack dashboard transaction view will
  //    show the correct total, customer, and reference; the per-line detail
  //    lives in the metadata JSON (visible under the transaction in the dashboard).
  //
  //    `amount` is the full cart total in cents (kobo equivalent for ZAR).

  let authorizationUrl: string;
  try {
    const body = {
      email:        user.email,
      amount:       totalKobo,
      currency:     'ZAR',
      customer:     customerCode,
      callback_url: `${appUrl}/api/subscribe/callback`,
      metadata: {
        user_id:       user.id,
        contract_term,
        subtotal_zar:  subtotal,
        discount_pct:  discountPct,
        discount_zar:  discountAmt,
        total_zar:     totalZAR,
        cart,
        // Legacy field — kept so webhook/callback handlers that reference
        // metadata.services continue to degrade gracefully.
        services: services.map(({ service_id, plan_id, quantity }) => ({
          service_id,
          plan_id,
          quantity,
        })),
        // Onboarding: email addresses of users/endpoints to be provisioned
        ...(userEmailContext && userEmailContext.length > 0 && { user_email_context: userEmailContext }),
      },
    };

    console.log('[subscribe] Initialising Paystack transaction:', {
      email:    user.email,
      amount:   totalKobo,
      currency: 'ZAR',
      items:    cart.map(l => `${l.name} × ${l.quantity} = R${l.line_total}`),
    });

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[subscribe] Paystack initialize error:', errText);
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 502 });
    }

    const initData = (await res.json()) as PaystackInitializeResponse;
    authorizationUrl = initData.data.authorization_url;
    console.log('[subscribe] Transaction initialised — reference:', initData.data.reference);
  } catch (err) {
    console.error('[subscribe] Paystack initialize failed:', err);
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: authorizationUrl });
}
