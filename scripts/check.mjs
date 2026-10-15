import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ChipStackScene} from '../assets/starter/chip-stack.js';
import {projectPoint} from '../assets/starter/geometry.js';

for (const directory of ['scripts','assets/starter']) {
  for (const name of readdirSync(directory).filter(name => name.endsWith('.js') || name.endsWith('.mjs'))) {
    execFileSync(process.execPath,['--check',`${directory}/${name}`]);
  }
}
for (const source of ['SKILL.md','README.md','references/ui-anatomy.md','references/chip-layers.md']) {
  const text = readFileSync(source,'utf8');
  for (const match of text.matchAll(/\]\(([^)#]+)\)/g)) {
    if (match[1].startsWith('http')) continue;
    const base = source.includes('/') ? source.slice(0,source.lastIndexOf('/')+1) : '';
    assert.ok(existsSync(base+match[1]),`Missing reference: ${match[1]}`);
  }
}
const view={width:600,height:400,yaw:0,scale:100};
assert.deepEqual(projectPoint(1,0,0,view),[376,256]);
assert.deepEqual(projectPoint(0,1,0,view),[276,194]);
assert.deepEqual(projectPoint(0,0,1,view),[276,294]);
const rotated=projectPoint(1,0,0,{...view,yaw:Math.PI/2});
assert.ok(Math.abs(rotated[0]-276)<1e-9 && Math.abs(rotated[1]-294)<1e-9);

const keys=['matchMedia','ResizeObserver','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame','document','devicePixelRatio'];
const previous=new Map(keys.map(key => [key,globalThis[key]]));
const callbacks=new Map();
let visibility, preference, nextFrame=0, disconnected=0, drawingOperations=0;
try {
  globalThis.document=new EventTarget();document.hidden=false;
  globalThis.devicePixelRatio=3;
  globalThis.matchMedia=() => ({matches:true,addEventListener:(_,callback)=>{preference=callback;},removeEventListener:()=>{preference=null;}});
  globalThis.ResizeObserver=class {observe(){} disconnect(){disconnected++;}};
  globalThis.IntersectionObserver=class {constructor(callback){visibility=callback;}observe(){}disconnect(){disconnected++;}};
  globalThis.requestAnimationFrame=callback => {callbacks.set(++nextFrame,callback);return nextFrame;};
  globalThis.cancelAnimationFrame=id => callbacks.delete(id);
  const handlers=new Map();
  const context={};
  for (const method of ['setTransform','clearRect','beginPath','moveTo','lineTo','stroke','closePath','fill','arc','fillText','save','translate','rotate','restore']) {
    context[method]=(...args) => {assert.ok(args.filter(value=>typeof value==='number').every(Number.isFinite),`Non-finite ${method}`);drawingOperations++;};
  }
  const canvas={clientWidth:580,clientHeight:395,width:0,height:0,getContext:()=>context,addEventListener:(name,callback)=>handlers.set(name,callback),removeEventListener:name=>handlers.delete(name),setPointerCapture:()=>{}};
  const layers=[{label:'COMPUTE',color:'#a4c7b2'},{label:'TOOLS',color:'#9ec6c2'},{label:'POLICY',color:'#d7ad83'}];
  const scene=new ChipStackScene(canvas,{layers});
  assert.equal(scene.paused,true,'Reduced motion starts paused');
  assert.equal(callbacks.size,0);assert.equal(canvas.width,1160,'DPR capped at two');
  const pump=timestamp => {const [id,callback]=callbacks.entries().next().value;callbacks.delete(id);callback(timestamp);};
  scene.setPaused(false);pump(100);pump(116);assert.equal(scene.time,16);
  scene.setPaused(true);const frozen=scene.time;
  visibility([{isIntersecting:false}]);visibility([{isIntersecting:true}]);
  assert.equal(callbacks.size,0,'Restoring visibility preserves explicit Pause');
  scene.setLayer(2);handlers.get('pointerdown')({clientX:0,pointerId:1});handlers.get('pointermove')({clientX:30});handlers.get('pointerup')();
  assert.equal(callbacks.size,0,'Selection and drag preserve Pause');
  scene.setPaused(false);pump(10000);assert.equal(scene.time,frozen,'Resume has no elapsed-time jump');
  document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(callbacks.size,0);
  document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(callbacks.size,1);
  preference({matches:true});assert.equal(scene.paused,true);assert.equal(callbacks.size,0);
  assert.throws(()=>scene.setLayer(-1),RangeError);
  assert.throws(()=>new ChipStackScene(canvas,{layers:[{label:'BAD',color:'green'}]}),TypeError);
  assert.ok(drawingOperations>1000,'Actual drawing path exercised');
  scene.setPaused(false);scene.destroy();assert.equal(callbacks.size,0);assert.equal(handlers.size,0);assert.equal(disconnected,2);
  scene.refresh();assert.equal(callbacks.size,0,'Disposed scenes cannot restart');
} finally {
  for (const key of keys) {if(previous.get(key)===undefined)delete globalThis[key];else globalThis[key]=previous.get(key);}
}
assert.equal(existsSync('.github/workflows'),false);
console.log(JSON.stringify({status:'passed',syntax:'passed',references:'passed',projection:'passed',drawing:'finite',reduced_motion:'passed',pause_restore:'passed',resume_clock:'continuous',cleanup:'passed'}));
