'use server';

/**
 * processOrder — Server Action
 *
 * Called by the checkout form on submission. Executes in order:
 *   1. Validate form + cart
 *   2. Authenticate user
 *   3. Read partner attribution cookie
 *   4. Calculate totals
 *   5. INSERT purchases row (hard gate — fails loud)
 *   6. Create Monday.com parent item (non-critical)
 *   7. Create Monday.com subitems (non-critical, one per cart line)
 *   8. UPDATE purchases.monday_item_id
 *   9. Initialise Paystack transaction (hard gate — fails loud)
 *  10. Return { success: true, authorization_url }
 */

import { z }                                     from 'zod';
import { cookies }                               from 'next/headers';
import { createServerClient }                    from '@/lib/supabase/server';
import { createPurchase, updatePurchaseMondayId } from '@/lib/purchases';
import { createOrderItem, createOrderSubitem }   from '@/lib/monday';
import type { CartLineItem }                     from '@/app/api/subscribe/route';

// ─── Validation schemas ───────────────────────────────────────────────────────

const formSchema = z.object({
  firstName:    z.string().min(1, 'First name is required'),
  lastName:     z.string().min(1, 'Last name is required'),
  email:        z.string().email('Valid email required'),
  phone:        z.string().min(7, 'Phone number is required'),
  company:      z.string().min(1, 'Company name is required'),
  vatNumber:    z.string().optional(),
  address1:     z.string().min(1, 'Street address is required'),
  address2:     z.string().optional(),
  city:         z.string().min(1, 'City is required'),
  province:     z.string().min(1, 'Province is required'),
  postalCode:   z.string().min(4, 'Postal code is required'),
  country:      z.string().min(1).default('ZA'),
  orderNotes:   z.string().optional(),
  discountCode: z.string().optional(),
});

export type OrderFormData = z.infer<typeof formSchema>;

const cartItemSchema = z.object({
  product_code: z.string(),
  name:         z.string(),
  unit:         z.string(),
  unit_price:   z.number(),
  quantity:     z.number().int().min(1),
  line_total:   z.number(),
  service_id:   z.string().optional(),
  plan_id:      z.string().optional(),
});

// ─── Result type ──────────────────────────────────────────────────────────────

export interface OrderResult {
  success:            boolean;
  authorization_url?: string;
  error?:             string;
}

// ─── Order ID generator ───────────────────────────────────────────────────────

function generateOrderId(): string {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // "20260416"
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);    // "K7X2"
  return `MDC-${date}-${suffix}`;
}

// ─── Discount lookup — mirrors /api/subscribe logic ───────────────────────────
// DISCOUNT_CODES env var: JSON object mapping code → percentage, e.g. {"PARTNER15":15}

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

// ─── Server Action ────────────────────────────────────────────────────────────

