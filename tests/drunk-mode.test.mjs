import test from "node:test";
import assert from "node:assert/strict";
import {DrunkMode,DRUNK_DEFAULTS,DRUNK_MODE_CLIENT_SCRIPT} from "../src/drunk-mode.js";
import {readFileSync} from "node:fs";

const run=(controller,ms)=>{for(let t=0;t<ms;t+=100)controller.update(Math.min(100,ms-t));};
test("sober controls and camera are unaffected",()=>{
 const d=new DrunkMode();
 d.update(16);
 assert.deepEqual(d.direction(1,0),{x:1,y:0});
 assert.deepEqual(d.camera(1.5),{rotation:0,zoom:1.5});
 assert.equal(d.getState().level,0);
});
test("one completed beer is tipsy with mild visuals and no steering error",()=>{
 const d=new DrunkMode(undefined,()=>.8);
 assert.equal(d.onBeerFinished("beer-1"),true);
 assert.equal(d.onBeerFinished("beer-1"),false);
 run(d,1000);
 assert.equal(d.level,1);
 assert.deepEqual(d.direction(1,0),{x:1,y:0});
 assert.ok(Math.abs(d.camera(2).rotation)<=.4*Math.PI/180+1e-9);
});
test("second and third beers alter walking, but idle and vehicle input remain untouched",()=>{
 const values={...DRUNK_DEFAULTS,"drunkMode.level2MistakesPerMinute":30,
  "drunkMode.level3MistakesPerMinute":45};
 let seed=0;
 const rand=()=>[.8,.9,.4,.6][seed++%4];
 const d=new DrunkMode(()=>values,rand);
 d.onBeerFinished("b1");d.onBeerFinished("b2");
 d.update(100);
 assert.equal(d.level,2);
 assert.equal(d.direction(0,0).x,0);
 assert.notEqual(d.direction(1,0).y,0);
 const mildMax=Math.abs(d.camera(2).rotation);
 d.onBeerFinished("b3");run(d,1000);
 assert.equal(d.level,3);
 assert.equal(d.direction(0,0).y,0);
 assert.equal(d.onBeerFinished("b4"),true);
 assert.equal(d.level,3,"Fourth beer is capped at level three");
 assert.equal(d.getState().seconds,20);
 assert.ok(mildMax<=.4*Math.PI/180);
});
test("three-level recovery occurs at 20,40,60 active seconds and resets when drinking",()=>{
 const d=new DrunkMode();
 d.onBeerFinished("a");d.onBeerFinished("b");d.onBeerFinished("c");
 run(d,19900);assert.equal(d.level,3);
 run(d,100);assert.equal(d.level,2);
 run(d,13000);assert.equal(d.level,2);
 d.onBeerFinished("d");assert.equal(d.level,3);
 assert.equal(d.getState().seconds,20);
 run(d,20000);assert.equal(d.level,2);
 run(d,20000);assert.equal(d.level,1);
 run(d,20000);assert.equal(d.level,0);
 assert.equal(d.getState().seconds,0);
});
test("pause freezes recovery and camera phase",()=>{
 const d=new DrunkMode();
 d.onBeerFinished("a");
 run(d,5000);
 const before=d.elapsed,phase=d.phase;
 d.pause();run(d,4000);
 assert.equal(d.elapsed,before);assert.equal(d.phase,phase);
 d.resume();run(d,15000);
 assert.equal(d.level,0);
});
test("settings disable effects, reduce motion, and clamp active level",()=>{
 let config={...DRUNK_DEFAULTS};
 const d=new DrunkMode(()=>config);
 d.onBeerFinished("a");d.onBeerFinished("b");d.onBeerFinished("c");
 run(d,1000);
 config={...config,"drunkMode.maxLevel":2};
 d.update(16);assert.equal(d.level,2);
 config={...config,"drunkMode.reduceMotion":1};
 d.update(16);assert.deepEqual(d.camera(2),{rotation:0,zoom:2});
 assert.equal(d.level,2);
 config={...config,"drunkMode.enabled":0};
 d.update(16);
 assert.equal(d.level,0);
 assert.deepEqual(d.direction(1,0),{x:1,y:0});
 assert.deepEqual(d.camera(2),{rotation:0,zoom:2});
});
test("browser bundle exposes working drunk controller and settings schema is integrated",()=>{
 const window={};
 new Function("window",DRUNK_MODE_CLIENT_SCRIPT)(window);
 const inBrowser=new window.MaestroDrunkMode();
 inBrowser.onBeerFinished("a");assert.equal(inBrowser.level,1);
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 assert.ok(worker.includes('url.pathname==="/assets/drunk-mode.js"'));
 assert.ok(worker.includes('onBeerFinished:eventId=>'));
 assert.ok(worker.includes('const modifier=drunk.direction('));
 assert.ok(worker.includes('drunk.camera(cameraZoom)'));
 assert.ok(worker.includes('id="reset-drunk"'));
 for(const key of Object.keys(DRUNK_DEFAULTS))assert.ok(worker.includes(key));
});

