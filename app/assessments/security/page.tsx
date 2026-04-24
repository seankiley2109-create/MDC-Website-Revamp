"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AwarenessCards, type AwarenessFact } from "@/components/assessments/awareness-cards";
import {
  Shield, Database, ShieldAlert, Clock, AlertTriangle,
  Lock, Server, Eye, Zap, Monitor, TrendingDown, DollarSign, Activity,
} from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser";

const questions = [
  {
    id: 1,
    category: "Data Protection",
    icon: Database,
    text: "Do you currently back up all critical endpoint data (laptops, desktops, remote devices) automatically and centrally?",
    options: [
      { label: "Yes", value: 2, desc: "Fully automated and centrally managed." },
      { label: "Partial", value: 1, desc: "Some devices covered, or manual process." },
      { label: "No", value: 0, desc: "No centralised endpoint backup in place." },
    ],
    facts: [
      {
        icon: AlertTriangle,
        stat: "70%",
        headline: "of business data lives on endpoints",
        body: "Laptops, desktops, and remote devices hold the majority of your organisation's working data — yet most backup strategies only cover servers.",
        accentColor: "red" as const,
      },
      {
        icon: TrendingDown,
        stat: "60%",
        headline: "of SMEs close after major data loss",
        body: "Small and medium enterprises that suffer catastrophic data loss have a 60% chance of shutting down within 6 months.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 2,
    category: "SaaS Resilience",
    icon: Server,
    text: "Are your Microsoft 365 (Exchange, OneDrive, SharePoint, Teams) workloads independently backed up and recoverable outside of Microsoft's native retention?",
    options: [
      { label: "Yes", value: 2, desc: "Independent third-party backup in place." },
      { label: "Partial", value: 1, desc: "Relying on Microsoft's native retention only." },
      { label: "No", value: 0, desc: "No independent M365 backup." },
    ],
    facts: [
      {
        icon: AlertTriangle,
        stat: "93 Days",
        headline: "Microsoft's maximum data retention",
        body: "Microsoft only retains deleted data for 30–93 days depending on the service. After that, your emails, files, and Teams data are permanently gone — and Microsoft won't recover them for you.",
        accentColor: "red" as const,
      },
      {
        icon: DollarSign,
        stat: "1 in 3",
        headline: "organisations have lost SaaS data",
        body: "A third of organisations using SaaS platforms have experienced data loss they couldn't recover from native tools. Microsoft's Shared Responsibility Model makes YOUR data YOUR problem.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 3,
    category: "Ransomware",
    icon: ShieldAlert,
    text: "Do you have immutable backups or air-gapped storage in place to ensure data cannot be altered or deleted by ransomware?",
    options: [
      { label: "Yes", value: 2, desc: "Immutable/air-gapped backups confirmed." },
      { label: "Partial", value: 1, desc: "Standard backups, not verified as immutable." },
      { label: "No", value: 0, desc: "No immutable or air-gapped storage." },
    ],
    facts: [
      {
        icon: ShieldAlert,
        stat: "R36M",
        headline: "average ransomware recovery cost in South Africa",
        body: "The total cost of ransomware recovery — including downtime, lost revenue, and remediation — averages R36 million for South African businesses. Paying the ransom doesn't guarantee recovery.",
        accentColor: "red" as const,
      },
      {
        icon: AlertTriangle,
        stat: "73%",
        headline: "of ransomware attacks target backups",
        body: "Attackers specifically seek out and encrypt or delete backup files before triggering ransomware. Without immutable storage, your backups are your biggest vulnerability.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 4,
    category: "Recovery",
    icon: Clock,
    text: "When was the last time you successfully performed a full data recovery test (not just file-level restores)?",
    options: [
      { label: "Recently", value: 2, desc: "Full recovery tested within the last 6 months." },
      { label: "A While Ago", value: 1, desc: "Over 6 months since last full test." },
      { label: "Never", value: 0, desc: "We've never tested a full recovery." },
    ],
    facts: [
      {
        icon: Clock,
        stat: "73%",
        headline: "of recovery tests reveal failures",
        body: "Nearly three-quarters of organisations that believe their backups work discover critical failures during actual recovery testing. A backup that can't restore is not a backup.",
        accentColor: "amber" as const,
      },
      {
        icon: TrendingDown,
        stat: "21 Days",
        headline: "average recovery time after ransomware",
        body: "Without tested, verified backups, the average organisation takes 21 days to restore operations after a cyber incident — at enormous financial cost.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 5,
    category: "Endpoint Security",
    icon: Monitor,
    text: "Do you have centralised visibility and control over all endpoints, including remote and mobile devices?",
    options: [
      { label: "Yes", value: 2, desc: "Full visibility via UEM/MDM platform." },
      { label: "Partial", value: 1, desc: "Some devices managed, gaps in coverage." },
      { label: "No", value: 0, desc: "No centralised endpoint management." },
    ],
    facts: [
      {
        icon: Eye,
        stat: "30%",
        headline: "more endpoints than IT knows about",
        body: "The average enterprise has 30% more endpoints connected to their network than IT teams are aware of. Each unmanaged device is an unmonitored entry point for attackers.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 6,
    category: "Device Compliance",
    icon: Shield,
    text: "Are corporate policies (encryption, patching, screen lock, etc.) enforced consistently across all user devices?",
    options: [
      { label: "Yes", value: 2, desc: "Policies enforced via MDM/UEM platform." },
      { label: "Partial", value: 1, desc: "Policies exist but not uniformly enforced." },
      { label: "No", value: 0, desc: "No consistent policy enforcement." },
    ],
    facts: [
      {
        icon: ShieldAlert,
        stat: "80%",
        headline: "of breaches involve unpatched devices",
        body: "The vast majority of successful cyber attacks exploit known vulnerabilities on unpatched devices. Without enforced policies, your devices are wide open.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 7,
    category: "Threat Detection",
    icon: Zap,
    text: "Can your organisation detect and respond to anomalous behaviour or potential ransomware activity in real time?",
    options: [
      { label: "Yes", value: 2, desc: "Real-time detection and response in place." },
      { label: "Partial", value: 1, desc: "Some monitoring, but not real-time." },
      { label: "No", value: 0, desc: "No anomaly detection capabilities." },
    ],
    facts: [
      {
        icon: Clock,
        stat: "204 Days",
        headline: "average time to detect a breach",
        body: "Without real-time detection, the average organisation takes 204 days to identify a breach. Attackers have over 6 months of undetected access to your systems and data.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 8,
    category: "Data Visibility",
    icon: Eye,
    text: "Do you know where your sensitive data resides and who has access to it across endpoints and cloud platforms?",
    options: [
      { label: "Yes", value: 2, desc: "Full data mapping and access controls." },
      { label: "Partial", value: 1, desc: "Some visibility, not comprehensive." },
      { label: "No", value: 0, desc: "Limited or no data visibility." },
    ],
    facts: [
      {
        icon: AlertTriangle,
        stat: "65%",
        headline: "of organisations can't locate all sensitive data",
        body: "Most businesses have sensitive data scattered across endpoints, cloud platforms, and SaaS apps with no clear map of where it lives or who can access it.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 9,
    category: "Business Continuity",
    icon: Activity,
    text: "How quickly can you restore business operations (users, systems, and data) after a cyber incident?",
    options: [
      { label: "Hours", value: 2, desc: "Tested DR plan with sub-24h RTO." },
      { label: "Days", value: 1, desc: "Recovery possible but untested timeline." },
      { label: "Unsure", value: 0, desc: "No defined recovery time objective." },
    ],
    facts: [
      {
        icon: DollarSign,
        stat: "R5.2M/hr",
        headline: "average cost of downtime for enterprise",
        body: "Every hour your systems are down costs revenue, productivity, and reputation. Without a tested continuity plan, you're gambling with your organisation's survival.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 10,
    category: "Integration",
    icon: Lock,
    text: "Are your security and backup tools integrated into a unified platform with automated alerts, policies, and response actions?",
    options: [
      { label: "Yes", value: 2, desc: "Unified platform with automation." },
      { label: "Partial", value: 1, desc: "Multiple tools, some integration." },
      { label: "No", value: 0, desc: "Siloed tools, manual processes." },
    ],
    facts: [
      {
        icon: TrendingDown,
        stat: "50%",
        headline: "of security alerts go uninvestigated",
        body: "When tools are siloed and manual, half of all security alerts are never investigated. Integration and automation aren't nice-to-haves — they're survival requirements.",
        accentColor: "amber" as const,
      },
    ],
  },
];

function buildResultsUrl(finalAnswers: Record<number, number>, score: number): string {
  const risk = score <= 7 ? "High Risk" : score <= 14 ? "Moderate Risk" : "Low Risk";
  const compliant = Object.values(finalAnswers).filter((v) => v === 2).length;
  const partial = Object.values(finalAnswers).filter((v) => v === 1).length;
  const critical = Object.values(finalAnswers).filter((v) => v === 0).length;

  const catScores: Record<string, { total: number; count: number }> = {};
  questions.forEach((q, i) => {
    const s = finalAnswers[i] ?? 0;
    if (!catScores[q.category]) catScores[q.category] = { total: 0, count: 0 };
    catScores[q.category].total += s;
    catScores[q.category].count += 1;
  });
  const gaps = Object.entries(catScores)
    .filter(([, v]) => v.total / v.count < 2)
    .sort(([, a], [, b]) => a.total / a.count - b.total / b.count)
    .slice(0, 3)
    .map(([cat]) => cat)
    .join(",");

  const params = new URLSearchParams({
    score: String(score),
    risk,
    compliant: String(compliant),
    partial: String(partial),
    critical: String(critical),
    ...(gaps ? { gaps } : {}),
  });
  return `/assessments/security/results?${params.toString()}`;
}

type AuthedProfile = {
  full_name: string | null;
  email: string;
  company_name: string | null;
};

export default function SecurityAssessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [leadForm, setLeadForm] = useState({ name: "", company: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authedProfile, setAuthedProfile] = useState<AuthedProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [pendingFinalAnswers, setPendingFinalAnswers] = useState<Record<number, number> | null>(null);

  // On mount: check auth and pre-load profile data to decide whether we can skip the lead gate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setIsAuthChecking(false);
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, company_name")
          .eq("id", user.id)
          .single();
        if (!cancelled && data) {
          setAuthedProfile(data as AuthedProfile);
        }
      } catch (err) {
        console.error("[security] auth check failed:", err);
      } finally {
        if (!cancelled) setIsAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Can we bypass the lead gate? Only if we have name + company + email on file.
  const canSkipLeadGate = Boolean(
    authedProfile?.full_name &&
    authedProfile?.company_name &&
    authedProfile?.email,
  );

  // Silently submit the assessment using profile data and navigate to results.
  const autoSubmitFromProfile = useCallback(async (finalAnswers: Record<number, number>) => {
    const finalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    const url = buildResultsUrl(finalAnswers, finalScore);
    if (!authedProfile) {
      console.error("[security] autoSubmitFromProfile called with no authedProfile — skipping");
      router.push(url);
      return;
    }
    const profileLead = {
      name: authedProfile.full_name ?? "",
      company: authedProfile.company_name ?? "",
      email: authedProfile.email,
    };
    setLeadForm(profileLead);
    try {
      await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security",
          lead: profileLead,
          answers: finalAnswers,
          score: finalScore,
        }),
      });
    } catch (err) {
      console.error("[security] auto-submit failed:", err);
    } finally {
      router.push(url);
    }
  }, [authedProfile, router]);

  useEffect(() => {
    if (isAuthChecking || !pendingFinalAnswers) return;
    if (canSkipLeadGate) {
      void autoSubmitFromProfile(pendingFinalAnswers);
    } else {
      setCurrentStep(10);
    }
    setPendingFinalAnswers(null);
  }, [isAuthChecking, pendingFinalAnswers, canSkipLeadGate, autoSubmitFromProfile]);

  const handleAnswer = (value: number) => {
    const nextAnswers = { ...answers, [currentStep]: value };
    setAnswers(nextAnswers);
    setTimeout(() => {
      if (currentStep < 9) {
        setCurrentStep((prev) => prev + 1);
      } else if (isAuthChecking) {
        // Auth check still in flight — park the answers; the useEffect above will resolve it.
        setPendingFinalAnswers(nextAnswers);
        setCurrentStep(10);
      } else if (canSkipLeadGate) {
        void autoSubmitFromProfile(nextAnswers);
      } else {
        setCurrentStep(10);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep < 10) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security",
          lead: leadForm,
          answers,
          score: totalScore,
        }),
      });
      router.push(buildResultsUrl(answers, totalScore));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Risk trajectory for the live meter
  const maxPossibleSoFar = currentStep * 2;
  const currentScoreSoFar = Object.keys(answers)
    .filter((k) => parseInt(k) < currentStep)
    .reduce((acc, k) => acc + answers[parseInt(k)], 0);
  const riskPercentage = currentStep === 0 ? 0 : Math.min(100, Math.max(0, ((maxPossibleSoFar - currentScoreSoFar) / maxPossibleSoFar) * 100));
  let riskColor = "bg-green-500";
  if (riskPercentage > 30) riskColor = "bg-amber-500";
  if (riskPercentage > 60) riskColor = "bg-red-500";

  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="flex h-2 w-2 bg-red-500 mr-3 shadow-[0_0_8px_#ef4444]"></span>
            Backup & Security Assessment
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            How resilient is your organisation?
          </h1>
          <p className="text-montana-muted max-w-2xl mx-auto">
            Answer 10 questions to uncover critical vulnerabilities in your data protection, endpoint security, and cyber resilience posture.
          </p>
        </div>

        {/* Phase 1: Assessment Questions */}
        {currentStep < 10 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Questions — left 3 columns */}
            <div className="lg:col-span-3">
              <SpotlightCard customSize className="p-8 md:p-10">
                {/* Sign-up storage note — shown only to unauthenticated users */}
                {!isAuthChecking && !authedProfile && (
                  <div className="mb-6 flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 p-3 rounded">
                    <span className="text-amber-400 text-sm shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-montana-muted leading-relaxed">
                      <Link href="/sign-up" className="text-amber-400 font-semibold hover:underline">Create a free account</Link> — your assessment results will be saved to your profile for future reference.
                    </p>
                  </div>
                )}
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white">
                      Question {currentStep + 1} of 10
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-montana-muted block mb-1">Risk Trajectory</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-montana-surface rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${riskColor}`} style={{ width: `${riskPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-montana-surface rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(currentStep / 10) * 100}%` }} />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8 min-h-[100px]">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = questions[currentStep].icon;
                      return <Icon className="h-6 w-6 text-red-400" />;
                    })()}
                    <span className="text-sm font-bold tracking-widest text-red-400 uppercase">
                      {questions[currentStep].category}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {questions[currentStep].text}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[currentStep].options.map((option) => (
                    <button
                      type="button"
                      key={option.label}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full text-left rounded-xl border p-5 transition-all flex items-center justify-between group
                        ${answers[currentStep] === option.value ? "border-red-500 bg-red-500/10" : "border-white/10 bg-montana-surface/50 hover:border-white/30 hover:bg-white/5"}`}
                      aria-pressed={answers[currentStep] === option.value}
                    >
                      <div>
                        <div className="font-bold text-white text-lg mb-1">{option.label}</div>
                        <div className="text-sm text-montana-muted">{option.desc}</div>
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${answers[currentStep] === option.value ? "border-red-500" : "border-white/20 group-hover:border-white/40"}`}>
                        {answers[currentStep] === option.value && <div className="h-3 w-3 rounded-full bg-red-500" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-start">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`text-sm font-medium transition-colors ${currentStep === 0 ? "text-white/20 cursor-not-allowed" : "text-montana-muted hover:text-white"}`}
                  >
                    ← Previous Question
                  </button>
                </div>
              </SpotlightCard>
            </div>

            {/* Awareness Cards — right 2 columns; below question on mobile, right column on desktop */}
            <div className="lg:col-span-2 lg:order-last">
              <div className="lg:sticky lg:top-32">
                <AwarenessCards
                  facts={questions[currentStep].facts}
                  currentQuestion={currentStep}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase 2a: Auth-loading spinner (shown while auth check is still resolving) */}
        {currentStep === 10 && pendingFinalAnswers !== null && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="h-10 w-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-montana-muted text-sm">Checking your account…</p>
            </div>
          </div>
        )}

        {/* Phase 2b: Lead Gate form (shown only once auth has resolved and gate is needed) */}
        {currentStep === 10 && pendingFinalAnswers === null && (
          <div className="relative overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-500">
            <div className="filter blur-xl opacity-30 pointer-events-none select-none">
              <SpotlightCard customSize className="p-12">
                <div className="flex justify-center mb-8">
                  <div className="h-32 w-32 rounded-full bg-red-500" />
                </div>
                <div className="h-12 bg-white/20 rounded w-1/2 mx-auto mb-4" />
                <div className="h-6 bg-white/10 rounded w-3/4 mx-auto mb-12" />
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-48 bg-white/10 rounded" />
                  <div className="h-48 bg-white/10 rounded" />
                  <div className="h-48 bg-white/10 rounded" />
                </div>
              </SpotlightCard>
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-6 bg-montana-bg/40 backdrop-blur-md">
              <SpotlightCard customSize className="w-full max-w-md p-8 border-red-500/30 shadow-2xl shadow-red-500/10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 mb-6 mx-auto flex">
                  <Lock className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">Unlock Your Security Report</h3>
                <p className="text-montana-muted text-center text-sm mb-8">
                  Enter your details to reveal your security & resilience score and receive your report via email.
                </p>

                <form onSubmit={submitLead} className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Company Name"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Work Email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                  />
                  <div className="pt-2">
                    <AnimatedButton variant="primary" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Generating Report..." : "Reveal My Score"}
                    </AnimatedButton>
                  </div>
                  <p className="text-xs text-center text-white/40 mt-4">
                    By submitting, you agree to our privacy policy. Your results are confidential.
                  </p>
                </form>
              </SpotlightCard>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
