// MaestroEscape's standalone account service. All SQL objects are maestroescape_*.
// Does NOT call Supabase Auth or write to Takkershop profiles/partners.
const base=Deno.env.get("SUPABASE_URL")||"";
const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const enc=new TextEncoder();
const js=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const b64=arr=>btoa(String.fromCharCode(...arr)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const sha=async s=>b64(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))));
const equal=(a,b)=>{const x=enc.encode(a),y=enc.encode(b);if(x.length!==y.length)return false;let z=0;for(let i=0;i<x.length;i++)z|=x[i]^y[i];return z===0};
async function pwHash(p,s){
 const key=await crypto.subtle.importKey("raw",enc.encode(p),"PBKDF2",false,["deriveBits"]);
 return b64(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(s),iterations:210000,hash:"SHA-256"},key,256)));
}
async function db(path,method="GET",body=null){
 const r=await fetch(base+"/rest/v1/"+path,{method,headers:{"apikey":service,"Authorization":"Bearer "+service,"content-type":"application/json","prefer":"return=representation"},body:body===null?undefined:JSON.stringify(body)});
 const text=await r.text();let value;try{value=text?JSON.parse(text):null}catch{value=null}
 if(!r.ok)throw new Error("DATABASE_"+r.status+(value?.code?"_"+value.code:""));
 return value;
}
const user=u=>({id:u.id,email:u.email,role:u.role,createdAt:u.created_at,emailConfirmed:false});
async function limited(key,max,seconds){
 const x=await db("rpc/maestroescape_check_limit","POST",{p_key:await sha(key),p_limit:max,p_window_seconds:seconds});
 return x===true;
}
const accountColumns="id,email,password_salt,password_hash,role,created_at";
async function run(req){
 if(!base||!service)return js({ok:false,error:"Account service not configured",code:"CONFIG_MISSING"},503);
 if(req.method==="GET"&&new URL(req.url).pathname.endsWith("/health")){
  await db("maestroescape_accounts?select=id&limit=0");
  return js({ok:true,backend:"supabase-isolated",storageReachable:true});
 }
 if(req.method!=="POST")return js({ok:false,error:"Method not allowed"},405);
 const raw=await req.text();
 if(raw.length>4096)return js({ok:false,error:"Request too large"},413);
 let data;try{data=JSON.parse(raw)}catch{return js({ok:false,error:"Invalid JSON"},400)}
 const op=data?.op;
 if(!["register","login","session","logout"].includes(op))return js({ok:false,error:"Unknown operation"},404);
 if(op==="register"||op==="login"){
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  const password=data.password;
  if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)||typeof password!=="string"||password.length<12||password.length>128)return js({ok:false,error:"Valid email and password of 12-128 characters required."},400);
  const ip=(req.headers.get("x-forwarded-for")||req.headers.get("cf-connecting-ip")||"unknown").split(",")[0].slice(0,120);
  if(!await limited(op+":ip:"+ip,op==="register"?5:30,3600)||!await limited(op+":email:"+email,op==="register"?3:15,3600))return js({ok:false,error:"Too many attempts. Try again later."},429);
  if(op==="register"){
   const salt=b64(crypto.getRandomValues(new Uint8Array(24)));
   const account={email,password_salt:salt,password_hash:await pwHash(password,salt),role:"user"};
   try{const rows=await db("maestroescape_accounts","POST",account);return js({ok:true,user:user(rows[0]),message:"Account created. Administrator access is not enabled."},201)}
   catch(e){if(String(e).includes("23505")||String(e).includes("DATABASE_409"))return js({ok:false,error:"Account already exists. Please sign in."},409);throw e}
  }
  const rows=await db("maestroescape_accounts?select="+accountColumns+"&email=eq."+encodeURIComponent(email)+"&limit=1");
  const account=rows?.[0];
  const digest=await pwHash(password,account?.password_salt||"not-a-valid-account-salt");
  if(!account||!equal(digest,account.password_hash))return js({ok:false,error:"Incorrect email or password."},401);
  const token=b64(crypto.getRandomValues(new Uint8Array(32)));
  const expires=new Date(Date.now()+7*24*3600*1000).toISOString();
  await db("maestroescape_sessions","POST",{token_hash:await sha(token),account_id:account.id,expires_at:expires});
  return js({ok:true,user:user(account),token,expiresAt:expires});
 }
 const token=data?.token;
 if(typeof token!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(token))return js({ok:false,error:"Session not found"},401);
 const tokenHash=await sha(token);
 if(op==="logout"){await db("maestroescape_sessions?token_hash=eq."+encodeURIComponent(tokenHash),"DELETE");return js({ok:true})}
 const sessions=await db("maestroescape_sessions?select=account_id,expires_at&token_hash=eq."+encodeURIComponent(tokenHash)+"&limit=1");
 const session=sessions?.[0];
 if(!session||new Date(session.expires_at).getTime()<=Date.now())return js({ok:false,error:"Session expired"},401);
 const rows=await db("maestroescape_accounts?select=id,email,role,created_at&id=eq."+encodeURIComponent(session.account_id)+"&limit=1");
 return rows?.[0]?js({ok:true,user:user(rows[0])}):js({ok:false,error:"Account not found"},401);
}
Deno.serve(async req=>{try{return await run(req)}catch(error){console.error("MaestroEscape isolated accounts",String(error));return js({ok:false,error:"Account service temporarily unavailable",code:"ACCOUNT_DATABASE_ERROR"},503)}});
