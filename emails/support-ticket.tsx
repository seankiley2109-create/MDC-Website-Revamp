import * as React from 'react';

export const PreviewProps: SupportTicketEmailProps = {
  name:     'Jane Smith',
  email:    'jane@acme.co.za',
  company:  'Acme Corp',
  subject:  'Backup agent not connecting to vault',
  category: 'technical',
  priority: 'high',
  message:  'Our backup agent on the Johannesburg node has been failing since Tuesday. Logs show a TLS handshake timeout when reaching the vault endpoint.',
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
// Types (mirror lib/email.ts for self-contained preview)
// ---------------------------------------------------------------------------

export type SupportCategory = 'technical' | 'billing' | 'compliance' | 'general';
export type SupportPriority = 'low' | 'normal' | 'high' | 'critical';

export interface SupportTicketEmailProps {
  name:     string;
  email:    string;
  company:  string;
  subject:  string;
  category: SupportCategory;
  priority: SupportPriority;
  message:  string;
}

const categoryLabels: Record<SupportCategory, string> = {
  technical:  'Technical Issue',
  billing:    'Billing',
  compliance: 'Compliance & POPIA',
  general:    'General',
};

const priorityColors: Record<SupportPriority, string> = {
  low:      'green',
  normal:   'pink',
  high:     'amber',
  critical: 'red',
};

// ===========================================================================
// SupportStaffEmail — internal notification sent to staff
// ===========================================================================

export function SupportStaffEmail(p: SupportTicketEmailProps) {
  const isCompliance = p.category === 'compliance';

  return (
    <EmailShell title={`Support Ticket: ${p.subject}`} preview={`[${p.priority.toUpperCase()}] ${p.subject} — ${p.name}`}>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: C.muted }}>
        A new support ticket has been submitted through the Montana Data Company portal.
      </Text>

      {isCompliance && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '14px 20px', marginBottom: '24px', fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
          ⚠️ This ticket may contain PII — handle in accordance with POPIA.
        </div>
      )}

      <SectionHeading>Ticket Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.email}`} style={{ color: C.accent }}>{p.email}</Link>
        </FieldRow>
        <FieldRow label="Company">{p.company}</FieldRow>
        <FieldRow label="Subject">{p.subject}</FieldRow>
        <FieldRow label="Category">
          <Badge label={categoryLabels[p.category]} color={p.category === 'technical' ? 'pink' : 'amber'} />
        </FieldRow>
        <FieldRow label="Priority">
          <Badge label={p.priority.charAt(0).toUpperCase() + p.priority.slice(1)} color={priorityColors[p.priority]} />
        </FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <SectionHeading>Message</SectionHeading>
      <div style={{ background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', padding: '16px 20px', fontSize: '14px', color: C.muted, lineHeight: '1.7', marginBottom: '28px', whiteSpace: 'pre-wrap' }}>
        {p.message}
      </div>

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.email}?subject=Re: ${encodeURIComponent(p.subject)}`}>
          Reply to {p.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// SupportAutoEmail — confirmation sent to the submitter (no PII echoed back)
// ===========================================================================

export default function SupportAutoEmail(p: SupportTicketEmailProps) {
  return (
    <EmailShell title="Support Ticket Received" preview="We've received your ticket and will respond within one business day.">
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Thank you for contacting Montana Data Company. We have received your support ticket and will respond within <strong>one business day</strong>.
      </Text>

      <SectionHeading>Your Ticket</SectionHeading>
      <DataTable>
        <FieldRow label="Subject">{p.subject}</FieldRow>
        <FieldRow label="Category">{categoryLabels[p.category]}</FieldRow>
        <FieldRow label="Priority">{p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <Divider />
      <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
        If your issue is urgent, please call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>.
      </Text>
    </EmailShell>
  );
}
