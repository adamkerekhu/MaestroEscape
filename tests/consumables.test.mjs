import test from "node:test";
import assert from "node:assert/strict";
import { ConsumableRoom } from "../src/consumables.js";

function fixture(env={}){
 const map=new Map();
 const ctx={storage:{transaction:async fn=>fn({
  get:async k=>map.get(k),
  put:async(k,v)=>map.set(k,structuredClone(v))
 })}};
 const room=new ConsumableRoom(ctx,env);
 const users=["a".repeat(32),"b".repeat(32)];
 const send=async (n,op,args={})=>{
  const request=new Request("https://room.test/",{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({token:users[n],commandId:crypto.randomUUID().replaceAll("-",""),op,...args})});
  const response=await room.fetch(request);
  return {status:response.status,...await response.json()};
 };
 const get=async n=>{
  const response=await room.fetch(new Request("https://room.test/?token="+users[n]));
  return await response.json();
 };
 return {send,get,map};
}
test("Buksza scratch variants remain tied to server-authenticated ticket outcomes",async()=>{
 const {send,get}=fixture();
 assert.ok((await send(0,"selectCharacter",{characterId:"maestro"})).ok);
 assert.ok((await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:470})).ok);
 for(let n=0;n<12;n++){
  const order=await send(0,"buyScratchTicket",{npcId:"tobacco_cashier",
   npcPoint:{x:519,y:425},actorPosition:{scene:"dohanybolt",x:519,y:470}});
  assert.equal(order.ok,true,order.error);
  const item=order.snapshot.items.find(i=>i.type==="scratch_ticket"&&i.location.kind==="vendor");
  assert.ok(item,"Purchased scratch card available at cashier");
  const pickup=await send(0,"collectItem",{itemId:item.id});
  assert.equal(pickup.ok,true,pickup.error);
  const variant=pickup.snapshot.scratchVariants[item.id];
  assert.ok(Number.isInteger(variant)&&variant>=1&&variant<=10);
  assert.equal((await get(0)).snapshot.scratchVariants[item.id],variant,
   "Same ticket reveals the same variant on room refresh");
  const scratch=await send(0,"scratchTicket",{itemId:item.id});
  assert.equal(scratch.ok,true,scratch.error);
  assert.equal(scratch.variant,variant);
  assert.equal(scratch.won,variant===10,"Only variant 10 is the winning three-of-a-kind card");
  assert.equal(scratch.snapshot.scratchVariants[item.id],undefined);
  const second=await send(0,"scratchTicket",{itemId:item.id});
  assert.equal(second.ok,false,"Tickets cannot be scratched twice");
 }
});

test("room group chat broadcasts, sanitizes, rate limits, and isolates player identities",async()=>{
 const {send,get}=fixture();
 assert.equal((await send(0,"sendChat",{message:"Hello"})).ok,false,"Guests must select a character");
 assert.ok((await send(0,"selectCharacter",{characterId:"maestro"})).ok);
 const available=(await get(0)).snapshot.characters.find(c=>c.id!=="maestro"&&!c.selectedBy);
 assert.ok(available,"Another playable character is available");
 assert.ok((await send(1,"selectCharacter",{characterId:available.id})).ok);
 const first=await send(0,"sendChat",{message:"   Hey\n everyone!   "});
 assert.equal(first.ok,true,first.error);
 assert.equal(first.snapshot.chatMessages.length,1);
 assert.equal(first.snapshot.chatMessages[0].message,"Hey everyone!");
 const received=await get(1);
 assert.equal(received.snapshot.chatMessages[0].id,first.snapshot.chatMessages[0].id,"Another client in the same room sees the message");
 assert.equal(received.snapshot.chatMessages[0].name,"Maestro");
 const spam=await send(0,"sendChat",{message:"again"});
 assert.equal(spam.ok,false,"Spam is rate limited");
 const empty=await send(1,"sendChat",{message:"    "});
 assert.equal(empty.ok,false);
 const huge=await send(1,"sendChat",{message:"x".repeat(201)});
 assert.equal(huge.ok,false);
 const second=await send(1,"sendChat",{message:"<script>alert(1)</script>"});
 assert.equal(second.ok,true,second.error);
 assert.equal((await get(0)).snapshot.chatMessages.at(-1).message,"<script>alert(1)</script>");
 assert.equal((await get(0)).snapshot.chatMessages.length,2);
});

test("single-player mode runs the shared room engine locally without Durable Objects",async()=>{
 const {LOCAL_ROOM_SOURCE}=await import("../src/local-room-source.js");
 const {readFileSync}=await import("node:fs");
 const source=readFileSync(new URL("../src/consumables.js",import.meta.url),"utf8");
 assert.equal(LOCAL_ROOM_SOURCE,source,"Offline engine must use the same rules as multiplayer");
 const {ConsumableRoom:LocalRoom}=await import("data:text/javascript,"+encodeURIComponent(LOCAL_ROOM_SOURCE));
 const store=new Map();
 const storage={
  get:async k=>store.get(k),
  put:async(k,v)=>store.set(k,v),
  transaction:async fn=>fn({get:async k=>store.get(k),put:async(k,v)=>store.set(k,v)})
 };
 const room=new LocalRoom({storage},{});
 const token="f".repeat(40);
 const send=async(op,args={})=>{
  const req=new Request("https://single-player.local/",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({token,commandId:crypto.randomUUID().replaceAll("-",""),op,...args})
  });
  const response=await room.fetch(req);
  assert.equal(response.headers.get("content-type")?.includes("application/json"),true);
  return response.json();
 };
 const selection=await send("selectCharacter",{characterId:"maestro"});
 assert.equal(selection.ok,true,selection.error);
 const position=await send("syncPosition",{scene:"dohanybolt",x:519,y:470});
 assert.equal(position.ok,true,position.error);
 const buy=await send("buyScratchTicket",{npcId:"tobacco_cashier",
  npcPoint:{x:519,y:425},actorPosition:{scene:"dohanybolt",x:519,y:470}});
 assert.equal(buy.ok,true,buy.error);
 const ticket=buy.snapshot.items.find(i=>i.type==="scratch_ticket");
 assert.ok(ticket);
 const pickup=await send("collectItem",{itemId:ticket.id});
 assert.equal(pickup.ok,true,pickup.error);
 const scratched=await send("scratchTicket",{itemId:ticket.id});
 assert.equal(scratched.ok,true,scratched.error);
 assert.equal(typeof scratched.won,"boolean");
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 assert.ok(worker.includes('url.pathname==="/assets/local-room.js"'));
 assert.ok(worker.includes('get("mode")!=="multi"'),"Single-player mode and mode selection do not query Cloudflare settings");
 const {CONSUMABLE_CLIENT_SCRIPT:client}=await import("../src/consumables-client.js");
 assert.ok(client.includes('import("/assets/local-room.js")'));
 assert.ok(client.includes('this.singleMode'));
 assert.ok(client.includes('return room.fetch(req)'));
});

