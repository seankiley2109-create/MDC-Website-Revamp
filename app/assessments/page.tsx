import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Shield, ShieldAlert, FileText, Lock, ArrowRight, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";

export default function AssessmentsPage() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero */}
        <div className="py-16 md:py-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Free Risk Assessments
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            How exposed is your <span className="text-montana-gradient">business?</span>
          </h1>
          <p className="text-lg md:text-xl text-montana-muted leading-relaxed max-w-2xl mx-auto">
            Most organisations don&apos;t know their true risk level until it&apos;s too late. Take one of our free assessments to uncover critical gaps in under 5 minutes.
          </p>
        </div>

        {/* Mini-assessment disclaimer */}
        <div className="mb-10 border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-montana-muted leading-relaxed">
            <span className="font-semibold text-white">Please note:</span> These are mini pre-assessments designed to give you a brief snapshot of your current risk exposure and compliance readiness. They are not full professional assessments and should not be relied upon as a substitute for a comprehensive audit or legal advice.
          </p>
        </div>

        {/* Stat Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="border border-red-500/20 bg-red-500/5 p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">60%</div>
            <p className="text-sm text-montana-muted">of SMEs close within 6 months of a major cyber attack</p>
          </div>
          <div className="border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">R10M</div>
            <p className="text-sm text-montana-muted">maximum fine for POPIA non-compliance per offence</p>
          </div>
          <div className="border border-red-500/20 bg-red-500/5 p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">93 Days</div>
            <p className="text-sm text-montana-muted">Microsoft&apos;s maximum retention for deleted data — then it&apos;s gone forever</p>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          {/* Security & Resilience Assessment */}
          <SpotlightCard customSize className="p-0 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-red-500/10 to-montana-magenta/10 border-b border-white/10 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
                  <ShieldAlert className="h-7 w-7 text-red-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Backup & Security</h2>
                  <p className="text-sm text-montana-muted">Assessment</p>
                </div>
              </div>
              <p className="text-montana-muted leading-relaxed">
                Are you confident your data would survive a ransomware attack? Most organisations assume they&apos;re protected — until they discover Microsoft and Google <strong className="text-white">don&apos;t back up your data for you</strong>.
              </p>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  Endpoint backup coverage & SaaS data resilience
                </li>
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  Ransomware preparedness & recovery confidence
                </li>
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  Threat detection, device compliance & business continuity
                </li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs text-montana-muted">10 questions &middot; ~3 minutes</span>
                <Link href="/assessments/security">
                  <AnimatedButton variant="primary" className="gap-2">
                    Start Pre-Assessment <ArrowRight className="h-4 w-4" />
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </SpotlightCard>

          {/* POPIA Compliance Assessment */}
          <SpotlightCard customSize className="p-0 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-montana-magenta/10 to-amber-500/10 border-b border-white/10 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-montana-magenta/10 border border-montana-pink/30">
                  <FileText className="h-7 w-7 text-montana-pink" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">POPIA Compliance</h2>
                  <p className="text-sm text-montana-muted">Assessment</p>
                </div>
              </div>
              <p className="text-montana-muted leading-relaxed">
                Are you aware that POPIA non-compliance carries fines of up to <strong className="text-white">R10 million</strong> and up to <strong className="text-white">10 years imprisonment</strong>? This 10-question snapshot reveals your exposure.
              </p>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <Shield className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                  Governance framework & Information Officer compliance
                </li>
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <Lock className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                  Data processing, retention & security controls
                </li>
                <li className="flex items-start gap-3 text-sm text-montana-muted">
                  <Shield className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                  Data subject rights & third-party disclosure
                </li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xs text-montana-muted">10 questions &middot; ~3 minutes</span>
                <Link href="/assessments/popia">
                  <AnimatedButton variant="primary" className="gap-2">
                    Start Pre-Assessment <ArrowRight className="h-4 w-4" />
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Trust Bar */}
        <div className="text-center border border-white/5 bg-white/[0.02] p-8">
          <p className="text-sm text-montana-muted mb-1">
            All assessment data is encrypted and handled in accordance with POPIA.
          </p>
          <p className="text-sm text-montana-muted mb-1">
            Your results are confidential, we will never share your information with third parties. 
          </p>
          <p className="text-sm text-montana-muted">
            For information on how Personally Identifiable Information (PII) is managed, refer to our privacy statement or PAIA manuals. 
          </p>
        </div>

      </div>
    </div>
  );
}
