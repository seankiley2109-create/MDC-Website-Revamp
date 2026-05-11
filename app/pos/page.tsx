"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { CartLineItem } from "@/app/api/subscribe/route";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
  Cloud, Monitor, HardDrive, Smartphone, Mail, LayoutGrid,
  FileText, Server, ShieldAlert, Archive, Activity, Lock,
  CheckCircle2, AlertCircle, ShoppingCart, ChevronDown, ChevronUp,
  ArrowRight, Minus, Plus, X, Info,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import {
  PAYSTACK_PRODUCT_MAP,
  SERVICE_DIMENSIONS,
  getProductEntry,
  getAnnualSaving,
  isSelfServeService,
  formatZAR,
  type SelfServeServiceId,
  type BillingPeriod,
  type ProtectionLevel,
} from "@/lib/paystack-products";
import { POPIA_SERVICES } from "@/lib/popia-services";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "cloud" | "consulting" | "enterprise";

interface ServiceConfig {
  storageTier:     string;
  protectionLevel: ProtectionLevel;
  billingPeriod:   BillingPeriod;
  quantity:        number;
}

interface CartItem {
  serviceId: SelfServeServiceId;
  planId:    string;
  quantity:  number;
  unitPrice: number;
  lineTotal: number;
  label:     string;
}

// ─── localStorage persistence keys ───────────────────────────────────────────

const LS_CART_KEY  = 'mdc_cart_ls';
const LS_GUEST_KEY = 'mdc_guest_id';

// ─── Default configs per service ─────────────────────────────────────────────

