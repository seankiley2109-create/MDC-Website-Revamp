"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck, RefreshCcw, ArrowLeftRight, Lock, Scale,
  Tag, ShieldAlert, HardDrive, Database,
  AlertTriangle, Clock, Server, Building2,
  ArrowUpDown, Globe, Package, Plug,
  UserCheck, Key, FileCheck, Activity,
  BookOpen, FileText, ClipboardList, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubItem = {
  label: string;
  description: string;
  icon: React.ElementType;
};

type Pillar = {
  number: string;
  id: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  items: SubItem[];
  angle: number;
};

const pillars: Pillar[] = [
  {
    number: "01",
    id: "protect",
    name: "Protect",
    tagline: "Proactively safeguard data across environments",
    icon: ShieldCheck,
    angle: -90,
    items: [
      { label: "Data classification", description: "Categorise assets by sensitivity", icon: Tag },
      { label: "Threat prevention", description: "Block attacks before they reach critical systems", icon: ShieldAlert },
      { label: "Backup & replication", description: "Automated verified copies across environments", icon: HardDrive },
      { label: "Immutable protection", description: "Write-once storage ransomware cannot alter", icon: Database },
    ],
  },
  {
    number: "02",
    id: "recover",
    name: "Recover",
    tagline: "Rapidly restore data and operations when disruption strikes",
    icon: RefreshCcw,
    angle: -18,
    items: [
      { label: "Incident response", description: "Structured playbooks activated on detection", icon: AlertTriangle },
      { label: "Point-in-time recovery", description: "Restore to any moment, not just last backup", icon: Clock },
      { label: "Disaster recovery", description: "Failover to secondary sites with tested RTOs", icon: Server },
      { label: "Business continuity", description: "Operations persist through any failure mode", icon: Building2 },
    ],
  },
  {
    number: "03",
    id: "transfer",
    name: "Transfer",
    tagline: "Move data securely across systems, locations, and clouds",
    icon: ArrowLeftRight,
    angle: 54,
    items: [
      { label: "Secure data movement", description: "Encrypted transit with integrity verification", icon: ArrowUpDown },
      { label: "Network resilience", description: "Redundant paths that survive link failures", icon: Globe },
      { label: "Data portability", description: "No lock-in, move freely between platforms", icon: Package },
      { label: "Interoperability", description: "Open standards connecting any stack", icon: Plug },
    ],
  },
  {
    number: "04",
    id: "secure",
    name: "Secure",
    tagline: "Ensure integrity, confidentiality, and access control",
    icon: Lock,
    angle: 126,
    items: [
      { label: "Identity & access management", description: "Zero-trust, least-privilege by default", icon: UserCheck },
      { label: "Encryption in transit & at rest", description: "AES-256 and TLS at every stage", icon: Key },
      { label: "Data integrity", description: "Checksums preventing silent corruption", icon: FileCheck },
      { label: "Monitoring & auditing", description: "Full audit trails with anomaly detection", icon: Activity },
    ],
  },
  {
    number: "05",
    id: "govern",
    name: "Govern",
    tagline: "Establish policies, compliance, and accountability",
    icon: Scale,
    angle: 198,
    items: [
      { label: "Data governance", description: "Ownership, lineage, and lifecycle at scale", icon: BookOpen },
      { label: "Regulatory compliance", description: "GDPR, HIPAA, SOC 2 built in not bolted on", icon: FileText },
      { label: "Policy & standards", description: "Documented, enforced, version-controlled", icon: ClipboardList },
      { label: "Risk management", description: "Continuous assessment with board-level reporting", icon: BarChart2 },
    ],
  },
];

const SVG_CX = 200;
const SVG_CY = 200;
const SVG_R = 150;
const NODE_RADIUS_PCT = 37.5;

function svgNode(angle: number) {
  const r = (angle * Math.PI) / 180;
  return { x: SVG_CX + SVG_R * Math.cos(r), y: SVG_CY + SVG_R * Math.sin(r) };
}

function cssNode(angle: number) {
  const r = (angle * Math.PI) / 180;
  return {
    x: 50 + NODE_RADIUS_PCT * Math.cos(r),
    y: 50 + NODE_RADIUS_PCT * Math.sin(r),
  };
}

