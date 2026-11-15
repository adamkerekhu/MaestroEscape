# MaestroEscape · Pub webshop with Stripe TEST payments

## Current implementation
- Large 75vw x 92dvh desktop modal; 100vw/100dvh on phones. The checkout stage uses a 56% green order review on the left and 44% Stripe embedded payment panel on the right (stacked on mobile).
- 10 categories, 85 products, 153 unit/serving price variants; live menu preview at `GET /api/pub/menu`.
- Category sidebar, product cards, search, serving selector, quantity control, basket, 12% service fee, test checkout terms.
- Game interaction: walk up to a table, press E, choose **Order REAL drinks**. A 75% viewport shop opens.
- Requires a signed-in MaestroEscape account (not a Takkershop login). Every order is bound to this account.
- `POST /api/pub/checkout` creates a Stripe TEST-mode `ui_mode=embedded_page` Checkout Session and returns a `client_secret` with the Stripe TEST publishable key. Stripe.js mounts `initEmbeddedCheckout` inside the right-side payment panel, without redirecting off-game for ordinary card payments.
- `POST /api/pub/payment-status` verifies the payment directly through Stripe after the embedded form completes or an authentication redirect returns, checking amount, currency, namespace metadata and session ID. Neither a browser callback nor redirect alone proves payment.
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
5. Tick both checkboxes, click **Pay with Stripe TEST**. The drink list switches to a green order overview (left), while Stripe Embedded Checkout appears on the right, within the Maestro window. Use a Stripe-provided test card only. No money will be charged.
6. After Stripe success, confirm the order status returned by the backend inside the Stripe panel. An authentication redirect back to the game also triggers server-side verification.
7. Verify the test order is in the `maestroescape_pub_orders` table with `payment_status='paid_test'`. There should be no Takkershop order or invoice changes.

## Not ready for real customers
- There is no live Stripe charge or settlement. Do not claim users have paid real money.
- There is no bartender device/order dashboard or reliable staff acknowledgment.
- Physical table verification / anti-remote-order control still needs implementing.
- Pub terms, age verification, invoicing/fiscal receipt workflow, privacy requirements and chargeback/refund procedures still require operator approval.
- A dedicated production Stripe webhook must be configured for reliable event-driven fulfillment. Do **not** register this new webhook on or alter Takkershop's existing `stripe-webhook` function.
- Admin approval remains manual.

These production blockers must be addressed before enabling real orders.

## Embedded checkout requirements
- The project's existing Stripe environment must provide **matching** `STRIPE_SECRET_KEY` with `sk_test_...` and `STRIPE_PUBLISHABLE_KEY` with `pk_test_...`. The Edge Function fails closed otherwise.
- Stripe.js loads directly from `https://js.stripe.com/v3/`; card fields are rendered in Stripe-managed secure frames. Do not embed the hosted checkout URL in a generic iframe.
- Checkout view has an **Edit drinks** action that safely destroys the existing Stripe form. Starting a revised basket creates a new test order and checkout session.
- Checkout completion confirms payment by calling `/api/pub/payment-status`; no client-side optimistic paid statuses.
- Cloudflare deploy is separate from the deployed Supabase Edge Function. Verify both before using test cards.
