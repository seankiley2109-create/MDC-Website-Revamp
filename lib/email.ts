import { Resend } from 'resend';

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
  | 'ransomware'
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
// Shared HTML shell
// ---------------------------------------------------------------------------

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0f0f0f;padding:32px 40px;border-bottom:3px solid #f24567;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#f24567;">Montana Data Company</p>
                  <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</h1>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <div style="width:48px;height:48px;background:#f24567;border-radius:50%;display:inline-block;line-height:48px;text-align:center;">
                    <span style="font-size:22px;color:#fff;">&#9632;</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:40px;">${body}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f5;border-top:1px solid #e4e4e7;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#71717a;font-weight:600;">Montana Data Company</p>
            <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">+27 (0)87 188 3843 &nbsp;|&nbsp; support@montanadc.com</p>
            <p style="margin:8px 0 0;font-size:11px;color:#a1a1aa;">This communication is confidential and handled in accordance with POPIA.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function fieldRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:10px 12px;font-size:14px;color:#18181b;vertical-align:top;">${value}</td>
  </tr>`;
}

function dataTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">${rows}</table>`;
}

function badge(label: string, color: string): string {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    red:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    pink:  { bg: '#fff1f3', text: '#f24567', border: '#fecdd3' },
  };
  const c = colors[color] ?? colors.pink;
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${c.bg};color:${c.text};border:1px solid ${c.border};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${label}</span>`;
}

function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:#f24567;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;border-radius:4px;">${text}</a>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0;" />`;
}

function sectionHeading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#18181b;border-left:3px solid #f24567;padding-left:10px;">${text}</h2>`;
}

// ---------------------------------------------------------------------------
// Enquiry type label map
// ---------------------------------------------------------------------------

const enquiryLabels: Record<EnquiryType, string> = {
  'enterprise-backup': 'Enterprise Backup',
  'ransomware':           'Ransomware Protection',
  'archiving':         'Archiving & Lifecycle',
  'quantum':           'Quantum Security (PQC)',
  'guardium':          'IBM Guardium',
  'existing-client':   'Existing Client Support',
  'partnership':       'Channel Partnership',
  'compliance':        'POPIA / Compliance Consulting',
  'general':           'General Enquiry',
};

// ---------------------------------------------------------------------------
// Risk colour helper
// ---------------------------------------------------------------------------

function riskColor(level: RiskLevel): string {
  if (level === 'High Risk') return 'red';
  if (level === 'Moderate Risk' || level === 'Medium Risk') return 'amber';
  return 'green';
}

// ---------------------------------------------------------------------------
// Support ticket label / colour maps
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Staff recipient router
// ---------------------------------------------------------------------------

function resolveStaffRecipient(category: SupportCategory): string {
  return category === 'technical' ? SUPPORT_EMAIL : SALES_EMAIL;
}

// ===========================================================================
// CONTACT — Staff Notification
// ===========================================================================

