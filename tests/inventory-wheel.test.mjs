import test from "node:test";
import assert from "node:assert/strict";
import {INVENTORY_WHEEL_CSS,INVENTORY_WHEEL_SCRIPT} from "../src/inventory-wheel.js";
import {CONSUMABLE_CLIENT_SCRIPT} from "../src/consumables-client.js";
test("inventory wheel source parses as JavaScript",()=>{
 new Function(INVENTORY_WHEEL_SCRIPT);
 new Function(CONSUMABLE_CLIENT_SCRIPT);
});
test("Q is hold-to-open and release-to-select with mouse hover or click",()=>{
 assert.match(INVENTORY_WHEEL_SCRIPT,/e\.code!=="KeyQ"/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/document\.addEventListener\("keydown"/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/document\.addEventListener\("keyup"/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/if\(choice>=0\)void choose\(choice\);else close\(\)/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/btn\.onpointerenter=\(\)=>highlight\(i\)/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/btn\.onclick=event=>/);
});
test("mobile inventory button toggles open and closed above E",()=>{
 assert.match(INVENTORY_WHEEL_SCRIPT,/function toggle\(\)\{if\(visible\)close\(\);else open\("touch"\)\}/);
 assert.match(INVENTORY_WHEEL_CSS,/#pub-quick-inventory\{position:fixed;right:4%;bottom:calc\(8%/);
 assert.match(INVENTORY_WHEEL_CSS,/wheel-backdrop\{[^}]*pointer-events:none/);
 assert.match(INVENTORY_WHEEL_CSS,/#maestro-inventory-wheel\.open\{display:flex\}/);
});
test("selection delegates to authoritative inventory equip action",()=>{
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/MaestroInventoryController/);
 assert.ok(CONSUMABLE_CLIENT_SCRIPT.includes('itemCommand("equip",item)'));
 assert.match(INVENTORY_WHEEL_SCRIPT,/ctl\(\)\?\.equip\?\.\(item\)/);
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/if\(window\.MaestroInventoryWheel\)window\.MaestroInventoryWheel\.toggle\(\)/);
});
