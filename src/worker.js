// MaestroEscape: single-player browser exploration using the uploaded game's TMX,
// map artwork, collision objects, and character animation frames.
// Original Pygame source remains available in the repository.
const SETTINGS_GROUPS=[{"title":"Characters","description":"Walking, sprinting, animations and size outside.","fields":[{"key":"character.walkSpeed","label":"Walk speed","value":205,"min":60,"max":450,"step":5,"unit":"px/s"},{"key":"character.sprintSpeed","label":"Sprint speed","value":300,"min":80,"max":650,"step":5,"unit":"px/s"},{"key":"character.streetScale","label":"Outside character size","value":0.324,"min":0.1,"max":2.5,"step":0.01,"unit":"×"},{"key":"character.animationFps","label":"Walking animation","value":9,"min":2,"max":24,"step":1,"unit":"fps"}]},{"title":"Buildings · Individual zoom & character size","description":"Each interior is adjusted independently.","fields":[{"key":"building.pub.zoom","label":"Maestro Pub zoom","value":0.825,"min":0.35,"max":3.5,"step":0.025,"unit":"×"},{"key":"building.pub.scale","label":"Maestro Pub character","value":1.296,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.spar.zoom","label":"SPAR zoom","value":1.875,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.spar.scale","label":"SPAR character","value":0.57,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.gyros.zoom","label":"Mester Gyros zoom","value":1.667,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.gyros.scale","label":"Gyros character","value":0.642,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.zoom","label":"Dohánybolt zoom","value":2.105,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.scale","label":"Dohánybolt character","value":0.508,"min":0.2,"max":3,"step":0.025,"unit":"×"}]},{"title":"Vehicles · Appearance","description":"Rendered sizes on the outdoor map.","fields":[{"key":"vehicle.skoda.width","label":"Škoda width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.skoda.length","label":"Škoda length","value":72,"min":30,"max":180,"step":1,"unit":"px"},{"key":"vehicle.octavia.width","label":"Octavia width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.octavia.length","label":"Octavia length","value":64,"min":30,"max":180,"step":1,"unit":"px"}]},{"title":"Vehicles · Driving mechanics","description":"Applies to both cars. Braking, steering and friction can be fine-tuned.","fields":[{"key":"vehicle.acceleration","label":"Acceleration","value":175,"min":20,"max":500,"step":5,"unit":"px/s²"},{"key":"vehicle.topSpeed","label":"Maximum speed","value":245,"min":40,"max":600,"step":5,"unit":"px/s"},{"key":"vehicle.turnRate","label":"Steering sensitivity","value":2,"min":0.2,"max":6,"step":0.1,"unit":"rad/s"},{"key":"vehicle.braking","label":"Braking strength","value":1.65,"min":0.5,"max":4,"step":0.05,"unit":"×"},{"key":"vehicle.drag","label":"Coasting drag","value":1.35,"min":0.1,"max":6,"step":0.05,"unit":"×"}]},{"title":"Tram","description":"How often the tram arrives and how long it takes to cross the map.","fields":[{"key":"tram.interval","label":"Pass frequency","value":20,"min":5,"max":120,"step":1,"unit":"sec"},{"key":"tram.travelTime","label":"Crossing duration","value":14.5,"min":3,"max":30,"step":0.5,"unit":"sec"},{"key":"tram.width","label":"Tram width","value":40,"min":20,"max":110,"step":1,"unit":"px"},{"key":"tram.length","label":"Tram length","value":144,"min":65,"max":360,"step":1,"unit":"px"}]},{"title":"Camera & Interaction","description":"Outdoor view and interaction ranges.","fields":[{"key":"camera.streetZoom","label":"Outdoor zoom","value":2.03,"min":0.5,"max":4.5,"step":0.05,"unit":"×"},{"key":"camera.drivingZoom","label":"Driving zoom","value":1.3804,"min":0.35,"max":4,"step":0.05,"unit":"×"},{"key":"game.interactRadius","label":"Shop entry reach","value":82,"min":30,"max":150,"step":1,"unit":"px"},{"key":"game.vehicleRadius","label":"Vehicle entry reach","value":67,"min":30,"max":150,"step":1,"unit":"px"}]}];
const SETTINGS_DEFAULTS={"character.walkSpeed":205,"character.sprintSpeed":300,"character.streetScale":0.324,"character.animationFps":9,"building.pub.zoom":0.825,"building.pub.scale":1.296,"building.spar.zoom":1.875,"building.spar.scale":0.57,"building.gyros.zoom":1.667,"building.gyros.scale":0.642,"building.dohanybolt.zoom":2.105,"building.dohanybolt.scale":0.508,"vehicle.skoda.width":32,"vehicle.skoda.length":72,"vehicle.octavia.width":32,"vehicle.octavia.length":64,"vehicle.acceleration":175,"vehicle.topSpeed":245,"vehicle.turnRate":2,"vehicle.braking":1.65,"vehicle.drag":1.35,"tram.interval":20,"tram.travelTime":14.5,"tram.width":40,"tram.length":144,"camera.streetZoom":2.03,"camera.drivingZoom":1.3804,"game.interactRadius":82,"game.vehicleRadius":67};
const SETTINGS_HTML=String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroEscape · Game Settings</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#10151f;color:#f4f5f8;font:15px system-ui,Arial}main{max-width:1080px;padding:22px 18px 60px;margin:auto}header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px}h1{color:#ffc773;font-size:25px;margin:0}small,p{color:#aebbd0}button,a{border:1px solid #63748c;border-radius:9px;padding:11px 14px;background:#28344b;color:#fff;cursor:pointer;text-decoration:none;font:inherit}button:hover,a:hover{background:#394d66}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.primary{background:#a46a27;border-color:#d9a85b}.sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,450px),1fr));gap:16px}section{background:#1b2638;border:1px solid #3a485b;border-radius:12px;padding:18px}h2{margin:0 0 5px;font-size:18px;color:#ffce87}.desc{margin:0 0 17px;font-size:13px}.field{margin:0 0 15px}.field-header{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.field-header label{font-weight:600}.valuebox{display:flex;align-items:center;gap:5px}input[type=number]{width:85px;background:#101827;color:#fff;border:1px solid #52647d;border-radius:6px;padding:6px;font:inherit}input[type=range]{width:100%;accent-color:#efb35f;cursor:pointer}.unit{color:#aebbd0;font-size:12px;width:44px}#notice{color:#f6cd86;font-weight:600}footer{padding-top:15px;color:#9aa8bc;font-size:13px}</style></head><body><main><header><div><h1>⚙️ MaestroEscape Settings</h1><p>Configure each part of the game. Settings are saved in this browser.</p></div><div class="toolbar"><a href="/">Back to game</a><button id="defaults">Reset defaults</button><button id="export">Export JSON</button><button id="import">Import JSON</button><input id="file" type="file" accept=".json,application/json" hidden></div></header><p id="notice">Loading settings…</p><div class="sections" id="sections"></div><footer>Changes apply when you return to the game. You can keep a backup using Export JSON. Settings are stored on this device, not in the server.</footer></main><script>
(async()=>{
 const KEY="maestroescape.gameSettings.v1";
 const response=await fetch("/settings/schema",{cache:"no-store"});
 const {groups,defaults}=await response.json();
 let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const root=document.getElementById("sections"),notice=document.getElementById("notice");
 const lookup=Object.fromEntries(groups.flatMap(group=>group.fields.map(field=>[field.key,field])));
 const normalize=data=>Object.fromEntries(Object.entries(lookup).map(([key,field])=>{const v=Number(data[key]);return [key,Number.isFinite(v)?Math.max(field.min,Math.min(field.max,v)):field.value]}));
 let values=normalize({...defaults,...saved});
 function store(){localStorage.setItem(KEY,JSON.stringify(values));notice.textContent="Saved automatically. Return to the game to apply.";}
 function draw(){root.innerHTML="";for(const group of groups){const section=document.createElement("section"),title=document.createElement("h2"),desc=document.createElement("p");title.textContent=group.title;desc.textContent=group.description;desc.className="desc";section.append(title,desc);for(const field of group.fields){const wrap=document.createElement("div");wrap.className="field";const top=document.createElement("div");top.className="field-header";const lab=document.createElement("label");lab.textContent=field.label;const valBox=document.createElement("div");valBox.className="valuebox";const num=document.createElement("input");num.type="number";num.min=field.min;num.max=field.max;num.step=field.step;num.value=values[field.key];num.id="value-"+field.key;lab.htmlFor=num.id;const unit=document.createElement("span");unit.className="unit";unit.textContent=field.unit;valBox.append(num,unit);top.append(lab,valBox);const range=document.createElement("input");range.type="range";range.min=field.min;range.max=field.max;range.step=field.step;range.value=values[field.key];range.setAttribute("aria-label",field.label);const change=(value)=>{if(!Number.isFinite(Number(value)))return;const v=Math.min(field.max,Math.max(field.min,Number(value)));values[field.key]=v;range.value=v;num.value=v;store();};range.addEventListener("input",()=>change(range.value));num.addEventListener("change",()=>change(num.value));wrap.append(top,range);section.append(wrap);}root.append(section)}}
 document.getElementById("defaults").onclick=()=>{if(!confirm("Restore all default game settings?"))return;values=normalize(defaults);store();draw()};
 document.getElementById("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(values,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="maestroescape-settings.json";a.click();URL.revokeObjectURL(url);};
 const file=document.getElementById("file");document.getElementById("import").onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Invalid file");values=normalize({...defaults,...data});store();draw();}catch{notice.textContent="Unable to import: invalid settings JSON."}file.value="";};
 draw();notice.textContent="Changes save automatically.";
})();
</script></body></html>`;
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
a.settings-nav{border:1px solid #59677c;background:#273448;color:white;padding:7px 11px;border-radius:7px;text-decoration:none;white-space:nowrap}
#mobile-controls{display:none;max-width:1360px;margin:10px auto;padding:0 16px;align-items:center;justify-content:space-between;gap:22px;touch-action:none;user-select:none;-webkit-user-select:none}
#mobile-controls .dpad{display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,58px);gap:7px}
#mobile-controls button{width:58px;height:58px;font-size:22px;font-weight:800;border-radius:12px;background:#34445e;border:1px solid #7185a5;color:white;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#mobile-controls button.active{background:#557d9b;transform:scale(.96)}
#mobile-controls .action{width:78px;height:78px;border-radius:50%;background:#b98339;color:#fff;font-size:28px}
@media(max-width:760px){#mobile-controls{display:flex}#instructions>div{display:none}}

</style></head><body>
<header><div><h1>🍻 MAESTRO ESCAPE</h1><p>Maestro Pub · Mester utca × Viola utca · Single-player</p></div>
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><button id="reset">Respawn</button><a class="settings-nav" href="/settings">⚙ Settings</a></div></header>
<div id="screen"><div id="splash">Loading original game map and animated sprites…</div></div>
<div id="mobile-controls" aria-label="Touch game controls">
 <div class="dpad">
  <span></span><button type="button" data-control="w" aria-label="Move up">W</button><span></span>
  <button type="button" data-control="a" aria-label="Move left">A</button>
  <button type="button" data-control="s" aria-label="Move down">S</button>
  <button type="button" data-control="d" aria-label="Move right">D</button>
 </div>
 <button type="button" class="action" data-control="e" aria-label="Interact">E</button>
</div>
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk / W accelerate, S brake/reverse, A/D steer &nbsp; <kbd>E</kbd> enter/exit Skoda &nbsp; <kbd>SHIFT</kbd> sprint on foot &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Walk to Maestro Pub and press E to enter. E at the interior exit returns outside.</span></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const configDefaults=__MAESTRO_DEFAULT_SETTINGS__;
let overrides={};try{const raw=JSON.parse(localStorage.getItem("maestroescape.gameSettings.v1")||"{}");if(raw&&typeof raw==="object")overrides=raw;}catch{}
const cfg=key=>Number.isFinite(Number(overrides[key]))?Number(overrides[key]):configDefaults[key];
const locs=[{name:"Maestro Pub",x:825,y:547,color:0xffc76a,info:"Maestro Pub entrance.",done:false}];
const SPAWN={x:859,y:577};
const PUB_DOOR={x:825,y:547};
const INTERIOR_SPAWN={x:332,y:741},INTERIOR_EXIT={x:153,y:844};
const INTERIOR_SIZE={w:1448,h:1086};
let insidePub=false,streetPos={...SPAWN},streetImage=null,interiorImage=null,exitHint=null,activeShop=null;
const SHOP_NAMES={dohanybolt:"DOHÁNYBOLT",spar:"SPAR",gyros:"MESTER GYROS"};
function shopZoom(shop){const name=Object.keys(SHOPS).find(key=>SHOPS[key]===shop);return cfg("building."+name+".zoom");}
function shopCharacterScale(shop){const name=Object.keys(SHOPS).find(key=>SHOPS[key]===shop);return cfg("building."+name+".scale");}
function setStreetfronts(visible){
 for(const shop of Object.values(SHOPS))if(shop.front)shop.front.setVisible(visible);
}
function addShopfronts(scene){
 const styles={dohanybolt:{color:0x4d4a32,awning:0xf2d48a},spar:{color:0xb52235,awning:0xecebea},gyros:{color:0xb64b2b,awning:0xffc65e}};
 for(const [id,shop] of Object.entries(SHOPS)){
  const st=styles[id],container=scene.add.container(shop.door.x,shop.door.y).setDepth(3);
  const g=scene.add.graphics();
  // Place a compact storefront directly over the existing building's street edge.
  g.fillStyle(0x171b21,0.95).fillRoundedRect(-47,-17,94,34,4);
  g.fillStyle(st.color,1).fillRoundedRect(-44,-15,88,21,3);
  for(let i=0;i<6;i++){g.fillStyle(i%2?0xffffff:st.awning,0.95).fillRect(-44+i*14.7,7,14.7,7);}
  g.fillStyle(0x384955,1).fillRect(-9,14,18,13);
  g.lineStyle(1,0xcad2d6,1).strokeRect(-9,14,18,13);
  const label=scene.add.text(0,-6,SHOP_NAMES[id],{fontFamily:"Arial",fontSize:id==="gyros"?"10px":"12px",fontStyle:"bold",color:"#ffffff",stroke:"#1b1b1b",strokeThickness:2}).setOrigin(.5);
  container.add([g,label]);container.setRotation(-0.35);shop.front=container;
 }
}
const SHOPS={
 dohanybolt:{label:"Nemzeti Dohánybolt",door:{x:355,y:196},size:{w:608,h:832},spawn:{x:260,y:783},exit:{x:260,y:805},image:null,walls:[[22,21,533,14],[18,22,21,673],[550,25,26,702],[29,710,156,32],[427,712,139,29],[58,76,128,605],[183,80,293,160],[171,243,260,152],[342,456,51,150],[447,443,53,172]]},
 spar:{label:"SPAR",door:{x:951,y:635},size:{w:736,h:384},spawn:{x:120,y:288},exit:{x:120,y:310},image:null,walls:[[149,20,536,20],[678,23,26,294],[235,321,446,23],[151,30,24,160],[205,56,147,83],[365,59,175,78],[259,161,140,58],[441,163,153,53],[493,232,121,80]]},
 gyros:{label:"Mester Gyros",door:{x:274,y:194},size:{w:768,h:480},spawn:{x:304,y:444},exit:{x:304,y:466},image:null,walls:[[22,12,678,21],[14,14,21,401],[707,30,24,387],[23,442,207,22],[423,442,287,22],[84,90,484,190],[576,83,107,204],[55,295,138,113],[430,307,110,109],[572,305,98,114]]}
};
const interiorWalls=[
[177,222,490,160],[140,396,136,268],[417,564,163,250],
[717,233,147,119],[682,509,132,154],[965,472,111,152],
[835,449,130,275],[1101,350,279,365],[60,0,785,200],
[1181,0,267,326],[0,0,59,730],[961,843,487,243],
[295,844,665,242],[1381,326,67,400],[295,808,540,32],
[1154,50,26,166],[851,0,329,46],[842,45,26,154]
];
const PARKING={x:697,y:505};
// Uses the same forward-speed / steering model as the original Vehicle.ts controller.
const car={x:PARKING.x,y:PARKING.y,angle:3*Math.PI/4,speed:0,wheelTurn:0,driver:false,frame:3};
const OCTAVIA_PARKING={x:632,y:453};
const octavia={x:OCTAVIA_PARKING.x,y:OCTAVIA_PARKING.y,angle:3*Math.PI/4,speed:0,wheelTurn:0,driver:false};
const DRIVING_ZOOM=()=>cfg("camera.drivingZoom");
let vehicleController=null,octaviaController=null,activeVehicle=null;
let carSprite=null,octaviaSprite=null,tramSprite=null;
const tramRunMs=()=>Math.min(cfg("tram.travelTime"),cfg("tram.interval")*0.95)*1000;
const tramPeriodMs=()=>cfg("tram.interval")*1000;
const TRAM_START={x:-175,y:-110},TRAM_END={x:1360,y:1150};
const TRAM_ANGLE=Math.atan2(TRAM_END.x-TRAM_START.x,-(TRAM_END.y-TRAM_START.y));
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:1600,h:992},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false,assetFailed=false;
const touchInput={w:false,a:false,s:false,d:false};
for(const button of document.querySelectorAll("#mobile-controls button")){
 const code=button.dataset.control;
 const release=event=>{if(code!=="e"){touchInput[code]=false;button.classList.remove("active");}event.preventDefault();};
 button.addEventListener("pointerdown",event=>{
  event.preventDefault();
  button.setPointerCapture(event.pointerId);
  if(code==="e"){if(scene)interact();return;}
  touchInput[code]=true;button.classList.add("active");
 });
 for(const type of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(type,release);
}

const status=document.getElementById("status"),coords=document.getElementById("coords"),msg=document.getElementById("msg");
function show(text){msg.textContent=text;toastUntil=Date.now()+5000;}
function near(o,x,y,r=78){return Math.hypot(o.x-x,o.y-y)<r;}
function intersects(x,y){
 const w=13,h=11;
 if(x<25||y<25||x>mapSize.w-25||y>mapSize.h-25)return true;
 if(insidePub)return (activeShop?activeShop.walls:interiorWalls).some(([bx,by,bw,bh])=>x+w>bx&&x-w<bx+bw&&y+h>by&&y-h<by+bh);
 return collisionPolygons.some(poly=>[[x,y],[x-w,y-h],[x+w,y-h],[x-w,y+h],[x+w,y+h]].some(p=>insidePolygon(p[0],p[1],poly)));
}
function enterShop(shop){
 if(!shop.image){show(shop.label+" map is loading. Please try again.");return;}
 if(activeVehicle){show("Exit the vehicle first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;activeShop=shop;
 character.setScale(shopCharacterScale(shop));mapSize={...shop.size};
 streetImage.setVisible(false);setStreetfronts(false);if(interiorImage)interiorImage.setVisible(false);
 for(const other of Object.values(SHOPS))if(other.image)other.image.setVisible(other===shop);
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 player.x=shop.spawn.x;player.y=shop.spawn.y;character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,shop.size.w,shop.size.h);scene.cameras.main.setZoom(shopZoom(shop));
 status.textContent="Inside "+shop.label;
 show("Inside "+shop.label+". Press E near the entrance to exit.");
}
function enterPub(){
 if(!interiorImage){show("Interior map could not be loaded.");return;}
 if(car.driver){show("Exit the Skoda first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;activeShop=null;
 character.setScale(cfg("building.pub.scale"));
 mapSize={...INTERIOR_SIZE};
 streetImage.setVisible(false);setStreetfronts(false);interiorImage.setVisible(true);
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 player.x=INTERIOR_SPAWN.x;player.y=INTERIOR_SPAWN.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,INTERIOR_SIZE.w,INTERIOR_SIZE.h);
 scene.cameras.main.setZoom(cfg("building.pub.zoom"));
 status.textContent="Inside Maestro Pub";
 show("You're inside! Walk around. Press E near the bottom-left exit to leave.");
}
function leavePub(){
 insidePub=false;activeShop=null;character.setScale(cfg("character.streetScale"));mapSize={w:1600,h:992};
 for(const shop of Object.values(SHOPS))if(shop.image)shop.image.setVisible(false);
 interiorImage.setVisible(false);streetImage.setVisible(true);setStreetfronts(true);
 if(carSprite)carSprite.setVisible(true);
 if(octaviaSprite)octaviaSprite.setVisible(true);
 if(tramSprite)tramSprite.setVisible(true);
 if(exitHint)exitHint.setVisible(false);
 player.x=streetPos.x;player.y=streetPos.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,1600,992);
 scene.cameras.main.setZoom(cfg("camera.streetZoom"));
 status.textContent="Outside Maestro Pub";
 show("Back on Mester utca.");
}
function enterOrExitCar(){
 if(!activeVehicle){
  const options=[{model:car,sprite:carSprite,label:"Skoda Superb 2.0TDI"},{model:octavia,sprite:octaviaSprite,label:"Octavia Checkengine"}]
    .filter(o=>o.sprite).sort((a,b)=>Math.hypot(player.x-a.model.x,player.y-a.model.y)-Math.hypot(player.x-b.model.x,player.y-b.model.y));
  const choice=options[0];
  if(!choice||!near(player,choice.model.x,choice.model.y,cfg("game.vehicleRadius"))){show("Walk closer to a car.");return;}
  activeVehicle=choice.model;
  choice.model.driver=true;choice.model.speed=0;choice.model.wheelTurn=0;character.setVisible(false);
  scene.cameras.main.startFollow(choice.sprite,true,0.13,0.13);
  status.textContent="Driving: "+choice.label;
  show(choice.label+" · W accelerate · S brake/reverse · A/D steer · E exit.");
 }else{
  const vehicle=activeVehicle;
  const offsets=[[41,0],[-41,0],[0,43],[0,-43],[40,35],[-40,35]];
  const pos=offsets.map(([x,y])=>({x:vehicle.x+x,y:vehicle.y+y})).find(p=>!intersects(p.x,p.y));
  if(!pos){show("No safe space to exit. Drive a little farther.");return;}
  vehicle.driver=false;vehicle.speed=0;vehicle.wheelTurn=0;activeVehicle=null;
  player.x=pos.x;player.y=pos.y;character.setPosition(player.x,player.y).setVisible(true);
  scene.cameras.main.startFollow(character,true,0.13,0.13);
  status.textContent="On foot";
  show("Exited the car. Press E near a vehicle to drive.");
 }
}
// VehicleController ported from KulturalisDigitalisPolgariKor/src/entities/Vehicle.ts.
// Throttle/brake/reverse, speed-dependent steering, grip and friction use the original
// model; its city geometry collision check is adapted for MaestroEscape polygons.
class VehicleController {
 constructor(vehicle,sprite){this.vehicle=vehicle;this.sprite=sprite;}
 update(inputX,inputY,dt){
  const v=this.vehicle;
  const acceleration=cfg("vehicle.acceleration"),maxSpeed=cfg("vehicle.topSpeed");
  if(inputY<-.1)v.speed+=acceleration*dt;
  else if(inputY>.1)v.speed-=acceleration*dt*(v.speed>0?cfg("vehicle.braking"):.65);
  else v.speed*=Math.max(0,1-cfg("vehicle.drag")*dt);
  v.speed=Phaser.Math.Clamp(v.speed,-maxSpeed*.33,maxSpeed);
  const steer=Phaser.Math.Clamp(inputX,-1,1);
  if(Math.abs(v.speed)>1){
   v.wheelTurn=Phaser.Math.Linear(v.wheelTurn,steer,Math.min(1,dt*5));
   const grip=Phaser.Math.Clamp(Math.abs(v.speed)/75,.2,1);
   v.angle+=v.wheelTurn*cfg("vehicle.turnRate")*dt*grip*Math.sign(v.speed);
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
function interact(){
 if(insidePub){
  const exit=activeShop?activeShop.exit:INTERIOR_EXIT;
  if(near(player,exit.x,exit.y,96))leavePub();
  else show("Return to the entrance and press E to exit.");
  return;
 }
 if(activeVehicle || near(player,car.x,car.y,cfg("game.vehicleRadius")) || near(player,octavia.x,octavia.y,cfg("game.vehicleRadius"))){enterOrExitCar();return;}
 if(near(player,PUB_DOOR.x,PUB_DOOR.y,cfg("game.interactRadius"))){enterPub();return;}
 for(const shop of Object.values(SHOPS))if(near(player,shop.door.x,shop.door.y,cfg("game.interactRadius"))){enterShop(shop);return;}const nearest=locs.reduce((best,v)=>Math.hypot(player.x-v.x,player.y-v.y)<Math.hypot(player.x-best.x,player.y-best.y)?v:best,locs[0]);if(!near(player,nearest.x,nearest.y)){show("Get closer to an interaction marker.");return;}
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
   this.load.image("interior","/assets/interior.webp");
   for(const name of Object.keys(SHOPS))this.load.image("shop_"+name,"/assets/shop-"+name+".webp");
   this.load.spritesheet("maestro","https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/Assets/Characters/maestro_walk.webp",{frameWidth:80,frameHeight:120});
   this.load.image("skoda","/assets/skoda-highres.webp");
   this.load.image("octavia","/assets/octavia.webp");
   this.load.image("tram","/assets/tram.webp");
   this.load.on("loaderror",file=>{if(file.key==="world")assetFailed=true;if(file.key==="interior")console.warn("Interior image failed");if(file.key==="skoda")show("Skoda image failed to load. Displaying fallback car.");status.textContent="Asset failed: "+file.key;console.error("Missing asset",file.src)});
 }
 create(){
   scene=this;
   const splash=document.getElementById("splash");if(assetFailed||!this.textures.exists("world")){splash.textContent="Map failed to load. Check the published map asset.";return;}splash.remove();
   const image=this.add.image(0,0,"world").setOrigin(0,0);
   streetImage=image.setDepth(0);
   if(this.textures.exists("interior")){
     interiorImage=this.add.image(0,0,"interior").setOrigin(0,0)
       .setDisplaySize(INTERIOR_SIZE.w,INTERIOR_SIZE.h).setDepth(1).setVisible(false);
     exitHint=this.add.text(INTERIOR_EXIT.x+22,INTERIOR_EXIT.y-30,"EXIT [E]",
       {fontFamily:"Arial",fontSize:"20px",fontStyle:"bold",color:"#fff5cf",
       stroke:"#151013",strokeThickness:4}).setDepth(8).setVisible(false);
   }
   addShopfronts(this);
   for(const [name,shop] of Object.entries(SHOPS)){
     if(this.textures.exists("shop_"+name)){
       shop.image=this.add.image(0,0,"shop_"+name).setOrigin(0,0)
          .setDisplaySize(shop.size.w,shop.size.h).setDepth(1).setVisible(false);
     }
   }
   mapSize={w:image.width,h:image.height};
   const gfx=this.add.graphics().setDepth(2);
   // Pub interaction remains active, without the visual marker.
   character=this.add.sprite(player.x,player.y,"maestro",0).setDepth(5);
   character.setScale(cfg("character.streetScale"));character.setOrigin(0.5,1.0);
   if(!this.textures.exists("skoda")){
     // Render an obvious, interactable placeholder if the remote image fails.
     const fallback=this.make.graphics({x:0,y:0},false);
     fallback.fillStyle(0x15263b,0.9).fillRoundedRect(7,1,18,30,5);
     fallback.fillStyle(0x50a9e8,1).fillRoundedRect(10,5,12,22,4);
     fallback.fillStyle(0xa9defb,1).fillRoundedRect(11,9,10,9,3);
     fallback.generateTexture("skoda-fallback",32,32);
     fallback.destroy();
     carSprite=this.add.image(car.x,car.y,"skoda-fallback").setDepth(6).setDisplaySize(cfg("vehicle.skoda.width"),cfg("vehicle.skoda.length")).setRotation(car.angle);
     show("Skoda picture unavailable, but the car can still be driven.");
   }else{
     carSprite=this.add.image(car.x,car.y,"skoda").setDepth(6).setDisplaySize(32,72).setRotation(car.angle);
   }
   vehicleController=new VehicleController(car,carSprite);
   if(this.textures.exists("octavia")){
     octaviaSprite=this.add.image(octavia.x,octavia.y,"octavia").setDepth(6)
       .setDisplaySize(cfg("vehicle.octavia.width"),cfg("vehicle.octavia.length")).setRotation(octavia.angle);
     octaviaController=new VehicleController(octavia,octaviaSprite);
   }
   if(this.textures.exists("tram")){
     tramSprite=this.add.image(TRAM_START.x,TRAM_START.y,"tram").setDepth(4)
       .setDisplaySize(cfg("tram.width"),cfg("tram.length")).setRotation(TRAM_ANGLE);
   }
   for(const [dir,start] of [["down",0],["up",8],["right",16],["left",24]])this.anims.create({key:"walk-"+dir,frames:this.anims.generateFrameNumbers("maestro",{start,end:start+7}),frameRate:cfg("character.animationFps"),repeat:-1});
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
   if(activeVehicle){activeVehicle.driver=false;activeVehicle.speed=0;activeVehicle.wheelTurn=0;activeVehicle=null;character.setVisible(true);this.cameras.main.startFollow(character,true,0.13,0.13);}
   car.x=PARKING.x;car.y=PARKING.y;car.frame=3;car.angle=3*Math.PI/4;car.speed=0;car.wheelTurn=0;
   octavia.x=OCTAVIA_PARKING.x;octavia.y=OCTAVIA_PARKING.y;octavia.angle=3*Math.PI/4;octavia.speed=0;octavia.wheelTurn=0;
   if(octaviaSprite)octaviaSprite.setPosition(octavia.x,octavia.y).setRotation(octavia.angle);
   if(carSprite)carSprite.setPosition(car.x,car.y).setRotation(car.angle);
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(time,delta){
   if(!character||!keys)return;
   // The tram passes the two tracks once every 20 seconds.
   if(tramSprite){
     const phase=time%tramPeriodMs();
     if(phase<tramRunMs()&&!insidePub){
       const t=phase/tramRunMs();
       tramSprite.setPosition(Phaser.Math.Linear(TRAM_START.x,TRAM_END.x,t),
                              Phaser.Math.Linear(TRAM_START.y,TRAM_END.y,t))
         .setRotation(TRAM_ANGLE).setVisible(true);
     }else tramSprite.setVisible(false);
   }
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown||touchInput.d)-Number(keys.A.isDown||keys.LEFT.isDown||touchInput.a);
   let dy=Number(keys.S.isDown||keys.DOWN.isDown||touchInput.s)-Number(keys.W.isDown||keys.UP.isDown||touchInput.w);
   const distance=Math.hypot(dx,dy);
   if(activeVehicle){
     const sprite=activeVehicle===car?carSprite:octaviaSprite;
     const controller=activeVehicle===car?vehicleController:octaviaController;
     if(sprite&&controller){
       controller.update(dx,dy,Math.min(.04,delta/1000));
       sprite.setPosition(activeVehicle.x,activeVehicle.y).setRotation(activeVehicle.angle);
       coords.textContent="🚗 "+Math.round(activeVehicle.x)+", "+Math.round(activeVehicle.y)+" · "+Math.round(Math.abs(activeVehicle.speed))+" px/s";
     }
   }
   const cameraZoom=insidePub?(activeShop?shopZoom(activeShop):cfg("building.pub.zoom")):activeVehicle?DRIVING_ZOOM():cfg("camera.streetZoom");
   this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom,cameraZoom,Math.min(1,delta/1000*3.5)));
   if(activeVehicle)return;
   if(exitHint)exitHint.setVisible(insidePub && !activeShop && near(player,INTERIOR_EXIT.x,INTERIOR_EXIT.y,135));
   if(distance){
      const amount=(keys.SHIFT.isDown?cfg("character.sprintSpeed"):cfg("character.walkSpeed"))*Math.min(0.045,delta/1000);dx=dx/distance*amount;dy=dy/distance*amount;
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
  if(url.pathname==="/settings")return new Response(SETTINGS_HTML,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
  if(url.pathname==="/settings/schema")return Response.json({groups:SETTINGS_GROUPS,defaults:SETTINGS_DEFAULTS});
  if(url.pathname==="/health")return Response.json({ok:true,game:"MaestroEscape",mode:"single-player-with-skoda",vehicle:"Skoda Superb 2.0TDI"});
  if(/^\/assets\/shop-(dohanybolt|spar|gyros)\.webp$/.test(url.pathname)){
    const shopName=url.pathname.slice(13,-5);
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/shops/"+shopName+".webp");
    if(!upstream.ok)return new Response("Shop map unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
  }
  if(url.pathname==="/assets/octavia.webp" || url.pathname==="/assets/tram.webp"){
    const vehicle=url.pathname==="/assets/octavia.webp"?"octavia":"tram";
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/"+vehicle+".webp");
    if(!upstream.ok)return new Response("Vehicle asset unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=600"}});
  }
  if(url.pathname==="/assets/interior.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/maestro_interior.webp");
    if(!upstream.ok)return new Response("Interior image unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=3600","x-content-type-options":"nosniff"}});
  }
  if(url.pathname==="/assets/skoda-highres.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/skoda_superb_top.webp");
    if(!upstream.ok)return new Response("Skoda asset unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=86400","x-content-type-options":"nosniff"}});
  }
  return new Response(HTML.replace("__MAESTRO_DEFAULT_SETTINGS__",JSON.stringify(SETTINGS_DEFAULTS)),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
};