function contactStaffHtml(p: ContactPayload): string {
  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new enquiry has been submitted through the Montana Data Company website.</p>

    ${sectionHeading('Enquiry Details')}
    ${dataTable(
      fieldRow('Name', p.name) +
      fieldRow('Email', `<a href="mailto:${p.email}" style="color:#f24567;">${p.email}</a>`) +
      fieldRow('Company', p.company) +
      fieldRow('Type', enquiryLabels[p.enquiryType] ?? p.enquiryType) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Message')}
    <div style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;padding:16px 20px;font-size:14px;color:#3f3f46;line-height:1.7;margin:0 0 28px;white-space:pre-wrap;">${p.message}</div>

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Reply to ' + p.name, `mailto:${p.email}?subject=Re: Your Montana Data Company Enquiry`)}</p>
  `;
  return shell('New Website Enquiry', body);
}

// ===========================================================================
// CONTACT — Auto-Responder
// ===========================================================================

function contactAutoHtml(p: ContactPayload): string {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Thank you for reaching out to Montana Data Company. We have received your enquiry and a member of our advisory team will respond within <strong>one business day</strong>.</p>

    ${sectionHeading('Your Submission')}
    ${dataTable(
      fieldRow('Enquiry Type', enquiryLabels[p.enquiryType] ?? p.enquiryType) +
      fieldRow('Company', p.company) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;font-style:italic;">"${p.message}"</p>

    ${divider()}
    ${sectionHeading('While You Wait')}
    <p style="margin:0 0 20px;font-size:14px;color:#71717a;">Explore how Montana Data Company can protect your organisation:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="padding:0 8px 0 0;width:50%;vertical-align:top;">
          <a href="https://montanadc.com/pos" style="display:block;padding:16px;background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;text-decoration:none;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#18181b;">Build Your Solution</p>
            <p style="margin:0;font-size:12px;color:#71717a;">Interactive configurator</p>
          </a>
        </td>
        <td style="padding:0 0 0 8px;width:50%;vertical-align:top;">
          <a href="https://montanadc.com/assessments" style="display:block;padding:16px;background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;text-decoration:none;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#18181b;">Free Risk Assessment</p>
            <p style="margin:0;font-size:12px;color:#71717a;">POPIA &amp; Security checks</p>
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#71717a;">If your enquiry is urgent, please call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a>.</p>
  `;
  return shell('We\'ve Received Your Enquiry', body);
}

// ===========================================================================
// POS — Staff Notification
// ===========================================================================

function posStaffHtml(p: POSPayload): string {
  const serviceLines = p.resolvedLines
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.serviceName}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;">${l.planName}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">${l.price}</td>
    </tr>`)
    .join('');

  const envRows = Object.entries(p.environment)
    .filter(([, v]) => v)
    .map(([k, v]) => fieldRow(k.replace(/([A-Z])/g, ' $1').trim(), v))
    .join('');

  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new solution request has been submitted through the Build Your Solution configurator.</p>

    ${sectionHeading('Contact Details')}
    ${dataTable(
      fieldRow('Name', p.contact.name) +
      fieldRow('Email', `<a href="mailto:${p.contact.email}" style="color:#f24567;">${p.contact.email}</a>`) +
      fieldRow('Company', p.contact.company) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Configured Services')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#f24567;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Plan</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Price</th>
      </tr>
      ${serviceLines}
    </table>

    ${envRows ? `${sectionHeading('Environment Details')}${dataTable(envRows)}` : ''}

    ${p.contact.notes ? `${sectionHeading('Additional Notes')}<div style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;padding:16px 20px;font-size:14px;color:#3f3f46;line-height:1.7;margin:0 0 24px;white-space:pre-wrap;">${p.contact.notes}</div>` : ''}

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Contact ' + p.contact.name, `mailto:${p.contact.email}?subject=Your Montana Data Company Solution Request`)}</p>
  `;
  return shell('New Solution Request', body);
}

// ===========================================================================
// POS — Auto-Responder
// ===========================================================================

function posAutoHtml(p: POSPayload): string {
  const serviceLines = p.resolvedLines
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.serviceName}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;">${l.planName}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">${l.price}</td>
    </tr>`)
    .join('');

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.contact.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Thank you for configuring your solution with Montana Data Company. We have received your request and a senior engineer will contact you to review the details and finalise your setup.</p>

    ${sectionHeading('Your Configured Package')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#18181b;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Plan</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Pricing</th>
      </tr>
      ${serviceLines}
    </table>

    ${sectionHeading('What Happens Next')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${['A senior Montana Data engineer will review your configuration and prepare a tailored proposal.',
         'We will contact you within one business day to schedule a discovery call.',
         'You will receive a formal quote and project timeline.']
        .map((step, i) => `<tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;width:32px;">
            <div style="width:28px;height:28px;background:#f24567;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">${i + 1}</div>
          </td>
          <td style="padding:8px 0;font-size:14px;color:#3f3f46;vertical-align:top;line-height:1.6;">${step}</td>
        </tr>`).join('')}
    </table>

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">Questions? Contact us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a> or reply to this email.</p>
  `;
  return shell('Your Solution Request is Confirmed', body);
}

// ===========================================================================
// ASSESSMENT — Staff Notification
// ===========================================================================

function assessmentStaffHtml(p: AssessmentPayload): string {
  const typeLabel = p.type === 'security' ? 'Backup & Security' : 'POPIA Compliance';
  const color = riskColor(p.riskLevel);

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;">A new <strong>${typeLabel}</strong> assessment has been completed.</p>
    <p style="margin:0 0 24px;">${badge(p.riskLevel, color)}</p>

    ${sectionHeading('Lead Details')}
    ${dataTable(
      fieldRow('Name', p.lead.name) +
      fieldRow('Email', `<a href="mailto:${p.lead.email}" style="color:#f24567;">${p.lead.email}</a>`) +
      fieldRow('Company', p.lead.company) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Assessment Results')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:0 8px 0 0;width:33%;vertical-align:top;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#16a34a;">${p.fullyCompliant}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Fully Compliant</p>
          </div>
        </td>
        <td style="padding:0 4px;width:33%;vertical-align:top;">
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#d97706;">${p.partial}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Partial / Gaps</p>
          </div>
        </td>
        <td style="padding:0 0 0 8px;width:33%;vertical-align:top;">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#dc2626;">${p.criticalGaps}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Critical Gaps</p>
          </div>
        </td>
      </tr>
    </table>
    ${dataTable(fieldRow('Total Score', `${p.score} / 20`) + fieldRow('Risk Level', p.riskLevel))}

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Contact ' + p.lead.name, `mailto:${p.lead.email}?subject=Your Montana Data Company ${typeLabel} Assessment Results`)}</p>
  `;
  return shell(`New ${typeLabel} Assessment`, body);
}

// ===========================================================================
// ASSESSMENT — Auto-Responder
// ===========================================================================

function assessmentAutoHtml(p: AssessmentPayload): string {
  const typeLabel = p.type === 'security' ? 'Backup & Security' : 'POPIA Compliance';
  const color = riskColor(p.riskLevel);

  const nextStepsText: Record<RiskLevel, string> = {
    'High Risk':      'Your results indicate immediate action is required. Our team will prioritise your case and reach out within one business day.',
    'Moderate Risk':  'Your results indicate meaningful gaps that should be addressed. Our team will reach out with tailored recommendations.',
    'Medium Risk':    'Your results indicate meaningful gaps that should be addressed. Our team will reach out with tailored recommendations.',
    'Low Risk':       'Your posture is solid. Our team can help you optimise and maintain your position as threats and regulations evolve.',
  };

  const ctaHref = p.type === 'security'
    ? 'https://montanadc.com/pos'
    : 'https://montanadc.com/contact';
  const ctaText = p.type === 'security' ? 'Build Your Solution' : 'Get Your Compliance Roadmap';

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.lead.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Thank you for completing the Montana Data Company <strong>${typeLabel} Assessment</strong>. Here is a summary of your results.</p>

    ${sectionHeading('Your Results')}
    <div style="text-align:center;padding:24px;background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:48px;font-weight:700;color:#18181b;line-height:1;">${p.score}<span style="font-size:22px;color:#a1a1aa;"> / 20</span></p>
      <p style="margin:0 0 12px;">${badge(p.riskLevel, color)}</p>
      <p style="margin:0;font-size:14px;color:#71717a;">${nextStepsText[p.riskLevel]}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td style="padding:0 8px 0 0;width:33%;vertical-align:top;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#16a34a;">${p.fullyCompliant}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">${p.type === 'popia' ? 'Compliant' : 'Implemented'}</p>
          </div>
        </td>
        <td style="padding:0 4px;width:33%;vertical-align:top;">
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#d97706;">${p.partial}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Partial</p>
          </div>
        </td>
        <td style="padding:0 0 0 8px;width:33%;vertical-align:top;">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#dc2626;">${p.criticalGaps}</p>
            <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Critical Gaps</p>
          </div>
        </td>
      </tr>
    </table>

    ${sectionHeading('Important Disclaimer')}
    <p style="margin:0 0 28px;font-size:13px;color:#71717a;line-height:1.6;">This snapshot covers 10 high-level areas. It is indicative only and does not constitute legal or regulatory advice. ${p.type === 'popia' ? 'True POPIA compliance requires a comprehensive 88-control assessment.' : 'A full resilience audit will provide detailed findings and a remediation roadmap.'}</p>

    ${divider()}
    <p style="margin:0 0 20px;text-align:center;">${ctaButton(ctaText, ctaHref)}</p>
    <p style="margin:0;font-size:13px;color:#71717a;text-align:center;">Questions? Call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a> or reply to this email.</p>
  `;
  return shell(`Your ${typeLabel} Assessment Results`, body);
}

// ===========================================================================
// SUPPORT TICKET — Staff Notification
// ===========================================================================

function supportStaffHtml(p: SupportTicketPayload): string {
  const popiaBanner = p.category === 'compliance'
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:14px 20px;margin:0 0 24px;font-size:13px;color:#92400e;font-weight:600;">
        ⚠️ This ticket may contain PII — handle in accordance with POPIA.
      </div>`
    : '';

  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new support ticket has been submitted through the Montana Data Company portal.</p>

    ${popiaBanner}

    ${sectionHeading('Ticket Details')}
    ${dataTable(
      fieldRow('Name',     p.name) +
      fieldRow('Email',    `<a href="mailto:${p.email}" style="color:#f24567;">${p.email}</a>`) +
      fieldRow('Company',  p.company) +
      fieldRow('Subject',  p.subject) +
      fieldRow('Category', badge(categoryLabels[p.category], p.category === 'technical' ? 'pink' : 'amber')) +
      fieldRow('Priority', badge(p.priority.charAt(0).toUpperCase() + p.priority.slice(1), priorityColors[p.priority])) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Message')}
    <div style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;padding:16px 20px;font-size:14px;color:#3f3f46;line-height:1.7;margin:0 0 28px;white-space:pre-wrap;">${p.message}</div>

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Reply to ' + p.name, `mailto:${p.email}?subject=Re: ${encodeURIComponent(p.subject)}`)}</p>
  `;
  return shell(`Support Ticket: ${p.subject}`, body);
}

// ===========================================================================
// SUPPORT TICKET — Auto-Responder
// ===========================================================================

function supportAutoHtml(p: SupportTicketPayload): string {
  // p.message is intentionally excluded — free-text may contain PII; staff
  // have the full message in the staff notification sent to the routed mailbox.
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Thank you for contacting Montana Data Company. We have received your support ticket and will respond within <strong>one business day</strong>.</p>

    ${sectionHeading('Your Ticket')}
    ${dataTable(
      fieldRow('Subject',   p.subject) +
      fieldRow('Category',  categoryLabels[p.category]) +
      fieldRow('Priority',  p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) +
      fieldRow('Submitted', new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">If your issue is urgent, please call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a>.</p>
  `;
  return shell('Support Ticket Received', body);
}

// ===========================================================================
// CHECKOUT — Staff Notification
// ===========================================================================

function checkoutStaffHtml(p: CheckoutPayload): string {
  const cartRows = p.cart
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.name}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:center;">${l.quantity}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.unit_price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.line_total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
    </tr>`)
    .join('');

  const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">A new subscription purchase has been completed via Paystack.</p>

    ${sectionHeading('Customer Details')}
    ${dataTable(
      fieldRow('Name',          p.customer.name) +
      fieldRow('Email',         `<a href="mailto:${p.customer.email}" style="color:#f24567;">${p.customer.email}</a>`) +
      fieldRow('Company',       p.customer.company) +
      fieldRow('Contract Term', p.contractTerm === 'yearly' ? 'Annual' : 'Monthly') +
      fieldRow('Reference',     p.reference) +
      fieldRow('Submitted',     new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Johannesburg' }))
    )}

    ${sectionHeading('Purchased Services')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#f24567;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
      ${cartRows}
      <tr style="background:#f4f4f5;">
        <td colspan="3" style="padding:12px;font-size:13px;font-weight:700;color:#18181b;text-align:right;text-transform:uppercase;letter-spacing:1px;">Grand Total</td>
        <td style="padding:12px;font-size:15px;font-weight:700;color:#f24567;text-align:right;">R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    ${divider()}
    <p style="margin:0;text-align:center;">${ctaButton('Contact ' + p.customer.name, `mailto:${p.customer.email}?subject=${encodeURIComponent(`Your Montana Data Company Purchase — ${p.reference}`)}`)}</p>
  `;
  return shell('New Subscription Purchase', body);
}

// ===========================================================================
// CHECKOUT — Auto-Responder
// ===========================================================================

function checkoutAutoHtml(p: CheckoutPayload): string {
  const cartRows = p.cart
    .map(l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.name}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;text-align:center;">${l.quantity}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">R ${l.line_total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
    </tr>`)
    .join('');

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.customer.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Your payment has been confirmed. Welcome to Montana Data Company — your services are now being provisioned.</p>

    ${sectionHeading('Your Purchase')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#18181b;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
      ${cartRows}
    </table>
    ${dataTable(
      fieldRow('Grand Total',    `R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`) +
      fieldRow('Billing Cycle',  p.contractTerm === 'yearly' ? 'Annual' : 'Monthly') +
      fieldRow('Reference',      p.reference)
    )}

    ${sectionHeading('What Happens Next')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${[
        'Our engineering team will provision your services within one business day.',
        'You will receive login credentials or onboarding instructions via email.',
        'A dedicated Montana Data engineer is available to assist with setup.',
      ].map((step, i) => `<tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;width:32px;">
          <div style="width:28px;height:28px;background:#f24567;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">${i + 1}</div>
        </td>
        <td style="padding:8px 0;font-size:14px;color:#3f3f46;vertical-align:top;line-height:1.6;">${step}</td>
      </tr>`).join('')}
    </table>

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">Questions? Call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a> or reply to this email.</p>
  `;
  return shell('Purchase Confirmed — Montana Data Company', body);
}

// ===========================================================================
// Public send functions
// ===========================================================================

export async function sendContactEmails(p: ContactPayload): Promise<EmailResult> {
  try {
    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.email,
        subject: `[Enquiry] ${enquiryLabels[p.enquiryType] ?? 'General'} — ${p.company}`,
        html: contactStaffHtml(p),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'We\'ve received your enquiry — Montana Data Company',
        html: contactAutoHtml(p),
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
    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.contact.email,
        subject: `[Solution Request] ${p.contact.company} — ${p.resolvedLines.length} service(s)`,
        html: posStaffHtml(p),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.contact.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'Your solution request is confirmed — Montana Data Company',
        html: posAutoHtml(p),
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
    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [SUPPORT_EMAIL],
        replyTo: p.lead.email,
        subject: `[Assessment] ${typeLabel} — ${p.lead.company} — ${p.riskLevel}`,
        html: assessmentStaffHtml(p),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [p.lead.email],
        replyTo: SUPPORT_EMAIL,
        subject: `Your ${typeLabel} Assessment Results — Montana Data Company`,
        html: assessmentAutoHtml(p),
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
    const [staff, auto] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [staffRecipient],
        replyTo: p.email,
        subject: `[Support] ${categoryLabels[p.category]} — ${p.subject}`,
        html:    supportStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.email],
        replyTo: staffRecipient,
        subject: 'Support ticket received — Montana Data Company',
        html:    supportAutoHtml(p),
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
    const staffSubject = `[Purchase] ${p.customer.company} — R ${p.totalZAR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} — ${p.reference}`;
    const [toSales, toSupport, toUser] = await Promise.all([
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SALES_EMAIL],
        replyTo: p.customer.email,
        subject: staffSubject,
        html:    checkoutStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [SUPPORT_EMAIL],
        replyTo: p.customer.email,
        subject: staffSubject,
        html:    checkoutStaffHtml(p),
      }),
      resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [p.customer.email],
        replyTo: SUPPORT_EMAIL,
        subject: 'Your purchase is confirmed — Montana Data Company',
        html:    checkoutAutoHtml(p),
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

// ===========================================================================
// POS — Quote Summary (sent to prospect after CRM lead is created)
// ===========================================================================

function posQuoteSummaryHtml(p: POSPayload): string {
  const solutionName =
    p.resolvedLines.length === 1
      ? p.resolvedLines[0].serviceName
      : `${p.resolvedLines[0].serviceName} + ${p.resolvedLines.length - 1} more`;

  const serviceLines = p.resolvedLines
    .map(
      l => `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#18181b;border-bottom:1px solid #e4e4e7;">${l.serviceName}</td>
      <td style="padding:10px 12px;font-size:14px;color:#3f3f46;border-bottom:1px solid #e4e4e7;">${l.planName}</td>
      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#f24567;border-bottom:1px solid #e4e4e7;text-align:right;">${l.price}</td>
    </tr>`,
    )
    .join('');

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Hi ${p.contact.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;">Here is a summary of the Montana Data solution you configured. A Montana specialist will review your requirements and contact you within <strong>1 business day</strong>.</p>

    ${sectionHeading(`Solution: ${solutionName}`)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9fa;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#18181b;">
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Service</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:1px;">Plan</th>
        <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:1px;">Pricing</th>
      </tr>
      ${serviceLines}
    </table>

    ${sectionHeading('Next Steps')}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${[
        'A Montana specialist will review your selected solution and prepare a tailored proposal.',
        'We will contact you within 1 business day to discuss your requirements.',
        'You will receive a formal quote outlining pricing, timelines, and implementation steps.',
      ]
        .map(
          (step, i) => `<tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;width:32px;">
            <div style="width:28px;height:28px;background:#f24567;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">${i + 1}</div>
          </td>
          <td style="padding:8px 0;font-size:14px;color:#3f3f46;vertical-align:top;line-height:1.6;">${step}</td>
        </tr>`,
        )
        .join('')}
    </table>

    ${divider()}
    <p style="margin:0;font-size:14px;color:#71717a;">Questions? Call us on <a href="tel:+27871883843" style="color:#f24567;">+27 (0)87 188 3843</a> or reply to this email.</p>
  `;

  return shell(`Your Montana Data Solution Summary — ${solutionName}`, body);
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
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [recipientEmail],
      replyTo: SALES_EMAIL,
      subject: `Your Montana Data solution summary — ${solutionName}`,
      html: posQuoteSummaryHtml(payload),
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
