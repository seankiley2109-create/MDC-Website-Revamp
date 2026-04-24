"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  onMouseEnter,
  onMouseLeave,
  ...props
}: GlassCardProps) {
  // FIX 4: glow pseudo-element only rendered on hover — not permanently in the DOM
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        // FIX 3: backdrop-blur-sm (4px) replaces backdrop-blur-md (12px)
        "relative overflow-hidden border border-white/10 bg-montana-surface/80 backdrop-blur-sm p-8 shadow-2xl transition-all duration-300 hover:border-montana-pink/30",
        className
      )}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {/* FIX 4: glow element mounted only while hovered — not a permanent compositor layer */}
      {glow && hovered && (
        <div className="absolute inset-0 -z-10 bg-montana-magenta/10 blur-3xl" />
      )}
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
