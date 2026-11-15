export const INVENTORY_WHEEL_CSS = String.raw`
#maestro-inventory-wheel{position:absolute;inset:0;z-index:35;display:none;align-items:center;justify-content:center;pointer-events:none;font:14px system-ui,Arial;color:#fff0cf}
#maestro-inventory-wheel.open{display:flex}
#maestro-inventory-wheel .wheel-backdrop{position:absolute;inset:0;background:radial-gradient(circle,#09150d29,#070e12a8);backdrop-filter:blur(2px);pointer-events:none}
#maestro-inventory-wheel .wheel-wrap{position:relative;width:min(420px,88vw,65dvh);height:min(420px,88vw,65dvh);pointer-events:none;animation:wheel-pop .16s cubic-bezier(.2,.9,.25,1)}
#maestro-inventory-wheel .wheel-disk{position:absolute;inset:9%;border-radius:50%;border:3px solid #d6a765;background:radial-gradient(circle,#1e3024 0 25%,#233d30ee 26% 49%,#15241feb 64%,#583b20ed 78%,#bb9149 82%,#17241c 84%);box-shadow:0 12px 70px #000d,inset 0 0 0 7px #152116,0 0 0 1px #f8d59f66;pointer-events:none}
#maestro-inventory-wheel .wheel-center{position:absolute;inset:36%;display:flex;flex-direction:column;gap:2px;align-items:center;justify-content:center;text-align:center;border-radius:50%;background:#15271ef2;border:2px solid #dabb78;box-shadow:0 2px 18px #000a;pointer-events:none;z-index:2}
#maestro-inventory-wheel .wheel-center strong{color:#f9d89b;font-size:12px}
#maestro-inventory-wheel .wheel-center span{font-size:11px;color:#d4ddcf;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#maestro-inventory-wheel .wheel-slot{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:50%;height:23%;width:23%;border:2px solid #bd9866;box-shadow:0 4px 16px #000a;background:linear-gradient(150deg,#3b5242,#1a2924);color:#f6e1b8;pointer-events:auto;cursor:pointer;transition:transform .14s,background .14s,border-color .14s;touch-action:manipulation;padding:3px}
#maestro-inventory-wheel .wheel-slot .wheel-icon{font-size:clamp(21px,4vw,32px);line-height:1.1}
#maestro-inventory-wheel .wheel-slot .wheel-name{font-size:10px;max-width:98%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#maestro-inventory-wheel .wheel-slot .wheel-count{position:absolute;right:0;top:-4px;background:#e9c57d;color:#15251b;padding:2px 6px;border-radius:12px;font-size:10px;font-weight:800}
#maestro-inventory-wheel .wheel-slot.selected{transform:scale(1.17);background:linear-gradient(145deg,#678f64,#35553b);border-color:#ffe7a7;box-shadow:0 0 0 3px #efdc9766,0 6px 25px #000b}
#maestro-inventory-wheel .wheel-slot.equipped:after{content:"✓";position:absolute;left:0;top:-4px;border-radius:12px;background:#487752;border:1px solid #d9db9f;color:white;font-size:11px;padding:0 4px}
#maestro-inventory-wheel .wheel-slot:focus-visible{outline:3px solid #ffeab7;outline-offset:4px}
#maestro-inventory-wheel .wheel-hint{position:absolute;bottom:4%;left:50%;transform:translateX(-50%);text-align:center;white-space:nowrap;color:#f7d499;background:#18261eec;border:1px solid #d6a765;padding:7px 13px;border-radius:10px;font-size:12px;pointer-events:none}
#maestro-inventory-wheel .wheel-empty{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:13px;color:#fff;white-space:nowrap;pointer-events:none}
#pub-hud #pub-quick-inventory{position:relative}
#pub-hud .pub-bottom #pub-quick-inventory{background:linear-gradient(135deg,#425b43,#233225);border:2px solid #ecc582;border-radius:50%;width:63px;height:63px;font-size:12px}
#maestro-inventory-wheel .wheel-slot:disabled{opacity:.45}
@keyframes wheel-pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
@media(hover:none) and (pointer:coarse){
 #pub-hud .pub-bottom #pub-quick-inventory{position:fixed;right:4%;bottom:calc(8% + clamp(65px,13vmin,94px) + 15px);width:clamp(53px,12vmin,71px);height:clamp(53px,12vmin,71px);z-index:7;pointer-events:auto}
 #maestro-inventory-wheel .wheel-hint{bottom:0;font-size:11px}
 #maestro-inventory-wheel .wheel-wrap{width:min(360px,93vw,75dvh);height:min(360px,93vw,75dvh)}
}
@media(prefers-reduced-motion:reduce){#maestro-inventory-wheel *,#maestro-inventory-wheel .wheel-wrap{animation:none!important;transition:none!important}}
`;
export const INVENTORY_WHEEL_SCRIPT = String.raw`(()=>{
"use strict";
const screen=document.getElementById("screen");
if(!screen||document.getElementById("maestro-inventory-wheel"))return;
const css=document.createElement("link");css.rel="stylesheet";css.href="/assets/inventory-wheel.css";document.head.append(css);
const overlay=document.createElement("div");overlay.id="maestro-inventory-wheel";overlay.setAttribute("aria-label","Quick inventory");
overlay.innerHTML='<div class="wheel-backdrop"></div><section class="wheel-wrap" role="group" aria-label="Choose inventory item"><div class="wheel-disk"></div><div class="wheel-center"><strong>🎒 INVENTORY</strong><span id="wheel-caption">Choose an item</span></div><div class="wheel-empty" hidden>Nothing in your bag</div><div class="wheel-hint">Hold Q • Hover item • Release to use</div></section>';
screen.append(overlay);
const wrap=overlay.querySelector(".wheel-wrap"),caption=overlay.querySelector("#wheel-caption"),hint=overlay.querySelector(".wheel-hint"),empty=overlay.querySelector(".wheel-empty");
const BUTTONS={beer:"🍺",empty_glass:"🥛",kebab:"🥙",cigarette:"🚬",cigarette_pack:"📦",scratch_ticket:"🎟️"};
const NAMES={beer:"Beer",empty_glass:"Glass",kebab:"Kebab",cigarette:"Cigarette",cigarette_pack:"Pack",scratch_ticket:"Scratch"};
let visible=false,holding=false,selected=-1,items=[],lastPointerType="mouse",busy=false;
const ctl=()=>window.MaestroInventoryController;
const isTyping=target=>!!target?.closest?.("input,textarea,select,[contenteditable=true]");
function close(){visible=false;holding=false;selected=-1;overlay.classList.remove("open");overlay.style.display="none";items=[]}
function highlight(index){
 selected=index;const buttons=wrap.querySelectorAll(".wheel-slot");
 buttons.forEach((node,i)=>node.classList.toggle("selected",i===selected));
 caption.textContent=index>=0&&items[index]?NAMES[items[index].type]||items[index].type:"Choose an item";
}
function render(){
 wrap.querySelectorAll(".wheel-slot").forEach(node=>node.remove());
 items=Array.isArray(ctl()?.items?.())?[...ctl().items()]:[];
 empty.hidden=!!items.length;
 if(!items.length){caption.textContent="No items";return}
 const equipped=ctl()?.equippedId?.();
 for(let i=0;i<items.length;i++){
  const item=items[i],a=(-Math.PI/2)+i*2*Math.PI/items.length;
  const btn=document.createElement("button");btn.type="button";btn.className="wheel-slot";
  btn.style.left=(50+35*Math.cos(a)-11.5)+"%";btn.style.top=(50+35*Math.sin(a)-11.5)+"%";
  btn.title=(NAMES[item.type]||item.type)+" · "+(item.remainingUnits??"");
  btn.setAttribute("aria-label","Use "+(NAMES[item.type]||item.type));
  const icon=document.createElement("span");icon.className="wheel-icon";icon.textContent=BUTTONS[item.type]||"🎁";
  const name=document.createElement("span");name.className="wheel-name";name.textContent=NAMES[item.type]||item.type;
  btn.append(icon,name);
  if(item.remainingUnits>1){const count=document.createElement("span");count.className="wheel-count";count.textContent="×"+item.remainingUnits;btn.append(count)}
  if(item.id===equipped)btn.classList.add("equipped");
  btn.onpointerenter=()=>highlight(i);
  btn.onpointerdown=event=>{event.stopPropagation();highlight(i)};
  btn.onclick=event=>{event.stopPropagation();void choose(i)};
  wrap.append(btn);
 }
 highlight(-1);
}
function open(source="mouse"){
 if(visible)return;
 if(!ctl()?.ready?.()){ctl()?.notify?.("Choose your character before using inventory");return}
 visible=true;lastPointerType=source;overlay.style.display="flex";overlay.classList.add("open");
 hint.textContent=source==="keyboard"?"Hold Q · Hover item · Release to use":"Tap item to use · Tap bag again to close";
 render();
}
async function choose(index){
 const item=items[index];if(!item||busy)return;
 busy=true;close();
 try{const ok=await ctl()?.use?.(item);if(!ok)ctl()?.notify?.("Could not use "+(NAMES[item.type]||item.type));}
 catch(e){ctl()?.notify?.("Inventory failed: "+e.message)}
 finally{busy=false}
}
function toggle(){if(visible)close();else open("touch")}
document.addEventListener("keydown",e=>{
 if(e.code!=="KeyQ"||e.altKey||e.ctrlKey||e.metaKey||isTyping(e.target))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.repeat)return;
 holding=true;open("keyboard");
},true);
document.addEventListener("keyup",e=>{
 if(e.code!=="KeyQ"||!holding)return;
 e.preventDefault();e.stopImmediatePropagation();
 const choice=selected;
 holding=false;if(choice>=0)void choose(choice);else close();
},true);
window.addEventListener("blur",close);
document.addEventListener("visibilitychange",()=>{if(document.hidden)close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&visible){e.preventDefault();e.stopImmediatePropagation();close()}},true);
overlay.querySelector(".wheel-backdrop").onclick=()=>{if(!holding)close()};
const hook=()=>{
 const quick=document.getElementById("pub-quick-inventory");
 if(quick){quick.onclick=event=>{event.stopPropagation();toggle()};quick.setAttribute("aria-label","Toggle circular quick inventory")}
};
hook();
window.MaestroInventoryWheel={open,close,toggle,isOpen:()=>visible};
})();`;
