import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Risk Assessments — POPIA & Cyber Security",
  description: "Take Montana Data Company's free assessments to identify POPIA compliance gaps and cyber security vulnerabilities in under 5 minutes. Get your risk score instantly.",
  alternates: { canonical: '/assessments' },
  openGraph: {
    title: "Free Risk Assessments — POPIA & Cyber Security | Montana Data Company",
    description: "Take Montana Data Company's free assessments to identify POPIA compliance gaps and cyber security vulnerabilities in under 5 minutes.",
    url: 'https://montanadc.com/assessments',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
