"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, DollarSign, Clock, ShieldAlert, type LucideIcon } from "lucide-react";

export type AwarenessFact = {
  icon: LucideIcon;
  stat: string;
  headline: string;
  body: string;
  accentColor: "red" | "amber" | "pink";
};

const colorMap = {
  red: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    statColor: "text-red-400",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    glow: "shadow-red-500/5",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    statColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "shadow-amber-500/5",
  },
  pink: {
    border: "border-montana-pink/30",
    bg: "bg-montana-magenta/5",
    statColor: "text-montana-pink",
    iconBg: "bg-montana-magenta/10",
    iconColor: "text-montana-pink",
    glow: "shadow-montana-pink/5",
  },
};

interface AwarenessCardsProps {
  facts: AwarenessFact[];
  currentQuestion: number;
}

// Wrapper that uses key to reset state when question changes
export function AwarenessCards({ facts, currentQuestion }: AwarenessCardsProps) {
  return <AwarenessCardsInner key={currentQuestion} facts={facts} />;
}

function AwarenessCardsInner({ facts }: { facts: AwarenessFact[] }) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-cycle through facts
  useEffect(() => {
    if (facts.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 1) % facts.length);
        setIsTransitioning(false);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [facts.length]);

  if (facts.length === 0) return null;

  const fact = facts[visibleIndex];
  const colors = colorMap[fact.accentColor];
  const Icon = fact.icon;

  return (
    <div className="space-y-4">
      {/* Main awareness card */}
      <div
        className={`border ${colors.border} ${colors.bg} p-6 shadow-xl ${colors.glow} transition-all duration-200 ${
          isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${colors.iconBg}`}>
            <Icon className={`h-5 w-5 ${colors.iconColor}`} />
          </div>
          <span className="text-xs font-bold tracking-widest text-montana-muted uppercase">Did you know?</span>
        </div>

        {fact.stat && (
          <div className={`text-4xl md:text-5xl font-bold ${colors.statColor} mb-3 font-display`}>
            {fact.stat}
          </div>
        )}

        <h4 className="text-lg font-bold text-white mb-2">{fact.headline}</h4>
        <p className="text-sm text-montana-muted leading-relaxed">{fact.body}</p>
      </div>

      {/* Dot indicators */}
      {facts.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {facts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setVisibleIndex(i);
                  setIsTransitioning(false);
                }, 200);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === visibleIndex ? `w-6 ${colors.statColor.replace("text-", "bg-")}` : "w-1.5 bg-white/20"
              }`}
              aria-label={`View fact ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
