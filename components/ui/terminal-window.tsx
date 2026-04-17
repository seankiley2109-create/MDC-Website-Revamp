"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalWindowProps {
  lines: string[];
  className?: string;
  typingSpeed?: number;
}

export function TerminalWindow({ lines, className, typingSpeed = 800 }: TerminalWindowProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < lines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, lines[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, lines, typingSpeed]);

  return (
    <div className={cn("w-full max-w-2xl rounded-xl border border-white/10 bg-montana-surface/80 shadow-2xl backdrop-blur-xl overflow-hidden", className)}>
      {/* Terminal Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/10 bg-montana-bg/50">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="mx-auto text-xs font-mono text-montana-muted">root@montanadc:~</div>
      </div>
      
      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm sm:text-base text-white/80 min-h-[200px]">
        {displayedLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <span className="text-montana-pink mr-2">❯</span>
            {line}
          </motion.div>
        ))}
        {currentIndex < lines.length && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-4 bg-montana-muted align-middle ml-1"
          />
        )}
      </div>
    </div>
  );
}
