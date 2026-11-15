import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CASINO_SIZE,CASINO_SPAWN,CASINO_EXIT,CASINO_WALLS,CASINO_HOTSPOTS} from "../src/casino-map.js";
import {INTERACTION_EDITOR_HTML,INTERACTION_EDITOR_SCRIPT} from "../src/interaction-editor.js";
import {TRANSITION_EDITOR_HTML,TRANSITION_EDITOR_SCRIPT} from "../src/transition-editor.js";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
const engine=readFileSync(new URL("../src/consumables.js",import.meta.url),"utf8");
const local=readFileSync(new URL("../src/local-room-source.js",import.meta.url),"utf8");
test("casino dimensions, collision and hotspots are wired from uploaded geometry",()=>{
 assert.deepEqual(CASINO_SIZE,{w:1696,h:960});
 assert.deepEqual(CASINO_SPAWN,{x:808,y:301});
 assert.equal(CASINO_WALLS.length,16);
 assert.equal(CASINO_HOTSPOTS.length,8);
 for(const point of [CASINO_SPAWN,CASINO_EXIT]){
  const r=point===CASINO_SPAWN?13:10;
  assert.ok(!CASINO_WALLS.some(([x,y,w,h])=>point.x+r>x&&point.x-r<x+w&&point.y+r>y&&point.y-r<y+h),"Spawn or ladder inside wall");
 }
});
test("street entrance stays disabled until user places and enables it",()=>{
 assert.match(worker,/"casino.manhole.enabled":0/);
 assert.match(worker,/const casinoManholeNearby=.*cfg\("casino.manhole.enabled"\)/);
 assert.match(worker,/casinoManholeMarker\.setPosition\(cfg\("interaction.street_casino.x"\),cfg\("interaction.street_casino.y"\)\)/);
 assert.match(worker,/casinoManholeMarker\.setVisible\(!!cfg\("casino.manhole.enabled"\)&&!insidePub\)/);
 assert.match(INTERACTION_EDITOR_HTML,/id="casino-manhole-enabled"/);
 assert.match(INTERACTION_EDITOR_SCRIPT,/id:"street_casino",scene:"street"/);
 assert.match(INTERACTION_EDITOR_SCRIPT,/id:"casino_exit",scene:"casino"/);
});
test("casino arrival and return ladder use draggable settings",()=>{
 assert.match(TRANSITION_EDITOR_HTML,/value="casino"/);
 assert.match(TRANSITION_EDITOR_SCRIPT,/casino:\{name:"Casino manhole arrival"/);
 assert.match(worker,/transitionArrival\("casino",CASINO_SPAWN\)/);
 assert.match(worker,/interactionNear\("casino_exit",CASINO_EXIT,CASINO_EXIT\.radius\)/);
 assert.match(worker,/casinoReturnPos=\{x:player.x,y:player.y\}/);
 assert.match(worker,/const back=casinoReturnPos\|\|streetPos/);
 assert.match(worker,/function exitCasino\(\)/);
 assert.match(worker,/function enterCasino\(\)/);
 assert.match(worker,/if\(casinoExitNearby\(\)\)\{exitCasino\(\);return;\}/);
});
test("casino asset is loaded, rendered, and served with WebP mime",()=>{
 assert.match(worker,/this\.load\.image\("casino","\/assets\/casino.webp"\)/);
 assert.match(worker,/casinoImage=scene\.add\.image\(0,0,"casino"\)/);
 assert.match(worker,/url\.pathname==="\/assets\/casino.webp"/);
 assert.match(worker,/Assets\/Maps\/maestro_casino\.webp/);
 assert.match(worker,/CASINO_WALLS:insideBasement\?BASEMENT_WALLS/);
 assert.match(worker,/insideCasino\?cfg\("building.casino.zoom"\)/);
});
test("casino shares the single-player room and retains existing basement route",()=>{
 assert.match(engine,/\["street","pub","basement","casino","spar","gyros","dohanybolt"\]/);
 assert.ok(local.includes("\\\"casino\\\""),"Local room source contains casino scene whitelist");
 assert.match(worker,/function enterBasement\(\)/);
 assert.match(worker,/function leaveBasement\(\)/);
 assert.match(worker,/const pubBasementStairsNear=\(\)=>insidePub&&!insideBasement&&!insideCasino/);
});
test("casino hotspots are non-wagering placeholders",()=>{
 assert.match(worker,/interaction is ready for a future mini-game\. No wagering is implemented/);
 assert.equal(CASINO_HOTSPOTS.filter(x=>x.id.startsWith("slot_")).length,5);
});

test("casino WebP is physically committed and has valid RIFF/WEBP header",()=>{
 const asset=readFileSync(new URL("../Assets/Maps/maestro_casino.webp",import.meta.url));
 assert.ok(asset.length>5000,"Casino map asset should not be a missing stub");
 assert.equal(asset.toString("ascii",0,4),"RIFF");
 assert.equal(asset.toString("ascii",8,12),"WEBP");
 const riffSize=asset.readUInt32LE(4);
 assert.equal(riffSize+8,asset.length,"WebP RIFF length must match file bytes");
});

test("casino artwork is isolated from street and drunk double-vision layers",()=>{
 assert.match(worker,/casinoImage=scene\.add\.image\(0,0,"casino"\)/);
 assert.match(worker,/casinoImage\.destroy\(\);casinoImage=null/);
 assert.match(worker,/casinoImage\.setPosition\(0,0\)\.setAlpha\(1\)\.setVisible\(true\)/);
 assert.match(worker,/if\(!insideCasino\)\{casinoImage\.setVisible\(false\)\.setAlpha\(0\);\}/);
 assert.match(worker,/drunkGhostLayers\.push\(\{original:casinoImage,ghost\}\)/);
});
test("selected single-player character becomes visible after map initialization and late state sync",()=>{
 assert.match(worker,/character\.setVisible\(!!gameplay\?\.hasCharacter\(\)&&!activeVehicle&&!gameplay\?\.isDead\(\)\)/);
 assert.match(worker,/gameplay\?\.hasCharacter\(\)&&!activeVehicle&&!gameplay\?\.occupied&&!gameplay\?\.isDead\(\)/);
});
