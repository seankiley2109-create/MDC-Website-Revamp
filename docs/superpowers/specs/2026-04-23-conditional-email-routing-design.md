# Conditional Email Routing — Support & Checkout

**Date:** 2026-04-23
**Status:** Approved

## Overview

Implement conditional email routing for two workflows: the authenticated Support Ticket form and the Paystack checkout completion (callback). Routing is determined by submission source and, for support tickets, by category.

## Routing Table

| Trigger Source | Condition | Staff Recipient(s) | User |
|---|---|---|---|
| Support Form | `category === 'technical'` | support@montanadc.com | Auto-responder |
| Support Form | All other categories | sales@montanadc.com | Auto-responder |
| Checkout (Paystack callback) | Any successful payment | sales@montanadc.com + support@montanadc.com | Purchase confirmation |

## Architecture

### Files Changed

| File | Change |
|---|---|
| `lib/email.ts` | Add `SALES_EMAIL`; add `resolveStaffRecipient`; add two HTML builder pairs; add two public send functions |
| `app/api/support/route.ts` | Call `sendSupportTicketEmails` after Monday.com step |
| `app/api/subscribe/callback/route.ts` | Extend profile `.select()` to include `full_name, company_name`; call `sendCheckoutConfirmationEmails` after Supabase write |

### Files Not Changed

- `app/api/webhooks/paystack/route.ts` — email fires from callback only (guaranteed synchronous path); webhook is not touched to avoid duplicate sends
- `app/api/pos/route.ts` — POS configurator is a quote flow, not a purchase; its existing email behavior is unchanged

## lib/email.ts Changes

### New Constants

```ts
export const SALES_EMAIL = 'sales@montanadc.com';
```

### New Helper

```ts
function resolveStaffRecipient(category: SupportCategory): string {
  return category === 'technical' ? SUPPORT_EMAIL : SALES_EMAIL;
}
```

### New Payload Types

```ts
export type SupportCategory = 'technical' | 'billing' | 'compliance' | 'general';

export interface SupportTicketPayload {
  name:     string;
  email:    string;
  company:  string;
  subject:  string;
  category: SupportCategory;
  priority: 'low' | 'normal' | 'high' | 'critical';
  message:  string;
}

export interface CheckoutPayload {
  customer:     { name: string; email: string; company: string };
  cart:         CartLineItem[];
  totalZAR:     number;
  contractTerm: 'monthly' | 'yearly';
  reference:    string;
}
```

### New HTML Builders

- `supportStaffHtml(p: SupportTicketPayload)` — staff notification; includes a highlighted POPIA warning banner for `compliance` category tickets noting the message may contain PII
- `supportAutoHtml(p: SupportTicketPayload)` — user auto-responder confirming receipt; does **not** echo the message body back (PII safety)
- `checkoutStaffHtml(p: CheckoutPayload)` — staff notification with cart line items and total
- `checkoutAutoHtml(p: CheckoutPayload)` — user purchase confirmation with cart summary and next-steps list

### New Public Send Functions

```ts
export async function sendSupportTicketEmails(p: SupportTicketPayload): Promise<EmailResult>
// Fires in parallel:
//   1. Staff notification → resolveStaffRecipient(p.category)
//   2. Auto-responder    → p.email

export async function sendCheckoutConfirmationEmails(p: CheckoutPayload): Promise<EmailResult>
// Fires in parallel:
//   1. Staff notification → sales@montanadc.com
//   2. Staff copy         → support@montanadc.com
//   3. Purchase confirmation → p.customer.email
```

## API Route Changes

### app/api/support/route.ts

After step 4 (Monday.com push), add:

```ts
const emailResult = await sendSupportTicketEmails(ticketPayload);
if (!emailResult.success) {
  console.error('[api/support] Email send failed:', emailResult.error);
}
```

Email failure is non-critical — the route still returns success so the user knows their ticket arrived.

### app/api/subscribe/callback/route.ts

1. Extend the existing profile select:
   ```ts
   .select('subscribed_services, subscribed_quantity, full_name, company_name')
   ```

2. After the Supabase write succeeds, build and send:
   ```ts
   const checkoutPayload: CheckoutPayload = {
     customer: {
       name:    existing?.full_name    ?? verifyData.customer.email,
       email:   verifyData.customer.email,
       company: existing?.company_name ?? 'Unknown Organisation',
     },
     cart:         verifyData.metadata?.cart?.filter(l => l.product_code !== 'DISCOUNT') ?? [],
     totalZAR:     verifyData.metadata?.total_zar ?? verifyData.amount / 100,
     contractTerm,
     reference,
   };
   const emailResult = await sendCheckoutConfirmationEmails(checkoutPayload);
   if (!emailResult.success) {
     console.error('[subscribe/callback] Checkout email failed:', emailResult.error);
   }
   ```

Email failure is non-critical — does not block the redirect to `/billing?welcome=1`.

## POPIA / PII Handling

For `compliance` category support tickets, the staff notification email includes a visible warning banner:

> ⚠️ This ticket may contain PII — handle in accordance with POPIA.

The message body is still displayed (staff need it to respond). The user auto-responder for all support categories deliberately omits the message body echo to avoid re-transmitting potentially sensitive content.

## Error Handling

All email sends are non-critical in both routes. Failures are logged with `console.error` and do not affect the HTTP response returned to the user. This matches the existing pattern used by `sendPOSEmails` and `sendAssessmentEmails`.

## Out of Scope

- POS configurator email routing (it's a quote flow, not a purchase)
- Paystack webhook email (callback is the canonical send point)
- Changes to the contact form or assessment email flows
