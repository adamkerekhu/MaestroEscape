import test from 'node:test';
import assert from 'node:assert/strict';
import { PUB_MENU, PUB_TABLES } from '../src/pub-menu-data.js';
test('published menu size and table identities',()=>{
 assert.equal(PUB_MENU.categories.length,10);
 assert.equal(PUB_MENU.categories.reduce((n,c)=>n+c.items.length,0),85);
 assert.equal(PUB_MENU.categories.reduce((n,c)=>n+c.items.reduce((s,i)=>s+i.sizes.length,0),0),153);
 assert.deepEqual(PUB_TABLES.map(x=>x.id),['pub_left','pub_middle','pub_right','pub_upper']);
});
const get=(name)=>PUB_MENU.categories.flatMap(c=>c.items).find(i=>i.name===name);
test('published size and price fidelity',()=>{
 assert.deepEqual(get('Dreher Gold').sizes.map(s=>s.price_huf),[1350,1950]);
 assert.equal(get('Jägermeister').sizes.find(s=>s.label==='4 cl').price_huf,2000);
 assert.deepEqual(get('Asahi Superdry').sizes.map(s=>s.label),['0.33 L']);
 assert.deepEqual(get('Liefmans Fruitesse (4.2%)').sizes.map(s=>s.label),['0.25 L']);
 const subtotal=1350+1950,fee=Math.floor((subtotal*12+50)/100);
 assert.equal(subtotal,3300);assert.equal(fee,396);assert.equal(subtotal+fee,3696);
});
test('catalog IDs are stable and unique',()=>{
 const items=PUB_MENU.categories.flatMap(c=>c.items), ids=items.map(i=>i.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(new Set(items.flatMap(i=>i.sizes.map(s=>i.id+'|'+s.label))).size,153);
});
