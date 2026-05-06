import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
const TITLE    = 'Enterprise Backup & Data Protection | Montana Data Co.';
const DESC     = 'Montana Data Company protects and governs critical data through enterprise-grade cloud backup, secure transfer, and cyber resilience for global organisations.';
const OG_IMAGE = [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Montana Data Company' }];

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
    images:      OG_IMAGE,
  },
  twitter: {
    card:        'summary_large_image',
    title:       TITLE,
    description: DESC,
    images:      OG_IMAGE,
  },
  robots: {
    index:  true,
    follow: true,
  },
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Montana Data Company',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logos/montana-logo.svg` },
      description: DESC,
      telephone: '+27871883843',
      email: 'support@montanadc.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Suite 24, Frazzitta Business Park, Cnr Langeberg & Batis Roads',
        addressLocality: 'Durbanville',
        addressRegion: 'Western Cape',
        postalCode: '7550',
        addressCountry: 'ZA',
      },
      areaServed: { '@type': 'Country', name: 'South Africa' },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Montana Data Company',
      url: BASE_URL,
      telephone: '+27871883843',
      email: 'support@montanadc.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Suite 24, Frazzitta Business Park, Cnr Langeberg & Batis Roads',
        addressLocality: 'Durbanville',
        addressRegion: 'Western Cape',
        postalCode: '7550',
        addressCountry: 'ZA',
      },
      openingHours: 'Mo-Fr 08:00-17:00',
      parentOrganization: { '@id': `${BASE_URL}/#organization` },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Montana Data Company',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/resources?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
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
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          
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
          <Analytics />
          <SpeedInsights />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </body>
    </html>
  );
}