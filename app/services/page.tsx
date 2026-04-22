import type { Metadata } from "next";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Database, ShieldCheck, FileText, Server, Smartphone, Lock, Archive, ShieldAlert, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enterprise Data Protection & Backup Services | Montana Data Company",
  description: "Explore Montana Data Company's enterprise-grade cloud backup, ransomware protection, POPIA compliance consulting, and cyber resilience services across South Africa.",
  openGraph: {
    title: "Enterprise Data Protection & Backup Services | Montana Data Company",
    description: "Explore Montana Data Company's enterprise-grade cloud backup, ransomware protection, POPIA compliance consulting, and cyber resilience services across South Africa.",
  },
};

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-12 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Hero Section */}
<div className="py-10 md:py-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Enterprise Data Resilience Platform
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Secure your data. <span className="text-montana-gradient">Ensure your future.</span>
          </h1>
          <p className="text-lg md:text-xl text-montana-muted leading-relaxed mb-10">
            Data loss, ransomware, and compliance failures are not IT problems—they are critical business risks. We provide the architecture, software, and governance to guarantee operational continuity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pos">
              <AnimatedButton variant="primary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Build Your Solution
              </AnimatedButton>
            </Link>
            <Link href="/assessments">
              <AnimatedButton variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg">
                Take an Assessment
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* 1. Backup & Data Protection */}
        <div className="mb-14 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-pink/20">
              <Database className="h-6 w-6 text-montana-pink" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Backup & Data Protection</h2>
          </div>
          <p className="text-montana-muted text-lg mb-8 max-w-3xl">
            The cost of downtime far exceeds the cost of protection. We offer two distinct architectures to match your operational scale and complexity.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* IBM */}
            <SpotlightCard customSize className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Server className="h-6 w-6 text-white" />
                <h3 className="text-2xl font-bold text-white">Enterprise Backup</h3>
              </div>
              <p className="text-montana-muted mb-6 flex-1">
                Bespoke, consultative architecture designed for complex, multi-cloud, and hybrid environments. Tailored to meet stringent RPO and RTO requirements.
              </p>
              <div className="space-y-4 mb-8">
                <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                  <div className="text-xs font-bold text-montana-pink uppercase mb-1">Protects Against</div>
                  <div className="text-sm text-white/90">Catastrophic site failures, complex database corruption, and systemic outages.</div>
                </div>
                <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                  <div className="text-xs font-bold text-montana-pink uppercase mb-1">Business Outcome</div>
                  <div className="text-sm text-white/90">Absolute operational continuity for mission-critical enterprise workloads.</div>
                </div>
              </div>
              <Link href="/contact?type=enterprise-backup" className="mt-auto">
                <AnimatedButton variant="outline" className="w-full group">
                  Enquire About Enterprise Backup <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
            </SpotlightCard>

            {/* Druva */}
            <SpotlightCard customSize className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-white" />
                <h3 className="text-2xl font-bold text-white">SaaS & Endpoint Backup</h3>
              </div>
              <p className="text-montana-muted mb-6 flex-1">
                Structured, scalable, and productised cloud backup. Ideal for rapid deployment across Microsoft 365, Google Workspace, Salesforce, and distributed endpoints.
              </p>
              <div className="space-y-4 mb-8">
                <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                  <div className="text-xs font-bold text-montana-orange uppercase mb-1">Protects Against</div>
                  <div className="text-sm text-white/90">Accidental deletion, malicious insiders, and edge-device data loss.</div>
                </div>
                <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                  <div className="text-xs font-bold text-montana-orange uppercase mb-1">Business Outcome</div>
                  <div className="text-sm text-white/90">Instant recovery for distributed workforces with zero infrastructure overhead.</div>
                </div>
              </div>
              <Link href="/pos?service=druva-m365" className="mt-auto">
                <AnimatedButton variant="outline" className="w-full group">
                  Configure Druva Solution <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>
            </SpotlightCard>
          </div>
        </div>

        {/* 2. Cyber Resilience & Lifecycle */}
        <div className="mb-14 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-magenta/20">
              <ShieldAlert className="h-6 w-6 text-montana-magenta" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Cyber Resilience &amp; Lifecycle</h2>
          </div>
          <p className="text-montana-muted text-lg mb-8 max-w-3xl">
            Protecting your data means more than backing it up. Ransomware targets backups first — and unmanaged data retention creates its own compliance and cost exposure.
          </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ransomware — premium tier of SaaS & Endpoint Backup */}
          <SpotlightCard customSize className="flex flex-col h-full border-montana-magenta/30">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-montana-magenta" />
              <h3 className="text-2xl font-bold text-white">Ransomware Protection</h3>
            </div>
            <div className="inline-flex items-center gap-1.5 mb-5">
              <span className="text-xs font-bold text-montana-magenta uppercase tracking-wider bg-montana-magenta/10 border border-montana-magenta/30 px-2 py-0.5 rounded-full">Premium add-on</span>
              <span className="text-xs text-montana-muted">via SaaS &amp; Endpoint Backup</span>
            </div>
            <p className="text-montana-muted mb-6 flex-1">
              Available as the premium protection tier within our SaaS &amp; Endpoint Backup offering (powered by Druva). Activates immutable air-gapped storage, AI anomaly detection, and guaranteed clean-copy recovery — ensuring backups themselves cannot be encrypted or deleted by attackers.
            </p>
            <div className="space-y-4 mb-8">
              <div className="bg-montana-magenta/5 p-4 rounded border border-montana-magenta/20">
                <div className="text-xs font-bold text-montana-magenta uppercase mb-1">Protects Against</div>
                <div className="text-sm text-white/90">Targeted ransomware attacks, backup encryption, and double-extortion attempts.</div>
              </div>
              <div className="bg-montana-magenta/5 p-4 rounded border border-montana-magenta/20">
                <div className="text-xs font-bold text-montana-magenta uppercase mb-1">Business Outcome</div>
                <div className="text-sm text-white/90">Eliminates the need to pay ransoms — guaranteed clean, rapid data recovery every time.</div>
              </div>
            </div>
            <Link href="/pos?service=druva-m365" className="mt-auto">
              <AnimatedButton variant="outline" className="w-full group">
                Configure SaaS &amp; Endpoint Backup <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
          </SpotlightCard>

          {/* Archive */}
          <SpotlightCard customSize className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <Archive className="h-6 w-6 text-white" />
              <h3 className="text-2xl font-bold text-white">Archive & Lifecycle</h3>
            </div>
            <p className="text-montana-muted mb-6 flex-1">
              Intelligent data lifecycle management. Move cold data to cost-effective storage tiers while maintaining searchability and compliance readiness.
            </p>
            <div className="space-y-4 mb-8">
              <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                <div className="text-xs font-bold text-montana-muted uppercase mb-1">Protects Against</div>
                <div className="text-sm text-white/90">Runaway primary storage costs and non-compliance with data retention laws.</div>
              </div>
              <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                <div className="text-xs font-bold text-montana-muted uppercase mb-1">Business Outcome</div>
                <div className="text-sm text-white/90">Optimized storage spend and streamlined legal discovery processes.</div>
              </div>
            </div>
            <Link href="/contact?type=archiving" className="mt-auto">
              <AnimatedButton variant="outline" className="w-full group">
                Discuss Archive Strategy <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
          </SpotlightCard>
        </div>
        </div>

        {/* 3. Security & Governance */}
        <div className="mb-14 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-pink/20">
              <Lock className="h-6 w-6 text-montana-pink" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Security & Governance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* MaaS360 */}
            <SpotlightCard customSize className="flex flex-col">
              <Smartphone className="h-8 w-8 text-montana-orange mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">MaaS360 (MDM / UEM)</h3>
              <p className="text-montana-muted text-sm mb-6 flex-1">
                Unified endpoint management. Secure corporate data across all mobile devices, tablets, and BYOD environments. Distinct from endpoint backup, this focuses on access and threat defense.
              </p>
              <div className="space-y-3 mb-6">
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-orange uppercase block mb-1">Protects Against</span>
                  Device theft, data leaks, and unauthorized network access.
                </div>
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-orange uppercase block mb-1">Business Outcome</span>
                  Secure, compliant remote workforce without compromising productivity.
                </div>
              </div>
              <Link href="/pos?service=maas360" className="mt-auto">
                <AnimatedButton variant="outline" className="w-full text-xs py-2">
                  Secure Endpoints
                </AnimatedButton>
              </Link>
            </SpotlightCard>

            {/* Guardium */}
            <SpotlightCard customSize className="flex flex-col">
              <Activity className="h-8 w-8 text-montana-pink mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">IBM Guardium</h3>
              <p className="text-montana-muted text-sm mb-6 flex-1">
                Advanced data security, monitoring, and governance. Discover where sensitive data resides, encrypt it, and monitor access patterns in real-time.
              </p>
              <div className="space-y-3 mb-6">
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-pink uppercase block mb-1">Protects Against</span>
                  Insider threats, silent data exfiltration, and unauthorized database access.
                </div>
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-pink uppercase block mb-1">Business Outcome</span>
                  Complete visibility and control over your most sensitive data assets.
                </div>
              </div>
              <Link href="/contact" className="mt-auto">
                <AnimatedButton variant="outline" className="w-full text-xs py-2">
                  Request Guardium Demo
                </AnimatedButton>
              </Link>
            </SpotlightCard>

            {/* POPIA */}
            <SpotlightCard customSize className="flex flex-col">
              <FileText className="h-8 w-8 text-montana-magenta mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">POPIA Consulting</h3>
              <p className="text-montana-muted text-sm mb-6 flex-1">
                Transform compliance from a legal burden into a security baseline. We assess your exposure and align your data protection strategy with regulatory requirements.
              </p>
              <div className="space-y-3 mb-6">
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-magenta uppercase block mb-1">Protects Against</span>
                  Regulatory fines, reputational damage, and audit failures.
                </div>
                <div className="text-xs text-white/70 border-t border-white/10 pt-3">
                  <span className="font-bold text-montana-magenta uppercase block mb-1">Business Outcome</span>
                  Demonstrable compliance and enhanced customer trust.
                </div>
              </div>
              <Link href="/assessments/popia" className="mt-auto">
                <AnimatedButton variant="outline" className="w-full text-xs py-2">
                  Start Assessment
                </AnimatedButton>
              </Link>
            </SpotlightCard>
          </div>
        </div>

        {/* 4. Future-Proofing */}
        <div className="mb-14 md:mb-24">
          <SpotlightCard customSize className="p-8 md:p-12 border-montana-pink/30">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-montana-pink/10 text-montana-pink text-xs font-bold uppercase tracking-wider mb-4 border border-montana-pink/20">
                  Future Readiness
                </div>
                <h2 className="font-display text-3xl font-bold text-white mb-4">Quantum Security (PQC)</h2>
                <p className="text-montana-muted text-lg mb-6">
                  &quot;Harvest now, decrypt later&quot; is a reality. We help organizations transition to Post-Quantum Cryptography (PQC) and align with upcoming NIST standards, ensuring your encrypted data remains secure against next-generation quantum attacks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                    <div className="text-xs font-bold text-montana-pink uppercase mb-1">Protects Against</div>
                    <div className="text-sm text-white/90">Future decryption of currently intercepted sensitive data.</div>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                    <div className="text-xs font-bold text-montana-pink uppercase mb-1">Business Outcome</div>
                    <div className="text-sm text-white/90">Long-term cryptographic resilience and regulatory foresight.</div>
                  </div>
                </div>
                <Link href="/contact">
                  <AnimatedButton variant="primary">
                    Discuss Quantum Readiness
                  </AnimatedButton>
                </Link>
              </div>
              <div className="w-full md:w-1/3 aspect-square relative overflow-hidden border border-montana-pink/30 bg-montana-surface/50 flex flex-col items-center justify-center gap-3">
                <div className="absolute inset-0 bg-gradient-to-tr from-montana-pink/20 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-montana-magenta opacity-20 blur-[60px]" />
                <Lock className="relative h-28 w-28 text-montana-pink drop-shadow-[0_0_20px_#F24567]" strokeWidth={1.5} />
                <span className="relative text-lg font-bold tracking-[0.2em] text-montana-pink uppercase drop-shadow-[0_0_10px_#F24567]">PQC</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-16 bg-montana-surface/30 border border-white/10 p-8 md:p-12">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to architect your resilience strategy?</h2>
          <p className="text-montana-muted max-w-2xl mx-auto mb-8">
            Whether you know exactly what you need or want a guided assessment, our solutions makes it simple to build a secure, compliant data architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pos">
              <AnimatedButton variant="primary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Build Your Solution
              </AnimatedButton>
            </Link>
            <Link href="/assessments">
              <AnimatedButton variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg">
                Take an Assessment
              </AnimatedButton>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
