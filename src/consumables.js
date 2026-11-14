// MaestroEscape item authority. One Durable Object instance per game room.
// Values here are gameplay rules, not presentation-only UI placeholders.
export const CONSUMABLE_CONFIG={
 beer:{units:5,unitMs:1500},kebab:{units:4,unitMs:2000},
 cigarette:{units:4,unitMs:1500},cigarette_pack:{units:5,unitMs:0},
 orderBeerMs:3000,refillMs:2000,orderKebabMs:5000,borrowExpiryMs:8000,
 interactRadius:112,collectRadius:82,tableRadius:115,maxCarryLarge:2,maxCarrySmall:4,
 vendorPoints:{
  maestro_bartender:[{x:340,y:424},{x:395,y:424},{x:455,y:424},{x:522,y:424}],
  gyros_employee:[{x:294,y:310},{x:354,y:310},{x:411,y:310}],
  tobacco_cashier:[{x:513,y:416},{x:535,y:422}]
 },
 vendors:{maestro_bartender:"pub",gyros_employee:"gyros",tobacco_cashier:"dohanybolt"},
 servicePoints:{maestro_bartender:{x:413,y:398},gyros_employee:{x:294,y:315},tobacco_cashier:{x:519,y:425}},
 // These coordinates derive from the authored Maestro interior collision rectangles.
 pubTables:[
  {id:"pub_left",label:"Window table",x:140,y:396,w:136,h:268},
  {id:"pub_middle",label:"Central table",x:417,y:564,w:163,h:250},
  {id:"pub_right",label:"Side table",x:965,y:472,w:111,h:152},
  {id:"pub_upper",label:"Upper table",x:717,y:233,w:147,h:119}
 ],
 npcCigarettes:{
  maestro_regular_1:{share:true,stock:3},
  maestro_regular_2:{share:false,stock:2},
  maestro_regular_3:{share:true,stock:3}
 }
};
// Reserved character IDs are stable even when custom artwork is uploaded later.
export const LOBBY_CHARACTERS=[
 {id:"maestro",name:"Maestro",tint:0xffffff,asset:"maestro"},
 {id:"casual",name:"Casual",tint:0xffffff,asset:"casual"},
 {id:"suit",name:"Suit",tint:0xffffff,asset:"suit"},
 {id:"muscular",name:"Muscular",tint:0xffffff,asset:"muscular"}
];
const C=CONSUMABLE_CONFIG;
const now=()=>Date.now();
const uid=prefix=>prefix+"_"+crypto.randomUUID();
const bad=(message,status=400)=>({ok:false,error:message,status});
const ok=(data={})=>({ok:true,...data});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const copy=x=>JSON.parse(JSON.stringify(x));
const slots=item=>["beer","empty_glass","kebab"].includes(item.type)?[0,1]:[2,3,4,5];
const locPos=location=>{
 if(location.kind==="table"){
  const t=C.pubTables.find(q=>q.id===location.tableId);
  if(!t)return null;
  return tablePoint(t,location.slot);
 }
 return typeof location.x==="number"?location:null;
};
function tablePoint(t,slot){
 // 3 columns x 2 rows. Slots are physically atop the existing table collider.
 return {x:t.x+t.w*(.23+.27*(slot%3)),y:t.y+t.h*(.32+.36*Math.floor(slot/3))};
}
function fresh(){return {revision:0,players:{},items:[],orders:[],requests:[],used:[],completions:[],npcStock:copy(C.npcCigarettes),createdAt:now()};}
function findPlayer(s,token){return Object.values(s.players).find(p=>p.token===token)}
function playerInventory(s,p){return s.items.filter(i=>i.location.kind==="inventory"&&i.location.playerId===p.id)}
function freeSlot(s,p,type){
 const item={type},candidate=slots(item),used=new Set(playerInventory(s,p).map(i=>i.location.slot));
 return candidate.find(n=>!used.has(n));
}
function vendorSpot(s,vendor){
 const points=C.vendorPoints[vendor]||[];
 return points.find(point=>!s.items.some(i=>i.location.kind==="vendor"&&i.location.vendorId===vendor&&dist(i.location,point)<12)
 &&!s.orders.some(o=>o.vendorId===vendor&&dist(o.location,point)<12))||null;
}
function create(s,type,units,location,id=null,generation=0){
 const item={id:id||uid("item"),generation,type,remainingUnits:units,maxUnits:units,location:copy(location),lit:false,revision:0};
 s.items.push(item);return item;
}
function settle(s){
 const time=now();
 for(const order of [...s.orders]){
  if(order.readyAt>time)continue;
  const type=order.type,units=C[type].units;
  create(s,type,units,order.location,order.reuseId||null,order.generation||0);
  s.orders.splice(s.orders.indexOf(order),1);
 }
 s.requests=s.requests.filter(q=>q.expiresAt>time&&q.status==="pending");
 // Dead disconnected players cannot strand pending use animations indefinitely.
 for(const p of Object.values(s.players))if(p.action&&time-p.action.startedAt>30000)p.action=null;
}
function snapshot(s,p){
 return {ok:true,revision:s.revision,playerId:p.id,roomCreatedAt:s.createdAt,
  inventory:playerInventory(s,p),items:s.items.filter(i=>i.location.kind!=="inventory"||i.location.playerId===p.id),
  characters:LOBBY_CHARACTERS.map(c=>({...c,selectedBy:Object.values(s.players).find(q=>q.id!==p.id&&q.characterId===c.id&&now()-q.lastSeen<30000)?.id||null})),
  selectedCharacter:p.characterId||null,
  players:Object.values(s.players).filter(q=>now()-q.lastSeen<30000).map(q=>({id:q.id,scene:q.scene,x:q.x,y:q.y,alias:q.alias,characterId:q.characterId||null,online:true,equippedId:q.id===p.id?q.equippedId:null})),
  orders:s.orders.filter(o=>o.playerId===p.id),requests:s.requests.filter(q=>q.toId===p.id||q.fromId===p.id),
  action:p.action,objectives:{...p.objectives},equippedId:p.equippedId,
  tables:C.pubTables,config:C,serverTime:now()};
}
function inRange(p,point,r=C.interactRadius){return point&&p.scene&&dist(p,point)<=r;}
function npcVendor(s,p,npc){
 const scene=C.vendors[npc];if(!scene||scene!==p.scene)return bad("Visit the correct shop");
 const point=C.servicePoints[npc];
 if(!inRange(p,point))return bad("Move closer to the counter");
 return null;
}
function itemById(s,id){return s.items.find(i=>i.id===id)}
function owned(s,p,id){const item=itemById(s,id);return item?.location.kind==="inventory"&&item.location.playerId===p.id?item:null}
function itemAccessible(p,item){
 if(!item||item.location.kind==="inventory")return false;
 const l=item.location;
 const pos=locPos(l);
 return l.sceneId===p.scene&&inRange(p,pos,l.kind==="table"?C.tableRadius:C.collectRadius);
}
function transferCig(s,from,to){
 if(freeSlot(s,to,"cigarette")===undefined)return bad("Recipient's cigarette slots are full");
 const loose=playerInventory(s,from).find(i=>i.type==="cigarette"&&!i.lit&&i.remainingUnits===4);
 if(loose){loose.location={kind:"inventory",playerId:to.id,slot:freeSlot(s,to,"cigarette")};loose.revision++;return ok({itemId:loose.id})}
 const pack=playerInventory(s,from).find(i=>i.type==="cigarette_pack"&&i.remainingUnits>0);
 if(!pack)return bad("No cigarette to share");
 pack.remainingUnits--;pack.revision++;
 create(s,"cigarette",4,{kind:"inventory",playerId:to.id,slot:freeSlot(s,to,"cigarette")});
 return ok();
}
function validateLocation(s,p,item){
 if(item.location.kind==="inventory")return item.location.playerId===p.id;
 return itemAccessible(p,item);
}
function operation(s,p,d){
 const op=d.op;
 if(op==="selectCharacter"){
  const character=LOBBY_CHARACTERS.find(c=>c.id===d.characterId);
  if(!character)return bad("Unknown character");
  const occupying=Object.values(s.players).find(q=>q.id!==p.id&&q.characterId===character.id&&now()-q.lastSeen<30000);
  if(occupying)return bad("That character is already taken");
  p.characterId=character.id;
  return ok({characterId:character.id,message:"Playing as "+character.name});
 }
 if(op==="releaseCharacter"){
  p.characterId=null;p.scene=null;return ok();
 }
 if(op==="syncPosition"){
  const scene=["street","pub","spar","gyros","dohanybolt"].includes(d.scene)?d.scene:null;
  const x=Number(d.x),y=Number(d.y);
  if(!scene||!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>1800||y>1300)return bad("Invalid position");
  // Existing Phaser game remains the movement authority; this endpoint tracks the
  // last reported position for interactions but cannot authenticate movement paths.
  if(p.action&&(p.scene!==scene||dist(p,{x,y})>7))p.action=null;
  p.scene=scene;p.x=x;p.y=y;p.lastSeen=now();
  return ok();
 }
 if(op==="resetRound"){
  // No player may delete another room's state. In multiplayer this must be host-gated.
  if(Object.keys(s.players).length>1)return bad("Room reset requires host authority",403);
  s.items=[];s.orders=[];s.requests=[];s.completions=[];s.npcStock=copy(C.npcCigarettes);
  for(const q of Object.values(s.players)){q.equippedId=null;q.action=null;q.objectives={beer:0,kebab:0,cigarette:0}}
  return ok();
 }
 if(!p.scene)return bad("Enter the game first");
 if(op==="orderBeer"||op==="refillBeer"||op==="orderKebab"||op==="buyPack"){
  const vendor=op==="orderKebab"?"gyros_employee":op==="buyPack"?"tobacco_cashier":"maestro_bartender";
  const err=npcVendor(s,p,vendor);if(err)return err;
  if(s.orders.some(q=>q.playerId===p.id&&q.vendorId===vendor))return bad("Your order is still being prepared");
  const point=vendorSpot(s,vendor);if(!point)return bad("Counter pickup spots are full");
  if(op==="buyPack"){const item=create(s,"cigarette_pack",5,{kind:"vendor",vendorId:vendor,sceneId:p.scene,...point});return ok({itemId:item.id,message:"Cigarette pack ready at the counter"});}
  let reuseId=null,generation=0;
  if(op==="refillBeer"){
   const glass=playerInventory(s,p).find(i=>i.type==="empty_glass");
   const returned=s.items.find(i=>i.type==="empty_glass"&&i.location.sceneId==="pub"&&
     i.location.kind!=="inventory"&&inRange(i.location,C.servicePoints.maestro_bartender,90));
   const item=glass||returned;if(!item)return bad("Need an empty glass");
   reuseId=item.id;generation=(item.generation||0)+1;s.items.splice(s.items.indexOf(item),1);
   if(p.equippedId===reuseId)p.equippedId=null;
  }
  const type=op==="orderKebab"?"kebab":"beer";
  const duration=op==="orderKebab"?C.orderKebabMs:op==="refillBeer"?C.refillMs:C.orderBeerMs;
  s.orders.push({id:uid("order"),playerId:p.id,vendorId:vendor,type,reuseId,generation,
   startedAt:now(),readyAt:now()+duration,location:{kind:"vendor",sceneId:p.scene,vendorId:vendor,...point}});
  return ok({duration,message:type==="beer"?"Bartender is preparing your beer":"Your gyros is being prepared"});
 }
 if(op==="npcBorrow"){
  if(p.scene!=="pub")return bad("Ask inside the pub");
  const conf=s.npcStock[d.npcId];if(!conf)return bad("This person does not have cigarettes");
  const coords={maestro_regular_1:{x:342,y:511},maestro_regular_2:{x:648,y:707},maestro_regular_3:{x:1043,y:774}}[d.npcId];
  if(!inRange(p,coords,C.interactRadius))return bad("Move closer");
  if(!conf.share)return bad("Sorry, I don't have one to spare");
  if(conf.stock<=0)return bad("Out of cigarettes");
  const slot=freeSlot(s,p,"cigarette");if(slot===undefined)return bad("Cigarette slots are full");
  conf.stock--;create(s,"cigarette",4,{kind:"inventory",playerId:p.id,slot});
  return ok({message:"Received one cigarette"});
 }
 if(op==="collectItem"){
  const i=itemById(s,d.itemId);if(!i||!itemAccessible(p,i))return bad("Item not in reach");
  const slot=freeSlot(s,p,i.type);if(slot===undefined)return bad("Hands full");
  i.location={kind:"inventory",playerId:p.id,slot};i.revision++;p.equippedId=i.id;
  return ok({itemId:i.id});
 }
 if(op==="equip"){
  const i=owned(s,p,d.itemId);if(!i)return bad("Item is not yours");
  p.equippedId=i.id;return ok();
 }
 if(op==="drop"||op==="placeOnTable"){
  const i=owned(s,p,d.itemId);if(!i)return bad("Item is not yours");
  if(op==="drop"){i.location={kind:"world",sceneId:p.scene,x:p.x+18,y:p.y+14};}
  else{
   if(p.scene!=="pub")return bad("Tables are inside the pub");
   const t=C.pubTables.find(t=>t.id===d.tableId);if(!t||!inRange(p,{x:t.x+t.w/2,y:t.y+t.h/2},C.tableRadius+60))return bad("Move closer to the table");
   const slot=Number(d.slot),occupied=s.items.some(j=>j.location.kind==="table"&&j.location.tableId===t.id&&j.location.slot===slot);
   if(!Number.isInteger(slot)||slot<0||slot>5)return bad("Invalid table slot");
   if(occupied)return bad("Table slot is full");
   i.location={kind:"table",sceneId:"pub",tableId:t.id,slot};i.revision++;
  }
  if(p.equippedId===i.id)p.equippedId=null;
  return ok();
 }
 if(op==="extractCigarette"){
  const i=owned(s,p,d.itemId);if(!i||i.type!=="cigarette_pack")return bad("Need a cigarette pack");
  if(i.remainingUnits<=0)return bad("Pack is empty");
  const slot=freeSlot(s,p,"cigarette");if(slot===undefined)return bad("Cigarette slots are full");
  i.remainingUnits--;i.revision++;
  const cig=create(s,"cigarette",4,{kind:"inventory",playerId:p.id,slot});p.equippedId=cig.id;
  return ok({itemId:cig.id});
 }
 if(op==="light"){
  const i=owned(s,p,d.itemId);if(!i||i.type!=="cigarette")return bad("Hold a cigarette first");
  if(i.lit)return bad("Already lit");
  i.lit=true;i.revision++;p.equippedId=i.id;return ok();
 }
 if(op==="startConsumeUnit"){
  const i=itemById(s,d.itemId);
  if(!i||!validateLocation(s,p,i))return bad("Item out of reach");
  if(!["beer","kebab","cigarette"].includes(i.type))return bad("This item cannot be consumed");
  if(i.type==="cigarette"&&!i.lit)return bad("Light the cigarette first");
  if(p.action)return bad("Already consuming an item");
  p.action={id:uid("use"),itemId:i.id,itemRevision:i.revision,startedAt:now(),duration:C[i.type].unitMs,
    origin:{scene:p.scene,x:p.x,y:p.y}};
  p.equippedId=i.id;return ok({action:p.action});
 }
 if(op==="cancelConsume"){p.action=null;return ok()}
 if(op==="completeConsumeUnit"){
  const a=p.action,i=a&&itemById(s,a.itemId);
  if(!a||a.id!==d.actionId||!i)return bad("No matching active action");
  if(now()<a.startedAt+a.duration)return bad("Action is not finished yet");
  if(p.scene!==a.origin.scene||dist(p,a.origin)>7||i.revision!==a.itemRevision||!validateLocation(s,p,i)){
   p.action=null;return bad("Consumption interrupted");
  }
  i.remainingUnits--;i.revision++;p.action=null;
  const remaining=i.remainingUnits;
  if(remaining===0){
   const oldType=i.type;
   if(oldType==="beer"){i.type="empty_glass";i.remainingUnits=0;i.maxUnits=0;i.lit=false;}
   else{s.items.splice(s.items.indexOf(i),1);if(p.equippedId===i.id)p.equippedId=null;}
   const event={id:uid("event"),playerId:p.id,type:oldType,itemId:i.id,generation:i.generation||0,time:now()};
   if(!s.completions.some(q=>q.itemId===i.id&&q.generation===event.generation)){
    s.completions.push(event);p.objectives[oldType]=(p.objectives[oldType]||0)+1;
   }
  }
  return ok({itemId:i.id,remaining,type:i.type,message:remaining===0?"Finished!":"Portion consumed"});
 }
 if(op==="borrowRequest"){
  const target=s.players[d.targetId];
  if(!target||target.id===p.id||now()-target.lastSeen>30000||target.scene!==p.scene||dist(p,target)>C.interactRadius)return bad("Player not nearby");
  if(s.requests.some(q=>q.fromId===p.id&&q.status==="pending"))return bad("Request already pending");
  s.requests.push({id:uid("borrow"),fromId:p.id,toId:target.id,status:"pending",expiresAt:now()+C.borrowExpiryMs});
  return ok({message:"Cigarette request sent"});
 }
 if(op==="borrowResponse"){
  const request=s.requests.find(q=>q.id===d.requestId&&q.toId===p.id);
  if(!request||request.status!=="pending"||request.expiresAt<now())return bad("Request expired");
  const from=s.players[request.fromId];request.status="closed";
  if(!d.accept)return ok({message:"Declined"});
  if(!from||from.scene!==p.scene||dist(from,p)>C.interactRadius)return bad("Player is no longer nearby");
  return transferCig(s,p,from);
 }
 return bad("Unknown action");
}
export class ConsumableRoom{
 constructor(ctx,env){this.ctx=ctx;this.env=env}
 async fetch(request){
  try{
   const input=request.method==="POST"?await request.json():{};
   const token=(request.method==="GET"?new URL(request.url).searchParams.get("token"):input.token)||"";
   if(!/^[a-zA-Z0-9_-]{20,100}$/.test(token))return Response.json(bad("Invalid session token"),{status:400});
   const result=await this.ctx.storage.transaction(async tx=>{
    const s=await tx.get("room")||fresh();
    settle(s);
    let p=findPlayer(s,token);
    if(!p){
     p={id:uid("player"),token,alias:"Player "+(Object.keys(s.players).length+1),characterId:null,scene:null,x:0,y:0,
      lastSeen:now(),equippedId:null,action:null,objectives:{beer:0,kebab:0,cigarette:0}};
     s.players[p.id]=p;
    }
    p.lastSeen=now();
    let answer=ok();
    if(request.method==="POST"){
     const commandId=input.commandId||"";
     if(!/^[a-zA-Z0-9_-]{8,100}$/.test(commandId))answer=bad("Missing command ID");
     else{
      const previous=s.used.find(x=>x.id===commandId);
      if(previous)answer=previous.response;
      else{
       answer=operation(s,p,input);
       s.used.push({id:commandId,response:answer});
       if(s.used.length>500)s.used.splice(0,s.used.length-500);
      }
     }
    }else if(request.method!=="GET")answer=bad("Method not allowed",405);
    s.revision++;
    await tx.put("room",s);
    return {...answer,snapshot:snapshot(s,p)};
   });
   return Response.json(result,{status:result.status||200,headers:{"cache-control":"no-store"}});
  }catch(error){return Response.json(bad("Room error: "+error.message,500),{status:500,headers:{"cache-control":"no-store"}})}
 }
}
