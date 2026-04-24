"use client";

import { HTMLMotionProps, motion } from "motion/react";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variantClass: Record<string, string> = {
      primary:   "animated-btn-primary",
      secondary: "animated-btn-secondary",
      ghost:     "animated-btn-ghost",
      outline:   "animated-btn-secondary",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "animated-btn",
          "inline-flex items-center justify-center gap-1.5",
          "focus:outline-none focus:ring-2 focus:ring-montana-pink/40",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClass[variant],
          className
        )}
        {...props}
      >
        {children}
        <span className="btn-arrow">→</span>
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
