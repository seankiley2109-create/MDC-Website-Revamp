/**
 * Supabase database type definitions.
 *
 * For a production project, generate these with:
 *   npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
 *
 * The manual definitions below match 001_init.sql + 002_portal.sql exactly.
 * Structure follows the shape Supabase's own codegen produces.
 */

export type PlanStatus = 'active' | 'inactive' | 'past_due' | 'cancelled';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type DownloadCategory = 'software' | 'compliance' | 'whitepapers' | 'tools';

// ── Row shapes ────────────────────────────────────────────────────────────────

export type PopiaRiskLevel = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan_status: PlanStatus;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  current_period_end: string | null;
  company_name: string | null;
  company_size: CompanySize | null;
  industry: string | null;
  /**
   * JSONB column — append-only purchase log.  Each Paystack transaction adds
   * one or more entries; they are never merged or overwritten.
   *
   * Current (productized) shape per entry:
   *   { service_id, plan_id, quantity, unit_price, line_total,
   *     contract_term, purchased_at, paystack_reference }
   *
   * Legacy shapes still present in older rows:
   *   string[]                    (very old)
   *   {service_id, plan_id}[]     (intermediate)
   *
   * All readers must normalise — see normaliseExisting() in the API routes.
   */
  subscribed_services: Array<
    | string
    | { service_id: string; plan_id: string }
    | {
        /** Actual service ID e.g. 'druva-m365'. Pre-fix entries store the label here. */
        service_id:         string;
        /** Composite plan key e.g. '50gb-standard-monthly'. Pre-fix: Sage code. */
        plan_id:            string;
        /** Human-readable label e.g. 'Druva M365 — 50GB Standard (M2M)'. */
        label?:             string;
        quantity:           number;
        unit_price:         number;
        line_total:         number;
        contract_term:      'monthly' | 'yearly';
        purchased_at:       string;
        paystack_reference: string | null;
      }
  >;
  subscribed_quantity: number;
  // Assessment data
  popia_score: number | null;
  popia_risk_level: PopiaRiskLevel | null;
  last_popia_assessment_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  name: string;
  description: string | null;
  category: DownloadCategory;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id:                 string;
  user_id:            string | null;
  order_id:           string;
  customer_name:      string;
  customer_email:     string;
  customer_phone:     string | null;
  company:            string;
  vat_number:         string | null;
  address_line1:      string | null;
  address_line2:      string | null;
  city:               string | null;
  province:           string | null;
  postal_code:        string | null;
  country:            string;
  order_notes:        string | null;
  gross_total:        number;
  nett_total:         number;
  discount_amount:    number;
  discount_code:      string | null;
  cart:               unknown[];  // CartLineItem[] — avoid circular import
  partner:            string | null;
  landing_page:       string | null;
  monday_item_id:     string | null;
  paystack_reference: string | null;
  created_at:         string;
}

// ── Database shape (mirrors Supabase codegen output) ──────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      downloads: {
        Row: Download;
        Insert: Omit<Download, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Download>;
        Relationships: [];
      };
      purchases: {
        Row:    Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at' | 'discount_amount'> & { id?: string; created_at?: string; discount_amount?: number };
        Update: Partial<Purchase>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
