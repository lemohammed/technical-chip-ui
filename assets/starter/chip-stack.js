import {projectPoint} from './geometry.js';

export class ChipStackScene extends EventTarget {
  constructor(canvas, {layers}) {
    super();
    if (!layers?.length || layers.some(layer => !layer.label || !/^#[0-9a-f]{6}$/i.test(layer.color))) {
      throw new TypeError('Supply labelled layers with six-digit hex colours.');
    }
    this.canvas = canvas;
    this.layers = layers.map(layer => ({...layer}));
    this.ctx = canvas.getContext('2d');
    this.layer = 0;
    this.angle = -.65;
    this.media = matchMedia('(prefers-reduced-motion: reduce)');
    this.paused = this.media.matches;
    this.visible = true;
    this.time = 0;
    this.lastFrame = null;
    this.frame = null;
    this.disposed = false;
    this.drag = null;
    this.handlers = {
      pointerdown: event => {
        this.drag = {x:event.clientX, angle:this.angle};
        canvas.setPointerCapture(event.pointerId);
      },
      pointermove: event => {
        if (!this.drag) return;
        this.angle = this.drag.angle + (event.clientX - this.drag.x) * .006;
        this.draw(this.time);
      },
      pointerup: () => { this.drag = null; },
      pointercancel: () => { this.drag = null; },
      lostpointercapture: () => { this.drag = null; }
    };
    for (const [name, handler] of Object.entries(this.handlers)) canvas.addEventListener(name, handler);
    this.resize = new ResizeObserver(() => this.draw(this.time));
    this.resize.observe(canvas);
    this.intersection = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      this.refresh();
    });
    this.intersection.observe(canvas);
    this.onVisibility = () => this.refresh();
    document.addEventListener('visibilitychange', this.onVisibility);
    this.onPreference = event => { if (event.matches) this.setPaused(true); };
    this.media.addEventListener('change', this.onPreference);
    this.refresh();
  }
  setLayer(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.layers.length) throw new RangeError('Unknown layer.');
    this.layer = index;
    this.draw(this.time);
  }
  setPaused(paused) {
    this.paused = Boolean(paused);
    this.refresh();
    this.dispatchEvent(new Event('motionchange'));
  }
  canAnimate() { return !this.disposed && this.visible && !document.hidden && !this.paused; }
  refresh() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastFrame = null;
    if (this.disposed) return;
    this.draw(this.time);
    if (this.canAnimate()) this.frame = requestAnimationFrame(time => this.tick(time));
  }
  tick(timestamp) {
    this.frame = null;
    if (!this.canAnimate()) return;
    if (this.lastFrame !== null) this.time += Math.min(64, Math.max(0, timestamp - this.lastFrame));
    this.lastFrame = timestamp;
    this.draw(this.time);
    if (this.canAnimate()) this.frame = requestAnimationFrame(time => this.tick(time));
  }
  destroy() {
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.resize.disconnect();
    this.intersection.disconnect();
    this.media.removeEventListener('change', this.onPreference);
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const [name, handler] of Object.entries(this.handlers)) this.canvas.removeEventListener(name, handler);
  }
  draw(time){
    const {canvas,ctx}=this;if(!ctx)return;
    const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    if(!width||!height)return;
    if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const scale=Math.min(width*.235,height*.34),yaw=this.angle+Math.sin(time*.00012)*.035;
    const project=(x,y,z)=>projectPoint(x,y,z,{width,height,yaw,scale});
    const line=(points,color,lineWidth=1)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();};
    const poly=(points,fill,stroke)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();};
    ctx.fillStyle='#819c7522';
    for(let x=18;x<width;x+=21)for(let y=12;y<height;y+=21){ctx.beginPath();ctx.arc(x,y,.65,0,Math.PI*2);ctx.fill();}
    const floor=[[-1.25,-.18,-1.25],[1.25,-.18,-1.25],[1.25,-.18,1.25],[-1.25,-.18,1.25]].map(p=>project(...p));line([...floor,floor[0]],'#42533a66');
    for(const [x,z] of [[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]])line([project(x,0,z),project(x,2.58,z)],'#abc68a40');
    const annotations=[];
    for(let layer=0;layer<this.layers.length;layer++){
      const y=this.layers.length===1?1.14:layer*2.28/(this.layers.length-1),selected=layer===this.layer,color=this.layers[layer].color,extent=1.02-(this.layers.length===1?0:layer/(this.layers.length-1))*.14;
      const points=[[-extent,y,-extent],[extent,y,-extent],[extent,y,extent],[-extent,y,extent]].map(p=>project(...p));
      poly(points,selected?'#385334ed':'#1b3029ec',selected?color:'#60745699');
      const bottom=points.map(p=>[p[0],p[1]+6]);poly([points[2],points[3],bottom[3],bottom[2]],'#101e18',selected?`${color}88`:'#41543d');
      for(let j=-3;j<=3;j++){
        const q=j*.22;
        line([project(-extent,y,q),project(-.45,y,q),project(-.29,y,q+.11),project(.29,y,q+.11),project(.45,y,q),project(extent,y,q)],`${color}${selected?'64':'28'}`,.8);
        line([project(q,y,-extent),project(q,y,-.38),project(q+.12,y,-.22)],`${color}${selected?'70':'35'}`,.8);
      }
      const chip=[[-.3,y,-.3],[.3,y,-.3],[.3,y,.3],[-.3,y,.3]].map(p=>project(...p));poly(chip,selected?'#cbe8ae':'#293e2f',selected?'#edf9d9':'#97af7b99');
      for(let j=-2;j<=2;j++){
        line([project(j*.09,y,-.25),project(j*.09,y,.25)],selected?'#44613c':'#a8c18c55',.65);
        line([project(-.25,y,j*.09),project(.25,y,j*.09)],selected?'#44613c':'#a8c18c55',.65);
      }
      for(let j=0;j<4;j++){
        const phase=((time*.00013+j*.24+layer*.12)%1),x=-extent+phase*extent*2,z=(j-1.5)*.22;
        const p=project(x,y,z);ctx.fillStyle=selected?'#efffcd':`${color}aa`;ctx.beginPath();ctx.arc(...p,selected?2:1.4,0,Math.PI*2);ctx.fill();
      }
      const anchor=project(extent,y,-extent*.55),end=[Math.min(width-78,anchor[0]+42),anchor[1]-7];
      annotations.push({anchor,end,selected,color,label:this.layers[layer].label});
    }
    for(const {anchor,end,selected,color,label} of annotations){
      line([anchor,[end[0]-9,end[1]],end],selected?color:'#75876880',.7);
      ctx.fillStyle=selected?color:'#a2b69a';ctx.font=`${selected?'600 ':''}${width<400?8:9}px monospace`;ctx.fillText(label,end[0]+5,end[1]+3);
    }
    const mid=project(-1.22,1.13,.8);ctx.save();ctx.translate(mid[0]-18,mid[1]);ctx.rotate(-Math.PI/2);ctx.font='8px monospace';ctx.fillStyle='#8fa37c';ctx.fillText('CONNECTED LAYERS / SELECT TO EXPLORE',-105,0);ctx.restore();
    ctx.font='8px monospace';ctx.fillStyle='#8fa37c';ctx.fillText('CONCEPTUAL SYSTEM',20,height-16);ctx.textAlign='right';ctx.fillText('DRAG TO ROTATE',width-20,height-16);ctx.textAlign='left';
  }
}
