/**
 * /portal — Client Dashboard (Server Component)
 *
 * The authenticated "home base" for Montana Data Company clients.
 *
 * Sections:
 *   1. Greeting header — name, company, plan status, quick actions
 *   2. Stats bar — status, monthly commitment, contract end, product count
 *   3. Active Products + Billing sidebar (2/3 + 1/3 grid)
 *   4. Security Snapshot (POPIA assessment data)
 *   5. Organisation Profile form
 *   6. Support Ticket form
 */

import { redirect }   from 'next/navigation';
import Link           from 'next/link';
import {
  Cloud, Monitor, HardDrive, Smartphone,
  FileText, Server, ShieldAlert, Archive, Activity, Lock,
  CreditCard, AlertTriangle, CheckCircle2, XCircle,
  Clock, ChevronRight, Zap, BarChart3, Shield, FileCheck,
  Plus, Package,
} from 'lucide-react';
import { createServerClient }    from '@/lib/supabase/server';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedButton }        from '@/components/ui/animated-button';
import { SupportForm }           from './support-form';
import { ProfileForm }           from './profile-form';
import { ContactDetailsForm }    from './contact-details-form';
import type { Profile, PlanStatus } from '@/lib/supabase/types';
import type { Metadata }         from 'next';
import {
  PAYSTACK_PRODUCT_MAP,
  getProductEntry,
  isSelfServeService,
  formatZAR,
} from '@/lib/paystack-products';
import { POPIA_SERVICES } from '@/lib/popia-services';

export const metadata: Metadata = {
  title:  'Client Portal | Montana Data Company',
  robots: { index: false, follow: false },
};

// ─── Purchase entry type (normalised from all historical shapes) ──────────────

type PurchaseEntry = {
  service_id:         string;
  plan_id:            string;
  label:              string | null;
  quantity:           number;
  unit_price:         number;
  line_total:         number;
  contract_term:      'monthly' | 'yearly' | null;
  purchased_at:       string | null;
  paystack_reference: string | null;
};

// ─── Service icon map ─────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'druva-m365':     <Cloud      className="h-4 w-4" />,
  'druva-endpoint': <Monitor    className="h-4 w-4" />,
  'druva-server':   <HardDrive  className="h-4 w-4" />,
  'maas360':        <Smartphone className="h-4 w-4" />,
  'popia':          <FileText   className="h-4 w-4" />,
  'ibm-backup':     <Server     className="h-4 w-4" />,
  'ransomware':     <ShieldAlert className="h-4 w-4" />,
  'archive':        <Archive    className="h-4 w-4" />,
  'guardium':       <Activity   className="h-4 w-4" />,
  'quantum':        <Lock       className="h-4 w-4" />,
};

// Legacy service key aliases
const LEGACY_SERVICE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  'ibm-enterprise-backup': { label: 'IBM Enterprise Backup',         icon: <Server      className="h-4 w-4" /> },
  'druva-m365':            { label: 'Druva M365 / Google Workspace', icon: <Cloud       className="h-4 w-4" /> },
  'druva-endpoint':        { label: 'Druva Endpoint Protection',     icon: <Monitor     className="h-4 w-4" /> },
  'druva-hybrid':          { label: 'Druva Hybrid Server Backup',    icon: <HardDrive   className="h-4 w-4" /> },
  'druva-server':          { label: 'Druva Hybrid Server Backup',    icon: <HardDrive   className="h-4 w-4" /> },
  'ransomware':            { label: 'Ransomware Protection',         icon: <ShieldAlert className="h-4 w-4" /> },
  'archive':               { label: 'Archive & Lifecycle',           icon: <Archive     className="h-4 w-4" /> },
  'maas360':               { label: 'MaaS360 (MDM / UEM)',           icon: <Smartphone  className="h-4 w-4" /> },
  'guardium':              { label: 'IBM Guardium',                  icon: <Activity    className="h-4 w-4" /> },
  'popia-consulting':      { label: 'POPIA Consulting',              icon: <FileText    className="h-4 w-4" /> },
  'quantum-security':      { label: 'Quantum Security (PQC)',        icon: <Lock        className="h-4 w-4" /> },
};

