class Vec{
  constructor(x=0,y=0){this.x=x;this.y=y}
  add(o){this.x+=o.x;this.y+=o.y;return this}
  sub(o){this.x-=o.x;this.y-=o.y;return this}
  mult(s){this.x*=s;this.y*=s;return this}
  mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}
  dist(o){return Math.sqrt((o.x-this.x)**2+(o.y-this.y)**2)}
  norm(){const m=this.mag();return new Vec(this.x/m,this.y/m)}
  dot(o){return this.x*o.x+this.y*o.y}
  static add(a,b){return new Vec(a.x+b.x,a.y+b.y)}
  static sub(a,b){return new Vec(a.x-b.x,a.y-b.y)}
  static mult(a,s){return new Vec(a.x*s,a.y*s)}
}

class SGStreet{
  constructor(engine,street){
    this.engine=engine;this.street=street;
    this.hovered=false;this.selectable=true;this.guessedCorrectly=false;
    this.segs='Points' in street?[street.Points]:street.Segments;
    this._calcBounds();
  }
  _calcBounds(){
    let x0=9999,x1=-9999,y0=9999,y1=-9999;
    for(const seg of this.segs)for(const p of seg){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
    this.bounds={min:new Vec(x0,y0),max:new Vec(x1,y1),center:new Vec((x0+x1)/2,(y0+y1)/2)};
  }
  inBounds(pt){return pt.x>this.bounds.min.x*0.9&&pt.x<this.bounds.max.x*1.1&&pt.y>this.bounds.min.y*0.9&&pt.y<this.bounds.max.y*1.1;}
  inCursor(cursor){
    const cv=this.engine.c2w(cursor);let best=null;
    for(const seg of this.segs){
      for(let i=1;i<seg.length;i++){
        const a=new Vec(seg[i-1][0],seg[i-1][1]),b=new Vec(seg[i][0],seg[i][1]);
        const dir=Vec.sub(b,a),len=dir.mag(),nd=dir.norm();
        const pl=Math.max(0,Math.min(Vec.sub(cv,a).dot(nd),len));
        const cp=Vec.add(a,Vec.mult(nd,pl));
        const d=cp.dist(cv);
        if(d<6&&(best===null||d<best))best=d;
      }
    }
    return best;
  }
  draw(ctx,zoom){
    if(!this.hovered&&this.selectable)return;
    let color,alpha;
    if(this.selectable){color=this.hovered?'#f97316':'#6b7280';alpha=this.hovered?0.9:0.3;}
    else{color=this.guessedCorrectly?'#22c55e':'#ef4444';alpha=0.7;}
    ctx.globalAlpha=alpha;ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(2,3*zoom);ctx.lineCap='round';ctx.lineJoin='round';
    for(const seg of this.segs){
      ctx.beginPath();
      const s=this.engine.w2c(new Vec(seg[0][0],seg[0][1]));
      ctx.moveTo(s.x,s.y);
      for(let i=1;i<seg.length;i++){const p=this.engine.w2c(new Vec(seg[i][0],seg[i][1]));ctx.lineTo(p.x,p.y);}
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
}

class SGEngine{
  constructor(){
    this.canvas=document.getElementById('sg-canvas');
    this.ctx=this.canvas.getContext('2d');
    this.mapImg=new Image();
    this.mapImg.src='./StreetGuesser/images/map.png';
    this.mapImg.onload=()=>{this.resetView(true);this._loop()};
    this.offset=new Vec(0,0);this.zoom=0.5;
    this.drag=new Vec(0,0);this.holding=false;this.moving=false;
    this.hovered=null;this.animating=false;
    this.tOffset=new Vec(0,0);this.tZoom=0.5;
    this.objs={};this.data=null;
    this.started=false;this.queue=[];this.qi=0;
    this.guesses=0;this.correct=0;this.t0=null;this.ticking=false;
    this._events();
    new ResizeObserver(()=>{
      if(!this.canvas.offsetParent)return;
      this.canvas.width=this.canvas.offsetWidth;
      this.canvas.height=this.canvas.offsetHeight;
    }).observe(this.canvas);
  }
  _events(){
    this.canvas.addEventListener('mousedown',e=>{this.drag=this._xy(e);this.holding=true;this.moving=false;});
    this._onMove=e=>{
      if(!this.canvas.isConnected)return;
      const pos=this._xy(e);this._hover(pos);
      if(!this.holding)return;
      const d=Vec.sub(this.drag,pos);
      if(d.mag()>3)this.moving=true;
      if(this.moving){this.offset.add(d.mult(1/this.zoom));this.drag.x=pos.x;this.drag.y=pos.y;this.animating=false;}
    };
    this._onUp=()=>{this.holding=false;};
    window.addEventListener('mousemove',this._onMove);
    window.addEventListener('mouseup',this._onUp);
    this.canvas.addEventListener('mouseup',e=>{if(!this.moving&&e.button===0)this._select(this._xy(e));});
    this.canvas.addEventListener('wheel',e=>{
      e.preventDefault();this.animating=false;
      const xy=this._xy(e);
      if(e.deltaY>0){this.zoom/=1.25;}
      else{this.zoom*=1.25;this.offset.add(Vec.sub(xy,new Vec(this.canvas.width/2,this.canvas.height/2)).mult(1/(this.zoom*4)));}
    },{passive:false});
  }
  destroy(){
    this._destroyed=true;this.ticking=false;
    window.removeEventListener('mousemove',this._onMove);
    window.removeEventListener('mouseup',this._onUp);
  }
  _xy(e){const r=this.canvas.getBoundingClientRect();return new Vec(e.clientX-r.left,e.clientY-r.top)}
  w2c(wv){return new Vec(this.canvas.width/2+(-this.offset.x+wv.x)*this.zoom,this.canvas.height/2+(-this.offset.y+wv.y)*this.zoom)}
  c2w(cv){return new Vec(this.offset.x+(cv.x-this.canvas.width/2)/this.zoom,this.offset.y+(cv.y-this.canvas.height/2)/this.zoom)}
  resetView(instant=false){
    if(!this.mapImg.width)return;
    const ox=this.mapImg.width/4,oy=this.mapImg.height/3.5,oz=0.5;
    if(instant){this.offset=new Vec(ox,oy);this.zoom=oz;}
    else{this.tOffset=new Vec(ox,oy);this.tZoom=oz;this.animating=true;}
  }
  focus(obj){
    const b=obj.bounds;
    this.tOffset=new Vec(b.center.x,b.center.y);
    this.tZoom=Math.min(Math.min(this.canvas.width,this.canvas.height)/1.2/b.min.dist(b.max),10);
    this.animating=true;
  }
  _animStep(){
    if(!this.animating)return;
    const k=0.12;
    this.offset.x+=(this.tOffset.x-this.offset.x)*k;
    this.offset.y+=(this.tOffset.y-this.offset.y)*k;
    this.zoom+=(this.tZoom-this.zoom)*k;
    if(Math.abs(this.tOffset.x-this.offset.x)<1&&Math.abs(this.tOffset.y-this.offset.y)<1&&Math.abs(this.tZoom-this.zoom)<.05)this.animating=false;
  }
  _hover(pos){
    let best=null,bd=Infinity;
    for(const o of Object.values(this.objs)){
      if(!o.inBounds(this.c2w(pos)))continue;
      const d=o.inCursor(pos);if(d!==null&&d<bd){best=o;bd=d;}
    }
    if(best!==this.hovered){if(this.hovered)this.hovered.hovered=false;this.hovered=best;if(best)best.hovered=true;}
  }
  _select(pos){
    let best=null,bd=Infinity;
    for(const o of Object.values(this.objs)){
      if(!o.selectable||!o.inBounds(this.c2w(pos)))continue;
      const d=o.inCursor(pos);if(d!==null&&d<bd){best=o;bd=d;}
    }
    if(best)this._onSelect(best);
  }
  _loop(){
    if(this._destroyed)return;
    const ctx=this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.globalAlpha=1;
    if(this.mapImg.width){
      ctx.drawImage(this.mapImg,this.canvas.width/2-this.offset.x*this.zoom,this.canvas.height/2-this.offset.y*this.zoom,this.mapImg.width*this.zoom/2,this.mapImg.height*this.zoom/2);
    }
    for(const o of Object.values(this.objs))o.draw(ctx,this.zoom);
    this._animStep();
    requestAnimationFrame(()=>this._loop());
  }
  load(dataKey,label){
    this.data=MAP[dataKey];this._resetState();this._buildObjs();this.resetView(false);
    document.getElementById('sg-name').textContent=label;
    document.getElementById('sg-score').textContent='0/'+Object.keys(this.data).length;
    document.getElementById('sg-correct').textContent='0 Correct';
    document.getElementById('sg-incorrect').textContent='0 Incorrect';
    document.getElementById('sg-timer').textContent='0:00';
  }
  _buildObjs(){this.objs={};for(const[k,s]of Object.entries(this.data))this.objs[k]=new SGStreet(this,s);}
  _resetState(){
    this.started=false;this.queue=[];this.qi=0;this.guesses=0;this.correct=0;this.t0=null;this.ticking=false;
    document.getElementById('sg-overlay').classList.remove('show');
    document.getElementById('sg-giveup').style.display='none';
    document.getElementById('sg-start-btn').style.display='inline-block';
    const sd=document.getElementById('sg-street');sd.textContent='Click Start to Begin';sd.className='sg-street-display unstarted';
  }
  _updateUI(){
    const total=this.data?Object.keys(this.data).length:0;
    document.getElementById('sg-score').textContent=this.guesses+'/'+total;
    document.getElementById('sg-correct').textContent=this.correct+' Correct';
    document.getElementById('sg-incorrect').textContent=(this.guesses-this.correct)+' Incorrect';
  }
  _showStreet(){
    if(!this.queue.length)return;
    const sd=document.getElementById('sg-street');
    sd.textContent=this.queue[this.qi];sd.className='sg-street-display';
  }
  start(){
    if(this.started||!this.data)return;
    this.started=true;
    this.queue=Object.keys(this.data).sort(()=>Math.random()-.5);
    this.qi=0;this.guesses=0;this.correct=0;this.t0=new Date();this.ticking=true;
    document.getElementById('sg-giveup').style.display='inline-block';
    document.getElementById('sg-start-btn').style.display='none';
    this._updateUI();this._showStreet();this._tick();
  }
  end(){if(!this.started)return;this.started=false;this.ticking=false;this._showResult();}
  retry(){document.getElementById('sg-overlay').classList.remove('show');this._buildObjs();this._resetState();this.start();}
  prev(){if(!this.started)return;this.qi=(this.qi-1+this.queue.length)%this.queue.length;this._showStreet();}
  next(){if(!this.started)return;this.qi=(this.qi+1)%this.queue.length;this._showStreet();}
  _onSelect(obj){
    if(!this.started)return;
    const cur=this.queue[this.qi];
    const ok=obj.street.Name===cur;
    if(ok){obj.selectable=false;obj.guessedCorrectly=true;this.correct++;}
    else{const co=this.objs[cur];if(co){co.selectable=false;co.guessedCorrectly=false;this.focus(co);}}
    this.queue.splice(this.qi,1);
    if(this.qi>=this.queue.length)this.qi=0;
    this.guesses++;this._updateUI();
    if(!this.queue.length)this.end();else this._showStreet();
  }
  _tick(){
    if(!this.ticking)return;
    const d=new Date()-this.t0;
    const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000).toString().padStart(2,'0');
    document.getElementById('sg-timer').textContent=m+':'+s;
    setTimeout(()=>this._tick(),1000);
  }
  _showResult(){
    this.resetView(false);
    const total=Object.keys(this.data).length,d=new Date()-this.t0;
    const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000).toString().padStart(2,'0');
    document.getElementById('sg-result-pct').textContent=Math.round(this.correct/total*100)+'%';
    document.getElementById('sg-result-score').textContent=this.correct+'/'+total;
    document.getElementById('sg-result-time').textContent=m+':'+s;
    document.getElementById('sg-overlay').classList.add('show');
  }
}

const GAME_LABELS={Streets:'All Streets',Vinewood:'Vinewood Streets',MirrorPark:'Mirror Park Streets',Sandy:'Sandy Shores Streets',Grapeseed:'Grapeseed Streets',Paleto:'Paleto Streets',InnerCityRoads:'Inner City Streets'};
let sgEngine=null,sgCurrentKey='Streets';

function switchGame(key,el){
  sgCurrentKey=key;
  document.querySelectorAll('.sg-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  if(sgEngine)sgEngine.load(key,GAME_LABELS[key]);
}

function _initGuesser(){
  if(sgEngine)sgEngine.destroy();
  sgEngine=new SGEngine();
  sgEngine.load(sgCurrentKey||'Streets',GAME_LABELS[sgCurrentKey||'Streets']);
}
window.__pageInits=window.__pageInits||{};
window.__pageInits.guesser=_initGuesser;
window.addEventListener('load',_initGuesser);
