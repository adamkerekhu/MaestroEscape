import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HIDE_POINT_DEFS,HIDE_RUNTIME_SCRIPT} from "../src/hide-peek.js";
import {ROULETTE_CLIENT_SCRIPT} from "../src/roulette-client.js";
import {CASINO_SIZE,CASINO_SPAWN,CASINO_EXIT,CASINO_WALLS,CASINO_HOTSPOTS} from "../src/casino-map.js";
import {HIDE_EDITOR_CSS,HIDE_EDITOR_HTML,HIDE_EDITOR_SCRIPT} from "../src/hide-editor.js";
import {TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT} from "../src/transition-editor.js";
import {INTERACTION_EDITOR_CSS,INTERACTION_EDITOR_HTML,INTERACTION_EDITOR_SCRIPT} from "../src/interaction-editor.js";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
const Controller=new Function("HIDE_POINT_DEFS",HIDE_RUNTIME_SCRIPT+"\nreturn MaestroHideController;")(HIDE_POINT_DEFS);
function fixture(block=()=>false){
 const callbacks=[];
 const graphics={clear(){return this},fillStyle(){return this},fillRect(){return this},createGeometryMask(){return {mask:true}},destroy(){}};
 const scene={make:{graphics:()=>graphics},time:{delayedCall:(delay,cb)=>{const timer={delay,cb,remove(){}};callbacks.push(timer);return timer}},
  tweens:{add:({targets,x,y,onUpdate})=>{if(x!==undefined){targets.x=x;targets.y=y}onUpdate?.()},killTweensOf(){}}
 };
 const player={x:100,y:530,face:"down",isHidden:false};
 const char={x:100,y:530,visible:true,active:true,displayWidth:32,displayHeight:68,
  anims:{stop(){}},clearMask(){},setAlpha(){return this},setMask(){return this},setPosition(x,y){this.x=x;this.y=y;return this}};
 const settings={"hide.enabled":1,"hide.radius":80,"hide.visiblePercent":7,"hide.animationMs":200,"hide.showPrompts":1};
 for(const d of HIDE_POINT_DEFS)for(const [k,v] of Object.entries({
  x:d.x,y:d.y,hideX:d.x,hideY:d.y,exitX:d.x,exitY:d.y,radius:80,enabled:d.enabled,
  side:["left","right","top","bottom"].indexOf(d.peekSide)}))settings["hide.point."+d.id+"."+k]=v;
 let room="pub";
 const ctl=new Controller(scene,char,player,key=>settings[key],block,()=>room);
 return {ctl,player,char,callbacks,settings,setRoom:v=>room=v};
}
test("Hide controller uses existing pub table locations and leaves unverified spots disabled",()=>{
 const tables=HIDE_POINT_DEFS.filter(p=>p.roomId==="pub"&&p.type==="table"&&p.enabled);
 assert.equal(tables.length,4);
 assert.equal(HIDE_POINT_DEFS.filter(p=>p.roomId==="basement"&&p.type==="table"&&p.enabled).length,3);
 assert.ok(HIDE_POINT_DEFS.filter(p=>p.roomId==="street").every(p=>!p.enabled));
 assert.match(HIDE_RUNTIME_SCRIPT,/createGeometryMask/);
 assert.match(HIDE_RUNTIME_SCRIPT,/fillRect\(left,ptop,pw,ph\)/);
 assert.doesNotMatch(HIDE_RUNTIME_SCRIPT,/character\.setAlpha\(0\.07\)/);
});
test("E enters hiding then exits to the original walkable position",()=>{
 const f=fixture();assert.equal(f.ctl.prompt(),"E · Hide");
 assert.equal(f.ctl.enter(),true);
 assert.equal(f.ctl.state,"ENTERING_HIDE");
 assert.equal(f.player.isHidden,true);
 assert.equal(f.ctl.enter(),false);
 f.callbacks.shift().cb();
 assert.equal(f.ctl.state,"HIDDEN");assert.equal(f.ctl.prompt(),"E · Exit hiding");
 assert.equal(f.ctl.exit(),true);assert.equal(f.ctl.state,"EXITING_HIDE");
 f.callbacks.shift().cb();
 assert.equal(f.ctl.state,"NORMAL");assert.equal(f.player.isHidden,false);
 assert.equal(f.player.x,100);
});
test("Hiding refuses a blocked path and cannot teleport across a wall",()=>{
 const f=fixture((x,y)=>x>105&&x<110);
 assert.equal(f.ctl.enter(),false);
 assert.equal(f.ctl.state,"NORMAL");assert.equal(f.player.x,100);
});
test("Hiding safely resets on room switch and respawn",()=>{
 const f=fixture();assert.ok(f.ctl.enter());
 f.setRoom("basement");f.ctl.update();
 assert.equal(f.ctl.state,"NORMAL");assert.equal(f.player.isHidden,false);
 assert.ok(f.ctl.enter()===false);
 f.setRoom("pub");assert.ok(f.ctl.enter());f.ctl.reset();
 assert.equal(f.ctl.state,"NORMAL");
});
test("Settings editor supports canvas, exit point, tuck point, radius, enable and preview",()=>{
 new Function(HIDE_EDITOR_SCRIPT);
 assert.match(HIDE_EDITOR_HTML,/value="tuck"/);
 assert.match(HIDE_EDITOR_HTML,/id="hide-enabled"/);
 assert.match(HIDE_EDITOR_HTML,/id="hide-preview"/);
 assert.match(HIDE_EDITOR_SCRIPT,/setPointerCapture/);
 assert.match(HIDE_EDITOR_SCRIPT,/hideSaveValue\("hideX",pt\.x\)/);
 assert.match(HIDE_EDITOR_SCRIPT,/hideSaveValue\("exitX",pt\.x\)/);
 assert.match(HIDE_EDITOR_SCRIPT,/const ok=await push\(true\)/);
 assert.match(HIDE_EDITOR_CSS,/touch-action:none/);
});
test("Game's normal E handler, UI prompt, movement and room transitions use Hide controller",()=>{
 assert.match(worker,/hideController\?\.state==="HIDDEN"/);
 assert.match(worker,/hideController\?\.prompt\(\)/);
 assert.match(worker,/hideController\.enter\(\)/);
 assert.match(worker,/hideController&&hideController\.state!=="NORMAL"/);
 assert.match(worker,/hideController\?\.reset\(\)/);
 assert.match(worker,/new MaestroHideController\(this,character,player,cfg,intersects/);
});
test("Real Settings and game templates generate syntactically valid inline scripts",()=>{
 const s0=worker.indexOf("const SETTINGS_HTML=String.raw\`");
 const s1=worker.indexOf(";"+String.fromCharCode(10)+"const HTML = String.raw\`",s0);
 const makeSettings=new Function("TRANSITION_EDITOR_CSS","TRANSITION_EDITOR_HTML","TRANSITION_EDITOR_SCRIPT",
 "INTERACTION_EDITOR_CSS","INTERACTION_EDITOR_HTML","INTERACTION_EDITOR_SCRIPT",
 "HIDE_EDITOR_CSS","HIDE_EDITOR_HTML","HIDE_EDITOR_SCRIPT","HIDE_POINT_DEFS",
 worker.slice(s0,s1+1)+"\nreturn SETTINGS_HTML;");
 const settings=makeSettings(TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT,
  INTERACTION_EDITOR_CSS,INTERACTION_EDITOR_HTML,INTERACTION_EDITOR_SCRIPT,
  HIDE_EDITOR_CSS,HIDE_EDITOR_HTML,HIDE_EDITOR_SCRIPT,HIDE_POINT_DEFS);
 assert.match(settings,/id="hide-map"/);
 new Function(settings.split("<script>")[1].split("</script>")[0]);
 const h0=worker.indexOf("const HTML = String.raw\`"),h1=worker.indexOf("\`;",h0+30);
 const makeGame=new Function("HIDE_POINT_DEFS","HIDE_RUNTIME_SCRIPT","CASINO_SIZE","CASINO_SPAWN","CASINO_EXIT","CASINO_WALLS","CASINO_HOTSPOTS","ROULETTE_CLIENT_SCRIPT",worker.slice(h0,h1+2)+"\nreturn HTML;");
 const html=makeGame(HIDE_POINT_DEFS,HIDE_RUNTIME_SCRIPT,CASINO_SIZE,CASINO_SPAWN,CASINO_EXIT,CASINO_WALLS,CASINO_HOTSPOTS,ROULETTE_CLIENT_SCRIPT);
 const inlines=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 assert.ok(inlines.length>=3);
 for(const code of inlines)new Function(code.replace("__MAESTRO_DEFAULT_SETTINGS__","{}"));
});
