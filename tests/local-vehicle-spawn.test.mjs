import test from "node:test";
import assert from "node:assert/strict";
import {ConsumableRoom} from "../src/consumables.js";
const token="a".repeat(32);
function buildRoom(settings){
 const memory=new Map();
 const storage={get:async key=>memory.get(key),put:async(key,value)=>memory.set(key,value)};
 const room=new ConsumableRoom({storage},{LOCAL_VEHICLE_SETTINGS:settings});
 const fetchRoom=async(op,args={})=>{
  const input=op?{token,commandId:"cmd"+Math.random().toString(36).slice(2),op,...args}:null;
  const request=op?new Request("https://single.local/",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)}):new Request("https://single.local/?token="+token);
  const response=await room.fetch(request);
  return response.json();
 };
 return {room,storage,memory,fetchRoom};
}
test("single player starts vehicles at local settings coordinates",async()=>{
 const settings={"vehicle.skoda.spawnX":1124,"vehicle.skoda.spawnY":716,"vehicle.skoda.angle":270,"vehicle.octavia.spawnX":1030,"vehicle.octavia.spawnY":650,"vehicle.octavia.angle":95,"vehicle.bike1.spawnX":720,"vehicle.bike1.spawnY":815};
 const {fetchRoom}=buildRoom(settings);
 const result=await fetchRoom();
 assert.equal(result.ok,true);
 const skoda=result.snapshot.vehicles.find(v=>v.id==="skoda");
 const octavia=result.snapshot.vehicles.find(v=>v.id==="octavia");
 const bike=result.snapshot.vehicles.find(v=>v.id==="bike1");
 assert.equal(skoda.x,1124);assert.equal(skoda.y,716);assert.ok(Math.abs(skoda.angle-Math.PI*1.5)<0.00001);
 assert.equal(octavia.x,1030);assert.equal(octavia.y,650);
 assert.equal(bike.x,720);assert.equal(bike.y,815);
});
test("respawn vehicles uses latest saved single-player positions",async()=>{
 const initial={"vehicle.skoda.spawnX":1110,"vehicle.skoda.spawnY":700,"vehicle.skoda.angle":220};
 const {room,fetchRoom}=buildRoom(initial);
 const first=await fetchRoom();
 assert.equal(first.snapshot.vehicles.find(v=>v.id==="skoda").x,1110);
 const select=await fetchRoom("selectCharacter",{characterId:"maestro"});assert.equal(select.ok,true);
 room.env.LOCAL_VEHICLE_SETTINGS={"vehicle.skoda.spawnX":1244,"vehicle.skoda.spawnY":759,"vehicle.skoda.angle":25};
 const respawn=await fetchRoom("respawnVehicles");
 assert.equal(respawn.ok,true,JSON.stringify(respawn));
 const skoda=respawn.snapshot.vehicles.find(v=>v.id==="skoda");
 assert.equal(skoda.x,1244);assert.equal(skoda.y,759);
 assert.ok(Math.abs(skoda.angle-25*Math.PI/180)<0.00001);
 assert.ok(respawn.snapshot.vehicleRespawnRevision>0);
});
