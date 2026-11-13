// MaestroEscape: single-player browser exploration using the uploaded game's TMX,
// map artwork, collision objects, and character animation frames.
// Original Pygame source remains available in the repository.
const SETTINGS_GROUPS=[{"title":"Characters","description":"Walking, sprinting, animations and size outside.","fields":[{"key":"character.walkSpeed","label":"Walk speed","value":205,"min":60,"max":450,"step":5,"unit":"px/s"},{"key":"character.sprintSpeed","label":"Sprint speed","value":300,"min":80,"max":650,"step":5,"unit":"px/s"},{"key":"character.streetScale","label":"Outside character size","value":0.324,"min":0.1,"max":2.5,"step":0.01,"unit":"×"},{"key":"character.animationFps","label":"Walking animation","value":9,"min":2,"max":24,"step":1,"unit":"fps"}]},{"title":"Buildings · Individual zoom & character size","description":"Each interior is adjusted independently.","fields":[{"key":"building.pub.zoom","label":"Maestro Pub zoom","value":0.825,"min":0.35,"max":3.5,"step":0.025,"unit":"×"},{"key":"building.pub.scale","label":"Maestro Pub character","value":1.296,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.spar.zoom","label":"SPAR zoom","value":1.875,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.spar.scale","label":"SPAR character","value":0.57,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.gyros.zoom","label":"Mester Gyros zoom","value":1.667,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.gyros.scale","label":"Gyros character","value":0.642,"min":0.2,"max":3,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.zoom","label":"Dohánybolt zoom","value":2.105,"min":0.35,"max":4,"step":0.025,"unit":"×"},{"key":"building.dohanybolt.scale","label":"Dohánybolt character","value":0.508,"min":0.2,"max":3,"step":0.025,"unit":"×"}]},{"title":"Vehicles · Appearance","description":"Rendered sizes on the outdoor map.","fields":[{"key":"vehicle.skoda.width","label":"Škoda width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.skoda.length","label":"Škoda length","value":72,"min":30,"max":180,"step":1,"unit":"px"},{"key":"vehicle.octavia.width","label":"Octavia width","value":32,"min":12,"max":100,"step":1,"unit":"px"},{"key":"vehicle.octavia.length","label":"Octavia length","value":64,"min":30,"max":180,"step":1,"unit":"px"}]},{"title":"Vehicle starting positions","description":"Use the map placement editor above to drag or rotate each vehicle; coordinates are shared across devices.","fields":[{"key":"vehicle.skoda.spawnX","label":"Skoda starting X","value":697,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.skoda.spawnY","label":"Skoda starting Y","value":505,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.skoda.angle","label":"Skoda angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.octavia.spawnX","label":"Octavia starting X","value":632,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.octavia.spawnY","label":"Octavia starting Y","value":453,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.octavia.angle","label":"Octavia angle","value":135,"min":0,"max":359,"step":1,"unit":"°"}]},{"title":"Bubi bikes · Placement and size","description":"Adjust each bike individually or drag it on the map. These values are shared across devices.","fields":[{"key":"vehicle.bike1.width","label":"Bubi 1 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike1.length","label":"Bubi 1 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike1.spawnX","label":"Bubi 1 spawnX","value":670,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike1.spawnY","label":"Bubi 1 spawnY","value":850,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike1.angle","label":"Bubi 1 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.bike2.width","label":"Bubi 2 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike2.length","label":"Bubi 2 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike2.spawnX","label":"Bubi 2 spawnX","value":688,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike2.spawnY","label":"Bubi 2 spawnY","value":860,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike2.angle","label":"Bubi 2 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"},{"key":"vehicle.bike3.width","label":"Bubi 3 width","value":15,"min":6,"max":45,"step":1,"unit":"px"},{"key":"vehicle.bike3.length","label":"Bubi 3 length","value":34,"min":16,"max":80,"step":1,"unit":"px"},{"key":"vehicle.bike3.spawnX","label":"Bubi 3 spawnX","value":706,"min":0,"max":1600,"step":1,"unit":"px"},{"key":"vehicle.bike3.spawnY","label":"Bubi 3 spawnY","value":870,"min":0,"max":992,"step":1,"unit":"px"},{"key":"vehicle.bike3.angle","label":"Bubi 3 angle","value":135,"min":0,"max":359,"step":1,"unit":"°"}]},{"title":"Bubi bikes · Driving","description":"Separate pedal acceleration, top speed, steering and friction.","fields":[{"key":"bike.acceleration","label":"Pedal acceleration","value":100,"min":20,"max":300,"step":5,"unit":"px/s²"},{"key":"bike.topSpeed","label":"Maximum cycling speed","value":125,"min":30,"max":270,"step":5,"unit":"px/s"},{"key":"bike.turnRate","label":"Bike steering rate","value":3.5,"min":0.3,"max":8,"step":0.1,"unit":"rad/s"},{"key":"bike.drag","label":"Bike coasting drag","value":1.5,"min":0.1,"max":6,"step":0.1,"unit":"×"}]},{"title":"Vehicles · Driving mechanics","description":"Applies to both cars. Braking, steering and friction can be fine-tuned.","fields":[{"key":"vehicle.acceleration","label":"Acceleration","value":175,"min":20,"max":500,"step":5,"unit":"px/s²"},{"key":"vehicle.topSpeed","label":"Maximum speed","value":245,"min":40,"max":600,"step":5,"unit":"px/s"},{"key":"vehicle.turnRate","label":"Steering sensitivity","value":2,"min":0.2,"max":6,"step":0.1,"unit":"rad/s"},{"key":"vehicle.braking","label":"Braking strength","value":1.65,"min":0.5,"max":4,"step":0.05,"unit":"×"},{"key":"vehicle.drag","label":"Coasting drag","value":1.35,"min":0.1,"max":6,"step":0.05,"unit":"×"}]},{"title":"Tram","description":"Tram passes on the tracks, pauses 3 seconds at the stop, then continues.","fields":[{"key":"tram.interval","label":"Pass frequency","value":20,"min":5,"max":120,"step":1,"unit":"sec"},{"key":"tram.travelTime","label":"Crossing duration","value":14.5,"min":3,"max":30,"step":0.5,"unit":"sec"},{"key":"tram.width","label":"Tram width","value":40,"min":20,"max":110,"step":1,"unit":"px"},{"key":"tram.length","label":"Tram length","value":144,"min":65,"max":360,"step":1,"unit":"px"}]},{"title":"Camera & Interaction","description":"Outdoor view and interaction ranges.","fields":[{"key":"camera.streetZoom","label":"Outdoor zoom","value":2.03,"min":0.5,"max":4.5,"step":0.05,"unit":"×"},{"key":"camera.drivingZoom","label":"Driving zoom","value":1.3804,"min":0.35,"max":4,"step":0.05,"unit":"×"},{"key":"game.interactRadius","label":"Shop entry reach","value":82,"min":30,"max":150,"step":1,"unit":"px"},{"key":"game.vehicleRadius","label":"Vehicle entry reach","value":67,"min":30,"max":150,"step":1,"unit":"px"},{"key":"npc.interactRadius","label":"NPC dialogue reach","value":108,"min":40,"max":190,"step":2,"unit":"px"},{"key":"npc.interactCooldownMs","label":"NPC action cooldown","value":450,"min":150,"max":2000,"step":50,"unit":"ms"}]},{"title":"NPCs","description":"Nine interior NPC placements and behaviour. Use the visual NPC editor.","fields":[{"key":"npc.maestro_bartender.x","label":"X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.y","label":"Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.homeX","label":"Home X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.homeY","label":"Home Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_bartender.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_bartender.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_bartender.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_bartender.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_bartender.wp1X","label":"Waypoint 1 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp1Y","label":"Waypoint 1 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp2X","label":"Waypoint 2 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp2Y","label":"Waypoint 2 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp3X","label":"Waypoint 3 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp3Y","label":"Waypoint 3 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp4X","label":"Waypoint 4 X","value":413,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_bartender.wp4Y","label":"Waypoint 4 Y","value":210,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.x","label":"X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.y","label":"Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.homeX","label":"Home X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.homeY","label":"Home Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_1.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_1.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_1.speed","label":"Walking speed","value":35,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_1.idleMs","label":"Rest time","value":7500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_1.wp1X","label":"Waypoint 1 X","value":378,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp1Y","label":"Waypoint 1 Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp2X","label":"Waypoint 2 X","value":378,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp2Y","label":"Waypoint 2 Y","value":543,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp3X","label":"Waypoint 3 X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp3Y","label":"Waypoint 3 Y","value":543,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp4X","label":"Waypoint 4 X","value":342,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_1.wp4Y","label":"Waypoint 4 Y","value":511,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.x","label":"X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.y","label":"Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.homeX","label":"Home X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.homeY","label":"Home Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":2,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_2.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_2.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_2.speed","label":"Walking speed","value":32,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_2.idleMs","label":"Rest time","value":8400,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_2.wp1X","label":"Waypoint 1 X","value":686,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp1Y","label":"Waypoint 1 Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp2X","label":"Waypoint 2 X","value":686,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp2Y","label":"Waypoint 2 Y","value":732,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp3X","label":"Waypoint 3 X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp3Y","label":"Waypoint 3 Y","value":732,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp4X","label":"Waypoint 4 X","value":648,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_2.wp4Y","label":"Waypoint 4 Y","value":707,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.x","label":"X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.y","label":"Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.homeX","label":"Home X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.homeY","label":"Home Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":3,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.maestro_regular_3.scale","label":"Sprite scale","value":2,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.maestro_regular_3.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.maestro_regular_3.speed","label":"Walking speed","value":34,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.maestro_regular_3.idleMs","label":"Rest time","value":9200,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.maestro_regular_3.wp1X","label":"Waypoint 1 X","value":1008,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp1Y","label":"Waypoint 1 Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp2X","label":"Waypoint 2 X","value":1008,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp2Y","label":"Waypoint 2 Y","value":746,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp3X","label":"Waypoint 3 X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp3Y","label":"Waypoint 3 Y","value":746,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp4X","label":"Waypoint 4 X","value":1043,"min":0,"max":1448,"step":1,"unit":"px"},{"key":"npc.maestro_regular_3.wp4Y","label":"Waypoint 4 Y","value":774,"min":0,"max":1086,"step":1,"unit":"px"},{"key":"npc.spar_cashier.x","label":"X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.y","label":"Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.homeX","label":"Home X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.homeY","label":"Home Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_cashier.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_cashier.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_cashier.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_cashier.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_cashier.wp1X","label":"Waypoint 1 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp1Y","label":"Waypoint 1 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp2X","label":"Waypoint 2 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp2Y","label":"Waypoint 2 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp3X","label":"Waypoint 3 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp3Y","label":"Waypoint 3 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp4X","label":"Waypoint 4 X","value":478,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_cashier.wp4Y","label":"Waypoint 4 Y","value":224,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.x","label":"X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.y","label":"Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.homeX","label":"Home X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.homeY","label":"Home Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":2,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_shopper_1.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_shopper_1.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_shopper_1.speed","label":"Walking speed","value":24,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_shopper_1.idleMs","label":"Rest time","value":4000,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_shopper_1.wp1X","label":"Waypoint 1 X","value":208,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp1Y","label":"Waypoint 1 Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp2X","label":"Waypoint 2 X","value":208,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp2Y","label":"Waypoint 2 Y","value":276,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp3X","label":"Waypoint 3 X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp3Y","label":"Waypoint 3 Y","value":276,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp4X","label":"Waypoint 4 X","value":233,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_1.wp4Y","label":"Waypoint 4 Y","value":249,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.x","label":"X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.y","label":"Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.homeX","label":"Home X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.homeY","label":"Home Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":1,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.spar_shopper_2.scale","label":"Sprite scale","value":0.99,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.spar_shopper_2.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.spar_shopper_2.speed","label":"Walking speed","value":26,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.spar_shopper_2.idleMs","label":"Rest time","value":4200,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.spar_shopper_2.wp1X","label":"Waypoint 1 X","value":656,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp1Y","label":"Waypoint 1 Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp2X","label":"Waypoint 2 X","value":656,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp2Y","label":"Waypoint 2 Y","value":208,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp3X","label":"Waypoint 3 X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp3Y","label":"Waypoint 3 Y","value":208,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp4X","label":"Waypoint 4 X","value":636,"min":0,"max":736,"step":1,"unit":"px"},{"key":"npc.spar_shopper_2.wp4Y","label":"Waypoint 4 Y","value":243,"min":0,"max":384,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.x","label":"X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.y","label":"Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.homeX","label":"Home X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.homeY","label":"Home Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.tobacco_cashier.scale","label":"Sprite scale","value":0.89,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.tobacco_cashier.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.tobacco_cashier.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.tobacco_cashier.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.tobacco_cashier.wp1X","label":"Waypoint 1 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp1Y","label":"Waypoint 1 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp2X","label":"Waypoint 2 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp2Y","label":"Waypoint 2 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp3X","label":"Waypoint 3 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp3Y","label":"Waypoint 3 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp4X","label":"Waypoint 4 X","value":519,"min":0,"max":608,"step":1,"unit":"px"},{"key":"npc.tobacco_cashier.wp4Y","label":"Waypoint 4 Y","value":416,"min":0,"max":832,"step":1,"unit":"px"},{"key":"npc.gyros_employee.x","label":"X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.y","label":"Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.homeX","label":"Home X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.homeY","label":"Home Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.facing","label":"Facing (0 down, 1 left, 2 right, 3 up)","value":0,"min":0,"max":3,"step":1,"unit":""},{"key":"npc.gyros_employee.scale","label":"Sprite scale","value":1.12,"min":0.3,"max":3.5,"step":0.05,"unit":"×"},{"key":"npc.gyros_employee.enabled","label":"Visible","value":1,"min":0,"max":1,"step":1,"unit":""},{"key":"npc.gyros_employee.speed","label":"Walking speed","value":25,"min":5,"max":90,"step":1,"unit":"px/s"},{"key":"npc.gyros_employee.idleMs","label":"Rest time","value":2500,"min":500,"max":20000,"step":100,"unit":"ms"},{"key":"npc.gyros_employee.wp1X","label":"Waypoint 1 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp1Y","label":"Waypoint 1 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp2X","label":"Waypoint 2 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp2Y","label":"Waypoint 2 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp3X","label":"Waypoint 3 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp3Y","label":"Waypoint 3 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp4X","label":"Waypoint 4 X","value":294,"min":0,"max":768,"step":1,"unit":"px"},{"key":"npc.gyros_employee.wp4Y","label":"Waypoint 4 Y","value":291,"min":0,"max":480,"step":1,"unit":"px"}]}];
const SETTINGS_DEFAULTS={"character.walkSpeed":205,"character.sprintSpeed":300,"character.streetScale":0.324,"character.animationFps":9,"building.pub.zoom":0.825,"building.pub.scale":1.296,"building.spar.zoom":1.875,"building.spar.scale":0.57,"building.gyros.zoom":1.667,"building.gyros.scale":0.642,"building.dohanybolt.zoom":2.105,"building.dohanybolt.scale":0.508,"vehicle.skoda.width":32,"vehicle.skoda.length":72,"vehicle.octavia.width":32,"vehicle.octavia.length":64,"vehicle.acceleration":175,"vehicle.topSpeed":245,"vehicle.turnRate":2,"vehicle.braking":1.65,"vehicle.drag":1.35,"tram.interval":20,"tram.travelTime":14.5,"tram.width":40,"tram.length":144,"camera.streetZoom":2.03,"camera.drivingZoom":1.3804,"game.interactRadius":82,"game.vehicleRadius":67,"vehicle.skoda.spawnX":697,"vehicle.skoda.spawnY":505,"vehicle.skoda.angle":135,"vehicle.octavia.spawnX":632,"vehicle.octavia.spawnY":453,"vehicle.octavia.angle":135,"vehicle.bike1.width":15,"vehicle.bike1.length":34,"vehicle.bike1.spawnX":670,"vehicle.bike1.spawnY":850,"vehicle.bike1.angle":135,"vehicle.bike2.width":15,"vehicle.bike2.length":34,"vehicle.bike2.spawnX":688,"vehicle.bike2.spawnY":860,"vehicle.bike2.angle":135,"vehicle.bike3.width":15,"vehicle.bike3.length":34,"vehicle.bike3.spawnX":706,"vehicle.bike3.spawnY":870,"vehicle.bike3.angle":135,"bike.acceleration":100,"bike.topSpeed":125,"bike.turnRate":3.5,"bike.drag":1.5,"npc.interactRadius":108,"npc.interactCooldownMs":450,"npc.maestro_bartender.x":413,"npc.maestro_bartender.y":210,"npc.maestro_bartender.homeX":413,"npc.maestro_bartender.homeY":210,"npc.maestro_bartender.facing":0,"npc.maestro_bartender.scale":2,"npc.maestro_bartender.enabled":1,"npc.maestro_bartender.speed":25,"npc.maestro_bartender.idleMs":2500,"npc.maestro_bartender.wp1X":413,"npc.maestro_bartender.wp1Y":210,"npc.maestro_bartender.wp2X":413,"npc.maestro_bartender.wp2Y":210,"npc.maestro_bartender.wp3X":413,"npc.maestro_bartender.wp3Y":210,"npc.maestro_bartender.wp4X":413,"npc.maestro_bartender.wp4Y":210,"npc.maestro_regular_1.x":342,"npc.maestro_regular_1.y":511,"npc.maestro_regular_1.homeX":342,"npc.maestro_regular_1.homeY":511,"npc.maestro_regular_1.facing":1,"npc.maestro_regular_1.scale":2,"npc.maestro_regular_1.enabled":1,"npc.maestro_regular_1.speed":35,"npc.maestro_regular_1.idleMs":7500,"npc.maestro_regular_1.wp1X":378,"npc.maestro_regular_1.wp1Y":511,"npc.maestro_regular_1.wp2X":378,"npc.maestro_regular_1.wp2Y":543,"npc.maestro_regular_1.wp3X":342,"npc.maestro_regular_1.wp3Y":543,"npc.maestro_regular_1.wp4X":342,"npc.maestro_regular_1.wp4Y":511,"npc.maestro_regular_2.x":648,"npc.maestro_regular_2.y":707,"npc.maestro_regular_2.homeX":648,"npc.maestro_regular_2.homeY":707,"npc.maestro_regular_2.facing":2,"npc.maestro_regular_2.scale":2,"npc.maestro_regular_2.enabled":1,"npc.maestro_regular_2.speed":32,"npc.maestro_regular_2.idleMs":8400,"npc.maestro_regular_2.wp1X":686,"npc.maestro_regular_2.wp1Y":707,"npc.maestro_regular_2.wp2X":686,"npc.maestro_regular_2.wp2Y":732,"npc.maestro_regular_2.wp3X":648,"npc.maestro_regular_2.wp3Y":732,"npc.maestro_regular_2.wp4X":648,"npc.maestro_regular_2.wp4Y":707,"npc.maestro_regular_3.x":1043,"npc.maestro_regular_3.y":774,"npc.maestro_regular_3.homeX":1043,"npc.maestro_regular_3.homeY":774,"npc.maestro_regular_3.facing":3,"npc.maestro_regular_3.scale":2,"npc.maestro_regular_3.enabled":1,"npc.maestro_regular_3.speed":34,"npc.maestro_regular_3.idleMs":9200,"npc.maestro_regular_3.wp1X":1008,"npc.maestro_regular_3.wp1Y":774,"npc.maestro_regular_3.wp2X":1008,"npc.maestro_regular_3.wp2Y":746,"npc.maestro_regular_3.wp3X":1043,"npc.maestro_regular_3.wp3Y":746,"npc.maestro_regular_3.wp4X":1043,"npc.maestro_regular_3.wp4Y":774,"npc.spar_cashier.x":478,"npc.spar_cashier.y":224,"npc.spar_cashier.homeX":478,"npc.spar_cashier.homeY":224,"npc.spar_cashier.facing":0,"npc.spar_cashier.scale":0.99,"npc.spar_cashier.enabled":1,"npc.spar_cashier.speed":25,"npc.spar_cashier.idleMs":2500,"npc.spar_cashier.wp1X":478,"npc.spar_cashier.wp1Y":224,"npc.spar_cashier.wp2X":478,"npc.spar_cashier.wp2Y":224,"npc.spar_cashier.wp3X":478,"npc.spar_cashier.wp3Y":224,"npc.spar_cashier.wp4X":478,"npc.spar_cashier.wp4Y":224,"npc.spar_shopper_1.x":233,"npc.spar_shopper_1.y":249,"npc.spar_shopper_1.homeX":233,"npc.spar_shopper_1.homeY":249,"npc.spar_shopper_1.facing":2,"npc.spar_shopper_1.scale":0.99,"npc.spar_shopper_1.enabled":1,"npc.spar_shopper_1.speed":24,"npc.spar_shopper_1.idleMs":4000,"npc.spar_shopper_1.wp1X":208,"npc.spar_shopper_1.wp1Y":249,"npc.spar_shopper_1.wp2X":208,"npc.spar_shopper_1.wp2Y":276,"npc.spar_shopper_1.wp3X":233,"npc.spar_shopper_1.wp3Y":276,"npc.spar_shopper_1.wp4X":233,"npc.spar_shopper_1.wp4Y":249,"npc.spar_shopper_2.x":636,"npc.spar_shopper_2.y":243,"npc.spar_shopper_2.homeX":636,"npc.spar_shopper_2.homeY":243,"npc.spar_shopper_2.facing":1,"npc.spar_shopper_2.scale":0.99,"npc.spar_shopper_2.enabled":1,"npc.spar_shopper_2.speed":26,"npc.spar_shopper_2.idleMs":4200,"npc.spar_shopper_2.wp1X":656,"npc.spar_shopper_2.wp1Y":243,"npc.spar_shopper_2.wp2X":656,"npc.spar_shopper_2.wp2Y":208,"npc.spar_shopper_2.wp3X":636,"npc.spar_shopper_2.wp3Y":208,"npc.spar_shopper_2.wp4X":636,"npc.spar_shopper_2.wp4Y":243,"npc.tobacco_cashier.x":519,"npc.tobacco_cashier.y":416,"npc.tobacco_cashier.homeX":519,"npc.tobacco_cashier.homeY":416,"npc.tobacco_cashier.facing":0,"npc.tobacco_cashier.scale":0.89,"npc.tobacco_cashier.enabled":1,"npc.tobacco_cashier.speed":25,"npc.tobacco_cashier.idleMs":2500,"npc.tobacco_cashier.wp1X":519,"npc.tobacco_cashier.wp1Y":416,"npc.tobacco_cashier.wp2X":519,"npc.tobacco_cashier.wp2Y":416,"npc.tobacco_cashier.wp3X":519,"npc.tobacco_cashier.wp3Y":416,"npc.tobacco_cashier.wp4X":519,"npc.tobacco_cashier.wp4Y":416,"npc.gyros_employee.x":294,"npc.gyros_employee.y":291,"npc.gyros_employee.homeX":294,"npc.gyros_employee.homeY":291,"npc.gyros_employee.facing":0,"npc.gyros_employee.scale":1.12,"npc.gyros_employee.enabled":1,"npc.gyros_employee.speed":25,"npc.gyros_employee.idleMs":2500,"npc.gyros_employee.wp1X":294,"npc.gyros_employee.wp1Y":291,"npc.gyros_employee.wp2X":294,"npc.gyros_employee.wp2Y":291,"npc.gyros_employee.wp3X":294,"npc.gyros_employee.wp3Y":291,"npc.gyros_employee.wp4X":294,"npc.gyros_employee.wp4Y":291};
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
</style></head><body><main><header><div><h1>⚙️ MaestroEscape Settings</h1><p>Configure each part of the game. Settings are shared across every device.</p></div><div class="toolbar"><a href="/">Back to game</a><button id="defaults">Reset defaults</button><button id="local-import">Use old device settings</button><button id="export">Export JSON</button><button id="import">Import JSON</button><input id="file" type="file" accept=".json,application/json" hidden></div></header><p id="notice">Loading settings…</p><section id="vehicle-editor"><h2>Park the cars on the map</h2><p class="parking-hint">Select a car, drag it to the starting place, and use the angle slider to rotate it. Saved placements are shared across all devices.</p>
<canvas id="parking-map" width="1600" height="992" aria-label="Drag vehicle positions on the map"></canvas>
<div class="parking-toolbar"><label>Vehicle <select id="parking-choice"><option value="skoda">Skoda Superb</option><option value="octavia">Octavia Checkengine</option><option value="bike1">Bubi Bike 1</option><option value="bike2">Bubi Bike 2</option><option value="bike3">Bubi Bike 3</option></select></label><label>Rotation <input id="parking-angle" type="range" min="0" max="359" step="1"></label><strong id="parking-angle-text"></strong><button id="parking-save" class="primary">Save positions to all devices</button></div><p id="parking-info"></p></section><section id="npc-editor"><h2>NPCs · shared placement editor</h2>
<p>Drag the selected NPC on the correct interior map. Switch mode to drag its home point or one of four patrol waypoints. Scene assignment is fixed to prevent NPCs appearing in the wrong building.</p>
<div class="npc-fields"><label>Interior <select id="npc-scene"><option value="pub">Maestro Pub</option><option value="spar">SPAR</option><option value="dohanybolt">Dohánybolt</option><option value="gyros">Mester Gyros</option></select></label>
<label>NPC <select id="npc-select"></select></label>
<label>Edit <select id="npc-mode"><option value="spawn">Position</option><option value="home">Home</option><option value="wp1">Waypoint 1</option><option value="wp2">Waypoint 2</option><option value="wp3">Waypoint 3</option><option value="wp4">Waypoint 4</option></select></label></div>
<canvas id="npc-map" width="1448" height="1086" aria-label="NPC interior placement map"></canvas>
<div class="npc-fields"><label>X <input type="number" id="npc-x" step="1"></label><label>Y <input type="number" id="npc-y" step="1"></label>
<label>Facing <select id="npc-facing"><option value="0">Down</option><option value="1">Left</option><option value="2">Right</option><option value="3">Up</option></select></label>
<label>Size <input id="npc-scale" type="number" min=".3" max="3.5" step=".05"></label>
<label>Enabled <input id="npc-enabled" type="checkbox"></label>
<label>Walk speed <input id="npc-speed" type="number" min="5" max="90" step="1"></label>
<label>Rest time (ms) <input id="npc-idle" type="number" min="500" max="20000" step="100"></label></div>
<div class="npc-fields"><button type="button" id="npc-save" class="primary">Save NPC settings to all devices</button><button type="button" id="npc-reload">Reload from server</button><button type="button" id="npc-reset">Reset selected NPC</button></div>
<p id="npc-map-status">Edit positions on the map. Changes require saving.</p>
</section><div class="sections" id="sections"></div><footer>Changes apply when you return to the game. You can keep a backup using Export JSON. Settings are stored centrally in Cloudflare and loaded by all devices.</footer></main><script>
(async()=>{
 const KEY="maestroescape.gameSettings.v1";
 const response=await fetch("/settings/schema",{cache:"no-store"});
 const {groups,defaults}=await response.json();
 const npcMetadata=[{"id":"maestro_bartender","name":"Bartender","interior":"pub","role":"worker"},{"id":"maestro_regular_1","name":"Pub Regular 1","interior":"pub","role":"civilian"},{"id":"maestro_regular_2","name":"Pub Regular 2","interior":"pub","role":"civilian"},{"id":"maestro_regular_3","name":"Pub Regular 3","interior":"pub","role":"civilian"},{"id":"spar_cashier","name":"SPAR Cashier","interior":"spar","role":"worker"},{"id":"spar_shopper_1","name":"Shopper 1","interior":"spar","role":"civilian"},{"id":"spar_shopper_2","name":"Shopper 2","interior":"spar","role":"civilian"},{"id":"tobacco_cashier","name":"Tobacco Cashier","interior":"dohanybolt","role":"worker"},{"id":"gyros_employee","name":"Gyros Employee","interior":"gyros","role":"worker"}];
 const npcAreas={"pub":{"w":1448,"h":1086,"asset":"/assets/interior.webp"},"spar":{"w":736,"h":384,"asset":"/assets/shop-spar.webp"},"dohanybolt":{"w":608,"h":832,"asset":"/assets/shop-dohanybolt.webp"},"gyros":{"w":768,"h":480,"asset":"/assets/shop-gyros.webp"}};


 let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch{}
 const root=document.getElementById("sections"),notice=document.getElementById("notice");
 const lookup=Object.fromEntries(groups.flatMap(group=>group.fields.map(field=>[field.key,field])));
 const normalize=data=>Object.fromEntries(Object.entries(lookup).map(([key,field])=>{const v=Number(data[key]);return [key,Number.isFinite(v)?Math.max(field.min,Math.min(field.max,v)):field.value]}));
 let values=normalize(defaults),lastPersisted=JSON.stringify(values),saveHandle=0,savePromise=Promise.resolve(),storageReady=false,revision=0;
 try {
   const remote=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Cloud settings unavailable: HTTP "+r.status);return r.json()});
   values=normalize({...defaults,...remote.settings});
   lastPersisted=JSON.stringify(values);
   revision=Number(remote.revision)||0;
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
       try{localStorage.setItem(KEY,payload)}catch(error){console.warn("Local backup unavailable",error)}
       storageReady=true;
       notice.textContent="✓ All settings verified on server and saved for every device.";
       return true;
     }catch(error){
       notice.textContent="Could not save: "+error.message+". Settings are NOT saved yet. Reload from server if another device changed them.";
       console.error("Shared settings save failure",error);
       return false;
     }
   };
   savePromise=savePromise.then(execute,execute);
   return savePromise;
 }
 function store(){notice.textContent="Unsaved changes…";clearTimeout(saveHandle);saveHandle=setTimeout(()=>void push(),600);}
 function draw(){root.innerHTML="";for(const group of groups){if(group.title==="NPCs")continue;const section=document.createElement("section"),title=document.createElement("h2"),desc=document.createElement("p");title.textContent=group.title;desc.textContent=group.description;desc.className="desc";section.append(title,desc);for(const field of group.fields){const wrap=document.createElement("div");wrap.className="field";const top=document.createElement("div");top.className="field-header";const lab=document.createElement("label");lab.textContent=field.label;const valBox=document.createElement("div");valBox.className="valuebox";const num=document.createElement("input");num.type="number";num.min=field.min;num.max=field.max;num.step=field.step;num.value=values[field.key];num.id="value-"+field.key;lab.htmlFor=num.id;const unit=document.createElement("span");unit.className="unit";unit.textContent=field.unit;valBox.append(num,unit);top.append(lab,valBox);const range=document.createElement("input");range.type="range";range.min=field.min;range.max=field.max;range.step=field.step;range.value=values[field.key];range.setAttribute("aria-label",field.label);const change=(value)=>{if(!Number.isFinite(Number(value)))return;const v=Math.min(field.max,Math.max(field.min,Number(value)));values[field.key]=v;range.value=v;num.value=v;store();};range.addEventListener("input",()=>change(range.value));num.addEventListener("change",()=>change(num.value));wrap.append(top,range);section.append(wrap);}root.append(section)}}

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
 const npcFacing=document.getElementById("npc-facing"),npcScale=document.getElementById("npc-scale");
 const npcEnabled=document.getElementById("npc-enabled"),npcSpeed=document.getElementById("npc-speed"),npcIdle=document.getElementById("npc-idle");
 const npcStatus=document.getElementById("npc-map-status");
 const npcImages={};
 const npcMaps={};
 const npcFaces=["down","left","right","up"];
 const npcKey=(id,key)=>"npc."+id+"."+key;
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
    image.src="/assets/npc/"+n.id+".webp";npcImages[n.id]=image;
   }
  }
  npcUpdateControls();npcRender();
 }
 function npcUpdateControls(){
  const id=npcActiveId,[xKey,yKey]=npcKeysForMode();
  npcX.value=values[npcKey(id,xKey)];npcY.value=values[npcKey(id,yKey)];
  npcFacing.value=values[npcKey(id,"facing")];npcScale.value=values[npcKey(id,"scale")];
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
   const selected=id===npcActiveId,scale=values[npcKey(id,"scale")],img=npcImages[id],face=values[npcKey(id,"facing")];
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
 npcEnabled.addEventListener("change",()=>{npcSetValue(npcKey(npcActiveId,"enabled"),npcEnabled.checked?1:0);npcRender();store();});
 document.getElementById("npc-save").addEventListener("click",async()=>{
  const button=document.getElementById("npc-save");button.disabled=true;
  npcStatus.textContent="Saving NPC settings to Cloudflare…";
  try{const ok=await push(true);npcStatus.textContent=ok?"✓ Saved and verified all NPC settings.":"Save failed; see error above.";}
  finally{button.disabled=false;}
 });
 document.getElementById("npc-reload").addEventListener("click",async()=>{
  try{
   const response=await fetch("/api/settings?fresh="+Date.now(),{cache:"no-store"});
   if(!response.ok)throw Error("HTTP "+response.status);
   const data=await response.json();values=normalize({...defaults,...data.settings});
   lastPersisted=JSON.stringify(values);revision=Number(data.revision)||0;
   draw();drawParking();npcSetScene();notice.textContent="Reloaded configuration from server.";npcStatus.textContent="Reloaded NPC positions from server.";
  }catch(error){npcStatus.textContent="Reload failed: "+error.message;}
 });
 document.getElementById("npc-reset").addEventListener("click",()=>{
  if(!confirm("Reset "+npcSelection().name+" to its default placement, size, home and waypoints?"))return;
  for(const key of Object.keys(defaults))if(key.startsWith("npc."+npcActiveId+"."))values[key]=defaults[key];
  npcUpdateControls();npcRender();store();
 });
 npcSetScene();

 document.getElementById("defaults").onclick=()=>{if(!confirm("Restore all default game settings?"))return;values=normalize(defaults);store();draw();drawParking();npcSetScene()};
 document.getElementById("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(values,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="maestroescape-settings.json";a.click();URL.revokeObjectURL(url);};
 document.getElementById("local-import").onclick=()=>{if(!Object.keys(saved).length){notice.textContent="No older settings found on this device.";return;}if(!confirm("Replace shared settings using values saved on this device?"))return;values=normalize({...defaults,...saved});store();draw();drawParking();npcSetScene();};
 const file=document.getElementById("file");document.getElementById("import").onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Invalid file");values=normalize({...defaults,...data});store();draw();drawParking();npcSetScene();}catch{notice.textContent="Unable to import: invalid settings JSON."}file.value="";};
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
<div id="hud"><span id="status">Loading original game assets…</span><span id="coords"></span><span id="sync-status" role="status">☁ Connecting…</span><button id="reset">Respawn</button><a class="settings-nav" href="/settings">⚙ Settings</a></div></header>
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
   for(const {id,model,sprite} of registeredVehicles()){
     if(model.driver||Math.abs(model.speed)>0.1)continue;
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

// Phase 2: deterministic local NPC behavior; no purchases, multiplayer authority or task grants.
// NPC sheets in Assets/NPCs are 4x4 frames (48x60): down,left,right,up; 4 frames each.
const NPC_DEFINITIONS=[{"id":"maestro_bartender","name":"Bartender","interior":"pub","role":"worker","x":413,"y":210,"face":"down","scale":2},{"id":"maestro_regular_1","name":"Pub Regular 1","interior":"pub","role":"civilian","x":342,"y":511,"face":"left","scale":2},{"id":"maestro_regular_2","name":"Pub Regular 2","interior":"pub","role":"civilian","x":648,"y":707,"face":"right","scale":2},{"id":"maestro_regular_3","name":"Pub Regular 3","interior":"pub","role":"civilian","x":1043,"y":774,"face":"up","scale":2},{"id":"spar_cashier","name":"SPAR Cashier","interior":"spar","role":"worker","x":478,"y":224,"face":"down","scale":0.99},{"id":"spar_shopper_1","name":"Shopper 1","interior":"spar","role":"civilian","x":233,"y":249,"face":"right","scale":0.99},{"id":"spar_shopper_2","name":"Shopper 2","interior":"spar","role":"civilian","x":636,"y":243,"face":"left","scale":0.99},{"id":"tobacco_cashier","name":"Tobacco Cashier","interior":"dohanybolt","role":"worker","x":519,"y":416,"face":"down","scale":0.89},{"id":"gyros_employee","name":"Gyros Employee","interior":"gyros","role":"worker","x":294,"y":291,"face":"down","scale":1.12}];
const NPC_FACING={down:0,left:4,right:8,up:12};
const npcEntities=new Map();

const NPC_CONFIG_IDS=["maestro_bartender","maestro_regular_1","maestro_regular_2","maestro_regular_3","spar_cashier","spar_shopper_1","spar_shopper_2","tobacco_cashier","gyros_employee"];
const NPC_SCENE_IDS={"maestro_bartender":"pub","maestro_regular_1":"pub","maestro_regular_2":"pub","maestro_regular_3":"pub","spar_cashier":"spar","spar_shopper_1":"spar","spar_shopper_2":"spar","tobacco_cashier":"dohanybolt","gyros_employee":"gyros"};
const NPC_DIRECTIONS=["down","left","right","up"];
function npcConfig(id,key){return cfg("npc."+id+"."+key)}
function npcCurrentEnabled(id){return npcConfig(id,"enabled")!==0}
function npcRefreshSettings(){
 if(!npcEntities.size)return;
 for(const entity of npcEntities.values()){
  const id=entity.definition.id,selectedFace=NPC_DIRECTIONS[Math.round(npcConfig(id,"facing"))]||"down";
  entity.x=npcConfig(id,"x");entity.y=npcConfig(id,"y");
  entity.home={x:npcConfig(id,"homeX"),y:npcConfig(id,"homeY")};
  entity.initialFacing=selectedFace;
  entity.routeIndex=0;entity.target=null;entity.stateClock=0;
  entity.sprite.setScale(npcConfig(id,"scale")*(entity.loaded?1:.60));
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
const NPC_WORK_MS={maestro_bartender:2600,spar_cashier:2100,tobacco_cashier:2800,gyros_employee:1850};
// NPCs use a narrow feet-only collision footprint so staff can stand beside shelves and counters.
const NPC_STEP_RADIUS=7;
function npcFloorPassable(interior,x,y){
 const area=interior==="pub"?INTERIOR_SIZE:SHOPS[interior]?.size;
 const walls=interior==="pub"?interiorWalls:SHOPS[interior]?.walls;
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
 maestro_bartender:{x:0,y:188},
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
function npcInteriorKey(){return !insidePub?null:(activeShop?Object.keys(SHOPS).find(id=>SHOPS[id]===activeShop):"pub");}
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
  const sprite=loaded?scene.add.sprite(def.x,def.y,key,NPC_FACING[def.face]):
    scene.add.sprite(def.x,def.y,"maestro",0);
  // Sprite feet anchored at world location, consistent with the player.
  sprite.setOrigin(.5,1).setScale(loaded?def.scale:def.scale*.60)
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
  sprite.setScale(npcConfig(def.id,"scale")*(loaded?1:.60));
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
const bikeSprites=[],bikeControllers=[];
function registeredVehicles(){return [{id:"skoda",model:car,sprite:carSprite,controller:vehicleController,label:"Skoda Superb 2.0TDI"},{id:"octavia",model:octavia,sprite:octaviaSprite,controller:octaviaController,label:"Octavia Checkengine"},...bikes.map((model,i)=>({id:model.id,model,sprite:bikeSprites[i],controller:bikeControllers[i],label:"Bubi Bike "+(i+1)}))];}
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
let riderSprite=null;
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

// Phase 3: interaction UI. Only dialogue is currently a real gameplay action.
// Purchases / item grants require an authoritative inventory + task system (TODO).
const NPC_DIALOGUES={
 maestro_bartender:{intro:"Welcome to Maestro. What can I get you?",talk:["Welcome in. The evening is just getting started.","Take your time, there's plenty of room at the bar."],
 actions:[["beer","Order beer"],["refill","Request refill"]]},
 maestro_regular_1:{intro:"He looks up from his drink.",talk:["Been here all evening. You know how it goes.","The tram's never on time when you need it."],
 actions:[["borrow","Borrow a cigarette"]]},
 maestro_regular_2:{intro:"He seems ready for a chat.",talk:["Another round, another story.","Don't forget where you parked."],
 actions:[["borrow","Borrow a cigarette"]]},
 maestro_regular_3:{intro:"He waves from his seat.",talk:["You heading somewhere?","There's always something happening here."],
 actions:[["borrow","Borrow a cigarette"]]},
 spar_cashier:{intro:"Welcome to SPAR.",talk:["The checkout is open.","Anything else for you?"],
 actions:[["shop","Browse / buy goods"]]},
 spar_shopper_1:{intro:"Someone is browsing the shelves.",talk:["I'm just looking, thanks.","It gets busy in here around closing time."],actions:[]},
 spar_shopper_2:{intro:"A customer turns to you.",talk:["Can't decide what to buy.","I think I forgot my shopping list."],actions:[]},
 tobacco_cashier:{intro:"The cashier waits behind the counter.",talk:["Good evening.","What can I help you with?"],actions:[["cigarettes","Buy cigarettes"]]},
 gyros_employee:{intro:"The grill is hot and the counter is busy.",talk:["Fresh gyros coming up.","One moment, we're preparing another batch."],
 actions:[["kebab","Order kebab"],["collect","Collect kebab"]]}
};
const NPC_ACTION_UNAVAILABLE={
 beer:"Beer ordering and inventory are not implemented yet.",
 refill:"Refill requires a purchased beer and the drinking mechanic.",
 borrow:"Cigarette stock, borrowing and inventory are not implemented yet.",
 shop:"Product inventory, pricing and payment are not implemented yet.",
 cigarettes:"Cigarette inventory, age checks and purchases are not implemented yet.",
 kebab:"Kebab ordering and preparation timer are not implemented yet.",
 collect:"Collection requires a real prepared order; none exists yet."
};
let npcDialogue=null,npcActionAt=0,npcTalkCount=0;
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
 const point=activeShop?activeShop.exit:INTERIOR_EXIT;
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
 for(const [action,label] of script.actions)add(label,action,NPC_ACTION_UNAVAILABLE[action]);
 npcModal.hidden=false;
 npcPrompt.hidden=true;
 npcActionAt=performance.now();
}
function npcChooseAction(entity,action){
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
 // TODO: connect to authoritative inventory, stock, timers and consumable actions.
 npcMessage.textContent=NPC_ACTION_UNAVAILABLE[action]||"This action is unavailable.";
}
function npcUpdatePrompt(){
 if(npcDialogue){npcPrompt.hidden=true;return;}
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
  if((activeShop?activeShop.walls:interiorWalls).some(([bx,by,bw,bh])=>x+w>bx&&x-w<bx+bw&&y+h>by&&y-h<by+bh))return true;
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
function enterShop(shop){
 npcCloseDialogue();
 if(!shop.image){show(shop.label+" map is loading. Please try again.");return;}
 if(activeVehicle){show("Exit the vehicle first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;activeShop=shop;
 character.setScale(shopCharacterScale(shop));mapSize={...shop.size};
 streetImage.setVisible(false);showInteriorNPCs(npcInteriorKey());if(interiorImage)interiorImage.setVisible(false);
 for(const other of Object.values(SHOPS))if(other.image)other.image.setVisible(other===shop);
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 for(const sprite of bikeSprites)sprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 player.x=shop.spawn.x;player.y=shop.spawn.y;character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,shop.size.w,shop.size.h);scene.cameras.main.setZoom(shopZoom(shop));
 status.textContent="Inside "+shop.label;
 show("Inside "+shop.label+". Press E near the entrance to exit.");
}
function enterPub(){
 npcCloseDialogue();
 if(!interiorImage){show("Interior map could not be loaded.");return;}
 if(activeVehicle){show("Exit the vehicle first.");return;}
 streetPos={x:player.x,y:player.y};insidePub=true;activeShop=null;
 character.setScale(cfg("building.pub.scale"));
 mapSize={...INTERIOR_SIZE};
 streetImage.setVisible(false);setStreetfronts(false);interiorImage.setVisible(true);showInteriorNPCs("pub");
 if(carSprite)carSprite.setVisible(false);
 if(octaviaSprite)octaviaSprite.setVisible(false);
 for(const sprite of bikeSprites)sprite.setVisible(false);
 if(tramSprite)tramSprite.setVisible(false);
 player.x=INTERIOR_SPAWN.x;player.y=INTERIOR_SPAWN.y;
 character.setPosition(player.x,player.y);
 scene.cameras.main.setBounds(0,0,INTERIOR_SIZE.w,INTERIOR_SIZE.h);
 scene.cameras.main.setZoom(cfg("building.pub.zoom"));
 status.textContent="Inside Maestro Pub";
 show("You're inside! Walk around. Press E near the bottom-left exit to leave.");
}
function leavePub(){
 npcCloseDialogue();
 insidePub=false;activeShop=null;character.setScale(cfg("character.streetScale"));mapSize={w:1600,h:992};
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
 scene.cameras.main.setZoom(cfg("camera.streetZoom"));
 status.textContent="Outside Maestro Pub";
 show("Back on Mester utca.");
}
function enterOrExitCar(){
 if(!activeVehicle){
  const choice=registeredVehicles().filter(v=>v.sprite).sort((a,b)=>Math.hypot(player.x-a.model.x,player.y-a.model.y)-Math.hypot(player.x-b.model.x,player.y-b.model.y))[0];
  if(!choice||!near(player,choice.model.x,choice.model.y,cfg("game.vehicleRadius"))){show("Move closer to a car or Bubi bike.");return;}
  activeVehicle=choice.model;choice.model.driver=true;choice.model.speed=0;choice.model.wheelTurn=0;character.setVisible(false);
  if(choice.model.type==="bike"){
    // Hide the empty bicycle only while the combined rider+bike sprite is visible.
    if(riderSprite){choice.sprite.setVisible(false);riderSprite.anims.stop();riderSprite.setFrame(0);updateBikeRider(choice.model,false);}
    else choice.sprite.setVisible(true);
  }else if(riderSprite){riderSprite.anims.stop();riderSprite.setVisible(false);}
  scene.cameras.main.startFollow(choice.sprite,true,.13,.13);status.textContent="Riding: "+choice.label;
  show(choice.label+" · W pedal/accelerate · S brake · A/D steer · E dismount.");
 }else{
  const vehicle=activeVehicle;
  const offsets=vehicle.type==="bike"?[[22,0],[-22,0],[0,24],[0,-24],[25,25]]:[[41,0],[-41,0],[0,43],[0,-43],[40,35],[-40,35]];
  const pos=offsets.map(([x,y])=>({x:vehicle.x+x,y:vehicle.y+y})).find(p=>!intersects(p.x,p.y));
  if(!pos){show("No safe dismount location. Move farther.");return;}
  vehicle.driver=false;vehicle.speed=0;vehicle.wheelTurn=0;activeVehicle=null;
  if(riderSprite){riderSprite.anims.stop();riderSprite.setVisible(false);}
  if(vehicle.type==="bike"){const parked=bikeSprites[bikes.indexOf(vehicle)];if(parked)parked.setVisible(true);}
  player.x=pos.x;player.y=pos.y;character.setPosition(player.x,player.y).setVisible(true);
  scene.cameras.main.startFollow(character,true,.13,.13);status.textContent="On foot";show("Dismounted.");
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
 if(npcDialogue){npcCloseDialogue();return;}
 if(insidePub){
  const nearest=npcNearestTarget();
  if(nearest&&npcInteractionDistance(nearest)<npcExitDistance()
     &&npcExitDistance()>=70){npcOpenDialogue(nearest);return;}
  const exit=activeShop?activeShop.exit:INTERIOR_EXIT;
  if(near(player,exit.x,exit.y,96))leavePub();
  else show("Return to the entrance and press E to exit.");
  return;
 }
 if(activeVehicle || registeredVehicles().some(v=>v.sprite&&near(player,v.model.x,v.model.y,cfg("game.vehicleRadius")))){enterOrExitCar();return;}
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
   for(const def of NPC_DEFINITIONS)this.load.spritesheet("npc_"+def.id,"/assets/npc/"+def.id+".webp",{frameWidth:48,frameHeight:60});
   this.load.spritesheet("maestro","https://cdn.jsdelivr.net/gh/adamkerekhu/MaestroEscape@main/Assets/Characters/maestro_walk.webp",{frameWidth:80,frameHeight:120});
   this.load.image("skoda","/assets/skoda-highres.webp");
   this.load.image("octavia","/assets/octavia.webp");
   this.load.image("bubi","/assets/bubi.webp");
   this.load.spritesheet("bubi-rider","/assets/bubi-rider.webp",{frameWidth:112,frameHeight:224});
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
   for(const [dir,start] of [["down",0],["up",8],["right",16],["left",24]])this.anims.create({key:"walk-"+dir,frames:this.anims.generateFrameNumbers("maestro",{start,end:start+7}),frameRate:cfg("character.animationFps"),repeat:-1});
   keys=this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SHIFT,R");
   this.input.keyboard.on("keydown-E",event=>{if(!event.repeat)interact();});
   this.input.keyboard.on("keydown-R",()=>{npcCloseDialogue();this.respawn();});
   this.cameras.main.setBounds(0,0,mapSize.w,mapSize.h);
   this.cameras.main.startFollow(character,true,0.13,0.13);
   this.cameras.main.setZoom(cfg("camera.streetZoom"));
   this.input.mouse?.disableContextMenu();
   loadOriginalCollision().then(()=>this.respawn());
 }
 respawn(){
   let x=SPAWN.x,y=SPAWN.y;
   showInteriorNPCs(npcInteriorKey());
   if(activeVehicle){activeVehicle.driver=false;activeVehicle.speed=0;activeVehicle.wheelTurn=0;activeVehicle=null;character.setVisible(true);this.cameras.main.startFollow(character,true,0.13,0.13);}
   if(riderSprite){riderSprite.anims.stop();riderSprite.setVisible(false);}
   for(const sprite of bikeSprites)if(sprite)sprite.setVisible(true);
   car.x=cfg("vehicle.skoda.spawnX");car.y=cfg("vehicle.skoda.spawnY");car.frame=3;car.angle=cfg("vehicle.skoda.angle")*Math.PI/180;car.speed=0;car.wheelTurn=0;
   octavia.x=cfg("vehicle.octavia.spawnX");octavia.y=cfg("vehicle.octavia.spawnY");octavia.angle=cfg("vehicle.octavia.angle")*Math.PI/180;octavia.speed=0;octavia.wheelTurn=0;
   bikes.forEach((bike,i)=>{bike.x=cfg("vehicle."+bike.id+".spawnX");bike.y=cfg("vehicle."+bike.id+".spawnY");bike.angle=cfg("vehicle."+bike.id+".angle")*Math.PI/180;bike.speed=0;bike.wheelTurn=0;bikeSprites[i]?.setPosition(bike.x,bike.y).setRotation(bike.angle);});
   if(octaviaSprite)octaviaSprite.setPosition(octavia.x,octavia.y).setRotation(octavia.angle);
   if(carSprite)carSprite.setPosition(car.x,car.y).setRotation(car.angle);
   if(intersects(x,y)){for(let radius=25;radius<=500;radius+=25){let found=false;for(let a=0;a<Math.PI*2;a+=Math.PI/8){let px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius;if(!intersects(px,py)){x=px;y=py;found=true;break}}if(found)break;}}
   player.x=x;player.y=y;character.setPosition(x,y);show("Spawned on a walkable point. Explore the original map.");
 }
 update(time,delta){
   if(!character||!keys)return;
   npcUpdatePrompt();
   if(!npcDialogue)npcTick(delta);
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
   if(npcDialogue)return; // Keep character and vehicles still while an action menu is open.
   let dx=Number(keys.D.isDown||keys.RIGHT.isDown)-Number(keys.A.isDown||keys.LEFT.isDown)+touchInput.x;
   let dy=Number(keys.S.isDown||keys.DOWN.isDown)-Number(keys.W.isDown||keys.UP.isDown)+touchInput.y;
   const distance=Math.hypot(dx,dy);
   if(activeVehicle){
     const active=registeredVehicles().find(v=>v.model===activeVehicle);
     const sprite=active?.sprite;
     const controller=active?.controller;
     if(sprite&&controller){
       controller.update(dx,dy,Math.min(.04,delta/1000));
       sprite.setPosition(activeVehicle.x,activeVehicle.y).setRotation(activeVehicle.angle);
       if(activeVehicle.type==="bike"){
         // W / up-arrow / joystick forward pedals; idle frame is shown while coasting.
         updateBikeRider(activeVehicle,dy < -.12);
       }else if(riderSprite)riderSprite.setVisible(false);
       coords.textContent=(activeVehicle.type==="bike"?"🚲 ":"🚗 ")+Math.round(activeVehicle.x)+", "+Math.round(activeVehicle.y)+" · "+Math.round(Math.abs(activeVehicle.speed))+" px/s";
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
     // Validate stable per-NPC scene and numeric coordinates against schema bounds.
     const currentRevision=await this.ctx.storage.get("revision")||0;
     const requestedRevision=request.headers.get("X-Settings-Revision");
     if(requestedRevision!==null&&Number(requestedRevision)!==currentRevision)
       return Response.json({error:"Settings changed on another device",revision:currentRevision},{status:409,headers:{"cache-control":"no-store"}});
     const revision=currentRevision+1;
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
  if(url.pathname==="/assets/bubi-rider.webp"){
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/bubi_rider_4frames.webp");
    if(!upstream.ok)return new Response("Riding sprites unavailable",{status:502});
    return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});
  }
  if(url.pathname==="/assets/bubi.webp"){const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/Vehicles/bubi_bike.webp");if(!upstream.ok)return new Response("Bubi asset unavailable",{status:502});return new Response(upstream.body,{headers:{"content-type":"image/webp","cache-control":"public, max-age=300"}});}
  if(/^\/assets\/npc\/[a-z0-9_]+\.webp$/.test(url.pathname)){
    const id=url.pathname.slice("/assets/npc/".length,-5);
    if(!NPC_DEFINITIONS.some(n=>n.id===id))return new Response("Unknown NPC",{status:404});
    const upstream=await fetch("https://raw.githubusercontent.com/adamkerekhu/MaestroEscape/main/Assets/NPCs/"+id+".webp");
    if(!upstream.ok)return new Response("NPC asset unavailable",{status:502});
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
