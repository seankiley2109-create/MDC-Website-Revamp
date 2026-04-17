# Montana Data Company — Website & Subscription Platform

Next.js 15 App Router site with lead generation, POPIA assessment tools, a "Build Your Solution" configurator, Supabase Auth, and Paystack subscription billing.

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local (see sections below)

# 3. Start the dev server (always runs on port 3000)
npm run dev
```

---

## Required Supabase setup

### 1. Create a project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the **Project URL** and **anon key** from Project Settings → API into `.env.local`
3. Copy the **service_role key** (never expose this to the browser) into `.env.local`

### 2. Run the database migration
Run the SQL directly in the Supabase SQL editor:

```
supabase/migrations/001_init.sql
```

This creates:
- `profiles` table with RLS policies
- A database trigger that auto-creates a profile row when a user signs up via `auth.users`

### 3. Generate TypeScript types (optional, recommended after schema changes)

```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
```

### 4. Email confirmation
Supabase Dashboard → Authentication → Email Templates.
By default Supabase sends a confirmation link — users must click it before signing in.

---

## Required Paystack setup

### 1. Create an account
Register at [paystack.com](https://paystack.com) and complete business verification.

### 2. Get API keys
Dashboard → Settings → API Keys & Webhooks:
- Copy **Public Key** → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- Copy **Secret Key** → `PAYSTACK_SECRET_KEY`

### 3. Create subscription plans
Dashboard → Products → Plans → New Plan:
- Create a **Basic** plan at R 299/month
- Create a **Pro** plan at R 799/month

Copy the resulting `plan_code` values (format: `PLN_xxxx`) into `app/subscribe/page.tsx`:
```typescript
const PLANS = [
  { plan_code: 'PLN_YOUR_BASIC_CODE', ... },
  { plan_code: 'PLN_YOUR_PRO_CODE',   ... },
]
```

### 4. Configure the webhook
Dashboard → Settings → API Keys & Webhooks → Add New Webhook:
- URL: `https://montanadc.com/api/webhooks/paystack`
- Events to enable:
  - `charge.success`
  - `subscription.disable`
  - `invoice.payment_failed`
  - `charge.dispute.create`

The handler verifies the `x-paystack-signature` header using HMAC SHA-512 before processing.

---

## Sage Business Cloud integration

The webhook handler calls Sage after every successful charge to record a sales invoice.

### Setup
1. In Sage Business Cloud → Settings → API, generate an API key
2. Copy it to `SAGE_API_KEY` in `.env.local`
3. Copy your company/site ID to `SAGE_SITE_ID`

### How it works
On `charge.success`:
1. Supabase profile is updated to `plan_status = 'active'`
2. A POST is sent to `https://api.sageone.com/accounts/v3/invoices` with the customer email, ZAR amount, and Paystack reference

**Note:** Sage failures are non-blocking — if the call fails, the webhook returns HTTP 200 and Supabase is still updated. Check server logs for Sage errors.

---

## Auth flow

| Route | Protection |
|-------|------------|
| `/sign-in` | Public |
| `/sign-up` | Public |
| `/billing` | Requires Supabase Auth session |
| `/downloads/*` | Requires session + `plan_status = 'active'` |
| `/subscribe` | Public (unauthenticated users are redirected to sign-in at checkout) |

Middleware runs only on `/billing` and `/downloads`. See `middleware.ts`.

---

## Subscription flow

```
User → /subscribe → selects plan
  → POST /api/subscribe
    → Paystack customer created/retrieved
    → Paystack transaction initialized
    → Returns authorization_url
  → Browser redirects to Paystack hosted checkout
  → User pays
  → Paystack redirects to /api/subscribe/callback?reference=xxx
    → Reference verified via Paystack API
    → On success → redirect to /downloads
    → On failure → redirect to /subscribe?error=payment_failed
  → Paystack fires charge.success webhook → /api/webhooks/paystack
    → Profile updated: plan_status = 'active'
    → Payment recorded in Sage
```

---

## Environment variables reference

| Variable | Scope | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Server | Monty chatbot (Google AI) |
| `RESEND_API_KEY` | Server | Transactional email |
| `APP_URL` | Server | Public base URL (used in callback URLs) |
| `MONDAY_API_KEY` | Server | monday.com CRM integration |
| `MONDAY_CONTACT_BOARD_ID` | Server | monday.com "Website Leads" board |
| `MONDAY_POS_BOARD_ID` | Server | monday.com "Solution Requests" board |
| `MONDAY_ASSESSMENT_BOARD_ID` | Server | monday.com "Assessment Leads" board |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key (bypasses RLS) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Public | Paystack public key |
| `PAYSTACK_SECRET_KEY` | Server | Paystack secret key |
| `SAGE_API_KEY` | Server | Sage Business Cloud API key |
| `SAGE_SITE_ID` | Server | Sage company/site ID |
