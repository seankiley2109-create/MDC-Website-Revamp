/**
 * Paystack / Sage Product Registry
 *
 * Product codes map directly to Sage SKU codes from the product catalog.
 * Each plan_id is a composite key encoding ALL dimensions of a product:
 *
 *   druva-m365 / druva-endpoint:  "{storageTier}-{protectionLevel}-{billingPeriod}"
 *   druva-server:                 "{storageTier}"   (M2M only — no annual SKU)
 *   maas360:                      "{tier}-{billingPeriod}"
 *
 * Prices are FIXED from the Sage catalog — annual prices are NOT monthly × 12.
 * They are separate SKUs with their own negotiated prices.
 *
 * Unit prices are in ZAR.  Monthly = price per unit per month.
 *  Annual = full annual price per unit (one invoice).
 */

// ─── Service IDs ──────────────────────────────────────────────────────────────

export const SELF_SERVE_SERVICE_IDS = [
  'druva-m365',
  'druva-endpoint',
  'druva-server',
  'maas360',
] as const;

export type SelfServeServiceId = (typeof SELF_SERVE_SERVICE_IDS)[number];

export function isSelfServeService(id: string): id is SelfServeServiceId {
  return (SELF_SERVE_SERVICE_IDS as readonly string[]).includes(id);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UnitType        = 'user' | 'endpoint' | 'server' | 'device';
export type BillingPeriod   = 'monthly' | 'annual';
export type ProtectionLevel = 'standard' | 'premium';

export interface PaystackProductEntry {
  /** Sage / Paystack product code, e.g. DMS50M2M */
  product_code:     string;
  /** Price in ZAR per unit for the billing period */
  unitPrice:        number;
  /** Human-readable label for Sage line items and portal display */
  label:            string;
  /** What one "seat" represents */
  unit:             UnitType;
  /** Monthly or annual — determines period_end calculation */
  billingPeriod:    BillingPeriod;
  /** Storage capacity for display, e.g. "50GB", "1TB" */
  storageTier?:     string;
  /** Only set on druva-m365 and druva-endpoint */
  protectionLevel?: ProtectionLevel;
}

// ─── Product dimensions (used by the configurator UI) ────────────────────────

export interface ServiceDimensions {
  storageTiers?:     string[];   // e.g. ['50GB','250GB','300GB','500GB']
  protectionLevels?: ProtectionLevel[];
  billingPeriods:    BillingPeriod[];
  /** How to compose a plan_id from selections */
  composePlanId: (opts: {
    storageTier?:     string;
    protectionLevel?: ProtectionLevel;
    billingPeriod:    BillingPeriod;
  }) => string;
}

export const SERVICE_DIMENSIONS: Record<SelfServeServiceId, ServiceDimensions> = {
  'druva-m365': {
    storageTiers:     ['50GB', '250GB', '300GB', '500GB'],
    protectionLevels: ['standard', 'premium'],
    billingPeriods:   ['monthly', 'annual'],
    composePlanId: ({ storageTier = '50GB', protectionLevel = 'standard', billingPeriod }) =>
      `${storageTier.toLowerCase()}-${protectionLevel}-${billingPeriod}`,
  },
  'druva-endpoint': {
    storageTiers:     ['50GB', '150GB'],
    protectionLevels: ['standard', 'premium'],
    billingPeriods:   ['monthly', 'annual'],
    composePlanId: ({ storageTier = '50GB', protectionLevel = 'standard', billingPeriod }) =>
      `${storageTier.toLowerCase()}-${protectionLevel}-${billingPeriod}`,
  },
  'druva-server': {
    storageTiers:   ['1TB', '2TB', '3TB', '4TB'],
    billingPeriods: ['monthly'],
    composePlanId: ({ storageTier = '1TB' }) => storageTier.toLowerCase(),
  },
  'maas360': {
    billingPeriods: ['monthly', 'annual'],
    composePlanId: ({ billingPeriod }) => `essential-${billingPeriod}`,
  },
};

// ─── Product map ──────────────────────────────────────────────────────────────
// Key: composite plan_id.  Never calculate annual from monthly — prices differ.

export const PAYSTACK_PRODUCT_MAP: Record<
  SelfServeServiceId,
  Record<string, PaystackProductEntry>
> = {

  // ── Druva M365 / Google Workspace ──────────────────────────────────────────
  'druva-m365': {
    '50gb-standard-monthly': {
      product_code: 'DMS50M2M', unitPrice: 50,    billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 50GB Standard (M2M)',
      unit: 'user', storageTier: '50GB', protectionLevel: 'standard',
    },
    '50gb-standard-annual': {
      product_code: 'DMS5012M', unitPrice: 570,   billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 50GB Standard (12 Month)',
      unit: 'user', storageTier: '50GB', protectionLevel: 'standard',
    },
    '50gb-premium-monthly': {
      product_code: 'DMP50M2M', unitPrice: 225,   billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 50GB Premium (M2M)',
      unit: 'user', storageTier: '50GB', protectionLevel: 'premium',
    },
    '50gb-premium-annual': {
      product_code: 'DMP5012M', unitPrice: 2550,  billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 50GB Premium (12 Month)',
      unit: 'user', storageTier: '50GB', protectionLevel: 'premium',
    },
    '250gb-standard-monthly': {
      product_code: 'DMS250M2M', unitPrice: 250,  billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 250GB Standard (M2M)',
      unit: 'user', storageTier: '250GB', protectionLevel: 'standard',
    },
    '250gb-standard-annual': {
      product_code: 'DMS25012M', unitPrice: 2850, billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 250GB Standard (12 Month)',
      unit: 'user', storageTier: '250GB', protectionLevel: 'standard',
    },
    '250gb-premium-monthly': {
      product_code: 'DMP250M2M', unitPrice: 487.50, billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 250GB Premium (M2M)',
      unit: 'user', storageTier: '250GB', protectionLevel: 'premium',
    },
    '250gb-premium-annual': {
      product_code: 'DMP25012M', unitPrice: 5700,  billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 250GB Premium (12 Month)',
      unit: 'user', storageTier: '250GB', protectionLevel: 'premium',
    },
    '300gb-standard-monthly': {
      product_code: 'DMS300M2M', unitPrice: 450,  billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 300GB Standard (M2M)',
      unit: 'user', storageTier: '300GB', protectionLevel: 'standard',
    },
    '300gb-standard-annual': {
      product_code: 'DMS30012M', unitPrice: 5220, billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 300GB Standard (12 Month)',
      unit: 'user', storageTier: '300GB', protectionLevel: 'standard',
    },
    '300gb-premium-monthly': {
      product_code: 'DMP300M2M', unitPrice: 630,  billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 300GB Premium (M2M)',
      unit: 'user', storageTier: '300GB', protectionLevel: 'premium',
    },
    '300gb-premium-annual': {
      product_code: 'DMP30012M', unitPrice: 7380, billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 300GB Premium (12 Month)',
      unit: 'user', storageTier: '300GB', protectionLevel: 'premium',
    },
    '500gb-standard-monthly': {
      product_code: 'DMS500M2M', unitPrice: 750,  billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 500GB Standard (M2M)',
      unit: 'user', storageTier: '500GB', protectionLevel: 'standard',
    },
    '500gb-standard-annual': {
      product_code: 'DMS50012M', unitPrice: 8700, billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 500GB Standard (12 Month)',
      unit: 'user', storageTier: '500GB', protectionLevel: 'standard',
    },
    '500gb-premium-monthly': {
      product_code: 'DMP500M2M', unitPrice: 1050,  billingPeriod: 'monthly',
      label: 'Druva M365 / Google Workspace — 500GB Premium (M2M)',
      unit: 'user', storageTier: '500GB', protectionLevel: 'premium',
    },
    '500gb-premium-annual': {
      product_code: 'DMP50012M', unitPrice: 12300, billingPeriod: 'annual',
      label: 'Druva M365 / Google Workspace — 500GB Premium (12 Month)',
      unit: 'user', storageTier: '500GB', protectionLevel: 'premium',
    },
  },

  // ── Druva Endpoint Protection ───────────────────────────────────────────────
  'druva-endpoint': {
    '50gb-standard-monthly': {
      product_code: 'DRS50M2M', unitPrice: 125,   billingPeriod: 'monthly',
      label: 'Druva Endpoint Protection — 50GB Standard (M2M)',
      unit: 'endpoint', storageTier: '50GB', protectionLevel: 'standard',
    },
    '50gb-standard-annual': {
      product_code: 'DRS5012M', unitPrice: 1350,  billingPeriod: 'annual',
      label: 'Druva Endpoint Protection — 50GB Standard (12 Month)',
      unit: 'endpoint', storageTier: '50GB', protectionLevel: 'standard',
    },
    '50gb-premium-monthly': {
      product_code: 'DRP50M2M', unitPrice: 237.50, billingPeriod: 'monthly',
      label: 'Druva Endpoint Protection — 50GB Premium (M2M)',
      unit: 'endpoint', storageTier: '50GB', protectionLevel: 'premium',
    },
    '50gb-premium-annual': {
      product_code: 'DRP5012M', unitPrice: 3000,  billingPeriod: 'annual',
      label: 'Druva Endpoint Protection — 50GB Premium (12 Month)',
      unit: 'endpoint', storageTier: '50GB', protectionLevel: 'premium',
    },
    '150gb-standard-monthly': {
      product_code: 'DRS150M2M', unitPrice: 600,  billingPeriod: 'monthly',
      label: 'Druva Endpoint Protection — 150GB Standard (M2M)',
      unit: 'endpoint', storageTier: '150GB', protectionLevel: 'standard',
    },
    '150gb-standard-annual': {
      product_code: 'DRS15012M', unitPrice: 7020, billingPeriod: 'annual',
      label: 'Druva Endpoint Protection — 150GB Standard (12 Month)',
      unit: 'endpoint', storageTier: '150GB', protectionLevel: 'standard',
    },
    '150gb-premium-monthly': {
      product_code: 'DRP150M2M', unitPrice: 675,  billingPeriod: 'monthly',
      label: 'Druva Endpoint Protection — 150GB Premium (M2M)',
      unit: 'endpoint', storageTier: '150GB', protectionLevel: 'premium',
    },
    '150gb-premium-annual': {
      product_code: 'DRP15012M', unitPrice: 7920, billingPeriod: 'annual',
      label: 'Druva Endpoint Protection — 150GB Premium (12 Month)',
      unit: 'endpoint', storageTier: '150GB', protectionLevel: 'premium',
    },
  },

  // ── Druva Hybrid Server Backup ─────────────────────────────────────────────
  // Flat-rate per tier; quantity always 1; M2M billing only (no annual SKU).
  'druva-server': {
    '1tb': {
      product_code: 'DHS1M2M', unitPrice: 4000,  billingPeriod: 'monthly',
      label: 'Druva Hybrid Server Backup — 1TB (M2M)',
      unit: 'server', storageTier: '1TB',
    },
    '2tb': {
      product_code: 'DHS2M2M', unitPrice: 6200,  billingPeriod: 'monthly',
      label: 'Druva Hybrid Server Backup — 2TB (M2M)',
      unit: 'server', storageTier: '2TB',
    },
    '3tb': {
      product_code: 'DHS3M2M', unitPrice: 9750,  billingPeriod: 'monthly',
      label: 'Druva Hybrid Server Backup — 3TB (M2M)',
      unit: 'server', storageTier: '3TB',
    },
    '4tb': {
      product_code: 'DHS4M2M', unitPrice: 14000, billingPeriod: 'monthly',
      label: 'Druva Hybrid Server Backup — 4TB (M2M)',
      unit: 'server', storageTier: '4TB',
    },
  },

  // ── MaaS360 Mobile Device Management ──────────────────────────────────────
  // Only Security Essentials is currently Active.
  'maas360': {
    'essential-monthly': {
      product_code: 'MS-EM-ESM', unitPrice: 150,  billingPeriod: 'monthly',
      label: 'MaaS360 Security Essentials (M2M)',
      unit: 'device',
    },
    'essential-annual': {
      product_code: 'MS-EM-ESY', unitPrice: 1200, billingPeriod: 'annual',
      label: 'MaaS360 Security Essentials (12 Month)',
      unit: 'device',
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getProductEntry(
  serviceId: string,
  planId:    string,
): PaystackProductEntry | null {
  if (!isSelfServeService(serviceId)) return null;
  return PAYSTACK_PRODUCT_MAP[serviceId]?.[planId] ?? null;
}

/**
 * Returns the annual saving vs paying monthly × 12, as a ZAR amount.
 * Returns 0 if no equivalent annual plan exists.
 */
export function getAnnualSaving(serviceId: string, monthlyPlanId: string): number {
  const monthlyEntry = getProductEntry(serviceId, monthlyPlanId);
  if (!monthlyEntry || monthlyEntry.billingPeriod !== 'monthly') return 0;
  const annualPlanId = monthlyPlanId.replace('-monthly', '-annual');
  const annualEntry  = getProductEntry(serviceId, annualPlanId);
  if (!annualEntry) return 0;
  return (monthlyEntry.unitPrice * 12) - annualEntry.unitPrice;
}

/** Format ZAR amount for display */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style:                 'currency',
    currency:              'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
