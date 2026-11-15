// MaestroEscape contextual Hide & Peek definitions. Initial pub tables follow real collision rectangles.
// Unverified basement tables, trees and bar are disabled until explicitly positioned in Settings.
export const HIDE_POINT_DEFS=[
  {
    "id": "pub_left",
    "roomId": "pub",
    "type": "table",
    "label": "Window table",
    "x": 110,
    "y": 530,
    "enabled": 1,
    "peekSide": "right"
  },
  {
    "id": "pub_middle",
    "roomId": "pub",
    "type": "table",
    "label": "Central table",
    "x": 390,
    "y": 695,
    "enabled": 1,
    "peekSide": "right"
  },
  {
    "id": "pub_right",
    "roomId": "pub",
    "type": "table",
    "label": "Side table",
    "x": 1020,
    "y": 435,
    "enabled": 1,
    "peekSide": "bottom"
  },
  {
    "id": "pub_upper",
    "roomId": "pub",
    "type": "table",
    "label": "Upper table",
    "x": 900,
    "y": 280,
    "enabled": 1,
    "peekSide": "left"
  },
  {
    "id": "pub_bar",
    "roomId": "pub",
    "type": "bar",
    "label": "Behind bar counter",
    "x": 0,
    "y": 0,
    "enabled": 0,
    "peekSide": "top"
  },
  {
    "id": "basement_table_1",
    "roomId": "basement",
    "type": "table",
    "label": "Basement table 1",
    "x": 1248,
    "y": 365,
    "enabled": 1,
    "peekSide": "bottom"
  },
  {
    "id": "basement_table_2",
    "roomId": "basement",
    "type": "table",
    "label": "Basement table 2",
    "x": 1530,
    "y": 365,
    "enabled": 1,
    "peekSide": "bottom"
  },
  {
    "id": "basement_table_3",
    "roomId": "basement",
    "type": "table",
    "label": "Basement table 3",
    "x": 1248,
    "y": 673,
    "enabled": 1,
    "peekSide": "bottom"
  },
  {
    "id": "street_tree_1",
    "roomId": "street",
    "type": "tree",
    "label": "Street tree 1",
    "x": 0,
    "y": 0,
    "enabled": 0,
    "peekSide": "left"
  },
  {
    "id": "street_tree_2",
    "roomId": "street",
    "type": "tree",
    "label": "Street tree 2",
    "x": 0,
    "y": 0,
    "enabled": 0,
    "peekSide": "right"
  },
  {
    "id": "street_tree_3",
    "roomId": "street",
    "type": "tree",
    "label": "Street tree 3",
    "x": 0,
    "y": 0,
    "enabled": 0,
    "peekSide": "left"
  }
];
export const HIDE_RUNTIME_SCRIPT=String.raw`
class MaestroHideController {
 constructor(scene,character,player,settings,collides,getRoom){
  this.scene=scene;this.character=character;this.player=player;
  this.cfg=settings;this.collides=collides;this.getRoom=getRoom;
  this.state="NORMAL";this.current=null;this.timer=null;
  this.graphics=scene.make.graphics({x:0,y:0},false);
  this.geometryMask=this.graphics.createGeometryMask();
  this.lastRoom=getRoom();this.cachedPoint=null;
 }
 value(def,field){return this.cfg("hide.point."+def.id+"."+field)}
 point(def){
  return {...def,x:this.value(def,"x"),y:this.value(def,"y"),
   hideX:this.value(def,"hideX"),hideY:this.value(def,"hideY"),
   exitX:this.value(def,"exitX"),exitY:this.value(def,"exitY"),
   interactionRadius:this.value(def,"radius")>0?this.value(def,"radius"):this.cfg("hide.radius"),
   peekSide:["left","right","top","bottom"][Math.max(0,Math.min(3,this.value(def,"side")|0))],
   enabled:this.value(def,"enabled")>=0.5};
 }
 points(){return HIDE_POINT_DEFS.map(d=>this.point(d)).filter(p=>p.enabled&&p.roomId===this.getRoom())}
 nearest(){
  if(this.state!=="NORMAL"||!this.cfg("hide.enabled"))return null;
  const loc=this.player;
  return this.points().map(p=>({point:p,d:Math.hypot(loc.x-p.x,loc.y-p.y)}))
   .filter(e=>e.d<=Math.max(12,e.point.interactionRadius||this.cfg("hide.radius")))
   .sort((a,b)=>a.d-b.d)[0]?.point||null;
 }
 prompt(){
  if(this.state==="HIDDEN")return "E · Exit hiding";
  if(this.state!=="NORMAL")return null;
  return this.cfg("hide.showPrompts")&&this.nearest()?"E · Hide":null;
 }
 get isHidden(){return this.state==="HIDDEN"||this.state==="ENTERING_HIDE"}
 setFlags(hidden){this.player.isHidden=hidden;this.player.visibilityFactor=hidden?Math.max(.03,Math.min(.15,this.cfg("hide.visiblePercent")/100)):1}
 clearTimer(){if(this.timer){this.timer.remove(false);this.timer=null}}
 reset(){
  this.clearTimer();this.scene.tweens.killTweensOf(this.character);
  this.state="NORMAL";this.current=null;this.cachedPoint=null;this.savedPosition=null;
  if(this.character?.active){this.character.clearMask();this.character.setAlpha(1)}
  this.graphics?.clear();this.setFlags(false);
 }
 enter(){
  if(this.state!=="NORMAL"||!this.cfg("hide.enabled"))return false;
  const point=this.nearest();if(!point)return false;
  if(!this.character?.active||!this.character.visible)return false;
  if(this.collides(this.player.x,this.player.y))return false;
  const start={x:this.player.x,y:this.player.y};
  const target={x:point.hideX,y:point.hideY};
  const distance=Math.hypot(start.x-target.x,start.y-target.y);
  // Slide only along a fully walkable line, at most the configured interaction radius.
  // Never leap through furniture, walls, counters or other players.
  if(distance>Math.max(12,point.interactionRadius||this.cfg("hide.radius")))return false;
  const steps=Math.max(1,Math.ceil(distance)); // 1px steps prevent skipping thin collision boundaries
  for(let n=1;n<=steps;n++){
   const x=start.x+(target.x-start.x)*n/steps,y=start.y+(target.y-start.y)*n/steps;
   if(this.collides(x,y))return false;
  }
  this.savedPosition=start;
  this.current=point;this.lastRoom=this.getRoom();this.state="ENTERING_HIDE";
  this.character.anims?.stop();this.setFlags(true);
  this.refreshMask();
  const duration=Math.max(100,Math.min(500,this.cfg("hide.animationMs")));
  this.scene.tweens.add({targets:this.character,x:target.x,y:target.y,duration,ease:"Sine.easeInOut",
   onUpdate:()=>this.refreshMask()});
  this.timer=this.scene.time.delayedCall(duration,()=>{
   this.timer=null;if(this.state==="ENTERING_HIDE"){
    this.player.x=target.x;this.player.y=target.y;
    this.character.setPosition(target.x,target.y);
    this.state="HIDDEN";this.character.setAlpha(1);this.refreshMask();
   }
  });
  return true;
 }
 safeExit(){
  const p=this.current;if(!p)return null;
  const desired={x:p.exitX,y:p.exitY};
  const original=this.savedPosition||{x:this.player.x,y:this.player.y};
  // Return to the original walkable approach after the crouching animation.
  if(!this.collides(original.x,original.y))return original;
  if(!this.collides(desired.x,desired.y)&&Math.hypot(desired.x-original.x,desired.y-original.y)<65)return desired;
  for(let radius=8;radius<=65;radius+=8)for(let a=0;a<Math.PI*2;a+=Math.PI/8){
   const x=original.x+Math.cos(a)*radius,y=original.y+Math.sin(a)*radius;
   if(!this.collides(x,y))return {x,y};
  }
  return null;
 }
 exit(){
  if(this.state!=="HIDDEN")return false;
  const safe=this.safeExit();if(!safe)return false;
  this.state="EXITING_HIDE";
  const duration=Math.max(100,Math.min(500,this.cfg("hide.animationMs")));
  this.scene.tweens.add({targets:this.character,x:safe.x,y:safe.y,duration,ease:"Sine.easeInOut",
   onUpdate:()=>this.refreshMask()});
  this.timer=this.scene.time.delayedCall(duration,()=>{
   this.timer=null;if(this.state!=="EXITING_HIDE")return;
   this.player.x=safe.x;this.player.y=safe.y;
   this.character.setPosition(safe.x,safe.y);this.reset();
  });
  return true;
 }
 interact(){
  if(this.state==="HIDDEN")return this.exit();
  if(this.state!=="NORMAL")return true;
  return this.enter();
 }
 refreshMask(){
  if(!this.current||!this.character?.active)return;
  const obj=this.character;
  const percentage=Math.max(.03,Math.min(.15,this.cfg("hide.visiblePercent")/100));
  const width=Math.max(7,obj.displayWidth||24),height=Math.max(10,obj.displayHeight||48);
  const top=obj.y-height;
  // Geometry mask, never sprite opacity: expose only a narrow, furniture-adjacent peek.
  const pw=Math.max(3,width*(this.current.type==="tree"?percentage*1.7:.52));
  const ph=Math.max(2.5,height*percentage);
  let left=obj.x-pw/2,ptop=top;
  if(this.current.peekSide==="left")left=obj.x-width/2;
  if(this.current.peekSide==="right")left=obj.x+width/2-pw;
  if(this.current.peekSide==="bottom")ptop=top+ph*.45;
  this.graphics.clear().fillStyle(0xffffff,1).fillRect(left,ptop,pw,ph);
  obj.setMask(this.geometryMask);
 }
 update(){
  if(this.getRoom()!==this.lastRoom&&this.state!=="NORMAL")this.reset();
  this.lastRoom=this.getRoom();
  if(!this.cfg("hide.enabled")&&this.state!=="NORMAL")this.reset();
  if(this.isHidden||this.state==="EXITING_HIDE")this.refreshMask();
 }
 shutdown(){
  this.reset();this.graphics?.destroy();this.graphics=null;
 }
}
`;
