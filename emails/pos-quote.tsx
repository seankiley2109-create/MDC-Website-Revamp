import * as React from 'react';

export const PreviewProps: POSEmailProps = {
  contact:     { name: 'Jane Smith', email: 'jane@acme.co.za', company: 'Acme Corp', notes: 'Prefer annual billing.' },
  services:    ['enterprise-backup', 'guardium'],
  plans:       { 'enterprise-backup': 'professional', guardium: 'standard' },
  environment: { dataSize: '10TB', cloudProvider: 'AWS', retentionPeriod: '7 years' },
  resolvedLines: [
    { serviceId: 'enterprise-backup', serviceName: 'Enterprise Backup', planName: 'Professional', price: 'R 4 500 / mo' },
    { serviceId: 'guardium', serviceName: 'IBM Guardium', planName: 'Standard', price: 'R 3 200 / mo' },
  ],
};
import { Link, Section, Text } from 'react-email';
import {
  C,
  CTAButton,
  DataTable,
  Divider,
  EmailShell,
  FieldRow,
  NumberedStepList,
  SectionHeading,
  ServiceLine,
  ServiceTable,
  formatZADate,
} from './_shell';

// ---------------------------------------------------------------------------
// Types (mirror lib/email.ts for self-contained preview)
// ---------------------------------------------------------------------------

export interface POSServicePlan {
  serviceId:   string;
  serviceName: string;
  planName:    string;
  price:       string;
}

export interface POSEmailProps {
  contact:      { name: string; email: string; company: string; notes: string };
  services:     string[];
  plans:        Record<string, string>;
  environment:  Record<string, string>;
  resolvedLines: POSServicePlan[];
}

const NEXT_STEPS_CONFIRM = [
  'A senior Montana Data engineer will review your configuration and prepare a tailored proposal.',
  'We will contact you within one business day to schedule a discovery call.',
  'You will receive a formal quote and project timeline.',
];

const NEXT_STEPS_QUOTE = [
  'A Montana specialist will review your selected solution and prepare a tailored proposal.',
  'We will contact you within 1 business day to discuss your requirements.',
  'You will receive a formal quote outlining pricing, timelines, and implementation steps.',
];

function resolvedToServiceLines(lines: POSServicePlan[]): ServiceLine[] {
  return lines.map(l => ({ name: l.serviceName, plan: l.planName, total: l.price }));
}

function solutionName(p: POSEmailProps): string {
  if (p.resolvedLines.length === 1) return p.resolvedLines[0].serviceName;
  return `${p.resolvedLines[0].serviceName} + ${p.resolvedLines.length - 1} more`;
}

// ===========================================================================
// POSStaffEmail — internal notification sent to staff
// ===========================================================================

export function POSStaffEmail(p: POSEmailProps) {
  const envRows = Object.entries(p.environment).filter(([, v]) => v);

  return (
    <EmailShell title="New Solution Request" preview={`Solution request from ${p.contact.name} at ${p.contact.company}`}>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: C.muted }}>
        A new solution request has been submitted through the Build Your Solution configurator.
      </Text>

      <SectionHeading>Contact Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.contact.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.contact.email}`} style={{ color: C.accent }}>{p.contact.email}</Link>
        </FieldRow>
        <FieldRow label="Company">{p.contact.company}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <SectionHeading>Configured Services</SectionHeading>
      <ServiceTable
        lines={resolvedToServiceLines(p.resolvedLines)}
        headerColor="accent"
      />

      {envRows.length > 0 && (
        <>
          <SectionHeading>Environment Details</SectionHeading>
          <DataTable>
            {envRows.map(([k, v]) => (
              <FieldRow key={k} label={k.replace(/([A-Z])/g, ' $1').trim()}>{v}</FieldRow>
            ))}
          </DataTable>
        </>
      )}

      {p.contact.notes && (
        <>
          <SectionHeading>Additional Notes</SectionHeading>
          <div style={{ background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', padding: '16px 20px', fontSize: '14px', color: C.muted, lineHeight: '1.7', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
            {p.contact.notes}
          </div>
        </>
      )}

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.contact.email}?subject=Your Montana Data Company Solution Request`}>
          Contact {p.contact.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// POSAutoEmail — confirmation sent to the lead
// ===========================================================================

export function POSAutoEmail(p: POSEmailProps) {
  return (
    <EmailShell title="Your Solution Request is Confirmed" preview="We've received your configuration — a senior engineer will be in touch.">
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.contact.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Thank you for configuring your solution with Montana Data Company. We have received your request and a senior engineer will contact you to review the details and finalise your setup.
      </Text>

      <SectionHeading>Your Configured Package</SectionHeading>
      <ServiceTable
        lines={resolvedToServiceLines(p.resolvedLines)}
        headerColor="dark"
      />

      <SectionHeading>What Happens Next</SectionHeading>
      <NumberedStepList steps={NEXT_STEPS_CONFIRM} />

      <Divider />
      <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
        Questions? Contact us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>{' '}
        or reply to this email.
      </Text>
    </EmailShell>
  );
}

// ===========================================================================
// POSQuoteSummaryEmail — quote summary sent after CRM lead creation
// ===========================================================================

export default function POSQuoteSummaryEmail(p: POSEmailProps) {
  const name = solutionName(p);

  return (
    <EmailShell title={`Your Montana Data Solution Summary — ${name}`} preview={`Your solution summary for ${name}`}>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.contact.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Here is a summary of the Montana Data solution you configured. A Montana specialist will review your requirements and contact you within <strong>1 business day</strong>.
      </Text>

      <SectionHeading>Solution: {name}</SectionHeading>
      <ServiceTable
        lines={resolvedToServiceLines(p.resolvedLines)}
        headerColor="dark"
      />

      <SectionHeading>Next Steps</SectionHeading>
      <NumberedStepList steps={NEXT_STEPS_QUOTE} />

      <Divider />
      <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
        Questions? Call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>{' '}
        or reply to this email.
      </Text>
    </EmailShell>
  );
}