test("beer takes one action and disappears after finishing without creating a glass",async()=>{
 const old=Date.now;let clock=100000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  assert.ok((await send(0,"syncPosition",{scene:"pub",x:413,y:398})).ok);
  assert.ok((await send(0,"orderBeer")).ok);
  clock+=3000;
  const item=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  assert.ok(item);assert.equal(item.remainingUnits,1);
  assert.ok((await send(0,"collectItem",{itemId:item.id})).ok);
  const start=await send(0,"startConsumeUnit",{itemId:item.id});
  assert.ok(start.ok);
  assert.equal((await send(0,"completeConsumeUnit",{actionId:start.action.id})).ok,false);
  clock+=1500;
  const finished=await send(0,"completeConsumeUnit",{actionId:start.action.id});
  assert.ok(finished.ok);
  const end=(await get(0)).snapshot;
  assert.equal(end.inventory.length,0);
  assert.equal(end.items.some(i=>i.id===item.id),false);
  assert.equal(end.items.some(i=>i.type==="empty_glass"),false);
  assert.equal(end.objectives.beer,1);
  assert.equal(end.completionEvents.filter(e=>e.type==="beer").length,1);
  assert.ok((await send(0,"orderBeer")).ok);
  clock+=3000;
  const second=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  assert.ok(second);
  assert.notEqual(second.id,item.id);
 }finally{Date.now=old}
});
test("multiple beers can occupy separate table slots, seventh item is rejected",async()=>{
 const old=Date.now;let clock=100000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  for(let n=0;n<3;n++){
   assert.ok((await send(0,"orderBeer")).ok);
   clock+=3000;
   const item=(await get(0)).snapshot.items.filter(i=>i.type==="beer"&&i.location.kind==="vendor")[0];
   assert.ok(item,"beer "+n);
   assert.ok((await send(0,"collectItem",{itemId:item.id})).ok);
   assert.ok((await send(0,"syncPosition",{scene:"pub",x:208,y:530})).ok);
   assert.ok((await send(0,"placeOnTable",{itemId:item.id,tableId:"pub_left",slot:n})).ok);
   await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  }
  const data=(await get(0)).snapshot;
  assert.equal(data.items.filter(i=>i.location.kind==="table").length,3);
  for(let n=3;n<6;n++){
   await send(0,"orderBeer");clock+=3000;
   const id=(await get(0)).snapshot.items.find(i=>i.location.kind==="vendor").id;
   await send(0,"collectItem",{itemId:id});
   await send(0,"syncPosition",{scene:"pub",x:208,y:530});
   assert.ok((await send(0,"placeOnTable",{itemId:id,tableId:"pub_left",slot:n})).ok);
   await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  }
  assert.equal((await get(0)).snapshot.items.filter(i=>i.location.kind==="table").length,6);
  await send(0,"orderBeer");clock+=3000;
  const id=(await get(0)).snapshot.items.find(i=>i.location.kind==="vendor").id;
  await send(0,"collectItem",{itemId:id});
  await send(0,"syncPosition",{scene:"pub",x:208,y:530});
  const full=await send(0,"placeOnTable",{itemId:id,tableId:"pub_left",slot:2});
  assert.equal(full.ok,false);assert.match(full.error,/full/i);
 }finally{Date.now=old}
});
test("gyros order creates real kebab and four bites complete it",async()=>{
 const old=Date.now;let clock=500000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();await send(0,"syncPosition",{scene:"gyros",x:360,y:330});
  assert.ok((await send(0,"orderKebab")).ok);clock+=5000;
  const item=(await get(0)).snapshot.items.find(i=>i.type==="kebab");
  assert.ok(item);assert.equal(item.remainingUnits,4);
  assert.ok((await send(0,"collectItem",{itemId:item.id})).ok);
  for(let n=0;n<4;n++){
   const begin=await send(0,"startConsumeUnit",{itemId:item.id});assert.ok(begin.ok);
   clock+=2000;assert.ok((await send(0,"completeConsumeUnit",{actionId:begin.action.id})).ok);
  }
  const state=(await get(0)).snapshot;
  assert.equal(state.objectives.kebab,1);
  assert.ok(!state.items.some(i=>i.id===item.id));
 }finally{Date.now=old}
});
test("cigarette pack yields exactly one cigarette per extraction, lit cigarette takes four puffs",async()=>{
 const old=Date.now;let clock=600000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:425});
  const buy=await send(0,"buyPack");assert.ok(buy.ok);
  const pack=buy.snapshot.items.find(i=>i.type==="cigarette_pack");
  assert.equal(pack.remainingUnits,5);
  assert.ok((await send(0,"collectItem",{itemId:pack.id})).ok);
  const take=await send(0,"extractCigarette",{itemId:pack.id});
  assert.ok(take.ok);assert.equal(take.snapshot.inventory.find(i=>i.id===pack.id).remainingUnits,4);
  const cig=take.snapshot.inventory.find(i=>i.type==="cigarette");
  assert.equal((await send(0,"startConsumeUnit",{itemId:cig.id})).ok,false);
  assert.ok((await send(0,"light",{itemId:cig.id})).ok);
  for(let n=0;n<4;n++){
   const begin=await send(0,"startConsumeUnit",{itemId:cig.id});assert.ok(begin.ok);
   clock+=1500;assert.ok((await send(0,"completeConsumeUnit",{actionId:begin.action.id})).ok);
  }
  const state=(await get(0)).snapshot;assert.equal(state.objectives.cigarette,1);
  assert.ok(!state.items.some(i=>i.id===cig.id));
 }finally{Date.now=old}
});
test("borrowing player cigarette requires acceptance and transfers only once",async()=>{
 const old=Date.now;let clock=700000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:425});
  const pack=(await send(0,"buyPack")).snapshot.items[0];
  await send(0,"collectItem",{itemId:pack.id});
  await send(0,"syncPosition",{scene:"pub",x:330,y:500});
  await send(1,"syncPosition",{scene:"pub",x:343,y:515});
  const requester=(await get(1)).snapshot.playerId;
  const requested=await send(1,"borrowRequest",{targetId:(await get(0)).snapshot.playerId});
  assert.ok(requested.ok);
  const request=requested.snapshot.requests[0];
  assert.equal((await get(1)).snapshot.inventory.length,0);
  const yes=await send(0,"borrowResponse",{requestId:request.id,accept:true});
  assert.ok(yes.ok);
  assert.equal((await get(1)).snapshot.inventory.filter(i=>i.type==="cigarette").length,1);
  assert.equal((await get(0)).snapshot.inventory.find(i=>i.id===pack.id).remainingUnits,4);
  assert.equal((await send(0,"borrowResponse",{requestId:request.id,accept:true})).ok,false);
  assert.ok(requester);
 }finally{Date.now=old}
});

test("interrupted consumption never decrements and inventory survives scene transitions",async()=>{
 const old=Date.now;let clock=800000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  await send(0,"orderBeer");clock+=3000;
  const beer=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  await send(0,"collectItem",{itemId:beer.id});
  const action=await send(0,"startConsumeUnit",{itemId:beer.id});assert.ok(action.ok);
  clock+=500;
  await send(0,"syncPosition",{scene:"pub",x:440,y:432});
  clock+=1000;
  assert.equal((await send(0,"completeConsumeUnit",{actionId:action.action.id})).ok,false);
  assert.equal((await get(0)).snapshot.inventory[0].remainingUnits,5);
  await send(0,"syncPosition",{scene:"street",x:784,y:548});
  await send(0,"syncPosition",{scene:"gyros",x:294,y:315});
  assert.equal((await get(0)).snapshot.inventory[0].id,beer.id);
 }finally{Date.now=old}
});
test("concurrent pickup and duplicate command IDs never duplicate an item",async()=>{
 const old=Date.now;let clock=900000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  await send(1,"syncPosition",{scene:"pub",x:413,y:399});
  await send(0,"orderBeer");clock+=3000;
  const item=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  const result=await Promise.all([
   send(0,"collectItem",{itemId:item.id}),
   send(1,"collectItem",{itemId:item.id})
  ]);
  assert.equal(result.filter(r=>r.ok).length,1);
  const a=(await get(0)).snapshot,b=(await get(1)).snapshot;
  assert.equal(a.inventory.length+b.inventory.length,1);
 }finally{Date.now=old}
});
test("cigarette request decline and expiration preserve ownership",async()=>{
 const old=Date.now;let clock=1000000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:425});
  const id=(await send(0,"buyPack")).snapshot.items[0].id;
  await send(0,"collectItem",{itemId:id});
  await send(0,"syncPosition",{scene:"pub",x:342,y:511});
  await send(1,"syncPosition",{scene:"pub",x:352,y:514});
  const p0=(await get(0)).snapshot.playerId;
  const request=await send(1,"borrowRequest",{targetId:p0});
  const rid=request.snapshot.requests[0].id;
  assert.ok((await send(0,"borrowResponse",{requestId:rid,accept:false})).ok);
  assert.equal((await get(0)).snapshot.inventory[0].remainingUnits,5);
  const again=await send(1,"borrowRequest",{targetId:p0});assert.ok(again.ok);
  clock+=8100;
  const expired=await send(0,"borrowResponse",{requestId:again.snapshot.requests[0].id,accept:true});
  assert.equal(expired.ok,false);
  assert.equal((await get(0)).snapshot.inventory[0].remainingUnits,5);
  assert.equal((await get(1)).snapshot.inventory.length,0);
 }finally{Date.now=old}
});
test("single-player round reset clears world, orders and progress",async()=>{
 const old=Date.now;let clock=1100000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  await send(0,"orderBeer");clock+=3000;
  assert.ok((await get(0)).snapshot.items.length);
  assert.ok((await send(0,"resetRound")).ok);
  const state=(await get(0)).snapshot;
  assert.equal(state.items.length,0);assert.equal(state.orders.length,0);
  assert.deepEqual(state.objectives,{beer:0,kebab:0,cigarette:0});
 }finally{Date.now=old}
});

