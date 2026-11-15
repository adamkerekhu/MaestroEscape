import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT} from "../src/transition-editor.js";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
test("six map arrivals are separately configurable",()=>{
 for(const id of ["pub","basement","upstairs","spar","dohanybolt","gyros"]){
  assert.ok(worker.includes('"transition.'+id+'.x"'),"Missing X setting "+id);
  assert.ok(worker.includes('"transition.'+id+'.y"'),"Missing Y setting "+id);
  assert.ok(TRANSITION_EDITOR_HTML.includes('value="'+id+'"'),"Missing editor selection "+id);
 }
});
test("settings editor uses correct dimensioned maps and pointer coordinate projection",()=>{
 for(const asset of ["/assets/interior.webp","/assets/basement.webp","/assets/shop-spar.webp","/assets/shop-dohanybolt.webp","/assets/shop-gyros.webp"])
  assert.ok(TRANSITION_EDITOR_SCRIPT.includes(asset),"Missing map preview "+asset);
 assert.match(TRANSITION_EDITOR_SCRIPT,/setPointerCapture\(event\.pointerId\)/);
 assert.match(TRANSITION_EDITOR_SCRIPT,/const ratio=Math\.min\(bounds\.width\/transitionCanvas\.width,bounds\.height\/transitionCanvas\.height\)/);
 assert.match(TRANSITION_EDITOR_SCRIPT,/transitionStop=\(\)=>\{if\(transitionDragging===null\)return;transitionDragging=null;store\(\)\}/);
 assert.match(TRANSITION_EDITOR_SCRIPT,/const ok=await push\(true\)/);
 assert.match(TRANSITION_EDITOR_CSS,/touch-action:none/);
});
test("settings HTML renders a live editor without breaking its script",()=>{
 const start=worker.indexOf("const SETTINGS_HTML=String.raw`");
 const end=worker.indexOf(";"+String.fromCharCode(10)+"const HTML = String.raw`",start);
 assert.ok(start>=0&&end>start);
 const make=new Function("TRANSITION_EDITOR_CSS","TRANSITION_EDITOR_HTML","TRANSITION_EDITOR_SCRIPT",worker.slice(start,end+1)+"\\nreturn SETTINGS_HTML;");
 const page=make(TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT);
 assert.match(page,/id="transition-map"/);
 assert.match(page,/function transitionSet\(x,y\)/);
 new Function(page.split("<script>")[1].split("</script>")[0]);
});
test("each map transition actually uses the new saved coordinate instead of hard-coded spawn",()=>{
 assert.match(worker,/transitionArrival\("basement",BASEMENT_SPAWN\)/);
 assert.match(worker,/transitionArrival\("upstairs",pubStairReturn\|\|INTERIOR_SPAWN\)/);
 assert.match(worker,/transitionArrival\("pub",INTERIOR_SPAWN\)/);
 assert.match(worker,/transitionArrival\(shopId,shop\.spawn\)/);
 assert.match(worker,/if\(safe\(x,y\)\)return \{x,y\}/);
 assert.match(worker,/if\(safe\(px,py\)\)return \{x:px,y:py\}/);
});