// ─── Rich entry resolver ──────────────────────────────────────────────────────

/**
 * Resolves a stored entry to display-ready values using the product catalog.
 * Handles three historical entry shapes gracefully.
 */
function resolveEntryDisplay(entry: PurchaseEntry): {
  displayLabel:  string;
  shortLabel:    string;
  sageCode:      string | null;
  unitLabel:     string;
  billingPeriod: 'monthly' | 'annual' | null;
  icon:          React.ReactNode;
} {
  // ── Shape 1: New format — service_id is a real service ID ─────────────────
  if (isSelfServeService(entry.service_id)) {
    const catalogEntry = getProductEntry(entry.service_id, entry.plan_id);
    if (catalogEntry) {
      return {
        displayLabel:  catalogEntry.label,
        shortLabel:    shortLabelFrom(catalogEntry.label),
        sageCode:      catalogEntry.product_code,
        unitLabel:     catalogEntry.unit,
        billingPeriod: catalogEntry.billingPeriod,
        icon:          SERVICE_ICONS[entry.service_id] ?? <Package className="h-4 w-4" />,
      };
    }
  }

  // ── Shape 2: entry.label is stored (post-productize, pre-service_id fix) ──
  if (entry.label) {
    const icon = SERVICE_ICONS[entry.service_id]
      ?? inferIconFromLabel(entry.label)
      ?? <Package className="h-4 w-4" />;
    return {
      displayLabel:  entry.label,
      shortLabel:    shortLabelFrom(entry.label),
      sageCode:      entry.plan_id.length <= 12 ? entry.plan_id : null, // plan_id was Sage code
      unitLabel:     inferUnitFromLabel(entry.label),
      billingPeriod: entry.contract_term === 'yearly' ? 'annual' : entry.contract_term,
      icon,
    };
  }

  // ── Shape 3: POPIA service lookup by Sage code ─────────────────────────────
  const popiaService = POPIA_SERVICES.find(
    s => s.code === entry.service_id || s.code === entry.plan_id,
  );
  if (popiaService) {
    return {
      displayLabel:  popiaService.name,
      shortLabel:    popiaService.name,
      sageCode:      popiaService.code,
      unitLabel:     'engagement',
      billingPeriod: popiaService.type === 'recurring' ? 'monthly' : null,
      icon:          <FileText className="h-4 w-4" />,
    };
  }

  // ── Shape 4: Legacy service key ────────────────────────────────────────────
  const legacy = LEGACY_SERVICE_LABELS[entry.service_id];
  if (legacy) {
    return {
      displayLabel:  legacy.label,
      shortLabel:    legacy.label,
      sageCode:      null,
      unitLabel:     'service',
      billingPeriod: entry.contract_term === 'yearly' ? 'annual' : entry.contract_term,
      icon:          legacy.icon,
    };
  }

  // ── Fallback: use raw service_id ────────────────────────────────────────────
  return {
    displayLabel:  entry.service_id,
    shortLabel:    entry.service_id,
    sageCode:      null,
    unitLabel:     'unit',
    billingPeriod: entry.contract_term === 'yearly' ? 'annual' : entry.contract_term,
    icon:          <Package className="h-4 w-4" />,
  };
}

function shortLabelFrom(label: string): string {
  // "Druva M365 / Google Workspace — 50GB Standard (M2M)" → "Druva M365 — 50GB Standard"
  return label
    .replace(' / Google Workspace', '')
    .replace(' (M2M)', '')
    .replace(' (12 Month)', '')
    .replace(' (Monthly)', '')
    .replace(' (Annual)', '');
}

function inferUnitFromLabel(label: string): string {
  if (/endpoint/i.test(label))  return 'endpoint';
  if (/server/i.test(label))    return 'server';
  if (/device/i.test(label))    return 'device';
  return 'user';
}

