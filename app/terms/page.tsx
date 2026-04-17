import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Montana Data Company standard terms and conditions governing the use of our products, services, and website.',
  robots: { index: false, follow: false },
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-lg font-bold text-white mb-4 flex items-baseline gap-3">
        <span className="text-montana-pink font-mono text-sm">{number}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm text-montana-muted leading-relaxed pl-6">
        {children}
      </div>
    </section>
  );
}

function Sub({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="text-white/50 font-mono text-xs mr-2">{label}</span>
      {children}
    </p>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-montana-pink/70" />
      <span>{children}</span>
    </li>
  );
}

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-montana-muted">
            Montana Data Company (Pty) Ltd &mdash; standard terms governing use of our products and services.
          </p>
        </div>

        <GlassCard className="p-8 md:p-12 mb-8">

          <Section number="1" title="General">
            <Sub label="1.1">
              The information contained in this proposal (other than information that emanates from the Client) is proprietary and confidential to Montana Data Company (Pty) Ltd and/or its suppliers and sub-contractors.
            </Sub>
            <p className="text-white/60 mt-2 mb-1">Such information is made available to the Client subject to the condition that:</p>
            <ul className="space-y-2">
              <ListItem>
                It may not be disclosed to third parties other than the Client&apos;s employees or consultants who need to have access thereto for the purposes of evaluating Montana Data Company&apos;s response and negotiating any agreement that may arise from it.
              </ListItem>
              <ListItem>
                The Client and its employees and consultants may use the information only for such evaluation and negotiation purposes.
              </ListItem>
            </ul>
            <Sub label="1.2">Delivery is subject to all contractual obligations being met.</Sub>
            <Sub label="1.3">
              Our invoices are generated on the 25th of each month and payment is due by the end of the same month.
            </Sub>
            <Sub label="1.4">
              Rates of exchange can influence some of the costing and can only be confirmed on the day of the order.
            </Sub>
            <Sub label="1.5">Any items not mentioned in the pricing table are excluded.</Sub>
            <Sub label="1.6">Montana Data Company reserves the right to amend its pricing from time to time.</Sub>
          </Section>

          <Section number="2" title="Backup & Recovery / High-Speed Data Transfer">
            <p className="text-white/40 text-xs italic mb-3">Applies where these services form part of the engagement.</p>
            <Sub label="2.1">
              Technical Services will be invoiced from the date of installation regardless of whether the Client&apos;s environment, infrastructure upgrades or other activities performed by the Client or any third party are in place.
            </Sub>
            <Sub label="2.2">
              Setup and installation costs quoted are based on an estimated time. Any extra time required due to unforeseen circumstances will be communicated to the Client for approval.
            </Sub>
            <Sub label="2.3">Cloud Server and Desktop Backups are payable monthly in advance.</Sub>
            <Sub label="2.4">
              Database and File Server backups are paid on capacity utilised as recorded on the 25th of each month.
            </Sub>
            <Sub label="2.5">Network connectivity has been excluded.</Sub>
            <Sub label="2.6">Any migration or transformation costs are excluded.</Sub>
          </Section>

          <Section number="3" title="Governance Consulting / Training">
            <p className="text-white/40 text-xs italic mb-3">Applies where these services form part of the engagement.</p>
            <Sub label="3.1">
              Consulting services and Training will only be delivered on confirmation of receipt of payment.
            </Sub>
            <Sub label="3.2">
              For any cancellations within 48 hours of the scheduled delivery date/time, a credit note will be issued which can be redeemed against an alternative delivery date.
            </Sub>
          </Section>

          <div className="border-t border-white/5 pt-8 mt-8">
            <div className="flex items-start gap-3 p-4 border border-white/5 bg-white/[0.02]">
              <FileText className="h-4 w-4 text-montana-pink mt-0.5 shrink-0" />
              <p className="text-xs text-montana-muted leading-relaxed">
                If you have any queries regarding these terms and conditions, please{' '}
                <Link href="/contact" className="text-montana-pink hover:underline">contact us</Link>.
                These terms are provided as a general statement; specific engagements are governed by the signed proposal or service agreement.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-8 mt-8">
            <Link href="/privacy" className="text-sm text-montana-pink hover:underline">
              Privacy Statement
            </Link>
            <Link href="/paia" className="text-sm text-montana-pink hover:underline">
              PAIA Manual &amp; Forms
            </Link>
            <Link href="/contact" className="text-sm text-montana-muted hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}
