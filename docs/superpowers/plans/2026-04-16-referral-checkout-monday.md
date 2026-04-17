# Referral Capture, Checkout Flow & Monday.com Order Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire partner attribution cookies, an auth-gated `/checkout` form, and a `processOrder` server action that creates a Supabase purchase record and Monday.com parent item + subitems before handing off to Paystack.

**Architecture:** A dynamic catch-all route (`app/[partner]/route.ts`) sets an HttpOnly attribution cookie and redirects to `/pos`. The POS page serialises the cart to `sessionStorage` and navigates to `/checkout`. The checkout form calls `processOrder` (server action), which writes to Supabase first (hard gate), syncs non-critically to Monday.com, then initialises a Paystack transaction and returns the `authorization_url`.

**Tech Stack:** Next.js 15 App Router, TypeScript, React Hook Form, Zod, Supabase (service role client), Monday.com GraphQL API v2024-10, Tailwind CSS v4, Paystack REST API

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/003_purchases.sql` | Create | purchases table + indexes + RLS |
| `lib/supabase/types.ts` | Modify | Add `Purchase` interface and `purchases` entry in `Database` type |
| `lib/purchases.ts` | Create | `createPurchase` and `updatePurchaseMondayId` Supabase helpers |
| `lib/monday.ts` | Modify | Add `ORDER_COLS`, `SUBITEM_COLS`, `colDate`, `createOrderItem`, `createOrderSubitem` |
| `app/[partner]/route.ts` | Create | GET handler: set `partner_attribution` cookie → redirect `/pos` |
| `middleware.ts` | Modify | Add `/checkout` to auth-protected matcher + guard block |
| `app/actions/order.ts` | Create | `processOrder` server action (Supabase → Monday → Paystack) |
| `app/checkout/layout.tsx` | Create | Minimal layout wrapper for the checkout route |
| `app/checkout/page.tsx` | Create | Auth-gated checkout form (React Hook Form) |
| `app/pos/page.tsx` | Modify | Replace `handleCheckout` body (lines 873–929): serialize cart → `/checkout` |

---

## Task 1: Database migration — `purchases` table

**Files:**
- Create: `supabase/migrations/003_purchases.sql`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/003_purchases.sql` with this exact content:

```sql
-- 003_purchases.sql
-- Order ledger. One row per checkout submission.
-- monday_item_id and paystack_reference are populated async after creation.

create table public.purchases (
  id                  uuid          primary key default gen_random_uuid(),
  user_id             uuid          references auth.users(id) on delete set null,
  order_id            text          not null unique,           -- MDC-YYYYMMDD-XXXX
  customer_name       text          not null,
  customer_email      text          not null,
  customer_phone      text,
  company             text          not null,
  vat_number          text,
  address_line1       text,
  address_line2       text,
  city                text,
  province            text,
  postal_code         text,
  country             text          not null default 'ZA',
  order_notes         text,
  gross_total         numeric(10,2) not null,
  nett_total          numeric(10,2) not null,
  discount_amount     numeric(10,2) not null default 0,
  discount_code       text,
  cart                jsonb         not null,                  -- CartLineItem[]
  partner             text,                                    -- 'nedbank'
  landing_page        text,                                    -- '/nedbank'
  monday_item_id      text,
  paystack_reference  text,
  created_at          timestamptz   not null default now()
);

create index purchases_user_id_idx  on public.purchases(user_id);
create index purchases_email_idx    on public.purchases(customer_email);
create index purchases_order_id_idx on public.purchases(order_id);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS — used by server-side helpers
create policy "Service role has full access"
  on public.purchases for all
  using (true) with check (true);
```

- [ ] **Step 2: Apply the migration**

In your Supabase dashboard → SQL Editor, paste and run the file above.
Or via CLI: `npx supabase db push` (if using local dev).

Verify in Table Editor: the `purchases` table appears with all columns.

- [ ] **Step 3: Add `Purchase` TypeScript interface to `lib/supabase/types.ts`**

