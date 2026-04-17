import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Solution — Custom Data Protection Configurator | Montana Data Company",
  description: "Use Montana Data Company's interactive configurator to build a tailored enterprise data protection, backup, and cyber resilience solution for your organisation.",
  openGraph: {
    title: "Build Your Solution — Custom Data Protection Configurator | Montana Data Company",
    description: "Use Montana Data Company's interactive configurator to build a tailored enterprise data protection, backup, and cyber resilience solution for your organisation.",
  },
};

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
