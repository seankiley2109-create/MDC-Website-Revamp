'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface Props {
  redirectTo?: string;
  signInHref?: string;
}

export default function SignUpForm({ redirectTo, signInHref = '/sign-in' }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  // Build the sign-in link that preserves the post-auth redirect destination
  const signInAfterConfirm = redirectTo
    ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
    : signInHref;

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-white font-bold mb-2">Check your email</p>
        <p className="text-sm text-montana-muted">
          We&apos;ve sent a confirmation link to <span className="text-white">{email}</span>.
          Click the link to activate your account, then{' '}
          <a href={signInAfterConfirm} className="text-montana-pink hover:underline">sign in</a>
          {redirectTo ? ' to continue where you left off' : ''}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-3">
          {error}
        </p>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-montana-muted mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-montana-muted/50 pointer-events-none" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-montana-muted/40 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-montana-pink/50 transition-colors"
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-montana-muted mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-montana-muted/50 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-montana-muted/40 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-montana-pink/50 transition-colors"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-montana-muted mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-montana-muted/50 pointer-events-none" />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-montana-muted/40 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-montana-pink/50 transition-colors"
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />
        </div>
      </div>

      <AnimatedButton
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </AnimatedButton>
    </form>
  );
}
