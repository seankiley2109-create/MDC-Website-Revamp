import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Chatbot } from "@/components/chatbot";
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const BASE_URL = 'https://montanadc.com';
const TITLE    = 'Enterprise Cloud Backup & Data Protection | Montana Data Company';
const DESC     = 'Montana Data Company helps organisations protect, recover, move, and govern critical data through enterprise-grade cloud backup, secure transfer, and cyber resilience.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  TITLE,
    template: '%s | Montana Data Company',
  },
  description: DESC,
  openGraph: {
    type:        'website',
    siteName:    'Montana Data Company',
    title:       TITLE,
    description: DESC,
    url:         BASE_URL,
  },
  twitter: {
    card:        'summary_large_image',
    title:       TITLE,
    description: DESC,
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-montana-bg text-white antialiased selection:bg-montana-pink/30 selection:text-white`}
        suppressHydrationWarning
      >
        {/* BACKGROUND LAYERS */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          {/* 1. The Tech Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          
          {/* 2. The Branded Radial Glow */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-montana-magenta/15 blur-[120px] rounded-full" />
          
          {/* 3. Bottom Glow (Optional for depth) */}
          <div className="absolute -bottom-[10%] right-0 w-[40%] h-[40%] bg-montana-orange/10 blur-[100px] rounded-full" />
        </div>

        {/* MAIN APP CONTENT */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  );
}