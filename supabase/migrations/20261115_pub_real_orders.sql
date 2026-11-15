-- Maestro Pub real orders: provision ONLY on a dedicated approved Supabase project.
-- Never apply to unrelated Fair Flights / Takkershop production schemas.
create extension if not exists pgcrypto;
create table if not exists public.pub_menu_categories (
 id text primary key, name text not null, sort_order integer not null default 0, active boolean not null default true);
create table if not exists public.pub_menu_items (
 id text primary key, category_id text not null references public.pub_menu_categories(id),
 name text not null, sort_order integer not null default 0, active boolean not null default true);
create table if not exists public.pub_menu_item_variants (
 id text primary key, item_id text not null references public.pub_menu_items(id),
 size_label text not null, price_huf integer not null check (price_huf>=0), active boolean not null default true,
 unique(item_id,size_label));
create table if not exists public.pub_tables (
 id text primary key, label text not null, active boolean not null default true);
create table if not exists public.pub_table_sessions (
 id uuid primary key default gen_random_uuid(),
 table_id text not null references public.pub_tables(id),
 token_hash text not null unique, expires_at timestamptz not null,
 revoked_at timestamptz, created_by_staff uuid, created_at timestamptz not null default now());
create table if not exists public.pub_orders (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.pub_table_sessions(id),
 table_id text not null references public.pub_tables(id),
 status text not null default 'pending' check(status in ('pending','accepted','preparing','ready','delivered','rejected','cancelled')),
 subtotal_huf integer not null check(subtotal_huf>=0),
 service_fee_huf integer not null check(service_fee_huf>=0),
 total_huf integer not null check(total_huf=subtotal_huf+service_fee_huf),
 terms_version text not null, terms_accepted_at timestamptz not null,
 idempotency_key text not null, payment_method text not null default 'pay_at_pub',
 created_at timestamptz not null default now(), accepted_at timestamptz,
 unique(session_id,idempotency_key));
create table if not exists public.pub_order_lines (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.pub_orders(id) on delete cascade,
 variant_id text not null references public.pub_menu_item_variants(id),
 item_name_snapshot text not null, serving_snapshot text not null,
 unit_price_huf integer not null check(unit_price_huf>=0),
 quantity integer not null check(quantity between 1 and 20),
 line_total_huf integer not null check(line_total_huf=unit_price_huf*quantity));
create table if not exists public.pub_order_status_events (
 id bigint generated always as identity primary key,
 order_id uuid not null references public.pub_orders(id),
 from_status text, to_status text not null,
 changed_by uuid, created_at timestamptz not null default now());
-- These tables are server-only. Public browser clients do not receive SQL privileges.
alter table public.pub_menu_categories enable row level security;
alter table public.pub_menu_items enable row level security;
alter table public.pub_menu_item_variants enable row level security;
alter table public.pub_tables enable row level security;
alter table public.pub_table_sessions enable row level security;
alter table public.pub_orders enable row level security;
alter table public.pub_order_lines enable row level security;
alter table public.pub_order_status_events enable row level security;
revoke all on table public.pub_menu_categories, public.pub_menu_items, public.pub_menu_item_variants, public.pub_tables, public.pub_table_sessions, public.pub_orders, public.pub_order_lines, public.pub_order_status_events from anon, authenticated;
revoke all on sequence public.pub_order_status_events_id_seq from anon, authenticated;
-- Only trusted backend service role can query or change orders; explicit application authorization is still required.
