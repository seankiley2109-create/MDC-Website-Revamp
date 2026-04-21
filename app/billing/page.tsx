/**
 * /billing  — Billing & Account page
 *
 * Shows the user's plan status, full itemised purchase history (from
 * subscribed_services), monthly commitment summary, and a Sage invoicing note.
 *
 * Purchases are grouped by Paystack reference so each checkout transaction
 * appears as one block.  Historical entries without a reference are collected
 * into a single "Legacy purchases" group.
 */

import type { Metadata }            from 'next';
import { redirect }                 from 'next/navigation';
import Link                         from 'next/link';
import { createServerClient }       from '@/lib/supabase/server';
import type { Profile }             from '@/lib/supabase/types';
import { GlassCard }                from '@/components/ui/glass-card';
import {
  CreditCard, AlertCircle, CheckCircle, Clock, XCircle,
  Package, Plus, Receipt, ArrowRight, Calendar, Tag,
  ShoppingBag,
} from 'lucide-react';
import {
  getProductEntry,
  isSelfServeService,
  formatZAR,
} from '@/lib/paystack-products';
import { POPIA_SERVICES } from '@/lib/popia-services';

export const metadata: Metadata = {
  title: 'Billing',
  robots: { index: false, follow: false },
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** Normalised entry — covers all historical StoredEntry shapes */
interface NormEntry {
  service_id:         string;
  plan_id:            string;
  label?:             string;
  quantity:           number;
  unit_price:         number;
  line_total:         number;
  contract_term:      'monthly' | 'yearly';
  purchased_at:       string;
  paystack_reference: string | null;
}

interface ResolvedLine {
  displayName:  string;
  sageCode:     string;
  unit:         string;
  quantity:     number;
  unitPrice:    number;
  lineTotal:    number;
  billingPeriod: 'monthly' | 'annual' | 'once-off';
  purchasedAt:  string;
  reference:    string | null;
}

interface PurchaseGroup {
  reference:    string | null;   // null = legacy
  purchasedAt:  string;
  lines:        ResolvedLine[];
  groupTotal:   number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

function normaliseEntries(raw: unknown): NormEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): NormEntry | null => {
      if (typeof entry === 'string') {
        return {
          service_id: entry, plan_id: '', quantity: 1,
          unit_price: 0, line_total: 0, contract_term: 'monthly',
          purchased_at: '', paystack_reference: null,
        };
      }
      if (entry && typeof entry === 'object' && 'service_id' in entry) {
        const e = entry as Record<string, unknown>;
        return {
          service_id:         String(e.service_id ?? ''),
          plan_id:            String(e.plan_id    ?? ''),
          label:              typeof e.label      === 'string' ? e.label      : undefined,
          quantity:           typeof e.quantity   === 'number' ? e.quantity   : 1,
          unit_price:         typeof e.unit_price === 'number' ? e.unit_price : 0,
          line_total:         typeof e.line_total === 'number' ? e.line_total : 0,
          contract_term:      e.contract_term === 'yearly'     ? 'yearly'     : 'monthly',
          purchased_at:       typeof e.purchased_at        === 'string' ? e.purchased_at        : '',
          paystack_reference: typeof e.paystack_reference  === 'string' ? e.paystack_reference  : null,
        };
      }
      return null;
    })
    .filter((e): e is NormEntry => e !== null && Boolean(e.service_id));
}

/** Strip billing-period suffixes for a clean short label */
function shortLabel(full: string): string {
  return full
    .replace(/\s*[—–-]\s*(M2M|12 Month|Monthly|Annual)\s*/gi, '')
    .replace(/\s*\/\s*Google Workspace/i, '')
    .replace(/\s*\(M2M\)|\s*\(12 Month\)/gi, '')
    .trim();
}

