import { ConsumableRoom } from "./consumables.js";
import { CONSUMABLE_CLIENT_SCRIPT } from "./consumables-client.js";
import { LOCAL_ROOM_SOURCE } from "./local-room-source.js";
import { DRUNK_MODE_CLIENT_SCRIPT } from "./drunk-mode.js";
import { PUB_MENU, PUB_TABLES } from "./pub-menu-data.js";
import { PUB_SHOP_SCRIPT } from "./pub-shop.js";
import { PUB_SHOP_CSS } from "./pub-shop.css.js";
import { PUB_HUD_SCRIPT, PUB_HUD_CSS } from "./pub-hud.js";
import { INVENTORY_WHEEL_SCRIPT, INVENTORY_WHEEL_CSS } from "./inventory-wheel.js";
import { MOBILE_LANDSCAPE_SCRIPT } from "./mobile-landscape.js";
import { TRANSITION_EDITOR_CSS, TRANSITION_EDITOR_HTML, TRANSITION_EDITOR_SCRIPT } from "./transition-editor.js";
import { INTERACTION_EDITOR_CSS, INTERACTION_EDITOR_HTML, INTERACTION_EDITOR_SCRIPT } from "./interaction-editor.js";
import { HIDE_POINT_DEFS, HIDE_RUNTIME_SCRIPT } from "./hide-peek.js";
import { HIDE_EDITOR_CSS, HIDE_EDITOR_HTML, HIDE_EDITOR_SCRIPT } from "./hide-editor.js";
import { CASINO_SIZE, CASINO_SPAWN, CASINO_EXIT, CASINO_WALLS, CASINO_HOTSPOTS } from "./casino-map.js";
import { mutationOriginAllowed } from "./admin-auth.js";
import { MaestroAccounts } from "./accounts.js";
import { ACCOUNT_PAGE, ACCOUNT_HOME } from "./account-pages.js";
import { accountAction, accountFromRequest, accountStatus, applyAuthCookies, loggedOutResponse } from "./supabase-account-auth.js";
export { ConsumableRoom, MaestroAccounts };
// MaestroEscape: single-player browser exploration using the uploaded game's TMX,
// map artwork, collision objects, and character animation frames.
// Original Pygame source remains available in the repository.
const SETTINGS_GROUPS=[{"title":"Characters","description":"Walking, sprinting, animations and size outside.","fields":[{"key":"character.walkSpeed","label":"Walk speed","value":205,"min":60,"max":450,"step":5,"unit":"px/s"},{"key":"character.sprintSpeed","label":"Sprint speed","value":300,"min":80,"max":650,"step":5,"unit":"px/s"},{"key":"character.streetScale","label":"Outside character size","value":0.324,"min":0.1,"max":2.5,"step":0.01,"unit":"×"},{"key":"character.animationFps","label":"Walking animation","value":9,"min":2,"max":24,"step":1,"unit":"fps"}]},{"title":"Buildings · Individual zoom & character size","description":"Each interior is adjusted independently.","fields":[{"key":"building.pub.zoom","label":"Maestro Pub zoom","value":0.825,"min":0.35,"max":3.5,"step":0.025,"unit":"×"},{"key":"building.pub.scale","label":"Maestro Pub character","value":1.296,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.basement.zoom","label":"Maestro basement zoom","value":1,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.spar.zoom","label":"SPAR zoom","value":1.875,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.spar.scale","label":"SPAR character","value":0.57,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.gyros.zoom","label":"Mester Gyros zoom","value":1.667,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.gyros.scale","label":"Gyros character","value":0.642,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.zoom","label":"Dohánybolt zoom","value":2.105,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.scale","label":"Dohánybolt character","value":0.508,"min":0.2,"max":3,"step":0.025,"unit":"×"}]},{"title":"Map transitions · Player arrival points","description":"Drag arrival markers in the visual map transition editor above. Coordinates are saved per browser in Single Player.","fields":[{"key":"transition.pub.x","label":"Maestro Pub entry X","value":332,"min":25,"max":1423,"step":1,"unit":"px"},{"key":"transition.pub.y","label":"Maestro Pub entry Y","value":741,"min":25,"max":1061,"step":1,"unit":"px"},{"key":"transition.basement.x","label":"Basement entry X","value":490,"min":25,"max":1767,"step":1,"unit":"px"},{"key":"transition.basement.y","label":"Basement entry Y","value":349,"min":25,"max":871,"step":1,"unit":"px"},{"key":"transition.upstairs.x","label":"Return upstairs X","value":1087,"min":25,"max":1423,"step":1,"unit":"px"},{"key":"transition.upstairs.y","label":"Return upstairs Y","value":459,"min":25,"max":1061,"step":1,"unit":"px"},{"key":"transition.spar.x","label":"SPAR entry X","value":120,"min":25,"max":711,"step":1,"unit":"px"},{"key":"transition.spar.y","label":"SPAR entry Y","value":288,"min":25,"max":359,"step":1,"unit":"px"},{"key":"transition.dohanybolt.x","label":"Dohánybolt entry X","value":260,"min":25,"max":583,"step":1,"unit":"px"},{"key":"transition.dohanybolt.y","label":"Dohánybolt entry Y","value":783,"min":25,"max":807,"step":1,"unit":"px"},{"key":"transition.gyros.x","label":"Mester Gyros entry X","value":304,"min":25,"max":743,"step":1,"unit":"px"},{"key":"transition.gyros.y","label":"Mester Gyros entry Y","value":444,"min":25,"max":455,"step":1,"unit":"px"}]},{"title":"Underground Casino","description":"Choose and enable the street manhole position in Doors & stairs editor. Drag the casino arrival marker in Map transitions. The casino ladder returns to the original street position.","fields":[{"key":"building.casino.zoom","label":"Underground Casino zoom","value":1,"min":0.35,"max":3.5,"step":0.025,"unit":"×"},{"key":"building.casino.scale","label":"Underground Casino character size","value":1.15,"min":0.2,"max":3,"step":0.01,"unit":"×"},{"key":"casino.manhole.enabled","label":"Enable street casino manhole","value":0,"min":0,"max":1,"step":1,"unit":""},{"key":"interaction.street_casino.x","label":"Casino street manhole X","value":800,"min":25,"max":1575,"step":1,"unit":"px"},{"key":"interaction.street_casino.y","label":"Casino street manhole Y","value":510,"min":25,"max":967,"step":1,"unit":"px"},{"key":"interaction.street_casino.radius","label":"Casino manhole E radius","value":80,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.casino_exit.x","label":"Casino return ladder X","value":818,"min":25,"max":1671,"step":1,"unit":"px"},{"key":"interaction.casino_exit.y","label":"Casino return ladder Y","value":275,"min":25,"max":935,"step":1,"unit":"px"},{"key":"interaction.casino_exit.radius","label":"Casino return ladder E radius","value":96,"min":20,"max":200,"step":1,"unit":"px"},{"key":"transition.casino.x","label":"Casino entrance arrival X","value":808,"min":25,"max":1671,"step":1,"unit":"px"},{"key":"transition.casino.y","label":"Casino entrance arrival Y","value":301,"min":25,"max":935,"step":1,"unit":"px"}]},{"title":"Doors & stairs · E interaction points","description":"Drag each E-interaction point and edit its activation radius on the corresponding map. Separate from arrival spawns.","fields":[{"key":"interaction.street_pub.x","label":"Street → Maestro Pub X","value":784,"min":25,"max":1575,"step":1,"unit":"px"},{"key":"interaction.street_pub.y","label":"Street → Maestro Pub Y","value":548,"min":25,"max":967,"step":1,"unit":"px"},{"key":"interaction.street_pub.radius","label":"Street → Maestro Pub radius","value":82,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.street_spar.x","label":"Street → SPAR X","value":946,"min":25,"max":1575,"step":1,"unit":"px"},{"key":"interaction.street_spar.y","label":"Street → SPAR Y","value":741,"min":25,"max":967,"step":1,"unit":"px"},{"key":"interaction.street_spar.radius","label":"Street → SPAR radius","value":82,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.street_dohanybolt.x","label":"Street → Dohánybolt X","value":480,"min":25,"max":1575,"step":1,"unit":"px"},{"key":"interaction.street_dohanybolt.y","label":"Street → Dohánybolt Y","value":347,"min":25,"max":967,"step":1,"unit":"px"},{"key":"interaction.street_dohanybolt.radius","label":"Street → Dohánybolt radius","value":82,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.street_gyros.x","label":"Street → Gyros X","value":222,"min":25,"max":1575,"step":1,"unit":"px"},{"key":"interaction.street_gyros.y","label":"Street → Gyros Y","value":160,"min":25,"max":967,"step":1,"unit":"px"},{"key":"interaction.street_gyros.radius","label":"Street → Gyros radius","value":82,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.pub_exit.x","label":"Maestro Pub → Street X","value":153,"min":25,"max":1423,"step":1,"unit":"px"},{"key":"interaction.pub_exit.y","label":"Maestro Pub → Street Y","value":844,"min":25,"max":1061,"step":1,"unit":"px"},{"key":"interaction.pub_exit.radius","label":"Maestro Pub → Street radius","value":96,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.pub_downstairs.x","label":"Pub → Basement staircase X","value":1087,"min":25,"max":1423,"step":1,"unit":"px"},{"key":"interaction.pub_downstairs.y","label":"Pub → Basement staircase Y","value":459,"min":25,"max":1061,"step":1,"unit":"px"},{"key":"interaction.pub_downstairs.radius","label":"Pub → Basement staircase radius","value":70,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.basement_upstairs.x","label":"Basement → Pub staircase X","value":444,"min":25,"max":1767,"step":1,"unit":"px"},{"key":"interaction.basement_upstairs.y","label":"Basement → Pub staircase Y","value":410,"min":25,"max":871,"step":1,"unit":"px"},{"key":"interaction.basement_upstairs.radius","label":"Basement → Pub staircase radius","value":65,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.spar_exit.x","label":"SPAR → Street X","value":120,"min":25,"max":711,"step":1,"unit":"px"},{"key":"interaction.spar_exit.y","label":"SPAR → Street Y","value":310,"min":25,"max":359,"step":1,"unit":"px"},{"key":"interaction.spar_exit.radius","label":"SPAR → Street radius","value":96,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.dohanybolt_exit.x","label":"Dohánybolt → Street X","value":260,"min":25,"max":583,"step":1,"unit":"px"},{"key":"interaction.dohanybolt_exit.y","label":"Dohánybolt → Street Y","value":805,"min":25,"max":807,"step":1,"unit":"px"},{"key":"interaction.dohanybolt_exit.radius","label":"Dohánybolt → Street radius","value":96,"min":20,"max":200,"step":1,"unit":"px"},{"key":"interaction.gyros_exit.x","label":"Gyros → Street X","value":304,"min":25,"max":743,"step":1,"unit":"px"},{"key":"interaction.gyros_exit.y","label":"Gyros → Street Y","value":455,"min":25,"max":455,"step":1,"unit":"px"},{"key":"interaction.gyros_exit.radius","label":"Gyros → Street radius","value":96,"min":20,"max":200,"step":1,"unit":"px"}]},{"title":"Vehicles · Appearance","description":"Rendered sizes on the outdoor map.","fields":[{"key":"vehicle.skoda.width","label":"Škoda width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.skoda.length","label":"Škoda length","value":72,"min":30,"max":180,"step":1,"unit":"px"},{"key":"vehicle.octavia.width","label":"Octavia width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.octavia.length","label":"Octavia length","value":64,"min":30,"max":180,"step":1,"unit":"px"}]},{"title":"Vehicle starting positions","description":"Use the map placement editor above to drag or rotate each vehicle; coordinates are shared across devices.","fields":[{"key":"vehicle.skoda.spawnX","label":"Skoda starting X","value":697,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.skoda.spawnY","label":"Skoda starting Y","value":505,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.skoda.angle","label":"Skoda angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.octavia.spawnX","label":"Octavia starting X","value":632,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.octavia.spawnY","label":"Octavia starting Y","value":453,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.octavia.angle","label":"Octavia angle","value":135,"min":0,"max":359,"step":1,"unit":"°"}]},{"title":"Bubi bikes · Placement and size","description":"Adjust each bike individually or drag it on the map. These values are shared across devices.","fields":[{"key":"vehicle.bike1.width","label":"Bubi 1 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike1.length","label":"Bubi 1 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike1.spawnX","label":"Bubi 1 spawnX","value":670,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike1.spawnY","label":"Bubi 1 spawnY","value":850,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike1.angle","label":"Bubi 1 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.bike2.width","label":"Bubi 2 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike2.length","label":"Bubi 2 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike2.spawnX","label":"Bubi 2 spawnX","value":688,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike2.spawnY","label":"Bubi 2 spawnY","value":860,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike2.angle","label":"Bubi 2 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.bike3.width","label":"Bubi 3 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike3.length","label":"Bubi 3 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike3.spawnX","label":"Bubi 3 spawnX","value":706,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike3.spawnY","label":"Bubi 3 spawnY","value":870,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike3.angle","label":"Bubi 3 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"}]},{"title":"Bubi bikes · Driving","description":"Separate pedal acceleration, top speed, steering and friction.","fields":[{"key":"bike.acceleration","label":"Pedal acceleration","value":100,"min":20,"max":300,"step":5,"unit":"px/s²"},{"key":"bike.topSpeed","label":"Maximum cycling speed","value":125,"min":30,"max":270,"step":5,"unit":"px/s"},{"key":"bike.turnRate","label":"Bike steering rate","value":3.5,"min":0.3,"max":8,"step":0.1,"unit":"rad/s"},{"key":"bike.drag","label":"Bike coasting drag","value":1.5,"min":0.1,"max":6,"step":0.1,"unit":"×"}]},{"title":"Vehicles · Driving mechanics","description":"Applies to both cars. Braking, steering and friction can be fine-tuned.","fields":[{"key":"vehicle.acceleration","label":"Acceleration","value":175,"min":20,"max":500,"step":5,"unit":"px/s²"},{"key":"vehicle.topSpeed","label":"Maximum speed","value":245,"min":40,"max":600,"step":5,"unit":"px/s"},{"key":"vehicle.turnRate","label":"Steering sensitivity","value":2,"min":0.2,"max":6,"step":0.1,"unit":"rad/s"},{"key":"vehicle.braking","label":"Braking strength","value":1.65,"min":0.5,"max":4,"step":0.05,"unit":"×"},{"key":"vehicle.drag","label":"Coasting drag","value":1.35,"min":0.1,"max":6,"step":0.05,"unit":"×"}]},{"title":"Tram","description":"Tram passes on the tracks, pauses 3 seconds at the stop, then continues.","fields":[{"key":"tram.interval","label":"Pass frequency","value":20,"min":5,"max":120,"step":1,"unit":"sec"},{"key":"tram.travelTime","label":"Crossing duration","value":14.5,"min":3,"max":30,"step":0.5,"unit":"sec"},{"key":"tram.width","label":"Tram width","value":40,"min":20,"max":110,"step":1,"unit":"px"},{"key":"tram.length","label":"Tram length","value":144,"min":65,"max":360,"step":1,"unit":"px"}]},{"title":"Camera & Interaction","description":"Outdoor view and interaction ranges.","fields":[{"key":"camera.streetZoom","label":"Outdoor zoom","value":2.03,"min":0.5,"max":4.5,"step":0.05,"unit":"×"},{"key":"camera.drivingZoom","label":"Driving zoom","value":1.3804,"min":0.35,"max":4,"step":0.05,"unit":"×"},{"key":"camera.mobileZoom","label":"Mobile zoom multiplier (all locations)","value":0.75,"min":0.4,"max":2,"step":0.05,"unit":"×"},{"key":"game.interactRadius","label":"Shop entry reach","value":82,"min":30,"max":150,"step":1,"unit":"px"},{"key":"game.vehicleRadius","label":"Vehicle entry reach","value":67,"min":30,"max":150,"step":1,"unit":"px"},{"key":"player.interactRadius","label":"Player interaction range","value":45,"min":15,"max":150,"step":1,"unit":"px"},{"key":"npc.interactRadius","label":"NPC dialogue reach","value":108,"min":40,"max":190,"step":2,"unit":"px"},{"key":"npc.interactCooldownMs","label":"NPC action cooldown","value":450,"min":150,"max":2000,"step":50,"unit":"ms"}]},{"title":"NPC size · By location","description":"Scale every NPC in an interior independently. Each NPC also has its own individual size in the placement editor. Effective size = location × NPC size.","fields":[{"key":"npc.location.pub.scale","label":"Maestro Pub NPC size multiplier","value":1,"min":0.25,"max":2.5,"step":0.05,"unit":"×"},{"key":"npc.location.spar.scale","label":"SPAR NPC size multiplier","value":1,"min":0.25,"max":2.5,"step":0.05,"unit":"×"},{"key":"npc.location.dohanybolt.scale","label":"Dohánybolt NPC size multiplier","value":1,"min":0.25,"max":2.5,"step":0.05,"unit":"×"},{"key":"npc.location.gyros.scale","label":"Mester Gyros NPC size multiplier","value":1,"min":0.25,"max":2.5,"step":0.05,"unit":"×"},{"key":"npc.location.casino.scale","label":"Underground Casino NPC size multiplier","value":1,"min":0.25,"max":2.5,"step":0.05,"unit":"×"}]},{"title":"NPCs","description":"Ten interior NPC placements and behaviour. Use the visual NPC editor.","fields":[{"key":"npc.maestro_bartender.x","label":"X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.y","label":"Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.homeX","label":"Home X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.homeY","label":"Home Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_bartender.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_bartender.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_bartender.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_bartender.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_bartender.wp1X","label":"Waypoint 1 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp1Y","label":"Waypoint 1 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp2X","label":"Waypoint 2 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp2Y","label":"Waypoint 2 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp3X","label":"Waypoint 3 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp3Y","label":"Waypoint 3 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp4X","label":"Waypoint 4 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp4Y","label":"Waypoint 4 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.x","label":"X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.y","label":"Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.homeX","label":"Home X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.homeY","label":"Home Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_1.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_1.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_1.speed","label":"Walking speed","value":35,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_1.idleMs","label":"Rest time","value":7500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_1.wp1X","label":"Waypoint 1 X","value":378,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp1Y","label":"Waypoint 1 Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp2X","label":"Waypoint 2 X","value":378,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp2Y","label":"Waypoint 2 Y","value":543,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp3X","label":"Waypoint 3 X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp3Y","label":"Waypoint 3 Y","value":543,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp4X","label":"Waypoint 4 X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp4Y","label":"Waypoint 4 Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.x","label":"X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.y","label":"Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.homeX","label":"Home X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.homeY","label":"Home Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":2,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_2.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_2.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_2.speed","label":"Walking speed","value":32,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_2.idleMs","label":"Rest time","value":8400,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_2.wp1X","label":"Waypoint 1 X","value":686,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp1Y","label":"Waypoint 1 Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp2X","label":"Waypoint 2 X","value":686,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp2Y","label":"Waypoint 2 Y","value":732,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp3X","label":"Waypoint 3 X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp3Y","label":"Waypoint 3 Y","value":732,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp4X","label":"Waypoint 4 X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp4Y","label":"Waypoint 4 Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.x","label":"X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.y","label":"Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.homeX","label":"Home X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.homeY","label":"Home Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_3.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_3.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_3.speed","label":"Walking speed","value":34,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_3.idleMs","label":"Rest time","value":9200,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_3.wp1X","label":"Waypoint 1 X","value":1008,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp1Y","label":"Waypoint 1 Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp2X","label":"Waypoint 2 X","value":1008,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp2Y","label":"Waypoint 2 Y","value":746,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp3X","label":"Waypoint 3 X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp3Y","label":"Waypoint 3 Y","value":746,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp4X","label":"Waypoint 4 X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp4Y","label":"Waypoint 4 Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.spar_cashier.x","label":"X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.y","label":"Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.homeX","label":"Home X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.homeY","label":"Home Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_cashier.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_cashier.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_cashier.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_cashier.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_cashier.wp1X","label":"Waypoint 1 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp1Y","label":"Waypoint 1 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp2X","label":"Waypoint 2 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp2Y","label":"Waypoint 2 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp3X","label":"Waypoint 3 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp3Y","label":"Waypoint 3 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp4X","label":"Waypoint 4 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp4Y","label":"Waypoint 4 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.x","label":"X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.y","label":"Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.homeX","label":"Home X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.homeY","label":"Home Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":2,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_shopper_1.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_shopper_1.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_shopper_1.speed","label":"Walking speed","value":24,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_shopper_1.idleMs","label":"Rest time","value":4000,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_shopper_1.wp1X","label":"Waypoint 1 X","value":208,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp1Y","label":"Waypoint 1 Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp2X","label":"Waypoint 2 X","value":208,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp2Y","label":"Waypoint 2 Y","value":276,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp3X","label":"Waypoint 3 X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp3Y","label":"Waypoint 3 Y","value":276,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp4X","label":"Waypoint 4 X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp4Y","label":"Waypoint 4 Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.x","label":"X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.y","label":"Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.homeX","label":"Home X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.homeY","label":"Home Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_shopper_2.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_shopper_2.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_shopper_2.speed","label":"Walking speed","value":26,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_shopper_2.idleMs","label":"Rest time","value":4200,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_shopper_2.wp1X","label":"Waypoint 1 X","value":656,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp1Y","label":"Waypoint 1 Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp2X","label":"Waypoint 2 X","value":656,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp2Y","label":"Waypoint 2 Y","value":208,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp3X","label":"Waypoint 3 X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp3Y","label":"Waypoint 3 Y","value":208,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp4X","label":"Waypoint 4 X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp4Y","label":"Waypoint 4 Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.x","label":"X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.y","label":"Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.homeX","label":"Home X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.homeY","label":"Home Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.tobacco_cashier.scale","label":"Sprite scale","value":0.89,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.tobacco_cashier.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.tobacco_cashier.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.tobacco_cashier.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.tobacco_cashier.wp1X","label":"Waypoint 1 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp1Y","label":"Waypoint 1 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp2X","label":"Waypoint 2 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp2Y","label":"Waypoint 2 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp3X","label":"Waypoint 3 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp3Y","label":"Waypoint 3 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp4X","label":"Waypoint 4 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp4Y","label":"Waypoint 4 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.gyros_employee.x","label":"X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.y","label":"Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.homeX","label":"Home X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.homeY","label":"Home Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.gyros_employee.scale","label":"Sprite scale","value":1.12,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.gyros_employee.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.gyros_employee.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.gyros_employee.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.gyros_employee.wp1X","label":"Waypoint 1 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp1Y","label":"Waypoint 1 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp2X","label":"Waypoint 2 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp2Y","label":"Waypoint 2 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp3X","label":"Waypoint 3 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp3Y","label":"Waypoint 3 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp4X","label":"Waypoint 4 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp4Y","label":"Waypoint 4 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.casino_bartender.x","label":"x","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.y","label":"y","value":300,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.casino_bartender.homeX","label":"homeX","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.homeY","label":"homeY","value":300,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.casino_bartender.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.casino_bartender.scale","label":"Sprite scale","value":1.15,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.casino_bartender.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.casino_bartender.speed","label":"Walking speed","value":22,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.casino_bartender.idleMs","label":"Rest time","value":2400,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.casino_bartender.wp1X","label":"wp1X","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp1Y","label":"wp1Y","value":300,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp2X","label":"wp2X","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp2Y","label":"wp2Y","value":300,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp3X","label":"wp3X","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp3Y","label":"wp3Y","value":300,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp4X","label":"wp4X","value":340,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.casino_bartender.wp4Y","label":"wp4Y","value":300,"min":0,"max":1086,"step":1,"unit":"px"}]},{"title":"Drunk Mode","description":"One completed beer = one level. 0 = off, 1 = on for toggles.","fields":[{"key":"drunkMode.enabled","label":"Enable drunk mode","value":1,"min":0,"max":1,"step":1,"unit":"0/1"},{"key":"drunkMode.maxLevel","label":"Max drunk level","value":3,"min":1,"max":3,"step":1,"unit":"level"},{"key":"drunkMode.recoverySecondsPerLevel","label":"Recovery per level","value":20,"min":5,"max":120,"step":1,"unit":"s"},{"key":"drunkMode.visualsEnabled","label":"Camera effects enabled","value":1,"min":0,"max":1,"step":1,"unit":"0/1"},{"key":"drunkMode.reduceMotion","label":"Reduce motion","value":0,"min":0,"max":1,"step":1,"unit":"0/1"},{"key":"drunkMode.level1SwayDeg","label":"Tipsy camera sway","value":0.4,"min":0,"max":3,"step":0.1,"unit":"°"},{"key":"drunkMode.level2SwayDeg","label":"Drunk camera sway","value":0.4,"min":0,"max":3,"step":0.1,"unit":"°"},{"key":"drunkMode.level3SwayDeg","label":"Wasted camera sway","value":2,"min":0,"max":5,"step":0.1,"unit":"°"},{"key":"drunkMode.level1ZoomPulsePct","label":"Tipsy zoom pulse","value":0.3,"min":0,"max":2,"step":0.1,"unit":"%"},{"key":"drunkMode.level2ZoomPulsePct","label":"Drunk zoom pulse","value":0.3,"min":0,"max":2,"step":0.1,"unit":"%"},{"key":"drunkMode.level3ZoomPulsePct","label":"Wasted zoom pulse","value":1.5,"min":0,"max":4,"step":0.1,"unit":"%"},{"key":"drunkMode.swayCycleSeconds","label":"Camera sway cycle","value":3,"min":1,"max":8,"step":0.1,"unit":"s"},{"key":"drunkMode.level2MistakesPerMinute","label":"Drunk mistakes/min","value":8,"min":0,"max":30,"step":1,"unit":"/min"},{"key":"drunkMode.level3MistakesPerMinute","label":"Wasted mistakes/min","value":20,"min":0,"max":45,"step":1,"unit":"/min"},{"key":"drunkMode.level2MaxDeviationDeg","label":"Drunk max deviation","value":20,"min":0,"max":45,"step":1,"unit":"°"},{"key":"drunkMode.level3MaxDeviationDeg","label":"Wasted max deviation","value":50,"min":0,"max":80,"step":1,"unit":"°"},{"key":"drunkMode.mistakeDurationMs","label":"Mistake duration","value":550,"min":150,"max":1500,"step":25,"unit":"ms"},{"key":"drunkMode.transitionMs","label":"Level transition","value":650,"min":0,"max":1500,"step":25,"unit":"ms"},{"key":"drunkMode.showStatus","label":"Show drunk HUD","value":1,"min":0,"max":1,"step":1,"unit":"0/1"},{"key":"drunkMode.doubleVisionEnabled","label":"Double vision enabled","value":1,"min":0,"max":1,"step":1,"unit":"0/1"},{"key":"drunkMode.level1GhostAlpha","label":"Tipsy ghost opacity","value":0.08,"min":0,"max":0.75,"step":0.01,"unit":"alpha"},{"key":"drunkMode.level2GhostAlpha","label":"Drunk ghost opacity","value":0.16,"min":0,"max":0.75,"step":0.01,"unit":"alpha"},{"key":"drunkMode.level3GhostAlpha","label":"Wasted ghost opacity","value":0.28,"min":0,"max":0.9,"step":0.01,"unit":"alpha"},{"key":"drunkMode.level1GhostOffset","label":"Tipsy ghost drift","value":2,"min":0,"max":30,"step":0.5,"unit":"px"},{"key":"drunkMode.level2GhostOffset","label":"Drunk ghost drift","value":5,"min":0,"max":40,"step":0.5,"unit":"px"},{"key":"drunkMode.level3GhostOffset","label":"Wasted ghost drift","value":10,"min":0,"max":60,"step":0.5,"unit":"px"},{"key":"drunkMode.ghostDriftX","label":"Ghost X drift frequency","value":0.8,"min":0.1,"max":4,"step":0.05,"unit":"rad/s"},{"key":"drunkMode.ghostDriftY","label":"Ghost Y drift frequency","value":1.1,"min":0.1,"max":4,"step":0.05,"unit":"rad/s"},{"key":"drunkMode.ghostScalePct","label":"Ghost scale breathing","value":0.3,"min":0,"max":3,"step":0.05,"unit":"%"}]},{"title":"Hide & Peek","description":"Use the draggable Hide & Peek editor above for individual tree, table and bar points. Disabled unverified points are not active in gameplay.","fields":[{"key":"hide.enabled","label":"Enable contextual hiding","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.radius","label":"Default interaction radius","value":80,"min":20,"max":180,"step":1,"unit":"px"},{"key":"hide.visiblePercent","label":"Visible player portion","value":7,"min":3,"max":15,"step":1,"unit":"%"},{"key":"hide.animationMs","label":"Enter / exit animation","value":200,"min":100,"max":500,"step":10,"unit":"ms"},{"key":"hide.showPrompts","label":"Show E Hide prompts","value":1,"min":0,"max":1,"step":1,"unit":""}]},{"title":"Hide-point coordinates","description":"Room-scoped positions and safe exit settings. Edit them on the map above.","fields":[{"key":"hide.point.pub_left.x","label":"Window table x","value":110,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_left.y","label":"Window table y","value":530,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_left.hideX","label":"Window table hideX","value":110,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_left.hideY","label":"Window table hideY","value":530,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_left.exitX","label":"Window table exitX","value":110,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_left.exitY","label":"Window table exitY","value":530,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_left.radius","label":"Window table radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.pub_left.enabled","label":"Window table enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.pub_left.side","label":"Window table side","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.pub_middle.x","label":"Central table x","value":390,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_middle.y","label":"Central table y","value":695,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_middle.hideX","label":"Central table hideX","value":390,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_middle.hideY","label":"Central table hideY","value":695,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_middle.exitX","label":"Central table exitX","value":390,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_middle.exitY","label":"Central table exitY","value":695,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_middle.radius","label":"Central table radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.pub_middle.enabled","label":"Central table enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.pub_middle.side","label":"Central table side","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.pub_right.x","label":"Side table x","value":1020,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_right.y","label":"Side table y","value":435,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_right.hideX","label":"Side table hideX","value":1020,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_right.hideY","label":"Side table hideY","value":435,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_right.exitX","label":"Side table exitX","value":1020,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_right.exitY","label":"Side table exitY","value":435,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_right.radius","label":"Side table radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.pub_right.enabled","label":"Side table enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.pub_right.side","label":"Side table side","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.pub_upper.x","label":"Upper table x","value":900,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_upper.y","label":"Upper table y","value":280,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_upper.hideX","label":"Upper table hideX","value":900,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_upper.hideY","label":"Upper table hideY","value":280,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_upper.exitX","label":"Upper table exitX","value":900,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_upper.exitY","label":"Upper table exitY","value":280,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_upper.radius","label":"Upper table radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.pub_upper.enabled","label":"Upper table enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.pub_upper.side","label":"Upper table side","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.pub_bar.x","label":"Behind bar counter x","value":0,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_bar.y","label":"Behind bar counter y","value":0,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_bar.hideX","label":"Behind bar counter hideX","value":0,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_bar.hideY","label":"Behind bar counter hideY","value":0,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_bar.exitX","label":"Behind bar counter exitX","value":0,"min":0,"max":1423,"step":1,"unit":""},{"key":"hide.point.pub_bar.exitY","label":"Behind bar counter exitY","value":0,"min":0,"max":1061,"step":1,"unit":""},{"key":"hide.point.pub_bar.radius","label":"Behind bar counter radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.pub_bar.enabled","label":"Behind bar counter enabled","value":0,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.pub_bar.side","label":"Behind bar counter side","value":2,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.basement_table_1.x","label":"Basement table 1 x","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_1.y","label":"Basement table 1 y","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_1.hideX","label":"Basement table 1 hideX","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_1.hideY","label":"Basement table 1 hideY","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_1.exitX","label":"Basement table 1 exitX","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_1.exitY","label":"Basement table 1 exitY","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_1.radius","label":"Basement table 1 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.basement_table_1.enabled","label":"Basement table 1 enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.basement_table_1.side","label":"Basement table 1 side","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.basement_table_2.x","label":"Basement table 2 x","value":1530,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_2.y","label":"Basement table 2 y","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_2.hideX","label":"Basement table 2 hideX","value":1530,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_2.hideY","label":"Basement table 2 hideY","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_2.exitX","label":"Basement table 2 exitX","value":1530,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_2.exitY","label":"Basement table 2 exitY","value":365,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_2.radius","label":"Basement table 2 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.basement_table_2.enabled","label":"Basement table 2 enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.basement_table_2.side","label":"Basement table 2 side","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.basement_table_3.x","label":"Basement table 3 x","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_3.y","label":"Basement table 3 y","value":673,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_3.hideX","label":"Basement table 3 hideX","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_3.hideY","label":"Basement table 3 hideY","value":673,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_3.exitX","label":"Basement table 3 exitX","value":1248,"min":0,"max":1767,"step":1,"unit":""},{"key":"hide.point.basement_table_3.exitY","label":"Basement table 3 exitY","value":673,"min":0,"max":871,"step":1,"unit":""},{"key":"hide.point.basement_table_3.radius","label":"Basement table 3 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.basement_table_3.enabled","label":"Basement table 3 enabled","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.basement_table_3.side","label":"Basement table 3 side","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.street_tree_1.x","label":"Street tree 1 x","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_1.y","label":"Street tree 1 y","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_1.hideX","label":"Street tree 1 hideX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_1.hideY","label":"Street tree 1 hideY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_1.exitX","label":"Street tree 1 exitX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_1.exitY","label":"Street tree 1 exitY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_1.radius","label":"Street tree 1 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.street_tree_1.enabled","label":"Street tree 1 enabled","value":0,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.street_tree_1.side","label":"Street tree 1 side","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.street_tree_2.x","label":"Street tree 2 x","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_2.y","label":"Street tree 2 y","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_2.hideX","label":"Street tree 2 hideX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_2.hideY","label":"Street tree 2 hideY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_2.exitX","label":"Street tree 2 exitX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_2.exitY","label":"Street tree 2 exitY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_2.radius","label":"Street tree 2 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.street_tree_2.enabled","label":"Street tree 2 enabled","value":0,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.street_tree_2.side","label":"Street tree 2 side","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"hide.point.street_tree_3.x","label":"Street tree 3 x","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_3.y","label":"Street tree 3 y","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_3.hideX","label":"Street tree 3 hideX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_3.hideY","label":"Street tree 3 hideY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_3.exitX","label":"Street tree 3 exitX","value":0,"min":0,"max":1575,"step":1,"unit":""},{"key":"hide.point.street_tree_3.exitY","label":"Street tree 3 exitY","value":0,"min":0,"max":967,"step":1,"unit":""},{"key":"hide.point.street_tree_3.radius","label":"Street tree 3 radius (0 = global)","value":0,"min":0,"max":180,"step":1,"unit":""},{"key":"hide.point.street_tree_3.enabled","label":"Street tree 3 enabled","value":0,"min":0,"max":1,"step":1,"unit":""},{"key":"hide.point.street_tree_3.side","label":"Street tree 3 side","value":0,"min":0,"max":3,"step":1,"unit":""}]}];
const SETTINGS_DEFAULTS={"character.walkSpeed":205,"character.sprintSpeed":300,"character.streetScale":0.324,"character.animationFps":9,"building.pub.zoom":0.825,"building.pub.scale":1.296,"building.basement.zoom":1,"building.spar.zoom":1.875,"building.spar.scale":0.57,"building.gyros.zoom":1.667,"building.gyros.scale":0.642,"building.dohanybolt.zoom":2.105,"building.dohanybolt.scale":0.508,"vehicle.skoda.width":32,"vehicle.skoda.length":72,"vehicle.octavia.width":32,"vehicle.octavia.length":64,"vehicle.acceleration":175,"vehicle.topSpeed":245,"vehicle.turnRate":2,"vehicle.braking":1.65,"vehicle.drag":1.35,"tram.interval":20,"tram.travelTime":14.5,"tram.width":40,"tram.length":144,"camera.streetZoom":2.03,"camera.drivingZoom":1.3804,"camera.mobileZoom":0.75,"game.interactRadius":82,"game.vehicleRadius":67,"vehicle.skoda.spawnX":697,"vehicle.skoda.spawnY":505,"vehicle.skoda.angle":135,"vehicle.octavia.spawnX":632,"vehicle.octavia.spawnY":453,"vehicle.octavia.angle":135,"vehicle.bike1.width":15,"vehicle.bike1.length":34,"vehicle.bike1.spawnX":670,"vehicle.bike1.spawnY":850,"vehicle.bike1.angle":135,"vehicle.bike2.width":15,"vehicle.bike2.length":34,"vehicle.bike2.spawnX":688,"vehicle.bike2.spawnY":860,"vehicle.bike2.angle":135,"vehicle.bike3.width":15,"vehicle.bike3.length":34,"vehicle.bike3.spawnX":706,"vehicle.bike3.spawnY":870,"vehicle.bike3.angle":135,"bike.acceleration":100,"bike.topSpeed":125,"bike.turnRate":3.5,"bike.drag":1.5,"npc.interactRadius":108,"npc.interactCooldownMs":450,"npc.maestro_bartender.x":413,"npc.maestro_bartender.y":210,"npc.maestro_bartender.homeX":413,"npc.maestro_bartender.homeY":210,"npc.maestro_bartender.facing":0,"npc.maestro_bartender.scale":2,"npc.maestro_bartender.enabled":1,"npc.maestro_bartender.speed":25,"npc.maestro_bartender.idleMs":2500,"npc.maestro_bartender.wp1X":413,"npc.maestro_bartender.wp1Y":210,"npc.maestro_bartender.wp2X":413,"npc.maestro_bartender.wp2Y":210,"npc.maestro_bartender.wp3X":413,"npc.maestro_bartender.wp3Y":210,"npc.maestro_bartender.wp4X":413,"npc.maestro_bartender.wp4Y":210,"npc.maestro_regular_1.x":342,"npc.maestro_regular_1.y":511,"npc.maestro_regular_1.homeX":342,"npc.maestro_regular_1.homeY":511,"npc.maestro_regular_1.facing":1,"npc.maestro_regular_1.scale":2,"npc.maestro_regular_1.enabled":1,"npc.maestro_regular_1.speed":35,"npc.maestro_regular_1.idleMs":7500,"npc.maestro_regular_1.wp1X":378,"npc.maestro_regular_1.wp1Y":511,"npc.maestro_regular_1.wp2X":378,"npc.maestro_regular_1.wp2Y":543,"npc.maestro_regular_1.wp3X":342,"npc.maestro_regular_1.wp3Y":543,"npc.maestro_regular_1.wp4X":342,"npc.maestro_regular_1.wp4Y":511,"npc.maestro_regular_2.x":648,"npc.maestro_regular_2.y":707,"npc.maestro_regular_2.homeX":648,"npc.maestro_regular_2.homeY":707,"npc.maestro_regular_2.facing":2,"npc.maestro_regular_2.scale":2,"npc.maestro_regular_2.enabled":1,"npc.maestro_regular_2.speed":32,"npc.maestro_regular_2.idleMs":8400,"npc.maestro_regular_2.wp1X":686,"npc.maestro_regular_2.wp1Y":707,"npc.maestro_regular_2.wp2X":686,"npc.maestro_regular_2.wp2Y":732,"npc.maestro_regular_2.wp3X":648,"npc.maestro_regular_2.wp3Y":732,"npc.maestro_regular_2.wp4X":648,"npc.maestro_regular_2.wp4Y":707,"npc.maestro_regular_3.x":1043,"npc.maestro_regular_3.y":774,"npc.maestro_regular_3.homeX":1043,"npc.maestro_regular_3.homeY":774,"npc.maestro_regular_3.facing":3,"npc.maestro_regular_3.scale":2,"npc.maestro_regular_3.enabled":1,"npc.maestro_regular_3.speed":34,"npc.maestro_regular_3.idleMs":9200,"npc.maestro_regular_3.wp1X":1008,"npc.maestro_regular_3.wp1Y":774,"npc.maestro_regular_3.wp2X":1008,"npc.maestro_regular_3.wp2Y":746,"npc.maestro_regular_3.wp3X":1043,"npc.maestro_regular_3.wp3Y":746,"npc.maestro_regular_3.wp4X":1043,"npc.maestro_regular_3.wp4Y":774,"npc.spar_cashier.x":478,"npc.spar_cashier.y":224,"npc.spar_cashier.homeX":478,"npc.spar_cashier.homeY":224,"npc.spar_cashier.facing":0,"npc.spar_cashier.scale":0.99,"npc.spar_cashier.enabled":1,"npc.spar_cashier.speed":25,"npc.spar_cashier.idleMs":2500,"npc.spar_cashier.wp1X":478,"npc.spar_cashier.wp1Y":224,"npc.spar_cashier.wp2X":478,"npc.spar_cashier.wp2Y":224,"npc.spar_cashier.wp3X":478,"npc.spar_cashier.wp3Y":224,"npc.spar_cashier.wp4X":478,"npc.spar_cashier.wp4Y":224,"npc.spar_shopper_1.x":233,"npc.spar_shopper_1.y":249,"npc.spar_shopper_1.homeX":233,"npc.spar_shopper_1.homeY":249,"npc.spar_shopper_1.facing":2,"npc.spar_shopper_1.scale":0.99,"npc.spar_shopper_1.enabled":1,"npc.spar_shopper_1.speed":24,"npc.spar_shopper_1.idleMs":4000,"npc.spar_shopper_1.wp1X":208,"npc.spar_shopper_1.wp1Y":249,"npc.spar_shopper_1.wp2X":208,"npc.spar_shopper_1.wp2Y":276,"npc.spar_shopper_1.wp3X":233,"npc.spar_shopper_1.wp3Y":276,"npc.spar_shopper_1.wp4X":233,"npc.spar_shopper_1.wp4Y":249,"npc.spar_shopper_2.x":636,"npc.spar_shopper_2.y":243,"npc.spar_shopper_2.homeX":636,"npc.spar_shopper_2.homeY":243,"npc.spar_shopper_2.facing":1,"npc.spar_shopper_2.scale":0.99,"npc.spar_shopper_2.enabled":1,"npc.spar_shopper_2.speed":26,"npc.spar_shopper_2.idleMs":4200,"npc.spar_shopper_2.wp1X":656,"npc.spar_shopper_2.wp1Y":243,"npc.spar_shopper_2.wp2X":656,"npc.spar_shopper_2.wp2Y":208,"npc.spar_shopper_2.wp3X":636,"npc.spar_shopper_2.wp3Y":208,"npc.spar_shopper_2.wp4X":636,"npc.spar_shopper_2.wp4Y":243,"npc.tobacco_cashier.x":519,"npc.tobacco_cashier.y":416,"npc.tobacco_cashier.homeX":519,"npc.tobacco_cashier.homeY":416,"npc.tobacco_cashier.facing":0,"npc.tobacco_cashier.scale":0.89,"npc.tobacco_cashier.enabled":1,"npc.tobacco_cashier.speed":25,"npc.tobacco_cashier.idleMs":2500,"npc.tobacco_cashier.wp1X":519,"npc.tobacco_cashier.wp1Y":416,"npc.tobacco_cashier.wp2X":519,"npc.tobacco_cashier.wp2Y":416,"npc.tobacco_cashier.wp3X":519,"npc.tobacco_cashier.wp3Y":416,"npc.tobacco_cashier.wp4X":519,"npc.tobacco_cashier.wp4Y":416,"npc.gyros_employee.x":294,"npc.gyros_employee.y":291,"npc.gyros_employee.homeX":294,"npc.gyros_employee.homeY":291,"npc.gyros_employee.facing":0,"npc.gyros_employee.scale":1.12,"npc.gyros_employee.enabled":1,"npc.gyros_employee.speed":25,"npc.gyros_employee.idleMs":2500,"npc.gyros_employee.wp1X":294,"npc.gyros_employee.wp1Y":291,"npc.gyros_employee.wp2X":294,"npc.gyros_employee.wp2Y":291,"npc.gyros_employee.wp3X":294,"npc.gyros_employee.wp3Y":291,"npc.gyros_employee.wp4X":294,"npc.gyros_employee.wp4Y":291,"player.interactRadius":45,"npc.location.pub.scale":1,"npc.location.spar.scale":1,"npc.location.dohanybolt.scale":1,"npc.location.gyros.scale":1,"drunkMode.enabled":1,"drunkMode.maxLevel":3,"drunkMode.recoverySecondsPerLevel":20,"drunkMode.visualsEnabled":1,"drunkMode.reduceMotion":0,"drunkMode.level1SwayDeg":0.4,"drunkMode.level2SwayDeg":0.4,"drunkMode.level3SwayDeg":2,"drunkMode.level1ZoomPulsePct":0.3,"drunkMode.level2ZoomPulsePct":0.3,"drunkMode.level3ZoomPulsePct":1.5,"drunkMode.swayCycleSeconds":3,"drunkMode.level2MistakesPerMinute":8,"drunkMode.level3MistakesPerMinute":20,"drunkMode.level2MaxDeviationDeg":20,"drunkMode.level3MaxDeviationDeg":50,"drunkMode.mistakeDurationMs":550,"drunkMode.transitionMs":650,"drunkMode.showStatus":1,"drunkMode.doubleVisionEnabled":1,"drunkMode.level1GhostAlpha":0.08,"drunkMode.level2GhostAlpha":0.16,"drunkMode.level3GhostAlpha":0.28,"drunkMode.level1GhostOffset":2,"drunkMode.level2GhostOffset":5,"drunkMode.level3GhostOffset":10,"drunkMode.ghostDriftX":0.8,"drunkMode.ghostDriftY":1.1,"drunkMode.ghostScalePct":0.3,"transition.pub.x":332,"transition.pub.y":741,"transition.basement.x":490,"transition.basement.y":349,"transition.upstairs.x":1087,"transition.upstairs.y":459,"transition.spar.x":120,"transition.spar.y":288,"transition.dohanybolt.x":260,"transition.dohanybolt.y":783,"transition.gyros.x":304,"transition.gyros.y":444,"interaction.street_pub.x":784,"interaction.street_pub.y":548,"interaction.street_pub.radius":82,"interaction.street_spar.x":946,"interaction.street_spar.y":741,"interaction.street_spar.radius":82,"interaction.street_dohanybolt.x":480,"interaction.street_dohanybolt.y":347,"interaction.street_dohanybolt.radius":82,"interaction.street_gyros.x":222,"interaction.street_gyros.y":160,"interaction.street_gyros.radius":82,"interaction.pub_exit.x":153,"interaction.pub_exit.y":844,"interaction.pub_exit.radius":96,"interaction.pub_downstairs.x":1087,"interaction.pub_downstairs.y":459,"interaction.pub_downstairs.radius":70,"interaction.basement_upstairs.x":444,"interaction.basement_upstairs.y":410,"interaction.basement_upstairs.radius":65,"interaction.spar_exit.x":120,"interaction.spar_exit.y":310,"interaction.spar_exit.radius":96,"interaction.dohanybolt_exit.x":260,"interaction.dohanybolt_exit.y":805,"interaction.dohanybolt_exit.radius":96,"interaction.gyros_exit.x":304,"interaction.gyros_exit.y":455,"interaction.gyros_exit.radius":96,"hide.enabled":1,"hide.radius":80,"hide.visiblePercent":7,"hide.animationMs":200,"hide.showPrompts":1,"hide.point.pub_left.x":110,"hide.point.pub_left.y":530,"hide.point.pub_left.hideX":110,"hide.point.pub_left.hideY":530,"hide.point.pub_left.exitX":110,"hide.point.pub_left.exitY":530,"hide.point.pub_left.radius":0,"hide.point.pub_left.enabled":1,"hide.point.pub_left.side":1,"hide.point.pub_middle.x":390,"hide.point.pub_middle.y":695,"hide.point.pub_middle.hideX":390,"hide.point.pub_middle.hideY":695,"hide.point.pub_middle.exitX":390,"hide.point.pub_middle.exitY":695,"hide.point.pub_middle.radius":0,"hide.point.pub_middle.enabled":1,"hide.point.pub_middle.side":1,"hide.point.pub_right.x":1020,"hide.point.pub_right.y":435,"hide.point.pub_right.hideX":1020,"hide.point.pub_right.hideY":435,"hide.point.pub_right.exitX":1020,"hide.point.pub_right.exitY":435,"hide.point.pub_right.radius":0,"hide.point.pub_right.enabled":1,"hide.point.pub_right.side":3,"hide.point.pub_upper.x":900,"hide.point.pub_upper.y":280,"hide.point.pub_upper.hideX":900,"hide.point.pub_upper.hideY":280,"hide.point.pub_upper.exitX":900,"hide.point.pub_upper.exitY":280,"hide.point.pub_upper.radius":0,"hide.point.pub_upper.enabled":1,"hide.point.pub_upper.side":0,"hide.point.pub_bar.x":0,"hide.point.pub_bar.y":0,"hide.point.pub_bar.hideX":0,"hide.point.pub_bar.hideY":0,"hide.point.pub_bar.exitX":0,"hide.point.pub_bar.exitY":0,"hide.point.pub_bar.radius":0,"hide.point.pub_bar.enabled":0,"hide.point.pub_bar.side":2,"hide.point.basement_table_1.x":1248,"hide.point.basement_table_1.y":365,"hide.point.basement_table_1.hideX":1248,"hide.point.basement_table_1.hideY":365,"hide.point.basement_table_1.exitX":1248,"hide.point.basement_table_1.exitY":365,"hide.point.basement_table_1.radius":0,"hide.point.basement_table_1.enabled":1,"hide.point.basement_table_1.side":3,"hide.point.basement_table_2.x":1530,"hide.point.basement_table_2.y":365,"hide.point.basement_table_2.hideX":1530,"hide.point.basement_table_2.hideY":365,"hide.point.basement_table_2.exitX":1530,"hide.point.basement_table_2.exitY":365,"hide.point.basement_table_2.radius":0,"hide.point.basement_table_2.enabled":1,"hide.point.basement_table_2.side":3,"hide.point.basement_table_3.x":1248,"hide.point.basement_table_3.y":673,"hide.point.basement_table_3.hideX":1248,"hide.point.basement_table_3.hideY":673,"hide.point.basement_table_3.exitX":1248,"hide.point.basement_table_3.exitY":673,"hide.point.basement_table_3.radius":0,"hide.point.basement_table_3.enabled":1,"hide.point.basement_table_3.side":3,"hide.point.street_tree_1.x":0,"hide.point.street_tree_1.y":0,"hide.point.street_tree_1.hideX":0,"hide.point.street_tree_1.hideY":0,"hide.point.street_tree_1.exitX":0,"hide.point.street_tree_1.exitY":0,"hide.point.street_tree_1.radius":0,"hide.point.street_tree_1.enabled":0,"hide.point.street_tree_1.side":0,"hide.point.street_tree_2.x":0,"hide.point.street_tree_2.y":0,"hide.point.street_tree_2.hideX":0,"hide.point.street_tree_2.hideY":0,"hide.point.street_tree_2.exitX":0,"hide.point.street_tree_2.exitY":0,"hide.point.street_tree_2.radius":0,"hide.point.street_tree_2.enabled":0,"hide.point.street_tree_2.side":1,"hide.point.street_tree_3.x":0,"hide.point.street_tree_3.y":0,"hide.point.street_tree_3.hideX":0,"hide.point.street_tree_3.hideY":0,"hide.point.street_tree_3.exitX":0,"hide.point.street_tree_3.exitY":0,"hide.point.street_tree_3.radius":0,"hide.point.street_tree_3.enabled":0,"hide.point.street_tree_3.side":0,"building.casino.zoom":1,"building.casino.scale":1.15,"casino.manhole.enabled":0,"interaction.street_casino.x":800,"interaction.street_casino.y":510,"interaction.street_casino.radius":80,"interaction.casino_exit.x":818,"interaction.casino_exit.y":275,"interaction.casino_exit.radius":96,"transition.casino.x":808,"transition.casino.y":301,"npc.casino_bartender.x":340,"npc.casino_bartender.y":300,"npc.casino_bartender.homeX":340,"npc.casino_bartender.homeY":300,"npc.casino_bartender.facing":0,"npc.casino_bartender.scale":1.15,"npc.casino_bartender.enabled":1,"npc.casino_bartender.speed":22,"npc.casino_bartender.idleMs":2400,"npc.casino_bartender.wp1X":340,"npc.casino_bartender.wp1Y":300,"npc.casino_bartender.wp2X":340,"npc.casino_bartender.wp2Y":300,"npc.casino_bartender.wp3X":340,"npc.casino_bartender.wp3Y":300,"npc.casino_bartender.wp4X":340,"npc.casino_bartender.wp4Y":300,"npc.location.casino.scale":1};
const SETTINGS_HTML=String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroEscape · Game Settings</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#10151f;color:#f4f5f8;font:15px system-ui,Arial}main{max-width:1080px;padding:22px 18px 60px;margin:auto}header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px}h1{color:#ffc773;font-size:25px;margin:0}small,p{color:#aebbd0}button,a{border:1px solid #63748c;border-radius:9px;padding:11px 14px;background:#28344b;color:#fff;cursor:pointer;text-decoration:none;font:inherit}button:hover,a:hover{background:#394d66}.toolbar{display:flex;flex-wrap:wrap;gap:8px}.primary{background:#a46a27;border-color:#d9a85b}.sections{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,450px),1fr));gap:16px}section{background:#1b2638;border:1px solid #3a485b;border-radius:12px;padding:18px}h2{margin:0 0 5px;font-size:18px;color:#ffce87}.desc{margin:0 0 17px;font-size:13px}.field{margin:0 0 15px}.field-header{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.field-header label{font-weight:600}.valuebox{display:flex;align-items:center;gap:5px}input[type=number]{width:85px;background:#101827;color:#fff;border:1px solid #52647d;border-radius:6px;padding:6px;font:inherit}input[type=range]{width:100%;accent-color:#efb35f;cursor:pointer}.unit{color:#aebbd0;font-size:12px;width:44px}#notice{color:#f6cd86;font-weight:600}footer{padding-top:15px;color:#9aa8bc;font-size:13px}#vehicle-editor{margin:0 0 20px;padding:18px;border:1px solid #465a73;border-radius:12px;background:#1b2638}#vehicle-editor h2{margin:0 0 8px}#parking-map{display:block;width:100%;height:auto;aspect-ratio:1600/992;touch-action:none;background:#253347;border:1px solid #58677d;border-radius:8px;cursor:grab}#parking-map.dragging{cursor:grabbing}.parking-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0}.parking-toolbar label{display:flex;align-items:center;gap:7px}.parking-toolbar select{background:#182337;color:#fff;border:1px solid #58677d;padding:8px;border-radius:7px}.parking-toolbar input[type=range]{width:min(240px,45vw)}#parking-info{font-size:13px;color:#cbd7e8}.parking-hint{font-size:13px;color:#b5c0d0}
#npc-editor{margin:0 0 20px;padding:18px;border:1px solid #566477;border-radius:12px;background:#1b2638}
#npc-editor h2{margin:0 0 6px}
#npc-map{display:block;width:100%;height:auto;max-height:620px;object-fit:contain;border:1px solid #627389;border-radius:8px;background:#101827;touch-action:none;cursor:crosshair}
#npc-editor .npc-fields{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0}
#npc-editor label{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
#npc-editor select,#npc-editor input{background:#111b2d;border:1px solid #60738c;border-radius:6px;color:white;padding:7px;max-width:160px}
#npc-editor input[type=checkbox]{width:18px;height:18px}
#npc-editor p{color:#bfccdc;font-size:13px}
#npc-editor #npc-map-status{color:#fad087}
${TRANSITION_EDITOR_CSS}${INTERACTION_EDITOR_CSS}${HIDE_EDITOR_CSS}</style></head><body><main><header><div><h1>⚙️ MaestroEscape Settings</h1><p>Configure each part of the game. Settings are shared across every device.</p></div><div class="toolbar"><a href="/">Back to game</a><button id="defaults">Reset defaults</button><button id="reset-drunk">Reset drunk settings</button><button id="local-import">Use old device settings</button><button id="export">Export JSON</button><button id="import">Import JSON</button><input id="file" type="file" accept=".json,application/json" hidden></div></header><p id="notice">Loading settings…</p>${TRANSITION_EDITOR_HTML}${INTERACTION_EDITOR_HTML}${HIDE_EDITOR_HTML}<section id="vehicle-editor"><h2>Park the cars on the map</h2><p class="parking-hint">Select a car, drag it to the starting place, and use the angle slider to rotate it. Saved placements are shared across all devices.</p>
<canvas id="parking-map" width="1600" height="992" aria-label="Drag vehicle positions on the map"></canvas>
<div class="parking-toolbar"><label>Vehicle <select id="parking-choice"><option value="skoda">Skoda Superb</option><option value="octavia">Octavia Checkengine</option><option value="bike1">Bubi Bike 1</option><option value="bike2">Bubi Bike 2</option><option value="bike3">Bubi Bike 3</option></select></label><label>Rotation <input id="parking-angle" type="range" min="0" max="359" step="1"></label><strong id="parking-angle-text"></strong><button id="parking-save" class="primary">Save positions to all devices</button></div><p id="parking-info"></p></section><section id="npc-editor"><h2>NPCs · shared placement editor</h2>
<p>Drag the selected NPC on the correct interior map. Switch mode to drag its home point or one of four patrol waypoints. Scene assignment is fixed to prevent NPCs appearing in the wrong building.</p>
<div class="npc-fields"><label>Interior <select id="npc-scene"><option value="pub">Maestro Pub</option><option value="spar">SPAR</option><option value="dohanybolt">Dohánybolt</option><option value="gyros">Mester Gyros</option></select></label>
<label>NPC <select id="npc-select"></select></label>
<label>Edit <select id="npc-mode"><option value="spawn">Position</option><option value="home">Home</option><option value="wp1">Waypoint 1</option><option value="wp2">Waypoint 2</option><option value="wp3">Waypoint 3</option><option value="wp4">Waypoint 4</option></select></label></div>
<canvas id="npc-map" width="1448" height="1086" aria-label="NPC interior placement map"></canvas>
<div class="npc-fields"><label>X <input type="number" id="npc-x" step="1"></label><label>Y <input type="number" id="npc-y" step="1"></label>
<label>Facing <select id="npc-facing"><option value="0">Down</option><option value="1">Left</option><option value="2">Right</option><option value="3">Up</option></select></label>
<label>NPC size <input id="npc-scale" type="number" min=".3" max="3.5" step=".05"></label>
<label>Location size × <input id="npc-location-scale" type="number" min=".25" max="2.5" step=".05"></label>
<text id="npc-effective-size" style="color:#f1cc8e;font-size:12px"></text>
<label>Enabled <input id="npc-enabled" type="checkbox"></label>
<label>Walk speed <input id="npc-speed" type="number" min="5" max="90" step="1"></label>
<label>Rest time (ms) <input id="npc-idle" type="number" min="500" max="20000" step="100"></label></div>
<div class="npc-fields"><button type="button" id="npc-save" class="primary">Save NPC settings to all devices</button><button type="button" id="npc-reload">Reload from server</button><button type="button" id="npc-reset">Reset selected NPC</button></div>
<p id="npc-map-status">Edit positions on the map. Changes require saving.</p>
</section><div class="sections" id="sections"></div><footer>Changes apply when you return to the game. You can keep a backup using Export JSON. Settings are stored centrally in Cloudflare and loaded by all devices.</footer></main><script>
(async()=>{
 const KEY="maestroescape.gameSettings.v1",PENDING_KEY="maestroescape.gameSettings.pending.v1";
 // Multiplayer is retired; the settings editor must write to the same
 // browser-local storage that the active single-player room reads.
 const singleMode=true;
 if(singleMode){
  const back=document.querySelector(".toolbar a[href='/']");
  if(back)back.href="/?mode=single";
  const heading=document.querySelector("header p");
  if(heading)heading.textContent="Offline settings saved in this browser. No Cloudflare requests.";
 }
 const response=await fetch("/settings/schema",{cache:"no-store"});
 const {groups,defaults}=await response.json();
 const npcMetadata=[{"id":"maestro_bartender","name":"Bartender","interior":"pub","role":"worker"},{"id":"casino_bartender","name":"Casino Bartender","interior":"casino","role":"worker"},{"id":"maestro_regular_1","name":"Pub Regular 1","interior":"pub","role":"civilian"},{"id":"maestro_regular_2","name":"Pub Regular 2","interior":"pub","role":"civilian"},{"id":"maestro_regular_3","name":"Pub Regular 3","interior":"pub","role":"civilian"},{"id":"spar_cashier","name":"SPAR Cashier","interior":"spar","role":"worker"},{"id":"spar_shopper_1","name":"Shopper 1","interior":"spar","role":"civilian"},{"id":"spar_shopper_2","name":"Shopper 2","interior":"spar","role":"civilian"},{"id":"tobacco_cashier","name":"Tobacco Cashier","interior":"dohanybolt","role":"worker"},{"id":"gyros_employee","name":"Gyros Employee","interior":"gyros","role":"worker"}];
 const npcAreas={"casino":{"w":1448,"h":1086,"asset":"/assets/casino.webp"},"pub":{"w":1448,"h":1086,"asset":"/assets/interior.webp"},"spar":{"w":736,"h":384,"asset":"/assets/shop-spar.webp"},"dohanybolt":{"w":608,"h":832,"asset":"/assets/shop-dohanybolt.webp"},"gyros":{"w":768,"h":480,"asset":"/assets/shop-gyros.webp"}};


 let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const root=document.getElementById("sections"),notice=document.getElementById("notice");
 const lookup=Object.fromEntries(groups.flatMap(group=>group.fields.map(field=>[field.key,field])));
 const normalize=data=>Object.fromEntries(Object.entries(lookup).map(([key,field])=>{const v=Number(data[key]);return [key,Number.isFinite(v)?Math.max(field.min,Math.min(field.max,v)):field.value]}));
 let values=normalize(defaults),lastPersisted=JSON.stringify(values),saveHandle=0,savePromise=Promise.resolve(),storageReady=false,revision=0;
 try {
   if(singleMode){
    values=normalize({...defaults,...saved});
    lastPersisted=JSON.stringify(values);
    storageReady=true;
    notice.textContent="✓ Offline mode: settings are stored in this browser.";
   }else{
   const remote=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Cloud settings unavailable: HTTP "+r.status);return r.json()});
   values=normalize({...defaults,...remote.settings});
   lastPersisted=JSON.stringify(values);
   revision=Number(remote.revision)||0;
   storageReady=true;
   // Recover unfinished local changes without silently overwriting the cloud version.
   if(localStorage.getItem(PENDING_KEY)==="1"){
    try{
     const pending=JSON.parse(localStorage.getItem(KEY)||"null");
     if(pending&&typeof pending==="object"&&!Array.isArray(pending)){
      values=normalize({...defaults,...pending});
      notice.textContent="⚠ Unsynced settings recovered from this device. Press Save to retry Cloudflare when available.";
     }
    }catch(error){console.warn("Could not load pending local settings",error)}
   }
   // Never overwrite shared settings with another device\u0027s local cache.
   }
 }catch(error){
   // A failed Cloudflare read must never erase the settings saved on this device.
   let restored=false;
   try{
    const local=JSON.parse(localStorage.getItem(KEY)||"null");
    if(local&&typeof local==="object"&&!Array.isArray(local)){
     values=normalize({...defaults,...local});
     restored=true;
    }
   }catch(localError){console.warn("Local settings recovery failed",localError);}
   notice.textContent=restored
    ?"⚠ Cloud unavailable. Restored settings saved on THIS device only. Changes are not synced to other players."
    :"⚠ Cloud unavailable. Defaults shown; changes can be saved on THIS device only until Cloudflare recovers.";
   console.error(error);
 }
 async function push(force=false){
   clearTimeout(saveHandle);
   const payload=JSON.stringify(values);
   if(!force&&payload===lastPersisted)return savePromise;
   // Sequence writes so a previous delayed request cannot overwrite a newer vehicle position.
   const execute=async()=>{
     if(singleMode){
      try{localStorage.setItem(KEY,payload);lastPersisted=payload;notice.textContent="✓ Saved locally. Return to Single Player to see changes.";return true;}
      catch(error){notice.textContent="Offline settings could not be saved: "+error.message;return false;}
     }
     notice.textContent="Saving settings to Cloudflare…";
     try{
       const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json","X-Settings-Revision":String(revision)},body:payload,cache:"no-store"});
       if(!response.ok)throw new Error("server returned "+response.status+": "+(await response.text()).slice(0,120));
       const committed=await response.json();
       if(!committed.ok)throw new Error("server did not confirm the save");
       const check=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store",headers:{"Cache-Control":"no-store"}});
       if(!check.ok)throw new Error("verification returned "+check.status);
       const persisted=await check.json();
       const expected=JSON.parse(payload);
       const keys=Object.keys(expected);
       if(keys.some(key=>Number(persisted.settings?.[key])!==Number(expected[key])))
         throw new Error("saved settings do not match the server");
       revision=Number(persisted.revision)||Number(committed.revision)||revision;
       lastPersisted=payload;
       try{localStorage.setItem(KEY,payload);localStorage.removeItem(PENDING_KEY)}catch(error){console.warn("Local backup unavailable",error)}
       storageReady=true;
       notice.textContent="✓ All settings verified on server and saved for every device.";
       return true;
     }catch(error){
       let locallySaved=false;
       try{localStorage.setItem(KEY,payload);localStorage.setItem(PENDING_KEY,"1");locallySaved=true;}
       catch(localError){console.error("Local settings backup failed",localError);}
       notice.textContent=locallySaved
        ?"⚠ Saved on THIS device only. Cloudflare save failed ("+error.message+"). Other devices will NOT receive these changes."
        :"Could not save locally or to Cloudflare: "+error.message+". Export JSON to avoid losing changes.";
       console.error("Shared settings save failure",error);
       return false;
     }
   };
   savePromise=savePromise.then(execute,execute);
   return savePromise;
 }
 function store(){
  // Keep a local copy immediately. Cloud saves may be blocked by account quota.
  try{localStorage.setItem(KEY,JSON.stringify(values));if(!singleMode)localStorage.setItem(PENDING_KEY,"1");}catch(error){console.warn("Local backup unavailable",error)}
  notice.textContent="Saving changes…";
  clearTimeout(saveHandle);saveHandle=setTimeout(()=>void push(),600);
 }
 function draw(){root.innerHTML="";for(const group of groups){if(group.title==="NPCs"||group.title==="Hide-point coordinates")continue;const section=document.createElement("section"),title=document.createElement("h2"),desc=document.createElement("p");title.textContent=group.title;desc.textContent=group.description;desc.className="desc";section.append(title,desc);for(const field of group.fields){
  if(field.key.startsWith("drunkMode.")&&field.min===0&&field.max===1){
   const wrap=document.createElement("div");wrap.className="field";
   const label=document.createElement("label");label.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:600";
   label.textContent=field.label;
   const toggle=document.createElement("input");toggle.type="checkbox";toggle.checked=!!values[field.key];
   toggle.style.cssText="width:22px;height:22px;accent-color:#efb35f";
   toggle.addEventListener("change",()=>{values[field.key]=toggle.checked?1:0;store();});
   label.append(toggle);wrap.append(label);section.append(wrap);continue;
  }
  const wrap=document.createElement("div");wrap.className="field";const top=document.createElement("div");top.className="field-header";const lab=document.createElement("label");lab.textContent=field.label;const valBox=document.createElement("div");valBox.className="valuebox";const num=document.createElement("input");num.type="number";num.min=field.min;num.max=field.max;num.step=field.step;num.value=values[field.key];num.id="value-"+field.key;lab.htmlFor=num.id;const unit=document.createElement("span");unit.className="unit";unit.textContent=field.unit;valBox.append(num,unit);top.append(lab,valBox);const range=document.createElement("input");range.type="range";range.min=field.min;range.max=field.max;range.step=field.step;range.value=values[field.key];range.setAttribute("aria-label",field.label);const change=(value)=>{if(!Number.isFinite(Number(value)))return;const v=Math.min(field.max,Math.max(field.min,Number(value)));values[field.key]=v;range.value=v;num.value=v;store();};range.addEventListener("input",()=>change(range.value));num.addEventListener("change",()=>change(num.value));wrap.append(top,range);section.append(wrap);}root.append(section)}}

 const canvas=document.getElementById("parking-map"),context=canvas.getContext("2d");
 const carIds=["skoda","octavia","bike1","bike2","bike3"];
 const images={};
 const background=new Image();background.onload=drawParking;background.src="/assets/world.webp";
 for(const [id,url] of [["skoda","/assets/skoda-highres.webp"],["octavia","/assets/octavia.webp"],["bike1","/assets/bubi.webp"],["bike2","/assets/bubi.webp"],["bike3","/assets/bubi.webp"]]){
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
     else{context.fillStyle=id.startsWith("bike")?"#92cf4a":id==="skoda"?"#e1e8f1":"#d0dde7";context.fillRect(-width/2,-length/2,width,length);context.fillStyle="#374558";context.fillRect(-width*.35,-length*.19,width*.7,length*.4);}
     context.restore();
     context.beginPath();context.arc(pos.x,pos.y,selected?Math.max(18,width*.65):Math.max(12,width*.5),0,Math.PI*2);
     context.strokeStyle=selected?"#ffe36d":"#53ffce";context.lineWidth=selected?5:3;context.stroke();
     context.font="bold 22px system-ui";context.lineWidth=4;context.strokeStyle="#1b2638";context.textAlign="center";
     context.strokeText(id==="skoda"?"SKODA":id==="octavia"?"OCTAVIA":"BUBI "+id.slice(-1),pos.x,pos.y-(id.startsWith("bike")?29:62));
     context.fillStyle="#ffffff";context.fillText(id==="skoda"?"SKODA":id==="octavia"?"OCTAVIA":"BUBI "+id.slice(-1),pos.x,pos.y-(id.startsWith("bike")?29:62));
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


 // NPC editor reuses the existing numeric settings schema and the same shared PUT/GET.
 const npcScene=document.getElementById("npc-scene"),npcSelect=document.getElementById("npc-select");
 const npcMode=document.getElementById("npc-mode"),npcCanvas=document.getElementById("npc-map"),npcContext=npcCanvas.getContext("2d");
 const npcX=document.getElementById("npc-x"),npcY=document.getElementById("npc-y");
 const npcFacing=document.getElementById("npc-facing"),npcScale=document.getElementById("npc-scale"),npcLocationScale=document.getElementById("npc-location-scale"),npcEffectiveSize=document.getElementById("npc-effective-size");
 const npcEnabled=document.getElementById("npc-enabled"),npcSpeed=document.getElementById("npc-speed"),npcIdle=document.getElementById("npc-idle");
 const npcStatus=document.getElementById("npc-map-status");
 const npcImages={};
 const npcMaps={};
 const npcFaces=["down","left","right","up"];
 const npcKey=(id,key)=>"npc."+id+"."+key;
 const npcLocationKey=area=>"npc.location."+area+".scale";
 const npcEffectiveScale=id=>{
  const npc=npcMetadata.find(n=>n.id===id);
  return values[npcKey(id,"scale")]*values[npcLocationKey(npc.interior)];
 };
 let npcPointer=null,npcActiveId="maestro_bartender";
 function npcSelection(){return npcMetadata.find(n=>n.id===npcActiveId)||npcMetadata[0]}
 function npcKeysForMode(){const mode=npcMode.value;return mode==="spawn"?["x","y"]:mode==="home"?["homeX","homeY"]:[mode+"X",mode+"Y"]}
 function npcGetPoint(id,mode){
  const pair=mode==="spawn"?["x","y"]:mode==="home"?["homeX","homeY"]:[mode+"X",mode+"Y"];
  return {x:values[npcKey(id,pair[0])],y:values[npcKey(id,pair[1])]};
 }
 function npcSetValue(key,value){
  const field=lookup[key],v=Number(value);
  if(!field||!Number.isFinite(v))return false;
  values[key]=Math.min(field.max,Math.max(field.min,v));
  return true;
 }
 function npcSetScene(){
  const current=npcSelection();
  npcScene.value=current.interior;
  npcSelect.replaceChildren();
  for(const n of npcMetadata.filter(n=>n.interior===current.interior)){
   const option=document.createElement("option");option.value=n.id;option.textContent=n.name;npcSelect.append(option);
  }
  npcSelect.value=current.id;
  const map=npcAreas[current.interior];
  npcCanvas.width=map.w;npcCanvas.height=map.h;
  if(!npcMaps[current.interior]){
   const image=new Image();image.onload=npcRender;image.onerror=npcRender;image.src=map.asset;npcMaps[current.interior]=image;
  }
  for(const n of npcMetadata.filter(n=>n.interior===current.interior)){
   if(!npcImages[n.id]){
    const image=new Image();image.onload=npcRender;image.onerror=npcRender;
    image.src="/assets/npc/"+(n.id==="casino_bartender"?"maestro_bartender":n.id)+".webp";npcImages[n.id]=image;
   }
  }
  npcUpdateControls();npcRender();
 }
 function npcUpdateControls(){
  const id=npcActiveId,[xKey,yKey]=npcKeysForMode();
  npcX.value=values[npcKey(id,xKey)];npcY.value=values[npcKey(id,yKey)];
  npcFacing.value=values[npcKey(id,"facing")];npcScale.value=values[npcKey(id,"scale")];
  npcLocationScale.value=values[npcLocationKey(npcSelection().interior)];
  npcEffectiveSize.textContent="Effective: "+npcEffectiveScale(id).toFixed(2)+"×";
  npcEnabled.checked=!!values[npcKey(id,"enabled")];
  npcSpeed.value=values[npcKey(id,"speed")];npcIdle.value=values[npcKey(id,"idleMs")];
 }
 function npcRender(){
  if(!npcCanvas.width)return;
  const map=npcAreas[npcScene.value],background=npcMaps[npcScene.value];
  npcContext.clearRect(0,0,map.w,map.h);
  if(background?.complete&&background.naturalWidth)npcContext.drawImage(background,0,0,map.w,map.h);
  else{npcContext.fillStyle="#28364b";npcContext.fillRect(0,0,map.w,map.h);}
  for(const def of npcMetadata.filter(n=>n.interior===npcScene.value)){
   const id=def.id,spawn=npcGetPoint(id,"spawn"),enabled=!!values[npcKey(id,"enabled")];
   const selected=id===npcActiveId,scale=npcEffectiveScale(id),img=npcImages[id],face=values[npcKey(id,"facing")];
   npcContext.save();
   npcContext.globalAlpha=enabled?1:.4;
   if(img?.complete&&img.naturalWidth){
    const w=48*scale,h=60*scale;
    npcContext.drawImage(img,0,face*60,48,60,spawn.x-w/2,spawn.y-h,w,h);
   }else{
    npcContext.fillStyle=selected?"#ffd27a":"#85e5d9";npcContext.beginPath();
    npcContext.arc(spawn.x,spawn.y-12,13*scale,0,Math.PI*2);npcContext.fill();
   }
   npcContext.globalAlpha=1;
   npcContext.lineWidth=selected?4:2;
   npcContext.strokeStyle=selected?"#ffe16c":"#9debd9";
   npcContext.beginPath();npcContext.arc(spawn.x,spawn.y,selected?16:11,0,Math.PI*2);npcContext.stroke();
   if(selected){
    const home=npcGetPoint(id,"home");npcContext.strokeStyle="#66e7ff";npcContext.setLineDash([6,4]);
    npcContext.beginPath();npcContext.moveTo(spawn.x,spawn.y);npcContext.lineTo(home.x,home.y);npcContext.stroke();npcContext.setLineDash([]);
    const markers=[["home","H"],["wp1","1"],["wp2","2"],["wp3","3"],["wp4","4"]];
    for(const [mode,label] of markers){
     const p=npcGetPoint(id,mode);
     npcContext.fillStyle=mode===npcMode.value?"#ffdf67":"#89ddff";
     npcContext.beginPath();npcContext.arc(p.x,p.y,mode===npcMode.value?13:9,0,Math.PI*2);npcContext.fill();
     npcContext.fillStyle="#152030";npcContext.font="bold 14px Arial";npcContext.textAlign="center";npcContext.textBaseline="middle";npcContext.fillText(label,p.x,p.y);
    }
   }
   npcContext.restore();
  }
  npcStatus.textContent=npcSelection().name+" · "+npcScene.value+" · "+npcMode.value+" · drag to move. Unsaved edits are not yet shared.";
 }
 function npcCanvasPoint(event){
  const rect=npcCanvas.getBoundingClientRect();
  return {x:Math.round((event.clientX-rect.left)*npcCanvas.width/rect.width),
          y:Math.round((event.clientY-rect.top)*npcCanvas.height/rect.height)};
 }
 npcCanvas.addEventListener("pointerdown",event=>{
  event.preventDefault();npcPointer=event.pointerId;npcCanvas.setPointerCapture(event.pointerId);
  npcMovePointer(event);
 });
 function npcMovePointer(event){
  if(event.pointerId!==npcPointer)return;
  const point=npcCanvasPoint(event),keys=npcKeysForMode();
  npcSetValue(npcKey(npcActiveId,keys[0]),point.x);
  npcSetValue(npcKey(npcActiveId,keys[1]),point.y);
  npcUpdateControls();npcRender();
 }
 npcCanvas.addEventListener("pointermove",npcMovePointer);
 function npcStopPointer(){if(npcPointer===null)return;npcPointer=null;store();}
 npcCanvas.addEventListener("pointerup",npcStopPointer);npcCanvas.addEventListener("pointercancel",npcStopPointer);
 npcCanvas.addEventListener("lostpointercapture",npcStopPointer);
 npcScene.addEventListener("change",()=>{
  npcActiveId=npcMetadata.find(n=>n.interior===npcScene.value).id;npcSetScene();
 });
 npcSelect.addEventListener("change",()=>{npcActiveId=npcSelect.value;npcUpdateControls();npcRender();});
 npcMode.addEventListener("change",()=>{npcUpdateControls();npcRender();});
 const numericNPCFields=[
  [npcX,()=>npcKeysForMode()[0]],[npcY,()=>npcKeysForMode()[1]],
  [npcFacing,()=>"facing"],[npcScale,()=>"scale"],[npcSpeed,()=>"speed"],[npcIdle,()=>"idleMs"]
 ];
 for(const [input,key] of numericNPCFields)input.addEventListener("change",()=>{
  if(npcSetValue(npcKey(npcActiveId,key()),input.value)){npcUpdateControls();npcRender();store();}
 });
 npcLocationScale.addEventListener("change",()=>{
  if(npcSetValue(npcLocationKey(npcSelection().interior),npcLocationScale.value)){
   npcUpdateControls();npcRender();store();
  }
 });
 npcEnabled.addEventListener("change",()=>{npcSetValue(npcKey(npcActiveId,"enabled"),npcEnabled.checked?1:0);npcRender();store();});
 document.getElementById("npc-save").addEventListener("click",async()=>{
  const button=document.getElementById("npc-save");button.disabled=true;
  npcStatus.textContent="Saving NPC settings to Cloudflare…";
  try{const ok=await push(true);npcStatus.textContent=ok?"✓ Saved and verified all NPC settings.":"Cloud save failed; local backup only, see warning above.";}
  finally{button.disabled=false;}
 });
 document.getElementById("npc-reload").addEventListener("click",async()=>{
  try{
   const response=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store"});
   if(!response.ok)throw Error("HTTP "+response.status);
   const data=await response.json();values=normalize({...defaults,...data.settings});
   lastPersisted=JSON.stringify(values);revision=Number(data.revision)||0;
   draw();drawParking();npcSetScene();transitionDraw();notice.textContent="Reloaded configuration from server.";npcStatus.textContent="Reloaded NPC positions from server.";
  }catch(error){npcStatus.textContent="Reload failed: "+error.message;}
 });
 document.getElementById("npc-reset").addEventListener("click",()=>{
  if(!confirm("Reset "+npcSelection().name+" to its default placement, size, home and waypoints?"))return;
  for(const key of Object.keys(defaults))if(key.startsWith("npc."+npcActiveId+"."))values[key]=defaults[key];
  npcUpdateControls();npcRender();store();
 });
${TRANSITION_EDITOR_SCRIPT}
${INTERACTION_EDITOR_SCRIPT}
const HIDE_POINT_DEFS=${JSON.stringify(HIDE_POINT_DEFS)};
${HIDE_EDITOR_SCRIPT}
 npcSetScene();

 document.getElementById("reset-drunk").onclick=()=>{
  if(!confirm("Reset only Drunk Mode settings?"))return;
  for(const [key,value] of Object.entries(defaults))if(key.startsWith("drunkMode."))values[key]=value;
  store();draw();
 };
 document.getElementById("defaults").onclick=()=>{if(!confirm("Restore all default game settings?"))return;values=normalize(defaults);store();draw();drawParking();npcSetScene();transitionDraw()};
 document.getElementById("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(values,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="maestroescape-settings.json";a.click();URL.revokeObjectURL(url);};
 document.getElementById("local-import").onclick=()=>{if(!Object.keys(saved).length){notice.textContent="No older settings found on this device.";return;}if(!confirm("Replace shared settings using values saved on this device?"))return;values=normalize({...defaults,...saved});store();draw();drawParking();npcSetScene();transitionDraw();};
 const file=document.getElementById("file");document.getElementById("import").onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Invalid file");values=normalize({...defaults,...data});store();draw();drawParking();npcSetScene();transitionDraw();}catch{notice.textContent="Unable to import: invalid settings JSON."}file.value="";};
 draw();drawParking();if(!notice.textContent.includes("unavailable")&&!notice.textContent.includes("Imported"))notice.textContent="Shared settings loaded. Changes save automatically.";
})();
</script></body></html>`;
const HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maestro Escape | Explore</title>
<meta name="maestro-build" content="casino-browser-geometry-20261115">
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#10151f;color:#f6f3ea;font:15px system-ui,Arial}
header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:12px 20px;max-width:1360px;margin:auto}
h1{margin:0;font-size:22px;letter-spacing:.04em;color:#ffcb7b}header p{margin:3px 0 0;color:#b4bfcd;font-size:12px}
#hud{display:flex;align-items:center;gap:14px;color:#d5e0e6;font-size:13px}
#screen{margin:auto;width:min(100%,1360px);aspect-ratio:16/9;border:1px solid #39455b;overflow:hidden;position:relative;background:#19212e;border-radius:8px}
#screen canvas{display:block;width:100%!important;height:100%!important;object-fit:contain}
#npc-prompt{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);border:1px solid #d0a9709c;background:#141e30e8;border-radius:8px;padding:7px 13px;color:#ffe4b4;z-index:4;pointer-events:none;font-size:13px;font-weight:700;white-space:nowrap}
#npc-dialogue{position:absolute;inset:0;z-index:9;background:#0c1329a8;display:flex;align-items:center;justify-content:center;padding:15px}
#npc-dialogue .dialogue-panel{background:#192539;border:1px solid #7a8ba3;border-radius:13px;padding:18px;max-width:360px;width:min(100%,360px);max-height:90%;overflow-y:auto;box-shadow:0 15px 45px #0008}
#npc-dialogue h2{margin:0 0 5px;font-size:22px;color:#ffcf88}
#npc-dialogue p{margin:0 0 12px;line-height:1.45;color:#d7e1ef}
#npc-dialogue .npc-action-list{display:grid;gap:8px}
#npc-dialogue button{min-height:38px;font:inherit;white-space:normal;text-align:left}
#npc-dialogue button:disabled{opacity:.52;cursor:not-allowed}
#npc-dialogue .npc-reason{color:#b6c2d1;font-size:11px;margin-top:3px}
#npc-dialogue button.npc-close{background:#37435a;text-align:center}
#npc-dialogue[hidden],#npc-prompt[hidden]{display:none!important}
#npc-dialogue:not([hidden]) ~ #mobile-controls{z-index:10} /* Keep the mobile E action operable to close dialogue. */
@media(hover:none) and (pointer:coarse){#npc-prompt{bottom:3%;font-size:11px}#npc-dialogue .dialogue-panel{max-height:84%}}
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
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><span id="drunk-status" role="status" aria-live="off" style="font-size:12px;color:#ffd181;white-space:nowrap"></span><span id="sync-status" role="status">☁ Connecting…</span><button id="reset">Respawn</button><a class="settings-nav" href="/account/register">👤 Register</a><a class="settings-nav" href="/account/login">Sign in</a><a class="settings-nav" href="/settings">⚙ Settings</a></div></header>
<div id="screen"><div id="splash">Loading original game map and animated sprites…</div>
<div id="npc-prompt" hidden>E · Talk</div>
<div id="npc-dialogue" hidden role="dialog" aria-modal="true" aria-labelledby="npc-dialogue-title">
 <div class="dialogue-panel">
  <h2 id="npc-dialogue-title"></h2>
  <p id="npc-dialogue-message"></p>
  <div id="npc-dialogue-actions" class="npc-action-list"></div>
  <button type="button" class="npc-close" id="npc-dialogue-close">Close · Esc / E</button>
 </div>
</div>
<div id="mobile-controls" aria-label="Touch controls">
 <div id="joystick" role="application" aria-label="Movement joystick"><div id="joystick-knob"></div></div>
 <button type="button" class="action" id="mobile-interact" aria-label="Interact">E</button>
</div></div>
<div id="instructions"><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk / W accelerate, S brake/reverse, A/D steer &nbsp; <kbd>E</kbd> enter/exit cars and bikes &nbsp; <kbd>SHIFT</kbd> sprint on foot &nbsp; <kbd>R</kbd> respawn</div><span id="msg">Walk to Maestro Pub and press E to enter. E at the interior exit returns outside.</span></div>
<script>
window.__MAESTRO_BUILD__="casino-browser-geometry-20261115";
window.addEventListener("error",function(event){
 const splash=document.getElementById("splash");
 const filename=event.filename?event.filename.split("/").pop().slice(0,90):"inline script";
 const where=(event.lineno||event.colno)?(" at "+filename+":"+(event.lineno||"?")+":"+(event.colno||"?")):"";
 const message="Game startup error: "+(event.message||"Unknown JavaScript error")+where+" ["+window.__MAESTRO_BUILD__+"]";
 console.error("MaestroEscape startup diagnostic",message,event.error?.stack||"");
 if(splash&&splash.offsetParent!==null)splash.textContent=message;
});
window.addEventListener("unhandledrejection",function(event){
 const splash=document.getElementById("splash");
 const message="Game startup failed: "+(event.reason?.message||String(event.reason||"Unknown error"))+
  " ["+window.__MAESTRO_BUILD__+"]";
 console.error("MaestroEscape startup rejection",event.reason);
 if(splash&&splash.offsetParent!==null)splash.textContent=message;
});
</script>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script src="/assets/consumables.js"></script>
<script>
const DRUNK_DEFAULTS=Object.freeze({
 "drunkMode.enabled":1,"drunkMode.maxLevel":3,"drunkMode.recoverySecondsPerLevel":20,
 "drunkMode.visualsEnabled":1,"drunkMode.reduceMotion":0,
 "drunkMode.level1SwayDeg":0.4,"drunkMode.level2SwayDeg":0.4,"drunkMode.level3SwayDeg":2,
 "drunkMode.level1ZoomPulsePct":0.3,"drunkMode.level2ZoomPulsePct":0.3,"drunkMode.level3ZoomPulsePct":1.5,
 "drunkMode.swayCycleSeconds":3,"drunkMode.level2MistakesPerMinute":8,"drunkMode.level3MistakesPerMinute":20,
 "drunkMode.level2MaxDeviationDeg":20,"drunkMode.level3MaxDeviationDeg":50,
 "drunkMode.mistakeDurationMs":550,"drunkMode.transitionMs":650,"drunkMode.showStatus":1
});
const DRUNK_RANGES=Object.freeze({"enabled":[0,1],"maxLevel":[1,3],"recoverySecondsPerLevel":[5,120],"visualsEnabled":[0,1],"reduceMotion":[0,1],"level1SwayDeg":[0,3],"level2SwayDeg":[0,3],"level3SwayDeg":[0,5],"level1ZoomPulsePct":[0,2],"level2ZoomPulsePct":[0,2],"level3ZoomPulsePct":[0,4],"swayCycleSeconds":[1,8],"level2MistakesPerMinute":[0,30],"level3MistakesPerMinute":[0,45],"level2MaxDeviationDeg":[0,45],"level3MaxDeviationDeg":[0,80],"mistakeDurationMs":[150,1500],"transitionMs":[0,1500],"showStatus":[0,1]});
class DrunkMode {
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

(function(){
'use strict';
if(!window.Phaser){document.getElementById('splash').textContent="Could not load Phaser. Check internet access.";return;}
const BASE="https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/";
const HIDE_POINT_DEFS=${JSON.stringify(HIDE_POINT_DEFS)};
${HIDE_RUNTIME_SCRIPT}
const configDefaults=__MAESTRO_DEFAULT_SETTINGS__;
let overrides={};
const cfg=key=>Number.isFinite(Number(overrides[key]))?Number(overrides[key]):configDefaults[key];
if(new URL(location.href).searchParams.get("mode")==="single"){
 const link=document.querySelector('a.settings-nav[href="/settings"]');
 if(link)link.href="/settings?mode=single";
}
const drunkControllerAvailable=typeof DrunkMode==="function";
const drunkLoadError=drunkControllerAvailable?"":"Drunk controller was not initialized within the game script.";
const drunk=new DrunkMode(()=>overrides);
let drunkGhostLayers=[];
let drunkGhostAlpha=0,drunkGhostOffset=0;
function updateDrunkGhost(delta,paused=false){
 const active=drunk.config("enabled")&&drunk.config("visualsEnabled")&&!drunk.config("reduceMotion")
   &&cfg("drunkMode.doubleVisionEnabled")&&!paused;
 const level=active?drunk.getState().level:0;
 const targetAlpha=level?cfg("drunkMode.level"+level+"GhostAlpha"):0;
 const targetOffset=level?cfg("drunkMode.level"+level+"GhostOffset"):0;
 const duration=Math.max(0,cfg("drunkMode.transitionMs"));
 const factor=duration?Math.min(1,Math.max(0,delta)/duration):1;
 drunkGhostAlpha+=(targetAlpha-drunkGhostAlpha)*factor;
 drunkGhostOffset+=(targetOffset-drunkGhostOffset)*factor;
 const t=drunk.phase;
 const driftX=Math.sin(t*cfg("drunkMode.ghostDriftX")+.9)*drunkGhostOffset;
 const driftY=Math.cos(t*cfg("drunkMode.ghostDriftY")+1.5)*drunkGhostOffset*.7;
 const scale=1+Math.sin(t*.61+2)*cfg("drunkMode.ghostScalePct")/100;
 for(const layer of drunkGhostLayers){
  const {original,ghost}=layer;
  const show=!!(original.active&&original.visible&&(original!==casinoImage||insideCasino)&&drunkGhostAlpha>.002&&active);
  ghost.setVisible(show);
  if(!show)continue;
  // Independent phase and frequency from drunk camera sway.
  ghost.setAlpha(Math.max(0,Math.min(1,drunkGhostAlpha)));
  ghost.setPosition(original.x+driftX,original.y+driftY);
  ghost.setRotation(original.rotation);
  ghost.setDisplaySize(original.displayWidth*scale,original.displayHeight*scale);
 }
}
let lastDrunkHud=-1;
const drunkHud=()=>{const el=document.getElementById("drunk-status");if(!el)return;
  if(!cfg("drunkMode.showStatus")){el.textContent="";return;}
  const st=drunk.getState(),names=["Sober","Tipsy","Drunk","Wasted"];
  el.textContent=st.level?"🍺 "+names[st.level]+" "+st.level+"/"+st.maxLevel+" · "+st.seconds+"s":"🍺 Sober";
};
let drunkTestCounter=0;
const testMode=new URL(location.href).searchParams.get("mode")==="single";
if(testMode){
 const hud=document.getElementById("hud"),status=document.getElementById("drunk-status");
 const test=document.createElement("button");
 test.type="button";test.id="drunk-test-next";test.textContent="🍺 Test drunk +1";
 test.title="Simulate finishing one whole beer without using inventory.";
 test.style.cssText="padding:7px 11px;font-size:12px;border:2px solid #e2ba68;border-radius:7px;background:#493b25;color:#ffe2a2;cursor:pointer";
 const feedback=document.createElement("span");feedback.id="drunk-test-feedback";
 feedback.style.cssText="font-size:12px;font-weight:bold;color:#ffd181;white-space:normal;max-width:300px";
 feedback.setAttribute("role","status");
 const report=message=>{feedback.textContent=message;const msg=document.getElementById("msg");if(msg)msg.textContent=message;};
 test.addEventListener("click",()=>{
  try{
   if(!drunkControllerAvailable){report("⚠ "+drunkLoadError);return;}
   // This button is a controlled demonstration. Temporarily enable intoxication
   // visuals and controls without overwriting saved settings.
   if(!drunk.config("enabled")||!drunk.config("visualsEnabled")||drunk.config("reduceMotion")){
    overrides={...overrides,"drunkMode.enabled":1,"drunkMode.visualsEnabled":1,"drunkMode.reduceMotion":0,"drunkMode.showStatus":1};
   }
   const before=drunk.getState().level;
   const accepted=drunk.onBeerFinished("test-beer-"+(++drunkTestCounter));
   const state=drunk.getState();
   drunkHud();
   report(accepted?"🍺 "+(["Sober","Tipsy","Drunk","Wasted"][state.level])+" "+state.level+"/"+state.maxLevel+
     " · "+state.seconds+"s to recovery"+(before===state.level?" (already at max)":""):
     "⚠ Test beer was rejected. Check Drunk Mode settings.");
  }catch(error){console.error("Drunk Mode test failed",error);report("⚠ Drunk test error: "+(error?.message||String(error)));}
 });
 const sober=document.createElement("button");sober.type="button";sober.id="drunk-test-sober";
 sober.textContent="↺ Sober";sober.title="Reset test intoxication";
 sober.style.cssText="padding:7px 11px;font-size:12px;border:1px solid #7799ae;border-radius:7px;background:#21384d;color:#fff;cursor:pointer";
 sober.addEventListener("click",()=>{
  try{drunk.reset();drunkHud();report("🍺 Sober · 0/3");}
  catch(error){report("⚠ Reset error: "+error.message);}
 });
 if(hud){status?.after(test);test.after(sober);sober.after(feedback);}
 if(!drunkControllerAvailable)report("⚠ "+drunkLoadError);
 else feedback.textContent="Test controls ready";
}
drunkHud();
// Mobile camera multiplier affects world rendering only; DOM controls/HUD retain their size.
const isMobileView=()=>window.matchMedia("(pointer: coarse)").matches||window.innerWidth<=768;
const displayZoom=base=>base*(isMobileView()?cfg("camera.mobileZoom"):1);
let settingsSynced=false,settingsRevision=0;
const LOCAL_SETTINGS_KEY="maestroescape.gameSettings.v1";
const LOCAL_PENDING_KEY="maestroescape.gameSettings.pending.v1";
// Keep shared settings distinct from browser-only edits. Cloud reads must never
// silently overwrite unsynced values saved on this device.
let cloudSettings=null,localSettingsFingerprint=null;
const readLocalGameSettings=()=>{
 try{
  const raw=localStorage.getItem(LOCAL_SETTINGS_KEY);
  if(!raw)return null;
  const parsed=JSON.parse(raw);
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return null;
  const clean={};
  for(const [key,value] of Object.entries(parsed)){
   if(!Object.prototype.hasOwnProperty.call(configDefaults,key))continue;
   const n=Number(value);
   if(Number.isFinite(n))clean[key]=n;
  }
  return Object.keys(clean).length?clean:null;
 }catch(error){console.warn("Could not read local gameplay settings",error);return null;}
};
const localSettingsPending=()=>{try{return localStorage.getItem(LOCAL_PENDING_KEY)==="1"}catch{return false}};
const setSettingsBadge=(message,title)=>{
 const badge=document.getElementById("sync-status");
 if(badge){badge.textContent=message;badge.title=title;}
};
const applyRemoteSettings=(data,localOnly=false)=>{
 if(!data||!data.settings||typeof data.settings!=="object")throw Error("Invalid shared settings response");
 const before=JSON.stringify(overrides);
 overrides=data.settings;
 settingsRevision=Number(data.revision)||0;
 settingsSynced=!localOnly;
 setSettingsBadge(localOnly?"⚠ Local settings applied":"☁ Shared settings synced",
  localOnly?"Local changes are active in this browser, but not stored in Cloudflare.":"Cloudflare settings version "+settingsRevision);
 if(before!==JSON.stringify(overrides)&&scene?.sys?.isActive?.()){
   // Move only parked cars that remain at their previous configured starting spots.
   for(const {id,model,sprite} of registeredVehicles()){
     if(gameplay?.state||model.driver||Math.abs(model.speed)>0.1)continue; // Room owns vehicle placement once connected.
     const x=cfg("vehicle."+id+".spawnX"),y=cfg("vehicle."+id+".spawnY");
     model.x=x;model.y=y;model.angle=cfg("vehicle."+id+".angle")*Math.PI/180;
     if(sprite)sprite.setPosition(x,y).setRotation(model.angle)
                   .setDisplaySize(cfg("vehicle."+id+".width"),cfg("vehicle."+id+".length"));
   }
   character?.setScale?.(insidePub?(activeShop?shopCharacterScale(activeShop):cfg("building.pub.scale")):cfg("character.streetScale"));
   tramSprite?.setDisplaySize?.(cfg("tram.width"),cfg("tram.length"));
   const previous=JSON.parse(before||"{}");
   if(Object.keys(overrides).some(key=>key.startsWith("npc.")&&Number(overrides[key])!==Number(previous[key]))){
     if(npcDialogue)npcCloseDialogue(); // A remote edit cannot strand an open conversation.
     npcRefreshSettings();
   }
 }
};
const locs=[{name:"Maestro Pub",x:825,y:547,color:0xffc76a,info:"Maestro Pub entrance.",done:false}];
const SPAWN={x:859,y:577};
const PUB_DOOR={x:784,y:548};
const INTERIOR_SPAWN={x:332,y:741},INTERIOR_EXIT={x:153,y:844};
const INTERIOR_SIZE={w:1448,h:1086};
// These imported server modules do not exist in browser scope. Serialize their data into the game script.
const CASINO_SIZE=${JSON.stringify(CASINO_SIZE)};
const CASINO_SPAWN=${JSON.stringify(CASINO_SPAWN)};
const CASINO_EXIT=${JSON.stringify(CASINO_EXIT)};
const CASINO_WALLS=${JSON.stringify(CASINO_WALLS)};
const CASINO_HOTSPOTS=${JSON.stringify(CASINO_HOTSPOTS)};
// Basement collision coordinates follow the uploaded gameplay_geometry.json (1792 x 896).
// Source: maestro_basement_visual_map_files, tiled map 56×28 at 32px/tile.
// FloorArt uses a single full-sized visual atlas. The WebP must be present in Assets/Maps.
const BASEMENT_SIZE={w:1792,h:896},BASEMENT_SPAWN={x:490,y:349};
const BASEMENT_STAIRS={x:401,y:373,w:86,h:74};
// The visual stairway is at 1087,352, but the walkable approach is lower on the floor.
// Screenshot-confirmed player feet at 1087,459 must activate the downstairs interaction.
const PUB_BASEMENT_STAIRS={x:1087,y:352};
const PUB_BASEMENT_APPROACH={x:1087,y:459,radius:70};
// Runtime interaction points are separate from spawn destinations.
const interactionAt=(id,fallback,radius)=>({
 x:cfg("interaction."+id+".x")??fallback.x,
 y:cfg("interaction."+id+".y")??fallback.y,
 radius:cfg("interaction."+id+".radius")??radius
});
const interactionNear=(id,fallback,radius)=>{const point=interactionAt(id,fallback,radius);return near(player,point.x,point.y,point.radius)};
const shopInteractionId=(shop,suffix)=>{const name=Object.keys(SHOPS).find(key=>SHOPS[key]===shop);return name?name+"_"+suffix:null};
const pubBasementStairsNear=()=>insidePub&&!insideBasement&&!insideCasino&&!activeShop&&
 interactionNear("pub_downstairs",PUB_BASEMENT_APPROACH,PUB_BASEMENT_APPROACH.radius);
const BASEMENT_WALLS=[
 [55,55,1650,38],[15,85,35,630],[1670,85,38,640],
 [60,752,245,45],[422,755,1240,42],
 [685,95,355,120],[1135,165,180,175],[1390,165,185,175],
 [545,425,243,305],[895,408,225,335],[1320,409,225,335],
 [1153,503,145,140],[95,112,170,95],[1570,445,80,87],[340,460,75,90],
 [75,510,265,204],[175,402,163,114],[205,321,220,70]
];
const basementStairNear=()=>insideBasement&&
 interactionNear("basement_upstairs",{x:BASEMENT_STAIRS.x+BASEMENT_STAIRS.w/2,y:BASEMENT_STAIRS.y+BASEMENT_STAIRS.h/2},65);
let insideBasement=false,basementImage=null,basementStairsHint=null,pubStairsHint=null,pubStairReturn=null;
let insidePub=false,insideCasino=false,streetPos={...SPAWN},casinoReturnPos=null,casinoImage=null,casinoExitHint=null,casinoManholeMarker=null,streetImage=null,interiorImage=null,exitHint=null,activeShop=null;
// A resumed game tab can keep stale settings after visiting the editor.
// Read the four casino street fields directly from the same localStorage key used by Settings.
function refreshCasinoStreetSettings(){
 const saved=readLocalGameSettings();
 if(!saved)return;
 for(const key of ["casino.manhole.enabled","interaction.street_casino.x","interaction.street_casino.y","interaction.street_casino.radius"]){
  if(Object.prototype.hasOwnProperty.call(saved,key))overrides[key]=saved[key];
 }
}
const casinoManholeNearby=()=>!insidePub&&!!cfg("casino.manhole.enabled")&&interactionNear("street_casino",{x:800,y:510},80);
function casinoEntranceFeedback(){
 const point=interactionAt("street_casino",{x:800,y:510},80);
 const distance=Math.round(Math.hypot(player.x-point.x,player.y-point.y));
 if(distance<=point.radius&&!cfg("casino.manhole.enabled")){
  show("Casino manhole is disabled. Enable 'street casino manhole' in Settings → Doors & stairs.");return true;
 }
 if(cfg("casino.manhole.enabled")&&distance>point.radius){
  show("Casino manhole: "+distance+" px away (E radius "+point.radius+" px). Walk to the manhole marker at X "+point.x+", Y "+point.y+".");return true;
 }
 return false;
}
const casinoExitNearby=()=>insideCasino&&interactionNear("casino_exit",CASINO_EXIT,CASINO_EXIT.radius);
const casinoNearestHotspot=()=>insideCasino?CASINO_HOTSPOTS.map(h=>({...h,d:Math.hypot(player.x-h.x,player.y-h.y)})).filter(h=>h.d<h.radius).sort((a,b)=>a.d-b.d)[0]||null:null;
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

// Phase 2: deterministic local NPC behavior; no purchases, multiplayer authority or task grants.
// NPC sheets in Assets/NPCs are 4x4 frames (48x60): down,left,right,up; 4 frames each.
const NPC_DEFINITIONS=[{"id":"maestro_bartender","name":"Bartender","interior":"pub","role":"worker","x":413,"y":210,"face":"down","scale":2},{"id":"casino_bartender","name":"Casino Bartender","interior":"casino","role":"worker","x":340,"y":300,"face":"down","scale":1.15},{"id":"maestro_regular_1","name":"Pub Regular 1","interior":"pub","role":"civilian","x":342,"y":511,"face":"left","scale":2},{"id":"maestro_regular_2","name":"Pub Regular 2","interior":"pub","role":"civilian","x":648,"y":707,"face":"right","scale":2},{"id":"maestro_regular_3","name":"Pub Regular 3","interior":"pub","role":"civilian","x":1043,"y":774,"face":"up","scale":2},{"id":"spar_cashier","name":"SPAR Cashier","interior":"spar","role":"worker","x":478,"y":224,"face":"down","scale":0.99},{"id":"spar_shopper_1","name":"Shopper 1","interior":"spar","role":"civilian","x":233,"y":249,"face":"right","scale":0.99},{"id":"spar_shopper_2","name":"Shopper 2","interior":"spar","role":"civilian","x":636,"y":243,"face":"left","scale":0.99},{"id":"tobacco_cashier","name":"Tobacco Cashier","interior":"dohanybolt","role":"worker","x":519,"y":416,"face":"down","scale":0.89},{"id":"gyros_employee","name":"Gyros Employee","interior":"gyros","role":"worker","x":294,"y":291,"face":"down","scale":1.12}];
const NPC_FACING={down:0,left:4,right:8,up:12};
const npcEntities=new Map();

const NPC_CONFIG_IDS=["casino_bartender","maestro_bartender","maestro_regular_1","maestro_regular_2","maestro_regular_3","spar_cashier","spar_shopper_1","spar_shopper_2","tobacco_cashier","gyros_employee"];
const NPC_SCENE_IDS={"casino_bartender":"casino","maestro_bartender":"pub","maestro_regular_1":"pub","maestro_regular_2":"pub","maestro_regular_3":"pub","spar_cashier":"spar","spar_shopper_1":"spar","spar_shopper_2":"spar","tobacco_cashier":"dohanybolt","gyros_employee":"gyros"};
const NPC_DIRECTIONS=["down","left","right","up"];
function npcConfig(id,key){return cfg("npc."+id+"."+key)}
function npcCurrentEnabled(id){return npcConfig(id,"enabled")!==0}
function npcEffectiveScale(id,interior){
 return npcConfig(id,"scale")*cfg("npc.location."+interior+".scale");
}
function npcRefreshSettings(){
 if(!npcEntities.size)return;
 for(const entity of npcEntities.values()){
  const id=entity.definition.id,selectedFace=NPC_DIRECTIONS[Math.round(npcConfig(id,"facing"))]||"down";
  entity.x=npcConfig(id,"x");entity.y=npcConfig(id,"y");
  entity.home={x:npcConfig(id,"homeX"),y:npcConfig(id,"homeY")};
  entity.initialFacing=selectedFace;
  entity.routeIndex=0;entity.target=null;entity.stateClock=0;
  entity.sprite.setScale(npcEffectiveScale(id,entity.definition.interior)*(entity.loaded?1:.60));
  npcSetFacing(entity,selectedFace,false);
  entity.state=NPC_ROUTINES[id]?"idle":"working";
  entity.waitMs=npcConfig(id,"idleMs");
  npcApplyVisual(entity);
 }
 showInteriorNPCs(npcInteriorKey());
}


// Authorable, deliberately short paths on unobstructed interior floor.
// A route is attempted only after its entire segment passes collision checking.
const NPC_ROUTINES={
 maestro_regular_1:{route:[[36,0],[36,32],[0,32],[0,0]],idleMs:3700,walkSpeed:35,walkFrameMs:210,seatMs:7500},
 maestro_regular_2:{route:[[38,0],[38,25],[0,25],[0,0]],idleMs:4500,walkSpeed:32,walkFrameMs:225,seatMs:8400},
 maestro_regular_3:{route:[[-35,0],[-35,-28],[0,-28],[0,0]],idleMs:5000,walkSpeed:34,walkFrameMs:220,seatMs:9200},
 spar_shopper_1:{route:[[-25,0],[-25,27],[0,27],[0,0]],idleMs:2400,walkSpeed:24,walkFrameMs:230,seatMs:4000},
 spar_shopper_2:{route:[[20,0],[20,-35],[0,-35],[0,0]],idleMs:3300,walkSpeed:26,walkFrameMs:230,seatMs:4200}
};
const NPC_WORK_MS={casino_bartender:2600,maestro_bartender:2600,spar_cashier:2100,tobacco_cashier:2800,gyros_employee:1850};
// NPCs use a narrow feet-only collision footprint so staff can stand beside shelves and counters.
const NPC_STEP_RADIUS=7;
function npcFloorPassable(interior,x,y){
 const area=interior==="casino"?CASINO_SIZE:interior==="pub"?INTERIOR_SIZE:SHOPS[interior]?.size;
 const walls=interior==="casino"?CASINO_WALLS:interior==="pub"?interiorWalls:SHOPS[interior]?.walls;
 if(!area||!walls||x<18||y<18||x>area.w-18||y>area.h-18)return false;
 const r=NPC_STEP_RADIUS;
 return !walls.some(([bx,by,bw,bh])=>x+r>bx&&x-r<bx+bw&&y+r>by&&y-r<by+bh);
}
function npcSegmentClear(interior,x1,y1,x2,y2){
 const length=Math.hypot(x2-x1,y2-y1),samples=Math.max(1,Math.ceil(length/5));
 for(let step=0;step<=samples;step++){
  const t=step/samples;
  if(!npcFloorPassable(interior,x1+(x2-x1)*t,y1+(y2-y1)*t))return false;
 }
 return true;
}
function npcCanOccupy(entity,x,y){
 if(!npcFloorPassable(entity.definition.interior,x,y))return false;
 if(Math.hypot(player.x-x,player.y-y)<23&&insidePub&&npcInteriorKey()===entity.definition.interior)return false;
 for(const other of npcEntities.values()){
  if(other===entity||other.definition.interior!==entity.definition.interior||!npcCurrentEnabled(other.definition.id))continue;
  if(Math.hypot(other.x-x,other.y-y)<22)return false;
 }
 return true;
}
function npcSetFacing(entity,facing,walking=false){
 if(entity.facing!==facing||entity.walking!==walking){
  entity.facing=facing;entity.walking=walking;
  entity.sprite.anims.stop();
 }
 const key="npc_"+entity.definition.id;
 const anim=key+"_walk_"+facing;
 if(walking&&entity.loaded&&scene?.anims?.exists(anim)){
  if(entity.sprite.anims.currentAnim?.key!==anim||!entity.sprite.anims.isPlaying)
   entity.sprite.play(anim,true);
 }else{
  entity.sprite.anims.stop();
  entity.sprite.setFrame(NPC_FACING[facing]);
 }
}
function npcApplyVisual(entity){
 entity.sprite.setPosition(entity.x,entity.y).setDepth(5+entity.y/2000);
 entity.label.setPosition(entity.x,entity.y-(entity.loaded?60:72)*entity.sprite.scaleY-10);
 entity.label.setDepth(8+entity.y/2000);
}
function npcPickRoute(entity){
 const routine=NPC_ROUTINES[entity.definition.id];
 if(!routine)return false;
 // Patrol is local and repeatable, not random. Skip any blocked target.
 for(let attempt=0;attempt<4;attempt++){
  const index=(entity.routeIndex+attempt)%4;
  const number=index+1;
  const target={x:npcConfig(entity.definition.id,"wp"+number+"X"),y:npcConfig(entity.definition.id,"wp"+number+"Y")};
  if(Math.hypot(target.x-entity.x,target.y-entity.y)<5)continue;
  if(!npcSegmentClear(entity.definition.interior,entity.x,entity.y,target.x,target.y))continue;
  if(!npcCanOccupy(entity,target.x,target.y))continue;
  entity.target=target;
  entity.routeIndex=(index+1)%routine.route.length;
  entity.state="walking";
  return true;
 }
 return false;
}
function npcTick(dt){
 const current=npcInteriorKey();
 if(!current)return; // No invisible off-screen background wandering.
 const stepMs=Math.min(Math.max(0,dt),45);
 for(const entity of npcEntities.values()){
  if(entity.definition.interior!==current||!npcCurrentEnabled(entity.definition.id))continue;
  const routine=NPC_ROUTINES[entity.definition.id];
  entity.stateClock+=stepMs;
  if(!routine){
   // Counter workers never leave the staff side.
   const cycle=Math.max(500,npcConfig(entity.definition.id,"idleMs"));
   entity.state=entity.stateClock%cycle<cycle*.68?"working":"idle";
   npcSetFacing(entity,entity.initialFacing,false);
   // Frame 1 provides a restrained working/handling gesture when supported.
   if(entity.loaded&&entity.state==="working"&&Math.floor(entity.stateClock/620)%2)
    entity.sprite.setFrame(NPC_FACING[entity.facing]+1);
   npcApplyVisual(entity);
   continue;
  }
  if(entity.state==="walking"&&entity.target){
   const distance=Math.hypot(entity.target.x-entity.x,entity.target.y-entity.y);
   if(distance<3){
    entity.x=entity.target.x;entity.y=entity.target.y;entity.target=null;
    entity.state=entity.definition.interior==="pub"?"sitting":"idle";
    entity.waitMs=npcConfig(entity.definition.id,"idleMs");
    entity.stateClock=0;
    npcSetFacing(entity,entity.initialFacing,false);
   }else{
    const step=Math.min(distance,npcConfig(entity.definition.id,"speed")*stepMs/1000);
    const nx=entity.x+(entity.target.x-entity.x)*step/distance;
    const ny=entity.y+(entity.target.y-entity.y)*step/distance;
    if(npcCanOccupy(entity,nx,ny)&&npcSegmentClear(current,entity.x,entity.y,nx,ny)){
     entity.x=nx;entity.y=ny;
     const facing=Math.abs(entity.target.x-entity.x)>Math.abs(entity.target.y-entity.y)?
       (entity.target.x>entity.x?"right":"left"):(entity.target.y>entity.y?"down":"up");
     npcSetFacing(entity,facing,true);
    }else{
     entity.target=null;entity.state="waiting";entity.waitMs=1500;entity.stateClock=0;
     npcSetFacing(entity,entity.initialFacing,false);
    }
   }
  }else if(entity.stateClock>=entity.waitMs){
   entity.stateClock=0;
   if(!npcPickRoute(entity)){
    entity.state="waiting";entity.waitMs=npcConfig(entity.definition.id,"idleMs");
    npcSetFacing(entity,entity.initialFacing,false);
   }
  }else{
   // Civilians alternate between waiting, browsing and seated/idle pauses.
   entity.state=entity.definition.interior==="pub"?"sitting":"idle";
   npcSetFacing(entity,entity.initialFacing,false);
  }
  npcApplyVisual(entity);
 }
}

// Interaction positions are on the public side of counters. NPC sprites stay on the staff side.
// The offset follows each worker if an editor changes their saved position.
const NPC_SERVICE_OFFSETS={
 casino_bartender:{x:0,y:145},maestro_bartender:{x:0,y:188},
 spar_cashier:{x:-53,y:40},
 tobacco_cashier:{x:0,y:9},
 gyros_employee:{x:0,y:24}
};
function npcInteractionPoint(entity){
 const offset=NPC_SERVICE_OFFSETS[entity.definition.id];
 return offset?{x:entity.x+offset.x,y:entity.y+offset.y}:entity;
}
function npcInteractionDistance(entity){
 const p=npcInteractionPoint(entity);
 return Math.hypot(player.x-p.x,player.y-p.y);
}
function npcInteriorKey(){return !insidePub?null:(insideCasino?"casino":insideBasement?"basement":activeShop?Object.keys(SHOPS).find(id=>SHOPS[id]===activeShop):"pub");}
function showInteriorNPCs(interior){
 for(const def of NPC_DEFINITIONS){
  const entity=npcEntities.get(def.id);
  if(!entity)continue;
  const visible=interior===def.interior;
  entity.sprite.setVisible(visible&&npcCurrentEnabled(def.id));
  entity.label.setVisible(visible&&npcCurrentEnabled(def.id));
  if(!visible&&entity.sprite.anims.isPlaying)entity.sprite.anims.stop();
 }
}
function initializeNPCs(scene){
 if(npcEntities.size)return; // One Phaser scene, one entity per stable NPC ID.
 for(const def of NPC_DEFINITIONS){
  const key="npc_"+def.id;
  const loaded=scene.textures.exists(key);
  // Never substitute the player avatar for an NPC. It hides missing-asset bugs
  // and makes every NPC appear to be the same person.
  const sprite=loaded?scene.add.sprite(def.x,def.y,key,NPC_FACING[def.face]):
    scene.add.sprite(def.x,def.y,"__MISSING",0);
  if(!loaded)console.error("NPC asset missing, not showing player as placeholder:",def.id);
  // Sprite feet anchored at world location, consistent with the player.
  sprite.setOrigin(.5,1).setScale(npcEffectiveScale(def.id,def.interior)*(loaded?1:.60))
   .setDepth(5+def.y/2000).setVisible(false).setData("npcId",def.id);
  const label=scene.add.text(def.x,def.y-(loaded?60*def.scale:72*def.scale)-10,def.name,
    {fontFamily:"Arial",fontSize:"13px",color:"#ffffff",stroke:"#101923",strokeThickness:3,
     backgroundColor:"#152030bb",padding:{x:4,y:2}})
    .setOrigin(.5,1).setDepth(8).setVisible(false);
  // Initial worker positions are fixed; civilian routes are validated against floors.
  const routine=NPC_ROUTINES[def.id];
  const entity={definition:def,sprite,label,loaded,x:npcConfig(def.id,"x"),y:npcConfig(def.id,"y"),
    home:{x:npcConfig(def.id,"homeX"),y:npcConfig(def.id,"homeY")},facing:NPC_DIRECTIONS[npcConfig(def.id,"facing")]||def.face,initialFacing:NPC_DIRECTIONS[npcConfig(def.id,"facing")]||def.face,walking:false,routeIndex:0,
    target:null,state:routine?(def.interior==="pub"?"sitting":"idle"):"working",
    stateClock:0,waitMs:npcConfig(def.id,"idleMs")};
  sprite.setScale(npcEffectiveScale(def.id,def.interior)*(loaded?1:.60));
  entity.label.setVisible(false);
  // For civilians whose authoring anchor crosses a shelf edge, search near the seat
  // without relocating counter employees into customer-only floor areas.
  if(false&&routine&&!npcFloorPassable(def.interior,entity.x,entity.y)){
   let found=false;
   for(let r=8;r<=80&&!found;r+=8)for(let a=0;a<16;a++){
    const angle=a*Math.PI/8,nx=def.x+Math.cos(angle)*r,ny=def.y+Math.sin(angle)*r;
    if(npcFloorPassable(def.interior,nx,ny)){
     entity.x=nx;entity.y=ny;entity.home={x:nx,y:ny};found=true;break;
    }
   }
  }
  npcApplyVisual(entity);
  npcEntities.set(def.id,entity);
 }
}

const PARKING={get x(){return cfg("vehicle.skoda.spawnX")},get y(){return cfg("vehicle.skoda.spawnY")}};
// Uses the same forward-speed / steering model as the original Vehicle.ts controller.
const car={x:PARKING.x,y:PARKING.y,angle:cfg("vehicle.skoda.angle")*Math.PI/180,speed:0,wheelTurn:0,driver:false,frame:3};
const OCTAVIA_PARKING={get x(){return cfg("vehicle.octavia.spawnX")},get y(){return cfg("vehicle.octavia.spawnY")}};
const octavia={x:OCTAVIA_PARKING.x,y:OCTAVIA_PARKING.y,angle:cfg("vehicle.octavia.angle")*Math.PI/180,speed:0,wheelTurn:0,driver:false};
const bikes=[1,2,3].map(n=>{const id="bike"+n;return {id,type:"bike",x:cfg("vehicle."+id+".spawnX"),y:cfg("vehicle."+id+".spawnY"),angle:cfg("vehicle."+id+".angle")*Math.PI/180,speed:0,wheelTurn:0,driver:false};});
const bikeSprites=[],bikeControllers=[],remoteBikeRiders=new Map(),vehicleOccupancyTags=new Map();
function registeredVehicles(){return [{id:"skoda",model:car,sprite:carSprite,controller:vehicleController,label:"Skoda Superb 2.0TDI"},{id:"octavia",model:octavia,sprite:octaviaSprite,controller:octaviaController,label:"Octavia Checkengine"},...bikes.map((model,i)=>({id:model.id,model,sprite:bikeSprites[i],controller:bikeControllers[i],label:"Bubi Bike "+(i+1)}))];}
const DRIVING_ZOOM=()=>cfg("camera.drivingZoom");
let vehicleController=null,octaviaController=null,activeVehicle=null;
let carSprite=null,octaviaSprite=null,tramSprite=null;
// Tram follows the diagonal rails on the new map, with a 3-second station dwell.
const TRAM_START={x:-170,y:0},TRAM_STOP={x:455,y:524},TRAM_END={x:1130,y:1090};
const TRAM_DWELL_MS=3000;
let tramDeathOverlay=null,tramLocalDeath=null;
const tramGraveSprites=new Map();
function tramOverlapsPlayer(tram,person){
 if(!tram?.visible||!person)return false;
 const angle=tram.rotation,dx=person.x-tram.x,dy=person.y-tram.y;
 const forwardX=Math.sin(angle),forwardY=-Math.cos(angle);
 const along=dx*forwardX+dy*forwardY;
 const across=dx*forwardY-dy*forwardX;
 // Only the tram's advancing front nose can hit a pedestrian.
 return along>=cfg("tram.length")/2-12&&along<=cfg("tram.length")/2+18&&
        Math.abs(across)<=cfg("tram.width")/2+12;
}
function renderTramGraves(){
 if(!scene||!gameplay?.state)return;
 const ids=new Set();
 for(const grave of gameplay.state.graves||[]){
  ids.add(grave.id);
  let marker=tramGraveSprites.get(grave.id);
  if(!marker){
   marker=scene.add.container(grave.x,grave.y).setDepth(6+grave.y/2000);
   const stone=scene.add.graphics();
   stone.fillStyle(0x121a29,.5).fillEllipse(0,1,37,12);
   stone.fillStyle(0x6e7782,1).fillRoundedRect(-15,-31,30,32,8);
   stone.lineStyle(2,0xaeb6c0,1).strokeRoundedRect(-15,-31,30,32,8);
   stone.fillStyle(0x7b8896,1).fillRoundedRect(-12,-7,24,7,2);
   const rip=scene.add.text(0,-17,"RIP",{fontFamily:"Arial",fontSize:"11px",
    color:"#f3f3ef",fontStyle:"bold",stroke:"#364252",strokeThickness:1}).setOrigin(.5);
   marker.add([stone,rip]);tramGraveSprites.set(grave.id,marker);
  }
  marker.setVisible(!insidePub&&Date.now()>=grave.at+430&&Date.now()<(grave.expiresAt??grave.at+30000));
 }
 for(const [id,marker] of tramGraveSprites){
  if(!ids.has(id)){marker.destroy();tramGraveSprites.delete(id);}
 }
}
function displayTramDeath(death){
 tramLocalDeath=death;
 npcCloseDialogue();
 vehicleSeatPanel?.remove();vehicleSeatPanel=null;
 if(!tramDeathOverlay){
  tramDeathOverlay=document.createElement("div");
  tramDeathOverlay.id="tram-death-overlay";
  tramDeathOverlay.style.cssText="position:absolute;left:50%;top:9%;transform:translateX(-50%);z-index:18;background:#1c1725e8;border:2px solid #b7b8c0;border-radius:12px;padding:10px 20px;color:#fff;text-align:center;font:700 19px Arial;pointer-events:none";
  document.getElementById("screen").append(tramDeathOverlay);
 }
 tramDeathOverlay.hidden=false;
 if(!scene||!character)return;
 scene.tweens.killTweensOf(character);
 player.x=death.x;player.y=death.y;
 moving=false;character.anims.stop();
 character.setPosition(death.x,death.y).setAlpha(1).setAngle(0).setVisible(true);
 // Two-stage impact: thrown into the air, then tumbles onto the ground.
 const side=Math.sign(death.knockX)||1;
 scene.tweens.add({targets:character,
  x:death.x+death.knockX*.55,y:death.y+death.knockY*.55-26,
  angle:side*-32,scaleX:character.scaleX*.9,
  duration:190,ease:"Cubic.easeOut",
  onComplete:()=>scene.tweens.add({targets:character,
   x:death.x+death.knockX,y:death.y+death.knockY,
   angle:side*88,alpha:0,scaleY:character.scaleY*.65,
   duration:370,ease:"Bounce.easeOut",onComplete:()=>character.setVisible(false)})});
}
function completeTramRespawn(serverPlayer){
 tramLocalDeath=null;
 if(tramDeathOverlay)tramDeathOverlay.hidden=true;
 if(!scene||!character)return;
 scene.tweens.killTweensOf(character);
 player.x=serverPlayer?.x??SPAWN.x;
 player.y=serverPlayer?.y??SPAWN.y;player.face="down";moving=false;
 character.setPosition(player.x,player.y).setAlpha(1).setAngle(0);
 character.setScale(cfg("character.streetScale"));
 character.setFrame(0).setVisible(true);
 scene.cameras.main.startFollow(character,true,.13,.13);
 scene.cameras.main.setZoom(displayZoom(cfg("camera.streetZoom")));
 status.textContent="On foot";
 show("Respawned! Your inventory is empty.");
}

const tramPeriodMs=()=>cfg("tram.interval")*1000;
const tramRunMs=()=>Math.max(1000,Math.min(cfg("tram.travelTime")*1000,tramPeriodMs()-TRAM_DWELL_MS-250));
const tramFirstLegRatio=Math.hypot(TRAM_STOP.x-TRAM_START.x,TRAM_STOP.y-TRAM_START.y)/Math.hypot(TRAM_END.x-TRAM_START.x,TRAM_END.y-TRAM_START.y);
const TRAM_ANGLE=Math.atan2(TRAM_END.x-TRAM_START.x,-(TRAM_END.y-TRAM_START.y));
let riderSprite=null;
let hideController=null;
let player={x:SPAWN.x,y:SPAWN.y,face:"down"},mapSize={w:1600,h:992},obstacles=[],scene,character,keys,labels=[],toastUntil=0,moving=false,assetFailed=false;
const touchInput={x:0,y:0};
const joystick=document.getElementById("joystick"),knob=document.getElementById("joystick-knob");
let joystickPointer=null;
function joystickMove(event){
 const box=joystick.getBoundingClientRect();
 const midX=box.left+box.width/2,midY=box.top+box.height/2;
 // In portrait-forced landscape the entire screen is rotated 90 degrees.
 // Convert pointer delta back into the joystick's local axes.
 const turned=document.body.classList.contains("maestro-portrait-landscape");
 const dx=turned?event.clientY-midY:event.clientX-midX;
 const dy=turned?-(event.clientX-midX):event.clientY-midY;
 const limit=(turned?joystick.offsetWidth:box.width)*.30;
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

// Consumables are now backed by ConsumableRoom, not placeholder NPC toasts.
const NPC_DIALOGUES={
 casino_bartender:{intro:"Welcome to the underground bar. Beer?",talk:["The tables are busy. The beer is cold.","The house keeps its drinks simple."],actions:[["beer","Order beer"],["collect","Collect beer"]]},
 maestro_bartender:{intro:"Welcome to Maestro. What can I get you?",talk:["Welcome in. The evening is just getting started.","Take your time, there's plenty of room at the bar."],
 actions:[["beer","Order beer"]]},
 maestro_regular_1:{intro:"He looks up from his drink.",talk:["Been here all evening. You know how it goes.","The tram's never on time when you need it."],
 actions:[["borrow","Ask for cigarette"]]},
 maestro_regular_2:{intro:"He seems ready for a chat.",talk:["Another round, another story.","Don't forget where you parked."],
 actions:[["borrow","Borrow a cigarette"]]},
 maestro_regular_3:{intro:"He waves from his seat.",talk:["You heading somewhere?","There's always something happening here."],
 actions:[["borrow","Borrow a cigarette"]]},
 spar_cashier:{intro:"Welcome to SPAR.",talk:["The checkout is open.","Anything else for you?"],
 actions:[]},
 spar_shopper_1:{intro:"Someone is browsing the shelves.",talk:["I'm just looking, thanks.","It gets busy in here around closing time."],actions:[]},
 spar_shopper_2:{intro:"A customer turns to you.",talk:["Can't decide what to buy.","I think I forgot my shopping list."],actions:[]},
 tobacco_cashier:{intro:"The cashier waits behind the counter.",talk:["Good evening.","What can I help you with?"],actions:[["cigarettes","Buy cigarettes"],["scratch_ticket","Buy kaparós sorsjegy"]]},
 gyros_employee:{intro:"The grill is hot and the counter is busy.",talk:["Fresh gyros coming up.","One moment, we're preparing another batch."],
 actions:[["kebab","Order kebab"],["collect","Collect kebab"]]}
};
let npcDialogue=null,npcActionAt=0,npcTalkCount=0,gameplay=null;
const npcPrompt=document.getElementById("npc-prompt");
const npcModal=document.getElementById("npc-dialogue");
const npcTitle=document.getElementById("npc-dialogue-title");
const npcMessage=document.getElementById("npc-dialogue-message");
const npcActions=document.getElementById("npc-dialogue-actions");
function npcNearestTarget(){
 const interior=npcInteriorKey();
 if(!interior||activeVehicle)return null;
 const limit=cfg("npc.interactRadius");
 let closest=null,best=limit;
 for(const entity of npcEntities.values()){
  if(entity.definition.interior!==interior||!entity.sprite.visible)continue;
  const distance=npcInteractionDistance(entity);
  if(distance<best){closest=entity;best=distance;}
 }
 return closest;
}
function npcExitDistance(){
 if(!insidePub)return Infinity;
 const point=insideCasino?interactionAt("casino_exit",CASINO_EXIT,CASINO_EXIT.radius):insideBasement?interactionAt("basement_upstairs",{x:BASEMENT_STAIRS.x+BASEMENT_STAIRS.w/2,y:BASEMENT_STAIRS.y+BASEMENT_STAIRS.h/2},65):
  activeShop?interactionAt(shopInteractionId(activeShop,"exit"),activeShop.exit,96):
  interactionAt("pub_exit",INTERIOR_EXIT,96);
 return Math.hypot(player.x-point.x,player.y-point.y);
}
function npcDialogueOpen(){return !!npcDialogue;}
function npcCloseDialogue(){
 const entity=npcDialogue;
 if(entity){
  // Keep the original routine and wait timer; avoid resetting stock/progress.
  entity.state=entity.savedNpcState||"idle";
  entity.stateClock=entity.savedNpcClock||0;
  entity.waitMs=entity.savedNpcWait||0;
  entity.savedNpcState=null;
  npcSetFacing(entity,entity.initialFacing,false);
 }
 npcDialogue=null;
 npcModal.hidden=true;
 npcActions.replaceChildren();
 npcActionAt=performance.now();
}
function npcOpenDialogue(entity){
 if(!entity||npcDialogue||!insidePub||entity.definition.interior!==npcInteriorKey())return;
 if(!npcCurrentEnabled(entity.definition.id)||npcInteractionDistance(entity)>cfg("npc.interactRadius"))return;
 npcDialogue=entity;
 entity.savedNpcState=entity.state;
 entity.savedNpcClock=entity.stateClock;
 entity.savedNpcWait=entity.waitMs;
 entity.state="interacting";
 entity.target=null; // An interrupted walking route must not continue mid-dialogue.
 npcSetFacing(entity,Math.abs(player.x-entity.x)>Math.abs(player.y-entity.y)
  ?(player.x<entity.x?"left":"right"):(player.y<entity.y?"up":"down"),false);
 const def=entity.definition,script=NPC_DIALOGUES[def.id];
 npcTitle.textContent=def.name;
 npcMessage.textContent=script.intro;
 npcActions.replaceChildren();
 const add=(label,action,reason)=>{
  const button=document.createElement("button");
  button.type="button";button.textContent=label;
  if(reason){button.disabled=true;button.title=reason;
   const hint=document.createElement("div");hint.className="npc-reason";hint.textContent=reason;
   const group=document.createElement("div");group.append(button,hint);npcActions.append(group);
  }else{
   button.addEventListener("click",()=>npcChooseAction(entity,action));
   npcActions.append(button);
  }
 };
 add("Talk","talk");
 for(const [action,label] of script.actions)add(label,action,gameplay?.actionReason(action)||null);
 npcModal.hidden=false;
 npcPrompt.hidden=true;
 npcActionAt=performance.now()-cfg("npc.interactCooldownMs");
}
async function npcChooseAction(entity,action){
 const now=performance.now();
 if(now-npcActionAt<cfg("npc.interactCooldownMs"))return;
 npcActionAt=now;
 if(entity!==npcDialogue||!insidePub||npcInteriorKey()!==entity.definition.interior
    ||!npcCurrentEnabled(entity.definition.id)||npcInteractionDistance(entity)>cfg("npc.interactRadius")){
  npcCloseDialogue();return;
 }
 if(action==="talk"){
  const lines=NPC_DIALOGUES[entity.definition.id].talk;
  npcMessage.textContent=lines[npcTalkCount++%lines.length];
  return;
 }
 if(!gameplay){npcMessage.textContent="The game is still loading. Please try again.";return;}
 const labels={beer:"Ordering beer",refill:"Refilling beer",kebab:"Ordering kebab",cigarettes:"Buying cigarettes",scratch_ticket:"Buying scratch ticket",borrow:"Borrowing cigarette",collect:"Collecting item"};
 npcMessage.textContent=(labels[action]||"Processing request")+"…";
 for(const button of npcActions.querySelectorAll("button"))button.disabled=true;
 let result;
 try{
  // Give the player an actionable response if a server quota or network failure
  // leaves a request pending. This does not cancel the server-side purchase.
  result=await Promise.race([
   gameplay.npcAction(entity.definition.id,action),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("Purchase timed out. Check your inventory before trying again.")),12000))
  ]);
  npcMessage.textContent=result?.ok?(result.message||"Action completed"):(result?.error||"Cannot complete action");
 }catch(error){
  console.error("NPC interaction failed",action,error);
  npcMessage.textContent=String(error?.message||error);
  if(/quota|durable objects|room unavailable|timed out/i.test(npcMessage.textContent)){
   npcMessage.textContent+="  Use Single Player mode if the multiplayer room is unavailable.";
  }
 }finally{
  for(const button of npcActions.querySelectorAll("button")){
   const requested=Array.from(NPC_DIALOGUES[entity.definition.id]?.actions||[]).find(([,label])=>label===button.textContent)?.[0];
   button.disabled=!!(requested&&gameplay?.actionReason(requested));
  }
 }
 // A new order or pickup may change which actions are available.
}
function npcUpdatePrompt(){
 if(hideController?.isHidden){
  npcPrompt.textContent="E · Exit hiding";npcPrompt.hidden=false;return;
 }
 if(npcDialogue||gameplay?.menuOpen()){npcPrompt.hidden=true;return;}
 const pickup=gameplay?.prompt();
 if(pickup){npcPrompt.textContent=pickup;npcPrompt.hidden=false;return;}
 if(insideCasino&&casinoExitNearby()){
  npcPrompt.textContent="E · Climb to Mester utca";npcPrompt.hidden=false;return;
 }
 if(!insidePub&&casinoManholeNearby()&&!gameplay?.occupied){
  npcPrompt.textContent="E · Enter underground casino";npcPrompt.hidden=false;return;
 }
 if(insideCasino){
  const bartender=npcNearestTarget();
  if(bartender){npcPrompt.textContent="E · Talk to "+bartender.definition.name;npcPrompt.hidden=false;return;}
  const hotspot=casinoNearestHotspot();
  if(hotspot){npcPrompt.textContent="E · "+hotspot.name;npcPrompt.hidden=false;return;}
 }
 if(insideBasement&&basementStairNear()){
  npcPrompt.textContent="E · Go upstairs";npcPrompt.hidden=false;return;
 }
 if(pubBasementStairsNear()){
  npcPrompt.textContent="E · Go downstairs";npcPrompt.hidden=false;return;
 }
 // Pickup and staircase interactions remain higher priority than hiding.
 if(!activeVehicle&&!gameplay?.occupied&&!gameplay?.state?.action&&!gameplay?.scratchOpen){
  const hideText=hideController?.prompt();
  if(hideText){npcPrompt.textContent=hideText;npcPrompt.hidden=false;return;}
 }
 if(!insidePub&&gameplay?.occupied){
  npcPrompt.textContent="E · Exit vehicle";npcPrompt.hidden=false;return;
 }
 if(!insidePub&&gameplay?.ready){
  const nearestVehicle=registeredVehicles().filter(v=>v.sprite)
   .sort((a,b)=>Math.hypot(player.x-a.model.x,player.y-a.model.y)-
     Math.hypot(player.x-b.model.x,player.y-b.model.y))[0];
  if(nearestVehicle&&near(player,nearestVehicle.model.x,nearestVehicle.model.y,cfg("game.vehicleRadius"))){
   npcPrompt.textContent="E · Choose seat · "+nearestVehicle.label;
   npcPrompt.hidden=false;return;
  }
 }
 if(gameplay?.nearbyPlayers().length&&!npcDialogue){
  npcPrompt.textContent="E · Ask nearby player";npcPrompt.hidden=false;return;
 }
 const closest=npcNearestTarget();
 if(!closest||npcExitDistance()<70){npcPrompt.hidden=true;return;}
 npcPrompt.textContent="E · Talk to "+closest.definition.name;
 npcPrompt.hidden=false;
}
document.getElementById("npc-dialogue-close").addEventListener("click",npcCloseDialogue);
window.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&npcDialogue){event.preventDefault();npcCloseDialogue();}
});

function show(text){msg.textContent=text;toastUntil=Date.now()+5000;}
function near(o,x,y,r=78){return Math.hypot(o.x-x,o.y-y)<r;}
function intersects(x,y){
 const w=13,h=11;
 if(x<25||y<25||x>mapSize.w-25||y>mapSize.h-25)return true;
 if(insidePub){
  if((insideCasino?CASINO_WALLS:insideBasement?BASEMENT_WALLS:activeShop?activeShop.walls:interiorWalls).some(([bx,by,bw,bh])=>x+w>bx&&x-w<bx+bw&&y+h>by&&y-h<by+bh))return true;
  const room=npcInteriorKey(),r=20;
  // Avoid trapping an already-overlapping player: allow steps that increase separation.
  return Array.from(npcEntities.values()).some(n=>
   n.definition.interior===room&&npcCurrentEnabled(n.definition.id)&&
   Math.hypot(x-n.x,y-n.y)<r&&
   Math.hypot(x-n.x,y-n.y)+.01<Math.hypot(player.x-n.x,player.y-n.y));
 }
 // The bike rack is on a sidewalk incorrectly covered by the broad building polygon.
 if(x>=635&&x<=765&&y>=785&&y<=935)return false;
 return collisionPolygons.some(poly=>[[x,y],[x-w,y-h],[x+w,y-h],[x-w,y+h],[x+w,y+h]].some(p=>insidePolygon(p[0],p[1],poly)));
}
// Resolve saved destinations in the new scene's coordinate space. Invalid or
// blocked placements are moved to the nearest walkable point; old saves still work.
function transitionArrival(id,fallback){
 const rawX=cfg("transition."+id+".x"),rawY=cfg("transition."+id+".y");
 const x=Number.isFinite(rawX)?Math.max(25,Math.min(mapSize.w-25,rawX)):fallback.x;
 const y=Number.isFinite(rawY)?Math.max(25,Math.min(mapSize.h-25,rawY)):fallback.y;
 const safe=(px,py)=>!intersects(px,py);
 if(safe(x,y))return {x,y};
 for(let radius=15;radius<=220;radius+=15){
  for(let angle=0;angle<Math.PI*2;angle+=Math.PI/12){
   const px=Math.round(Math.max(25,Math.min(mapSize.w-25,x+Math.cos(angle)*radius)));
   const py=Math.round(Math.max(25,Math.min(mapSize.h-25,y+Math.sin(angle)*radius)));
   if(safe(px,py))return {x:px,y:py};
  }
 }
 return safe(fallback.x,fallback.y)?fallback:{x,y};
}
function enterCasino(){
 hideController?.reset();npcCloseDialogue();
 if(insidePub||activeVehicle||gameplay?.occupied||gameplay?.state?.action||!cfg("casino.manhole.enabled"))return;
 if(!scene?.textures.exists("casino")){show("Casino map image unavailable. Check /assets/casino.webp.");return;}
 // Lazily allocate the casino room; it must never exist on the street.
 if(!casinoImage){
  casinoImage=scene.add.image(0,0,"casino").setOrigin(0,0).setDisplaySize(CASINO_SIZE.w,CASINO_SIZE.h).setDepth(1);
  const ghost=scene.add.image(0,0,"casino").setOrigin(0,0).setDisplaySize(CASINO_SIZE.w,CASINO_SIZE.h)
   .setDepth(1.25).setVisible(false).setAlpha(0);
  drunkGhostLayers.push({original:casinoImage,ghost});
 }
 casinoReturnPos={x:player.x,y:player.y};streetPos={...casinoReturnPos};
 insideCasino=true;insidePub=true;insideBasement=false;activeShop=null;
 mapSize={...CASINO_SIZE};character.setScale(cfg("building.casino.scale"));
 streetImage.setVisible(false);setStreetfronts(false);interiorImage?.setVisible(false);
 basementImage?.setVisible(false);casinoImage.setPosition(0,0).setAlpha(1).setVisible(true);showInteriorNPCs("casino");
 carSprite?.setVisible(false);octaviaSprite?.setVisible(false);
 for(const sprite of bikeSprites)if(sprite)sprite.setVisible(false);
 tramSprite?.setVisible(false);
 const arrival=transitionArrival("casino",CASINO_SPAWN);
 player.x=arrival.x;player.y=arrival.y;character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,CASINO_SIZE.w,CASINO_SIZE.h);
 scene.cameras.main.setZoom(displayZoom(cfg("building.casino.zoom")));
 status.textContent="Underground Casino";
 show("Underground Casino. Press E near the ladder to return to Mester utca.");
}
function exitCasino(){
 hideController?.reset();npcCloseDialogue();
 if(!insideCasino)return;
 insideCasino=false;insidePub=false;insideBasement=false;activeShop=null;
 if(casinoImage){
  for(const layer of drunkGhostLayers.filter(layer=>layer.original===casinoImage))layer.ghost.destroy();
  drunkGhostLayers=drunkGhostLayers.filter(layer=>layer.original!==casinoImage);
  casinoImage.destroy();casinoImage=null;
 }
 casinoExitHint?.setVisible(false);
 mapSize={w:1600,h:992};character.setScale(cfg("character.streetScale"));
 streetImage?.setVisible(true);setStreetfronts(true);showInteriorNPCs(null);
 carSprite?.setVisible(true);octaviaSprite?.setVisible(true);
 for(const sprite of bikeSprites)if(sprite)sprite.setVisible(true);
 tramSprite?.setVisible(true);
 const back=casinoReturnPos||streetPos;
 // Restore exactly where the player entered. No fixed random exit teleport.
 const safe=!intersects(back.x,back.y)?back:{x:cfg("interaction.street_casino.x"),y:cfg("interaction.street_casino.y")};
 player.x=safe.x;player.y=safe.y;character.setPosition(player.x,player.y);
 casinoReturnPos=null;
 scene.cameras.main.setBounds(0,0,1600,992);
 scene.cameras.main.setZoom(displayZoom(cfg("camera.streetZoom")));
 status.textContent="Outside · Mester utca";show("Back on Mester utca.");
}
function enterBasement(){
 hideController?.reset();
 npcCloseDialogue();
 if(!insidePub||activeShop||insideBasement)return;
 if(!basementImage){show("Cannot enter basement: map image is missing from GitHub (Assets/Maps/maestro_basement.webp).");return;}
 pubStairReturn={x:player.x,y:player.y};
 insideBasement=true;mapSize={...BASEMENT_SIZE};
 interiorImage?.setVisible(false);basementImage?.setVisible(true);
 pubStairsHint?.setVisible(false);exitHint?.setVisible(false);
 showInteriorNPCs("basement");
 character.setScale(cfg("building.pub.scale"));
 const basementArrival=transitionArrival("basement",BASEMENT_SPAWN);
 player.x=basementArrival.x;player.y=basementArrival.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
 scene.cameras.main.setZoom(displayZoom(cfg("building.basement.zoom")));
 status.textContent="Maestro Pub · Basement";
 show("Basement: walk to the staircase and press E to go upstairs.");
}
function leaveBasement(){
 hideController?.reset();
 npcCloseDialogue();
 if(!insideBasement)return;
 insideBasement=false;mapSize={...INTERIOR_SIZE};
 basementImage?.setVisible(false);interiorImage?.setVisible(true);
 showInteriorNPCs("pub");
 const returnPos=transitionArrival("upstairs",pubStairReturn||INTERIOR_SPAWN);
 player.x=returnPos.x;player.y=returnPos.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
 scene.cameras.main.setZoom(displayZoom(cfg("building.pub.zoom")));
 status.textContent="Inside Maestro Pub";
 show("Back on the ground floor.");
}
function enterShop(shop){
 hideController?.reset();
 npcCloseDialogue();
 if(!shop.image){show(shop.label+" map is loading. Please try again.");return;}
 if(activeVehicle){show("Exit the vehicle first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;insideBasement=false;activeShop=shop;
 character.setScale(shopCharacterScale(shop));mapSize={...shop.size};
 streetImage.setVisible(false);showInteriorNPCs(npcInteriorKey());if(interiorImage)interiorImage.setVisible(false);
 for(const other of Object.values(SHOPS))if(other.image)other.image.setVisible(other===shop);
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 for(const sprite of bikeSprites)sprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 const shopId=Object.keys(SHOPS).find(id=>SHOPS[id]===shop);
 const shopArrival=transitionArrival(shopId,shop.spawn);
 player.x=shopArrival.x;player.y=shopArrival.y;character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,shop.size.w,shop.size.h);scene.cameras.main.setZoom(displayZoom(shopZoom(shop)));
 status.textContent="Inside "+shop.label;
 show("Inside "+shop.label+". Press E near the entrance to exit.");
}
function enterPub(){
 hideController?.reset();
 npcCloseDialogue();
 if(!interiorImage){show("Interior map could not be loaded.");return;}
 if(activeVehicle){show("Exit the vehicle first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;insideBasement=false;activeShop=null;
 character.setScale(cfg("building.pub.scale"));
 mapSize={...INTERIOR_SIZE};
 streetImage.setVisible(false);setStreetfronts(false);interiorImage.setVisible(true);showInteriorNPCs("pub");
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 for(const sprite of bikeSprites)sprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 const pubArrival=transitionArrival("pub",INTERIOR_SPAWN);
 player.x=pubArrival.x;player.y=pubArrival.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,INTERIOR_SIZE.w,INTERIOR_SIZE.h);
 scene.cameras.main.setZoom(displayZoom(cfg("building.pub.zoom")));
 status.textContent="Inside Maestro Pub";
 show("You're inside! Walk around. Press E near the bottom-left exit to leave.");
}
function leavePub(){
 hideController?.reset();
 npcCloseDialogue();
 insidePub=false;insideBasement=false;activeShop=null;basementImage?.setVisible(false);character.setScale(cfg("character.streetScale"));mapSize={w:1600,h:992};
 for(const shop of Object.values(SHOPS))if(shop.image)shop.image.setVisible(false);
 interiorImage.setVisible(false);streetImage.setVisible(true);showInteriorNPCs(null);
 if(carSprite)carSprite.setVisible(true);
 if(octaviaSprite)octaviaSprite.setVisible(true);
 for(const sprite of bikeSprites)sprite.setVisible(true);
 if(tramSprite)tramSprite.setVisible(true);
 if(exitHint)exitHint.setVisible(false);
 player.x=streetPos.x;player.y=streetPos.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,1600,992);
 scene.cameras.main.setZoom(displayZoom(cfg("camera.streetZoom")));
 status.textContent="Outside Maestro Pub";
 show("Back on Mester utca.");
}
// Vehicle seat selection is server-owned. There is no local claim of ownership.
let vehicleSeatPanel=null,vehicleBusy=false,vehicleSeatRole=null,vehicleWorldSynchronized=false,vehicleLastRespawnRevision=null;
function vehicleSeatMenu(choice){
 if(vehicleBusy||!gameplay?.ready)return;
 vehicleSeatPanel?.remove();
 const vehicle=gameplay.vehicle(choice.id);
 if(!vehicle){show("Vehicle state still loading");return;}
 const overlay=document.createElement("div");
 overlay.id="vehicle-seat-menu";
 overlay.style.cssText="position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;background:#081627aa;padding:12px";
 const panel=document.createElement("div");
 panel.style.cssText="background:#1a2a40;border:1px solid #96a6bb;border-radius:12px;padding:17px;min-width:250px;max-width:360px;width:100%;color:white";
 const title=document.createElement("h3");title.textContent=choice.label;title.style.margin="0 0 12px";panel.append(title);
 const add=(label,seat,disabled=false)=>{
  const button=document.createElement("button");button.textContent=label;button.disabled=disabled;
  button.style.cssText="display:block;margin:7px 0;padding:9px;width:100%;text-align:left";
  button.onclick=async()=>{
   if(vehicleBusy)return;vehicleBusy=true;button.disabled=true;
   try{
    const result=await gameplay.boardVehicle(choice.id,seat);
    if(!result.ok){show(result.error||"Seat unavailable");button.disabled=false;return}
    overlay.remove();vehicleSeatPanel=null;
    syncVehicleFromRoom();
    show(result.message||"Boarded");
   }catch(error){show("Cannot join vehicle: "+error.message);button.disabled=false}
   finally{vehicleBusy=false}
  };
  panel.append(button);
 };
 add("Driver · steer with WASD",0,!!vehicle.seats[0]||Math.abs(vehicle.speed)>3);
 if(vehicle.type!=="bike")for(let seat=1;seat<vehicle.seats.length;seat++)
  add("Passenger seat "+seat,seat,!!vehicle.seats[seat]);
 const close=document.createElement("button");close.textContent="Cancel";close.onclick=()=>{overlay.remove();vehicleSeatPanel=null};
 close.style.cssText="padding:8px;width:100%;margin-top:8px";panel.append(close);
 overlay.append(panel);document.getElementById("screen").append(overlay);vehicleSeatPanel=overlay;
}
async function enterOrExitCar(){
 if(!gameplay?.ready){show("Connecting to multiplayer room…");return}
 if(gameplay.occupied){
  const vehicle=activeVehicle;
  if(!vehicle)return;
  if(Math.abs(vehicle.speed)>8){show("Stop the vehicle before exiting.");return}
  const offsets=vehicle.type==="bike"?[[23,0],[-23,0],[0,24],[0,-24]]:
    [[46,0],[-46,0],[0,48],[0,-48],[43,36],[-43,36]];
  const safe=offsets.map(([x,y])=>({x:vehicle.x+x,y:vehicle.y+y}))
   .find(p=>p.x>=25&&p.x<=1575&&p.y>=25&&p.y<=967&&!intersects(p.x,p.y));
  if(!safe){show("No safe exit next to the vehicle.");return}
  const result=await gameplay.command("leaveVehicle",safe);
  if(!result.ok){show(result.error||"Cannot exit vehicle");return}
  leaveSharedVehicle(result);
  return;
 }
 const choice=registeredVehicles().filter(v=>v.sprite).sort((a,b)=>
  Math.hypot(player.x-a.model.x,player.y-a.model.y)-Math.hypot(player.x-b.model.x,player.y-b.model.y))[0];
 if(!choice||!near(player,choice.model.x,choice.model.y,cfg("game.vehicleRadius"))){
  show("Move closer to a car or bicycle.");return;
 }
 vehicleSeatMenu(choice);
}
function leaveSharedVehicle(result){
 const prior=activeVehicle;
 if(prior){prior.driver=false;prior.wheelTurn=0}
 activeVehicle=null;vehicleSeatRole=null;
 if(riderSprite){riderSprite.anims.stop();riderSprite.setVisible(false)}
 const model=registeredVehicles().find(v=>v.model===prior);
 if(prior?.type==="bike"&&model?.sprite)model.sprite.setVisible(true);
 player.x=result.x??prior?.x??player.x;player.y=result.y??prior?.y??player.y;
 character.setPosition(player.x,player.y).setVisible(!!gameplay?.hasCharacter());
 scene.cameras.main.startFollow(character,true,.13,.13);
 status.textContent="On foot";
 show(result.message||"Exited vehicle");
}
function syncVehicleFromRoom(delta=16){
 if(!gameplay?.state||!scene||!gameplay.vehicles.length)return;
 const respawnRevision=gameplay.state.vehicleRespawnRevision||0;
 const firstAuthoritativeFrame=!vehicleWorldSynchronized||
  (vehicleLastRespawnRevision!==null&&respawnRevision!==vehicleLastRespawnRevision);
 vehicleLastRespawnRevision=respawnRevision;
 const occupied=gameplay.occupied;
 const selected=occupied?registeredVehicles().find(v=>v.id===occupied.vehicleId):null;
 if(occupied&&selected&&activeVehicle!==selected.model){
  activeVehicle=selected.model;vehicleSeatRole=occupied.seat;
  activeVehicle.driver=occupied.seat===0;
  character.setVisible(false);
  scene.cameras.main.startFollow(selected.sprite,true,.13,.13);
  status.textContent=(occupied.seat===0?"Driving ":"Passenger in ")+selected.label;
 }
 if(!occupied&&activeVehicle){leaveSharedVehicle({message:"Vehicle seat released"})}
 if(occupied&&activeVehicle){
  vehicleSeatRole=occupied.seat;
  activeVehicle.driver=occupied.seat===0;
 }
 for(const remote of gameplay.vehicles){
  const target=registeredVehicles().find(v=>v.id===remote.id);
  if(!target)continue;
  const model=target.model,driving=occupied?.vehicleId===remote.id&&occupied.seat===0;
  // Driver predicts locally; all other viewers interpolate the shared position.
  if(!driving||firstAuthoritativeFrame){
   const distance=Math.hypot(remote.x-model.x,remote.y-model.y);
   const alpha=firstAuthoritativeFrame||distance>150?1:1-Math.exp(-Math.min(50,delta)/90);
   model.x+=(remote.x-model.x)*alpha;
   model.y+=(remote.y-model.y)*alpha;
   const diff=Math.atan2(Math.sin(remote.angle-model.angle),Math.cos(remote.angle-model.angle));
   model.angle+=diff*alpha;model.speed=remote.speed;
  }
  if(!target.sprite)continue;
  target.sprite.setPosition(model.x,model.y).setRotation(model.angle);
  target.sprite.setVisible(!insidePub);
  const bikeOccupied=remote.type==="bike"&&!!remote.seats[0];
  const localBike=occupied?.vehicleId===remote.id&&riderSprite;
  if(remote.type==="bike"){
   let rider=remoteBikeRiders.get(remote.id);
   if(!rider&&scene.textures.exists("bubi-rider")){
    rider=scene.add.sprite(model.x,model.y,"bubi-rider",0).setDepth(8).setOrigin(.5).setVisible(false);
    remoteBikeRiders.set(remote.id,rider);
   }
   if(localBike){
    target.sprite.setVisible(false);
    updateBikeRider(model,Math.abs(model.speed)>6);
   }else{
    target.sprite.setVisible((!bikeOccupied||!rider)&&!insidePub);
   }
   if(rider){
    rider.setVisible(bikeOccupied&&!localBike&&!insidePub);
    if(rider.visible){
     rider.setDisplaySize(cfg("vehicle."+remote.id+".width")*1.85,
      cfg("vehicle."+remote.id+".length")*1.2).setPosition(model.x,model.y).setRotation(model.angle);
     if(Math.abs(model.speed)>6){
      if(!rider.anims.isPlaying)rider.play("bubi-pedal");
     }else{rider.anims.stop();rider.setFrame(0);}
    }
   }
  }
  if(remote.type==="car"){
   let tag=vehicleOccupancyTags.get(remote.id);
   if(!tag){
    tag=scene.add.text(0,0,"",{fontFamily:"Arial",fontSize:"11px",color:"#ffffff",
     backgroundColor:"#152638c9",padding:{x:3,y:2}}).setOrigin(.5).setDepth(9);
    vehicleOccupancyTags.set(remote.id,tag);
   }
   const taken=remote.seats.filter(Boolean).length;
   tag.setVisible(!insidePub&&taken>0).setText(taken+"/"+remote.seats.length+" seats");
   tag.setPosition(model.x,model.y-45);
  }
 }
 vehicleWorldSynchronized=true;
 if(occupied&&activeVehicle){
  player.x=activeVehicle.x;player.y=activeVehicle.y;
  character.setVisible(false);
 }
}
// The playable avatar is drawn on top of the bicycle and rotates with its heading.
// The eight-frame walking strip supplies animated legs for pedalling.
function updateBikeRider(bike,pedalling){
 if(!riderSprite)return;
 const length=cfg("vehicle."+bike.id+".length");
 const width=cfg("vehicle."+bike.id+".width");
 // A single combined sprite: no separate character drawn over the frame.
 riderSprite.setDisplaySize(width*1.85,length*1.2)
            .setPosition(bike.x,bike.y)
            .setRotation(bike.angle).setVisible(true);
 if(pedalling){
   if(!riderSprite.anims.isPlaying||riderSprite.anims.currentAnim?.key!=="bubi-pedal")
     riderSprite.play("bubi-pedal");
   riderSprite.anims.timeScale=Phaser.Math.Clamp(.75+Math.abs(bike.speed)/95,.75,2);
 }else{
   riderSprite.anims.stop();
   riderSprite.setFrame(0);
 }
}
// VehicleController ported from KulturalisDigitalisPolgariKor/src/entities/Vehicle.ts.
// Throttle/brake/reverse, speed-dependent steering, grip and friction use the original
// model; its city geometry collision check is adapted for MaestroEscape polygons.
class VehicleController {
 constructor(vehicle,sprite){this.vehicle=vehicle;this.sprite=sprite;}
 update(inputX,inputY,dt){
  const v=this.vehicle;
  const bicycle=v.type==="bike";
  const acceleration=cfg(bicycle?"bike.acceleration":"vehicle.acceleration"),maxSpeed=cfg(bicycle?"bike.topSpeed":"vehicle.topSpeed");
  if(inputY<-.1)v.speed+=acceleration*dt;
  else if(inputY>.1)v.speed-=acceleration*dt*(v.speed>0?cfg("vehicle.braking"):.65);
  else v.speed*=Math.max(0,1-cfg(bicycle?"bike.drag":"vehicle.drag")*dt);
  v.speed=Phaser.Math.Clamp(v.speed,-maxSpeed*(bicycle?.12:.33),maxSpeed);
  const steer=Phaser.Math.Clamp(inputX,-1,1);
  if(Math.abs(v.speed)>1){
   v.wheelTurn=Phaser.Math.Linear(v.wheelTurn,steer,Math.min(1,dt*5));
   const grip=Phaser.Math.Clamp(Math.abs(v.speed)/(bicycle?26:75),.2,1);
   v.angle+=v.wheelTurn*cfg(bicycle?"bike.turnRate":"vehicle.turnRate")*dt*grip*Math.sign(v.speed);
  }else{
   v.wheelTurn=Phaser.Math.Linear(v.wheelTurn,0,Math.min(1,dt*5));
  }
  // The Skoda is controlled by its heading, not by moving sideways with A/D.
  const px=v.x+Math.sin(v.angle)*v.speed*dt;
  const py=v.y-Math.cos(v.angle)*v.speed*dt;
  const fw={x:Math.sin(v.angle),y:-Math.cos(v.angle)};
  const side={x:Math.cos(v.angle),y:Math.sin(v.angle)};
  const halfW=bicycle?5:12,halfL=bicycle?12:25;
  const corners=[-1,1].flatMap(f=>[-1,1].map(t=>({
   x:px+fw.x*halfL*f+side.x*halfW*t,
   y:py+fw.y*halfL*f+side.y*halfW*t
  })));
  const blocked=p=>p.x<18||p.y<18||p.x>mapSize.w-18||p.y>mapSize.h-18?true:bicycle&&p.x>=635&&p.x<=765&&p.y>=785&&p.y<=935?false:collisionPolygons.some(poly=>insidePolygon(p.x,p.y,poly));
  if(corners.some(blocked)){v.speed*=-.08;return;}
  v.x=px;v.y=py;
 }
}
function interact(){
 refreshCasinoStreetSettings();
 if(window.MaestroRealOrders?.isOpen?.())return;
 if(hideController?.state==="HIDDEN"){if(!hideController.exit())show("No safe place to emerge.");return;}
 if(hideController&&hideController.state!=="NORMAL")return;
 if(gameplay?.isDead()||gameplay?.scratchOpen)return;
 if(gameplay&&!gameplay.hasCharacter())return;
 // Door interactions outrank pickups, parked vehicles and hiding when on foot.
 // Casino manholes are user-placed, so the E key must match the visible interaction prompt.
 if(!insidePub&&!activeVehicle&&!gameplay?.occupied&&casinoManholeNearby()){
  enterCasino();return;
 }
 if(vehicleSeatPanel){vehicleSeatPanel.remove();vehicleSeatPanel=null;return;}
 if(gameplay?.menuOpen()){gameplay.close();return;}
 if(npcDialogue){npcCloseDialogue();return;}
 if(!insidePub&&gameplay?.occupied){void enterOrExitCar();return;}
 if(gameplay?.nearestItem()){void gameplay.interact();return;}
 if(insideCasino){
  if(casinoExitNearby()){exitCasino();return;}
  const bartender=npcNearestTarget();
  if(bartender){npcOpenDialogue(bartender);return;}
  const hotspot=casinoNearestHotspot();
  if(hotspot){show(hotspot.name+" interaction is ready for a future mini-game. No wagering is implemented.");return;}
  show("Find the ladder to exit the casino.");return;
 }
 if(insidePub){
  if(insideBasement){
   if(basementStairNear()){leaveBasement();return;}
   if(gameplay?.nearbyPlayers().length){gameplay.openMenu("inventory");return;}
   show("Walk to the basement staircase and press E to go upstairs.");return;
  }
  if(pubBasementStairsNear()){
   enterBasement();return;
  }
  const nearest=npcNearestTarget();
  if(nearest&&npcInteractionDistance(nearest)<npcExitDistance()
     &&npcExitDistance()>=70){npcOpenDialogue(nearest);return;}
  const exitId=activeShop?shopInteractionId(activeShop,"exit"):"pub_exit";
  const exit=activeShop?activeShop.exit:INTERIOR_EXIT;
  if(interactionNear(exitId,exit,96))leavePub();
  else if(!gameplay?.state?.action&&hideController?.nearest()){
   if(hideController.enter())show("Hidden. Press E to emerge.");
   else show("Cannot hide here: approach from a walkable side or reposition this hide point in Settings.");
   return;
  }
  else if(gameplay?.nearbyPlayers().length){gameplay.openMenu("inventory");return;}
  else if(gameplay?.tableInteract())return;
  else show("Return to the entrance and press E to exit.");
  return;
 }
 if(activeVehicle || registeredVehicles().some(v=>v.sprite&&near(player,v.model.x,v.model.y,cfg("game.vehicleRadius")))){void enterOrExitCar();return;}
 if(gameplay?.nearbyPlayers().length){gameplay.openMenu("inventory");return;}
 if(!gameplay?.state?.action&&!activeVehicle&&hideController?.nearest()){
  if(hideController.enter())show("Hidden. Press E to emerge.");
  else show("Cannot hide here: approach from a walkable side or reposition this hide point in Settings.");
  return;
 }
 if(interactionNear("street_pub",PUB_DOOR,cfg("game.interactRadius"))){enterPub();return;}
 for(const shop of Object.values(SHOPS))if(interactionNear("street_"+Object.keys(SHOPS).find(key=>SHOPS[key]===shop),shop.door,cfg("game.interactRadius"))){enterShop(shop);return;}const nearest=locs.reduce((best,v)=>Math.hypot(player.x-v.x,player.y-v.y)<Math.hypot(player.x-best.x,player.y-best.y)?v:best,locs[0]);if(!near(player,nearest.x,nearest.y)){if(casinoEntranceFeedback())return;show("Get closer to an interaction marker.");return;}
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
   this.load.image("basement","/assets/basement.webp");
   this.load.image("casino","/assets/casino.webp");
   for(const name of Object.keys(SHOPS))this.load.image("shop_"+name,"/assets/shop-"+name+".webp");
   // The player sprite already loads successfully from jsDelivr. Load NPC sheets the same way,
   // pinned to the immutable commit that added all nine files (avoids Worker proxy 500/cache).
   for(const def of NPC_DEFINITIONS)this.load.spritesheet("npc_"+def.id,
     "https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@2f0f38b8bdae807b3075b62371208040cc1cda0f/Assets/NPCs/"+(def.id==="casino_bartender"?"maestro_bartender":def.id)+".webp",
     {frameWidth:48,frameHeight:60});
   this.load.spritesheet("maestro","https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/Assets/Characters/maestro_walk.webp",{frameWidth:80,frameHeight:120});
   // All player assets share the original 8x4, 80x120 directional walk-frame contract.
   for(const id of ["casual","suit","muscular"])this.load.spritesheet("player_"+id,
     "/assets/characters/"+id+"_walk.webp",{frameWidth:80,frameHeight:120});
   this.load.image("skoda","/assets/skoda-highres.webp");
   this.load.image("octavia","/assets/octavia.webp");
   this.load.image("bubi","/assets/bubi.webp");
   this.load.spritesheet("bubi-rider","/assets/bubi-rider.webp",{frameWidth:112,frameHeight:224});
   this.load.image("tram","/assets/tram.webp");
   this.load.on("loaderror",file=>{if(file.key.startsWith("npc_"))console.error("NPC sprite failed to download:",file.key,file.src);if(file.key==="world")assetFailed=true;if(file.key==="interior")console.warn("Interior image failed");if(file.key==="casino"){console.error("Casino artwork missing at /assets/casino.webp");}if(file.key==="basement"){console.error("Basement artwork missing. Upload Assets/Maps/maestro_basement.webp");show("Basement artwork missing from GitHub: Assets/Maps/maestro_basement.webp");}if(file.key==="skoda")show("Skoda image failed to load. Displaying fallback car.");status.textContent="Asset failed: "+file.key;console.error("Missing asset",file.src)});
 }
 create(){
   scene=this;
   const splash=document.getElementById("splash");if(assetFailed||!this.textures.exists("world")){splash.textContent="Map failed to load. Check the published map asset.";return;}splash.remove();
   const image=this.add.image(0,0,"world").setOrigin(0,0);
   streetImage=image.setDepth(0).setDisplaySize(1600,992);
   // Invisible casino E-interaction is governed by saved Settings coordinates.
   if(this.textures.exists("interior")){
     interiorImage=this.add.image(0,0,"interior").setOrigin(0,0)
       .setDisplaySize(INTERIOR_SIZE.w,INTERIOR_SIZE.h).setDepth(1).setVisible(false);
     exitHint=this.add.text(INTERIOR_EXIT.x+22,INTERIOR_EXIT.y-30,"EXIT [E]",
       {fontFamily:"Arial",fontSize:"20px",fontStyle:"bold",color:"#fff5cf",
       stroke:"#151013",strokeThickness:4}).setDepth(8).setVisible(false);
   }
   if(this.textures.exists("basement")){
     basementImage=this.add.image(0,0,"basement").setOrigin(0,0)
       .setDisplaySize(BASEMENT_SIZE.w,BASEMENT_SIZE.h).setDepth(1).setVisible(false);
   }else{
     // Never substitute a schematic for the uploaded detailed floor artwork.
     console.error("Maestro basement artwork is missing at /assets/basement.webp");
   }
   // Only preload casino texture here. Its visible objects are created in enterCasino().
   if(!this.textures.exists("casino"))console.error("Casino artwork missing at /assets/casino.webp");
   casinoExitHint=this.add.text(CASINO_EXIT.x,CASINO_EXIT.y-44,"LADDER ↑ [E]",
     {fontFamily:"Arial",fontSize:"19px",fontStyle:"bold",color:"#ffe9a6",
      stroke:"#111720",strokeThickness:4}).setOrigin(.5).setDepth(8).setVisible(false);
   pubStairsHint=this.add.text(PUB_BASEMENT_APPROACH.x,PUB_BASEMENT_APPROACH.y-44,"STAIRS ↓ [E]",
     {fontFamily:"Arial",fontSize:"19px",fontStyle:"bold",color:"#fff5cf",
      stroke:"#111720",strokeThickness:4}).setOrigin(.5).setDepth(8).setVisible(false);
   basementStairsHint=this.add.text(BASEMENT_STAIRS.x+BASEMENT_STAIRS.w/2,BASEMENT_STAIRS.y-26,"STAIRS ↑ [E]",
     {fontFamily:"Arial",fontSize:"19px",fontStyle:"bold",color:"#fff5cf",
      stroke:"#111720",strokeThickness:4}).setOrigin(.5).setDepth(8).setVisible(false);
   // The supplied 1600×992 aerial map already contains the building facades.
   for(const [name,shop] of Object.entries(SHOPS)){
     if(this.textures.exists("shop_"+name)){
       shop.image=this.add.image(0,0,"shop_"+name).setOrigin(0,0)
          .setDisplaySize(shop.size.w,shop.size.h).setDepth(1).setVisible(false);
     }
   }
   // Visual-only duplicate of each background. No physics bodies, input, NPCs or world state.
   // Every duplicate shares the existing map texture (no extra asset fetch).
   drunkGhostLayers=[];
   for(const original of [streetImage,interiorImage,basementImage,...Object.values(SHOPS).map(shop=>shop.image)]){
    if(!original||!original.texture)continue;
    const ghost=this.add.image(original.x,original.y,original.texture.key)
     .setOrigin(original.originX,original.originY)
     .setDisplaySize(original.displayWidth,original.displayHeight)
     .setDepth(original.depth+.25).setVisible(false).setAlpha(0);
    ghost.setScrollFactor(original.scrollFactorX,original.scrollFactorY);
    drunkGhostLayers.push({original,ghost});
   }
   mapSize={w:1600,h:992};
   initializeNPCs(this);
   npcRefreshSettings();
   for(const def of NPC_DEFINITIONS){
    const key="npc_"+def.id;
    if(!this.textures.exists(key))continue;
    for(const [face,start] of Object.entries(NPC_FACING)){
     const anim=key+"_walk_"+face;
     if(!this.anims.exists(anim))this.anims.create({key:anim,
       frames:this.anims.generateFrameNumbers(key,{start,end:start+3}),
       frameRate:5,repeat:-1});
    }
   }
   const gfx=this.add.graphics().setDepth(2);
   // Pub interaction remains active, without the visual marker.
   character=this.add.sprite(player.x,player.y,"maestro",0).setDepth(5);
   character.setScale(cfg("character.streetScale"));character.setOrigin(0.5,1.0);
   character.setVisible(false); // Lobby requires a character selection before joining.
   hideController?.shutdown();
   hideController=new MaestroHideController(this,character,player,cfg,intersects,()=>npcInteriorKey()||"street");
   this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{hideController?.shutdown();hideController=null});
   riderSprite=this.textures.exists("bubi-rider")?this.add.sprite(0,0,"bubi-rider",0).setDepth(8).setOrigin(.5).setVisible(false):null;
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
   if(this.textures.exists("bubi"))bikes.forEach((bike,i)=>{const sprite=this.add.image(bike.x,bike.y,"bubi").setDepth(6).setDisplaySize(cfg("vehicle."+bike.id+".width"),cfg("vehicle."+bike.id+".length")).setRotation(bike.angle);bikeSprites[i]=sprite;bikeControllers[i]=new VehicleController(bike,sprite);});
   if(this.textures.exists("tram")){
     tramSprite=this.add.image(TRAM_START.x,TRAM_START.y,"tram").setDepth(4)
       .setDisplaySize(cfg("tram.width"),cfg("tram.length")).setRotation(TRAM_ANGLE);
   }
   if(this.textures.exists("bubi-rider"))this.anims.create({key:"bubi-pedal",frames:this.anims.generateFrameNumbers("bubi-rider",{start:0,end:3}),frameRate:7,repeat:-1});
   for(const id of ["maestro","casual","suit","muscular"]){
    const texture=id==="maestro"?"maestro":"player_"+id;
    if(!this.textures.exists(texture))continue;
    for(const [dir,start] of [["down",0],["up",8],["right",16],["left",24]]){
     const key="walk-"+id+"-"+dir;
     if(!this.anims.exists(key))this.anims.create({key,frames:this.anims.generateFrameNumbers(texture,{start,end:start+7}),frameRate:cfg("character.animationFps"),repeat:-1});
    }
   }
   keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT,R");
   this.input.keyboard.on("keydown-E",event=>{if(!event.repeat)interact();});
   this.input.keyboard.on("keydown-R",()=>{if(gameplay?.isDead())return;npcCloseDialogue();gameplay?.close();if(gameplay?.occupied){show("Exit the vehicle before respawning.");return;}this.respawn();});
   this.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
   this.cameras.main.startFollow(character,true,0.13,0.13);
   this.cameras.main.setZoom(displayZoom(cfg("camera.streetZoom")));
   this.input.mouse?.disableContextMenu();
   gameplay=new MaestroConsumables({
    onTramDeath:displayTramDeath,
    onTramRespawn:completeTramRespawn,
     onBeerFinished:eventId=>{if(drunk.onBeerFinished(eventId))drunkHud();},
    player:()=>activeVehicle||player,place:()=>npcInteriorKey()||"street",
    localVehicle:id=>registeredVehicles().find(v=>v.id===id)?.model||null,
    face:()=>player.face,moving:()=>moving,
    npcPoint:id=>{const entity=npcEntities.get(id);return entity?npcInteractionPoint(entity):null},
    npcDialogueRadius:()=>cfg("npc.interactRadius"),
    localNpcSettings:()=>!settingsSynced&&!!readLocalGameSettings(),
    playerScale:()=>character?.scaleX||cfg("character.streetScale"),
    characterVisible:()=>!activeVehicle&&!!character?.visible,
    inside:()=>insidePub,show,
    onVehicleRespawn:()=>{vehicleWorldSynchronized=false;},
    setCharacter:choice=>{
      if(!character)return;
      if(!choice){character.setVisible(false);return;}
      const key=choice.asset&&this.textures.exists("player_"+choice.id)?"player_"+choice.id:"maestro";
      character.setTexture(key,0).setTint(choice.tint??0xffffff).setVisible(true);
      character.anims.stop();
      character.setData("characterId",choice.id);
      character.setScale(insidePub?(activeShop?shopCharacterScale(activeShop):cfg("building.pub.scale")):cfg("character.streetScale"));
    },
    closeNpc:()=>{if(npcDialogue)npcCloseDialogue()},
    npcOpen:()=>!!npcDialogue
   });
   gameplay.bindScene(this);
   loadOriginalCollision().then(()=>{this.respawn();character.setVisible(!!gameplay?.hasCharacter()&&!activeVehicle&&!gameplay?.isDead());}).catch(error=>console.error("Map collision initialization failed",error));
 }
 respawn(){
   hideController?.reset();
   if(gameplay?.isDead())return;
   // Respawning a character is local. Never reset the multiplayer room or destroy lottery prizes.
   this.hasSpawned=true;
   let x=SPAWN.x,y=SPAWN.y;
   showInteriorNPCs(npcInteriorKey());
   if(activeVehicle&&!gameplay?.occupied){activeVehicle.driver=false;activeVehicle=null;vehicleSeatRole=null;character.setVisible(true);this.cameras.main.startFollow(character,true,0.13,0.13);}
   if(riderSprite){riderSprite.anims.stop();riderSprite.setVisible(false);}
   for(const sprite of bikeSprites)if(sprite)sprite.setVisible(true);
   if(!gameplay?.state){car.x=cfg("vehicle.skoda.spawnX");car.y=cfg("vehicle.skoda.spawnY");car.frame=3;car.angle=cfg("vehicle.skoda.angle")*Math.PI/180;car.speed=0;car.wheelTurn=0;
   octavia.x=cfg("vehicle.octavia.spawnX");octavia.y=cfg("vehicle.octavia.spawnY");octavia.angle=cfg("vehicle.octavia.angle")*Math.PI/180;octavia.speed=0;octavia.wheelTurn=0;
   bikes.forEach((bike,i)=>{bike.x=cfg("vehicle."+bike.id+".spawnX");bike.y=cfg("vehicle."+bike.id+".spawnY");bike.angle=cfg("vehicle."+bike.id+".angle")*Math.PI/180;bike.speed=0;bike.wheelTurn=0;bikeSprites[i]?.setPosition(bike.x,bike.y).setRotation(bike.angle);});
   if(octaviaSprite)octaviaSprite.setPosition(octavia.x,octavia.y).setRotation(octavia.angle);
   if(carSprite)carSprite.setPosition(car.x,car.y).setRotation(car.angle);}
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(time,delta){
   if(!character||!keys)return;
   drunk.update(delta,!!(gameplay?.scratchOpen||npcDialogue||gameplay?.menuOpen()||document.hidden));
   updateDrunkGhost(delta,!!(gameplay?.scratchOpen||npcDialogue||gameplay?.menuOpen()||document.hidden));
   if(Math.floor(drunk.phase)!==lastDrunkHud){lastDrunkHud=Math.floor(drunk.phase);drunkHud();}
   if(gameplay?.scratchOpen){this.cameras.main.setRotation(0);moving=false;return;}
   if(gameplay&&!gameplay.hasCharacter()){character.setVisible(false);return;}
   // Character selection can resolve after scene creation or respawn. Keep its display state in sync.
   if(gameplay?.hasCharacter()&&!activeVehicle&&!gameplay?.occupied&&!gameplay?.isDead()&&!tramLocalDeath&&!character.visible){
     character.setVisible(true);
   }
   // Casino is an interior, never a world-map overlay. Enforce the invariant every frame.
   if(casinoImage){
     if(!insideCasino){casinoImage.setVisible(false).setAlpha(0);}
     else if(!casinoImage.visible||casinoImage.alpha===0){casinoImage.setPosition(0,0).setAlpha(1).setVisible(true);}
   }
   syncVehicleFromRoom(delta);
   if(time%700<delta)refreshCasinoStreetSettings();
   gameplay?.tick(time,delta);
   npcUpdatePrompt();
   if(!npcDialogue&&!gameplay?.isDead())npcTick(delta);
   // Tram follows the diagonal tracks, stops at the platform for 3 seconds, and repeats.
   if(tramSprite){
     const phase=Date.now()%tramPeriodMs();
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
   renderTramGraves();
   if(gameplay?.isDead()){
    hideController?.reset();
    const remaining=Math.max(0,gameplay.state.deadUntil-Date.now());
    if(tramDeathOverlay)tramDeathOverlay.textContent="🪦 RIP · Respawning in "+Math.ceil(remaining/1000)+"s";
    moving=false;return;
   }
   if(!insidePub&&!activeVehicle&&tramSprite?.visible&&gameplay?.hasCharacter()){
    const phase=Date.now()%tramPeriodMs();
    const leg1=tramRunMs()*tramFirstLegRatio;
    const departure=leg1+TRAM_DWELL_MS,finish=tramRunMs()+TRAM_DWELL_MS;
    if((phase<leg1||phase>=departure&&phase<finish)&&tramOverlapsPlayer(tramSprite,player))
     void gameplay.reportTramCollision();
   }
   hideController?.update();
   if(npcDialogue||gameplay?.menuOpen()){this.cameras.main.setRotation(0);moving=false;return;} // Freeze walking and camera distortion while menus are open.
   if(hideController&&hideController.state!=="NORMAL"){
    moving=false;character.anims.stop();return;
   }
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown)-Number(keys.A.isDown||keys.LEFT.isDown)+touchInput.x;
   let dy=Number(keys.S.isDown||keys.DOWN.isDown)-Number(keys.W.isDown||keys.UP.isDown)+touchInput.y;
   const distance=Math.hypot(dx,dy);
   if(gameplay?.state?.action&&distance>0.01&&!gameplay.cancelRequested){
     gameplay.cancelRequested=true;void gameplay.command("cancelConsume",{},true);
   }
   if(!gameplay?.state?.action&&gameplay)gameplay.cancelRequested=false;
   if(activeVehicle){
     const active=registeredVehicles().find(v=>v.model===activeVehicle);
     const sprite=active?.sprite;
     const controller=active?.controller;
     if(sprite&&controller){
       if(vehicleSeatRole===0)controller.update(dx,dy,Math.min(.04,delta/1000));
       else{dx=0;dy=0;}
       sprite.setPosition(activeVehicle.x,activeVehicle.y).setRotation(activeVehicle.angle);
       if(activeVehicle.type==="bike"){
         // W / up-arrow / joystick forward pedals; idle frame is shown while coasting.
         updateBikeRider(activeVehicle,dy < -.12);
       }else if(riderSprite)riderSprite.setVisible(false);
       coords.textContent=(activeVehicle.type==="bike"?"🚲 ":"🚗 ")+Math.round(activeVehicle.x)+", "+Math.round(activeVehicle.y)+" · "+Math.round(Math.abs(activeVehicle.speed))+" px/s";
     }
   }
   if(pubStairsHint)pubStairsHint.setVisible(insidePub&&!activeShop&&!insideBasement&&!insideCasino);
   if(basementStairsHint)basementStairsHint.setVisible(insideBasement);
   if(casinoExitHint){
    const point=interactionAt("casino_exit",CASINO_EXIT,CASINO_EXIT.radius);
    casinoExitHint.setPosition(point.x,point.y-44);
    casinoExitHint.setVisible(insideCasino);
   }
   const cameraZoom=displayZoom(insidePub?(insideCasino?cfg("building.casino.zoom"):insideBasement?cfg("building.basement.zoom"):activeShop?shopZoom(activeShop):cfg("building.pub.zoom")):activeVehicle?DRIVING_ZOOM():cfg("camera.streetZoom"));
   const drunkCamera=drunk.camera(cameraZoom);
   this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom,drunkCamera.zoom,Math.min(1,delta/1000*3.5)));
   this.cameras.main.setRotation(drunkCamera.rotation);
   if(activeVehicle)return;
   // Walking only. Never change the joystick, E key, action buttons or vehicle steering.
   if(distance>0.01){const modifier=drunk.direction(dx/distance,dy/distance);dx=modifier.x*distance;dy=modifier.y*distance;}
   if(exitHint){
    const exitPoint=interactionAt("pub_exit",INTERIOR_EXIT,96);
    exitHint.setPosition(exitPoint.x+22,exitPoint.y-30);
    exitHint.setVisible(insidePub&&!insideBasement&&!insideCasino&&!activeShop&&near(player,exitPoint.x,exitPoint.y,exitPoint.radius+39));
   }
   if(pubStairsHint){
    const stairPoint=interactionAt("pub_downstairs",PUB_BASEMENT_APPROACH,PUB_BASEMENT_APPROACH.radius);
    pubStairsHint.setPosition(stairPoint.x,stairPoint.y-44);
   }
   if(basementStairsHint){
    const upPoint=interactionAt("basement_upstairs",{x:BASEMENT_STAIRS.x+BASEMENT_STAIRS.w/2,y:BASEMENT_STAIRS.y+BASEMENT_STAIRS.h/2},65);
    basementStairsHint.setPosition(upPoint.x,upPoint.y-44);
   }
   moving=distance>0.01;
   if(distance){
      const amount=(keys.SHIFT.isDown?cfg("character.sprintSpeed"):cfg("character.walkSpeed"))*Math.min(0.045,delta/1000);dx=dx/distance*amount;dy=dy/distance*amount;
      if(!intersects(player.x+dx,player.y))player.x+=dx;
      if(!intersects(player.x,player.y+dy))player.y+=dy;
      const face=Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up";
      if(player.face!==face||!character.anims.isPlaying){
       const id=character.getData("characterId")||"maestro";
       const key="walk-"+id+"-"+face;
       if(this.anims.exists(key))character.play(key,true);
       player.face=face;
      }
   }else{character.anims.stop();character.setFrame({down:0,up:8,right:16,left:24}[player.face]??0);}
   character.setPosition(player.x,player.y);
   coords.textContent=Math.round(player.x)+", "+Math.round(player.y);
 }
}
document.getElementById("reset").onclick=()=>{drunk.reset();drunkHud();scene?.respawn();};
(async()=>{
 function applyLocalSettingsIfNeeded(force=false){
   const local=readLocalGameSettings();
   const pending=localSettingsPending();
   const useLocal=!!local&&(pending||!cloudSettings);
   const signature=useLocal?JSON.stringify(local):"cloud:"+JSON.stringify(cloudSettings?.settings||{});
   if(!force&&signature===localSettingsFingerprint)return useLocal;
   localSettingsFingerprint=signature;
   if(useLocal){
    applyRemoteSettings({settings:{...configDefaults,...(cloudSettings?.settings||{}),...local},
      revision:cloudSettings?.revision||0},true);
    return true;
   }
   if(cloudSettings)applyRemoteSettings(cloudSettings,false);
   return false;
  }
  async function syncSharedSettings(){
   // Apply local changes immediately: a Cloudflare error must never block
   // movement speeds, camera zoom, sizes or NPC visuals in this browser.
   applyLocalSettingsIfNeeded();
   try{
    const response=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store",headers:{"Cache-Control":"no-store"}});
    if(!response.ok)throw new Error("Shared settings HTTP "+response.status);
    const data=await response.json();
    cloudSettings=data;
    applyLocalSettingsIfNeeded(true);
    return data;
   }catch(error){
    if(!applyLocalSettingsIfNeeded(true)){
     setSettingsBadge("⚠ Sync offline","No local settings were found; using built-in defaults.");
    }
    throw error;
   }
  }
  // Initial local application happens before Phaser constructs its world.
  applyLocalSettingsIfNeeded(true);
  if(new URL(location.href).searchParams.get("mode")!=="multi"){
   settingsSynced=false;
   setSettingsBadge("🧪 Single Player · local","No Cloudflare Durable Objects requests.");
  }
  if(false)try{await syncSharedSettings();}
  catch(error){
   console.error("Shared settings unavailable",error);
   show(readLocalGameSettings()
    ?"Cloud settings offline; your local settings are active in this browser."
    :"Cloud settings offline; default settings are active.");
  }
  window.addEventListener("storage",event=>{
   if(event.key===LOCAL_SETTINGS_KEY||event.key===LOCAL_PENDING_KEY){
    applyLocalSettingsIfNeeded(true);
   }
  });
  document.addEventListener("visibilitychange",()=>{
   if(!document.hidden&&new URL(location.href).searchParams.get("mode")==="multi")
    void syncSharedSettings().catch(console.warn);
  });
 window.__MAESTRO_GAME__=new Phaser.Game({type:Phaser.CANVAS,parent:"screen",width:1280,height:720,backgroundColor:"#121926",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Explore],render:{pixelArt:false,antialias:true}});
 // Regular polling keeps existing mobile tabs in sync with desktop changes.
 if(new URL(location.href).searchParams.get("mode")==="multi")setInterval(()=>{
   applyLocalSettingsIfNeeded();
   void syncSharedSettings().catch(error=>console.warn("Shared settings sync unavailable",error.message));
 },10000);
})();
})();
</script></body></html>`;

export class GameSettings {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 storageFailure(error){
  const message=String(error?.message||error);
  const quota=/exceeded allowed rows|quota|free tier|limit.*exceed|SQLITE_FULL/i.test(message);
  return Response.json({
   ok:false,
   error:quota?"Cloudflare storage quota exhausted; cloud save is unavailable until the quota resets.":"Cloud settings storage failed.",
   code:quota?"STORAGE_QUOTA":"STORAGE_FAILURE"
  },{status:503,headers:{"cache-control":"no-store"}});
 }
 async fetch(request){
  if(request.method==="GET"){
   try{
    const current=await this.ctx.storage.get("settings");
    const revision=await this.ctx.storage.get("revision")||0;
    return Response.json({settings:{...SETTINGS_DEFAULTS,...current},initialized:!!current,revision},{headers:{"cache-control":"no-store, no-cache, must-revalidate","pragma":"no-cache"}});
   }catch(error){console.error("GameSettings GET storage error",error);return this.storageFailure(error);}
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
     // Validate stable per-NPC scene and numeric coordinates against schema bounds.
     const currentRevision=await this.ctx.storage.get("revision")||0;
     const requestedRevision=request.headers.get("X-Settings-Revision");
     if(requestedRevision!==null&&Number(requestedRevision)!==currentRevision)
       return Response.json({error:"Settings changed on another device",revision:currentRevision},{status:409,headers:{"cache-control":"no-store"}});
     const revision=currentRevision+1;
     await this.ctx.storage.put({settings:clean,revision});
     return Response.json({settings:clean,revision,ok:true},{headers:{"cache-control":"no-store"}});
   }catch(error){console.error("GameSettings PUT storage error",error);return error instanceof SyntaxError?Response.json({ok:false,error:"Malformed JSON",code:"INVALID_JSON"},{status:400}):this.storageFailure(error);}
  }
  return new Response("Method not allowed",{status:405});
 }
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  // Retire the publicly circulated maestro-main play link without affecting other rooms.
  // Applied before every other route to prevent old room assets/API use via query string.
  if(url.searchParams.get("room")==="maestro-main"){
   const headers={"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex, nofollow"};
   return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Session closed · MaestroEscape</title></head><body style="font:18px system-ui;background:#101a2b;color:#fff;min-height:90vh;display:grid;place-items:center;text-align:center"><main><h1>Session closed</h1><p>This MaestroEscape test link is no longer available.</p></main></body></html>',{status:410,headers:{...headers,"x-maestro-status":"CIRCULATED_ROOM_DISABLED"}});
  }
  if(url.pathname==="/assets/local-room.js")
   return new Response(LOCAL_ROOM_SOURCE,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/api/build")
   return Response.json({build:"single-player-only-20261115",drunkControllerBundled:true,multiplayerEnabled:false},
    {headers:{"cache-control":"no-store"}});
  if(url.pathname==="/assets/drunk-mode.js")
   return new Response(DRUNK_MODE_CLIENT_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store"}});
  if(url.pathname==="/api/pub/menu" && request.method==="GET")return Response.json(PUB_MENU,{headers:{"cache-control":"no-store"}});
  // Dedicated MaestroEscape Stripe TEST payments (Takkershop checkout stays untouched).
  const maestroCheckoutUrl="https://djesmhxablodlzqfzqfa.supabase.co/functions/v1/maestroescape-pub-checkout";
  const maestroKey="sb_publishable_xcBa6fYyuclsRxWCF_BJ6g_XeHUThv6";
  if(url.pathname==="/api/pub/status"){
   try{
    const r=await fetch(maestroCheckoutUrl+"/health",{headers:{"apikey":maestroKey}});
    const response=await r.json();
    return Response.json({ok:r.ok&&response.ok===true,payment_mode:"test",stripe_test_enabled:response.test_key_configured===true,real_orders_enabled:false,fulfillment_enabled:false},{status:r.ok?200:503,headers:{"cache-control":"no-store"}});
   }catch(error){console.error("Maestro pub payment health failed",String(error));return Response.json({ok:false,payment_mode:"test",stripe_test_enabled:false,real_orders_enabled:false},{status:503})}
  }
  if(url.pathname==="/api/pub/checkout"||url.pathname==="/api/pub/payment-status"){
   if(request.method!=="POST")return Response.json({ok:false,error:"Method not allowed"},{status:405});
   if(!mutationOriginAllowed(request))return Response.json({ok:false,error:"Invalid request origin"},{status:403});
   const account=await accountFromRequest(request);
   if(!account.user)return Response.json({ok:false,error:"Sign in before paying",code:"LOGIN_REQUIRED"},{status:401,headers:{"cache-control":"no-store"}});
   let raw;try{raw=await request.text();if(raw.length>12000)return Response.json({ok:false,error:"Request too large"},{status:413})}catch{return Response.json({ok:false,error:"Invalid request"},{status:400})}
   let payload;try{payload=JSON.parse(raw)}catch{return Response.json({ok:false,error:"Invalid JSON"},{status:400})}
   const cookie=(request.headers.get("cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("maestro_account="));
   const token=cookie?cookie.slice("maestro_account=".length):"";
   if(!/^[A-Za-z0-9_-]{43}$/.test(token))return Response.json({ok:false,error:"Authentication required"},{status:401});
   const op=url.pathname.endsWith("checkout")?"checkout":"status";
   try{
    const upstream=await fetch(maestroCheckoutUrl,{method:"POST",headers:{"apikey":maestroKey,"content-type":"application/json","x-forwarded-for":request.headers.get("cf-connecting-ip")||"unknown"},body:JSON.stringify({...payload,op,token})});
    const type=upstream.headers.get("content-type")||"";
    if(!type.includes("application/json"))throw Error("Non-JSON checkout response");
    const data=await upstream.json();
    return Response.json(data,{status:upstream.status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
   }catch(error){console.error("Maestro pub Stripe proxy failed",String(error));return Response.json({ok:false,error:"Stripe test checkout unavailable",code:"PAYMENT_BACKEND_ERROR"},{status:503})}
  }

  if(url.pathname==="/api/pub/orders" && request.method==="POST")return Response.json({ok:false,error:"Real orders are not enabled",code:"PUB_ORDERS_DISABLED"},{status:503,headers:{"cache-control":"no-store"}});
  if(url.pathname==="/assets/mobile-landscape.js")return new Response(MOBILE_LANDSCAPE_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/inventory-wheel.js")return new Response(INVENTORY_WHEEL_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/inventory-wheel.css")return new Response(INVENTORY_WHEEL_CSS,{headers:{"content-type":"text/css; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/pub-hud.js")return new Response(PUB_HUD_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/pub-hud.css")return new Response(PUB_HUD_CSS,{headers:{"content-type":"text/css; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/pub-orders.js")return new Response(PUB_SHOP_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/pub-shop.css")return new Response(PUB_SHOP_CSS,{headers:{"content-type":"text/css; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(url.pathname==="/assets/consumables.js")
   return new Response(CONSUMABLE_CLIENT_SCRIPT,{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store"}});
  if(url.pathname==="/api/consumables")return Response.json({ok:false,error:"Multiplayer has been shut down. Use single-player test mode.",code:"MULTIPLAYER_DISABLED"},{status:410,headers:{"cache-control":"no-store"}});
  // Supabase Auth users are separate from Takkershop application roles.
  const accountHTML={"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","x-robots-tag":"noindex, nofollow","content-security-policy":"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
  if(url.pathname==="/admin/login")return Response.redirect(url.origin+"/account/login",303);
  if(url.pathname==="/account/login"||url.pathname==="/account/register")return new Response(ACCOUNT_PAGE,{headers:accountHTML});
  if(url.pathname==="/api/account/status")return accountStatus();
  if(["/api/account/register","/api/account/login","/api/account/logout"].includes(url.pathname)){
   if(request.method!=="POST")return Response.json({ok:false,error:"Method not allowed"},{status:405});
   return accountAction(request,url.pathname.split("/").pop());
  }
  if(url.pathname==="/admin/logout"){
   if(request.method!=="POST"||!mutationOriginAllowed(request))return new Response("Forbidden",{status:403});
   return loggedOutResponse();
  }
  if(["/account","/api/account/me","/settings","/settings/schema","/api/settings"].includes(url.pathname)){
   const session=await accountFromRequest(request);
   if(url.pathname==="/api/account/me")return session.user?applyAuthCookies(Response.json({ok:true,user:session.user},{headers:{"cache-control":"no-store"}}),session):Response.json({ok:false,error:"Not authenticated"},{status:401});
   if(url.pathname==="/account")return session.user?applyAuthCookies(new Response(ACCOUNT_HOME,{headers:accountHTML}),session):Response.redirect(url.origin+"/account/login",303);
   if(session.user?.role!=="admin")return url.pathname==="/settings"?Response.redirect(url.origin+(session.user?"/account":"/account/login"),303):Response.json({ok:false,error:"Administrator role required",code:"ADMIN_REQUIRED"},{status:403,headers:{"cache-control":"no-store"}});
   if(url.pathname==="/api/settings"&&request.method!=="GET"&&!mutationOriginAllowed(request))return Response.json({ok:false,error:"Invalid origin"},{status:403});
   if(url.pathname==="/api/settings"){
    if(!env?.SETTINGS_STORE)return Response.json({error:"Shared settings storage binding unavailable"},{status:503});
    const stub=env.SETTINGS_STORE.get(env.SETTINGS_STORE.idFromName("maestroescape-global-settings"));
    const result=await stub.fetch(new Request("https://settings.internal/",{method:request.method,headers:request.headers,body:request.method==="PUT"?request.body:undefined}));
    return applyAuthCookies(result,session);
   }
   if(url.pathname==="/settings")return applyAuthCookies(new Response(SETTINGS_HTML.replace("</header>",'<form action="/admin/logout" method="post" style="margin-left:auto"><button type="submit">🔒 Log out</button></form></header>'),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-frame-options":"DENY"}}),session);
   return applyAuthCookies(Response.json({groups:SETTINGS_GROUPS,defaults:SETTINGS_DEFAULTS},{headers:{"cache-control":"no-store"}}),session);
  }
  if(url.pathname==="/health")return Response.json({ok:true,game:"MaestroEscape",mode:"single-player-test-only",multiplayerEnabled:false,vehicle:"Skoda Superb 2.0TDI"});
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
  if(url.pathname==="/assets/bubi-rider.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/bubi_rider_4frames.webp");
    if(!upstream.ok)return new Response("Riding sprites unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
  }
  if(url.pathname==="/assets/bubi.webp"){const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/bubi_bike.webp");if(!upstream.ok)return new Response("Bubi asset unavailable",{status:502});return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});}
  if(/^\/assets\/characters\/(casual|suit|muscular)_walk\.webp$/.test(url.pathname)){
    const name=url.pathname.split("/").pop();
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Characters/"+name);
    if(!upstream.ok)return new Response("Character sprite pending upload",{status:404});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
  }
  if(/^\/assets\/npc\/[a-z0-9_]+\.webp$/.test(url.pathname)){
    const id=url.pathname.slice("/assets/npc/".length,-5);
    if(!/^(maestro_bartender|maestro_regular_[123]|spar_cashier|spar_shopper_[12]|tobacco_cashier|gyros_employee)$/.test(id))return new Response("Unknown NPC",{status:404});
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/NPCs/"+id+".webp");
    if(!upstream.ok)return new Response("NPC asset unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=600"}});
  }
  if(url.pathname==="/assets/world.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/maestro_map_new.webp");
    if(!upstream.ok)return new Response("Map image unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
  }
  if(url.pathname==="/assets/kaparos_buksza.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/UI/kaparos_buksza.webp");
    if(!upstream.ok)return new Response("Buksza lottery artwork missing",{status:404,headers:{"cache-control":"no-store"}});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300","x-content-type-options":"nosniff"}});
  }
  if(url.pathname==="/assets/casino.webp"){
    // Use the uploaded 1448x1086 artwork when published, preserving legacy fallback until then.
    const base="https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/";
    for(const file of ["maestro_casino_v2.webp","maestro_casino.webp"]){
      const upstream=await fetch(base+file,{headers:{"cache-control":"no-cache"}});
      if(upstream.ok&&upstream.body)return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"no-cache, max-age=0","x-content-type-options":"nosniff","x-casino-art":file}});
    }
    return new Response("Underground Casino image missing",{status:404,headers:{"cache-control":"no-store"}});
  }
  if(url.pathname==="/assets/basement.webp"){
    // Support the converted WebP and the original image filename from the uploaded basement ZIP.
    const base="https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Maps/";
    const candidates=[["maestro_basement.webp","image/webp"],["basement_art.png","image/png"]];
    for(const [name,mime] of candidates){
      const upstream=await fetch(base+name);
      if(upstream.ok&&upstream.body)return new Response(upstream.body,{
        headers:{"content-type":mime,"cache-control":"public, max-age=300","x-content-type-options":"nosniff"}
      });
    }
    return new Response("Basement image is missing. Upload maestro_basement.webp to Assets/Maps/ in GitHub.",{
      status:404,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}
    });
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
  if(url.pathname.startsWith("/api/"))
   return Response.json({ok:false,error:"Unknown MaestroEscape API endpoint: "+url.pathname,code:"API_NOT_FOUND"},{status:404,headers:{"cache-control":"no-store","x-maestro-api":"room-v2"}});
  return new Response(HTML.replace("</head>",'<link rel="stylesheet" href="/assets/pub-hud.css"><link rel="stylesheet" href="/assets/pub-shop.css"></head>').replace("</body>",'<script src="/assets/pub-hud.js"></script><script src="/assets/mobile-landscape.js"></script><script src="/assets/inventory-wheel.js"></script><script src="/assets/pub-orders.js"></script></body>').replace("__MAESTRO_DEFAULT_SETTINGS__",JSON.stringify(SETTINGS_DEFAULTS))
    ,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }
};
