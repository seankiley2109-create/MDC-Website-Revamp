/**
 * monday.com GraphQL Integration
 *
 * Board setup — create four boards in monday.com exactly as described below,
 * then add the board IDs to your .env file. Column IDs are constants here;
 * if your board has different IDs, update the COLS objects.
 *
 * To find a column's ID in monday.com:
 *   Board → click any column header → Settings (⚙) → "Edit Column" → ID shown at bottom
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BOARD 4 — "Support Tickets"  (env: MONDAY_SUPPORT_BOARD_ID)
 *   Column name        Type        ID used here
 *   ────────────────── ─────────── ──────────────
 *   Email              Email       email
 *   Company            Text        text
 *   Category           Status      status
 *   Priority           Status      status_1
 *   Message            Long Text   long_text
 *   Ticket Status      Status      status_2
 *
 *   Status labels for "Category":
 *     Technical | Billing | Compliance | General
 *   Status labels for "Priority":
 *     Low | Normal | High | Critical
 *   Status labels for "Ticket Status":
 *     New | In Progress | Awaiting Client | Resolved | Closed
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BOARD 1 — "Website Leads"  (env: MONDAY_CONTACT_BOARD_ID)
 *   Column name        Type        ID used here
 *   ────────────────── ─────────── ──────────────
 *   Email              Email       email
 *   Company            Text        text
 *   Enquiry Type       Status      status
 *   Message            Long Text   long_text
 *   Lead Status        Status      status_1
 *
 *   Status labels for "Enquiry Type":
 *     New Solution | Existing Client | Partnership | POPIA Consulting | General
 *   Status labels for "Lead Status":
 *     New Lead | Contacted | Qualified | Proposal Sent | Won | Lost
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BOARD 2 — "Solution Requests"  (env: MONDAY_POS_BOARD_ID)
 *   Column name        Type        ID used here
 *   ────────────────── ─────────── ──────────────
 *   Email              Email       email
 *   Company            Text        text
 *   Services           Long Text   long_text
 *   Notes              Long Text   long_text_1
 *   Lead Status        Status      status
 *
 *   Status labels for "Lead Status":
 *     New Request | Scoping | Proposal Sent | Won | Lost
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BOARD 3 — "Assessment Leads"  (env: MONDAY_ASSESSMENT_BOARD_ID)
 *   Column name        Type        ID used here
 *   ────────────────── ─────────── ──────────────
 *   Email              Email       email
 *   Company            Text        text
 *   Assessment Type    Status      status
 *   Score              Numbers     numbers
 *   Risk Level         Status      status_1
 *   Lead Status        Status      status_2
 *
 *   Status labels for "Assessment Type":
 *     Security & Backup | POPIA Compliance
 *   Status labels for "Risk Level":
 *     High Risk | Moderate Risk | Medium Risk | Low Risk
 *   Status labels for "Lead Status":
 *     New Lead | Contacted | Qualified | Proposal Sent | Won | Lost
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ContactPayload, POSPayload, AssessmentPayload, ConsultingPayload } from '@/lib/email';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONDAY_API_URL     = 'https://api.monday.com/v2';
const MONDAY_API_VERSION = '2024-10';

/** Column IDs for the "Website Leads" board. */
const CONTACT_COLS = {
  email:       'email_mm20vp3x',
  company:     'text_mm201srx',
  enquiryType: 'color_mm20kdra',
  message:     'text_mm208etp',
  date:        'date_mm2vhct',
  leadStatus:  'color_mm20shcj',
} as const;

/** Column IDs for the "Solution Requests" board. */
const POS_COLS = {
  email:      'email_mm20vp3x',
  company:    'text_mm201srx',
  services:   'text_mm208etp',
  date:       'date_mm2vak9c',
  notes:      'text_mm20785f',
  leadStatus: 'color_mm20shcj',
} as const;