function resolveLineDisplay(e: NormEntry): ResolvedLine {
  const billingPeriod: 'monthly' | 'annual' | 'once-off' =
    e.contract_term === 'yearly' ? 'annual' : 'monthly';

  // 1 ─ New catalog entries: look up by service_id + plan_id
  if (isSelfServeService(e.service_id)) {
    const cat = getProductEntry(e.service_id, e.plan_id);
    if (cat) {
      return {
        displayName:  shortLabel(cat.label),
        sageCode:     cat.product_code,
        unit:         cat.unit,
        quantity:     e.quantity,
        unitPrice:    e.unit_price  || cat.unitPrice,
        lineTotal:    e.line_total  || cat.unitPrice * e.quantity,
        billingPeriod: cat.billingPeriod,
        purchasedAt:  e.purchased_at,
        reference:    e.paystack_reference,
      };
    }
  }

  // 2 ─ Semi-new: has a label stored on the entry itself
  if (e.label) {
    return {
      displayName:  shortLabel(e.label),
      sageCode:     e.plan_id || e.service_id,
      unit:         'unit',
      quantity:     e.quantity,
      unitPrice:    e.unit_price,
      lineTotal:    e.line_total || e.unit_price * e.quantity,
      billingPeriod,
      purchasedAt:  e.purchased_at,
      reference:    e.paystack_reference,
    };
  }

  // 3 ─ POPIA service lookup by code stored in service_id
  const popiaMatch = POPIA_SERVICES.find(
    s => s.code === e.service_id || s.code === e.plan_id,
  );
  if (popiaMatch) {
    return {
      displayName:  popiaMatch.name,
      sageCode:     popiaMatch.code,
      unit:         'engagement',
      quantity:     e.quantity,
      unitPrice:    e.unit_price || popiaMatch.price,
      lineTotal:    e.line_total || popiaMatch.price * e.quantity,
      billingPeriod: popiaMatch.type === 'recurring' ? 'monthly' : 'once-off',
      purchasedAt:  e.purchased_at,
      reference:    e.paystack_reference,
    };
  }

  // 4 ─ Legacy fallback
  const LEGACY_LABELS: Record<string, string> = {
    'druva-m365':      'Druva M365 Backup',
    'druva-endpoint':  'Druva Endpoint Protection',
    'druva-server':    'Druva Server Backup',
    'maas360':         'MaaS360 MDM',
  };
  return {
    displayName:  LEGACY_LABELS[e.service_id] ?? e.service_id,
    sageCode:     e.plan_id || '—',
    unit:         'unit',
    quantity:     e.quantity,
    unitPrice:    e.unit_price,
    lineTotal:    e.line_total || e.unit_price * e.quantity,
    billingPeriod,
    purchasedAt:  e.purchased_at,
    reference:    e.paystack_reference,
  };
}

/**
 * Groups resolved lines by Paystack reference.
 * Lines with no reference are collected into a single "legacy" group.
 */
function groupByReference(lines: ResolvedLine[]): PurchaseGroup[] {
  const map = new Map<string, PurchaseGroup>();

  for (const line of lines) {
    const key = line.reference ?? '__legacy__';
    if (!map.has(key)) {
      map.set(key, {
        reference:   line.reference,
        purchasedAt: line.purchasedAt,
        lines:       [],
        groupTotal:  0,
      });
    }
    const group = map.get(key)!;
    group.lines.push(line);
    group.groupTotal += line.lineTotal;
    // Use the most recent purchasedAt within the group
    if (line.purchasedAt > group.purchasedAt) {
      group.purchasedAt = line.purchasedAt;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.purchasedAt || '').localeCompare(a.purchasedAt || ''),
  );
}

