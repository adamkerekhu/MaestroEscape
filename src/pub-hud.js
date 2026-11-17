// Pub-style game HUD. Presentation only: delegates to existing gameplay actions.
export const PUB_HUD_CSS = String.raw`
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#10151f}
#screen,#screen *{user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none!important}
#screen img,#screen canvas{-webkit-user-drag:none;user-drag:none}
#screen{overscroll-behavior:none;touch-action:none}
#screen input,#screen textarea,#screen [contenteditable="true"]{user-select:text!important;-webkit-user-select:text!important;-webkit-touch-callout:default!important}
body>header{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;padding:0!important;margin:0!important}
#instructions{position:fixed!important;bottom:8px;left:50%;transform:translateX(-50%);width:min(840px,85vw);z-index:15;background:#101923bc!important;border:1px solid #b58a4866;border-radius:12px;padding:5px 12px!important;pointer-events:none;max-width:100%;box-sizing:border-box}
#instructions>div{display:none!important}#instructions #msg{font-size:12px;text-align:center;color:#f6d8a0}
#screen{position:fixed!important;inset:0!important;display:block!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;aspect-ratio:auto!important;border:0!important;border-radius:0!important;background:#17202b;overflow:hidden!important}
#screen canvas{display:block;width:100%!important;height:100%!important;object-fit:cover!important}
#pub-hud{position:absolute;inset:0;z-index:6;pointer-events:none;color:#fcebd0;font-family:system-ui,Arial,sans-serif;isolation:isolate}
#pub-hud button,#pub-hud a{font-family:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#pub-hud .pub-btn{pointer-events:auto;background:linear-gradient(150deg,#2c443aee,#182b27ee);border:1px solid #d6a96188;border-radius:14px;box-shadow:0 4px 18px #0008,inset 0 1px #ffffff17;color:#fff0d0;padding:10px 12px;font-size:13px;font-weight:750;transition:transform .18s ease,background .18s ease,border-color .18s ease}
#pub-hud .pub-btn:hover{transform:translateY(-3px);background:#385648;border-color:#ebcc85}
#pub-hud .pub-btn:active{transform:scale(.96)}
#pub-hud .pub-top{position:absolute;top:max(12px,env(safe-area-inset-top));left:14px;right:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
#pub-hud .pub-brand{padding:9px 13px;background:#132017dc;border:1px solid #dcb37282;border-radius:13px;box-shadow:0 4px 15px #0009;backdrop-filter:blur(10px)}
#pub-hud .pub-brand strong{font:800 16px Georgia,serif;letter-spacing:.08em;color:#f6d393}
#pub-hud .pub-brand small{display:block;color:#e4e0cf;font-size:10px;margin-top:2px;letter-spacing:.04em}
#pub-hud .pub-indicators{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:55%}
#pub-hud .pub-chip{padding:8px 10px;border:1px solid #efc57b69;border-radius:12px;background:#15261fed;color:#ffe0ab;font-size:12px;font-weight:750;backdrop-filter:blur(8px)}
#pub-hud .pub-bottom{position:absolute;right:clamp(14px,2.5vw,35px);bottom:max(22px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:9px}
#pub-hud .pub-bottom .pub-btn{min-width:65px;min-height:53px}
#pub-hud #pub-fullscreen{position:absolute;left:max(12px,env(safe-area-inset-left));top:max(76px,calc(env(safe-area-inset-top) + 56px));width:45px;height:45px;display:none;align-items:center;justify-content:center;font-size:20px;padding:0;pointer-events:auto}
#pub-hud #pub-menu-toggle{border-radius:50%;width:65px;height:65px;font-size:24px;background:radial-gradient(circle at 35% 30%,#ad8342,#50351e);border:2px solid #f0c77e;box-shadow:0 5px 25px #000a}
#pub-hud .pub-radial{position:absolute;right:clamp(2px,1.4vw,24px);bottom:96px;width:326px;height:326px;pointer-events:none;visibility:hidden;transform:translateY(12px) scale(.89);opacity:0;transition:opacity .21s ease,transform .23s cubic-bezier(.2,1.2,.2,1),visibility .23s}
#pub-hud .pub-radial.open{pointer-events:auto;visibility:visible;opacity:1;transform:translateY(0) scale(1)}
#pub-hud .pub-radial-disc{position:absolute;inset:27px;border-radius:50%;background:radial-gradient(circle,#273b2fe8 0 20%,#3a2820ee 23% 48%,#202b22ee 50% 69%,#a9783b 71%,#482d1a 75%);border:2px solid #d9ac62;box-shadow:0 12px 44px #000c,inset 0 0 0 7px #1b291f;backdrop-filter:blur(7px)}
#pub-hud .pub-radial-center{position:absolute;left:120px;top:120px;width:86px;height:86px;display:grid;place-items:center;border-radius:50%;font-size:28px;border:2px solid #e3bd7a;background:#283d32;color:#fff0ca;pointer-events:none;box-shadow:0 2px 12px #0009}
#pub-hud .pub-radial-option{position:absolute;width:79px;height:79px;border-radius:50%;border:2px solid #e5b977;background:linear-gradient(145deg,#345444,#16281e);color:#f7e3b8;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;font-size:11px;font-weight:750;box-shadow:0 5px 18px #000a;pointer-events:auto;transition:transform .16s,background .16s}
#pub-hud .pub-radial-option .pub-emoji{font-size:22px;line-height:1.05}
#pub-hud .pub-radial-option:hover,#pub-hud .pub-radial-option:focus-visible{transform:scale(1.1);background:#496b51;outline:2px solid #fff3c1}
#pub-hud .pub-tools{position:absolute;right:14px;top:75px;max-height:min(78dvh,680px);width:min(350px,calc(100vw - 28px));overflow:auto;padding:17px;background:linear-gradient(140deg,#1d3229f5,#151e23f8);border:2px solid #d0a05c;border-radius:18px;box-shadow:0 15px 55px #000b;pointer-events:auto;transform:translateX(20px);opacity:0;visibility:hidden;transition:transform .2s,opacity .2s,visibility .2s}
#pub-hud .pub-tools.open{transform:translateX(0);opacity:1;visibility:visible}
#pub-hud .pub-tools h2{margin:0 0 5px;color:#f4d38c;font-family:Georgia,serif;font-size:22px}
#pub-hud .pub-tools p{font-size:12px;color:#d2d8cf}
#pub-hud .pub-tool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}
#pub-hud .pub-tool-grid .pub-btn{min-width:0;text-align:center;padding:13px 7px}
#pub-hud .pub-tools a.pub-btn{text-decoration:none;display:block;text-align:center}
#pub-hud .pub-bottom #pub-interact-button{border-radius:16px;border:2px solid #efcd8c;font-weight:900}
#item-modal:not([hidden]){animation:pubSlideIn .22s cubic-bezier(.2,.9,.25,1);background:#0a171e9e!important;backdrop-filter:blur(3px)}
#item-modal>div{border:2px solid #d6a75f!important;border-radius:18px!important;background:linear-gradient(140deg,#22362cfb,#18252bf9)!important;box-shadow:0 18px 50px #000b!important}
@keyframes pubSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
#npc-dialogue .dialogue-panel{background:#172b23f9!important;border:2px solid #d7a661!important;border-radius:18px!important}
#pub-hud .pub-scrim{position:absolute;inset:0;pointer-events:none}
#pub-hud.menu-open .pub-scrim{pointer-events:auto}
#pub-hud .pub-toast{position:absolute;left:50%;top:14%;transform:translateX(-50%);padding:9px 15px;border:1px solid #d5ad70;border-radius:10px;background:#1e3029ed;color:#ffe7b8;opacity:0;transition:opacity .2s;max-width:80vw;text-align:center}
#pub-hud .pub-toast.visible{opacity:1}
#mobile-controls{z-index:5!important}
 /* Touch devices use a dedicated bottom-right E button. Keep Bag and Beer
    in separate upper-right slots so none of the three overlap. */
 @media(pointer:coarse){
  #joystick{width:clamp(140px,36vmin,248px)!important;height:clamp(140px,36vmin,248px)!important}
  #pub-hud .pub-bottom{position:absolute!important;inset:0!important;display:block!important;pointer-events:none!important}
  #pub-hud .pub-bottom .pub-btn{position:absolute!important;right:max(10px,env(safe-area-inset-right))!important;left:auto!important;bottom:auto!important;min-width:62px!important;height:52px!important;pointer-events:auto!important}
  #pub-hud #pub-interact-button{display:none!important}
  #pub-hud #pub-fullscreen{display:flex}
  #pub-hud #pub-menu-toggle{top:max(62px,env(safe-area-inset-top))!important;width:58px!important;height:58px!important}
  #pub-hud #pub-quick-inventory{top:max(128px,calc(env(safe-area-inset-top) + 66px))!important}
  #mobile-controls .action{right:max(12px,env(safe-area-inset-right))!important;bottom:max(12px,env(safe-area-inset-bottom))!important}
  #pub-hud .pub-radial{bottom:75px!important}
 }
@media(max-width:650px){
 #pub-hud .pub-brand strong{font-size:12px}#pub-hud .pub-brand{padding:7px 9px}
 #pub-hud .pub-indicators{max-width:57%}#pub-hud .pub-chip{padding:6px;font-size:10px}
 #pub-hud .pub-bottom{bottom:max(8px,env(safe-area-inset-bottom));gap:6px;right:8px}
 #pub-hud .pub-bottom .pub-btn{min-width:48px;min-height:45px;padding:7px 9px;font-size:11px}
 #pub-hud #pub-menu-toggle{width:56px;height:56px}
 #pub-hud #pub-interact-button{display:none}

 #pub-hud .pub-radial{right:0;bottom:73px;transform-origin:85% 85%;scale:.82}
 #pub-hud .pub-tools{top:58px;max-height:75dvh}
 #instructions{bottom:68px;width:70vw;left:50%}
 #item-modal>div{width:min(96vw,480px)!important;max-height:85dvh!important}
}
@media(prefers-reduced-motion:reduce){#pub-hud *,#item-modal{animation:none!important;transition:none!important}}
`;

