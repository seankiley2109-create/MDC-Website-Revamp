# UI Cross-Screen Tweaks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix assessment result pages (bad UI, non-sellable packages, broken CTAs), prevent the lead-gate popup appearing for signed-in users, add M365/endpoint user email capture in the POS, and remove the /downloads page.

**Architecture:** Four independent subsystems touched in sequence. Assessment pages share the auth-bypass fix pattern. POS gets URL-param deep linking (needed by the assessment CTAs) and an email-capture expansion to the M365/endpoint service cards. Downloads is a straight deletion.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth (browser client), `useSearchParams`, `sessionStorage`

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `app/downloads/page.tsx` | **Delete** | Page removed entirely |
| `middleware.ts` | Modify lines 69–95, 102 | Remove `/downloads` protection block and matcher entry |
| `app/portal/page.tsx` | Modify ~line 334 | Remove `<Link href="/downloads">` button |
| `app/assessments/popia/page.tsx` | Modify | Auth-bypass timing fix + replace fake-tier upsell cards with real POPIA consulting services + CTA deep links |
| `app/assessments/security/page.tsx` | Modify | Auth-bypass timing fix + update CTA deep links |
| `app/pos/page.tsx` | Modify `POSForm` + `ConsultingSection` + `ServiceConfigCard` | URL param handling (`?tab`, `?service`, `?services`), M365/endpoint email capture textarea |

---

## Task 1: Remove /Downloads page

**Files:**
- Delete: `app/downloads/page.tsx`
- Modify: `middleware.ts`
- Modify: `app/portal/page.tsx`

- [ ] **Step 1: Delete the downloads page file**

  In your terminal / file system: delete the file at `app/downloads/page.tsx`.
  The directory `app/downloads/` can be removed entirely — it contains only that one file.

  ```bash
  rm -rf "app/downloads"
  ```

- [ ] **Step 2: Remove /downloads from middleware**

  Open `middleware.ts`. Remove the entire `/downloads` protection block (lines 69–95) and the matcher entry.

  **Before** (lines 69–95):
  ```typescript
  // ── /downloads — requires auth AND active plan ────────────────────────────
  if (pathname.startsWith('/downloads')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('plan_status')
      .eq('id', user.id)
      .single();

    const profile = profileData as { plan_status: string } | null;

    if (!profile || profile.plan_status !== 'active') {
      const url = request.nextUrl.clone();
      url.pathname = '/billing';
      url.searchParams.set('reason', 'inactive');
      return NextResponse.redirect(url);
    }
  }
  ```

  **After:** delete those lines entirely.

  **Before** (matcher, line 102):
  ```typescript
  matcher: [
    '/downloads/:path*',
    '/billing',
    '/billing/:path*',
    '/portal',
    '/portal/:path*',
  ],
  ```

  **After:**
  ```typescript
  matcher: [
    '/billing',
    '/billing/:path*',
    '/portal',
    '/portal/:path*',
  ],
  ```

- [ ] **Step 3: Remove the Downloads button from the portal page**

  Open `app/portal/page.tsx`. Find the `<Link href="/downloads">` block (around line 334) and remove it.

  Find this block:
  ```tsx
  <Link href="/downloads">
    <AnimatedButton variant="outline" className="text-sm py-2 px-4 gap-1.5">
      <Download className="h-4 w-4" />
  ```
  Remove the entire `<Link href="/downloads">…</Link>` element. If the `Download` icon import from `lucide-react` is now unused, remove it from the import line too.

- [ ] **Step 4: Verify the build still compiles**

  ```bash
  npm run build
  ```

  Expected: build succeeds with no errors referencing `/downloads`.

- [ ] **Step 5: Commit**

  ```bash
  git add app/downloads middleware.ts app/portal/page.tsx
  git commit -m "remove /downloads page and all references"
  ```

---

## Task 2: Fix auth-bypass timing on assessment pages

**Context:** `canSkipLeadGate` is computed from `authedProfile`, which is populated by an async `useEffect`. If the user answers all 10 questions before that async check resolves, `canSkipLeadGate` is still `false` at the moment `handleAnswer` runs on question 10, so the lead-gate modal flashes for signed-in users.

