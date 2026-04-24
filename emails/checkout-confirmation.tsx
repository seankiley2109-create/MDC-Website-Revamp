import * as React from 'react';

export const PreviewProps: CheckoutEmailProps = {
  customer:     { name: 'Jane Smith', email: 'jane@acme.co.za', company: 'Acme Corp' },
  cart:         [
    { name: 'Enterprise Backup — Professional', quantity: 1, unit_price: 4500,  line_total: 4500 },
    { name: 'IBM Guardium — Standard',          quantity: 1, unit_price: 3200,  line_total: 3200 },
  ],
  totalZAR:     7700,
  contractTerm: 'monthly',
  reference:    'MDC-2026-00142',
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

export interface CheckoutLineItem {
  name:       string;
  quantity:   number;
  unit_price: number;
  line_total: number;
}

export interface CheckoutEmailProps {
  customer:     { name: string; email: string; company: string };
  cart:         CheckoutLineItem[];
  totalZAR:     number;
  contractTerm: 'monthly' | 'yearly';
  reference:    string;
}

const NEXT_STEPS = [
  'Our engineering team will provision your services within one business day.',
  'You will receive login credentials or onboarding instructions via email.',
  'A dedicated Montana Data engineer is available to assist with setup.',
];

function fmtZAR(n: number) {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function cartToStaffLines(cart: CheckoutLineItem[]): ServiceLine[] {
  return cart.map(l => ({
    name:      l.name,
    quantity:  l.quantity,
    unitPrice: fmtZAR(l.unit_price),
    total:     fmtZAR(l.line_total),
  }));
}

function cartToAutoLines(cart: CheckoutLineItem[]): ServiceLine[] {
  return cart.map(l => ({
    name:     l.name,
    quantity: l.quantity,
    total:    fmtZAR(l.line_total),
  }));
}

// ===========================================================================
// CheckoutStaffEmail — sent to sales + support
// ===========================================================================

export function CheckoutStaffEmail(p: CheckoutEmailProps) {
  return (
    <EmailShell title="New Subscription Purchase" preview={`Purchase from ${p.customer.name} — ${fmtZAR(p.totalZAR)} — ${p.reference}`}>
      <Text style={{ margin: '0 0 24px', fontSize: '15px', color: C.muted }}>
        A new subscription purchase has been completed via Paystack.
      </Text>

      <SectionHeading>Customer Details</SectionHeading>
      <DataTable>
        <FieldRow label="Name">{p.customer.name}</FieldRow>
        <FieldRow label="Email">
          <Link href={`mailto:${p.customer.email}`} style={{ color: C.accent }}>{p.customer.email}</Link>
        </FieldRow>
        <FieldRow label="Company">{p.customer.company}</FieldRow>
        <FieldRow label="Contract Term">{p.contractTerm === 'yearly' ? 'Annual' : 'Monthly'}</FieldRow>
        <FieldRow label="Reference">{p.reference}</FieldRow>
        <FieldRow label="Submitted">{formatZADate()}</FieldRow>
      </DataTable>

      <SectionHeading>Purchased Services</SectionHeading>
      <ServiceTable
        lines={cartToStaffLines(p.cart)}
        showQty
        showUnitPrice
        showGrandTotal={fmtZAR(p.totalZAR)}
        headerColor="accent"
      />

      <Divider />
      <Section style={{ textAlign: 'center' }}>
        <CTAButton href={`mailto:${p.customer.email}?subject=${encodeURIComponent(`Your Montana Data Company Purchase — ${p.reference}`)}`}>
          Contact {p.customer.name}
        </CTAButton>
      </Section>
    </EmailShell>
  );
}

// ===========================================================================
// CheckoutAutoEmail — purchase confirmation sent to the customer
// ===========================================================================

export default function CheckoutAutoEmail(p: CheckoutEmailProps) {
  return (
    <EmailShell title="Purchase Confirmed — Montana Data Company" preview={`Payment confirmed — ${p.reference}`}>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>Hi {p.customer.name},</Text>
      <Text style={{ margin: '0 0 20px', fontSize: '15px', color: C.muted }}>
        Your payment has been confirmed. Welcome to Montana Data Company — your services are now being provisioned.
      </Text>

      <SectionHeading>Your Purchase</SectionHeading>
      <ServiceTable
        lines={cartToAutoLines(p.cart)}
        showQty
        headerColor="dark"
      />
      <DataTable>
        <FieldRow label="Grand Total">{fmtZAR(p.totalZAR)}</FieldRow>
        <FieldRow label="Billing Cycle">{p.contractTerm === 'yearly' ? 'Annual' : 'Monthly'}</FieldRow>
        <FieldRow label="Reference">{p.reference}</FieldRow>
      </DataTable>

      <SectionHeading>What Happens Next</SectionHeading>
      <NumberedStepList steps={NEXT_STEPS} />

      <Divider />
      <Text style={{ margin: 0, fontSize: '14px', color: C.subtle }}>
        Questions? Call us on{' '}
        <Link href="tel:+27871883843" style={{ color: C.accent }}>+27 (0)87 188 3843</Link>{' '}
        or reply to this email.
      </Text>
    </EmailShell>
  );
}
