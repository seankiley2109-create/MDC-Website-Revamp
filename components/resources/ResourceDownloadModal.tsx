'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Download, CheckCircle, Loader2 } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

const schema = z.object({
  name:  z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export interface DownloadResource {
  title:    string;
  file:     string; // e.g. /resources/immutable-backups.pdf
  filename: string; // e.g. immutable-backups.pdf
}

interface Props {
  resource: DownloadResource | null;
  onClose:  () => void;
}

export function ResourceDownloadModal({ resource, onClose }: Props) {
  const [state, setState] = useState<'form' | 'success'>('form');
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (!resource) return null;

  async function onSubmit(values: FormValues) {
    const res = await fetch('/api/resource-download', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:          values.name,
        email:         values.email,
        resourceTitle: resource!.title,
        resourceFile:  resource!.file,
      }),
    });

    if (!res.ok) {
      return;
    }

    // Trigger download via hidden anchor
    if (downloadRef.current) {
      downloadRef.current.click();
    }

    setState('success');
    reset();
  }

  function handleClose() {
    setState('form');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md border border-white/10 bg-montana-surface/95 backdrop-blur-md p-8 shadow-2xl">
        {/* Hidden download anchor */}
        <a
          ref={downloadRef}
          href={resource.file}
          download={resource.filename}
          className="hidden"
          aria-hidden="true"
        />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-montana-muted hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {state === 'form' ? (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-montana-pink mb-2">Free Download</p>
              <h2 id="modal-title" className="font-display text-xl font-bold text-white leading-snug">
                {resource.title}
              </h2>
            </div>

            <p className="text-sm text-montana-muted mb-6">
              Enter your details to get instant access. We&apos;ll also send the download link to your inbox.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label htmlFor="dl-name" className="block text-xs font-bold uppercase tracking-widest text-montana-muted mb-1.5">
                  Full Name
                </label>
                <input
                  id="dl-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  {...register('name')}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/60 transition-colors"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-montana-pink">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="dl-email" className="block text-xs font-bold uppercase tracking-widest text-montana-muted mb-1.5">
                  Work Email
                </label>
                <input
                  id="dl-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  {...register('email')}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-montana-muted/50 focus:outline-none focus:border-montana-pink/60 transition-colors"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-montana-pink">{errors.email.message}</p>
                )}
              </div>

              <AnimatedButton
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Get Download</>
                )}
              </AnimatedButton>
            </form>

            <p className="mt-4 text-xs text-montana-muted/60 text-center">
              No spam. Handled under our{' '}
              <a href="/privacy" className="text-montana-pink hover:underline">Privacy Policy</a>.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-montana-pink/10 border border-montana-pink/20 mb-6">
              <CheckCircle className="h-8 w-8 text-montana-pink" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-3">Download Started</h2>
            <p className="text-sm text-montana-muted mb-2">
              <span className="text-white font-medium">{resource.title}</span> should be downloading now.
            </p>
            <p className="text-sm text-montana-muted mb-8">
              We&apos;ve also sent the download link to your inbox.
            </p>
            <AnimatedButton variant="outline" className="w-full" onClick={handleClose}>
              Close
            </AnimatedButton>
          </div>
        )}
      </div>
    </div>
  );
}
