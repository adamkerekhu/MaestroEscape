const MAP={w:1000,h:650,jacket:{x:286,y:225},keys:{x:505,y:255},car:{x:845,y:155},taxi:{x:857,y:510},bubi:{x:656,y:526},spawn:{x:180,y:415}};
const WALLS=[{x:0,y:0,w:1000,h:22},{x:0,y:628,w:1000,h:22},{x:0,y:0,w:22,h:650},{x:978,y:0,w:22,h:650},{x:95,y:65,w:485,h:16},{x:95,y:65,w:16,h:225},{x:95,y:345,w:16,h:170},{x:95,y:499,w:485,h:16},{x:565,y:65,w:16,h:170},{x:565,y:320,w:16,h:195},{x:195,y:110,w:170,h:35},{x:195,y:325,w:150,h:42},{x:390,y:340,w:100,h:90},{x:385,y:125,w:105,h:38},{x:220,y:430,w:145,h:35}];
const near=(a,b,d=58)=>Math.hypot(a.x-b.x,a.y-b.y)<d;
const clean=s=>String(s||"").replace(/[<>]/g,"").slice(0,18);
const rnd=()=>Math.random().toString(36).slice(2,9).toUpperCase();
const routePoints={car:MAP.car,taxi:MAP.taxi,bubi:MAP.bubi};
export default {async fetch(request,env){
 const u=new URL(request.url);
 if(u.pathname==="/health")return Response.json({ok:true,game:"MaestroEscape",mode:"multiplayer"});
 if(u.pathname.startsWith("/room/")&&u.pathname.endsWith("/ws")){
  if(request.headers.get("Upgrade")!=="websocket")return new Response("WebSocket required",{status:426});
  const room=u.pathname.split("/")[2]?.replace(/[^A-Z0-9]/gi,"").slice(0,8)||"PUBLIC";
  const stub=env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(room));
  return stub.fetch(request);
 }
 return new Response(HTML,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
}};
export class GameRoom{
 constructor(state,env){this.state=state;this.env=env;this.clients=new Map();this.players=new Map();this.started=false;this.escaper=null;this.host=null;this.ends=0;this.winner=null;this.routeState={taxi:0,bubi:0};this.blocked={car:0,taxi:0,bubi:0};}
 async fetch(req){
  if(req.headers.get("Upgrade")!=="websocket")return new Response("Upgrade required",{status:426});
  const pair=new WebSocketPair();const [client,server]=Object.values(pair);server.accept();
  const id=rnd();const p={id,name:"Player",x:MAP.spawn.x+Math.random()*100,y:MAP.spawn.y+Math.random()*60,hits:0,jacket:false,keys:false,cooldown:0,sabotageCooldown:0};
  this.players.set(id,p);this.clients.set(id,server);if(!this.host)this.host=id;
  server.addEventListener("message",e=>{try{this.receive(id,JSON.parse(e.data))}catch(err){this.send(id,{type:"error",message:"Invalid action"})}});
  server.addEventListener("close",()=>this.leave(id));server.addEventListener("error",()=>this.leave(id));
  this.send(id,{type:"welcome",id,host:id===this.host});this.broadcast();
  return new Response(null,{status:101,webSocket:client});
 }
 send(id,payload){try{this.clients.get(id)?.send(JSON.stringify(payload))}catch{}}
 leave(id){this.clients.delete(id);this.players.delete(id);if(id===this.host)this.host=this.players.keys().next().value||null;if(id===this.escaper&&this.started&&!this.winner)this.winner="hunters";if(!this.players.size){this.started=false;this.winner=null;}this.broadcast()}
 collide(x,y){if(x<35||y<35||x>965||y>615)return true;return WALLS.some(w=>x+13>w.x&&x-13<w.x+w.w&&y+13>w.y&&y-13<w.y+w.h)}
 receive(id,msg){const p=this.players.get(id);if(!p||!msg||typeof msg!=="object")return;
  const now=Date.now();if(this.started&&this.ends<=now&&!this.winner)this.winner="hunters";
  if(msg.type==="name"){p.name=clean(msg.name)||"Player";}
  if(msg.type==="start"&&id===this.host&&this.players.size>=2){
    this.started=true;this.winner=null;this.ends=now+6*60000;this.escaper=[...this.players.keys()][Math.floor(Math.random()*this.players.size)];
    this.blocked={car:0,taxi:0,bubi:0};this.routeState={taxi:0,bubi:0};
    for(const q of this.players.values()){q.x=MAP.spawn.x+Math.random()*100;q.y=MAP.spawn.y+Math.random()*60;q.hits=0;q.jacket=false;q.keys=false;q.cooldown=0;q.sabotageCooldown=0;}
  }
  if(msg.type==="move"&&this.started&&!this.winner){const dx=Math.max(-1,Math.min(1,Number(msg.dx)||0)),dy=Math.max(-1,Math.min(1,Number(msg.dy)||0));const length=Math.hypot(dx,dy)||1;const dt=Math.min(0.12,Math.max(0,(now-(p.lastMove||now-70))/1000));p.lastMove=now;const speed=145*dt;const nx=p.x+dx/length*speed,ny=p.y+dy/length*speed;if(!this.collide(nx,p.y))p.x=nx;if(!this.collide(p.x,ny))p.y=ny;}
  if(msg.type==="action"&&this.started&&!this.winner){
    if(id===this.escaper){
      if(near(p,MAP.jacket)&&!p.jacket){p.jacket=true;this.send(id,{type:"notice",message:"Jacket collected! Find a way home."});}
      else if(near(p,MAP.keys)&&!p.keys){p.keys=true;this.send(id,{type:"notice",message:"Car keys collected."});}
      else if(p.jacket)for(const route of ["car","taxi","bubi"])if(near(p,routePoints[route])&&now>=this.blocked[route]){
        if(route==="car"&&p.keys){this.winner="escaper";this.winRoute="car"}
        else if(route==="car")this.send(id,{type:"notice",message:"Find your car keys first!"});
        else if(route==="taxi"){if(!this.routeState.taxi){this.routeState.taxi=now+8500;this.send(id,{type:"notice",message:"Taxi called. Stay at pickup for 8 seconds!"})}else if(now>=this.routeState.taxi){this.winner="escaper";this.winRoute="taxi"}else this.send(id,{type:"notice",message:"Taxi is on its way..."})}
        else if(route==="bubi"){if(!this.routeState.bubi){this.routeState.bubi=now+3500;this.send(id,{type:"notice",message:"Unlocking Bubi. Wait 4 seconds."})}else if(now>=this.routeState.bubi){this.winner="escaper";this.winRoute="bubi"}else this.send(id,{type:"notice",message:"Bike is unlocking..."})}
        break;
      }else if(p.jacket)this.send(id,{type:"notice",message:"Route sabotaged! Try another route."});
    }else if(now>=p.sabotageCooldown){for(const route of ["car","taxi","bubi"])if(near(p,routePoints[route])){this.blocked[route]=now+15000;p.sabotageCooldown=now+22000;if(route==="taxi")this.routeState.taxi=0;if(route==="bubi")this.routeState.bubi=0;this.send(id,{type:"notice",message:route.toUpperCase()+" sabotaged for 15 seconds!"});break}}
  }
  if(msg.type==="punch"&&this.started&&!this.winner&&id!==this.escaper&&now>=p.cooldown){p.cooldown=now+2300;const target=this.players.get(this.escaper);if(target&&near(p,target,49)){target.hits++;this.send(id,{type:"notice",message:"Hit! Escaper "+target.hits+"/3"});if(target.hits>=3)this.winner="hunters";else{target.x=MAP.spawn.x+45;target.y=MAP.spawn.y+35;this.send(this.escaper,{type:"notice",message:"Knocked down! Back to the pub."})}}else this.send(id,{type:"notice",message:"Nobody in punch range!"})}
  this.broadcast();
 }
 broadcast(){const now=Date.now(),base={type:"state",started:this.started,winner:this.winner,winRoute:this.winRoute||null,host:this.host,ends:this.ends,players:[...this.players.values()].map(({id,name,x,y,hits})=>({id,name,x,y,hits})),blocked:this.blocked,now};for(const id of this.clients.keys()){const p=this.players.get(id);this.send(id,{...base,role:!this.started?null:id===this.escaper?"escaper":"hunter",jacket:!!p?.jacket,keys:!!p?.keys})}}
}
const HTML=String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maestro Escape</title><style>body{margin:0;background:#0d1220;color:#fff;font:15px system-ui}header{max-width:1050px;margin:10px auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:0 10px}h1{font-size:22px;margin:0;color:#ffd28b}input,button{font:inherit;border-radius:8px;padding:9px;border:1px solid #50566b}input{max-width:135px;background:#232a3d;color:#fff}button{background:#f3bd62;cursor:pointer;font-weight:700}button:disabled{opacity:.35;cursor:not-allowed}#game{width:min(100%,1050px);margin:auto;border:2px solid #43475d;border-radius:10px;overflow:hidden}#status,#help{max-width:1050px;margin:10px auto;padding:0 12px}#status{color:#f5c977;font-weight:bold}#help{color:#abb3c7}kbd{color:white;background:#353d56;padding:2px 5px;border-radius:3px}</style></head><body><header><h1>🍻 MAESTRO ESCAPE</h1><input id="nick" placeholder="Nickname" maxlength="18"><input id="room" placeholder="ROOM CODE" maxlength="8" value="MAESTRO"><button id="join">Join room</button><button id="start" disabled>Start round</button><span id="count"></span></header><div id="status">Enter your nickname, then join a room.</div><div id="game"></div><div id="help"><kbd>WASD</kbd> Move &nbsp; <kbd>E</kbd> Interact / sabotage &nbsp; <kbd>SPACE</kbd> Punch (hunters). Escaper: collect jacket, then take car, taxi or Bubi. Car requires keys. Hunters win with 3 hits or when time expires.</div><script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script><script>
let socket=null,myId=null,world={players:[],started:false},scene=null,keys=null,lastMove=0,notice="",noticeEnd=0;
const $=x=>document.getElementById(x),walls=[{"x":0,"y":0,"w":1000,"h":22},{"x":0,"y":628,"w":1000,"h":22},{"x":0,"y":0,"w":22,"h":650},{"x":978,"y":0,"w":22,"h":650},{"x":95,"y":65,"w":485,"h":16},{"x":95,"y":65,"w":16,"h":225},{"x":95,"y":345,"w":16,"h":170},{"x":95,"y":499,"w":485,"h":16},{"x":565,"y":65,"w":16,"h":170},{"x":565,"y":320,"w":16,"h":195},{"x":195,"y":110,"w":170,"h":35},{"x":195,"y":325,"w":150,"h":42},{"x":390,"y":340,"w":100,"h":90},{"x":385,"y":125,"w":105,"h":38},{"x":220,"y":430,"w":145,"h":35}];
const locs=[["🧥 JACKET",286,225],["🔑 KEYS",505,255],["🚗 CAR",845,155],["🚕 TAXI",857,510],["🚲 BUBI",656,526]];
function send(type,data={}){if(socket?.readyState===1)socket.send(JSON.stringify({type,...data}))}
$("join").onclick=()=>{if(socket)socket.close();const room=$("room").value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)||"MAESTRO";$("room").value=room;socket=new WebSocket((location.protocol==="https:"?"wss:":"ws:")+"//"+location.host+"/room/"+room+"/ws");socket.onopen=()=>send("name",{name:$("nick").value||"Player"});socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==="welcome")myId=m.id;if(m.type==="notice"){notice=m.message;noticeEnd=Date.now()+3500}if(m.type==="state"){world=m;$("start").disabled=world.host!==myId||world.players.length<2;$("count").textContent=world.players.length+" players";const seconds=Math.max(0,Math.ceil((world.ends-Date.now())/1000));$("status").textContent=world.winner?(world.winner==="escaper"?"🏆 Escaper got away via "+world.winRoute:"🏆 Hunters kept the party going!"):world.started?("Role: "+(world.role==="escaper"?"🏃 ESCAPER":"🍺 HUNTER")+" | "+seconds+"s left"+(world.role==="escaper"?" | Jacket: "+(world.jacket?"✓":"✗")+" Keys: "+(world.keys?"✓":"✗"):"")):"Lobby: waiting for host to start";}};socket.onclose=()=>{$("status").textContent="Disconnected. Rejoin to play.";myId=null};socket.onerror=()=>{$("status").textContent="Connection failed. Check Worker/Durable Object deployment."}};
$("start").onclick=()=>send("start");
class PubScene extends Phaser.Scene{constructor(){super("Pub")}create(){scene=this;this.g=this.add.graphics();this.labels=this.add.container(0,0);this.cameras.main.setBounds(0,0,1000,650);keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE");this.input.keyboard.on("keydown-E",()=>send("action"));this.input.keyboard.on("keydown-SPACE",()=>send("punch"));}update(time){const dx=(keys.D.isDown||keys.RIGHT.isDown?1:0)-(keys.A.isDown||keys.LEFT.isDown?1:0),dy=(keys.S.isDown||keys.DOWN.isDown?1:0)-(keys.W.isDown||keys.UP.isDown?1:0);if(time-lastMove>65&&world.started&&!world.winner){send("move",{dx,dy});lastMove=time}this.renderWorld()}renderWorld(){let g=this.g;g.clear();g.fillStyle(0x232a3c);g.fillRect(0,0,1000,650);g.fillStyle(0x415164);g.fillRect(600,25,370,598);g.fillStyle(0x6c4d37);g.fillRect(110,85,455,409);g.lineStyle(3,0x927055);g.strokeRect(110,85,455,409);g.fillStyle(0x514a42);for(const w of walls)g.fillRect(w.x,w.y,w.w,w.h);g.fillStyle(0x2b384d);g.fillRect(630,60,270,70);g.fillStyle(0x698360);g.fillRect(620,480,290,110);g.fillStyle(0x313c58);g.fillRect(80,532,500,84);this.labels.removeAll(true);const txt=(x,y,t,size=14,color="#ffffff")=>this.labels.add(this.add.text(x,y,t,{fontFamily:"Arial",fontSize:size,color,stroke:"#111827",strokeThickness:3}).setOrigin(.5));txt(320,47,"MAESTRO PUB",23,"#ffcf86");txt(775,37,"STREET",14);for(const [name,x,y]of locs){g.fillStyle(0xdaa85a);g.fillCircle(x,y,22);txt(x,y-40,name,13);if(world.blocked){const r=name.includes("CAR")?"car":name.includes("TAXI")?"taxi":name.includes("BUBI")?"bubi":null;if(r&&world.blocked[r]>Date.now())txt(x,y+34,"BLOCKED",11,"#ff6565")}}const npcs=[[165,190],[260,310],[440,210],[450,460],[155,460],[335,285],[410,270]];for(let i=0;i<npcs.length;i++){const [x,y]=npcs[i];g.fillStyle(0x719b9d);g.fillCircle(x,y,12);txt(x,y-24,"Guest "+(i+1),10,"#becfce")}for(const p of world.players){let me=p.id===myId;g.fillStyle(me?0xffd369:0x7ac4e4);g.fillCircle(p.x,p.y,15);g.lineStyle(2,me?0xffffff:0x253449);g.strokeCircle(p.x,p.y,15);txt(p.x,p.y-27,p.name+(me?" (YOU)":""),12,me?"#ffe4a0":"#ffffff")}if(noticeEnd>Date.now())txt(500,603,notice,17,"#ffe18a");if(!world.started&&!world.winner)txt(500,330,"Join a room, then host starts the round",20,"#ffe0a0");}}
new Phaser.Game({type:Phaser.AUTO,parent:"game",width:1000,height:650,backgroundColor:"#161d2d",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:PubScene});
</script></body></html>`;
