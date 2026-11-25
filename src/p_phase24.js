/* ================= Phase 27: the 7 deal-flow channels, asked on every prospect/target, and a report of which channel delivers ================= */
const CH7=[{id:"advisors",label:"Professional advisors",kind:"contact"},{id:"whatsapp",label:"Partner network",kind:"contact"},{id:"hatstone",label:"Hatstone",kind:"contact"},{id:"c2c",label:"Coast to Coast",kind:"none"},{id:"mapping",label:"Industry mapping",kind:"none"},{id:"direct",label:"Direct marketing",kind:"none"},{id:"pearl",label:"Val de Vie Estate / other",kind:"contact"}];
applyChannels(CH7);
TITLES.channels="CHANNELS";
{ const i=RAIL.findIndex(r=>r[0]==="businesses"); RAIL.splice(i+1,0,["channels","Deal-flow channels","chart"]); }
if(!ICON.chart) ICON.chart='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
function chPeriodOk(c,p){ const d=(c.createdAt||"").slice(0,10); if(p==="all"||!d) return p==="all"; if(p==="year") return d.slice(0,4)===today().slice(0,4); return daysSince(c.createdAt)<=90; }
const CH_LIVE=["target","active","won"];
function chStats(p,who){ const B=companies().filter(c=>isAcq(c)&&c.kind==="target"&&CH_LIVE.includes(grp(c))&&chPeriodOk(c,p)&&(!who||c.partner===who||respOf(c).includes(who)));
  const rows=[...CH7.map(x=>({id:x.id,label:x.label})),{id:"",label:"No channel yet"}].map(x=>{ const L=B.filter(c=>(CHANNEL[c.source?.channel]?c.source.channel:"")===x.id); const g=k=>L.filter(c=>grp(c)===k).length;
    return {...x,L,n:L.length,target:g("target"),talks:g("active"),won:g("won"),pT:L.length?Math.round(g("target")/L.length*100):0, pA:L.length?Math.round(g("active")/L.length*100):0, pW:L.length?Math.round(g("won")/L.length*100):0,
      by:Object.entries(L.reduce((m,c)=>{ const k=(c.partner||"Not set").split(" ")[0]; m[k]=(m[k]||0)+1; return m; },{})).sort((a,b)=>b[1]-a[1])}; });
  return {B,rows}; }
function vChannels(){ const p=S.chP||"all", who=S.chWho||""; const {B,rows}=chStats(p,who); const R=rows.filter(r=>r.id).sort((a,b)=>b.n-a.n||b.won-a.won||b.talks-a.talks); const none=rows.find(r=>!r.id); const max=Math.max(1,...R.map(r=>r.n)); const open=S.chOpen;
  const prospects=companies().filter(c=>isAcq(c)&&c.kind==="target"&&grp(c)==="network").length;
  const best=R.filter(r=>r.n)[0]; const bestConv=R.filter(r=>r.n&&(r.won||r.talks)).sort((a,b)=>b.pW-a.pW||b.pA-a.pA)[0]; const dead=R.filter(r=>!r.n);
  const row=r=>`<div class="card ch27 ${open===r.id?"on":""}"><button class="ch27h" data-act="ch27-open" data-k="${esc(r.id)}"><span class="ch27t"><b>${esc(r.label)}</b><span class="ch27n">${r.n} deal${r.n===1?"":"s"}</span></span><span class="ch27bar"><i style="width:${Math.round(r.n/max*100)}%"></i></span>
     <span class="ch27s">${r.n?`${r.target} target${r.target===1?"":"s"} · ${r.talks} in discussions · ${r.won} deal${r.won===1?"":"s"} done`:"Nothing in action yet"}</span>
     ${r.n?`<span class="ch27pc"><span class="t">Target <b>${r.pT}%</b></span><span class="a">In discussions <b>${r.pA}%</b></span><span class="w">Done <b>${r.pW}%</b></span></span>`:""}
     ${r.by.length?`<span class="ch27s">Brought in by ${esc(r.by.map(([k,v])=>`${k} ${v}`).join(" · "))}</span>`:""}</button>
     ${open===r.id&&r.n?`<div class="group" style="margin:8px 0 0">${r.L.sort((a,b)=>CH_LIVE.indexOf(grp(b))-CH_LIVE.indexOf(grp(a))||a.name.localeCompare(b.name)).map(bizRow).join("")}</div>`:""}</div>`;
  return `<div class="ph"><div><div class="eyebrow">Deal flow</div><h1>Which channels work</h1></div></div>
   <div class="card box ch27sum" style="margin-top:0"><p>Counts only businesses we've gone into action on: <b>targets</b>, <b>in discussions</b> and <b>deals done</b>. Prospects aren't counted until they're made a target${prospects?` (${prospects} prospect${prospects===1?"":"s"} waiting)`:""}.</p></div>
   <div class="chips" style="margin-bottom:8px">${[["all","All time"],["year","This year"],["90","Last 90 days"]].map(([k,l])=>`<button class="chip ${p===k?"on":""}" data-act="ch27-p" data-k="${k}">${l}</button>`).join("")}</div>
   <div class="chips" style="margin-bottom:12px"><button class="chip ${!who?"on":""}" data-act="ch27-who" data-k="">Whole team</button>${S.partners.map(x=>`<button class="chip ${who===x?"on":""}" data-act="ch27-who" data-k="${esc(x)}">${esc(x.split(" ")[0])}</button>`).join("")}</div>
   <div class="stats"><div class="stat"><span class="n">${B.filter(c=>grp(c)==="target").length}</span><span class="l">Targets</span></div><div class="stat"><span class="n">${B.filter(c=>grp(c)==="active").length}</span><span class="l">In discussions</span></div><div class="stat"><span class="n">${B.filter(c=>grp(c)==="won").length}</span><span class="l">Deals done</span></div></div>
   ${B.length?`<div class="card box ch27sum">${[best?`<b>${esc(best.label)}</b> has brought the most deals into action (${best.n}).`:"", bestConv?`<b>${esc(bestConv.label)}</b> is furthest along – ${bestConv.pA}% in discussions, ${bestConv.pW}% done.`:"", dead.length?`Nothing in action yet from ${esc(dead.map(r=>r.label).join(", "))}.`:""].filter(Boolean).map(x=>`<p>${x}</p>`).join("")}</div>`:""}
   ${R.map(row).join("")}
   ${none.n?`<div class="sec"><h2>Channel missing (${none.n})</h2></div><div class="card box ch27sum"><p>These are in action but have no channel, so they aren't counted above. Open each one, tap Edit and choose the channel.</p></div><div class="group" style="margin-top:8px">${none.L.map(bizRow).join("")}</div>`:""}`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act^="ch27-"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); const k=t.dataset.k;
  if(t.dataset.act==="ch27-p") S.chP=k; if(t.dataset.act==="ch27-who") S.chWho=k; if(t.dataset.act==="ch27-open") S.chOpen= S.chOpen===k? null : k; render(); },true);
