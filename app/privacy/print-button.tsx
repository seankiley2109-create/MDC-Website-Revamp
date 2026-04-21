'use client';

import { Download } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-white/10 bg-montana-surface/80 px-4 py-2 text-xs font-bold tracking-wider text-montana-muted uppercase hover:border-montana-pink/50 hover:text-white transition-all print:hidden"
    >
      <Download className="h-3.5 w-3.5 text-montana-pink" />
      Download Privacy Statement
    </button>
  );
}
