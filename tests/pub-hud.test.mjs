import test from "node:test";
import assert from "node:assert/strict";
import { PUB_HUD_SCRIPT, PUB_HUD_CSS } from "../src/pub-hud.js";
import {readFileSync} from "node:fs";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
test("full viewport map layer is served with overlay control assets",()=>{
 assert.match(PUB_HUD_CSS,/#screen\{position:fixed!important;inset:0!important/);
 assert.match(PUB_HUD_CSS,/#pub-hud\{position:absolute;inset:0;z-index:6/);
 assert.match(worker,/url\.pathname==="\/assets\/pub-hud\.css"/);
 assert.match(worker,/url\.pathname==="\/assets\/pub-hud\.js"/);
 assert.match(worker,/HTML\.replace\("<\/head>"/);
});
test("pub wheel includes existing critical gameplay actions",()=>{
 for(const action of ['Inventory','Interact','Group','Chat','Character','Vehicles','Back bar','Settings'])
   assert.ok(PUB_HUD_SCRIPT.includes('label:"'+action+'"'),"Missing action: "+action);
 for(const action of ['#vehicle-respawn-button','#group-call-button','#maestro-chat-button','#drunk-test-next'])
   assert.ok(PUB_HUD_SCRIPT.includes(action),"Missing original control: "+action);
 new Function(PUB_HUD_SCRIPT);
});
test("supports mobile interactions, escape to close and reduced motion",()=>{
 assert.match(PUB_HUD_SCRIPT,/mobile-interact/);
 assert.match(PUB_HUD_SCRIPT,/e\.key==="Escape"/);
 assert.match(PUB_HUD_CSS,/prefers-reduced-motion/);
 assert.match(PUB_HUD_CSS,/max-width:650px/);
});
