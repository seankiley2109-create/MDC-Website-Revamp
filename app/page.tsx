import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Business Data Protection & Backup | Montana Data Co.' },
  description: 'Montana Data Company protects and governs critical data through professional cloud backup, secure transfer, and cyber resilience for South African businesses of every size.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Business Data Protection & Backup | Montana Data Co.',
    description: 'Montana Data Company protects and governs critical data through professional cloud backup, secure transfer, and cyber resilience for South African businesses of every size.',
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

const BASE_URL = 'https://montanadc.com';

const HOME_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/#webpage`,
  url: BASE_URL,
  name: 'Enterprise Backup & Data Protection | Montana Data Co.',
  description: 'Montana Data Company protects and governs critical data through enterprise-grade cloud backup, secure transfer, and cyber resilience for global organisations.',
  isPartOf: { '@id': `${BASE_URL}/#website` },
  about: { '@id': `${BASE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    ],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_PAGE_SCHEMA) }}
      />
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
