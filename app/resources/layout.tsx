import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources — Guides, Checklists & Whitepapers | Montana Data Company',
  description: 'Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.',
  openGraph: {
    title: 'Resources — Guides, Checklists & Whitepapers | Montana Data Company',
    description: 'Download free POPIA compliance checklists, ransomware recovery playbooks, and enterprise data protection guides from Montana Data Company.',
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
