import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { POPIA_SERVICES } from "@/lib/popia-services";
import {
  XCircle, AlertTriangle, CheckCircle, Award,
  Activity, ArrowRight, Users, Scale, UserCheck,
  Shield, Eye, FileText, Lock, ShieldAlert, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "POPIA Assessment Results | Montana Data Company",
  description: "Your POPIA compliance risk score and personalised recommendations from Montana Data Company.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const GAP_CTA: Record<string, { label: string; href: string }> = {
  "Governance":           { label: "IO Registration & Training",    href: "/pos?tab=consulting&services=SE-PE001,SE-PT001-5" },
  "Lawful Processing":    { label: "Remedial Consulting",           href: "/pos?tab=consulting&services=SE-PR002" },
  "Consent":              { label: "Remedial Consulting",           href: "/pos?tab=consulting&services=SE-PR002" },
  "Processing Integrity": { label: "Compliance Assessment",         href: "/pos?tab=consulting&services=SE-PA002" },
  "Data Quality":         { label: "Remedial Consulting",           href: "/pos?tab=consulting&services=SE-PR002" },
  "Transparency":         { label: "Remedial Consulting",           href: "/pos?tab=consulting&services=SE-PR002" },
  "Security":             { label: "Ransomware & Data Protection",  href: "/pos?tab=enterprise" },
  "Data Subject Rights":  { label: "Remedial Consulting",           href: "/pos?tab=consulting&services=SE-PR002" },
};

const GAP_META: Record<string, { Icon: LucideIcon; description: string }> = {
  "Governance": {
    Icon: Users,
    description: "Information Officer appointment, compliance frameworks, and staff training on POPIA obligations.",
  },
  "Lawful Processing": {
    Icon: Scale,
    description: "Purpose limitation controls and documented retention schedules ensuring data is kept only as long as necessary.",
  },
  "Consent": {
    Icon: UserCheck,
    description: "Obtaining explicit, informed consent before processing — with clear communication and withdrawal mechanisms.",
  },
  "Processing Integrity": {
    Icon: Shield,
    description: "Controls preventing personal data from being used beyond its originally stated purpose.",
  },
  "Data Quality": {
    Icon: Eye,
    description: "Verification and update processes ensuring personal information remains accurate and current.",
  },
  "Transparency": {
    Icon: FileText,
    description: "Clear, accessible privacy notices and full disclosure of all third-party data sharing arrangements.",
  },
  "Security": {
    Icon: Lock,
    description: "Formal risk assessments and appropriate technical safeguards protecting personal data from breach.",
  },
  "Data Subject Rights": {
    Icon: UserCheck,
    description: "Formal processes enabling access, correction, deletion, and objection requests from data subjects.",
  },
};

/** Map gap categories to the most relevant POPIA service codes, in priority order. */
function selectPOPIAServices(gaps: string[]): typeof POPIA_SERVICES {
  const gapSet = new Set(gaps);
  const hasGovernanceGap = gapSet.has("Governance");
  const hasSecurityGap = gapSet.has("Security");
  const hasOtherGaps = [...gapSet].some(g => g !== "Governance" && g !== "Security");

  const selected: string[] = [];

  // Comprehensive assessment is always the primary entry point
  selected.push("SE-PA002");

  // Governance gaps → IO Registration + Training are highest-leverage
  if (hasGovernanceGap) {
    selected.push("SE-PE001");
    if (selected.length < 3) selected.push("SE-PT001-5");
  }

  // Non-governance, non-security gaps → Remedial Consulting
  if (hasOtherGaps && !selected.includes("SE-PR002")) {
    selected.push("SE-PR002");
  }

  // Fill remaining slot with Training if not yet included
  if (selected.length < 3 && !selected.includes("SE-PT001-5")) {
    selected.push("SE-PT001-5");
  }

  // If low risk with few gaps, add the retainer as ongoing support
  if (selected.length < 3 && !hasSecurityGap) {
    selected.push("SE-PZ001");
  }

  return selected
    .slice(0, 3)
    .map(code => POPIA_SERVICES.find(s => s.code === code))
    .filter(Boolean) as typeof POPIA_SERVICES;
}