test("bartender refuses a refill without an empty glass, not a partially full beer",async()=>{
 const old=Date.now;let clock=1200000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();await send(0,"syncPosition",{scene:"pub",x:413,y:398});
  const nothing=await send(0,"refillBeer");assert.equal(nothing.ok,false);
  assert.match(nothing.error,/empty glass/i);
  await send(0,"orderBeer");clock+=3000;
  const id=(await get(0)).snapshot.items.find(i=>i.type==="beer").id;
  await send(0,"collectItem",{itemId:id});
  const partial=await send(0,"refillBeer");assert.equal(partial.ok,false);
  assert.equal((await get(0)).snapshot.inventory[0].remainingUnits,5);
 }finally{Date.now=old}
});
test("pub NPC cigarette sharing obeys individual stock and share choices",async()=>{
 const old=Date.now;let clock=1300000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();await send(0,"syncPosition",{scene:"pub",x:342,y:511});
  assert.ok((await send(0,"npcBorrow",{npcId:"maestro_regular_1"})).ok);
  assert.equal((await get(0)).snapshot.inventory.filter(i=>i.type==="cigarette").length,1);
  await send(0,"syncPosition",{scene:"pub",x:648,y:707});
  const refused=await send(0,"npcBorrow",{npcId:"maestro_regular_2"});
  assert.equal(refused.ok,false);
  assert.equal((await get(0)).snapshot.inventory.filter(i=>i.type==="cigarette").length,1);
 }finally{Date.now=old}
});

test("lobby character selections are unique per room and persist on reconnect",async()=>{
 const {send,get}=fixture();
 const first=await get(0),second=await get(1);
 assert.equal(first.snapshot.selectedCharacter,null);
 assert.equal(second.snapshot.selectedCharacter,null);
 const selected=await send(0,"selectCharacter",{characterId:"maestro"});
 assert.ok(selected.ok);
 assert.equal(selected.snapshot.selectedCharacter,"maestro");
 const taken=await send(1,"selectCharacter",{characterId:"maestro"});
 assert.equal(taken.ok,false);
 assert.match(taken.error,/taken/i);
 const separate=await send(1,"selectCharacter",{characterId:"casual"});
 assert.ok(separate.ok);
 assert.equal(separate.snapshot.selectedCharacter,"casual");
 const reload=(await get(0)).snapshot;
 assert.equal(reload.selectedCharacter,"maestro");
 const peer=reload.players.find(p=>p.id===separate.snapshot.playerId);
 assert.equal(peer.characterId,"casual");
 assert.equal(reload.characters.find(c=>c.id==="casual").selectedBy,peer.id);
 const release=await send(0,"releaseCharacter");
 assert.ok(release.ok);
 const claim=await send(1,"selectCharacter",{characterId:"maestro"});
 assert.ok(claim.ok);
});
test("lobby rejects missing or unknown character IDs",async()=>{
 const {send,get}=fixture();await get(0);
 const wrong=await send(0,"selectCharacter",{characterId:"unknown"});
 assert.equal(wrong.ok,false);
 assert.equal((await get(0)).snapshot.selectedCharacter,null);
 const valid=await send(0,"selectCharacter",{characterId:"muscular"});
 assert.ok(valid.ok);
 assert.equal(valid.snapshot.selectedCharacter,"muscular");
});

test("four character slots match planned sprites and directions survive room snapshots",async()=>{
 const {send,get}=fixture();
 const initial=await get(0);
 assert.deepEqual(initial.snapshot.characters.map(c=>c.id),["maestro","casual","suit","muscular"]);
 assert.equal(new Set(initial.snapshot.characters.map(c=>c.id)).size,4);
 assert.ok((await send(0,"selectCharacter",{characterId:"suit"})).ok);
 const facing=await send(0,"syncPosition",{scene:"pub",x:332,y:741,face:"left",moving:true});
 assert.ok(facing.ok);
 const player=facing.snapshot.players.find(q=>q.id===facing.snapshot.playerId);
 assert.equal(player.characterId,"suit");
 assert.equal(player.face,"left");
 assert.equal(player.moving,true);
 const stopped=await send(0,"syncPosition",{scene:"pub",x:332,y:741,face:"up",moving:false});
 const after=stopped.snapshot.players.find(q=>q.id===stopped.snapshot.playerId);
 assert.equal(after.face,"up");assert.equal(after.moving,false);
});

test("three custom character sprite files exist with correct WebP headers",async()=>{
 const {readFileSync}=await import("node:fs");
 const {resolve}=await import("node:path");
 for(const id of ["casual","suit","muscular"]){
  const bytes=readFileSync(resolve("Assets/Characters/"+id+"_walk.webp"));
  assert.ok(bytes.length>10000,id+" sprite unexpectedly small");
  assert.equal(bytes.toString("ascii",0,4),"RIFF",id+" must be RIFF WebP");
  assert.equal(bytes.toString("ascii",8,12),"WEBP",id+" must be WebP");
 }
});

test("remote players have no name tags and movement uses fast updates with per-frame smoothing",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT}=await import("../src/consumables-client.js");
 const browser=CONSUMABLE_CLIENT_SCRIPT;
 assert.doesNotThrow(()=>new Function(browser));
 assert.ok(!browser.includes('this.scene.add.text(0,-91,q.alias'),"Player aliases should not float over characters");
 assert.ok(browser.includes('marker.add([avatar])'),"Remote avatars must have no name labels");
 assert.match(browser,/setInterval\(\(\)=>this\.syncPosition\(\).*?this\.singleMode\?200:500\)/);
 assert.match(browser,/setInterval\(\(\)=>this\.fetchSnapshot\(\).*?this\.singleMode\?500:2500\)/);
 assert.ok(browser.includes("this.positionPending"),"Network position requests must not overlap");
 assert.ok(browser.includes("this.snapshotPending"),"State snapshots must not overlap");
 assert.ok(browser.includes("1-Math.exp(-Math.min(50,Math.max(1,delta))/85)"),"Remote positions must be smoothed every frame");
});

test("two clients see the same car and cannot claim the same driver seat",async()=>{
 const {send,get}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(1,"selectCharacter",{characterId:"casual"});
 await send(0,"syncPosition",{scene:"street",x:700,y:509});
 await send(1,"syncPosition",{scene:"street",x:710,y:510});
 const first=await send(0,"boardVehicle",{vehicleId:"skoda",seat:0});
 assert.ok(first.ok);assert.equal(first.snapshot.occupiedVehicle.vehicleId,"skoda");
 assert.equal(first.snapshot.occupiedVehicle.seat,0);
 const second=await send(1,"boardVehicle",{vehicleId:"skoda",seat:0});
 assert.equal(second.ok,false);assert.match(second.error,/occupied/i);
 const passenger=await send(1,"boardVehicle",{vehicleId:"skoda",seat:1});
 assert.ok(passenger.ok);assert.equal(passenger.snapshot.occupiedVehicle.seat,1);
 const observed=(await get(0)).snapshot.vehicles.find(v=>v.id==="skoda");
 assert.equal(observed.seats[0],first.snapshot.playerId);
 assert.equal(observed.seats[1],passenger.snapshot.playerId);
});
test("passenger cannot steer and receives identical shared vehicle movement",async()=>{
 const old=Date.now;let clock=3000000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"suit"});
  await send(0,"syncPosition",{scene:"street",x:700,y:510});
  await send(1,"syncPosition",{scene:"street",x:705,y:516});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  assert.ok((await send(1,"boardVehicle",{vehicleId:"skoda",seat:2})).ok);
  const illegal=await send(1,"driveVehicle",{vehicleId:"skoda",x:710,y:501,angle:1,speed:40});
  assert.equal(illegal.ok,false);
  assert.equal(illegal.status,403);
  clock+=100;
  const driven=await send(0,"driveVehicle",{vehicleId:"skoda",x:711,y:494,angle:2.4,speed:80});
  assert.ok(driven.ok,driven.error);
  const spectator=(await get(1)).snapshot;
  const skoda=spectator.vehicles.find(v=>v.id==="skoda");
  assert.equal(skoda.x,711);assert.equal(skoda.y,494);
  const passenger=spectator.players.find(p=>p.id===spectator.playerId);
  assert.equal(passenger.x,711);assert.equal(passenger.y,494);
  assert.equal(spectator.occupiedVehicle.seat,2);
  const passengerPosition=await send(1,"syncPosition",{scene:"street",x:1234,y:888});
  assert.ok(passengerPosition.ok);
  assert.equal(passengerPosition.snapshot.players.find(p=>p.id===spectator.playerId).x,711);
 }finally{Date.now=old}
});
test("cars have passengers, bicycles have only one seat and exits require stopping",async()=>{
 const {send,get}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(1,"selectCharacter",{characterId:"muscular"});
 await send(0,"syncPosition",{scene:"street",x:670,y:850});
 await send(1,"syncPosition",{scene:"street",x:671,y:849});
 assert.ok((await send(0,"boardVehicle",{vehicleId:"bike1",seat:0})).ok);
 const secondSeat=await send(1,"boardVehicle",{vehicleId:"bike1",seat:1});
 assert.equal(secondSeat.ok,false);
 const occupied=await send(1,"boardVehicle",{vehicleId:"bike1",seat:0});
 assert.equal(occupied.ok,false);
 const left=await send(0,"leaveVehicle");
 assert.ok(left.ok);assert.equal(left.snapshot.occupiedVehicle,null);
 const fresh=(await get(1)).snapshot.vehicles.find(v=>v.id==="bike1");
 assert.equal(fresh.seats[0],null);
});
test("disconnected drivers release seats and vehicles stay at last shared location",async()=>{
 const old=Date.now;let clock=4000000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(0,"syncPosition",{scene:"street",x:632,y:453});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"octavia",seat:0})).ok);
  clock+=100;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"octavia",x:643,y:443,angle:2.25,speed:15})).ok);
  clock+=5100;
  const snap=(await get(1)).snapshot.vehicles.find(v=>v.id==="octavia");
  assert.equal(snap.seats[0],null);
  assert.equal(snap.x,643);assert.equal(snap.y,443);
 }finally{Date.now=old}
});

