// MaestroEscape: single-player browser exploration using the uploaded game's TMX,
// map artwork, collision objects, and character animation frames.
// Original Pygame source remains available in the repository.
const HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maestro Escape | Explore</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#10151f;color:#f6f3ea;font:15px system-ui,Arial}
header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:12px 20px;max-width:1360px;margin:auto}
h1{margin:0;font-size:22px;letter-spacing:.04em;color:#ffcb7b}header p{margin:3px 0 0;color:#b4bfcd;font-size:12px}
#hud{display:flex;align-items:center;gap:14px;color:#d5e0e6;font-size:13px}
#screen{margin:auto;width:min(100%,1360px);aspect-ratio:16/9;border:1px solid #39455b;overflow:hidden;position:relative;background:#19212e;border-radius:8px}
#screen canvas{display:block;width:100%!important;height:100%!important;object-fit:contain}
#splash{position:absolute;inset:0;display:grid;place-items:center;background:#131b29;z-index:2;text-align:center;padding:20px;font-size:18px}
#instructions{max-width:1360px;margin:12px auto;padding:0 12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#aebbc8}
kbd{display:inline-block;background:#323d51;border:1px solid #59677c;color:white;padding:3px 7px;border-radius:5px}
#msg{font-weight:bold;color:#f5cf89}button{border:1px solid #59677c;background:#273448;color:white;padding:7px 11px;border-radius:7px;cursor:pointer}
@media(max-width:620px){header{flex-direction:column;align-items:flex-start}#hud{flex-wrap:wrap}}
</style></head><body>
<header><div><h1>🍻 MAESTRO ESCAPE</h1><p>Maestro Pub · Mester utca × Viola utca · Single-player</p></div>
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><button id="reset">Respawn</button></div></header>
<div id="screen"><div id="splash">Loading original game map and animated sprites…</div></div>
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk / W accelerate, S brake/reverse, A/D steer &nbsp; <kbd>E</kbd> enter/exit Skoda &nbsp; <kbd>SHIFT</kbd> sprint on foot &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Walk to the Skoda Superb parked by Maestro Pub. Press E to drive.</span></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const locs=[{name:"Maestro Pub",x:825,y:547,color:0xffc76a,info:"Maestro Pub entrance.",done:false}];
const SPAWN={x:859,y:577};
const PARKING={x:697,y:505};
// Uses the same forward-speed / steering model as the original Vehicle.ts controller.
const car={x:PARKING.x,y:PARKING.y,angle:3*Math.PI/4,speed:0,wheelTurn:0,driver:false,frame:3};
const DRIVING_ZOOM=2.03*0.68;
let vehicleController=null;
let carSprite=null;
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:1600,h:992},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false,assetFailed=false;
const status=document.getElementById("status"),coords=document.getElementById("coords"),msg=document.getElementById("msg");
function show(text){msg.textContent=text;toastUntil=Date.now()+5000;}
function near(o,x,y,r=78){return Math.hypot(o.x-x,o.y-y)<r;}
function intersects(x,y){const w=19,h=16;return x<35||y<35||x>mapSize.w-35||y>mapSize.h-35||collisionPolygons.some(poly=>[[x,y],[x-w,y-h],[x+w,y-h],[x-w,y+h],[x+w,y+h]].some(p=>insidePolygon(p[0],p[1],poly)));}
function enterOrExitCar(){
 if(!carSprite)return;
 if(!car.driver){
  if(!near(player,car.x,car.y,67)){show("Walk closer to the Skoda Superb.");return;}
  car.driver=true;car.speed=0;car.wheelTurn=0;character.setVisible(false);
  scene.cameras.main.startFollow(carSprite,true,0.13,0.13);
  status.textContent="Driving: Skoda Superb 2.0TDI";
  show("Skoda Superb 2.0TDI · W accelerate · S brake/reverse · A/D steer · E exit.");
 }else{
  const offsets=[[41,0],[-41,0],[0,43],[0,-43],[40,35],[-40,35]];
  const pos=offsets.map(([x,y])=>({x:car.x+x,y:car.y+y})).find(p=>!intersects(p.x,p.y));
  if(!pos){show("Can't get out here. Drive somewhere with more space.");return;}
  car.driver=false;car.speed=0;car.wheelTurn=0;player.x=pos.x;player.y=pos.y;
  character.setPosition(player.x,player.y).setVisible(true);
  scene.cameras.main.startFollow(character,true,0.13,0.13);
  status.textContent="On foot";
  show("Exited Skoda Superb 2.0TDI. E to enter again.");
 }
}
// VehicleController ported from KulturalisDigitalisPolgariKor/src/entities/Vehicle.ts.
// Throttle/brake/reverse, speed-dependent steering, grip and friction use the original
// model; its city geometry collision check is adapted for MaestroEscape polygons.
class VehicleController {
 constructor(vehicle,sprite){this.vehicle=vehicle;this.sprite=sprite;}
 update(inputX,inputY,dt){
  const v=this.vehicle;
  const acceleration=175,maxSpeed=245;
  if(inputY<-.1)v.speed+=acceleration*dt;
  else if(inputY>.1)v.speed-=acceleration*dt*(v.speed>0?1.65:.65);
  else v.speed*=Math.max(0,1-1.35*dt);
  v.speed=Phaser.Math.Clamp(v.speed,-maxSpeed*.33,maxSpeed);
  const steer=Phaser.Math.Clamp(inputX,-1,1);
  if(Math.abs(v.speed)>1){
   v.wheelTurn=Phaser.Math.Linear(v.wheelTurn,steer,Math.min(1,dt*5));
   const grip=Phaser.Math.Clamp(Math.abs(v.speed)/75,.2,1);
   v.angle+=v.wheelTurn*2.0*dt*grip*Math.sign(v.speed);
  }else{
   v.wheelTurn=Phaser.Math.Linear(v.wheelTurn,0,Math.min(1,dt*5));
  }
  // The Skoda is controlled by its heading, not by moving sideways with A/D.
  const px=v.x+Math.sin(v.angle)*v.speed*dt;
  const py=v.y-Math.cos(v.angle)*v.speed*dt;
  const fw={x:Math.sin(v.angle),y:-Math.cos(v.angle)};
  const side={x:Math.cos(v.angle),y:Math.sin(v.angle)};
  const halfW=12,halfL=25;
  const corners=[-1,1].flatMap(f=>[-1,1].map(t=>({
   x:px+fw.x*halfL*f+side.x*halfW*t,
   y:py+fw.y*halfL*f+side.y*halfW*t
  })));
  const blocked=p=>p.x<18||p.y<18||p.x>mapSize.w-18||p.y>mapSize.h-18
     || collisionPolygons.some(poly=>insidePolygon(p.x,p.y,poly));
  if(corners.some(blocked)){v.speed*=-.08;return;}
  v.x=px;v.y=py;
 }
}
function interact(){if(car.driver || near(player,car.x,car.y,67)){enterOrExitCar();return;}const nearest=locs.reduce((best,v)=>Math.hypot(player.x-v.x,player.y-v.y)<Math.hypot(player.x-best.x,player.y-best.y)?v:best,locs[0]);if(!near(player,nearest.x,nearest.y)){show("Get closer to an interaction marker.");return;}
 nearest.done=true;show(nearest.info);status.textContent="Interacted with "+nearest.name;
}
const collisionPolygons=[
[[186,0],[516,0],[694,197],[669,265],[547,254],[408,155],[248,98]],
[[457,278],[573,241],[711,300],[823,364],[829,513],[791,536],[656,450],[563,405]],
[[720,0],[1040,0],[946,238],[861,333],[732,256],[694,158]],
[[1048,0],[1419,0],[1376,144],[1303,175],[1089,213],[993,163]],
[[1053,160],[1414,154],[1401,412],[1230,502],[1014,453],[983,359]],
[[1456,90],[1586,107],[1586,992],[1462,992],[1451,675],[1382,574],[1416,351]],
[[935,454],[1014,430],[1123,481],[1288,524],[1407,681],[1342,817],[1177,794],[1053,709],[955,644]],
[[1283,777],[1470,736],[1462,992],[1133,992],[1148,915]],
[[0,227],[92,246],[187,336],[279,384],[291,519],[153,639],[0,550]],
[[188,356],[357,392],[563,564],[660,688],[543,823],[324,701],[162,619]],
[[0,712],[234,574],[373,723],[267,991],[0,991]],
[[347,715],[525,691],[709,798],[1051,992],[350,992],[283,925]]
];
function insidePolygon(x,y,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
async function loadOriginalCollision(){obstacles=[];status.textContent="Maestro map ready · "+collisionPolygons.length+" building collisions";}
class Explore extends Phaser.Scene{
 constructor(){super("Explore")}
 preload(){
   this.load.crossOrigin="anonymous";
   this.load.image("world","https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/Assets/Maps/maestro_map.webp");
   this.load.spritesheet("maestro","https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/Assets/Characters/maestro_walk.webp",{frameWidth:80,frameHeight:120});
   this.load.image("skoda","/assets/skoda-highres.webp");
   this.load.on("loaderror",file=>{if(file.key==="world")assetFailed=true;if(file.key==="skoda")show("Skoda image failed to load. Displaying fallback car.");status.textContent="Asset failed: "+file.key;console.error("Missing asset",file.src)});
 }
 create(){
   scene=this;
   const splash=document.getElementById("splash");if(assetFailed||!this.textures.exists("world")){splash.textContent="Map failed to load. Check the published map asset.";return;}splash.remove();
   const image=this.add.image(0,0,"world").setOrigin(0,0);
   image.setDepth(0);
   mapSize={w:image.width,h:image.height};
   const gfx=this.add.graphics().setDepth(2);
   // Pub interaction remains active, without the visual marker.
   character=this.add.sprite(player.x,player.y,"maestro",0).setDepth(5);
   character.setScale(0.324);character.setOrigin(0.5,1.0);
   if(!this.textures.exists("skoda")){
     // Render an obvious, interactable placeholder if the remote image fails.
     const fallback=this.make.graphics({x:0,y:0},false);
     fallback.fillStyle(0x15263b,0.9).fillRoundedRect(7,1,18,30,5);
     fallback.fillStyle(0x50a9e8,1).fillRoundedRect(10,5,12,22,4);
     fallback.fillStyle(0xa9defb,1).fillRoundedRect(11,9,10,9,3);
     fallback.generateTexture("skoda-fallback",32,32);
     fallback.destroy();
     carSprite=this.add.image(car.x,car.y,"skoda-fallback").setDepth(6).setDisplaySize(32,72).setRotation(car.angle);
     show("Skoda picture unavailable, but the car can still be driven.");
   }else{
     carSprite=this.add.image(car.x,car.y,"skoda").setDepth(6).setDisplaySize(32,72).setRotation(car.angle);
   }
   vehicleController=new VehicleController(car,carSprite);
   for(const [dir,start] of [["down",0],["up",8],["right",16],["left",24]])this.anims.create({key:"walk-"+dir,frames:this.anims.generateFrameNumbers("maestro",{start,end:start+7}),frameRate:9,repeat:-1});
   keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT,R");
   this.input.keyboard.on("keydown-E",event=>{if(!event.repeat)interact();});
   this.input.keyboard.on("keydown-R",()=>this.respawn());
   this.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
   this.cameras.main.startFollow(character,true,0.13,0.13);
   this.cameras.main.setZoom(2.03);
   this.input.mouse?.disableContextMenu();
   loadOriginalCollision().then(()=>this.respawn());
 }
 respawn(){
   let x=SPAWN.x,y=SPAWN.y;
   if(car.driver){car.driver=false;car.speed=0;car.wheelTurn=0;character.setVisible(true);this.cameras.main.startFollow(character,true,0.13,0.13);}
   car.x=PARKING.x;car.y=PARKING.y;car.frame=3;car.angle=3*Math.PI/4;car.speed=0;car.wheelTurn=0;
   if(carSprite)carSprite.setPosition(car.x,car.y).setRotation(car.angle);
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(_,delta){
   if(!character||!keys)return;
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown)-Number(keys.A.isDown||keys.LEFT.isDown);
   let dy=Number(keys.S.isDown||keys.DOWN.isDown)-Number(keys.W.isDown||keys.UP.isDown);
   const distance=Math.hypot(dx,dy);
   if(car.driver && carSprite){
      const dt=Math.min(.04,delta/1000);
      // Original controls: W throttle, S brake/reverse, A/D steering.
      vehicleController.update(dx,dy,dt);
      carSprite.setPosition(car.x,car.y).setRotation(car.angle);
      coords.textContent="🚗 "+Math.round(car.x)+", "+Math.round(car.y)+" · "+Math.round(Math.abs(car.speed))+" px/s";
   }else{
   }
   const cameraZoom=car.driver?DRIVING_ZOOM:2.03;
   this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom,cameraZoom,Math.min(1,delta/1000*3.5)));
   if(car.driver)return;
   if(distance){
      const amount=(keys.SHIFT.isDown?300:205)*Math.min(0.045,delta/1000);dx=dx/distance*amount;dy=dy/distance*amount;
      if(!intersects(player.x+dx,player.y))player.x+=dx;
      if(!intersects(player.x,player.y+dy))player.y+=dy;
      const face=Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up";
      if(player.face!==face||!character.anims.isPlaying){character.play("walk-"+face,true);player.face=face;}
   }else{character.anims.stop();character.setFrame({down:0,up:8,right:16,left:24}[player.face]??0);}
   character.setPosition(player.x,player.y);
   coords.textContent=Math.round(player.x)+", "+Math.round(player.y);
 }
}
document.getElementById("reset").onclick=()=>scene?.respawn();
new Phaser.Game({type:Phaser.CANVAS,parent:"screen",width:1280,height:720,backgroundColor:"#121926",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Explore],render:{pixelArt:false,antialias:true}});
})();
</script></body></html>`;
export default {
 async fetch(request){
  const url=new URL(request.url);
  if(url.pathname==="/health")return Response.json({ok:true,game:"MaestroEscape",mode:"single-player-with-skoda",vehicle:"Skoda Superb 2.0TDI"});
  if(url.pathname==="/assets/skoda-highres.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/skoda_superb_top.webp");
    if(!upstream.ok)return new Response("Skoda asset unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=86400","x-content-type-options":"nosniff"}});
  }
  return new Response(HTML,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
};
