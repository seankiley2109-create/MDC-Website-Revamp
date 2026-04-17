/**
 * Paystack plan registry — maps POS service/plan IDs to Paystack plan codes.
 *
 * Prices are PER UNIT (per user for M365/SaaS, per endpoint for Endpoint).
 * At checkout, the actual charge is: quantity × unitPrice.
 *
 * Plan codes from: Paystack Dashboard → Recurring → Plans
 */

export const SELF_SERVE_SERVICE_IDS = ['druva-m365', 'druva-endpoint'] as const;
export type SelfServeServiceId = (typeof SELF_SERVE_SERVICE_IDS)[number];
export type BillingCycle = 'monthly' | 'yearly';

export interface PaystackPlanEntry {
  /** Paystack plan code — used as the interval template */
  code: string;
  /** Price per unit in ZAR (not kobo) */
  unitPrice: number;
  /** Human-readable plan name (shown in Paystack dashboard) */
  label: string;
  /** Paystack interval string */
  interval: 'monthly' | 'annually';
}

// ─── Plan map ─────────────────────────────────────────────────────────────────
// Keys: serviceId → planId → billingCycle → PaystackPlanEntry
// "druva-m365" = Druva SaaS in Paystack
// "druva-endpoint" = Druva Endpoint in Paystack

export const PAYSTACK_PLAN_MAP: Record<
  SelfServeServiceId,
  Record<string, Record<BillingCycle, PaystackPlanEntry>>
> = {
  'druva-m365': {
    standard: {
      monthly: {
        code:      'PLN_qx1ykdce47y7jgh',
        unitPrice: 50,
        label:     'Druva SaaS - Standard - Monthly',
        interval:  'monthly',
      },
      yearly: {
        code:      'PLN_77voxi4pbe5nq24',
        unitPrice: 600,
        label:     'Druva SaaS - Standard - Yearly',
        interval:  'annually',
      },
    },
    premium: {
      monthly: {
        code:      'PLN_orns9g1d9ilutdy',
        unitPrice: 225,
        label:     'Druva SaaS - Premium - Monthly',
        interval:  'monthly',
      },
      yearly: {
        code:      'PLN_rlkxhpsklsy6pu4',
        unitPrice: 2700,
        label:     'Druva SaaS - Premium - Yearly',
        interval:  'annually',
      },
    },
  },

  'druva-endpoint': {
    standard: {
      monthly: {
        code:      'PLN_d16d0s88tdws4aw',
        unitPrice: 125,
        label:     'Druva Endpoint - Standard - Monthly',
        interval:  'monthly',
      },
      yearly: {
        code:      'PLN_h3yvr6bm7k8e7ic',
        unitPrice: 1500,
        label:     'Druva Endpoint - Standard - Yearly',
        interval:  'annually',
      },
    },
    premium: {
      monthly: {
        code:      'PLN_cqro9bz2m1ka2ng',
        unitPrice: 238,
        label:     'Druva Endpoint - Premium - Monthly',
        interval:  'monthly',
      },
      yearly: {
        code:      'PLN_786mg2ah8s6y8m7',
        unitPrice: 2856,
        label:     'Druva Endpoint - Premium - Yearly',
        interval:  'annually',
      },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isSelfServeService(id: string): id is SelfServeServiceId {
  return (SELF_SERVE_SERVICE_IDS as readonly string[]).includes(id);
}

/**
 * Returns the unit price for a given service/plan/cycle combo, or null if
 * this service is not self-serve.
 */
export function getUnitPrice(
  serviceId: string,
  planId: string,
  cycle: BillingCycle,
): number | null {
  if (!isSelfServeService(serviceId)) return null;
  return PAYSTACK_PLAN_MAP[serviceId]?.[planId]?.[cycle]?.unitPrice ?? null;
}

/**
 * Returns the Paystack plan entry or null.
 */
export function getPlanEntry(
  serviceId: string,
  planId: string,
  cycle: BillingCycle,
): PaystackPlanEntry | null {
  if (!isSelfServeService(serviceId)) return null;
  return PAYSTACK_PLAN_MAP[serviceId]?.[planId]?.[cycle] ?? null;
}

/**
 * Calculates the combined total amount (in ZAR) for a set of self-serve
 * services at a given quantity and billing cycle.
 */
export function calculateTotal(
  services: { serviceId: string; planId: string }[],
  quantity: number,
  cycle: BillingCycle,
): number {
  return services.reduce((sum, { serviceId, planId }) => {
    const price = getUnitPrice(serviceId, planId, cycle);
    return sum + (price ?? 0) * quantity;
  }, 0);
}

/** Formats ZAR amount for display */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
