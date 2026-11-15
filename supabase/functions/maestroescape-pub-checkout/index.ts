// MaestroEscape TEST checkout, isolated from Takkershop Stripe functions and tables.
// This function refuses live Stripe keys. No bartender fulfillment is triggered.
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_ROLE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const STRIPE_KEY=Deno.env.get("STRIPE_SECRET_KEY")||"";
const API=SUPABASE_URL+"/rest/v1/";
const APP_ORIGIN="https://maestroescape.adam-kerek.workers.dev";
const encoder=new TextEncoder();
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const digest=async s=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(s))))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const hasTestKey=()=>/^sk_test_/.test(STRIPE_KEY);
async function db(path,method="GET",body){
 const res=await fetch(API+path,{method,headers:{"apikey":SERVICE_ROLE,"authorization":"Bearer "+SERVICE_ROLE,"content-type":"application/json","prefer":"return=representation"},body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await res.text();let value=null;try{value=raw?JSON.parse(raw):null}catch{}
 if(!res.ok)throw new Error("DB_"+res.status+(value?.code?"_"+value.code:""));
 return value;
}
async function stripe(path,method="GET",form){
 const res=await fetch("https://api.stripe.com/v1/"+path,{method,headers:{"authorization":"Bearer "+STRIPE_KEY,...(form?{"content-type":"application/x-www-form-urlencoded"}:{})},body:form?.toString()});
 const response=await res.json();
 if(!res.ok)throw new Error("STRIPE_"+res.status+":"+String(response?.error?.message||"Checkout unavailable"));
 return response;
}
async function userFromSession(token){
 if(typeof token!=="string"||!/^[\w-]{43}$/.test(token))return null;
 const sessions=await db("maestroescape_sessions?select=account_id,expires_at&token_hash=eq."+encodeURIComponent(await digest(token))+"&limit=1");
 const session=sessions?.[0];if(!session||new Date(session.expires_at).getTime()<Date.now())return null;
 const accounts=await db("maestroescape_accounts?select=id,email&id=eq."+encodeURIComponent(session.account_id)+"&limit=1");
 return accounts?.[0]||null;
}
function validateCart(payload){
 const rows=payload?.items;
 if(!Array.isArray(rows)||!rows.length||rows.length>25)throw new Error("INVALID_CART");
 const totals=new Map();
 for(const line of rows){
  if(typeof line?.variant_id!=="string"||line.variant_id.length>140||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>20)throw new Error("INVALID_LINE");
  totals.set(line.variant_id,(totals.get(line.variant_id)||0)+line.quantity);
 }
 if([...totals.values()].some(q=>q>20))throw new Error("QUANTITY_LIMIT");
 return [...totals.entries()].map(([variant_id,quantity])=>({variant_id,quantity}));
}
const orderIdRE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function createCheckout(body,account){
 if(!hasTestKey())return json({ok:false,code:"STRIPE_TEST_KEY_REQUIRED",error:"Only Stripe TEST mode is permitted; live payments are disabled."},503);
 if(!["pub_left","pub_middle","pub_right","pub_upper"].includes(body.table_id))return json({ok:false,error:"Choose a valid Maestro Pub table"},400);
 if(body.terms_accepted!==true)return json({ok:false,error:"Please accept the test checkout terms."},400);
 if(typeof body.idempotency_key!=="string"||!orderIdRE.test(body.idempotency_key))return json({ok:false,error:"Invalid checkout request ID"},400);
 let cart;try{cart=validateCart(body)}catch(e){return json({ok:false,error:String(e.message)},400)}
 const ids=cart.map(x=>x.variant_id);
 const variants=await db("maestroescape_pub_variants?select=id,item_name,serving,price_huf,available&id=in.("+ids.map(x=>'"'+x.replace(/"/g,"")+'"').join(",")+")");
 const canonical=new Map((variants||[]).map(v=>[v.id,v]));
 if(cart.some(x=>!canonical.get(x.variant_id)?.available))return json({ok:false,error:"One or more items are unavailable. Refresh your basket."},409);
 const lines=cart.map(c=>{const v=canonical.get(c.variant_id);return {variant_id:c.variant_id,name:v.item_name,serving:v.serving,unit_price_huf:v.price_huf,quantity:c.quantity,line_total_huf:v.price_huf*c.quantity}});
 const subtotal=lines.reduce((t,x)=>t+x.line_total_huf,0);
 if(subtotal<=0||subtotal>200000)return json({ok:false,error:"Basket total is outside the permitted test range."},400);
 const fee=Math.floor((subtotal*12+50)/100),total=subtotal+fee;
 const orderId=crypto.randomUUID();
 const newOrder={id:orderId,account_id:account.id,table_id:body.table_id,lines,subtotal_huf:subtotal,service_fee_huf:fee,total_huf:total,idempotency_key:body.idempotency_key,payment_mode:"test",payment_status:"pending",fulfillment_status:"test_only"};
 let created;
 try{created=await db("maestroescape_pub_orders","POST",newOrder)}
 catch(e){if(String(e).includes("23505")||String(e).includes("DB_409"))return json({ok:false,error:"Checkout already started. Please review your existing order.",code:"DUPLICATE_CHECKOUT"},409);throw e}
 if(!created?.length)throw new Error("ORDER_NOT_CREATED");
 const form=new URLSearchParams();
 form.set("mode","payment");form.set("locale","hu");
 form.set("success_url",APP_ORIGIN+"/?mode=single&room=maestro-solo-test&pub_payment=return&pub_order="+orderId+"&session_id={CHECKOUT_SESSION_ID}");
 form.set("cancel_url",APP_ORIGIN+"/?mode=single&room=maestro-solo-test&pub_payment=cancelled");
 form.set("client_reference_id",orderId);
 form.set("customer_email",account.email);
 form.set("payment_method_types[0]","card");
 form.set("metadata[application]","maestroescape");
 form.set("metadata[maestro_order_id]",orderId);
 form.set("payment_intent_data[metadata][application]","maestroescape");
 form.set("payment_intent_data[metadata][maestro_order_id]",orderId);
 let lineIndex=0;
 for(const line of lines){
  const root="line_items["+lineIndex+"]";
  form.set(root+"[price_data][currency]","huf");
  // Stripe charges in HUF minor units, which are 1/100 of HUF for charges.
  form.set(root+"[price_data][unit_amount]",String(line.unit_price_huf*100));
  form.set(root+"[price_data][product_data][name]",line.name+" · "+line.serving);
  form.set(root+"[quantity]",String(line.quantity));lineIndex++;
 }
 const feeRoot="line_items["+lineIndex+"]";
 form.set(feeRoot+"[price_data][currency]","huf");
 form.set(feeRoot+"[price_data][unit_amount]",String(fee*100));
 form.set(feeRoot+"[price_data][product_data][name]","Maestro Pub service charge (12%)");
 form.set(feeRoot+"[quantity]","1");
 let session;
 try{
  session=await stripe("checkout/sessions","POST",form);
  if(!/^https:\/\/checkout\.stripe\.com\//.test(session.url||"")||session.livemode!==false)throw new Error("NOT_STRIPE_TEST_CHECKOUT");
 }catch(e){await db("maestroescape_pub_orders?id=eq."+orderId,"PATCH",{payment_status:"failed"});throw e}
 await db("maestroescape_pub_orders?id=eq."+orderId,"PATCH",{stripe_checkout_session_id:session.id,payment_status:"checkout_created"});
 return json({ok:true,order_id:orderId,checkout_url:session.url,subtotal_huf:subtotal,service_fee_huf:fee,total_huf:total,test_mode:true});
}
async function getPaymentStatus(body,account){
 if(typeof body?.order_id!=="string"||!orderIdRE.test(body.order_id))return json({ok:false,error:"Invalid order"},400);
 const records=await db("maestroescape_pub_orders?select=*&id=eq."+body.order_id+"&account_id=eq."+account.id+"&limit=1");
 const order=records?.[0];
 if(!order)return json({ok:false,error:"Order not found"},404);
 if(!order.stripe_checkout_session_id)return json({ok:true,payment_status:order.payment_status,test_mode:true,order_id:order.id});
 // Never trust query params or browser redirects as proof of payment.
 if(!hasTestKey())return json({ok:false,error:"Stripe test key unavailable"},503);
 const session=await stripe("checkout/sessions/"+encodeURIComponent(order.stripe_checkout_session_id));
 const matched=session.id===order.stripe_checkout_session_id && session.metadata?.application==="maestroescape" && session.metadata?.maestro_order_id===order.id
  && session.client_reference_id===order.id && session.livemode===false && session.currency==="huf" && Number(session.amount_total)===order.total_huf*100;
 if(!matched)return json({ok:false,error:"Stripe session did not match this order"},409);
 if(session.payment_status==="paid"&&order.payment_status!=="paid_test"){
  await db("maestroescape_pub_orders?id=eq."+order.id+"&payment_status=eq.checkout_created","PATCH",{payment_status:"paid_test",paid_at:new Date().toISOString(),stripe_payment_intent_id:typeof session.payment_intent==="string"?session.payment_intent:null});
 }
 return json({ok:true,order_id:order.id,payment_status:session.payment_status==="paid"?"paid_test":order.payment_status,total_huf:order.total_huf,test_mode:true,fulfillment_status:"test_only"});
}
Deno.serve(async request=>{
 try{
  if(!SERVICE_ROLE||!SUPABASE_URL)return json({ok:false,error:"Service not configured"},503);
  if(request.method==="GET"&&new URL(request.url).pathname.endsWith("/health"))return json({ok:true,backend:"maestroescape-stripe",test_key_configured:hasTestKey(),payments_enabled:hasTestKey(),fulfillment_enabled:false});
  if(request.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
  const raw=await request.text();if(raw.length>12000)return json({ok:false,error:"Payload too large"},413);
  let data;try{data=JSON.parse(raw)}catch{return json({ok:false,error:"Invalid JSON"},400)}
  const account=await userFromSession(data?.token);
  if(!account)return json({ok:false,error:"Sign in to order real drinks.",code:"LOGIN_REQUIRED"},401);
  if(data.op==="checkout")return await createCheckout(data,account);
  if(data.op==="status")return await getPaymentStatus(data,account);
  return json({ok:false,error:"Unknown operation"},404);
 }catch(error){console.error("Maestro Stripe test checkout error",String(error));return json({ok:false,error:"Checkout service unavailable",code:"PUB_CHECKOUT_FAILED"},503)}
});
