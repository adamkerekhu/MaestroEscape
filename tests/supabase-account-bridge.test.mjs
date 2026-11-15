import test from "node:test";
import assert from "node:assert/strict";
import {accountAction,accountFromRequest,accountStatus,loggedOutResponse} from "../src/supabase-account-auth.js";
const origin="https://maestroescape.example";
const post=(operation,email="owner@example.com",password="strong-password-12345")=>new Request(origin+"/api/account/"+operation,{method:"POST",headers:{"origin":origin,"content-type":"application/json"},body:JSON.stringify({email,password})});
const token="q".repeat(43);
test("isolated Supabase registration uses only maestroescape Edge Function",async()=>{
 const old=globalThis.fetch;let hit="";
 try{
  globalThis.fetch=async(url,config)=>{hit=url;const body=JSON.parse(config.body);assert.equal(body.op,"register");return Response.json({ok:true,user:{id:"new",email:body.email,role:"user"}},{status:201})};
  const res=await accountAction(post("register"),"register");
  assert.equal(res.status,201);assert.match(hit,/\/functions\/v1\/maestroescape-accounts$/);
  assert.equal(res.headers.has("set-cookie"),false);
 }finally{globalThis.fetch=old}
});
test("sign-in uses server-side secure cookie without exposing session token",async()=>{
 const old=globalThis.fetch;
 try{
  globalThis.fetch=async(_url,config)=>{const body=JSON.parse(config.body);assert.equal(body.op,"login");return Response.json({ok:true,user:{id:"id",email:body.email,role:"user"},token})};
  const res=await accountAction(post("login"),"login");
  assert.equal(res.status,200);
  assert.match(res.headers.get("set-cookie"),/HttpOnly; Secure; SameSite=Lax/);
  assert.equal(JSON.stringify(await res.json()).includes(token),false);
 }finally{globalThis.fetch=old}
});
test("account role comes only from trusted backend session response",async()=>{
 const old=globalThis.fetch;
 try{
  globalThis.fetch=async(_url,config)=>{const body=JSON.parse(config.body);assert.equal(body.op,"session");assert.equal(body.token,token);return Response.json({ok:true,user:{id:"id",email:"owner@example.com",role:"user"}})};
  const res=await accountFromRequest(new Request(origin+"/settings",{headers:{cookie:"maestro_account="+token}}));
  assert.equal(res.user.role,"user");
  assert.equal((await accountFromRequest(new Request(origin+"/settings"))).user,null);
 }finally{globalThis.fetch=old}
});
test("logout clears session cookie",()=>{
 const res=loggedOutResponse();
 assert.equal(res.status,303);assert.match(res.headers.get("set-cookie"),/Max-Age=0/);
});
test("status queries namespaced Edge Function health endpoint",async()=>{
 const old=globalThis.fetch;let hit="";
 try{
  globalThis.fetch=async(url)=>{hit=url;return Response.json({ok:true,storageReachable:true})};
  const res=await accountStatus();const data=await res.json();
  assert.equal(data.backend,"supabase-isolated");assert.equal(data.storageReachable,true);assert.match(hit,/maestroescape-accounts\/health$/);
 }finally{globalThis.fetch=old}
});
