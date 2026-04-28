"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { CartLineItem } from "@/app/api/subscribe/route";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
  Cloud, Monitor, HardDrive, Smartphone,
  FileText, Server, ShieldAlert, Archive, Activity, Lock,
  CheckCircle2, AlertCircle, ShoppingCart, ChevronDown, ChevronUp,
  ArrowRight, Minus, Plus, X,
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

// ─── Default configs per service ─────────────────────────────────────────────

const DEFAULT_CONFIGS: Record<SelfServeServiceId, ServiceConfig> = {
  "druva-m365":      { storageTier: "50GB",  protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "druva-endpoint":  { storageTier: "50GB",  protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
  "druva-server":    { storageTier: "1TB",   protectionLevel: "standard", billingPeriod: "monthly", quantity: 1  },
  "maas360":         { storageTier: "",      protectionLevel: "standard", billingPeriod: "monthly", quantity: 1 },
};

// ─── Cloud service metadata ───────────────────────────────────────────────────

const CLOUD_SERVICES: {
  id:          SelfServeServiceId;
  name:        string;
  icon:        React.ElementType;
  tagline:     string;
  description: string;
  unitLabel:   string;
}[] = [
  {
    id:          "druva-m365",
    name:        "M365 / Google Workspace",
    icon:        Cloud,
    tagline:     "SaaS Backup",
    description: "Cloud backup for M365 Exchange, SharePoint, Teams, OneDrive, and Google Workspace. 3× copies stored in South Africa.",
    unitLabel:   "users",
  },
  {
    id:          "druva-endpoint",
    name:        "Endpoint Protection",
    icon:        Monitor,
    tagline:     "Laptop & Desktop Backup",
    description: "Secure cloud backup for laptops and desktops with fast file and full-system recovery. 3× copies stored in South Africa.",
    unitLabel:   "endpoints",
  },
  {
    id:          "druva-server",
    name:        "Hybrid Server Backup",
    icon:        HardDrive,
    tagline:     "Server Backup",
    description: "Cloud-native backup for hybrid server environments using Druva Phoenix Enterprise Edition. 3× copies in South Africa.",
    unitLabel:   "server",
  },
  {
    id:          "maas360",
    name:        "MaaS360 MDM / UEM",
    icon:        Smartphone,
    tagline:     "Device Management",
    description: "Unified endpoint management and threat defense. Secure corporate data across all mobile devices, tablets, and BYOD environments.",
    unitLabel:   "devices",
  },
];

// ─── Enterprise services ──────────────────────────────────────────────────────

const ENTERPRISE_SERVICES = [
  {
    id:          "ibm-backup",
    name:        "IBM Enterprise Backup",
    icon:        Server,
    description: "Bespoke, consultative architecture designed for complex, multi-cloud, and hybrid environments. Tailored to meet stringent RPO and RTO requirements.",
    tags:        ["Multi-Cloud", "Enterprise RPO/RTO", "Custom Architecture"],
  },
  {
    id:          "ransomware",
    name:        "Ransomware Protection",
    icon:        ShieldAlert,
    description: "Immutable storage and AI-driven anomaly detection. Ensures you always have a clean, isolated copy of your data — eliminating the need to pay ransoms.",
    tags:        ["Immutable Storage", "AI Detection", "Rapid Recovery"],
  },
  {
    id:          "archive",
    name:        "Archive & Lifecycle",
    icon:        Archive,
    description: "Intelligent data lifecycle management. Move cold data to cost-effective storage tiers while maintaining searchability and compliance readiness.",
    tags:        ["Cold Storage", "Cost Optimisation", "Legal Discovery"],
  },
  {
    id:          "guardium",
    name:        "IBM Guardium",
    icon:        Activity,
    description: "Advanced data security, monitoring, and governance. Discover sensitive data, encrypt it, and monitor access patterns in real-time.",
    tags:        ["Data Discovery", "Real-time Monitoring", "Encryption"],
  },
  {
    id:          "quantum",
    name:        "Quantum Security (PQC)",
    icon:        Lock,
    description: "Post-Quantum Cryptography readiness. Protect against 'harvest now, decrypt later' attacks and align with NIST PQC standards.",
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
  isFocused,
  onFocusConsumed,
  userEmails,
  onConfigChange,
  onAddToCart,
  onRemoveFromCart,
  onUserEmailsChange,
}: {
  service:             typeof CLOUD_SERVICES[number];
  config:              ServiceConfig;
  inCart:              boolean;
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
  const needsEmails = service.id === "druva-m365" || service.id === "druva-endpoint";
  const parsedEmails = needsEmails
    ? userEmails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean)
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

  // Annual saving vs paying monthly × 12
  const monthlyPlanId = planId.replace("-annual", "-monthly");
  const annualSaving  = config.billingPeriod === "annual"
    ? getAnnualSaving(service.id, monthlyPlanId)
    : 0;

  const entry = valid ? getProductEntry(service.id, planId) : null;

  return (
    <div ref={cardRef}>
    <SpotlightCard customSize className={`transition-all ${inCart ? "border-montana-pink/40 bg-montana-magenta/5" : ""} ${isFocused && !inCart ? "border-white/40 ring-1 ring-white/20" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border ${inCart ? "bg-montana-pink/20 border-montana-pink/40" : "bg-montana-surface border-white/10"}`}>
            <Icon className={`h-5 w-5 ${inCart ? "text-montana-pink" : "text-white/70"}`} />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-montana-muted uppercase mb-0.5">{service.tagline}</div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">{service.name}</h3>
          </div>
        </div>
        {inCart && (
          <button
            type="button"
            onClick={() => onRemoveFromCart(service.id)}
            className="text-montana-muted hover:text-white transition-colors mt-1 shrink-0"
            title="Remove from cart"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-montana-muted mb-5 leading-relaxed">{service.description}</p>

      {/* Storage Tier */}
      {dims.storageTiers && (
        <div className="mb-4">
          <div className="text-xs font-bold tracking-wider text-white/50 uppercase mb-2">Storage per {isServer ? "server" : service.unitLabel.slice(0, -1)}</div>
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
              onClick={() => onConfigChange(service.id, { quantity: Math.max(1, config.quantity - 1) })}
              className="h-8 w-8 flex items-center justify-center border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              min="1"
              value={config.quantity}
              onChange={e => onConfigChange(service.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-20 text-center border border-white/10 bg-montana-surface/50 py-1.5 text-white text-sm focus:border-montana-pink focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onConfigChange(service.id, { quantity: config.quantity + 1 })}
              className="h-8 w-8 flex items-center justify-center border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
            <span className="text-xs text-montana-muted">{service.unitLabel}</span>
          </div>
        </div>
      )}

      {/* User Email Capture — M365 / endpoint only */}
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
          {countMismatch && !emailError && (
            <p className="text-xs text-montana-orange mt-1.5">
              {parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} entered — you configured {config.quantity} {service.unitLabel}. Adjust the quantity or add the remaining emails.
            </p>
          )}
          {countMatch && (
            <p className="text-xs text-emerald-400 mt-1.5">
              ✓ {parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} match the configured quantity.
            </p>
          )}
        </div>
      )}

      {/* Price + Add to Cart */}
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
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              In cart
            </div>
          ) : (
            <AnimatedButton
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
  const total = selectedServices
    .filter(s => s.type === "once-off")
    .reduce((sum, s) => sum + s.price, 0);
  const hasRecurring = selectedServices.some(s => s.type === "recurring");

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
          Fixed-price professional engagements. Select what you need and we&apos;ll confirm your booking and arrange payment.
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
            <div className="flex items-start justify-between gap-4">
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
              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-white font-mono">
                  R{service.price.toLocaleString()}
                </div>
                <div className="text-xs text-montana-muted">{service.type === "recurring" ? "/mo" : "once-off"}</div>
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
                <span className="text-white font-mono">R{s.price.toLocaleString()}{s.type === "recurring" ? "/mo" : ""}</span>
              </div>
            ))}
            {total > 0 && (
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2">
                <span className="text-white">Once-off total</span>
                <span className="text-montana-pink font-mono">R{total.toLocaleString()}</span>
              </div>
            )}
            {hasRecurring && (
              <p className="text-xs text-montana-muted pt-1">Monthly retainer invoiced via Sage after confirmation.</p>
            )}
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Your Name *</label>
              <input type="text" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2.5 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Email Address *</label>
              <input type="email" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2.5 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="jane@company.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Company</label>
              <input type="text" value={contact.company} onChange={e => setContact(p => ({ ...p, company: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2.5 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Acme Corp" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Notes</label>
              <input type="text" value={contact.notes} onChange={e => setContact(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-white/10 bg-montana-surface/50 px-3 py-2.5 text-sm text-white focus:border-montana-pink focus:outline-none" placeholder="Preferred dates, context..." />
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
    rawService && CLOUD_SERVICES.some(s => s.id === rawService) ? rawService : null
  );
  // Comma-separated POPIA service codes, e.g. ?services=SE-PA002,SE-PZ001
  // Callers must not URL-encode the comma or use ?services=A&services=B
  const preselectedServices = searchParams.get("services")?.split(",").filter(Boolean) ?? [];
  const [configs, setConfigs]       = useState<Record<SelfServeServiceId, ServiceConfig>>({ ...DEFAULT_CONFIGS });
  const [cartIds, setCartIds]       = useState<Set<SelfServeServiceId>>(new Set());
  const [userEmails, setUserEmails] = useState<Partial<Record<SelfServeServiceId, string>>>({});
  const [discountCode, setDiscount] = useState("");
  const [isSubmitting, setSubmit]   = useState(false);
  const [submitError, setError]     = useState<string | null>(null);
  const [cartOpen, setCartOpen]     = useState(false);

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

  // Restore cart after sign-in redirect
  useEffect(() => {
    if (searchParams.get("checkout") !== "1") return;
    const saved = sessionStorage.getItem("pos_cart_state");
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
      sessionStorage.removeItem("pos_cart_state");
    } catch {
      sessionStorage.removeItem("pos_cart_state");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = useCallback((serviceId: SelfServeServiceId, updates: Partial<ServiceConfig>) => {
    setConfigs(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], ...updates } }));
  }, []);

  const addToCart = useCallback((serviceId: SelfServeServiceId) => {
    setCartIds(prev => new Set([...prev, serviceId]));
  }, []);

  const removeFromCart = useCallback((serviceId: SelfServeServiceId | string) => {
    setCartIds(prev => {
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
            {CLOUD_SERVICES.map(service => (
              <ServiceConfigCard
                key={service.id}
                service={service}
                config={configs[service.id]}
                inCart={cartIds.has(service.id)}
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
    <div className="pt-24 pb-32 bg-montana-bg min-h-screen">
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
