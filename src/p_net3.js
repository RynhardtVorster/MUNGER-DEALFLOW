/* ================= Network map: pinch zoom, fit-all, full-screen brain view ================= */
function vNetwork(){
  return `<div class="ph"><div><h1>Network map</h1><p>Our team, everyone we know, the partner firms they work at and the businesses we want. Pinch to zoom, drag to move, tap a dot.</p></div></div>
  <div class="chips"><button class="chip on" data-net="p">Our team</button><button class="chip on" data-net="k">People</button><button class="chip on" data-net="c">Businesses</button></div>
  <div class="netwrap" id="netwrap"><canvas id="net" aria-label="Network map of partners, people and businesses"></canvas>
  <div class="netctl"><button data-netz="in" aria-label="Zoom in">+</button><button data-netz="out" aria-label="Zoom out">−</button><button data-netz="fit" aria-label="Show the whole network">${ic("net",18)}</button><button data-netz="full" aria-label="Full screen">⤢</button></div>
  <div class="netcount" id="netcount"></div>
  <div class="legend"><span><i style="background:var(--ink)"></i>Our team</span><span><i style="background:var(--tierA)"></i>A · Owner</span><span><i style="background:var(--tierB)"></i>B · Employee</span><span><i style="background:var(--tierC)"></i>C · Potential hire</span><span><i style="background:var(--tierD)"></i>D · Great contact</span><span><i class="sq" style="background:var(--ok)"></i>Business</span><span><i class="sq" style="background:var(--tierB)"></i>Partner firm</span></div>
  <div class="netinfo" id="netinfo"></div></div>`;
}
const NET_KMIN=0.04, NET_KMAX=5;
function netFit(animate){
  if(!G.nodes.length||!G.w) return;
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const n of G.nodes){ x0=Math.min(x0,n.x-n.r); y0=Math.min(y0,n.y-n.r); x1=Math.max(x1,n.x+n.r); y1=Math.max(y1,n.y+n.r+14); }
  const pad=28, k=Math.min(NET_KMAX, Math.max(NET_KMIN, Math.min((G.w-pad*2)/Math.max(1,x1-x0), (G.h-pad*2-40)/Math.max(1,y1-y0))));
  const to={k, x:-((x0+x1)/2)*k, y:-((y0+y1)/2)*k - 10};
  if(!animate){ G.t=to; netDraw(); return; }
  const from={...G.t}, t0=performance.now();
  const step=now=>{ const p=Math.min(1,(now-t0)/450), e=1-Math.pow(1-p,3); G.t={k:from.k+(to.k-from.k)*e, x:from.x+(to.x-from.x)*e, y:from.y+(to.y-from.y)*e}; netDraw(); if(p<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function netZoomAt(sx,sy,k){ k=Math.min(NET_KMAX,Math.max(NET_KMIN,k)); const wx=(sx-G.w/2-G.t.x)/G.t.k, wy=(sy-G.h/2-G.t.y)/G.t.k; G.t.k=k; G.t.x=sx-G.w/2-wx*k; G.t.y=sy-G.h/2-wy*k; netDraw(); }
function netCount(){ const el=$("#netcount"); if(!el) return; const p=G.nodes.filter(n=>n.type==="p").length, k=G.nodes.filter(n=>n.type==="k").length, c=G.nodes.filter(n=>n.type==="c").length; el.textContent=`${p} team · ${k} people · ${c} firms & businesses · ${G.edges.length} links`; }
function netInit(){
  const cv=$("#net"); if(!cv) return;
  G.byId=new Map(); G.t={x:0,y:0,k:1}; G.sel=null; G.fitted=false;
  netBuildGraph(); netSize(); G.alpha=1; netLoop(); netCount();
  setTimeout(()=>{ if(!G.fitted){ G.fitted=true; netFit(true); } },1400);
  const ro=new ResizeObserver(()=>{ netSize(); netDraw(); }); ro.observe(cv); G.ro=ro;
  const pt=e=>{ const r=cv.getBoundingClientRect(); return {sx:e.clientX-r.left, sy:e.clientY-r.top}; };
  const toW=(sx,sy)=>({x:(sx-G.w/2-G.t.x)/G.t.k, y:(sy-G.h/2-G.t.y)/G.t.k});
  const hit=(sx,sy)=>{ const w=toW(sx,sy); let best=null,bd=Infinity; for(const n of G.nodes){ const d=Math.hypot(n.x-w.x,n.y-w.y); if(d<n.r+10/G.t.k && d<bd){bd=d;best=n;} } return best; };
  const ptrs=new Map(); let pinch=null;
  const pinchState=()=>{ const [a,b]=[...ptrs.values()]; return {d:Math.hypot(a.sx-b.sx,a.sy-b.sy)||1, cx:(a.sx+b.sx)/2, cy:(a.sy+b.sy)/2}; };
  cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); const p=pt(e); ptrs.set(e.pointerId,p);
    if(ptrs.size===2){ if(G.drag?.n) G.drag.n.fixed=false; G.drag=null; const s=pinchState(); pinch={...s, k:G.t.k, tx:G.t.x, ty:G.t.y}; return; }
    if(ptrs.size>2) return;
    const n=hit(p.sx,p.sy); G.drag={n, sx:p.sx, sy:p.sy, moved:false, tx:G.t.x, ty:G.t.y}; cv.style.cursor="grabbing"; });
  cv.addEventListener("pointermove",e=>{ const p=pt(e); if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,p);
    if(pinch && ptrs.size>=2){ const s=pinchState(); const k=Math.min(NET_KMAX,Math.max(NET_KMIN,pinch.k*s.d/pinch.d));
      const wx=(pinch.cx-G.w/2-pinch.tx)/pinch.k, wy=(pinch.cy-G.h/2-pinch.ty)/pinch.k;
      G.t.k=k; G.t.x=s.cx-G.w/2-wx*k; G.t.y=s.cy-G.h/2-wy*k; netDraw(); return; }
    if(G.drag){ const dx=p.sx-G.drag.sx, dy=p.sy-G.drag.sy; if(Math.abs(dx)+Math.abs(dy)>4) G.drag.moved=true;
      if(G.drag.n){ if(!G.drag.moved) return; const w=toW(p.sx,p.sy); G.drag.n.x=w.x; G.drag.n.y=w.y; G.drag.n.fixed=true; G.alpha=Math.max(G.alpha,.3); netLoop(); }
      else { G.t.x=G.drag.tx+dx; G.t.y=G.drag.ty+dy; netDraw(); } }
    else if(e.pointerType==="mouse"){ const n=hit(p.sx,p.sy); if(n!==G.hover){ G.hover=n; cv.style.cursor=n?"pointer":"grab"; netDraw(); } } });
  const up=e=>{ ptrs.delete(e.pointerId); if(pinch){ if(ptrs.size<2) pinch=null; G.drag=null; return; }
    const D=G.drag; G.drag=null; cv.style.cursor="grab"; if(D&&D.n) D.n.fixed=false; if(D&&!D.moved&&e.type==="pointerup"){ G.sel=D.n||null; netInfo(); netDraw(); } };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",e=>{ e.preventDefault(); const p=pt(e); netZoomAt(p.sx,p.sy,G.t.k*Math.exp(-e.deltaY*.0015)); },{passive:false});
  cv.addEventListener("dblclick",e=>{ const p=pt(e); netZoomAt(p.sx,p.sy,G.t.k*1.8); });
  document.querySelectorAll("[data-net]").forEach(b=>b.addEventListener("click",()=>{ const k=b.dataset.net; G.show[k]=!G.show[k]; b.classList.toggle("on",G.show[k]); netBuildGraph(); netCount(); G.alpha=.8; netLoop(); setTimeout(()=>netFit(true),1000); }));
  document.querySelectorAll("[data-netz]").forEach(b=>b.addEventListener("click",()=>{ const z=b.dataset.netz;
    if(z==="in") netZoomAt(G.w/2,G.h/2,G.t.k*1.5);
    if(z==="out") netZoomAt(G.w/2,G.h/2,G.t.k/1.5);
    if(z==="fit"){ G.sel=null; netInfo(); netFit(true); }
    if(z==="full"){ const w=$("#netwrap"); const on=!w.classList.contains("full"); w.classList.toggle("full",on); document.body.classList.toggle("netfull",on); document.documentElement.classList.toggle("netdark",on); b.textContent=on?"✕":"⤢"; b.setAttribute("aria-label",on?"Exit full screen":"Full screen"); setTimeout(()=>{ netSize(); netFit(false); },60); setTimeout(()=>{ netSize(); netFit(true); },350); }
  }));
  netInfo();
}
window.addEventListener("hashchange",()=>{ document.body.classList.remove("netfull"); document.documentElement.classList.remove("netdark"); });
