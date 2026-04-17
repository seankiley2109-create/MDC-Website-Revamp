'use client';

import { AnimatedButton } from "@/components/ui/animated-button";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Server, Lock, FileWarning, Smartphone, Database } from "lucide-react";

const OFFERINGS = [
  {
    id: "ibm",
    name: "IBM Enterprise Backup",
    icon: Server,
    does: "Bespoke, consultative data protection architecture.",
    matters: "Ensures operational continuity for complex, multi-cloud environments.",
    risk: "When enterprise backups fail, recovery isn't an option.",
    color: "text-montana-pink",
    bg: "bg-montana-pink/10",
    border: "border-montana-pink/20"
  },
  {
    id: "druva",
    name: "Druva SaaS & Endpoint",
    icon: Database,
    does: "Productised, scalable cloud backup for distributed workforces.",
    matters: "Secures Microsoft 365, Salesforce, and remote endpoints instantly.",
    risk: "Data loss at the edge compromises the entire organization.",
    color: "text-montana-orange",
    bg: "bg-montana-orange/10",
    border: "border-montana-orange/20"
  },
  {
    id: "ransomware",
    name: "Ransomware Protection",
    icon: Shield,
    does: "Immutable backups and AI-driven anomaly detection.",
    matters: "Isolates clean data to guarantee recovery after an attack.",
    risk: "Ransomware doesn't wait for your readiness.",
    color: "text-montana-magenta",
    bg: "bg-montana-magenta/10",
    border: "border-montana-magenta/20"
  },
  {
    id: "popia",
    name: "POPIA & Governance",
    icon: FileWarning,
    does: "Strategic alignment of data practices with privacy laws.",
    matters: "Transforms compliance from a legal burden into a security baseline.",
    risk: "Compliance gaps rapidly become critical business risks.",
    color: "text-montana-pink",
    bg: "bg-montana-pink/10",
    border: "border-montana-pink/20"
  },
  {
    id: "maas360",
    name: "MaaS360 MDM / UEM",
    icon: Smartphone,
    does: "Unified endpoint management and threat defense.",
    matters: "Secures corporate data across all mobile devices and BYOD.",
    risk: "Unmanaged devices are the fastest route to a data breach.",
    color: "text-montana-orange",
    bg: "bg-montana-orange/10",
    border: "border-montana-orange/20"
  },
  {
    id: "quantum",
    name: "Quantum Security (PQC)",
    icon: Lock,
    does: "Post-Quantum Cryptography and NIST alignment.",
    matters: "Future-proofs encryption against next-generation threats.",
    risk: "Data harvested today will be decrypted tomorrow.",
    color: "text-montana-magenta",
    bg: "bg-montana-magenta/10",
    border: "border-montana-magenta/20"
  }
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERINGS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  function goTo(idx: number) {
    setCurrentIndex(idx);
    setPaused(true);
    // Resume auto-play after 12 s of inactivity
    setTimeout(() => setPaused(false), 12000);
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-montana-bg">
      {/* Geometric Background / Subtle Linework */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-montana-magenta opacity-10 blur-[120px]" />
      
      {/* Abstract Peak Lines */}
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 600L400 300L600 500L1000 100L1440 400" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="8 8" />
        <path d="M0 700L350 400L650 600L1100 200L1440 500" stroke="url(#paint1_linear)" strokeWidth="1" opacity="0.5" />
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DD297D" />
            <stop offset="1" stopColor="#F86C49" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="0" y1="0" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F24567" />
            <stop offset="1" stopColor="#F65559" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-10 md:gap-16 w-full">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]"></span>
            Enterprise Data Resilience Platform
          </div>
          <h1 className="font-display text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Protect, recover, and govern with{" "}
            <span className="text-montana-gradient">
              absolute certainty.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-montana-muted mb-10 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
            We engineer data resilience for organizations that cannot afford downtime. Enterprise-grade protection, secure transfer, and compliance frameworks built to eliminate operational risk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/pos" className="w-full sm:w-auto">
              <AnimatedButton variant="primary" className="w-full">
                Find your Solution
              </AnimatedButton>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <AnimatedButton variant="outline" className="w-full">
                Request an Assessment
              </AnimatedButton>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-xl lg:max-w-none relative z-10 h-auto md:h-[450px] flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Background decorative elements */}
            <div className="absolute inset-0 border border-white/5 bg-montana-surface/20 backdrop-blur-3xl transform rotate-6 rounded-2xl transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 border border-white/10 bg-montana-surface/40 backdrop-blur-2xl transform -rotate-3 rounded-2xl transition-transform duration-1000 ease-out" />
            
            <div className="absolute inset-0 border border-white/20 bg-montana-surface/80 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col">
              {/* Progress Bar — tap a segment to jump to that offering */}
              {/* Outer div is h-11 (44px) for a proper mobile touch target;        */}
              {/* the visible 4px bar sits pinned to the bottom via absolute.        */}
              <div className="relative h-11 w-full flex items-end">
                {/* Background track */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 pointer-events-none" />
                {OFFERINGS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`View ${OFFERINGS[idx].name}`}
                    className="flex-1 h-full relative focus:outline-none"
                  >
                    {idx === currentIndex && (
                      <motion.div
                        key={currentIndex}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-montana-pink"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                      />
                    )}
                    {idx < currentIndex && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />}
                  </button>
                ))}
              </div>

              <div className="p-5 md:p-8 flex-1 flex flex-col relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${OFFERINGS[currentIndex].bg} border ${OFFERINGS[currentIndex].border}`}>
                        {(() => {
                          const Icon = OFFERINGS[currentIndex].icon;
                          return <Icon className={`h-6 w-6 ${OFFERINGS[currentIndex].color}`} />;
                        })()}
                      </div>
                      <h3 className="font-display text-lg md:text-2xl font-bold text-white">
                        {OFFERINGS[currentIndex].name}
                      </h3>
                    </div>

                    <div className="space-y-6 flex-1">
                      <div>
                        <div className="text-xs font-bold tracking-widest text-montana-muted uppercase mb-2">Capabilities</div>
                        <p className="text-white/90 leading-relaxed">
                          {OFFERINGS[currentIndex].does}
                        </p>
                      </div>
                      
                      <div>
                        <div className="text-xs font-bold tracking-widest text-montana-muted uppercase mb-2">Business Impact</div>
                        <p className="text-white/90 leading-relaxed">
                          {OFFERINGS[currentIndex].matters}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className={`h-2 w-2 rounded-full ${OFFERINGS[currentIndex].bg.replace('/10', '')} shadow-[0_0_8px_currentColor] ${OFFERINGS[currentIndex].color}`} />
                        </div>
                        <p className="text-sm font-medium text-montana-muted italic">
                          &quot;{OFFERINGS[currentIndex].risk}&quot;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
