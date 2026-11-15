import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
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
test("selection uses authoritative inventory consumable action",()=>{
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/MaestroInventoryController/);
 assert.ok(CONSUMABLE_CLIENT_SCRIPT.includes('itemCommand("equip",item)'));
 assert.match(INVENTORY_WHEEL_SCRIPT,/ctl\(\)\?\.use\?\.\(item\)/);
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/if\(window\.MaestroInventoryWheel\)window\.MaestroInventoryWheel\.toggle\(\)/);
});

test("drinking, eating and smoking each complete the item in one go",()=>{
 const source=readFileSync(new URL("../src/consumables.js",import.meta.url),"utf8");
 assert.match(source,/beer:\{units:1,unitMs:1500\},kebab:\{units:1,unitMs:2000\}/);
 assert.match(source,/cigarette:\{units:1,unitMs:1500\}/);
 assert.match(source,/i\.remainingUnits=0;i\.revision\+\+;p\.action=null/);
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/Drink entire beer/);
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/Eat entire kebab/);
 assert.match(CONSUMABLE_CLIENT_SCRIPT,/Smoke entire cigarette/);
});

test("five of each item type are allowed but the sixth is blocked",()=>{
 const source=readFileSync(new URL("../src/consumables.js",import.meta.url),"utf8");
 assert.match(source,/maxPerItem:5/);
 assert.match(source,/inventory\.filter\(i=>i\.type===type\)\.length>=C\.maxPerItem/);
 assert.match(source,/Array\.from\(\{length:40\}/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/const stacks=new Map\(\)/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/stack\.stackCount\+\+/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/stack\.stackItems\[0\]/);
 assert.match(INVENTORY_WHEEL_SCRIPT,/item\.stackCount>1/);
});
