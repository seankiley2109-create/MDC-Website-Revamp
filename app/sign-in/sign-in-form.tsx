'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Loader2, Mail, Lock } from 'lucide-react';

interface Props {
  redirectTo?: string;
  serverError?: string;
}

export default function SignInForm({ redirectTo, serverError }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(serverError ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo ?? '/billing');
    router.refresh();
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-montana-muted/40 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-montana-pink/50 transition-colors"
            placeholder="••••••••"
            autoComplete="current-password"
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
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </AnimatedButton>
    </form>
  );
}
