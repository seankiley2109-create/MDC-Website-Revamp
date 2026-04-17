# Referral Capture, Checkout Flow & Monday.com Order Sync — Design Spec

**Date:** 2026-04-16  
**Status:** Approved  
**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase, Monday.com GraphQL API

---

## 1. Overview

Three independent subsystems wired into a single commerce flow:

1. **Referral Capture** — Partner URLs like `/nedbank` silently set an attribution cookie and redirect to `/pos`.
2. **Checkout Page** — An auth-gated `/checkout` route sits between the POS configurator and Paystack, capturing contact, billing address, and VAT details.
3. **Monday.com Order Sync** — A `processOrder` server action creates a parent item (order) and subitems (line items) on board `5094739911` and writes the purchase record to Supabase.

---

## 2. Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Cart persistence | sessionStorage + URL signal | No new tables; matches existing subscribe flow; fast to build |
| Partner attribution | Dynamic catch-all route `app/[partner]/route.ts` | Self-contained; Next.js resolves explicit routes first so no conflicts; new partners need zero config |
| Supabase storage | New `purchases` table | Clean separation from `profiles`; queryable order ledger; `profiles` stays focused |
| Checkout auth | Auth-required | Matches existing `/billing` pattern; `user_id` always present on purchase row |
| Monday.com failures | Non-critical (logged, not blocking) | Same resilience model as assessment + contact flows |
| Paystack initialisation | Reuse `/api/subscribe` logic inline in server action | DRY; avoids a second HTTP round-trip to our own API |

---

## 3. File Structure

```
middleware.ts                              # +/checkout added to auth matcher
app/
  [partner]/
    route.ts                               # Partner attribution GET handler (NEW)
  checkout/
    page.tsx                               # Auth-gated checkout form (NEW)
    layout.tsx                             # Minimal layout wrapper (NEW)
  actions/
    assessment.ts                          # (existing — unchanged)
    order.ts                               # processOrder server action (NEW)
lib/
  monday.ts                                # +createOrderItem, +createOrderSubitem
  purchases.ts                             # Supabase insert/update helpers (NEW)
supabase/
  migrations/
    003_purchases.sql                      # purchases table + RLS (NEW)
```

---

## 4. Referral Capture System

### Route: `app/[partner]/route.ts`

- Handles `GET /[any-single-segment]` requests not matched by an explicit page.
- Next.js resolves static routes first (`/about`, `/pos`, `/checkout`, etc.), so this only fires for unknown paths — i.e., partner slugs.
- Sets a `partner_attribution` cookie (HttpOnly, SameSite=Lax, 30-day expiry).
- Redirects `302` to `/pos`.
- Unknown or malformed slugs still redirect to `/pos` — attribution is best-effort.

**Cookie payload:**
```json
{
  "handle": "nedbank",
  "landingPage": "/nedbank",
  "capturedAt": "2026-04-16T10:00:00.000Z"
}
```

**Cookie name:** `partner_attribution`  
**Expiry:** 30 days (standard attribution window)  
**Security:** HttpOnly, SameSite=Lax, Secure in production

### Middleware update

Add `/checkout` to the existing auth matcher so unauthenticated users are redirected to `/sign-in?redirect=/checkout`. No other middleware changes needed.

```ts
export const config = {
  matcher: [
    '/billing', '/billing/:path*',
    '/portal',  '/portal/:path*',
    '/checkout',                    // NEW
  ],
};
```

---

## 5. Cart → Checkout Transport

### POS page changes

When the user clicks "Proceed to Checkout":
1. Serialise the cart array to JSON and write to `sessionStorage` under key `mdc_cart`.
2. Navigate to `/checkout` using `router.push('/checkout')`.

```ts
sessionStorage.setItem('mdc_cart', JSON.stringify(cart));
router.push('/checkout');
```

### Checkout page

On mount, reads `sessionStorage.getItem('mdc_cart')` and parses it. If missing or empty, redirects back to `/pos` with an error toast. Cart is displayed as a read-only order summary alongside the form.

After a successful `processOrder` call returns `authorization_url`:
- `sessionStorage.removeItem('mdc_cart')` (clear cart)
- `window.location.href = authorization_url` (navigate to Paystack)

---

## 6. Checkout Form

**Auth:** Protected by middleware — user is guaranteed to be authenticated.  
**Library:** React Hook Form (to be added as a dependency).  
**Styling:** Existing glassmorphism aesthetic — `GlassCard`, `AnimatedButton`, Tailwind utility classes.

