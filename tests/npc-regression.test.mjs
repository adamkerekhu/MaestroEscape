import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=readFileSync(join(root,"src/worker.js"),"utf8");
const match=(regex,label)=>{const found=source.match(regex);assert.ok(found,"Missing "+label);return found[1];};
const defaults=JSON.parse(match(/const SETTINGS_DEFAULTS=(\{[^\n]+\});/,"settings defaults"));
const groups=JSON.parse(match(/const SETTINGS_GROUPS=(\[[^\n]+\]);/,"settings schema"));
const defs=JSON.parse(match(/const NPC_DEFINITIONS=(\[[^\n]+\]);/,"NPC registry"));
const shops=vm.runInNewContext("("+match(/const SHOPS=(\{[\s\S]*?\});\nconst interiorWalls/,"interior maps")+")");
const walls={
 pub:vm.runInNewContext(match(/const interiorWalls=(\[[\s\S]*?\]);/,"pub collision")),
 spar:shops.spar.walls,dohanybolt:shops.dohanybolt.walls,gyros:shops.gyros.walls
};
const sizes={pub:[1448,1086],spar:[736,384],dohanybolt:[608,832],gyros:[768,480]};
const service=vm.runInNewContext("("+match(/const NPC_SERVICE_OFFSETS=(\{[\s\S]*?\});\nfunction npcInteractionPoint/,"counter offsets")+")");
const floor=(room,x,y,r=7)=>{
 const [width,height]=sizes[room];
 return Number.isFinite(x)&&Number.isFinite(y)&&x>18&&y>18&&x<width-18&&y<height-18&&
 !walls[room].some(([bx,by,bw,bh])=>x+r>bx&&x-r<bx+bw&&y+r>by&&y-r<by+bh);
};
const segment=(room,start,end)=>{
 const count=Math.max(1,Math.ceil(Math.hypot(end.x-start.x,end.y-start.y)/5));
 for(let i=0;i<=count;i++){
  const t=i/count;
  if(!floor(room,start.x+(end.x-start.x)*t,start.y+(end.y-start.y)*t))return false;
 }
 return true;
};
function inlineScript(marker,label){
 const pos=source.indexOf(marker);
 assert.ok(pos>=0,"Missing "+label);
 const found=source.slice(pos).match(/<script>\s*([\s\S]*?)<\/script>/);
 assert.ok(found,"Missing script in "+label);
 return found[1];
}
const game=inlineScript("const HTML = String.raw","Phaser game");
const settings=inlineScript("const SETTINGS_HTML=String.raw","settings page");

test("Worker, game and settings syntax",()=>{
 new vm.Script(source.replace("export class GameSettings","class GameSettings").replace("export default {","const _worker = {"));
 new vm.Script(game.replace("__MAESTRO_DEFAULT_SETTINGS__",JSON.stringify(defaults)));
 new vm.Script(settings);
});

test("exact NPC roster and lifecycle guards",()=>{
 assert.equal(defs.length,9);
 assert.equal(new Set(defs.map(n=>n.id)).size,9);
 assert.deepEqual(["pub","spar","dohanybolt","gyros"].map(room=>defs.filter(n=>n.interior===room).length),[4,3,1,1]);
 assert.equal(defs.filter(n=>n.role==="worker").length,4);
 assert.equal(defs.filter(n=>n.role==="civilian").length,5);
 assert.ok(source.includes("if(npcEntities.size)return"));
 assert.ok(source.includes("showInteriorNPCs(null)"));
});

test("every NPC sprite is included",()=>{
 for(const def of defs)assert.ok(existsSync(join(root,"Assets/NPCs",def.id+".webp")),def.id+" missing sprite");
});

test("all default NPC spawns and waypoint segments avoid obstacles",()=>{
 for(const def of defs){
  assert.ok(floor(def.interior,def.x,def.y),def.id+" starts blocked");
  let previous={x:def.x,y:def.y};
  for(let n=1;n<=4;n++){
   const target={x:defaults["npc."+def.id+".wp"+n+"X"],y:defaults["npc."+def.id+".wp"+n+"Y"]};
   assert.ok(floor(def.interior,target.x,target.y),def.id+" waypoint "+n+" blocked");
   assert.ok(segment(def.interior,previous,target),def.id+" route "+n+" crosses a wall");
   previous=target;
  }
 }
});

