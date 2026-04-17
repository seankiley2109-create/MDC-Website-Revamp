import type { Metadata } from 'next';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  const signInHref = redirect
    ? `/sign-in?redirect=${encodeURIComponent(redirect)}`
    : '/sign-in';

  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-6">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Account
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-sm text-montana-muted">Set up your Montana Data Company account.</p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <SignUpForm redirectTo={redirect} signInHref={signInHref} />
        </GlassCard>

        <p className="text-center text-sm text-montana-muted mt-6">
          Already have an account?{' '}
          <Link href={signInHref} className="text-montana-pink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