/* Businesses page: a link to the channel report */
{ const base=vBusinesses; vBusinesses=function(){ const h=base(); if(S.view==="funders") return h; const i=h.indexOf('<div class="chips sort22">'); const link=`<a class="btn block sm ch27link" href="#channels">${ic("chart",16)} Which channels bring the deals</a>`; return i<0? h : h.slice(0,i)+link+h.slice(i); }; }
document.addEventListener("change",e=>{ if(e.target.id==="sChannel") e.target.classList.remove("need"); });
{ const base=vMore; vMore=function(){ const h=base(); const it=`<a class="rowi" href="#channels"><span class="avatar biz">${ic("chart",20)}</span><span class="main"><span class="t1" style="display:block">Deal-flow channels</span><span class="t2" style="display:block">Which of our 7 channels bring the leads and deals</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`; const i=h.indexOf('<a class="rowi" href="#partners"'); return i<0? h : h.slice(0,i)+it+h.slice(i); }; }

/* making a prospect a target: ask the channel if it doesn't have one */
{ const base=likeModal; likeModal=function(id){ base(id); const c=S.companies.get(id); if(!c||grp(c)!=="network"||isPartnerCo(c)||CHANNEL[c.source?.channel]) return; const f=document.querySelector("#modal .fields"); if(f) f.insertAdjacentHTML("afterbegin",`<div class="fld"><label for="lkCh">Which channel did it come through?</label>${chanSelect("lkCh","")}</div>`); }; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="like-save"]'); const sel=document.getElementById("lkCh"); if(!t||!sel) return;
  if(!sel.value){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); sel.classList.add("need"); sel.focus(); toast("Choose the channel it came through"); return; }
  const c=S.companies.get(t.dataset.id); if(c) dbUpdate("companies/"+c.id,{source:{...(c.source||{}),channel:sel.value}}); },true);
/* ================= Phase 28: everything added since the last target meeting – review so nothing is missed ================= */
function lastMeetDate(){ const done=(S.meetings||[]).filter(m=>m.status==="done"&&m.held_on).map(m=>m.held_on).sort(); return done.length? done[done.length-1] : null; }
function newSinceDate(){ const k=S.newP||"meet"; if(k==="30") return addDays(-30); if(k==="90") return addDays(-90); if(k==="date"&&S.newD) return S.newD; return lastMeetDate()||addDays(-30); }
function newItems(since){ const ok=x=>(x.createdAt||"").slice(0,10)>=since; const setup=c=>["Munger setup","Munger"].includes(c.createdByName||"");
  const by=(a,b)=>(b.x.createdAt||"").localeCompare(a.x.createdAt||"");
  return { biz:companies().filter(c=>isAcq(c)&&c.kind==="target"&&ok(c)&&!setup(c)).map(x=>({k:"company",x})).sort(by),
    ppl:contacts().filter(ok).map(x=>({k:"contact",x})).sort(by),
    firms:companies().filter(c=>(isPartnerCo(c)||c.kind==="other")&&ok(c)&&!setup(c)).map(x=>({k:"company",x})).sort(by) }; }