**Fix pattern (same for both pages):**
1. Add `isAuthChecking` state (default `true`), set to `false` once the effect completes.
2. Add `pendingFinalAnswers` state (default `null`).
3. In `handleAnswer`: when the quiz is complete and `isAuthChecking` is still `true`, store the final answers in `pendingFinalAnswers` and advance to a new **step 10.5** (loading state) instead of step 10.
4. Add a `useEffect` that watches `isAuthChecking`: when it flips to `false` and `pendingFinalAnswers` is set, either call `autoSubmitFromProfile` or advance to step 10.

**Files:**
- Modify: `app/assessments/security/page.tsx`
- Modify: `app/assessments/popia/page.tsx`

### 2a: Fix `app/assessments/security/page.tsx`

- [ ] **Step 1: Add auth-loading state and pending-answers state**

  After the existing `authedProfile` state declaration (around line 257), add:

  ```typescript
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [pendingFinalAnswers, setPendingFinalAnswers] = useState<Record<number, number> | null>(null);
  ```

- [ ] **Step 2: Mark auth check complete in the useEffect**

  Modify the existing `useEffect` (lines 260–280) to call `setIsAuthChecking(false)` in both branches:

  ```typescript
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setIsAuthChecking(false);
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, company_name")
          .eq("id", user.id)
          .single();
        if (!cancelled && data) {
          setAuthedProfile(data as AuthedProfile);
        }
      } catch (err) {
        console.error("[security] auth check failed:", err);
      } finally {
        if (!cancelled) setIsAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  ```

- [ ] **Step 3: Add effect to process pending answers once auth resolves**

  Add a new `useEffect` after the existing one:

  ```typescript
  useEffect(() => {
    if (isAuthChecking || !pendingFinalAnswers) return;
    if (canSkipLeadGate) {
      void autoSubmitFromProfile(pendingFinalAnswers);
    } else {
      setCurrentStep(10);
    }
    setPendingFinalAnswers(null);
  }, [isAuthChecking, pendingFinalAnswers, canSkipLeadGate]);
  ```

  > Note: ESLint may warn about `autoSubmitFromProfile` and `canSkipLeadGate` in deps. Add `// eslint-disable-next-line react-hooks/exhaustive-deps` on the line before the closing `}` if needed, since `autoSubmitFromProfile` references `authedProfile` which is already captured via closure.

- [ ] **Step 4: Update `handleAnswer` to use the pending-answers pattern**

  Replace the `else if (canSkipLeadGate)` block in `handleAnswer` (lines 322–329):

  **Before:**
  ```typescript
  } else if (canSkipLeadGate) {
    // Authenticated user with complete profile — skip the lead gate entirely.
    void autoSubmitFromProfile(nextAnswers);
  } else {
    setCurrentStep(10);
  }
  ```

  **After:**
  ```typescript
  } else if (isAuthChecking) {
    // Auth check still in flight — park the answers; the useEffect above will resolve it.
    setPendingFinalAnswers(nextAnswers);
    setCurrentStep(10); // will show loading state until auth resolves
  } else if (canSkipLeadGate) {
    void autoSubmitFromProfile(nextAnswers);
  } else {
    setCurrentStep(10);
  }
  ```

- [ ] **Step 5: Add a loading state to the Phase 2 render (step 10)**

  In the Phase 2 JSX block (`{currentStep === 10 && (…)}`), wrap the existing modal content with a conditional: if `pendingFinalAnswers` is set (auth still resolving), show a spinner instead of the form.

  Replace the opening of the Phase 2 block:
  ```tsx
  {currentStep === 10 && (
    <div className="relative overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-500">
  ```

  With:
  ```tsx
  {currentStep === 10 && pendingFinalAnswers && (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="h-10 w-10 border-2 border-montana-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-montana-muted text-sm">Checking your account…</p>
      </div>
    </div>
  )}
  {currentStep === 10 && !pendingFinalAnswers && (
    <div className="relative overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-500">
  ```

  > **Important:** The existing closing `</div>` for the Phase 2 block must remain — you're splitting the condition not nesting.

