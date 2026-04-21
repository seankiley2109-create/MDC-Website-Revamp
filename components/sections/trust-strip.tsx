import { Shield, Clock, Users, FileCheck } from "lucide-react";

const trustItems = [
  { text: "Established in 2013",        sub: "Over a decade of enterprise delivery",           icon: Clock     },
  { text: "Enterprise-grade solutions", sub: "Backed by world-class technology partners",       icon: Shield    },
  { text: "Direct and partner delivery",sub: "Flexible engagement through any channel",         icon: Users     },
  { text: "Compliance-aware approach",  sub: "Built around POPIA and data governance standards", icon: FileCheck },
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/5 bg-montana-surface/30 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-5">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-white/10 bg-montana-surface">
                  <Icon className="h-6 w-6 text-montana-pink" />
                </div>
                <div>
                  <p className="text-base font-bold text-white mb-1">{item.text}</p>
                  <p className="text-sm text-montana-muted leading-relaxed">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
