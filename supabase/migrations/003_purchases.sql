-- 003_purchases.sql
-- Order ledger. One row per checkout submission.
-- monday_item_id and paystack_reference are populated async after creation.

create table public.purchases (
  id                  uuid          primary key default gen_random_uuid(),
  user_id             uuid          references auth.users(id) on delete set null,
  order_id            text          not null unique,           -- MDC-YYYYMMDD-XXXX
  customer_name       text          not null,
  customer_email      text          not null,
  customer_phone      text,
  company             text          not null,
  vat_number          text,
  address_line1       text,
  address_line2       text,
  city                text,
  province            text,
  postal_code         text,
  country             text          not null default 'ZA',
  order_notes         text,
  gross_total         numeric(10,2) not null,
  nett_total          numeric(10,2) not null,
  discount_amount     numeric(10,2) not null default 0,
  discount_code       text,
  cart                jsonb         not null,                  -- CartLineItem[]
  partner             text,                                    -- 'nedbank'
  landing_page        text,                                    -- '/nedbank'
  monday_item_id      text,
  paystack_reference  text,
  created_at          timestamptz   not null default now()
);

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_email_idx   on public.purchases(customer_email);
-- order_id has a UNIQUE constraint which already creates an index; no separate index needed.

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS — used by server-side helpers
create policy "Service role has full access"
  on public.purchases for all
  using (true) with check (true);
