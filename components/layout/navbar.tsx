"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, User, CreditCard, LogOut, ChevronDown, Zap, LayoutDashboard } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/services",    label: "Services" },
  { href: "/resources",   label: "Resources" },
  { href: "/assessments", label: "Assessments" },
  { href: "/about",       label: "About" },
  { href: "/contact",     label: "Contact" },
];

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen]           = useState(false);
  const [user, setUser]               = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef                    = useRef<HTMLDivElement>(null);

  // ── Auth state ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Guard: skip if Supabase is not configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setAuthLoading(false);
      return;
    }

    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Close profile dropdown on outside click ──────────────────────────────
  useEffect(() => {
    if (!profileOpen) return;
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  // Scroll is intentionally not locked — users can scroll freely behind the drawer.

  // ── Sign out ─────────────────────────────────────────────────────────────
  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    setIsOpen(false);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.user_metadata?.full_name as string | undefined
    ?? user?.email?.split("@")[0]
    ?? "Account";

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-montana-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logos/montana-logo.svg"
            alt="Montana Data Company"
            width={240}
            height={100}
            className="h-32 md:h-36 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-montana-muted">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-montana-pink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right section */}
        <div className="hidden md:flex items-center gap-3">

          {/* Auth slot */}
          {!authLoading && (
            user ? (
              /* ── Logged in: profile dropdown ── */
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 border border-white/10 bg-white/5 hover:border-montana-pink/40 hover:bg-montana-pink/5 px-3 py-2 text-sm text-montana-muted hover:text-white transition-all"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-montana-pink/20 border border-montana-pink/30">
                    <User className="h-3.5 w-3.5 text-montana-pink" />
                  </div>
                  <span className="max-w-[100px] truncate font-medium">{displayName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 border border-white/10 bg-montana-bg/95 backdrop-blur-xl shadow-2xl z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs text-montana-muted/60 uppercase tracking-wider mb-0.5">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href="/portal"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-montana-muted hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        Client Portal
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-montana-muted hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <CreditCard className="h-4 w-4 shrink-0" />
                        Billing & Subscription
                      </Link>
                      <Link
                        href="/pos"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-montana-muted hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Zap className="h-4 w-4 shrink-0" />
                        Manage Plan
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-montana-muted hover:text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Logged out: Sign In link ── */
              <Link
                href="/sign-in"
                className="text-sm font-medium text-montana-muted hover:text-white transition-colors px-2 py-1"
              >
                Sign In
              </Link>
            )
          )}

          {/* Primary CTA — always visible */}
          <Link href="/pos">
            <AnimatedButton variant="outline">
              Build Your Solution
            </AnimatedButton>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden flex items-center justify-center h-10 w-10 text-white hover:text-montana-pink transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

    </header>

      {/* Mobile Full-Screen Menu — rendered outside <header> to avoid backdrop-filter containing-block bug */}
      <nav
        className={`fixed inset-0 z-[60] bg-montana-bg flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {/* Header row */}
        <div className="flex items-center justify-between h-24 px-6 border-b border-white/10 shrink-0">
          <span className="text-sm font-bold tracking-widest text-montana-muted uppercase">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center h-10 w-10 text-montana-muted hover:text-white transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-6 py-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 text-lg font-medium text-white hover:text-montana-pink transition-colors border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth section */}
        {!authLoading && (
          <div className="px-6 border-t border-white/10 pt-5 pb-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-montana-pink/20 border border-montana-pink/30 shrink-0">
                    <User className="h-4 w-4 text-montana-pink" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-montana-muted/60 uppercase tracking-wider">Signed in</p>
                    <p className="text-sm text-white font-medium truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/portal"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-montana-muted hover:text-white transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Client Portal
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-montana-muted hover:text-white transition-colors"
                >
                  <CreditCard className="h-4 w-4" /> Billing &amp; Subscription
                </Link>
                <Link
                  href="/pos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-montana-muted hover:text-white transition-colors"
                >
                  <Zap className="h-4 w-4" /> Manage Plan
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 text-center text-sm font-medium text-montana-muted border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="block py-2.5 text-center text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Primary CTA */}
        <div className="px-6 pt-2 pb-8">
          <Link href="/pos" onClick={() => setIsOpen(false)}>
            <AnimatedButton variant="primary" className="w-full">
              Build Your Solution
            </AnimatedButton>
          </Link>
        </div>
      </nav>
    </>
  );
}
