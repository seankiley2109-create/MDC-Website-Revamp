"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Save, AlertCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createBrowserClient } from "@/lib/supabase/browser";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  full_name:          z.string().optional(),
  phone:              z.string().optional(),
  avatar_url:         z.string().optional(),
  company_name:       z.string().min(1, "Company name is required"),
  company_reg_number: z.string().optional(),
  vat_number:         z.string().optional(),
  industry:           z.string().optional(),
  company_size:       z.string().optional(),
  address_line1:      z.string().optional(),
  address_line2:      z.string().optional(),
  city:               z.string().optional(),
  province:           z.string().optional(),
  postal_code:        z.string().optional(),
  country:            z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: "",                   label: "Select industry…"   },
  { value: "Technology",         label: "Technology"         },
  { value: "Financial Services", label: "Financial Services" },
  { value: "Healthcare",         label: "Healthcare"         },
  { value: "Legal",              label: "Legal"              },
  { value: "Retail",             label: "Retail"             },
  { value: "Manufacturing",      label: "Manufacturing"      },
  { value: "Other",              label: "Other"              },
];

const COMPANY_SIZES = [
  { value: "",        label: "Select size…"        },
  { value: "1-10",    label: "1 – 10 employees"    },
  { value: "11-50",   label: "11 – 50 employees"   },
  { value: "51-200",  label: "51 – 200 employees"  },
  { value: "201-500", label: "201 – 500 employees" },
  { value: "500+",    label: "500+ employees"       },
];

