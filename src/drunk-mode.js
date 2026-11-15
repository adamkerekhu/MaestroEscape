// Independent, frame-time-driven intoxication state for both local and multiplayer clients.
export const DRUNK_DEFAULTS=Object.freeze({
 "drunkMode.enabled":1,"drunkMode.maxLevel":3,"drunkMode.recoverySecondsPerLevel":20,
 "drunkMode.visualsEnabled":1,"drunkMode.reduceMotion":0,
 "drunkMode.level1SwayDeg":0.4,"drunkMode.level2SwayDeg":0.4,"drunkMode.level3SwayDeg":2,
 "drunkMode.level1ZoomPulsePct":0.3,"drunkMode.level2ZoomPulsePct":0.3,"drunkMode.level3ZoomPulsePct":1.5,
 "drunkMode.swayCycleSeconds":3,"drunkMode.level2MistakesPerMinute":8,"drunkMode.level3MistakesPerMinute":20,
 "drunkMode.level2MaxDeviationDeg":20,"drunkMode.level3MaxDeviationDeg":50,
 "drunkMode.mistakeDurationMs":550,"drunkMode.transitionMs":650,"drunkMode.showStatus":1
});
export const DRUNK_RANGES=Object.freeze({"enabled":[0,1],"maxLevel":[1,3],"recoverySecondsPerLevel":[5,120],"visualsEnabled":[0,1],"reduceMotion":[0,1],"level1SwayDeg":[0,3],"level2SwayDeg":[0,3],"level3SwayDeg":[0,5],"level1ZoomPulsePct":[0,2],"level2ZoomPulsePct":[0,2],"level3ZoomPulsePct":[0,4],"swayCycleSeconds":[1,8],"level2MistakesPerMinute":[0,30],"level3MistakesPerMinute":[0,45],"level2MaxDeviationDeg":[0,45],"level3MaxDeviationDeg":[0,80],"mistakeDurationMs":[150,1500],"transitionMs":[0,1500],"showStatus":[0,1]});
export class DrunkMode {
 constructor(getSettings=()=>DRUNK_DEFAULTS, random=Math.random){
  this.getSettings=getSettings;this.random=random;this.level=0;this.elapsed=0;this.phase=0;
  this.angle=0;this.target=0;this.episode=0;this.nextMistake=0;this.visual=0;
  this.paused=false;this.lastEventIds=new Set();this.recoverySetting=this.config("recoverySecondsPerLevel");
 }
 config(key){
  const raw=this.getSettings()?.["drunkMode."+key],n=Number(raw);
  const fallback=DRUNK_DEFAULTS["drunkMode."+key];
  const [min,max]=DRUNK_RANGES[key]||[0,Infinity];
  if(raw===undefined||raw===null||!Number.isFinite(n))return fallback;
  const safe=Math.min(max,Math.max(min,n));
  return ["enabled","visualsEnabled","reduceMotion","showStatus"].includes(key)?Number(safe>=.5):
   key==="maxLevel"?Math.round(safe):safe;
 }
 reset(){this.level=0;this.elapsed=0;this.phase=0;this.angle=0;this.target=0;this.episode=0;this.nextMistake=0;this.visual=0;this.lastEventIds.clear();}
 pause(){this.paused=true;}
 resume(){this.paused=false;}
 onBeerFinished(eventId){
  if(!this.config("enabled"))return false;
  if(eventId!=null){if(this.lastEventIds.has(eventId))return false;this.lastEventIds.add(eventId);if(this.lastEventIds.size>300)this.lastEventIds.delete(this.lastEventIds.values().next().value);}
  this.level=Math.min(this.config("maxLevel"),this.level+1);
  this.elapsed=0;this.nextMistake=0;return true;
 }
 setConfig(){
  if(!this.config("enabled")){this.reset();return;}
  this.level=Math.min(this.level,this.config("maxLevel"));
  const threshold=this.config("recoverySecondsPerLevel");
  if(threshold!==this.recoverySetting){
   this.elapsed=Math.min(this.elapsed,Math.max(0,threshold*1000-1));
   this.recoverySetting=threshold;
  }
 }
 update(deltaMs,paused=false){
  this.setConfig();
  const dt=Math.max(0,Math.min(1000,Number(deltaMs)||0));
  if(paused||this.paused)return;
  this.phase+=dt/1000;
  if(this.level){
   this.elapsed+=dt;
   const threshold=Math.max(1,this.config("recoverySecondsPerLevel"))*1000;
   while(this.level>0&&this.elapsed>=threshold){this.elapsed-=threshold;this.level--;}
   if(!this.level)this.elapsed=0;
  }
  const fade=this.config("transitionMs")||0;
  const f=fade?Math.min(1,dt/fade):1;
  this.visual+=(this.level-this.visual)*f;
  if(this.level<2){this.target=0;this.episode=0;this.nextMistake=0;}
  else{
   this.episode=Math.max(0,this.episode-dt);
   if(this.episode===0)this.target=0;
   this.nextMistake-=dt;
   if(this.nextMistake<=0){
    const rate=this.config(this.level===2?"level2MistakesPerMinute":"level3MistakesPerMinute");
    if(rate>0){
     const maxAngle=this.config(this.level===2?"level2MaxDeviationDeg":"level3MaxDeviationDeg");
     this.target=(this.random()<.5?-1:1)*maxAngle*(.4+this.random()*.6)*Math.PI/180;
     this.episode=this.config("mistakeDurationMs");
     this.nextMistake=Math.max(400,-Math.log(Math.max(.001,1-this.random()))*60000/rate);
    }else{this.nextMistake=1000;}
   }
  }
  this.angle+=(this.target-this.angle)*Math.min(1,dt/150);
 }
 direction(x,y){
  if(!this.config("enabled")||this.level<2||(!x&&!y))return {x,y};
  const c=Math.cos(this.angle),s=Math.sin(this.angle);
  const nx=x*c-y*s,ny=x*s+y*c;
  const length=Math.hypot(nx,ny);
  return length>1?{x:nx/length,y:ny/length}:{x:nx,y:ny};
 }
 camera(baseZoom){
  if(!this.config("enabled")||!this.config("visualsEnabled")||this.config("reduceMotion")||this.visual<.001)
   return {rotation:0,zoom:baseZoom};
  const l=Math.max(1,Math.min(3,Math.round(this.visual)));
  const sway=this.config("level"+l+"SwayDeg")*Math.PI/180;
  const zoom=this.config("level"+l+"ZoomPulsePct")/100;
  const wave=this.phase*2*Math.PI/Math.max(.5,this.config("swayCycleSeconds"));
  const blend=Math.min(1,this.visual);
  return {rotation:Math.sin(wave)*sway*blend,zoom:baseZoom*(1+Math.sin(wave*.8)*zoom*blend)};
 }
 getState(){
  const seconds=this.level?Math.max(0,Math.ceil(this.config("recoverySecondsPerLevel")-this.elapsed/1000)):0;
  return {level:this.level,maxLevel:this.config("maxLevel"),seconds};
 }
}
export const DRUNK_MODE_CLIENT_SCRIPT="const DRUNK_DEFAULTS="+JSON.stringify(DRUNK_DEFAULTS)+";const DRUNK_RANGES="+JSON.stringify(DRUNK_RANGES)+";"+DrunkMode.toString()+";window.MaestroDrunkMode=DrunkMode;";
