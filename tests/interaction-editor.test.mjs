import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INTERACTION_EDITOR_CSS,INTERACTION_EDITOR_HTML,INTERACTION_EDITOR_SCRIPT} from "../src/interaction-editor.js";
import {TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT} from "../src/transition-editor.js";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
const ids=["street_pub","street_spar","street_dohanybolt","street_gyros","pub_exit","pub_downstairs","basement_upstairs","spar_exit","dohanybolt_exit","gyros_exit"];
test("ten independent door and stair points have X Y and radius settings",()=>{
 for(const id of ids)for(const axis of ["x","y","radius"]){
  assert.ok(worker.includes('"interaction.'+id+'.'+axis+'"'),id+" "+axis);
 }
 for(const id of ids)assert.ok(INTERACTION_EDITOR_SCRIPT.includes('id:"'+id+'"'),id);
});
test("editor draws radius rings and supports pointer dragging and saves",()=>{
 new Function(INTERACTION_EDITOR_SCRIPT);
 assert.match(INTERACTION_EDITOR_SCRIPT,/interactionCtx\.arc\(pt\.x,pt\.y,pt\.r/);
 assert.match(INTERACTION_EDITOR_SCRIPT,/setPointerCapture\(e\.pointerId\)/);
 assert.match(INTERACTION_EDITOR_SCRIPT,/interactionSet\("x",pt\.x\);interactionSet\("y",pt\.y\)/);
 assert.match(INTERACTION_EDITOR_SCRIPT,/const ok=await push\(true\)/);
 assert.match(INTERACTION_EDITOR_HTML,/interaction-radius/);
 assert.match(INTERACTION_EDITOR_CSS,/touch-action:none/);
});
test("actual gameplay E checks use saved points",()=>{
 assert.match(worker,/interactionNear\("street_pub",PUB_DOOR/);
 assert.match(worker,/interactionNear\("street_"\+Object\.keys\(SHOPS\)/);
 assert.match(worker,/interactionNear\(exitId,exit,96\)/);
 assert.match(worker,/interactionNear\("pub_downstairs",PUB_BASEMENT_APPROACH/);
 assert.match(worker,/interactionNear\("basement_upstairs"/);
 assert.match(worker,/const exitPoint=interactionAt\("pub_exit"/);
 assert.match(worker,/const stairPoint=interactionAt\("pub_downstairs"/);
 assert.match(worker,/const upPoint=interactionAt\("basement_upstairs"/);
});
test("both editors compile inside real Settings page template",()=>{
 const start=worker.indexOf("const SETTINGS_HTML=String.raw`");
 const end=worker.indexOf(";"+String.fromCharCode(10)+"const HTML = String.raw`",start);
 assert.ok(start>=0&&end>start);
 const make=new Function("TRANSITION_EDITOR_CSS","TRANSITION_EDITOR_HTML","TRANSITION_EDITOR_SCRIPT","INTERACTION_EDITOR_CSS","INTERACTION_EDITOR_HTML","INTERACTION_EDITOR_SCRIPT",worker.slice(start,end+1)+"\nreturn SETTINGS_HTML;");
 const html=make(TRANSITION_EDITOR_CSS,TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT,INTERACTION_EDITOR_CSS,INTERACTION_EDITOR_HTML,INTERACTION_EDITOR_SCRIPT);
 assert.ok(html.includes('id="interaction-map"'));
 assert.ok(html.includes('id="transition-map"'));
 new Function(html.split("<script>")[1].split("</script>")[0]);
});
