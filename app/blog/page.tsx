import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { AnimatedButton } from "@/components/ui/animated-button";
import { BlogGrid } from "./components/BlogGrid";

export const metadata: Metadata = {
  title: "Blog & Insights | Montana Data Company",
  description:
    "Data protection expertise from the Montana Data Company team. In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365 backup, and enterprise data resilience in South Africa.",
  openGraph: {
    title: "Blog & Insights | Montana Data Company",
    description:
      "In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365 backup, and enterprise data resilience.",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured);

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="py-16 md:py-20">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink rounded-full mr-3 shadow-[0_0_8px_#F24567]" />
            Blog &amp; Insights
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 max-w-3xl">
            Data protection expertise{" "}
            <span className="text-montana-gradient">you can trust.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl">
            In-depth guides on POPIA compliance, ransomware recovery, Microsoft 365
            backup, and enterprise data resilience — written by our team for South
            African organisations.
          </p>
        </div>

        {/* ── Interactive grid (client) ─────────────────────────────────────── */}
        <BlogGrid posts={posts} featured={featured} />

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <div className="border border-white/10 bg-montana-surface/30 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to protect your organisation&apos;s data?
            </h2>
            <p className="text-montana-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Our team assesses your current exposure and builds a practical
              remediation plan — no obligation, no jargon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessments">
                <AnimatedButton variant="primary">
                  Take a Free Assessment
                </AnimatedButton>
              </Link>
              <Link href="/contact">
                <AnimatedButton variant="secondary">
                  Speak to an Expert
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
