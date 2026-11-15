import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {adminAuthorized,loginRequest,logoutResponse,mutationOriginAllowed,forbiddenResponse} from "../src/admin-auth.js";
globalThis.crypto ||= webcrypto;
const env={ADMIN_PASSWORD:"example-very-long-administrator-password",ADMIN_SESSION_SECRET:"example-extremely-long-different-signing-secret-for-tests"};
const origin="https://maestroescape.example";
const req=(url,options={})=>new Request(origin+url,options);
test("settings login fails closed if secrets are absent",async()=>{
 const res=await loginRequest(req("/admin/login",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({password:env.ADMIN_PASSWORD})}),{});
 assert.equal(res.status,503);
 assert.equal(await adminAuthorized(req("/settings"),{}),false);
});
test("login enforces origin and rejects incorrect password",async()=>{
 const wrongOrigin=await loginRequest(req("/admin/login",{method:"POST",headers:{origin:"https://evil.example","content-type":"application/json"},body:JSON.stringify({password:env.ADMIN_PASSWORD})}),env);
 assert.equal(wrongOrigin.status,403);
 const wrongPassword=await loginRequest(req("/admin/login",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({password:"incorrect"})}),env);
 assert.equal(wrongPassword.status,401);
});
test("valid login issues secure signed cookie and detects tampering",async()=>{
 const res=await loginRequest(req("/admin/login",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({password:env.ADMIN_PASSWORD})}),env);
 assert.equal(res.status,200);
 const cookie=res.headers.get("set-cookie");
 assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);
 const signed=cookie.split(";")[0];
 assert.equal(await adminAuthorized(req("/settings",{headers:{cookie:signed}}),env),true);
 assert.equal(await adminAuthorized(req("/settings",{headers:{cookie:signed.slice(0,-1)+"x"}}),env),false);
 assert.equal(await adminAuthorized(req("/settings"),env),false);
});
test("settings writes require matching Origin",()=>{
 assert.equal(mutationOriginAllowed(req("/api/settings",{method:"PUT",headers:{origin}})),true);
 assert.equal(mutationOriginAllowed(req("/api/settings",{method:"PUT",headers:{origin:"https://evil.example"}})),false);
 assert.equal(forbiddenResponse(req("/settings")).status,303);
 assert.equal(forbiddenResponse(req("/api/settings")).status,401);
 assert.equal(logoutResponse().headers.get("set-cookie").includes("Max-Age=0"),true);
});