- [ ] **Step 6: Verify no TypeScript errors**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/assessments/security/page.tsx`.

### 2b: Apply the same fix to `app/assessments/popia/page.tsx`

- [ ] **Step 7: Apply identical state, useEffect, and handleAnswer changes to popia/page.tsx**

  Apply the same four code changes from steps 1–5 above to `app/assessments/popia/page.tsx`, with these substitutions:
  - All `[security]` log prefixes → `[popia]`
  - The `autoSubmitFromProfile` call uses `type: "popia"` (already correct in that file)
  - The spinner and lead-gate conditional logic is identical

- [ ] **Step 8: Lint**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/assessments/popia/page.tsx`.

- [ ] **Step 9: Commit**

  ```bash
  git add app/assessments/security/page.tsx app/assessments/popia/page.tsx
  git commit -m "fix: skip assessment lead gate for signed-in users even on fast completion"
  ```

---

## Task 3: POS — URL parameter deep linking

**Context:** Assessment result CTAs need to link to `/pos?tab=consulting&services=SE-PA002` etc. to pre-select tabs and items. Currently, `POSForm` only reads `?error` and `?checkout` params.

**Files:**
- Modify: `app/pos/page.tsx` — `POSForm` component and `ConsultingSection` component

### 3a: Add `?tab` handling to `POSForm`

- [ ] **Step 1: Read initial tab from URL param**

  In `POSForm`, the `activeTab` state is initialised as `"cloud"`. Change it to read from the URL:

  ```typescript
  // Replace:
  const [activeTab, setActiveTab]   = useState<Tab>("cloud");

  // With:
  const initialTab = (searchParams.get("tab") as Tab | null);
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab && ["cloud", "consulting", "enterprise"].includes(initialTab)
      ? initialTab
      : "cloud"
  );
  ```

### 3b: Add `?service` handling to `POSForm` (cloud service highlight)

- [ ] **Step 2: Add a `focusedService` state driven by `?service` param**

  After the `activeTab` state, add:

  ```typescript
  const focusedService = searchParams.get("service") as SelfServeServiceId | null;
  ```

  Pass `focusedService` down to `ServiceConfigCard` as a prop `isFocused`:

  In the cloud tab render section (around line 897):
  ```tsx
  {CLOUD_SERVICES.map(service => (
    <ServiceConfigCard
      key={service.id}
      service={service}
      config={configs[service.id]}
      inCart={cartIds.has(service.id)}
      isFocused={focusedService === service.id}
      onConfigChange={updateConfig}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
    />
  ))}
  ```

- [ ] **Step 3: Update `ServiceConfigCard` props and add visual focus treatment**

  Add `isFocused?: boolean` to the `ServiceConfigCard` props interface:
  ```typescript
  function ServiceConfigCard({
    service,
    config,
    inCart,
    isFocused,
    onConfigChange,
    onAddToCart,
    onRemoveFromCart,
  }: {
    service:          typeof CLOUD_SERVICES[number];
    config:           ServiceConfig;
    inCart:           boolean;
    isFocused?:       boolean;
    onConfigChange:   (serviceId: SelfServeServiceId, updates: Partial<ServiceConfig>) => void;
    onAddToCart:      (serviceId: SelfServeServiceId) => void;
    onRemoveFromCart: (serviceId: SelfServeServiceId) => void;
  })
  ```

  Add a scroll-into-view effect and a ring highlight when `isFocused` is true:
  ```typescript
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFocused]);
  ```

  Attach `cardRef` to the `<GlassCard>` and add a focus ring class:
  ```tsx
  <GlassCard
    ref={cardRef}
    className={`transition-all ${inCart ? "border-montana-pink/40 bg-montana-magenta/5" : ""} ${isFocused && !inCart ? "border-white/40 ring-1 ring-white/20" : ""}`}
  >
  ```

  > **Note:** `GlassCard` must accept a `ref` prop. Check `components/ui/glass-card.tsx` — if it's a plain `div` wrapper, wrap it with `React.forwardRef` or pass `ref` directly. If `GlassCard` doesn't support `ref`, use a wrapping `<div ref={cardRef}>` instead.

