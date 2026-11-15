import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {MaestroAccounts} from "../src/accounts.js";
globalThis.crypto ||= webcrypto;
function store(){const map=new Map();return {storage:{get:async k=>map.get(k),put:async(k,v)=>{map.set(k,v)},delete:async k=>map.delete(k)},map}}
const base="https://accounts.internal";
const request=(op,data,ip="127.0.0.1")=>new Request(base+"/"+op,{method:"POST",headers:{"content-type":"application/json","x-client-ip":ip},body:JSON.stringify(data)});
test("registration creates a non-admin account, login and logout work",async()=>{
 const ctx=store(),app=new MaestroAccounts(ctx,{}),email="test@example.com",password="example-password-12345";
 let res=await app.fetch(request("register",{email,password}));
 assert.equal(res.status,201);
 const created=await res.json();assert.equal(created.user.role,"user");
 assert.equal(created.user.email,email);
 assert.equal(await app.fetch(request("register",{email,password})).then(r=>r.status),409);
 res=await app.fetch(request("login",{email,password:"wrong"}));assert.equal(res.status,401);
 res=await app.fetch(request("login",{email,password}));assert.equal(res.status,200);
 const data=await res.json();
 assert.equal(data.user.role,"user");assert.match(data.token,/^[A-Za-z0-9_-]{43}$/);
 const sessionReq=new Request(base+"/session",{headers:{"x-session-token":data.token}});
 res=await app.fetch(sessionReq);
 assert.equal(res.status,200);assert.equal((await res.json()).user.role,"user");
 res=await app.fetch(new Request(base+"/logout",{method:"POST",headers:{"x-session-token":data.token}}));
 assert.equal(res.status,200);
 assert.equal((await app.fetch(sessionReq)).status,401);
});
test("invalid registration does not create accounts",async()=>{
 const app=new MaestroAccounts(store(),{});
 assert.equal((await app.fetch(request("register",{email:"invalid",password:"example-password-12345"}))).status,400);
 assert.equal((await app.fetch(request("register",{email:"test@example.com",password:"short"}))).status,400);
});