/** Column IDs for the subitems board attached to the Solution Requests board. */
const CONSULTING_SUBITEM_COLS = {
  productCode: 'text_mm2vbe5n',
} as const;

/** Column IDs for the "Support Tickets" board. */
const SUPPORT_COLS = {
  email:        'email_mm20vp3x',
  company:      'text_mm201srx',
  category:     'color_mm20kdra',
  priority:     'color_mm20shcj',
  message:      'text_mm208etp',
  ticketStatus: 'color_mm20qe7',
} as const;

/** Column IDs for the "Assessment Leads" board. */
const ASSESSMENT_COLS = {
  email:          'email_mm20vp3x',
  company:        'text_mm201srx',
  assessmentType: 'color_mm20shcj', // Fixed: was incorrectly showing "New Request"
  score:          'numeric_mm2036ae',
  riskLevel:      'color_mm202efg',
  date:           'date_mm2v3z1p',
  leadStatus:     'color_mm20qe7',
} as const;

/** Column IDs for the "Website - Solution Requests FULL" orders board. */
const ORDER_COLS = {
  orderStatus:    'color_mkya1nwk',
  orderId:        'text_mkqp2zzd',
  orderDate:      'date4',
  partner:        'text_mm03hex3',
  landingPage:    'text_mm038w9m',
  grossValue:     'numeric_mm06g01q',
  nettValue:      'numeric_mm06cmss',
  discountAmount: 'numeric_mkqp21qs',
  voucherCode:    'text_mkqp15b1',
  contactPerson:  'text_mkqph4x3',
  firstName:      'text_mkqf49rq',
  lastName:       'text_mkqngb65',
  email:          'email_mkqfjdkw',
  phone:          'text_mkxnzak5',
  vatNumber:      'text_mkqf7yv9',
  address1:       'text_mkqfrpy5',
  address2:       'text_mkqfmyn5',
  city:           'text_mkqf4q00',
  postCode:       'text_mkqfbvvy',
  province:       'text_mkqfk4sg',
  country:        'text_mkqfjagt',
  orderNotes:     'long_text_mkqpyhk5',
} as const;

/** Column IDs for the auto-generated subitems board attached to the orders board. */
const SUBITEM_COLS = {
  productCode: 'text_mkqfxt8c',
  unitPrice:   'numeric_mm063z0t',
  quantity:    'numeric_mkqfngw6',
  lineTotal:   'numeric_mkqfjn0d',
  orderId:     'text_mm00beth',
} as const;

/**
 * Column ID for the Long Text "Provisioning Emails" column on the subitems board.
 * After adding the column in monday.com: Board → Subitems → column header → Settings → copy ID.
 * Leave as '' to silently skip writing emails until the column exists.
 */
const SUBITEM_USER_EMAILS_COL = '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MondayApiError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

interface MondayResponse<T> {
  data?: T;
  errors?: MondayApiError[];
  error_message?: string;
  status_code?: number;
}

interface CreateItemData {
  create_item: {
    id: string;
    name: string;
  };
}

export interface MondayResult {
  success: boolean;
  itemId?: string;
  error?: string;
  skipped?: boolean;
}

export interface OrderItemPayload {
  orderId:       string;
  company:       string;
  firstName:     string;
  lastName:      string;
  email:         string;
  phone:         string;
  vatNumber?:    string;
  address1?:     string;
  address2?:     string;
  city?:         string;
  province?:     string;
  postalCode?:   string;
  country:       string;
  orderNotes?:   string;
  grossTotal:    number;
  nettTotal:     number;
  discountAmt:   number;
  discountCode?: string;
  partner?:      string;
  landingPage?:  string;
}

/** Type-safe column value map — only the shapes monday.com accepts. */
type ColumnValueMap = Record<
  string,
  | string
  | number
  | { email: string; text: string }
  | { label: string }
  | { text: string }
  | { date: string }       // ← add this line
>;

