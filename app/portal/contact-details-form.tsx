"use client";

/**
 * ContactDetailsForm — optional contact details for the client portal.
 *
 * DB note: requires these columns on the `profiles` table (add via Supabase migration):
 *   phone         text
 *   address_line1 text
 *   city          text
 *   province      text
 *   postal_code   text
 */

import { useState } from "react";
import { CheckCircle2, Loader2, Save, AlertCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createBrowserClient } from "@/lib/supabase/browser";

interface ContactDetailsFormProps {
  initialData: {
    email:        string;
    phone:        string;
    addressLine1: string;
    city:         string;
    province:     string;
    postalCode:   string;
  };
}

const fieldClass =
  "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/50 focus:bg-montana-pink/5 transition-all";

const labelClass = "block text-xs font-medium text-montana-muted uppercase tracking-wider mb-1.5";

const SA_PROVINCES = [
  { value: "",                  label: "Select province…"       },
  { value: "Eastern Cape",      label: "Eastern Cape"           },
  { value: "Free State",        label: "Free State"             },
  { value: "Gauteng",           label: "Gauteng"                },
  { value: "KwaZulu-Natal",     label: "KwaZulu-Natal"          },
  { value: "Limpopo",           label: "Limpopo"                },
  { value: "Mpumalanga",        label: "Mpumalanga"             },
  { value: "North West",        label: "North West"             },
  { value: "Northern Cape",     label: "Northern Cape"          },
  { value: "Western Cape",      label: "Western Cape"           },
];

export function ContactDetailsForm({ initialData }: ContactDetailsFormProps) {
  const [phone,        setPhone]        = useState(initialData.phone);
  const [addressLine1, setAddressLine1] = useState(initialData.addressLine1);
  const [city,         setCity]         = useState(initialData.city);
  const [province,     setProvince]     = useState(initialData.province);
  const [postalCode,   setPostalCode]   = useState(initialData.postalCode);

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const { error: updateError } = await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
        .update({
          phone:         phone.trim()        || null,
          address_line1: addressLine1.trim() || null,
          city:          city.trim()         || null,
          province:      province            || null,
          postal_code:   postalCode.trim()   || null,
        })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} noValidate className="space-y-5 max-w-2xl">
      {/* Email (read-only — managed via auth) + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cd-email" className={labelClass}>Work Email</label>
          <input
            id="cd-email"
            type="email"
            value={initialData.email}
            readOnly
            className={`${fieldClass} opacity-50 cursor-not-allowed`}
            title="Email is managed via your account settings"
          />
          <p className="text-xs text-montana-muted mt-1">Managed via your account</p>
        </div>
        <div>
          <label htmlFor="cd-phone" className={labelClass}>Phone Number</label>
          <input
            id="cd-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+27 (0)__ ___ ____"
            className={fieldClass}
            disabled={saving}
          />
        </div>
      </div>

      {/* Address line 1 */}
      <div>
        <label htmlFor="cd-address" className={labelClass}>Physical Address</label>
        <input
          id="cd-address"
          type="text"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="Street address"
          className={fieldClass}
          disabled={saving}
        />
      </div>

      {/* City + Province + Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="cd-city" className={labelClass}>City</label>
          <input
            id="cd-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Cape Town"
            className={fieldClass}
            disabled={saving}
          />
        </div>
        <div>
          <label htmlFor="cd-province" className={labelClass}>Province</label>
          <select
            id="cd-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={fieldClass}
            disabled={saving}
          >
            {SA_PROVINCES.map((p) => (
              <option key={p.value} value={p.value} className="bg-montana-bg">
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cd-postal" className={labelClass}>Postal Code</label>
          <input
            id="cd-postal"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g. 7530"
            className={fieldClass}
            disabled={saving}
            maxLength={10}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Contact details saved successfully.
        </div>
      )}

      <AnimatedButton
        type="submit"
        variant="secondary"
        disabled={saving}
        className="flex items-center gap-2 py-3 px-6"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><Save className="h-4 w-4" /> Save Contact Details</>
        )}
      </AnimatedButton>
    </form>
  );
}
