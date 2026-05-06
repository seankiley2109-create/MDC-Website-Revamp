import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources — Guides, Checklists & Whitepapers',
  description: 'Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: 'Resources — Guides, Checklists & Whitepapers | Montana Data Company',
    description: 'Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.',
    url: 'https://montanadc.com/resources',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
