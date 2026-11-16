/* ---------------- Network map ---------------- */
const G={nodes:[], edges:[], byId:new Map(), t:{x:0,y:0,k:1}, raf:0, alpha:1, drag:null, sel:null, hover:null, w:0, h:0, show:{p:true,k:true,c:true}};
function vNetwork(){
  return `<div class="head"><div><h1>Network map</h1><p>Partners, the people in their networks, and the businesses those people opened doors to. Click a dot to see its connections; drag to move, scroll to zoom.</p></div>
  <div class="chips"><button class="chip on" data-net="p">Partners</button><button class="chip on" data-net="k">Contacts</button><button class="chip on" data-net="c">Businesses</button><button class="chip" data-net="reset">Re-centre</button></div></div>
  <div class="netwrap"><canvas id="net" aria-label="Network map of partners, people and businesses"></canvas>
  <div class="legend"><span><i style="background:var(--ink);box-shadow:0 0 0 2px var(--line)"></i>Munger team</span><span><i style="background:var(--tierA)"></i>A – Owner</span><span><i style="background:var(--tierB)"></i>B – Connector</span><span><i style="background:var(--tierC)"></i>C – Door-opener</span><span><i class="sq" style="background:var(--ok)"></i>Business – active</span><span><i class="sq" style="background:var(--warn)"></i>Business – nurture</span><span><i class="sq" style="background:var(--muted)"></i>Business – closed</span></div>
  <div class="netinfo" id="netinfo"></div></div>`;
}
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||"#888"; }
function netBuildGraph(){
  const old=G.byId; const nodes=[], edges=[]; const by=new Map();
  const add=(id,type,label,extra)=>{ const o=old.get(id); const n={id,type,label,x:o?.x??(Math.random()-.5)*400,y:o?.y??(Math.random()-.5)*400,vx:0,vy:0,...extra}; nodes.push(n); by.set(id,n); return n; };
  const partnerSet=new Set(S.partners); companies().forEach(c=>{ if(c.partner) partnerSet.add(c.partner); }); contacts().forEach(k=>{ if(k.partner) partnerSet.add(k.partner); });
  if(G.show.p) [...partnerSet].forEach(p=>add("p:"+p,"p",p,{r:16}));
  if(G.show.k) contacts().forEach(k=>add("k:"+k.id,"k",k.name,{r:8,sub:k.firm||k.type,tier:tierOf(k)}));
  if(G.show.c) companies().forEach(c=>add("c:"+c.id,"c",c.name,{r:7,group:stageOf(c.status).group,sub:industryShort(c)}));
  const link=(a,b,kind)=>{ if(by.has(a)&&by.has(b)) edges.push({a:by.get(a),b:by.get(b),kind}); };
  contacts().forEach(k=>{ if(k.partner) link("k:"+k.id,"p:"+k.partner,"network"); if(k.ownsCompanyId) link("k:"+k.id,"c:"+k.ownsCompanyId,"owns"); });
  companies().forEach(c=>{
    if(c.source?.contactId) link("c:"+c.id,"k:"+c.source.contactId,"referred");
    if(c.source?.partner) link("c:"+c.id,"p:"+c.source.partner,"referred");
    if(c.partner) link("c:"+c.id,"p:"+c.partner,"lead");
  });
  nodes.forEach(n=>n.deg=0); edges.forEach(e=>{e.a.deg++; e.b.deg++;});
  nodes.forEach(n=>{ if(n.type!=="p") n.r += Math.min(8, n.deg*1.2); });
  G.nodes=nodes; G.edges=edges; G.byId=by;
}
function netInit(){
  const cv=$("#net"); if(!cv) return;
  G.byId=new Map(); G.t={x:0,y:0,k:1}; G.sel=null;
  netBuildGraph(); netSize(); G.alpha=1; netLoop();
  const ro=new ResizeObserver(()=>{ netSize(); netDraw(); }); ro.observe(cv); G.ro=ro;
  const pt=e=>{ const r=cv.getBoundingClientRect(); return {sx:e.clientX-r.left, sy:e.clientY-r.top}; };
  const toW=(sx,sy)=>({x:(sx-G.w/2-G.t.x)/G.t.k, y:(sy-G.h/2-G.t.y)/G.t.k});
  const hit=(sx,sy)=>{ const w=toW(sx,sy); let best=null,bd=Infinity; for(const n of G.nodes){ const d=Math.hypot(n.x-w.x,n.y-w.y); if(d<n.r+6/G.t.k && d<bd){bd=d;best=n;} } return best; };
  cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); const {sx,sy}=pt(e); const n=hit(sx,sy); G.drag={n, sx, sy, moved:false, tx:G.t.x, ty:G.t.y}; cv.style.cursor="grabbing"; });
  cv.addEventListener("pointermove",e=>{ const {sx,sy}=pt(e);
    if(G.drag){ const dx=sx-G.drag.sx, dy=sy-G.drag.sy; if(Math.abs(dx)+Math.abs(dy)>3) G.drag.moved=true;
      if(G.drag.n){ const w=toW(sx,sy); G.drag.n.x=w.x; G.drag.n.y=w.y; G.drag.n.fixed=true; G.alpha=Math.max(G.alpha,.3); netLoop(); }
      else { G.t.x=G.drag.tx+dx; G.t.y=G.drag.ty+dy; netDraw(); } }
    else { const n=hit(sx,sy); if(n!==G.hover){ G.hover=n; cv.style.cursor=n?"pointer":"grab"; netDraw(); } } });
  cv.addEventListener("pointerup",e=>{ const D=G.drag; G.drag=null; cv.style.cursor="grab"; if(D&&D.n) D.n.fixed=false; if(D&&!D.moved){ G.sel=D.n||null; netInfo(); netDraw(); } });
  cv.addEventListener("wheel",e=>{ e.preventDefault(); const {sx,sy}=pt(e); const w=toW(sx,sy); const k=Math.min(4,Math.max(.2,G.t.k*Math.exp(-e.deltaY*.0015))); G.t.k=k; G.t.x=sx-G.w/2-w.x*k; G.t.y=sy-G.h/2-w.y*k; netDraw(); },{passive:false});
  document.querySelectorAll("[data-net]").forEach(b=>b.addEventListener("click",()=>{ const k=b.dataset.net; if(k==="reset"){ G.t={x:0,y:0,k:1}; G.alpha=1; netLoop(); return; } G.show[k]=!G.show[k]; b.classList.toggle("on",G.show[k]); netBuildGraph(); G.alpha=.8; netLoop(); }));
  netInfo();
}
function netRebuild(){ const before=G.nodes.length+":"+G.edges.length; netBuildGraph(); if(before!==G.nodes.length+":"+G.edges.length) { G.alpha=Math.max(G.alpha,.5); netLoop(); } else netDraw(); if(G.sel) { G.sel=G.byId.get(G.sel.id)||null; netInfo(); } }
function netStop(){ cancelAnimationFrame(G.raf); G.raf=0; if(G.ro){ G.ro.disconnect(); G.ro=null; } }
function netSize(){ const cv=$("#net"); if(!cv) return; const r=cv.getBoundingClientRect(); const dpr=window.devicePixelRatio||1; G.w=r.width; G.h=r.height; cv.width=Math.max(1,r.width*dpr); cv.height=Math.max(1,r.height*dpr); cv.getContext("2d").setTransform(dpr,0,0,dpr,0,0); }
function netLoop(){ if(G.raf) return; const step=()=>{ netTick(); netDraw(); if(G.alpha>0.01 || G.drag?.n){ G.raf=requestAnimationFrame(step); } else G.raf=0; }; G.raf=requestAnimationFrame(step); }
function netTick(){
  const N=G.nodes, a=G.alpha;
  for(let i=0;i<N.length;i++){ const n=N[i]; for(let j=i+1;j<N.length;j++){ const m=N[j]; let dx=n.x-m.x, dy=n.y-m.y; let d2=dx*dx+dy*dy; if(d2<1){dx=Math.random()-.5;dy=Math.random()-.5;d2=1;} if(d2>640000) continue; const f=5200/d2*a; const d=Math.sqrt(d2); const fx=dx/d*f, fy=dy/d*f; n.vx+=fx; n.vy+=fy; m.vx-=fx; m.vy-=fy; } }
  for(const e of G.edges){ const len=e.kind==="lead"?200:e.kind==="network"?130:90; const dx=e.b.x-e.a.x, dy=e.b.y-e.a.y; const d=Math.sqrt(dx*dx+dy*dy)||1; const k=e.kind==="lead"?.015:.04; const f=(d-len)*k*a; const fx=dx/d*f, fy=dy/d*f; e.a.vx+=fx; e.a.vy+=fy; e.b.vx-=fx; e.b.vy-=fy; }
  for(const n of N){ const pull=n.type==="p"?.008:.003; n.vx-=n.x*pull*a; n.vy-=n.y*pull*a; if(n.fixed){ n.vx=0; n.vy=0; continue; } n.vx*=.6; n.vy*=.6; n.x+=n.vx; n.y+=n.vy; }
  G.alpha*=.985;
}
function netDraw(){
  const cv=$("#net"); if(!cv) return; const ctx=cv.getContext("2d");
  ctx.clearRect(0,0,G.w,G.h);
  const col={D:cssVar("--tierD"),"":cssVar("--tierD"),pfirm:cssVar("--tierB"),p:cssVar("--line"),A:cssVar("--tierA"),B:cssVar("--tierB"),C:cssVar("--tierC"),active:cssVar("--ok"),target:cssVar("--warn"),network:cssVar("--faint"),nurture:cssVar("--warn"),won:cssVar("--ok"),closed:cssVar("--muted"),line:cssVar("--line"),ink:cssVar("--ink"),muted:cssVar("--muted"),surface:cssVar("--surface")};
  ctx.save(); ctx.translate(G.w/2+G.t.x, G.h/2+G.t.y); ctx.scale(G.t.k,G.t.k);
  const focus=G.sel||G.hover; const nb=new Set(); if(focus){ nb.add(focus); G.edges.forEach(e=>{ if(e.a===focus) nb.add(e.b); if(e.b===focus) nb.add(e.a); }); }
  for(const e of G.edges){ const on=focus&&(e.a===focus||e.b===focus); ctx.globalAlpha=focus?(on?1:.12):.8; ctx.strokeStyle=e.kind==="family"?cssVar("--tierA"):(on?col.ink:col.line); ctx.lineWidth=(e.kind==="family"?2:(on?1.6:1))/G.t.k; if(e.kind==="lead") ctx.setLineDash([4/G.t.k,4/G.t.k]); else ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(e.a.x,e.a.y); ctx.lineTo(e.b.x,e.b.y); ctx.stroke(); }
  ctx.setLineDash([]);
  for(const n of G.nodes){ ctx.globalAlpha=focus&&!nb.has(n)?.25:1; ctx.fillStyle=n.type==="p"?col.ink:n.type==="k"?col[n.tier]:(col[n.group]||col.active); ctx.beginPath(); if(n.type==="c"){ const s=n.r*.9; ctx.rect(n.x-s,n.y-s,s*2,s*2); } else ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill(); if(n===G.sel){ ctx.strokeStyle=col.p; ctx.lineWidth=4/G.t.k; ctx.stroke(); } else { ctx.strokeStyle=n.type==="p"?col.p:col.surface; ctx.lineWidth=(n.type==="p"?3:1.5)/G.t.k; ctx.stroke(); } }
  ctx.textAlign="center"; ctx.textBaseline="top";
  for(const n of G.nodes){ const show=n.type==="p"||(n.type==="k"&&G.t.k>.6)||G.t.k>1.3||nb.has(n); if(!show) continue; ctx.globalAlpha=focus&&!nb.has(n)?.25:1; const fs=(n.type==="p"?13:11)/Math.max(G.t.k,.7); ctx.font=`${n.type==="p"?600:500} ${fs}px "Source Serif 4", Georgia, serif`; const txt=n.label.length>26?n.label.slice(0,25)+"…":n.label; ctx.lineWidth=3/G.t.k; ctx.strokeStyle=col.surface; ctx.strokeText(txt,n.x,n.y+n.r+3/G.t.k); ctx.fillStyle=n.type==="p"?col.ink:col.muted; ctx.fillText(txt,n.x,n.y+n.r+3/G.t.k); }
  ctx.restore(); ctx.globalAlpha=1;
  if(!G.nodes.length){ ctx.fillStyle=col.muted; ctx.font='15px "Source Serif 4", Georgia, serif'; ctx.textAlign="center"; ctx.fillText("Add partners, people and deals to see the network grow.", G.w/2, G.h/2); }
}
function netInfo(){
  const box=$("#netinfo"); if(!box) return; const n=G.sel; if(!n){ box.classList.remove("on"); return; }
  const links=G.edges.filter(e=>e.a===n||e.b===n).map(e=>e.a===n?e.b:e.a);
  const kind=n.type==="k"?`${n.tier} – ${TIERS[n.tier||""].label}`:{p:"Our team",c:"Business"}[n.type];
  let extra="";
  if(n.type==="p"){ const deals=companies().filter(c=>c.partner===n.label); const ppl=contacts().filter(k=>k.partner===n.label); extra=`<div class="tag">${["A","B","C"].map(t=>`${ppl.filter(k=>tierOf(k)===t).length} ${t}`).join(" · ")} contacts · ${deals.length} deals led</div>`; }
  if(n.type==="k"){ extra=`<div class="tag">${esc(n.sub||"")} · ${dealsFrom(n.id.slice(2)).length} deals introduced</div>`; }
  if(n.type==="c"){ const c=S.companies.get(n.id.slice(2)); extra=c?`<div>${stagePill(c.status)}</div><div class="tag">${esc(sourceText(c))}</div>`:""; }
  box.innerHTML=`<span class="tag">${kind}</span><b style="font-size:15px">${esc(n.label)}</b>${extra}<div class="section-t" style="margin-top:4px">Connected to (${links.length})</div><div style="max-height:160px;overflow:auto">${links.map(m=>`<div>${esc(m.label)} <span class="tag">${m.type==="p"?"our team":m.type==="k"?m.tier:"business"}</span></div>`).join("")||`<span class="tag">Nothing yet</span>`}</div>${n.type!=="p"?`<button class="btn sm" data-act="net-open" data-k="${n.type}:${esc(n.id.slice(2))}">Open record</button>`:""}`;
  box.classList.add("on");
}