export function DataResilienceFramework() {
  const [selected, setSelected] = useState(0);
  const active = pillars[selected];

  return (
    <section id="data-resilience" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-montana-magenta opacity-[0.04] blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative">
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="h-2 w-2 rounded-full bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Data Resilience Framework
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Five pillars. One resilient foundation.
          </h2>
          <p className="text-montana-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Our framework integrates protection, recovery, transfer, security, and governance into a
            unified architecture — built for today&apos;s threat landscape.
          </p>
        </div>

        {/* Interactive area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Orbital diagram */}
          <div className="flex items-center justify-center">
            <div
              className="relative w-full max-w-[440px] mx-auto"
              style={{ aspectRatio: "1" }}
            >
              {/* SVG: orbital ring, hub glow, connecting lines */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="drf-hub-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#DD297D" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#DD297D" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="drf-node-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#DD297D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#DD297D" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Dashed orbital track */}
                <circle
                  cx={SVG_CX}
                  cy={SVG_CY}
                  r={SVG_R}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1"
                  strokeDasharray="4 10"
                />

                {/* Hub ambient glow */}
                <circle cx={SVG_CX} cy={SVG_CY} r="88" fill="url(#drf-hub-glow)" />

                {/* Connecting lines — active line glows */}
                {pillars.map((p, i) => {
                  const { x, y } = svgNode(p.angle);
                  const isActive = i === selected;
                  return (
                    <motion.line
                      key={p.id}
                      x1={SVG_CX}
                      y1={SVG_CY}
                      x2={x}
                      y2={y}
                      stroke={isActive ? "#DD297D" : "rgba(255,255,255,0.05)"}
                      strokeWidth={isActive ? 1.5 : 1}
                      animate={{ opacity: isActive ? 1 : 0.5 }}
                      transition={{ duration: 0.35 }}
                    />
                  );
                })}

                {/* Hub ring */}
                <circle
                  cx={SVG_CX}
                  cy={SVG_CY}
                  r="33"
                  fill="var(--color-montana-surface)"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="1"
                />
              </svg>

              {/* Hub label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <span className="font-display text-[10px] font-black tracking-widest text-montana-gradient leading-none select-none">
                  MDC
                </span>
              </div>

              {/* Node buttons */}
              {pillars.map((p, i) => {
                const { x, y } = cssNode(p.angle);
                const isActive = i === selected;
                const Icon = p.icon;

                return (
                  <motion.button
                    key={p.id}
                    className="absolute z-20 flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setSelected(i)}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  >
                    <div className="relative">
                      {/* Pulse ring — active only */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ background: "rgba(221,41,125,0.28)" }}
                          animate={{ scale: [1, 1.8], opacity: [0.55, 0] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}

                      {/* Node circle */}
                      <div
                        className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isActive
                            ? "border-montana-pink bg-montana-magenta/15 shadow-[0_0_24px_rgba(221,41,125,0.38)]"
                            : "border-white/10 bg-montana-surface hover:border-montana-pink/30 hover:bg-montana-magenta/5 hover:shadow-[0_0_14px_rgba(221,41,125,0.18)]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300",
                            isActive ? "text-montana-pink" : "text-montana-muted"
                          )}
                        />
                      </div>
                    </div>

                    {/* Node label */}
                    <span
                      className={cn(
                        "text-[9px] font-bold tracking-[0.14em] uppercase leading-none transition-colors duration-300",
                        isActive ? "text-montana-pink" : "text-montana-muted/55"
                      )}
                    >
                      {p.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="min-h-[380px] lg:min-h-[420px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Pillar identity */}
                <div className="mb-6">
                  <p className="text-montana-pink text-xs font-bold tracking-widest uppercase mb-2">
                    {active.number}
                  </p>
                  <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                    {active.name}
                  </h3>
                  <p className="text-montana-muted text-base md:text-lg leading-relaxed">
                    {active.tagline}
                  </p>
                </div>

                {/* Gradient rule */}
                <div className="h-px mb-6 bg-gradient-to-r from-montana-pink/40 via-white/10 to-transparent" />

                {/* Sub-items */}
                <div className="space-y-5">
                  {active.items.map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.065 }}
                      >
                        <div className="mt-0.5 h-8 w-8 shrink-0 flex items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-pink/20">
                          <ItemIcon className="w-4 h-4 text-montana-pink" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm leading-snug">
                            {item.label}
                          </p>
                          <p className="text-montana-muted text-sm leading-relaxed mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile tab strip — shown below the orbital on small screens, hidden on lg */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 lg:hidden">
          {pillars.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelected(i)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200",
                i === selected
                  ? "border-montana-pink text-white bg-montana-magenta/12"
                  : "border-white/10 text-montana-muted hover:border-white/20 hover:text-white"
              )}
            >
              <span className="text-montana-pink/60 mr-1">{p.number}</span>
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