/** Monthly commitment = sum of monthly line totals + annual line totals ÷ 12 */
function calcMonthlyCommitment(lines: ResolvedLine[]): number {
  return lines.reduce((sum, l) => {
    if (l.billingPeriod === 'monthly')  return sum + l.lineTotal;
    if (l.billingPeriod === 'annual')   return sum + l.lineTotal / 12;
    return sum; // once-off — not included
  }, 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
    active:    { label: 'Active',    icon: CheckCircle, className: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
    past_due:  { label: 'Past Due',  icon: Clock,       className: 'text-amber-400  border-amber-400/30  bg-amber-400/10'  },
    inactive:  { label: 'Inactive',  icon: XCircle,     className: 'text-red-400    border-red-400/30    bg-red-400/10'    },
    cancelled: { label: 'Cancelled', icon: XCircle,     className: 'text-red-400    border-red-400/30    bg-red-400/10'    },
  };
  const cfg  = map[status] ?? map.inactive;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 border ${cfg.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function BillingPeriodBadge({ period }: { period: 'monthly' | 'annual' | 'once-off' }) {
  const cfg = {
    monthly:  { label: 'Monthly',  className: 'text-blue-400   border-blue-400/30   bg-blue-400/10'   },
    annual:   { label: 'Annual',   className: 'text-violet-400 border-violet-400/30 bg-violet-400/10' },
    'once-off': { label: 'Once-off', className: 'text-teal-400  border-teal-400/30   bg-teal-400/10'   },
  }[period];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; welcome?: string }>;
}) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?redirect=/billing');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan_status, current_period_end, full_name, subscribed_services')
    .eq('id', user.id)
    .single();

  const profile = profileData as Pick<
    Profile,
    'plan_status' | 'current_period_end' | 'full_name' | 'subscribed_services'
  > | null;

  const planStatus = profile?.plan_status ?? 'inactive';
  const { reason, welcome } = await searchParams;

  // Resolve all purchase entries
  const normEntries = normaliseEntries(profile?.subscribed_services);
  const resolvedLines = normEntries.map(resolveLineDisplay);
  const purchaseGroups = groupByReference(resolvedLines);
  const monthlyCommitment = calcMonthlyCommitment(resolvedLines);
  const totalProducts = normEntries.length;

  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="py-12 md:py-20">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Account
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Billing &amp; Purchases
          </h1>
          <p className="text-montana-muted">{profile?.full_name ?? user.email}</p>
        </div>

        {/* ── Banners ────────────────────────────────────────────────────── */}
        {welcome === '1' && (
          <div className="flex items-start gap-3 p-4 border border-emerald-400/20 bg-emerald-400/5 mb-8">
            <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300 mb-0.5">Payment received — welcome aboard!</p>
              <p className="text-xs text-emerald-400/70">
                Your purchase has been logged. Your products are now active in the portal.
              </p>
            </div>
          </div>
        )}

        {reason === 'inactive' && planStatus !== 'active' && (
          <div className="flex items-start gap-3 p-4 border border-amber-400/20 bg-amber-400/5 mb-8">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">
              Your account is not currently active. Add products below to get started.
            </p>
          </div>
        )}

        {reason === 'setup' && (
          <div className="flex items-start gap-3 p-4 border border-blue-400/20 bg-blue-400/5 mb-8">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-0.5">Account setup in progress</p>
              <p className="text-xs text-blue-400/70">
                Your profile is still being configured. If this persists contact{' '}
                <a href="mailto:support@montanadc.com" className="underline">support@montanadc.com</a>.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Profile Status',
              value: <PlanBadge status={planStatus} />,
              icon: CheckCircle,
            },
            {
              label: 'Active Since',
              value: <span className="text-lg font-bold text-white">{formatZAR(monthlyCommitment)}</span>,
              icon: CreditCard,
            },
            {
              label: 'Customer Since',
              value: <span className="text-sm font-semibold text-white">{formatDate(profile?.current_period_end)}</span>,
              icon: Calendar,
            },
            {
              label: 'Total Products',
              value: <span className="text-lg font-bold text-white">{totalProducts}</span>,
              icon: Package,
            },
          ].map(({ label, value, icon: Icon }) => (
            <GlassCard key={label} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3.5 w-3.5 text-montana-muted/60" />
                <p className="text-[10px] uppercase tracking-wider text-montana-muted/60">{label}</p>
              </div>
              {value}
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main: purchase history ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="h-4 w-4 text-montana-pink" />
                Purchase History
              </h2>
              <Link
                href="/pos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-montana-pink hover:text-montana-pink/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Products
              </Link>
            </div>

            {purchaseGroups.length === 0 ? (
              /* Empty state */
              <GlassCard className="p-10 flex flex-col items-center text-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center bg-montana-surface border border-white/10">
                  <ShoppingBag className="h-6 w-6 text-montana-muted/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">No purchases yet</p>
                  <p className="text-xs text-montana-muted/60 max-w-xs">
                    Head to the product configurator to build your solution and complete your first purchase.
                  </p>
                </div>
                <Link
                  href="/pos"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-montana-pink text-white hover:bg-montana-pink/90 transition-colors"
                >
                  Build Your Solution
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassCard>
            ) : (
              purchaseGroups.map((group, gi) => (
                <GlassCard key={group.reference ?? `legacy-${gi}`} className="overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <Tag className="h-3.5 w-3.5 text-montana-muted/50 shrink-0" />
                      <div>
                        <p className="text-[11px] text-montana-muted/60 uppercase tracking-wider">
                          {group.reference ? 'Transaction' : 'Legacy purchases'}
                        </p>
                        {group.reference && (
                          <p className="text-xs font-mono text-white/60">{group.reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-montana-muted/60 uppercase tracking-wider">Date</p>
                      <p className="text-xs text-white/60">{formatDate(group.purchasedAt)}</p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="divide-y divide-white/5">
                    {group.lines.map((line, li) => (
                      <div key={li} className="px-5 py-4 flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-montana-pink/10 border border-montana-pink/20 mt-0.5">
                          <Package className="h-3.5 w-3.5 text-montana-pink" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-white truncate">{line.displayName}</p>
                            <BillingPeriodBadge period={line.billingPeriod} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-montana-muted/60">
                            <span>Sage: <span className="font-mono text-montana-muted/80">{line.sageCode}</span></span>
                            <span>
                              {line.quantity} {line.unit}{line.quantity !== 1 ? 's' : ''}
                              {' @ '}{formatZAR(line.unitPrice)}/{line.billingPeriod === 'once-off' ? 'once' : line.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">{formatZAR(line.lineTotal)}</p>
                          <p className="text-[10px] text-montana-muted/50">
                            {line.billingPeriod === 'annual' ? 'per year' : line.billingPeriod === 'once-off' ? 'once-off' : 'per month'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Group total */}
                  {group.lines.length > 1 && (
                    <div className="flex justify-between items-center px-5 py-3 border-t border-white/5 bg-white/[0.02]">
                      <span className="text-xs text-montana-muted/60 uppercase tracking-wider">Transaction Total</span>
                      <span className="text-sm font-bold text-white">{formatZAR(group.groupTotal)}</span>
                    </div>
                  )}
                </GlassCard>
              ))
            )}

            {/* Add more products CTA */}
            {purchaseGroups.length > 0 && (
              <Link
                href="/pos"
                className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/10 text-sm text-montana-muted/60 hover:text-white hover:border-white/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add more products
              </Link>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Monthly summary */}
            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-montana-muted/60 mb-4 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />
                Monthly Summary
              </h3>
              <div className="space-y-2 mb-4">
                {resolvedLines.filter(l => l.billingPeriod === 'monthly').length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-montana-muted/60">Monthly billing</span>
                    <span className="text-white">
                      {formatZAR(resolvedLines.filter(l => l.billingPeriod === 'monthly').reduce((s, l) => s + l.lineTotal, 0))}
                    </span>
                  </div>
                )}
                {resolvedLines.filter(l => l.billingPeriod === 'annual').length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-montana-muted/60">Annual ÷ 12</span>
                    <span className="text-white">
                      {formatZAR(resolvedLines.filter(l => l.billingPeriod === 'annual').reduce((s, l) => s + l.lineTotal / 12, 0))}
                    </span>
                  </div>
                )}
                {resolvedLines.filter(l => l.billingPeriod === 'once-off').length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-montana-muted/60">Once-off purchases</span>
                    <span className="text-white/40">not included</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-xs text-montana-muted/60 uppercase tracking-wider">Est. monthly</span>
                <span className="text-xl font-bold text-white">{formatZAR(monthlyCommitment)}</span>
              </div>
            </GlassCard>

            {/* Sage invoicing note */}
            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-montana-muted/60 mb-3 flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5" />
                About Invoicing
              </h3>
              <p className="text-xs text-montana-muted/70 leading-relaxed mb-3">
                Recurring invoices are generated and managed via Sage. You will receive monthly or annual tax invoices directly by email from our accounts team.
              </p>
              <p className="text-xs text-montana-muted/70 leading-relaxed">
                For billing queries, updated payment details, or to cancel a service, contact us directly.
              </p>
            </GlassCard>

            {/* Plan status */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-montana-muted/60">Plan Status</h3>
                <PlanBadge status={planStatus} />
              </div>
              {profile?.current_period_end && (
                <p className="text-xs text-montana-muted/60 mb-4">
                  Contract end: <span className="text-white/70">{formatDate(profile.current_period_end)}</span>
                </p>
              )}
              {planStatus !== 'active' && (
                <Link
                  href="/pos"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold bg-montana-pink text-white hover:bg-montana-pink/90 transition-colors"
                >
                  Subscribe Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </GlassCard>

            {/* Support */}
            <GlassCard className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-montana-muted/60 mb-3">Need Help?</h3>
              <p className="text-xs text-montana-muted/70 leading-relaxed mb-3">
                Contact our team for billing support, service changes, or account queries.
              </p>
              <div className="space-y-1">
                <a
                  href="mailto:support@montanadc.com"
                  className="block text-xs text-montana-pink hover:underline"
                >
                  support@montanadc.com
                </a>
                <a
                  href="tel:+27871883843"
                  className="block text-xs text-montana-pink hover:underline"
                >
                  +27 (0)87 188 3843
                </a>
              </div>
            </GlassCard>

          </div>
        </div>

      </div>
    </div>
  );
}
