"use client";

import { HTMLMotionProps, motion } from "motion/react";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variants = {
      primary: "bg-montana-gradient text-white hover:opacity-90 border border-transparent shadow-[0_0_20px_rgba(242,69,103,0.3)]",
      secondary: "bg-montana-surface text-white hover:bg-[#2A2A2A] border border-white/10",
      outline: "bg-transparent text-white hover:bg-white/5 border border-white/20",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-montana-pink/50 disabled:opacity-50 disabled:pointer-events-none uppercase",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
