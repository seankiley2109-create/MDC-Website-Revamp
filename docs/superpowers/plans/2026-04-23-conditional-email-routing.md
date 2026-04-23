# Conditional Email Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conditional email routing so support tickets route to support@ or sales@ based on category, and Paystack checkout completions notify both sales@ and support@ plus send a purchase confirmation to the user.

**Architecture:** All routing logic lives in `lib/email.ts` alongside the existing send functions. Two new send functions (`sendSupportTicketEmails`, `sendCheckoutConfirmationEmails`) encapsulate routing and HTML generation. Route handlers call these functions as a non-critical fire-and-forget after their primary operations succeed.

**Tech Stack:** Next.js 15 App Router, TypeScript, Resend (`resend` npm package), Supabase service-role client, Zod (existing).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/email.ts` | Modify | Add `SALES_EMAIL`, `SupportCategory`, `SupportTicketPayload`, `CheckoutLineItem`, `CheckoutPayload`, `resolveStaffRecipient`, 4 HTML builders, 2 send functions |
| `app/api/support/route.ts` | Modify | Import + call `sendSupportTicketEmails` after Monday.com step |
| `app/api/subscribe/callback/route.ts` | Modify | Extend profile `.select()` to include `full_name, company_name`; build + call `sendCheckoutConfirmationEmails` after Supabase write |

---

## Task 1: Add constants, types, and routing helper to lib/email.ts

**Files:**
- Modify: `lib/email.ts`

- [ ] **Step 1: Add `SALES_EMAIL` constant**

In `lib/email.ts`, after line 9 (`export const SUPPORT_EMAIL = ...`), add:

```ts
export const SALES_EMAIL = 'sales@montanadc.com';
```

- [ ] **Step 2: Add new types after the existing interfaces (after the `EmailResult` interface, around line 66)**

```ts
// ---------------------------------------------------------------------------
// Support ticket types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Checkout confirmation types
// ---------------------------------------------------------------------------

export interface CheckoutLineItem {
  name:       string;
  quantity:   number;
  unit_price: number;
  line_total: number;
}

export interface CheckoutPayload {
  customer:     { name: string; email: string; company: string };
  cart:         CheckoutLineItem[];
  totalZAR:     number;
  contractTerm: 'monthly' | 'yearly';
  reference:    string;
}
```

- [ ] **Step 3: Add label maps and routing helper after the `riskColor` function (around line 185)**

```ts
// ---------------------------------------------------------------------------
// Support ticket label / colour maps
// ---------------------------------------------------------------------------

const categoryLabels: Record<SupportCategory, string> = {
  technical:  'Technical Issue',
  billing:    'Billing',
  compliance: 'Compliance & POPIA',
  general:    'General',
};

const priorityColors: Record<string, string> = {
  low:      'green',
  normal:   'pink',
  high:     'amber',
  critical: 'red',
};

// ---------------------------------------------------------------------------
// Staff recipient router
// ---------------------------------------------------------------------------

function resolveStaffRecipient(category: SupportCategory): string {
  return category === 'technical' ? SUPPORT_EMAIL : SALES_EMAIL;
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors related to the new types.

- [ ] **Step 5: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): add support ticket + checkout types and routing helper"
```

---

## Task 2: Add support ticket HTML builders

**Files:**
- Modify: `lib/email.ts`

Add both functions after the existing `assessmentAutoHtml` function and before the `// Public send functions` section.

- [ ] **Step 1: Add `supportStaffHtml`**

