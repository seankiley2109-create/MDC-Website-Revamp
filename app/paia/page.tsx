import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Download, Shield, Scale, ClipboardList } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export const metadata: Metadata = {
  title: 'PAIA Manual & Forms',
  description: 'Montana Data Company PAIA Section 51 Manual and request forms — your right of access to information under the Promotion of Access to Information Act.',
  robots: { index: false, follow: false },
};

const documents = [
  {
    icon:        FileText,
    label:       'Document 1 of 3',
    title:       'Section 51 PAIA Manual',
    description: 'Montana Data Company\'s manual compiled in terms of Section 51 of the Promotion of Access to Information Act. Describes the categories of records held, the Information Officer\'s details, and the procedure for requesting access.',
    file:        '/legal/paia-manual.pdf',
    filename:    'Montana-PAIA-Manual.pdf',
  },
  {
    icon:        ClipboardList,
    label:       'Document 2 of 3',
    title:       'Form 2 — Request for Access to Record',
    description: 'Use this form to submit a formal request for access to a record held by Montana Data Company, as prescribed by Regulation 7 of the PAIA Regulations.',
    file:        '/legal/paia-form-request-for-access.pdf',
    filename:    'PAIA-Form-2-Request-for-Access.pdf',
  },
  {
    icon:        Scale,
    label:       'Document 3 of 3',
    title:       'Form 3 — Outcome of Request & Fees Payable',
    description: 'This form is used to communicate the outcome of a PAIA access request and any applicable fees, as prescribed by Regulation 8 of the PAIA Regulations.',
    file:        '/legal/paia-form-outcome-and-fees.pdf',
    filename:    'PAIA-Form-3-Outcome-and-Fees.pdf',
  },
];

export default function PAIAPage() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6">

        {/* Header */}
        <div className="py-16 md:py-20">
          <div className="inline-flex items-center border border-white/10 bg-montana-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-widest text-montana-muted uppercase mb-8">
            <span className="flex h-2 w-2 bg-montana-pink mr-3 shadow-[0_0_8px_#F24567]" />
            Legal
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            PAIA Manual &amp; Forms
          </h1>
          <p className="text-montana-muted max-w-2xl leading-relaxed">
            In terms of the Promotion of Access to Information Act 2 of 2000 (as amended), Montana Data Company is required to compile and make available a Section 51 Manual describing the records we hold and the process for requesting access to them.
          </p>
        </div>

        {/* What is PAIA */}
        <SpotlightCard customSize className="p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-montana-pink/10 border border-montana-pink/20">
              <Shield className="h-5 w-5 text-montana-pink" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white mb-2">Your Right of Access</h2>
              <p className="text-sm text-montana-muted leading-relaxed">
                PAIA gives every person the right to access records held by private bodies (like Montana Data Company) where that access is required for the exercise or protection of any right. Requests must be submitted using the prescribed Form 2 and may be subject to a request fee and access fee as set out in the PAIA Regulations.
              </p>
              <p className="text-sm text-montana-muted leading-relaxed mt-3">
                Requests for access to personal information held about you may also be submitted under POPIA directly to our Information Officer at{' '}
                <a href="mailto:info@montanadc.com" className="text-montana-pink hover:underline">info@montanadc.com</a>.
              </p>
            </div>
          </div>
        </SpotlightCard>

        {/* Documents */}
        <div className="space-y-4 mb-8">
          {documents.map(({ icon: Icon, label, title, description, file, filename }) => (
            <SpotlightCard customSize key={file} className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-white/5 border border-white/10">
                  <Icon className="h-5 w-5 text-montana-pink" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-montana-muted/60 mb-1">{label}</p>
                  <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-montana-muted leading-relaxed mb-5">{description}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={file} target="_blank" rel="noopener noreferrer">
                      <AnimatedButton variant="primary">
                        <FileText className="h-4 w-4 mr-2" />
                        View PDF
                      </AnimatedButton>
                    </a>
                    <a href={file} download={filename}>
                      <AnimatedButton variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </AnimatedButton>
                    </a>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>

        {/* Information Officer contact */}
        <SpotlightCard customSize className="p-8">
          <h2 className="font-display font-bold text-white mb-4">Information Officer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-montana-muted">
            <div className="space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Submit Requests To</p>
              <p>The Information Officer</p>
              <p>Montana Data Company (Pty) Ltd</p>
              <a href="mailto:info@montanadc.com" className="text-montana-pink hover:underline block">info@montanadc.com</a>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Postal Address</p>
              <address className="not-italic leading-relaxed">
                Suite 126, First Floor<br />
                Willowbridge Centre<br />
                Carl Cronje Drive<br />
                Tyger Valley, 7530
              </address>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 mt-6 flex flex-col sm:flex-row gap-4">
            <Link href="/privacy" className="text-sm text-montana-pink hover:underline">Privacy Statement</Link>
            <Link href="/terms" className="text-sm text-montana-pink hover:underline">Terms &amp; Conditions</Link>
            <Link href="/contact" className="text-sm text-montana-muted hover:text-white transition-colors">Contact Us</Link>
          </div>
        </SpotlightCard>

      </div>
    </div>
  );
}
