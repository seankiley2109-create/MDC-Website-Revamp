import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Solution — Custom Data Protection Configurator",
  description: "Use Montana Data Company's interactive configurator to build a tailored enterprise data protection, backup, and cyber resilience solution for your organisation.",
  alternates: { canonical: '/pos' },
  openGraph: {
    title: "Build Your Solution — Custom Data Protection Configurator | Montana Data Company",
    description: "Use Montana Data Company's interactive configurator to build a tailored enterprise data protection, backup, and cyber resilience solution for your organisation.",
    url: 'https://montanadc.com/pos',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
