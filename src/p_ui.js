/* ---------------- Icons ---------------- */
const ICON={
  home:'<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.3a6.4 6.4 0 0 1 3.5 5.7"/>',
  biz:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/><path d="M3 12.5h18"/>',
  more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  phone:'<path d="M5 4h3.2l1.8 4.6-2.3 1.5a11 11 0 0 0 6.2 6.2l1.5-2.3L20 15.8V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  wa:'<path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M9 9.2c.3 2.4 2.4 4.6 4.8 5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chev:'<path d="m9.5 6 6 6-6 6"/>',
  back:'<path d="m14.5 6-6 6 6 6"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  upload:'<path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>',
  net:'<circle cx="5.5" cy="6" r="2.2"/><circle cx="18.5" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7.7 6h8.6M6.6 8l4.3 8M17.4 8l-4.3 8"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  send:'<path d="m4 12 16-8-5.5 16-3-6.5z"/><path d="m11.5 13.5 3-3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2 1.2M17.8 15.3l2 1.2M4.2 16.5l2-1.2M17.8 8.7l2-1.2"/>',
  dl:'<path d="M12 4v11m0 0-4-4m4 4 4-4"/><path d="M5 19.5h14"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  out:'<path d="M14 4h5v16h-5"/><path d="m10 8-4 4 4 4M6 12h10"/>',
  userplus:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/>',
  bizplus:'<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M20 6v6M17 9h6"/>',
  sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>'
};
function ic(n,s=22){ return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||""}</svg>`; }

/* ---------------- Helpers ---------------- */
const grp = c => stageOf(c.status).group;
const isOpen = c => isPartnerCo(c)? !!c.nextCheckIn : ["target","active"].includes(grp(c));
function myPartner(){ const n=S.me?.name||""; return S.partners.includes(n)? n : (S.partners.find(p=>n && p.toLowerCase().startsWith(n.toLowerCase().split(" ")[0]))||n); }
const isMine = c => !!myPartner() && c.partner===myPartner();
function initials(n){ const p=String(n||"?").trim().split(/\s+/).filter(Boolean); return ((p[0]||"?")[0]+(p.length>1?p[p.length-1][0]:"")).toUpperCase(); }
function avatarP(k,lg){ const t=tierOf(k); return `<span class="avatar ${t}${lg?" lg":""}">${esc(initials(k.name))}<span class="tg">${t}</span></span>`; }
function avatarB(c,lg){ return `<span class="avatar biz${lg?" lg":""}">${esc(initials(c.name))}</span>`; }
function telHref(n){ const d=String(n||"").replace(/[^\d+]/g,""); return d? "tel:"+d : ""; }
function waHref(n){ const d=waNum(n); return d? "https://wa.me/"+d : ""; }
function waNum(cell){ let n=String(cell||"").replace(/\D/g,""); if(!n) return ""; if(n.startsWith("0")) n="27"+n.slice(1); return n; }
function phoneKey(n){ const d=String(n||"").replace(/\D/g,""); return d.length>=9? d.slice(-9) : ""; }
function daysSince(iso){ if(!iso) return 9999; return (Date.now()-new Date(iso).getTime())/86400000; }
function firstOwner(c){ return (c.owners||[])[0]||null; }
function bizContact(c){ const o=firstOwner(c); if(o&&(o.cell||o.email)) return o; const k=(S.contacts&&[...S.contacts.values()].find(x=>x.ownsCompanyId===c.id)); return k||o||null; }
function greet(){ const h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":"Good evening"; }
function dueCount(){ return companies().filter(c=>isOpen(c) && (S.scope==="mine"?isMine(c):true) && (()=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n<=7;})()).length; }

/* ---------------- Layers (sheet + modal) with phone back button ---------------- */
let popIgnore=0;
const modalOpen=()=>$("#modal").classList.contains("on");
const sheetOpen=()=>$("#sheet").classList.contains("on");
function pushLayer(){ try{ history.pushState({layer:1},""); }catch(e){} }
function closeLayers(n){ if(n<=0) return; popIgnore++; history.go(-n); }
window.addEventListener("popstate",()=>{ if(popIgnore>0){ popIgnore--; return; } if(modalOpen()) hideModal(); else if(sheetOpen()) hideSheet(); });
function showModal(html, small){
  const m=$("#modal"); const was=modalOpen();
  m.className="modal"+(small?" small":""); m.innerHTML=html;
  requestAnimationFrame(()=>m.classList.add("on")); if(!was){ pushLayer(); }
  if(small) $("#scrim").classList.add("on");
}
function hideModal(){ const m=$("#modal"); m.classList.remove("on"); if(!sheetOpen()) $("#scrim").classList.remove("on"); setTimeout(()=>{ if(!m.classList.contains("on")) m.innerHTML=""; },320); }
function closeModal(){ if(!modalOpen()) return; hideModal(); closeLayers(1); }
function openSheet(kind,id,reuse){
  const fromModal=(reuse && modalOpen()) || S._reuse; S._reuse=false;
  const wasSheet=sheetOpen();
  if(reuse && modalOpen()) hideModal();
  S.sheet={kind,id}; renderSheet(); $("#sheet").classList.add("on");
  if(window.matchMedia("(min-width:900px)").matches) $("#scrim").classList.add("on");
  if(fromModal){ if(wasSheet) closeLayers(1); }
  else if(!wasSheet) pushLayer();
}
function hideSheet(){ S.sheet=null; $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on"); }
function closeSheet(){ if(!sheetOpen()) return; hideSheet(); closeLayers(1); }
function closeAll(){ let n=0; if(modalOpen()){ hideModal(); n++; } if(sheetOpen()){ hideSheet(); n++; } closeLayers(n); }
function ovHead(title, left, right){ return `<div class="ovh">${left||`<button class="hbtn" data-act="close-sheet" aria-label="Back">${ic("back",24)}</button>`}<div class="ttl">${esc(title)}</div>${right||`<span style="width:44px"></span>`}</div>`; }

/* ---------------- Shell ---------------- */
const TABS=[["today","Today","home"],["people","People","people"],["+","",""],["partners","Partners","bank"],["businesses","Businesses","biz"]];
const RAIL=[["today","Today","home"],["ask","Ask the network","spark"],["people","People","people"],["businesses","Businesses","biz"],["meeting","Target meeting","flag"],["partners","Partners","bank"],["talent","Talent bench","star"],["checkins","Check-ins","cal"],["network","Network map","net"],["near","Map","pin"],["lists","Mail lists","send"],["settings","Team & settings","gear"]];
const TITLES={near:"MAP",partners:"PARTNERS",funders:"PARTNERS",talent:"TALENT",ask:"ASK",meeting:"MEETING",today:"MUNGER",people:"PEOPLE",businesses:"BUSINESSES",more:"MORE",checkins:"CHECK-INS",network:"NETWORK",import:"IMPORT",lists:"MAIL LISTS",settings:"SETTINGS"};
const VIEWFN=()=>({others:vOthers,near:vNear,partners:vPartners,funders:vPartners,talent:vTalent,ask:vAsk,meeting:vMeeting,today:vToday,people:vPeople,businesses:vBusinesses,more:vMore,checkins:vCheckins,network:vNetwork,import:vPeople,lists:vLists,settings:vSettings});
function currentView(){ const v=(location.hash||"").replace("#",""); return TITLES[v]? v : "today"; }
function render(){
  S.view=currentView();
  if(S.scope===null && S.me) S.scope = companies().some(isMine)? "mine" : "team";
  const due=S.me? [...companies().filter(isOpen),...peopleCheckins(false)].filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n<=7;}).length : 0;
  const tabOf = v => ["checkins","network","import","lists","settings","meeting","talent","more"].includes(v)? "" : v==="others"? "businesses" : v==="funders"? "partners" : v==="near"? "today" : v==="ask"? "today" : v;
  $("#tabbar").innerHTML=TABS.map(([id,l,i])=> id==="+"? `<button class="plus" data-act="capture" aria-label="Capture a person or business">${ic("plus",26)}</button>` : `<a href="#${id}" class="${tabOf(S.view)===id?"on":""}">${ic(i,24)}<span>${l}</span>${id==="today"&&todayBadge()?`<span class="dot">${todayBadge()>9?"9+":todayBadge()}</span>`:""}</a>`).join("");
  $("#rail").innerHTML=`<div class="brand"><svg viewBox="0 0 1000 836" aria-hidden="true"><polygon points="0,64 97,0 500,258 903,0 1000,64 1000,722 814,836 814,146 500,378 186,146 186,836 0,722"/></svg><b>MUNGER</b><span>All roads lead to Munger.</span></div>
   <button class="cap" data-act="capture">${ic("plus",20)} Capture</button>
   ${RAIL.map(([id,l,i])=>`<a class="nav ${S.view===id?"on":""}" href="#${id}">${ic(i,20)}<span>${l}</span>${id==="today"&&todayBadge()?`<span class="dot">${todayBadge()>9?"9+":todayBadge()}</span>`:""}</a>`).join("")}
   <div class="foot">${S.me?`${esc(S.me.name||S.me.email)} · ${S.companies.size} businesses · ${S.contacts.size} people`:""}</div>`;
  $("#topTitle").textContent=TITLES[S.view];
  $("#topActions").innerHTML = `<span style="display:flex">${["today","people","businesses"].includes(S.view)?`<button class="tbtn" data-act="goto" data-v="near" aria-label="Map">${ic("pin",22)}</button>`:""}${S.view!=="ask"?`<button class="tbtn" data-act="goto" data-v="ask" aria-label="Ask the network">${ic("search",22)}</button>`:""}<button class="tbtn ${S.view==="more"?"on":""}" data-act="goto" data-v="more" aria-label="More">${ic("more",22)}</button></span>`;
  const m=$("#main");
  if(S.view==="network"){ if(!m.querySelector("#net")){ m.innerHTML=vNetwork(); netInit(); } else netRebuild(); }
  else { netStop(); const keep=captureFocus(); m.innerHTML=banner()+VIEWFN()[S.view](); restoreFocus(keep); }
  if(S.sheet && sheetOpen()) renderSheet();
}
function captureFocus(){ const a=document.activeElement; if(a && a.id && $("#main").contains(a)) return {id:a.id, s:a.selectionStart, e:a.selectionEnd}; return null; }
function restoreFocus(k){ if(!k) return; const el=document.getElementById(k.id); if(el){ el.focus({preventScroll:true}); try{ if(k.s!=null) el.setSelectionRange(k.s,k.e);}catch(e){} } }
function isStandalone(){ return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true; }
function installDismissed(){ try{ return localStorage.getItem("munger-install-hint")==="1"; }catch(e){ return false; } }
function banner(){
  let out="";
  if(S.stale) out+=`<div class="notice err"><span>Couldn't reach the database. What you see may be out of date.</span><button class="btn sm" data-act="reload">Retry</button></div>`;
  if(S.session && S.loaded.settings && !S.me) out+=`<div class="notice"><span>Your login isn't on the Munger team yet. Ask Rynhardt to add you.</span></div>`;
  if(S.me && S.view==="today" && !isStandalone() && !installDismissed()) out+=`<div class="notice"><span><b>Add Munger to your home screen.</b> ${/iphone|ipad|ipod/i.test(navigator.userAgent)?"In Safari tap Share, then “Add to Home Screen”.":"Open the browser menu ⋮ and tap “Install app”."}</span><button class="btn sm" data-act="dismiss-install">Done</button></div>`;
  return out;
}