test("room uses saved vehicle settings for new and previously created lobbies",async()=>{
 const map=new Map(),settings={"vehicle.skoda.spawnX":770,"vehicle.skoda.spawnY":560,
  "vehicle.skoda.angle":90,"vehicle.bike1.spawnX":820,"vehicle.bike1.spawnY":810};
 const ctx={storage:{
  get:async key=>map.get(key),
  transaction:async fn=>fn({get:async key=>map.get(key),
    put:async(key,value)=>map.set(key,structuredClone(value))})
 }};
 const env={SETTINGS_STORE:{
  idFromName:name=>name,
  get:()=>({fetch:async()=>({ok:true,json:async()=>({settings})})})
 }};
 const room=new ConsumableRoom(ctx,env);
 const request=()=>new Request("https://room.test/?token="+"a".repeat(32));
 let response=await room.fetch(request()),data=await response.json();
 let car=data.snapshot.vehicles.find(v=>v.id==="skoda");
 assert.equal(car.x,770);assert.equal(car.y,560);
 assert.ok(Math.abs(car.angle-Math.PI/2)<.00001);
 assert.equal(data.snapshot.vehicles.find(v=>v.id==="bike1").x,820);
 // Simulate a legacy room created before shared vehicles were implemented.
 const oldRoom=map.get("room");delete oldRoom.vehicles;delete oldRoom.vehicleSpawnSettings;
 map.set("room",oldRoom);
 response=await room.fetch(request());data=await response.json();
 car=data.snapshot.vehicles.find(v=>v.id==="skoda");
 assert.equal(car.x,770);assert.equal(car.y,560);
});
test("moving car cannot be exited; stopped car exits near the shared position",async()=>{
 const old=Date.now;let clock=5000000;Date.now=()=>clock;
 try{
  const {send}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(0,"syncPosition",{scene:"street",x:697,y:505});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  clock+=100;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"skoda",x:705,y:500,angle:2.3,speed:80})).ok);
  const tooFast=await send(0,"leaveVehicle",{x:742,y:498});
  assert.equal(tooFast.ok,false);
  clock+=100;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"skoda",x:706,y:500,angle:2.3,speed:0})).ok);
  const exit=await send(0,"leaveVehicle",{x:745,y:500});
  assert.ok(exit.ok,exit.error);
  assert.equal(exit.snapshot.occupiedVehicle,null);
  const player=exit.snapshot.players.find(p=>p.id===exit.snapshot.playerId);
  assert.equal(player.x,745);
  assert.equal(player.y,500);
 }finally{Date.now=old}
});

test("vehicle occupancy is explicit on every multiplayer player snapshot",async()=>{
 const {send,get}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(1,"selectCharacter",{characterId:"casual"});
 await send(0,"syncPosition",{scene:"street",x:697,y:505});
 await send(1,"syncPosition",{scene:"street",x:699,y:509});
 const driver=await send(0,"boardVehicle",{vehicleId:"skoda",seat:0});
 const passenger=await send(1,"boardVehicle",{vehicleId:"skoda",seat:1});
 assert.equal(driver.ok,true);assert.equal(passenger.ok,true);
 const snapshot=(await get(1)).snapshot;
 const driverView=snapshot.players.find(p=>p.id===driver.snapshot.playerId);
 const passengerView=snapshot.players.find(p=>p.id===passenger.snapshot.playerId);
 assert.equal(driverView.vehicleId,"skoda");
 assert.equal(driverView.seatIndex,0);
 assert.equal(driverView.moving,false);
 assert.equal(passengerView.vehicleId,"skoda");
 assert.equal(passengerView.seatIndex,1);
 assert.equal(snapshot.vehicles.find(v=>v.id==="skoda").seats[0],driverView.id);
});
test("same default lobby is used across browsers and remote occupants are not walking sprites",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT}=await import("../src/consumables-client.js");
 const {readFileSync}=await import("node:fs");
 const browser=CONSUMABLE_CLIENT_SCRIPT;
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 assert.ok(browser.includes('"maestro-main"'),"All bare game URLs must join the same default lobby");
 assert.ok(!browser.includes('room=requested||localStorage.getItem("maestroescape.room.v1")'),
  "Local browser storage must not decide which default room a player joins");
 assert.ok(browser.includes('roomLabel.textContent="Room: "+room'),
  "Room ID must be visible to players");
 assert.ok(browser.includes('q.vehicleId||this.vehicles.some(v=>v.seats.includes(q.id))'),
  "A seated player must never be rendered as a remote walking sprite");
 assert.ok(worker.includes("vehicleWorldSynchronized=true"),
  "Every client must initialize vehicles from the server snapshot");
 assert.ok(worker.includes("firstAuthoritativeFrame||distance>150?1:"),
  "First server position must not be interpolated from a different local spawn");
});

test("player interaction range follows shared settings and rejects distant borrowing",async()=>{
 const originalNow=Date.now;
 let current=6000000,reach=32;
 Date.now=()=>current;
 try{
  const env={SETTINGS_STORE:{
   idFromName:n=>n,
   get:()=>({fetch:async()=>({ok:true,json:async()=>({settings:{"player.interactRadius":reach}})})})
  }};
  const {send,get}=fixture(env);
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"pub",x:300,y:500});
  await send(1,"syncPosition",{scene:"pub",x:350,y:500});
  assert.equal((await get(0)).snapshot.config.playerInteractRadius,32);
  const far=await send(0,"borrowRequest",{targetId:(await get(1)).snapshot.playerId});
  assert.equal(far.ok,false);
  assert.match(far.error,/not nearby/i);
  // The next GET refreshes the cache, so every client sees the new shared reach.
  current+=16000;reach=60;
  assert.equal((await get(0)).snapshot.config.playerInteractRadius,60);
  const request=await send(0,"borrowRequest",{targetId:(await get(1)).snapshot.playerId});
  assert.equal(request.ok,true,request.error);
 }finally{Date.now=originalNow}
});
test("player range is bounded and remains distinct from NPC, item and vehicle ranges",async()=>{
 const old=Date.now;let clock=7100000;Date.now=()=>clock;
 try{
  let configured=900;
  const env={SETTINGS_STORE:{
   idFromName:n=>n,
   get:()=>({fetch:async()=>({ok:true,json:async()=>({settings:{"player.interactRadius":configured}})})})
  }};
  const {get}=fixture(env);
  let snapshot=(await get(0)).snapshot;
  assert.equal(snapshot.config.playerInteractRadius,150);
  assert.equal(snapshot.config.interactRadius,112);
  assert.equal(snapshot.config.collectRadius,82);
  clock+=16000;configured=1;
  snapshot=(await get(0)).snapshot;
  assert.equal(snapshot.config.playerInteractRadius,15);
 }finally{Date.now=old}
});
test("settings page exposes a player-only interaction radius and browser uses it",async()=>{
 const {readFileSync}=await import("node:fs");
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 const {CONSUMABLE_CLIENT_SCRIPT:browser}=await import("../src/consumables-client.js");
 assert.match(worker,/"key":"player.interactRadius","label":"Player interaction range","value":45,"min":15,"max":150/);
 assert.ok(browser.includes("this.state.config.playerInteractRadius??45"));
 assert.ok(browser.includes("!q.vehicleId"));
});

