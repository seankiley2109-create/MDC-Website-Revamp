import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';

// ─── Paystack event shape (minimal) ──────────────────────────────────────────

interface PaystackCustomer {
  email: string;
  customer_code: string;
}

interface PaystackSubscription {
  subscription_code: string;
  next_payment_date: string | null;
}

interface ChargeSuccessData {
  reference: string;
  amount: number; // kobo (divide by 100 for ZAR)
  customer: PaystackCustomer;
  subscription?: PaystackSubscription;
}

interface SubscriptionDisableData {
  subscription_code: string;
  customer: PaystackCustomer;
}

interface InvoicePaymentFailedData {
  customer: PaystackCustomer;
  subscription: PaystackSubscription;
}

interface DisputeCreateData {
  transaction: { reference: string; amount: number };
  customer: PaystackCustomer;
}

interface PaystackEvent {
  event: string;
  data:
    | ChargeSuccessData
    | SubscriptionDisableData
    | InvoicePaymentFailedData
    | DisputeCreateData;
}

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signature;
}

// ─── Sage integration ─────────────────────────────────────────────────────────

async function recordPaymentInSage(data: ChargeSuccessData): Promise<void> {
  const sageApiKey = process.env.SAGE_API_KEY;
  if (!sageApiKey) {
    console.warn('[Sage] SAGE_API_KEY not configured — skipping invoice creation');
    return;
  }

  const amountZAR = data.amount / 100;

  const payload = {
    contact_name: data.customer.email,
    reference: data.reference,
    line_items: [
      {
        description: 'Montana Data Company subscription payment',
        unit_price: amountZAR,
        quantity: 1,
      },
    ],
  };

  const response = await fetch(
    'https://api.sageone.com/accounts/v3/invoices',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sageApiKey}`,
        'Content-Type': 'application/json',
        'X-Site-Id': process.env.SAGE_SITE_ID ?? '',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sage API error ${response.status}: ${body}`);
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: ChargeSuccessData): Promise<void> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      plan_status: 'active',
      paystack_customer_code: data.customer.customer_code,
      paystack_subscription_code: data.subscription?.subscription_code ?? null,
      current_period_end: data.subscription?.next_payment_date ?? null,
    })
    .eq('email', data.customer.email);

  if (error) {
    throw new Error(`Supabase update failed: ${(error as { message: string }).message}`);
  }

  // Record in Sage — failure must NOT fail the webhook
  try {
    await recordPaymentInSage(data);
  } catch (sageError) {
    console.error('[Sage] Failed to record payment:', sageError);
    // Intentionally not re-throwing — Sage failure is non-blocking
  }
}

async function handleSubscriptionDisable(data: SubscriptionDisableData): Promise<void> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ plan_status: 'cancelled' })
    .eq('email', data.customer.email);

  if (error) {
    throw new Error(`Supabase update failed: ${(error as { message: string }).message}`);
  }
}

async function handleInvoicePaymentFailed(data: InvoicePaymentFailedData): Promise<void> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ plan_status: 'past_due' })
    .eq('email', data.customer.email);

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }
}

function handleDisputeCreate(data: DisputeCreateData): void {
  // TODO: Replace console.warn with a proper alert email (e.g. via Resend)
  // when an email provider is wired up for internal notifications.
  console.warn('[DISPUTE ALERT] New payment dispute created', {
    customerEmail: data.customer.email,
    reference: data.transaction.reference,
    amount: `R ${(data.transaction.amount / 100).toFixed(2)}`,
    timestamp: new Date().toISOString(),
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get('x-paystack-signature') ?? '';
  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature)) {
    console.warn('[Paystack webhook] Invalid signature — rejecting request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data as ChargeSuccessData);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data as SubscriptionDisableData);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data as InvoicePaymentFailedData);
        break;

      case 'charge.dispute.create':
        handleDisputeCreate(event.data as DisputeCreateData);
        break;

      default:
        // Unknown events are acknowledged without error
        console.log(`[Paystack webhook] Unhandled event type: ${event.event}`);
        break;
    }
  } catch (err) {
    console.error(`[Paystack webhook] Error processing ${event.event}:`, err);
    // Return 500 so Paystack retries
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
