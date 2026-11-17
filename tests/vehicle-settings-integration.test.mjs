import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LOCAL_ROOM_SOURCE} from "../src/local-room-source.js";
const source=readFileSync(new URL("../src/consumables.js",import.meta.url),"utf8");
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/consumables-client.js",import.meta.url),"utf8");
test("browser local engine uses the current server vehicle logic",()=>{
 assert.equal(LOCAL_ROOM_SOURCE,source);
 assert.match(source,/LOCAL_VEHICLE_SETTINGS/);
});
test("all devices load the same Supabase settings",()=>{
 assert.match(worker,/const singleMode=false;/);
 assert.match(worker,/maestroescape-settings/);
 assert.ok(worker.includes("settings:JSON.parse(payload),revision"),"Full editor submits a revision-checked Supabase document");
 assert.match(worker,/a\\.settings-nav\\[href="\\/settings"\\]/);
});
test("single-player startup receives saved vehicle positions",()=>{
 assert.match(ui,/readVehicleSpawnSettings\(\)/);
 assert.match(ui,/LOCAL_VEHICLE_SETTINGS:savedStarts/);
 assert.match(ui,/room\.env\.LOCAL_VEHICLE_SETTINGS=this\.readVehicleSpawnSettings\(\)/);
});
