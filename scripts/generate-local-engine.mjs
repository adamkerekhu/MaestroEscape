// Keep the browser-only game authority in sync with src/consumables.js.
// The generated module is served by the Worker as /assets/local-room.js.
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const root=new URL("../",import.meta.url);
const src=readFileSync(new URL("src/consumables.js",root),"utf8");
const generated="/* Generated from src/consumables.js. Local mode runs the same item and vehicle rules without Durable Objects. */\n"
 +"export const LOCAL_ROOM_SOURCE="+JSON.stringify(src)+";\n";
writeFileSync(fileURLToPath(new URL("src/local-room-source.js",root)),generated);
