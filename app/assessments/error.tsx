"use client";

import { useEffect } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AssessmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[assessment-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-montana-bg px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Assessment Interrupted</h2>
          <p className="text-montana-muted text-sm">
            An error occurred while loading the assessment. Your progress has not been saved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <AnimatedButton variant="primary" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Assessment
          </AnimatedButton>
          <Link href="/contact">
            <AnimatedButton variant="outline">
              Contact Us Instead
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
