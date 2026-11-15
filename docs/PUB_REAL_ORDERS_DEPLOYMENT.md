# Maestro Pub real ordering: deployment status

## Currently committed
- Full corrected menu: `data/pub-menu.json`, `src/pub-menu-data.js` (10 categories, 85 drinks, 153 serving-price variants).
- Game table interaction now offers **Order REAL drinks**, without removing existing virtual consumables.
- Responsive categories → drinks → size/quantity → basket → confirmation preview via `src/pub-orders-client.js`.
- Worker preview endpoints: `GET /api/pub/menu`, `GET /api/pub/status`, and `GET /assets/pub-orders.js`.
- Safety gate: `POST /api/pub/orders` returns HTTP 503 `PUB_ORDERS_DISABLED`. No real orders are accepted.
- Restricted database migration draft: `supabase/migrations/20261115_pub_real_orders.sql`.
- Regression tests: `tests/pub-orders.test.mjs`.

## NOT deployed or enabled
1. No dedicated MaestroEscape Supabase project was identified; do **not** apply this migration to Fair Flights or Takkershop.
2. Production database seeding, verified physical table sessions, staff identity/authorization, transaction-safe server pricing and persistence, staff order dashboard and realtime status tracking are **not implemented**.
3. The pub's approved ordering terms, privacy copy, table numbers and fiscal process remain unconfirmed.
4. No Cloudflare Wrangler deploy was executed. GitHub commits alone are not proof of live deployment.

## For the next backend release
1. Provision and configure a dedicated MaestroEscape database, review migration for production and apply only after approval.
2. Seed categories/items/variants idempotently from `data/pub-menu.json`, never overwrite staff-modified prices.
3. Implement transactional order creation with canonical database pricing; verified short-lived staff-activated table sessions; unique idempotency keys; restricted staff listing and order status transitions.
4. Build staff dashboard and order polling/realtime.
5. Supply approved published terms. Confirm 12% service fee and receipt process with pub operator.
6. Run `npm run check`; deploy through authenticated Wrangler/CI; verify all endpoints and real-device behavior; only then activate real orders.

## Safety
Do not change `PUB_ORDERS_DISABLED` to a live success response. The current checkout is a non-transactional preview, not a cashier or payment system.
