import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Risk Assessments — POPIA & Cyber Security | Montana Data Company",
  description: "Take Montana Data Company's free assessments to identify POPIA compliance gaps and cyber security vulnerabilities in under 5 minutes. Get your risk score instantly.",
  openGraph: {
    title: "Free Risk Assessments — POPIA & Cyber Security | Montana Data Company",
    description: "Take Montana Data Company's free assessments to identify POPIA compliance gaps and cyber security vulnerabilities in under 5 minutes.",
  },
};

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
