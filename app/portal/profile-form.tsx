"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save, AlertCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createBrowserClient } from "@/lib/supabase/browser";

interface ProfileFormProps {
  initialData: {
    fullName:    string;
    companyName: string;
    companySize: string;
    industry:    string;
  };
}

const COMPANY_SIZES = [
  { value: "",       label: "Select company size…" },
  { value: "1-10",   label: "1 – 10 employees"     },
  { value: "11-50",  label: "11 – 50 employees"    },
  { value: "51-200", label: "51 – 200 employees"   },
  { value: "201-500",label: "201 – 500 employees"  },
  { value: "500+",   label: "500+ employees"       },
];

const INDUSTRIES = [
  { value: "",                   label: "Select industry…"        },
  { value: "Financial Services", label: "Financial Services"      },
  { value: "Healthcare",         label: "Healthcare"              },
  { value: "Retail",             label: "Retail"                  },
  { value: "Manufacturing",      label: "Manufacturing"           },
  { value: "Technology",         label: "Technology"              },
  { value: "Government",         label: "Government"              },
  { value: "Education",          label: "Education"               },
  { value: "Legal",              label: "Legal"                   },
  { value: "Mining & Resources", label: "Mining & Resources"      },
  { value: "Other",              label: "Other"                   },
];

const fieldClass =
  "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/50 focus:bg-montana-pink/5 transition-all";

const labelClass = "block text-xs font-medium text-montana-muted uppercase tracking-wider mb-1.5";

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [fullName,    setFullName]    = useState(initialData.fullName);
  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [companySize, setCompanySize] = useState(initialData.companySize);
  const [industry,    setIndustry]    = useState(initialData.industry);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from("profiles") as any)
        .update({
          full_name:    fullName.trim()    || null,
          company_name: companyName.trim() || null,
          company_size: companySize        || null,
          industry:     industry           || null,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

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
      {/* Full Name + Company row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-fullname" className={labelClass}>Full Name</label>
          <input
            id="pf-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className={fieldClass}
            disabled={saving}
          />
        </div>
        <div>
          <label htmlFor="pf-company" className={labelClass}>Company Name</label>
          <input
            id="pf-company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Registered company name"
            className={fieldClass}
            disabled={saving}
          />
        </div>
      </div>

      {/* Company Size + Industry row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-size" className={labelClass}>Company Size</label>
          <select
            id="pf-size"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className={fieldClass}
            disabled={saving}
          >
            {COMPANY_SIZES.map((s) => (
              <option key={s.value} value={s.value} className="bg-montana-bg">
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-industry" className={labelClass}>Industry</label>
          <select
            id="pf-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={fieldClass}
            disabled={saving}
          >
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value} className="bg-montana-bg">
                {i.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile saved successfully.
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
          <><Save className="h-4 w-4" /> Save Profile</>
        )}
      </AnimatedButton>
    </form>
  );
}
