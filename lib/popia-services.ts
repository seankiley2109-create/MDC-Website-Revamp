/**
 * POPIA Consulting Services Catalog
 *
 * These are fixed-price professional service engagements, NOT subscriptions.
 * They are separate from the Paystack product map because:
 *   - Some are once-off (assessment, training, registration)
 *   - Some are recurring but managed by Sage (retainer)
 *   - None use the self-serve Paystack checkout flow
 *
 * Fixed-price items (SE-PA002, SE-PR002, SE-PE001, SE-PT001-5) can be
 * purchased via a Paystack one-time payment.
 *
 * The retainer (SE-PZ001) is booked via a contact/enquiry form and invoiced
 * through Sage on a monthly basis.
 */

export type POPIAServiceType = 'once-off' | 'recurring';

export interface POPIAService {
  /** Sage product code */
  code:        string;
  name:        string;
  description: string;
  /** Duration/scope label, e.g. "4-hour engagement" */
  duration:    string;
  price:       number;    // ZAR
  type:        POPIAServiceType;
  /** What the deliverable includes */
  includes:    string[];
}

export const POPIA_SERVICES: POPIAService[] = [
  {
    code:        'SE-PA002',
    name:        'Compliance Assessment & Analysis',
    description: 'A structured 4-hour engagement to assess your organisation\'s current POPIA compliance posture, identify gaps, and prioritise remediation.',
    duration:    '4-hour engagement',
    price:       2500,
    type:        'once-off',
    includes:    [
      'Gap analysis against POPIA conditions',
      'Risk register of identified findings',
      'Written assessment report',
      'Prioritised remediation roadmap',
    ],
  },
  {
    code:        'SE-PR002',
    name:        'Remedial Consulting',
    description: 'Targeted 2-hour consulting session to address specific compliance findings or guide implementation of remediation steps.',
    duration:    '2-hour session',
    price:       1600,
    type:        'once-off',
    includes:    [
      'Focused remediation guidance',
      'Policy or procedure drafting support',
      'Implementation checklist',
    ],
  },
  {
    code:        'SE-PE001',
    name:        'Information Officer Registration',
    description: 'End-to-end assistance registering your Information Officer and Deputies with the Information Regulator as required by POPIA.',
    duration:    'Once-off registration',
    price:       300,
    type:        'once-off',
    includes:    [
      'Registration form completion',
      'Submission to Information Regulator',
      'Confirmation documentation',
    ],
  },
  {
    code:        'SE-PT001-5',
    name:        'POPIA Compliance Training',
    description: 'A 1-hour live training session covering POPIA obligations, data subject rights, and practical compliance steps. Up to 5 participants.',
    duration:    '1-hour session (up to 5 Pax)',
    price:       850,
    type:        'once-off',
    includes:    [
      'POPIA obligations overview',
      'Data subject rights & breach procedures',
      'Q&A with compliance consultant',
      'Training materials provided',
    ],
  },
  {
    code:        'SE-PZ001',
    name:        'Monthly Compliance Retainer',
    description: 'Ongoing monthly support from a POPIA compliance consultant. One hour per month to handle queries, review changes, and keep your compliance posture current.',
    duration:    '1 hour per month',
    price:       300,
    type:        'recurring',
    includes:    [
      '1 hour consulting time per month',
      'Regulatory update notifications',
      'Priority email support',
      'Annual compliance health-check',
    ],
  },
];

export function getPOPIAService(code: string): POPIAService | undefined {
  return POPIA_SERVICES.find(s => s.code === code);
}

export function formatZARPOPIA(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style:                 'currency',
    currency:              'ZAR',
    minimumFractionDigits: 0,
  }).format(amount);
}
