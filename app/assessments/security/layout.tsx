import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backup & Security Assessment — Free Cyber Resilience Check | Montana Data Company",
  description: "Take Montana Data Company's free 10-question security assessment to uncover vulnerabilities in your backup, ransomware preparedness, and endpoint security posture.",
  openGraph: {
    title: "Backup & Security Assessment — Free Cyber Resilience Check | Montana Data Company",
    description: "Take Montana Data Company's free 10-question security assessment to uncover vulnerabilities in your backup, ransomware preparedness, and endpoint security posture.",
  },
};

export default function SecurityAssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
