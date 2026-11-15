// Mobile landscape: native orientation lock when available, CSS-rotation fallback for portrait.
export const MOBILE_LANDSCAPE_SCRIPT = `(()=>{
"use strict";
if(window.MaestroLandscape)return;
const screen=document.getElementById("screen");
if(!screen)return;
const style=document.createElement("style");
style.id="maestro-landscape-style";
style.textContent=\`
@media (pointer:coarse) and (orientation:portrait){
 html,body{overflow:hidden!important;width:100vw!important;height:100dvh!important;overscroll-behavior:none}
 body.maestro-portrait-landscape #screen{
  position:fixed!important;inset:auto!important;
  top:0!important;left:100vw!important;
  width:100dvh!important;height:100vw!important;
  max-width:none!important;max-height:none!important;
  margin:0!important;transform-origin:top left!important;
  transform:rotate(90deg)!important;aspect-ratio:auto!important;
  border:0!important;border-radius:0!important;
 }
 body.maestro-portrait-landscape #screen canvas{width:100%!important;height:100%!important;object-fit:cover!important}
 body.maestro-portrait-landscape #instructions{display:none!important}
 body.maestro-portrait-landscape #pub-hud .pub-bottom{right:max(8px,env(safe-area-inset-right))!important;bottom:9px!important}
 body.maestro-portrait-landscape #pub-hud .pub-radial{right:0!important;bottom:66px!important;scale:.69!important;transform-origin:85% 90%}
 body.maestro-portrait-landscape #pub-hud .pub-tools{top:56px!important;max-height:calc(100% - 64px)!important}
 body.maestro-portrait-landscape #maestro-inventory-wheel .wheel-wrap{width:min(74vh,74vw,340px)!important;height:min(74vh,74vw,340px)!important}
 body.maestro-portrait-landscape #mobile-controls{display:block!important}
 body.maestro-portrait-landscape #joystick{bottom:6%!important;left:3.5%!important}
}
\`;
document.head.append(style);
const coarse=()=>matchMedia("(pointer:coarse)").matches;
const rotated=()=>coarse()&&matchMedia("(orientation:portrait)").matches;
function update(){
 const isRotated=rotated();
 document.body.classList.toggle("maestro-portrait-landscape",isRotated);
 document.documentElement.dataset.gameRotated=isRotated?"true":"false";
 window.dispatchEvent(new CustomEvent("maestro-mobile-landscape",{detail:{rotated:isRotated}}));
}
async function lockOrientation(){
 if(!coarse()||!window.screen?.orientation?.lock)return false;
 try{
  await window.screen.orientation.lock("landscape");
  update();return true;
 }catch(e){return false} // iOS and non-fullscreen browsers use the CSS fallback.
}
window.MaestroLandscape={isRotated:rotated,refresh:update,tryLock:lockOrientation};
addEventListener("resize",update,{passive:true});
addEventListener("orientationchange",update,{passive:true});
window.screen?.orientation?.addEventListener?.("change",update);
document.addEventListener("fullscreenchange",()=>{void lockOrientation().then(update)});
update();
})();`;
