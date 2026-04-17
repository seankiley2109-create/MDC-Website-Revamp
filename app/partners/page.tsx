import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import {
  Handshake, TrendingUp, ShieldCheck, Users, Zap,
  Award, ArrowRight, Phone, Mail, BadgeCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partner Programme — Channel & Reseller Partnerships',
  description:
    'Join the Montana Data Company partner programme. Resell, refer, or white-label enterprise cloud backup, data protection, and POPIA compliance solutions across South Africa.',
  openGraph: {
    title:       'Partner Programme | Montana Data Company',
    description: 'Join the Montana Data Company partner programme. Resell, refer, or white-label enterprise data protection solutions.',
    url:         'https://montanadc.com/partners',
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon:  TrendingUp,
    title: 'Recurring Revenue',
    body:  'Earn competitive margins on every deal you introduce or manage. Subscription-based services mean predictable monthly income for your business.',
  },
  {
    icon:  ShieldCheck,
    title: 'Backed by IBM & Druva',
    body:  'Represent industry-leading technology from IBM and Druva. Our vendor certifications give your clients confidence and your proposals credibility.',
  },
  {
    icon:  Users,
    title: 'Dedicated Support',
    body:  'Each partner gets a dedicated account manager, access to pre-sales engineering, and co-branded collateral to accelerate deals.',
  },
  {
    icon:  Zap,
    title: 'Fast Onboarding',
    body:  'Our streamlined onboarding gets you quoting and selling within days — not months. We handle the technical complexity so you can focus on your clients.',
  },
  {
    icon:  Award,
    title: 'Certification & Training',
    body:  'Access product training, POPIA compliance education, and co-marketing campaigns that position you as a trusted data resilience advisor.',
  },
  {
    icon:  BadgeCheck,
    title: 'POPIA-Ready Portfolio',
    body:  'Our compliance-first product set is purpose-built for South African regulations — a growing differentiator that opens doors in every regulated industry.',
  },
];

const tiers = [
  {
    name:    'Referral Partner',
    accent:  'border-white/20',
    tagline: 'Earn without selling',
    perks: [
      'Refer clients and earn a one-time introduction fee',
      'No technical knowledge required',
      'Ideal for accountants, IT consultants, and brokers',
      'Simple agreement and monthly payments',
    ],
    cta: 'Become a Referral Partner',
  },
  {
    name:    'Reseller Partner',
    accent:  'border-montana-pink/40',
    tagline: 'Most popular',
    highlight: true,
    perks: [
      'Quote and sell the full Montana portfolio',
      'Discounted pricing with healthy margins',
      'Access to pre-sales and technical support',
      'Co-branded proposals and case studies',
    ],
    cta: 'Apply to Resell',
  },
  {
    name:    'White-Label Partner',
    accent:  'border-white/20',
    tagline: 'Sell under your brand',
    perks: [
      'Deliver Montana services under your own brand',
      'Full white-label portal and reporting',
      'Ideal for MSPs and IT service providers',
      'Custom SLAs and dedicated engineering support',
    ],
    cta: 'Enquire About White-Label',
  },
];

