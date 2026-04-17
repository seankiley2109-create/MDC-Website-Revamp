import { Server, Lightbulb, Handshake, Award } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/animated-button";

const differentiators = [
  {
    title: "Enterprise-grade capability",
    description: "We deliver robust solutions designed for organisations that cannot afford data loss, prolonged downtime, or weak resilience.",
    icon: Server,
  },
  {
    title: "Outcome-led thinking",
    description: "We focus on continuity, recoverability, security, and compliance, not just products.",
    icon: Lightbulb,
  },
  {
    title: "Partner-enabled delivery",
    description: "Our model supports both direct customers and partners, including white-label and multi-tenant environments.",
    icon: Handshake,
  },
  {
    title: "Trusted, practical expertise",
    description: "We combine technology with hands-on guidance to help clients make informed, resilient decisions.",
    icon: Award,
  },
];

export function WhyMontana() {
  return (
    <section id="why-montana" className="py-16 md:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center">
          <div className="flex-1">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Why Montana
            </h2>
            <p className="text-montana-muted text-lg mb-8">
              We do more than supply tools. We bring together the right technologies, advisory expertise, and delivery models to build practical solutions around each client&apos;s needs.
            </p>
            <div className="space-y-8">
              {differentiators.map((diff, index) => {
                const Icon = diff.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-montana-magenta/10 border border-montana-pink/20">
                      <Icon className="h-5 w-5 text-montana-pink" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white mb-1">{diff.title}</h3>
                      <p className="text-montana-muted text-sm leading-relaxed">{diff.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative border border-white/10 bg-montana-surface/50 p-6 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-montana-magenta opacity-10 blur-[80px]" />
              <h3 className="font-display text-2xl font-bold text-white mb-4">Our Approach</h3>
              <p className="text-montana-muted mb-6 leading-relaxed">
                We believe effective data protection starts with understanding business reality, not just technical requirements.
              </p>
              <p className="text-montana-muted mb-6 leading-relaxed">
                That is why our approach begins with risk, continuity, governance, and operational need. From there, we design and deliver the right mix of backup, recovery, transfer, security, and advisory support to create a solution that is fit for purpose, scalable, and practical to manage.
              </p>
              <p className="text-montana-muted leading-relaxed mb-8">
                For some clients, that means direct implementation and support. For others, it means a partner-enabled model that extends enterprise-grade capability into their own client environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pos">
                  <AnimatedButton variant="primary" className="w-full sm:w-auto">
                    Build Your Solution
                  </AnimatedButton>
                </Link>
                <Link href="/about">
                  <AnimatedButton variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
