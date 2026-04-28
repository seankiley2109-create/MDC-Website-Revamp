'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter }                        from 'next/navigation';
import { useForm }                          from 'react-hook-form';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedButton }                   from '@/components/ui/animated-button';
import { createBrowserClient }              from '@/lib/supabase/browser';
import { processOrder }                     from '@/app/actions/order';
import type { OrderFormData }               from '@/app/actions/order';
import type { CartLineItem }               from '@/app/api/subscribe/route';
import { AlertCircle, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';

// ─── Cart helpers ─────────────────────────────────────────────────────────────

function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style:    'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Form field component ─────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label:     string;
  error?:    string;
  required?: boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-white/30 ' +
  'px-3 py-2.5 text-sm rounded focus:outline-none focus:border-blue-400/60 ' +
  'focus:bg-white/8 transition-colors disabled:opacity-50';

// ─── Page ─────────────────────────────────────────────────────────────────────

type UserEmailContextEntry = { serviceId: string; emails: string[] };

export default function CheckoutPage() {
  const router                              = useRouter();
  const [cart, setCart]                     = useState<CartLineItem[]>([]);
  const [userEmail, setEmail]               = useState<string>('');
  const [userEmailContext, setEmailContext] = useState<UserEmailContextEntry[]>([]);
  const [cartReady, setReady]               = useState(false);
  const [submitting, setSub]                = useState(false);
  const [serverError, setErr]               = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({ defaultValues: { country: 'ZA' } });

  // Load cart and user email context from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('mdc_cart');
    if (!raw) {
      router.replace('/pos?error=empty_cart');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CartLineItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace('/pos?error=empty_cart');
        return;
      }
      setCart(parsed);

      const rawEmails = sessionStorage.getItem('mdc_user_emails');
      if (rawEmails) {
        try {
          const parsedEmails = JSON.parse(rawEmails) as UserEmailContextEntry[];
          if (Array.isArray(parsedEmails)) setEmailContext(parsedEmails);
        } catch {
          // Malformed — ignore
        }
      }

      setReady(true);
    } catch {
      router.replace('/pos?error=empty_cart');
    }
  }, [router]);

  // Pre-fill email from authenticated user
  useEffect(() => {
    let active = true;
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && user?.email) {
        setEmail(user.email);
        setValue('email', user.email);
      }
    });
    return () => { active = false; };
  }, [setValue]);

  // Totals
  const grossTotal  = cart.reduce((s, l) => s + l.line_total, 0);

  const onSubmit = useCallback(async (data: OrderFormData) => {
    setSub(true);
    setErr(null);

    const result = await processOrder(data, cart, userEmailContext.length > 0 ? userEmailContext : undefined);

    if (!result.success || !result.authorization_url) {
      setErr(result.error ?? 'Something went wrong. Please try again.');
      setSub(false);
      return;
    }

    sessionStorage.removeItem('mdc_cart');
    sessionStorage.removeItem('mdc_user_emails');
    window.location.href = result.authorization_url;
  }, [cart]);

  if (!cartReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Left: Form ──────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-2 flex flex-col gap-6"
      >
        <h1 className="text-2xl font-semibold text-white">Complete your order</h1>

        {/* Contact Details */}
        <SpotlightCard customSize className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required error={errors.firstName?.message}>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className={inputClass}
                placeholder="Sean"
              />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message}>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className={inputClass}
                placeholder="Kiley"
              />
            </Field>
          </div>
          <Field label="Email Address" error={errors.email?.message}>
            <input
              type="hidden"
              {...register('email', { required: 'Email address is required' })}
            />
            <div className={`${inputClass} opacity-60 cursor-not-allowed`}>
              {userEmail || 'Loading\u2026'}
            </div>
          </Field>
          <Field label="Phone Number" required error={errors.phone?.message}>
            <input
              {...register('phone', { required: 'Phone number is required', minLength: { value: 7, message: 'Enter a valid phone number' } })}
              className={inputClass}
              placeholder="+27 82 000 0000"
              type="tel"
            />
          </Field>
        </SpotlightCard>

        {/* Company & Tax */}
        <SpotlightCard customSize className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Company & Tax</h2>
          <Field label="Company Name" required error={errors.company?.message}>
            <input
              {...register('company', { required: 'Company name is required' })}
              className={inputClass}
              placeholder="Acme Corp (Pty) Ltd"
            />
          </Field>
          <Field label="VAT Number" error={errors.vatNumber?.message}>
            <input
              {...register('vatNumber')}
              className={inputClass}
              placeholder="4680123456 (optional)"
            />
          </Field>
        </SpotlightCard>

        {/* Billing Address */}
        <SpotlightCard customSize className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Billing Address</h2>
          <Field label="Street Address" required error={errors.address1?.message}>
            <input
              {...register('address1', { required: 'Street address is required' })}
              className={inputClass}
              placeholder="123 Main Street"
            />
          </Field>
          <Field label="Street Address Line 2" error={errors.address2?.message}>
            <input
              {...register('address2')}
              className={inputClass}
              placeholder="Suite 4, Building B (optional)"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City / Town" required error={errors.city?.message}>
              <input
                {...register('city', { required: 'City is required' })}
                className={inputClass}
                placeholder="Johannesburg"
              />
            </Field>
            <Field label="Province" required error={errors.province?.message}>
              <select
                {...register('province', { required: 'Province is required' })}
                className={inputClass}
              >
                <option value="">Select province&hellip;</option>
                {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
                  'Free State','Limpopo','Mpumalanga','North West','Northern Cape'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Postal Code" required error={errors.postalCode?.message}>
              <input
                {...register('postalCode', { required: 'Postal code is required', minLength: { value: 4, message: 'Enter a valid postal code' } })}
                className={inputClass}
                placeholder="2196"
              />
            </Field>
            <Field label="Country">
              <input
                {...register('country')}
                className={inputClass}
              />
            </Field>
          </div>
        </SpotlightCard>

        {/* Notes & Discount */}
        <SpotlightCard customSize className="p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Additional Details</h2>
          <Field label="Discount / Voucher Code" error={errors.discountCode?.message}>
            <input
              {...register('discountCode')}
              className={inputClass}
              placeholder="PARTNER15 (if applicable)"
            />
          </Field>
          <Field label="Order Notes" error={errors.orderNotes?.message}>
            <textarea
              {...register('orderNotes')}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Any special requirements or provisioning notes\u2026"
            />
          </Field>
        </SpotlightCard>

        {/* Error */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 border border-red-400/20 bg-red-400/5 rounded">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <AnimatedButton
          type="submit"
          disabled={submitting}
          className="w-full py-3"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing&hellip;
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Proceed to Payment
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </AnimatedButton>
      </form>

      {/* ── Right: Order Summary ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <SpotlightCard customSize className="p-6 flex flex-col gap-4 sticky top-28">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Order Summary
          </h2>

          <div className="flex flex-col gap-3">
            {cart.map((line, i) => (
              <div key={i} className="flex flex-col gap-0.5 pb-3 border-b border-white/8 last:border-0 last:pb-0">
                <p className="text-sm text-white font-medium leading-tight">{line.name}</p>
                <p className="text-xs text-white/50">
                  {formatZAR(line.unit_price)} &times; {line.quantity}
                </p>
                <p className="text-sm text-white/80 font-medium">{formatZAR(line.line_total)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-sm text-white/60">Total (excl. VAT)</span>
            <span className="text-lg font-semibold text-white">{formatZAR(grossTotal)}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
            Secure payment via Paystack. You will be redirected after submitting.
          </div>
        </SpotlightCard>
      </div>

    </div>
  );
}