### 3c: Add `?services` handling to `ConsultingSection` (pre-select consulting items)

- [ ] **Step 4: Pass pre-selected consulting service codes from URL to `ConsultingSection`**

  In `POSForm`, read a comma-separated `?services` param and pass it to `ConsultingSection`:

  ```typescript
  const preselectedServices = searchParams.get("services")?.split(",").filter(Boolean) ?? [];
  ```

  Update the render:
  ```tsx
  {activeTab === "consulting" && <ConsultingSection preselected={preselectedServices} />}
  ```

- [ ] **Step 5: Update `ConsultingSection` to accept and apply pre-selected codes**

  Change the `ConsultingSection` signature and initialise `selected` from props:

  ```typescript
  function ConsultingSection({ preselected = [] }: { preselected?: string[] }) {
    const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
    // rest of component unchanged
  ```

- [ ] **Step 6: Lint**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/pos/page.tsx`.

- [ ] **Step 7: Commit**

  ```bash
  git add app/pos/page.tsx
  git commit -m "feat: add URL param deep linking to POS (tab, service, services)"
  ```

---

## Task 4: Fix POPIA assessment result page

**Context:** The current upsell shows generic "Entry / Core / Premium" tiers that don't correspond to purchasable products. Replace them with the actual `POPIA_SERVICES` catalogue entries, with CTAs that deep-link into the POS consulting tab.

**Files:**
- Modify: `app/assessments/popia/page.tsx`

### 4a: Replace the upsell section with real consulting service cards

- [ ] **Step 1: Import POPIA_SERVICES into the popia assessment page**

  Add to the import block at the top of `app/assessments/popia/page.tsx`:

  ```typescript
  import { POPIA_SERVICES } from "@/lib/popia-services";
  ```

- [ ] **Step 2: Replace the entire upsell section (Phase 3 "Upsell" block, lines 604–659)**

  The current block is:
  ```tsx
  {/* Upsell: 88-Control Engagement */}
  <div>
    <div className="text-center mb-10">
      <h3 className="font-display text-3xl font-bold text-white mb-4">Next Steps: 88-Control Engagement</h3>
      …
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      … 3 hardcoded GlassCard tiers …
    </div>
  </div>
  ```

  Replace it entirely with the following (maps the first 3 POPIA_SERVICES and uses a primary highlight on SE-PA002):

  ```tsx
  {/* Recommended Services */}
  <div>
    <div className="text-center mb-10">
      <h3 className="font-display text-3xl font-bold text-white mb-4">Recommended Next Steps</h3>
      <p className="text-montana-muted max-w-2xl mx-auto">
        This 10-question snapshot covers high-level risk areas. Book one of the engagements below to begin your compliance journey.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {POPIA_SERVICES.slice(0, 3).map((svc, idx) => {
        const isRecommended = svc.code === "SE-PA002";
        const posUrl = `/pos?tab=consulting&services=${svc.code}`;
        return (
          <GlassCard
            key={svc.code}
            glow={isRecommended}
            className={`p-8 flex flex-col relative ${isRecommended ? "border-montana-pink/50 shadow-2xl shadow-montana-pink/10 md:-translate-y-4" : "hover:border-white/30 transition-colors"}`}
          >
            {isRecommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-montana-pink text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
                RECOMMENDED
              </div>
            )}
            <h4 className="font-bold text-white text-lg mb-1">{svc.name}</h4>
            <p className="text-montana-muted text-sm mb-4 flex-1">{svc.description}</p>
            <div className="text-2xl font-bold text-white font-mono mb-1">
              R{svc.price.toLocaleString()}
              <span className="text-sm font-normal text-montana-muted ml-1">
                {svc.type === "recurring" ? "/mo" : "once-off"}
              </span>
            </div>
            <div className="text-xs text-montana-muted mb-6">{svc.duration}</div>
            <ul className="space-y-2 mb-8 text-sm text-white/80 flex-1">
              {svc.includes.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={posUrl}>
              <AnimatedButton
                variant={isRecommended ? "primary" : "outline"}
                className="w-full"
              >
                {idx === 0 ? "Book Assessment" : "Select Service"}
              </AnimatedButton>
            </Link>
          </GlassCard>
        );
      })}
    </div>

    <div className="text-center">
      <Link href="/pos?tab=consulting">
        <AnimatedButton variant="outline" className="gap-2 px-8 py-4">
          View All POPIA Services <ArrowRight className="h-5 w-5" />
        </AnimatedButton>
      </Link>
    </div>
  </div>
  ```

- [ ] **Step 3: Lint**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/assessments/popia/page.tsx`.

