'use client';

import { useEffect } from 'react';
import { X, Lock, UserPlus, LogIn, Download } from 'lucide-react';
import Link from 'next/link';
import { AnimatedButton } from '@/components/ui/animated-button';

export interface PreviewResource {
  title:    string;
  type:     string;
  excerpt:  string;
  file:     string;
  filename: string;
  color:    string;
}

interface Props {
  resource:   PreviewResource | null;
  onClose:    () => void;
  onDownload: () => void;
}

function renderExcerpt(text: string) {
  const lines = text.split('\n');
  const nodes = lines.map((line, i) => {
    const t = line.trim();

    if (!t) return <div key={i} className="h-2" />;

    // Horizontal rule
    if (/^─{3,}$/.test(t)) return <hr key={i} className="border-white/10 my-2" />;

    // Checklist item
    if (t.startsWith('☐')) {
      return (
        <div key={i} className="flex gap-2 items-baseline my-0.5">
          <span className="text-montana-pink shrink-0 text-xs leading-5">☐</span>
          <span className="text-sm text-montana-muted">{t.slice(1).trim()}</span>
        </div>
      );
    }

    // **Bold header**
    if (t.startsWith('**') && t.endsWith('**')) {
      return (
        <p key={i} className="text-white font-semibold text-sm mt-3 mb-1">
          {t.slice(2, -2)}
        </p>
      );
    }

    // *Italic subtitle*
    if (t.startsWith('*') && t.endsWith('*') && !t.startsWith('**')) {
      return (
        <p key={i} className="text-xs text-montana-muted/70 italic mb-1">
          {t.slice(1, -1)}
        </p>
      );
    }

    // ALL-CAPS section label (e.g. "HOUR 0–4: CONTAIN")
    if (/^[A-Z0-9][A-Z0-9\s\-–—&:/]+$/.test(t) && t.length < 50) {
      return (
        <p key={i} className="text-white/80 font-bold text-xs uppercase tracking-widest mt-4 mb-1">
          {t}
        </p>
      );
    }

    // Line ending with colon = section header
    if (t.endsWith(':') && t.length < 65 && !t.startsWith('"') && !t.startsWith('“')) {
      return (
        <p key={i} className="text-white/90 font-semibold text-sm mt-4 mb-1">
          {t}
        </p>
      );
    }

    // Blockquote (starts with " or ")
    if (t.startsWith('"') || t.startsWith('“')) {
      return (
        <blockquote key={i} className="border-l-2 border-montana-pink/50 pl-3 my-2 text-sm text-montana-muted/80 italic">
          {t}
        </blockquote>
      );
    }

    // Indented list items: "Step 1 —", "Tier 1 —", "1.1 —", "Condition 1:"
    if (/^(Step|Tier|Part|Condition)\s+\d/.test(t) || /^\d+\.\d+\s+[—–]/.test(t)) {
      return (
        <p key={i} className="text-sm text-montana-muted mt-2 pl-3 border-l border-white/10">
          {t}
        </p>
      );
    }

    return (
      <p key={i} className="text-sm text-montana-muted leading-relaxed mt-2">
        {t}
      </p>
    );
  });

  return (
    <>
      {nodes}
    </>
  );
}

export function ResourcePreviewModal({ resource, onClose, onDownload }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (!resource) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [resource]);

  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg border border-white/10 bg-montana-surface/95 backdrop-blur-md shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-montana-muted hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-montana-pink mb-2">
            Document Preview
          </p>
          <h2 id="preview-modal-title" className="font-display text-xl font-bold text-white leading-snug pr-8">
            {resource.title}
          </h2>
        </div>

        {/* Scrollable excerpt */}
        <div className="px-8">
          <div className="border-t border-white/10 pt-5">
            <div className="max-h-64 overflow-y-auto pr-2">
              {renderExcerpt(resource.excerpt)}
            </div>
          </div>
        </div>

        {/* Gate */}
        <div className="px-8 pb-8 pt-5">
          <div className="border border-white/10 bg-white/5 p-5 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center bg-montana-pink/10 border border-montana-pink/20 mb-3">
              <Lock className="h-5 w-5 text-montana-pink" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Continue reading — it&apos;s free</p>
            <p className="text-xs text-montana-muted mb-4">
              Instant access to all guides, playbooks, and frameworks.
            </p>
            <div className="flex gap-3">
              <Link href="/sign-up?redirect=/resources&ref=resource-preview" onClick={onClose} className="flex-1">
                <AnimatedButton variant="primary" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </AnimatedButton>
              </Link>
              <Link href="/sign-in?redirect=/resources&ref=resource-preview" onClick={onClose} className="flex-1">
                <AnimatedButton variant="outline" className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </AnimatedButton>
              </Link>
            </div>
            <button
              onClick={onDownload}
              className="mt-3 text-xs text-montana-muted hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Download className="h-3 w-3" />
              Download instead — enter your email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
