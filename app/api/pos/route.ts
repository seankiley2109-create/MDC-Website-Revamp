import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPOSEmails, sendPOSQuoteSummary, type POSPayload, type POSServicePlan, type ConsultingPayload } from '@/lib/email';
import { createPOSLead, createConsultingLead } from '@/lib/monday';
import { POPIA_SERVICES } from '@/lib/popia-services';

// Mirror the service catalogue so the API can resolve IDs → labels
const SERVICE_CATALOGUE: Record<
  string,
  { name: string; plans: Record<string, { name: string; price: string }> }
> = {
  'ibm-backup': {
    name: 'IBM Enterprise Backup',
    plans: {
      consultation:   { name: 'Architecture Consultation', price: 'Custom Quote' },
      implementation: { name: 'Full Implementation',       price: 'RFP Negotiation' },
    },
  },
  'druva-m365': {
    name: 'Druva M365 / Google Workspace',
    plans: {
      standard: { name: 'Standard — Backup + 3× Copies SA',              price: 'From R50/pm ex VAT'    },
      premium:  { name: 'Premium — + Ransomware Detection & Recovery',    price: 'From R225/pm ex VAT'   },
    },
  },
  'druva-endpoint': {
    name: 'Druva Endpoint Protection',
    plans: {
      standard: { name: 'Standard — Backup + 3× Copies SA',              price: 'From R125/pm ex VAT'   },
      premium:  { name: 'Premium — + Ransomware Detection & Recovery',    price: 'From R238/pm ex VAT'   },
    },
  },
  'druva-server': {
    name: 'Druva Hybrid Server Backup',
    plans: {
      '1tb': { name: '1TB Storage', price: 'R4,000/pm ex VAT'  },
      '2tb': { name: '2TB Storage', price: 'R6,200/pm ex VAT'  },
      '3tb': { name: '3TB Storage', price: 'R9,750/pm ex VAT'  },
      '4tb': { name: '4TB Storage', price: 'R14,000/pm ex VAT' },
    },
  },
  'ransomware': {
    name: 'Ransomware Protection',
    plans: {
      standard: { name: 'Standard Detection',    price: 'Custom Quote' },
      advanced:  { name: 'Advanced AI Isolation', price: 'Custom Quote' },
    },
  },
  'archive': {
    name: 'Archive & Lifecycle',
    plans: {
      standard:   { name: 'Standard Archiving',   price: 'Custom Quote' },
      compliance: { name: 'Compliance Archiving',  price: 'Custom Quote' },
    },
  },
  'maas360': {
    name: 'MaaS360 (MDM/UEM)',
    plans: {
      essential: { name: 'Essential Plan', price: 'R150 p/device' },
      deluxe:    { name: 'Deluxe Plan',    price: 'Per estimate' },
    },
  },
  'guardium': {
    name: 'IBM Guardium',
    plans: {
      discovery:  { name: 'Data Discovery',  price: 'Custom Quote' },
      protection: { name: 'Full Protection', price: 'RFP Negotiation' },
    },
  },
  'popia': {
    name: 'POPIA Consulting',
    plans: {
      training: { name: 'Training & Manuals', price: 'From R300' },
      audit:    { name: 'Full Privacy Audit',  price: 'Custom Quote' },
    },
  },
  'quantum': {
    name: 'Quantum Security (PQC)',
    plans: {
      assessment:   { name: 'Readiness Assessment', price: 'Custom Quote' },
      architecture: { name: 'PQC Architecture',     price: 'RFP Negotiation' },
    },
  },
};

const envLabelMap: Record<string, string> = {
  druvaUsers:     'M365/Google Users',
  ibmDataTB:      'Data Volume (TB)',
  maasDevices:    'Endpoints / Devices',
  popiaEmployees: 'Number of Employees',
};

const productSchema = z.object({
  type:        z.literal('product').optional(),
  services:    z.array(z.string()).min(1),
  plans:       z.record(z.string(), z.string()),
  contact:     z.object({
    name:    z.string().min(1),
    email:   z.string().email(),
    company: z.string().min(1),
    notes:   z.string().optional().default(''),
  }),
  environment: z.record(z.string(), z.string()).optional().default({}),
});