const DEFAULT_CONFIGS: Record<SelfServeServiceId, ServiceConfig> = {
  "druva-m365":      { storageTier: "50GB",           protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "druva-endpoint":  { storageTier: "50GB",           protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "druva-server":    { storageTier: "1TB",            protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "maas360":         { storageTier: "",               protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "exchange-online": { storageTier: "Plan 1",         protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "microsoft-365":   { storageTier: "Basic + Teams",  protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
};

// ─── Cloud service metadata ───────────────────────────────────────────────────

type CloudServiceMeta = {
  id:          SelfServeServiceId;
  name:        string;
  icon:        React.ElementType;
  tagline:     string;
  description: string;
  unitLabel:   string;
  imageSrc:    string | null;
};

const BACKUP_SERVICES: CloudServiceMeta[] = [
  {
    id:          "druva-m365",
    name:        "M365 / Google Workspace",
    icon:        Cloud,
    tagline:     "SaaS Backup",
    description: "Backs up your entire Microsoft 365 or Google Workspace environment — emails, files, Teams chats, and OneDrive. Three copies stored in South Africa, always ready to restore.",
    unitLabel:   "users",
    imageSrc:    "/products/Druva-Microsoft-365-01-xlg.png",
  },
  {
    id:          "druva-endpoint",
    name:        "Endpoint Protection",
    icon:        Monitor,
    tagline:     "Laptop & Desktop Backup",
    description: "Automatically backs up every laptop and desktop in your business. Recover individual files or the whole machine — even after loss, theft, or a ransomware attack.",
    unitLabel:   "endpoints",
    imageSrc:    "/products/Druva-End-Points-01-xlg.png",
  },
  {
    id:          "druva-server",
    name:        "Hybrid Server Backup",
    icon:        HardDrive,
    tagline:     "Server Backup",
    description: "Protects your on-premise and hybrid servers with cloud-native backup. Pick your storage capacity and restore entire servers or individual files whenever you need to.",
    unitLabel:   "server",
    imageSrc:    "/products/Druva-Phoenix-Enterprise-01-xlg.png",
  },
];

const MDM_SERVICES: CloudServiceMeta[] = [
  {
    id:          "maas360",
    name:        "MaaS360 MDM / UEM",
    icon:        Smartphone,
    tagline:     "Device Management",
    description: "Control and secure every phone, tablet, and laptop your team uses — company-owned or personal. Remotely wipe lost devices, enforce security policies, and keep corporate data off unsecured hardware.",
    unitLabel:   "devices",
    imageSrc:    "/products/IBM.png",
  },
];

// ─── Licensing services ───────────────────────────────────────────────────────

const LICENSING_SERVICES: CloudServiceMeta[] = [
  {
    id:          "exchange-online",
    name:        "Exchange Online",
    icon:        Mail,
    tagline:     "Email Licensing",
    description: "Professional Microsoft email for your team, hosted in the cloud. Access from any device, with automatic archiving and built-in spam protection — procured and managed by Montana Data Company.",
    unitLabel:   "licences",
    imageSrc:    "/products/microsoft.jpg",
  },
  {
    id:          "microsoft-365",
    name:        "Microsoft 365 Business",
    icon:        LayoutGrid,
    tagline:     "M365 Licensing",
    description: "Everything your team needs to work — Office apps, business email, Teams, and cloud storage. Montana Data Company procures and manages your licences so you never have to deal with Microsoft billing directly.",
    unitLabel:   "licences",
    imageSrc:    "/products/microsoft.jpg",
  },
];

// ─── Enterprise services ──────────────────────────────────────────────────────

const ENTERPRISE_SERVICES = [
  {
    id:          "ibm-backup",
    name:        "IBM Enterprise Backup",
    icon:        Server,
    description: "For environments too complex for off-the-shelf solutions. Our engineers design a custom backup architecture around your infrastructure, recovery targets, and compliance requirements.",
    tags:        ["Multi-Cloud", "Enterprise RPO/RTO", "Custom Architecture"],
  },
  {
    id:          "ransomware",
    name:        "Ransomware Protection",
    icon:        ShieldAlert,
    description: "When ransomware hits, you need a clean copy to recover from — fast. We store your data in isolated, tamper-proof vaults that attackers cannot reach, so you never have to pay a ransom.",
    tags:        ["Immutable Storage", "AI Detection", "Rapid Recovery"],
  },
  {
    id:          "archive",
    name:        "Archive & Lifecycle",
    icon:        Archive,
    description: "Old data costs the same to store as new data — it shouldn't. Automatically move inactive files to lower-cost tiers while keeping them searchable and audit-ready.",
    tags:        ["Cold Storage", "Cost Optimisation", "Legal Discovery"],
  },
  {
    id:          "guardium",
    name:        "IBM Guardium",
    icon:        Activity,
    description: "Know exactly where your sensitive data lives, who is accessing it, and when something looks suspicious. Real-time monitoring, encryption, and automated compliance reporting in one platform.",
    tags:        ["Data Discovery", "Real-time Monitoring", "Encryption"],
  },
  {
    id:          "quantum",
    name:        "Quantum Security (PQC)",
    icon:        Lock,
    description: "Encrypted data stolen today can be decrypted by tomorrow's quantum computers. Get ahead of the threat by migrating to quantum-resistant encryption before it becomes urgent.",
    tags:        ["Post-Quantum", "NIST Standards", "Future-Proofing"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function composePlanId(serviceId: SelfServeServiceId, config: ServiceConfig): string {
  const dims = SERVICE_DIMENSIONS[serviceId];
  return dims.composePlanId({
    storageTier:     config.storageTier || undefined,
    protectionLevel: config.protectionLevel,
    billingPeriod:   config.billingPeriod,
  });
}

function getCartItemPrice(serviceId: SelfServeServiceId, config: ServiceConfig) {
  const planId = composePlanId(serviceId, config);
  const entry  = getProductEntry(serviceId, planId);
  if (!entry) return { unitPrice: 0, lineTotal: 0, planId, valid: false };
  const qty      = entry.unit === "server" ? 1 : config.quantity;
  const lineTotal = entry.unitPrice * qty;
  return { unitPrice: entry.unitPrice, lineTotal, planId, valid: true, entry };
}

// ─── Service Configurator Card ────────────────────────────────────────────────

function ServiceConfigCard({
  service,
  config,
  inCart,
  isExpanded,
  onToggle,
  isFocused,
  onFocusConsumed,
  userEmails,
  onConfigChange,
  onAddToCart,
  onRemoveFromCart,
  onUserEmailsChange,
}: {
  service:             CloudServiceMeta;
  config:              ServiceConfig;
  inCart:              boolean;
  isExpanded:          boolean;
  onToggle:            () => void;
  isFocused?:          boolean;
  onFocusConsumed?:    () => void;
  userEmails:          string;
  onConfigChange:      (serviceId: SelfServeServiceId, updates: Partial<ServiceConfig>) => void;
  onAddToCart:         (serviceId: SelfServeServiceId) => void;
  onRemoveFromCart:    (serviceId: SelfServeServiceId) => void;
  onUserEmailsChange:  (serviceId: SelfServeServiceId, emails: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState<{ emailCount: number; currentQty: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quantityTouched = useRef(false);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      onFocusConsumed?.();
    }
  }, [isFocused, onFocusConsumed]);

  const Icon = service.icon;
  const dims = SERVICE_DIMENSIONS[service.id];
  const { unitPrice, lineTotal, planId, valid } = getCartItemPrice(service.id, config);
  const isServer = service.id === "druva-server";
  const maxQty = service.id === "druva-server" ? 10 : 50;
  const needsEmails = service.id === "druva-m365" || service.id === "druva-endpoint";
  const parsedEmails = needsEmails
    ? userEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@'))
    : [];
  const countMismatch = parsedEmails.length > 0 && parsedEmails.length !== config.quantity;
  const countMatch    = parsedEmails.length > 0 && parsedEmails.length === config.quantity;

  const handleAddToCart = () => {
    if (needsEmails && !userEmails.trim()) {
      setEmailError("Email addresses are required to provision this service.");
      return;
    }
    setEmailError(null);
    onAddToCart(service.id);
  };

  const monthlyPlanId = planId.replace("-annual", "-monthly");
  const annualSaving  = config.billingPeriod === "annual"
    ? getAnnualSaving(service.id, monthlyPlanId)
    : 0;

  const entry = valid ? getProductEntry(service.id, planId) : null;

  return (
    <div ref={cardRef} className="relative">
      {toastMsg && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-xs font-bold text-white bg-montana-surface border border-white/20 shadow-lg pointer-events-none whitespace-nowrap">
          {toastMsg}
        </div>
      )}
      <SpotlightCard customSize className={`transition-all duration-200 ${inCart ? "border-montana-pink/40 bg-montana-magenta/5" : ""} ${isFocused && !inCart ? "border-white/40 ring-1 ring-white/20" : ""}`}>

        {/* ── Collapsed Header (always visible) ── */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-3 sm:gap-4 text-left group"
        >
          {/* Icon */}
          <div className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
            inCart
              ? "bg-montana-pink/20 border-montana-pink/40"
              : "bg-montana-surface border-white/10 group-hover:border-white/20"
          }`}>
            <Icon className={`h-5 w-5 ${inCart ? "text-montana-pink" : "text-white/70"}`} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest text-montana-muted uppercase mb-0.5 truncate">{service.tagline}</div>
            <h3 className="font-display font-bold text-white text-base leading-tight truncate">{service.name}</h3>
            {inCart && (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-400">In cart</span>
              </div>
            )}
          </div>

          {/* Product image */}
          <div className="relative hidden sm:flex shrink-0 w-32 h-[4.5rem] overflow-hidden border border-white/5 bg-montana-surface/40 items-center justify-center">
            {service.imageSrc ? (
              <Image
                src={service.imageSrc}
                alt={service.name}
                fill
                className="object-contain p-1.5"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-purple-950/60 to-slate-900">
                <Icon className="h-7 w-7 text-purple-400/50" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="shrink-0 text-right min-w-[4.5rem]">
            {valid ? (
              <>
                <div className="text-[9px] font-bold tracking-widest text-montana-muted uppercase">from</div>
                <div className="font-mono font-bold text-white text-sm leading-tight">{formatZAR(unitPrice)}</div>
                <div className="text-[9px] text-montana-muted">/{config.billingPeriod === "annual" ? "yr" : "mo"}</div>
              </>
            ) : (
              <div className="text-xs text-montana-muted">Configure</div>
            )}
          </div>

          {/* Chevron */}
          <ChevronDown className={`h-4 w-4 text-montana-muted shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        {/* ── Expanded Config Content ── */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-sm text-montana-muted mb-5 leading-relaxed">{service.description}</p>

            {/* M365 licence prerequisite notice */}
            {service.id === "druva-m365" && (
              <div className="mb-5 border border-blue-400/20 bg-blue-400/5 rounded-sm p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider">Licence Prerequisite</p>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      This service requires an active <span className="text-white font-semibold">Microsoft 365 Business</span> or <span className="text-white font-semibold">Google Workspace Business</span> licence for each user being backed up. Your existing licences are used — no additional Microsoft or Google subscription is included.
                    </p>
                  </div>
                </div>
                <div className="ml-6.5 border-t border-blue-400/10 pt-3 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-blue-200/60">
                    Don&apos;t have a business licence yet? We can procure and set one up for you.
                  </p>
                  <Link
                    href="/contact?service=m365-licensing&ref=pos"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white hover-interactive"
                  >
                    Get help with licensing <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Storage Tier */}
            {dims.storageTiers && (
              <div className="mb-4">
                <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-2">{dims.storageTierLabel ?? `Storage per ${isServer ? "server" : service.unitLabel.slice(0, -1)}`}</div>
                {dims.storageTierDescriptions ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dims.storageTiers.map(tier => {
                      const testPlanId = dims.composePlanId({ storageTier: tier, protectionLevel: config.protectionLevel, billingPeriod: config.billingPeriod });
                      const testEntry  = getProductEntry(service.id, testPlanId);
                      const isSelected = config.storageTier === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => onConfigChange(service.id, { storageTier: tier })}
                          className={`text-left px-3 py-3 border text-xs transition-colors ${
                            isSelected
                              ? "border-montana-pink bg-montana-pink/10 text-white"
                              : "border-white/10 text-montana-muted hover:border-white/30"
                          }`}
                        >
                          <div className="font-bold text-sm mb-1">{tier}</div>
                          <div className="text-[10px] text-montana-muted leading-relaxed mb-2">
                            {dims.storageTierDescriptions![tier].split(' · ').map((point, i) => (
                              <span key={i} className="block">· {point}</span>
                            ))}
                          </div>
                          {testEntry && (
                            <div className={`font-mono text-xs font-bold mt-1 ${isSelected ? "text-montana-pink" : "text-white/40"}`}>
                              {formatZAR(testEntry.unitPrice)}/{config.billingPeriod === "annual" ? "yr" : "mo"}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dims.storageTiers.map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => onConfigChange(service.id, { storageTier: tier })}
                        className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                          config.storageTier === tier
                            ? "border-montana-pink bg-montana-pink/20 text-white"
                            : "border-white/10 text-montana-muted hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Protection Level */}
            {dims.protectionLevels && (
              <div className="mb-4">
                <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-2">Protection Level</div>
                <div className="grid grid-cols-2 gap-2">
                  {dims.protectionLevels.map(level => {
                    const testPlanId = composePlanId(service.id, { ...config, protectionLevel: level });
                    const testEntry  = getProductEntry(service.id, testPlanId);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onConfigChange(service.id, { protectionLevel: level })}
                        className={`text-left px-3 py-2 border text-xs transition-colors ${
                          config.protectionLevel === level
                            ? "border-montana-pink bg-montana-pink/10 text-white"
                            : "border-white/10 text-montana-muted hover:border-white/30"
                        }`}
                      >
                        <div className="font-bold capitalize mb-0.5">{level}</div>
                        <div className="text-montana-muted text-[10px]">
                          {level === "standard" ? "Backup + 3× SA copies" : "+ Ransomware Detection & Recovery"}
                        </div>
                        {testEntry && (
                          <div className={`font-mono mt-1 ${config.protectionLevel === level ? "text-montana-pink" : "text-white/40"}`}>
                            {formatZAR(testEntry.unitPrice)}/{config.billingPeriod === "annual" ? "yr" : "mo"}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Billing Period */}
            {dims.billingPeriods.length > 1 && (
              <div className="mb-4">
                <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-2">Billing</div>
                <div className="flex gap-2">
                  {dims.billingPeriods.map(period => {
                    const testPlanId = composePlanId(service.id, { ...config, billingPeriod: period });
                    const testEntry  = getProductEntry(service.id, testPlanId);
                    const saving     = period === "annual" ? getAnnualSaving(service.id, composePlanId(service.id, { ...config, billingPeriod: "monthly" })) : 0;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => onConfigChange(service.id, { billingPeriod: period })}
                        className={`flex-1 text-left px-3 py-2 border text-xs transition-colors ${
                          config.billingPeriod === period
                            ? "border-montana-pink bg-montana-pink/10 text-white"
                            : "border-white/10 text-montana-muted hover:border-white/30"
                        }`}
                      >
                        <div className="font-bold capitalize">{period === "annual" ? "Annual (12-month)" : "Month-to-Month"}</div>
                        {testEntry && (
                          <div className={`font-mono text-[10px] mt-0.5 ${config.billingPeriod === period ? "text-montana-pink" : "text-white/40"}`}>
                            {formatZAR(testEntry.unitPrice)}/{period === "annual" ? "yr" : "mo"}
                          </div>
                        )}
                        {saving > 0 && period === "annual" && (
                          <div className="text-[10px] text-emerald-400 mt-0.5">Save {formatZAR(saving * (isServer ? 1 : config.quantity))}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            {!isServer && entry && (
              <div className="mb-5">
                <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-2">
                  Number of {service.unitLabel}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { quantityTouched.current = true; setPendingSync(null); onConfigChange(service.id, { quantity: Math.max(1, config.quantity - 1) }); }}
                    className="h-8 w-8 flex items-center justify-center border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    value={config.quantity}
                    onChange={e => { quantityTouched.current = true; setPendingSync(null); onConfigChange(service.id, { quantity: Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)) }); }}
                    className="w-20 text-center border border-white/10 bg-montana-surface/50 py-1.5 text-white text-sm focus:border-montana-pink focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={config.quantity >= maxQty}
                    onClick={() => { quantityTouched.current = true; setPendingSync(null); onConfigChange(service.id, { quantity: Math.min(maxQty, config.quantity + 1) }); }}
                    className="h-8 w-8 flex items-center justify-center border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="text-xs text-montana-muted">{service.unitLabel}</span>
                </div>
                <div className="text-[10px] text-white/30 mt-1">Max {maxQty} per order — contact us for larger volumes</div>
              </div>
            )}

            {/* User Email Capture */}
            {needsEmails && (
              <div className="mb-5">
                <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-1 flex items-center gap-1.5">
                  {service.id === "druva-m365" ? "M365 / Google Workspace User Emails" : "Endpoint User Emails"}
                  <span className="text-red-400">*</span>
                </div>
                <p className="text-xs text-montana-muted mb-2">
                  Paste the email addresses of the users to be protected, one per line or comma-separated. Required for provisioning.
                </p>
                <textarea
                  rows={4}
                  value={userEmails}
                  onChange={e => {
                    onUserEmailsChange(service.id, e.target.value);
                    if (emailError) setEmailError(null);
                    if (pendingSync) setPendingSync(null);
                  }}
                  onBlur={e => {
                    const emails = e.target.value.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.includes('@'));
                    if (emails.length > 0 && emails.length !== config.quantity) {
                      if (quantityTouched.current && config.quantity > 1) {
                        setPendingSync({ emailCount: emails.length, currentQty: config.quantity });
                      } else {
                        onConfigChange(service.id, { quantity: emails.length });
                        quantityTouched.current = false;
                        showToast(`Quantity updated to match ${emails.length} email address${emails.length !== 1 ? 'es' : ''}`);
                      }
                    }
                  }}
                  placeholder={"user@company.com\nuser2@company.com"}
                  className={`w-full border bg-montana-surface/50 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none resize-none font-mono ${
                    emailError ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-montana-pink"
                  }`}
                />
                {emailError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {emailError}
                  </p>
                )}
                {pendingSync && (
                  <div className="mt-1.5 border border-montana-orange/40 bg-montana-orange/5 px-3 py-2 flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-montana-orange flex-1 min-w-0">
                      You entered {pendingSync.emailCount} email{pendingSync.emailCount !== 1 ? 's' : ''} but quantity is {pendingSync.currentQty}. Update to {pendingSync.emailCount}?
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onConfigChange(service.id, { quantity: pendingSync.emailCount });
                          quantityTouched.current = false;
                          showToast(`Quantity updated to match ${pendingSync.emailCount} email address${pendingSync.emailCount !== 1 ? 'es' : ''}`);
                          setPendingSync(null);
                        }}
                        className="text-[10px] font-bold border border-montana-orange/40 text-montana-orange hover:bg-montana-orange/10 px-2 py-1 transition-colors whitespace-nowrap"
                      >
                        Update to {pendingSync.emailCount}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingSync(null)}
                        className="text-[10px] font-bold border border-white/20 text-white/50 hover:text-white px-2 py-1 transition-colors"
                      >
                        Keep {pendingSync.currentQty}
                      </button>
                    </div>
                  </div>
                )}
                {countMismatch && !emailError && !pendingSync && (
                  <div className="mt-1.5 flex flex-wrap items-start gap-2">
                    <p className="text-xs text-montana-orange flex-1 min-w-0">
                      {parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} entered — you configured {config.quantity} {service.unitLabel}. Adjust the quantity or add the remaining emails.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onConfigChange(service.id, { quantity: parsedEmails.length });
                        showToast(`Quantity updated to match ${parsedEmails.length} email address${parsedEmails.length !== 1 ? 'es' : ''}`);
                      }}
                      className="shrink-0 text-[10px] font-bold border border-montana-orange/40 text-montana-orange hover:bg-montana-orange/10 px-2 py-1 transition-colors whitespace-nowrap"
                    >
                      Match quantity to email count ({parsedEmails.length})
                    </button>
                  </div>
                )}
                {countMatch && (
                  <p className="text-xs text-emerald-400 mt-1.5">
                    ✓ {parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} match the configured quantity.
                  </p>
                )}
              </div>
            )}

            {/* Price + Actions */}
            {valid && entry && (
              <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-montana-muted">
                    {isServer ? "Flat rate" : `${formatZAR(unitPrice)} × ${config.quantity} ${service.unitLabel}`}
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {formatZAR(lineTotal)}
                    <span className="text-xs font-normal text-montana-muted ml-1">
                      /{config.billingPeriod === "annual" ? "yr" : "mo"} ex VAT
                    </span>
                  </div>
                  {annualSaving > 0 && (
                    <div className="text-xs text-emerald-400">
                      Saving {formatZAR(annualSaving * (isServer ? 1 : config.quantity))} vs monthly
                    </div>
                  )}
                </div>
                {inCart ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      In cart
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(service.id)}
                      className="text-montana-muted hover:text-red-400 transition-colors"
                      title="Remove from cart"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <AnimatedButton
                    variant="outline"
                    onClick={handleAddToCart}
                    className="shrink-0 text-sm py-2 px-4"
                  >
                    Add to Cart
                  </AnimatedButton>
                )}
              </div>
            )}
            {!valid && (
              <div className="border-t border-white/10 pt-4 text-xs text-montana-muted">
                Select options above to see pricing.
              </div>
            )}
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}

// ─── Cart Panel ───────────────────────────────────────────────────────────────

function CartPanel({
  cart,
  discountCode,
  onDiscountChange,
  onRemove,
  onCheckout,
  isSubmitting,
  submitError,
  user,
}: {
  cart:             CartItem[];
  discountCode:     string;
  onDiscountChange: (code: string) => void;
  onRemove:         (serviceId: string) => void;
  onCheckout:       () => void;
  isSubmitting:     boolean;
  submitError:      string | null;
  user:             User | null;
}) {
  const total = cart.reduce((s, i) => s + i.lineTotal, 0);

  if (cart.length === 0) {
    return (
      <SpotlightCard customSize className="p-6 text-center">
        <ShoppingCart className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-montana-muted">Your cart is empty.</p>
        <p className="text-xs text-montana-muted/70 mt-1">Configure a product above and click Add to Cart.</p>
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard customSize className="border-montana-pink/20">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Your Order</h3>
        <span className="text-xs text-montana-muted">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3 mb-4">
        {cart.map(item => (
          <div key={item.serviceId} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium leading-tight truncate">{item.label}</div>
              <div className="text-xs text-montana-muted mt-0.5 font-mono">{formatZAR(item.unitPrice)} × {item.quantity}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-white font-mono">{formatZAR(item.lineTotal)}</span>
              <button
                type="button"
                onClick={() => onRemove(item.serviceId)}
                className="text-montana-muted hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount code */}
      <div className="mb-4">
        <input
          type="text"
          value={discountCode}
          onChange={e => onDiscountChange(e.target.value.toUpperCase())}
          placeholder="Discount code"
          className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2 text-xs text-white placeholder:text-montana-muted/50 focus:border-montana-pink focus:outline-none tracking-widest"
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 mb-4">
        <span className="text-sm text-montana-muted">Total (ex VAT)</span>
        <span className="text-2xl font-bold text-montana-pink font-mono">{formatZAR(total)}</span>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 p-3 border border-red-400/20 bg-red-400/5 mb-4">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{submitError}</p>
        </div>
      )}

      <AnimatedButton
        onClick={onCheckout}
        disabled={isSubmitting || total === 0}
        className="w-full justify-center"
      >
        {isSubmitting
          ? "Processing..."
          : user
            ? `Checkout — ${formatZAR(total)}`
            : "Sign In to Checkout"}
      </AnimatedButton>

      {!user && (
        <p className="text-center text-xs text-montana-muted mt-3">
          You&apos;ll be prompted to sign in or create an account.
        </p>
      )}
    </SpotlightCard>
  );
}

// ─── Consulting Section ───────────────────────────────────────────────────────

function ConsultingSection({ preselected = [] }: { preselected?: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", company: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (code: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectedServices = POPIA_SERVICES.filter(s => selected.has(s.code));

  const handleSubmit = async () => {
    if (!contact.name || !contact.email) {
      setError("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consulting",
          name: contact.name,
          email: contact.email,
          company: contact.company || "—",
          serviceType: Array.from(selected).join(", "),
          requirements: contact.notes || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      setError("Submission failed. Please try again or call +27 (0)87 188 3843.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SpotlightCard customSize className="text-center py-16 max-w-lg mx-auto">
        <CheckCircle2 className="h-12 w-12 text-montana-pink mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold text-white mb-3">Enquiry Received</h3>
        <p className="text-montana-muted max-w-sm mx-auto">
          A consultant will contact you within 1 business day to confirm your booking and payment details.
        </p>
      </SpotlightCard>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <p className="text-montana-muted max-w-2xl mx-auto">
          Professional engagements tailored to your environment. Select the services you need and a consultant will be in touch to scope and confirm the engagement.
        </p>
      </div>

      {POPIA_SERVICES.map(service => {
        const isSelected = selected.has(service.code);
        return (
          <button
            key={service.code}
            type="button"
            onClick={() => toggle(service.code)}
            className={`w-full text-left border p-6 transition-all ${
              isSelected
                ? "border-montana-pink bg-montana-magenta/5"
                : "border-white/10 bg-montana-surface/30 hover:border-white/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-0.5 h-5 w-5 rounded-sm border shrink-0 flex items-center justify-center ${
                  isSelected ? "border-montana-pink bg-montana-pink" : "border-white/30"
                }`}>
                  {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h4 className="font-bold text-white">{service.name}</h4>
                    <span className="text-xs px-2 py-0.5 border border-white/10 text-montana-muted">
                      {service.duration}
                    </span>
                    {service.type === "recurring" && (
                      <span className="text-xs px-2 py-0.5 border border-montana-orange/30 text-montana-orange">
                        Recurring
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-montana-muted mb-3">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.includes.map(item => (
                      <span key={item} className="text-xs text-white/60 border border-white/5 bg-white/[0.02] px-2 py-0.5">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {selected.size > 0 && (
        <SpotlightCard customSize className="border-montana-pink/20 mt-8">
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Booking Details</h4>

          {/* Selected summary */}
          <div className="mb-5 space-y-2">
            {selectedServices.map(s => (
              <div key={s.code} className="flex justify-between text-sm">
                <span className="text-montana-muted">{s.name}</span>
              </div>
            ))}
            <p className="text-xs text-montana-muted pt-1">Pricing will be confirmed after consultation analysis.</p>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Your Name *</label>
              <input type="text" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-3 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Email Address *</label>
              <input type="email" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-3 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="jane@company.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Company</label>
              <input type="text" value={contact.company} onChange={e => setContact(p => ({ ...p, company: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-3 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Acme Corp" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Notes</label>
              <input type="text" value={contact.notes} onChange={e => setContact(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-3 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Preferred dates, context..." />
            </div>
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <AnimatedButton onClick={handleSubmit} disabled={submitting} className="w-full justify-center">
            {submitting ? "Sending..." : "Submit Booking Enquiry"}
          </AnimatedButton>
        </SpotlightCard>
      )}
    </div>
  );
}

// ─── Enterprise Section ───────────────────────────────────────────────────────

function EnterpriseSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-montana-muted max-w-2xl mx-auto">
          Complex environments demand bespoke architecture. These solutions are scoped, designed, and delivered by our senior engineers — pricing is by engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ENTERPRISE_SERVICES.map(service => {
          const Icon = service.icon;
          return (
            <SpotlightCard customSize key={service.id} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center bg-montana-surface border border-white/10">
                  <Icon className="h-5 w-5 text-montana-pink" />
                </div>
                <h3 className="font-display font-bold text-white">{service.name}</h3>
              </div>
              <p className="text-sm text-montana-muted mb-4 flex-1">{service.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {service.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 border border-white/10 text-white/50">{tag}</span>
                ))}
              </div>
              <Link href={`/contact?service=${service.id}`} className="mt-auto">
                <AnimatedButton variant="outline" className="w-full group text-sm">
                  Request Consultation <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
            </SpotlightCard>
          );
        })}
      </div>

      <SpotlightCard customSize className="mt-8 p-8 border-white/5 text-center">
        <p className="text-montana-muted mb-4 max-w-xl mx-auto">
          Not sure which solution fits your environment? Our engineers will assess your infrastructure and recommend the right architecture.
        </p>
        <Link href="/contact">
          <AnimatedButton variant="primary">
            Book a Free Discovery Call
          </AnimatedButton>
        </Link>
      </SpotlightCard>
    </div>
  );
}

// ─── Main POS Form ─────────────────────────────────────────────────────────────

function POSForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const paymentFailed = searchParams.get("error") === "payment_failed";

  const initialTab = searchParams.get("tab") as Tab | null;
  const [user, setUser]             = useState<User | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>(
    initialTab && (["cloud", "consulting", "enterprise"] as Tab[]).includes(initialTab)
      ? initialTab
      : "cloud"
  );
  const rawService = searchParams.get("service") as SelfServeServiceId | null;
  const [focusedService, setFocusedService] = useState<SelfServeServiceId | null>(
    rawService && [...BACKUP_SERVICES, ...MDM_SERVICES, ...LICENSING_SERVICES].some(s => s.id === rawService) ? rawService : null
  );
  // Comma-separated POPIA service codes, e.g. ?services=SE-PA002,SE-PZ001
  // Callers must not URL-encode the comma or use ?services=A&services=B
  const preselectedServices = searchParams.get("services")?.split(",").filter(Boolean) ?? [];
  const [configs, setConfigs]           = useState<Record<SelfServeServiceId, ServiceConfig>>({ ...DEFAULT_CONFIGS });
  const [cartIds, setCartIds]           = useState<Set<SelfServeServiceId>>(new Set());
  const [expandedServices, setExpanded] = useState<Set<SelfServeServiceId>>(new Set());
  const [userEmails, setUserEmails]     = useState<Partial<Record<SelfServeServiceId, string>>>({});
  const [discountCode, setDiscount] = useState("");
  const [isSubmitting, setSubmit]   = useState(false);
  const [submitError, setError]     = useState<string | null>(null);
  const [cartOpen, setCartOpen]     = useState(false);
  const [cartToast, setCartToast]   = useState(false);
  const isFirstSyncRef              = useRef(true);

  // Auth
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Restore cart from localStorage on mount (persistent across sessions)
  useEffect(() => {
    // When returning from sign-in, sessionStorage handles the restore — skip LS restore.
    if (searchParams.get("checkout") === "1") return;

    try {
      let guestId = localStorage.getItem(LS_GUEST_KEY);
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem(LS_GUEST_KEY, guestId);
      }

      const raw = localStorage.getItem(LS_CART_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        guestId:      string;
        configs:      Record<SelfServeServiceId, ServiceConfig>;
        cartIds:      SelfServeServiceId[];
        discountCode: string;
        userEmails?:  Partial<Record<SelfServeServiceId, string>>;
      };

      if (!saved.cartIds?.length || saved.guestId !== guestId) return;

      setConfigs(saved.configs ?? DEFAULT_CONFIGS);
      setCartIds(new Set(saved.cartIds));
      setDiscount(saved.discountCode ?? "");
      if (saved.userEmails && typeof saved.userEmails === "object") {
        const safeEmails: Partial<Record<SelfServeServiceId, string>> = {};
        for (const [k, v] of Object.entries(saved.userEmails)) {
          if (typeof v === "string") safeEmails[k as SelfServeServiceId] = v;
        }
        setUserEmails(safeEmails);
      }
      setCartToast(true);
    } catch {
      try { localStorage.removeItem(LS_CART_KEY); } catch { /* storage unavailable */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart to localStorage on every change (skip initial render so defaults never clobber a saved cart)
  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }
    try {
      let guestId = localStorage.getItem(LS_GUEST_KEY);
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem(LS_GUEST_KEY, guestId);
      }
      localStorage.setItem(LS_CART_KEY, JSON.stringify({
        guestId,
        userId:       user?.id ?? null,
        configs,
        cartIds:      Array.from(cartIds),
        discountCode,
        userEmails,
      }));
    } catch {
      // localStorage may be unavailable (private browsing, storage quota)
    }
  }, [configs, cartIds, discountCode, userEmails, user]);

  // Restore cart after sign-in redirect
  useEffect(() => {
    if (searchParams.get("checkout") !== "1") return;
    let saved: string | null = null;
    try { saved = sessionStorage.getItem("pos_cart_state"); } catch { return; }
    if (!saved) return;
    try {
      const state = JSON.parse(saved) as {
        configs:      Record<SelfServeServiceId, ServiceConfig>;
        cartIds:      SelfServeServiceId[];
        discountCode: string;
        userEmails?:  Partial<Record<SelfServeServiceId, string>>;
      };
      setConfigs(state.configs ?? DEFAULT_CONFIGS);
      setCartIds(new Set(state.cartIds ?? []));
      setDiscount(state.discountCode ?? "");
      if (state.userEmails && typeof state.userEmails === "object") {
        const safeEmails: Partial<Record<SelfServeServiceId, string>> = {};
        for (const [k, v] of Object.entries(state.userEmails)) {
          if (typeof v === "string") safeEmails[k as SelfServeServiceId] = v;
        }
        setUserEmails(safeEmails);
      }
      try { sessionStorage.removeItem("pos_cart_state"); } catch { /* ignore */ }
    } catch {
      try { sessionStorage.removeItem("pos_cart_state"); } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand the service targeted by ?service= URL param
  useEffect(() => {
    if (focusedService) {
      setExpanded(prev => new Set([...prev, focusedService]));
    }
  }, [focusedService]);

  const updateConfig = useCallback((serviceId: SelfServeServiceId, updates: Partial<ServiceConfig>) => {
    setConfigs(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], ...updates } }));
  }, []);

  const toggleExpanded = useCallback((serviceId: SelfServeServiceId) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  }, []);

  const addToCart = useCallback((serviceId: SelfServeServiceId) => {
    setCartIds(prev => new Set([...prev, serviceId]));
    setExpanded(prev => new Set([...prev, serviceId]));
  }, []);

  const removeFromCart = useCallback((serviceId: SelfServeServiceId | string) => {
    setCartIds(prev => {
      const next = new Set(prev);
      next.delete(serviceId as SelfServeServiceId);
      return next;
    });
    setExpanded(prev => {
      const next = new Set(prev);
      next.delete(serviceId as SelfServeServiceId);
      return next;
    });
  }, []);

  const updateUserEmails = useCallback((serviceId: SelfServeServiceId, emails: string) => {
    setUserEmails(prev => ({ ...prev, [serviceId]: emails }));
  }, []);

  // Build cart items for display + checkout
  const cartItems: CartItem[] = Array.from(cartIds).map(serviceId => {
    const config  = configs[serviceId];
    const planId  = composePlanId(serviceId, config);
    const entry   = getProductEntry(serviceId, planId);
    if (!entry) return null;
    const qty     = entry.unit === "server" ? 1 : config.quantity;
    return {
      serviceId,
      planId,
      quantity:  qty,
      unitPrice: entry.unitPrice,
      lineTotal: entry.unitPrice * qty,
      label:     entry.label,
    };
  }).filter(Boolean) as CartItem[];

  const cartTotal = cartItems.reduce((s, i) => s + i.lineTotal, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Build parsed email context from raw textarea values
    const emailContext = (Object.entries(userEmails) as [SelfServeServiceId, string][])
      .filter(([, raw]) => raw?.trim())
      .map(([serviceId, raw]) => ({
        serviceId,
        emails: raw.split(/[\n,]+/).map(e => e.trim()).filter(Boolean),
      }))
      .filter(ctx => ctx.emails.length > 0);

    // If not logged in: save cart state and redirect to sign-in → /checkout
    if (!user) {
      sessionStorage.setItem('pos_cart_state', JSON.stringify({
        configs,
        cartIds: Array.from(cartIds),
        discountCode,
        userEmails,
      }));
      window.location.href = `/sign-in?redirect=${encodeURIComponent('/checkout')}`;
      return;
    }

    // Convert CartItem[] → CartLineItem[] and persist to sessionStorage
    const lineItems: CartLineItem[] = cartItems.map(item => {
      const entry = getProductEntry(item.serviceId, item.planId);
      return {
        product_code: entry?.product_code ?? item.serviceId,
        name:         item.label,
        unit:         entry?.unit ?? 'user',
        unit_price:   item.unitPrice,
        quantity:     item.quantity,
        line_total:   item.lineTotal,
        service_id:   item.serviceId,
        plan_id:      item.planId,
      };
    });

    sessionStorage.setItem('mdc_cart', JSON.stringify(lineItems));
    if (emailContext.length > 0) {
      sessionStorage.setItem('mdc_user_emails', JSON.stringify(emailContext));
    } else {
      sessionStorage.removeItem('mdc_user_emails');
    }
    localStorage.removeItem(LS_CART_KEY);
    router.push('/checkout');
  };

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "cloud",      label: "Cloud Products",       badge: cartIds.size || undefined },
    { id: "consulting", label: "Consulting Services"   },
    { id: "enterprise", label: "Enterprise Solutions"  },
  ];

  return (
    <div>
      {paymentFailed && (
        <div className="flex items-start gap-3 p-4 border border-red-400/20 bg-red-400/5 mb-8">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">
            Your payment was not completed. Please review your cart and try again, or contact us if the issue persists.
          </p>
        </div>
      )}

      {cartToast && (
        <div className="flex items-center justify-between gap-3 p-4 border border-blue-400/20 bg-blue-400/5 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
            <p className="text-sm text-blue-300">Cart restored from your last session.</p>
          </div>
          <button
            type="button"
            onClick={() => setCartToast(false)}
            className="text-blue-400/60 hover:text-blue-300 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-white border-b-2 border-montana-pink -mb-px"
                : "text-montana-muted hover:text-white"
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center bg-montana-pink text-white text-[10px] rounded-full">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Cloud Products Tab */}
      {activeTab === "cloud" && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Configurator cards */}
          <div className="flex-1 space-y-6">

            {/* Cloud Backup */}
            <div className="pb-2 flex items-center gap-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-[10px] font-bold tracking-widest text-montana-muted uppercase whitespace-nowrap">Cloud Backup</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {BACKUP_SERVICES.map(service => (
              <ServiceConfigCard
                key={service.id}
                service={service}
                config={configs[service.id]}
                inCart={cartIds.has(service.id)}
                isExpanded={expandedServices.has(service.id)}
                onToggle={() => toggleExpanded(service.id)}
                isFocused={focusedService === service.id}
                onFocusConsumed={() => setFocusedService(null)}
                userEmails={userEmails[service.id] ?? ""}
                onConfigChange={updateConfig}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onUserEmailsChange={updateUserEmails}
              />
            ))}

            {/* Device Management */}
            <div className="pt-4 pb-2 flex items-center gap-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-[10px] font-bold tracking-widest text-montana-muted uppercase whitespace-nowrap">Device Management</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {MDM_SERVICES.map(service => (
              <ServiceConfigCard
                key={service.id}
                service={service}
                config={configs[service.id]}
                inCart={cartIds.has(service.id)}
                isExpanded={expandedServices.has(service.id)}
                onToggle={() => toggleExpanded(service.id)}
                isFocused={focusedService === service.id}
                onFocusConsumed={() => setFocusedService(null)}
                userEmails={userEmails[service.id] ?? ""}
                onConfigChange={updateConfig}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onUserEmailsChange={updateUserEmails}
              />
            ))}

            {/* Microsoft Licensing */}
            <div className="pt-4 pb-2 flex items-center gap-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-[10px] font-bold tracking-widest text-montana-muted uppercase whitespace-nowrap">Microsoft Licensing</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {LICENSING_SERVICES.map(service => (
              <ServiceConfigCard
                key={service.id}
                service={service}
                config={configs[service.id]}
                inCart={cartIds.has(service.id)}
                isExpanded={expandedServices.has(service.id)}
                onToggle={() => toggleExpanded(service.id)}
                isFocused={focusedService === service.id}
                onFocusConsumed={() => setFocusedService(null)}
                userEmails={userEmails[service.id] ?? ""}
                onConfigChange={updateConfig}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onUserEmailsChange={updateUserEmails}
              />
            ))}
          </div>

          {/* Sticky cart — desktop sidebar only; mobile uses the floating button + drawer */}
          <div className="hidden lg:block w-full lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-28">
              <CartPanel
                cart={cartItems}
                discountCode={discountCode}
                onDiscountChange={setDiscount}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                isSubmitting={isSubmitting}
                submitError={submitError}
                user={user}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile floating cart button */}
      {activeTab === "cloud" && cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center z-30 px-6">
          <button
            type="button"
            onClick={() => setCartOpen(o => !o)}
            className="flex items-center gap-3 bg-montana-pink text-white px-6 py-3 font-bold text-sm shadow-lg shadow-montana-pink/30"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} — {formatZAR(cartTotal)}</span>
            {cartOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Mobile cart drawer + backdrop */}
      {cartOpen && activeTab === "cloud" && (
        <>
          {/* Tap-outside backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-10 bg-black/50"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 bg-montana-bg border-t border-white/10 p-6 shadow-2xl max-h-[60vh] overflow-y-auto">
            <CartPanel
              cart={cartItems}
              discountCode={discountCode}
              onDiscountChange={setDiscount}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
              submitError={submitError}
              user={user}
            />
          </div>
        </>
      )}

      {activeTab === "consulting" && <ConsultingSection preselected={preselectedServices} />}
      {activeTab === "enterprise" && <EnterpriseSection />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSPage() {
  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Products & Services
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Build Your Resilience Strategy
          </h1>
          <p className="text-montana-muted text-lg max-w-2xl">
            Configure and purchase cloud backup products instantly, book consulting engagements, or request a quote for enterprise architecture.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-montana-muted py-24">Loading...</div>}>
          <POSForm />
        </Suspense>

      </div>
    </div>
  );
}
