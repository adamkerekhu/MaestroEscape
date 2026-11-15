-- MaestroEscape pub test checkout only. New isolated tables in shared Supabase project.
create table if not exists public.maestroescape_pub_variants (
 id text primary key,
 category_id text not null,category_name text not null,
 item_id text not null,item_name text not null,serving text not null,
 price_huf integer not null check(price_huf>0),
 available boolean not null default true,
 unique(item_id,serving)
);
create table if not exists public.maestroescape_pub_orders(
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.maestroescape_accounts(id),
 table_id text not null check(table_id in ('pub_left','pub_middle','pub_right','pub_upper')),
 lines jsonb not null check(jsonb_typeof(lines)='array'),
 subtotal_huf integer not null check(subtotal_huf>0),
 service_fee_huf integer not null check(service_fee_huf>=0),
 total_huf integer not null check(total_huf=subtotal_huf+service_fee_huf),
 currency text not null default 'huf' check(currency='huf'),
 payment_mode text not null default 'test' check(payment_mode='test'),
 payment_status text not null default 'pending' check(payment_status in ('pending','checkout_created','paid_test','expired','failed')),
 fulfillment_status text not null default 'test_only' check(fulfillment_status='test_only'),
 stripe_checkout_session_id text unique,
 stripe_payment_intent_id text,
 idempotency_key uuid not null,
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 unique(account_id,idempotency_key)
);
create index if not exists maestroescape_pub_orders_account_created on public.maestroescape_pub_orders(account_id,created_at desc);
alter table public.maestroescape_pub_variants enable row level security;
alter table public.maestroescape_pub_orders enable row level security;
revoke all on public.maestroescape_pub_variants,public.maestroescape_pub_orders from anon,authenticated;
comment on table public.maestroescape_pub_orders is 'MaestroEscape Stripe test checkout. No bartender fulfillment or real customer charges.';
