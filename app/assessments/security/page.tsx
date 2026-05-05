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

// Fallback URL using query params — used when the API doesn't return an assessmentId.
function buildFallbackUrl(finalAnswers: Record<number, number>, score: number): string {
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
  id: string;
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
          .select("id, full_name, email, company_name")
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

  // Skip the gate for any authenticated user — profile may be partially filled.
  const canSkipLeadGate = Boolean(authedProfile);

  // Silently submit the assessment using profile data and navigate to results.
  const autoSubmitFromProfile = useCallback(async (finalAnswers: Record<number, number>) => {
    const finalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    const fallbackUrl = buildFallbackUrl(finalAnswers, finalScore);
    if (!authedProfile) {
      console.error("[security] autoSubmitFromProfile called with no authedProfile — skipping");
      router.push(fallbackUrl);
      return;
    }
    const profileLead = {
      name:    authedProfile.full_name    ?? "Portal User",
      company: authedProfile.company_name ?? "N/A",
      email:   authedProfile.email,
    };
    setLeadForm(profileLead);
    let navigateTo = fallbackUrl;
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security",
          lead: profileLead,
          answers: finalAnswers,
          score: finalScore,
          user_id: authedProfile.id,
        }),
      });
      const data = await res.json();
      if (data.assessmentId) {
        navigateTo = `/assessments/security/results/${data.assessmentId}`;
      }
    } catch (err) {
      console.error("[security] auto-submit failed:", err);
    }
    router.push(navigateTo);
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
    const fallbackUrl = buildFallbackUrl(answers, totalScore);
    let navigateTo = fallbackUrl;
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security",
          lead: leadForm,
          answers,
          score: totalScore,
        }),
      });
      const data = await res.json();
      if (data.assessmentId) {
        navigateTo = `/assessments/security/results/${data.assessmentId}`;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      router.push(navigateTo);
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
    <div className="pt-24 pb-24 min-h-screen">
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

        {/* Phase 2b: Value-before-gate — show score immediately, gate the full report */}
        {currentStep === 10 && pendingFinalAnswers === null && (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* Score preview — visible immediately, no gate */}
            {(() => {
              const gateScore = Object.values(answers).reduce((a, b) => a + b, 0);
              const gateRisk = gateScore <= 7 ? "High Risk" : gateScore <= 14 ? "Moderate Risk" : "Low Risk";
              const gateCompliant = Object.values(answers).filter(v => v === 2).length;
              const gatePartial = Object.values(answers).filter(v => v === 1).length;
              const gateCritical = Object.values(answers).filter(v => v === 0).length;
              const isGateHigh = gateRisk === "High Risk";
              const isGateModerate = gateRisk === "Moderate Risk";
              const gateColorClass = isGateHigh ? "text-red-500" : isGateModerate ? "text-amber-500" : "text-green-500";
              const gateBgClass = isGateHigh ? "bg-red-500" : isGateModerate ? "bg-amber-500" : "bg-green-500";
              const gateBorderClass = isGateHigh ? "border-red-500" : isGateModerate ? "border-amber-500" : "border-green-500";
              const gateMessage = isGateHigh
                ? "Immediate attention required — critical gaps in your security and backup posture."
                : isGateModerate
                ? "Gaps in your resilience architecture. Remediation recommended."
                : "Well-positioned. Optimisation opportunities exist to strengthen your resilience further.";
              return (
                <SpotlightCard customSize className={`p-8 md:p-12 border-t-4 ${gateBorderClass}`}>
                  <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                      <div className={`inline-flex h-36 w-36 items-center justify-center rounded-full bg-montana-surface border-4 ${gateBorderClass} shadow-[0_0_40px_rgba(0,0,0,0.4)]`}>
                        {isGateHigh && <TrendingDown className={`h-18 w-18 ${gateColorClass}`} style={{ height: "4.5rem", width: "4.5rem" }} />}
                        {isGateModerate && <AlertTriangle className={`h-18 w-18 ${gateColorClass}`} style={{ height: "4.5rem", width: "4.5rem" }} />}
                        {!isGateHigh && !isGateModerate && <Activity className={`h-18 w-18 ${gateColorClass}`} style={{ height: "4.5rem", width: "4.5rem" }} />}
                      </div>
                    </div>
                    <h2 className="font-display text-7xl md:text-8xl font-bold text-white mb-2">{gateScore}</h2>
                    <p className="text-xl text-white/40 mb-4">out of 20</p>
                    <div className={`inline-flex items-center px-6 py-2 rounded-full ${gateBgClass} bg-opacity-10 border ${gateBorderClass} mb-6`}>
                      <Activity className={`h-4 w-4 mr-2 ${gateColorClass}`} />
                      <span className={`font-bold uppercase tracking-widest text-sm ${gateColorClass}`}>{gateRisk}</span>
                    </div>
                    <p className="text-lg text-montana-muted max-w-2xl mx-auto leading-relaxed">{gateMessage}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                    <div className="text-center p-4 sm:border-r border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{gateCompliant}</div>
                      <div className="text-xs text-montana-muted uppercase tracking-wider">Fully Implemented</div>
                    </div>
                    <div className="text-center p-4 sm:border-r border-white/10">
                      <div className="text-4xl font-bold text-white mb-1">{gatePartial}</div>
                      <div className="text-xs text-montana-muted uppercase tracking-wider">Partial / Gaps</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold text-red-400 mb-1">{gateCritical}</div>
                      <div className="text-xs text-montana-muted uppercase tracking-wider">Critical Gaps</div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })()}

            {/* Lead gate — unlock full report */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Blurred gap preview */}
              <div className="lg:col-span-3 filter blur-sm opacity-40 pointer-events-none select-none">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-xl" />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="h-48 bg-white/5 border border-white/10 rounded-xl" />
                  <div className="h-48 bg-white/5 border border-white/10 rounded-xl" />
                </div>
              </div>

              {/* Gate form */}
              <div className="lg:col-span-2 lg:sticky lg:top-32">
                <SpotlightCard customSize className="p-8 border-red-500/30 shadow-2xl shadow-red-500/10">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 mb-5">
                    <Lock className="h-7 w-7 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Unlock Your Full Report</h3>
                  <p className="text-montana-muted text-sm mb-6 leading-relaxed">
                    Enter your details to reveal your key gap areas, personalised recommendations, and receive your report by email.
                  </p>
                  <form onSubmit={submitLead} className="space-y-3">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Company Name"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Work Email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
                    />
                    <div className="pt-1">
                      <AnimatedButton variant="primary" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Generating Report..." : "Reveal Full Report"}
                      </AnimatedButton>
                    </div>
                    <p className="text-xs text-center text-white/40">
                      Your results are confidential. We will never share your information.
                    </p>
                  </form>
                </SpotlightCard>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
