import { GlassCard } from "@/components/ui/glass-card";
import { TrendingUp, Building2, Users, Scale } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

const audiences = [
  {
    title: "Growing Businesses",
    description: "Dependable, enterprise-quality data protection without unnecessary complexity.",
    icon: TrendingUp,
  },
  {
    title: "Mid-sized & Enterprise",
    description: "Stronger resilience, governance, recovery readiness, and security across critical systems.",
    icon: Building2,
  },
  {
    title: "Channel Partners",
    description: "Extend your offering through trusted, white-label and multi-tenant cloud solutions.",
    icon: Users,
  },
  {
    title: "Compliance-Conscious",
    description: "Practical support navigating data governance, privacy, and regulatory obligations.",
    icon: Scale,
  },
];

export function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-16 md:py-24 bg-montana-surface/30 border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 md:mb-16 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Built for your operational reality.
          </h2>
          <p className="text-montana-muted max-w-2xl mx-auto text-lg">
            We work with organisations that rely on secure, available, and recoverable data to keep their operations running.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:mb-12">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <GlassCard key={index} className="flex flex-col sm:flex-row items-start gap-5">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-montana-surface border border-white/10">
                  <Icon className="h-6 w-6 text-montana-pink" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">{audience.title}</h3>
                  <p className="text-sm text-montana-muted leading-relaxed">
                    {audience.description}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
        
        <div className="text-center">
          <Link href="/pos">
            <AnimatedButton variant="outline" className="px-8 py-3">
              Find Your Solution
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