test("buying cigarettes works at a moved cashier, using the same NPC contact point as the dialogue",async()=>{
 const npc={x:120,y:210},offset={x:0,y:9};
 const env={SETTINGS_STORE:{idFromName:n=>n,get:()=>({fetch:async()=>({
  ok:true,json:async()=>({settings:{
   "npc.tobacco_cashier.x":npc.x,"npc.tobacco_cashier.y":npc.y,
   "npc.interactRadius":108
  }})
 })})}};
 const {send}=fixture(env);
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(0,"syncPosition",{scene:"dohanybolt",x:115,y:230});
 const buy=await send(0,"buyPack",{
  npcId:"tobacco_cashier",npcPoint:{x:120,y:219},
  actorPosition:{scene:"dohanybolt",x:115,y:230}
 });
 assert.equal(buy.ok,true,buy.error);
 assert.equal(buy.snapshot.items.filter(i=>i.type==="cigarette_pack").length,1);
 const pack=buy.snapshot.items.find(i=>i.type==="cigarette_pack");
 assert.ok(Math.hypot(pack.location.x-115,pack.location.y-230)<82,
  "Purchased cigarettes must appear in pickup range at the moved cashier");
 const collected=await send(0,"collectItem",{itemId:pack.id});
 assert.equal(collected.ok,true,collected.error);
 assert.equal(collected.snapshot.inventory.find(i=>i.id===pack.id).type,"cigarette_pack");
 const far=await send(0,"buyPack",{
  npcId:"tobacco_cashier",npcPoint:{x:470,y:219},
  actorPosition:{scene:"dohanybolt",x:470,y:220}
 });
 assert.equal(far.ok,false,"No remote buying with spoofed NPC contact points");
 assert.match(far.error,/closer/i);
});
test("borrowing from an NPC moved or patrolling near the player works",async()=>{
 const env={SETTINGS_STORE:{idFromName:n=>n,get:()=>({fetch:async()=>({
  ok:true,json:async()=>({settings:{
   "npc.maestro_regular_1.x":750,"npc.maestro_regular_1.y":650,
   "npc.interactRadius":108
  }})
 })})}};
 const {send}=fixture(env);
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(0,"syncPosition",{scene:"pub",x:150,y:150});
 const borrowed=await send(0,"npcBorrow",{
  npcId:"maestro_regular_1",npcPoint:{x:772,y:665},
  actorPosition:{scene:"pub",x:775,y:676}
 });
 assert.equal(borrowed.ok,true,borrowed.error);
 assert.equal(borrowed.snapshot.inventory.find(i=>i.type==="cigarette").remainingUnits,4);
 const remote=await send(0,"npcBorrow",{
  npcId:"maestro_regular_1",npcPoint:{x:1050,y:665},
  actorPosition:{scene:"pub",x:1050,y:665}
 });
 assert.equal(remote.ok,false);
 assert.match(remote.error,/closer/i);
});
test("tobacco cashier purchase uses locally opened NPC dialogue when cloud settings are offline",async()=>{
 const {send}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(0,"syncPosition",{scene:"dohanybolt",x:105,y:280});
 const contact={x:105,y:210};
 const player={scene:"dohanybolt",x:105,y:280};
 const before=await send(0,"buyPack",{npcId:"tobacco_cashier",npcPoint:contact,actorPosition:player,dialogueRadius:100});
 assert.equal(before.ok,false,"Server settings must still reject remote contacts without a local-settings dialogue");
 const packet=await send(0,"buyPack",{
  npcId:"tobacco_cashier",npcPoint:contact,actorPosition:player,
  dialogueRadius:100,localNpcSettings:true
 });
 assert.equal(packet.ok,true,packet.error);
 assert.equal(packet.snapshot.items.find(i=>i.type==="cigarette_pack")?.type,"cigarette_pack");
 const ticket=await send(0,"buyScratchTicket",{
  npcId:"tobacco_cashier",npcPoint:contact,actorPosition:player,
  dialogueRadius:100,localNpcSettings:true
 });
 assert.equal(ticket.ok,true,ticket.error);
 assert.equal(ticket.snapshot.items.find(i=>i.type==="scratch_ticket")?.type,"scratch_ticket");
 const spoof=await send(0,"buyPack",{
  npcId:"tobacco_cashier",npcPoint:{x:500,y:600},
  actorPosition:player,dialogueRadius:190,localNpcSettings:true
 });
 assert.equal(spoof.ok,false,"A distant NPC contact cannot allow buying");
 const outOfBounds=await send(0,"buyPack",{
  npcId:"tobacco_cashier",npcPoint:{x:620,y:280},
  actorPosition:{scene:"dohanybolt",x:605,y:280},
  dialogueRadius:190,localNpcSettings:true
 });
 assert.equal(outOfBounds.ok,false,"NPC contact must remain inside the shop");
});

test("NPC interaction radius is shared and enforces the same distance as dialogue",async()=>{
 let radius=55;let tick=1000000;const old=Date.now;Date.now=()=>tick;
 try{
  const env={SETTINGS_STORE:{idFromName:n=>n,get:()=>({fetch:async()=>({
   ok:true,json:async()=>({settings:{"npc.interactRadius":radius}})
  })})}};
  const {send,get}=fixture(env);
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:480});
  const far=await send(0,"buyPack",{
   npcPoint:{x:519,y:425},actorPosition:{scene:"dohanybolt",x:519,y:481}
  });
  assert.equal(far.ok,false);
  assert.equal((await get(0)).snapshot.config.playerInteractRadius,45);
  radius=120;tick+=16000;
  const near=await send(0,"buyPack",{
   npcPoint:{x:519,y:425},actorPosition:{scene:"dohanybolt",x:519,y:481}
  });
  assert.equal(near.ok,true,near.error);
 }finally{Date.now=old}
});

