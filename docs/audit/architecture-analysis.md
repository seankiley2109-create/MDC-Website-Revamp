# Architecture Analysis — 2026-04-24

---

## What We Have

### Confirmed Stack (pinned versions from package.json)

- **Next.js** ^15.4.9, **React** ^19.2.1, **TypeScript** 5.9.3 (strict mode)
- **Tailwind CSS** 4.1.11 (v4, PostCSS pipeline via `@tailwindcss/postcss`)
- **Auth:** Supabase native auth (`@supabase/ssr` ^0.10.0 + `@supabase/supabase-js` ^2.102.0) — NOT Clerk (see Remove candidates)
- **Database:** Supabase (typed via generated `lib/supabase/types.ts` — `Database` type)
- **Email:** Resend ^6.10.0
- **AI:** Google Gemini `@google/genai` ^1.17.0 (powers `/api/chat`)
- **Animation:** motion ^12.23.24 (Framer Motion, transpiled via `next.config.ts`)
- **Forms:** react-hook-form ^7.72.1 + `@hookform/resolvers` ^5.2.1 + zod ^4.3.6
- **Observability:** `@vercel/speed-insights` ^2.0.0

### Auth Pattern (confirmed from `middleware.ts` + `lib/supabase/`)

- Supabase auth only. Custom `/sign-in` and `/sign-up` pages.
- `middleware.ts` calls `supabase.auth.getUser()` to protect `/billing`, `/portal`, `/checkout`.
- Unauthenticated requests redirect to `/sign-in?redirect=<path>`.
- `createServerClient()` — anon key, RLS enforced. Used in Server Components, Actions, Route Handlers.
- `createServiceRoleClient()` — service role, bypasses RLS. Used only in webhook handlers.
- `createBrowserClient()` — anon key, RLS enforced. Used in Client Components.
- Middleware degrades gracefully if Supabase env vars are missing (logs warning, passes through).

### Routing Conventions (confirmed)

- `app/[partner]/route.ts` — partner attribution catch-all. Sets a 30-day HttpOnly `partner_attribution` cookie `{handle, landingPage, capturedAt}` and redirects to `/pos`. Input sanitized to `[a-z0-9-]`. Static routes take precedence; this fires only for unmatched single-segment paths.
- `app/popia/page.tsx` — legacy redirect-only page: `redirect("/assessments/popia")`. Canonical POPIA route is `/assessments/popia`.
- Server Actions exist in `app/actions/` (`assessment.ts`, `order.ts`) but API routes are the primary mutation pattern.

### Integration Pattern (confirmed from `lib/monday.ts` + `lib/email.ts`)

- **Monday.com** — 4 boards via direct GraphQL REST API (no npm package). Env vars: `MONDAY_API_KEY`, `MONDAY_CONTACT_BOARD_ID`, `MONDAY_POS_BOARD_ID`, `MONDAY_ASSESSMENT_BOARD_ID`, `MONDAY_SUPPORT_BOARD_ID`.
  - `createContactLead` → contact form
  - `createPOSLead` → POS configurator submission
  - `createAssessmentLead` → assessment completion
  - `createOrderItem` / `updateOrderPaymentStatus` / `createOrderSubitem` → checkout + Paystack webhook
- **Resend email** — 5 transactional flows: contact, POS, assessment, support ticket, checkout confirmation. All HTML templates are inlined in `lib/email.ts` (lines ~100–694). `lib/monday.ts` imports shared types from `lib/email.ts`.
- **Paystack** — payments via direct REST API (`lib/paystack-plans.ts`, `lib/paystack-products.ts`). Webhooks at `/api/webhooks/paystack` and `/api/subscribe/webhook`.

### Component Architecture

- Glassmorphism design system: `GlassCard`, `AnimatedButton`, `SpotlightCard`, `TerminalWindow`, `NetworkGraph` in `components/ui/`.
- Marketing sections: `Hero`, `TrustStrip`, `ClientLogos`, `Services`, `TechStack`, `WhoWeServe`, `WhyMontana` in `components/sections/`.
- Layout: `Navbar`, `Footer` in `components/layout/`.
- Colocated form components in `app/portal/` and `app/sign-in|sign-up/` (inconsistent with project's `components/` convention).

---