Open `lib/supabase/types.ts`. After the `Download` interface (around line 83), add:

```typescript
export interface Purchase {
  id:                 string;
  user_id:            string | null;
  order_id:           string;
  customer_name:      string;
  customer_email:     string;
  customer_phone:     string | null;
  company:            string;
  vat_number:         string | null;
  address_line1:      string | null;
  address_line2:      string | null;
  city:               string | null;
  province:           string | null;
  postal_code:        string | null;
  country:            string;
  order_notes:        string | null;
  gross_total:        number;
  nett_total:         number;
  discount_amount:    number;
  discount_code:      string | null;
  cart:               unknown[];  // CartLineItem[] — avoid circular import
  partner:            string | null;
  landing_page:       string | null;
  monday_item_id:     string | null;
  paystack_reference: string | null;
  created_at:         string;
}
```

Then inside the `Database` type, in the `Tables` object (after the `downloads` entry), add:

```typescript
      purchases: {
        Row:    Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Purchase>;
        Relationships: [];
      };
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/003_purchases.sql lib/supabase/types.ts
git commit -m "feat: add purchases table migration and TypeScript types"
```

---

## Task 2: Supabase purchase helpers — `lib/purchases.ts`

**Files:**
- Create: `lib/purchases.ts`

- [ ] **Step 1: Create the file**

Create `lib/purchases.ts` with this exact content:

```typescript
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
  discount_amount: number;
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/purchases.ts
git commit -m "feat: add purchases Supabase helpers (createPurchase, updatePurchaseMondayId)"
```

---

## Task 3: Monday.com order mutations — extend `lib/monday.ts`

**Files:**
- Modify: `lib/monday.ts`

- [ ] **Step 1: Update `ColumnValueMap`, add `ORDER_COLS`, `SUBITEM_COLS`, and `colDate` helper**

Open `lib/monday.ts`. Find the `ColumnValueMap` type (around line 153) and add `| { date: string }` to its union so `colDate()` values are accepted:

```typescript
type ColumnValueMap = Record<
  string,
  | string
  | number
  | { email: string; text: string }
  | { label: string }
  | { text: string }
  | { date: string }       // ← add this line
>;
```

Then, after the existing `ASSESSMENT_COLS` block (around line 120), add:

```typescript
/** Column IDs for the "Website - Solution Requests FULL" orders board. */
const ORDER_COLS = {
  orderStatus:    'color_mkya1nwk',
  orderId:        'text_mkqp2zzd',
  orderDate:      'date4',
  partner:        'text_mm03hex3',
  landingPage:    'text_mm038w9m',
  grossValue:     'numeric_mm06g01q',
  nettValue:      'numeric_mm06cmss',
  discountAmount: 'numeric_mkqp21qs',
  voucherCode:    'text_mkqp15b1',
  contactPerson:  'text_mkqph4x3',
  firstName:      'text_mkqf49rq',
  lastName:       'text_mkqngb65',
  email:          'email_mkqfjdkw',
  phone:          'text_mkxnzak5',
  vatNumber:      'text_mkqf7yv9',
  address1:       'text_mkqfrpy5',
  address2:       'text_mkqfmyn5',
  city:           'text_mkqf4q00',
  postCode:       'text_mkqfbvvy',
  province:       'text_mkqfk4sg',
  country:        'text_mkqfjagt',
  orderNotes:     'long_text_mkqpyhk5',
} as const;

/** Column IDs for the auto-generated subitems board attached to the orders board. */
const SUBITEM_COLS = {
  productCode: 'text_mkqfxt8c',
  unitPrice:   'numeric_mm063z0t',
  quantity:    'numeric_mkqfngw6',
  lineTotal:   'numeric_mkqfjn0d',
  orderId:     'text_mm00beth',
} as const;
```

After the existing `colLongText` helper (around line 217), add:

```typescript
function colDate(date: Date): { date: string } {
  return { date: date.toISOString().slice(0, 10) }; // "YYYY-MM-DD"
}
```

