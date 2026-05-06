import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Enterprise Backup & Data Protection | Montana Data Co.' },
  description: 'Montana Data Company protects and governs critical data through enterprise-grade cloud backup, secure transfer, and cyber resilience for global organisations.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Enterprise Backup & Data Protection | Montana Data Co.',
    description: 'Montana Data Company protects and governs critical data through enterprise-grade cloud backup, secure transfer, and cyber resilience for global organisations.',
    url: 'https://montanadc.com',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ClientLogos } from "@/components/sections/client-logos";
import { Services } from "@/components/sections/services";
import { WhoWeServe } from "@/components/sections/who-we-serve";
import { WhyMontana } from "@/components/sections/why-montana";
import { TechStack } from "@/components/sections/tech-stack";
import { DataResilienceFramework } from "@/components/sections/data-resilience-framework";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <WhoWeServe />
      <ClientLogos />
      <Services />
      <DataResilienceFramework />
      <WhyMontana />
      {/* <TechStack /> */}
    </>
  );
}
