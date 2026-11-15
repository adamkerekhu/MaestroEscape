// MaestroEscape Supabase Auth bridge. Uses ONLY the public publishable key and the
// app-specific public.maestroescape_admins RLS allowlist. No service-role secrets.
const URL="https://djesmhxablodlzqfzqfa.supabase.co";
const KEY="sb_publishable_xcBa6fYyuclsRxWCF_BJ6g_XeHUThv6";
const ACCESS="maestro_sb_access",REFRESH="maestro_sb_refresh";
const common={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const headers=token=>({apikey:KEY,Authorization:"Bearer "+(token||KEY)});
const cookies=req=>Object.fromEntries((req.headers.get("cookie")||"").split(";").map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.indexOf("=");return [x.slice(0,p),x.slice(p+1)]}));
function tokenCookie(name,value,age){return name+"="+(value||"")+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+Math.max(0,age)}
const safeUser=user=>({id:user.id,email:user.email,role:user.isMaestroAdmin?"admin":"user",emailConfirmed:!!user.email_confirmed_at});
export function applyAuthCookies(response,session){
 if(!session?.cookieUpdates?.length)return response;
 const out=new Response(response.body,{status:response.status,headers:response.headers});
 for(const cookie of session.cookieUpdates)out.headers.append("set-cookie",cookie);
 return out;
}
async function upstream(path,options={}){
 const h=new Headers(options.headers||{});h.set("apikey",KEY);
 return fetch(URL+path,{...options,headers:h,redirect:"manual"});
}
async function decode(res){
 const type=res.headers.get("content-type")||"";
 if(!type.includes("application/json"))throw Error("Supabase returned an invalid response");
 return res.json();
}
async function checkAdmin(access,userId){
 const qs="/rest/v1/maestroescape_admins?select=user_id&user_id=eq."+encodeURIComponent(userId)+"&limit=1";
 const r=await upstream(qs,{headers:headers(access)});
 if(!r.ok)throw Error("Administrator lookup temporarily unavailable ("+r.status+")");
 const rows=await decode(r);return Array.isArray(rows)&&rows.length===1&&rows[0].user_id===userId;
}
async function resolveToken(access){
 if(!access)return null;
 const r=await upstream("/auth/v1/user",{headers:headers(access)});
 if(r.status===401||r.status===403)return null;
 if(!r.ok)throw Error("Supabase Auth verification failed ("+r.status+")");
 return decode(r);
}
async function refreshToken(value){
 if(!value)return null;
 const r=await upstream("/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({refresh_token:value})});
 if(!r.ok)return null;
 const d=await decode(r);
 return d?.access_token&&d?.refresh_token?d:null;
}
export async function accountFromRequest(req){
 const ck=cookies(req);let access=ck[ACCESS],refresh=ck[REFRESH],updates=[];
 try{
  let user=await resolveToken(access);
  if(!user&&refresh){
   const renewed=await refreshToken(refresh);
   if(renewed){access=renewed.access_token;refresh=renewed.refresh_token;updates=[tokenCookie(ACCESS,access,Math.max(60,renewed.expires_in||3600)),tokenCookie(REFRESH,refresh,604800)];user=await resolveToken(access)}
  }
  if(!user)return {user:null,cookieUpdates:[]};
  const isMaestroAdmin=await checkAdmin(access,user.id);
  return {user:safeUser({...user,isMaestroAdmin}),cookieUpdates:updates};
 }catch(error){console.error("Maestro Supabase account session failed",String(error));return {user:null,cookieUpdates:[],backendError:true}}
}
export async function accountAction(request,operation){
 const origin=new URL(request.url).origin;
 if(request.headers.get("origin")!==origin)return Response.json({ok:false,error:"Invalid request origin"},{status:403,headers:common});
 if(operation==="logout"){const result=Response.json({ok:true},{headers:common});result.headers.append("set-cookie",tokenCookie(ACCESS,"",0));result.headers.append("set-cookie",tokenCookie(REFRESH,"",0));return result}
 const type=request.headers.get("content-type")||"";
 if(!type.includes("application/json"))return Response.json({ok:false,error:"JSON required"},{status:415,headers:common});
 let raw;try{raw=await request.text();if(raw.length>4096)return Response.json({ok:false,error:"Request too large"},{status:413,headers:common})}catch{return Response.json({ok:false,error:"Invalid request"},{status:400,headers:common})}
 let body;try{body=JSON.parse(raw)}catch{return Response.json({ok:false,error:"Invalid JSON"},{status:400,headers:common})}
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"",password=body?.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=="string"||password.length<12||password.length>128)return Response.json({ok:false,error:"Enter a valid email and password (minimum 12 characters)."},{status:400,headers:common});
 try{
  const path=operation==="register"?"/auth/v1/signup?redirect_to="+encodeURIComponent(origin+"/account/login"):"/auth/v1/token?grant_type=password";
  const res=await upstream(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});
  const data=await decode(res);
  if(!res.ok)return Response.json({ok:false,error:data.msg||data.message||data.error_description||data.error||"Supabase Auth rejected the request"},{status:res.status,headers:common});
  if(operation==="register")return Response.json({ok:true,user:{email:data.user?.email||data.email||email},emailConfirmationRequired:!data.access_token,message:"Registration accepted. Check your email if confirmation is required."},{status:201,headers:common});
  if(!data.access_token||!data.refresh_token||!data.user?.id)return Response.json({ok:false,error:"Supabase did not return an authenticated session"},{status:502,headers:common});
  const isMaestroAdmin=await checkAdmin(data.access_token,data.user.id);
  const out=Response.json({ok:true,user:safeUser({...data.user,isMaestroAdmin})},{headers:common});
  out.headers.append("set-cookie",tokenCookie(ACCESS,data.access_token,Math.max(60,data.expires_in||3600)));
  out.headers.append("set-cookie",tokenCookie(REFRESH,data.refresh_token,604800));
  return out;
 }catch(error){console.error("Maestro Supabase Auth request failed",operation,String(error));return Response.json({ok:false,error:"Supabase authentication temporarily unavailable.",code:"SUPABASE_AUTH_UNAVAILABLE"},{status:503,headers:common})}
}
export async function accountStatus(){
 try{
  const r=await upstream("/auth/v1/settings",{method:"GET"});
  if(!r.ok)return Response.json({ok:false,backend:"supabase",code:"SUPABASE_AUTH_STATUS_FAILED",upstreamStatus:r.status},{status:503,headers:common});
  return Response.json({ok:true,backend:"supabase",project:"djesmhxablodlzqfzqfa",authReachable:true,version:"maestro-supabase-auth-v1"},{headers:common});
 }catch(error){console.error("Supabase status unavailable",String(error));return Response.json({ok:false,backend:"supabase",code:"SUPABASE_AUTH_UNREACHABLE"},{status:503,headers:common})}
}
export function loggedOutResponse(){
 const response=new Response(null,{status:303,headers:{...common,location:"/account/login"}});
 response.headers.append("set-cookie",tokenCookie(ACCESS,"",0));
 response.headers.append("set-cookie",tokenCookie(REFRESH,"",0));
 return response;
}