export const PUB_HUD_SCRIPT = String.raw`(()=>{
"use strict";
if(document.getElementById("pub-hud"))return;
const screen=document.getElementById("screen"),legacy=document.getElementById("hud");
if(!screen||!legacy)return;
const root=document.createElement("div");root.id="pub-hud";
root.innerHTML='<div class="pub-scrim"></div><div class="pub-top"><div class="pub-brand"><strong>🍻 MAESTRO ESCAPE</strong><small>MESTER UTCA · SINGLE PLAYER</small></div><div class="pub-indicators"><span class="pub-chip" id="pub-alcohol">🍺 Sober</span><span class="pub-chip" id="pub-coords">📍 Mester utca</span></div></div><div class="pub-toast" role="status" aria-live="polite"></div><button class="pub-btn" id="pub-fullscreen" type="button" aria-label="Enter fullscreen" title="Fullscreen">⛶</button><div class="pub-radial" id="pub-radial" role="menu" aria-label="Pub action wheel"><div class="pub-radial-disc"></div><div class="pub-radial-center">🍻</div></div><aside class="pub-tools" id="pub-tools" aria-label="Game controls"><h2>🍺 The Back Bar</h2><p>Controls, game tools and account access</p><div class="pub-tool-grid" id="pub-tool-grid"></div></aside><div class="pub-bottom"><button class="pub-btn" id="pub-quick-inventory" type="button">🎒<br>Bag</button><button class="pub-btn" id="pub-interact-button" type="button">E · Use</button><button class="pub-btn" id="pub-menu-toggle" type="button" aria-label="Open pub menu" aria-expanded="false">🍺</button></div>';
screen.append(root);
const $=sel=>root.querySelector(sel),radial=$("#pub-radial"),tools=$("#pub-tools"),toggle=$("#pub-menu-toggle"),scrim=$(".pub-scrim");
const toastNode=$(".pub-toast");let toastTimer=0;
const isMobile=()=>matchMedia("(pointer:coarse)").matches;
const fullscreen=$("#pub-fullscreen");
const syncFullscreen=()=>{const active=!!document.fullscreenElement;fullscreen.textContent=active?"⤢":"⛶";fullscreen.setAttribute("aria-label",active?"Exit fullscreen":"Enter fullscreen");fullscreen.title=active?"Exit fullscreen":"Fullscreen"};
fullscreen.onclick=async()=>{
 try{
  if(document.fullscreenElement){await document.exitFullscreen()}
  else if(screen.requestFullscreen){await screen.requestFullscreen()}
  else {toast("Fullscreen is not supported by this browser")}
 }catch(e){toast("Fullscreen is unavailable in this browser")}
 syncFullscreen();
};
document.addEventListener("fullscreenchange",syncFullscreen);
syncFullscreen();
screen.addEventListener("contextmenu",event=>event.preventDefault());
screen.addEventListener("dragstart",event=>{if(event.target.closest("img,canvas"))event.preventDefault()});
const toast=text=>{toastNode.textContent=text;toastNode.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove("visible"),2700)};
const findButton=identifier=>{
 if(identifier.startsWith("#"))return document.querySelector(identifier);
 return Array.from(legacy.querySelectorAll("button")).find(btn=>btn.textContent?.toLowerCase().includes(identifier.toLowerCase()));
};
const run=identifier=>{
 const button=findButton(identifier);
 if(!button||button.disabled){toast("This action is not available yet");return}
 button.click();
};
const interact=()=>{
 const button=document.getElementById("mobile-interact");
 if(button)button.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerType:"touch",cancelable:true}));
 else document.dispatchEvent(new KeyboardEvent("keydown",{key:"e",code:"KeyE",bubbles:true}));
};
const close=()=>{radial.classList.remove("open");tools.classList.remove("open");root.classList.remove("menu-open");toggle.setAttribute("aria-expanded","false");toggle.textContent="🍺"};
const openWheel=()=>{tools.classList.remove("open");radial.classList.add("open");root.classList.add("menu-open");toggle.setAttribute("aria-expanded","true");toggle.textContent="✕"};
const openTools=()=>{radial.classList.remove("open");tools.classList.add("open");root.classList.add("menu-open");toggle.setAttribute("aria-expanded","true");toggle.textContent="✕"};
toggle.onclick=()=>radial.classList.contains("open")||tools.classList.contains("open")?close():openWheel();
scrim.onclick=close;
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&(radial.classList.contains("open")||tools.classList.contains("open"))){e.preventDefault();e.stopImmediatePropagation();close()}},true);
const items=[
 {label:"Inventory",emoji:"🎒",action:()=>run("Inventory")},
 {label:"Interact",emoji:"🤝",action:interact},
 {label:"Group",emoji:"❤️",action:()=>run("#group-call-button")},
 {label:"Chat",emoji:"💬",action:()=>run("#maestro-chat-button")},
 {label:"Character",emoji:"🧍",action:()=>run("Character")},
 {label:"Vehicles",emoji:"🚙",action:()=>run("#vehicle-respawn-button")},
 {label:"Back bar",emoji:"⚙️",action:openTools},
 {label:"Settings",emoji:"🛠️",action:()=>location.assign("/settings"),desktopOnly:true}
];
items.filter(item=>!item.desktopOnly||!isMobile()).forEach((item,i)=>{
 const angle=(-90+i*45)*Math.PI/180;
 const x=163+119*Math.cos(angle)-39.5,y=163+119*Math.sin(angle)-39.5;
 const b=document.createElement("button");b.type="button";b.className="pub-radial-option";b.setAttribute("role","menuitem");
 b.style.left=x+"px";b.style.top=y+"px";
 b.innerHTML='<span class="pub-emoji">'+item.emoji+'</span><span>'+item.label+'</span>';
 b.onclick=()=>{close();item.action()};radial.append(b);
});
$("#pub-quick-inventory").onclick=()=>run("Inventory");
$("#pub-interact-button").onclick=interact;
const createTool=(name,fn)=>{
 const b=document.createElement("button");b.type="button";b.className="pub-btn";b.textContent=name;b.onclick=()=>{close();fn()};$("#pub-tool-grid").append(b);return b;
};
createTool("🎒 Inventory",()=>run("Inventory"));
createTool("🤝 Interact",interact);
createTool("💬 Chat",()=>run("#maestro-chat-button"));
createTool("❤️ Call group",()=>run("#group-call-button"));
createTool("🧍 Character",()=>run("Character"));
createTool("🚙 Respawn vehicles",()=>run("#vehicle-respawn-button"));
createTool("🚶 Respawn player",()=>run("#reset"));
createTool("🍺 Test drunk +1",()=>run("#drunk-test-next"));
createTool("💧 Sober",()=>run("Sober"));
createTool("🔄 Reset test",()=>run("#maestro-reset-solo"));
createTool("🔗 Copy test link",()=>run("Copy test link"));
const links=[["⚙ Settings","/settings"],["👤 Register","/account/register"],["🔐 Sign in","/account/login"]].filter(([,href])=>href!=="/settings"||!isMobile());
for(const [label,href] of links){
 const a=document.createElement("a");a.href=href;a.className="pub-btn";a.textContent=label;$("#pub-tool-grid").append(a);
}
const sync=()=>{
 const src=document.getElementById("drunk-status");
 if(src){const next=(src.textContent||"").trim();if(next)$("#pub-alcohol").textContent=next}
 const coord=document.getElementById("coords");
 if(coord){const val=(coord.textContent||"").trim();if(val)$("#pub-coords").textContent="📍 "+val}
};
const observer=new MutationObserver(sync);
for(const id of ["drunk-status","coords"]){const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,characterData:true,subtree:true})}
sync();
window.MaestroPubHUD={close,openWheel,openTools,toast};
})();`;
