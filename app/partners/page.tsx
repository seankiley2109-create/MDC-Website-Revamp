import type { Metadata } from 'next';
import Link from 'next/link';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import {
  Handshake, TrendingUp, Users, Zap,
  Award, ArrowRight, Phone, Mail, BadgeCheck,
  Server, Database, Smartphone, Activity, FileText, Lock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Become a Reseller — Montana Data Company Partner Programme',
  description:
    'Grow your business by reselling Montana Data Company\'s enterprise data protection, backup, and compliance portfolio across South Africa.',
  openGraph: {
    title:       'Reseller Programme | Montana Data Company',
    description: 'Grow your business by reselling Montana\'s enterprise data protection portfolio.',
    url:         'https://montanadc.com/partners',
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon:  TrendingUp,
    title: 'Recurring Revenue',
    body:  'Earn competitive margins on every deal you manage. Subscription-based services mean predictable monthly income for your business.',
  },
  {
    icon:  Zap,
    title: 'Fast Onboarding',
    body:  'Get up and running quickly with streamlined partner onboarding, deal registration, and dedicated support from day one.',
  },
  {
    icon:  Users,
    title: 'Dedicated Support',
    body:  'Access a dedicated partner manager, pre-sales technical support, and co-marketing resources to help you win deals.',
  },
  {
    icon:  Award,
    title: 'Certification & Training',
    body:  'Build your team\'s expertise with product training and certification programmes across our full solution portfolio.',
  },
  {
    icon:  BadgeCheck,
    title: 'Compliance-Ready Portfolio',
    body:  'Our solutions are built for South African regulatory requirements — making it easy to position and sell to compliance-conscious clients.',
  },
  {
    icon:  Handshake,
    title: 'Co-Selling Opportunities',
    body:  'Work alongside our advisory team on joint opportunities, enterprise engagements, and strategic accounts.',
  },
];

const products = [
  {
    icon:  Server,
    title: 'Enterprise Backup',
    body:  'Bespoke, consultative data protection architecture for complex and high-volume environments.',
    accent: 'text-montana-pink',
    border: 'border-montana-pink/20',
  },
  {
    icon:  Database,
    title: 'SaaS & Endpoint Backup',
    body:  'Productised cloud backup for M365, Google Workspace, Salesforce, and distributed endpoints — including ransomware protection (premium tier).',
    accent: 'text-montana-orange',
    border: 'border-montana-orange/20',
  },
  {
    icon:  Smartphone,
    title: 'MaaS360 (MDM / UEM)',
    body:  'Unified endpoint management and mobile device security for corporate and BYOD environments.',
    accent: 'text-montana-orange',
    border: 'border-montana-orange/20',
  },
  {
    icon:  Activity,
    title: 'IBM Guardium',
    body:  'Advanced data security, monitoring, and governance for on-premises and hybrid environments.',
    accent: 'text-montana-pink',
    border: 'border-montana-pink/20',
  },
  {
    icon:  FileText,
    title: 'POPIA Consulting',
    body:  'Data privacy compliance assessments, training, and advisory engagements for South African organisations.',
    accent: 'text-montana-magenta',
    border: 'border-montana-magenta/20',
  },
  {
    icon:  Lock,
    title: 'Quantum Security (PQC)',
    body:  'Post-Quantum Cryptography readiness and architecture advisory for forward-looking organisations.',
    accent: 'text-montana-pink',
    border: 'border-montana-pink/20',
  },
];

