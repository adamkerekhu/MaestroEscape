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
test("single-player settings editor saves locally by default",()=>{
 assert.match(worker,/const singleMode=true;/);
 assert.match(worker,/a\.settings-nav\[href="\/settings"\]/);
});
test("single-player startup receives saved vehicle positions",()=>{
 assert.match(ui,/readVehicleSpawnSettings\(\)/);
 assert.match(ui,/LOCAL_VEHICLE_SETTINGS:savedStarts/);
 assert.match(ui,/room\.env\.LOCAL_VEHICLE_SETTINGS=this\.readVehicleSpawnSettings\(\)/);
});