### Form sections

**Section A — Contact Details**
- First Name `*`
- Last Name `*`
- Email (pre-filled from `user.email`, read-only)
- Phone `*`

**Section B — Company & Tax**
- Company Name `*`
- VAT Number (optional)

**Section C — Billing Address**
- Street Address Line 1 `*`
- Street Address Line 2 (optional)
- City / Town `*`
- Province `*`
- Postal Code `*`
- Country (default: South Africa)

**Section D — Order Notes**
- Free-text textarea (optional)

**Section E — Order Summary (read-only)**
- Cart line items from sessionStorage
- Gross total, discount (if any), nett total

### Validation (Zod schema)
All `*` fields are required strings with minimum length 1. Email validated via `z.string().email()`. Phone validated with a loose pattern accepting SA formats.

---

## 7. `processOrder` Server Action

**File:** `app/actions/order.ts`

### Step-by-step

```
processOrder(formData, cart)
  │
  ├─ 1. Validate formData with Zod
  ├─ 2. Get authenticated user (createServerClient → supabase.auth.getUser())
  ├─ 3. Read partner_attribution cookie via cookies() from next/headers (if present)
  ├─ 4. Generate order_id → "MDC-YYYYMMDD-XXXX" (date + 4-char random alphanum)
  ├─ 5. Calculate gross / nett / discount from cart
  │
  ├─ 6. INSERT into purchases (monday_item_id: null, paystack_reference: null)
  │       → on failure: return { success: false, error }
  │
  ├─ 7. [Non-critical] Monday.com parent item
  │       create_item on board 5094739911
  │       → capture parentItemId
  │
  ├─ 8. [Non-critical] Monday.com subitems
  │       for each cart line: create_subitem(parentItemId, ...)
  │
  ├─ 9. [Non-critical] UPDATE purchases SET monday_item_id = parentItemId
  │
  ├─ 10. Paystack: POST /transaction/initialize
  │        email, amount (kobo), currency ZAR, metadata.cart, metadata.order_id
  │        → on failure: return { success: false, error }
  │
  └─ 11. Return { success: true, authorization_url }
```

### Resilience model

| Step fails | Behaviour |
|---|---|
| Supabase INSERT | Hard stop — return error to user (purchase not recorded) |
| Monday.com parent | Log error, continue to Paystack |
| Monday.com subitems | Log error per subitem, continue |
| Paystack initialize | Hard stop — return error to user |

Monday.com is non-critical — the purchase record in Supabase and the Paystack transaction are the sources of truth. Monday sync failures are logged server-side.

---

## 8. Monday.com GraphQL Mutations

### Parent item

```graphql
mutation CreateOrderItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
  create_item(
    board_id: $boardId
    item_name: $itemName
    column_values: $columnValues
  ) {
    id
    name
  }
}
```

**`columnValues` shape (before `JSON.stringify`):**
```json
{
  "color_mkya1nwk":      { "label": "New Order" },
  "text_mkqp2zzd":       "MDC-20260416-K7X2",
  "date4":               { "date": "2026-04-16" },
  "text_mm03hex3":       "nedbank",
  "text_mm038w9m":       "/nedbank",
  "numeric_mm06g01q":    "1500.00",
  "numeric_mm06cmss":    "1350.00",
  "numeric_mkqp21qs":    "150.00",
  "text_mkqp15b1":       "PARTNER15",
  "text_mkqph4x3":       "Sean Kiley",
  "text_mkqf49rq":       "Sean",
  "text_mkqngb65":       "Kiley",
  "email_mkqfjdkw":      { "email": "sean@example.com", "text": "sean@example.com" },
  "text_mkxnzak5":       "+27 82 000 0000",
  "text_mkqf7yv9":       "4680123456",
  "text_mkqfrpy5":       "123 Main Street",
  "text_mkqfmyn5":       "Suite 4",
  "text_mkqf4q00":       "Johannesburg",
  "text_mkqfbvvy":       "2196",
  "text_mkqfk4sg":       "Gauteng",
  "text_mkqfjagt":       "South Africa",
  "long_text_mkqpyhk5":  { "text": "Please provision by end of month." }
}
```

