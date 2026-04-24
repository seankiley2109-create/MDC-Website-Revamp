# Project
Montana Data Company — enterprise cloud backup, data protection, and cyber-resilience marketing site with an interactive "Build Your Solution" POS configurator, POPIA/Security compliance assessments, and a gated customer portal.

# Stack (confirmed versions)
- **Next.js** ^15.4.9 · App Router · `output: 'standalone'`
- **React** ^19.2.1
- **TypeScript** 5.9.3 · strict mode · path alias `@/*` → project root
- **Tailwind CSS** 4.1.11 (v4, PostCSS) · `@tailwindcss/typography` for prose
- **Auth:** Supabase native auth (`@supabase/ssr` ^0.10.0 + `@supabase/supabase-js` ^2.102.0)
- **Animation:** motion ^12.23.24 (Framer Motion — must be in `transpilePackages`)
- **Forms:** react-hook-form ^7.72.1 + zod ^4.3.6
- **Icons:** lucide-react ^0.553.0
- **Email:** Resend ^6.10.0
- **AI:** Google Gemini `@google/genai` ^1.17.0

# Route Map

**Public — marketing**
- `/` Home · `/about` · `/services` · `/partners` · `/resources` · `/privacy` · `/paia` · `/contact`

**Public — lead-gen tools**
- `/pos` Build Your Solution configurator
- `/assessments` Assessment hub · `/assessments/popia` · `/assessments/security`
- `/popia` → permanent 308 redirect via `next.config.ts`

**Auth**
- `/sign-in` · `/sign-up`

**Gated (require Supabase auth session)**
- `/billing` · `/portal` · `/checkout`

**Partner attribution**
- `/[partner]` — catch-all route handler; sets 30-day HttpOnly `partner_attribution` cookie, redirects to `/pos`. Only fires for paths with no static match.

**API routes**
- `/api/chat` — Gemini chatbot stream
- `/api/contact` · `/api/pos` · `/api/assessment` · `/api/popia-assessment` · `/api/support`
- `/api/subscribe` · `/api/subscribe/callback` · `/api/subscribe/webhook`
- `/api/webhooks/paystack` — Paystack payment webhook

**Server Actions:** `app/actions/assessment.ts` · `app/actions/order.ts`

# Architecture Patterns

**Server Components by default.** Add `'use client'` only for interactivity, hooks, or browser APIs.

**Supabase client tiers:**
- `lib/supabase/server.ts → createServerClient()` — anon key, RLS enforced. Use in Server Components, Actions, Route Handlers.
- `lib/supabase/server.ts → createServiceRoleClient()` — bypasses RLS. Use ONLY in webhook handlers.
- `lib/supabase/browser.ts → createBrowserClient()` — anon key, RLS enforced. Use in Client Components.

**Auth middleware** (`middleware.ts`) protects `/billing`, `/portal`, `/checkout`. Unauthenticated → `/sign-in?redirect=<path>`.

**Design system:** Glassmorphism. Core primitives are `GlassCard`, `AnimatedButton`, `SpotlightCard` in `components/ui/`. Dark background class is `bg-montana-bg`. Card borders use `border-white/10`.

**Component placement:** Reusable → `components/`. Route-specific forms/widgets → colocated inside `app/<route>/` (observed pattern; portal, sign-in, sign-up).

# Key Integrations

| Service | Env vars required |
|---------|------------------|
| Supabase (DB + Auth) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Resend (email) | `RESEND_API_KEY` |
| Google Gemini | `GOOGLE_GENAI_API_KEY` (inferred) |
| Paystack (payments) | `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (inferred) |
| Monday.com (CRM) | `MONDAY_API_KEY`, `MONDAY_CONTACT_BOARD_ID`, `MONDAY_POS_BOARD_ID`, `MONDAY_ASSESSMENT_BOARD_ID`, `MONDAY_SUPPORT_BOARD_ID` |

Email templates are inlined in `lib/email.ts` (~600 lines of HTML). Monday.com integration in `lib/monday.ts` uses direct GraphQL REST — no npm package. Monday types are imported from `lib/email.ts`.

All vars validated at startup via `lib/env.ts` (zod). App will not start with missing secrets.

# Commands
```
npm run dev      # dev server on port 3000
npm run build    # production build (TypeScript errors block; ESLint does NOT)
npm run start    # serve standalone build
npm run lint     # ESLint check (not run during build — run this manually)
npm run clean    # next clean — clears .next/ build cache
npm run tunnel   # node scripts/tunnel.js — local tunnel for webhook testing
```

# Conventions
- Import icons exclusively from `lucide-react`. No inline SVGs.
- Prefix browser-accessible env vars with `NEXT_PUBLIC_`.
- Use `@/` path alias for all internal imports.
- Use `<Link>` for internal navigation.
- No `window.alert` / `window.open` — app runs in an iframe preview environment.
- Port **must** be 3000. Do not change.
- `lib/email.ts` is the shared domain type source (`ContactPayload`, `POSPayload`, etc.). Import types from there, not re-declared elsewhere.
- Use `@/lib/env` for all env var access — never read `process.env` directly.

# Known Gaps
1. **No rate limiting** on `/api/chat`, `/api/contact`, `/api/subscribe`. Gemini endpoint is fully public. Add before any traffic increase.
2. **`eslint.ignoreDuringBuilds: true`** in `next.config.ts` — lint errors do not block builds. Run `npm run lint` manually in CI.
