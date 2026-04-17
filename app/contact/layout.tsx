import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch | Montana Data Company",
  description: "Contact Montana Data Company for enterprise cloud backup, data protection, POPIA compliance consulting, or channel partnership enquiries.",
  openGraph: {
    title: "Contact Us — Get in Touch | Montana Data Company",
    description: "Contact Montana Data Company for enterprise cloud backup, data protection, POPIA compliance consulting, or channel partnership enquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