```ts
// ===========================================================================
// SUPPORT TICKET — Staff Notification
// ===========================================================================

function supportStaffHtml(p: SupportTicketPayload): string {
  const popiaBanner = p.category === 'compliance'
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:14px 20px;margin:0 0 24px;font-size:13px;color:#92400e;font-weight:600;">
        ⚠️ This ticket may contain PII — handle in accordance with POPIA.
      </div>`
    : '';

  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new support ticket has been submitted through the Montana Data Company portal.</p>

    ${popiaBanner}

    ${sectionHeading('Ticket Details')}
    ${dataTable(
      fieldRow('Name',     p.name) +
      fieldRow('Email',    `<a href="mailto:${p.email}" style="color:#f24567;">${p.email}</a>`) +
      fieldRow('Company',  p.company) +
      fieldRow('Subject',  p.subject) +
      fieldRow('Category', badge(categoryLabels[p.category], p.category === 'technical' ? 'pink' : 'amber')) +
      fieldRow('Priority', badge(p.priority.charAt(0).toUpperCase() + p.priority.slice(1), priorityColors[p.priority] ?? 'pink')) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Message')}
    <div style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;padding:16px 20px;font-size:14px;color:#3f3f46;line-height:1.7;margin:0 0 28px;white-space:pre-wrap;">${p.message}</div>

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Reply to ' + p.name, `mailto:${p.email}?subject=Re: ${encodeURIComponent(p.subject)}`)}</p>
  `;
  return shell(`Support Ticket: ${p.subject}`, body);
}
```

- [ ] **Step 2: Add `supportAutoHtml`**

```ts
// ===========================================================================
// SUPPORT TICKET — Auto-Responder
// ===========================================================================

function supportAutoHtml(p: SupportTicketPayload): string {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Thank you for contacting Montana Data Company. We have received your support ticket and will respond within <strong>one business day</strong>.</p>

    ${sectionHeading('Your Ticket')}
    ${dataTable(
      fieldRow('Subject',   p.subject) +
      fieldRow('Category',  categoryLabels[p.category]) +
      fieldRow('Priority',  p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">If your issue is urgent, please call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a>.</p>
  `;
  return shell('Support Ticket Received', body);
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): add support ticket HTML builders"
```

---

## Task 3: Add checkout confirmation HTML builders

**Files:**
- Modify: `lib/email.ts`

Add both functions immediately after `supportAutoHtml`.

- [ ] **Step 1: Add `checkoutStaffHtml`**

```ts
// ===========================================================================
// CHECKOUT — Staff Notification
// ===========================================================================

function checkoutStaffHtml(p: CheckoutPayload): string {
  const cartRows = p.cart
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.name}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:center;">${l.quantity}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.unit_price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.line_total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
    </tr>`)
    .join('');

  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new subscription purchase has been completed via Paystack.</p>

    ${sectionHeading('Customer Details')}
    ${dataTable(
      fieldRow('Name',          p.customer.name) +
      fieldRow('Email',         `<a href="mailto:${p.customer.email}" style="color:#f24567;">${p.customer.email}</a>`) +
      fieldRow('Company',       p.customer.company) +
      fieldRow('Contract Term', p.contractTerm === 'yearly' ? 'Annual' : 'Monthly') +
      fieldRow('Reference',     p.reference) +
      fieldRow('Submitted',     new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Purchased Services')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#f24567;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
      ${cartRows}
      <tr style="background:#f4f4f5;">
        <td colspan="3" style="padding:12px;font-size:13px;font-weight:700;color:#18181b;text-align:right;text-transform:uppercase;letter-spacing:1px;">Grand Total</td>
        <td style="padding:12px;font-size:15px;font-weight:700;color:#f24567;text-align:right;">R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Contact ' + p.customer.name, `mailto:${p.customer.email}?subject=Your Montana Data Company Purchase — ${p.reference}`)}</p>
  `;
  return shell('New Subscription Purchase', body);
}
```

- [ ] **Step 2: Add `checkoutAutoHtml`**

```ts
// ===========================================================================
// CHECKOUT — Auto-Responder
// ===========================================================================

