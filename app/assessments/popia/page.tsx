"use client";

import { useEffect, useState, useCallback } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AwarenessCards, type AwarenessFact } from "@/components/assessments/awareness-cards";
import {
  Shield, FileText, UserCheck, AlertTriangle,
  XCircle, CheckCircle, Award, Lock, ArrowRight,
  Activity, DollarSign, Scale, Eye, Users, Clock,
} from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser";
import { POPIA_SERVICES } from "@/lib/popia-services";

const questions = [
  {
    id: 1,
    category: "Governance",
    icon: FileText,
    text: "Has your organisation appointed an Information Officer and established a formal POPIA compliance framework?",
    options: [
      { label: "Yes", value: 2, desc: "Information Officer appointed and framework in place." },
      { label: "Partial", value: 1, desc: "In progress or informally practiced." },
      { label: "No", value: 0, desc: "Not appointed or unknown." },
    ],
    facts: [
      {
        icon: DollarSign,
        stat: "R10M",
        headline: "maximum fine per POPIA offence",
        body: "Failure to appoint an Information Officer is a criminal offence under POPIA. The Information Regulator can impose fines of up to R10 million and up to 10 years imprisonment per offence.",
        accentColor: "red" as const,
      },
      {
        icon: AlertTriangle,
        stat: "72%",
        headline: "of SA businesses are not fully compliant",
        body: "Despite POPIA being fully enforceable since July 2021, the majority of South African businesses have not completed their compliance journey — leaving them exposed to enforcement action.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 2,
    category: "Governance",
    icon: Users,
    text: "Have you conducted employee training on POPIA and are your internal policies regularly reviewed and updated?",
    options: [
      { label: "Yes", value: 2, desc: "Regular training and policy reviews conducted." },
      { label: "Partial", value: 1, desc: "Initial training done, no regular reviews." },
      { label: "No", value: 0, desc: "No training or policy review process." },
    ],
    facts: [
      {
        icon: Users,
        stat: "80%",
        headline: "of data breaches involve human error",
        body: "Your staff are your biggest vulnerability. Without regular POPIA training, employees unknowingly expose the organisation to breach risks — and personal liability.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 3,
    category: "Lawful Processing",
    icon: Scale,
    text: "Is personal information collected only for specific, explicitly defined, and legitimate purposes?",
    options: [
      { label: "Yes", value: 2, desc: "Purpose limitation fully documented." },
      { label: "Partial", value: 1, desc: "Some controls, not consistently applied." },
      { label: "No", value: 0, desc: "No formal purpose limitation controls." },
    ],
    facts: [
      {
        icon: Scale,
        stat: "Condition 2",
        headline: "Purpose Limitation is non-negotiable",
        body: "POPIA's Condition 2 requires that personal information may only be collected for a specific, explicitly defined, and lawful purpose. Collecting data 'just in case' is a direct violation.",
        accentColor: "pink" as const,
      },
    ],
  },
  {
    id: 4,
    category: "Lawful Processing",
    icon: Clock,
    text: "Is data retention limited to only the timeframes necessary, with documented retention schedules?",
    options: [
      { label: "Yes", value: 2, desc: "Retention schedules documented and enforced." },
      { label: "Partial", value: 1, desc: "Some retention limits, not formalised." },
      { label: "No", value: 0, desc: "No defined retention limits." },
    ],
    facts: [
      {
        icon: Clock,
        stat: "Indefinite",
        headline: "data hoarding is a compliance violation",
        body: "POPIA requires that personal information must be destroyed, deleted, or de-identified as soon as the purpose for processing has been achieved. Keeping data 'forever' is not just messy — it's illegal.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 5,
    category: "Consent",
    icon: UserCheck,
    text: "Is explicit consent obtained before processing, with purposes clearly communicated to data subjects?",
    options: [
      { label: "Yes", value: 2, desc: "Documented consent with clear purpose statements." },
      { label: "Partial", value: 1, desc: "Some consent mechanisms in place." },
      { label: "No", value: 0, desc: "No formal consent processes." },
    ],
    facts: [
      {
        icon: AlertTriangle,
        stat: "Invalid",
        headline: "blanket consent doesn't count",
        body: "A pre-ticked checkbox or buried clause in T&Cs does not constitute valid consent under POPIA. Consent must be voluntary, specific, and informed — and the data subject must be able to withdraw it at any time.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 6,
    category: "Processing Integrity",
    icon: Shield,
    text: "Are controls in place to prevent incompatible further processing of personal information beyond its original purpose?",
    options: [
      { label: "Yes", value: 2, desc: "Strict controls on further processing." },
      { label: "Partial", value: 1, desc: "Informal controls or case-by-case basis." },
      { label: "No", value: 0, desc: "No controls on further processing." },
    ],
    facts: [
      {
        icon: DollarSign,
        stat: "Per Offence",
        headline: "each violation is a separate fine",
        body: "The R10 million fine and 10-year imprisonment apply per offence. If you process 1,000 records in violation, that's potentially 1,000 separate offences. The financial exposure compounds rapidly.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 7,
    category: "Data Quality",
    icon: Eye,
    text: "Are data accuracy verification and update processes in place to ensure personal information remains correct and current?",
    options: [
      { label: "Yes", value: 2, desc: "Regular verification and update processes." },
      { label: "Partial", value: 1, desc: "Some checks, not systematic." },
      { label: "No", value: 0, desc: "No data accuracy processes." },
    ],
    facts: [
      {
        icon: Eye,
        stat: "Liable",
        headline: "inaccurate data = your liability",
        body: "If you make a decision based on inaccurate personal data (e.g., credit scoring, employment), the affected individual can hold your organisation liable for damages. Data quality is a legal obligation, not a nice-to-have.",
        accentColor: "amber" as const,
      },
    ],
  },
  {
    id: 8,
    category: "Transparency",
    icon: FileText,
    text: "Are privacy notices clear and accessible, and is third-party data sharing disclosed to data subjects?",
    options: [
      { label: "Yes", value: 2, desc: "Clear notices and full disclosure." },
      { label: "Partial", value: 1, desc: "Basic notices, incomplete disclosure." },
      { label: "No", value: 0, desc: "No privacy notices or disclosure." },
    ],
    facts: [
      {
        icon: AlertTriangle,
        stat: "Public",
        headline: "the Regulator publishes enforcement actions",
        body: "The Information Regulator makes enforcement notices public. A POPIA violation doesn't just cost money — it becomes a permanent, searchable record that damages your reputation with clients and partners.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 9,
    category: "Security",
    icon: Lock,
    text: "Have security risks been assessed and are appropriate safeguards implemented to protect personal information?",
    options: [
      { label: "Yes", value: 2, desc: "Risk assessment done, safeguards implemented." },
      { label: "Partial", value: 1, desc: "Some safeguards, no formal risk assessment." },
      { label: "No", value: 0, desc: "No security assessment or safeguards." },
    ],
    facts: [
      {
        icon: Lock,
        stat: "72 Hours",
        headline: "to notify the Regulator of a breach",
        body: "Under POPIA, you must notify the Information Regulator and affected data subjects as soon as reasonably possible after a breach. Without proper safeguards, you're not just breached — you're non-compliant twice over.",
        accentColor: "red" as const,
      },
    ],
  },
  {
    id: 10,
    category: "Data Subject Rights",
    icon: UserCheck,
    text: "Are data subject rights (access, correction, deletion, objection) effectively enabled and managed?",
    options: [
      { label: "Yes", value: 2, desc: "Formal processes for all data subject requests." },
      { label: "Partial", value: 1, desc: "Can handle requests, no formal process." },
      { label: "No", value: 0, desc: "No process for data subject requests." },
    ],
    facts: [
      {
        icon: UserCheck,
        stat: "Direct",
        headline: "individuals can complain to the Regulator",
        body: "Any data subject can lodge a complaint directly with the Information Regulator if you fail to respond to their request. The Regulator has the power to conduct inspections, issue enforcement notices, and impose penalties — on one person's complaint.",
        accentColor: "amber" as const,
      },
    ],
  },
];

type AuthedProfile = {
  full_name: string | null;
  email: string;
  company_name: string | null;
};

export default function PopiaAssessment() {
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
        console.error("[popia] auth check failed:", err);
      } finally {
        if (!cancelled) setIsAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Can we bypass the lead gate?  Only if we have name + company + email on file.
  const canSkipLeadGate = Boolean(
    authedProfile?.full_name &&
    authedProfile?.company_name &&
    authedProfile?.email,
  );

  // Silently submit the assessment using profile data and jump to results.
  const autoSubmitFromProfile = useCallback(async (finalAnswers: Record<number, number>) => {
    if (!authedProfile) {
      console.error("[popia] autoSubmitFromProfile called with no authedProfile — skipping");
      setCurrentStep(11);
      return;
    }
    const profileLead = {
      name: authedProfile.full_name ?? "",
      company: authedProfile.company_name ?? "",
      email: authedProfile.email,
    };
    setLeadForm(profileLead);
    const finalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    try {
      await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "popia",
          lead: profileLead,
          answers: finalAnswers,
          score: finalScore,
        }),
      });
    } catch (err) {
      console.error("[popia] auto-submit failed:", err);
    } finally {
      setCurrentStep(11);
    }
  }, [authedProfile]);

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
          type: "popia",
          lead: leadForm,
          answers,
          score: totalScore,
        }),
      });
      setCurrentStep(11);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scoring: 0-4 Yes (0-8 points) = High Risk, 5-7 Yes (10-14) = Medium, 8-10 Yes (16-20) = Low
  let status = "Low Risk";
  let message = "Well-positioned. An optimisation audit is recommended to maintain compliance.";
  let colorClass = "text-green-500";
  let bgClass = "bg-green-500";
  let borderClass = "border-green-500";

  if (totalScore <= 8) {
    status = "High Risk";
    message = "Immediate intervention advised — critical POPIA compliance gaps detected.";
    colorClass = "text-red-500";
    bgClass = "bg-red-500";
    borderClass = "border-red-500";
  } else if (totalScore <= 14) {
    status = "Medium Risk";
    message = "Remediation required — several compliance gaps need attention.";
    colorClass = "text-amber-500";
    bgClass = "bg-amber-500";
    borderClass = "border-amber-500";
  }

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
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            POPIA Compliance Assessment
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Is your organisation legally compliant?
          </h1>
          <p className="text-montana-muted max-w-2xl mx-auto">
            A 10-question snapshot of an 88-control comprehensive assessment. Identify your POPIA risk exposure in under 5 minutes.
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
                    <div className="h-full bg-montana-pink transition-all duration-300" style={{ width: `${(currentStep / 10) * 100}%` }} />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8 min-h-[100px]">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = questions[currentStep].icon;
                      return <Icon className="h-6 w-6 text-montana-pink" />;
                    })()}
                    <span className="text-sm font-bold tracking-widest text-montana-pink uppercase">
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
                        ${answers[currentStep] === option.value ? "border-montana-pink bg-montana-magenta/10" : "border-white/10 bg-montana-surface/50 hover:border-white/30 hover:bg-white/5"}`}
                      aria-pressed={answers[currentStep] === option.value}
                    >
                      <div>
                        <div className="font-bold text-white text-lg mb-1">{option.label}</div>
                        <div className="text-sm text-montana-muted">{option.desc}</div>
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${answers[currentStep] === option.value ? "border-montana-pink" : "border-white/20 group-hover:border-white/40"}`}>
                        {answers[currentStep] === option.value && <div className="h-3 w-3 rounded-full bg-montana-pink" />}
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
              <div className="h-10 w-10 border-2 border-montana-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                  <div className="h-32 w-32 rounded-full bg-montana-pink" />
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
              <SpotlightCard customSize className="w-full max-w-md p-8 border-montana-pink/30 shadow-2xl shadow-montana-pink/10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-montana-magenta/20 border border-montana-pink/30 mb-6 mx-auto flex">
                  <Lock className="h-8 w-8 text-montana-pink" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">Unlock Your POPIA Report</h3>
                <p className="text-montana-muted text-center text-sm mb-8">
                  Enter your details to reveal your POPIA maturity score and receive your 1-page PDF snapshot via email.
                </p>

                <form onSubmit={submitLead} className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-montana-pink focus:outline-none"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Company Name"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-montana-pink focus:outline-none"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Work Email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full rounded-sm border border-white/10 bg-montana-surface/80 px-4 py-3 text-white focus:border-montana-pink focus:outline-none"
                  />
                  <div className="pt-2">
                    <AnimatedButton variant="primary" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Generating Report..." : "Reveal My Score"}
                    </AnimatedButton>
                  </div>
                  <p className="text-xs text-center text-white/40 mt-4">
                    By submitting, you agree to our privacy policy. We will send your results to the email provided.
                  </p>
                </form>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Phase 3: Results Dashboard & Upsell */}
        {currentStep === 11 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <SpotlightCard customSize className={`p-8 md:p-12 mb-12 border-t-4 ${borderClass}`}>
              <div className="text-center mb-12">
                <div className="relative inline-block mb-6">
                  <div className={`inline-flex h-40 w-40 items-center justify-center rounded-full bg-montana-surface border-4 ${borderClass} shadow-[0_0_40px_rgba(0,0,0,0.4)]`}>
                    {totalScore <= 8 && <XCircle className={`h-20 w-20 ${colorClass}`} />}
                    {totalScore > 8 && totalScore <= 14 && <AlertTriangle className={`h-20 w-20 ${colorClass}`} />}
                    {totalScore > 14 && <CheckCircle className={`h-20 w-20 ${colorClass}`} />}
                  </div>
                  {totalScore > 14 && (
                    <div className="absolute -bottom-4 -right-4 bg-montana-bg rounded-full p-2 border border-green-500/30 shadow-xl">
                      <div className="bg-green-500/20 rounded-full p-2">
                        <Award className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="font-display text-7xl md:text-8xl font-bold text-white mb-2">
                  {totalScore}
                </h2>
                <p className="text-xl text-white/40 mb-4">out of 20</p>

                <div className={`inline-flex items-center px-6 py-2 rounded-full ${bgClass} bg-opacity-10 border ${borderClass} mb-6`}>
                  <Activity className={`h-4 w-4 mr-2 ${colorClass}`} />
                  <span className={`font-bold uppercase tracking-widest text-sm ${colorClass}`}>
                    {status}
                  </span>
                </div>

                <p className="text-xl text-montana-muted max-w-2xl mx-auto leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Stat breakdown — responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <div className="text-center p-4 sm:border-r border-white/10">
                  <div className="text-4xl font-bold text-white mb-1">
                    {Object.values(answers).filter((v) => v === 2).length}
                  </div>
                  <div className="text-xs text-montana-muted uppercase tracking-wider">Fully Compliant</div>
                </div>
                <div className="text-center p-4 sm:border-r border-white/10">
                  <div className="text-4xl font-bold text-white mb-1">
                    {Object.values(answers).filter((v) => v === 1).length}
                  </div>
                  <div className="text-xs text-montana-muted uppercase tracking-wider">Partial Controls</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-montana-pink mb-1">
                    {Object.values(answers).filter((v) => v === 0).length}
                  </div>
                  <div className="text-xs text-montana-muted uppercase tracking-wider">Critical Gaps</div>
                </div>
              </div>
            </SpotlightCard>

            {/* Recommended Services */}
            <div>
              <div className="text-center mb-10">
                <h3 className="font-display text-3xl font-bold text-white mb-4">Recommended Next Steps</h3>
                <p className="text-montana-muted max-w-2xl mx-auto">
                  This 10-question snapshot covers high-level risk areas. Book one of the engagements below to begin your compliance journey.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {POPIA_SERVICES.slice(0, 3).map((svc) => {
                  const isRecommended = svc.code === "SE-PA002";
                  const posUrl = `/pos?tab=consulting&services=${svc.code}`;
                  return (
                    <SpotlightCard customSize
                      key={svc.code}
                      className={`p-8 flex flex-col relative min-h-[260px] ${isRecommended ? "border-montana-pink/50 shadow-2xl shadow-montana-pink/10 lg:-translate-y-4" : "hover:border-white/30 transition-colors"}`}
                    >
                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-montana-pink text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
                          RECOMMENDED
                        </div>
                      )}
                      <h4 className="font-bold text-white text-lg mb-1">{svc.name}</h4>
                      <p className="text-montana-muted text-sm mb-4 flex-1">{svc.description}</p>
                      <div className="text-2xl font-bold text-white font-mono mb-1">
                        R{svc.price.toLocaleString()}
                        <span className="text-sm font-normal text-montana-muted ml-1">
                          {svc.type === "recurring" ? "/mo" : "once-off"}
                        </span>
                      </div>
                      <div className="text-xs text-montana-muted mb-6">{svc.duration}</div>
                      <ul className="space-y-2 mb-8 text-sm text-white/80 flex-1">
                        {svc.includes.map(item => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href={posUrl}>
                        <AnimatedButton
                          variant={isRecommended ? "primary" : "outline"}
                          className="w-full"
                        >
                          {svc.code === "SE-PA002" ? "Book Assessment" : "Select Service"}
                        </AnimatedButton>
                      </Link>
                    </SpotlightCard>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pos?tab=consulting">
                  <AnimatedButton variant="outline" className="gap-2 px-8 py-4">
                    View All POPIA Services <ArrowRight className="h-5 w-5" />
                  </AnimatedButton>
                </Link>
                <button
                  type="button"
                  onClick={() => { setCurrentStep(0); setAnswers({}); }}
                  className="px-8 py-4 text-sm font-medium text-montana-muted border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
