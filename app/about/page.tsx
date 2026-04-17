import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Shield, Target, Globe, Users, Server, Database, Smartphone, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Enterprise Data Resilience Partner | Montana Data Company",
  description: "Montana Data Company is a trusted enterprise data resilience partner delivering cloud backup, cyber security, and POPIA compliance solutions across South Africa.",
  openGraph: {
    title: "About Us — Enterprise Data Resilience Partner | Montana Data Company",
    description: "Montana Data Company is a trusted enterprise data resilience partner delivering cloud backup, cyber security, and POPIA compliance solutions across South Africa.",
  },
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-12 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero Section */}
        <div className="py-10 md:py-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Our Story
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Engineered for <span className="text-montana-gradient">Resilience.</span>
          </h1>
          <p className="text-lg md:text-xl text-montana-muted leading-relaxed max-w-3xl mx-auto">
            Montana Data Company is a South African enterprise data resilience firm built on one conviction: your data is the most critical asset your organisation owns — and protecting it requires more than software. It requires strategy, governance, and an unwavering commitment to operational continuity.
          </p>
        </div>

        {/* Credential Anchors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 md:mb-24">
          <div className="border border-montana-pink/20 bg-montana-pink/5 p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">IBM</div>
            <div className="text-xs text-montana-pink font-bold uppercase tracking-wider mb-2">Authorised Partner</div>
            <p className="text-xs text-montana-muted">Enterprise backup &amp; data security</p>
          </div>
          <div className="border border-montana-orange/20 bg-montana-orange/5 p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">Druva</div>
            <div className="text-xs text-montana-orange font-bold uppercase tracking-wider mb-2">Authorised Partner</div>
            <p className="text-xs text-montana-muted">SaaS &amp; endpoint cloud backup</p>
          </div>
          <div className="border border-montana-magenta/20 bg-montana-magenta/5 p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">88</div>
            <div className="text-xs text-montana-magenta font-bold uppercase tracking-wider mb-2">POPIA Controls</div>
            <p className="text-xs text-montana-muted">Comprehensive compliance framework</p>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">3&times;</div>
            <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Geo-Redundant</div>
            <p className="text-xs text-montana-muted">All data stored in South Africa</p>
          </div>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 md:mb-24 border-t border-white/10 pt-16">
          <div>
            <div className="text-xs font-bold tracking-widest text-montana-pink uppercase mb-4">Who We Are</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              South Africa&apos;s data resilience specialist.
            </h2>
            <div className="space-y-4 text-montana-muted leading-relaxed">
              <p>
                We were built on a simple observation: most South African businesses don&apos;t have a data problem — they have a data strategy problem. The technology exists. The tooling exists. What&apos;s missing is the architecture to connect it all and the expertise to govern it correctly under frameworks like POPIA.
              </p>
              <p>
                Montana Data Company operates at the intersection of cloud backup, endpoint management, and compliance consulting — delivering complete resilience frameworks that standalone products cannot provide alone. Every engagement is structured around your recovery time objectives, your regulatory obligations, and your specific risk tolerance.
              </p>
              <p>
                We partner exclusively with IBM, Druva, and MaaS360 because they represent the best available capability in their respective domains. Our clients don&apos;t pay for vendor diversity — they pay for the right solution, implemented correctly, with the governance to match.
              </p>
            </div>
          </div>
          <div>
            <GlassCard glow className="p-8 border-montana-pink/20">
              <div className="text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">What We Deliver</div>
              <ul className="space-y-4">
                {[
                  { title: "Cloud Backup & Recovery", desc: "Druva SaaS backup for M365, Google Workspace, Salesforce, and distributed endpoints." },
                  { title: "Enterprise Data Protection", desc: "IBM-architected bespoke backup for complex, high-volume multi-cloud environments." },
                  { title: "Endpoint & Device Management", desc: "MaaS360 UEM for unified control across all corporate and BYOD devices." },
                  { title: "POPIA Compliance Consulting", desc: "From gap analysis to Information Officer registration and staff training." },
                  { title: "Cyber Resilience Architecture", desc: "Ransomware protection, immutable storage, and quantum security alignment." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-montana-pink shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-xs text-montana-muted mt-0.5">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-12 md:py-16 border-t border-white/10">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-4">The Montana Difference</h2>
            <p className="text-montana-muted max-w-2xl mx-auto">
              We don&apos;t just sell products. We build resilient frameworks that ensure your business can withstand any disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="flex flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-pink/20">
                <Target className="h-6 w-6 text-montana-pink" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Outcome-Led Strategy</h3>
              <p className="text-montana-muted leading-relaxed">
                We start with your business objectives — compliance requirements, recovery time objectives (RTO), and risk tolerance — and engineer the technology around those requirements, not the other way around.
              </p>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-orange/10 border border-montana-orange/20">
                <Users className="h-6 w-6 text-montana-orange" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Partner-Enabled Delivery</h3>
              <p className="text-montana-muted leading-relaxed">
                Whether you are a direct enterprise client or a channel partner seeking white-label solutions, our multi-tenant architecture scales with your delivery model — from single-site SME to multi-entity group.
              </p>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-magenta/20">
                <Globe className="h-6 w-6 text-montana-magenta" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Data Sovereignty</h3>
              <p className="text-montana-muted leading-relaxed">
                With deep roots in South Africa, we understand the nuances of POPIA and local data governance. Every backup, every replica, and every recovery point is stored on South African soil — no exceptions.
              </p>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-pink/10 border border-montana-pink/20">
                <Shield className="h-6 w-6 text-montana-pink" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Enterprise-Grade Security</h3>
              <p className="text-montana-muted leading-relaxed">
                We partner with IBM, Druva, and Red Hat to deliver military-grade encryption, immutable backups, and zero-trust architectures — the same security posture used by global financial institutions.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Technology Partners */}
        <div className="py-12 md:py-16 border-t border-white/10">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold tracking-widest text-montana-muted uppercase">Technology Partners</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {([
              { Icon: Server,     name: "IBM",        desc: "Enterprise Backup & Guardium",  color: "text-montana-pink",    bg: "bg-montana-pink/10",    border: "border-montana-pink/20"    },
              { Icon: Database,   name: "Druva",      desc: "SaaS & Endpoint Backup",        color: "text-montana-orange",  bg: "bg-montana-orange/10",  border: "border-montana-orange/20"  },
              { Icon: Smartphone, name: "IBM MaaS360",desc: "Unified Endpoint Management",   color: "text-montana-magenta", bg: "bg-montana-magenta/10", border: "border-montana-magenta/20" },
              { Icon: Zap,        name: "Red Hat",    desc: "Infrastructure & Integration",  color: "text-white/70",        bg: "bg-white/5",            border: "border-white/10"           },
            ] as const).map(({ Icon, name, desc, color, bg, border }) => (
              <div key={name} className={`border ${border} bg-montana-surface/30 p-6 text-center`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-sm ${bg} border ${border} mb-4 mx-auto`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="font-bold text-white text-sm mb-1">{name}</div>
                <div className="text-xs text-montana-muted">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 md:py-24 text-center">
          <GlassCard glow className="max-w-3xl mx-auto p-8 md:p-12">
            <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to build your resilience strategy?</h2>
            <p className="text-montana-muted mb-8">
              Speak with our advisory team to discuss your infrastructure, compliance, and recovery requirements, or start building your solution now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pos">
                <AnimatedButton variant="primary" className="w-full sm:w-auto px-8 py-4">
                  Build Your Solution
                </AnimatedButton>
              </Link>
              <Link href="/contact">
                <AnimatedButton variant="outline" className="w-full sm:w-auto px-8 py-4">
                  Get in Touch
                </AnimatedButton>
              </Link>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
