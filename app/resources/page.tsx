import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FileText, Shield, Lock, Database, ArrowRight, Download, BookOpen, CheckSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources — Guides, Checklists & Whitepapers | Montana Data Company",
  description: "Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.",
  openGraph: {
    title: "Resources — Guides, Checklists & Whitepapers | Montana Data Company",
    description: "Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.",
  },
};

const resources = [
  {
    category: "Compliance",
    icon: FileText,
    color: "text-montana-magenta",
    bg: "bg-montana-magenta/10",
    border: "border-montana-magenta/20",
    items: [
      {
        title: "POPIA Compliance Checklist for SMEs",
        description: "A practical, step-by-step checklist covering the eight conditions for lawful processing under POPIA. Tailored for organisations with 50–500 employees.",
        type: "Checklist",
        readTime: "10 min read",
        href: "/contact",
        cta: "Download Free",
      },
      {
        title: "The Information Officer's Handbook",
        description: "A comprehensive guide to the duties, responsibilities, and liabilities of the Information Officer role under South African privacy law.",
        type: "Guide",
        readTime: "25 min read",
        href: "/contact",
        cta: "Get the Guide",
      },
    ],
  },
  {
    category: "Ransomware & Cyber Resilience",
    icon: Shield,
    color: "text-montana-pink",
    bg: "bg-montana-pink/10",
    border: "border-montana-pink/20",
    items: [
      {
        title: "Ransomware Response Playbook",
        description: "What to do in the first 72 hours after a ransomware attack. A decision-tree framework for IT teams and business continuity managers.",
        type: "Playbook",
        readTime: "15 min read",
        href: "/contact",
        cta: "Download Playbook",
      },
      {
        title: "Immutable Backups: Why Your Current Backup Is Not Enough",
        description: "An in-depth analysis of how modern ransomware targets backup infrastructure, and how immutable storage changes the equation.",
        type: "Whitepaper",
        readTime: "20 min read",
        href: "/contact",
        cta: "Read Whitepaper",
      },
    ],
  },
  {
    category: "Data Protection Strategy",
    icon: Database,
    color: "text-montana-orange",
    bg: "bg-montana-orange/10",
    border: "border-montana-orange/20",
    items: [
      {
        title: "Calculating Your True RTO & RPO",
        description: "A business-led framework for defining recovery time and point objectives. Stop setting technical targets and start setting business outcomes.",
        type: "Framework",
        readTime: "12 min read",
        href: "/contact",
        cta: "Get Framework",
      },
      {
        title: "SaaS Data Protection: The Microsoft 365 Blind Spot",
        description: "Microsoft's shared responsibility model means your M365 data is at risk. This guide explains what is and isn't covered — and how to close the gap.",
        type: "Guide",
        readTime: "18 min read",
        href: "/contact",
        cta: "Read Guide",
      },
    ],
  },
  {
    category: "Future-Proofing",
    icon: Lock,
    color: "text-white/70",
    bg: "bg-white/5",
    border: "border-white/10",
    items: [
      {
        title: "Post-Quantum Cryptography: A Decision-Maker's Primer",
        description: "A non-technical introduction to the quantum threat, NIST's PQC standards, and what your organisation should be doing today to prepare.",
        type: "Primer",
        readTime: "10 min read",
        href: "/contact",
        cta: "Read Primer",
      },
    ],
  },
];

const typeIcons: Record<string, React.ElementType> = {
  Checklist: CheckSquare,
  Guide: BookOpen,
  Playbook: Shield,
  Whitepaper: FileText,
  Framework: FileText,
  Primer: BookOpen,
};

export default function ResourcesPage() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero */}
        <div className="py-16 md:py-20 max-w-3xl">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Resources & Insights
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Knowledge that builds <span className="text-montana-gradient">resilience.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl">
            Practical guides, compliance frameworks, and technical whitepapers. Everything your team needs to make informed decisions about data protection, governance, and cyber resilience.
          </p>
        </div>

        {/* Resources by Category */}
        <div className="space-y-20">
          {resources.map((category) => {
            const CatIcon = category.icon;
            return (
              <div key={category.category}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-sm ${category.bg} border ${category.border}`}>
                    <CatIcon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">{category.category}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((item) => {
                    const TypeIcon = typeIcons[item.type] || FileText;
                    return (
                      <GlassCard key={item.title} className="flex flex-col h-full group hover:border-montana-pink/40 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm">
                            <TypeIcon className={`h-3 w-3 ${category.color}`} />
                            <span className="text-xs text-montana-muted font-medium">{item.type}</span>
                          </div>
                          <span className="text-xs text-montana-muted/60">{item.readTime}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug">{item.title}</h3>
                        <p className="text-sm text-montana-muted leading-relaxed flex-1 mb-6">{item.description}</p>
                        <Link href={item.href}>
                          <AnimatedButton variant="outline" className="w-full group/btn text-xs py-2.5">
                            <Download className="h-3.5 w-3.5 mr-2 group-hover/btn:-translate-y-0.5 transition-transform" />
                            {item.cta}
                          </AnimatedButton>
                        </Link>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-24 border border-white/10 bg-montana-surface/30 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Ready to move from knowledge to action?
            </h2>
            <p className="text-montana-muted max-w-xl mx-auto mb-8">
              Our advisory team can translate these frameworks into a tailored resilience strategy for your organisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pos">
                <AnimatedButton variant="primary" className="px-8">
                  Build Your Solution
                  <ArrowRight className="ml-2 h-4 w-4" />
                </AnimatedButton>
              </Link>
              <Link href="/contact">
                <AnimatedButton variant="outline" className="px-8">
                  Speak to an Advisor
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
