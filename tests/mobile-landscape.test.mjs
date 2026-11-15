import test from "node:test";
import assert from "node:assert/strict";
import {MOBILE_LANDSCAPE_SCRIPT} from "../src/mobile-landscape.js";
import {readFileSync} from "node:fs";
const worker=readFileSync(new URL("../src/worker.js",import.meta.url),"utf8");
test("portrait touch devices rotate gameplay to landscape",()=>{
 new Function(MOBILE_LANDSCAPE_SCRIPT);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/@media \(pointer:coarse\) and \(orientation:portrait\)/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/transform:rotate\(90deg\)!important/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/width:100dvh!important;height:100vw!important/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/left:100vw!important/);
});
test("mobile orientation recalculates after rotation or resize",()=>{
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/addEventListener\("resize",update/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/addEventListener\("orientationchange",update/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/screen\?\.orientation\?\.addEventListener/);
 assert.match(MOBILE_LANDSCAPE_SCRIPT,/orientation\.lock\("landscape"\)/);
});
test("joystick transforms pointer to screen-local coordinates",()=>{
 assert.match(worker,/const turned=document\.body\.classList\.contains\("maestro-portrait-landscape"\)/);
 assert.match(worker,/turned\?event\.clientY-midY:event\.clientX-midX/);
 assert.match(worker,/turned\?-\(event\.clientX-midX\):event\.clientY-midY/);
});
test("worker loads mobile landscape controller",()=>{
 assert.match(worker,/assets\/mobile-landscape\.js/);
 assert.match(worker,/MOBILE_LANDSCAPE_SCRIPT/);
});