const clientLogos = [
  { src: '/logos/bcx.jpg',            alt: 'BCX' },
  { src: '/logos/ntt-data.png',       alt: 'NTT Data' },
  { src: '/logos/luxottica.jpg',      alt: 'Luxottica' },
  { src: '/logos/vw.webp',            alt: 'Volkswagen' },
  { src: '/logos/aspen.jpg',          alt: 'Aspen' },
  { src: '/logos/arm.jpg',            alt: 'ARM' },
  { src: '/logos/synapses.png',       alt: 'Synapses' },
  { src: '/logos/vio-travel.jpg',     alt: 'Vio Travel' },
  { src: '/logos/fairview.jpg',       alt: 'Fairview' },
  { src: '/logos/dsk.jpg',            alt: 'DSK' },
  { src: '/logos/pie-in-the-sky.jpg', alt: 'Pie in the Sky' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Hero ── */}
        <div className="py-16 md:py-20 max-w-3xl">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Partner Programme
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Grow your business with{' '}
            <span className="text-montana-gradient">enterprise data protection.</span>
          </h1>
          <p className="text-lg text-montana-muted leading-relaxed max-w-2xl mb-8">
            Join a growing network of channel partners delivering IBM and Druva-powered data resilience, cyber security, and POPIA compliance solutions to businesses across South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact?enquiryType=partnership">
              <AnimatedButton variant="primary">
                Apply to Partner Programme
                <ArrowRight className="h-4 w-4 ml-2" />
              </AnimatedButton>
            </Link>
            <Link href="/services">
              <AnimatedButton variant="outline">
                Explore the Portfolio
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10 mb-20">
          {[
            { stat: 'IBM',       label: 'Business Partner' },
            { stat: 'Druva',     label: 'Channel Partner' },
            { stat: '3 Tiers',   label: 'Partnership Models' },
            { stat: 'POPIA',     label: 'Compliance Ready' },
          ].map(({ stat, label }) => (
            <div key={label} className="p-6 bg-montana-surface/20 text-center">
              <div className="font-display text-2xl font-bold text-white mb-1">{stat}</div>
              <div className="text-xs text-montana-muted uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Why partner ── */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <Handshake className="h-5 w-5 text-montana-pink shrink-0" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
              Why partner with Montana?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, body }) => (
              <GlassCard key={title} className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center bg-montana-pink/10 border border-montana-pink/20">
                  <Icon className="h-5 w-5 text-montana-pink" />
                </div>
                <h3 className="font-display font-bold text-white">{title}</h3>
                <p className="text-sm text-montana-muted leading-relaxed">{body}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ── Partnership tiers ── */}
        <div className="mb-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
            Choose your partnership model
          </h2>
          <p className="text-montana-muted mb-10 max-w-2xl">
            Whether you want to refer clients, actively resell, or white-label our platform — there&apos;s a tier that fits your business model.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(({ name, accent, tagline, highlight, perks, cta }) => (
              <div
                key={name}
                className={`relative flex flex-col border bg-montana-surface/20 p-8 ${accent} ${highlight ? 'bg-montana-pink/5' : ''}`}
              >
                {highlight && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-montana-magenta via-montana-pink to-montana-coral" />
                )}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-montana-pink mb-2">{tagline}</p>
                  <h3 className="font-display text-xl font-bold text-white">{name}</h3>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3 text-sm text-montana-muted">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-montana-pink" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/contact?enquiryType=partnership">
                  <AnimatedButton
                    variant={highlight ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {cta}
                  </AnimatedButton>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Client logo strip ── */}
        <div className="mb-20">
          <p className="text-xs font-bold uppercase tracking-widest text-montana-muted/60 text-center mb-8">
            Trusted by organisations across South Africa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {clientLogos.map(({ src, alt }) => (
              <div
                key={alt}
                className="h-10 flex items-center grayscale opacity-50 hover:opacity-80 hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={100}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <GlassCard className="p-10 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to join the network?
              </h2>
              <p className="text-montana-muted leading-relaxed mb-6">
                Reach out to our partnerships team. We&apos;ll walk you through the programme, answer your questions, and get you onboarded quickly.
              </p>
              <div className="space-y-3">
                <a href="tel:+27871883843" className="flex items-center gap-3 text-montana-muted hover:text-white transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center border border-white/10 group-hover:border-montana-pink/40 transition-colors">
                    <Phone className="h-4 w-4 text-montana-pink" />
                  </div>
                  <span className="text-sm">+27 (0)87 188 3843</span>
                </a>
                <a href="mailto:support@montanadc.com" className="flex items-center gap-3 text-montana-muted hover:text-white transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center border border-white/10 group-hover:border-montana-pink/40 transition-colors">
                    <Mail className="h-4 w-4 text-montana-pink" />
                  </div>
                  <span className="text-sm">support@montanadc.com</span>
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/contact?enquiryType=partnership">
                <AnimatedButton variant="primary" className="w-full py-4">
                  Submit Partnership Enquiry
                  <ArrowRight className="h-4 w-4 ml-2" />
                </AnimatedButton>
              </Link>
              <Link href="/services">
                <AnimatedButton variant="outline" className="w-full">
                  Browse the Portfolio First
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