// ─── GraphQL executor ─────────────────────────────────────────────────────────

const CREATE_ITEM_MUTATION = /* graphql */ `
  mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_item(
      board_id: $boardId
      item_name: $itemName
      column_values: $columnValues
    ) {
      id
      name
    }
  }
`;

const CREATE_SUBITEM_MUTATION = /* graphql */ `
  mutation CreateSubitem($parentItemId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_subitem(
      parent_item_id: $parentItemId
      item_name: $itemName
      column_values: $columnValues
    ) {
      id
      name
    }
  }
`;

const CHANGE_COLUMN_VALUE_MUTATION = /* graphql */ `
  mutation ChangeColumnValue($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
    change_column_value(
      board_id: $boardId
      item_id: $itemId
      column_id: $columnId
      value: $value
    ) {
      id
    }
  }
`;

async function mondayGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<MondayResponse<T>> {
  const apiKey = process.env.MONDAY_API_KEY;

  if (!apiKey) {
    throw new Error('MONDAY_API_KEY is not configured.');
  }

  const response = await fetch(MONDAY_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'API-Version':   MONDAY_API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`monday.com API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<MondayResponse<T>>;
}

// ─── Column value builders ────────────────────────────────────────────────────

function colEmail(address: string): { email: string; text: string } {
  return { email: address, text: address };
}

function colStatus(label: string): { label: string } {
  return { label };
}

function colLongText(text: string): { text: string } {
  return { text };
}

function colDate(date: Date): { date: string } {
  return { date: date.toISOString().slice(0, 10) }; // "YYYY-MM-DD"
}

/**
 * Maps the app-level RiskLevel enum to the label that exists on the
 * "Risk Level" status column of the Assessment Leads board.
 *
 * Board-confirmed labels (from live API, 2026-04):
 *   "High"   → index 2  (score ≤ 8 for POPIA, ≤ 7 for security)
 *   "Medium" → index 0  (POPIA score 9-14)
 *   "Low"    → index 1  (score ≥ 15 / ≥ 15)
 *
 * "Moderate Risk" is the security-track middle band — mapped to "High"
 * because the board has no "Moderate" label.
 */
const RISK_LEVEL_BOARD_LABEL: Record<string, string> = {
  'High Risk':     'High',
  'Moderate Risk': 'High',
  'Medium Risk':   'Medium',
  'Low Risk':      'Low',
};

// ─── Internal create helper ───────────────────────────────────────────────────

async function createItem(
  boardId: string,
  itemName: string,
  columns: ColumnValueMap,
): Promise<MondayResult> {
  const result = await mondayGraphQL<CreateItemData>(CREATE_ITEM_MUTATION, {
    boardId,
    itemName,
    columnValues: JSON.stringify(columns),
  });

  if (result.errors?.length) {
    const msg = result.errors.map(e => e.message).join('; ');
    return { success: false, error: msg };
  }

  if (!result.data?.create_item?.id) {
    return { success: false, error: 'No item ID returned from monday.com.' };
  }

  return { success: true, itemId: result.data.create_item.id };
}

// ─── Enquiry type label map ───────────────────────────────────────────────────

const enquiryStatusLabel: Record<string, string> = {
  'enterprise-backup': 'Enterprise Backup',
  'ransomware':        'Ransomware Protection',
  'archiving':         'Archiving & Lifecycle',
  'quantum':           'Quantum Security (PQC)',
  'guardium':          'IBM Guardium',
  'existing-client':   'Existing Client',
  'partnership':       'Partnership',
  'compliance':        'POPIA Consulting',
  'general':           'General',
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a lead item on the "Website Leads" monday.com board.
 * Returns { skipped: true } silently when the board ID is not configured.
 */
export async function createContactLead(
  payload: ContactPayload,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_CONTACT_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const columns: ColumnValueMap = {
    [CONTACT_COLS.email]:       colEmail(payload.email),
    [CONTACT_COLS.company]:     payload.company,
    [CONTACT_COLS.enquiryType]: colStatus(enquiryStatusLabel[payload.enquiryType] ?? 'General'),
    [CONTACT_COLS.message]:     payload.message,
    [CONTACT_COLS.date]:        colDate(new Date()),
    [CONTACT_COLS.leadStatus]:  colStatus('New Lead'),
  };

  return createItem(
    boardId,
    `${payload.company} — ${payload.name}`,
    columns,
  );
}

/**
 * Creates a lead item on the "Solution Requests" monday.com board.
 * Returns { skipped: true } silently when the board ID is not configured.
 */
export async function createPOSLead(payload: POSPayload): Promise<MondayResult> {
  const boardId = process.env.MONDAY_POS_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  // Build a readable services summary for the long-text column
  const servicesSummary = payload.resolvedLines
    .map(l => `• ${l.serviceName} — ${l.planName} (${l.price})`)
    .join('\n');

  // Build readable environment details
  const envSummary = Object.entries(payload.environment)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const fullServices = envSummary
    ? `${servicesSummary}\n\nEnvironment:\n${envSummary}`
    : servicesSummary;

  const columns: ColumnValueMap = {
    [POS_COLS.email]:      colEmail(payload.contact.email),
    [POS_COLS.company]:    payload.contact.company,
    [POS_COLS.services]:   fullServices,
    [POS_COLS.notes]:      payload.contact.notes || '—',
    [POS_COLS.leadStatus]: colStatus('New Request'),
  };

  return createItem(
    boardId,
    `${payload.contact.company} — Solution Request`,
    columns,
  );
}

/**
 * Creates a consulting lead on the "Solution Requests" monday.com board.
 * Adds a "Type: Consulting" note to distinguish from product leads.
 * Returns { skipped: true } silently when the board ID is not configured.
 */
export async function createConsultingLead(payload: ConsultingPayload): Promise<MondayResult> {
  const boardId = process.env.MONDAY_POS_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const serviceCount = payload.resolvedServices?.length ?? 0;
  const servicesSummary = serviceCount > 0
    ? `${serviceCount} consulting service${serviceCount !== 1 ? 's' : ''} — see subitems`
    : payload.serviceType;

  const detailLines: string[] = [];
  if (payload.engagementModel) detailLines.push(`Engagement Model: ${payload.engagementModel}`);
  if (payload.teamSize)        detailLines.push(`Team Size: ${payload.teamSize}`);
  if (payload.timeline)        detailLines.push(`Timeline: ${payload.timeline}`);
  if (payload.phone)           detailLines.push(`Phone: ${payload.phone}`);

  const columns: ColumnValueMap = {
    [POS_COLS.email]:      colEmail(payload.email),
    [POS_COLS.company]:    payload.company,
    [POS_COLS.services]:   detailLines.length ? detailLines.join('\n') : servicesSummary,
    [POS_COLS.date]:       colDate(new Date()),
    [POS_COLS.notes]:      payload.requirements || '—',
    [POS_COLS.leadStatus]: colStatus('New Request'),
  };

  const parentResult = await createItem(
    boardId,
    `${payload.company} — Consulting Lead`,
    columns,
  );

  if (!parentResult.success || !parentResult.itemId) return parentResult;

  // Create one subitem per selected consulting service
  if (payload.resolvedServices && payload.resolvedServices.length > 0) {
    for (const service of payload.resolvedServices) {
      await mondayGraphQL<{ create_subitem: { id: string } }>(
        CREATE_SUBITEM_MUTATION,
        {
          parentItemId: parentResult.itemId,
          itemName:     service.name,
          columnValues: JSON.stringify({
            [CONSULTING_SUBITEM_COLS.productCode]: service.code,
          }),
        },
      ).catch((err: unknown) => {
        console.error('[monday] consulting subitem creation failed:', err);
      });
    }
  }

  return parentResult;
}

// ─── Support ticket types ─────────────────────────────────────────────────────

export interface SupportTicketPayload {
  name: string;
  email: string;
  company: string;
  subject: string;
  category: 'technical' | 'billing' | 'compliance' | 'general';
  priority: 'low' | 'normal' | 'high' | 'critical';
  message: string;
}

const categoryLabel: Record<SupportTicketPayload['category'], string> = {
  technical:  'Technical',
  billing:    'Billing',
  compliance: 'Compliance',
  general:    'General',
};

const priorityLabel: Record<SupportTicketPayload['priority'], string> = {
  low:      'Low',
  normal:   'Normal',
  high:     'High',
  critical: 'Critical',
};

/**
 * Creates a ticket item on the "Support Tickets" monday.com board.
 * Returns { skipped: true } silently when the board ID is not configured.
 */
export async function createSupportTicket(
  payload: SupportTicketPayload,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_SUPPORT_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const columns: ColumnValueMap = {
    [SUPPORT_COLS.email]:        colEmail(payload.email),
    [SUPPORT_COLS.company]:      payload.company,
    [SUPPORT_COLS.category]:     colStatus(categoryLabel[payload.category]),
    [SUPPORT_COLS.priority]:     colStatus(priorityLabel[payload.priority]),
    [SUPPORT_COLS.message]:      payload.message,
    [SUPPORT_COLS.ticketStatus]: colStatus('New'),
  };

  return createItem(
    boardId,
    `[${priorityLabel[payload.priority].toUpperCase()}] ${payload.subject} — ${payload.company}`,
    columns,
  );
}

/**
 * Creates a lead item on the "Assessment Leads" monday.com board.
 * Returns { skipped: true } silently when the board ID is not configured.
 */
export async function createAssessmentLead(
  payload: AssessmentPayload,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_ASSESSMENT_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const typeLabel =
    payload.type === 'security' ? 'Security & Backup' : 'POPIA Compliance';

  const boardRiskLabel = RISK_LEVEL_BOARD_LABEL[payload.riskLevel] ?? 'High';

  const columns: ColumnValueMap = {
    [ASSESSMENT_COLS.email]:          colEmail(payload.lead.email),
    [ASSESSMENT_COLS.company]:        payload.lead.company,
    [ASSESSMENT_COLS.assessmentType]: colStatus(typeLabel),
    [ASSESSMENT_COLS.score]:          String(payload.score),  // Numbers col requires string
    [ASSESSMENT_COLS.riskLevel]:      colStatus(boardRiskLabel),
    [ASSESSMENT_COLS.date]:           colDate(new Date()),
    [ASSESSMENT_COLS.leadStatus]:     colStatus('New Lead'),
  };

  return createItem(
    boardId,
    `${payload.lead.company} — ${typeLabel} Assessment`,
    columns,
  );
}

/**
 * Creates a parent order item on the "Website - Solution Requests FULL" board.
 * Returns { skipped: true } when MONDAY_ORDERS_BOARD_ID is not configured.
 */
export async function createOrderItem(
  payload: OrderItemPayload,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_ORDERS_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const today = new Date();

  const columns: ColumnValueMap = {
    [ORDER_COLS.orderStatus]:    colStatus('pending payment'),
    [ORDER_COLS.orderId]:        payload.orderId,
    [ORDER_COLS.orderDate]:      colDate(today),
    [ORDER_COLS.grossValue]:     String(payload.grossTotal.toFixed(2)),
    [ORDER_COLS.nettValue]:      String(payload.nettTotal.toFixed(2)),
    [ORDER_COLS.discountAmount]: String(payload.discountAmt.toFixed(2)),
    [ORDER_COLS.contactPerson]:  `${payload.firstName} ${payload.lastName}`,
    [ORDER_COLS.firstName]:      payload.firstName,
    [ORDER_COLS.lastName]:       payload.lastName,
    [ORDER_COLS.email]:          colEmail(payload.email),
    [ORDER_COLS.phone]:          payload.phone,
    [ORDER_COLS.country]:        payload.country,
    ...(payload.vatNumber   && { [ORDER_COLS.vatNumber]:   payload.vatNumber }),
    ...(payload.address1    && { [ORDER_COLS.address1]:    payload.address1  }),
    ...(payload.address2    && { [ORDER_COLS.address2]:    payload.address2  }),
    ...(payload.city        && { [ORDER_COLS.city]:        payload.city      }),
    ...(payload.province    && { [ORDER_COLS.province]:    payload.province  }),
    ...(payload.postalCode  && { [ORDER_COLS.postCode]:    payload.postalCode }),
    ...(payload.orderNotes  && { [ORDER_COLS.orderNotes]:  colLongText(payload.orderNotes) }),
    ...(payload.discountCode && { [ORDER_COLS.voucherCode]: payload.discountCode }),
    ...(payload.partner     && { [ORDER_COLS.partner]:     payload.partner   }),
    ...(payload.landingPage && { [ORDER_COLS.landingPage]: payload.landingPage }),
  };

  return createItem(
    boardId,
    `${payload.company} — ${payload.firstName} ${payload.lastName}`,
    columns,
  );
}

export type OrderStatus = 'pending payment' | 'processing' | 'cancelled' | 'refunded' | 'completed';

/**
 * Updates the orderStatus column on an existing orders board item.
 * Non-critical — callers should catch and log errors.
 */
export async function updateOrderPaymentStatus(
  mondayItemId: string,
  status: OrderStatus,
): Promise<MondayResult> {
  const boardId = process.env.MONDAY_ORDERS_BOARD_ID;
  if (!boardId) return { success: true, skipped: true };

  const result = await mondayGraphQL<{ change_column_value: { id: string } }>(
    CHANGE_COLUMN_VALUE_MUTATION,
    {
      boardId,
      itemId:   mondayItemId,
      columnId: ORDER_COLS.orderStatus,
      value:    JSON.stringify(colStatus(status)),
    },
  );

  if (result.errors?.length) {
    return { success: false, error: result.errors.map(e => e.message).join('; ') };
  }

  return { success: true, itemId: mondayItemId };
}

/**
 * Creates a subitem under a parent order item.
 * One call per cart line item. Failure is non-critical — log and continue.
 */
export async function createOrderSubitem(
  parentItemId: string,
  orderId:      string,
  line: {
    name:         string;
    product_code: string;
    unit_price:   number;
    quantity:     number;
    line_total:   number;
  },
  userEmails?: string[],
): Promise<MondayResult> {
  const columns: ColumnValueMap = {
    [SUBITEM_COLS.productCode]: line.product_code,
    [SUBITEM_COLS.unitPrice]:   String(line.unit_price.toFixed(2)),
    [SUBITEM_COLS.quantity]:    String(line.quantity),
    [SUBITEM_COLS.lineTotal]:   String(line.line_total.toFixed(2)),
    [SUBITEM_COLS.orderId]:     orderId,
    ...(SUBITEM_USER_EMAILS_COL && userEmails?.length
      ? { [SUBITEM_USER_EMAILS_COL]: colLongText(userEmails.join('\n')) }
      : {}
    ),
  };

  const result = await mondayGraphQL<{ create_subitem: { id: string; name: string } }>(
    CREATE_SUBITEM_MUTATION,
    {
      parentItemId,
      itemName:     line.name,
      columnValues: JSON.stringify(columns),
    },
  );

  if (result.errors?.length) {
    const msg = result.errors.map(e => e.message).join('; ');
    return { success: false, error: msg };
  }

  if (!result.data?.create_subitem?.id) {
    return { success: false, error: 'No subitem ID returned from monday.com.' };
  }

  return { success: true, itemId: result.data.create_subitem.id };
}
