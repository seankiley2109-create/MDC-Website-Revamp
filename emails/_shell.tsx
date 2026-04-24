import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------

export const C = {
  bg:        '#f4f4f5',
  card:      '#ffffff',
  dark:      '#0f0f0f',
  near:      '#18181b',
  muted:     '#3f3f46',
  subtle:    '#71717a',
  faint:     '#a1a1aa',
  accent:    '#f24567',
  border:    '#e4e4e7',
  fieldBg:   '#f9f9fa',
  fieldBdr:  '#e4e4e7',
};

// ---------------------------------------------------------------------------
// EmailShell — outer wrapper used by every template
// ---------------------------------------------------------------------------

interface ShellProps {
  title:    string;
  preview?: string;
  children: React.ReactNode;
}

export function EmailShell({ title, preview, children }: ShellProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={{ margin: 0, padding: 0, background: C.bg, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: C.near }}>
        <Section style={{ background: C.bg, padding: '40px 16px' }}>
          <Container style={{ maxWidth: '600px', width: '100%', background: C.card, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <Section style={{ background: C.dark, padding: '32px 40px', borderBottom: `3px solid ${C.accent}` }}>
              <Row>
                <Column>
                  <Text style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: C.accent }}>
                    Montana Data Company
                  </Text>
                  <Text style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#ffffff', lineHeight: '1.3' }}>
                    {title}
                  </Text>
                </Column>
                <Column style={{ width: '60px', verticalAlign: 'middle', textAlign: 'right' }}>
                  <div style={{ width: '48px', height: '48px', background: C.accent, borderRadius: '50%', display: 'inline-block', lineHeight: '48px', textAlign: 'center' }}>
                    <span style={{ fontSize: '22px', color: '#fff' }}>&#9632;</span>
                  </div>
                </Column>
              </Row>
            </Section>

            {/* Body */}
            <Section style={{ padding: '40px' }}>
              {children}
            </Section>

            {/* Footer */}
            <Section style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center' }}>
              <Text style={{ margin: '0 0 4px', fontSize: '12px', color: C.subtle, fontWeight: 600 }}>Montana Data Company</Text>
              <Text style={{ margin: '0 0 4px', fontSize: '12px', color: C.faint }}>+27 (0)87 188 3843 &nbsp;|&nbsp; support@montanadc.com</Text>
              <Text style={{ margin: '8px 0 0', fontSize: '11px', color: C.faint }}>
                This communication is confidential and handled in accordance with POPIA.
              </Text>
            </Section>

          </Container>
        </Section>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// FieldRow — label/value pair inside a DataTable
// ---------------------------------------------------------------------------

interface FieldRowProps {
  label:    string;
  children: React.ReactNode;
}

export function FieldRow({ label, children }: FieldRowProps) {
  return (
    <Row>
      <Column style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', width: '160px', verticalAlign: 'top' }}>
        {label}
      </Column>
      <Column style={{ padding: '10px 12px', fontSize: '14px', color: C.near, verticalAlign: 'top' }}>
        {children}
      </Column>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// DataTable — zebra-stripe container wrapping FieldRows
// ---------------------------------------------------------------------------

interface DataTableProps {
  children: React.ReactNode;
  style?:   React.CSSProperties;
}

export function DataTable({ children, style }: DataTableProps) {
  return (
    <Section style={{ background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '24px', ...style }}>
      {children}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Badge — inline pill for risk / priority / category labels
// ---------------------------------------------------------------------------

const BADGE_COLORS = {
  red:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  pink:  { bg: '#fff1f3', text: '#f24567', border: '#fecdd3' },
} as const;

type BadgeColor = keyof typeof BADGE_COLORS;

interface BadgeProps {
  label: string;
  color: BadgeColor | string;
}

export function Badge({ label, color }: BadgeProps) {
  const c = BADGE_COLORS[color as BadgeColor] ?? BADGE_COLORS.pink;
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CTAButton
// ---------------------------------------------------------------------------

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
}

export function CTAButton({ href, children }: CTAButtonProps) {
  return (
    <Link href={href} style={{ display: 'inline-block', padding: '12px 28px', background: C.accent, color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '4px' }}>
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

export function Divider() {
  return <Hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '28px 0' }} />;
}

// ---------------------------------------------------------------------------
// SectionHeading
// ---------------------------------------------------------------------------

interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Text style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: C.near, borderLeft: `3px solid ${C.accent}`, paddingLeft: '10px' }}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// NumberedStepList — used in POS / checkout "what happens next"
// ---------------------------------------------------------------------------

interface NumberedStepListProps {
  steps: string[];
}

export function NumberedStepList({ steps }: NumberedStepListProps) {
  return (
    <Section style={{ marginBottom: '28px' }}>
      {steps.map((step, i) => (
        <Row key={i}>
          <Column style={{ padding: '8px 12px 8px 0', verticalAlign: 'top', width: '32px' }}>
            <div style={{ width: '28px', height: '28px', background: C.accent, borderRadius: '50%', textAlign: 'center', lineHeight: '28px', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              {i + 1}
            </div>
          </Column>
          <Column style={{ padding: '8px 0', fontSize: '14px', color: C.muted, verticalAlign: 'top', lineHeight: '1.6' }}>
            {step}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// ServiceTable — used in POS + checkout emails
// ---------------------------------------------------------------------------

type ServiceTableVariant = 'accent' | 'dark';

export interface ServiceLine {
  name:      string;
  plan?:     string;
  total:     string;
  quantity?: number;
  unitPrice?: string;
}

interface ServiceTableProps {
  lines:          ServiceLine[];
  showQty?:       boolean;
  showUnitPrice?: boolean;
  showGrandTotal?: string;
  headerColor:    ServiceTableVariant;
}

export function ServiceTable({ lines, showQty, showUnitPrice, showGrandTotal, headerColor }: ServiceTableProps) {
  const hdrBg = headerColor === 'accent' ? C.accent : C.near;
  const thStyle: React.CSSProperties = { padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' };

  return (
    <Section style={{ background: C.fieldBg, border: `1px solid ${C.fieldBdr}`, borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
      <Row style={{ background: hdrBg }}>
        <Column style={{ ...thStyle, textAlign: 'left' }}>Service</Column>
        {lines[0]?.plan !== undefined && <Column style={{ ...thStyle, textAlign: 'left' }}>Plan</Column>}
        {showQty && <Column style={{ ...thStyle, textAlign: 'center' }}>Qty</Column>}
        {showUnitPrice && <Column style={{ ...thStyle, textAlign: 'right' }}>Unit Price</Column>}
        <Column style={{ ...thStyle, textAlign: 'right' }}>{showUnitPrice ? 'Total' : 'Pricing'}</Column>
      </Row>
      {lines.map((l, i) => (
        <Row key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
          <Column style={{ padding: '10px 12px', fontSize: '14px', color: C.near }}>{l.name}</Column>
          {l.plan !== undefined && <Column style={{ padding: '10px 12px', fontSize: '14px', color: C.muted }}>{l.plan}</Column>}
          {showQty && <Column style={{ padding: '10px 12px', fontSize: '14px', color: C.muted, textAlign: 'center' }}>{l.quantity}</Column>}
          {showUnitPrice && l.unitPrice && <Column style={{ padding: '10px 12px', fontSize: '14px', color: C.muted, textAlign: 'right' }}>{l.unitPrice}</Column>}
          <Column style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: C.accent, textAlign: 'right' }}>{l.total}</Column>
        </Row>
      ))}
      {showGrandTotal && (
        <Row style={{ background: C.bg }}>
          <Column colSpan={showUnitPrice ? 3 : (lines[0]?.plan !== undefined ? 2 : 1)} style={{ padding: '12px', fontSize: '13px', fontWeight: 700, color: C.near, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Grand Total
          </Column>
          <Column style={{ padding: '12px', fontSize: '15px', fontWeight: 700, color: C.accent, textAlign: 'right' }}>
            {showGrandTotal}
          </Column>
        </Row>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// ScoreCards — three stat boxes used in assessment emails
// ---------------------------------------------------------------------------

interface ScoreCardsProps {
  compliantLabel: string;
  compliant:      number;
  partial:        number;
  criticalGaps:   number;
}

export function ScoreCards({ compliantLabel, compliant, partial, criticalGaps }: ScoreCardsProps) {
  return (
    <Row style={{ marginBottom: '24px' }}>
      <Column style={{ padding: '0 8px 0 0', width: '33%', verticalAlign: 'top' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>{compliant}</Text>
          <Text style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>{compliantLabel}</Text>
        </div>
      </Column>
      <Column style={{ padding: '0 4px', width: '33%', verticalAlign: 'top' }}>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#d97706' }}>{partial}</Text>
          <Text style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Partial</Text>
        </div>
      </Column>
      <Column style={{ padding: '0 0 0 8px', width: '33%', verticalAlign: 'top' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{criticalGaps}</Text>
          <Text style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '1px' }}>Critical Gaps</Text>
        </div>
      </Column>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Shared date formatter
// ---------------------------------------------------------------------------

export function formatZADate(): string {
  return new Date().toLocaleString('en-ZA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone:  'Africa/Johannesburg',
  });
}