- [ ] **Step 2: Add the `CREATE_SUBITEM_MUTATION` and `OrderItemPayload` type**

After the existing `CREATE_ITEM_MUTATION` constant (around line 164), add:

```typescript
const CREATE_SUBITEM_MUTATION = /* graphql */ `
  mutation CreateSubitem($parentItemId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_subitem(
      parent_item_id: $parentItemId
      item_name: $itemName
      column_values: $columnValues
    ) {
      id
      name
    }
  }
`;
```

After the existing `MondayResult` export interface, add (note the `export` keyword — required for import in `app/actions/order.ts`):

```typescript
export interface OrderItemPayload {
  orderId:       string;
  company:       string;
  firstName:     string;
  lastName:      string;
  email:         string;
  phone:         string;
  vatNumber?:    string;
  address1?:     string;
  address2?:     string;
  city?:         string;
  province?:     string;
  postalCode?:   string;
  country:       string;
  orderNotes?:   string;
  grossTotal:    number;
  nettTotal:     number;
  discountAmt:   number;
  discountCode?: string;
  partner?:      string;
  landingPage?:  string;
}
```

- [ ] **Step 3: Add `createOrderItem` and `createOrderSubitem` public functions**

At the bottom of `lib/monday.ts`, after `createAssessmentLead`, add:

```typescript
/**
 * Creates a parent order item on the "Website - Solution Requests FULL" board.
 * Returns { skipped: true } when MONDAY_ORDERS_BOARD_ID is not configured.
 */
export async function createOrderItem(
  payload: OrderItemPayload,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_ORDERS_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const today = new Date();

  const columns: ColumnValueMap = {
    [ORDER_COLS.orderStatus]:    colStatus('New Order'),
    [ORDER_COLS.orderId]:        payload.orderId,
    [ORDER_COLS.orderDate]:      colDate(today),
    [ORDER_COLS.grossValue]:     String(payload.grossTotal.toFixed(2)),
    [ORDER_COLS.nettValue]:      String(payload.nettTotal.toFixed(2)),
    [ORDER_COLS.discountAmount]: String(payload.discountAmt.toFixed(2)),
    [ORDER_COLS.contactPerson]:  `${payload.firstName} ${payload.lastName}`,
    [ORDER_COLS.firstName]:      payload.firstName,
    [ORDER_COLS.lastName]:       payload.lastName,
    [ORDER_COLS.email]:          colEmail(payload.email),
    [ORDER_COLS.phone]:          payload.phone,
    [ORDER_COLS.country]:        payload.country,
    ...(payload.vatNumber   && { [ORDER_COLS.vatNumber]:   payload.vatNumber }),
    ...(payload.address1    && { [ORDER_COLS.address1]:    payload.address1  }),
    ...(payload.address2    && { [ORDER_COLS.address2]:    payload.address2  }),
    ...(payload.city        && { [ORDER_COLS.city]:        payload.city      }),
    ...(payload.province    && { [ORDER_COLS.province]:    payload.province  }),
    ...(payload.postalCode  && { [ORDER_COLS.postCode]:    payload.postalCode }),
    ...(payload.orderNotes  && { [ORDER_COLS.orderNotes]:  colLongText(payload.orderNotes) }),
    ...(payload.discountCode && { [ORDER_COLS.voucherCode]: payload.discountCode }),
    ...(payload.partner     && { [ORDER_COLS.partner]:     payload.partner   }),
    ...(payload.landingPage && { [ORDER_COLS.landingPage]: payload.landingPage }),
  };

  return createItem(
    boardId,
    `${payload.company} — ${payload.firstName} ${payload.lastName}`,
    columns,
  );
}

/**
 * Creates a subitem under a parent order item.
 * One call per cart line item. Failure is non-critical — log and continue.
 */
export async function createOrderSubitem(
  parentItemId: string,
  orderId:      string,
  line: {
    name:         string;
    product_code: string;
    unit_price:   number;
    quantity:     number;
    line_total:   number;
  },
): Promise<MondayResult> {
  const columns: ColumnValueMap = {
    [SUBITEM_COLS.productCode]: line.product_code,
    [SUBITEM_COLS.unitPrice]:   String(line.unit_price.toFixed(2)),
    [SUBITEM_COLS.quantity]:    String(line.quantity),
    [SUBITEM_COLS.lineTotal]:   String(line.line_total.toFixed(2)),
    [SUBITEM_COLS.orderId]:     orderId,
  };

  const result = await mondayGraphQL<{ create_subitem: { id: string; name: string } }>(
    CREATE_SUBITEM_MUTATION,
    {
      parentItemId,
      itemName:     line.name,
      columnValues: JSON.stringify(columns),
    },
  );

  if (result.errors?.length) {
    const msg = result.errors.map(e => e.message).join('; ');
    return { success: false, error: msg };
  }

  if (!result.data?.create_subitem?.id) {
    return { success: false, error: 'No subitem ID returned from monday.com.' };
  }

  return { success: true, itemId: result.data.create_subitem.id };
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/monday.ts
git commit -m "feat: add Monday.com order item and subitem mutations (board 5094739911)"
```

