# MaestroEscape accounts in shared Supabase project (isolated)

## Project
Supabase URL: https://djesmhxablodlzqfzqfa.supabase.co
Supabase project ID: djesmhxablodlzqfzqfa

**Important isolation:** the project's existing `auth.users` trigger creates Takkershop `partners` and `profiles` rows. For this reason MaestroEscape deliberately DOES NOT use Supabase Auth registration. It uses its own dedicated, prefixed tables and a dedicated Edge Function. Do not switch account registration to `/auth/v1/signup` unless the shared trigger has been safely redesigned with agreement from the Takkershop owner.

## New objects only
- `public.maestroescape_accounts`: email, salted PBKDF2 password hash and role (default `user`)
- `public.maestroescape_sessions`: SHA-256-hashed bearer session identifiers
- `public.maestroescape_auth_limits`: registration and login attempt limits
- `public.maestroescape_check_limit`: service-role-only rate-limit function
- Supabase Edge Function `maestroescape-accounts` (JWT gateway verification disabled because this standalone function verifies its own credentials)
- All tables have RLS enabled and `anon`/`authenticated` grants revoked.
- No data is written into the existing Takkershop tables, `auth.users`, `profiles`, or `partners`.

## Workflow
1. `GET /account/register` renders account registration.
2. `POST /api/account/register` forwards data to the new Supabase Edge Function; role is always `user`.
3. `POST /api/account/login` creates a server-side session and sets a Secure, HttpOnly, SameSite=Lax cookie.
4. `GET /api/account/me` validates the session via the Supabase Edge Function.
5. `GET /settings`, `GET /settings/schema` and `/api/settings` require `role = 'admin'`.
6. Admin approval is manual; there is NO public role-promotion endpoint.

## Promote a registered account after verifying identity
Inspect `public.maestroescape_accounts` for the registered account ID and email, verify it belongs to the intended owner using a trustworthy channel, then use an authenticated administrative database operation to update ONLY that row:
```sql
update public.maestroescape_accounts
set role = 'admin'
where id = '<verified-maestroescape-account-uuid>';
```
Do not use email string alone as proof of identity. Registration currently has no email-verification service. Never grant admin rights automatically to the first registration.

## Deployment and checks
Supabase migration and dedicated Edge Function have been applied/deployed. GitHub updates to Cloudflare Worker still need a Wrangler deployment.
- `GET /api/account/status`: should report `backend: "supabase-isolated"` and `storageReachable: true`
- Register new user, sign in, reload account page, sign out, and verify you cannot reach Settings as a standard user.
- Promote ONLY the verified MaestroEscape account, then test /settings access.
- Existing published game link retired for `room=maestro-main` remains blocked.
- Real pub ordering remains disabled.

## Limitations
- Email addresses are not yet verified; password reset and MFA are not implemented.
- Password hashes are generated with 210,000 iterations PBKDF2-SHA256 and per-user random salts.
- Edge Function uses Supabase-hosted `SUPABASE_SERVICE_ROLE_KEY` on the server only. Never return it or commit it to GitHub.
- There are legacy Cloudflare Durable Object migration entries for account storage, but the live account API no longer uses them.