function checkoutAutoHtml(p: CheckoutPayload): string {
  const cartRows = p.cart
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.name}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:center;">${l.quantity}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.line_total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
    </tr>`)
    .join('');

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.customer.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Your payment has been confirmed. Welcome to Montana Data Company — your services are now being provisioned.</p>

    ${sectionHeading('Your Purchase')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#18181b;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
      ${cartRows}
    </table>
    ${dataTable(
      fieldRow('Grand Total',    `R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`) +
      fieldRow('Billing Cycle',  p.contractTerm === 'yearly' ? 'Annual' : 'Monthly') +
      fieldRow('Reference',      p.reference)
    )}

    ${sectionHeading('What Happens Next')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${[
        'Our engineering team will provision your services within one business day.',
        'You will receive login credentials or onboarding instructions via email.',
        'A dedicated Montana Data engineer is available to assist with setup.',
      ].map((step, i) => `<tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;width:32px;">
          <div style="width:28px;height:28px;background:#f24567;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">${i + 1}</div>
        </td>
        <td style="padding:8px 0;font-size:14px;color:#3f3f46;vertical-align:top;line-height:1.6;">${step}</td>
      </tr>`).join('')}
    </table>

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">Questions? Call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a> or reply to this email.</p>
  `;
  return shell('Purchase Confirmed — Montana Data Company', body);
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): add checkout confirmation HTML builders"
```

---

## Task 4: Add public send functions to lib/email.ts

**Files:**
- Modify: `lib/email.ts`

Add both functions at the bottom of the file, after `sendAssessmentEmails`.

- [ ] **Step 1: Add `sendSupportTicketEmails`**

```ts
export async function sendSupportTicketEmails(p: SupportTicketPayload): Promise<EmailResult> {
  try {
    const staffRecipient = resolveStaffRecipient(p.category);
    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [staffRecipient],
        replyTo: p.email,
        subject: `[Support] ${categoryLabels[p.category]} — ${p.subject}`,
        html:    supportStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.email],
        replyTo: staffRecipient,
        subject: 'Support ticket received — Montana Data Company',
        html:    supportAutoHtml(p),
      }),
    ]);

    if (staff.error || auto.error) {
      console.error('[email] Support ticket email errors:', staff.error, auto.error);
      return { success: false, error: 'Failed to send one or more support emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendSupportTicketEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}
```

- [ ] **Step 2: Add `sendCheckoutConfirmationEmails`**

```ts
export async function sendCheckoutConfirmationEmails(p: CheckoutPayload): Promise<EmailResult> {
  try {
    const [toSales, toSupport, toUser] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SALES_EMAIL],
        replyTo: p.customer.email,
        subject: `[Purchase] ${p.customer.company} — R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} — ${p.reference}`,
        html:    checkoutStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SUPPORT_EMAIL],
        replyTo: p.customer.email,
        subject: `[Purchase] ${p.customer.company} — R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} — ${p.reference}`,
        html:    checkoutStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.customer.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'Your purchase is confirmed — Montana Data Company',
        html:    checkoutAutoHtml(p),
      }),
    ]);

    if (toSales.error || toSupport.error || toUser.error) {
      console.error('[email] Checkout email errors:', toSales.error, toSupport.error, toUser.error);
      return { success: false, error: 'Failed to send one or more checkout emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendCheckoutConfirmationEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}
```

- [ ] **Step 3: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): add sendSupportTicketEmails and sendCheckoutConfirmationEmails"
```

---

## Task 5: Wire up the support API route

**Files:**
- Modify: `app/api/support/route.ts`

- [ ] **Step 1: Add the import**

At the top of `app/api/support/route.ts`, add `sendSupportTicketEmails` and `SupportTicketPayload` to the existing `@/lib/email` import (or add a new import line if none exists):

```ts
import { sendSupportTicketEmails, type SupportTicketPayload } from '@/lib/email';
```

- [ ] **Step 2: Call `sendSupportTicketEmails` after the Monday.com step**

In the `POST` handler, after the `Promise.allSettled([createSupportTicket(ticketPayload)])` block (around the section currently ending with `console.log('[api/support] Ticket created:', ...)`), add:

```ts
// ── 5. Send routing email ──────────────────────────────────────────────────
const emailPayload: SupportTicketPayload = {
  name:     ticketPayload.name,
  email:    ticketPayload.email,
  company:  ticketPayload.company,
  subject,
  category,
  priority,
  message,
};

const emailResult = await sendSupportTicketEmails(emailPayload);
if (!emailResult.success) {
  console.error('[api/support] Email send failed:', emailResult.error);
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. Verify the `category` variable is typed as `SupportCategory` — it is, because Zod infers the enum type from `z.enum(['technical', 'billing', 'compliance', 'general'])` which matches `SupportCategory` exactly.

- [ ] **Step 4: Commit**

```bash
git add app/api/support/route.ts
git commit -m "feat(api/support): send conditional routing email on ticket submission"
```

---

## Task 6: Wire up the Paystack checkout callback

**Files:**
- Modify: `app/api/subscribe/callback/route.ts`

- [ ] **Step 1: Add the import**

At the top of `app/api/subscribe/callback/route.ts`, add:

```ts
import { sendCheckoutConfirmationEmails, type CheckoutPayload, type CheckoutLineItem } from '@/lib/email';
```

- [ ] **Step 2: Extend the profile select query**

Find the existing profile select (around the `'subscribed_services, subscribed_quantity'` select call) and extend it:

```ts
// Before:
const { data: existing } = await (supabase.from('profiles') as any)
  .select('subscribed_services, subscribed_quantity')
  .eq('id', userId)
  .single();

// After:
const { data: existing } = await (supabase.from('profiles') as any)
  .select('subscribed_services, subscribed_quantity, full_name, company_name')
  .eq('id', userId)
  .single();
```

- [ ] **Step 3: Update the `existing` type cast to include the new fields**

Find the two places where `existing` is cast and update them. The primary cast used to read `subscribed_services` is:

```ts
// Before:
const existingEntries = normaliseExisting(
  (existing as { subscribed_services?: unknown } | null)?.subscribed_services,
);

// After:
const existingProfile = existing as {
  subscribed_services?: unknown;
  full_name?:           string | null;
  company_name?:        string | null;
} | null;

const existingEntries = normaliseExisting(existingProfile?.subscribed_services);
```

- [ ] **Step 4: Add checkout email send after the Supabase write**

After the `console.log('[subscribe/callback] Profile updated for user: ...')` log line (inside the `if (userId)` block, after the Supabase `.update()` call), add:

```ts
// ── Send purchase confirmation email ────────────────────────────────────
const checkoutCart: CheckoutLineItem[] = (verifyData.metadata?.cart ?? [])
  .filter(l => l.product_code !== 'DISCOUNT')
  .map(l => ({
    name:       l.name,
    quantity:   l.quantity,
    unit_price: l.unit_price,
    line_total: l.line_total,
  }));

const checkoutPayload: CheckoutPayload = {
  customer: {
    name:    existingProfile?.full_name    ?? verifyData.customer.email,
    email:   verifyData.customer.email,
    company: existingProfile?.company_name ?? 'Unknown Organisation',
  },
  cart:         checkoutCart,
  totalZAR:     verifyData.metadata?.total_zar ?? verifyData.amount / 100,
  contractTerm,
  reference,
};

const emailResult = await sendCheckoutConfirmationEmails(checkoutPayload);
if (!emailResult.success) {
  console.error('[subscribe/callback] Checkout email failed:', emailResult.error);
}
```

- [ ] **Step 5: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors. Note: `verifyData.metadata?.cart` is typed as `CartLineItem[] | undefined` in the local `PaystackVerifyData` interface — confirm `CartLineItem` has `product_code`, `name`, `quantity`, `unit_price`, `line_total` fields (it does, per `app/api/subscribe/route.ts` line 78-98).

- [ ] **Step 6: Commit**

```bash
git add app/api/subscribe/callback/route.ts
git commit -m "feat(subscribe/callback): send checkout confirmation email on successful payment"
```

---

## Task 7: Smoke test and final lint pass

**Files:** None changed.

- [ ] **Step 1: Run full type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: clean output with no errors.

- [ ] **Step 2: Start the dev server and verify no runtime errors on load**

```bash
npm run dev
```

Expected: server starts on port 3000 with no compilation errors in the terminal.

- [ ] **Step 3: Verify routing table manually (dev server running)**

Using a REST client (curl, Postman, or browser devtools), POST to `/api/support` with a valid auth session cookie and each of the four category values. Confirm in server logs:

- `category: 'technical'` → log shows no email error + email `to: support@montanadc.com`
- `category: 'billing'`   → log shows no email error + email `to: sales@montanadc.com`
- `category: 'compliance'`→ log shows no email error + email `to: sales@montanadc.com`
- `category: 'general'`   → log shows no email error + email `to: sales@montanadc.com`

(In dev, Resend will reject sends unless the domain is verified — the non-critical error handling means the route still returns 200. Check logs for `[api/support] Email send failed:` vs silent success.)

- [ ] **Step 4: Final commit if any lint fixes were needed**

```bash
git add -p
git commit -m "chore: final lint fixes for email routing"
```

---

## Routing Summary (reference)

| Form | Category | Staff recipient |
|---|---|---|
| Support | `technical` | support@montanadc.com |
| Support | `billing` | sales@montanadc.com |
| Support | `compliance` | sales@montanadc.com |
| Support | `general` | sales@montanadc.com |
| Paystack checkout | any | sales@montanadc.com + support@montanadc.com |

User always receives a separate auto-responder in all cases.
