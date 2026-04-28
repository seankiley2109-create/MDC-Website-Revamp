"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import * as z from "zod";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Phone, Mail, Facebook, Linkedin, Clock, Shield, MessageSquare, Building2 } from "lucide-react";
import Link from "next/link";

const ENQUIRY_VALUES = [
  "enterprise-backup",
  "archiving",
  "quantum",
  "guardium",
  "existing-client",
  "partnership",
  "compliance",
  "general",
  "ransomware",
] as const;

type EnquiryValue = typeof ENQUIRY_VALUES[number];

interface ServiceDefaults {
  enquiryType: EnquiryValue;
  label: string;
  message: string;
}

const SERVICE_DEFAULTS: Record<string, ServiceDefaults> = {
  "ibm-backup": {
    enquiryType: "enterprise-backup",
    label: "IBM Enterprise Backup",
    message:
      "Hi,\n\nI'd like to request a consultation for IBM Enterprise Backup.\n\nOur environment:\n- Cloud / hybrid / on-premises: \n- Approximate data volume (TB): \n- Current backup solution: \n- Data types (email, files, database): \n\nPlease reach out to arrange a discovery call.",
  },
  "ransomware": {
    enquiryType: "ransomware",
    label: "Ransomware Protection",
    message:
      "Hi,\n\nI'm interested in Montana's Ransomware Protection solution (immutable storage + AI-driven anomaly detection).\n\nOur environment:\n- Number of servers / endpoints: \n- Current backup solution: \n- Last security audit: \n- Urgency / timeline: \n\nPlease contact me to discuss our options.",
  },
  "archive": {
    enquiryType: "archiving",
    label: "Archive & Lifecycle",
    message:
      "Hi,\n\nI'd like to learn more about Archive & Lifecycle management for our organisation.\n\nOur data profile:\n- Estimated cold data volume (TB): \n- Compliance / legal hold requirements: \n- Current archiving approach: \n- Data types (email, files, database): \n\nPlease get in touch to discuss a solution.",
  },
  "guardium": {
    enquiryType: "guardium",
    label: "IBM Guardium",
    message:
      "Hi,\n\nI'd like to request a consultation for IBM Guardium (data security, monitoring & governance).\n\nOur environment:\n- Database platforms in use: \n- Sensitive data categories (PII, financial, health): \n- Current data security tooling: \n- Compliance frameworks applicable (POPIA, PCI-DSS, ISO 27001): \n\nPlease reach out to arrange a discovery call.",
  },
  "quantum": {
    enquiryType: "quantum",
    label: "Quantum Security (PQC)",
    message:
      "Hi,\n\nI'm interested in Montana's Quantum Security (Post-Quantum Cryptography) readiness assessment.\n\nOur context:\n- Industry / sector: \n- Encryption standards currently in use: \n- Known long-lived data assets: \n- Timeline for PQC migration planning: \n\nPlease contact me to discuss next steps.",
  },
};

