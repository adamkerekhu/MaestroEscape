// MaestroEscape: single-player browser exploration using the uploaded game's TMX,
// map artwork, collision objects, and character animation frames.
// Original Pygame source remains available in the repository.
const SETTINGS_GROUPS=[{"title":"Characters","description":"Walking, sprinting, animations and size outside.","fields":[{"key":"character.walkSpeed","label":"Walk speed","value":205,"min":60,"max":450,"step":5,"unit":"px/s"},{"key":"character.sprintSpeed","label":"Sprint speed","value":300,"min":80,"max":650,"step":5,"unit":"px/s"},{"key":"character.streetScale","label":"Outside character size","value":0.324,"min":0.1,"max":2.5,"step":0.01,"unit":"×"},{"key":"character.animationFps","label":"Walking animation","value":9,"min":2,"max":24,"step":1,"unit":"fps"}]},{"title":"Buildings · Individual zoom & character size","description":"Each interior is adjusted independently.","fields":[{"key":"building.pub.zoom","label":"Maestro Pub zoom","value":0.825,"min":0.35,"max":3.5,"step":0.025,"unit":"×"},{"key":"building.pub.scale","label":"Maestro Pub character","value":1.296,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.spar.zoom","label":"SPAR zoom","value":1.875,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.spar.scale","label":"SPAR character","value":0.57,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.gyros.zoom","label":"Mester Gyros zoom","value":1.667,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.gyros.scale","label":"Gyros character","value":0.642,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.zoom","label":"Dohánybolt zoom","value":2.105,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.scale","label":"Dohánybolt character","value":0.508,"min":0.2,"max":3,"step":0.025,"unit":"×"}]},{"title":"Vehicles · Appearance","description":"Rendered sizes on the outdoor map.","fields":[{"key":"vehicle.skoda.width","label":"Škoda width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.skoda.length","label":"Škoda length","value":72,"min":30,"max":180,"step":1,"unit":"px"},{"key":"vehicle.octavia.width","label":"Octavia width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.octavia.length","label":"Octavia length","value":64,"min":30,"max":180,"step":1,"unit":"px"}]},{"title":"Vehicle starting positions","description":"Use the map placement editor above to drag or rotate each vehicle; coordinates are shared across devices.","fields":[{"key":"vehicle.skoda.spawnX","label":"Skoda starting X","value":697,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.skoda.spawnY","label":"Skoda starting Y","value":505,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.skoda.angle","label":"Skoda angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.octavia.spawnX","label":"Octavia starting X","value":632,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.octavia.spawnY","label":"Octavia starting Y","value":453,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.octavia.angle","label":"Octavia angle","value":135,"min":0,"max":359,"step":1,"unit":"°"}]},{"title":"Vehicles · Driving mechanics","description":"Applies to both cars. Braking, steering and friction can be fine-tuned.","fields":[{"key":"vehicle.acceleration","label":"Acceleration","value":175,"min":20,"max":500,"step":5,"unit":"px/s²"},{"key":"vehicle.topSpeed","label":"Maximum speed","value":245,"min":40,"max":600,"step":5,"unit":"px/s"},{"key":"vehicle.turnRate","label":"Steering sensitivity","value":2,"min":0.2,"max":6,"step":0.1,"unit":"rad/s"},{"key":"vehicle.braking","label":"Braking strength","value":1.65,"min":0.5,"max":4,"step":0.05,"unit":"×"},{"key":"vehicle.drag","label":"Coasting drag","value":1.35,"min":0.1,"max":6,"step":0.05,"unit":"×"}]},{"title":"Tram","description":"Tram passes on the tracks, pauses 3 seconds at the stop, then continues.","fields":[{"key":"tram.interval","label":"Pass frequency","value":20,"min":5,"max":120,"step":1,"unit":"sec"},{"key":"tram.travelTime","label":"Crossing duration","value":14.5,"min":3,"max":30,"step":0.5,"unit":"sec"},{"key":"tram.width","label":"Tram width","value":40,"min":20,"max":110,"step":1,"unit":"px"},{"key":"tram.length","label":"Tram length","value":144,"min":65,"max":360,"step":1,"unit":"px"}]},{"title":"Camera & Interaction","description":"Outdoor view and interaction ranges.","fields":[{"key":"camera.streetZoom","label":"Outdoor zoom","value":2.03,"min":0.5,"max":4.5,"step":0.05,"unit":"×"},{"key":"camera.drivingZoom","label":"Driving zoom","value":1.3804,"min":0.35,"max":4,"step":0.05,"unit":"×"},{"key":"game.interactRadius","label":"Shop entry reach","value":82,"min":30,"max":150,"step":1,"unit":"px"},{"key":"game.vehicleRadius","label":"Vehicle entry reach","value":67,"min":30,"max":150,"step":1,"unit":"px"}]}];
const SETTINGS_DEFAULTS={"character.walkSpeed":205,"character.sprintSpeed":300,"character.streetScale":0.324,"character.animationFps":9,"building.pub.zoom":0.825,"building.pub.scale":1.296,"building.spar.zoom":1.875,"building.spar.scale":0.57,"building.gyros.zoom":1.667,"building.gyros.scale":0.642,"building.dohanybolt.zoom":2.105,"building.dohanybolt.scale":0.508,"vehicle.skoda.width":32,"vehicle.skoda.length":72,"vehicle.octavia.width":32,"vehicle.octavia.length":64,"vehicle.acceleration":175,"vehicle.topSpeed":245,"vehicle.turnRate":2,"vehicle.braking":1.65,"vehicle.drag":1.35,"tram.interval":20,"tram.travelTime":14.5,"tram.width":40,"tram.length":144,"camera.streetZoom":2.03,"camera.drivingZoom":1.3804,"game.interactRadius":82,"game.vehicleRadius":67,"vehicle.skoda.spawnX":697,"vehicle.skoda.spawnY":505,"vehicle.skoda.angle":135,"vehicle.octavia.spawnX":632,"vehicle.octavia.spawnY":453,"vehicle.octavia.angle":135};
const SETTINGS_HTML=String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroEscape · Game Settings</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#10151f;color:#f4f5f8;font:15px system-ui,Arial}main{max-width:1080px;padding:22px 18px 60px;margin:auto}header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px}h1{color:#ffc773;font-size:25px;margin:0}small,p{color:#aebbd0}button,a{border:1px solid #63748c;border-radius:9px;padding:11px 14px;background:#28344b;color:#fff;cursor:pointer;text-decoration:none;font:inherit}button:hover,a:hover{background:#394d66}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.primary{background:#a46a27;border-color:#d9a85b}.sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,450px),1fr));gap:16px}section{background:#1b2638;border:1px solid #3a485b;border-radius:12px;padding:18px}h2{margin:0 0 5px;font-size:18px;color:#ffce87}.desc{margin:0 0 17px;font-size:13px}.field{margin:0 0 15px}.field-header{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.field-header label{font-weight:600}.valuebox{display:flex;align-items:center;gap:5px}input[type=number]{width:85px;background:#101827;color:#fff;border:1px solid #52647d;border-radius:6px;padding:6px;font:inherit}input[type=range]{width:100%;accent-color:#efb35f;cursor:pointer}.unit{color:#aebbd0;font-size:12px;width:44px}#notice{color:#f6cd86;font-weight:600}footer{padding-top:15px;color:#9aa8bc;font-size:13px}#vehicle-editor{margin:0 0 20px;padding:18px;border:1px solid #465a73;border-radius:12px;background:#1b2638}#vehicle-editor h2{margin:0 0 8px}#parking-map{display:block;width:100%;height:auto;aspect-ratio:1600/992;touch-action:none;background:#253347;border:1px solid #58677d;border-radius:8px;cursor:grab}#parking-map.dragging{cursor:grabbing}.parking-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0}.parking-toolbar label{display:flex;align-items:center;gap:7px}.parking-toolbar select{background:#182337;color:#fff;border:1px solid #58677d;padding:8px;border-radius:7px}.parking-toolbar input[type=range]{width:min(240px,45vw)}#parking-info{font-size:13px;color:#cbd7e8}.parking-hint{font-size:13px;color:#b5c0d0}</style></head><body><main><header><div><h1>⚙️ MaestroEscape Settings</h1><p>Configure each part of the game. Settings are shared across every device.</p></div><div class="toolbar"><a href="/">Back to game</a><button id="defaults">Reset defaults</button><button id="local-import">Use old device settings</button><button id="export">Export JSON</button><button id="import">Import JSON</button><input id="file" type="file" accept=".json,application/json" hidden></div></header><p id="notice">Loading settings…</p><section id="vehicle-editor"><h2>Park the cars on the map</h2><p class="parking-hint">Select a car, drag it to the starting place, and use the angle slider to rotate it. Saved placements are shared across all devices.</p>
<canvas id="parking-map" width="1600" height="992" aria-label="Drag vehicle positions on the map"></canvas>
<div class="parking-toolbar"><label>Vehicle <select id="parking-choice"><option value="skoda">Skoda Superb</option><option value="octavia">Octavia Checkengine</option></select></label><label>Rotation <input id="parking-angle" type="range" min="0" max="359" step="1"></label><strong id="parking-angle-text"></strong><button id="parking-save" class="primary">Save positions to all devices</button></div><p id="parking-info"></p></section><div class="sections" id="sections"></div><footer>Changes apply when you return to the game. You can keep a backup using Export JSON. Settings are stored centrally in Cloudflare and loaded by all devices.</footer></main><script>
(async()=>{
 const KEY="maestroescape.gameSettings.v1";
 const response=await fetch("/settings/schema",{cache:"no-store"});
 const {groups,defaults}=await response.json();

 let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const root=document.getElementById("sections"),notice=document.getElementById("notice");
 const lookup=Object.fromEntries(groups.flatMap(group=>group.fields.map(field=>[field.key,field])));
 const normalize=data=>Object.fromEntries(Object.entries(lookup).map(([key,field])=>{const v=Number(data[key]);return [key,Number.isFinite(v)?Math.max(field.min,Math.min(field.max,v)):field.value]}));
 let values=normalize(defaults),lastPersisted=JSON.stringify(values),saveHandle=0,savePromise=Promise.resolve(),storageReady=false;
 try {
   const remote=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Cloud settings unavailable: HTTP "+r.status);return r.json()});
   values=normalize({...defaults,...remote.settings});
   lastPersisted=JSON.stringify(values);
   storageReady=true;
   // Never overwrite shared settings with another device\u0027s local cache.
 }catch(error){notice.textContent="Shared storage error: "+error.message;console.error(error);}
 async function push(force=false){
   clearTimeout(saveHandle);
   const payload=JSON.stringify(values);
   if(!force&&payload===lastPersisted)return savePromise;
   // Sequence writes so a previous delayed request cannot overwrite a newer vehicle position.
   const execute=async()=>{
     notice.textContent="Saving settings to Cloudflare…";
     try{
       const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:payload,cache:"no-store"});
       if(!response.ok)throw new Error("server returned "+response.status+": "+(await response.text()).slice(0,120));
       const committed=await response.json();
       if(!committed.ok)throw new Error("server did not confirm the save");
       const check=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store",headers:{"Cache-Control":"no-store"}});
       if(!check.ok)throw new Error("verification returned "+check.status);
       const persisted=await check.json();
       const expected=JSON.parse(payload);
       const keys=["vehicle.skoda.spawnX","vehicle.skoda.spawnY","vehicle.skoda.angle","vehicle.octavia.spawnX","vehicle.octavia.spawnY","vehicle.octavia.angle"];
       if(keys.some(key=>Number(persisted.settings?.[key])!==Number(expected[key])))
         throw new Error("saved positions do not match the server");
       lastPersisted=payload;
       try{localStorage.setItem(KEY,payload)}catch(error){console.warn("Local backup unavailable",error)}
       storageReady=true;
       notice.textContent="✓ Verified and saved for all devices. Reload the game to use these locations.";
       return true;
     }catch(error){
       notice.textContent="Could not save: "+error.message+". Positions are NOT saved yet.";
       console.error("Shared settings save failure",error);
       return false;
     }
   };
   savePromise=savePromise.then(execute,execute);
   return savePromise;
 }
 function store(){notice.textContent="Unsaved changes…";clearTimeout(saveHandle);saveHandle=setTimeout(()=>void push(),600);}
 function draw(){root.innerHTML="";for(const group of groups){const section=document.createElement("section"),title=document.createElement("h2"),desc=document.createElement("p");title.textContent=group.title;desc.textContent=group.description;desc.className="desc";section.append(title,desc);for(const field of group.fields){const wrap=document.createElement("div");wrap.className="field";const top=document.createElement("div");top.className="field-header";const lab=document.createElement("label");lab.textContent=field.label;const valBox=document.createElement("div");valBox.className="valuebox";const num=document.createElement("input");num.type="number";num.min=field.min;num.max=field.max;num.step=field.step;num.value=values[field.key];num.id="value-"+field.key;lab.htmlFor=num.id;const unit=document.createElement("span");unit.className="unit";unit.textContent=field.unit;valBox.append(num,unit);top.append(lab,valBox);const range=document.createElement("input");range.type="range";range.min=field.min;range.max=field.max;range.step=field.step;range.value=values[field.key];range.setAttribute("aria-label",field.label);const change=(value)=>{if(!Number.isFinite(Number(value)))return;const v=Math.min(field.max,Math.max(field.min,Number(value)));values[field.key]=v;range.value=v;num.value=v;store();};range.addEventListener("input",()=>change(range.value));num.addEventListener("change",()=>change(num.value));wrap.append(top,range);section.append(wrap);}root.append(section)}}

 const canvas=document.getElementById("parking-map"),context=canvas.getContext("2d");
 const carIds=["skoda","octavia"];
 const images={};
 const background=new Image();background.onload=drawParking;background.src="/assets/world.webp";
 for(const [id,url] of [["skoda","/assets/skoda-highres.webp"],["octavia","/assets/octavia.webp"]]){
   const img=new Image();images[id]=img;img.onload=drawParking;img.onerror=drawParking;img.src=url;
 }
 const selection=document.getElementById("parking-choice"),angleSlider=document.getElementById("parking-angle");
 const angleText=document.getElementById("parking-angle-text"),positionText=document.getElementById("parking-info");
 let dragging=null,dragged=false;
 function vehiclePoint(id){return {x:values["vehicle."+id+".spawnX"],y:values["vehicle."+id+".spawnY"],angle:values["vehicle."+id+".angle"]};}
 function drawParking(){
   context.clearRect(0,0,1600,992);
   if(background.complete&&background.naturalWidth)context.drawImage(background,0,0,1600,992);
   else{context.fillStyle="#263346";context.fillRect(0,0,1600,992);context.fillStyle="#fff";context.font="28px Arial";context.fillText("Loading map...",40,55);}
   for(const id of carIds){
     const pos=vehiclePoint(id),selected=selection.value===id,img=images[id];
     context.save();context.translate(pos.x,pos.y);context.rotate(pos.angle*Math.PI/180);
     const width=values["vehicle."+id+".width"],length=values["vehicle."+id+".length"];
     if(img&&img.complete&&img.naturalWidth)context.drawImage(img,-width/2,-length/2,width,length);
     else{context.fillStyle=id==="skoda"?"#e1e8f1":"#d0dde7";context.fillRect(-width/2,-length/2,width,length);context.fillStyle="#374558";context.fillRect(-width*.35,-length*.19,width*.7,length*.4);}
     context.restore();
     context.beginPath();context.arc(pos.x,pos.y,selected?Math.max(29,width*.65):Math.max(20,width*.5),0,Math.PI*2);
     context.strokeStyle=selected?"#ffe36d":"#53ffce";context.lineWidth=selected?5:3;context.stroke();
     context.font="bold 22px system-ui";context.lineWidth=4;context.strokeStyle="#1b2638";context.textAlign="center";
     context.strokeText(id==="skoda"?"SKODA":"OCTAVIA",pos.x,pos.y-62);
     context.fillStyle="#ffffff";context.fillText(id==="skoda"?"SKODA":"OCTAVIA",pos.x,pos.y-62);
   }
   const selected=vehiclePoint(selection.value);
   angleSlider.value=selected.angle;angleText.textContent=selected.angle+"°";
   positionText.textContent="Position: X "+Math.round(selected.x)+", Y "+Math.round(selected.y)+" · Angle: "+selected.angle+"°";
 }
 function canvasPoint(ev){const rect=canvas.getBoundingClientRect();return {x:(ev.clientX-rect.left)*1600/rect.width,y:(ev.clientY-rect.top)*992/rect.height};}
 canvas.addEventListener("pointerdown",event=>{
   event.preventDefault();
   const p=canvasPoint(event);const nearest=carIds.map(id=>({id,d:Math.hypot(p.x-vehiclePoint(id).x,p.y-vehiclePoint(id).y)})).sort((a,b)=>a.d-b.d)[0];
   dragging=nearest&&nearest.d<100?nearest.id:selection.value;dragged=false;selection.value=dragging;
   canvas.setPointerCapture(event.pointerId);canvas.classList.add("dragging");drawParking();
 });
 canvas.addEventListener("pointermove",event=>{
   if(!dragging)return;event.preventDefault();const p=canvasPoint(event);
   values["vehicle."+dragging+".spawnX"]=Math.round(Math.max(0,Math.min(1600,p.x)));
   values["vehicle."+dragging+".spawnY"]=Math.round(Math.max(0,Math.min(992,p.y)));
   dragged=true;drawParking();
 });
 const stopDrag=()=>{if(!dragging)return;dragging=null;canvas.classList.remove("dragging");if(dragged){store();draw();drawParking();}dragged=false;};
 canvas.addEventListener("pointerup",stopDrag);canvas.addEventListener("pointercancel",stopDrag);canvas.addEventListener("lostpointercapture",stopDrag);
 selection.addEventListener("change",drawParking);
 angleSlider.addEventListener("input",()=>{values["vehicle."+selection.value+".angle"]=Number(angleSlider.value);drawParking();});
 angleSlider.addEventListener("change",()=>{store();draw();});
 document.getElementById("parking-save").addEventListener("click",async()=>{
   const button=document.getElementById("parking-save");
   button.disabled=true;button.textContent="Saving…";
   try{await push(true)}finally{button.disabled=false;button.textContent="Save positions to all devices";}
 });

 document.getElementById("defaults").onclick=()=>{if(!confirm("Restore all default game settings?"))return;values=normalize(defaults);store();draw();drawParking()};
 document.getElementById("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(values,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="maestroescape-settings.json";a.click();URL.revokeObjectURL(url);};
 document.getElementById("local-import").onclick=()=>{if(!Object.keys(saved).length){notice.textContent="No older settings found on this device.";return;}if(!confirm("Replace shared settings using values saved on this device?"))return;values=normalize({...defaults,...saved});store();draw();drawParking();};
 const file=document.getElementById("file");document.getElementById("import").onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Invalid file");values=normalize({...defaults,...data});store();draw();drawParking();}catch{notice.textContent="Unable to import: invalid settings JSON."}file.value="";};
 draw();drawParking();if(!notice.textContent.includes("unavailable")&&!notice.textContent.includes("Imported"))notice.textContent="Shared settings loaded. Changes save automatically.";
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
#mobile-controls{display:none;position:absolute;inset:0;z-index:3;pointer-events:none;touch-action:none;user-select:none;-webkit-user-select:none}
#joystick{position:absolute;left:3.5%;bottom:6%;width:clamp(70px,18vmin,124px);height:clamp(70px,18vmin,124px);border-radius:50%;background:#19253888;border:2px solid #dce8fa88;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#joystick-knob{width:44%;height:44%;position:absolute;left:28%;top:28%;border-radius:50%;background:#c3d7ecdd;box-shadow:0 2px 8px #09131f99;pointer-events:none;transform:translate(0,0)}
#mobile-controls .action{position:absolute;right:4%;bottom:8%;width:clamp(65px,13vmin,94px);height:clamp(65px,13vmin,94px);border-radius:50%;border:2px solid #fff2ca9e;background:#a96a2bcc;color:#fff8dc;font-size:clamp(24px,5vmin,34px);font-weight:800;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#screen{touch-action:pan-x pan-y}
@media(hover:none) and (pointer:coarse){#mobile-controls{display:block}#instructions>div{display:none}}
@media(max-width:900px) and (orientation:landscape) and (pointer:coarse){header{padding:3px 10px}header p{display:none}h1{font-size:15px}#hud{font-size:11px;gap:5px}#screen{height:calc(100dvh - 82px);width:auto;max-width:100%;aspect-ratio:16/9;margin:auto}#joystick{bottom:5%}}

</style></head><body>
<header><div><h1>🍻 MAESTRO ESCAPE</h1><p>Maestro Pub · Mester utca × Viola utca · Single-player</p></div>
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><span id="sync-status" role="status">☁ Connecting…</span><button id="reset">Respawn</button><a class="settings-nav" href="/settings">⚙ Settings</a></div></header>
<div id="screen"><div id="splash">Loading original game map and animated sprites…</div>
<div id="mobile-controls" aria-label="Touch controls">
 <div id="joystick" role="application" aria-label="Movement joystick"><div id="joystick-knob"></div></div>
 <button type="button" class="action" id="mobile-interact" aria-label="Interact">E</button>
</div></div>
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk / W accelerate, S brake/reverse, A/D steer &nbsp; <kbd>E</kbd> enter/exit Skoda &nbsp; <kbd>SHIFT</kbd> sprint on foot &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Walk to Maestro Pub and press E to enter. E at the interior exit returns outside.</span></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const configDefaults=__MAESTRO_DEFAULT_SETTINGS__;
let overrides={};
const cfg=key=>Number.isFinite(Number(overrides[key]))?Number(overrides[key]):configDefaults[key];
let settingsSynced=false,settingsRevision=0;
const applyRemoteSettings=data=>{
 if(!data||!data.settings||typeof data.settings!=="object")throw Error("Invalid shared settings response");
 const before=JSON.stringify(overrides);
 overrides=data.settings;
 settingsRevision=Number(data.revision)||0;
 settingsSynced=true;
 const badge=document.getElementById("sync-status");
 if(badge){badge.textContent="☁ Shared settings synced";badge.title="Cloudflare settings version "+settingsRevision;}
 if(before!==JSON.stringify(overrides)&&scene?.sys?.isActive?.()){
   // Move only parked cars that remain at their previous configured starting spots.
   for(const [id,model,sprite] of [["skoda",car,carSprite],["octavia",octavia,octaviaSprite]]){
     if(model.driver||Math.abs(model.speed)>0.1)continue;
     const x=cfg("vehicle."+id+".spawnX"),y=cfg("vehicle."+id+".spawnY");
     model.x=x;model.y=y;model.angle=cfg("vehicle."+id+".angle")*Math.PI/180;
     if(sprite)sprite.setPosition(x,y).setRotation(model.angle)
                   .setDisplaySize(cfg("vehicle."+id+".width"),cfg("vehicle."+id+".length"));
   }
   character?.setScale?.(insidePub?(activeShop?shopCharacterScale(activeShop):cfg("building.pub.scale")):cfg("character.streetScale"));
   tramSprite?.setDisplaySize?.(cfg("tram.width"),cfg("tram.length"));
 }
};
const locs=[{name:"Maestro Pub",x:825,y:547,color:0xffc76a,info:"Maestro Pub entrance.",done:false}];
const SPAWN={x:859,y:577};
const PUB_DOOR={x:784,y:548};
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
 dohanybolt:{label:"Nemzeti Dohánybolt",door:{x:480,y:347},size:{w:608,h:832},spawn:{x:260,y:783},exit:{x:260,y:805},image:null,walls:[[22,21,533,14],[18,22,21,673],[550,25,26,702],[29,710,156,32],[427,712,139,29],[58,76,128,605],[183,80,293,160],[171,243,260,152],[342,456,51,150],[447,443,53,172]]},
 spar:{label:"SPAR",door:{x:946,y:741},size:{w:736,h:384},spawn:{x:120,y:288},exit:{x:120,y:310},image:null,walls:[[149,20,536,20],[678,23,26,294],[235,321,446,23],[151,30,24,160],[205,56,147,83],[365,59,175,78],[259,161,140,58],[441,163,153,53],[493,232,121,80]]},
 gyros:{label:"Mester Gyros",door:{x:222,y:160},size:{w:768,h:480},spawn:{x:304,y:444},exit:{x:304,y:466},image:null,walls:[[22,12,678,21],[14,14,21,401],[707,30,24,387],[23,442,207,22],[423,442,287,22],[84,90,484,190],[576,83,107,204],[55,295,138,113],[430,307,110,109],[572,305,98,114]]}
};
const interiorWalls=[
[177,222,490,160],[140,396,136,268],[417,564,163,250],
[717,233,147,119],[682,509,132,154],[965,472,111,152],
[835,449,130,275],[1101,350,279,365],[60,0,785,200],
[1181,0,267,326],[0,0,59,730],[961,843,487,243],
[295,844,665,242],[1381,326,67,400],[295,808,540,32],
[1154,50,26,166],[851,0,329,46],[842,45,26,154]
];
const PARKING={get x(){return cfg("vehicle.skoda.spawnX")},get y(){return cfg("vehicle.skoda.spawnY")}};
// Uses the same forward-speed / steering model as the original Vehicle.ts controller.
const car={x:PARKING.x,y:PARKING.y,angle:cfg("vehicle.skoda.angle")*Math.PI/180,speed:0,wheelTurn:0,driver:false,frame:3};
const OCTAVIA_PARKING={get x(){return cfg("vehicle.octavia.spawnX")},get y(){return cfg("vehicle.octavia.spawnY")}};
const octavia={x:OCTAVIA_PARKING.x,y:OCTAVIA_PARKING.y,angle:cfg("vehicle.octavia.angle")*Math.PI/180,speed:0,wheelTurn:0,driver:false};
const DRIVING_ZOOM=()=>cfg("camera.drivingZoom");
let vehicleController=null,octaviaController=null,activeVehicle=null;
let carSprite=null,octaviaSprite=null,tramSprite=null;
// Tram follows the diagonal rails on the new map, with a 3-second station dwell.
const TRAM_START={x:-170,y:0},TRAM_STOP={x:455,y:524},TRAM_END={x:1130,y:1090};
const TRAM_DWELL_MS=3000;
const tramPeriodMs=()=>cfg("tram.interval")*1000;
const tramRunMs=()=>Math.max(1000,Math.min(cfg("tram.travelTime")*1000,tramPeriodMs()-TRAM_DWELL_MS-250));
const tramFirstLegRatio=Math.hypot(TRAM_STOP.x-TRAM_START.x,TRAM_STOP.y-TRAM_START.y)/Math.hypot(TRAM_END.x-TRAM_START.x,TRAM_END.y-TRAM_START.y);
const TRAM_ANGLE=Math.atan2(TRAM_END.x-TRAM_START.x,-(TRAM_END.y-TRAM_START.y));
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:1600,h:992},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false,assetFailed=false;
const touchInput={x:0,y:0};
const joystick=document.getElementById("joystick"),knob=document.getElementById("joystick-knob");
let joystickPointer=null;
function joystickMove(event){
 const box=joystick.getBoundingClientRect();
 const midX=box.left+box.width/2,midY=box.top+box.height/2;
 const dx=event.clientX-midX,dy=event.clientY-midY,limit=box.width*.30;
 const distance=Math.hypot(dx,dy);
 const scale=distance>limit?limit/distance:1;
 touchInput.x=dx*scale/limit;touchInput.y=dy*scale/limit;
 knob.style.transform="translate("+dx*scale+"px,"+dy*scale+"px)";
}
function joystickRelease(){joystickPointer=null;touchInput.x=0;touchInput.y=0;knob.style.transform="translate(0,0)";}
joystick.addEventListener("pointerdown",event=>{event.preventDefault();joystickPointer=event.pointerId;joystick.setPointerCapture(event.pointerId);joystickMove(event);});
joystick.addEventListener("pointermove",event=>{if(event.pointerId===joystickPointer){event.preventDefault();joystickMove(event);}});
joystick.addEventListener("pointerup",joystickRelease);
joystick.addEventListener("pointercancel",joystickRelease);
joystick.addEventListener("lostpointercapture",joystickRelease);
document.getElementById("mobile-interact").addEventListener("pointerdown",event=>{event.preventDefault();if(scene)interact();});

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
 streetImage.setVisible(false);if(interiorImage)interiorImage.setVisible(false);
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
 interiorImage.setVisible(false);streetImage.setVisible(true);
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
   this.load.image("world","/assets/world.webp");
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
   streetImage=image.setDepth(0).setDisplaySize(1600,992);
   if(this.textures.exists("interior")){
     interiorImage=this.add.image(0,0,"interior").setOrigin(0,0)
       .setDisplaySize(INTERIOR_SIZE.w,INTERIOR_SIZE.h).setDepth(1).setVisible(false);
     exitHint=this.add.text(INTERIOR_EXIT.x+22,INTERIOR_EXIT.y-30,"EXIT [E]",
       {fontFamily:"Arial",fontSize:"20px",fontStyle:"bold",color:"#fff5cf",
       stroke:"#151013",strokeThickness:4}).setDepth(8).setVisible(false);
   }
   // The supplied 1600×992 aerial map already contains the building facades.
   for(const [name,shop] of Object.entries(SHOPS)){
     if(this.textures.exists("shop_"+name)){
       shop.image=this.add.image(0,0,"shop_"+name).setOrigin(0,0)
          .setDisplaySize(shop.size.w,shop.size.h).setDepth(1).setVisible(false);
     }
   }
   mapSize={w:1600,h:992};
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
     carSprite=this.add.image(car.x,car.y,"skoda").setDepth(6).setDisplaySize(cfg("vehicle.skoda.width"),cfg("vehicle.skoda.length")).setRotation(car.angle);
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
   this.cameras.main.setZoom(cfg("camera.streetZoom"));
   this.input.mouse?.disableContextMenu();
   loadOriginalCollision().then(()=>this.respawn());
 }
 respawn(){
   let x=SPAWN.x,y=SPAWN.y;
   if(activeVehicle){activeVehicle.driver=false;activeVehicle.speed=0;activeVehicle.wheelTurn=0;activeVehicle=null;character.setVisible(true);this.cameras.main.startFollow(character,true,0.13,0.13);}
   car.x=cfg("vehicle.skoda.spawnX");car.y=cfg("vehicle.skoda.spawnY");car.frame=3;car.angle=cfg("vehicle.skoda.angle")*Math.PI/180;car.speed=0;car.wheelTurn=0;
   octavia.x=cfg("vehicle.octavia.spawnX");octavia.y=cfg("vehicle.octavia.spawnY");octavia.angle=cfg("vehicle.octavia.angle")*Math.PI/180;octavia.speed=0;octavia.wheelTurn=0;
   if(octaviaSprite)octaviaSprite.setPosition(octavia.x,octavia.y).setRotation(octavia.angle);
   if(carSprite)carSprite.setPosition(car.x,car.y).setRotation(car.angle);
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(time,delta){
   if(!character||!keys)return;
   // Tram follows the diagonal tracks, stops at the platform for 3 seconds, and repeats.
   if(tramSprite){
     const phase=time%tramPeriodMs();
     const leg1=tramRunMs()*tramFirstLegRatio;
     const departure=leg1+TRAM_DWELL_MS;
     const finish=tramRunMs()+TRAM_DWELL_MS;
     if(phase<finish&&!insidePub){
       let x,y;
       if(phase<leg1){
         const t=phase/leg1;
         x=Phaser.Math.Linear(TRAM_START.x,TRAM_STOP.x,t);
         y=Phaser.Math.Linear(TRAM_START.y,TRAM_STOP.y,t);
       }else if(phase<departure){
         x=TRAM_STOP.x;y=TRAM_STOP.y;
       }else{
         const t=(phase-departure)/(finish-departure);
         x=Phaser.Math.Linear(TRAM_STOP.x,TRAM_END.x,t);
         y=Phaser.Math.Linear(TRAM_STOP.y,TRAM_END.y,t);
       }
       tramSprite.setPosition(x,y).setRotation(TRAM_ANGLE).setVisible(true);
     }else tramSprite.setVisible(false);
   }
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown)-Number(keys.A.isDown||keys.LEFT.isDown)+touchInput.x;
   let dy=Number(keys.S.isDown||keys.DOWN.isDown)-Number(keys.W.isDown||keys.UP.isDown)+touchInput.y;
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
(async()=>{
 async function syncSharedSettings(){
   const response=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store",headers:{"Cache-Control":"no-store"}});
   if(!response.ok)throw new Error("Shared settings HTTP "+response.status);
   const data=await response.json();applyRemoteSettings(data);
   return data;
 }
 try{await syncSharedSettings();}
 catch(error){
   console.error("Shared settings unavailable",error);
   const badge=document.getElementById("sync-status");
   if(badge){badge.textContent="⚠ Sync offline";badge.title=error.message;}
   show("Settings sync offline. Retry by refreshing; this device may display defaults.");
 }
 new Phaser.Game({type:Phaser.CANVAS,parent:"screen",width:1280,height:720,backgroundColor:"#121926",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Explore],render:{pixelArt:false,antialias:true}});
 // Regular polling keeps existing mobile tabs in sync with desktop changes.
 setInterval(()=>{syncSharedSettings().catch(error=>{
   const badge=document.getElementById("sync-status");
   if(badge){badge.textContent="⚠ Sync offline";badge.title=error.message;}
 })},10000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)syncSharedSettings().catch(console.error)});
})();
})();
</script></body></html>`;

export class GameSettings {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async fetch(request){
  if(request.method==="GET"){
   const current=await this.ctx.storage.get("settings");
   const revision=await this.ctx.storage.get("revision")||0;
   return Response.json({settings:{...SETTINGS_DEFAULTS,...current},initialized:!!current,revision},{headers:{"cache-control":"no-store, no-cache, must-revalidate","pragma":"no-cache"}});
  }
  if(request.method==="PUT"){
   try{
     const input=await request.json();
     if(!input||typeof input!=="object"||Array.isArray(input))return new Response("Invalid settings",{status:400});
     const fields=Object.fromEntries(SETTINGS_GROUPS.flatMap(g=>g.fields.map(f=>[f.key,f])));
     const clean={...SETTINGS_DEFAULTS};
     for(const [key,field] of Object.entries(fields)){
       const raw=input[key],value=raw===undefined?field.value:Number(raw);
       if(!Number.isFinite(value))return new Response("Invalid value: "+key,{status:400});
       clean[key]=Math.min(field.max,Math.max(field.min,value));
     }
     const revision=(await this.ctx.storage.get("revision")||0)+1;
     await this.ctx.storage.put({settings:clean,revision});
     return Response.json({settings:clean,revision,ok:true},{headers:{"cache-control":"no-store"}});
   }catch(error){return new Response("Invalid settings request",{status:400});}
  }
  return new Response("Method not allowed",{status:405});
 }
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/settings"){
    if(!env?.SETTINGS_STORE)return Response.json({error:"Shared settings storage binding unavailable"},{status:503,headers:{"cache-control":"no-store"}});
    const stub=env.SETTINGS_STORE.get(env.SETTINGS_STORE.idFromName("maestroescape-global-settings"));
    return stub.fetch(new Request("https://settings.internal/",{method:request.method,headers:request.headers,body:request.method==="PUT"?request.body:undefined}));
  }
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
  if(url.pathname==="/assets/world.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/maestro_map_new.webp");
    if(!upstream.ok)return new Response("Map image unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
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