---

## Task 4: Partner attribution catch-all route

**Files:**
- Create: `app/[partner]/route.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p "app/[partner]"
```

Create `app/[partner]/route.ts`:

```typescript
/**
 * Partner attribution catch-all.
 *
 * Any single-segment URL that doesn't match an explicit Next.js page
 * (e.g. /nedbank, /fnb, /absa) lands here. We set a 30-day HttpOnly
 * attribution cookie and redirect to /pos.
 *
 * Next.js resolves static/explicit routes first — this only fires for
 * paths that have no matching page.tsx or layout.tsx.
 */

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME    = 'partner_attribution';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> },
): Promise<NextResponse> {
  const { partner } = await params;

  // Sanitise: only allow lowercase alphanumeric + hyphens to prevent injection
  const slug = partner.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const attribution = JSON.stringify({
    handle:      slug,
    landingPage: `/${slug}`,
    capturedAt:  new Date().toISOString(),
  });

  const response = NextResponse.redirect(new URL('/pos', request.url));

  response.cookies.set(COOKIE_NAME, attribution, {
    maxAge:   COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
  });

  return response;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server (`npm run dev`), then navigate to `http://localhost:3000/nedbank`.

Verify:
- Browser redirects to `/pos`
- Dev tools → Application → Cookies: `partner_attribution` is set with value `{"handle":"nedbank","landingPage":"/nedbank","capturedAt":"..."}`
- Cookie is HttpOnly (cannot be read from console)

- [ ] **Step 4: Commit**

```bash
git add "app/[partner]/route.ts"
git commit -m "feat: partner attribution catch-all route — sets cookie and redirects to /pos"
```

---

## Task 5: Middleware — add `/checkout` auth guard

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Add the `/checkout` guard block**

Open `middleware.ts`. After the `/portal` guard block (around line 66), add:

```typescript
  // ── /checkout — requires auth ─────────────────────────────────────────────
  if (pathname.startsWith('/checkout')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }
```

- [ ] **Step 2: Update the matcher**

At the bottom of `middleware.ts`, replace the existing `config` export with:

```typescript
export const config = {
  matcher: [
    '/billing',
    '/billing/:path*',
    '/portal',
    '/portal/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
};
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual smoke test**

With dev server running, open a private/incognito window and navigate to `http://localhost:3000/checkout`.

Expected: redirected to `/sign-in?redirect=/checkout`.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts
git commit -m "feat: add /checkout to auth-protected middleware matcher"
```

---

## Task 6: `processOrder` server action

**Files:**
- Create: `app/actions/order.ts`

- [ ] **Step 1: Create the file**

Create `app/actions/order.ts` with this exact content:

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/actions/order.ts
git commit -m "feat: processOrder server action — Supabase + Monday.com + Paystack"
```

---

## Task 7: Checkout page

**Files:**
- Create: `app/checkout/layout.tsx`
- Create: `app/checkout/page.tsx`