export default async function PopiaResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const score = Number(params.score);

  if (!params.score || isNaN(score)) {
    redirect("/assessments/popia");
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  const risk = String(params.risk ?? "Low Risk");
  const compliant = Number(params.compliant ?? 0);
  const partial = Number(params.partial ?? 0);
  const critical = Number(params.critical ?? 0);

  const allGaps = String(params.gaps ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const displayedGaps = allGaps.slice(0, 3);
  const hiddenGapCount = allGaps.length - displayedGaps.length;

  const isHigh = risk === "High Risk";
  const isModerate = risk === "Moderate Risk";
  const isLow = !isHigh && !isModerate;

  const colorClass = isHigh ? "text-red-500" : isModerate ? "text-amber-500" : "text-green-500";
  const bgClass = isHigh ? "bg-red-500" : isModerate ? "bg-amber-500" : "bg-green-500";
  const borderClass = isHigh ? "border-red-500" : isModerate ? "border-amber-500" : "border-green-500";
  const message = isHigh
    ? "Immediate intervention advised — critical POPIA compliance gaps detected."
    : isModerate
    ? "Remediation required — several compliance gaps need attention."
    : "Well-positioned. An optimisation audit is recommended to maintain compliance.";

  const recommendedServices = selectPOPIAServices(allGaps);

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Page header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            POPIA Compliance Results
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Your POPIA Risk Assessment
          </h1>
          <p className="text-montana-muted max-w-2xl mx-auto">
            Based on your 10-question snapshot. A full 88-control assessment provides a definitive compliance picture.
          </p>
        </div>

        {/* Save results banner — shown only to unauthenticated users */}
        {!isAuthenticated && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-montana-pink/20 bg-montana-pink/5 backdrop-blur-sm px-5 py-4">
            <p className="text-sm text-montana-muted leading-relaxed">
              <span className="text-white font-semibold">Save your results permanently</span> — create a free account to track your compliance progress and access your report any time.
            </p>
            <Link href="/sign-up" className="shrink-0">
              <AnimatedButton variant="outline" className="text-xs px-5 py-2 whitespace-nowrap">
                Create free account →
              </AnimatedButton>
            </Link>
          </div>
        )}

        {/* Hero score card */}
        <SpotlightCard customSize className={`p-8 md:p-12 mb-12 border-t-4 ${borderClass}`}>
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div
                className={`inline-flex h-40 w-40 items-center justify-center rounded-full bg-montana-surface border-4 ${borderClass} shadow-[0_0_40px_rgba(0,0,0,0.4)]`}
              >
                {isHigh && <XCircle className={`h-20 w-20 ${colorClass}`} />}
                {isModerate && <AlertTriangle className={`h-20 w-20 ${colorClass}`} />}
                {isLow && <CheckCircle className={`h-20 w-20 ${colorClass}`} />}
              </div>
              {isLow && (
                <div className="absolute -bottom-4 -right-4 bg-montana-bg rounded-full p-2 border border-green-500/30 shadow-xl">
                  <div className="bg-green-500/20 rounded-full p-2">
                    <Award className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-center gap-3 mb-4">
              <span className="font-display text-8xl md:text-9xl font-bold text-white leading-none">{score}</span>
              <span className="text-2xl text-white/40 font-light">/ 20</span>
            </div>

            <div className={`inline-flex items-center px-6 py-2 rounded-full ${bgClass} bg-opacity-10 border ${borderClass} mb-5`}>
              <Activity className={`h-4 w-4 mr-2 ${colorClass}`} />
              <span className={`font-bold uppercase tracking-widest text-sm ${colorClass}`}>{risk}</span>
            </div>

            <p className="text-lg text-montana-muted max-w-2xl mx-auto leading-relaxed">{message}</p>
          </div>

          <div className="rounded-lg bg-white/[0.03] border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              <div className="text-center px-4 py-5">
                <div className="text-4xl font-bold text-white mb-1">{compliant}</div>
                <div className="text-xs text-montana-muted uppercase tracking-wider">Fully Compliant</div>
              </div>
              <div className="text-center px-4 py-5">
                <div className="text-4xl font-bold text-white mb-1">{partial}</div>
                <div className="text-xs text-montana-muted uppercase tracking-wider">Partial Controls</div>
              </div>
              <div className="text-center px-4 py-5">
                <div className="text-4xl font-bold text-montana-pink mb-1">{critical}</div>
                <div className="text-xs text-montana-muted uppercase tracking-wider">Critical Gaps</div>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Key gap areas */}
        {displayedGaps.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Key Gap Areas</h2>
              <p className="text-montana-muted max-w-2xl mx-auto">
                Your answers identified these POPIA conditions as requiring the most attention.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedGaps.map((cat) => {
                const meta = GAP_META[cat];
                if (!meta) return null;
                const { Icon } = meta;
                const cta = GAP_CTA[cat];
                return (
                  <GlassCard key={cat} className="flex flex-col gap-4 min-h-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-montana-pink/10 border border-montana-pink/20 shrink-0">
                        <Icon className="h-5 w-5 text-montana-pink" />
                      </div>
                      <h3 className="font-bold text-white">{cat}</h3>
                    </div>
                    <p className="text-sm text-montana-muted leading-relaxed">{meta.description}</p>
                    {cta && (
                      <Link
                        href={cta.href}
                        className="mt-auto flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-medium text-montana-muted hover:text-white hover-interactive group"
                      >
                        <span>Address this gap → View {cta.label}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </GlassCard>
                );
              })}
            </div>
            {hiddenGapCount > 0 && (
              <p className="text-center text-sm text-montana-muted mt-6">
                +{hiddenGapCount} additional gap area{hiddenGapCount > 1 ? "s" : ""} identified — a full consultation will cover all findings.
              </p>
            )}
          </div>
        )}

        {/* What Montana recommends — dynamically selected by gap categories */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              What Montana Recommends
            </h2>
            <p className="text-montana-muted max-w-2xl mx-auto">
              Engagements selected based on the compliance gaps identified in your assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {recommendedServices.map((svc, idx) => {
              const isRecommended = idx === 0;
              const posUrl = `/pos?tab=consulting&services=${svc.code}`;
              return (
                <div key={svc.code} className="flex flex-col">
                  {isRecommended && (
                    <div className="flex justify-center -mb-3 relative z-10">
                      <span className="bg-montana-pink text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider shadow-lg shadow-montana-pink/30">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                  <SpotlightCard
                    customSize
                    className={`p-8 flex flex-col flex-1 ${
                      isRecommended
                        ? "border-montana-pink/50 shadow-2xl shadow-montana-pink/10 lg:-translate-y-2"
                        : "hover:border-white/30 transition-colors"
                    }`}
                  >
                    <h3 className="font-bold text-white text-lg mb-1">{svc.name}</h3>
                    <p className="text-montana-muted text-sm mb-4 flex-1">{svc.description}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-montana-muted border border-white/10 px-3 py-1.5 mb-5 self-start">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {svc.duration}
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-white/80">
                      {svc.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href={posUrl} className="mt-auto">
                      <AnimatedButton variant={isRecommended ? "primary" : "outline"} className="w-full">
                        {svc.code === "SE-PA002" ? "Book Assessment" : "Select Service"}
                      </AnimatedButton>
                    </Link>
                  </SpotlightCard>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cross-assessment prompt */}
        <div className="mb-12 border border-red-500/30 border-l-2 border-l-red-500/60 bg-red-500/[0.08] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-1">Have you assessed your Backup &amp; Security posture?</p>
              <p className="text-xs text-montana-muted leading-relaxed">
                POPIA requires appropriate technical safeguards — your Security Assessment will reveal gaps in your data protection architecture.
              </p>
            </div>
          </div>
          <Link href="/assessments/security" className="shrink-0">
            <AnimatedButton variant="outline" className="text-xs px-5 py-2 whitespace-nowrap gap-2">
              Take Security Assessment <ArrowRight className="h-3.5 w-3.5" />
            </AnimatedButton>
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact?service=popia&ref=popia-results">
            <AnimatedButton variant="primary" className="gap-2 px-8 py-4">
              Book a Compliance Consultation <ArrowRight className="h-5 w-5" />
            </AnimatedButton>
          </Link>
          <Link href="/pos?tab=consulting">
            <AnimatedButton variant="outline" className="gap-2 px-8 py-4">
              View All POPIA Services <ArrowRight className="h-5 w-5" />
            </AnimatedButton>
          </Link>
          <Link
            href="/assessments/popia"
            className="px-8 py-4 text-sm font-medium text-montana-muted border border-white/10 hover:border-white/30 hover:text-white hover-interactive flex items-center justify-center"
          >
            Retake Assessment
          </Link>
        </div>

      </div>
    </div>
  );
}
