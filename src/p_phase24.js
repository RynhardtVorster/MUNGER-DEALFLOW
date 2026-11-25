/* ================= Phase 27: the 7 deal-flow channels, asked on every prospect/target, and a report of which channel delivers ================= */
const CH7=[{id:"advisors",label:"Professional advisors",kind:"contact"},{id:"whatsapp",label:"Partner network",kind:"contact"},{id:"hatstone",label:"Hatstone",kind:"contact"},{id:"c2c",label:"Coast to Coast",kind:"none"},{id:"mapping",label:"Industry mapping",kind:"none"},{id:"direct",label:"Direct marketing",kind:"none"},{id:"pearl",label:"Val de Vie Estate / other",kind:"contact"}];
applyChannels(CH7);
TITLES.channels="CHANNELS";
{ const i=RAIL.findIndex(r=>r[0]==="businesses"); RAIL.splice(i+1,0,["channels","Deal-flow channels","chart"]); }
if(!ICON.chart) ICON.chart='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
function chPeriodOk(c,p){ const d=(c.createdAt||"").slice(0,10); if(p==="all"||!d) return p==="all"; if(p==="year") return d.slice(0,4)===today().slice(0,4); return daysSince(c.createdAt)<=90; }
function chStats(p,who){ const B=companies().filter(c=>isAcq(c)&&c.kind==="target"&&chPeriodOk(c,p)&&(!who||c.partner===who));
  const rows=[...CH7.map(x=>({id:x.id,label:x.label})),{id:"",label:"No channel yet"}].map(x=>{ const L=B.filter(c=>(CHANNEL[c.source?.channel]?c.source.channel:"")===x.id); const g=k=>L.filter(c=>grp(c)===k).length;
    const live=g("target")+g("active")+g("won"); return {...x,L,n:L.length,prospect:g("network"),target:g("target"),talks:g("active"),won:g("won"),closed:g("closed"),conv:L.length?Math.round(live/L.length*100):0,
      by:Object.entries(L.reduce((m,c)=>{ const k=(c.partner||"Not set").split(" ")[0]; m[k]=(m[k]||0)+1; return m; },{})).sort((a,b)=>b[1]-a[1])}; });
  return {B,rows}; }
function vChannels(){ const p=S.chP||"all", who=S.chWho||""; const {B,rows}=chStats(p,who); const R=rows.filter(r=>r.id).sort((a,b)=>b.n-a.n||b.conv-a.conv); const none=rows.find(r=>!r.id); const max=Math.max(1,...R.map(r=>r.n)); const open=S.chOpen;
  const best=R.filter(r=>r.n)[0]; const bestConv=R.filter(r=>r.n>=2).sort((a,b)=>b.conv-a.conv)[0]; const dead=R.filter(r=>!r.n);
  const row=r=>`<div class="card ch27 ${open===r.id?"on":""}"><button class="ch27h" data-act="ch27-open" data-k="${esc(r.id)}"><span class="ch27t"><b>${esc(r.label)}</b><span class="ch27n">${r.n} lead${r.n===1?"":"s"}</span></span><span class="ch27bar"><i style="width:${Math.round(r.n/max*100)}%"></i></span>
     <span class="ch27s">${r.n?`${r.prospect} prospect${r.prospect===1?"":"s"} · ${r.target} target${r.target===1?"":"s"} · ${r.talks} in discussions · ${r.won} done${r.closed?` · ${r.closed} not for us`:""}`:"No leads yet"}${r.n?` <b class="ch27c">${r.conv}% became targets or better</b>`:""}</span>
     ${r.by.length?`<span class="ch27s">Brought in by ${esc(r.by.map(([k,v])=>`${k} ${v}`).join(" · "))}</span>`:""}</button>
     ${open===r.id&&r.n?`<div class="group" style="margin:8px 0 0">${r.L.sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).map(bizRow).join("")}</div>`:""}</div>`;
  return `<div class="ph"><div><div class="eyebrow">Deal flow</div><h1>Which channels work</h1></div></div>
   <div class="chips" style="margin-bottom:8px">${[["all","All time"],["year","This year"],["90","Last 90 days"]].map(([k,l])=>`<button class="chip ${p===k?"on":""}" data-act="ch27-p" data-k="${k}">${l}</button>`).join("")}</div>
   <div class="chips" style="margin-bottom:12px"><button class="chip ${!who?"on":""}" data-act="ch27-who" data-k="">Whole team</button>${S.partners.map(x=>`<button class="chip ${who===x?"on":""}" data-act="ch27-who" data-k="${esc(x)}">${esc(x.split(" ")[0])}</button>`).join("")}</div>
   <div class="stats"><div class="stat"><span class="n">${B.length}</span><span class="l">Leads</span></div><div class="stat"><span class="n">${B.filter(c=>["target","active","won"].includes(grp(c))).length}</span><span class="l">Targets or better</span></div><div class="stat"><span class="n">${B.filter(c=>grp(c)==="won").length}</span><span class="l">Deals done</span></div></div>
   ${B.length?`<div class="card box ch27sum">${[best?`<b>${esc(best.label)}</b> brings the most leads (${best.n}).`:"", bestConv&&bestConv.conv?`<b>${esc(bestConv.label)}</b> converts best – ${bestConv.conv}% become targets or better.`:"", dead.length?`Nothing yet from ${esc(dead.map(r=>r.label).join(", "))}.`:""].filter(Boolean).map(x=>`<p>${x}</p>`).join("")}</div>`:""}
   ${R.map(row).join("")}
   ${none.n?`<div class="sec"><h2>No channel yet (${none.n})</h2></div><div class="card box tag">Open each one and choose the channel so the numbers are right.</div><div class="group" style="margin-top:8px">${none.L.map(bizRow).join("")}</div>`:""}`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act^="ch27-"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); const k=t.dataset.k;
  if(t.dataset.act==="ch27-p") S.chP=k; if(t.dataset.act==="ch27-who") S.chWho=k; if(t.dataset.act==="ch27-open") S.chOpen= S.chOpen===k? null : k; render(); },true);
/* Businesses page: a link to the channel report */
{ const base=vBusinesses; vBusinesses=function(){ const h=base(); if(S.view==="funders") return h; const i=h.indexOf('<div class="chips sort22">'); const link=`<a class="btn block sm ch27link" href="#channels">${ic("chart",16)} Which channels bring the deals</a>`; return i<0? h : h.slice(0,i)+link+h.slice(i); }; }
document.addEventListener("change",e=>{ if(e.target.id==="sChannel") e.target.classList.remove("need"); });
{ const base=vMore; vMore=function(){ const h=base(); const it=`<a class="rowi" href="#channels"><span class="avatar biz">${ic("chart",20)}</span><span class="main"><span class="t1" style="display:block">Deal-flow channels</span><span class="t2" style="display:block">Which of our 7 channels bring the leads and deals</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`; const i=h.indexOf('<a class="rowi" href="#partners"'); return i<0? h : h.slice(0,i)+it+h.slice(i); }; }