- [ ] **Step 1: Install React Hook Form**

```bash
npm install react-hook-form
```

Expected output: `added 1 package` (or similar). Confirm `react-hook-form` appears in `package.json` dependencies.

- [ ] **Step 2: Create the layout**

Create `app/checkout/layout.tsx`:

```typescript
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Checkout — Montana Data Company',
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-montana-bg pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the checkout page**

Create `app/checkout/page.tsx`:

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter }                        from 'next/navigation';
import { useForm }                          from 'react-hook-form';
import { GlassCard }                        from '@/components/ui/glass-card';
import { AnimatedButton }                   from '@/components/ui/animated-button';
import { createBrowserClient }              from '@/lib/supabase/browser';
import { processOrder }                     from '@/app/actions/order';
import type { OrderFormData }               from '@/app/actions/order';
import type { CartLineItem }               from '@/app/api/subscribe/route';
import { AlertCircle, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';

// ─── Cart helpers ─────────────────────────────────────────────────────────────

function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style:    'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Form field component ─────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label:     string;
  error?:    string;
  required?: boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-white/30 ' +
  'px-3 py-2.5 text-sm rounded focus:outline-none focus:border-blue-400/60 ' +
  'focus:bg-white/8 transition-colors disabled:opacity-50';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router                = useRouter();
  const [cart, setCart]       = useState<CartLineItem[]>([]);
  const [userEmail, setEmail] = useState<string>('');
  const [cartReady, setReady] = useState(false);
  const [submitting, setSub]  = useState(false);
  const [serverError, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>();

  // Load cart from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('mdc_cart');
    if (!raw) {
      router.replace('/pos?error=empty_cart');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CartLineItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace('/pos?error=empty_cart');
        return;
      }
      setCart(parsed);
      setReady(true);
    } catch {
      router.replace('/pos?error=empty_cart');
    }
  }, [router]);

  // Pre-fill email from authenticated user
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        setValue('email', user.email);
      }
    });
  }, [setValue]);

  // Totals
  const grossTotal  = cart.reduce((s, l) => s + l.line_total, 0);

  const onSubmit = useCallback(async (data: OrderFormData) => {
    setSub(true);
    setErr(null);

    const result = await processOrder(data, cart);

    if (!result.success || !result.authorization_url) {
      setErr(result.error ?? 'Something went wrong. Please try again.');
      setSub(false);
      return;
    }

    sessionStorage.removeItem('mdc_cart');
    window.location.href = result.authorization_url;
  }, [cart]);

  if (!cartReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Left: Form ──────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-2 flex flex-col gap-6"
      >
        <h1 className="text-2xl font-semibold text-white">Complete your order</h1>

        {/* Contact Details */}
        <GlassCard className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required error={errors.firstName?.message}>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className={inputClass}
                placeholder="Sean"
              />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message}>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className={inputClass}
                placeholder="Kiley"
              />
            </Field>
          </div>
          <Field label="Email Address">
            <input
              type="hidden"
              {...register('email', { required: true })}
            />
            <div className={`${inputClass} opacity-60 cursor-not-allowed`}>
              {userEmail || 'Loading…'}
            </div>
          </Field>
          <Field label="Phone Number" required error={errors.phone?.message}>
            <input
              {...register('phone', { required: 'Phone number is required', minLength: { value: 7, message: 'Enter a valid phone number' } })}
              className={inputClass}
              placeholder="+27 82 000 0000"
              type="tel"
            />
          </Field>
        </GlassCard>

        {/* Company & Tax */}
        <GlassCard className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Company & Tax</h2>
          <Field label="Company Name" required error={errors.company?.message}>
            <input
              {...register('company', { required: 'Company name is required' })}
              className={inputClass}
              placeholder="Acme Corp (Pty) Ltd"
            />
          </Field>
          <Field label="VAT Number" error={errors.vatNumber?.message}>
            <input
              {...register('vatNumber')}
              className={inputClass}
              placeholder="4680123456 (optional)"
            />
          </Field>
        </GlassCard>

        {/* Billing Address */}
        <GlassCard className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Billing Address</h2>
          <Field label="Street Address" required error={errors.address1?.message}>
            <input
              {...register('address1', { required: 'Street address is required' })}
              className={inputClass}
              placeholder="123 Main Street"
            />
          </Field>
          <Field label="Street Address Line 2" error={errors.address2?.message}>
            <input
              {...register('address2')}
              className={inputClass}
              placeholder="Suite 4, Building B (optional)"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City / Town" required error={errors.city?.message}>
              <input
                {...register('city', { required: 'City is required' })}
                className={inputClass}
                placeholder="Johannesburg"
              />
            </Field>
            <Field label="Province" required error={errors.province?.message}>
              <select
                {...register('province', { required: 'Province is required' })}
                className={inputClass}
              >
                <option value="">Select province…</option>
                {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
                  'Free State','Limpopo','Mpumalanga','North West','Northern Cape'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Postal Code" required error={errors.postalCode?.message}>
              <input
                {...register('postalCode', { required: 'Postal code is required', minLength: { value: 4, message: 'Enter a valid postal code' } })}
                className={inputClass}
                placeholder="2196"
              />
            </Field>
            <Field label="Country">
              <input
                {...register('country')}
                className={inputClass}
                defaultValue="South Africa"
              />
            </Field>
          </div>
        </GlassCard>

        {/* Notes & Discount */}
        <GlassCard className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Additional Details</h2>
          <Field label="Discount / Voucher Code" error={errors.discountCode?.message}>
            <input
              {...register('discountCode')}
              className={inputClass}
              placeholder="PARTNER15 (if applicable)"
            />
          </Field>
          <Field label="Order Notes" error={errors.orderNotes?.message}>
            <textarea
              {...register('orderNotes')}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Any special requirements or provisioning notes…"
            />
          </Field>
        </GlassCard>

        {/* Error */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 border border-red-400/20 bg-red-400/5 rounded">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <AnimatedButton
          type="submit"
          disabled={submitting}
          className="w-full py-3"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Proceed to Payment
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </AnimatedButton>
      </form>

      {/* ── Right: Order Summary ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <GlassCard className="p-6 flex flex-col gap-4 sticky top-28">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Order Summary
          </h2>

          <div className="flex flex-col gap-3">
            {cart.map((line, i) => (
              <div key={i} className="flex flex-col gap-0.5 pb-3 border-b border-white/8 last:border-0 last:pb-0">
                <p className="text-sm text-white font-medium leading-tight">{line.name}</p>
                <p className="text-xs text-white/50">
                  {formatZAR(line.unit_price)} × {line.quantity}
                </p>
                <p className="text-sm text-white/80 font-medium">{formatZAR(line.line_total)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-sm text-white/60">Total (excl. VAT)</span>
            <span className="text-lg font-semibold text-white">{formatZAR(grossTotal)}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
            Secure payment via Paystack. You will be redirected after submitting.
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual smoke test**

With dev server running and a logged-in user:
1. Navigate to `/pos`, add at least one cloud product to the cart.
2. Temporarily (for testing) call `sessionStorage.setItem('mdc_cart', JSON.stringify([{product_code:"DMS50M2M",name:"Test",unit:"user",unit_price:99,quantity:1,line_total:99,service_id:"druva-m365",plan_id:"50gb-standard-monthly"}]))` in the browser console, then navigate to `/checkout`.
3. Verify the order summary shows the test item.
4. Verify the email field is pre-filled and read-only.
5. Fill in all required fields and submit.
6. Verify redirect to Paystack (or an error if Paystack keys not configured in dev).
7. Check Supabase `purchases` table — a row should exist.
8. Check Monday.com board 5094739911 — a parent item + subitems should appear (if `MONDAY_ORDERS_BOARD_ID` is set).

- [ ] **Step 6: Commit**

```bash
git add app/checkout/layout.tsx app/checkout/page.tsx package.json package-lock.json
git commit -m "feat: checkout page with React Hook Form, order summary, and processOrder wiring"
```

---

## Task 8: POS page — wire "Proceed to Checkout"

**Files:**
- Modify: `app/pos/page.tsx`

- [ ] **Step 1: Add `CartLineItem` import**

Open `app/pos/page.tsx`. At the top of the file, add this import after the existing imports:

```typescript
import type { CartLineItem } from '@/app/api/subscribe/route';
```

- [ ] **Step 2: Replace the `handleCheckout` body**

Find the `handleCheckout` function (lines 873–929). Replace the entire function body with:

```typescript
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // If not logged in: save cart state and redirect to sign-in → /checkout
    if (!user) {
      sessionStorage.setItem('pos_cart_state', JSON.stringify({
        configs,
        cartIds: Array.from(cartIds),
        discountCode,
        userEmails,
      }));
      window.location.href = `/sign-in?redirect=${encodeURIComponent('/checkout')}`;
      return;
    }

    // Convert CartItem[] → CartLineItem[] and persist to sessionStorage
    const lineItems: CartLineItem[] = cartItems.map(item => {
      const entry = getProductEntry(item.serviceId, item.planId);
      return {
        product_code: entry?.product_code ?? item.serviceId,
        name:         item.label,
        unit:         entry?.unit ?? 'user',
        unit_price:   item.unitPrice,
        quantity:     item.quantity,
        line_total:   item.lineTotal,
        service_id:   item.serviceId,
        plan_id:      item.planId,
      };
    });

    sessionStorage.setItem('mdc_cart', JSON.stringify(lineItems));
    router.push('/checkout');
  };
