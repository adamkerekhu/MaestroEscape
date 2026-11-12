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
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows: move &nbsp; <kbd>E</kbd> interact &nbsp; <kbd>SHIFT</kbd> sprint &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Roam around Mester utca and Viola utca.</span></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const locs=[{name:"Maestro Pub",x:825,y:547,color:0xffc76a,info:"Maestro Pub entrance.",done:false}];
const SPAWN={x:859,y:577};
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:1600,h:992},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false,assetFailed=false;
const status=document.getElementById("status"),coords=document.getElementById("coords"),msg=document.getElementById("msg");
function show(text){msg.textContent=text;toastUntil=Date.now()+5000;}
function near(o,x,y,r=78){return Math.hypot(o.x-x,o.y-y)<r;}
function intersects(x,y){const w=19,h=16;return x<35||y<35||x>mapSize.w-35||y>mapSize.h-35||collisionPolygons.some(poly=>[[x,y],[x-w,y-h],[x+w,y-h],[x-w,y+h],[x+w,y+h]].some(p=>insidePolygon(p[0],p[1],poly)));}
function interact(){const nearest=locs.reduce((best,v)=>Math.hypot(player.x-v.x,player.y-v.y)<Math.hypot(player.x-best.x,player.y-best.y)?v:best,locs[0]);if(!near(player,nearest.x,nearest.y)){show("Get closer to an interaction marker.");return;}
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
   for(const dir of ["down","up","left","right"])for(let i=1;i<=6;i++)this.load.image(dir+i,BASE+"Assets/Images/Player/Blue/blue_"+dir+"_walk/step"+i+".png");
   this.load.on("loaderror",file=>{if(file.key==="world")assetFailed=true;status.textContent="Asset failed: "+file.key;console.error("Missing asset",file.src)});
 }
 create(){
   scene=this;
   const splash=document.getElementById("splash");if(assetFailed||!this.textures.exists("world")){splash.textContent="Map failed to load. Check the published map asset.";return;}splash.remove();
   const image=this.add.image(0,0,"world").setOrigin(0,0);
   image.setDepth(0);
   mapSize={w:image.width,h:image.height};
   const gfx=this.add.graphics().setDepth(2);
   for(const p of locs){gfx.fillStyle(p.color,0.3).fillCircle(p.x,p.y,33);gfx.lineStyle(3,p.color,0.95).strokeCircle(p.x,p.y,33);labels.push(this.add.text(p.x,p.y-49,p.name,{fontFamily:"Arial",fontSize:"23px",fontStyle:"bold",color:"#fff6d9",stroke:"#141722",strokeThickness:5}).setOrigin(.5).setDepth(4))}
   character=this.add.sprite(player.x,player.y,"down1").setDepth(5);
   character.setScale(0.38);character.setOrigin(0.5,0.8);
   for(const dir of ["down","up","left","right"])this.anims.create({key:"walk-"+dir,frames:[1,2,3,4,5,6].map(i=>({key:dir+i})),frameRate:12,repeat:-1});
   keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT,R");
   this.input.keyboard.on("keydown-E",interact);
   this.input.keyboard.on("keydown-R",()=>this.respawn());
   this.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
   this.cameras.main.startFollow(character,true,0.13,0.13);
   this.cameras.main.setZoom(1.45);
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
