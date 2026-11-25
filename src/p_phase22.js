/* ================= Phase 23: Network map search – type a name, it lights up with how it connects to our team ================= */
/* the person who captured a business is linked to it too (next to who referred it and the lead partner) */
{ const base=netBuildGraph; netBuildGraph=function(){ base(); try{ if(!G.byId) return;
  companies().forEach(c=>{ const p=partnerFor(c.createdByName||""); const a=G.byId.get("c:"+c.id), b=p&&G.byId.get("p:"+p); if(a&&b&&!G.edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a))){ G.edges.push({a,b,kind:"captured"}); a.deg=(a.deg||0)+1; b.deg=(b.deg||0)+1; } });
  try{ netCount(); }catch(_){} if(G.q) netSearchApply(false); }catch(err){ console.warn(err); } }; }
{ const base=vNetwork; vNetwork=function(){ const h=base(); const box=`<div class="netsearch"><div class="netsbox">${ic("search",18)}<input id="netQ" type="search" placeholder="Search a person, company or partner…" autocomplete="off" autocapitalize="words" value="${esc(G.q||"")}"><button class="netsx" data-act="nets-clear" aria-label="Clear search" ${G.q?"":"hidden"}>✕</button></div><div class="netsres" id="netRes"></div></div>`;
  const i=h.indexOf('<div class="netwrap"'); return i<0? h+box : h.slice(0,i)+box+h.slice(i); }; }
const NET_KIND={friend:"friend of",network:"knows",works:"works at",referred:"introduced",lead:"brought in by",captured:"captured by",family:"family",colleague:"colleague",group:"same group"};
function netMatches(q){ q=normName(q); if(q.length<2) return []; const words=q.split(" ");
  return G.nodes.filter(n=>{ const L=normName(n.label+" "+(n.sub||"")); return words.every(w=>L.includes(w)); })
    .sort((a,b)=>{ const as=normName(a.label).startsWith(q)?0:1, bs=normName(b.label).startsWith(q)?0:1; return as-bs || (b.deg||0)-(a.deg||0); }); }
/* shortest routes from the chosen dot to each of our team (up to 4 steps) */
function netPaths(src){ const nodes=new Set([src]), edges=new Set(); const adj=new Map(); G.edges.forEach(e=>{ (adj.get(e.a)||adj.set(e.a,[]).get(e.a)).push([e.b,e]); (adj.get(e.b)||adj.set(e.b,[]).get(e.b)).push([e.a,e]); });
  const prev=new Map([[src,null]]); let frontier=[src];
  for(let d=0; d<4 && frontier.length; d++){ const next=[]; for(const n of frontier){ if(n.type==="p"&&n!==src) continue; for(const [m,e] of (adj.get(n)||[])){ if(prev.has(m)) continue; prev.set(m,[n,e]); next.push(m); } } frontier=next; }
  const routes=[]; for(const [n] of prev){ if(n.type!=="p"||n===src) continue; const path=[n]; let cur=n; while(prev.get(cur)){ const [p,e]=prev.get(cur); edges.add(e); nodes.add(p); path.unshift(p); cur=p; } nodes.add(n); routes.push(path); }
  (adj.get(src)||[]).forEach(([m,e])=>{ nodes.add(m); edges.add(e); });
  return {nodes,edges,routes}; }
function netSearchApply(focus){ const q=G.q||""; const res=$("#netRes"); const M=netMatches(q); G.hl=q.length>=2? new Set(M) : null;
  if(res){ res.innerHTML= q.length<2? "" : M.length? `<div class="netshint">${M.length} match${M.length===1?"":"es"} lit up – tap one to see how it connects</div><div class="netschips">${M.slice(0,8).map(n=>`<button class="chip ${G.pick===n.id?"on":""}" data-act="nets-pick" data-id="${esc(n.id)}"><i class="netdot ${n.type}" style="background:${netCol(n)}"></i>${esc(n.label)}</button>`).join("")}</div>` : `<div class="netshint">Nobody called “${esc(q)}” on the map${netFilterOn()||!G.show.k||!G.show.c?" – a filter may be hiding them":""}.</div>`; }
  if(G.pick){ const n=G.byId?.get(G.pick); if(n){ G.sel=n; G.path=netPaths(n); } else { G.pick=null; G.path=null; } } else G.path=null;
  try{ netInfo(); netRouteInfo(); }catch(_){}
  netDraw(); if(focus&&G.pick&&G.sel) netCenter(G.sel); }
