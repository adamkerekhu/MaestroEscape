import test from "node:test";
import assert from "node:assert/strict";
import {ConsumableRoom} from "../src/consumables.js";
import {ROULETTE_CLIENT_SCRIPT} from "../src/roulette-client.js";
function fixture(){
 const map=new Map();
 const storage={transaction:async fn=>fn({get:async k=>map.get(k),put:async(k,v)=>map.set(k,structuredClone(v))})};
 const room=new ConsumableRoom({storage},{});
 const token="d".repeat(32);
 const send=async(op,body={})=>{
  const req=new Request("https://local.test/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({op,token,commandId:crypto.randomUUID(),...body})});
  return await (await room.fetch(req)).json();
 };
 return {send};
}
const buy=async send=>{
 const result=await send("buyPack",{npcId:"tobacco_cashier",npcPoint:{x:519,y:425},actorPosition:{scene:"dohanybolt",x:519,y:470}});
 assert.equal(result.ok,true,result.error);
 const item=result.snapshot.items.find(i=>i.location.kind==="vendor"&&i.type==="cigarette_pack");
 assert.ok(item);
 const collect=await send("collectItem",{itemId:item.id});
 assert.equal(collect.ok,true,collect.error);
 return item.id;
};
test("roulette UI offers only straight, dozen and even-money bets, with input scripts valid",()=>{
 new Function(ROULETTE_CLIENT_SCRIPT);
 assert.match(ROULETTE_CLIENT_SCRIPT,/add\("n0","0"/);
 assert.match(ROULETTE_CLIENT_SCRIPT,/add\("dozen1"/);
 assert.match(ROULETTE_CLIENT_SCRIPT,/add\("low"/);
 assert.match(ROULETTE_CLIENT_SCRIPT,/add\("red"/);
 assert.match(ROULETTE_CLIENT_SCRIPT,/dataTransfer/);
 assert.match(ROULETTE_CLIENT_SCRIPT,/pointerup/);
 assert.doesNotMatch(ROULETTE_CLIENT_SCRIPT,/split|corner/i);
});
test("roulette validates ownership, detects repeated stakes and settles red/black at 2x",async()=>{
 const {send}=fixture();
 assert.equal((await send("selectCharacter",{characterId:"maestro"})).ok,true);
 await send("syncPosition",{scene:"dohanybolt",x:519,y:470});
 const a=await buy(send),b=await buy(send);
 const fromShop=await send("rouletteSpin",{bets:[{itemId:a,bet:"red"}]});
 assert.equal(fromShop.ok,false,"bets require casino scene");
 await send("syncPosition",{scene:"casino",x:987,y:717});
 assert.equal((await send("rouletteSpin",{bets:[]})).ok,false);
 assert.equal((await send("rouletteSpin",{bets:[{itemId:a,bet:"red"},{itemId:a,bet:"black"}]})).ok,false);
 assert.equal((await send("rouletteSpin",{bets:[{itemId:a,bet:"corner"}]})).ok,false);
 const result=await send("rouletteSpin",{bets:[{itemId:a,bet:"red"},{itemId:b,bet:"black"}]});
 assert.equal(result.ok,true,result.error);
 assert.ok(Number.isInteger(result.number)&&result.number>=0&&result.number<=36);
 assert.equal(result.results.length,2);
 assert.equal(result.won,result.number===0?0:1);
 assert.equal(result.lost,result.number===0?2:1);
 assert.equal(result.returned,result.number===0?0:2);
 assert.equal(result.snapshot.inventory.length,result.returned);
 assert.equal((await send("rouletteSpin",{bets:[{itemId:a,bet:"red"}]})).ok,false,"original stakes consumed atomically");
});
test("inventory can collect at least 43 full items, beyond the old 40-slot cap",async()=>{
 const {send}=fixture();
 await send("selectCharacter",{characterId:"maestro"});
 await send("syncPosition",{scene:"dohanybolt",x:519,y:470});
 for(let i=0;i<43;i++)await buy(send);
 const response=await send("syncPosition",{scene:"dohanybolt",x:519,y:470});
 assert.equal(response.snapshot.inventory.length,43);
 assert.equal(new Set(response.snapshot.inventory.map(i=>i.location.slot)).size,43);
});
