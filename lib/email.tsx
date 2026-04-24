import { render } from 'react-email';
import { createElement } from 'react';
import { Resend } from 'resend';

import { ContactStaffEmail } from '@/emails/contact-confirmation';
import ContactAutoEmail from '@/emails/contact-confirmation';
import { POSStaffEmail, POSAutoEmail } from '@/emails/pos-quote';
import POSQuoteSummaryEmail from '@/emails/pos-quote';
import { AssessmentStaffEmail } from '@/emails/assessment-complete';
import AssessmentAutoEmail from '@/emails/assessment-complete';
import { SupportStaffEmail } from '@/emails/support-ticket';
import SupportAutoEmail from '@/emails/support-ticket';
import { CheckoutStaffEmail } from '@/emails/checkout-confirmation';
import CheckoutAutoEmail from '@/emails/checkout-confirmation';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

export const SUPPORT_EMAIL = 'support@montanadc.com';
export const SALES_EMAIL = 'sales@montanadc.com';
export const FROM_ADDRESS = 'Montana Data Company <hello@montanadc.com>';

// ---------------------------------------------------------------------------
// Types
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

export type AssessmentType = 'security' | 'popia';
export type RiskLevel = 'High Risk' | 'Moderate Risk' | 'Medium Risk' | 'Low Risk';

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  enquiryType: EnquiryType;
  message: string;
}

export interface POSServicePlan {
  serviceId: string;
  serviceName: string;
  planName: string;
  price: string;
}

export interface POSPayload {
  contact: { name: string; email: string; company: string; notes: string };
  services: string[];
  plans: Record<string, string>;
  environment: Record<string, string>;
  resolvedLines: POSServicePlan[];
}

export interface ConsultingPayload {
  name: string;
  email: string;
  company: string;
  phone?: string;
  serviceType: string;
  engagementModel?: string;
  teamSize?: string;
  timeline?: string;
  requirements?: string;
}

