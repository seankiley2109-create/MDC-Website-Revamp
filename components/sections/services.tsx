import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
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

function CircularFlowDiagram() {
  // 5 nodes arranged in a circle. Using viewBox 200x200, centre 100,100, radius 72.
  const nodes = [
    { label: "Protect",  angle: -90 },
    { label: "Recover",  angle: -90 + 72 },
    { label: "Transfer", angle: -90 + 144 },
    { label: "Secure",   angle: -90 + 216 },
    { label: "Govern",   angle: -90 + 288 },
  ];
  const r = 72; // orbit radius
  const cx = 100;
  const cy = 100;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pts = nodes.map((n) => ({
    x: cx + r * Math.cos(toRad(n.angle)),
    y: cy + r * Math.sin(toRad(n.angle)),
    label: n.label,
  }));

  // Build arc paths between consecutive nodes (curved slightly outward)
  const arcs = pts.map((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const mx = (p.x + next.x) / 2;
    const my = (p.y + next.y) / 2;
    // Pull control point toward the centre slightly for inward curve
    const cpx = mx + (cx - mx) * 0.25;
    const cpy = my + (cy - my) * 0.25;
    return `M ${p.x} ${p.y} Q ${cpx} ${cpy} ${next.x} ${next.y}`;
  });

  const colors = ["#F24567", "#E8357A", "#C92575", "#F24567", "#E8357A"];

  return (
    <div className="h-full w-full border border-white/10 bg-montana-surface/50 p-4 relative overflow-hidden flex items-center justify-center min-h-[260px]">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px]" />
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px] h-auto" aria-label="Circular resilience flow: Protect, Recover, Transfer, Secure, Govern">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#F24567" opacity="0.8" />
          </marker>
        </defs>
        {/* Centre label */}
        <text x="100" y="97" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="600" opacity="0.5">DATA</text>
        <text x="100" y="106" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="600" opacity="0.5">RESILIENCE</text>

        {/* Arc connectors */}
        {arcs.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={colors[i]}
            strokeWidth="1.2"
            strokeOpacity="0.6"
            markerEnd="url(#arrowhead)"
          />
        ))}

        {/* Nodes */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="16" fill="#1a1a2e" stroke={colors[i]} strokeWidth="1.5" strokeOpacity="0.9" />
            <circle cx={p.x} cy={p.y} r="16" fill={colors[i]} fillOpacity="0.08" />
            <text
              x={p.x}
              y={p.y + 3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="6.5"
              fontWeight="700"
              letterSpacing="0.02em"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

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
              <GlassCard key={index} className="p-6 md:p-8 group hover:border-montana-pink/50 transition-colors flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-surface border border-white/10 group-hover:bg-montana-magenta/10 group-hover:border-montana-pink/30 transition-colors">
                  <Icon className="h-6 w-6 text-montana-pink" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-montana-muted leading-relaxed flex-1">
                  {service.description}
                </p>
              </GlassCard>
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
