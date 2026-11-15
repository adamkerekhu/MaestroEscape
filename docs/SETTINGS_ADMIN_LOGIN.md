# MaestroEscape settings administrator login

## What is protected
- `GET /settings` redirects to `/admin/login` unless an administrator session exists.
- `GET /settings/schema` and all `/api/settings` calls return HTTP 401 unless authenticated.
- Settings-changing HTTP requests also require a same-origin `Origin` header.
- `POST /admin/logout` expires the secure administrator session cookie.
- Normal game routes remain publicly accessible. This protects **settings only**, not the entire game or client-side development tools.

## REQUIRED: Configure Cloudflare Worker secrets
There are no passwords or secret keys in the repository. Create two different high-entropy random values (minimum lengths shown):

```sh
npx wrangler secret put ADMIN_PASSWORD
# Enter a unique, strong password of 20 or more characters when prompted.
npx wrangler secret put ADMIN_SESSION_SECRET
# Enter a different random secret of 32 or more characters.
```

Run from the MaestroEscape project directory while logged into the correct Cloudflare account. Wrangler may deploy a new version on secret change; verify which version is active. **Do not** put secrets in `wrangler.toml`, GitHub, screenshots, or chat. Use a password manager.

After secrets are set and the latest code is deployed:

1. Open `https://maestroescape.adam-kerek.workers.dev/settings` in a private browser window.
2. You should be redirected to `/admin/login`.
3. Enter the configured `ADMIN_PASSWORD`. The app sets an HttpOnly, Secure, SameSite=Strict cookie valid for 12 hours.
4. Confirm the settings page loads; make a harmless settings edit, reload and check it persists as expected.
5. Press **Log out** and check `/settings` is inaccessible again.
6. Unauthenticated calls to `/api/settings` or `/settings/schema` must return 401.

### Safety and limitations
If one or both secrets are not configured, login fails closed with HTTP 503. Do not remove the guard to make login work. Anyone who learns the admin password can sign in, so this is password-only identity, not individual email-account verification. Recommend Cloudflare Access with a single allowed email and MFA for stronger "only me" enforcement.

Client-side Single Player Test Mode stores local configuration and can be manipulated by each person in their own browser; this login does not make browser-local variables private. The centralized Cloudflare settings API is protected.

For an additional defense against password guessing, configure a Cloudflare WAF rate-limiting rule for `/admin/login`, e.g. a low threshold of failed POSTs from one IP. The login form should never be indexed.