export async function processOrder(
  formData: OrderFormData,
  rawCart:  unknown[],
): Promise<OrderResult> {

  // 1. Validate form data
  const formParsed = formSchema.safeParse(formData);
  if (!formParsed.success) {
    return {
      success: false,
      error: formParsed.error.issues[0]?.message ?? 'Invalid form data',
    };
  }
  const form = formParsed.data;

  // 2. Validate cart
  const cartParsed = z.array(cartItemSchema).min(1, 'Cart is empty').safeParse(rawCart);
  if (!cartParsed.success) {
    return { success: false, error: 'Invalid or empty cart' };
  }
  const cart = cartParsed.data as CartLineItem[];

  // 3. Authenticate user
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }

  // 4. Read partner attribution cookie (set by app/[partner]/route.ts)
  const cookieStore  = await cookies();
  const partnerRaw   = cookieStore.get('partner_attribution')?.value;
  let partner:      string | undefined;
  let landingPage:  string | undefined;

  if (partnerRaw) {
    try {
      const parsed = JSON.parse(partnerRaw) as { handle?: string; landingPage?: string };
      partner     = parsed.handle;
      landingPage = parsed.landingPage;
    } catch {
      // Malformed cookie — ignore attribution silently
    }
  }

  // 5. Calculate totals
  const grossTotal  = cart.reduce((s, l) => s + l.line_total, 0);
  const discountPct = lookupDiscount(form.discountCode);
  // Cent-precise rounding (2 decimal places). /api/subscribe uses whole-rand rounding —
  // that path is intentionally different (legacy subscription flow, not new checkout flow).
  const discountAmt = discountPct > 0
    ? Math.round(grossTotal * discountPct / 100 * 100) / 100
    : 0;
  const nettTotal   = grossTotal - discountAmt;

  if (nettTotal <= 0) {
    return { success: false, error: 'Order total is zero — check your cart' };
  }

  // 6. Generate order ID
  const orderId = generateOrderId();

  // 7. INSERT purchases row — hard gate: must succeed before proceeding
  const purchaseResult = await createPurchase({
    user_id:         user.id,
    order_id:        orderId,
    customer_name:   `${form.firstName} ${form.lastName}`,
    customer_email:  form.email,
    customer_phone:  form.phone,
    company:         form.company,
    vat_number:      form.vatNumber,
    address_line1:   form.address1,
    address_line2:   form.address2,
    city:            form.city,
    province:        form.province,
    postal_code:     form.postalCode,
    country:         form.country,
    order_notes:     form.orderNotes,
    gross_total:     grossTotal,
    nett_total:      nettTotal,
    discount_amount: discountAmt,
    discount_code:   form.discountCode,
    cart,
    partner,
    landing_page:    landingPage,
  });

  if (!purchaseResult.success) {
    console.error('[order] Supabase insert failed:', purchaseResult.error);
    return { success: false, error: 'Failed to record order. Please try again.' };
  }

  // 8. Monday.com parent item — non-critical
  try {
    const mondayResult = await createOrderItem({
      orderId,
      company:      form.company,
      firstName:    form.firstName,
      lastName:     form.lastName,
      email:        form.email,
      phone:        form.phone,
      vatNumber:    form.vatNumber,
      address1:     form.address1,
      address2:     form.address2,
      city:         form.city,
      province:     form.province,
      postalCode:   form.postalCode,
      country:      form.country,
      orderNotes:   form.orderNotes,
      grossTotal,
      nettTotal,
      discountAmt,
      discountCode: form.discountCode,
      partner,
      landingPage,
    });

    if (mondayResult.success && mondayResult.itemId) {
      // 9. Monday.com subitems — non-critical, one per line
      for (const line of cart) {
        try {
          await createOrderSubitem(mondayResult.itemId, orderId, line);
        } catch (err) {
          console.error('[order] Subitem failed for', line.name, ':', err);
        }
      }

      // 10. Write monday_item_id back to the purchase row
      await updatePurchaseMondayId(orderId, mondayResult.itemId);
      console.log('[order] Monday.com synced — item:', mondayResult.itemId, 'order:', orderId);
    } else if (!mondayResult.skipped) {
      console.error('[order] Monday.com parent item failed:', mondayResult.error);
    }
  } catch (err) {
    console.error('[order] Monday.com threw unexpectedly:', err);
  }

  // 11. Initialise Paystack transaction — hard gate: must succeed
  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  const appUrl      = process.env.APP_URL ?? 'https://montanadc.com';

  if (!paystackKey) {
    console.error('[order] PAYSTACK_SECRET_KEY not configured');
    return { success: false, error: 'Payment service not configured' };
  }

  // Build payment cart: clone + append discount line if applicable
  const paymentCart = [...cart];
  if (discountAmt > 0) {
    paymentCart.push({
      product_code: 'DISCOUNT',
      name:         `Discount (${discountPct}% — ${form.discountCode?.toUpperCase() ?? ''})`,
      unit:         'once',
      unit_price:   -discountAmt,
      quantity:     1,
      line_total:   -discountAmt,
    });
  }

  const isAnnual    = cart.some(l => l.plan_id?.endsWith('-annual'));
  const totalKobo   = Math.round(nettTotal * 100);

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:        form.email,
        amount:       totalKobo,
        currency:     'ZAR',
        callback_url: `${appUrl}/api/subscribe/callback`,
        metadata: {
          user_id:       user.id,
          order_id:      orderId,
          contract_term: isAnnual ? 'yearly' : 'monthly',
          subtotal_zar:  grossTotal,
          discount_pct:  discountPct,
          discount_zar:  discountAmt,
          total_zar:     nettTotal,
          cart:          paymentCart,
          // Legacy field retained for webhook/callback backward-compat
          services: cart.map(({ service_id, plan_id, quantity }) => ({
            service_id, plan_id, quantity,
          })),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[order] Paystack initialize failed:', text);
      return { success: false, error: 'Failed to initialize payment. Please try again.' };
    }

    const initData = (await res.json()) as {
      data: { authorization_url: string; reference: string };
    };

    console.log('[order] Transaction initialised — order:', orderId, 'ref:', initData.data.reference);
    return { success: true, authorization_url: initData.data.authorization_url };
  } catch (err) {
    console.error('[order] Paystack threw:', err);
    return { success: false, error: 'Payment service unavailable. Please try again.' };
  }
}