const ENQUIRY_TYPE_DEFAULTS: Partial<Record<EnquiryValue, { label: string; message: string }>> = {
  "enterprise-backup": { label: "Enterprise Backup", message: SERVICE_DEFAULTS["ibm-backup"].message },
  "ransomware":        { label: "Ransomware Protection", message: SERVICE_DEFAULTS["ransomware"].message },
  "archiving":         { label: "Archive & Lifecycle", message: SERVICE_DEFAULTS["archive"].message },
  "guardium":          { label: "IBM Guardium", message: SERVICE_DEFAULTS["guardium"].message },
  "quantum":           { label: "Quantum Security (PQC)", message: SERVICE_DEFAULTS["quantum"].message },
};

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  enquiryType: z.enum(ENQUIRY_VALUES),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function ContactFormInner() {
  const searchParams = useSearchParams();

  // ?service= takes precedence over ?type= for pre-population
  const serviceKey = searchParams.get("service") ?? "";
  const serviceDefaults = SERVICE_DEFAULTS[serviceKey] ?? null;

  const rawType = searchParams.get("type") ?? "";
  const defaultType: EnquiryValue = serviceDefaults?.enquiryType
    ?? ((ENQUIRY_VALUES as readonly string[]).includes(rawType) ? (rawType as EnquiryValue) : "general");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      enquiryType: defaultType,
      message: serviceDefaults?.message ?? "",
    },
  });

  const watchedEnquiryType = watch("enquiryType");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const defaults = ENQUIRY_TYPE_DEFAULTS[watchedEnquiryType];
    setValue("message", defaults?.message ?? "");
  }, [watchedEnquiryType, setValue]);

  const activeDefaults = ENQUIRY_TYPE_DEFAULTS[watchedEnquiryType] ?? null;

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Submission failed');
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitError('Failed to send your message. Please try again or call us directly on +27 (0)87 188 3843.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16 md:pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero */}
        <div className="py-10 md:py-20 max-w-3xl">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Get in Touch
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Let&apos;s talk about your <span className="text-montana-gradient">data resilience.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl">
            Whether you&apos;re evaluating a new solution, need support on an existing deployment, or want to explore a channel partnership — our advisory team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column — Contact Details */}
          <div className="lg:col-span-4 space-y-8">

            {/* Direct Contact */}
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-5">Direct Contact</h3>
              <div className="space-y-4">
                <a
                  href="tel:+27871883843"
                  className="flex items-center gap-4 text-montana-muted hover:text-white transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/5 border border-white/10 group-hover:border-montana-pink/50 transition-colors">
                    <Phone className="h-4 w-4 text-montana-pink" />
                  </div>
                  <div>
                    <div className="text-xs text-montana-muted/60 uppercase tracking-wider mb-0.5">Phone</div>
                    <span className="text-sm text-white">+27 (0)87 188 3843</span>
                  </div>
                </a>
                <a
                  href="mailto:support@montanadc.com"
                  className="flex items-center gap-4 text-montana-muted hover:text-white transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/5 border border-white/10 group-hover:border-montana-pink/50 transition-colors">
                    <Mail className="h-4 w-4 text-montana-pink" />
                  </div>
                  <div>
                    <div className="text-xs text-montana-muted/60 uppercase tracking-wider mb-0.5">Email</div>
                    <span className="text-sm text-white">support@montanadc.com</span>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/5 border border-white/10">
                    <Clock className="h-4 w-4 text-montana-pink" />
                  </div>
                  <div>
                    <div className="text-xs text-montana-muted/60 uppercase tracking-wider mb-0.5">Office Hours</div>
                    <span className="text-sm text-white">Mon–Fri, 08:00–17:00 SAST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-5">Connect</h3>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/MontanaDataCompany/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/5 border border-white/10 text-montana-muted hover:text-white hover:border-montana-pink/50 hover:bg-montana-pink/5 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/company/montana-data-company/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/5 border border-white/10 text-montana-muted hover:text-white hover:border-montana-pink/50 hover:bg-montana-pink/5 transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-5">Quick Paths</h3>
              <div className="space-y-3">
                <Link href="/pos">
                  <div className="flex items-center gap-3 p-3 border border-white/10 hover:border-montana-pink/40 bg-white/[0.02] hover:bg-montana-pink/5 transition-all cursor-pointer group">
                    <Shield className="h-4 w-4 text-montana-pink shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-montana-pink transition-colors">Build Your Solution</div>
                      <div className="text-xs text-montana-muted">Interactive configurator</div>
                    </div>
                  </div>
                </Link>
                <Link href="/resources">
                  <div className="flex items-center gap-3 p-3 border border-white/10 hover:border-montana-pink/40 bg-white/[0.02] hover:bg-montana-pink/5 transition-all cursor-pointer group">
                    <MessageSquare className="h-4 w-4 text-montana-pink shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-montana-pink transition-colors">Resources & Insights</div>
                      <div className="text-xs text-montana-muted">Guides, checklists & whitepapers</div>
                    </div>
                  </div>
                </Link>
                <Link href="/partners">
                  <div className="flex items-center gap-3 p-3 border border-white/10 hover:border-montana-pink/40 bg-white/[0.02] hover:bg-montana-pink/5 transition-all cursor-pointer group">
                    <Building2 className="h-4 w-4 text-montana-pink shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-montana-pink transition-colors">Partner Programme</div>
                      <div className="text-xs text-montana-muted">Channel & white-label enquiries</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 border border-white/5 bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-montana-pink mt-0.5 shrink-0" />
                <p className="text-xs text-montana-muted leading-relaxed">
                  Please refer to our{" "}
                  <Link href="/privacy" className="text-montana-pink hover:underline">privacy policy</Link>
                  {" "}and{" "}
                  <Link href="/paia" className="text-montana-pink hover:underline">PAIA manual</Link>
                  {" "}for more information.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="lg:col-span-8">
            <SpotlightCard customSize className="p-5 md:p-10">
              {isSuccess ? (
                <div className="text-center py-16">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                    <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-3xl font-bold text-white mb-3">Message Received</h3>
                  <p className="text-montana-muted mb-8 max-w-md mx-auto">
                    A member of our advisory team will respond within one business day.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/resources">
                      <AnimatedButton variant="outline">
                        Explore Resources
                      </AnimatedButton>
                    </Link>
                    <Link href="/pos">
                      <AnimatedButton variant="primary">
                        Build Your Solution
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-1">Send an Enquiry</h2>
                    <p className="text-montana-muted text-sm">Complete the form and we&apos;ll be in touch within one business day.</p>
                  </div>

                  {activeDefaults && (
                    <div className="flex items-center gap-3 px-4 py-3 border border-montana-pink/20 bg-montana-pink/5 text-xs text-montana-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-montana-pink shrink-0" />
                      Pre-filled for <span className="text-white font-medium ml-1">{activeDefaults.label}</span>
                      <span className="ml-auto text-white/30">Edit any field before submitting</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-white/50">Full Name</label>
                      <input
                        {...register("name")}
                        id="name"
                        className="w-full border border-white/10 bg-montana-surface/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-montana-pink focus:outline-none transition-colors"
                        placeholder="Jane Dlamini"
                      />
                      {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/50">Corporate Email</label>
                      <input
                        {...register("email")}
                        id="email"
                        type="email"
                        className="w-full border border-white/10 bg-montana-surface/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-montana-pink focus:outline-none transition-colors"
                        placeholder="jane@company.co.za"
                      />
                      {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-white/50">Organisation</label>
                      <input
                        {...register("company")}
                        id="company"
                        className="w-full border border-white/10 bg-montana-surface/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-montana-pink focus:outline-none transition-colors"
                        placeholder="Acme (Pty) Ltd"
                      />
                      {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="enquiryType" className="text-xs font-bold uppercase tracking-wider text-white/50">Enquiry Type</label>
                      <select
                        {...register("enquiryType")}
                        id="enquiryType"
                        className="w-full border border-white/10 bg-montana-surface/80 px-4 py-3 text-sm text-white focus:border-montana-pink focus:outline-none transition-colors appearance-none"
                      >
                        <option value="" disabled>Select a category</option>
                        <optgroup label="Product Enquiries">
                          <option value="enterprise-backup">Enterprise Backup</option>
                          <option value="ransomware">Ransomware Protection</option>
                          <option value="archiving">Archiving &amp; Lifecycle</option>
                          <option value="quantum">Quantum Security (PQC)</option>
                          <option value="guardium">IBM Guardium</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="existing-client">Existing Client Support</option>
                          <option value="partnership">Channel Partnership</option>
                          <option value="compliance">POPIA / Compliance Consulting</option>
                          <option value="general">General Enquiry</option>
                        </optgroup>
                      </select>
                      {errors.enquiryType && <p className="text-xs text-red-400">Please select an enquiry type</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-white/50">Message</label>
                    <textarea
                      {...register("message")}
                      id="message"
                      rows={activeDefaults ? 10 : 5}
                      className="w-full border border-white/10 bg-montana-surface/50 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-montana-pink focus:outline-none transition-colors resize-none font-mono"
                      placeholder="Tell us about your environment, current challenges, or what you're looking to achieve..."
                    />
                    {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
                      {submitError}
                    </p>
                  )}
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    className="w-full py-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit Enquiry"}
                  </AnimatedButton>
                </form>
              )}
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-16 bg-montana-bg min-h-screen" />}>
      <ContactFormInner />
    </Suspense>
  );
}
