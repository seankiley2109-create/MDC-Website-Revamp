import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POPIA Compliance Assessment — Free Maturity Snapshot",
  description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps, understand your risk exposure, and get actionable recommendations.",
  alternates: { canonical: '/assessments/popia' },
  openGraph: {
    title: "POPIA Compliance Assessment — Free Maturity Snapshot | Montana Data Company",
    description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps, understand your risk exposure, and get actionable recommendations.",
    url: 'https://montanadc.com/assessments/popia',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://montanadc.com' },
    { '@type': 'ListItem', position: 2, name: 'Assessments', item: 'https://montanadc.com/assessments' },
    { '@type': 'ListItem', position: 3, name: 'POPIA Compliance Assessment', item: 'https://montanadc.com/assessments/popia' },
  ],
};

export default function PopiaAssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
    </>
  );
}