function inferIconFromLabel(label: string): React.ReactNode | null {
  if (/m365|workspace|microsoft/i.test(label)) return <Cloud       className="h-4 w-4" />;
  if (/endpoint/i.test(label))                  return <Monitor     className="h-4 w-4" />;
  if (/server/i.test(label))                    return <HardDrive   className="h-4 w-4" />;
  if (/maas360|mdm|uem/i.test(label))           return <Smartphone  className="h-4 w-4" />;
  if (/popia|compliance/i.test(label))          return <FileText    className="h-4 w-4" />;
  if (/ransomware/i.test(label))                return <ShieldAlert className="h-4 w-4" />;
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PlanStatus, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  icon:   React.ReactNode;
}> = {
  active: {
    label:  'Active',
    color:  'text-emerald-400',
    bg:     'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    icon:   <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  },
  inactive: {
    label:  'Inactive',
    color:  'text-montana-muted',
    bg:     'bg-white/5',
    border: 'border-white/10',
    icon:   <XCircle className="h-4 w-4 text-montana-muted" />,
  },
  past_due: {
    label:  'Payment Due',
    color:  'text-amber-400',
    bg:     'bg-amber-400/10',
    border: 'border-amber-400/30',
    icon:   <AlertTriangle className="h-4 w-4 text-amber-400" />,
  },
  cancelled: {
    label:  'Cancelled',
    color:  'text-red-400',
    bg:     'bg-red-400/10',
    border: 'border-red-400/30',
    icon:   <XCircle className="h-4 w-4 text-red-400" />,
  },
};

function StatusBadge({ status }: { status: PlanStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PortalPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?redirect=/portal');

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[portal] Profile fetch error:', profileError.message);
  }

  const profile = profileData as Profile | null;
  if (!profile) redirect('/billing?reason=setup');

  const status    = profile.plan_status;
  const statusCfg = STATUS_CONFIG[status];

  // ── Normalise subscribed_services ─────────────────────────────────────────
  const purchases: PurchaseEntry[] = Array.isArray(profile.subscribed_services)
    ? (profile.subscribed_services as Array<unknown>)
        .map((s): PurchaseEntry | null => {
          if (typeof s === 'string') {
            return { service_id: s, plan_id: '', label: null, quantity: 1, unit_price: 0, line_total: 0, contract_term: null, purchased_at: null, paystack_reference: null };
          }
          if (s && typeof s === 'object' && 'service_id' in s) {
            const e = s as Record<string, unknown>;
            return {
              service_id:         String(e.service_id ?? ''),
              plan_id:            String(e.plan_id ?? ''),
              label:              typeof e.label === 'string' ? e.label : null,
              quantity:           typeof e.quantity   === 'number' ? e.quantity   : 1,
              unit_price:         typeof e.unit_price === 'number' ? e.unit_price : 0,
              line_total:         typeof e.line_total === 'number' ? e.line_total : 0,
              contract_term:      e.contract_term === 'yearly' ? 'yearly'
                                : e.contract_term === 'monthly' ? 'monthly'
                                : e.billing_cycle === 'yearly'  ? 'yearly'
                                : e.billing_cycle === 'monthly' ? 'monthly'
                                : null,
              purchased_at:       typeof e.purchased_at === 'string' ? e.purchased_at : null,
              paystack_reference: typeof e.paystack_reference === 'string' ? e.paystack_reference : null,
            };
          }
          return null;
        })
        .filter((e): e is PurchaseEntry => e !== null && Boolean(e.service_id))
    : [];

  // ── Computed stats ─────────────────────────────────────────────────────────
  const monthlyCommitment = purchases.reduce((sum, e) => {
    if (e.contract_term === 'yearly') {
      // Annual entries: line_total is the annual price — express as monthly equivalent
      return sum + (e.line_total / 12);
    }
    return sum + e.line_total;
  }, 0);

  const displayName    = profile.full_name    ?? user.email?.split('@')[0] ?? 'Client';
  const displayCompany = profile.company_name ?? '';

  return (
    <main className="min-h-screen bg-montana-bg pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">

        {/* ── 1. Greeting ───────────────────────────────────────────────────── */}
        <div className="pt-10 pb-8 md:pt-14 md:pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/5">
          <div>
            <p className="text-montana-pink text-xs font-semibold uppercase tracking-widest mb-2">Client Portal</p>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
              Welcome back, {displayName}
            </h1>
            {displayCompany && (
              <p className="text-montana-muted mt-1">{displayCompany}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* ── 2. Stats bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 mb-2">
          <SpotlightCard customSize className="p-4">
            <p className="text-xs text-montana-muted uppercase tracking-wider mb-1.5">Profile Status</p>
            <div className="flex items-center gap-2">
              {statusCfg.icon}
              <span className={`text-base font-bold ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>
          </SpotlightCard>

          <SpotlightCard customSize className="p-4">
            <p className="text-xs text-montana-muted uppercase tracking-wider mb-1.5">Active Since</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-montana-pink shrink-0" />
              <span className="text-base font-bold text-white">
                {(profile as unknown as Record<string, unknown>).created_at
                  ? new Date((profile as unknown as Record<string, unknown>).created_at as string).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </SpotlightCard>

          <SpotlightCard customSize className="p-4">
            <p className="text-xs text-montana-muted uppercase tracking-wider mb-1.5">Customer Since</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-montana-muted shrink-0" />
              <span className="text-base font-bold text-white">
                {purchases.length > 0
                  ? formatDate(purchases.reduce<string | null>((earliest, p) => {
                      if (!p.purchased_at) return earliest;
                      if (!earliest) return p.purchased_at;
                      return p.purchased_at < earliest ? p.purchased_at : earliest;
                    }, null))
                  : '—'}
              </span>
            </div>
          </SpotlightCard>

          <SpotlightCard customSize className="p-4">
            <p className="text-xs text-montana-muted uppercase tracking-wider mb-1.5">Products</p>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-montana-pink shrink-0" />
              <span className="text-base font-bold text-white">
                {purchases.length > 0
                  ? `${purchases.length} purchase${purchases.length !== 1 ? 's' : ''}`
                  : 'None yet'}
              </span>
            </div>
          </SpotlightCard>
        </div>

        {/* ── 3. Active Products + Billing sidebar ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Active Products — 2/3 width */}
          <SpotlightCard customSize className="lg:col-span-2 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-montana-pink" />
                <h2 className="text-base font-semibold text-white">Active Products</h2>
              </div>
              {purchases.length > 0 && (
                <Link href="/pos">
                  <AnimatedButton variant="outline" className="text-xs py-1.5 px-3 gap-1.5">
                    <Plus className="h-3 w-3" />
                    Add More
                  </AnimatedButton>
                </Link>
              )}
            </div>

            {purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
                  <Zap className="h-6 w-6 text-montana-muted" />
                </div>
                <p className="text-sm text-montana-muted mb-1">No products activated yet.</p>
                <p className="text-xs text-montana-muted/60 mb-4">Configure and purchase cloud backup or consulting services.</p>
                <Link href="/pos">
                  <AnimatedButton variant="primary" className="text-sm py-2 px-5">
                    Browse Products
                  </AnimatedButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((entry, idx) => {
                  const resolved = resolveEntryDisplay(entry);
                  const isServer = resolved.unitLabel === 'server';
                  const billingLabel = resolved.billingPeriod === 'annual' ? 'Annual' : resolved.billingPeriod === 'monthly' ? 'M2M' : null;

                  return (
                    <div
                      key={`${entry.service_id}-${entry.plan_id}-${idx}`}
                      className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-montana-pink/10 border border-montana-pink/20 text-montana-pink mt-0.5">
                        {resolved.icon}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-white leading-tight">
                              {resolved.shortLabel}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {resolved.sageCode && (
                                <span className="text-[10px] font-mono text-montana-muted/60 bg-white/5 px-1.5 py-0.5 border border-white/5">
                                  {resolved.sageCode}
                                </span>
                              )}
                              {!isServer && entry.quantity > 1 && (
                                <span className="text-xs text-montana-muted">
                                  {entry.quantity} {resolved.unitLabel}s
                                </span>
                              )}
                              {billingLabel && (
                                <span className="text-xs text-montana-muted/70">{billingLabel}</span>
                              )}
                              {entry.purchased_at && (
                                <span className="text-xs text-montana-muted/50">
                                  Purchased {formatDate(entry.purchased_at)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pricing + status */}
                          <div className="text-right shrink-0">
                            {entry.line_total > 0 && (
                              <>
                                {!isServer && entry.unit_price > 0 && entry.quantity > 1 && (
                                  <p className="text-[10px] text-montana-muted/60 font-mono">
                                    {formatZAR(entry.unit_price)}/{resolved.unitLabel} × {entry.quantity}
                                  </p>
                                )}
                                <p className="text-sm font-bold text-white font-mono">
                                  {formatZAR(entry.line_total)}
                                  <span className="text-xs font-normal text-montana-muted">
                                    /{resolved.billingPeriod === 'annual' ? 'yr' : 'mo'}
                                  </span>
                                </p>
                              </>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monthly total footer */}
            {purchases.length > 0 && monthlyCommitment > 0 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                <span className="text-xs text-montana-muted">Monthly equivalent (ex VAT)</span>
                <span className="text-sm font-bold text-montana-pink font-mono">
                  {formatZAR(monthlyCommitment)}/mo
                </span>
              </div>
            )}
          </SpotlightCard>

          {/* Billing sidebar — 1/3 width */}
          <SpotlightCard customSize className="p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-montana-pink" />
              <h2 className="text-base font-semibold text-white">Billing</h2>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <p className="text-xs text-montana-muted mb-1.5">Status</p>
                <StatusBadge status={status} />
              </div>
              <div>
                <p className="text-xs text-montana-muted mb-1">Customer Since</p>
                <p className="text-sm font-semibold text-white">
                  {purchases.length > 0
                    ? formatDate(purchases.reduce<string | null>((earliest, p) => {
                        if (!p.purchased_at) return earliest;
                        if (!earliest) return p.purchased_at;
                        return p.purchased_at < earliest ? p.purchased_at : earliest;
                      }, null))
                    : '—'}
                </p>
              </div>
              {monthlyCommitment > 0 && (
                <div>
                  <p className="text-xs text-montana-muted mb-1">Active Since</p>
                  <p className="text-sm font-semibold text-white font-mono">
                    {formatZAR(monthlyCommitment)}/mo
                    <span className="text-xs font-normal text-montana-muted ml-1">ex VAT</span>
                  </p>
                  <p className="text-xs text-montana-muted/60 mt-1">Invoiced via Sage</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2 pt-4 border-t border-white/5">
              {status === 'past_due' && (
                <Link href="/billing" className="block">
                  <AnimatedButton variant="primary" className="w-full text-sm py-2.5">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Resolve Payment
                  </AnimatedButton>
                </Link>
              )}
              <Link href="/billing" className="flex items-center justify-between text-sm text-montana-muted hover:text-white transition-colors py-1.5">
                <span>View Billing Details</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/pos" className="flex items-center justify-between text-sm text-montana-muted hover:text-white transition-colors py-1.5">
                <span>Add More Products</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/pos?tab=consulting" className="flex items-center justify-between text-sm text-montana-muted hover:text-white transition-colors py-1.5">
                <span>Book Consulting</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* ── 4. Security Snapshot ──────────────────────────────────────────── */}
        <SpotlightCard customSize className="p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-montana-pink" />
              <h2 className="text-base font-semibold text-white">Security Snapshot</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/assessments/popia"     className="text-xs text-montana-pink hover:underline">Run POPIA Assessment →</Link>
              <span className="text-montana-muted/30">|</span>
              <Link href="/assessments/security"  className="text-xs text-montana-pink hover:underline">Security Assessment →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-montana-muted uppercase tracking-wider mb-2">Risk Posture</p>
              {profile.popia_risk_level ? (
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    profile.popia_risk_level === 'low' ? 'bg-emerald-400' :
                    profile.popia_risk_level === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                  }`} />
                  <span className={`text-sm font-semibold capitalize ${
                    profile.popia_risk_level === 'low' ? 'text-emerald-400' :
                    profile.popia_risk_level === 'medium' ? 'text-amber-400' : 'text-red-400'
                  }`}>{profile.popia_risk_level} Risk</span>
                </div>
              ) : (
                <p className="text-sm text-montana-muted/60 italic">Run an assessment to see your risk level.</p>
              )}
            </div>

            <div className="border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-montana-muted uppercase tracking-wider mb-2">POPIA Score</p>
              {profile.popia_score !== null && profile.popia_score !== undefined ? (
                <div>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className="text-2xl font-bold text-white">{profile.popia_score}</span>
                    <span className="text-sm text-montana-muted/60 pb-0.5">/ 20</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.popia_risk_level === 'low' ? 'bg-emerald-400' :
                        profile.popia_risk_level === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${(profile.popia_score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-montana-muted/60 italic">No assessment data yet.</p>
              )}
            </div>

            <div className="border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-montana-muted uppercase tracking-wider mb-2">Last Assessment</p>
              <p className={`text-sm font-semibold ${profile.last_popia_assessment_at ? 'text-white' : 'text-montana-muted/60 italic'}`}>
                {profile.last_popia_assessment_at ? formatDate(profile.last_popia_assessment_at) : 'Never'}
              </p>
              {!profile.last_popia_assessment_at && (
                <Link href="/assessments/popia" className="text-xs text-montana-pink hover:underline mt-2 block">
                  Start assessment →
                </Link>
              )}
            </div>
          </div>
        </SpotlightCard>

        {/* ── 5. Organisation Profile ───────────────────────────────────────── */}
        <SpotlightCard customSize className="p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="h-5 w-5 text-montana-pink" />
            <h2 className="text-base font-semibold text-white">Organisation Profile</h2>
          </div>
          <p className="text-sm text-montana-muted mb-6">
            Keep your details up to date. These appear on invoices and compliance reports.
          </p>
          <ProfileForm
            initialData={{
              fullName:    profile.full_name    ?? '',
              companyName: profile.company_name ?? '',
              companySize: profile.company_size ?? '',
              industry:    profile.industry     ?? '',
            }}
          />
        </SpotlightCard>

        {/* ── 6. Contact Details ────────────────────────────────────────────── */}
        <SpotlightCard customSize className="p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="h-5 w-5 text-montana-pink" />
            <h2 className="text-base font-semibold text-white">Contact Details</h2>
          </div>
          <p className="text-sm text-montana-muted mb-6">
            Optional — used for invoice delivery, service communications, and on-site support.
          </p>
          <ContactDetailsForm
            initialData={{
              email:        (profile as unknown as Record<string, unknown>).email as string ?? '',
              phone:        (profile as unknown as Record<string, unknown>).phone as string ?? '',
              addressLine1: (profile as unknown as Record<string, unknown>).address_line1 as string ?? '',
              city:         (profile as unknown as Record<string, unknown>).city as string ?? '',
              province:     (profile as unknown as Record<string, unknown>).province as string ?? '',
              postalCode:   (profile as unknown as Record<string, unknown>).postal_code as string ?? '',
            }}
          />
        </SpotlightCard>

        {/* ── 7. Support ────────────────────────────────────────────────────── */}
        <SpotlightCard customSize className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-montana-pink" />
            <h2 className="text-base font-semibold text-white">Raise a Support Ticket</h2>
          </div>
          <SupportForm />
        </SpotlightCard>

      </div>
    </main>
  );
}
