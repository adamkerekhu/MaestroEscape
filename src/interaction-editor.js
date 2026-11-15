// Visual editor for actual E-interaction points (doors and stair triggers).
export const INTERACTION_EDITOR_CSS = String.raw`
#interaction-editor{margin:0 0 20px;padding:18px;border:1px solid #566a79;border-radius:12px;background:#1b2638}
#interaction-editor h2{color:#ffd18f;margin:0 0 6px}
#interaction-editor p{font-size:13px;color:#b9c9d7}
#interaction-editor .interaction-controls{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:12px 0}
#interaction-editor label{display:flex;align-items:center;gap:7px}
#interaction-editor select,#interaction-editor input{background:#111c2b;color:#fff;border:1px solid #74849b;border-radius:7px;padding:8px}
#interaction-editor input[type=number]{width:88px}
#interaction-map{display:block;width:100%;height:auto;max-height:72dvh;object-fit:contain;border:1px solid #697e91;border-radius:9px;touch-action:none;cursor:crosshair;background:#111d29}
#interaction-editor #interaction-status{font-size:13px;color:#f1ce95}
#interaction-editor .interaction-legend{display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:#e1d4b9;font-size:12px}
#interaction-editor .interaction-dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:#75e3bf;border:2px solid #133a2c;vertical-align:middle}
#interaction-editor .interaction-dot.selected{background:#ffc66d;border-color:#fff0c2}
`;
export const INTERACTION_EDITOR_HTML = String.raw`
<section id="interaction-editor">
<h2>🚪 Doors and stairs · E interaction points</h2>
<p>Drag a marker on the map to move where E opens a door or staircase. These are separate from player arrival positions. The ring shows how close a player must stand to interact.</p>
<div class="interaction-controls">
<label>Map <select id="interaction-scene"><option value="street">Mester utca</option><option value="pub">Maestro Pub</option><option value="basement">Basement</option><option value="spar">SPAR</option><option value="dohanybolt">Dohánybolt</option><option value="gyros">Mester Gyros</option></select></label>
<label>Point <select id="interaction-choice"></select></label>
<label>X <input id="interaction-x" type="number" step="1"></label>
<label>Y <input id="interaction-y" type="number" step="1"></label>
<label>E radius <input id="interaction-radius" type="number" min="20" max="200" step="1"></label>
</div>
<canvas id="interaction-map" width="1600" height="992" aria-label="Drag door and staircase interaction markers"></canvas>
<div class="interaction-controls"><button id="interaction-reset" type="button">Reset selected point</button><button id="interaction-save" type="button" class="primary">Save interaction points</button></div>
<p class="interaction-legend"><span><span class="interaction-dot"></span> Other interaction points</span><span><span class="interaction-dot selected"></span> Selected draggable point</span></p>
<p id="interaction-status" role="status">Choose a map and drag a point.</p>
</section>
`;
export const INTERACTION_EDITOR_SCRIPT = String.raw`
 // Interaction markers use the same local settings object and saving pipeline as vehicle/NPC markers.
 const interactionMaps={
  street:{w:1600,h:992,asset:"/assets/world.webp"},
  pub:{w:1448,h:1086,asset:"/assets/interior.webp"},
  basement:{w:1792,h:896,asset:"/assets/basement.webp"},
  spar:{w:736,h:384,asset:"/assets/shop-spar.webp"},
  dohanybolt:{w:608,h:832,asset:"/assets/shop-dohanybolt.webp"},
  gyros:{w:768,h:480,asset:"/assets/shop-gyros.webp"}
 };
 const interactionDefs=[
  {id:"street_pub",scene:"street",label:"Enter Maestro Pub"},
  {id:"street_spar",scene:"street",label:"Enter SPAR"},
  {id:"street_dohanybolt",scene:"street",label:"Enter Dohánybolt"},
  {id:"street_gyros",scene:"street",label:"Enter Mester Gyros"},
  {id:"pub_exit",scene:"pub",label:"Exit Maestro Pub"},
  {id:"pub_downstairs",scene:"pub",label:"Go downstairs"},
  {id:"basement_upstairs",scene:"basement",label:"Go upstairs"},
  {id:"spar_exit",scene:"spar",label:"Exit SPAR"},
  {id:"dohanybolt_exit",scene:"dohanybolt",label:"Exit Dohánybolt"},
  {id:"gyros_exit",scene:"gyros",label:"Exit Mester Gyros"}
 ];
 const interactionScene=document.getElementById("interaction-scene"),interactionChoice=document.getElementById("interaction-choice");
 const interactionCanvas=document.getElementById("interaction-map"),interactionCtx=interactionCanvas.getContext("2d");
 const interactionX=document.getElementById("interaction-x"),interactionY=document.getElementById("interaction-y"),interactionRadius=document.getElementById("interaction-radius");
 const interactionStatus=document.getElementById("interaction-status"),interactionImages={};
 let interactionPointer=null;
 const interactionKey=(id,axis)=>"interaction."+id+"."+axis;
 const interactionSelected=()=>interactionDefs.find(p=>p.id===interactionChoice.value);
 function interactionPoint(def){return {x:values[interactionKey(def.id,"x")],y:values[interactionKey(def.id,"y")],r:values[interactionKey(def.id,"radius")]}}
 function interactionDraw(){
  const map=interactionMaps[interactionScene.value],image=interactionImages[interactionScene.value];
  if(interactionCanvas.width!==map.w||interactionCanvas.height!==map.h){interactionCanvas.width=map.w;interactionCanvas.height=map.h}
  interactionCtx.clearRect(0,0,map.w,map.h);
  if(image?.complete&&image.naturalWidth)interactionCtx.drawImage(image,0,0,map.w,map.h);
  else{interactionCtx.fillStyle="#253348";interactionCtx.fillRect(0,0,map.w,map.h);interactionCtx.fillStyle="white";interactionCtx.font="bold 24px system-ui";interactionCtx.fillText("Loading map...",25,40)}
  for(const def of interactionDefs.filter(p=>p.scene===interactionScene.value)){
   const pt=interactionPoint(def),selected=interactionChoice.value===def.id;
   interactionCtx.save();interactionCtx.beginPath();interactionCtx.arc(pt.x,pt.y,pt.r,0,Math.PI*2);
   interactionCtx.fillStyle=selected?"#ffca6340":"#6df5cb25";interactionCtx.fill();
   interactionCtx.lineWidth=selected?4:2;interactionCtx.strokeStyle=selected?"#ffd47e":"#78e7bb";interactionCtx.stroke();
   interactionCtx.beginPath();interactionCtx.arc(pt.x,pt.y,selected?15:11,0,Math.PI*2);interactionCtx.fillStyle=selected?"#ffcf74":"#75e7c0";interactionCtx.fill();
   interactionCtx.font="bold 17px system-ui";interactionCtx.textAlign="center";interactionCtx.lineWidth=4;interactionCtx.strokeStyle="#0f1929";
   interactionCtx.strokeText(def.label,pt.x,pt.y-pt.r-12);interactionCtx.fillStyle="#ffffff";interactionCtx.fillText(def.label,pt.x,pt.y-pt.r-12);interactionCtx.restore();
  }
  const chosen=interactionSelected();if(!chosen)return;
  const pt=interactionPoint(chosen);interactionX.value=pt.x;interactionY.value=pt.y;interactionRadius.value=pt.r;
  interactionX.min=25;interactionX.max=map.w-25;interactionY.min=25;interactionY.max=map.h-25;
  interactionStatus.textContent=chosen.label+" · X "+pt.x+" · Y "+pt.y+" · E radius "+pt.r+" px. Drag or edit numbers, then save.";
 }
 function interactionLoadMap(){
  const map=interactionMaps[interactionScene.value];
  if(!interactionImages[interactionScene.value]){
   const image=new Image();interactionImages[interactionScene.value]=image;image.onload=interactionDraw;image.onerror=interactionDraw;image.src=map.asset;
  }
  interactionChoice.replaceChildren();for(const def of interactionDefs.filter(p=>p.scene===interactionScene.value)){
   const option=document.createElement("option");option.value=def.id;option.textContent=def.label;interactionChoice.append(option)
  }
  interactionDraw();
 }
 function interactionSet(axis,val){
  const def=interactionSelected(),key=interactionKey(def.id,axis),field=lookup[key],number=Number(val);
  if(!field||!Number.isFinite(number))return;values[key]=Math.round(Math.max(field.min,Math.min(field.max,number)));
 }
 function interactionCanvasPoint(e){
  const bounds=interactionCanvas.getBoundingClientRect();
  const ratio=Math.min(bounds.width/interactionCanvas.width,bounds.height/interactionCanvas.height);
  const x0=bounds.left+(bounds.width-interactionCanvas.width*ratio)/2;
  const y0=bounds.top+(bounds.height-interactionCanvas.height*ratio)/2;
  return {x:(e.clientX-x0)/ratio,y:(e.clientY-y0)/ratio};
 }
 function interactionMove(e){
  if(interactionPointer!==e.pointerId)return;
  e.preventDefault();const pt=interactionCanvasPoint(e);interactionSet("x",pt.x);interactionSet("y",pt.y);interactionDraw();
 }
 interactionCanvas.addEventListener("pointerdown",e=>{
  e.preventDefault();const p=interactionCanvasPoint(e);
  const nearest=interactionDefs.filter(d=>d.scene===interactionScene.value).map(d=>({id:d.id,distance:Math.hypot(interactionPoint(d).x-p.x,interactionPoint(d).y-p.y)})).sort((a,b)=>a.distance-b.distance)[0];
  if(nearest&&nearest.distance<55)interactionChoice.value=nearest.id;
  interactionPointer=e.pointerId;interactionCanvas.setPointerCapture(e.pointerId);interactionMove(e);
 });
 interactionCanvas.addEventListener("pointermove",interactionMove);
 const interactionStop=()=>{if(interactionPointer===null)return;interactionPointer=null;store()};
 interactionCanvas.addEventListener("pointerup",interactionStop);interactionCanvas.addEventListener("pointercancel",interactionStop);interactionCanvas.addEventListener("lostpointercapture",interactionStop);
 interactionScene.addEventListener("change",interactionLoadMap);interactionChoice.addEventListener("change",interactionDraw);
 for(const [control,axis] of [[interactionX,"x"],[interactionY,"y"],[interactionRadius,"radius"]])control.addEventListener("change",()=>{interactionSet(axis,control.value);interactionDraw();store()});
 document.getElementById("interaction-reset").onclick=()=>{
  const def=interactionSelected();for(const axis of ["x","y","radius"]){const key=interactionKey(def.id,axis);values[key]=defaults[key]}
  interactionDraw();store();
 };
 document.getElementById("interaction-save").onclick=async()=>{
  const ok=await push(true);interactionStatus.textContent=ok?"✓ Interaction positions saved in this browser.":"Save failed. Review the settings warning above.";
 };
 interactionLoadMap();
`;