- [ ] **Step 4: Commit**

  ```bash
  git add app/assessments/popia/page.tsx
  git commit -m "feat: replace POPIA upsell tiers with real consulting services + POS deep links"
  ```

---

## Task 5: Fix Security assessment result page

**Context:** The 4-card layout needs updating — Ransomware Protection and IBM Enterprise Backup should link to the POS enterprise tab, Druva and MaaS360 should deep-link to the POS cloud tab with the relevant service pre-selected. The 4-column grid at large screen is also a bit cramped; switching to 2×2 improves readability.

**Files:**
- Modify: `app/assessments/security/page.tsx`

- [ ] **Step 1: Update the upsell section grid and CTA links**

  Find the `{/* Product Mapping / Upsell */}` block (lines 615–669). Replace the `grid` and all 4 `GlassCard` children:

  **Before:**
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Database className="h-8 w-8 text-montana-pink mb-4" />
      <h4 className="font-bold text-white mb-2">Druva SaaS & Endpoint Backup</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Automated M365, Google Workspace, and endpoint backup with instant recovery.</p>
      <Link href="/pos">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Configure</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <ShieldAlert className="h-8 w-8 text-red-400 mb-4" />
      <h4 className="font-bold text-white mb-2">Ransomware Protection</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Immutable storage, AI anomaly detection, and air-gapped recovery vaults.</p>
      <Link href="/contact">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Get Proposal</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Monitor className="h-8 w-8 text-amber-400 mb-4" />
      <h4 className="font-bold text-white mb-2">MaaS360 MDM/UEM</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Unified endpoint management, device compliance, and threat defence.</p>
      <Link href="/pos?service=maas360">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Configure</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Server className="h-8 w-8 text-montana-pink mb-4" />
      <h4 className="font-bold text-white mb-2">IBM Enterprise Backup</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Bespoke architecture for complex, high-volume data protection environments.</p>
      <Link href="/contact">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Get Proposal</AnimatedButton>
      </Link>
    </GlassCard>
  </div>
  ```

  **After** (2×2 grid, enterprise items link to POS enterprise tab):
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Database className="h-8 w-8 text-montana-pink mb-4" />
      <h4 className="font-bold text-white mb-2">Druva SaaS & Endpoint Backup</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Automated M365, Google Workspace, and endpoint backup with instant recovery.</p>
      <Link href="/pos?tab=cloud&service=druva-m365">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Configure</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <ShieldAlert className="h-8 w-8 text-red-400 mb-4" />
      <h4 className="font-bold text-white mb-2">Ransomware Protection</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Immutable storage, AI anomaly detection, and air-gapped recovery vaults.</p>
      <Link href="/pos?tab=enterprise">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">View Solution</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Monitor className="h-8 w-8 text-amber-400 mb-4" />
      <h4 className="font-bold text-white mb-2">MaaS360 MDM / UEM</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Unified endpoint management, device compliance, and threat defence.</p>
      <Link href="/pos?tab=cloud&service=maas360">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">Configure</AnimatedButton>
      </Link>
    </GlassCard>

    <GlassCard className="p-6 flex flex-col hover:border-white/30 transition-colors">
      <Server className="h-8 w-8 text-montana-pink mb-4" />
      <h4 className="font-bold text-white mb-2">IBM Enterprise Backup</h4>
      <p className="text-sm text-montana-muted flex-1 mb-4">Bespoke architecture for complex, high-volume data protection environments.</p>
      <Link href="/pos?tab=enterprise">
        <AnimatedButton variant="outline" className="w-full text-xs py-2">View Solution</AnimatedButton>
      </Link>
    </GlassCard>
  </div>
  ```