test("worker counter interaction positions are on reachable floors",()=>{
 for(const def of defs.filter(n=>n.role==="worker")){
  const offset=service[def.id];
  assert.ok(offset,def.id+" missing service point");
  assert.ok(floor(def.interior,def.x+offset.x,def.y+offset.y,11),def.id+" service point blocked");
 }
 assert.ok(Math.hypot(service.maestro_bartender.x,service.maestro_bartender.y)>defaults["npc.interactRadius"]);
});

test("every NPC configuration field has a valid schema and default",()=>{
 const fields=Object.fromEntries(groups.flatMap(g=>g.fields.map(f=>[f.key,f])));
 for(const def of defs)for(const suffix of ["x","y","homeX","homeY","facing","scale","enabled","speed","idleMs",
 "wp1X","wp1Y","wp2X","wp2Y","wp3X","wp3Y","wp4X","wp4Y"]){
  const key="npc."+def.id+"."+suffix,field=fields[key];
  assert.ok(field,key+" missing schema");
  assert.ok(defaults[key]>=field.min&&defaults[key]<=field.max,key+" invalid default");
 }
 assert.ok(source.includes("npcRefreshSettings()"));
});

test("E controls, menu safety, disabled actions and landscape access",()=>{
 assert.ok(source.includes("NPC_ACTION_UNAVAILABLE"));
 assert.ok(source.includes("button.disabled=true"));
 assert.ok(source.includes("if(npcDialogue)return"));
 assert.ok(source.includes('id="mobile-interact"'));
 assert.ok(source.includes("keydown-E"));
 assert.ok(source.includes("#npc-dialogue:not([hidden]) ~ #mobile-controls"));
});

class MockResponse{
 constructor(body,{status=200}={}){this.status=status;this.body=body;}
 static json(body,opts){return new this(body,opts);}
}
const request=(method,body,revision)=>({
 method,json:async()=>body,
 headers:{get:name=>name==="X-Settings-Revision"?revision:null}
});
test("shared storage readback, cross-device values, stale revision and invalid updates",async()=>{
 const executable=source.replace("export class GameSettings","class GameSettings").replace("export default {","const _worker = {");
 const {GameSettings,SETTINGS_DEFAULTS}=vm.runInNewContext(
  executable+"\n({ GameSettings, SETTINGS_DEFAULTS })",{Response:MockResponse});
 const storage=new Map(),ctx={storage:{
  get:async key=>storage.get(key),
  put:async record=>{for(const [key,value] of Object.entries(record))storage.set(key,value);}
 }};
 const desktop=new GameSettings(ctx,{}),mobile=new GameSettings(ctx,{});
 const initial=await mobile.fetch(request("GET"));assert.equal(initial.status,200);assert.equal(initial.body.revision,0);
 const savedValues={...SETTINGS_DEFAULTS,"npc.maestro_regular_2.x":777,"npc.spar_cashier.scale":1.2,"vehicle.skoda.spawnX":717};
 const save=await desktop.fetch(request("PUT",savedValues,"0"));assert.equal(save.status,200);assert.equal(save.body.revision,1);
 const reload=await mobile.fetch(request("GET"));
 assert.equal(reload.body.settings["npc.maestro_regular_2.x"],777);
 assert.equal(reload.body.settings["npc.spar_cashier.scale"],1.2);
 assert.equal(reload.body.settings["vehicle.skoda.spawnX"],717);
 assert.equal((await mobile.fetch(request("PUT",{...savedValues,"npc.maestro_regular_2.x":100},"0"))).status,409);
 assert.equal((await mobile.fetch(request("PUT",{...savedValues,"npc.maestro_regular_2.x":"invalid"},"1"))).status,400);
 assert.equal((await desktop.fetch(request("GET"))).body.settings["npc.maestro_regular_2.x"],777);
});
