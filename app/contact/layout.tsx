import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch",
  description: "Contact Montana Data Company for enterprise cloud backup, data protection, POPIA compliance consulting, or channel partnership enquiries.",
  alternates: { canonical: '/contact' },
  openGraph: {
    title: "Contact Us — Get in Touch | Montana Data Company",
    description: "Contact Montana Data Company for enterprise cloud backup, data protection, POPIA compliance consulting, or channel partnership enquiries.",
    url: 'https://montanadc.com/contact',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
