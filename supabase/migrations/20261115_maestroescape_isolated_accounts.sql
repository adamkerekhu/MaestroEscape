-- MaestroEscape dedicated account tables, applied ONLY to project djesmhxablodlzqfzqfa.
-- No shared auth.users, Takkershop partners/profiles, or other existing app tables.
create table if not exists public.maestroescape_accounts(
 id uuid primary key default gen_random_uuid(),
 email text not null unique check(email=lower(email) and length(email)<=254),
 password_salt text not null,
 password_hash text not null,
 role text not null default 'user' check(role in('user','admin')),
 created_at timestamptz not null default now()
);
create table if not exists public.maestroescape_sessions(
 token_hash text primary key,
 account_id uuid not null references public.maestroescape_accounts(id) on delete cascade,
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists maestroescape_sessions_account_idx on public.maestroescape_sessions(account_id);
create table if not exists public.maestroescape_auth_limits(
 key text primary key,attempts integer not null default 0,window_ends timestamptz not null
);
alter table public.maestroescape_accounts enable row level security;
alter table public.maestroescape_sessions enable row level security;
alter table public.maestroescape_auth_limits enable row level security;
revoke all on public.maestroescape_accounts,public.maestroescape_sessions,public.maestroescape_auth_limits from anon,authenticated;
create or replace function public.maestroescape_check_limit(p_key text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare counted integer;
begin
 if length(p_key)>160 or length(p_key)<8 or p_limit<1 or p_limit>1000 or p_window_seconds<1 or p_window_seconds>86400 then raise exception 'Invalid rate-limit parameters'; end if;
 insert into public.maestroescape_auth_limits as a(key,attempts,window_ends)
 values(p_key,1,now()+make_interval(secs=>p_window_seconds))
 on conflict(key) do update
 set attempts=case when a.window_ends<=now() then 1 else a.attempts+1 end,
 window_ends=case when a.window_ends<=now() then now()+make_interval(secs=>p_window_seconds) else a.window_ends end
 returning attempts into counted;
 return counted<=p_limit;
end;$$;
revoke all on function public.maestroescape_check_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.maestroescape_check_limit(text,integer,integer) to service_role;
