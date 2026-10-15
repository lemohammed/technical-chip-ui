import {ChipStackScene} from './chip-stack.js';

const layers = [
  {label:'HARDWARE',title:'Physical compute',color:'#a4c7b2',description:'Kernels, memory and data movement form the base. This is a conceptual layer, not a fabricated circuit.'},
  {label:'WEIGHTS',title:'Learned parameters',color:'#cbe8ae',description:'Model parameters carry what training has learned. Version the weights and their data lineage together.'},
  {label:'ARCHITECTURE',title:'Computational structure',color:'#c7ba95',description:'Operators, connections and tensor shapes determine the computation. Keep the structure distinct from its parameters.'},
  {label:'HARNESS',title:'Tools and execution',color:'#9ec6c2',description:'Context, tools and recovery shape how the model works on a task. A harness is software, represented here by a diagram layer.'},
  {label:'LAB',title:'The research process',color:'#d7ad83',description:'The lab proposes comparisons, records failures and chooses the next question. Independent evaluation stays outside the mutable system.'}
];
const canvas = document.querySelector('canvas');
const scene = new ChipStackScene(canvas, {layers});
const motion = document.querySelector('#motion');
const tabs = document.querySelector('#layers');
const buttons = layers.map((layer, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = `layer-${index}`;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', 'layer-panel');
  button.textContent = `${String(index + 1).padStart(2,'0')} / ${layer.label}`;
  button.addEventListener('click', () => select(index));
  button.addEventListener('keydown', event => {
    const keys = {ArrowRight:(index+1)%layers.length,ArrowLeft:(index+layers.length-1)%layers.length,Home:0,End:layers.length-1};
    if (!Object.hasOwn(keys,event.key)) return;
    event.preventDefault();
    select(keys[event.key]);
    buttons[keys[event.key]].focus();
  });
  tabs.append(button);
  return button;
});
function select(index) {
  scene.setLayer(index);
  buttons.forEach((button,i) => {button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
  document.querySelector('#layer-panel').setAttribute('aria-labelledby',buttons[index].id);
  document.querySelector('#layer-title').textContent = layers[index].title;
  document.querySelector('#layer-description').textContent = layers[index].description;
}
function syncMotion() {
  motion.textContent = scene.paused ? 'Play motion ▷' : 'Pause motion Ⅱ';
  motion.setAttribute('aria-pressed',String(!scene.paused));
}
scene.addEventListener('motionchange',syncMotion);
motion.addEventListener('click',() => scene.setPaused(!scene.paused));
syncMotion();
select(0);
window.addEventListener('pagehide',() => scene.setPaused(true));