test("rendered game compiles drunk controller safely from a quoted string",async()=>{
 const {default:worker}=await import("../src/worker.js");
 const response=await worker.fetch(new Request("https://maestroescape.test/?mode=single"),{});
 assert.equal(response.status,200);
 const html=await response.text();
 assert.ok(!html.includes("__DRUNK_MODE_SOURCE__"));
 assert.ok(!html.includes("__DRUNK_MODE_SCRIPT__"));
 assert.ok(html.includes('new Function("window",'));
 assert.ok(html.includes('window.MaestroDrunkMode'));
 assert.ok(html.includes('game running with sober fallback'));
 const start=html.indexOf("<script>"+String.fromCharCode(10)+"(function(){");
 const end=start<0?-1:html.indexOf("</script>",start);
 assert.ok(start>=0&&end>start,"Game script should be present and self-contained");
 const gameScript=html.slice(start+8,end);
 assert.doesNotThrow(()=>new Function(gameScript));
 const marker='new Function("window",';
 const controllerStart=gameScript.indexOf(marker);
 const controllerEnd=gameScript.indexOf(') (window);',controllerStart);
 assert.ok(controllerStart>=0&&controllerEnd>controllerStart,"Quoted controller source should be safely evaluated");
 const controllerSource=JSON.parse(gameScript.slice(controllerStart+marker.length,controllerEnd));
 const window={};
 assert.doesNotThrow(()=>new Function("window",controllerSource)(window));
 assert.equal(typeof window.MaestroDrunkMode,"function");
 const controller=new window.MaestroDrunkMode();
 assert.equal(controller.onBeerFinished("test"),true);
 assert.equal(controller.level,1);
});

test("single-player HUD has beer simulation controls and inventory explains five sips",async()=>{
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 const {CONSUMABLE_CLIENT_SCRIPT:client}=await import("../src/consumables-client.js");
 assert.ok(worker.includes('const testMode=new URL(location.href).searchParams.get("mode")==="single"'));
 assert.ok(worker.includes('test.id="drunk-test-next"'));
 assert.ok(worker.includes('drunk.onBeerFinished("test-beer-"+(++drunkTestCounter))')); 
 assert.ok(worker.includes('test.addEventListener("click",()=>{')); 
 assert.ok(worker.includes('const state=drunk.getState()')); 
 assert.ok(worker.includes('drunk-test-feedback'));
 assert.ok(worker.includes('sober.id="drunk-test-sober"'));
 assert.ok(worker.includes('drunk.reset();drunkHud();'));
 assert.ok(client.includes('Drink sip "+(i.maxUnits-i.remainingUnits+1)+"/"+i.maxUnits'));
 assert.ok(client.includes('this.ctx.onBeerFinished(event.id)'));
 const d=new DrunkMode();
 for(let i=0;i<3;i++)d.onBeerFinished("test-beer-"+i);
 assert.equal(d.level,3);
 d.reset();assert.equal(d.level,0);
});

test("actual Worker response contains parseable scripts, build ID and diagnostic location",async()=>{
 const {default:worker}=await import("../src/worker.js");
 const response=await worker.fetch(new Request("https://maestroescape.test/?mode=single"),{});
 const html=await response.text();
 assert.equal(response.status,200);
 assert.ok(html.includes('drunk-startup-diagnostics-20261115'));
 assert.ok(html.includes('event.lineno'));
 assert.ok(html.includes('event.colno'));
 assert.ok(html.includes('const drunk=drunkControllerAvailable'));
 assert.ok(!html.includes('__DRUNK_MODE_SCRIPT__'));
 assert.ok(!html.includes('__MAESTRO_DEFAULT_SETTINGS__'));
 const snippets=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.ok(snippets.length>=2);
 for(const [index,match] of snippets.entries()){
  assert.doesNotThrow(()=>new Function(match[1]),"Inline script "+index+" is syntactically valid");
 }
 const version=await worker.fetch(new Request("https://maestroescape.test/api/build"),{});
 assert.equal(version.status,200);
 const build=await version.json();
 assert.equal(build.build,"drunk-startup-diagnostics-20261115");
 assert.equal(build.drunkControllerBundled,true);
});
