import { Shield, Clock, Users, FileCheck } from "lucide-react";

const trustItems = [
  { text: "Established in 2013", icon: Clock },
  { text: "Enterprise-grade solutions", icon: Shield },
  { text: "Direct and partner delivery", icon: Users },
  { text: "Compliance-aware approach", icon: FileCheck },
];

export function TrustStrip() {
  return (
    <section className="border-y border-white/5 bg-montana-surface/30 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-3">
                <Icon className="h-5 w-5 text-montana-pink opacity-80" />
                <span className="text-sm font-medium text-montana-muted">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