export interface AssessmentPayload {
  type: AssessmentType;
  lead: { name: string; email: string; company: string };
  answers: Record<number, number>;
  score: number;
  riskLevel: RiskLevel;
  fullyCompliant: number;
  partial: number;
  criticalGaps: number;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Support ticket types
// ---------------------------------------------------------------------------

export type SupportCategory = 'technical' | 'billing' | 'compliance' | 'general';

export type SupportPriority = 'low' | 'normal' | 'high' | 'critical';

export interface SupportTicketPayload {
  name:     string;
  email:    string;
  company:  string;
  subject:  string;
  category: SupportCategory;
  priority: SupportPriority;
  message:  string;
}

// ---------------------------------------------------------------------------
// Checkout confirmation types
// ---------------------------------------------------------------------------

export interface CheckoutLineItem {
  name:       string;
  quantity:   number;
  unit_price: number;
  line_total: number;
}

export interface CheckoutPayload {
  customer:     { name: string; email: string; company: string };
  cart:         CheckoutLineItem[];
  totalZAR:     number;
  contractTerm: 'monthly' | 'yearly';
  reference:    string;
}

// ---------------------------------------------------------------------------
// Staff recipient router
// ---------------------------------------------------------------------------

function resolveStaffRecipient(category: SupportCategory): string {
  return category === 'technical' ? SUPPORT_EMAIL : SALES_EMAIL;
}

// ===========================================================================
// Public send functions
// ===========================================================================

export async function sendContactEmails(p: ContactPayload): Promise<EmailResult> {
  try {
    const [staffHtml, autoHtml] = await Promise.all([
      render(createElement(ContactStaffEmail, p)),
      render(createElement(ContactAutoEmail, p)),
    ]);

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

    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.email,
        subject: `[Enquiry] ${enquiryLabels[p.enquiryType] ?? 'General'} — ${p.company}`,
        html: staffHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'We\'ve received your enquiry — Montana Data Company',
        html: autoHtml,
      }),
    ]);

    if (staff.error || auto.error) {
      console.error('[email] Contact email errors:', staff.error, auto.error);
      return { success: false, error: 'Failed to send one or more emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendContactEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}

export async function sendPOSEmails(p: POSPayload): Promise<EmailResult> {
  try {
    const [staffHtml, autoHtml] = await Promise.all([
      render(createElement(POSStaffEmail, p)),
      render(createElement(POSAutoEmail, p)),
    ]);

    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.contact.email,
        subject: `[Solution Request] ${p.contact.company} — ${p.resolvedLines.length} service(s)`,
        html: staffHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.contact.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'Your solution request is confirmed — Montana Data Company',
        html: autoHtml,
      }),
    ]);

    if (staff.error || auto.error) {
      console.error('[email] POS email errors:', staff.error, auto.error);
      return { success: false, error: 'Failed to send one or more emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendPOSEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}

export async function sendAssessmentEmails(p: AssessmentPayload): Promise<EmailResult> {
  const typeLabel = p.type === 'security' ? 'Backup & Security' : 'POPIA Compliance';
  try {
    const [staffHtml, autoHtml] = await Promise.all([
      render(createElement(AssessmentStaffEmail, p)),
      render(createElement(AssessmentAutoEmail, p)),
    ]);

    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.lead.email,
        subject: `[Assessment] ${typeLabel} — ${p.lead.company} — ${p.riskLevel}`,
        html: staffHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.lead.email],
        replyTo: SUPPORT_EMAIL,
        subject: `Your ${typeLabel} Assessment Results — Montana Data Company`,
        html: autoHtml,
      }),
    ]);

    if (staff.error || auto.error) {
      console.error('[email] Assessment email errors:', staff.error, auto.error);
      return { success: false, error: 'Failed to send one or more emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendAssessmentEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}

export async function sendSupportTicketEmails(p: SupportTicketPayload): Promise<EmailResult> {
  try {
    const staffRecipient = resolveStaffRecipient(p.category);

    const categoryLabels: Record<SupportCategory, string> = {
      technical:  'Technical Issue',
      billing:    'Billing',
      compliance: 'Compliance & POPIA',
      general:    'General',
    };

    const [staffHtml, autoHtml] = await Promise.all([
      render(createElement(SupportStaffEmail, p)),
      render(createElement(SupportAutoEmail, p)),
    ]);

    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [staffRecipient],
        replyTo: p.email,
        subject: `[Support] ${categoryLabels[p.category]} — ${p.subject}`,
        html:    staffHtml,
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.email],
        replyTo: staffRecipient,
        subject: 'Support ticket received — Montana Data Company',
        html:    autoHtml,
      }),
    ]);

    if (staff.error || auto.error) {
      console.error('[email] Support ticket email errors:', staff.error, auto.error);
      return { success: false, error: 'Failed to send one or more support emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendSupportTicketEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}

export async function sendCheckoutConfirmationEmails(p: CheckoutPayload): Promise<EmailResult> {
  try {
    const [staffHtml, autoHtml] = await Promise.all([
      render(createElement(CheckoutStaffEmail, p)),
      render(createElement(CheckoutAutoEmail, p)),
    ]);

    const staffSubject = `[Purchase] ${p.customer.company} — R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} — ${p.reference}`;

    const [toSales, toSupport, toUser] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SALES_EMAIL],
        replyTo: p.customer.email,
        subject: staffSubject,
        html:    staffHtml,
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SUPPORT_EMAIL],
        replyTo: p.customer.email,
        subject: staffSubject,
        html:    staffHtml,
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.customer.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'Your purchase is confirmed — Montana Data Company',
        html:    autoHtml,
      }),
    ]);

    if (toSales.error || toSupport.error || toUser.error) {
      console.error('[email] Checkout email errors:', toSales.error, toSupport.error, toUser.error);
      return { success: false, error: 'Failed to send one or more checkout emails.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendCheckoutConfirmationEmails error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}

export async function sendPOSQuoteSummary(
  payload: POSPayload,
  recipientEmail: string,
): Promise<EmailResult> {
  const solutionName =
    payload.resolvedLines.length === 1
      ? payload.resolvedLines[0].serviceName
      : `${payload.resolvedLines[0].serviceName} + ${payload.resolvedLines.length - 1} more`;

  try {
    const html = await render(createElement(POSQuoteSummaryEmail, payload));

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [recipientEmail],
      replyTo: SALES_EMAIL,
      subject: `Your Montana Data solution summary — ${solutionName}`,
      html,
    });

    if (result.error) {
      console.error('[email] sendPOSQuoteSummary error:', result.error);
      return { success: false, error: 'Failed to send quote summary email.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[email] sendPOSQuoteSummary error:', err);
    return { success: false, error: 'Email service unavailable.' };
  }
}
