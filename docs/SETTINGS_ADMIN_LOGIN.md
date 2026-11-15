# MaestroEscape settings login

The old single shared `ADMIN_PASSWORD` system was replaced.

## Current login
- Open `/account/register` to create a MaestroEscape-only account.
- Sign in at `/account/login`.
- User accounts default to `role='user'` and cannot access settings.
- After verifying the account owner, promote the specific user record in `public.maestroescape_accounts` to `admin`.
- `/settings`, `/settings/schema`, and `/api/settings` are protected on the Cloudflare Worker side.
- No Supabase Auth account or Takkershop partner/profile row is created.

The account backend uses isolated `maestroescape_*` tables and the dedicated Supabase Edge Function `maestroescape-accounts`. See [ACCOUNT_REGISTRATION.md](./ACCOUNT_REGISTRATION.md) for details, security limitations, and deployment checks.

`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and the retired `ACCOUNTS_STORE` Cloudflare binding are not used by current login.