- [ ] **Step 2: Update the main CTA button href**

  Change the bottom CTA (line 663):
  ```tsx
  // Before:
  <Link href="/pos">

  // After:
  <Link href="/pos?tab=cloud">
  ```

- [ ] **Step 3: Lint**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/assessments/security/page.tsx`.

- [ ] **Step 4: Commit**

  ```bash
  git add app/assessments/security/page.tsx
  git commit -m "fix: security result page - 2x2 grid, proper POS deep links for all CTAs"
  ```

---

## Task 6: POS — Capture M365/endpoint user emails

**Context:** When a customer configures `druva-m365` or `druva-endpoint`, we need to collect the email addresses of those users so Montana DC can use them during Druva onboarding. This should be an optional textarea that appears inside the respective `ServiceConfigCard` once the user quantity is set, and the emails get included in the checkout/API payload.

**Files:**
- Modify: `app/pos/page.tsx` — `ServiceConfigCard`, `POSForm`

### 6a: Add email state to `POSForm` and pass to cards

- [ ] **Step 1: Add `userEmails` state map to `POSForm`**

  In `POSForm`, after the `configs` state, add:

  ```typescript
  const [userEmails, setUserEmails] = useState<Partial<Record<SelfServeServiceId, string>>>({});
  ```

  Add a handler:
  ```typescript
  const updateUserEmails = useCallback((serviceId: SelfServeServiceId, emails: string) => {
    setUserEmails(prev => ({ ...prev, [serviceId]: emails }));
  }, []);
  ```

- [ ] **Step 2: Pass `userEmails` state to `ServiceConfigCard`**

  In the cloud tab render section, update each `ServiceConfigCard` usage:

  ```tsx
  <ServiceConfigCard
    key={service.id}
    service={service}
    config={configs[service.id]}
    inCart={cartIds.has(service.id)}
    isFocused={focusedService === service.id}
    userEmails={userEmails[service.id] ?? ""}
    onConfigChange={updateConfig}
    onAddToCart={addToCart}
    onRemoveFromCart={removeFromCart}
    onUserEmailsChange={updateUserEmails}
  />
  ```

### 6b: Add email textarea to `ServiceConfigCard`

- [ ] **Step 3: Update `ServiceConfigCard` props to accept email state**

  Add to the props interface:
  ```typescript
  userEmails:          string;
  onUserEmailsChange:  (serviceId: SelfServeServiceId, emails: string) => void;
  ```

  And destructure them:
  ```typescript
  function ServiceConfigCard({
    service,
    config,
    inCart,
    isFocused,
    userEmails,
    onConfigChange,
    onAddToCart,
    onRemoveFromCart,
    onUserEmailsChange,
  }: { … })
  ```

- [ ] **Step 4: Render the email textarea for M365 and endpoint services**

  Add the following block inside `ServiceConfigCard`, after the `{/* Quantity */}` section and before `{/* Price + Add to Cart */}`:

  ```tsx
  {/* User Email Capture — M365 / endpoint only */}
  {(service.id === "druva-m365" || service.id === "druva-endpoint") && (
    <div className="mb-5">
      <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-1">
        {service.id === "druva-m365" ? "M365 / Google Workspace User Emails" : "Endpoint User Emails"}
        <span className="ml-2 font-normal normal-case text-white/30">(optional — assists onboarding)</span>
      </div>
      <p className="text-xs text-montana-muted mb-2">
        Paste the email addresses of the users to be protected, one per line or comma-separated. We'll use these during account provisioning.
      </p>
      <textarea
        rows={4}
        value={userEmails}
        onChange={e => onUserEmailsChange(service.id, e.target.value)}
        placeholder={"user@company.com\nuser2@company.com"}
        className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-montana-pink focus:outline-none resize-none font-mono"
      />
    </div>
  )}
  ```

### 6c: Include emails in the checkout payload

- [ ] **Step 5: Read the `/api/subscribe` route**

  Open `app/api/subscribe/route.ts` and check how it processes the POST body. Determine if it has a `metadata` or `notes` field, or if it passes extra fields through to Paystack or a CRM.

- [ ] **Step 6: Include `userEmails` in the checkout API call**

  In `handleCheckout` in `POSForm`, before building the `fetch("/api/subscribe", …)` call, collect the emails for cart items that have them:

  ```typescript
  const emailContext = cartItems
    .filter(item => userEmails[item.serviceId]?.trim())
    .map(item => ({
      serviceId: item.serviceId,
      emails: userEmails[item.serviceId]!
        .split(/[\n,]+/)
        .map(e => e.trim())
        .filter(e => e.includes("@")),
    }));
  ```

  Add `userEmailContext: emailContext` to the subscribe payload body:

  ```typescript
  body: JSON.stringify({
    services: cartItems.map(({ serviceId, planId, quantity }) => ({
      service_id: serviceId,
      plan_id:    planId,
      quantity,
    })),
    userEmailContext: emailContext.length > 0 ? emailContext : undefined,
    ...(discountCode.trim() && { discount_code: discountCode.trim() }),
  }),
  ```

- [ ] **Step 7: Also persist emails in the `sessionStorage` cart state** (for sign-in redirect restore)

  In the "save state and redirect" block of `handleCheckout`:
  ```typescript
  sessionStorage.setItem("pos_cart_state", JSON.stringify({
    configs,
    cartIds: Array.from(cartIds),
    discountCode,
    userEmails,
  }));
  ```

  In the cart-restore `useEffect`:
  ```typescript
  const state = JSON.parse(saved) as {
    configs:        Record<SelfServeServiceId, ServiceConfig>;
    cartIds:        SelfServeServiceId[];
    discountCode:   string;
    userEmails?:    Partial<Record<SelfServeServiceId, string>>;
  };
  setConfigs(state.configs ?? DEFAULT_CONFIGS);
  setCartIds(new Set(state.cartIds ?? []));
  setDiscount(state.discountCode ?? "");
  if (state.userEmails) setUserEmails(state.userEmails);
  ```

- [ ] **Step 8: Update `/api/subscribe/route.ts` to log/store the user emails**

  After reading the route file in Step 5, add handling for `userEmailContext`. At minimum, pass it to the CRM or log it so the team can see it. If `createPOSLead` (or equivalent) is called from subscribe, include the emails in the CRM payload. If there's no CRM call, add a `console.log` as a temporary measure and leave a TODO comment for CRM integration.

  > The exact implementation here depends on what you find in Step 5. The requirement is that the emails reach the operations team — even a server log is acceptable as an initial implementation.

- [ ] **Step 9: Lint**

  ```bash
  npm run lint
  ```

  Expected: 0 errors in `app/pos/page.tsx` and `app/api/subscribe/route.ts`.

- [ ] **Step 10: Commit**

  ```bash
  git add app/pos/page.tsx app/api/subscribe/route.ts
  git commit -m "feat: capture M365/endpoint user emails in POS for Druva onboarding"
  ```

---

## Self-Review Checklist

After completing all tasks, verify:

- [ ] `/downloads` returns 404 (page deleted, middleware removed)
- [ ] Portal page no longer has a Downloads button
- [ ] Signed-in users completing either assessment are never shown the lead-gate form
- [ ] POPIA result page shows actual consulting service cards (SE-PA002, SE-PR002, SE-PE001) with prices and "Book Assessment" / "Select Service" CTAs
- [ ] Each POPIA CTA links to `/pos?tab=consulting&services=<code>` and pre-selects the right service in the consulting tab
- [ ] Security result page shows a 2×2 grid; Druva/MaaS360 link to cloud tab, Ransomware/IBM link to enterprise tab
- [ ] `/pos?tab=consulting` opens the consulting tab
- [ ] `/pos?tab=cloud&service=maas360` opens the cloud tab and highlights/scrolls to the MaaS360 card
- [ ] `/pos?tab=consulting&services=SE-PA002` opens consulting with SE-PA002 pre-selected
- [ ] M365 and endpoint service cards show a "User Emails" textarea
- [ ] Entering emails and checking out includes them in the API payload
- [ ] `npm run build` completes without errors
