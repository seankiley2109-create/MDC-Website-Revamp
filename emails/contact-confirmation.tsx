import * as React from 'react';

export const PreviewProps: ContactEmailProps = {
  name:        'Jane Smith',
  email:       'jane@acme.co.za',
  company:     'Acme Corp',
  enquiryType: 'enterprise-backup',
  message:     'We are looking to migrate 50TB of archival data to a resilient cloud backup solution before end of Q3.',
};
import { Link, Section, Text } from 'react-email';
import {
  Badge,
  C,
  CTAButton,
  DataTable,
  Divider,
  EmailShell,
  FieldRow,
  SectionHeading,
  formatZADate,
} from './_shell';

// ---------------------------------------------------------------------------
// Shared types (mirror lib/email.ts to keep emails/ self-contained for preview)
// ---------------------------------------------------------------------------

export type EnquiryType =
  | 'enterprise-backup'
  | 'archiving'
  | 'quantum'
  | 'guardium'
  | 'existing-client'
  | 'partnership'
  | 'compliance'
  | 'general';

export interface ContactEmailProps {
  name:        string;
  email:       string;
  company:     string;
  enquiryType: EnquiryType;
  message:     string;
}

const enquiryLabels: Record<EnquiryType, string> = {
  'enterprise-backup': 'Enterprise Backup',
  'archiving':         'Archiving & Lifecycle',
  'quantum':           'Quantum Security (PQC)',
  'guardium':          'IBM Guardium',
  'existing-client':   'Existing Client Support',
  'partnership':       'Channel Partnership',
  'compliance':        'POPIA / Compliance Consulting',
  'general':           'General Enquiry',
};

// ===========================================================================
// ContactStaffEmail — internal notification sent to staff
// ===========================================================================

export function ContactStaffEmail(p: ContactEmailProps) {
  return (
    <EmailShell title="New Website Enquiry" preview={`New enquiry from ${p.name} at ${p.company}`}>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: C.muted }}>
        A new enquiry has been submitted through the Montana Data Company website.
      </Text>

      <SectionHeading>Enquiry Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.email}`} style={{ color: C.accent }}>{p.email}</Link>
        </FieldRow>
        <FieldRow label="Company">{p.company}</FieldRow>
        <FieldRow label="Type">{enquiryLabels[p.enquiryType] ?? p.enquiryType}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <SectionHeading>Message</SectionHeading>
      <div style={{ background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', padding: '16px 20px', fontSize: '14px', color: C.muted, lineHeight: '1.7', marginBottom: '28px', whiteSpace: 'pre-wrap' }}>
        {p.message}
      </div>

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.email}?subject=Re: Your Montana Data Company Enquiry`}>
          Reply to {p.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// ContactAutoEmail — confirmation sent to the lead
// ===========================================================================

export default function ContactAutoEmail(p: ContactEmailProps) {
  return (
    <EmailShell title="We've Received Your Enquiry" preview="Thank you for reaching out — we'll respond within one business day.">
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Thank you for reaching out to Montana Data Company. We have received your enquiry and a member of our advisory team will respond within <strong>one business day</strong>.
      </Text>

      <SectionHeading>Your Submission</SectionHeading>
      <DataTable>
        <FieldRow label="Enquiry Type">{enquiryLabels[p.enquiryType] ?? p.enquiryType}</FieldRow>
        <FieldRow label="Company">{p.company}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <Text style={{ margin: '0 0 8px', fontSize: '14px', color: C.muted, fontStyle: 'italic' }}>
        &ldquo;{p.message}&rdquo;
      </Text>

      <Divider />

      <SectionHeading>While You Wait</SectionHeading>
      <Text style={{ margin: '0 0 20px', fontSize: '14px', color: C.subtle }}>
        Explore how Montana Data Company can protect your organisation:
      </Text>

      <Section style={{ marginBottom: '28px' }}>
        <Link href="https://montanadc.com/pos" style={{ display: 'block', padding: '16px', background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', textDecoration: 'none', textAlign: 'center', marginBottom: '8px' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: C.near }}>Build Your Solution</Text>
          <Text style={{ margin: 0, fontSize: '12px', color: C.subtle }}>Interactive configurator</Text>
        </Link>
        <Link href="https://montanadc.com/assessments" style={{ display: 'block', padding: '16px', background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', textDecoration: 'none', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: C.near }}>Free Risk Assessment</Text>
          <Text style={{ margin: 0, fontSize: '12px', color: C.subtle }}>POPIA &amp; Security checks</Text>
        </Link>
      </Section>

      <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
        If your enquiry is urgent, please call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>.
      </Text>
    </EmailShell>
  );
}

// Re-export Badge for preview storybook use
export { Badge };
