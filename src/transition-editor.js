// Visual destination spawn editor embedded in the existing authenticated Settings page.
export const TRANSITION_EDITOR_CSS = String.raw`
#transition-editor{margin:0 0 20px;padding:18px;border:1px solid #5b7890;border-radius:12px;background:#1b2638}
#transition-editor h2{margin:0 0 8px;color:#ffd18f}
#transition-editor p{font-size:13px;color:#bbc9d8}
#transition-editor .transition-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:14px 0}
#transition-editor .transition-controls label{display:flex;align-items:center;gap:7px}
#transition-editor select,#transition-editor input{background:#111c2b;color:#fff;border:1px solid #76849a;padding:8px;border-radius:8px}
#transition-editor input[type=number]{width:100px}
#transition-map{width:100%;height:auto;max-height:70dvh;object-fit:contain;border-radius:10px;border:1px solid #607891;background:#111a27;touch-action:none;cursor:crosshair}
#transition-map:active{cursor:grabbing}
#transition-editor #transition-status{font-size:13px;font-weight:650;color:#f1ca81}
`;
export const TRANSITION_EDITOR_HTML = String.raw`
<section id="transition-editor">
<h2>🚪 Map transitions · Drag player arrival points</h2>
<p>Choose a destination map, then drag the gold player marker to the exact location where the character should appear after entering. Pub, basement and upstairs are independent points. Changes are saved for Single Player in this browser.</p>
<div class="transition-controls"><label>Destination <select id="transition-choice">
<option value="pub">Street → Maestro Pub</option>
<option value="basement">Pub → Basement (downstairs)</option>
<option value="casino">Street → Underground Casino</option>
<option value="upstairs">Basement → Pub (upstairs)</option>
<option value="spar">Street → SPAR</option>
<option value="dohanybolt">Street → Dohánybolt</option>
<option value="gyros">Street → Mester Gyros</option>
</select></label>
<label>X <input id="transition-x" type="number" step="1"></label>
<label>Y <input id="transition-y" type="number" step="1"></label>
<button id="transition-reset" type="button">Reset this destination</button>
<button id="transition-save" type="button" class="primary">Save arrival points</button></div>
<canvas id="transition-map" width="1448" height="1086" aria-label="Drag the player's arrival position on the destination map"></canvas>
<p id="transition-status" role="status">Drag the gold marker to the desired arrival location.</p>
</section>
`;
export const TRANSITION_EDITOR_SCRIPT = String.raw`
 // Independent scene arrival markers. These are spawn destinations, not interactable exit hitboxes.
 const transitionScenes={
  pub:{name:"Maestro Pub entry",w:1448,h:1086,asset:"/assets/interior.webp"},
  basement:{name:"Basement entry",w:1792,h:896,asset:"/assets/basement.webp"},
  casino:{name:"Casino manhole arrival",w:1448,h:1086,asset:"/assets/casino.webp"},
  upstairs:{name:"Pub upstairs return",w:1448,h:1086,asset:"/assets/interior.webp"},
  spar:{name:"SPAR entry",w:736,h:384,asset:"/assets/shop-spar.webp"},
  dohanybolt:{name:"Dohánybolt entry",w:608,h:832,asset:"/assets/shop-dohanybolt.webp"},
  gyros:{name:"Mester Gyros entry",w:768,h:480,asset:"/assets/shop-gyros.webp"}
 };
 const transitionChoice=document.getElementById("transition-choice");
 const transitionCanvas=document.getElementById("transition-map"),transitionCtx=transitionCanvas.getContext("2d");
 const transitionX=document.getElementById("transition-x"),transitionY=document.getElementById("transition-y");
 const transitionStatus=document.getElementById("transition-status"),transitionImages={};
 let transitionDragging=null;
 const transitionKeys=id=>["transition."+id+".x","transition."+id+".y"];
 const transitionDef=()=>transitionScenes[transitionChoice.value];
 function transitionPoint(){
  const keys=transitionKeys(transitionChoice.value);
  return {x:Number(values[keys[0]]),y:Number(values[keys[1]])};
 }
 function transitionDraw(){
  const map=transitionDef(),image=transitionImages[transitionChoice.value],pt=transitionPoint();
  if(transitionCanvas.width!==map.w||transitionCanvas.height!==map.h){
   transitionCanvas.width=map.w;transitionCanvas.height=map.h;
  }
  transitionCtx.clearRect(0,0,map.w,map.h);
  if(image?.complete&&image.naturalWidth)transitionCtx.drawImage(image,0,0,map.w,map.h);
  else{
   transitionCtx.fillStyle="#26374a";transitionCtx.fillRect(0,0,map.w,map.h);
   transitionCtx.font="bold 24px system-ui";transitionCtx.fillStyle="#e5ecf3";
   transitionCtx.fillText("Loading "+map.name+" map",28,46);
  }
  transitionCtx.beginPath();transitionCtx.arc(pt.x,pt.y,25,0,Math.PI*2);
  transitionCtx.fillStyle="#f6c76766";transitionCtx.fill();
  transitionCtx.lineWidth=5;transitionCtx.strokeStyle="#ffe9a0";transitionCtx.stroke();
  transitionCtx.font="bold 27px system-ui";transitionCtx.textAlign="center";transitionCtx.textBaseline="middle";
  transitionCtx.fillStyle="#1c3028";transitionCtx.fillText("📍",pt.x,pt.y);
  transitionCtx.lineWidth=5;transitionCtx.strokeStyle="#1c2834";transitionCtx.font="bold 19px system-ui";
  transitionCtx.strokeText("PLAYER SPAWN",pt.x,pt.y-39);
  transitionCtx.fillStyle="#fff5d9";transitionCtx.fillText("PLAYER SPAWN",pt.x,pt.y-39);
  transitionX.value=pt.x;transitionY.value=pt.y;
  transitionX.min=25;transitionY.min=25;
  transitionX.max=map.w-25;transitionY.max=map.h-25;
  transitionStatus.textContent=map.name+" · X "+pt.x+" · Y "+pt.y+" · Drag marker to adjust. Auto-saves in this browser.";
 }
 function transitionLoad(){
  const id=transitionChoice.value,map=transitionDef();
  if(!transitionImages[id]){
   const image=new Image();transitionImages[id]=image;
   image.onload=transitionDraw;image.onerror=()=>{
    transitionStatus.textContent="Map image unavailable. You can still place the marker on the coordinate canvas.";
    transitionDraw();
   };
   image.src=map.asset;
  }
  transitionDraw();
 }
 function transitionSet(x,y){
  const map=transitionDef(),keys=transitionKeys(transitionChoice.value);
  if(!Number.isFinite(Number(x))||!Number.isFinite(Number(y)))return;
  values[keys[0]]=Math.round(Math.max(25,Math.min(map.w-25,Number(x))));
  values[keys[1]]=Math.round(Math.max(25,Math.min(map.h-25,Number(y))));
  transitionDraw();
 }
 function transitionCursor(event){
  const bounds=transitionCanvas.getBoundingClientRect();
  // object-fit:contain / max-height can letterbox the canvas inside its CSS box.
  const ratio=Math.min(bounds.width/transitionCanvas.width,bounds.height/transitionCanvas.height);
  const displayW=transitionCanvas.width*ratio,displayH=transitionCanvas.height*ratio;
  const left=bounds.left+(bounds.width-displayW)/2,top=bounds.top+(bounds.height-displayH)/2;
  return {x:(event.clientX-left)/ratio,y:(event.clientY-top)/ratio};
 }
 transitionCanvas.addEventListener("pointerdown",event=>{
  event.preventDefault();transitionDragging=event.pointerId;transitionCanvas.setPointerCapture(event.pointerId);
  const pt=transitionCursor(event);transitionSet(pt.x,pt.y);
 });
 transitionCanvas.addEventListener("pointermove",event=>{
  if(event.pointerId!==transitionDragging)return;
  event.preventDefault();const pt=transitionCursor(event);transitionSet(pt.x,pt.y);
 });
 const transitionStop=()=>{if(transitionDragging===null)return;transitionDragging=null;store()};
 transitionCanvas.addEventListener("pointerup",transitionStop);
 transitionCanvas.addEventListener("pointercancel",transitionStop);
 transitionCanvas.addEventListener("lostpointercapture",transitionStop);
 transitionChoice.addEventListener("change",transitionLoad);
 for(const input of [transitionX,transitionY])input.addEventListener("change",()=>{
  transitionSet(transitionX.value,transitionY.value);store();
 });
 document.getElementById("transition-save").addEventListener("click",async()=>{
  const ok=await push(true);transitionStatus.textContent=ok?"✓ Arrival coordinates saved in this browser.": "Could not save arrival coordinates.";
 });
 document.getElementById("transition-reset").addEventListener("click",()=>{
  const keys=transitionKeys(transitionChoice.value);
  values[keys[0]]=defaults[keys[0]];values[keys[1]]=defaults[keys[1]];
  transitionDraw();store();
 });
 transitionLoad();
`;
