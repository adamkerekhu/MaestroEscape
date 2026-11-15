// MaestroEscape accounts reside only in maestroescape_* tables in the selected
// Supabase project. They do not use Supabase Auth, auth.users or Takkershop data.
const API="https://djesmhxablodlzqfzqfa.supabase.co/functions/v1/maestroescape-accounts";
const KEY="sb_publishable_xcBa6fYyuclsRxWCF_BJ6g_XeHUThv6"; // Public publishable key, not a secret.
const COOKIE="maestro_account";
const common={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
function sessionCookie(value,age){return COOKIE+"="+(value||"")+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+Math.max(0,age)}
function sessionToken(req){
 const cookie=(req.headers.get("cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(COOKIE+"="));
 return cookie?cookie.slice(COOKIE.length+1):"";
}
async function gateway(path,body){
 const response=await fetch(API+path,{method:body===undefined?"GET":"POST",
   headers:{"apikey":KEY,"content-type":"application/json"},
   ...(body===undefined?{}:{body:JSON.stringify(body)})});
 const type=response.headers.get("content-type")||"";
 if(!type.includes("application/json"))throw Error("Maestro account function returned non-JSON (HTTP "+response.status+")");
 const result=await response.json();
 return {status:response.status,body:result};
}
export function applyAuthCookies(response){return response}
export async function accountFromRequest(request){
 const token=sessionToken(request);
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return {user:null};
 try{
  const reply=await gateway("",{op:"session",token});
  return {user:reply.status===200&&reply.body?.ok?reply.body.user:null,backendError:reply.status>=500};
 }catch(error){console.error("Maestro session lookup failed",String(error));return {user:null,backendError:true}}
}
export async function accountAction(request,operation){
 if(request.headers.get("origin")!==new URL(request.url).origin)
  return Response.json({ok:false,error:"Invalid origin"},{status:403,headers:common});
 if(operation==="logout"){
  const token=sessionToken(request);
  try{if(token)await gateway("",{op:"logout",token})}catch(error){console.error("Maestro logout backend unavailable",String(error))}
  const response=Response.json({ok:true},{headers:common});response.headers.append("set-cookie",sessionCookie("",0));return response;
 }
 if(!(request.headers.get("content-type")||"").includes("application/json"))
  return Response.json({ok:false,error:"JSON required"},{status:415,headers:common});
 let raw;try{raw=await request.text()}catch{return Response.json({ok:false,error:"Invalid request"},{status:400,headers:common})}
 if(raw.length>4096)return Response.json({ok:false,error:"Request too large"},{status:413,headers:common});
 let payload;try{payload=JSON.parse(raw)}catch{return Response.json({ok:false,error:"Invalid JSON"},{status:400,headers:common})}
 const email=typeof payload?.email==="string"?payload.email.trim().toLowerCase():"";
 const password=payload?.password;
 if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)||typeof password!=="string"||password.length<12||password.length>128)
  return Response.json({ok:false,error:"Valid email and password of 12–128 characters required."},{status:400,headers:common});
 try{
  const reply=await gateway("",{op:operation,email,password});
  if(reply.status<200||reply.status>=300)return Response.json(reply.body,{status:reply.status,headers:common});
  if(operation==="register")return Response.json({ok:true,user:reply.body.user,message:"Registration complete. Sign in with your new account."},{status:201,headers:common});
  if(!reply.body?.token||!reply.body?.user)return Response.json({ok:false,error:"Account service did not return a session"},{status:502,headers:common});
  const response=Response.json({ok:true,user:reply.body.user},{headers:common});
  response.headers.append("set-cookie",sessionCookie(reply.body.token,604800));
  return response;
 }catch(error){console.error("Maestro registration backend failed",operation,String(error));
  return Response.json({ok:false,error:"Maestro account service temporarily unavailable",code:"ACCOUNT_SERVICE_UNAVAILABLE"},{status:503,headers:common})}
}
export async function accountStatus(){
 try{
  const result=await gateway("/health");
  return Response.json({ok:result.status===200&&result.body?.ok===true,backend:"supabase-isolated",storageReachable:result.body?.storageReachable===true,version:"maestro-standalone-account-v1"},{status:result.status===200?200:503,headers:common});
 }catch(error){console.error("Maestro account health failed",String(error));return Response.json({ok:false,backend:"supabase-isolated",code:"ACCOUNT_EDGE_UNAVAILABLE"},{status:503,headers:common})}
}
export function loggedOutResponse(){
 const response=new Response(null,{status:303,headers:{...common,location:"/account/login"}});
 response.headers.append("set-cookie",sessionCookie("",0));
 return response;
}
