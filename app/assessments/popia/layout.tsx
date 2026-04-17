import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POPIA Compliance Assessment — Free Maturity Snapshot | Montana Data Company",
  description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps, understand your risk exposure, and get actionable recommendations.",
  openGraph: {
    title: "POPIA Compliance Assessment — Free Maturity Snapshot | Montana Data Company",
    description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps, understand your risk exposure, and get actionable recommendations.",
  },
};

export default function PopiaAssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
