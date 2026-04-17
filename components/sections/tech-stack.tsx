"use client";

import { motion } from "motion/react";
import { Cloud, Server, LayoutGrid, Briefcase, Terminal, Layers } from "lucide-react";

const techLogos = [
  { name: "IBM", icon: Server },
  { name: "Druva", icon: Cloud },
  { name: "Microsoft 365", icon: LayoutGrid },
  { name: "Google Workspace", icon: Briefcase },
  { name: "Red Hat", icon: Terminal },
  { name: "VMware", icon: Layers },
];

export function TechStack() {
  return (
    <section id="tech-stack" className="py-16 md:py-24 border-y border-white/5 bg-montana-bg overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-8 md:mb-12 text-center">
        <h2 className="text-sm font-mono font-semibold tracking-widest text-montana-muted uppercase">
          Powered by Industry Leaders
        </h2>
      </div>
      
      <div className="relative flex w-full overflow-hidden">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-montana-bg to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-montana-bg to-transparent pointer-events-none" />
        
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20,
          }}
        >
          {/* Double the array for seamless looping */}
          {[...techLogos, ...techLogos].map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-3 mx-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              >
                <Icon className="h-8 w-8 text-white/70" />
                <span className="font-display text-xl font-bold text-white/70">{tech.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