test("respawnVehicles resets all shared cars and bikes without deleting gameplay state",async()=>{
 const {send,get}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(0,"syncPosition",{scene:"street",x:697,y:505});
 assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
 const first=await send(0,"driveVehicle",{vehicleId:"skoda",x:710,y:495,angle:2.4,speed:0});
 assert.ok(first.ok,first.error);
 assert.ok((await send(0,"leaveVehicle")).ok);
 const before=(await get(0)).snapshot;
 assert.equal(before.vehicles.find(v=>v.id==="skoda").x,710);
 const reset=await send(0,"respawnVehicles");
 assert.ok(reset.ok,reset.error);
 assert.equal(reset.snapshot.vehicles.length,5);
 const skoda=reset.snapshot.vehicles.find(v=>v.id==="skoda");
 assert.equal(skoda.x,697);assert.equal(skoda.y,505);
 assert.equal(skoda.speed,0);
 for(const vehicle of reset.snapshot.vehicles)assert.ok(vehicle.seats.every(seat=>seat===null));
 assert.equal(reset.snapshot.vehicleRespawnRevision,before.vehicleRespawnRevision+1);
 assert.equal(reset.snapshot.selectedCharacter,"maestro");
 assert.equal(reset.snapshot.playerId,before.playerId);
});
test("respawnVehicles is rejected while any room player occupies a vehicle",async()=>{
 const {send,get}=fixture();
 await send(0,"selectCharacter",{characterId:"maestro"});
 await send(1,"selectCharacter",{characterId:"casual"});
 await send(0,"syncPosition",{scene:"street",x:697,y:505});
 await send(1,"syncPosition",{scene:"street",x:699,y:506});
 assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
 const blocked=await send(1,"respawnVehicles");
 assert.equal(blocked.ok,false);
 assert.match(blocked.error,/exit vehicles/i);
 assert.equal((await get(1)).snapshot.vehicles.find(v=>v.id==="skoda").seats[0],(await get(0)).snapshot.playerId);
 assert.equal((await get(1)).snapshot.vehicleRespawnRevision,0);
 assert.ok((await send(0,"leaveVehicle")).ok);
 assert.ok((await send(1,"respawnVehicles")).ok);
});
test("respawnVehicles uses latest Cloudflare vehicle start settings instead of original room settings",async()=>{
 const map=new Map();
 let spawnX=720;
 const ctx={storage:{
  get:async key=>map.get(key),
  transaction:async fn=>fn({get:async key=>map.get(key),put:async(key,value)=>map.set(key,structuredClone(value))})
 }};
 const env={SETTINGS_STORE:{idFromName:name=>name,get:()=>({fetch:async()=>({
  ok:true,json:async()=>({settings:{"vehicle.skoda.spawnX":spawnX,"vehicle.skoda.spawnY":555,"vehicle.skoda.angle":90}})
 })})}};
 const room=new ConsumableRoom(ctx,env);
 const token="a".repeat(32);
 const send=async(op,extra={})=>{
  const response=await room.fetch(new Request("https://room.test/",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({token,commandId:crypto.randomUUID().replaceAll("-",""),op,...extra})}));
  return await response.json();
 };
 await send("selectCharacter",{characterId:"maestro"});
 assert.equal((await send("syncPosition",{scene:"street",x:697,y:505})).snapshot.vehicles.find(v=>v.id==="skoda").x,720);
 spawnX=800;
 const respawn=await send("respawnVehicles");
 assert.equal(respawn.ok,true,respawn.error);
 assert.equal(respawn.snapshot.vehicles.find(v=>v.id==="skoda").x,800);
 assert.ok(Math.abs(respawn.snapshot.vehicles.find(v=>v.id==="skoda").angle-Math.PI/2)<.001);
});
test("vehicle respawn control is exposed and all browsers snap to the new revision",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT:browser}=await import("../src/consumables-client.js");
 const {readFileSync}=await import("node:fs");
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 assert.ok(browser.includes('id="vehicle-respawn-button"'));
 assert.ok(browser.includes('this.command("respawnVehicles")'));
 assert.ok(worker.includes("vehicleLastRespawnRevision=respawnRevision"));
 assert.ok(worker.includes("respawnRevision!==vehicleLastRespawnRevision"));
});

test("moving tram hits only within the oriented tram body, never a distant sidewalk or parked platform",async()=>{
 const {tramWorldAt,tramHitsPlayer}=await import("../src/consumables.js");
 const moving=tramWorldAt(3500);
 assert.equal(moving.visible,true);
 assert.equal(moving.moving,true);
 assert.equal(tramHitsPlayer(moving,{x:moving.x,y:moving.y}),false,
  "Standing in the middle is not a front collision");
 const nose={x:moving.x+Math.sin(moving.angle)*moving.length/2,
  y:moving.y-Math.cos(moving.angle)*moving.length/2};
 assert.equal(tramHitsPlayer(moving,nose),true);
 const along={x:moving.x+Math.sin(moving.angle)*100,y:moving.y-Math.cos(moving.angle)*100};
 assert.equal(tramHitsPlayer(moving,along),false);
 const across={x:moving.x-Math.cos(moving.angle)*85,y:moving.y-Math.sin(moving.angle)*85};
 assert.equal(tramHitsPlayer(moving,across),false);
 const firstLeg=tramWorldAt(6000);
 assert.ok(firstLeg.visible);
 const platform=tramWorldAt(8500);
 assert.equal(platform.moving,false);
 assert.equal(tramHitsPlayer(platform,{x:platform.x,y:platform.y}),false);
 const gone=tramWorldAt(19500);
 assert.equal(gone.visible,false);
 assert.equal(tramHitsPlayer(gone,{x:gone.x,y:gone.y}),false);
});
test("tram death jumps player, clears only their inventory and orders, leaves RIP and respawns in five seconds",async()=>{
 const old=Date.now;let time=2_000_000;Date.now=()=>time;
 try{
  const {tramWorldAt}=await import("../src/consumables.js");
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  // Both participants obtain cigarettes, then move outside before the tram passes.
  await send(0,"syncPosition",{scene:"dohanybolt",x:519,y:425});
  const packA=(await send(0,"buyPack")).snapshot.items.find(i=>i.type==="cigarette_pack");
  await send(0,"collectItem",{itemId:packA.id});
  await send(1,"syncPosition",{scene:"dohanybolt",x:519,y:425});
  const packB=(await send(1,"buyPack")).snapshot.items.find(i=>i.type==="cigarette_pack"&&i.location.kind==="vendor");
  await send(1,"collectItem",{itemId:packB.id});
  const untouched=(await get(1)).snapshot.inventory[0].id;
  assert.equal((await get(0)).snapshot.inventory.length,1);
  time+=3500;
  const tram=tramWorldAt(time);
  const nose={x:tram.x+Math.sin(tram.angle)*tram.length/2,
   y:tram.y-Math.cos(tram.angle)*tram.length/2};
  await send(0,"syncPosition",{scene:"street",x:nose.x,y:nose.y});
  await send(1,"syncPosition",{scene:"street",x:950,y:700});
  const dead=await send(0,"tramHit",{actorPosition:{scene:"street",x:nose.x,y:nose.y}});
  assert.equal(dead.ok,true,dead.error);
  assert.equal(dead.snapshot.inventory.length,0);
  assert.equal(dead.snapshot.equippedId,null);
  assert.equal(dead.snapshot.graves.length,1);
  assert.equal(dead.snapshot.graves[0].label,"RIP");
  assert.equal(dead.snapshot.death.reason,"tram");
  assert.equal(dead.snapshot.deadUntil,time+5000);
  assert.equal((await get(1)).snapshot.inventory[0].id,untouched,"Other players keep their inventory");
  const duplicate=await send(0,"tramHit",{actorPosition:{scene:"street",x:nose.x,y:nose.y}});
  assert.equal(duplicate.ok,false);
  const blocked=await send(0,"syncPosition",{scene:"street",x:1111,y:222});
  assert.equal(blocked.snapshot.players.find(p=>p.id===dead.snapshot.playerId).x,nose.x);
  time+=4999;
  const dying=(await get(0)).snapshot;
  assert.equal(dying.deadUntil,time+1);
  assert.equal(dying.inventory.length,0);
  time++;
  const alive=(await get(0)).snapshot;
  assert.equal(alive.deadUntil,null);
  assert.equal(alive.respawnRevision,1);
  const body=alive.players.find(p=>p.id===alive.playerId);
  assert.equal(body.scene,"street");assert.equal(body.x,859);assert.equal(body.y,577);
  assert.equal(alive.graves.length,1,"RIP grave must persist after respawn");
  assert.equal((await get(1)).snapshot.inventory[0].id,untouched);
 }finally{Date.now=old}
});
test("tram cannot kill players outside collision range, in shops or inside cars",async()=>{
 const old=Date.now;let time=3_000_000+3500;Date.now=()=>time;
 try{
  const {tramWorldAt}=await import("../src/consumables.js");
  const {send}=fixture();
  const tram=tramWorldAt(time);
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(0,"syncPosition",{scene:"street",x:1400,y:200});
  const far=await send(0,"tramHit",{actorPosition:{scene:"street",x:1400,y:200}});
  assert.equal(far.ok,false);assert.match(far.error,/not colliding/i);
  await send(0,"syncPosition",{scene:"pub",x:tram.x,y:tram.y});
  const indoors=await send(0,"tramHit",{actorPosition:{scene:"pub",x:tram.x,y:tram.y}});
  assert.equal(indoors.ok,false);
  await send(0,"syncPosition",{scene:"street",x:697,y:505});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  const driving=await send(0,"tramHit",{actorPosition:{scene:"street",x:tram.x,y:tram.y}});
  assert.equal(driving.ok,false);
 }finally{Date.now=old}
});
test("client reports tram collisions and renders death, five-second countdown and RIP graves",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT:client}=await import("../src/consumables-client.js");
 const {readFileSync}=await import("node:fs");
 const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
 assert.doesNotThrow(()=>new Function(client));
 assert.ok(client.includes('this.command("tramHit"'));
 assert.ok(client.includes("this.ctx.onTramDeath?.("));
 assert.ok(client.includes("this.ctx.onTramRespawn?.("));
 assert.ok(client.includes("if(!this.ready||!this.hasCharacter()||this.positionPending||this.isDead()||(!this.singleMode&&Date.now()<this.roomRetryAfter))return"));
 assert.ok(worker.includes("function tramOverlapsPlayer("));
 assert.ok(worker.includes('id="tram-death-overlay"'));
 assert.ok(worker.includes("function renderTramGraves()"));
 assert.ok(worker.includes("function completeTramRespawn("));
 assert.ok(worker.includes("Respawning in "));
 assert.ok(worker.includes("Date.now()%tramPeriodMs()"),
  "The tram phase must use shared clock time rather than per-browser Phaser uptime");
});