**Critical JSON rules:**
- `numbers` columns → `String(value)` e.g. `"1500.00"` — never a JS number primitive
- `email` columns → `{ "email": "...", "text": "..." }` object
- `status` columns → `{ "label": "..." }` object
- `date` columns → `{ "date": "YYYY-MM-DD" }` object
- `long_text` columns → `{ "text": "..." }` object
- `text` columns → plain string
- The entire `columnValues` object is passed through `JSON.stringify()` before being sent as the GraphQL variable

### Subitem (one per cart line)

```graphql
mutation CreateOrderSubitem($parentItemId: ID!, $itemName: String!, $columnValues: JSON!) {
  create_subitem(
    parent_item_id: $parentItemId
    item_name: $itemName
    column_values: $columnValues
  ) {
    id
    name
  }
}
```

**`columnValues` shape per line item:**
```json
{
  "text_mkqfxt8c":   "DMS50M2M",
  "numeric_mm063z0t": "99.00",
  "numeric_mkqfngw6": "10",
  "numeric_mkqfjn0d": "990.00",
  "text_mm00beth":   "MDC-20260416-K7X2"
}
```

---

## 9. Supabase — `purchases` Table

```sql
create table public.purchases (
  id                  uuid          primary key default gen_random_uuid(),
  user_id             uuid          references auth.users(id) on delete set null,
  order_id            text          not null unique,
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
  cart                jsonb         not null,
  partner             text,
  landing_page        text,
  monday_item_id      text,
  paystack_reference  text,
  created_at          timestamptz   not null default now()
);

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_email_idx   on public.purchases(customer_email);
create index purchases_order_id_idx on public.purchases(order_id);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Service role has full access"
  on public.purchases for all
  using (true) with check (true);
```

### `lib/purchases.ts` helpers

- `createPurchase(data)` — service-role INSERT, returns `{ id, order_id }`
- `updatePurchaseMondayId(orderId, mondayItemId)` — service-role UPDATE after Monday sync
- `updatePurchasePaystackRef(orderId, reference)` — called by callback handler post-payment

---

## 10. Complete Column ID Reference

### Parent board (5094739911)

| Column | ID | Type |
|---|---|---|
| Order Status | `color_mkya1nwk` | status |
| Order ID | `text_mkqp2zzd` | text |
| Order Date | `date4` | date |
| Partner | `text_mm03hex3` | text |
| Landing Page | `text_mm038w9m` | text |
| Gross Order Value | `numeric_mm06g01q` | numbers |
| Nett Order Value | `numeric_mm06cmss` | numbers |
| Discount Amount | `numeric_mkqp21qs` | numbers |
| Voucher / Coupon | `text_mkqp15b1` | text |
| Contact Person | `text_mkqph4x3` | text |
| First Name | `text_mkqf49rq` | text |
| Last Name | `text_mkqngb65` | text |
| Contact Email | `email_mkqfjdkw` | email |
| Contact Phone | `text_mkxnzak5` | text |
| VAT # | `text_mkqf7yv9` | text |
| Street Address 1 | `text_mkqfrpy5` | text |
| Street Address 2 | `text_mkqfmyn5` | text |
| City / Town | `text_mkqf4q00` | text |
| Post Code | `text_mkqfbvvy` | text |
| Province | `text_mkqfk4sg` | text |
| Country | `text_mkqfjagt` | text |
| Order Notes | `long_text_mkqpyhk5` | long_text |

### Subitem board (auto-generated)

| Column | ID | Type |
|---|---|---|
| Product Code | `text_mkqfxt8c` | text |
| Unit Price | `numeric_mm063z0t` | numbers |
| Quantity | `numeric_mkqfngw6` | numbers |
| Line Total | `numeric_mkqfjn0d` | numbers |
| Order ID | `text_mm00beth` | text |

---

## 11. Dependencies & Environment Variables

### New npm dependency
```bash
npm install react-hook-form
```

### Environment variables
```bash
# Already present
MONDAY_API_KEY=...
PAYSTACK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_URL=...

# New
MONDAY_ORDERS_BOARD_ID=5094739911
```

---

## 12. Out of Scope

- Multi-device cart recovery (sessionStorage is tab-scoped by design)
- Guest checkout (requires reworking Paystack auth flow)
- Partner-specific landing page content / branding
- Paystack webhook updating `purchases.paystack_reference` (the existing callback handler covers this via `profiles` — a future task can extend it to also update `purchases`)
- Sage invoice creation for the new checkout path (existing webhook handles this already via `metadata.cart`)
