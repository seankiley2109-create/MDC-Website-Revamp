import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POPIA Compliance Assessment — Free Maturity Snapshot | Montana Data Company",
  description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps and receive your maturity score with actionable recommendations.",
  openGraph: {
    title: "POPIA Compliance Assessment — Free Maturity Snapshot | Montana Data Company",
    description: "Take Montana Data Company's free 10-question POPIA compliance assessment to identify critical gaps and receive your maturity score with actionable recommendations.",
  },
};

export default function PopiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
