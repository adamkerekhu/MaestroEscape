-- Applied to the explicitly selected Takkershop Supabase project only.
-- Additive MaestroEscape object; do not edit existing application tables or auth configuration.
create table if not exists public.maestroescape_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 granted_at timestamptz not null default now(),
 note text
);
alter table public.maestroescape_admins enable row level security;
revoke all on table public.maestroescape_admins from anon, authenticated;
grant select on table public.maestroescape_admins to authenticated;
drop policy if exists maestroescape_admins_read_self on public.maestroescape_admins;
create policy maestroescape_admins_read_self on public.maestroescape_admins
 for select to authenticated using (user_id = (select auth.uid()));
comment on table public.maestroescape_admins is 'MaestroEscape administrator allowlist; independent from Takkershop application roles.';
