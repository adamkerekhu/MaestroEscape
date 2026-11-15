// Worker-only, password-protected settings session. Secrets are Cloudflare Worker secrets.
const encoder=new TextEncoder();
const cookieName="maestro_settings_admin";
const twelveHours=12*60*60;
const headers={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const secure=(a,b)=>{if(a.byteLength!==b.byteLength)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0};
const bytes=async value=>new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)));
const signingKey=async secret=>crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
const encode=data=>btoa(String.fromCharCode(...new Uint8Array(data))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function sign(message,secret){return encode(await crypto.subtle.sign("HMAC",await signingKey(secret),encoder.encode(message)))}
const validSecrets=env=>typeof env?.ADMIN_PASSWORD==="string"&&env.ADMIN_PASSWORD.length>=20&&typeof env?.ADMIN_SESSION_SECRET==="string"&&env.ADMIN_SESSION_SECRET.length>=32;
const cookies=request=>Object.fromEntries((request.headers.get("cookie")||"").split(";").map(x=>x.trim().split(/=(.*)/s).slice(0,2)).filter(([k,v])=>k&&v));
export async function adminAuthorized(request,env){
 if(!validSecrets(env))return false;
 const token=cookies(request)[cookieName]||"";
 const match=/^(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
 if(!match)return false;
 const expires=Number(match[1]),now=Math.floor(Date.now()/1000);
 if(expires<now||expires>now+twelveHours)return false;
 const expected=await sign("maestro-settings-admin-v1."+match[1],env.ADMIN_SESSION_SECRET);
 return secure(encoder.encode(match[2]),encoder.encode(expected));
}
export function loginPage(error=""){
 const safe=error==="invalid"?"Incorrect password. Try again.":error==="missing"?"Admin login is not configured yet.":"";
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroEscape · Admin login</title><style>
 *{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#0c1828;color:#f4f6fa;font:16px system-ui;padding:18px}
 main{width:min(430px,100%);padding:30px;background:#162840;border:1px solid #536b84;border-radius:16px;box-shadow:0 15px 60px #0008}
 h1{margin:0 0 10px;color:#f5d085}p{color:#cbd7e4}label{display:block;margin:22px 0 7px}input,button{width:100%;border-radius:8px;padding:13px;font:inherit}
 input{background:white;color:#18253c;border:1px solid #879bb0}button{margin-top:17px;background:#dbb978;color:#182332;border:0;font-weight:700;cursor:pointer}
 .error{color:#ffb6a8}a{color:#e3c48c}</style></head><body><main><h1>🔐 MaestroEscape Settings</h1><p>Administrator access only</p><form id="login"><label for="password">Admin password</label><input id="password" type="password" autocomplete="current-password" minlength="1" required autofocus><button id="submit" type="submit">Sign in</button></form><p id="error" class="error" role="alert">${safe}</p><p><a href="/">Back to game</a></p></main><script>
 document.getElementById("login").addEventListener("submit",async e=>{e.preventDefault();const button=document.getElementById("submit"),error=document.getElementById("error");button.disabled=true;error.textContent="";
 try{const response=await fetch("/admin/login",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:document.getElementById("password").value})});document.getElementById("password").value="";
 if(response.ok){location.replace("/settings");return}error.textContent=response.status===503?"Admin login is not configured yet.":"Login failed. Check the password.";}
 catch{error.textContent="Connection error. Try again."}finally{button.disabled=false}});
 </script></body></html>`;
}
export async function loginRequest(request,env){
 if(!validSecrets(env))return Response.json({ok:false,error:"Admin login is not configured"},{status:503,headers});
 if(request.method!=="POST")return new Response("Method not allowed",{status:405,headers});
 if(new URL(request.url).origin!==request.headers.get("origin"))return Response.json({ok:false,error:"Invalid request origin"},{status:403,headers});
 if(!(request.headers.get("content-type")||"").includes("application/json"))return Response.json({ok:false,error:"JSON required"},{status:415,headers});
 if(Number(request.headers.get("content-length")||0)>4096)return Response.json({ok:false,error:"Request too large"},{status:413,headers});
 let body;try{body=await request.json()}catch{return Response.json({ok:false,error:"Invalid JSON"},{status:400,headers})}
 if(typeof body?.password!=="string"||body.password.length>512)return Response.json({ok:false,error:"Invalid credentials"},{status:401,headers});
 // Compare fixed-length digests to avoid variable-time string comparisons.
 const valid=secure(await bytes(body.password),await bytes(env.ADMIN_PASSWORD));
 if(!valid)return Response.json({ok:false,error:"Invalid credentials"},{status:401,headers});
 const expires=Math.floor(Date.now()/1000)+twelveHours;
 const token=expires+"."+await sign("maestro-settings-admin-v1."+expires,env.ADMIN_SESSION_SECRET);
 return Response.json({ok:true},{headers:{...headers,"set-cookie":cookieName+"="+token+"; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age="+twelveHours}});
}
export function logoutResponse(){
 return new Response(null,{status:303,headers:{...headers,location:"/admin/login","set-cookie":cookieName+"=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"}});
}
export function forbiddenResponse(request){
 if(new URL(request.url).pathname==="/settings")return new Response(null,{status:303,headers:{...headers,location:"/admin/login"}});
 return Response.json({ok:false,error:"Administrator login required",code:"ADMIN_AUTH_REQUIRED"},{status:401,headers});
}
export function mutationOriginAllowed(request){
 const url=new URL(request.url);return request.headers.get("origin")===url.origin;
}
