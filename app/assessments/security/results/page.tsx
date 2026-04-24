import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { SECURITY_SERVICES } from "@/lib/security-services";
import {
  XCircle, AlertTriangle, CheckCircle, Award,
  Activity, ArrowRight, Database, ShieldAlert,
  Monitor, Server, Clock, Shield, Zap, Eye, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Assessment Results | Montana Data Company",
  description: "Your backup and cyber-resilience risk score with personalised recommendations from Montana Data Company.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const GAP_META: Record<string, { Icon: LucideIcon; description: string }> = {
  "Data Protection": {
    Icon: Database,
    description: "Automated, centralised backup of all endpoint data including laptops, desktops, and remote devices.",
  },
  "SaaS Resilience": {
    Icon: Server,
    description: "Independent third-party backup of M365, Google Workspace, and other SaaS platforms beyond native retention limits.",
  },
  "Ransomware": {
    Icon: ShieldAlert,
    description: "Immutable or air-gapped storage ensuring backups cannot be encrypted or deleted by ransomware attacks.",
  },
  "Recovery": {
    Icon: Clock,
    description: "Regular full-system recovery testing to verify backups can restore operations within an acceptable timeframe.",
  },
  "Endpoint Security": {
    Icon: Monitor,
    description: "Centralised visibility and control over all devices including remote, mobile, and BYOD endpoints.",
  },
  "Device Compliance": {
    Icon: Shield,
    description: "Automated enforcement of security policies — encryption, patching, screen lock — across all user devices.",
  },
  "Threat Detection": {
    Icon: Zap,
    description: "Real-time monitoring and response capabilities to detect anomalous behaviour before damage occurs.",
  },
  "Data Visibility": {
    Icon: Eye,
    description: "Comprehensive mapping of where sensitive data lives and who can access it across all platforms.",
  },
  "Business Continuity": {
    Icon: Activity,
    description: "Defined and tested recovery time objectives ensuring rapid restoration of operations after an incident.",
  },
  "Integration": {
    Icon: Lock,
    description: "Unified security and backup platform with automated alerts, policies, and coordinated response actions.",
  },
};

const SERVICE_ICON: Record<string, { Icon: LucideIcon; color: string }> = {
  "druva-saas-endpoint": { Icon: Database, color: "text-montana-pink" },
  "druva-ransomware":    { Icon: ShieldAlert, color: "text-red-400" },
  "maas360-mdm":         { Icon: Monitor, color: "text-amber-400" },
  "ibm-enterprise-backup": { Icon: Server, color: "text-montana-pink" },
};

export default async function SecurityResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const score = Number(params.score);

  if (!params.score || isNaN(score)) {
    redirect("/assessments/security");
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
  const isModerate = risk === "Moderate Risk";
  const isLow = !isHigh && !isModerate;

  const colorClass = isHigh ? "text-red-500" : isModerate ? "text-amber-500" : "text-green-500";
  const bgClass = isHigh ? "bg-red-500" : isModerate ? "bg-amber-500" : "bg-green-500";
  const borderClass = isHigh ? "border-red-500" : isModerate ? "border-amber-500" : "border-green-500";
  const message = isHigh
    ? "Immediate attention required — critical gaps in your security and backup posture."
    : isModerate
    ? "Gaps in your resilience architecture. Remediation recommended."
    : "Well-positioned. Optimisation opportunities exist to strengthen your resilience further.";

  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Page header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="flex h-2 w-2 bg-red-500 mr-3 shadow-[0_0_8px_#ef4444]" />
            Backup &amp; Security Results
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Your Cyber-Resilience Assessment
          </h1>
          <p className="text-montana-muted max-w-2xl mx-auto">
            Based on your 10-question snapshot across data protection, endpoint security, and business continuity.
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
              <div className="text-xs text-montana-muted uppercase tracking-wider">Fully Implemented</div>
            </div>
            <div className="text-center p-4 sm:border-r border-white/10">
              <div className="text-4xl font-bold text-white mb-1">{partial}</div>
              <div className="text-xs text-montana-muted uppercase tracking-wider">Partial / Gaps</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-red-400 mb-1">{critical}</div>
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
                Your answers identified these resilience domains as requiring the most urgent attention.
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shrink-0">
                        <Icon className="h-5 w-5 text-red-400" />
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
              Solutions that directly address the vulnerabilities identified in your assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SECURITY_SERVICES.map((svc) => {
              const iconDef = SERVICE_ICON[svc.code];
              const Icon = iconDef?.Icon ?? Database;
              const iconColor = iconDef?.color ?? "text-montana-pink";
              return (
                <SpotlightCard
                  customSize
                  key={svc.code}
                  className={`p-6 flex flex-col relative min-h-[200px] ${
                    svc.recommended
                      ? "border-montana-pink/50 shadow-2xl shadow-montana-pink/10"
                      : "hover:border-white/30 transition-colors"
                  }`}
                >
                  {svc.recommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-montana-pink text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
                      RECOMMENDED
                    </div>
                  )}
                  <Icon className={`h-8 w-8 ${iconColor} mb-4`} />
                  <h3 className="font-bold text-white text-lg mb-2">{svc.name}</h3>
                  <p className="text-sm text-montana-muted flex-1 mb-4">{svc.description}</p>
                  <ul className="space-y-1.5 mb-6 text-sm text-white/80">
                    {svc.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={svc.posUrl}>
                    <AnimatedButton variant={svc.recommended ? "primary" : "outline"} className="w-full text-xs py-2">
                      {svc.recommended ? "Configure Solution" : "View Solution"}
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
          <Link href="/pos?tab=cloud">
            <AnimatedButton variant="outline" className="gap-2 px-8 py-4">
              Build Your Custom Solution <ArrowRight className="h-5 w-5" />
            </AnimatedButton>
          </Link>
          <Link
            href="/assessments/security"
            className="px-8 py-4 text-sm font-medium text-montana-muted border border-white/10 hover:border-white/30 hover:text-white transition-colors flex items-center justify-center"
          >
            Retake Assessment
          </Link>
        </div>

      </div>
    </div>
  );
}