```

Note: `router` is already available in the component via `useRouter()`. If it is not imported, add `const router = useRouter();` alongside the other state declarations, and ensure `useRouter` is imported from `'next/navigation'` (it already is based on the existing imports).

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: End-to-end manual test**

With dev server running and a logged-in user:
1. Navigate to `http://localhost:3000/pos`.
2. Add one or more cloud products to the cart using the configurator.
3. Click the checkout button in the cart panel.
4. Verify `sessionStorage.getItem('mdc_cart')` contains the serialised line items (check in DevTools → Application → Session Storage).
5. Verify you are redirected to `/checkout`.
6. Verify the order summary on the right shows the correct items and totals.
7. Complete the form and submit — verify Paystack redirect (or error in dev without live keys).

- [ ] **Step 5: Add `MONDAY_ORDERS_BOARD_ID` to `.env.example`**

Open `.env.example` (or `.env.local` for dev) and add:

```bash
# Monday.com Orders Board (Website - Solution Requests FULL)
MONDAY_ORDERS_BOARD_ID=5094739911
```

- [ ] **Step 6: Commit**

```bash
git add app/pos/page.tsx .env.example
git commit -m "feat: POS checkout button serialises cart to sessionStorage and navigates to /checkout"
```

---

## Final Verification Checklist

Before considering this feature complete, verify each of the following manually:

- [ ] `GET /nedbank` → cookie `partner_attribution` set → redirect to `/pos`
- [ ] `GET /fnb` → same (any partner slug works)
- [ ] `GET /checkout` (logged out) → redirect to `/sign-in?redirect=/checkout`
- [ ] POS cart → Proceed to Checkout → `sessionStorage.mdc_cart` populated → `/checkout` loaded
- [ ] Checkout form: required field validation shows inline errors on empty submit
- [ ] Checkout form: email is pre-filled from Supabase user, not editable
- [ ] Checkout submit: `purchases` table row created in Supabase
- [ ] Checkout submit: Monday.com board 5094739911 shows parent item with correct columns
- [ ] Monday.com: each cart line appears as a subitem with product code, price, qty, line total, order ID
- [ ] Checkout submit: browser redirects to Paystack
- [ ] `sessionStorage.mdc_cart` cleared after successful redirect
- [ ] Partner column on Monday.com item populated if `/nedbank` was visited before checkout
