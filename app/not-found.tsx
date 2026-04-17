import Link from 'next/link';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Home, ArrowLeft, Shield, FileSearch } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found',
};

const quickLinks = [
  { href: '/services',  label: 'Services',          icon: Shield },
  { href: '/assessments', label: 'Free Assessments', icon: FileSearch },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-montana-bg flex items-center justify-center px-6 pt-24 pb-24">
      <div className="max-w-2xl w-full text-center">

        {/* 404 display */}
        <div className="relative inline-block mb-8">
          <span className="font-display text-[160px] md:text-[200px] font-black leading-none text-white/[0.04] select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase">
              <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
              Page Not Found
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          This page doesn&apos;t exist.
        </h1>
        <p className="text-montana-muted text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The link you followed may be broken, or the page may have been moved or removed.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <AnimatedButton variant="primary">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </AnimatedButton>
          </Link>
          <Link href="/contact">
            <AnimatedButton variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Contact Us
            </AnimatedButton>
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-t border-white/5 pt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-montana-muted/60 mb-6">
            Or go directly to
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/[0.02] text-sm text-montana-muted hover:text-white hover:border-montana-pink/40 hover:bg-montana-pink/5 transition-all"
              >
                <Icon className="h-3.5 w-3.5 text-montana-pink" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
