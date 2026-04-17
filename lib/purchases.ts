/**
 * Supabase helpers for the purchases table.
 * Always uses the service role client — bypasses RLS.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import type { CartLineItem }       from '@/app/api/subscribe/route';

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreatePurchaseInput {
  user_id:         string;
  order_id:        string;
  customer_name:   string;
  customer_email:  string;
  customer_phone?: string;
  company:         string;
  vat_number?:     string;
  address_line1?:  string;
  address_line2?:  string;
  city?:           string;
  province?:       string;
  postal_code?:    string;
  country:         string;
  order_notes?:    string;
  gross_total:     number;
  nett_total:      number;
  discount_amount?: number;
  discount_code?:  string;
  cart:            CartLineItem[];
  partner?:        string;
  landing_page?:   string;
}

export interface PurchaseCreateResult {
  success: boolean;
  id?:     string;
  error?:  string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Inserts a new purchase row. Returns the generated UUID on success.
 * monday_item_id and paystack_reference start as null and are filled in async.
 */
export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<PurchaseCreateResult> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('purchases') as any)
    .insert(input)
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: (data as { id: string }).id };
}

/**
 * Writes the Monday.com item ID back to the purchase row after sync.
 * Failure is logged but not re-thrown — Monday sync is non-critical.
 */
export async function updatePurchaseMondayId(
  orderId:      string,
  mondayItemId: string,
): Promise<void> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('purchases') as any)
    .update({ monday_item_id: mondayItemId })
    .eq('order_id', orderId);

  if (error) {
    console.error('[purchases] Failed to write monday_item_id:', error.message);
  }
}
