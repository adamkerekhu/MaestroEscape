import test from "node:test";
import assert from "node:assert/strict";
import { ConsumableRoom } from "../src/consumables.js";

function fixture(){
 const map=new Map();
 const ctx={storage:{transaction:async fn=>fn({
  get:async k=>map.get(k),
  put:async(k,v)=>map.set(k,structuredClone(v))
 })}};
 const room=new ConsumableRoom(ctx,{});
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
test("beer order waits three seconds, pickup and five timed sips produce exactly one empty glass",async()=>{
 const old=Date.now;let clock=100000;Date.now=()=>clock;
 try{
  const {send,get}=fixture();
  assert.ok((await send(0,"syncPosition",{scene:"pub",x:413,y:398})).ok);
  const order=await send(0,"orderBeer");
  assert.ok(order.ok);
  assert.equal(order.snapshot.orders.length,1);
  clock+=2999;
  assert.equal((await get(0)).snapshot.items.length,0);
  clock++;
  const item=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  assert.equal(item.remainingUnits,5);assert.equal(item.location.kind,"vendor");
  const pickup=await send(0,"collectItem",{itemId:item.id});
  assert.ok(pickup.ok);assert.equal(pickup.snapshot.inventory.length,1);
  for(let n=0;n<5;n++){
   const start=await send(0,"startConsumeUnit",{itemId:item.id});assert.ok(start.ok);
   if(n===0){
    const early=await send(0,"completeConsumeUnit",{actionId:start.action.id});
    assert.equal(early.ok,false);
   }
   clock+=1500;
   const done=await send(0,"completeConsumeUnit",{actionId:start.action.id});
   assert.ok(done.ok,"sip "+n+": "+done.error);
  }
  const end=(await get(0)).snapshot;
  assert.equal(end.inventory[0].type,"empty_glass");
  assert.equal(end.inventory[0].id,item.id);
  assert.equal(end.objectives.beer,1);
  const refill=await send(0,"refillBeer");assert.ok(refill.ok);
  assert.equal(refill.snapshot.inventory.length,0);
  clock+=2000;
  const full=(await get(0)).snapshot.items.find(i=>i.type==="beer");
  assert.ok(full);assert.equal(full.remainingUnits,5);assert.equal(full.id,item.id);
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
  const {send,get}=fixture();await send(0,"syncPosition",{scene:"gyros",x:294,y:315});
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
