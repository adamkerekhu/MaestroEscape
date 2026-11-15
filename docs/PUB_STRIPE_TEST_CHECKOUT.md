# MaestroEscape · Pub webshop with Stripe TEST payments

## Current implementation
- Large 75vw x 92dvh desktop modal; 100vw/100dvh on phones.
- 10 categories, 85 products, 153 unit/serving price variants; live menu preview at `GET /api/pub/menu`.
- Category sidebar, product cards, search, serving selector, quantity control, basket, 12% service fee, test checkout terms.
- Game interaction: walk up to a table, press E, choose **Order REAL drinks**. A 75% viewport shop opens.
- Requires a signed-in MaestroEscape account (not a Takkershop login). Every order is bound to this account.
- `POST /api/pub/checkout` creates a Stripe TEST-mode Checkout Session and returns a Stripe-hosted URL. The browser redirects to Stripe.
- `POST /api/pub/payment-status` verifies the payment directly through Stripe after the redirect, checking amount, currency, namespace metadata and session ID. Browser redirects **never** prove payment.
- All amounts are recalculated from database rows. HUF Stripe charge amounts are converted to minor units using `*100`; 12% fee uses integer rounding.
- New records stored only in `public.maestroescape_pub_variants` and `public.maestroescape_pub_orders`. The existing Takkershop orders, partners, invoices, payment statuses, webhooks and Stripe checkout Edge Functions were not changed.
- New dedicated Supabase Edge Function `maestroescape-pub-checkout` deployed using the existing Stripe secret configured in the same Supabase project.
- Critical safeguard: checkout rejects any non-`sk_test_*` Stripe key. **Live payment and bartender fulfillment remain disabled**, by design.

## Supabase objects
- Migration SQL: `supabase/maestroescape_pub_checkout_schema.sql`.
- Catalog seed: `supabase/maestroescape_pub_catalog_seed.sql`.
- Function source: `supabase/functions/maestroescape-pub-checkout/index.ts`.

## Deployment
GitHub commits do not deploy Cloudflare. Deploy the latest main branch and verify:
1. `GET /api/pub/status` returns `stripe_test_enabled:true`. If false, check Supabase Edge Function's `STRIPE_SECRET_KEY` configuration. The key must be a **test** secret key; never copy secrets into GitHub.
2. Sign in at `/account/login`.
3. Walk to a table, open the test webshop, select different sizes and adjust quantities.
4. Confirm example basket: Dreher Gold 0.3 L 1,350 Ft + 0.5 L 1,950 Ft = 3,300 Ft, service fee 396 Ft, total 3,696 Ft.
5. Tick both checkboxes, click **Pay with Stripe TEST**. Stripe-hosted checkout should open. Use a Stripe-provided test card only. No money will be charged.
6. After Stripe success, return to the game and confirm payment status in the toast.
7. Verify the test order is in the `maestroescape_pub_orders` table with `payment_status='paid_test'`. There should be no Takkershop order or invoice changes.

## Not ready for real customers
- There is no live Stripe charge or settlement. Do not claim users have paid real money.
- There is no bartender device/order dashboard or reliable staff acknowledgment.
- Physical table verification / anti-remote-order control still needs implementing.
- Pub terms, age verification, invoicing/fiscal receipt workflow, privacy requirements and chargeback/refund procedures still require operator approval.
- A dedicated production Stripe webhook must be configured for reliable event-driven fulfillment. Do **not** register this new webhook on or alter Takkershop's existing `stripe-webhook` function.
- Admin approval remains manual.

These production blockers must be addressed before enabling real orders.