const tiers = [
  {
    name: 'Referral Partner',
    description: 'Introduce qualified leads and earn a one-time referral fee. No technical knowledge required — just a conversation.',
    highlights: [
      'One-time referral fee per closed deal',
      'No technical expertise needed',
      'Simple online lead registration',
      'Deal protection for 90 days',
    ],
    cta: 'Register a Referral',
    href: '/contact?type=partnership',
    featured: false,
  },
  {
    name: 'Reseller Partner',
    description: 'Actively sell and manage Montana solutions to your clients. Earn ongoing margins and build a recurring revenue stream.',
    highlights: [
      'Recurring margins on subscriptions',
      'Access to full product portfolio',
      'Co-marketing and pre-sales support',
      'Dedicated partner manager',
      'Training & certification included',
    ],
    cta: 'Apply to Resell',
    href: '/contact?type=partnership',
    featured: true,
  },
  {
    name: 'White-Label Partner',
    description: 'Deliver Montana-powered solutions under your own brand with custom SLAs and full white-label pricing.',
    highlights: [
      'Sell under your own brand',
      'Custom SLAs and pricing tiers',
      'Full technical handover support',
      'Suitable for MSPs and VARs',
    ],
    cta: 'Discuss White-Label',
    href: '/contact?type=partnership',
    featured: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  return (
    <div className="pt-24 pb-16 md:pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero */}
        <div className="py-10 md:py-20 max-w-4xl">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Reseller Programme
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Grow your business with{' '}
            <span className="text-montana-gradient">enterprise data protection.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl mb-10">
            Become a Montana reseller and bring enterprise-grade backup, compliance, and security solutions to your clients — backed by our advisory team, technical support, and full product portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact?type=partnership">
              <AnimatedButton variant="primary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Apply to Become a Reseller
              </AnimatedButton>
            </Link>
            <Link href="#tiers">
              <AnimatedButton variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg">
                View Partnership Tiers
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* Why Partner */}
        <div className="mb-16 md:mb-24">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-10">Why partner with Montana?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <SpotlightCard customSize key={b.title} className="p-6 flex flex-col gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-montana-surface border border-white/10">
                    <Icon className="h-6 w-6 text-montana-pink" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">{b.title}</h3>
                    <p className="text-sm text-montana-muted leading-relaxed">{b.body}</p>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Products to Resell */}
        <div className="mb-16 md:mb-24">
          <div className="mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Products you can resell</h2>
            <p className="text-montana-muted max-w-2xl">
              Our full portfolio is available to reseller partners — from self-serve SaaS products to consultative enterprise engagements.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const Icon = p.icon;
              return (
                <SpotlightCard customSize key={p.title} className={`p-6 flex flex-col gap-3 border ${p.border} hover:border-opacity-60 transition-colors`}>
                  <Icon className={`h-7 w-7 ${p.accent}`} />
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="text-sm text-montana-muted leading-relaxed">{p.body}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div id="tiers" className="mb-16 md:mb-24 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Partnership Tiers</h2>
            <p className="text-montana-muted max-w-2xl mx-auto">
              Choose the model that fits your business — from simple referrals to full white-label deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {tiers.map((tier) => (
              <SpotlightCard customSize
                key={tier.name}
                className={`p-8 flex flex-col h-full relative ${tier.featured ? 'border-montana-pink/50 md:-translate-y-4' : ''}`}
              >
                {tier.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-montana-pink text-white text-xs font-bold px-4 py-1.5 tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-white mb-3">{tier.name}</h3>
                <p className="text-montana-muted text-sm mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-white/80">
                      <BadgeCheck className="h-4 w-4 text-montana-pink shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href={tier.href}>
                  <AnimatedButton
                    variant={tier.featured ? 'primary' : 'outline'}
                    className="w-full group"
                  >
                    {tier.cta} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </AnimatedButton>
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* CTA */}
        <SpotlightCard customSize className="p-8 md:p-12 text-center border-montana-pink/20">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-montana-muted max-w-xl mx-auto mb-8">
            Get in touch with our partnerships team to discuss your goals and find the right programme for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/contact?type=partnership">
              <AnimatedButton variant="primary" className="gap-2 px-8 py-4">
                Apply to Become a Reseller <ArrowRight className="h-5 w-5" />
              </AnimatedButton>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-montana-muted">
            <a href="tel:+27871883843" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4 text-montana-pink" /> +27 (0)87 188 3843
            </a>
            <a href="mailto:support@montanadc.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="h-4 w-4 text-montana-pink" /> support@montanadc.com
            </a>
          </div>
        </SpotlightCard>

      </div>
    </div>
  );
}
