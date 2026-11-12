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
<header><div><h1>🍻 MAESTRO ESCAPE</h1><p>Original Among Us map & sprites • Single-player exploration</p></div>
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><button id="reset">Respawn</button></div></header>
<div id="screen"><div id="splash">Loading original game map and animated sprites…</div></div>
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows: move &nbsp; <kbd>E</kbd> interact &nbsp; <kbd>SHIFT</kbd> sprint &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Find the jacket, car keys, taxi, car, Bubi, kebab shop or trafik.</span></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const locs=[
 {name:"Jacket",x:3046,y:791,color:0xffc76a,info:"You've found your jacket.",done:false},
 {name:"Car keys",x:3563,y:762,color:0xffc76a,info:"Car keys collected.",done:false},
 {name:"Own car",x:3898,y:791,color:0x82caff,info:"Your car is waiting.",done:false},
 {name:"Taxi",x:4513,y:1525,color:0x82caff,info:"Taxi ordered. Someone will probably try to cancel it.",done:false},
 {name:"Bubi bike",x:3694,y:1942,color:0x82caff,info:"Bubi unlocked. You're finally leaving the pub.",done:false},
 {name:"Kebab shop",x:2220,y:1711,color:0x9de3a2,info:"Kebab acquired. A tactical detour.",done:false},
 {name:"Trafik",x:1887,y:1578,color:0x9de3a2,info:"Quick stop at the trafik.",done:false}
];
const SPAWN={x:3046,y:791};
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:5792,h:3168},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false;
const status=document.getElementById("status"),coords=document.getElementById("coords"),msg=document.getElementById("msg");
function show(text){msg.textContent=text;toastUntil=Date.now()+5000;}
function near(o,x,y,r=78){return Math.hypot(o.x-x,o.y-y)<r;}
function intersects(x,y){const w=19,h=16;return x<35||y<35||x>mapSize.w-35||y>mapSize.h-35||obstacles.some(o=>x+w>o.x&&x-w<o.x+o.w&&y+h>o.y&&y-h<o.y+o.h);}
function interact(){const nearest=locs.reduce((best,v)=>Math.hypot(player.x-v.x,player.y-v.y)<Math.hypot(player.x-best.x,player.y-best.y)?v:best,locs[0]);if(!near(player,nearest.x,nearest.y)){show("Get closer to an interaction marker.");return;}
 if(nearest.name==="Own car"&&!locs[1].done){show("You need the car keys first.");return;}
 if(["Own car","Taxi","Bubi bike"].includes(nearest.name)&&!locs[0].done){show("Find your jacket before you leave.");return;}
 nearest.done=true;show(nearest.info);status.textContent="Interacted with "+nearest.name;
}
async function loadOriginalCollision(){try{
 const response=await fetch(BASE+"Assets/Maps/map.tmx");if(!response.ok)throw new Error("TMX HTTP "+response.status);
 const xml=new DOMParser().parseFromString(await response.text(),"application/xml");
 if(xml.querySelector("parsererror"))throw new Error("Invalid TMX XML");
 const m=xml.querySelector("map");mapSize={w:Number(m.getAttribute("width"))*Number(m.getAttribute("tilewidth")),h:Number(m.getAttribute("height"))*Number(m.getAttribute("tileheight"))};
 const collidable=new Set(["walls","tables","props","generator","medbay_comp","engines","reactor","security_room_comp","admin_btn1","admin_btn2"]);
 obstacles=[...xml.querySelectorAll("objectgroup object")].filter(o=>collidable.has(o.getAttribute("name"))).map(o=>({x:+o.getAttribute("x"),y:+o.getAttribute("y"),w:+o.getAttribute("width"),h:+o.getAttribute("height")})).filter(o=>o.w>0&&o.h>0);
 status.textContent="Map ready · "+obstacles.length+" obstacles";
 }catch(e){console.error(e);status.textContent="Collision loading failed";show("Map is visible, but original wall collisions could not be loaded.");}}
class Explore extends Phaser.Scene{
 constructor(){super("Explore")}
 preload(){
   this.load.crossOrigin="anonymous";
   this.load.image("world",BASE+"Assets/Maps/map2.png");
   for(const dir of ["down","up","left","right"])for(let i=1;i<=6;i++)this.load.image(dir+i,BASE+"Assets/Images/Player/Blue/blue_"+dir+"_walk/step"+i+".png");
   this.load.on("loaderror",file=>{status.textContent="Asset failed: "+file.key;console.error("Missing asset",file.src)});
 }
 create(){
   scene=this;
   const splash=document.getElementById("splash");splash.remove();
   const image=this.add.image(0,0,"world").setOrigin(0,0);
   image.setDepth(0);
   mapSize={w:image.width,h:image.height};
   const gfx=this.add.graphics().setDepth(2);
   for(const p of locs){gfx.fillStyle(p.color,0.3).fillCircle(p.x,p.y,33);gfx.lineStyle(3,p.color,0.95).strokeCircle(p.x,p.y,33);labels.push(this.add.text(p.x,p.y-49,p.name,{fontFamily:"Arial",fontSize:"23px",fontStyle:"bold",color:"#fff6d9",stroke:"#141722",strokeThickness:5}).setOrigin(.5).setDepth(4))}
   character=this.add.sprite(player.x,player.y,"down1").setDepth(5);
   character.setScale(1.4);character.setOrigin(0.5,0.8);
   for(const dir of ["down","up","left","right"])this.anims.create({key:"walk-"+dir,frames:[1,2,3,4,5,6].map(i=>({key:dir+i})),frameRate:12,repeat:-1});
   keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT,R");
   this.input.keyboard.on("keydown-E",interact);
   this.input.keyboard.on("keydown-R",()=>this.respawn());
   this.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
   this.cameras.main.startFollow(character,true,0.13,0.13);
   this.cameras.main.setZoom(1.25);
   this.input.mouse?.disableContextMenu();
   loadOriginalCollision().then(()=>this.respawn());
 }
 respawn(){
   let x=SPAWN.x,y=SPAWN.y;
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(_,delta){
   if(!character||!keys)return;
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown)-Number(keys.A.isDown||keys.LEFT.isDown);
   let dy=Number(keys.S.isDown||keys.DOWN.isDown)-Number(keys.W.isDown||keys.UP.isDown);
   const distance=Math.hypot(dx,dy);
   if(distance){
      const amount=(keys.SHIFT.isDown?300:205)*Math.min(0.045,delta/1000);dx=dx/distance*amount;dy=dy/distance*amount;
      if(!intersects(player.x+dx,player.y))player.x+=dx;
      if(!intersects(player.x,player.y+dy))player.y+=dy;
      const face=Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up";
      if(player.face!==face||!character.anims.isPlaying){character.play("walk-"+face,true);player.face=face;}
   }else{character.anims.stop();character.setTexture(player.face+"1");}
   character.setPosition(player.x,player.y);
   coords.textContent=Math.round(player.x)+", "+Math.round(player.y);
 }
}
document.getElementById("reset").onclick=()=>scene?.respawn();
new Phaser.Game({type:Phaser.CANVAS,parent:"screen",width:1280,height:720,backgroundColor:"#121926",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Explore],render:{pixelArt:true,antialias:false}});
})();
</script></body></html>`;
export default {
 async fetch(request){
  const url=new URL(request.url);
  if(url.pathname==="/health")return Response.json({ok:true,game:"MaestroEscape",mode:"single-player-original-map"});
  return new Response(HTML,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
};
