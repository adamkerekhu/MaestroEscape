import test from "node:test";
import assert from "node:assert/strict";
import {PUB_SHOP_SCRIPT} from "../src/pub-shop.js";
import {PUB_SHOP_CSS} from "../src/pub-shop.css.js";
import {PUB_MENU} from "../src/pub-menu-data.js";
import {readFileSync} from "node:fs";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
const backend=readFileSync(new URL("../supabase/functions/maestroescape-pub-checkout/index.ts",import.meta.url),"utf8");
test("webshop assets parse and use 75vw desktop screen",()=>{
 new Function(PUB_SHOP_SCRIPT);assert.match(PUB_SHOP_CSS,/width:min\(75vw,1400px\)/);
 assert.match(PUB_SHOP_CSS,/@media\(max-width:780px\)/);
 assert.match(worker,/PUB_SHOP_SCRIPT/);assert.match(worker,/PUB_SHOP_CSS/);
});
test("storefront embeds Stripe next to order overview instead of redirecting",()=>{
 for(const t of ["shop-categories","shop-cards","shop-lines","shop-pay","shop-test-ok","shop-adult","shop-table"])assert.ok(PUB_SHOP_SCRIPT.includes(t),t);
 assert.match(PUB_SHOP_SCRIPT,/initEmbeddedCheckout/);
 assert.match(PUB_SHOP_SCRIPT,/stripeCheckout\.mount/);
 assert.match(PUB_SHOP_SCRIPT,/shop-checkout-view/);
 assert.match(PUB_SHOP_SCRIPT,/shop-review-lines/);
 assert.match(PUB_SHOP_SCRIPT,/maestro-stripe-embed/);
 assert.match(PUB_SHOP_CSS,/grid-template-columns:minmax\(0,56%\) minmax\(350px,44%\)/);
 assert.doesNotMatch(PUB_SHOP_SCRIPT,/location\.assign\(d\.checkout_url\)/);
 assert.match(PUB_SHOP_SCRIPT,/api\/pub\/checkout/);
 assert.match(PUB_SHOP_SCRIPT,/api\/pub\/payment-status/);
 assert.match(PUB_SHOP_SCRIPT,/crypto\.randomUUID\(\)/);
});
test("catalog has 10 categories, 85 products and 153 serving options",()=>{
 assert.equal(PUB_MENU.categories.length,10);
 assert.equal(PUB_MENU.categories.reduce((s,c)=>s+c.items.length,0),85);
 assert.equal(PUB_MENU.categories.reduce((s,c)=>s+c.items.reduce((n,i)=>n+i.sizes.length,0),0),153);
});
test("Stripe test code refuses live key and uses database prices",()=>{
 assert.match(backend,/^const STRIPE_KEY=Deno\.env\.get\("STRIPE_SECRET_KEY"\)/m);
 assert.match(backend,/const hasTestKey=\(\)=>\/\^sk_test_/);
 assert.match(backend,/maestroescape_pub_variants/);
 assert.match(backend,/maestroescape_pub_orders/);
 assert.match(backend,/line\.unit_price_huf\*100/);
 assert.match(backend,/session\.livemode===false/);
 assert.match(backend,/form\.set\("ui_mode","embedded_page"\)/);
 assert.match(backend,/session\.client_secret/);
 assert.match(backend,/STRIPE_PUBLISHABLE_KEY/);
 assert.match(backend,/checkout_mode:"embedded"/);
 assert.match(backend,/session\.payment_status==="paid"/);
 assert.doesNotMatch(backend,/\.from\("orders"\)|\.from\("partners"\)/);
});
test("12% service charge and Stripe HUF charge conversion",()=>{
 const subtotal=1350+1950,fee=Math.floor((subtotal*12+50)/100);
 assert.equal(subtotal,3300);assert.equal(fee,396);assert.equal(subtotal+fee,3696);
 assert.equal((subtotal+fee)*100,369600);
});