test("group beer gathering uses the pulsing ring in front of Maestro bartender and auto-celebrates",async()=>{
 const old=Date.now;let time=9_000_000;Date.now=()=>time;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"pub",x:700,y:720});
  await send(1,"syncPosition",{scene:"street",x:850,y:570});
  const call=await send(0,"callGroup",{type:"beer"});
  assert.equal(call.ok,true,call.error);
  assert.equal(call.snapshot.rally.type,"beer");
  assert.equal(call.snapshot.rally.target.scene,"pub");
  assert.equal(call.snapshot.rally.target.label,"In front of the bartender");
  assert.equal(call.snapshot.rally.target.x,413);
  assert.equal(call.snapshot.rally.target.y,398);
  assert.equal(call.snapshot.rally.radius,68);
  assert.equal(call.snapshot.rally.required,2);
  assert.equal(call.snapshot.rally.status,"gathering");
  const parallel=await send(1,"callGroup",{type:"kebab"});
  assert.equal(parallel.ok,false);
  assert.equal((await get(0)).snapshot.groupEvents.length,0);
  const target=call.snapshot.rally.target;
  await send(0,"syncPosition",{scene:"pub",x:target.x,y:target.y});
  const one=(await get(0)).snapshot.rally;
  assert.equal(one.ready,1);assert.equal(one.status,"gathering");
  await send(1,"syncPosition",{scene:"pub",x:target.x+25,y:target.y+8});
  const done=(await get(0)).snapshot;
  assert.equal(done.rally.status,"completed");
  assert.equal(done.groupEvents.length,1);
  assert.deepEqual([...done.groupEvents[0].playerIds].sort(),done.players.map(q=>q.id).sort());
  assert.equal(done.groupEvents[0].type,"beer");
  assert.equal((await get(1)).snapshot.groupEvents.length,1);
  assert.equal((await get(1)).snapshot.groupEvents[0].id,done.groupEvents[0].id);
  assert.equal(done.groupEvents[0].duration,3000);
  time+=300;assert.equal((await get(0)).snapshot.groupEvents.length,1,"No duplicate heart events");
 }finally{Date.now=old}
});
test("group cigarettes gather outside Maestro on pavement, not at the indoor bartender",async()=>{
 const old=Date.now;let clock=10_000_000;Date.now=()=>clock;
 try{
  const env={SETTINGS_STORE:{idFromName:n=>n,get:()=>({fetch:async()=>({
   ok:true,json:async()=>({settings:{"npc.maestro_bartender.x":450,"npc.maestro_bartender.y":200}})
  })})}};
  const {send,get}=fixture(env);
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"suit"});
  await send(0,"syncPosition",{scene:"pub",x:450,y:388});
  await send(1,"syncPosition",{scene:"pub",x:440,y:397});
  const called=await send(0,"callGroup",{type:"cigarette"});
  const target=called.snapshot.rally.target;
  assert.equal(target.scene,"street");
  assert.equal(target.label,"Outside Maestro · pavement");
  assert.equal(target.x,770);assert.equal(target.y,625);
  assert.equal(called.snapshot.rally.ready,0,"Standing at bartender does not count");
  await send(0,"syncPosition",{scene:"street",x:770,y:625});
  assert.equal((await get(0)).snapshot.rally.status,"gathering");
  await send(1,"syncPosition",{scene:"street",x:780,y:632});
  const done=(await get(0)).snapshot;
  assert.equal(done.rally.status,"completed");
  assert.equal(done.groupEvents[0].type,"cigarette");
  assert.equal(done.inventory.length,0,"Gathering does not require or grant cigarettes");
 }finally{Date.now=old}
});

test("group kebab gathering waits for everyone to enter Gyros and automatically triggers hearts",async()=>{
 const old=Date.now;let clock=11_000_000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"muscular"});
  await send(0,"syncPosition",{scene:"gyros",x:294,y:315});
  await send(1,"syncPosition",{scene:"street",x:850,y:570});
  const called=await send(0,"callGroup",{type:"kebab"});
  assert.equal(called.ok,true);
  assert.equal(called.snapshot.rally.ready,1);
  const target=called.snapshot.rally.target;
  assert.equal(target.label,"In front of the kebab counter");
  assert.equal(target.x,360);assert.equal(target.y,330);
  assert.equal(called.snapshot.rally.radius,68);
  assert.equal(target.scene,"gyros");
  await send(1,"syncPosition",{scene:"gyros",x:target.x+40,y:target.y+15});
  const done=(await get(1)).snapshot;
  assert.equal(done.rally.status,"completed");
  assert.equal(done.groupEvents[0].type,"kebab");
 }finally{Date.now=old}
});
test("group calls require multiple active players and expire if nobody reaches the destination",async()=>{
 const old=Date.now;let clock=12_000_000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  const alone=await send(0,"callGroup",{type:"beer"});
  assert.equal(alone.ok,false);assert.match(alone.error,/two active players/i);
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"street",x:800,y:570});
  await send(1,"syncPosition",{scene:"street",x:810,y:575});
  assert.equal((await send(0,"callGroup",{type:"not-a-type"})).ok,false);
  assert.ok((await send(0,"callGroup",{type:"beer"})).ok);
  clock+=90001;
  const expired=(await get(0)).snapshot;
  assert.equal(expired.rally.status,"expired");
  assert.equal(expired.groupEvents.length,0);
 }finally{Date.now=old}
});
test("finishing all three consumables emits a unique 2-second celebration visible to other players",async()=>{
 const old=Date.now;let clock=13_000_000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  const cases=[
   {type:"beer",scene:"pub",x:413,y:398,order:"orderBeer",delay:3000,portions:5,portionMs:1500},
   {type:"kebab",scene:"gyros",x:294,y:315,order:"orderKebab",delay:5000,portions:4,portionMs:2000},
   {type:"cigarette",scene:"dohanybolt",x:519,y:425,order:"buyPack",delay:0,portions:4,portionMs:1500}
  ];
  for(const cfg of cases){
   await send(0,"syncPosition",{scene:cfg.scene,x:cfg.x,y:cfg.y});
   assert.equal((await send(0,cfg.order)).ok,true);
   clock+=cfg.delay;
   const snap=(await get(0)).snapshot;
   const source=snap.items.find(i=>i.type===cfg.type||cfg.type==="cigarette"&&i.type==="cigarette_pack");
   assert.ok(source,"missing "+cfg.type);
   assert.equal((await send(0,"collectItem",{itemId:source.id})).ok,true);
   let id=source.id;
   if(cfg.type==="cigarette"){
    const extracted=await send(0,"extractCigarette",{itemId:id});
    id=extracted.snapshot.inventory.find(i=>i.type==="cigarette").id;
    assert.equal((await send(0,"light",{itemId:id})).ok,true);
   }
   for(let n=0;n<cfg.portions;n++){
    const start=await send(0,"startConsumeUnit",{itemId:id});
    assert.ok(start.ok,start.error);
    clock+=cfg.portionMs;
    const done=await send(0,"completeConsumeUnit",{actionId:start.action.id});
    assert.ok(done.ok,done.error);
   }
   const end=(await get(0)).snapshot;
   const event=end.completionEvents.find(e=>e.type===cfg.type);
   assert.ok(event,"No finish event for "+cfg.type);
   assert.equal(event.duration,2000);
   assert.equal(event.scene,cfg.scene);
   assert.equal(event.x,cfg.x);
   assert.equal(event.y,cfg.y);
   const remote=(await get(1)).snapshot;
   assert.ok(remote.completionEvents.some(e=>e.id===event.id),"Completion missing from room");
  }
 }finally{Date.now=old}
});
test("browser exposes group calls and both types of floating celebration without needing E at destination",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT:client}=await import("../src/consumables-client.js");
 assert.doesNotThrow(()=>new Function(client));
 assert.ok(client.includes("Call group"));
 assert.ok(client.includes('this.command("callGroup",{type})'));
 assert.ok(client.includes("this.renderCelebrations()"));
 assert.ok(client.includes("this.rallyBeacon"));
 assert.ok(client.includes('["❤️","💗","💕","💖","💞"]'));
 assert.ok(client.includes("2000,12"));
});