const consultingSchema = z.object({
  type:            z.literal('consulting'),
  name:            z.string().min(1),
  email:           z.string().email(),
  company:         z.string().min(1),
  phone:           z.string().optional(),
  serviceType:     z.string().min(1),
  engagementModel: z.string().optional(),
  teamSize:        z.string().optional(),
  timeline:        z.string().optional(),
  requirements:    z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Consulting branch ────────────────────────────────────────────────────
    if (body?.type === 'consulting') {
      const parsed = consultingSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid consulting submission data.', details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const codes = parsed.data.serviceType.split(',').map(c => c.trim()).filter(Boolean);
      const resolvedServices = codes
        .map(code => POPIA_SERVICES.find(s => s.code === code))
        .filter((s): s is NonNullable<typeof s> => s != null)
        .map(s => ({ code: s.code, name: s.name, price: s.price, type: s.type }));

      const consultingPayload: ConsultingPayload = {
        ...parsed.data,
        resolvedServices: resolvedServices.length > 0 ? resolvedServices : undefined,
      };
      const mondayResult = await createConsultingLead(consultingPayload).catch((err: unknown): import('@/lib/monday').MondayResult => {
        console.error('[pos] consulting monday.com threw:', err);
        return { success: false, error: String(err) };
      });

      if (!mondayResult.success) {
        console.error('[pos] consulting monday.com failed:', mondayResult.error);
      } else if (!mondayResult.skipped) {
        console.log('[pos] consulting monday.com item created:', mondayResult.itemId);
      }

      return NextResponse.json({ success: true, message: 'Consulting enquiry submitted successfully.' });
    }

    // ── Product branch (existing flow) ───────────────────────────────────────
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission data.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { services, plans, contact, environment } = parsed.data;

    // Resolve service IDs → readable lines
    const resolvedLines: POSServicePlan[] = services
      .map((serviceId) => {
        const service = SERVICE_CATALOGUE[serviceId];
        const planId  = plans[serviceId];
        const plan    = service?.plans[planId];
        if (!service || !plan) return null;
        return { serviceId, serviceName: service.name, planName: plan.name, price: plan.price };
      })
      .filter((l): l is POSServicePlan => l !== null);

    // Humanise environment keys
    const humanEnvironment = Object.fromEntries(
      Object.entries(environment)
        .filter(([, v]) => v)
        .map(([k, v]) => [envLabelMap[k] ?? k, v]),
    );

    const payload: POSPayload = {
      contact: {
        name:    contact.name,
        email:   contact.email,
        company: contact.company,
        notes:   contact.notes,
      },
      services,
      plans,
      environment: humanEnvironment,
      resolvedLines,
    };

    // Run email delivery and CRM creation in parallel
    const [emailResult, mondayResult] = await Promise.allSettled([
      sendPOSEmails(payload),
      createPOSLead(payload),
    ]);

    // Email is non-critical until Resend domain is verified — log failures but don't block the user.
    // TODO: Once montanadc.com is verified in Resend, consider making email the critical path again.
    if (emailResult.status === 'rejected') {
      console.error('[pos] Email send threw:', emailResult.reason);
    } else if (!emailResult.value.success) {
      console.error('[pos] Email send failed:', emailResult.value.error);
    }

    // monday.com is non-critical
    if (mondayResult.status === 'rejected') {
      console.error('[pos] monday.com item creation threw:', mondayResult.reason);
    } else if (!mondayResult.value.success) {
      console.error('[pos] monday.com item creation failed:', mondayResult.value.error);
    } else if (!mondayResult.value.skipped) {
      console.log('[pos] monday.com item created:', mondayResult.value.itemId);

      // Send quote summary to the prospect now that the CRM lead exists
      try {
        const quoteResult = await sendPOSQuoteSummary(payload, contact.email);
        if (!quoteResult.success) {
          console.error('[pos] Quote summary email failed:', quoteResult.error);
        }
      } catch (err) {
        console.error('[pos] Quote summary email threw:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Solution request submitted successfully.' });
  } catch (error) {
    console.error('[pos] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
