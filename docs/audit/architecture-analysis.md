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
  - `createSupportTicket` → support form
  - `createOrderItem` / `updateOrderPaymentStatus` / `createOrderSubitem` → checkout + Paystack webhook
- **Resend email** — 5 transactional flows: contact, POS, assessment, support ticket, checkout confirmation. All HTML templates are inlined in `lib/email.ts` (lines ~100–694). `lib/monday.ts` imports shared types from `lib/email.ts`.
- **Paystack** — payments via direct REST API (`lib/paystack-plans.ts`, `lib/paystack-products.ts`). Webhooks at `/api/webhooks/paystack` and `/api/subscribe/webhook`.

### Component Architecture
- Glassmorphism design system: `GlassCard`, `AnimatedButton`, `SpotlightCard`, `TerminalWindow`, `NetworkGraph` in `components/ui/`.
- Marketing sections: `Hero`, `TrustStrip`, `ClientLogos`, `Services`, `TechStack`, `WhoWeServe`, `WhyMontana` in `components/sections/`.
- Layout: `Navbar`, `Footer` in `components/layout/`.
- Colocated form components in `app/portal/` and `app/sign-in|sign-up/` (inconsistent with project's `components/` convention).

---

## Remove Candidates

| Item | File | Reason |
|------|------|--------|
| `@clerk/nextjs` dep | `package.json` | Never imported anywhere in the codebase. Auth is Supabase-only. ~0 lines of usage. |
| `firebase-tools` devDep | `package.json` | No `firebase` SDK in deps, no firebase imports in any source file. Leftover from prior setup. |
| `autoprefixer` dep | `package.json` | Listed in `dependencies` (not devDeps). With Tailwind v4 + modern targets, autoprefixer is often redundant. Audit PostCSS config before removing. |
| `/app/popia/` as live page | `app/popia/page.tsx` | Contains only `redirect("/assessments/popia")`. Should become a permanent 308 in `next.config.ts` to avoid runtime cost. |

---

## Optimise Candidates

| Item | File | Action |
|------|------|--------|
| Inlined email HTML templates (~600 lines) | `lib/email.ts:100–694` | Extract to `lib/emails/<template-name>.ts` or an `emails/` directory. Decouples types from templates; enables preview without sending. |
| ESLint ignored in builds | `next.config.ts` | `eslint.ignoreDuringBuilds: true` means lint errors silently ship. Set to `false` or enforce lint as a pre-build CI step. |
| Missing `loading.tsx` on auth-gated routes | `app/billing/`, `app/portal/`, `app/checkout/`, `app/sign-in/`, `app/sign-up/` | Add Suspense fallback skeletons. `/pos` and `/assessments` already have `loading.tsx`. |
| `/popia` redirect as page | `app/popia/page.tsx` | Move to `next.config.ts` `redirects()` with `permanent: true` (308). |
| `lib/email.ts` as dual type + runtime module | `lib/email.ts` | Importing types from `lib/email.ts` instantiates the Resend client at module load. Split: `lib/email-types.ts` (types only) + `lib/email.ts` (Resend + functions). |
| `output: 'standalone'` vs Vercel | `next.config.ts` | `standalone` targets container/Docker deployment. If deploying to Vercel, this is unnecessary and adds bundle overhead. Confirm deploy target. |
| Missing error boundaries | `app/billing/`, `app/portal/`, `app/checkout/`, `app/pos/` | Only `app/error.tsx` (root) and `app/assessments/error.tsx` exist. Add `error.tsx` per feature section. |

---

## Add Candidates

| Gap | Rationale |
|-----|-----------|
| **Env validation** (`lib/env.ts` with zod) | App starts silently with missing secrets; first request fails at runtime. Validate `RESEND_API_KEY`, `MONDAY_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` at startup. |
| **Rate limiting on API routes** | `/api/chat` (Gemini), `/api/contact`, `/api/subscribe`, `/api/support` are public with no throttle. Upstash Redis + `@upstash/ratelimit` is the standard Vercel-compatible choice. |
| **Paystack webhook signature verification** | `/api/webhooks/paystack/route.ts` and `/api/subscribe/webhook/route.ts` call `createServiceRoleClient()` (bypasses RLS). Must verify `x-paystack-signature` HMAC before any DB write. |
| **`@vercel/analytics`** | Speed Insights (`@vercel/speed-insights`) is installed; sibling pageview analytics is not. No funnel data for assessment and POS flows. |
| **`supabase gen types` npm script** | `lib/supabase/types.ts` is a generated file. Add `"types:db": "supabase gen types typescript --project-id <id> > lib/supabase/types.ts"` to `package.json` scripts. |
| **Test infrastructure** | Zero test files, no test runner. Minimum viable: Vitest for `lib/` unit tests (email payload construction, Monday column mapping), Playwright for sign-in → checkout critical path. |

---

## Risks / Tech Debt

| Severity | Item | Detail |
|----------|------|--------|
| 🔴 High | **No rate limiting on `/api/chat`** | Any visitor can trigger unlimited Gemini API calls. Unbounded cost exposure. |
| 🔴 High | **No Paystack webhook HMAC verification** | `createServiceRoleClient()` (bypasses RLS) is called before validating the request source. Spoofed POST = privileged DB write. |
| 🔴 High | **`@clerk/nextjs` unused but installed** | Dead dep adds install noise, security surface, and potential confusion about the auth stack. Remove. |
| 🟡 Medium | **No env validation at startup** | Missing `MONDAY_API_KEY` or `RESEND_API_KEY` silently allows the app to start; fails on first triggered action with a cryptic runtime error. |
| 🟡 Medium | **`eslint.ignoreDuringBuilds: true`** | Lint errors can reach production undetected. |
| 🟡 Medium | **`lib/email.ts` as shared type source** | `lib/monday.ts` imports types from `lib/email.ts`, which also instantiates `new Resend(...)` at module load. Type-only consumers pay the Resend client initialization cost. |
| 🟡 Medium | **`firebase-tools` devDep** | Unexplained presence. If it's actually unused, it adds ~200MB to `node_modules` and noise to dependency audits. |
| 🟢 Low | **`package.json` name is `"ai-studio-applet"`** | Template artifact. Should be renamed to match the actual project. |
| 🟢 Low | **`DISABLE_HMR` env var in next.config.ts** | AI Studio–specific flag. Has no effect outside AI Studio but adds noise to the config. |
| 🟢 Low | **No `loading.tsx` for 5 authenticated routes** | `/billing`, `/portal`, `/checkout`, `/sign-in`, `/sign-up` lack Suspense fallbacks. |
| 🟢 Low | **`picsum.photos` in allowed image domains** | Only placeholder images are whitelisted. Real product/partner images must live in `public/` or on the same domain. |
