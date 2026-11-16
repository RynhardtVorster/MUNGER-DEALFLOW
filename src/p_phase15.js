/* ================= Phase 15: Map – who is connected to a town, province or country ================= */
S.pl=S.pl||{mode:"town",val:"",label:""};
const lc=s=>String(s||"").toLowerCase();
function recHay(r,isK){ const co=isK? companyOf(r) : null;
  return ([r.notes,r.expertise,r.title,r.checkInNote,r.kindNote,r.countries,r.footprint,(r.log||[]).map(e=>e.text).join(" "),isK?(r.talent?.sectors||""):"",isK?"":(r.owners||[]).map(o=>o.name).join(" ")].join(" \n ")); }
function townAliases(name){ const n=lc(name); return [n,...Object.entries(GAZ_ALIAS).filter(([a,t])=>t===n).map(([a])=>a)].filter(a=>a.length>=3); }
function mentionHit(hay,terms){ for(const t of terms){ const i=hay.search(new RegExp("\\b"+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i")); if(i>=0){ const s=Math.max(0,i-40); return "…"+hay.slice(s,i+t.length+60).replace(/\s+/g," ").trim()+"…"; } } return ""; }
function placeMatch(mode,val){
  const out=[]; if(!val) return out; const V=lc(val);
  const g=mode==="town"? gazFind(val) : null; const terms= mode==="town"? townAliases(g?g.name:val) : [V];
  const inTown=t=>lc(t)===V || (g && gazFind(t)===g);
  const inProv=(t,p)=>lc(p)===V || lc(gazFind(t)?.region)===V;
  const inCountry=(c)=>lc(c)===V;
  contacts().forEach(k=>{ const why=[]; const co=companyOf(k);
    if(mode==="town"){ if(inTown(k.town)) why.push(`Based in ${k.town}`); if(co && inTown(co.town)) why.push(`Works at ${co.name} (${co.town})`); }
    if(mode==="province"){ if(inProv(k.town,k.province)) why.push(`Based in ${[k.town,k.province].filter(Boolean).join(", ")}`); if(co && inProv(co.town,co.province)) why.push(`Works at ${co.name} (${[co.town,co.province].filter(Boolean).join(", ")})`); }
    if(mode==="country"){ if(inCountry(k.country)) why.push(`Based in ${k.country}`); if(co && (inCountry(co.hqCountry)||lc(co.countries).includes(V))) why.push(`Works at ${co.name}`); }
    const m=mentionHit(recHay(k,true),terms); if(m) why.push(`Mentioned: ${m}`);
    if(why.length) out.push({t:"k",r:k,why}); });
  companies().forEach(c=>{ const why=[];
    if(mode==="town" && inTown(c.town)) why.push(`Based in ${c.town}`);
    if(mode==="province" && inProv(c.town,c.province)) why.push(`Based in ${[c.town,c.province].filter(Boolean).join(", ")}`);
    if(mode==="country"){ if(inCountry(c.hqCountry)) why.push(`Head office in ${c.hqCountry}`); else if(lc(c.countries).includes(V)) why.push(`Trades in ${val}`); }
    const m=mentionHit(recHay(c,false),terms); if(m) why.push(`Mentioned: ${m}`);
    if(why.length) out.push({t:"c",r:c,why}); });
  return out;
}
function townCounts(){ const m=new Map();
  const bump=(t,id)=>{ const g=gazFind(t); if(!g) return; if(!m.has(g.name)) m.set(g.name,{g,ids:new Set()}); m.get(g.name).ids.add(id); };
  contacts().forEach(k=>{ bump(k.town,"k"+k.id); const co=companyOf(k); if(co) bump(co.town,"k"+k.id); });
  companies().forEach(c=>bump(c.town,"c"+c.id));
  const hays=[...contacts().map(k=>["k"+k.id,recHay(k,true)]),...companies().map(c=>["c"+c.id,recHay(c,false)])];
  GAZ.forEach(g=>{ const terms=townAliases(g.name); hays.forEach(([id,h])=>{ const hl=lc(h); if(terms.some(t=>hl.includes(t)) && mentionHit(h,terms)){ if(!m.has(g.name)) m.set(g.name,{g,ids:new Set()}); m.get(g.name).ids.add(id); } }); });
  return [...m.values()].map(x=>({g:x.g,n:x.ids.size}));
}
function plRow(x){
  const r=x.r; const why=x.why.slice(0,2).map(w=>`<span class="why">${esc(w.length>130?w.slice(0,130)+"…":w)}</span>`).join("");
  if(x.t==="k") return `<button class="rowi" data-contact="${esc(r.id)}">${avatarP(r)}<span class="main"><span class="t1" style="display:block">${esc(r.name)}</span>${why}<span class="t2" style="display:block">${esc(knowsTxt(r)||"")}</span></span></button>`;
  return `<button class="rowi" data-open="${esc(r.id)}"><span class="avatar biz">${ic(isPartnerCo(r)?pkIcon(r):"biz",20)}</span><span class="main"><span class="t1" style="display:block">${esc(r.name)}</span>${why}</span><span class="trail">${isPartnerCo(r)?`<span class="pill">${esc(PKINDS[r.kind]||"Partner")}</span>`:r.kind==="other"?`<span class="pill">Network</span>`:stagePill(r.status)}</span></button>`;
}
function vNear(){
  const P=S.pl; const res=placeMatch(P.mode,P.val);
  const ppl=res.filter(x=>x.t==="k"), biz=res.filter(x=>x.t==="c"&&isAcq(x.r)), par=res.filter(x=>x.t==="c"&&isPartnerCo(x.r)), net=res.filter(x=>x.t==="c"&&x.r.kind==="other");
  const sec=(t,L)=>L.length?`<div class="sec"><h2>${t}</h2><span class="tag">${L.length}</span></div><div class="group">${L.map(plRow).join("")}</div>`:"";
  const picker= P.mode==="town"? `<input id="plVal" list="townList" placeholder="Type a town, e.g. Paarl" value="${P.mode==="town"?esc(P.val):""}" autocomplete="off">${townList()}`
    : P.mode==="province"? `<select id="plVal">${opts(PROVINCES.filter(p=>p!=="Other"),P.val,"Choose a province…")}</select>`
    : `<input id="plVal" list="countryList" placeholder="Type a country" value="${esc(P.val)}" autocomplete="off">${countryList()}`;
  return `<div class="ph"><div><h1>Map</h1><p>Pick a town, province or country to see everyone connected to it: where they live or work, and anything mentioned in notes.</p></div></div>
  <div id="plMap" class="plmap" aria-label="Map of towns with connections"></div>
  <div class="seg3" role="radiogroup">${[["town","Town"],["province","Province"],["country","Country"]].map(([v,l])=>`<label><input type="radio" name="plMode" value="${v}" ${P.mode===v?"checked":""}><span>${l}</span></label>`).join("")}</div>
  <form id="plForm" class="plpick">${picker}<button type="submit" class="btn primary">Show</button></form>
  ${P.val? `<div class="card box"><div class="lbl">Connected to ${esc(P.val)}</div><div>${ppl.length} people · ${biz.length} businesses · ${par.length} partners · ${net.length} network companies</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="pl-ask">${ic("spark",16)} Ask the network about ${esc(P.val)}</button><button class="btn sm" data-act="pl-clear">Clear</button></div></div>
   ${sec("People",ppl)}${sec("Businesses we want to buy",biz)}${sec("Partners",par)}${sec("Network companies",net)}
   ${!res.length?`<div class="card empty">Nobody connected to ${esc(P.val)} yet. Capturing towns and notes on people and businesses builds this up.</div>`:""}`
   : `<div class="card empty"><b>Tap a dot on the map</b>or pick a town, province or country above. Bigger dots mean more connections.</div>`}`;
}
let PLMAP=null;
function initPlacesMap(){
  const el=document.getElementById("plMap"); if(!el || typeof L==="undefined") return;
  if(PLMAP){ try{ S.pl.center=PLMAP.getCenter(); S.pl.zoom=PLMAP.getZoom(); PLMAP.remove(); }catch(_){} PLMAP=null; }
  const map=L.map(el,{zoomControl:true,attributionControl:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}); PLMAP=map;
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:18,subdomains:"abcd",attribution:'&copy; OpenStreetMap contributors &copy; CARTO'}).addTo(map);
  const pts=townCounts(); const ink=cssVar("--ink"), acc=cssVar("--tierA")||"#b5651d";
  pts.forEach(p=>{ const sel=S.pl.mode==="town" && lc(S.pl.val)===lc(p.g.name);
    const m=L.circleMarker([p.g.lat,p.g.lng],{radius:7+Math.min(16,p.n*2),color:sel?ink:"#fff",weight:sel?3:1.5,fillColor:acc,fillOpacity:sel?.95:.75}).addTo(map);
    m.bindTooltip(`${p.g.name}: ${p.n}`,{direction:"top"}); m.on("click",()=>{ S.pl={...S.pl,mode:"town",val:p.g.name}; render(); }); });
  if(S.pl.center) map.setView(S.pl.center,S.pl.zoom||5);
  else if(pts.length>1) map.fitBounds(L.latLngBounds(pts.map(p=>[p.g.lat,p.g.lng])).pad(.25),{maxZoom:8});
  else if(pts.length===1) map.setView([pts[0].g.lat,pts[0].g.lng],8);
  else map.setView([-29,24.5],5);
  setTimeout(()=>{ if(PLMAP===map) try{ map.invalidateSize(); }catch(_){} },60);
}
{ const base=render; render=function(){ base(); if(currentView()==="near") initPlacesMap(); else if(PLMAP){ try{ PLMAP.remove(); }catch(_){} PLMAP=null; } }; }
document.addEventListener("change",e=>{ if(e.target.name==="plMode"){ S.pl={mode:e.target.value,val:"",center:S.pl.center,zoom:S.pl.zoom}; render(); } if(e.target.id==="plVal" && e.target.tagName==="SELECT"){ S.pl.val=e.target.value; render(); } });
document.addEventListener("submit",e=>{ if(e.target.id!=="plForm") return; e.preventDefault(); e.stopImmediatePropagation(); let v=$("#plVal").value.trim(); if(S.pl.mode==="town"){ const g=gazFind(v); if(g) v=g.name; } if(S.pl.mode==="country"){ const hit=COUNTRY_LIST.find(c=>lc(c)===lc(v)); if(hit) v=hit; } S.pl.val=v; render(); },true);
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="pl-clear"){ S.pl.val=""; render(); }
  if(a==="pl-ask"){ const q=`Who in our network is connected to ${S.pl.val}?`; location.hash="ask"; setTimeout(()=>runAsk(q),80); } });
