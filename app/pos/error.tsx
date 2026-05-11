"use client";

import { useEffect } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AlertTriangle } from "lucide-react";

export default function POSError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[pos-error]", error.message, error.stack, "digest:", error.digest);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-montana-muted text-sm">
            An unexpected error occurred loading the configurator. Please try again or contact us on{" "}
            <a href="tel:+27871883843" className="text-montana-pink hover:underline">
              +27 (0)87 188 3843
            </a>
            .
          </p>
        </div>
        <AnimatedButton variant="primary" onClick={reset}>
          Try Again
        </AnimatedButton>
      </div>
    </div>
  );
}
