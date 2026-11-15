// MaestroEscape item authority. One Durable Object instance per game room.
// Values here are gameplay rules, not presentation-only UI placeholders.
export const CONSUMABLE_CONFIG={
 beer:{units:1,unitMs:1500},kebab:{units:1,unitMs:2000},
 cigarette:{units:1,unitMs:1500},cigarette_pack:{units:5,unitMs:0},
 orderBeerMs:3000,refillMs:2000,orderKebabMs:5000,borrowExpiryMs:8000,
 interactRadius:112,collectRadius:82,tableRadius:115,maxCarryLarge:5,maxCarrySmall:5,maxPerItem:5,
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
// Room-owned vehicle objects. Driver and passenger seats are exclusive, bikes are solo.
const VEHICLE_DEFS=[
 {id:"skoda",name:"Skoda Superb 2.0TDI",type:"car",x:697,y:505,angle:135*Math.PI/180,seats:4},
 {id:"octavia",name:"Octavia Checkengine",type:"car",x:632,y:453,angle:135*Math.PI/180,seats:4},
 {id:"bike1",name:"Bubi Bike 1",type:"bike",x:670,y:850,angle:135*Math.PI/180,seats:1},
 {id:"bike2",name:"Bubi Bike 2",type:"bike",x:688,y:860,angle:135*Math.PI/180,seats:1},
 {id:"bike3",name:"Bubi Bike 3",type:"bike",x:706,y:870,angle:135*Math.PI/180,seats:1}
];
const VEHICLE_LEASE_MS=5000;
const PLAYER_INTERACT_DEFAULT=45;
const PLAYER_INTERACT_MIN=15;
const PLAYER_INTERACT_MAX=150;
const validPlayerInteractionRange=value=>{
 const n=Number(value);
 return Number.isFinite(n)?Math.min(PLAYER_INTERACT_MAX,Math.max(PLAYER_INTERACT_MIN,n)):PLAYER_INTERACT_DEFAULT;
};
function freshVehicles(settings={}){
 return Object.fromEntries(VEHICLE_DEFS.map(def=>{
  const x=Number(settings["vehicle."+def.id+".spawnX"]);
  const y=Number(settings["vehicle."+def.id+".spawnY"]);
  const rotation=Number(settings["vehicle."+def.id+".angle"]);
  return [def.id,{id:def.id,type:def.type,name:def.name,
   x:Number.isFinite(x)&&x>=20&&x<=1580?x:def.x,
   y:Number.isFinite(y)&&y>=20&&y<=970?y:def.y,
   angle:Number.isFinite(rotation)?rotation*Math.PI/180:def.angle,
   speed:0,seats:Array(def.seats).fill(null),updatedAt:now(),revision:0}];
 }));
}
function seatOf(s,p){
 for(const vehicle of Object.values(s.vehicles||{})){
  const seat=vehicle.seats.indexOf(p.id);
  if(seat!==-1)return {vehicle,seat};
 }
 return null;
}
// Won cars are room-owned rewards, not temporary effects or disposable default spawns.
// Preserve them when stock vehicles are repositioned or a legacy client resets a round.
function releaseSeat(s,p){
 const sitting=seatOf(s,p);
 if(!sitting)return null;
 sitting.vehicle.seats[sitting.seat]=null;
 if(sitting.seat===0)sitting.vehicle.speed=0;
 sitting.vehicle.revision++;
 p.vehicleId=null;p.seatIndex=null;
 return sitting;
}
function positionAtVehicle(s,p){
 const occupant=seatOf(s,p);
 if(!occupant)return;
 const vehicle=occupant.vehicle;
 p.scene="street";p.x=vehicle.x;p.y=vehicle.y;p.face="down";p.moving=false;
}

// Tram and player share world coordinates, measured in Phaser map pixels.
const TRAM_TRACK={start:{x:-170,y:0},stop:{x:455,y:524},end:{x:1130,y:1090}};
const TRAM_DEATH_MS=5000;
const GRAVE_LIFETIME_MS=30000;
const CAR_HIT_MIN_SPEED=22;
const CAR_DIMENSIONS={skoda:{width:32,length:72},octavia:{width:32,length:64}};
const PLAYER_HIT_RADIUS=12;
const TRAM_PLAYER_RADIUS=12;
const TRAM_SPAWN={x:859,y:577};
const TRAM_DEFAULTS={interval:20,travelTime:14.5,width:40,length:144};
const tramConfigValue=(value,fallback,min,max)=>{
 const n=Number(value);
 return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
};
export function tramWorldAt(timestamp,config=TRAM_DEFAULTS){
 const period=tramConfigValue(config.interval,20,5,90)*1000;
 const dwell=3000;
 const run=Math.max(1000,Math.min(tramConfigValue(config.travelTime,14.5,4,60)*1000,period-dwell-250));
 const phase=((timestamp%period)+period)%period;
 const full=Math.hypot(TRAM_TRACK.end.x-TRAM_TRACK.start.x,TRAM_TRACK.end.y-TRAM_TRACK.start.y);
 const leg1=run*Math.hypot(TRAM_TRACK.stop.x-TRAM_TRACK.start.x,TRAM_TRACK.stop.y-TRAM_TRACK.start.y)/full;
 const departure=leg1+dwell,finish=run+dwell;
 const direction=Math.atan2(TRAM_TRACK.end.x-TRAM_TRACK.start.x,-(TRAM_TRACK.end.y-TRAM_TRACK.start.y));
 const width=tramConfigValue(config.width,40,15,180),length=tramConfigValue(config.length,144,40,300);
 let x,y,moving=false,visible=phase<finish;
 if(phase<leg1){
  const t=phase/leg1;x=TRAM_TRACK.start.x+(TRAM_TRACK.stop.x-TRAM_TRACK.start.x)*t;
  y=TRAM_TRACK.start.y+(TRAM_TRACK.stop.y-TRAM_TRACK.start.y)*t;moving=true;
 }else if(phase<departure){
  x=TRAM_TRACK.stop.x;y=TRAM_TRACK.stop.y;
 }else if(visible){
  const t=(phase-departure)/(finish-departure);
  x=TRAM_TRACK.stop.x+(TRAM_TRACK.end.x-TRAM_TRACK.stop.x)*t;
  y=TRAM_TRACK.stop.y+(TRAM_TRACK.end.y-TRAM_TRACK.stop.y)*t;moving=true;
 }else{x=TRAM_TRACK.start.x;y=TRAM_TRACK.start.y}
 return {x,y,angle:direction,width,length,visible,moving,phase,period};
}
export function tramHitsPlayer(tram,point,radius=TRAM_PLAYER_RADIUS){
 if(!tram.visible||!tram.moving)return false;
 const dx=point.x-tram.x,dy=point.y-tram.y;
 const trackX=Math.sin(tram.angle),trackY=-Math.cos(tram.angle);
 const along=dx*trackX+dy*trackY;
 const across=dx*trackY-dy*trackX;
 // The tram's leading nose, not its sides/rear, is lethal.
 return along>=tram.length/2-TRAM_PLAYER_RADIUS&&
        along<=tram.length/2+radius+6&&
        Math.abs(across)<=tram.width/2+radius;
}
// Vehicle sprite angles use forward = (sin(angle), -cos(angle)).
// Only the leading bumper of a forward-moving car/tram can strike a pedestrian.
export function frontImpact(vehicle,point,playerRadius=PLAYER_HIT_RADIUS){
 const speed=Number(vehicle.speed);
 if(!Number.isFinite(speed)||speed<=CAR_HIT_MIN_SPEED)return false;
 const fx=Math.sin(vehicle.angle),fy=-Math.cos(vehicle.angle);
 const sideX=-fy,sideY=fx,dx=point.x-vehicle.x,dy=point.y-vehicle.y;
 const forward=dx*fx+dy*fy,lateral=dx*sideX+dy*sideY;
 const halfLength=vehicle.length/2,halfWidth=vehicle.width/2;
 return forward>=halfLength-PLAYER_HIT_RADIUS&&
        forward<=halfLength+playerRadius+6&&
        Math.abs(lateral)<=halfWidth+playerRadius;
}
export function sweptFrontImpact(from,to,point){
 // At 10 Hz, the front of a fast car may cross a player between frames.
 // This tests the leading bumper's swept segment with a radius.
 const fx=Math.sin(to.angle),fy=-Math.cos(to.angle);
 const sideX=-fy,sideY=fx;
 const ax=from.x+Math.sin(from.angle)*from.length/2;
 const ay=from.y-Math.cos(from.angle)*from.length/2;
 const bx=to.x+fx*to.length/2,by=to.y+fy*to.length/2;
 const dx=bx-ax,dy=by-ay,span=dx*dx+dy*dy;
 const t=span>0?Math.max(0,Math.min(1,((point.x-ax)*dx+(point.y-ay)*dy)/span)):0;
 const hitX=ax+t*dx,hitY=ay+t*dy;
 const lateral=Math.abs((point.x-hitX)*sideX+(point.y-hitY)*sideY);
 const distance=Math.hypot(point.x-hitX,point.y-hitY);
 return to.speed>CAR_HIT_MIN_SPEED&&lateral<=to.width/2+PLAYER_HIT_RADIUS&&
  distance<=to.width/2+PLAYER_HIT_RADIUS&&
  // The swept segment represents the front bumper, even after it has passed.
  (point.x-from.x)*Math.sin(from.angle)-(point.y-from.y)*Math.cos(from.angle)>=-PLAYER_HIT_RADIUS;
}
function carHitPlayer(vehicle,from,player,s){
 const dims=s.vehicleCollisionDimensions?.[vehicle.id]||CAR_DIMENSIONS[vehicle.id];
 if(!dims||vehicle.speed<=CAR_HIT_MIN_SPEED)return false;
 const next={...vehicle,...dims},previous={...from,...dims};
 return frontImpact(next,player)||sweptFrontImpact(previous,next,player);
}
function recordVehicleDeath(s,player,hit,reason,sourceId){
 if(player.deadUntil||player.scene!=="street"||seatOf(s,player))return null;
 const at=now(),fx=Math.sin(hit.angle),fy=-Math.cos(hit.angle);
 const death={id:uid("death"),at,until:at+TRAM_DEATH_MS,x:player.x,y:player.y,
  knockX:fx*47,knockY:fy*47,reason,sourceId};
 player.deadUntil=death.until;player.lastDeath=death;player.action=null;
 player.equippedId=null;player.moving=false;
 s.items=s.items.filter(item=>item.location.kind!=="inventory"||item.location.playerId!==player.id);
 if(s.scratchResults)for(const key of Object.keys(s.scratchResults))
   if(!s.items.some(i=>i.id===key))delete s.scratchResults[key];
 s.orders=s.orders.filter(order=>order.playerId!==player.id);
 s.requests=s.requests.filter(req=>req.fromId!==player.id&&req.toId!==player.id);
 if(s.rally?.status==="gathering")s.rally.status="cancelled";
 if(!s.graves)s.graves=[];
 s.graves.push({id:death.id,x:death.x,y:death.y,at,expiresAt:at+GRAVE_LIFETIME_MS,
  playerId:player.id,label:"RIP",reason});
 if(s.graves.length>70)s.graves.splice(0,s.graves.length-70);
 return death;
}
function checkCarPedestrians(s,vehicle,previous){
 for(const player of Object.values(s.players)){
  if(!player.characterId||player.deadUntil||player.scene!=="street"||
     seatOf(s,player)||now()-player.lastSeen>30000)continue;
  if(carHitPlayer(vehicle,previous,player,s))recordVehicleDeath(s,player,vehicle,"car",vehicle.id);
 }
}

function tramCollisionAt(timestamp,config,position){
 // Permit a small network delay without allowing hits outside the moving tram.
 for(const offset of [-350,-175,0,175,350]){
  if(tramHitsPlayer(tramWorldAt(timestamp+offset,config),position))return true;
 }
 return false;
}

const C=CONSUMABLE_CONFIG;
const now=()=>Date.now();
const uid=prefix=>prefix+"_"+crypto.randomUUID();
const bad=(message,status=400)=>({ok:false,error:message,status});
const ok=(data={})=>({ok:true,...data});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const copy=x=>JSON.parse(JSON.stringify(x));
// Each item type can have five separate full items; slot numbers remain unique across the bag.
const slots=item=>Array.from({length:40},(_,i)=>i);
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
function fresh(settings={}){return {revision:0,players:{},items:[],scratchResults:{},chatMessages:[],orders:[],requests:[],used:[],completions:[],npcStock:copy(C.npcCigarettes),vehicles:freshVehicles(settings),vehicleSpawnSettings:settings,vehicleRespawnRevision:0,graves:[],rally:null,groupEvents:[],createdAt:now()};}
function findPlayer(s,token){return Object.values(s.players).find(p=>p.token===token)}
function playerInventory(s,p){return s.items.filter(i=>i.location.kind==="inventory"&&i.location.playerId===p.id)}
function freeSlot(s,p,type){
 const inventory=playerInventory(s,p);
 if(inventory.filter(i=>i.type===type).length>=C.maxPerItem)return undefined;
 const candidate=slots({type}),used=new Set(inventory.map(i=>i.location.slot));
 return candidate.find(n=>!used.has(n));
}
function vendorSpot(s,vendor,player){
 // Prefer the authored counter, but never put purchased goods outside pickup range,
 // including when a cashier has been repositioned through the shared settings.
 const standard=(C.vendorPoints[vendor]||[]).filter(point=>dist(player,point)<C.collectRadius-8);
 const x=player.x,y=player.y;
 const local=[{x:x+22,y:y-8},{x:x-22,y:y-8},{x:x+22,y:y+13},{x:x-22,y:y+13}];
 const points=[...standard,...local];
 return points.find(point=>point.x>=15&&point.y>=15&&
  !s.items.some(i=>i.location.kind==="vendor"&&i.location.vendorId===vendor&&dist(i.location,point)<15)
  &&!s.orders.some(o=>o.vendorId===vendor&&dist(o.location,point)<15))||null;
}
function create(s,type,units,location,id=null,generation=0){
 const item={id:id||uid("item"),generation,type,remainingUnits:units,maxUnits:units,location:copy(location),lit:false,revision:0};
 s.items.push(item);return item;
}
// The pulsing floor ring is the actual server-side arrival area for all group calls.
// The cigarette ring is OUTSIDE Maestro, on the pavement to the left of the door.
const GROUP_CIGARETTE_PAVEMENT={scene:"street",x:770,y:625};
const GROUP_RALLY_RADIUS=68;
const GROUP_RALLY_RULES={
 beer:{scene:"pub",label:"Group beers",icon:"🍺",radius:GROUP_RALLY_RADIUS},
 cigarette:{scene:"street",label:"Group cigarettes",icon:"🚬",radius:GROUP_RALLY_RADIUS},
 kebab:{scene:"gyros",label:"Group kebab",icon:"🥙",radius:GROUP_RALLY_RADIUS}
};
const GROUP_RALLY_EXPIRES_MS=90000;
function rallyTarget(s,type){
 if(type==="beer"){
  const contact=npcConfiguredPoint(s,"maestro_bartender")||{x:413,y:398};
  return {scene:"pub",x:contact.x,y:contact.y,
   label:"In front of the bartender"};
 }
 if(type==="cigarette"){
  return {...GROUP_CIGARETTE_PAVEMENT,
   label:"Outside Maestro · pavement"};
 }
 if(type==="kebab"){
  // Walkable customer-side floor in front of the counter, as marked on the map.
  // The employee's NPC position is not the meeting circle position.
  return {scene:"gyros",x:360,y:330,
   label:"In front of the kebab counter"};
 }
 return null;
}
function rallyStatus(s,rally){
 const rule=GROUP_RALLY_RULES[rally.type];
 const present=rally.playerIds.filter(id=>{
  const player=s.players[id];
  return player&&player.characterId&&!player.deadUntil&&!seatOf(s,player)&&
   player.scene===rally.target.scene&&dist(player,rally.target)<=rule.radius;
 });
 return {...rally,radius:rule.radius,presentIds:present,ready:present.length,required:rally.playerIds.length};
}
function checkRally(s){
 const rally=s.rally;
 if(!rally||rally.status!=="gathering")return;
 // Existing rooms may still have a call created before the updated floor targets.
 // Move only cigarette/kebab meetings; leave beer target exactly as it was.
 if(rally.type==="cigarette"||rally.type==="kebab")
  rally.target=rallyTarget(s,rally.type);
 if(now()>=rally.expiresAt){
  rally.status="expired";rally.endedAt=now();return;
 }
 const state=rallyStatus(s,rally);
 if(state.required>0&&state.ready===state.required){
  rally.status="completed";rally.endedAt=now();
  s.groupEvents.push({id:uid("group"),type:rally.type,
   scene:rally.target.scene,x:rally.target.x,y:rally.target.y,
   playerIds:rally.playerIds.slice(),at:now(),duration:3000});
 }
}

function settle(s){
 const time=now();
 // RIP stones expire for every client from the same authoritative room clock.
 if(!s.graves)s.graves=[];
 s.graves=s.graves.filter(g=>time<(g.expiresAt??g.at+GRAVE_LIFETIME_MS));
 for(const player of Object.values(s.players)){
  if(player.deadUntil&&time>=player.deadUntil){
   player.deadUntil=null;player.scene="street";
   player.x=TRAM_SPAWN.x;player.y=TRAM_SPAWN.y;
   player.face="down";player.moving=false;
   player.respawnRevision=(player.respawnRevision||0)+1;
  }
 }
 if(!s.vehicles)s.vehicles=freshVehicles();
 // Migrate existing multiplayer rooms: remove all previously won Maíybach cars.
 // Disembark occupants so no player is left attached to a deleted vehicle.
 for(const [id,vehicle] of Object.entries(s.vehicles)){
  if(!id.startsWith("maiybach_"))continue;
  for(const occupantId of vehicle.seats||[]){
   const occupant=s.players[occupantId];
   if(!occupant)continue;
   releaseSeat(s,occupant);
   occupant.scene="street";
   occupant.x=Math.max(25,Math.min(1575,vehicle.x+48));
   occupant.y=Math.max(25,Math.min(967,vehicle.y+48));
   occupant.face="down";occupant.moving=false;
  }
  delete s.vehicles[id];
 }
 // A lost connection cannot reserve a vehicle seat forever.
 for(const player of Object.values(s.players)){
  if(time-player.lastSeen>VEHICLE_LEASE_MS&&seatOf(s,player))releaseSeat(s,player);
 }
 for(const player of Object.values(s.players))if(seatOf(s,player))positionAtVehicle(s,player);
 for(const order of [...s.orders]){
  if(order.readyAt>time)continue;
  const type=order.type,units=C[type].units;
  create(s,type,units,order.location,order.reuseId||null,order.generation||0);
  s.orders.splice(s.orders.indexOf(order),1);
 }
 s.requests=s.requests.filter(q=>q.expiresAt>time&&q.status==="pending");
 if(!s.groupEvents)s.groupEvents=[];
 if(!s.completions)s.completions=[];
 s.groupEvents=s.groupEvents.filter(event=>time-event.at<12000);
 s.completions=s.completions.slice(-120);
 checkRally(s);
 // Dead disconnected players cannot strand pending use animations indefinitely.
 for(const p of Object.values(s.players))if(p.action&&time-p.action.startedAt>30000)p.action=null;
}
function snapshot(s,p){
 // Remove legacy empty glasses left in any previous saved single-player room.
 const oldCount=s.items.length;
 s.items=s.items.filter(i=>i.type!=="empty_glass");
 if(s.items.length!==oldCount)for(const player of Object.values(s.players)){
  if(player.equippedId&&!s.items.some(i=>i.id===player.equippedId))player.equippedId=null;
 }
 return {ok:true,revision:s.revision,playerId:p.id,roomCreatedAt:s.createdAt,
  inventory:playerInventory(s,p),items:s.items.filter(i=>i.location.kind!=="inventory"||i.location.playerId===p.id),
  scratchVariants:Object.fromEntries(playerInventory(s,p).filter(i=>i.type==="scratch_ticket")
   .map(i=>[i.id,typeof s.scratchResults?.[i.id]==="object"?s.scratchResults[i.id].variant:(s.scratchResults?.[i.id]===true?10:1)])),
  completionEvents:s.completions.filter(event=>now()-event.time<9000),
  chatMessages:(s.chatMessages||[]).slice(-40),
  groupEvents:(s.groupEvents||[]).filter(event=>now()-event.at<10000),
  rally:s.rally?(s.rally.status==="gathering"?rallyStatus(s,s.rally):{...s.rally}):null,
  death:p.lastDeath||null,deadUntil:p.deadUntil||null,
  respawnRevision:p.respawnRevision||0,
  graves:(s.graves||[]).slice(),
  tram:tramWorldAt(now(),s.tramConfig||TRAM_DEFAULTS),
  vehicleRespawnRevision:s.vehicleRespawnRevision||0,
  vehicles:Object.values(s.vehicles||{}).map(v=>({id:v.id,type:v.type,name:v.name,x:v.x,y:v.y,
   angle:v.angle,speed:v.speed,seats:v.seats.slice(),revision:v.revision,updatedAt:v.updatedAt})),
  occupiedVehicle:seatOf(s,p)?{vehicleId:seatOf(s,p).vehicle.id,seat:seatOf(s,p).seat}:null,
  characters:LOBBY_CHARACTERS.map(c=>({...c,selectedBy:Object.values(s.players).find(q=>q.id!==p.id&&q.characterId===c.id&&now()-q.lastSeen<30000)?.id||null})),
  selectedCharacter:p.characterId||null,
  players:Object.values(s.players).filter(q=>now()-q.lastSeen<30000).map(q=>({id:q.id,scene:q.scene,x:q.x,y:q.y,face:q.face||"down",moving:!!q.moving,alias:q.alias,characterId:q.characterId||null,deadUntil:q.deadUntil||null,death:q.lastDeath||null,respawnRevision:q.respawnRevision||0,vehicleId:seatOf(s,q)?.vehicle.id||null,seatIndex:seatOf(s,q)?.seat??null,online:true,equippedId:q.id===p.id?q.equippedId:null})),
  orders:s.orders.filter(o=>o.playerId===p.id),requests:s.requests.filter(q=>q.toId===p.id||q.fromId===p.id),
  action:p.action,objectives:{...p.objectives},equippedId:p.equippedId,
  tables:C.pubTables,config:{...C,playerInteractRadius:s.playerInteractRadius??PLAYER_INTERACT_DEFAULT},serverTime:now()};
}
function inRange(p,point,r=C.interactRadius){return point&&p.scene&&dist(p,point)<=r;}
// NPC position/range must agree with the Phaser dialogue target. The client sends
// the currently displayed NPC point, while saved settings anchor its possible area.
const NPC_SCENES={maestro_bartender:"pub",maestro_regular_1:"pub",maestro_regular_2:"pub",
 maestro_regular_3:"pub",spar_cashier:"spar",spar_shopper_1:"spar",spar_shopper_2:"spar",
 tobacco_cashier:"dohanybolt",gyros_employee:"gyros"};
const NPC_INITIAL={
 maestro_bartender:{x:413,y:210},maestro_regular_1:{x:342,y:511},
 maestro_regular_2:{x:648,y:707},maestro_regular_3:{x:1043,y:774},
 spar_cashier:{x:478,y:224},spar_shopper_1:{x:233,y:249},
 spar_shopper_2:{x:636,y:243},tobacco_cashier:{x:519,y:416},gyros_employee:{x:294,y:291}
};
const NPC_CONTACT_OFFSETS={
 maestro_bartender:{x:0,y:188},spar_cashier:{x:-53,y:40},
 tobacco_cashier:{x:0,y:9},gyros_employee:{x:0,y:24}
};
const npcInteractionRadius=s=>s.npcInteractionRadius??108;
function npcConfiguredPoint(s,id){
 const base=NPC_INITIAL[id],offset=NPC_CONTACT_OFFSETS[id]||{x:0,y:0};
 if(!base)return null;
 const values=s.npcPositions||{};
 const x=Number(values[id]?.x),y=Number(values[id]?.y);
 return {x:(Number.isFinite(x)?x:base.x)+offset.x,
         y:(Number.isFinite(y)?y:base.y)+offset.y};
}
function npcInReach(s,p,id,d){
 if(NPC_SCENES[id]!==p.scene)return false;
 const configured=npcConfiguredPoint(s,id);
 if(!configured)return false;
 const submitted=d?.npcPoint;
 const point=submitted&&Number.isFinite(Number(submitted.x))&&Number.isFinite(Number(submitted.y))
   ?{x:Number(submitted.x),y:Number(submitted.y)}:configured;
 // NPC patrols have short paths. Reject spoofed interactions at distant locations.
 if(dist(point,configured)>90)return false;
 return dist(p,point)<=npcInteractionRadius(s);
}
function npcVendor(s,p,npc,d){
 if(C.vendors[npc]!==p.scene)return bad("Visit the correct shop");
 if(npcInReach(s,p,npc,d))return null;
 // Browser-only settings can legitimately relocate the shopkeeper or change
 // dialogue range while Cloudflare settings storage is unavailable.
 // Accept that same client-side dialogue contact, but only within the proper
 // shop and a bounded interaction range. Other server actions remain unchanged.
 if(d?.localNpcSettings===true&&d.npcId===npc&&d.npcPoint){
  const bounds={dohanybolt:{w:608,h:832},gyros:{w:768,h:480},pub:{w:1448,h:1086}}[p.scene];
  const point={x:Number(d.npcPoint.x),y:Number(d.npcPoint.y)};
  const clientRadius=Number(d.dialogueRadius);
  if(bounds&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&
     point.x>=0&&point.x<=bounds.w&&point.y>=0&&point.y<=bounds.h&&
     Number.isFinite(clientRadius)&&clientRadius>=40&&clientRadius<=190&&
     dist(p,point)<=clientRadius+2)return null;
 }
 return bad("Move closer to the counter");
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
 const loose=playerInventory(s,from).find(i=>i.type==="cigarette"&&!i.lit&&i.remainingUnits>0);
 if(loose){loose.location={kind:"inventory",playerId:to.id,slot:freeSlot(s,to,"cigarette")};loose.revision++;return ok({itemId:loose.id})}
 const pack=playerInventory(s,from).find(i=>i.type==="cigarette_pack"&&i.remainingUnits>0);
 if(!pack)return bad("No cigarette to share");
 pack.remainingUnits--;pack.revision++;
 create(s,"cigarette",1,{kind:"inventory",playerId:to.id,slot:freeSlot(s,to,"cigarette")});
 return ok();
}
function validateLocation(s,p,item){
 if(item.location.kind==="inventory")return item.location.playerId===p.id;
 return itemAccessible(p,item);
}
function operation(s,p,d){
 const op=d.op;
 if(op==="sendChat"){
  if(!p.characterId)return bad("Select a character before chatting");
  if(typeof d.message!=="string")return bad("Invalid chat message");
  const message=d.message.replace(/[\u0000-\u001F\u007F]/g," ").replace(/\s+/g," ").trim();
  if(!message||message.length>200)return bad("Chat messages must be 1–200 characters");
  if(now()-(p.lastChatAt||0)<900)return bad("Please wait before sending another message");
  p.lastChatAt=now();
  s.chatMessages??=[];
  const character=LOBBY_CHARACTERS.find(c=>c.id===p.characterId);
  const displayName=character?.name||p.alias||"Player";
  const record={id:uid("chat"),playerId:p.id,name:displayName,message,at:now()};
  s.chatMessages.push(record);
  if(s.chatMessages.length>40)s.chatMessages.splice(0,s.chatMessages.length-40);
  return ok({chatId:record.id});
 }
 if(op==="callGroup"){
  if(!p.characterId||p.deadUntil)return bad("Select a living character to call a group");
  if(!GROUP_RALLY_RULES[d.type])return bad("Unknown group activity");
  if(s.rally?.status==="gathering")return bad("A group gathering is already underway");
  const playerIds=Object.values(s.players).filter(q=>q.characterId&&!q.deadUntil&&
   now()-q.lastSeen<12000).map(q=>q.id);
  if(playerIds.length<2)return bad("At least two active players are needed for a group call");
  const target=rallyTarget(s,d.type);
  s.rally={id:uid("rally"),type:d.type,target,callerId:p.id,
   playerIds,radius:GROUP_RALLY_RULES[d.type].radius,startedAt:now(),expiresAt:now()+GROUP_RALLY_EXPIRES_MS,status:"gathering"};
  checkRally(s);
  return ok({rallyId:s.rally.id,message:GROUP_RALLY_RULES[d.type].label+"! Everyone head to "+target.label});
 }
 if(op==="tramHit"){
  if(!p.characterId||p.scene!=="street"||seatOf(s,p))return bad("Tram collision requires a walking player on the street");
  if(p.deadUntil&&now()<p.deadUntil)return bad("Already hit by tram");
  const at=d.actorPosition;
  if(!at||at.scene!=="street")return bad("Invalid tram collision position");
  const x=Number(at.x),y=Number(at.y);
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1800||y<0||y>1300)return bad("Invalid position");
  // Recent player tracking is already client-originated; keep the collision
  // report close to the latest tracked position to avoid arbitrary deaths.
  if(dist(p,{x,y})>110)return bad("Stale tram collision position");
  if(!tramCollisionAt(now(),s.tramConfig||TRAM_DEFAULTS,{x,y}))return bad("Tram is not colliding with the player");
  const hit=tramWorldAt(now(),s.tramConfig||TRAM_DEFAULTS);
  const death=recordVehicleDeath(s,p,hit,"tram","tram");
  if(!death)return bad("Already hit");
  return ok({death,message:"Hit by tram! Respawning in 5 seconds…"});
 }
 if(p.deadUntil&&now()<p.deadUntil){
  if(op==="syncPosition")return ok();
  return bad("Wait for your tram respawn");
 }
 if(op==="respawnVehicles"){
  if(!p.characterId)return bad("Choose a character before respawning vehicles");
  const occupied=Object.values(s.vehicles||{}).some(vehicle=>vehicle.seats.some(Boolean));
  if(occupied)return bad("Everyone must exit vehicles before respawning");
  const settings=d.vehicleSpawnSettings&&typeof d.vehicleSpawnSettings==="object"?d.vehicleSpawnSettings:s.vehicleSpawnSettings||{};
  s.vehicleSpawnSettings=settings;
  s.vehicles=freshVehicles(settings);
  s.vehicleRespawnRevision=(s.vehicleRespawnRevision||0)+1;
  return ok({vehicleRespawnRevision:s.vehicleRespawnRevision,message:"All vehicles respawned at their starting positions"});
 }
 if(op==="boardVehicle"){
  if(!p.characterId)return bad("Choose a character first");
  if(p.scene!=="street"||seatOf(s,p))return bad("You must be on foot to board");
  const v=s.vehicles?.[d.vehicleId];
  if(!v)return bad("Unknown vehicle");
  if(!inRange(p,v,85))return bad("Move closer to the vehicle");
  const seat=Number(d.seat);
  if(!Number.isInteger(seat)||seat<0||seat>=v.seats.length)return bad("Invalid seat");
  if(v.seats[seat])return bad("That seat is occupied");
  if(seat===0&&Math.abs(v.speed)>3)return bad("Cannot take the wheel of a moving vehicle");
  v.seats[seat]=p.id;v.revision++;p.vehicleId=v.id;p.seatIndex=seat;
  positionAtVehicle(s,p);
  return ok({vehicleId:v.id,seat,message:seat===0?"You are driving "+v.name:"You are a passenger in "+v.name});
 }
 if(op==="leaveVehicle"){
  const riding=seatOf(s,p);
  if(!riding)return bad("You are not in a vehicle");
  if(Math.abs(riding.vehicle.speed)>8)return bad("Cannot exit a moving vehicle");
  const {vehicle,seat}=riding;
  const side=seat%2===0?1:-1;
  const fallback={x:vehicle.x+Math.cos(vehicle.angle)*side*46,
                  y:vehicle.y+Math.sin(vehicle.angle)*side*46};
  // The Phaser client tests its collision polygons first. The server ensures
  // any requested exit point is nearby, not a teleport across the map.
  const proposed={x:Number(d.x),y:Number(d.y)};
  const requested=Number.isFinite(proposed.x)&&Number.isFinite(proposed.y)&&
   proposed.x>=25&&proposed.x<=1575&&proposed.y>=25&&proposed.y<=967&&
   dist(vehicle,proposed)<=85?proposed:null;
  const candidate=requested||fallback;
  releaseSeat(s,p);
  p.scene="street";p.x=Math.max(25,Math.min(1575,candidate.x));p.y=Math.max(25,Math.min(967,candidate.y));
  return ok({x:p.x,y:p.y,message:"Exited "+vehicle.name});
 }
 if(op==="driveVehicle"){
  const riding=seatOf(s,p);
  if(!riding||riding.seat!==0||riding.vehicle.id!==d.vehicleId)return bad("Driver seat required",403);
  const v=riding.vehicle;
  const x=Number(d.x),y=Number(d.y),angle=Number(d.angle),speed=Number(d.speed);
  if(![x,y,angle,speed].every(Number.isFinite)||x<20||x>1580||y<20||y>970||Math.abs(speed)>300)
   return bad("Invalid vehicle movement");
  const elapsed=Math.max(.05,Math.min(1,(now()-v.updatedAt)/1000));
  if(dist(v,{x,y})>Math.max(55,elapsed*330+25))return bad("Vehicle moved too far");
  const previous={x:v.x,y:v.y,angle:v.angle,speed:v.speed};
  v.x=x;v.y=y;v.angle=angle;v.speed=speed;v.updatedAt=now();v.revision++;
  if(v.type==="car")checkCarPedestrians(s,v,previous);
  for(const occupantId of v.seats){
   const rider=s.players[occupantId];
   if(rider)positionAtVehicle(s,rider);
  }
  return ok({vehicleId:v.id});
 }
 if(op==="selectCharacter"){
  const character=LOBBY_CHARACTERS.find(c=>c.id===d.characterId);
  if(!character)return bad("Unknown character");
  const occupying=Object.values(s.players).find(q=>q.id!==p.id&&q.characterId===character.id&&now()-q.lastSeen<30000);
  if(occupying)return bad("That character is already taken");
  p.characterId=character.id;
  return ok({characterId:character.id,message:"Playing as "+character.name});
 }
 if(op==="releaseCharacter"){
  releaseSeat(s,p);p.characterId=null;p.scene=null;return ok();
 }
 if(op==="syncPosition"){
  if(seatOf(s,p)){
   positionAtVehicle(s,p);
   p.lastSeen=now();
   return ok(); // Passenger and driver positions always follow the shared car.
  }
  const scene=["street","pub","basement","casino","spar","gyros","dohanybolt"].includes(d.scene)?d.scene:null;
  const x=Number(d.x),y=Number(d.y);
  if(!scene||!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>1800||y>1300)return bad("Invalid position");
  // Existing Phaser game remains the movement authority; this endpoint tracks the
  // last reported position for interactions but cannot authenticate movement paths.
  if(p.action&&(p.scene!==scene||dist(p,{x,y})>7))p.action=null;
  p.scene=scene;p.x=x;p.y=y;p.face=["down","up","right","left"].includes(d.face)?d.face:"down";p.moving=!!d.moving;p.lastSeen=now();
  if(scene==="street"&&p.characterId&&!p.deadUntil){
   // Check also when a pedestrian walks across the moving car's nose.
   for(const vehicle of Object.values(s.vehicles||{})){
    if(vehicle.type!=="car"||vehicle.speed<=CAR_HIT_MIN_SPEED)continue;
    if(now()-vehicle.updatedAt>650)continue;
    const dims=s.vehicleCollisionDimensions?.[vehicle.id]||CAR_DIMENSIONS[vehicle.id];
    if(dims&&frontImpact({...vehicle,...dims},p)){
     recordVehicleDeath(s,p,vehicle,"car",vehicle.id);
     break;
    }
   }
  }
  return ok();
 }
 if(op==="resetRound"){
  // No player may delete another room's state. In multiplayer this must be host-gated.
  if(Object.keys(s.players).length>1)return bad("Room reset requires host authority",403);
  s.vehicles=freshVehicles(s.vehicleSpawnSettings||{});
  s.items=[];s.scratchResults={};s.orders=[];s.requests=[];s.completions=[];s.rally=null;s.groupEvents=[];s.npcStock=copy(C.npcCigarettes);
  for(const q of Object.values(s.players)){q.equippedId=null;q.action=null;q.objectives={beer:0,kebab:0,cigarette:0}}
  return ok();
 }
 // NPC actions use the same instant player position as the open dialogue.
 // Movement is already client-driven in this Phaser prototype; a queued 100 ms
 // sync must not make a valid transaction fail as "move closer".
 if(["orderBeer","refillBeer","orderKebab","buyPack","buyScratchTicket","npcBorrow"].includes(op)&&d.actorPosition&&!seatOf(s,p)){
  const a=d.actorPosition;
  const expected=op==="orderKebab"?"gyros":["buyPack","buyScratchTicket"].includes(op)?"dohanybolt":"pub";
  const x=Number(a.x),y=Number(a.y);
  if(a.scene===expected&&Number.isFinite(x)&&Number.isFinite(y)&&
      x>=0&&x<=1800&&y>=0&&y<=1300){
   p.scene=expected;p.x=x;p.y=y;p.lastSeen=now();
  }
 }
 if(!p.scene)return bad("Enter the game first");
 if(op==="orderBeer"||op==="refillBeer"||op==="orderKebab"||op==="buyPack"||op==="buyScratchTicket"){
  const vendor=op==="orderKebab"?"gyros_employee":["buyPack","buyScratchTicket"].includes(op)?"tobacco_cashier":"maestro_bartender";
  const err=npcVendor(s,p,vendor,d);if(err)return err;
  if(s.orders.some(q=>q.playerId===p.id&&q.vendorId===vendor))return bad("Your order is still being prepared");
  const point=vendorSpot(s,vendor,p);if(!point)return bad("Counter pickup spots are full");
  if(op==="buyPack"){const item=create(s,"cigarette_pack",5,{kind:"vendor",vendorId:vendor,sceneId:p.scene,...point});return ok({itemId:item.id,message:"Cigarette pack ready at the counter"});}
  if(op==="buyScratchTicket"){
   const item=create(s,"scratch_ticket",1,{kind:"vendor",vendorId:vendor,sceneId:p.scene,...point});
   s.scratchResults??={};
   const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);
   const won=(bytes[0]%10)===0;
   const variant=won?10:1+((bytes[0]>>>4)%9);
   s.scratchResults[item.id]={won,variant};
   return ok({itemId:item.id,message:"Kaparós sorsjegy ready at the counter. Pick it up, then use it from Inventory."});
  }
  // No empty glass or reuse mechanic. Legacy refill requests buy a fresh beer.
  let reuseId=null,generation=0;
  const type=op==="orderKebab"?"kebab":"beer";
  const duration=op==="orderKebab"?C.orderKebabMs:op==="refillBeer"?C.refillMs:C.orderBeerMs;
  s.orders.push({id:uid("order"),playerId:p.id,vendorId:vendor,type,reuseId,generation,
   startedAt:now(),readyAt:now()+duration,location:{kind:"vendor",sceneId:p.scene,vendorId:vendor,...point}});
  return ok({duration,message:type==="beer"?"Bartender is preparing your beer":"Your gyros is being prepared"});
 }
 if(op==="npcBorrow"){
  if(p.scene!=="pub")return bad("Ask inside the pub");
  const conf=s.npcStock[d.npcId];if(!conf)return bad("This person does not have cigarettes");
  if(!npcInReach(s,p,d.npcId,d))return bad("Move closer to this person");
  if(!conf.share)return bad("Sorry, I don't have one to spare");
  if(conf.stock<=0)return bad("Out of cigarettes");
  const slot=freeSlot(s,p,"cigarette");if(slot===undefined)return bad("Cigarette slots are full");
  conf.stock--;create(s,"cigarette",1,{kind:"inventory",playerId:p.id,slot});
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
 if(op==="scratchTicket"){
  const item=owned(s,p,d.itemId);
  if(!item||item.type!=="scratch_ticket")return bad("You do not own this scratch ticket");
  s.scratchResults??={};
  if(!Object.prototype.hasOwnProperty.call(s.scratchResults,item.id))return bad("Ticket result unavailable");
  const result=s.scratchResults[item.id];
  const won=typeof result==="object"?!!result.won:result===true;
  const variant=typeof result==="object"?result.variant:(won?10:1);
  delete s.scratchResults[item.id];
  s.items.splice(s.items.indexOf(item),1);
  if(p.equippedId===item.id)p.equippedId=null;
  // Preserve the 1-in-10 win roll. Vehicle prizes are disabled until a new reward is chosen.
  return ok({won,variant,message:won?"NYERTÉL! Három egyforma szimbólum!":"NEM NYERT. Nincs három egyforma szimbólum."});
 }
 if(op==="extractCigarette"){
  const i=owned(s,p,d.itemId);if(!i||i.type!=="cigarette_pack")return bad("Need a cigarette pack");
  if(i.remainingUnits<=0)return bad("Pack is empty");
  const slot=freeSlot(s,p,"cigarette");if(slot===undefined)return bad("Cigarette slots are full");
  i.remainingUnits--;i.revision++;
  const cig=create(s,"cigarette",1,{kind:"inventory",playerId:p.id,slot});p.equippedId=cig.id;
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
  // A single completed action finishes the entire beer, kebab or cigarette,
  // including legacy inventory items created before the one-use update.
  i.remainingUnits=0;i.revision++;p.action=null;
  const remaining=0;
  if(remaining===0){
   const oldType=i.type;
   s.items.splice(s.items.indexOf(i),1);
   if(p.equippedId===i.id)p.equippedId=null;
   const event={id:uid("event"),playerId:p.id,type:oldType,itemId:i.id,generation:i.generation||0,time:now(),scene:p.scene,x:p.x,y:p.y,duration:2000};
   if(!s.completions.some(q=>q.itemId===i.id&&q.generation===event.generation)){
    s.completions.push(event);p.objectives[oldType]=(p.objectives[oldType]||0)+1;
   }
  }
  return ok({itemId:i.id,remaining,type:i.type,message:remaining===0?"Finished!":"Portion consumed"});
 }
 if(op==="borrowRequest"){
  const target=s.players[d.targetId];
  if(!target||target.id===p.id||now()-target.lastSeen>30000||target.scene!==p.scene||dist(p,target)>(s.playerInteractRadius??PLAYER_INTERACT_DEFAULT))return bad("Player not nearby");
  if(s.requests.some(q=>q.fromId===p.id&&q.status==="pending"))return bad("Request already pending");
  s.requests.push({id:uid("borrow"),fromId:p.id,toId:target.id,status:"pending",expiresAt:now()+C.borrowExpiryMs});
  return ok({message:"Cigarette request sent"});
 }
 if(op==="borrowResponse"){
  const request=s.requests.find(q=>q.id===d.requestId&&q.toId===p.id);
  if(!request||request.status!=="pending"||request.expiresAt<now())return bad("Request expired");
  const from=s.players[request.fromId];request.status="closed";
  if(!d.accept)return ok({message:"Declined"});
  if(!from||from.scene!==p.scene||dist(from,p)>(s.playerInteractRadius??PLAYER_INTERACT_DEFAULT))return bad("Player is no longer nearby");
  return transferCig(s,p,from);
 }
 return bad("Unknown action");
}
export class ConsumableRoom{
 constructor(ctx,env){
  this.ctx=ctx;this.env=env;this.playerRangeCache=null;this.npcSettingsCache=null;
  this.roomState=null;this.roomLoad=null;this.lastPersistAt=0;this.storageQuotaRetryAt=0;this.storageQuotaExceeded=false;
 }
 async loadRoom(initialSettings={}){
  // One in-memory authoritative room per Durable Object instance. Never reload on polling.
  if(this.roomState)return this.roomState;
  if(!this.roomLoad){
   // Native Durable Objects expose get()/put(). Keep transaction-only mocks
   // compatible with the same room lifecycle so regression tests catch breakage.
   const read=typeof this.ctx.storage.get==="function"
    ?()=>this.ctx.storage.get("room")
    :()=>this.ctx.storage.transaction(tx=>tx.get("room"));
   this.roomLoad=Promise.resolve().then(read).catch(error=>{
    if(/exceeded allowed rows written|exceeded allowed rows read|storage.*quota|quota.*exceed/i.test(String(error))){
     this.storageQuotaExceeded=true;
     this.storageQuotaRetryAt=now()+60000;
     console.warn("Storage quota prevents room load; using temporary room",String(error));
     return null;
    }
    throw error;
   }).then(saved=>{
    this.roomWasStored=!!saved;
    this.roomState=saved||fresh(initialSettings);
    return this.roomState;
   }).catch(error=>{this.roomLoad=null;throw error;});
  }
  return this.roomLoad;
 }
 async persistRoom(force=false){
  // Most movement/snapshot requests must not write SQLite.
  if(this.storageQuotaExceeded&&now()<this.storageQuotaRetryAt)return;
  if(!force&&now()-this.lastPersistAt<30000)return;
  try{
   if(typeof this.ctx.storage.put==="function")
    await this.ctx.storage.put("room",this.roomState);
   else
    await this.ctx.storage.transaction(tx=>tx.put("room",this.roomState));
   this.lastPersistAt=now();this.storageQuotaExceeded=false;this.storageQuotaRetryAt=0;
  }catch(error){
   if(/exceeded allowed rows written|storage.*quota|quota.*exceed/i.test(String(error))){
    // The free-tier cap is account-wide. Keep this active room playable in memory
    // until the quota resets, but it cannot be durable across instance eviction.
    this.storageQuotaExceeded=true;this.storageQuotaRetryAt=now()+60000;
    console.warn("MaestroEscape storage quota reached: running in volatile room mode",String(error));
   }else throw error;
  }
 }
 async getPlayerInteractionRange(){
  if(!this.env?.SETTINGS_STORE)return PLAYER_INTERACT_DEFAULT;
  if(this.playerRangeCache&&now()-this.playerRangeCache.time<15000)return this.playerRangeCache.value;
  try{
   const id=this.env.SETTINGS_STORE.idFromName("maestroescape-global-settings");
   const response=await this.env.SETTINGS_STORE.get(id).fetch(new Request("https://settings.internal/",{method:"GET"}));
   if(!response.ok)throw Error("Shared settings unavailable");
   const data=await response.json();
   const range=validPlayerInteractionRange(data?.settings?.["player.interactRadius"]);
   this.playerRangeCache={value:range,time:now()};
   return range;
  }catch(error){
   console.warn("Player interaction range using last known value",String(error));
   return this.playerRangeCache?.value??PLAYER_INTERACT_DEFAULT;
  }
 }
 async getNpcSettings(){
  if(!this.env?.SETTINGS_STORE)return {radius:108,positions:{},tram:TRAM_DEFAULTS,vehicleDimensions:CAR_DIMENSIONS};
  if(this.npcSettingsCache&&now()-this.npcSettingsCache.time<15000)return this.npcSettingsCache.data;
  try{
   const id=this.env.SETTINGS_STORE.idFromName("maestroescape-global-settings");
   const response=await this.env.SETTINGS_STORE.get(id).fetch(new Request("https://settings.internal/",{method:"GET"}));
   if(!response.ok)throw Error("NPC settings unavailable");
   const values=(await response.json())?.settings||{};
   const raw=Number(values["npc.interactRadius"]);
   const radius=Number.isFinite(raw)?Math.min(190,Math.max(40,raw)):108;
   const positions={};
   for(const npc of Object.keys(NPC_INITIAL)){
    const x=Number(values["npc."+npc+".x"]),y=Number(values["npc."+npc+".y"]);
    if(Number.isFinite(x)&&Number.isFinite(y))positions[npc]={x,y};
   }
   const tram={
    interval:tramConfigValue(values["tram.interval"],20,5,90),
    travelTime:tramConfigValue(values["tram.travelTime"],14.5,4,60),
    width:tramConfigValue(values["tram.width"],40,15,180),
    length:tramConfigValue(values["tram.length"],144,40,300)
   };
   const vehicleDimensions={};
   for(const [id,def] of Object.entries(CAR_DIMENSIONS)){
    vehicleDimensions[id]={
     width:tramConfigValue(values["vehicle."+id+".width"],def.width,14,100),
     length:tramConfigValue(values["vehicle."+id+".length"],def.length,30,180)
    };
   }
   const data={radius,positions,tram,vehicleDimensions};
   this.npcSettingsCache={data,time:now()};
   return data;
  }catch(err){
   console.warn("Using last NPC interaction settings",String(err));
   return this.npcSettingsCache?.data||{radius:108,positions:{},tram:TRAM_DEFAULTS,vehicleDimensions:CAR_DIMENSIONS};
  }
 }
 async fetch(request){
  try{
   const input=request.method==="POST"?await request.json():{};
   const token=(request.method==="GET"?new URL(request.url).searchParams.get("token"):input.token)||"";
   if(!/^[a-zA-Z0-9_-]{20,100}$/.test(token))return Response.json(bad("Invalid session token"),{status:400});
   // Read current saved vehicle spawn settings for an explicit reset, so the
   // button honors adjustments made after this multiplayer room was created.
   const wantsVehicleRespawn=input.op==="respawnVehicles";
   let latestSpawnSettings=null;
   if(wantsVehicleRespawn&&this.env?.LOCAL_VEHICLE_SETTINGS){
    latestSpawnSettings=this.env.LOCAL_VEHICLE_SETTINGS;
   }
   if(wantsVehicleRespawn&&this.env?.SETTINGS_STORE){
    try{
     const id=this.env.SETTINGS_STORE.idFromName("maestroescape-global-settings");
     const res=await this.env.SETTINGS_STORE.get(id).fetch(new Request("https://settings.internal/",{method:"GET"}));
     if(!res.ok)throw Error("Could not load shared vehicle settings");
     const data=await res.json();
     const settings=data.settings||{};
     latestSpawnSettings={};
     for(const def of VEHICLE_DEFS)for(const part of ["spawnX","spawnY","angle"]){
      const key="vehicle."+def.id+"."+part;
      if(settings[key]!==undefined)latestSpawnSettings[key]=settings[key];
     }
    }catch(error){
     console.warn("Vehicle respawn failed to refresh starting positions",String(error));
     return Response.json(bad("Could not load shared vehicle starting positions",503),{status:503});
    }
   }
   const playerInteractionRange=await this.getPlayerInteractionRange();
   const npcSettings=await this.getNpcSettings();
   let initialVehicleSettings={...this.env?.LOCAL_VEHICLE_SETTINGS||{}};
   const priorRoom=await this.loadRoom(initialVehicleSettings);
   if(this.env?.SETTINGS_STORE&&(!this.roomWasStored||!priorRoom.vehicles)){
    try{
     const settingsStub=this.env.SETTINGS_STORE.get(this.env.SETTINGS_STORE.idFromName("maestroescape-global-settings"));
     const response=await settingsStub.fetch(new Request("https://settings.internal/",{method:"GET"}));
     if(response.ok){
      const data=await response.json();
      if(data?.settings&&typeof data.settings==="object"){
       for(const def of VEHICLE_DEFS)for(const part of ["spawnX","spawnY","angle"]){
        const key="vehicle."+def.id+"."+part;
        if(data.settings[key]!==undefined)initialVehicleSettings[key]=data.settings[key];
       }
      }
     }
    }catch(err){console.warn("Room using default vehicle positions",String(err))}
   }
   const result=await (async()=>{
    const s=await this.loadRoom(initialVehicleSettings);
    if(!this.roomWasStored&&Object.keys(initialVehicleSettings).length){
     s.vehicleSpawnSettings=initialVehicleSettings;
     s.vehicles=freshVehicles(initialVehicleSettings);
     this.roomWasStored=true;
    }else if(!s.vehicles){
     s.vehicleSpawnSettings=initialVehicleSettings;
     s.vehicles=freshVehicles(initialVehicleSettings);
    }
    settle(s);
    s.playerInteractRadius=playerInteractionRange;
    s.npcInteractionRadius=npcSettings.radius;
    s.npcPositions=npcSettings.positions;
    s.tramConfig=npcSettings.tram||TRAM_DEFAULTS;
    s.vehicleCollisionDimensions=npcSettings.vehicleDimensions||CAR_DIMENSIONS;
    let p=findPlayer(s,token);
    if(!p){
     p={id:uid("player"),token,alias:"Player "+(Object.keys(s.players).length+1),characterId:null,scene:null,x:0,y:0,face:"down",moving:false,
      lastSeen:now(),equippedId:null,action:null,deadUntil:null,lastDeath:null,respawnRevision:0,objectives:{beer:0,kebab:0,cigarette:0}};
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
       answer=operation(s,p,wantsVehicleRespawn&&latestSpawnSettings?
        {...input,vehicleSpawnSettings:latestSpawnSettings}:input);
       s.used.push({id:commandId,response:answer});
       if(s.used.length>500)s.used.splice(0,s.used.length-500);
      }
     }
    }else if(request.method!=="GET")answer=bad("Method not allowed",405);
    checkRally(s);
    s.revision++;
    const result={...answer,snapshot:snapshot(s,p)};
    // Persist item transactions and character/vehicle changes, but batch position
    // tracking and frequent GET snapshots into at most one write per 30 seconds.
    const lowPriority=request.method==="GET"||
      (request.method==="POST"&&["syncPosition","driveVehicle","sendChat"].includes(input.op));
    await this.persistRoom(!lowPriority);
    return result;
   })();
   return Response.json(result,{status:result.status||200,headers:{"cache-control":"no-store"}});
  }catch(error){return Response.json(bad("Room error: "+error.message,500),{status:500,headers:{"cache-control":"no-store"}})}
 }
}