/* ---------------- Today ---------------- */
function vToday(){
  const first=(S.me?.name||"").split(" ")[0];
  const d=new Date(); const dateTxt=`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]} ${d.getDate()} ${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]}`;
  const mine=S.scope==="mine";
  const open=companies().filter(isOpen); const pool=mine? open.filter(isMine) : open;
  const due=pool.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n<=7;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const soon=pool.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n>7&&n<=30;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const active=pool.filter(c=>grp(c)==="active").length;
  const ppl=mine? contacts().filter(k=>k.partner===myPartner()) : contacts();
  const recent=[...companies().map(x=>({k:"company",x})),...contacts().map(x=>({k:"contact",x}))].filter(r=>r.x.createdBy!==S.uid && daysSince(r.x.createdAt)<=14).sort((a,b)=>(b.x.createdAt||"").localeCompare(a.x.createdAt||"")).slice(0,6);
  const overdue=due.filter(c=>daysUntil(c.nextCheckIn)<0).length;
  return `<div class="ph"><div><div class="eyebrow">${esc(dateTxt)}</div><h1>${greet()}${first?`, ${esc(first)}`:""}</h1></div></div>
  <div class="seg" role="tablist"><button class="${mine?"on":""}" data-act="scope" data-k="mine">Mine</button><button class="${!mine?"on":""}" data-act="scope" data-k="team">Whole team</button></div>
  <div class="stats">
    <a class="stat ${overdue?"alert":""}" href="#checkins"><span class="n">${due.length}</span><span class="l">Check-ins this week</span></a>
    <a class="stat" href="#businesses" data-act="biz-active"><span class="n">${active}</span><span class="l">Active businesses</span></a>
    <a class="stat" href="#people"><span class="n">${ppl.length}</span><span class="l">People tagged</span></a>
  </div>
  <div class="sec"><h2>To call this week</h2>${due.length?`<a href="#checkins">All</a>`:""}</div>
  ${due.length? due.map(dueCard).join("") : `<div class="card empty"><b>You're up to date</b>${soon.length?`Next up: ${esc(soon[0].name)} on ${esc(fmtD(soon[0].nextCheckIn))}.`:"No check-ins due. Businesses you set to check in on will show up here."}</div>`}
  ${soon.length?`<div class="sec"><h2>Coming up</h2></div><div class="group">${soon.slice(0,5).map(bizRow).join("")}</div>`:""}
  ${recent.length?`<div class="sec"><h2>New from the team</h2></div><div class="group">${recent.map(r=>r.k==="company"?bizRow(r.x):personRow(r.x)).join("")}</div>`:""}`;
}
function dueCard(c){
  const d=dueInfo(c); const o=bizContact(c);
  return `<div class="card due"><div class="top" data-open="${esc(c.id)}">${avatarB(c)}<div class="main" style="flex:1;min-width:0"><div class="t1" style="font-weight:600">${esc(c.name)}</div><div class="t2" style="color:var(--muted);font-size:14px">${esc(o?.name||"No owner captured")}${c.partner?` · ${esc(c.partner)}`:""}</div></div><span class="pill ${d.cls}">${esc(d.txt)}</span></div>
  <div class="acts"><a class="act" ${o?.cell?`href="${esc(telHref(o.cell))}"`:'aria-disabled="true"'}>${ic("phone",18)}Call</a><a class="act" ${o?.cell?`href="${esc(waHref(o.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",18)}WhatsApp</a><button class="act dark" data-act="quick-checkin" data-id="${esc(c.id)}">${ic("check",18)}Done</button></div></div>`;
}
function bizRow(c){
  const d=dueInfo(c); const o=firstOwner(c);
  return `<button class="rowi" data-open="${esc(c.id)}">${avatarB(c)}<span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([industryShort(c)!=="—"?industryShort(c):"",c.town||c.province,o?.name].filter(Boolean).join(" · ")||"No details yet")}</span></span><span class="trail">${stagePill(c.status)}${d&&isOpen(c)?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}</span></button>`;
}
function personRow(k){
  const n=dealsFrom(k.id).length; const own=k.ownsCompanyId?S.companies.get(k.ownsCompanyId):null;
  return `<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">${esc([own?own.name:k.firm, k.type||TIERS[tierOf(k)].label, k.partner].filter(Boolean).join(" · "))}</span></span><span class="trail">${n?`<span class="pill">${n} deal${n>1?"s":""}</span>`:""}${ic("chev",18).replace('class="ic"','class="ic chev"')}</span></button>`;
}

/* ---------------- People ---------------- */
function vPeople(){
  const k=S.k, q=k.q.trim().toLowerCase(); const me=myPartner();
  const all=contacts();
  const arr=all.filter(c=>{ if(k.tier&&tierOf(c)!==k.tier) return false; if(k.mine&&c.partner!==me) return false; if(q){ const h=[c.name,c.firm,c.email,c.cell,c.town,c.notes,c.type,c.partner].join(" ").toLowerCase(); if(!h.includes(q)) return false; } return true; }).sort((a,b)=>(a.name||"").localeCompare(b.name||"",undefined,{sensitivity:"base"}));
  const cnt=t=>all.filter(c=>tierOf(c)===t).length;
  const chip=(t,l,n)=>`<button class="chip ${k.tier===t?"on":""}" data-act="k-tier" data-k="${t}">${l} <span class="n">${n}</span></button>`;
  let body="";
  if(!arr.length) body=`<div class="card empty">${all.length?"<b>Nobody matches</b>Try a different search or filter.":`<b>Your network starts here</b>Import your contacts and tag who matters, or tap + to add one person.<div style="margin-top:14px"><a class="btn primary" href="#import">${ic("upload",18)} Import contacts</a></div>`}</div>`;
  else { let last=""; const parts=[]; let buf=[];
    const flush=()=>{ if(buf.length){ parts.push(`<div class="group">${buf.join("")}</div>`); buf=[]; } };
    for(const c of arr){ const L=(c.name||"#")[0].toUpperCase(); const letter=/[A-Z]/.test(L)?L:"#"; if(letter!==last && arr.length>12){ flush(); parts.push(`<div class="letter">${letter}</div>`); last=letter; } buf.push(personRow(c)); }
    flush(); body=parts.join(""); }
  return `<div class="ph"><div><h1>People</h1><p>${all.length} in the network · A ${cnt("A")} · B ${cnt("B")} · C ${cnt("C")}</p></div><a class="btn sm" href="#import">${ic("upload",18)} Import</a></div>
  <div class="search">${ic("search",20)}<input id="kq" type="search" placeholder="Search name, firm, number…" value="${esc(k.q)}" autocomplete="off" aria-label="Search people"></div>
  <div class="chips">${chip("","All",all.length)}${chip("A","A · Owners",cnt("A"))}${chip("B","B · Employees",cnt("B"))}${chip("C","C · Potential hires",cnt("C"))}${chip("D","D · Great contacts",cnt("D"))}${me?`<button class="chip ${k.mine?"on":""}" data-act="k-mine">My network</button>`:""}</div>
  ${body}`;
}

/* ---------------- Businesses ---------------- */
function filteredDeals(){
  const f=S.f, q=f.q.trim().toLowerCase();
  return companies().filter(c=>{
    const g=grp(c);
    if(f.group && g!==f.group) return false;
    if(f.mine && !isMine(c)) return false;
    if(f.sector && sectorOf(c)!==f.sector) return false;
    if(f.partner && c.partner!==f.partner) return false;
    if(f.province && c.province!==f.province) return false;
    if(f.channel && c.source?.channel!==f.channel) return false;
    if(f.lang){ const ls=companyLangs(c); if(!(ls.includes(f.lang)||ls.includes("both"))) return false; }
    if(q){ const hay=[c.name,c.tradingAs,c.town,c.province,c.industry,c.notes,c.partner,sourceText(c),...(c.owners||[]).flatMap(o=>[o.name,o.email,o.cell])].join(" ").toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  }).sort((a,b)=>{ const x=a.nextCheckIn||"9999", y=b.nextCheckIn||"9999"; return x.localeCompare(y) || (a.name||"").localeCompare(b.name||""); });
}
function vBusinesses(){
  const f=S.f; const arr=filteredDeals(); const n=g=>companies().filter(c=>grp(c)===g).length;
  const nf=["sector","partner","province","channel","lang"].filter(x=>f[x]).length;
  return `<div class="ph"><div><h1>Businesses</h1><p>The pipeline, from first lead to acquired.</p></div><button class="btn sm primary" data-act="new-deal">${ic("plus",18)} Add</button></div>
  <div class="search">${ic("search",20)}<input id="fq" type="search" placeholder="Search business, owner, town…" value="${esc(f.q)}" autocomplete="off" aria-label="Search businesses"></div>
  <div class="chips">
    ${[["target","Targets"],["active","Active deals"],["network","In our network"],["won","Acquired"],["closed","Not for us"],["","All"]].map(([g,l])=>`<button class="chip ${f.group===g?"on":""}" data-act="f-group" data-k="${g}">${l} <span class="n">${g?n(g):S.companies.size}</span></button>`).join("")}
    ${myPartner()?`<button class="chip ${f.mine?"on":""}" data-act="f-mine">Mine</button>`:""}
    <button class="chip ${nf?"on":""}" data-act="f-sheet">${ic("sliders",16)} Filters${nf?` · ${nf}`:""}</button>
  </div>
  ${arr.length? `<div class="group">${arr.map(bizRow).join("")}</div>` : `<div class="card empty">${S.companies.size?"<b>Nothing here</b>Try another tab or clear the filters.":`<b>No businesses yet</b>Tap + to add the first one, or add it straight from an A contact.`}</div>`}
  ${arr.length?`<div style="text-align:center;margin-top:14px"><button class="btn sm" data-act="export-deals">${ic("dl",18)} Download this list</button></div>`:""}`;
}
function filterSheet(){
  const f=S.f;
  showModal(`${ovHead("Filters",`<button class="hbtn" data-act="close-modal">Close</button>`,`<button class="hbtn" data-act="f-clear">Clear</button>`)}<div class="ovb"><div class="fields">
   <div class="fld"><label for="fsector">Sector</label><select id="fsector">${opts(SECTORS,f.sector,"Any sector")}</select></div>
   <div class="fld"><label for="fpartner">Lead partner</label><select id="fpartner">${opts(S.partners,f.partner,"Any partner")}</select></div>
   <div class="fld"><label for="fprovince">Province</label><select id="fprovince">${opts(PROVINCES,f.province,"Any province")}</select></div>
   <div class="fld"><label for="fchannel">How we heard</label><select id="fchannel">${opts(CHANNELS.map(c=>({v:c.id,l:c.label})),f.channel,"Any source")}</select></div>
   <div class="fld"><label for="flang">Language</label><select id="flang">${opts([{v:"af",l:"Afrikaans"},{v:"en",l:"English"}],f.lang,"Any language")}</select></div>
  </div><div style="margin-top:16px"><button class="btn primary block" data-act="close-modal">Show results</button></div></div>`, true);
}

/* ---------------- Check-ins ---------------- */
function vCheckins(){
  const mine=S.scope==="mine";
  const open=companies().filter(isOpen).filter(c=>!mine||isMine(c));
  const sch=open.filter(c=>c.nextCheckIn).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const B=[["Overdue",c=>daysUntil(c.nextCheckIn)<0],["This week",c=>{const n=daysUntil(c.nextCheckIn); return n>=0&&n<=7;}],["Next 30 days",c=>{const n=daysUntil(c.nextCheckIn); return n>7&&n<=30;}],["Next 3 months",c=>{const n=daysUntil(c.nextCheckIn); return n>30&&n<=92;}],["Later",c=>daysUntil(c.nextCheckIn)>92]];
  const none=open.filter(c=>!c.nextCheckIn);
  return `<div class="ph"><div><h1>Check-ins</h1><p>Businesses we keep warm. Logging a check-in sets the next date automatically.</p></div></div>
  <div class="seg"><button class="${mine?"on":""}" data-act="scope" data-k="mine">Mine</button><button class="${!mine?"on":""}" data-act="scope" data-k="team">Whole team</button></div>
  ${B.map(([l,fn])=>{ const it=sch.filter(fn); if(!it.length) return ""; return `<div class="sec"><h2>${l}</h2><span class="tag">${it.length}</span></div>${l==="Overdue"||l==="This week"? it.map(dueCard).join("") : `<div class="group">${it.map(bizRow).join("")}</div>`}`; }).join("") || `<div class="card empty"><b>Nothing scheduled</b>Set a check-in on a business to see it here.</div>`}
  ${none.length?`<div class="sec"><h2>Open, no check-in set</h2><span class="tag">${none.length}</span></div><div class="group">${none.map(bizRow).join("")}</div>`:""}
  <div style="text-align:center;margin-top:16px"><button class="btn sm" data-act="export-follow">${ic("dl",18)} Download check-ins</button></div>`;
}

/* ---------------- More ---------------- */
function vMore(){
  const item=(href,icn,t,s)=>`<a class="rowi" href="${href}"><span class="avatar biz">${ic(icn,20)}</span><span class="main"><span class="t1" style="display:block">${t}</span><span class="t2" style="display:block">${s}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`;
  return `<div class="ph"><div><h1>More</h1></div></div>
  <div class="group">
   ${item("#checkins","cal","Check-ins","Who to call and when")}
   ${item("#network","net","Network map","Our team, people, partners and businesses, connected")}
   ${item("#import","upload","Import contacts","Bring in your phone contacts and tag them")}
   ${item("#lists","send","Mail lists","Afrikaans and English recipient lists")}
   ${item("#settings","gear","Team & settings","Partners, logins, your password")}
  </div>
  <div class="sec"><h2>Export</h2></div>
  <div class="group">
   <button class="rowi" data-act="export-deals-all"><span class="avatar biz">${ic("dl",20)}</span><span class="main"><span class="t1" style="display:block">All businesses</span><span class="t2" style="display:block">CSV for Excel</span></span></button>
   <button class="rowi" data-act="export-contacts"><span class="avatar biz">${ic("dl",20)}</span><span class="main"><span class="t1" style="display:block">All people</span><span class="t2" style="display:block">CSV for Excel</span></span></button>
  </div>
  <div style="margin-top:22px"><button class="btn block danger" data-act="sign-out">${ic("out",18)} Sign out</button></div>
  <p class="tag" style="text-align:center;margin-top:14px">Signed in as ${esc(S.me?.email||S.session?.user?.email||"")}</p>`;
}

/* ---------------- Mail lists ---------------- */
function vLists(){
  const L=S.lists; const rows=listRows(); const emails=rows.filter(r=>r.email);
  const gchip=(k,l)=>`<button class="chip ${L.groups.includes(k)?"on":""}" data-act="l-group" data-k="${k}">${l}</button>`;
  return `<div class="ph"><div><h1>Mail lists</h1><p>Everyone who should get the Afrikaans or the English mailer.</p></div></div>
  <div class="seg"><button class="${L.lang==="af"?"on":""}" data-act="l-lang" data-k="af">Afrikaans</button><button class="${L.lang==="en"?"on":""}" data-act="l-lang" data-k="en">English</button></div>
  <div class="sec" style="margin-top:6px"><h2>Business owners of</h2></div>
  <div class="chips">${gchip("network","In our network")}${gchip("target","Targets")}${gchip("active","Active deals")}${gchip("won","Acquired")}${gchip("closed","Not for us")}</div>
  <div class="sec" style="margin-top:0"><h2>People tagged</h2></div>
  <div class="chips">${["A","B","C","D"].map(t=>`<button class="chip ${L.includeContacts&&L.tiers.includes(t)?"on":""}" data-act="l-tier" data-k="${t}">${t} · ${esc(TIERS[t].label)}s</button>`).join("")}</div>
  <div class="stats"><div class="stat"><span class="n">${rows.length}</span><span class="l">Recipients</span></div><div class="stat"><span class="n">${emails.length}</span><span class="l">With email</span></div><div class="stat"><span class="n">${rows.filter(r=>r.cell).length}</span><span class="l">With cell</span></div></div>
  <div class="acts" style="margin-top:12px"><button class="act" data-act="copy-emails" ${emails.length?"":"disabled"}>${ic("mail",18)}Emails</button><button class="act" data-act="copy-cells">${ic("phone",18)}Cells</button><button class="act dark" data-act="export-list">${ic("dl",18)}CSV</button></div>
  <div class="sec"><h2>Recipients</h2></div>
  ${rows.length?`<div class="group tbl-list">${rows.slice(0,300).map(r=>`<div class="rowi"><span class="main"><span class="t1" style="display:block">${esc(r.name)}</span><span class="t2" style="display:block">${esc([r.org,r.email||r.cell].filter(Boolean).join(" · "))}</span></span><span class="pill">${esc(r.kind.split(" · ")[0])}</span></div>`).join("")}</div>`:`<div class="card empty">Nobody on this list yet.</div>`}`;
}

/* ---------------- Settings ---------------- */
function vSettings(){
  const p=[...S.partners]; p.push(""); while(p.length<4) p.push(""); const admin=S.me?.is_admin;
  return `<div class="ph"><div><h1>Team & settings</h1></div></div>
  <div class="fsec">Munger partners</div>
  <div class="fields">${p.map((n,i)=>`<div class="fld"><label for="p${i}">Partner ${i+1}</label><input id="p${i}" value="${esc(n)}" ${admin?"":"disabled"}></div>`).join("")}</div>
  ${admin?`<div style="margin-top:10px"><button class="btn block" data-act="save-partners">Save partner names</button></div>`:""}
  <div class="fsec">Team logins</div>
  <div class="group">${S.members.map(m=>`<div class="rowi"><span class="avatar biz">${esc(initials(m.name||m.email))}</span><span class="main"><span class="t1" style="display:block">${esc(m.name||m.email)}${m.is_admin?` <span class="pill">Admin</span>`:""}</span><span class="t2" style="display:block">${esc(m.email)}</span></span>${admin&&m.user_id!==S.uid?`<button class="btn sm danger" data-act="remove-member" data-id="${esc(m.user_id)}">Remove</button>`:""}</div>`).join("")}</div>
  ${admin?`<div class="fsec">Add a partner</div><div class="fields"><div class="fld"><label for="mName">Name</label><input id="mName" autocomplete="off"></div><div class="fld"><label for="mEmail">Email</label><input id="mEmail" type="email" autocomplete="off" autocapitalize="off"></div><div class="fld"><label for="mPw">Temporary password</label><input id="mPw" autocomplete="off" value="${esc(tempPw())}"></div></div>
   <label class="check"><input type="checkbox" id="mAdmin"> Admin (can add and remove partners)</label>
   <button class="btn primary block" data-act="add-member">Add partner</button>`:""}
  <div class="fsec">Your login</div>
  <div class="fields"><div class="fld"><label for="newPw">New password</label><input id="newPw" type="password" autocomplete="new-password" placeholder="At least 8 characters"></div></div>
  <div style="margin-top:10px;display:grid;gap:10px"><button class="btn block" data-act="change-pw">Change password</button><button class="btn block danger" data-act="sign-out">Sign out</button></div>`;
}
function tempPw(){ const a="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; const r=crypto.getRandomValues(new Uint8Array(8)); return "Munger-"+[...r].map(x=>a[x%a.length]).join(""); }

/* ---------------- Detail sheet ---------------- */
function renderSheet(){
  const el=$("#sheet"); const D=S.sheet; if(!D) return;
  const keepNote=el.querySelector("#noteTxt")?.value||""; const st=el.querySelector(".ovb")?.scrollTop||0;
  if(D.kind==="company"){
    const c=S.companies.get(D.id); if(!c){ closeSheet(); return; }
    const due=dueInfo(c); const o=bizContact(c); const src=c.source||{}; const sk=src.contactId?S.contacts.get(src.contactId):null;
    const ownerK=contacts().find(k=>k.ownsCompanyId===c.id);
    const ro=S.readOnly;
    el.innerHTML=`${ovHead(c.name,null,ro?"":`<button class="hbtn" data-act="edit-deal" data-id="${esc(c.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${avatarB(c,true)}<h2>${esc(c.name)}</h2><div class="sub">${esc([industryShort(c)!=="—"?industryShort(c):"",[c.town,c.province].filter(Boolean).join(", ")].filter(Boolean).join(" · ")||"No details yet")}</div><div class="pills">${stagePill(c.status)}${c.partner?`<span class="pill">${esc(c.partner)}</span>`:""}${c.ebit&&c.ebit!=="Unknown"?`<span class="pill">EBIT ${esc(c.ebit)}</span>`:""}</div></div>
    <div class="bigacts">
      <a class="bigact" ${o?.cell?`href="${esc(telHref(o.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${o?.cell?`href="${esc(waHref(o.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${o?.email?`href="mailto:${esc(o.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      <button class="bigact" data-act="quick-checkin" data-id="${esc(c.id)}" ${ro?'aria-disabled="true"':""}>${ic("check",22)}Check in</button>
    </div>
    <div class="fsec">Check-in</div>
    <div class="card box">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="lbl">Next check-in</div><div class="next">${c.nextCheckIn?esc(fmtD(c.nextCheckIn)):"Not scheduled"}</div></div>${due?`<span class="pill ${due.cls}">${esc(due.txt)}</span>`:""}</div>
      <div class="tag">${esc(CADENCE.find(x=>x.m===Number(c.followUpMonths))?.l||"No scheduled check-in")} · last contact ${esc(fmtD(c.lastContact))}</div>
      ${ro?"":`<div class="fields"><div class="fld"><label for="dStage">Stage</label><select id="dStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),c.status)}</select></div></div>`}
    </div>
    <div class="fsec">Owners</div>
    ${(c.owners||[]).length? `<div class="group">${c.owners.map(w=>`<div class="rowi"><span class="avatar biz">${esc(initials(w.name))}</span><span class="main"><span class="t1" style="display:block">${esc(w.name||"Unnamed")} ${langTag(w.language)}</span><span class="t2" style="display:block">${esc([w.role,w.cell,w.email].filter(Boolean).join(" · "))}</span></span>${w.cell?`<a class="btn sm" href="${esc(telHref(w.cell))}" aria-label="Call ${esc(w.name)}">${ic("phone",18)}</a>`:""}</div>`).join("")}</div>` : `<div class="card empty">No owners captured yet.</div>`}
    ${ownerK?`<p class="tag" style="margin:8px 2px 0">Owner is in the network: <a href="#" data-contact="${esc(ownerK.id)}">${esc(ownerK.name)}</a></p>`:""}
    <div class="fsec">How we heard</div>
    <div class="card kv"><div class="k">Source</div><div class="v">${esc(CHANNEL[src.channel]?.label||"—")}</div>${sk?`<div class="k">Introduced by</div><div class="v"><a href="#" data-contact="${esc(sk.id)}">${esc(sk.name)}</a>${sk.partner?`<br><span class="tag">${esc(sk.partner)}'s network</span>`:""}</div>`:""}${src.partner?`<div class="k">Partner</div><div class="v">${esc(src.partner)}</div>`:""}${src.detail?`<div class="k">Detail</div><div class="v">${esc(src.detail)}</div>`:""}</div>
    <div class="fsec">Details</div>
    <div class="card kv"><div class="k">Industry</div><div class="v">${esc(c.industry||"—")}</div><div class="k">Trading as</div><div class="v">${esc(c.tradingAs||"—")}</div><div class="k">Turnover</div><div class="v">${esc(c.turnover||"—")}</div><div class="k">Employees</div><div class="v">${esc(c.employees||"—")}</div><div class="k">Website</div><div class="v">${c.website?`<a href="${esc(/^https?:/i.test(c.website)?c.website:"https://"+c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>`:"—"}</div><div class="k">Captured</div><div class="v">${esc(fmtD((c.createdAt||"").slice(0,10)))}${c.createdByName?` · ${esc(c.createdByName)}`:""}</div></div>
    ${c.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(c.notes)}</div>`:""}
    <div class="fsec">Activity</div>
    ${ro?"":`<div class="fields"><div class="fld"><label for="noteTxt">Add a note</label><textarea id="noteTxt" placeholder="What happened? Who said what?">${esc(keepNote)}</textarea></div></div><div style="margin:8px 0 12px"><button class="btn block" data-act="add-note" data-id="${esc(c.id)}">Save note</button></div>`}
    ${(c.log||[]).length?`<div class="group log">${[...c.log].reverse().map(e=>`<div class="e"><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div>`:`<div class="card empty">No activity yet.</div>`}
    ${ro?"":`<div style="margin-top:26px"><button class="btn block danger" data-act="del-deal" data-id="${esc(c.id)}">${ic("trash",18)} Delete business</button></div>`}
    </div>`;
  } else {
    const k=S.contacts.get(D.id); if(!k){ closeSheet(); return; }
    const t=tierOf(k); const deals=dealsFrom(k.id); const own=k.ownsCompanyId?S.companies.get(k.ownsCompanyId):null; const ro=S.readOnly;
    el.innerHTML=`${ovHead(k.name,null,ro?"":`<button class="hbtn" data-act="edit-contact" data-id="${esc(k.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${avatarP(k,true)}<h2>${esc(k.name)}</h2><div class="sub">${esc([own?own.name:k.firm,k.type].filter(Boolean).join(" · ")||TIERS[t].label)}</div><div class="pills">${t?`<span class="pill ${t}">${t} · ${esc(TIERS[t].label)}</span>`:`<span class="pill">Not tagged</span>`}${k.partner?`<span class="pill">${esc(k.partner)}'s network</span>`:""}${langTag(k.language)}</div></div>
    <div class="bigacts">
      <a class="bigact" ${k.cell?`href="${esc(telHref(k.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${k.cell?`href="${esc(waHref(k.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${k.email?`href="mailto:${esc(k.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      <button class="bigact" data-act="new-deal-from" data-id="${esc(k.id)}" ${ro?'aria-disabled="true"':""}>${ic("bizplus",22)}${t==="A"?"Their business":"Add lead"}</button>
    </div>
    <div class="card box" style="margin-top:14px"><div class="lbl">Next step for ${({A:"an owner",B:"an employee",C:"a potential hire",D:"a great contact"})[t]||"a contact"}</div><div class="next">${esc(TIERS[t].action)}</div>${own?`<div>Owns <a href="#" data-open="${esc(own.id)}">${esc(own.name)}</a> ${stagePill(own.status)}</div>`:""}</div>
    <div class="fsec">Contact details</div>
    <div class="card kv"><div class="k">Cell</div><div class="v">${esc(k.cell||"—")}</div><div class="k">Email</div><div class="v">${esc(k.email||"—")}</div><div class="k">Firm</div><div class="v">${esc(k.firm||"—")}</div><div class="k">Location</div><div class="v">${esc([k.town,k.province].filter(Boolean).join(", ")||"—")}</div><div class="k">Speaks</div><div class="v">${esc(LANGS[k.language]||"—")}</div></div>
    ${k.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(k.notes)}</div>`:""}
    <div class="fsec">Businesses they brought in (${deals.length})</div>
    ${deals.length?`<div class="group">${deals.map(bizRow).join("")}</div>`:`<div class="card empty">None yet. Use “${t==="A"?"Their business":"Add lead"}” above when they introduce one.</div>`}
    ${ro?"":`<div style="margin-top:26px"><button class="btn block danger" data-act="del-contact" data-id="${esc(k.id)}">${ic("trash",18)} Delete person</button></div>`}
    </div>`;
  }
  const b=el.querySelector(".ovb"); if(b&&st) b.scrollTop=st;
}

/* ---------------- Forms ---------------- */
let FORM=null;
const LANG_OPTS=[{v:"af",l:"Afrikaans"},{v:"en",l:"English"},{v:"both",l:"Both"}];
function formHead(title, formId, saveLabel){ return `<div class="ovh"><button type="button" class="hbtn" data-act="close-modal">Cancel</button><div class="ttl">${esc(title)}</div><button type="submit" form="${formId}" class="hbtn save">${esc(saveLabel||"Save")}</button></div>`; }
function defaultPartner(){ const m=myPartner(); return S.partners.includes(m)? m : (S.partners[0]||""); }
function ownerBlock(o,i){ o=o||{}; return `<div class="ownerbox" data-owner="${i}"><div class="ownerbox-h"><span>${i===0?"Owner":"Owner "+(i+1)}</span>${i>0?`<button type="button" class="linkbtn" style="padding:0" data-act="rm-owner" data-i="${i}">Remove</button>`:""}</div><div class="fields">
  <div class="fld"><label for="o${i}n">Name</label><input id="o${i}n" value="${esc(o.name)}" autocomplete="off" autocapitalize="words"></div>
  <div class="fld"><label for="o${i}c">Cell</label><input id="o${i}c" type="tel" inputmode="tel" value="${esc(o.cell)}" placeholder="082 123 4567"></div>
  <div class="fld"><label for="o${i}e">Email</label><input id="o${i}e" type="email" inputmode="email" autocapitalize="off" value="${esc(o.email)}"></div>
  <div class="fld"><label for="o${i}r">Role / shareholding</label><input id="o${i}r" value="${esc(o.role)}" placeholder="e.g. Founder, 60%"></div>
  <div class="fld"><label for="o${i}l">Speaks</label><select id="o${i}l">${opts(LANG_OPTS,o.language||"af")}</select></div></div></div>`; }
function dealForm(id, preset){
  const c = id? JSON.parse(JSON.stringify(S.companies.get(id)||{})) : {status:"lead", followUpMonths:3, owners:[{language:"af"}], source:{}, partner:defaultPartner(), ebit:"Unknown", ...(preset||{})};
  FORM={kind:"deal", id, owners:(c.owners&&c.owners.length?c.owners:[{language:"af"}])};
  const src=c.source||{};
  showModal(`<form id="dealForm" novalidate style="display:contents">${formHead(id?"Edit business":"New business","dealForm")}<div class="ovb">
  <div class="fsec">The business</div>
  <div class="fields">
    <div class="fld"><label for="cName">Business name *</label><input id="cName" value="${esc(c.name)}" autocomplete="off" autocapitalize="words"></div>
    <div class="fld"><label for="cIndustry">Industry</label><select id="cIndustry">${industryOpts(c.industry)}</select></div>
    <div class="fld"><label for="cTown">Town / area</label><input id="cTown" value="${esc(c.town)}" autocapitalize="words"></div>
  </div><div id="dupWarn" class="warnline"></div>
  <div id="owners"></div><button type="button" class="linkbtn" data-act="add-owner" id="addOwnerBtn">+ Add another owner</button>
  <div class="fsec">Who brought it to us?</div>
  <div class="fields"><div class="fld"><label for="sChannel">Source *</label><select id="sChannel">${opts(CHANNELS.map(x=>({v:x.id,l:x.label})),src.channel,"Choose…")}</select></div><div id="srcExtra"></div></div>
  <div id="newContact"></div>
  <div class="fsec">Munger</div>
  <div class="fields">
    <div class="fld"><label for="cPartner">Lead partner</label><select id="cPartner">${opts(S.partners,c.partner,"Unassigned")}</select></div>
    <div class="fld"><label for="cStage">Stage</label><select id="cStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),c.status)}</select></div>
    <div class="fld"><label for="cCad">Check in</label><select id="cCad">${opts(CADENCE.map(x=>({v:x.m,l:x.l})),c.followUpMonths??0)}</select></div>
    <div class="fld"><label for="cNext">Next check-in</label><input id="cNext" type="date" value="${esc(c.nextCheckIn||"")}"></div>
  </div><div class="hint" id="nextHint"></div>
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} More details</summary>
   <div class="fsec">More about the business</div>
   <div class="fields">
    <div class="fld"><label for="cTrading">Trading as</label><input id="cTrading" value="${esc(c.tradingAs)}"></div>
    <div class="fld"><label for="cProvince">Province</label><select id="cProvince">${opts(PROVINCES,c.province,"Choose…")}</select></div>
    <div class="fld"><label for="cEbit">EBIT estimate</label><select id="cEbit">${opts(EBIT,c.ebit)}</select></div>
    <div class="fld"><label for="cTurnover">Turnover estimate</label><input id="cTurnover" value="${esc(c.turnover)}" placeholder="e.g. R180m"></div>
    <div class="fld"><label for="cEmp">Employees</label><input id="cEmp" inputmode="numeric" value="${esc(c.employees)}"></div>
    <div class="fld"><label for="cWeb">Website</label><input id="cWeb" inputmode="url" autocapitalize="off" value="${esc(c.website)}"></div>
    <div class="fld"><label for="cNotes">Notes</label><textarea id="cNotes" placeholder="Succession situation, culture, why it's interesting…">${esc(c.notes)}</textarea></div>
   </div>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save business"}</button></div>
  </div></form>`);
  drawOwners(); drawSrcExtra(src); autoNext(!c.nextCheckIn);
  setTimeout(()=>{ if(!id) $("#cName")?.focus(); },300);
}
function readOwners(){ return FORM.owners.map((o,i)=>({name:$(`#o${i}n`)?.value.trim()||"", role:$(`#o${i}r`)?.value.trim()||"", cell:$(`#o${i}c`)?.value.trim()||"", email:$(`#o${i}e`)?.value.trim()||"", language:$(`#o${i}l`)?.value||"af"})); }
function drawOwners(){ $("#owners").innerHTML=FORM.owners.map(ownerBlock).join(""); $("#addOwnerBtn").style.display=FORM.owners.length>=3?"none":""; }
function drawSrcExtra(src){
  src=src||{}; const ch=CHANNEL[$("#sChannel").value]; const box=$("#srcExtra");
  if(!ch){ box.innerHTML=""; $("#newContact").innerHTML=""; return; }
  if(ch.contact){
    const pool=contacts().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
    box.innerHTML=`<div class="fld"><label for="sContact">${ch.id==="whatsapp"?"Which contact?":"Who referred it?"}</label><select id="sContact"><option value="">Choose a person…</option><option value="__new"${!src.contactId&&!pool.length?" selected":""}>+ Someone new</option>${["A","B","C","D"].map(t=>{const g=pool.filter(k=>tierOf(k)===t); return g.length?`<optgroup label="${t} · ${esc(TIERS[t].label)}s">${g.map(k=>`<option value="${esc(k.id)}"${k.id===src.contactId?" selected":""}>${esc(k.name)}${k.firm?` – ${esc(k.firm)}`:""}</option>`).join("")}</optgroup>`:"";}).join("")}</select></div><div class="fld"><label for="sDetail">Detail</label><input id="sDetail" value="${esc(src.detail)}" placeholder="e.g. met at golf day"></div>`;
    drawNewContact(ch);
  } else if(ch.partner){
    box.innerHTML=`<div class="fld"><label for="sPartner">Whose network?</label><select id="sPartner">${opts(S.partners,src.partner||defaultPartner(),"Choose…")}</select></div><div class="fld"><label for="sDetail">Detail</label><input id="sDetail" value="${esc(src.detail)}"></div>`;
    $("#newContact").innerHTML="";
  } else {
    box.innerHTML=`<div class="fld"><label for="sDetail">Detail</label><input id="sDetail" value="${esc(src.detail)}" placeholder="${ch.id==="direct"?"e.g. letter campaign Nov 2026":ch.id==="mapping"?"e.g. tourism value chain map":"Anything useful"}"></div>`;
    $("#newContact").innerHTML="";
  }
}
function drawNewContact(ch){
  const nc=$("#newContact"); if(!nc) return;
  if($("#sContact")?.value!=="__new"){ nc.innerHTML=""; return; }
  const t=CHANNEL_TO_TIER[ch.id]||"C";
  nc.innerHTML=`<div class="ownerbox"><div class="ownerbox-h"><span>New person (added to People)</span></div><div class="fields">
   <div class="fld"><label for="nkName">Name *</label><input id="nkName" autocapitalize="words"></div>
   <div class="fld"><label for="nkCell">Cell</label><input id="nkCell" type="tel" inputmode="tel"></div>
   <div class="fld"><label for="nkFirm">Firm / company</label><input id="nkFirm"></div>
   <div class="fld"><label for="nkTier">Tag</label><select id="nkTier">${opts(["A","B","C","D"].map(x=>({v:x,l:`${x} · ${TIERS[x].label}`})),t)}</select></div>
   <div class="fld"><label for="nkType">Type</label><select id="nkType">${opts(TIERS[t].types,CHANNEL_TO_TYPE[ch.id])}</select></div>
   <div class="fld"><label for="nkPartner">Whose network</label><select id="nkPartner">${opts(S.partners,$("#cPartner")?.value||defaultPartner(),"—")}</select></div>
   <div class="fld"><label for="nkEmail">Email</label><input id="nkEmail" type="email" autocapitalize="off"></div>
   <div class="fld"><label for="nkLang">Speaks</label><select id="nkLang">${opts(LANG_OPTS,"af")}</select></div></div></div>`;
}
function autoNext(force){ const m=Number($("#cCad").value); const el=$("#cNext"); if(m && (force || !el.value)){ el.value=addMonths(today(),m); } $("#nextHint").textContent = m? "The next date moves forward automatically each time someone logs a check-in." : ""; }
function dupCheck(){
  const v=$("#cName").value.trim().toLowerCase(); const w=$("#dupWarn"); if(!v||v.length<3){ w.textContent=""; return; }
  const hit=companies().find(c=>c.id!==FORM.id && ((c.name||"").toLowerCase()===v || ((c.name||"").toLowerCase().includes(v) && v.length>5)));
  w.innerHTML = hit? `Already in Munger: <a href="#" data-act="open-dup" data-id="${esc(hit.id)}">${esc(hit.name)}</a> · ${esc(STAGE[hit.status]?.label||"")}${hit.partner?` · ${esc(hit.partner)}`:""}` : "";
}
async function submitDeal(){
  const name=$("#cName").value.trim(); if(!name){ toast("Add the business name"); $("#cName").focus(); return; }
  const channel=$("#sChannel").value; if(!channel){ toast("Choose who brought it to us"); $("#sChannel").focus(); return; }
  const ch=CHANNEL[channel]; const source={channel, detail:$("#sDetail")?.value.trim()||""};
  let newContact=null;
  if(ch.contact){
    const sel=$("#sContact").value;
    if(sel==="__new"){ const nm=$("#nkName").value.trim(); if(!nm){ toast("Add the name of the person who referred it"); $("#nkName").focus(); return; }
      const kid=newId(); newContact={id:kid, data:{name:nm, firm:$("#nkFirm").value.trim(), tier:$("#nkTier").value, type:$("#nkType").value, partner:$("#nkPartner").value, cell:$("#nkCell").value.trim(), email:$("#nkEmail").value.trim(), language:$("#nkLang").value, province:$("#cProvince").value, town:"", notes:""}}; source.contactId=kid; }
    else if(sel) source.contactId=sel;
  }
  if(ch.partner) source.partner=$("#sPartner").value;
  const owners=readOwners().filter(o=>o.name||o.email||o.cell);
  const prev=FORM.id? S.companies.get(FORM.id):null;
  const status=$("#cStage").value;
  const data={
    name, tradingAs:$("#cTrading").value.trim(), industry:$("#cIndustry").value, province:$("#cProvince").value, town:$("#cTown").value.trim(),
    website:$("#cWeb").value.trim(), ebit:$("#cEbit").value, turnover:$("#cTurnover").value.trim(), employees:$("#cEmp").value.trim(),
    owners, language: owners.length? (new Set(owners.map(o=>o.language)).size>1?"both":owners[0].language) : "",
    source, partner:$("#cPartner").value, status, followUpMonths:Number($("#cCad").value), nextCheckIn:$("#cNext").value||"",
    notes:$("#cNotes").value.trim(), lastContact: prev?.lastContact||"", log: prev?.log? [...prev.log] : [],
    createdByName: prev?.createdByName||await myName(), example: prev?.example||false
  };
  if(!prev) data.log.push({d:today(), by:data.createdByName, text:`Captured · ${ch.label}`});
  else if(prev.status!==status) data.log.push({d:today(), by:await myName(), text:`Stage: ${STAGE[prev.status]?.label||"—"} → ${STAGE[status].label}`});
  const btns=document.querySelectorAll('button[type=submit]'); btns.forEach(b=>b.disabled=true);
  if(newContact){ const ok=await dbSet("contacts/"+newContact.id, newContact.data); if(!ok){ btns.forEach(b=>b.disabled=false); return; } }
  const id=FORM.id||newId();
  const ok=await dbSet("companies/"+id, data);
  btns.forEach(b=>b.disabled=false);
  if(ok){
    const sk=source.contactId&&S.contacts.get(source.contactId);
    if(!FORM.id && sk && tierOf(sk)==="A" && !sk.ownsCompanyId && FORM.fromOwner===sk.id) await dbUpdate("contacts/"+sk.id,{ownsCompanyId:id});
    toast(FORM.id?"Saved":"Business added");
    if(sheetOpen() && S.sheet?.kind==="company" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("company",id,true);
  }
}
async function myName(){ return S.me?.name || ""; }

function contactForm(id, preset){
  const k=id? {...S.contacts.get(id)} : {language:"af", partner:defaultPartner(), tier:"", ...(preset||{})};
  const tier=id? tierOf(k) : (k.tier||"");
  FORM={kind:"contact", id};
  const comps=companies().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  showModal(`<form id="contactForm" novalidate style="display:contents">${formHead(id?"Edit person":"New person","contactForm")}<div class="ovb">
  <div class="fsec">Who is this?</div>
  <div class="tierpick" role="radiogroup">${["A","B","C","D"].map(t=>`<label><input type="radio" name="kTier" value="${t}" ${tier===t?"checked":""}><span class="avatar ${t}" style="width:38px;height:38px;font-family:var(--display)">${t}</span><span class="tt"><b>${esc(TIERS[t].label)}</b><span>${esc(TIERS[t].desc)}</span></span></label>`).join("")}</div>
  <div class="fsec">Details</div>
  <div class="fields">
   <div class="fld"><label for="kName">Name *</label><input id="kName" value="${esc(k.name)}" autocomplete="off" autocapitalize="words"></div>
   <div class="fld"><label for="kCell">Cell</label><input id="kCell" type="tel" inputmode="tel" value="${esc(k.cell)}"></div>
   <div class="fld"><label for="kFirm" id="kFirmL">${tier==="A"?"Their business":"Firm / company"}</label><input id="kFirm" value="${esc(k.firm)}"></div>
   <div class="fld"><label for="kPartner">Whose network</label><select id="kPartner">${opts(S.partners,k.partner,"—")}</select></div>
  </div><div id="kDup" class="warnline"></div>
  <div id="kAddBizWrap" ${tier==="A"&&!id?"":"hidden"}><label class="check"><input type="checkbox" id="kAddBiz" checked> Add their business to Businesses next</label></div>
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} More details</summary>
   <div class="fsec">More</div>
   <div class="fields">
    <div class="fld"><label for="kType">Type</label><select id="kType">${opts(tier?TIERS[tier].types:CONTACT_TYPES,k.type,"Choose…")}</select></div>
    <div class="fld"><label for="kEmail">Email</label><input id="kEmail" type="email" inputmode="email" autocapitalize="off" value="${esc(k.email)}"></div>
    <div class="fld"><label for="kLang">Speaks</label><select id="kLang">${opts(LANG_OPTS,k.language||"af")}</select></div>
    <div class="fld"><label for="kProv">Province</label><select id="kProv">${opts(PROVINCES,k.province,"Choose…")}</select></div>
    <div class="fld"><label for="kTown">Town / area / sector they know</label><input id="kTown" value="${esc(k.town)}"></div>
    <div class="fld" id="kOwnsWrap" ${tier==="A"?"":"hidden"}><label for="kOwns">Their business in Munger</label><select id="kOwns">${opts(comps.map(c=>({v:c.id,l:c.name})),k.ownsCompanyId,"Not added yet")}</select></div>
    <div class="fld"><label for="kNotes">Notes</label><textarea id="kNotes" placeholder="How we know them, who they know…">${esc(k.notes)}</textarea></div>
   </div>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save person"}</button></div>
  </div></form>`);
  setTimeout(()=>{ if(!id) $("#kName")?.focus(); },300);
}
function contactDupCheck(){
  const w=$("#kDup"); if(!w) return;
  const nm=$("#kName").value.trim().toLowerCase(), cell=phoneKey($("#kCell").value), em=($("#kEmail")?.value||"").trim().toLowerCase();
  const hit=contacts().find(c=>c.id!==FORM.id && ((nm.length>3&&(c.name||"").toLowerCase()===nm) || (cell&&phoneKey(c.cell)===cell) || (em&&(c.email||"").toLowerCase()===em)));
  w.innerHTML=hit?`Already in Munger: <a href="#" data-act="open-dup-contact" data-id="${esc(hit.id)}">${esc(hit.name)}</a>${hit.partner?` (${esc(hit.partner)}'s network)`:""}. Agree who calls so nobody calls twice.`:"";
}
async function submitContact(){
  const name=$("#kName").value.trim(); if(!name){ toast("Add a name"); $("#kName").focus(); return; }
  const tier=(document.querySelector('input[name=kTier]:checked')||{}).value; if(!tier){ toast("Tap A, B or C first"); return; }
  const prev=FORM.id? S.contacts.get(FORM.id):null;
  const data={name, tier, firm:$("#kFirm").value.trim(), type:$("#kType").value, partner:$("#kPartner").value, ownsCompanyId: tier==="A"?($("#kOwns").value||""):"", cell:$("#kCell").value.trim(), email:$("#kEmail").value.trim(), language:$("#kLang").value, province:$("#kProv").value, town:$("#kTown").value.trim(), notes:$("#kNotes").value.trim(), example:prev?.example||false};
  const id=FORM.id||newId();
  const addBiz=!FORM.id && tier==="A" && !data.ownsCompanyId && $("#kAddBiz")?.checked;
  if(await dbSet("contacts/"+id,data)){
    toast(FORM.id?"Saved":"Added to People");
    if(addBiz){ ownerDealForm(id); return; }
    if(sheetOpen() && S.sheet?.kind==="contact" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("contact",id,true);
  }
}
function ownerDealForm(contactId){
  const kk=S.contacts.get(contactId); const t=tierOf(kk); const map={"Accountant / auditor":"accounting","Attorney":"law","Tax advisor":"tax","Banker / financier":"bank","Business broker":"broker","Friend":"friend"};
  const preset={source:{channel:t==="A"?"whatsapp":(map[kk?.type]||"connector"),contactId}, partner:kk?.partner||defaultPartner()};
  if(t==="A"){ preset.name=kk.firm||""; preset.province=kk.province||""; preset.town=kk.town||""; preset.owners=[{name:kk.name,cell:kk.cell||"",email:kk.email||"",language:kk.language||"af",role:kk.type||""}]; }
  dealForm(null,preset); FORM.fromOwner = t==="A"? contactId : null;
}
function captureChooser(){
  if(S.readOnly) return;
  showModal(`${ovHead("Capture",`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb"><div class="choice">
   <button type="button" data-act="new-contact"><span class="ci">${ic("userplus",24)}</span><span><b>A person</b><span>An owner, an employee, a potential hire, or an influential person we want in our network.</span></span></button>
   <button type="button" data-act="new-deal"><span class="ci">${ic("bizplus",24)}</span><span><b>A business</b><span>A company we might want to buy.</span></span></button>
   <button type="button" data-act="new-partner"><span class="ci">${ic("bank",24)}</span><span><b>A partner</b><span>A bank, funder, accounting or law firm, or advisor that helps us do deals.</span></span></button>
  </div></div>`, true);
}
function quickCheckin(id){
  const c=S.companies.get(id); if(!c) return; const m=Number(c.followUpMonths)||0;
  showModal(`${ovHead("Log check-in",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 12px;font-size:15px">Spoke to <b>${esc(firstOwner(c)?.name||c.name)}</b>?${m?` The next check-in moves to <b>${esc(fmtD(addMonths(today(),m)))}</b>.`:""}</p>
   <div class="fields"><div class="fld"><label for="qNote">What was discussed? (optional)</label><textarea id="qNote" placeholder="Still not selling, son joining the business…"></textarea></div>
   ${m?"":`<div class="fld"><label for="qCad">Check in again</label><select id="qCad">${opts(CADENCE.map(x=>({v:x.m,l:x.l})),3)}</select></div>`}</div>
   <div style="margin-top:14px"><button class="btn primary block" data-act="do-checkin" data-id="${esc(c.id)}">${ic("check",18)} Log check-in</button></div></div>`, true);
}
function confirmBox(title, text, okLabel, fn){
  showModal(`${ovHead(title,`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><p style="margin:0 2px 16px;font-size:15.5px">${esc(text)}</p><button class="btn primary block" id="okBtn">${esc(okLabel)}</button></div>`, true);
  $("#okBtn").onclick=async()=>{ $("#okBtn").disabled=true; await fn(); };
}

/* ---------------- Actions ---------------- */
async function checkIn(id, noteOnly, noteText, cadence){
  const c=S.companies.get(id); if(!c) return false;
  const txt=(noteText||"").trim();
  if(noteOnly && !txt){ toast("Type a note first"); return false; }
  const by=await myName(); const log=[...(c.log||[])];
  const patch={};
  if(noteOnly){ log.push({d:today(),by,text:txt}); }
  else { let m=Number(c.followUpMonths)||0; if(!m && cadence){ m=Number(cadence); patch.followUpMonths=m; } patch.lastContact=today(); patch.nextCheckIn= m? addMonths(today(),m) : ""; log.push({d:today(),by,text:"Checked in"+(txt?`: ${txt}`:"")+(m?` · next ${fmtD(patch.nextCheckIn)}`:"")}); }
  patch.log=log.slice(-200);
  const ok=await dbUpdate("companies/"+id, patch);
  if(ok) toast(noteOnly?"Note saved":"Check-in logged");
  return ok;
}
function csv(rows){ return rows.map(r=>r.map(v=>{ const s=String(v??""); return /[",\n;]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }).join(",")).join("\r\n"); }
async function download(filename, rows){
  const text="﻿"+csv(rows);
  try{ const blob=new Blob([text],{type:"text/csv;charset=utf-8"}); const file=new File([blob],filename,{type:"text/csv"});
    if(navigator.canShare && navigator.canShare({files:[file]}) && /iphone|ipad|android/i.test(navigator.userAgent)){ await navigator.share({files:[file],title:filename}); return; }
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},1000); }
  catch(e){ if(e?.name!=="AbortError") showOut(filename, csv(rows)); }
}
function showOut(title, text){
  showModal(`${ovHead(title,`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb"><div class="out">${esc(text)}</div><div style="margin-top:14px"><button class="btn primary block" data-act="copy" data-t="${esc(text)}">Copy</button></div></div>`, true);
}
function dealRows(list){
  const head=["Company","Trading as","Sector","Industry","Province","Town","Stage","Lead partner","Source","Referred by","EBIT","Turnover","Next check-in","Last contact","Cadence (months)","Owner 1","Owner 1 cell","Owner 1 email","Owner 1 language","Owner 2","Owner 2 cell","Owner 2 email","Owner 3","Owner 3 cell","Owner 3 email","Notes"];
  return [head, ...list.map(c=>{ const o=c.owners||[]; const k=c.source?.contactId?S.contacts.get(c.source.contactId):null; return [c.name,c.tradingAs,sectorOf(c),industryShort(c),c.province,c.town,STAGE[c.status]?.label,c.partner,CHANNEL[c.source?.channel]?.label,k?k.name:(c.source?.partner||""),c.ebit,c.turnover,c.nextCheckIn,c.lastContact,c.followUpMonths,o[0]?.name,o[0]?.cell,o[0]?.email,LANGS[o[0]?.language]||"",o[1]?.name,o[1]?.cell,o[1]?.email,o[2]?.name,o[2]?.cell,o[2]?.email,c.notes]; })];
}
function contactRows(){ return [["Tag","Name","Firm","Type","Whose network","Cell","Email","Language","Province","Town","Businesses introduced","Notes"], ...contacts().map(k=>[`${tierOf(k)} – ${TIERS[tierOf(k)].label}`,k.name,k.firm,k.type,k.partner,k.cell,k.email,LANGS[k.language]||"",k.province,k.town,dealsFrom(k.id).length,k.notes])]; }

/* ---------------- Import ---------------- */
function existingKeys(){ const s=new Set(); contacts().forEach(k=>{ const p=phoneKey(k.cell); if(p) s.add("p"+p); if(k.email) s.add("e"+k.email.trim().toLowerCase()); const n=normName(k.name); if(n) s.add("n"+n); }); return s; }
function markExisting(rows){ const s=existingKeys(); rows.forEach(r=>{ const p=phoneKey(r.cell); r.exists = (p&&s.has("p"+p)) || (r.email&&s.has("e"+r.email.trim().toLowerCase())) || (normName(r.name)&&s.has("n"+normName(r.name))); }); return rows; }
function dedupeRows(rows){ const seen=new Set(); const out=[]; for(const r of rows){ r.name=(r.name||"").trim(); r.cell=(r.cell||"").trim(); r.email=(r.email||"").trim(); r.firm=(r.firm||"").trim(); if(!r.name && !r.cell && !r.email) continue; if(!r.name) r.name=r.cell||r.email; const key=phoneKey(r.cell)||r.email.toLowerCase()||r.name.toLowerCase(); if(seen.has(key)) continue; seen.add(key); out.push(r); } return out.sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:"base"})).map((r,i)=>({...r,i})); }
function loadImport(rows, source){ const I=S.imp; I.rows=markExisting(dedupeRows(rows)); I.tags={}; I.q=""; I.shown=60; I.source=source; I.partner=I.partner||defaultPartner(); if(!I.rows.length){ toast("No contacts found in that file"); } render(); window.scrollTo(0,0); }
function decodeQP(s){ try{ const bytes=[]; s=s.replace(/=\r?\n/g,""); for(let i=0;i<s.length;i++){ if(s[i]==="="&&/^[0-9A-F]{2}$/i.test(s.substr(i+1,2))){ bytes.push(parseInt(s.substr(i+1,2),16)); i+=2; } else bytes.push(s.charCodeAt(i)); } return new TextDecoder().decode(new Uint8Array(bytes)); }catch(e){ return s; } }
function vUnesc(v){ return v.replace(/\\n/gi," ").replace(/\\([,;\\])/g,"$1"); }
function parseVCF(text){
  text=text.replace(/\r?\n[ \t]/g,""); const out=[];
  for(const card of text.split(/BEGIN:VCARD/i).slice(1)){
    let fn="",n="",org=""; const tels=[], emails=[];
    for(const line of card.split(/\r?\n/)){
      const i=line.indexOf(":"); if(i<0) continue; const key=line.slice(0,i).toUpperCase(); let val=line.slice(i+1).trim();
      if(/QUOTED-PRINTABLE/.test(key)) val=decodeQP(val);
      const base=key.split(";")[0].replace(/^ITEM\d+\./,"");
      if(base==="FN") fn=vUnesc(val); else if(base==="N") n=vUnesc(val); else if(base==="ORG") org=vUnesc(val.split(";")[0]);
      else if(base==="TEL") tels.push({v:val.replace(/^tel:/i,""),cell:/CELL|MOBILE|IPHONE/.test(key)}); else if(base==="EMAIL") emails.push(val);
    }
    const nm=fn || n.split(";").slice(0,2).reverse().join(" ").trim();
    out.push({name:nm, cell:(tels.find(t=>t.cell)||tels[0]||{}).v||"", email:emails[0]||"", firm:org});
  }
  return out;
}
function parseCSVText(t){ const rows=[]; let row=[], f="", q=false; for(let i=0;i<t.length;i++){ const ch=t[i]; if(q){ if(ch==='"'){ if(t[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=ch; } else { if(ch==='"') q=true; else if(ch===","||ch===";"&&!t.slice(0,200).includes(",")){ row.push(f); f=""; } else if(ch==="\n"||ch==="\r"){ if(ch==="\r"&&t[i+1]==="\n") i++; row.push(f); rows.push(row); row=[]; f=""; } else f+=ch; } } if(f||row.length){ row.push(f); rows.push(row); } return rows.filter(r=>r.some(x=>String(x).trim())); }
function parseCSV(text){
  const rows=parseCSVText(text.replace(/^﻿/,"")); if(!rows.length) return [];
  const h=rows[0].map(x=>String(x).trim().toLowerCase());
  const idx=(...res)=>h.findIndex(x=>res.some(r=>r.test(x)));
  const iName=idx(/^name$/,/^full ?name$/,/^display name$/,/^contact( name)?$/,/^naam$/,/^file as$/);
  const iFirst=idx(/^first name$/,/^given name$/,/^voornaam$/), iMid=idx(/^middle name$/), iLast=idx(/^last name$/,/^family name$/,/^surname$/,/^van$/);
  let iPhone=h.findIndex(x=>/(mobile|cell|selfoon)/.test(x)&&!/(type|label)/.test(x)); if(iPhone<0) iPhone=h.findIndex(x=>/(phone|tel|number|nommer)/.test(x)&&!/(type|label|fax)/.test(x));
  const iEmail=h.findIndex(x=>/e-?mail/.test(x)&&!/(type|label)/.test(x));
  const iOrg=idx(/organi[sz]ation( 1)?( - )?name/,/^organi[sz]ation$/,/^company( name)?$/,/^firm$/,/^business$/,/^maatskappy$/);
  const hasHeader = iName>=0||iFirst>=0||iPhone>=0||iEmail>=0;
  const body = hasHeader? rows.slice(1) : rows;
  const first=v=>String(v||"").split(":::")[0].trim();
  return body.map(r=>{
    let name = iName>=0? r[iName] : [iFirst,iMid,iLast].filter(i=>i>=0).map(i=>r[i]).filter(Boolean).join(" ");
    if(!hasHeader){ name=r[0]; }
    const cell = hasHeader? first(r[iPhone]) : first(r.slice(1).find(x=>/\d{6,}/.test(String(x).replace(/\D/g,""))));
    return {name:String(name||"").trim(), cell, email: iEmail>=0? first(r[iEmail]) : first(r.find(x=>/@/.test(x))), firm: iOrg>=0? String(r[iOrg]||"").trim() : ""};
  });
}
function parsePaste(text){
  return text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
    const email=(l.match(/[^\s,;<>]+@[^\s,;<>]+\.[a-z]{2,}/i)||[""])[0];
    const ph=(l.match(/\+?\d[\d\s()-]{7,}\d/)||[""])[0];
    let name=l.replace(email,"").replace(ph,"").replace(/[,;\t|<>:-]+/g," ").replace(/\s+/g," ").trim();
    return {name, cell:ph.trim(), email, firm:""};
  });
}
async function handleImportFile(file){
  if(!file) return; const text=await file.text();
  const isV=/\.vcf$/i.test(file.name)||/BEGIN:VCARD/i.test(text.slice(0,2000));
  loadImport(isV? parseVCF(text) : parseCSV(text), file.name);
}
async function importFromPhone(){
  try{ const res=await navigator.contacts.select(["name","tel","email"],{multiple:true}); if(!res?.length) return;
    loadImport(res.map(c=>({name:(c.name||[])[0]||"", cell:(c.tel||[])[0]||"", email:(c.email||[])[0]||"", firm:""})), "your phone"); }
  catch(e){ toast("Couldn't open your contacts"); }
}
function impVisible(){ const I=S.imp; const q=I.q.trim().toLowerCase(); return I.rows.filter(r=>(!I.hideExisting||!r.exists) && (!q || [r.name,r.cell,r.email,r.firm].join(" ").toLowerCase().includes(q))); }
function impRow(r){ const t=S.imp.tags[r.i]||""; return `<div class="imp-row ${r.exists?"exists":""}" data-row="${r.i}"><div class="main"><div class="t1">${esc(r.name)}</div><div class="t2">${esc(r.exists?"Already in Munger":[r.firm,r.cell,r.email].filter(Boolean).join(" · ")||"No number")}</div></div>${r.exists?"":`<div class="tagbtns">${["A","B","C","D"].map(x=>`<button class="${x}${t===x?" on":""}" data-act="imp-tag" data-i="${r.i}" data-k="${x}" aria-label="Tag ${esc(r.name)} as ${x}">${x}</button>`).join("")}</div>`}</div>`; }
function impCount(){ return Object.values(S.imp.tags).filter(Boolean).length; }
function impListHTML(){ const vis=impVisible(); const shown=vis.slice(0,S.imp.shown); return shown.length? `<div class="group">${shown.map(impRow).join("")}</div>${vis.length>shown.length?`<div style="text-align:center;margin:14px 0"><button class="btn sm" data-act="imp-more">Show more (${vis.length-shown.length} left)</button></div>`:""}` : `<div class="card empty">No contacts match.</div>`; }
function vImport(){
  const I=S.imp; const hasPicker=("contacts" in navigator)&&("select" in (navigator.contacts||{}));
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(!I.rows.length) return `<div class="ph"><div><h1>Import contacts</h1><p>Bring in your contacts, then tap A, B or C next to the people who matter. Only the ones you tag are saved.</p></div></div>
  <div class="choice">
   ${hasPicker?`<button type="button" data-act="imp-picker"><span class="ci">${ic("people",24)}</span><span><b>Choose from this phone</b><span>Pick the contacts you want from your address book.</span></span></button>`:""}
   <label class="choice-file filepick" style="display:block"><button type="button" tabindex="-1" style="width:100%;display:flex;gap:14px;align-items:center;padding:16px;border-radius:var(--r);border:1px solid var(--line);background:var(--surface);text-align:left;pointer-events:none"><span class="ci" style="width:44px;height:44px;border-radius:12px;background:var(--soft);display:grid;place-items:center;flex:none">${ic("upload",24)}</span><span><b style="display:block;font-size:17px">Upload a contacts file</b><span style="font-size:14px;color:var(--muted)">A .vcf (vCard) or .csv export from your phone, Google or Outlook.</span></span></button><input type="file" id="impFile" accept=".vcf,.csv,.txt,text/vcard,text/x-vcard,text/csv" aria-label="Upload a contacts file"></label>
  </div>
  <div class="fsec">Or paste a list</div>
  <div class="fields"><div class="fld"><label for="impPaste">One person per line: name and number (and email if you have it)</label><textarea id="impPaste" rows="5" placeholder="Johan Botha 082 555 0101&#10;Sarah Naidoo, 083 555 0202, sarah@firm.co.za"></textarea></div></div>
  <div style="margin-top:10px"><button class="btn block" data-act="imp-paste">Use this list</button></div>
  <div class="fsec">How to get your contacts file</div>
  <div class="card box howto">
   ${ios?"":""}<div><b>iPhone</b><ol style="margin:4px 0 0;padding-left:18px"><li>On a computer, go to <b>icloud.com/contacts</b> and sign in.</li><li>Select all (Ctrl/Cmd + A), click the share icon, then <b>Export vCard</b>.</li><li>Open Munger on that computer and upload the file here.</li></ol></div>
   <div><b>Android</b><ol style="margin:4px 0 0;padding-left:18px"><li>${hasPicker?"Easiest: use <b>Choose from this phone</b> above.":"Open <b>Contacts</b> → menu → <b>Settings</b> → <b>Export</b> to a .vcf file."}</li><li>Or go to <b>contacts.google.com</b> → <b>Export</b> → Google CSV.</li></ol></div>
   <div><b>Excel or Outlook</b> · Save the sheet as <b>CSV</b> with columns like Name, Mobile, Email, Company.</div>
  </div>`;
  const tagged=impCount(); const vis=impVisible(); const ex=I.rows.filter(r=>r.exists).length;
  return `<div class="ph"><div><h1>Tag who matters</h1><p>${I.rows.length} contacts from ${esc(I.source)}${ex?` · ${ex} already in Munger`:""}. Tap A, B or C; skip everyone else.</p></div></div>
  <div class="card box" style="margin-bottom:12px;gap:6px"><div style="display:flex;gap:14px;flex-wrap:wrap">${["A","B","C","D"].map(t=>`<span style="display:flex;gap:8px;align-items:center;font-size:14px"><span class="avatar ${t}" style="width:26px;height:26px;font-size:12px;font-family:var(--display)">${t}</span>${esc(TIERS[t].label)}</span>`).join("")}</div></div>
  <div class="fields" style="margin-bottom:12px"><div class="fld"><label for="impPartner">Whose network are they in (our team)?</label><select id="impPartner">${opts(S.partners,I.partner)}</select></div><div class="fld"><label for="impRel">How do you know most of them?</label><select id="impRel">${opts(Object.entries(RELS).map(([v,l])=>({v,l})),I.rel||"business")}</select></div><div class="fld"><label for="impLang">Most of them speak</label><select id="impLang">${opts(LANG_OPTS,I.lang)}</select></div></div>
  <div class="search">${ic("search",20)}<input id="impQ" type="search" placeholder="Search ${I.rows.length} contacts…" value="${esc(I.q)}" autocomplete="off" aria-label="Search imported contacts"></div>
  <div id="impList">${impListHTML()}</div>
  <div style="height:76px"></div>
  <div class="impbar"><button class="btn" data-act="imp-reset">Start over</button><button class="btn primary" id="impSave" data-act="imp-save" ${tagged?"":"disabled"}>Save ${tagged} ${tagged===1?"person":"people"}</button></div>`;
}
async function importSave(){
  const I=S.imp; const rows=I.rows.filter(r=>I.tags[r.i]&&!r.exists);
  if(!rows.length) return;
  const typeFor={A:"Business owner",B:"",C:""};
  const recs=rows.map(r=>({id:newId(), ...toRow("contacts",{name:r.name, tier:I.tags[r.i], type:typeFor[I.tags[r.i]], firm:r.firm||"", partner:I.partner, cell:r.cell||"", email:r.email||"", language:I.lang, province:"", town:"", notes:""})}));
  const btn=$("#impSave"); if(btn){ btn.disabled=true; btn.textContent="Saving…"; }
  for(let i=0;i<recs.length;i+=200){ const {error}=await sb.from("contacts").insert(recs.slice(i,i+200)); if(error){ writeErr(error); if(btn){ btn.disabled=false; btn.textContent="Try again"; } return; } }
  await loadContacts();
  toast(`${recs.length} ${recs.length===1?"person":"people"} added to People`);
  S.imp={rows:[], tags:{}, partner:I.partner, lang:I.lang, q:"", shown:60, hideExisting:true, source:""};
  S.k.tier=""; location.hash="people"; render();
}

/* ---------------- Events ---------------- */
document.addEventListener("click", async e=>{
  const t=e.target.closest("[data-act],[data-open],[data-contact]"); if(!t) return;
  if(t.dataset.open){ e.preventDefault(); if(modalOpen()) hideModalKeepLayer(); openSheet("company",t.dataset.open); return; }
  if(t.dataset.contact){ e.preventDefault(); if(modalOpen()) hideModalKeepLayer(); openSheet("contact",t.dataset.contact); return; }
  const a=t.dataset.act, k=t.dataset.k, id=t.dataset.id;
  switch(a){
    case "capture": captureChooser(); break;
    case "new-deal": if(!S.readOnly) dealForm(); break;
    case "new-contact": if(!S.readOnly) contactForm(); break;
    case "goto-import": closeModal(); setTimeout(()=>{ location.hash="import"; },60); break;
    case "close-sheet": closeSheet(); break;
    case "close-modal": closeModal(); break;
    case "reload": S.stale=false; startData(); break;
    case "dismiss-install": try{ localStorage.setItem("munger-install-hint","1"); }catch(_){} render(); break;
    case "scope": S.scope=k; render(); break;
    case "biz-active": S.f.group="target"; break;
    case "goto": location.hash=t.dataset.v; break;
    case "sign-out": await sb.auth.signOut(); break;
    case "change-pw": { const pw=$("#newPw").value; if(pw.length<8){ toast("Use at least 8 characters"); break; } const {error}=await sb.auth.updateUser({password:pw}); if(error) toast(error.message); else { $("#newPw").value=""; toast("Password changed"); } break; }
    case "add-member": { const name=$("#mName").value.trim(), email=$("#mEmail").value.trim(), pw=$("#mPw").value.trim(); if(!name||!email){ toast("Enter a name and email"); break; }
      const {error}=await sb.rpc("add_member",{p_email:email,p_name:name,p_password:pw,p_admin:$("#mAdmin").checked}); if(error){ toast(error.message); break; }
      await loadMembers(); if(!S.partners.includes(name)){ const ps=S.partners.filter(p=>!/^Partner \d$/.test(p)); ps.push(name); await dbSet("settings/team",{partners:ps}); }
      showOut("Send this to "+name, `Munger app: ${location.origin+location.pathname}\nEmail: ${email.toLowerCase()}\nPassword: ${pw}\n\nOpen the link on your phone, sign in, then add it to your home screen.`); break; }
    case "remove-member": { const m=S.members.find(x=>x.user_id===id); confirmBox("Remove team member?", `${m?.name||m?.email} will no longer be able to sign in. Their records stay.`, "Remove", async()=>{ const {error}=await sb.rpc("remove_member",{p_user_id:id}); if(error) toast(error.message); else { toast("Removed"); await loadMembers(); } closeModal(); }); break; }
    case "save-partners": { const p=[...Array(12).keys()].map(i=>$("#p"+i)?.value.trim()).filter(Boolean); if(await dbSet("settings/team",{partners:p})) toast("Partners saved"); break; }
    case "new-deal-from": ownerDealForm(id); break;
    case "edit-deal": dealForm(id); break;
    case "edit-contact": contactForm(id); break;
    case "del-deal": { if(!S.me?.is_admin){ toast("Only an admin can delete"); break; } const c=S.companies.get(id); confirmBox(isPartnerCo(c)?"Delete partner?":"Delete business?", `${c?.name||"This business"} and its activity will be removed for the whole team.`, "Delete", async()=>{ if(await dbDel("companies/"+id)){ closeAll(); toast("Deleted"); } }); break; }
    case "del-contact": { if(!S.me?.is_admin){ toast("Only an admin can delete"); break; } const kk=S.contacts.get(id); const n=dealsFrom(id).length; confirmBox("Delete person?", `${kk?.name||"This person"} will be removed.${n?` ${n} business${n>1?"es":""} will lose the referral link.`:""}`, "Delete", async()=>{ if(await dbDel("contacts/"+id)){ closeAll(); toast("Deleted"); } }); break; }
    case "add-owner": FORM.owners=readOwners(); if(FORM.owners.length<3) FORM.owners.push({language:FORM.owners[0]?.language||"af"}); drawOwners(); break;
    case "rm-owner": FORM.owners=readOwners(); FORM.owners.splice(Number(t.dataset.i),1); drawOwners(); break;
    case "open-dup": e.preventDefault(); hideModalKeepLayer(); openSheet("company",id); break;
    case "open-dup-contact": e.preventDefault(); hideModalKeepLayer(); openSheet("contact",id); break;
    case "quick-checkin": e.stopPropagation(); if(!S.readOnly) quickCheckin(id); break;
    case "do-checkin": { t.disabled=true; const ok=await checkIn(id,false,$("#qNote")?.value||"",$("#qCad")?.value); t.disabled=false; if(ok){ closeModal(); } break; }
    case "add-note": { const ok=await checkIn(id,true,$("#noteTxt")?.value||""); if(ok){ const n=$("#noteTxt"); if(n) n.value=""; renderSheet(); } break; }
    case "copy": copyText(t.dataset.t); break;
    case "k-tier": S.k.tier=(S.k.tier===k?"":k); render(); break;
    case "k-mine": S.k.mine=!S.k.mine; render(); break;
    case "f-group": S.f.group=k; render(); break;
    case "f-mine": S.f.mine=!S.f.mine; render(); break;
    case "f-sheet": filterSheet(); break;
    case "f-clear": S.f={...S.f, sector:"", partner:"", province:"", channel:"", lang:""}; closeModal(); render(); break;
    case "l-lang": S.lists.lang=k; render(); break;
    case "l-group": { const g=S.lists.groups; S.lists.groups=g.includes(k)?g.filter(x=>x!==k):[...g,k]; render(); break; }
    case "l-tier": { const ts=S.lists.tiers; S.lists.includeContacts=true; S.lists.tiers=ts.includes(k)?ts.filter(x=>x!==k):[...ts,k]; render(); break; }
    case "copy-emails": copyText(listRows().filter(r=>r.email).map(r=>r.email).join("; ")); break;
    case "copy-cells": copyText(listRows().filter(r=>r.cell).map(r=>r.cell).join("\n")); break;
    case "export-list": download(`munger-${S.lists.lang==="af"?"afrikaans":"english"}-list-${today()}.csv`, [["Name","Organisation","Type","Email","Cell","Language"], ...listRows().map(r=>[r.name,r.org,r.kind,r.email,r.cell,LANGS[r.lang]||""])]); break;
    case "export-deals": download(`munger-businesses-${today()}.csv`, dealRows(filteredDeals())); break;
    case "export-deals-all": download(`munger-all-businesses-${today()}.csv`, dealRows(companies())); break;
    case "export-follow": download(`munger-checkins-${today()}.csv`, dealRows(companies().filter(c=>c.nextCheckIn&&isOpen(c)).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn)))); break;
    case "export-contacts": download(`munger-people-${today()}.csv`, contactRows()); break;
    case "net-open": { const [kind,nid]=k.split(":"); if(kind==="c") openSheet("company",nid); else if(kind==="k") openSheet("contact",nid); break; }
    case "imp-picker": importFromPhone(); break;
    case "imp-paste": { const v=$("#impPaste").value; if(!v.trim()){ toast("Paste some names and numbers first"); break; } loadImport(parsePaste(v),"your list"); break; }
    case "imp-tag": { const i=Number(t.dataset.i); S.imp.tags[i]= S.imp.tags[i]===k? "" : k; const row=document.querySelector(`[data-row="${i}"]`); if(row) row.outerHTML=impRow(S.imp.rows[i]); const n=impCount(); const b=$("#impSave"); if(b){ b.disabled=!n; b.textContent=`Save ${n} ${n===1?"person":"people"}`; } break; }
    case "imp-more": S.imp.shown+=100; $("#impList").innerHTML=impListHTML(); break;
    case "imp-reset": { const n=impCount(); const go=()=>{ S.imp.rows=[]; S.imp.tags={}; render(); }; if(n) confirmBox("Start over?", `You've tagged ${n}. Those tags will be lost.`, "Start over", async()=>{ closeModal(); go(); }); else go(); break; }
    case "imp-save": importSave(); break;
  }
});
function hideModalKeepLayer(){ if(!modalOpen()) return; hideModal(); S._reuse=true; }
document.addEventListener("submit",e=>{ e.preventDefault(); if(e.target.id==="dealForm") submitDeal(); else if(e.target.id==="contactForm") submitContact(); else if(e.target.id==="loginForm") return; });
document.addEventListener("input",e=>{
  const id=e.target.id;
  if(id==="fq"){ S.f.q=e.target.value; render(); }
  else if(id==="kq"){ S.k.q=e.target.value; render(); }
  else if(id==="impQ"){ S.imp.q=e.target.value; S.imp.shown=60; $("#impList").innerHTML=impListHTML(); }
  else if(id==="cName") dupCheck();
  else if(id==="kName"||id==="kCell"||id==="kEmail") contactDupCheck();
});
document.addEventListener("change",async e=>{
  const id=e.target.id, v=e.target.value;
  const fmap={fsector:"sector",fpartner:"partner",fprovince:"province",fchannel:"channel",flang:"lang"};
  if(fmap[id]){ S.f[fmap[id]]=v; render(); return; }
  if(id==="impFile"){ handleImportFile(e.target.files[0]); return; }
  if(id==="impPartner"){ S.imp.partner=v; return; } if(id==="impLang"){ S.imp.lang=v; return; }
  if(id==="sChannel"){ drawSrcExtra({}); }
  else if(e.target.name==="kTier"){ const t=v; const ty=$("#kType"); if(ty) ty.innerHTML=opts(TIERS[t].types,"","Choose…"); }
  else if(id==="nkTier"){ $("#nkType").innerHTML=opts(TIERS[v].types,TIERS[v].types[0]); }
  else if(id==="sContact"){ drawNewContact(CHANNEL[$("#sChannel").value]); }
  else if(id==="cCad"){ autoNext(true); }
  else if(id==="cStage"){ cadVis(); if(["target","active"].includes(stageOf(v).group) && Number($("#cCad").value)===0){ $("#cCad").value="3"; autoNext(true); } }
  else if(id==="dStage" && S.sheet){ const c=S.companies.get(S.sheet.id); if(!c||c.status===v) return; const by=await myName(); const patch={status:v, log:[...(c.log||[]),{d:today(),by,text:`Stage: ${STAGE[c.status]?.label||"—"} → ${STAGE[v].label}`}].slice(-200)}; if(["target","active"].includes(stageOf(v).group) && !c.nextCheckIn){ patch.followUpMonths=Number(c.followUpMonths)||3; patch.nextCheckIn=addMonths(today(),patch.followUpMonths); } if(["network","closed"].includes(stageOf(v).group)){ patch.nextCheckIn=""; } if(await dbUpdate("companies/"+c.id,patch)) toast("Stage updated"); }
});
window.addEventListener("hashchange",()=>{ if(sheetOpen()) hideSheet(); if(modalOpen()) hideModal(); render(); window.scrollTo(0,0); });
$("#scrim").addEventListener("click",()=>{ if(modalOpen()) closeModal(); else closeSheet(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(modalOpen()) closeModal(); else closeSheet(); } });
