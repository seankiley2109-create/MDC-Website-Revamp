import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backup & Security Assessment — Free Cyber Resilience Check",
  description: "Take Montana Data Company's free 10-question security assessment to uncover vulnerabilities in your backup, ransomware preparedness, and endpoint security posture.",
  alternates: { canonical: '/assessments/security' },
  openGraph: {
    title: "Backup & Security Assessment — Free Cyber Resilience Check | Montana Data Company",
    description: "Take Montana Data Company's free 10-question security assessment to uncover vulnerabilities in your backup, ransomware preparedness, and endpoint security posture.",
    url: 'https://montanadc.com/assessments/security',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://montanadc.com' },
    { '@type': 'ListItem', position: 2, name: 'Assessments', item: 'https://montanadc.com/assessments' },
    { '@type': 'ListItem', position: 3, name: 'Backup & Security Assessment', item: 'https://montanadc.com/assessments/security' },
  ],
};

export default function SecurityAssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
    </>
  );
}