function netCol(n){ const v=x=>cssVar(x); return n.type==="p"?v("--ink"):n.type==="k"?v({A:"--tierA",B:"--tierB",C:"--tierC"}[n.tier]||"--tierD"):n.group==="pfirm"?v("--tierB"):v("--ok"); }
function netCenter(n){ const from={...G.t}, k=Math.max(1.2,Math.min(2,G.t.k<1.2?1.5:G.t.k)), to={k, x:-n.x*k, y:-n.y*k}, t0=performance.now();
  const step=now=>{ const p=Math.min(1,(now-t0)/500), e=1-Math.pow(1-p,3); G.t={k:from.k+(to.k-from.k)*e, x:from.x+(to.x-from.x)*e, y:from.y+(to.y-from.y)*e}; netDraw(); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
function netRouteInfo(){ const box=$("#netinfo"); if(!box||!G.path||!G.sel||!box.classList.contains("on")) return; box.querySelector(".netroutes")?.remove();
  const R=G.path.routes.sort((a,b)=>a.length-b.length).slice(0,6); const eKind=(a,b)=>{ const e=G.edges.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)); return NET_KIND[e?.kind]||"linked to"; };
  const html= G.sel.type==="p"? "" : `<div class="netroutes"><div class="section-t" style="margin-top:6px">How we're connected</div>${R.length? R.map(p=>`<div class="netroute">${p.map((n,i)=>`${i?`<span class="tag"> ${esc(eKind(p[i-1],n))} </span>`:""}<b>${esc(n.label)}</b>`).join("")}</div>`).join("") : `<span class="tag">No route to our team yet – link someone who knows them.</span>`}</div>`;
  const conn=[...box.querySelectorAll(".section-t")].find(x=>/Connected to/.test(x.textContent)); if(conn) conn.insertAdjacentHTML("beforebegin",html); else box.insertAdjacentHTML("beforeend",html); }
{ const base=netInfo; netInfo=function(){ base(); if(!G.sel){ G.pick=null; G.path=null; } else if(G.pick!==G.sel.id){ G.pick=G.sel.id; G.path=netPaths(G.sel); } try{ netRouteInfo(); }catch(_){} }; }
/* drawing: search matches glow, the chosen dot's routes to our team stay lit */
{ const base=netDraw; netDraw=function(){ const cv=$("#net"); if(!cv||!G.w) return base();
  const lit=G.path?.nodes||G.hl; if(!lit) return base();
  const ctx=cv.getContext("2d"); ctx.clearRect(0,0,G.w,G.h); const ink=cssVar("--ink"), line=cssVar("--line"), surface=cssVar("--surface"), muted=cssVar("--muted"), glow=cssVar("--warn");
  ctx.save(); ctx.translate(G.w/2+G.t.x, G.h/2+G.t.y); ctx.scale(G.t.k,G.t.k);
  const pe=G.path?.edges;
  for(const e of G.edges){ const on=pe? pe.has(e) : (lit.has(e.a)&&lit.has(e.b)); ctx.globalAlpha=on?1:.07; ctx.strokeStyle=on?(e.kind==="family"?cssVar("--tierA"):ink):line; ctx.lineWidth=(on?2.2:1)/G.t.k; ctx.setLineDash(e.kind==="lead"||e.kind==="captured"?[4/G.t.k,4/G.t.k]:[]); ctx.beginPath(); ctx.moveTo(e.a.x,e.a.y); ctx.lineTo(e.b.x,e.b.y); ctx.stroke(); }
  ctx.setLineDash([]);
  const hit=n=>lit.has(n); const match=n=>G.hl&&G.hl.has(n);
  for(const n of G.nodes){ const on=hit(n); ctx.globalAlpha=on?1:.15;
    if(on&&(match(n)||n===G.sel)){ ctx.save(); ctx.globalAlpha=.35; ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(n.x,n.y,n.r+9/G.t.k+4,0,Math.PI*2); ctx.fill(); ctx.restore(); ctx.globalAlpha=1; }
    ctx.fillStyle=netCol(n); ctx.beginPath(); if(n.type==="c"){ const s=n.r*.9; ctx.rect(n.x-s,n.y-s,s*2,s*2); } else ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=n===G.sel?glow:(n.type==="p"?line:surface); ctx.lineWidth=(n===G.sel?4:n.type==="p"?3:1.5)/G.t.k; ctx.stroke(); }
  ctx.textAlign="center"; ctx.textBaseline="top";
  for(const n of G.nodes){ if(!hit(n)) continue; ctx.globalAlpha=1; const big=n===G.sel||match(n); const fs=(big?13:11.5)/Math.max(G.t.k,.6); ctx.font=`${big?700:500} ${fs}px "Source Serif 4", Georgia, serif`; const txt=n.label.length>28?n.label.slice(0,27)+"…":n.label; ctx.lineWidth=3/G.t.k; ctx.strokeStyle=surface; ctx.strokeText(txt,n.x,n.y+n.r+3/G.t.k); ctx.fillStyle=big?ink:muted; ctx.fillText(txt,n.x,n.y+n.r+3/G.t.k); }
  ctx.restore(); ctx.globalAlpha=1; }; }
let netQT=null;
document.addEventListener("input",e=>{ if(e.target.id!=="netQ") return; G.q=e.target.value.trim(); G.pick=null; G.sel=null; document.querySelector(".netsx")?.toggleAttribute("hidden",!G.q); clearTimeout(netQT); netQT=setTimeout(()=>{ netSearchApply(false); const M=G.hl?[...G.hl]:[]; if(M.length&&M.length<=40 && G.t){ /* frame the matches */ let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; M.forEach(n=>{x0=Math.min(x0,n.x);y0=Math.min(y0,n.y);x1=Math.max(x1,n.x);y1=Math.max(y1,n.y);}); if(M.length===1){ netCenter(M[0]); } } },160); });
document.addEventListener("keydown",e=>{ if(e.target.id!=="netQ"||e.key!=="Enter") return; e.preventDefault(); const M=netMatches(G.q||""); if(M[0]){ G.pick=M[0].id; e.target.blur(); netSearchApply(true); } });
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="nets-pick"],[data-act="nets-clear"]'); if(!t) return; e.preventDefault(); e.stopPropagation();
  if(t.dataset.act==="nets-clear"){ G.q=""; G.pick=null; G.sel=null; G.hl=null; G.path=null; const i=$("#netQ"); if(i) i.value=""; t.hidden=true; netSearchApply(false); netFit(true); return; }
  G.pick=t.dataset.id; netSearchApply(true); },true);