test("each rally uses the identical visible ring radius as arrival detection, without text labels",async()=>{
 const {CONSUMABLE_CLIENT_SCRIPT:client}=await import("../src/consumables-client.js");
 const server=await import("../src/consumables.js");
 assert.doesNotThrow(()=>new Function(client));
 assert.ok(client.includes('scene.add.circle(0,0,68'));
 assert.ok(client.includes('const radius=rally.radius||68'));
 assert.ok(client.includes('zone.setRadius(radius)'));
 assert.ok(client.includes('pulse.setRadius(radius)'));
 assert.ok(!client.includes('💗 MEET HERE'));
 assert.ok(!client.includes('scene.add.text(0,-64'));
 assert.ok(client.includes('this.rallyBeacon.setPosition(rally.target.x,rally.target.y)'));
});

test("existing active cigarette and kebab gatherings migrate to the marked floor coordinates",async()=>{
 const old=Date.now;let clock=16000000;Date.now=()=>clock;
 try{
  const {send,get,map}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"street",x:900,y:750});
  await send(1,"syncPosition",{scene:"street",x:910,y:750});
  let initial=await send(0,"callGroup",{type:"cigarette"});
  assert.equal(initial.ok,true);
  // Model persisted state from before the target-position correction.
  const room=map.get("room");
  room.rally.target={scene:"pub",x:413,y:398,label:"In front of Maestro"};
  map.set("room",room);
  let current=(await get(0)).snapshot.rally.target;
  assert.deepEqual(current,{scene:"street",x:770,y:625,label:"Outside Maestro · pavement"});
  // Expire the first group to initiate the kebab call.
  clock+=90001;await get(0);
  await send(0,"syncPosition",{scene:"gyros",x:500,y:420});
  await send(1,"syncPosition",{scene:"gyros",x:510,y:420});
  initial=await send(0,"callGroup",{type:"kebab"});
  assert.equal(initial.ok,true);
  const room2=map.get("room");
  room2.rally.target={scene:"gyros",x:294,y:315,label:"In front of the kebab employee"};
  map.set("room",room2);
  current=(await get(0)).snapshot.rally.target;
  assert.deepEqual(current,{scene:"gyros",x:360,y:330,label:"In front of the kebab counter"});
 }finally{Date.now=old}
});

test("car front bumper hitbox rejects sides, rear, reverse and stationary collisions",async()=>{
 const {frontImpact,sweptFrontImpact}=await import("../src/consumables.js");
 const v={x:700,y:500,angle:0,speed:80,width:32,length:72};
 assert.equal(frontImpact(v,{x:700,y:464}),true,"Nose at y464 is lethal");
 assert.equal(frontImpact(v,{x:700,y:500}),false,"Centre is not the bumper");
 assert.equal(frontImpact(v,{x:700,y:545}),false,"Rear is safe");
 assert.equal(frontImpact(v,{x:750,y:464}),false,"Far side is safe");
 assert.equal(frontImpact({...v,speed:0},{x:700,y:464}),false);
 assert.equal(frontImpact({...v,speed:-80},{x:700,y:464}),false);
 assert.equal(frontImpact({...v,speed:10},{x:700,y:464}),false);
 const to={...v,y:460};
 assert.equal(sweptFrontImpact(v,to,{x:700,y:445}),true,
  "Swept nose detects a pedestrian passed between 10Hz updates");
 assert.equal(sweptFrontImpact({...v,speed:-50},{...to,speed:-50},{x:700,y:445}),false);
});
test("shared moving car kills only hit pedestrian and keeps driver's and witness's inventory",async()=>{
 const old=Date.now;let time=17000000;Date.now=()=>time;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"street",x:697,y:505});
  await send(1,"syncPosition",{scene:"street",x:725,y:465});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  time+=100;
  const hit=await send(0,"driveVehicle",{vehicleId:"skoda",x:697,y:490,
   angle:0,speed:95});
  assert.equal(hit.ok,true,hit.error);
  const victim=(await get(1)).snapshot;
  assert.equal(victim.death.reason,"car");
  assert.equal(victim.death.sourceId,"skoda");
  assert.equal(victim.inventory.length,0);
  assert.equal(victim.deadUntil,time+5000);
  assert.equal(victim.graves.length,1);
  assert.equal(victim.graves[0].reason,"car");
  assert.equal((await get(0)).snapshot.occupiedVehicle.seat,0);
  const duplicate=(await get(1)).snapshot.graves.length;
  time+=50;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"skoda",x:697,y:487,angle:0,speed:95})).ok);
  assert.equal((await get(1)).snapshot.graves.length,duplicate,"No duplicate death from continued driving");
  time+=5000;
  const revived=(await get(1)).snapshot;
  assert.equal(revived.deadUntil,null);
  assert.equal(revived.inventory.length,0);
  assert.equal(revived.graves.length,1);
  time+=24949;assert.equal((await get(0)).snapshot.graves.length,1);
  time++;
  assert.equal((await get(0)).snapshot.graves.length,0,"RIP expires at exactly 30 seconds");
 }finally{Date.now=old}
});
test("on-foot player entering car nose triggers collision even without another driver update",async()=>{
 const old=Date.now;let clock=18000000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"suit"});
  await send(0,"syncPosition",{scene:"street",x:697,y:505});
  await send(1,"syncPosition",{scene:"street",x:840,y:600});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  clock+=100;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"skoda",x:697,y:495,angle:0,speed:75})).ok);
  const victim=await send(1,"syncPosition",{scene:"street",x:697,y:459});
  assert.ok(victim.ok);
  assert.equal(victim.snapshot.death.reason,"car");
  assert.equal(victim.snapshot.inventory.length,0);
 }finally{Date.now=old}
});
test("passengers and car drivers cannot die from collision with their own car",async()=>{
 const old=Date.now;let clock=19000000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  await send(0,"selectCharacter",{characterId:"maestro"});
  await send(1,"selectCharacter",{characterId:"casual"});
  await send(0,"syncPosition",{scene:"street",x:697,y:505});
  await send(1,"syncPosition",{scene:"street",x:696,y:504});
  assert.ok((await send(0,"boardVehicle",{vehicleId:"skoda",seat:0})).ok);
  assert.ok((await send(1,"boardVehicle",{vehicleId:"skoda",seat:1})).ok);
  clock+=100;
  assert.ok((await send(0,"driveVehicle",{vehicleId:"skoda",x:697,y:495,angle:0,speed:80})).ok);
  assert.equal((await get(0)).snapshot.deadUntil,null);
  assert.equal((await get(1)).snapshot.deadUntil,null);
  assert.equal((await get(0)).snapshot.graves.length,0);
 }finally{Date.now=old}
});

test("room remains playable when Durable Object free tier rejects persistence",async()=>{
 let stored=null,writes=0;
 const storage={
  get:async()=>stored,
  put:async()=>{writes++;throw new Error("Exceeded allowed rows written in Durable Objects free tier.")}
 };
 const room=new ConsumableRoom({storage},{});
 const token="f".repeat(32);
 const send=async(op,args={})=>{
  const request=new Request("https://room.test/",{method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({token,commandId:crypto.randomUUID().replaceAll("-",""),op,...args})});
  const response=await room.fetch(request);
  return {status:response.status,...await response.json()};
 };
 const first=await send("syncPosition",{scene:"pub",x:413,y:398});
 assert.equal(first.ok,true,first.error);
 const order=await send("orderBeer");
 assert.equal(order.ok,true,order.error);
 assert.equal(order.snapshot.orders.length,1);
 const after=await room.fetch(new Request("https://room.test/?token="+token));
 const data=await after.json();
 assert.equal(data.ok,true,data.error);
 assert.equal(data.snapshot.orders.length,1,"in-memory state survives the failed write");
 assert.equal(writes,1,"quota failures are backoff-limited rather than repeated for every request");
});
