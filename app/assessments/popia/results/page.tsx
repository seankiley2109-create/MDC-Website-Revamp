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
  Shield, Eye, FileText, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "POPIA Assessment Results | Montana Data Company",
  description: "Your POPIA compliance risk score and personalised recommendations from Montana Data Company.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

  const risk = String(params.risk ?? "Low Risk");
  const compliant = Number(params.compliant ?? 0);
  const partial = Number(params.partial ?? 0);
  const critical = Number(params.critical ?? 0);
  const gaps = String(params.gaps ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const isHigh = risk === "High Risk";
  const isMedium = risk === "Medium Risk";
  const isLow = !isHigh && !isMedium;

  const colorClass = isHigh ? "text-red-500" : isMedium ? "text-amber-500" : "text-green-500";
  const bgClass = isHigh ? "bg-red-500" : isMedium ? "bg-amber-500" : "bg-green-500";
  const borderClass = isHigh ? "border-red-500" : isMedium ? "border-amber-500" : "border-green-500";
  const message = isHigh
    ? "Immediate intervention advised — critical POPIA compliance gaps detected."
    : isMedium
    ? "Remediation required — several compliance gaps need attention."
    : "Well-positioned. An optimisation audit is recommended to maintain compliance.";

  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
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

        {/* Hero score card */}
        <SpotlightCard customSize className={`p-8 md:p-12 mb-12 border-t-4 ${borderClass}`}>
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div
                className={`inline-flex h-40 w-40 items-center justify-center rounded-full bg-montana-surface border-4 ${borderClass} shadow-[0_0_40px_rgba(0,0,0,0.4)]`}
              >
                {isHigh && <XCircle className={`h-20 w-20 ${colorClass}`} />}
                {isMedium && <AlertTriangle className={`h-20 w-20 ${colorClass}`} />}
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

            <h2 className="font-display text-7xl md:text-8xl font-bold text-white mb-2">{score}</h2>
            <p className="text-xl text-white/40 mb-4">out of 20</p>

            <div className={`inline-flex items-center px-6 py-2 rounded-full ${bgClass} bg-opacity-10 border ${borderClass} mb-6`}>
              <Activity className={`h-4 w-4 mr-2 ${colorClass}`} />
              <span className={`font-bold uppercase tracking-widest text-sm ${colorClass}`}>{risk}</span>
            </div>

            <p className="text-xl text-montana-muted max-w-2xl mx-auto leading-relaxed">{message}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <div className="text-center p-4 sm:border-r border-white/10">
              <div className="text-4xl font-bold text-white mb-1">{compliant}</div>
              <div className="text-xs text-montana-muted uppercase tracking-wider">Fully Compliant</div>
            </div>
            <div className="text-center p-4 sm:border-r border-white/10">
              <div className="text-4xl font-bold text-white mb-1">{partial}</div>
              <div className="text-xs text-montana-muted uppercase tracking-wider">Partial Controls</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-montana-pink mb-1">{critical}</div>
              <div className="text-xs text-montana-muted uppercase tracking-wider">Critical Gaps</div>
            </div>
          </div>
        </SpotlightCard>

        {/* Key gap areas */}
        {gaps.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Key Gap Areas</h2>
              <p className="text-montana-muted max-w-2xl mx-auto">
                Your answers identified these POPIA conditions as requiring the most attention.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gaps.map((cat) => {
                const meta = GAP_META[cat];
                if (!meta) return null;
                const { Icon } = meta;
                return (
                  <GlassCard key={cat} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-montana-pink/10 border border-montana-pink/20 shrink-0">
                        <Icon className="h-5 w-5 text-montana-pink" />
                      </div>
                      <h3 className="font-bold text-white">{cat}</h3>
                    </div>
                    <p className="text-sm text-montana-muted leading-relaxed">{meta.description}</p>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* What Montana recommends */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              What Montana Recommends
            </h2>
            <p className="text-montana-muted max-w-2xl mx-auto">
              These engagements will have the most impact on your compliance posture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPIA_SERVICES.slice(0, 3).map((svc) => {
              const isRecommended = svc.code === "SE-PA002";
              const posUrl = `/pos?tab=consulting&services=${svc.code}`;
              return (
                <SpotlightCard
                  customSize
                  key={svc.code}
                  className={`p-8 flex flex-col relative min-h-[260px] ${
                    isRecommended
                      ? "border-montana-pink/50 shadow-2xl shadow-montana-pink/10 lg:-translate-y-4"
                      : "hover:border-white/30 transition-colors"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-montana-pink text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
                      RECOMMENDED
                    </div>
                  )}
                  <h3 className="font-bold text-white text-lg mb-1">{svc.name}</h3>
                  <p className="text-montana-muted text-sm mb-4 flex-1">{svc.description}</p>
                  <div className="text-2xl font-bold text-white font-mono mb-1">
                    R{svc.price.toLocaleString()}
                    <span className="text-sm font-normal text-montana-muted ml-1">
                      {svc.type === "recurring" ? "/mo" : "once-off"}
                    </span>
                  </div>
                  <div className="text-xs text-montana-muted mb-6">{svc.duration}</div>
                  <ul className="space-y-2 mb-8 text-sm text-white/80 flex-1">
                    {svc.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={posUrl}>
                    <AnimatedButton variant={isRecommended ? "primary" : "outline"} className="w-full">
                      {svc.code === "SE-PA002" ? "Book Assessment" : "Select Service"}
                    </AnimatedButton>
                  </Link>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
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
            className="px-8 py-4 text-sm font-medium text-montana-muted border border-white/10 hover:border-white/30 hover:text-white transition-colors flex items-center justify-center"
          >
            Retake Assessment
          </Link>
        </div>

      </div>
    </div>
  );
}
