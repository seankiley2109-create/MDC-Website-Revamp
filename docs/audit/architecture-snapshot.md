# Architecture Snapshot — 2026-04-24

---

## File Tree Summary (counts by directory)

| Directory     | Files | Notes                                      |
|---------------|-------|--------------------------------------------|
| `app/`        | 54    | Pages, API routes, layouts, special files  |
| `components/` | 16    | UI primitives, sections, layout, assessments |
| `lib/`        | 10    | Integrations & utilities (some very large) |
| `hooks/`      | 1     | `use-mobile.ts` only                       |
| `public/`     | 16    | Static assets                              |
| `types/`      | —     | **Not present** — no dedicated types dir   |
| `store/`      | —     | **Not present** — no state management lib  |
| `styles/`     | —     | **Not present** — global CSS lives in `app/globals.css` |

**Total TS/TSX source files:** ~81

**Root-level special files:** `middleware.ts`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`

### Components breakdown
```
components/
├── assessments/      awareness-cards.tsx
├── layout/           footer.tsx  navbar.tsx
├── sections/         client-logos.tsx  hero.tsx  services.tsx
│                     tech-stack.tsx  trust-strip.tsx
│                     who-we-serve.tsx  why-montana.tsx
├── ui/               animated-button.tsx  glass-card.tsx
│                     network-graph.tsx  spotlight-card.tsx  terminal-window.tsx
└── chatbot.tsx       (root-level, no subdirectory)
```

### In-app colocated components (non-page/non-layout)
```
app/portal/           contact-details-form.tsx  profile-form.tsx  support-form.tsx
app/sign-in/          sign-in-form.tsx
app/sign-up/          sign-up-form.tsx
app/privacy/          print-button.tsx
app/                  error.tsx  not-found.tsx  icon.tsx  opengraph-image.tsx
app/pos/              loading.tsx
app/assessments/      error.tsx  loading.tsx
```

---

## Routes (pages + API)

### Page Routes
| Route                     | File                                    |
|---------------------------|-----------------------------------------|
| `/`                       | `app/page.tsx`                          |
| `/about`                  | `app/about/page.tsx`                    |
| `/assessments`            | `app/assessments/page.tsx`              |
| `/assessments/popia`      | `app/assessments/popia/page.tsx`        |
| `/assessments/security`   | `app/assessments/security/page.tsx`     |
| `/billing`                | `app/billing/page.tsx`                  |
| `/checkout`               | `app/checkout/page.tsx`                 |
| `/contact`                | `app/contact/page.tsx`                  |
| `/paia`                   | `app/paia/page.tsx`                     |
| `/partners`               | `app/partners/page.tsx`                 |
| `/popia`                  | `app/popia/page.tsx`                    |
| `/portal`                 | `app/portal/page.tsx`                   |
| `/pos`                    | `app/pos/page.tsx`                      |
| `/privacy`                | `app/privacy/page.tsx`                  |
| `/resources`              | `app/resources/page.tsx`                |
| `/services`               | `app/services/page.tsx`                 |
| `/sign-in`                | `app/sign-in/page.tsx`                  |
| `/sign-up`                | `app/sign-up/page.tsx`                  |

### API Routes
| Endpoint                         | File                                          |
|----------------------------------|-----------------------------------------------|
| `GET|POST /api/assessment`       | `app/api/assessment/route.ts`                 |
| `POST /api/chat`                 | `app/api/chat/route.ts`                       |
| `POST /api/contact`              | `app/api/contact/route.ts`                    |
| `POST /api/popia-assessment`     | `app/api/popia-assessment/route.ts`           |
| `POST /api/pos`                  | `app/api/pos/route.ts`                        |
| `POST /api/subscribe`            | `app/api/subscribe/route.ts`                  |
| `GET  /api/subscribe/callback`   | `app/api/subscribe/callback/route.ts`         |
| `POST /api/subscribe/webhook`    | `app/api/subscribe/webhook/route.ts`          |
| `POST /api/support`              | `app/api/support/route.ts`                    |
| `POST /api/webhooks/paystack`    | `app/api/webhooks/paystack/route.ts`          |

### Dynamic / Special Routes
| Route            | File                       | Note                                |
|------------------|----------------------------|-------------------------------------|
| `/[partner]`     | `app/[partner]/route.ts`   | **Root-level dynamic route handler** — not a page, a route handler. Catches `/<anything>`. |

### Server Actions
```
app/actions/assessment.ts
app/actions/order.ts
```

### Layouts
```
app/layout.tsx                   (root)
app/assessments/layout.tsx
app/assessments/popia/layout.tsx
app/assessments/security/layout.tsx
app/checkout/layout.tsx
app/contact/layout.tsx
app/pos/layout.tsx
app/popia/layout.tsx
```

---

## Dependencies (grouped)

### Auth
| Package         | Role                          |
|-----------------|-------------------------------|
| `@clerk/nextjs` | Primary auth (sign-in/sign-up/middleware) |

### Data / Backend-as-a-Service
| Package                  | Role                              |
|--------------------------|-----------------------------------|
| `@supabase/supabase-js`  | Supabase JS client                |
| `@supabase/ssr`          | SSR-safe Supabase helpers         |

### Payments
| Package | Role |
|---------|------|
| _(none in deps)_ | Paystack via direct REST API — `lib/paystack-plans.ts`, `lib/paystack-products.ts` |

### Email
| Package  | Role                      |
|----------|---------------------------|
| `resend` | Transactional email sending |

### AI / LLM
| Package          | Role                      |
|------------------|---------------------------|
| `@google/genai`  | Google Gemini AI (chatbot) |

### Forms & Validation
| Package                  | Role                     |
|--------------------------|--------------------------|
| `react-hook-form`        | Form state management    |
| `@hookform/resolvers`    | Zod integration for RHF  |
| `zod`                    | Schema validation        |

### UI / Styling
| Package                   | Role                                     |
|---------------------------|------------------------------------------|
| `tailwindcss`             | Utility-first CSS framework (v4)         |
| `@tailwindcss/postcss`    | PostCSS integration                      |
| `@tailwindcss/typography` | Prose/markdown typography styles         |
| `tw-animate-css`          | CSS animation utilities for Tailwind     |
| `lucide-react`            | Icon library                             |
| `motion`                  | Animation (Framer Motion rebranded)      |
| `class-variance-authority`| Component variant management             |
| `clsx` + `tailwind-merge` | Conditional class utilities              |
| `react-markdown`          | Markdown rendering (chatbot responses)  |

### Infrastructure / Observability
| Package                  | Role                                |
|--------------------------|-------------------------------------|
| `@vercel/speed-insights` | Vercel Speed Insights (perf metrics)|
| _(Vercel Analytics)_     | Likely via `@vercel/analytics` — check layout.tsx |

### CRM / External Integrations
| Module            | Role                                          |
|-------------------|-----------------------------------------------|
| `lib/monday.ts`   | Monday.com CRM — direct REST API (no npm dep) |

### Dev Dependencies
| Package             | Role                                             |
|---------------------|--------------------------------------------------|
| `typescript`        | Type checking                                    |
| `eslint`            | Linting                                          |
| `eslint-config-next`| Next.js ESLint rules                             |
| `@types/*`          | Type definitions                                 |
| `firebase-tools`    | **⚠ Flagged** — Firebase CLI in devDeps, no `firebase` in deps |

### Scripts
| Script   | Purpose                                      |
|----------|----------------------------------------------|
| `dev`    | Start dev server                             |
| `build`  | Production build                             |
| `start`  | Start production server                      |
| `lint`   | ESLint check                                 |
| `clean`  | **Unclear** — likely removes `.next/` or build artifacts |
| `tunnel` | **Unclear** — likely ngrok/cloudflare tunnel for local dev/webhooks |

---

## Config Flags Detected

| Flag                              | Value        | Implication                                      |
|-----------------------------------|--------------|--------------------------------------------------|
| `reactStrictMode`                 | `true`       | Double-renders in dev, strict effect detection   |
| `eslint.ignoreDuringBuilds`       | `true`       | ESLint errors **do not block** production builds |
| `typescript.ignoreBuildErrors`    | `false`      | TypeScript errors **do** block production builds |
| `output`                          | `'standalone'` | Containerized/Docker deployment mode          |
| `transpilePackages`               | `['motion']` | Motion package requires transpilation            |
| `DISABLE_HMR` env var             | supported    | Disables webpack file watching (AI Studio mode)  |
| `images.remotePatterns`           | picsum.photos only | Only placeholder images allowed externally |
| Path alias `@/*`                  | `"./*"`      | Root-relative imports via `@/`                   |
| `baseUrl`                         | `"."`        | Project root as module base                      |
| `strict`                          | `true`       | Full TypeScript strict mode                      |
| `middleware.ts`                   | present      | Route-level auth/redirect logic (likely Clerk)   |

---

## Unknown / Unclear Areas (flagged for Phase 2)

### 🔴 High Priority

1. **`/app/[partner]/route.ts` — root-level dynamic route handler**
   - This is a `route.ts` (API handler), not a page. It sits at `app/[partner]/` which means it intercepts any request to `/<anything>` that doesn't match a static route.
   - Risk: could shadow legitimate routes or handle partner redirects/SSO. Purpose unknown.
   - *Needs: read file to understand intent and routing precedence.*

2. **Dual POPIA routes: `/popia` vs `/assessments/popia`**
   - Both exist as full page routes with separate layouts. One may be legacy.
   - *Needs: confirm which is canonical; check if `/popia` redirects.*

3. **Auth stack: Clerk + Supabase coexistence**
   - `@clerk/nextjs` handles auth UX; `@supabase/ssr` + `@supabase/supabase-js` handles data.
   - Pattern is valid (Clerk for auth, Supabase for DB) but needs verification that JWT/session sync is implemented correctly in `lib/supabase/server.ts` and `lib/supabase/browser.ts`.
   - *Needs: read lib/supabase/* files.*

### 🟡 Medium Priority

4. **`firebase-tools` in devDependencies — no `firebase` in deps**
   - Firebase CLI tools present but no firebase SDK. Could be: leftover from migration, used for Firestore emulator, or deploy tooling.
   - *Needs: check `clean`/`tunnel` scripts in package.json for firebase references.*

5. **`lib/email.ts` — 42KB**
   - Extremely large for a single utility file. Likely contains multiple hardcoded email HTML templates.
   - *Needs: understand template count, whether templates should be extracted to `/emails/` directory.*

6. **`lib/monday.ts` — 22KB**
   - Monday.com integration via direct REST API (no npm package). Large file suggests complex CRM mapping.
   - *Needs: understand what data is being synced and when (on order? on assessment? on contact?).*

7. **`tunnel` npm script — purpose unclear**
   - Likely a local tunnel (ngrok/cloudflare) for webhook testing (Paystack webhooks need public URL).
   - *Needs: read package.json scripts to confirm command.*

8. **`clean` npm script — target unknown**
   - *Needs: read package.json scripts.*

### 🟢 Low Priority / Observations

9. **No test files found anywhere** — zero `*.test.ts`, `*.spec.ts`, `*.test.tsx` files. No test runner in devDeps (no jest, vitest, playwright, cypress).

10. **Single hook `use-mobile.ts`** — very thin hooks layer. State is likely managed via React local state + server components, no Zustand/Redux/Jotai.

11. **`app/portal/` has 3 inline form components** — `contact-details-form.tsx`, `profile-form.tsx`, `support-form.tsx` — colocated inside `app/` rather than `components/`. Inconsistent with project's `components/` pattern.

12. **`app/actions/` with 2 server actions** — `assessment.ts`, `order.ts`. Server Actions are present but not used broadly — API routes still used for most mutations.

13. **`output: 'standalone'`** — deploy target is a container, not Vercel's default Edge/Serverless. Verify this is intentional given Vercel Analytics is installed (usually for Vercel-hosted apps).

14. **`@vercel/speed-insights` in deps** — confirmed from recent git commit. Verify `@vercel/analytics` is also wired; not found in package deps but may be added.

15. **`opengraph-image.tsx` and `icon.tsx`** — Next.js metadata image generation files. Good practice.

16. **`picsum.photos` only in image domains** — all real product/marketing images must be in `public/` or served from the same domain. No CDN configured for images.
