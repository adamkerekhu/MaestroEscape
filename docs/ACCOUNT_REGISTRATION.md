# MaestroEscape registration and administrator approval

## Implemented

- Registration page: `/account/register`.
- Login page: `/account/login`.
- Account status: `/account`.
- Registration creates a persistent user account in the Cloudflare `MaestroAccounts` Durable Object. Each account has role `user`, **never** `admin` by registration.
- Passwords are salted and stretched with PBKDF2-SHA256 (210,000 iterations). No plaintext passwords are stored.
- Login sets a Secure HttpOnly SameSite=Lax session cookie. Sessions expire after seven days; logout revokes server-side session.
- Settings routes `/settings`, `/settings/schema` and `/api/settings` require a registered account with role `admin`.
- No account is automatically an admin. The previously used `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` settings do not grant access through these new routes.
- Account routes are separately rate-limited and account emails are not published in game UI.

## Activation
The code is committed to GitHub. **A successful Wrangler deployment of the latest main branch is required**; GitHub commits alone do not change the running Worker. Check that Cloudflare applies the `maestro-accounts-v5` migration and has the `ACCOUNTS_STORE` binding.

Open `https://maestroescape.adam-kerek.workers.dev/account/register` and register with an email and password of at least 12 characters, then sign in.

Registration does **not** verify control of the email address. Do not grant admin rights solely because someone typed the email you expected. Email verification or another trusted verification step must be added before promoting users.

## Future admin promotion
There is deliberately no public admin-promotion endpoint. After a specific account is registered, implement a narrowly authorized one-time administrative promotion through authenticated Cloudflare administration, or a separate one-time setup secret, verifying account ownership first. Do not change the registration code to make the first registrant or a known email automatically admin.

## Tests
`npm run check`; verify registration, duplicate emails, wrong password, login, logout, sessions and the settings authorization guard. In incognito, `/settings` must redirect to login. A regular user's `/settings` request must redirect to their account page; direct calls to `/api/settings` must return 403.

## Known next-step limitations
- Email verification, password reset and MFA are not yet implemented.
- Password sign-in is used only for account identity, not payment.
- All normal gameplay remains single-player. The live real-order endpoint stays disabled.
