import * as React from 'react';

export const PreviewProps: AssessmentEmailProps = {
  type:           'popia',
  lead:           { name: 'Jane Smith', email: 'jane@acme.co.za', company: 'Acme Corp' },
  answers:        { 1: 2, 2: 1, 3: 3 },
  score:          13,
  riskLevel:      'Moderate Risk',
  fullyCompliant: 6,
  partial:        5,
  criticalGaps:   2,
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
  ScoreCards,
  SectionHeading,
  formatZADate,
} from './_shell';

// ---------------------------------------------------------------------------
// Types (mirror lib/email.ts for self-contained preview)
// ---------------------------------------------------------------------------

export type AssessmentType = 'security' | 'popia';
export type RiskLevel = 'High Risk' | 'Moderate Risk' | 'Medium Risk' | 'Low Risk';

export interface AssessmentEmailProps {
  type:           AssessmentType;
  lead:           { name: string; email: string; company: string };
  answers:        Record<number, number>;
  score:          number;
  riskLevel:      RiskLevel;
  fullyCompliant: number;
  partial:        number;
  criticalGaps:   number;
}

function riskColor(level: RiskLevel): string {
  if (level === 'High Risk') return 'red';
  if (level === 'Moderate Risk' || level === 'Medium Risk') return 'amber';
  return 'green';
}

const nextStepsText: Record<RiskLevel, string> = {
  'High Risk':     'Your results indicate immediate action is required. Our team will prioritise your case and reach out within one business day.',
  'Moderate Risk': 'Your results indicate meaningful gaps that should be addressed. Our team will reach out with tailored recommendations.',
  'Medium Risk':   'Your results indicate meaningful gaps that should be addressed. Our team will reach out with tailored recommendations.',
  'Low Risk':      'Your posture is solid. Our team can help you optimise and maintain your position as threats and regulations evolve.',
};

// ===========================================================================
// AssessmentStaffEmail — internal notification sent to staff
// ===========================================================================

export function AssessmentStaffEmail(p: AssessmentEmailProps) {
  const typeLabel = p.type === 'security' ? 'Backup & Security' : 'POPIA Compliance';
  const color     = riskColor(p.riskLevel);

  return (
    <EmailShell title={`New ${typeLabel} Assessment`} preview={`${p.riskLevel} — ${p.lead.name} at ${p.lead.company}`}>
      <Text style={{ margin: '0 0 8px', fontSize: '15px', color: C.muted }}>
        A new <strong>{typeLabel}</strong> assessment has been completed.
      </Text>
      <div style={{ marginBottom: '24px' }}>
        <Badge label={p.riskLevel} color={color} />
      </div>

      <SectionHeading>Lead Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.lead.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.lead.email}`} style={{ color: C.accent }}>{p.lead.email}</Link>
        </FieldRow>
        <FieldRow label="Company">{p.lead.company}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <SectionHeading>Assessment Results</SectionHeading>
      <ScoreCards
        compliantLabel="Fully Compliant"
        compliant={p.fullyCompliant}
        partial={p.partial}
        criticalGaps={p.criticalGaps}
      />
      <DataTable>
        <FieldRow label="Total Score">{p.score} / 20</FieldRow>
        <FieldRow label="Risk Level">{p.riskLevel}</FieldRow>
      </DataTable>

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.lead.email}?subject=Your Montana Data Company ${typeLabel} Assessment Results`}>
          Contact {p.lead.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// AssessmentAutoEmail — results sent to the lead
// ===========================================================================

export default function AssessmentAutoEmail(p: AssessmentEmailProps) {
  const typeLabel   = p.type === 'security' ? 'Backup & Security' : 'POPIA Compliance';
  const color       = riskColor(p.riskLevel);
  const ctaHref     = p.type === 'security' ? 'https://montanadc.com/pos' : 'https://montanadc.com/contact';
  const ctaText     = p.type === 'security' ? 'Build Your Solution' : 'Get Your Compliance Roadmap';
  const compliantLbl = p.type === 'popia' ? 'Compliant' : 'Implemented';
  const disclaimer  = p.type === 'popia'
    ? 'True POPIA compliance requires a comprehensive 88-control assessment.'
    : 'A full resilience audit will provide detailed findings and a remediation roadmap.';

  return (
    <EmailShell title={`Your ${typeLabel} Assessment Results`} preview={`Score: ${p.score}/20 — ${p.riskLevel}`}>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.lead.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Thank you for completing the Montana Data Company <strong>{typeLabel} Assessment</strong>. Here is a summary of your results.
      </Text>

      <SectionHeading>Your Results</SectionHeading>
      <div style={{ textAlign: 'center', padding: '24px', background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', marginBottom: '24px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '48px', fontWeight: 700, color: C.near, lineHeight: '1' }}>
          {p.score}<span style={{ fontSize: '22px', color: C.faint }}> / 20</span>
        </Text>
        <div style={{ marginBottom: '12px' }}>
          <Badge label={p.riskLevel} color={color} />
        </div>
        <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
          {nextStepsText[p.riskLevel]}
        </Text>
      </div>

      <ScoreCards
        compliantLabel={compliantLbl}
        compliant={p.fullyCompliant}
        partial={p.partial}
        criticalGaps={p.criticalGaps}
      />

      <SectionHeading>Important Disclaimer</SectionHeading>
      <Text style={{ margin: '0 0 28px', fontSize: '13px', color: C.subtle, lineHeight: '1.6' }}>
        This snapshot covers 10 high-level areas. It is indicative only and does not constitute legal or regulatory advice. {disclaimer}
      </Text>

      <Divider />
      <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CTAButton href={ctaHref}>{ctaText}</CTAButton>
      </Section>
      <Text style={{ margin: 0, fontSize: '13px', color: C.subtle, textAlign: 'center' }}>
        Questions? Call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>{' '}
        or reply to this email.
      </Text>
    </EmailShell>
  );
}
