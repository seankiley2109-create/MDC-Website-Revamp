import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { CircularFlowDiagram } from "@/components/sections/circular-flow-diagram";
import { Database, ShieldCheck, FileText, Server, ShieldAlert, Archive, Activity, Lock } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Enterprise Backup",
    description: "Bespoke, consultative architecture for complex environments requiring tailored data protection.",
    icon: Server,
  },
  {
    title: "SaaS & Endpoint",
    description: "Productised cloud backup for M365, Google Workspace, and endpoints with fast deployment.",
    icon: Database,
  },
  {
    title: "Ransomware Protection",
    description: "Immutable storage and AI anomaly detection to isolate and recover from ransomware attacks.",
    icon: ShieldAlert,
  },
  {
    title: "Archive & Lifecycle",
    description: "Intelligent cold data management and compliance archiving for long-term retention.",
    icon: Archive,
  },
  {
    title: "MaaS360 (MDM/UEM)",
    description: "Unified Endpoint Management and threat defense for all corporate devices.",
    icon: ShieldCheck,
  },
  {
    title: "Guardium",
    description: "Comprehensive data security, monitoring, and governance across hybrid environments.",
    icon: Activity,
  },
  {
    title: "POPIA Consulting",
    description: "Data privacy compliance, training, and independent privacy audits.",
    icon: FileText,
  },
  {
    title: "Quantum Security (PQC)",
    description: "Post-Quantum Cryptography readiness and architecture for future-proofing data.",
    icon: Lock,
  }
];


export function Services() {
  return (
    <section id="solutions" className="py-16 md:py-24 relative">
      <div className="mx-auto max-w-7xl px-6">
        {/* 2-column: text left, circular flow diagram right */}
        <div className="mb-10 md:mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              When data risk becomes business risk.
            </h2>
            <p className="text-montana-muted text-lg leading-relaxed">
              In today&apos;s landscape, you aren&apos;t just buying backup. You are buying business continuity, regulatory compliance, and peace of mind. We provide the infrastructure and advisory support to ensure your data is always secure, compliant, and instantly recoverable.
            </p>
          </div>

          {/* Circular flow diagram */}
          <CircularFlowDiagram />
        </div>

        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
            Platform Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 md:mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <SpotlightCard key={index} customSize className="p-6 md:p-8 flex flex-col h-full w-full group">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-surface border border-white/10 group-hover:bg-montana-magenta/10 group-hover:border-montana-pink/30 transition-colors">
                  <Icon className="h-6 w-6 text-montana-pink" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-montana-muted leading-relaxed flex-1">
                  {service.description}
                </p>
              </SpotlightCard>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/services">
            <AnimatedButton variant="outline" className="px-8 py-3">
              Explore All Capabilities
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
