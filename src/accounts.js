// Durable Object account store. No account receives administrator privileges through registration.
const te=new TextEncoder();
const ttl=7*24*3600*1000;
const H={"cache-control":"no-store","x-content-type-options":"nosniff"};
const b64=b=>btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const hash=async value=>b64(new Uint8Array(await crypto.subtle.digest("SHA-256",te.encode(value))));
const equal=(a,b)=>{const aa=te.encode(a),bb=te.encode(b);if(aa.length!==bb.length)return false;let n=0;for(let i=0;i<aa.length;i++)n|=aa[i]^bb[i];return n===0};
async function passwordHash(password,salt){const bytes=await crypto.subtle.importKey("raw",te.encode(password),"PBKDF2",false,["deriveBits"]);return b64(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:te.encode(salt),iterations:210000,hash:"SHA-256"},bytes,256)))}
const json=(data,status=200)=>Response.json(data,{status,headers:H});
const sanitize=user=>({id:user.id,email:user.email,role:user.role,createdAt:user.createdAt});
export class MaestroAccounts{
 constructor(ctx,env){this.ctx=ctx;this.env=env}
 async fetch(request){
  const path=new URL(request.url).pathname;
  try{
   if(path==="/health"&&request.method==="GET"){
    // Exercise Durable Object storage rather than reporting only binding existence.
    await this.ctx.storage.get("accounts:healthcheck");
    return json({ok:true,service:"MaestroAccounts",storageReachable:true,version:"accounts-health-v2"});
   }
   if(path==="/session")return await this.session(request);
   if(request.method!=="POST")return json({ok:false,error:"Method not allowed"},405);
   if(path==="/register")return await this.register(request);
   if(path==="/login")return await this.login(request);
   if(path==="/logout")return await this.logout(request);
   return json({ok:false,error:"Unknown operation"},404);
  }catch(e){console.error("Account storage operation failed",e);return json({ok:false,error:"Account service unavailable"},503)}
 }
 async rate(key,max,minutes){
  const k="rate:"+await hash(key),now=Date.now();let r=await this.ctx.storage.get(k);
  if(!r||r.expires<now)r={count:0,expires:now+minutes*60000};
  r.count++;await this.ctx.storage.put(k,r);
  return r.count<=max;
 }
 async register(request){
  const body=await request.json();
  const email=String(body.email||"").trim().toLowerCase(),password=body.password;
  if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)||typeof password!=="string"||password.length<12||password.length>128)return json({ok:false,error:"Enter a valid email and a password of 12–128 characters."},400);
  if(!await this.rate("register:"+request.headers.get("x-client-ip"),5,60))return json({ok:false,error:"Too many registrations. Try later."},429);
  const key="user:"+await hash(email);
  if(await this.ctx.storage.get(key))return json({ok:false,error:"Account already exists. Please sign in."},409);
  const salt=b64(crypto.getRandomValues(new Uint8Array(24)));
  const user={id:crypto.randomUUID(),email,salt,passwordHash:await passwordHash(password,salt),role:"user",createdAt:new Date().toISOString()};
  await this.ctx.storage.put(key,user);
  return json({ok:true,user:sanitize(user),message:"Account registered. Awaiting administrator approval for settings access."},201);
 }
 async login(request){
  const body=await request.json();
  const email=String(body.email||"").trim().toLowerCase(),password=body.password;
  if(typeof password!=="string"||password.length>128||email.length>256)return json({ok:false,error:"Invalid credentials"},401);
  if(!await this.rate("login:"+request.headers.get("x-client-ip"),20,15))return json({ok:false,error:"Too many attempts. Try later."},429);
  if(!await this.rate("login-email:"+email,12,15))return json({ok:false,error:"Too many attempts. Try later."},429);
  const user=await this.ctx.storage.get("user:"+await hash(email));
  const salt=user?.salt||"invalid";
  const digest=await passwordHash(password,salt);
  if(!user||!equal(digest,user.passwordHash))return json({ok:false,error:"Invalid email or password"},401);
  const token=b64(crypto.getRandomValues(new Uint8Array(32)));
  const expires=Date.now()+ttl;
  await this.ctx.storage.put("session:"+await hash(token),{email:user.email,expires});
  return json({ok:true,user:sanitize(user),token,expires},200);
 }
 async session(request){
  const token=request.headers.get("x-session-token")||"";
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))return json({ok:false,error:"Not authenticated"},401);
  const key="session:"+await hash(token);
  const session=await this.ctx.storage.get(key);
  if(!session||session.expires<Date.now())return json({ok:false,error:"Session expired"},401);
  const user=await this.ctx.storage.get("user:"+await hash(session.email));
  if(!user)return json({ok:false,error:"Account not found"},401);
  return json({ok:true,user:sanitize(user)});
 }
 async logout(request){
  const token=request.headers.get("x-session-token")||"";
  if(/^[A-Za-z0-9_-]{43}$/.test(token))await this.ctx.storage.delete("session:"+await hash(token));
  return json({ok:true});
 }
}