const SA_PROVINCES = [
  { value: "",    label: "Select province…"  },
  { value: "GP",  label: "Gauteng (GP)"      },
  { value: "WC",  label: "Western Cape (WC)" },
  { value: "KZN", label: "KwaZulu-Natal (KZN)" },
  { value: "EC",  label: "Eastern Cape (EC)" },
  { value: "FS",  label: "Free State (FS)"   },
  { value: "LP",  label: "Limpopo (LP)"      },
  { value: "MP",  label: "Mpumalanga (MP)"   },
  { value: "NC",  label: "Northern Cape (NC)" },
  { value: "NW",  label: "North West (NW)"   },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldClass =
  "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/50 focus:bg-montana-pink/5 transition-all";

const fieldErrorClass =
  "w-full bg-white/5 border border-red-400/40 text-white text-sm px-4 py-3 placeholder:text-montana-muted/50 focus:outline-none focus:border-red-400/60 transition-all";

const labelClass =
  "block text-xs font-medium text-montana-muted uppercase tracking-wider mb-1.5";

const errorClass = "text-xs text-red-400 mt-1";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileFormInitialData {
  fullName:         string;
  phone:            string;
  avatarUrl:        string;
  companyName:      string;
  companyRegNumber: string;
  vatNumber:        string;
  industry:         string;
  companySize:      string;
  addressLine1:     string;
  addressLine2:     string;
  city:             string;
  province:         string;
  postalCode:       string;
  country:          string;
}

interface ProfileFormProps {
  initialData: ProfileFormInitialData;
  userEmail:   string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const [saved,  setSaved]  = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name:          initialData.fullName,
      phone:              initialData.phone,
      avatar_url:         initialData.avatarUrl,
      company_name:       initialData.companyName,
      company_reg_number: initialData.companyRegNumber,
      vat_number:         initialData.vatNumber,
      industry:           initialData.industry,
      company_size:       initialData.companySize,
      address_line1:      initialData.addressLine1,
      address_line2:      initialData.addressLine2,
      city:               initialData.city,
      province:           initialData.province,
      postal_code:        initialData.postalCode,
      country:            initialData.country || "South Africa",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSaved(false);

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setServerError("Session expired. Please sign in again.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("profiles") as any)
        .update({
          full_name:          values.full_name?.trim()          || null,
          phone:              values.phone?.trim()              || null,
          avatar_url:         values.avatar_url?.trim()         || null,
          company_name:       values.company_name?.trim()       || null,
          company_reg_number: values.company_reg_number?.trim() || null,
          vat_number:         values.vat_number?.trim()         || null,
          industry:           values.industry                   || null,
          company_size:       values.company_size               || null,
          address_line1:      values.address_line1?.trim()      || null,
          address_line2:      values.address_line2?.trim()      || null,
          city:               values.city?.trim()               || null,
          province:           values.province                   || null,
          postal_code:        values.postal_code?.trim()        || null,
          country:            values.country?.trim()            || null,
        })
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 max-w-2xl">

      {/* ── Section A: Personal Details ───────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-montana-pink uppercase tracking-widest mb-4">
          Personal Details
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-fullname" className={labelClass}>Full Name</label>
              <input
                id="pf-fullname"
                type="text"
                placeholder="Your full name"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("full_name")}
              />
            </div>
            <div>
              <label htmlFor="pf-email" className={labelClass}>Work Email</label>
              <input
                id="pf-email"
                type="email"
                value={userEmail}
                readOnly
                className={`${fieldClass} opacity-50 cursor-not-allowed`}
                title="Email is managed via your account settings"
              />
              <p className="text-xs text-montana-muted mt-1">Managed via your account</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-phone" className={labelClass}>Phone Number</label>
              <input
                id="pf-phone"
                type="tel"
                placeholder="+27 (0)__ ___ ____"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("phone")}
              />
            </div>
            <div>
              <label htmlFor="pf-avatar" className={labelClass}>Avatar URL <span className="text-montana-muted/50 normal-case font-normal">(optional)</span></label>
              <input
                id="pf-avatar"
                type="url"
                placeholder="https://…"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("avatar_url")}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-white/10" />

      {/* ── Section B: Organisation ────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-montana-pink uppercase tracking-widest mb-4">
          Organisation
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-company" className={labelClass}>
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                id="pf-company"
                type="text"
                placeholder="Registered company name"
                className={errors.company_name ? fieldErrorClass : fieldClass}
                disabled={isSubmitting}
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className={errorClass}>{errors.company_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="pf-reg" className={labelClass}>Company Reg. Number</label>
              <input
                id="pf-reg"
                type="text"
                placeholder="e.g. 2020/123456/07"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("company_reg_number")}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pf-vat" className={labelClass}>VAT Number</label>
              <input
                id="pf-vat"
                type="text"
                placeholder="e.g. 4123456789"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("vat_number")}
              />
            </div>
            <div>
              <label htmlFor="pf-industry" className={labelClass}>Industry</label>
              <select
                id="pf-industry"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("industry")}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value} className="bg-montana-bg">
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pf-size" className={labelClass}>Company Size</label>
              <select
                id="pf-size"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("company_size")}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-montana-bg">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-white/10" />

      {/* ── Section C: Address ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-montana-pink uppercase tracking-widest mb-4">
          Address
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="pf-addr1" className={labelClass}>Address Line 1</label>
            <input
              id="pf-addr1"
              type="text"
              placeholder="Street address"
              className={fieldClass}
              disabled={isSubmitting}
              {...register("address_line1")}
            />
          </div>
          <div>
            <label htmlFor="pf-addr2" className={labelClass}>
              Address Line 2 <span className="text-montana-muted/50 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="pf-addr2"
              type="text"
              placeholder="Suite, floor, building…"
              className={fieldClass}
              disabled={isSubmitting}
              {...register("address_line2")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-city" className={labelClass}>City</label>
              <input
                id="pf-city"
                type="text"
                placeholder="e.g. Cape Town"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("city")}
              />
            </div>
            <div>
              <label htmlFor="pf-province" className={labelClass}>Province</label>
              <select
                id="pf-province"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("province")}
              >
                {SA_PROVINCES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-montana-bg">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-postal" className={labelClass}>Postal Code</label>
              <input
                id="pf-postal"
                type="text"
                placeholder="e.g. 7530"
                maxLength={10}
                className={fieldClass}
                disabled={isSubmitting}
                {...register("postal_code")}
              />
            </div>
            <div>
              <label htmlFor="pf-country" className={labelClass}>Country</label>
              <input
                id="pf-country"
                type="text"
                placeholder="South Africa"
                className={fieldClass}
                disabled={isSubmitting}
                {...register("country")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Feedback ──────────────────────────────────────────────────────── */}
      {serverError && (
        <div className="flex items-start gap-2 text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Changes saved successfully.
        </div>
      )}

      <AnimatedButton
        type="submit"
        variant="secondary"
        disabled={isSubmitting}
        className="flex items-center gap-2 py-3 px-6"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><Save className="h-4 w-4" /> Save Changes</>
        )}
      </AnimatedButton>
    </form>
  );
}