TITLES.new="NEW";
function vNew(){ const since=newSinceDate(); const lm=lastMeetDate(); const {biz,ppl,firms}=newItems(since); const k=S.newP||"meet";
  const tg=biz.filter(r=>["target","active","won"].includes(grp(r.x))).length;
  return `<div class="ph"><div><div class="eyebrow">Don't miss anything</div><h1>New since ${esc(fmtD(since))}</h1></div></div>
   <div class="chips" style="margin-bottom:12px">${lm?`<button class="chip ${k==="meet"?"on":""}" data-act="new28-p" data-k="meet">Since last target meeting</button>`:""}<button class="chip ${k==="30"?"on":""}" data-act="new28-p" data-k="30">Last 30 days</button><button class="chip ${k==="90"?"on":""}" data-act="new28-p" data-k="90">Last 90 days</button></div>
   <div class="stats"><div class="stat"><span class="n">${biz.length}</span><span class="l">Businesses${tg?` (${tg} in action)`:""}</span></div><div class="stat"><span class="n">${ppl.length}</span><span class="l">People</span></div><div class="stat"><span class="n">${firms.length}</span><span class="l">Partners & network cos.</span></div></div>
   <div class="sec"><h2>Businesses to buy</h2><span class="tag">${biz.length}</span></div>${biz.length?`<div class="group">${biz.map(newRow).join("")}</div>`:`<div class="card empty">No new prospects or targets.</div>`}
   <div class="sec"><h2>People</h2><span class="tag">${ppl.length}</span></div>${ppl.length?`<div class="group">${ppl.map(newRow).join("")}</div>`:`<div class="card empty">No new people.</div>`}
   ${firms.length?`<div class="sec"><h2>Partner firms & network companies</h2><span class="tag">${firms.length}</span></div><div class="group">${firms.map(r=>{ const x=r.x; return `<button class="rowi" data-open="${esc(x.id)}"><span class="avatar biz">${ic(isPartnerCo(x)?pkIcon(x):"biz",20)}</span><span class="main"><span class="t1" style="display:block">${esc(x.name)}</span><span class="t2" style="display:block">${esc([isPartnerCo(x)?(PKINDS[x.kind]||"Partner"):"Network company", x.createdByName?`added by ${x.createdByName.split(" ")[0]}`:"", fmtD((x.createdAt||"").slice(0,10))].filter(Boolean).join(" · "))}</span></span></button>`; }).join("")}</div>`:""}`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="new28-p"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); S.newP=t.dataset.k; render(); },true);
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="new28-since"]'); if(!t) return; S.newP="meet"; },true);
/* Today: the "New in the network" list becomes "New since the last target meeting" with a Review all link */
{ const base=vToday; vToday=function(){ let h=base(); try{ const lm=lastMeetDate(); const since=lm||addDays(-30); const {biz,ppl}=newItems(since);
  const re=/<div class="sec"><h2>New in the network<\/h2>[\s\S]*?<\/div><div class="group">[\s\S]*?<\/div>(?=\s*(<div class="sec">|<div style="text-align:center|$))/;
  const rows=[...biz,...ppl].sort((a,b)=>(b.x.createdAt||"").localeCompare(a.x.createdAt||"")).slice(0,6);
  const sec=(biz.length||ppl.length)? `<div class="sec"><h2>New since ${lm?"the last target meeting":"the last 30 days"}</h2><a href="#new" data-act="new28-since">Review all</a></div><div class="card box new28"><b>${biz.length}</b> business${biz.length===1?"":"es"} · <b>${ppl.length}</b> ${ppl.length===1?"person":"people"} added since ${esc(fmtD(since))}. Go through them before the next meeting so nothing slips.</div><div class="group">${rows.map(newRow).join("")}</div>` : "";
  if(re.test(h)) h=h.replace(re,sec); else if(sec){ const k=h.indexOf('<div style="text-align:center;margin-top:18px">'); h= k>0? h.slice(0,k)+sec+h.slice(k) : h+sec; }
  return h; }catch(err){ console.warn(err); return h; } }; }
{ const base=vMore; vMore=function(){ const h=base(); const it=`<a class="rowi" href="#new"><span class="avatar biz">${ic("plus",20)}</span><span class="main"><span class="t1" style="display:block">New since the last meeting</span><span class="t2" style="display:block">Every business and person added – review so nothing is missed</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`; const i=h.indexOf('<a class="rowi" href="#channels"'); return i<0? h : h.slice(0,i)+it+h.slice(i); }; }
{ const i=RAIL.findIndex(r=>r[0]==="channels"); RAIL.splice(i+1,0,["new","New since last meeting","plus"]); }
