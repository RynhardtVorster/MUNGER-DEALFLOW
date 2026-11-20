/* ================= Phase 2: integrated network, Ask, target meetings ================= */
ICON.ask='<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/><path d="M11 8v6M8 11h6"/>';
ICON.flag='<path d="M5 21V4h12l-2 4 2 4H5"/>';
ICON.spark='<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>';
const ROLES=["Owner","Co-owner / shareholder","2IC / right hand","Managing director / CEO","Family member","Senior manager","Employee","Auditor / accountant","Attorney","Banker / financier","Board member / advisor","Other"];
const OWNER_ROLES=["Owner","Co-owner / shareholder"];
const RELS={friend:"Friend",business:"Business associate",family:"Family",acquaintance:"Acquaintance"};
const COUNTRIES=["South Africa","Namibia","Botswana","Eswatini","Lesotho","Zimbabwe","Mozambique","Zambia","Malawi","Kenya","Mauritius","United Kingdom","United States","Netherlands","Germany","Australia","Other"];
const FOOTPRINTS=["South Africa only","South Africa + neighbours (SADC)","Across Africa","International"];
const FITDIMS=[["size","Size fits R30–50m EBIT"],["quality","Quality of the business"],["culture","Culture & people"],["intent","Owner open to selling"]];

/* ---------- helpers ---------- */
function connsOf(k){ return S.conns.get(k.id)||[]; }
function knowers(k){ const c=connsOf(k); return c.length? c : (k.partner? [{partner:k.partner,relation:""}] : []); }
function knowsTxt(k){ return knowers(k).map(c=>c.partner+(c.relation?` (${RELS[c.relation].toLowerCase()})`:"")).join(", "); }
function companyOf(k){ return k.companyId? S.companies.get(k.companyId) : null; }
function peopleAt(c){ return contacts().filter(k=>k.companyId===c.id); }
function isMineK(k){ const me=myPartner(); return !!me && knowers(k).some(x=>x.partner===me); }
function workLine(k){ const co=companyOf(k); if(co) return `${k.companyRole||k.title||"Works"} at ${co.name}`; return [k.title, k.firm].filter(Boolean).join(", ") || k.type || ""; }
function influenceScore(k){ const kn=knowers(k); return (Number(k.influence)||0)*20 + kn.length*8 + kn.filter(x=>x.relation==="friend").length*4 + dealsFrom(k.id).length*10 + (OWNER_ROLES.includes(k.companyRole)?5:0) + (tierOf(k)==="B"?3:0); }
function stars(n){ n=Number(n)||0; return n? `<span class="stars" title="Influence ${n} of 5">${"★".repeat(n)}</span>` : ""; }
function fitPct(c){ const f=c.fit||{}; const v=FITDIMS.map(([d])=>Number(f[d])||0).filter(Boolean); return v.length? Math.round(v.reduce((a,b)=>a+b,0)/(v.length*5)*100) : null; }
function fitPill(c){ const p=fitPct(c); if(p===null) return ""; return `<span class="pill ${p>=70?"won":p>=45?"nurture":"closed"}">Fit ${p}%</span>`; }
function sizeTxt(c){ if(c.ebitConfirmed!=null && c.ebitConfirmed!=="") return `EBIT R${c.ebitConfirmed}m (confirmed${c.financialsYear?`, ${c.financialsYear}`:""})`; return c.ebit&&c.ebit!=="Unknown"? `EBIT ${c.ebit} (estimate)` : "Not known yet"; }
function completeness(k){
  const ch=[[k.name,"name"],[k.cell,"cell"],[k.email,"email"],[k.companyId||k.firm,"company"],[k.companyRole||k.title||k.type,"role or title"],[k.industry,"industry"],[k.expertise,"what they can help with"],[k.town||k.province,"location"],[knowers(k).some(x=>x.relation),"how you know them"]];
  const missing=ch.filter(c=>!c[0]).map(c=>c[1]); return {pct:Math.round((ch.length-missing.length)/ch.length*100), missing};
}
function bizContact(c){ const o=firstOwner(c); if(o&&(o.cell||o.email)) return o; const k=peopleAt(c).find(x=>OWNER_ROLES.includes(x.companyRole))||peopleAt(c)[0]; return k||o||null; }
function linkTel(n){ return n? `<a href="${esc(telHref(n))}">${esc(n)}</a>` : "—"; }
function linkMail(e){ return e? `<a href="mailto:${esc(e)}">${esc(e)}</a>` : "—"; }

/* ---------- rows ---------- */
function personRow(k){
  const n=dealsFrom(k.id).length; const cp=completeness(k).pct;
  const who=knowers(k).map(x=>x.partner.split(" ")[0]).join(", ");
  return `<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)} ${stars(k.influence)}</span><span class="t2" style="display:block">${esc([workLine(k)||TIERS[tierOf(k)].label, who].filter(Boolean).join(" · "))}</span></span><span class="trail">${n?`<span class="pill">${n} lead${n>1?"s":""}</span>`:""}${cp<50?`<span class="pill soon">Add details</span>`:""}</span></button>`;
}
function bizRow(c){
  const d=dueInfo(c); const o=bizContact(c);
  return `<button class="rowi" data-open="${esc(c.id)}">${avatarB(c)}<span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([industryShort(c)!=="—"?industryShort(c):"",c.town||c.province,o?.name].filter(Boolean).join(" · ")||"No details yet")}</span></span><span class="trail">${stagePill(c.status)}${d&&isOpen(c)?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:fitPill(c)}</span></button>`;
}

/* ---------- Today ---------- */
function vToday(){
  const first=(S.me?.name||"").split(" ")[0];
  const d=new Date(); const dateTxt=`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]} ${d.getDate()} ${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]}`;
  const mine=S.scope==="mine"; const me=myPartner();
  const open=companies().filter(isOpen); const pool=mine? open.filter(isMine) : open;
  const due=pool.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n<=7;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const soon=pool.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n>7&&n<=30;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const active=pool.length; const newNet=companies().filter(c=>grp(c)==="network" && daysSince(c.createdAt)<=21).length;
  const ppl=mine? contacts().filter(isMineK) : contacts();
  const cm=S.commitments.filter(x=>x.status==="open" && (!mine || x.owner===me)).sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999"));
  const weak=contacts().filter(k=>isMineK(k)||k.createdBy===S.uid).map(k=>({k,c:completeness(k)})).filter(x=>x.c.pct<60).sort((a,b)=>a.c.pct-b.c.pct).slice(0,4);
  const recent=[...companies().map(x=>({k:"company",x})),...contacts().map(x=>({k:"contact",x}))].filter(r=>r.x.createdBy!==S.uid && daysSince(r.x.createdAt)<=14).sort((a,b)=>(b.x.createdAt||"").localeCompare(a.x.createdAt||"")).slice(0,6);
  const overdue=due.filter(c=>daysUntil(c.nextCheckIn)<0).length;
  return `<div class="ph"><div><div class="eyebrow">${esc(dateTxt)}</div><h1>${greet()}${first?`, ${esc(first)}`:""}</h1></div></div>
  <a class="askbar" href="#ask">${ic("spark",20)}<span>What do you need? Ask the network…</span></a>
  <div class="seg" role="tablist"><button class="${mine?"on":""}" data-act="scope" data-k="mine">Mine</button><button class="${!mine?"on":""}" data-act="scope" data-k="team">Whole team</button></div>
  <div class="stats">
    <a class="stat ${overdue?"alert":""}" href="#checkins"><span class="n">${due.length}</span><span class="l">Check-ins this week</span></a>
    <a class="stat" href="#businesses" data-act="biz-active"><span class="n">${active}</span><span class="l">Targets & live deals</span></a>
    <a class="stat" href="#people"><span class="n">${ppl.length}</span><span class="l">${mine?"People I know":"People tagged"}</span></a>
  </div>
  <div class="sec"><h2>To call this week</h2>${due.length?`<a href="#checkins">All</a>`:""}</div>
  ${due.length? due.map(dueCard).join("") : `<div class="card empty"><b>You're up to date</b>${soon.length?`Next up: ${esc(soon[0].name)} on ${esc(fmtD(soon[0].nextCheckIn))}.`:"No check-ins due. Businesses you set to check in on will show up here."}</div>`}
  ${cm.length?`<div class="sec"><h2>${mine?"My commitments":"Team commitments"}</h2><a href="#meeting">Meeting</a></div><div class="group">${cm.slice(0,6).map(cmtRow).join("")}</div>`:""}
  ${weak.length?`<div class="sec"><h2>Make these profiles stronger</h2></div><div class="group">${weak.map(({k,c})=>`<button class="rowi" data-act="complete-profile" data-id="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">Add ${esc(c.missing.slice(0,3).join(", "))}</span></span><span class="trail"><span class="pill soon">${c.pct}%</span></span></button>`).join("")}</div>`:""}
  ${newNet?`<div class="sec"><h2>New in our network</h2><a href="#businesses" data-act="biz-network">Review</a></div><div class="card box tag">${newNet} business${newNet>1?"es":""} added in the last three weeks. Open one and tap <b>We like it</b> to make it a target and start check-ins.</div>`:""}
  ${soon.length?`<div class="sec"><h2>Coming up</h2></div><div class="group">${soon.slice(0,5).map(bizRow).join("")}</div>`:""}
  ${recent.length?`<div class="sec"><h2>New from the team</h2></div><div class="group">${recent.map(r=>r.k==="company"?bizRow(r.x):personRow(r.x)).join("")}</div>`:""}`;
}
function cmtRow(x){
  const late=x.due && daysUntil(x.due)<0; const co=x.companyId?S.companies.get(x.companyId):null;
  return `<div class="rowi" style="cursor:default"><button class="tick" data-act="cmt-done" data-id="${esc(x.id)}" aria-label="Mark done">${ic("check",18)}</button><span class="main"${S.readOnly?"":` role="button" tabindex="0" data-act="cm19-edit" data-id="${esc(x.id)}" style="cursor:pointer"`}><span class="t1" style="display:block;white-space:normal">${esc(x.action)}</span><span class="t2" style="display:block">${esc([x.owner, co?co.name:"", x.due?`due ${fmtD(x.due)}`:""].filter(Boolean).join(" · "))}${S.readOnly?"":" · ✎ edit"}</span></span>${late?`<span class="pill late">Late</span>`:""}${S.readOnly?"":`<button class="btn sm notdone19" data-act="cmt-not" data-id="${esc(x.id)}">✕ Not done</button>`}</div>`;
}

/* ---------- People list: Mine uses partner connections ---------- */
function vPeople(){
  const k=S.k, q=k.q.trim().toLowerCase(); const me=myPartner(); const all=contacts();
  const arr=all.filter(c=>{ if(k.tier==="top") return true; if(k.tier&&tierOf(c)!==k.tier) return false; if(k.mine&&!isMineK(c)) return false; if(q){ const co=companyOf(c); const h=[c.name,c.firm,c.title,c.email,c.cell,c.town,c.province,c.country,c.notes,c.type,c.industry,c.expertise,c.companyRole,co?.name,knowsTxt(c)].join(" ").toLowerCase(); if(!h.includes(q)) return false; } return true; }).sort((a,b)=> k.tier==="top"? influenceScore(b)-influenceScore(a) : (a.name||"").localeCompare(b.name||"",undefined,{sensitivity:"base"}));
  if(k.tier==="top") arr.splice(50);
  const cnt=t=>all.filter(c=>tierOf(c)===t).length;
  const chip=(t,l,n)=>`<button class="chip ${k.tier===t?"on":""}" data-act="k-tier" data-k="${t}">${l} <span class="n">${n}</span></button>`;
  let body="";
  if(!arr.length) body=`<div class="card empty">${all.length?"<b>Nobody matches</b>Try a different search or filter, or use Ask the network.":`<b>Your network starts here</b>Import your contacts and tag who matters, or tap + to add one person.<div style="margin-top:14px"><a class="btn primary" href="#import">${ic("upload",18)} Import contacts</a></div>`}</div>`;
  else { let last=""; const parts=[]; let buf=[]; const flush=()=>{ if(buf.length){ parts.push(`<div class="group">${buf.join("")}</div>`); buf=[]; } };
    for(const c of arr){ const L=(c.name||"#")[0].toUpperCase(); const letter=/[A-Z]/.test(L)?L:"#"; if(k.tier!=="top" && letter!==last && arr.length>12){ flush(); parts.push(`<div class="letter">${letter}</div>`); last=letter; } buf.push(personRow(c)); }
    flush(); body=parts.join(""); }
  return `<div class="ph"><div><h1>People</h1><p>${all.length} in the network · A ${cnt("A")} · B ${cnt("B")} · C ${cnt("C")}</p></div><a class="btn sm" href="#import">${ic("upload",18)} Import</a></div>
  <div class="search">${ic("search",20)}<input id="kq" type="search" placeholder="Search name, company, skill, town…" value="${esc(k.q)}" autocomplete="off" aria-label="Search people"></div>
  <div class="chips">${chip("","All",all.length)}${chip("A","A · Owners",cnt("A"))}${chip("B","B · Employees",cnt("B"))}${chip("C","C · Potential hires",cnt("C"))}${chip("D","D · Great contacts",cnt("D"))}<button class="chip ${k.tier==="top"?"on":""}" data-act="k-tier" data-k="top">★ Most influential</button>${me?`<button class="chip ${k.mine?"on":""}" data-act="k-mine">People I know</button>`:""}</div>
  ${k.tier==="top"?`<p class="tag" style="margin:-4px 2px 10px">Ranked by your influence rating, how many partners know them, friendships and the leads they've brought in.</p>`:""}
  ${body}`;
}

/* ---------- More ---------- */
function vMore(){
  const item=(href,icn,t,s)=>`<a class="rowi" href="${href}"><span class="avatar biz">${ic(icn,20)}</span><span class="main"><span class="t1" style="display:block">${t}</span><span class="t2" style="display:block">${s}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`;
  return `<div class="ph"><div><h1>More</h1></div></div>
  <div class="group">
   ${item("#ask","spark","Ask the network","Who should we talk to for…")}
   ${item("#meeting","flag","Target meeting","Scorecard, commitments, chase / park / drop")}
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

/* ---------- Detail sheet ---------- */
function renderSheet(){
  const el=$("#sheet"); const D=S.sheet; if(!D) return;
  const keepNote=el.querySelector("#noteTxt")?.value||""; const st=el.querySelector(".ovb")?.scrollTop||0;
  const ro=S.readOnly;
  if(D.kind==="company"){
    const c=S.companies.get(D.id); if(!c){ closeSheet(); return; }
    const due=dueInfo(c); const o=bizContact(c); const src=c.source||{}; const sk=src.contactId?S.contacts.get(src.contactId):null;
    const ppl=peopleAt(c); const fp=fitPct(c);
    const knownVia=[...new Set(ppl.flatMap(k=>knowers(k).map(x=>x.partner)))];
    el.innerHTML=`${ovHead(c.name,null,ro?"":`<button class="hbtn" data-act="edit-deal" data-id="${esc(c.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${avatarB(c,true)}<h2>${esc(c.name)}</h2><div class="sub">${esc([industryShort(c)!=="—"?industryShort(c):"",[c.town,c.province].filter(Boolean).join(", "),c.hqCountry&&c.hqCountry!=="South Africa"?c.hqCountry:""].filter(Boolean).join(" · ")||"No details yet")}</div><div class="pills">${stagePill(c.status)}${c.partner?`<span class="pill">${esc(c.partner)}</span>`:""}${fitPill(c)}</div></div>
    <div class="bigacts">
      <a class="bigact" ${o?.cell?`href="${esc(telHref(o.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${o?.cell?`href="${esc(waHref(o.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${o?.email?`href="mailto:${esc(o.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      ${grp(c)==="network"?`<button class="bigact" data-act="like" data-id="${esc(c.id)}" ${ro?'aria-disabled="true"':""}><span style="font-size:20px;line-height:22px">★</span>Like</button>`:`<button class="bigact" data-act="quick-checkin" data-id="${esc(c.id)}" ${ro?'aria-disabled="true"':""}>${ic("check",22)}Check in</button>`}
    </div>
    ${grp(c)==="network"?`<div class="card box likebox"><div class="lbl">In our network</div><div class="next">Do we like this business?</div><div class="tag">Liking it makes it a target: map the owners and key people, then start checking in.</div>${ro?"":`<div class="acts" style="grid-template-columns:2fr 1fr"><button class="act dark" data-act="like" data-id="${esc(c.id)}">★ We like it</button><button class="act" data-act="not-for-us" data-id="${esc(c.id)}">Not for us</button></div>`}</div>`:""}
    ${grp(c)==="target"&&!ro?`<div class="acts" style="grid-template-columns:1fr 1fr;margin-top:12px"><button class="act dark" data-act="start-deal" data-id="${esc(c.id)}">Start a conversation</button><button class="act" data-act="like" data-id="${esc(c.id)}">Change check-ins</button></div>`:""}
    ${["target","active"].includes(grp(c))?`<div class="fsec">Check-in</div>
    <div class="card box">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="lbl">Next check-in</div><div class="next">${c.nextCheckIn?esc(fmtD(c.nextCheckIn)):"Not scheduled"}</div></div>${due?`<span class="pill ${due.cls}">${esc(due.txt)}</span>`:""}</div>
      <div class="tag">${esc(CADENCE.find(x=>x.m===Number(c.followUpMonths))?.l||"No scheduled check-in")} · last contact ${esc(fmtD(c.lastContact))}</div>
    </div>`:""}
    ${ro?"":`<div class="fields" style="margin-top:12px"><div class="fld"><label for="dStage">Stage</label><select id="dStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),stageOf(c.status).id)}</select></div></div>`}
    <div class="fsec">People we know here</div>
    ${(c.owners||[]).length||ppl.length? `<div class="group">${(c.owners||[]).filter(w=>!ppl.some(k=>k.name.toLowerCase()===String(w.name||"").toLowerCase())).map(w=>`<div class="rowi"><span class="avatar biz">${esc(initials(w.name))}</span><span class="main"><span class="t1" style="display:block">${esc(w.name||"Unnamed")} ${langTag(w.language)}</span><span class="t2" style="display:block">${esc([w.role||"Owner",w.cell,w.email].filter(Boolean).join(" · "))}</span></span>${w.cell?`<a class="btn sm" href="${esc(telHref(w.cell))}" aria-label="Call ${esc(w.name)}">${ic("phone",18)}</a>`:""}</div>`).join("")}${ppl.map(k=>`<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">${esc([k.companyRole||k.title||"Works here", knowers(k).length?"known by "+knowers(k).map(x=>x.partner.split(" ")[0]).join(", "):""].filter(Boolean).join(" · "))}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`).join("")}</div>` : `<div class="card empty">Nobody linked yet.</div>`}
    ${knownVia.length?`<p class="tag" style="margin:8px 2px 0">Our way in: ${esc(knownVia.join(", "))}</p>`:""}
    ${ro?"":`<button class="linkbtn" data-act="person-at" data-id="${esc(c.id)}">+ Add someone who works here</button>`}
    <div class="fsec">Size & mandate fit</div>
    <div class="card kv"><div class="k">Profit</div><div class="v">${esc(sizeTxt(c))}</div><div class="k">Turnover</div><div class="v">${esc(c.turnoverConfirmed!=null&&c.turnoverConfirmed!==""?`R${c.turnoverConfirmed}m (confirmed)`:(c.turnover?`${c.turnover} (estimate)`:"—"))}</div><div class="k">Employees</div><div class="v">${esc(c.employees||"—")}</div><div class="k">Mandate fit</div><div class="v">${fp===null?"Not scored":`${fp}%`}</div>${FITDIMS.filter(([d])=>(c.fit||{})[d]).map(([d,l])=>`<div class="k">${esc(l)}</div><div class="v">${"●".repeat(Number(c.fit[d]))}${"○".repeat(5-Number(c.fit[d]))}</div>`).join("")}</div>
    <div class="fsec">Where it operates</div>
    <div class="card kv"><div class="k">Head office</div><div class="v">${esc(c.hqCountry||"South Africa")}</div><div class="k">Footprint</div><div class="v">${esc(c.footprint||"—")}</div>${c.countries?`<div class="k">Countries</div><div class="v">${esc(c.countries)}</div>`:""}<div class="k">Industry</div><div class="v">${esc(c.industry||"—")}</div>${c.regNo?`<div class="k">Reg. no.</div><div class="v">${esc(c.regNo)}</div>`:""}<div class="k">Website</div><div class="v">${c.website?`<a href="${esc(/^https?:/i.test(c.website)?c.website:"https://"+c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>`:"—"}</div></div>
    <div class="fsec">How we heard</div>
    <div class="card kv"><div class="k">Source</div><div class="v">${esc(CHANNEL[src.channel]?.label||"—")}</div>${sk?`<div class="k">Introduced by</div><div class="v"><a href="#" data-contact="${esc(sk.id)}">${esc(sk.name)}</a></div>`:""}${src.partner?`<div class="k">Partner</div><div class="v">${esc(src.partner)}</div>`:""}${src.detail?`<div class="k">Detail</div><div class="v">${esc(src.detail)}</div>`:""}<div class="k">Captured</div><div class="v">${esc(fmtD((c.createdAt||"").slice(0,10)))}${c.createdByName?` · ${esc(c.createdByName)}`:""}</div></div>
    ${c.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(c.notes)}</div>`:""}
    <div class="fsec">Activity</div>
    ${ro?"":`<div class="fields"><div class="fld"><label for="noteTxt">Add a note</label><textarea id="noteTxt" placeholder="What happened? Who said what?">${esc(keepNote)}</textarea></div></div><div style="margin:8px 0 12px"><button class="btn block" data-act="add-note" data-id="${esc(c.id)}">Save note</button></div>`}
    ${(c.log||[]).length?`<div class="group log">${[...c.log].reverse().map(e=>`<div class="e"><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div>`:`<div class="card empty">No activity yet.</div>`}
    ${ro?"":`<div style="margin-top:26px"><button class="btn block danger" data-act="del-deal" data-id="${esc(c.id)}">${ic("trash",18)} Delete business</button></div>`}
    </div>`;
  } else {
    const k=S.contacts.get(D.id); if(!k){ closeSheet(); return; }
    const t=tierOf(k); const deals=dealsFrom(k.id); const co=companyOf(k); const cp=completeness(k);
    el.innerHTML=`${ovHead(k.name,null,ro?"":`<button class="hbtn" data-act="edit-contact" data-id="${esc(k.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${avatarP(k,true)}<h2>${esc(k.name)}</h2><div class="sub">${esc(workLine(k)||TIERS[t].label)}</div><div class="pills">${t?`<span class="pill ${t}">${t} · ${esc(TIERS[t].label)}</span>`:`<span class="pill">Not tagged</span>`}${k.influence?`<span class="pill">${stars(k.influence)}</span>`:""}${k.industry?`<span class="pill">${esc(k.industry.split(" › ").pop())}</span>`:""}${langTag(k.language)}</div></div>
    <div class="bigacts">
      <a class="bigact" ${k.cell?`href="${esc(telHref(k.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${k.cell?`href="${esc(waHref(k.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${k.email?`href="mailto:${esc(k.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      <button class="bigact" data-act="new-deal-from" data-id="${esc(k.id)}" ${ro?'aria-disabled="true"':""}>${ic("bizplus",22)}${OWNER_ROLES.includes(k.companyRole)||t==="A"?"Their business":"Add lead"}</button>
    </div>
    ${cp.pct<100&&!ro?`<button class="card box nudge" data-act="complete-profile" data-id="${esc(k.id)}"><div style="display:flex;justify-content:space-between;align-items:center"><b>Profile ${cp.pct}% complete</b><span class="pill soon">Add details</span></div><div class="meter"><span style="width:${cp.pct}%"></span></div><div class="tag">Missing: ${esc(cp.missing.join(", "))}. The more we capture, the better Ask the network works.</div></button>`:""}
    <div class="fsec">Who knows ${esc(k.name.split(" ")[0])}</div>
    ${knowers(k).length?`<div class="group">${knowers(k).map(x=>`<div class="rowi" style="min-height:52px"><span class="avatar biz" style="width:34px;height:34px;font-size:13px">${esc(initials(x.partner))}</span><span class="main"><span class="t1" style="display:block">${esc(x.partner)}</span></span><span class="pill ${x.relation==="friend"?"won":x.relation==="family"?"A":""}">${esc(RELS[x.relation]||"Not set")}</span></div>`).join("")}</div>`:`<div class="card empty">No partner linked yet.</div>`}
    <div class="fsec">Work</div>
    <div class="card kv">${co?`<div class="k">Works at</div><div class="v"><a href="#" data-open="${esc(co.id)}">${esc(co.name)}</a></div><div class="k">Role there</div><div class="v">${esc(k.companyRole||"—")}</div>`:`<div class="k">Company</div><div class="v">${esc(k.firm||"—")}</div>`}<div class="k">Title</div><div class="v">${esc(k.title||k.type||"—")}</div><div class="k">Industry</div><div class="v">${esc(k.industry||"—")}</div><div class="k">Can help with</div><div class="v">${esc(k.expertise||"—")}</div></div>
    <div class="card box" style="margin-top:12px"><div class="lbl">Next step for ${({A:"an owner",B:"an employee",C:"a potential hire",D:"a great contact"})[t]||"a contact"}</div><div class="next">${esc(TIERS[t].action)}</div></div>
    <div class="fsec">Contact details</div>
    <div class="card kv"><div class="k">Cell</div><div class="v">${linkTel(k.cell)}</div><div class="k">Email</div><div class="v">${linkMail(k.email)}</div>${k.linkedin?`<div class="k">LinkedIn</div><div class="v"><a href="${esc(/^https?:/i.test(k.linkedin)?k.linkedin:"https://"+k.linkedin)}" target="_blank" rel="noopener">Profile</a></div>`:""}<div class="k">Location</div><div class="v">${esc([k.town,k.province,k.country].filter(Boolean).join(", ")||"—")}</div><div class="k">Speaks</div><div class="v">${esc(LANGS[k.language]||"—")}</div></div>
    ${k.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(k.notes)}</div>`:""}
    <div class="fsec">Leads they brought in (${deals.length})</div>
    ${deals.length?`<div class="group">${deals.map(bizRow).join("")}</div>`:`<div class="card empty">None yet.</div>`}
    ${ro?"":`<div style="margin-top:26px"><button class="btn block danger" data-act="del-contact" data-id="${esc(k.id)}">${ic("trash",18)} Delete person</button></div>`}
    </div>`;
  }
  const b=el.querySelector(".ovb"); if(b&&st) b.scrollTop=st;
}

/* ---------- Person form ---------- */
function contactForm(id, preset){
  const k=id? {...S.contacts.get(id)} : {language:"af", country:"South Africa", tier:"", ...(preset||{})};
  const tier=id? tierOf(k) : (k.tier||"");
  FORM={kind:"contact", id};
  const co=k.companyId? S.companies.get(k.companyId) : null;
  const rel={}; (id? knowers(k) : [{partner:defaultPartner(),relation:""}]).forEach(x=>rel[x.partner]=x.relation||"business");
  if(!id && preset?.knownBy) rel[preset.knownBy]="business";
  showModal(`<form id="contactForm" novalidate style="display:contents">${formHead(id?"Edit person":"New person","contactForm")}<div class="ovb">
  <div class="scorebar" id="kScore"></div>
  <div class="fsec">Who is this?</div>
  <div class="tiers3" role="radiogroup">${["A","B","C","D"].map(t=>`<label><input type="radio" name="kTier" value="${t}" ${tier===t?"checked":""}><span class="avatar ${t}" style="width:34px;height:34px;font-family:var(--display)">${t}</span><b>${esc(TIERS[t].label)}</b></label>`).join("")}</div>
  <div class="hint" id="kTierHint">${tier?esc(TIERS[tier].desc):"A owns a business that could fit. B is a professional who sees exits first. C is a good contact to have."}</div>
  <div class="fsec">Contact</div>
  <div class="fields">
   <div class="fld"><label for="kName">Full name *</label><input id="kName" value="${esc(k.name)}" autocomplete="off" autocapitalize="words"></div>
   <div class="fld"><label for="kCell">Cell</label><input id="kCell" type="tel" inputmode="tel" value="${esc(k.cell)}" placeholder="082 123 4567"></div>
   <div class="fld"><label for="kEmail">Email</label><input id="kEmail" type="email" inputmode="email" autocapitalize="off" value="${esc(k.email)}"></div>
   <div class="fld"><label for="kCountry">Country</label><select id="kCountry">${opts(COUNTRIES,k.country||"South Africa")}</select></div>
  </div><div id="kDup" class="warnline"></div>
  <div class="fsec">Work</div>
  <div class="fields">
   <div class="fld"><label for="kCompany">Company</label><input id="kCompany" list="companyList" value="${esc(co?co.name:k.firm)}" autocomplete="off" placeholder="Type or pick a business"><datalist id="companyList">${companies().map(c=>`<option value="${esc(c.name)}"></option>`).join("")}</datalist></div>
   <div class="fld"><label for="kRole">Role at the company</label><select id="kRole">${opts(ROLES,k.companyRole,"Choose…")}</select></div>
   <div class="fld"><label for="kTitle">Job title</label><input id="kTitle" value="${esc(k.title)}" placeholder="e.g. Financial director, Town planner"></div>
   <div class="fld"><label for="kIndustry">Industry</label><select id="kIndustry">${industryOpts(k.industry)}</select></div>
   <div class="fld"><label for="kExpertise">What can they help with?</label><textarea id="kExpertise" rows="2" placeholder="e.g. rezoning and town planning in Cape Town; Bell equipment dealer; agri finance">${esc(k.expertise)}</textarea></div>
  </div>
  <div class="hint" id="kCoHint"></div>
  <div class="fsec">Which partners know them?</div>
  <div class="fields">${S.partners.map((p,i)=>`<div class="fld"><label for="rel${i}">${esc(p)}</label><select id="rel${i}" data-partner="${esc(p)}">${opts([{v:"",l:"Doesn't know them"},...Object.entries(RELS).map(([v,l])=>({v,l}))],rel[p]||"")}</select></div>`).join("")}</div>
  <div class="hint">Friend or business associate matters: it tells the team who should make the call.</div>
  <div class="fields" style="margin-top:10px"><div class="fld"><label for="kInfl">How influential are they?</label><select id="kInfl">${opts([{v:0,l:"Not rated"},{v:1,l:"★ Some reach"},{v:2,l:"★★ Well connected locally"},{v:3,l:"★★★ Respected in their industry"},{v:4,l:"★★★★ Opens doors nationally"},{v:5,l:"★★★★★ Top of the network"}],k.influence||0)}</select></div></div>
  <div id="kAddBizWrap" hidden><label class="check"><input type="checkbox" id="kAddBiz" checked> Add their business to Businesses next</label></div>
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} More details</summary>
   <div class="fsec">More</div>
   <div class="fields">
    <div class="fld"><label for="kType">Type</label><select id="kType">${opts(tier?TIERS[tier].types:CONTACT_TYPES,k.type,"Choose…")}</select></div>
    <div class="fld"><label for="kLang">Speaks</label><select id="kLang">${opts(LANG_OPTS,k.language||"af")}</select></div>
    <div class="fld"><label for="kProv">Province</label><select id="kProv">${opts(PROVINCES,k.province,"Choose…")}</select></div>
    <div class="fld"><label for="kTown">Town / area</label><input id="kTown" value="${esc(k.town)}"></div>
    <div class="fld"><label for="kLinkedin">LinkedIn</label><input id="kLinkedin" inputmode="url" autocapitalize="off" value="${esc(k.linkedin)}"></div>
    <div class="fld"><label for="kNotes">Notes</label><textarea id="kNotes" placeholder="How we know them, who they know, anything useful…">${esc(k.notes)}</textarea></div>
   </div>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save person"}</button></div>
  </div></form>`);
  kFormUpdate();
  setTimeout(()=>{ if(!id) $("#kName")?.focus(); },300);
}
function kFormRead(){
  const tier=(document.querySelector('input[name=kTier]:checked')||{}).value||"";
  const cname=($("#kCompany")?.value||"").trim(); const co=companies().find(c=>c.name.toLowerCase()===cname.toLowerCase());
  const conns=[...document.querySelectorAll("[data-partner]")].filter(s=>s.value).map(s=>({partner:s.dataset.partner, relation:s.value}));
  return {tier, name:$("#kName").value.trim(), cell:$("#kCell").value.trim(), email:$("#kEmail").value.trim(), country:$("#kCountry").value, companyId:co?co.id:"", firm: co? "" : cname, companyRole:$("#kRole").value, title:$("#kTitle").value.trim(), industry:$("#kIndustry").value, expertise:$("#kExpertise").value.trim(), type:$("#kType").value, language:$("#kLang").value, province:$("#kProv").value, town:$("#kTown").value.trim(), linkedin:$("#kLinkedin").value.trim(), notes:$("#kNotes").value.trim(), influence:Number($("#kInfl").value)||0, conns, coName:cname, coFound:!!co};
}
function kFormUpdate(){
  if(!$("#kName")) return; const d=kFormRead();
  const cp=completeness({...d, partner:""}); S.conns.set("__form",d.conns);
  const known=d.conns.some(c=>c.relation); const ch=[[d.name,"name"],[d.cell,"cell"],[d.email,"email"],[d.coName,"company"],[d.companyRole||d.title||d.type,"role or title"],[d.industry,"industry"],[d.expertise,"what they can help with"],[d.town||d.province,"location"],[known,"who knows them"]];
  const miss=ch.filter(c=>!c[0]).map(c=>c[1]); const pct=Math.round((ch.length-miss.length)/ch.length*100);
  $("#kScore").innerHTML=`<div style="display:flex;justify-content:space-between;font-size:14px"><b>Profile ${pct}%</b><span class="tag">${miss.length?`Still missing: ${esc(miss.slice(0,3).join(", "))}${miss.length>3?"…":""}`:"Complete. Great work."}</span></div><div class="meter"><span style="width:${pct}%"></span></div>`;
  $("#kTierHint").textContent = d.tier? TIERS[d.tier].desc : "A owns a business that could fit. B is a professional who sees exits first. C is a good contact to have.";
  $("#kCoHint").innerHTML = d.coName? (d.coFound? `Linked to <b>${esc(d.coName)}</b> in Businesses.` : `<b>${esc(d.coName)}</b> isn't in Businesses yet.${OWNER_ROLES.includes(d.companyRole)||d.tier==="A"?"":" Saved as their company name."}`) : "";
  const w=$("#kAddBizWrap"); if(w) w.hidden = !( !FORM.id && d.coName && !d.coFound && (d.tier==="A" || OWNER_ROLES.includes(d.companyRole)) );
}
async function saveConns(contactId, list){
  const {error:de}=await sb.from("connections").delete().eq("contact_id",contactId); if(de){ writeErr(de); return false; }
  if(list.length){ const {error}=await sb.from("connections").insert(list.map(c=>({contact_id:contactId, partner:c.partner, relation:c.relation}))); if(error){ writeErr(error); return false; } }
  await loadConnections(); return true;
}
async function submitContact(){
  const d=kFormRead();
  if(!d.name){ toast("Add a name"); $("#kName").focus(); return; }
  if(!d.tier){ toast("Tap A, B or C first"); return; }
  const me=myPartner(); const primary=(d.conns.find(c=>c.partner===me)||d.conns[0]||{}).partner||"";
  const prev=FORM.id? S.contacts.get(FORM.id):null;
  const data={name:d.name, tier:d.tier, firm:d.firm, type:d.type, partner:primary, companyId:d.companyId, companyRole:d.companyRole, ownsCompanyId: OWNER_ROLES.includes(d.companyRole)? d.companyId : "", title:d.title, country:d.country, industry:d.industry, expertise:d.expertise, linkedin:d.linkedin, influence:d.influence, cell:d.cell, email:d.email, language:d.language, province:d.province, town:d.town, notes:d.notes, example:prev?.example||false};
  const id=FORM.id||newId();
  const addBiz=!FORM.id && !$("#kAddBizWrap").hidden && $("#kAddBiz")?.checked;
  document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=true);
  const ok=await dbSet("contacts/"+id,data) && await saveConns(id,d.conns);
  document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=false);
  if(!ok) return;
  toast(FORM.id?"Saved":"Added to People");
  if(addBiz){ ownerDealForm(id); return; }
  if(sheetOpen() && S.sheet?.kind==="contact" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("contact",id,true);
}
function ownerDealForm(contactId){
  const kk=S.contacts.get(contactId); const t=tierOf(kk); const owner=t==="A"||OWNER_ROLES.includes(kk.companyRole);
  const map={"Accountant / auditor":"accounting","Attorney":"law","Tax advisor":"tax","Banker / financier":"bank","Business broker":"broker","Estate agent":"estate","Well-connected friend":"friend"};
  const preset={source:{channel:owner?"whatsapp":(map[kk?.type]||"connector"),contactId}, partner:kk?.partner||defaultPartner()};
  preset.name=kk.firm||""; if(owner){ preset.province=kk.province||""; preset.town=kk.town||""; preset.industry=kk.industry||""; preset.owners=[{name:kk.name,cell:kk.cell||"",email:kk.email||"",language:kk.language||"af",role:kk.companyRole||"Owner"}]; }
  dealForm(null,preset); FORM.fromOwner = owner? contactId : null; FORM.fromRole = kk.companyRole||"Owner";
}

/* ---------- Business form (adds footprint, size, fit) ---------- */
function dealForm(id, preset){
  const c = id? JSON.parse(JSON.stringify(S.companies.get(id)||{})) : {status:"network", followUpMonths:0, owners:[{language:"af"}], source:{}, partner:defaultPartner(), ebit:"Unknown", hqCountry:"South Africa", fit:{}, ...(preset||{})};
  FORM={kind:"deal", id, owners:(c.owners&&c.owners.length?c.owners:[{language:"af"}])};
  const src=c.source||{}; const fit=c.fit||{};
  showModal(`<form id="dealForm" novalidate style="display:contents">${formHead(id?"Edit business":"New business","dealForm")}<div class="ovb">
  <div class="fsec">The business</div>
  <div class="fields">
    <div class="fld"><label for="cName">Business name *</label><input id="cName" value="${esc(c.name)}" autocomplete="off" autocapitalize="words"></div>
    <div class="fld"><label for="cIndustry">Industry</label><select id="cIndustry">${industryOpts(c.industry)}</select></div>
    <div class="fld"><label for="cTown">Town / area</label><input id="cTown" value="${esc(c.town)}" autocapitalize="words"></div>
    <div class="fld"><label for="cHq">Head office country</label><select id="cHq">${opts(COUNTRIES,c.hqCountry||"South Africa")}</select></div>
    <div class="fld"><label for="cFoot">Where it operates</label><select id="cFoot">${opts(FOOTPRINTS,c.footprint,"Choose…")}</select></div>
  </div><div id="dupWarn" class="warnline"></div>
  <div id="owners"></div><button type="button" class="linkbtn" data-act="add-owner" id="addOwnerBtn">+ Add another owner</button>
  <div class="fsec">Who brought it to us?</div>
  <div class="fields"><div class="fld"><label for="sChannel">Source *</label><select id="sChannel">${opts(activeChannels(src.channel).map(x=>({v:x.id,l:x.label})),src.channel,"Choose…")}</select></div><div id="srcExtra"></div></div>
  <div id="newContact"></div>
  <div class="fsec">Munger</div>
  <div class="fields">
    <div class="fld"><label for="cPartner">Lead partner</label><select id="cPartner">${opts(S.partners,c.partner,"Unassigned")}</select></div>
    <div class="fld"><label for="cStage">Stage</label><select id="cStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),c.status)}</select></div>
    <div class="fld cadw"><label for="cCad">Check in</label><select id="cCad">${opts(CADENCE.map(x=>({v:x.m,l:x.l})),c.followUpMonths??0)}</select></div>
    <div class="fld cadw"><label for="cNext">Next check-in (or pick a specific date)</label><input id="cNext" type="date" value="${esc(c.nextCheckIn||"")}"></div>
  </div><div class="hint" id="nextHint"></div><div class="hint" id="cadOff">New businesses sit in our network with no check-ins. Set the stage to “Target – we like it” when you want to start checking in.</div>
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} Size, fit and more details</summary>
   <div class="fsec">How big is it?</div>
   <div class="fields">
    <div class="fld"><label for="cEbit">EBIT – our estimate</label><select id="cEbit">${opts(EBIT,c.ebit)}</select></div>
    <div class="fld"><label for="cTurnover">Turnover – our estimate</label><input id="cTurnover" value="${esc(c.turnover)}" placeholder="e.g. R180m"></div>
    <div class="fld"><label for="cEbitC">EBIT – confirmed (R million)</label><input id="cEbitC" inputmode="decimal" value="${esc(c.ebitConfirmed??"")}" placeholder="Once we've seen the numbers"></div>
    <div class="fld"><label for="cTurnC">Turnover – confirmed (R million)</label><input id="cTurnC" inputmode="decimal" value="${esc(c.turnoverConfirmed??"")}"></div>
    <div class="fld"><label for="cFy">Financial year of confirmed numbers</label><input id="cFy" value="${esc(c.financialsYear)}" placeholder="e.g. FY2026"></div>
    <div class="fld"><label for="cEmp">Employees</label><input id="cEmp" inputmode="numeric" value="${esc(c.employees)}"></div>
   </div>
   <div class="fsec">Mandate fit (1 = poor, 5 = excellent)</div>
   <div class="fields">${FITDIMS.map(([d,l])=>`<div class="fld"><label for="fit_${d}">${esc(l)}</label><select id="fit_${d}">${opts([1,2,3,4,5].map(n=>({v:n,l:`${n} ${"●".repeat(n)}${"○".repeat(5-n)}`})),fit[d]||"","Not scored")}</select></div>`).join("")}</div>
   <div class="fsec">More about the business</div>
   <div class="fields">
    <div class="fld"><label for="cTrading">Trading as</label><input id="cTrading" value="${esc(c.tradingAs)}"></div>
    <div class="fld"><label for="cProvince">Province</label><select id="cProvince">${opts(PROVINCES,c.province,"Choose…")}</select></div>
    <div class="fld"><label for="cCountries">Countries it trades in</label><input id="cCountries" value="${esc(c.countries)}" placeholder="e.g. Namibia, Botswana, UK exports"></div>
    <div class="fld"><label for="cReg">Company registration no.</label><input id="cReg" value="${esc(c.regNo)}"></div>
    <div class="fld"><label for="cWeb">Website</label><input id="cWeb" inputmode="url" autocapitalize="off" value="${esc(c.website)}"></div>
    <div class="fld"><label for="cNotes">Notes</label><textarea id="cNotes" placeholder="Succession situation, culture, why it's interesting…">${esc(c.notes)}</textarea></div>
   </div>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save business"}</button></div>
  </div></form>`);
  drawOwners(); drawSrcExtra(src); cadVis(); if(["target","active"].includes(stageOf(c.status).group)) autoNext(!c.nextCheckIn);
  setTimeout(()=>{ if(!id) $("#cName")?.focus(); },300);
}
function cadVis(){ const on=["target","active"].includes(stageOf($("#cStage")?.value).group); document.querySelectorAll(".cadw").forEach(e=>e.hidden=!on); const o=$("#cadOff"); if(o) o.hidden=on; const h=$("#nextHint"); if(h&&!on) h.textContent=""; if(!on){ const n=$("#cNext"); if(n) n.value=""; } }
const numOrNull=v=>{ const s=String(v||"").replace(/[^\d.,-]/g,"").replace(",","."); return s===""? null : Number(s); };
async function submitDeal(){
  const name=$("#cName").value.trim(); if(!name){ toast("Add the business name"); $("#cName").focus(); return; }
  const channel=$("#sChannel").value; if(!channel){ toast("Choose who brought it to us"); $("#sChannel").focus(); return; }
  const ch=CHANNEL[channel]; const source={channel, detail:$("#sDetail")?.value.trim()||""};
  let newContact=null;
  if(ch.contact){
    const sel=$("#sContact").value;
    if(sel==="__new"){ const nm=$("#nkName").value.trim(); if(!nm){ toast("Add the name of the person who referred it"); $("#nkName").focus(); return; }
      const kid=newId(); newContact={id:kid, partner:$("#nkPartner").value, data:{name:nm, firm:$("#nkFirm").value.trim(), tier:$("#nkTier").value, type:$("#nkType").value, partner:$("#nkPartner").value, cell:$("#nkCell").value.trim(), email:$("#nkEmail").value.trim(), language:$("#nkLang").value, province:$("#cProvince").value, country:"South Africa"}}; source.contactId=kid; }
    else if(sel) source.contactId=sel;
  }
  if(ch.partner) source.partner=$("#sPartner").value;
  const owners=readOwners().filter(o=>o.name||o.email||o.cell);
  const prev=FORM.id? S.companies.get(FORM.id):null;
  const status=$("#cStage").value; const fit={}; FITDIMS.forEach(([d])=>{ const v=Number($("#fit_"+d).value); if(v) fit[d]=v; });
  const data={
    name, tradingAs:$("#cTrading").value.trim(), industry:$("#cIndustry").value, province:$("#cProvince").value, town:$("#cTown").value.trim(),
    website:$("#cWeb").value.trim(), ebit:$("#cEbit").value, turnover:$("#cTurnover").value.trim(), employees:$("#cEmp").value.trim(),
    hqCountry:$("#cHq").value, footprint:$("#cFoot").value, countries:$("#cCountries").value.trim(), regNo:$("#cReg").value.trim(),
    ebitConfirmed:numOrNull($("#cEbitC").value), turnoverConfirmed:numOrNull($("#cTurnC").value), financialsYear:$("#cFy").value.trim(), fit,
    owners, language: owners.length? (new Set(owners.map(o=>o.language)).size>1?"both":owners[0].language) : "",
    source, partner:$("#cPartner").value, status, followUpMonths:["target","active"].includes(stageOf(status).group)?Number($("#cCad").value):0, nextCheckIn:["target","active"].includes(stageOf(status).group)?($("#cNext").value||""):"",
    notes:$("#cNotes").value.trim(), lastContact: prev?.lastContact||"", log: prev?.log? [...prev.log] : [],
    createdByName: prev?.createdByName||await myName(), example: prev?.example||false
  };
  if(!prev) data.log.push({d:today(), by:data.createdByName, text:`Captured · ${ch.label}`});
  else if(prev.status!==status) data.log.push({d:today(), by:await myName(), text:`Stage: ${STAGE[prev.status]?.label||"—"} → ${STAGE[status].label}`});
  const btns=document.querySelectorAll('button[type=submit]'); btns.forEach(b=>b.disabled=true);
  if(newContact){ const ok=await dbSet("contacts/"+newContact.id, newContact.data) && (newContact.partner? await saveConns(newContact.id,[{partner:newContact.partner,relation:"business"}]) : true); if(!ok){ btns.forEach(b=>b.disabled=false); return; } }
  const id=FORM.id||newId();
  const ok=await dbSet("companies/"+id, data);
  btns.forEach(b=>b.disabled=false);
  if(ok){
    if(!FORM.id && FORM.fromOwner) await dbUpdate("contacts/"+FORM.fromOwner,{companyId:id, companyRole:FORM.fromRole||"Owner", ownsCompanyId:id, firm:""});
    toast(FORM.id?"Saved":"Business added");
    if(sheetOpen() && S.sheet?.kind==="company" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("company",id,true);
  }
}

/* ---------- Import: also record how they know them ---------- */
async function importSave(){
  const I=S.imp; const seen=new Set(); const rows=I.rows.filter(r=>I.tags[r.i]&&!r.exists).filter(r=>{ const keys=[phoneKey(r.cell)&&"p"+phoneKey(r.cell), r.email&&"e"+r.email.trim().toLowerCase()].filter(Boolean); if(keys.some(x=>seen.has(x))) return false; keys.forEach(x=>seen.add(x)); return true; });
  if(!rows.length) return;
  const typeFor={A:"Business owner",B:"",C:""};
  const recs=rows.map(r=>({id:newId(), ...toRow("contacts",{name:r.name, tier:I.tags[r.i], type:typeFor[I.tags[r.i]], firm:r.firm||"", partner:I.partner, cell:r.cell||"", email:r.email||"", language:I.lang, country:"South Africa"})}));
  const btn=$("#impSave"); if(btn){ btn.disabled=true; btn.textContent="Saving…"; }
  for(let i=0;i<recs.length;i+=200){
    const chunk=recs.slice(i,i+200);
    const {error}=await sb.from("contacts").insert(chunk); if(error){ writeErr(error); if(btn){ btn.disabled=false; btn.textContent="Try again"; } return; }
    if(I.partner){ const {error:e2}=await sb.from("connections").insert(chunk.map(r=>({contact_id:r.id, partner:I.partner, relation:I.rel||"business"}))); if(e2) writeErr(e2); }
  }
  await Promise.all([loadContacts(),loadConnections()]);
  toast(`${recs.length} ${recs.length===1?"person":"people"} added. Add details as you go.`);
  S.imp={rows:[], tags:{}, partner:I.partner, lang:I.lang, rel:I.rel, q:"", shown:60, hideExisting:true, source:""};
  S.k.tier=""; location.hash="people"; render();
}
function contactRows(){ return [["Tag","Name","Company","Role","Title","Industry","Can help with","Known by","Cell","Email","Language","Country","Province","Town","Leads introduced","Notes"], ...contacts().map(k=>{ const co=companyOf(k); return [`${tierOf(k)} – ${TIERS[tierOf(k)].label}`,k.name,co?co.name:k.firm,k.companyRole,k.title||k.type,k.industry,k.expertise,knowsTxt(k),k.cell,k.email,LANGS[k.language]||"",k.country,k.province,k.town,dealsFrom(k.id).length,k.notes]; })]; }

/* ---------- Ask the network ---------- */
const INTENTS=[
 {keys:["apartment","apartments","flats","residential","property","properties","develop","development","building","block","townhouse","townhouses","complex","estate","land","rezoning","zoning","erf","housing","commercial property","warehouse"], groups:[
   ["Property developers",["property developer","developer","property development","property"]],
   ["Town planners",["town planner","town planning","planning","zoning","rezoning","land use"]],
   ["Architects & engineers",["architect","structural engineer","civil engineer","consulting engineer","structural"]],
   ["Quantity surveyors",["quantity surveyor","qs","cost consultant"]],
   ["Contractors & builders",["contractor","builder","construction","civils","building"]],
   ["Property attorneys & conveyancers",["conveyancer","conveyancing","property law","attorney","legal"]],
   ["Property finance",["bank","banker","financier","property finance","funding","bond"]],
   ["Estate agents",["estate agent","real estate","property broker"]]]},
 {keys:["equipment","machinery","machine","machines","bell","tractor","tractors","loader","excavator","forklift","forklifts","truck","trucks","plant","yellow","fleet","vehicle","vehicles","generator"], groups:[
   ["Equipment dealers",["equipment","machinery","dealer","dealership","bell","earthmoving","yellow metal","tractor","forklift","truck"]],
   ["Plant & equipment hire",["plant hire","equipment hire","rental","hire"]],
   ["Asset finance & leasing",["asset finance","leasing","vehicle finance","bank","banker","financier"]],
   ["Workshops & maintenance",["workshop","mechanic","maintenance","repairs","engineering","fitment"]],
   ["Auctions & used equipment",["auction","auctioneer","used equipment","second-hand"]]]},
 {keys:["legal","lawyer","lawyers","attorney","attorneys","contract","contracts","dispute","litigation","court"], groups:[["Attorneys",["attorney","lawyer","legal","advocate","law"]]]},
 {keys:["tax","accounting","audit","accountant","financials","bookkeeping","valuation","valuations","due diligence"], groups:[["Accountants & auditors",["accountant","auditor","audit","accounting","chartered","ca(sa)"]],["Tax advisors",["tax"]],["Valuations & corporate finance",["valuation","corporate finance","m&a","advisory","due diligence"]]]},
 {keys:["funding","finance","loan","capital","debt","bank","raise","investor","investors","investment","equity","refinance"], groups:[["Banks & lenders",["bank","banker","financier","finance","lending","credit"]],["Investors",["investor","private equity","family office","fund","capital"]]]},
 {keys:["buy","acquire","acquisition","sell","selling","succession","exit","target","targets","deal"], groups:[["Business owners",["business owner","owner","founder","managing director","ceo","co-owner"]],["Brokers & M&A advisors",["broker","m&a","corporate finance","advisory"]],["Accountants who see exits",["accountant","auditor"]]]},
 {keys:["farm","farms","farming","agri","agriculture","mushroom","mushrooms","crops","fruit","citrus","wine","livestock","dairy","packhouse","irrigation","compost","substrate","greenhouse"], groups:[["Agriculture people",["agri","agriculture","farm","farmer","crops","fruit","citrus","wine","livestock","horticulture","mushroom","packhouse"]],["Agri suppliers & services",["agri inputs","seed","fertiliser","fertilizer","irrigation","agronomist","co-op","compost","substrate","greenhouse"]]]},
 {keys:["export","exports","import","logistics","transport","shipping","freight","cold","trucking","distribution"], groups:[["Logistics & freight",["logistics","freight","transport","shipping","cold chain","courier","trucking","distribution","clearing"]]]},
 {keys:["staff","labour","labor","hr","recruit","recruitment","hiring","union","employees"], groups:[["HR & labour",["hr","human resources","labour","labor","recruit","staffing","industrial relations"]],["Labour attorneys",["labour law","employment law","attorney"]]]},
 {keys:["insurance","insure","risk","cover","assurance"], groups:[["Insurance brokers",["insurance","broker","risk","assurance"]]]},
 {keys:["solar","energy","power","electricity","eskom","water","borehole","electrical"], groups:[["Energy & water",["solar","energy","power","electrical","electrician","renewable","water","borehole"]]]},
 {keys:["software","it","tech","technology","system","systems","website","digital","app","erp"], groups:[["Technology",["software","it","tech","developer","digital","systems","erp"]]]},
 {keys:["content","video","videos","videography","videographer","film","filming","editing","editor","photo","photos","photography","photographer","shoot","documentary","narrator","voice","podcast","creative","creatives","story","storytelling"], groups:[
   ["Videographers & editors",["videograph","video","film","editing","editor","camera","drone","documentary","production"]],
   ["Photographers",["photograph"]],
   ["Writers, narrators & storytellers",["copywrit","writer","narrat","voice","storytell","curator","script","journalist"]],
   ["Content & social media",["content","social media","influencer","digital marketing","podcast"]],
   ["Designers",["graphic design","designer","branding","brand"]]]},
 {keys:["marketing","brand","branding","media","pr","advertising","social"], groups:[["Marketing & media",["marketing","brand","media","pr","advertising","design","social media"]]]},
 {keys:["government","municipality","municipal","permit","permits","licence","license","council","approval","approvals"], groups:[["Government & approvals",["municipal","municipality","government","council","official","town planner","planning","regulatory"]]]},
 {keys:["tourism","hotel","lodge","lodges","hospitality","restaurant","events","golf","game"], groups:[["Tourism & hospitality",["tourism","hotel","lodge","hospitality","restaurant","events","golf","game"]]]},
 {keys:["mining","mine","quarry","minerals"], groups:[["Mining",["mining","mine","quarry","mineral"]]]}
];
const PLACES={"cape town":["cape town","western cape","stellenbosch","paarl","somerset west","bellville","durbanville","franschhoek"],"western cape":["western cape","cape town","stellenbosch","paarl","george","worcester"],"johannesburg":["johannesburg","joburg","gauteng","sandton","midrand","randburg"],"joburg":["johannesburg","joburg","gauteng","sandton"],"gauteng":["gauteng","johannesburg","pretoria","sandton","centurion"],"pretoria":["pretoria","centurion","gauteng"],"durban":["durban","kwazulu-natal","umhlanga","pietermaritzburg"],"kzn":["kwazulu-natal","durban","umhlanga"],"port elizabeth":["port elizabeth","gqeberha","eastern cape"],"gqeberha":["gqeberha","port elizabeth","eastern cape"],"bloemfontein":["bloemfontein","free state"],"namibia":["namibia","windhoek"],"windhoek":["windhoek","namibia"],"limpopo":["limpopo","polokwane","hoedspruit"],"mpumalanga":["mpumalanga","nelspruit","mbombela","white river"],"george":["george","garden route","knysna","western cape"],"stellenbosch":["stellenbosch","western cape","cape town"],"paarl":["paarl","pearl valley","western cape"]};
const STOP=new Set("i we our us me my need needs want wants looking look for to a an the and or of in on at with who whom which that this new some any can could would should help find get people person someone somebody someone build building buy for from about".split(" ").filter(w=>!["build","building"].includes(w)));
function subInd(v){ return String(v||"").split(" › ").pop(); }
function hayOf(k){ const co=companyOf(k); return {role:[k.title,k.type,k.companyRole,k.expertise].join(" ").toLowerCase(), ind:[subInd(k.industry),subInd(co?.industry)].join(" ").toLowerCase(), sect:[k.industry,co?.industry||""].join(" ").toLowerCase(), firm:[k.firm,co?.name||""].join(" ").toLowerCase(), notes:(k.notes||"").toLowerCase(), place:[k.town,k.province,k.country,co?.town||"",co?.province||""].join(" ").toLowerCase()}; }
function termScore(h,term){ let s=0; if(h.role.includes(term)) s+=6; if(h.ind.includes(term)) s+=4; else if(h.sect.includes(term)) s+=1; if(h.firm.includes(term)) s+=2; if(h.notes.includes(term)) s+=2; return s; }
function localFind(q){
  const ql=q.toLowerCase(); const words=ql.replace(/[^a-z0-9&\s-]/g," ").split(/\s+/).filter(Boolean);
  const intents=INTENTS.filter(it=>it.keys.some(k=>k.includes(" ")? ql.includes(k) : words.includes(k)));
  let place=[]; Object.entries(PLACES).forEach(([p,terms])=>{ if(ql.includes(p)) place=place.concat(terms); }); PROVINCES.forEach(p=>{ if(ql.includes(p.toLowerCase())) place.push(p.toLowerCase()); });
  const extra=words.filter(w=>w.length>2 && !STOP.has(w) && !intents.some(it=>it.keys.includes(w)) && !place.some(p=>p.includes(w)));
  const people=contacts().map(k=>({k,h:hayOf(k)}));
  const used=new Set(); const groups=[];
  const bonus=x=>{ let b=Math.min(3,Number(x.k.influence)||0); if(place.length && place.some(p=>x.h.place.includes(p))) b+=3; if(knowers(x.k).some(c=>c.relation==="friend")) b+=1; return b; };
  const groupDefs=intents.flatMap(it=>it.groups);
  if(extra.length) groupDefs.push(["Matches for “"+extra.join(" ")+"”", extra]);
  const best=new Map();
  groupDefs.forEach(([title,terms],gi)=>{
    people.forEach(x=>{ let s=0; const hits=[]; terms.forEach(t=>{ const v=termScore(x.h,t); if(v){ s+=v; hits.push(t); } }); if(s>=3){ s+=bonus(x); const cur=best.get(x.k.id); if(!cur||s>cur.s) best.set(x.k.id,{x,s,hits,gi}); } });
  });
  groupDefs.forEach(([title],gi)=>{
    const list=[...best.values()].filter(r=>r.gi===gi).sort((a,b)=>b.s-a.s).slice(0,8); list.forEach(r=>used.add(r.x.k.id));
    if(list.length) groups.push({title, people:list.map(r=>({id:r.x.k.id, why:`Matches ${[...new Set(r.hits)].slice(0,3).join(", ")}${place.length&&place.some(p=>r.x.h.place.includes(p))?" · right area":""}`}))});
  });
  const allTerms=groupDefs.flatMap(g=>g[1]);
  const biz=companies().map(c=>{ const h=[c.name,c.industry,c.notes,c.town,c.province].join(" ").toLowerCase(); let s=0; allTerms.forEach(t=>{ if(h.includes(t)) s+=2; }); if(place.length&&place.some(p=>h.includes(p))) s+=1; return {c,s}; }).filter(r=>r.s>=2).sort((a,b)=>b.s-a.s).slice(0,6).map(r=>r.c.id);
  const gaps=intents.flatMap(it=>it.groups).filter(([t])=>!groups.some(g=>g.title===t)).map(g=>g[0]);
  return {mode:"local", summary: groups.length? `Found ${used.size} ${used.size===1?"person":"people"} by matching what they do, their industry and location.` : "Nobody in the network matches yet. Add titles, industries and “what can they help with” to profiles so they show up here.", groups, gaps, biz};
}
function askLine(k){ const co=companyOf(k); return [k.id,k.name,tierOf(k),[k.title,k.type].filter(Boolean).join(", "),co?`${co.name} (${k.companyRole||"works there"}; ${co.industry||""})`:k.firm,k.industry,k.expertise,[k.town,k.province,k.country].filter(Boolean).join(", "),knowsTxt(k),(k.notes||"").replace(/\s+/g," ").slice(0,140)].map(v=>String(v||"").replace(/\|/g,"/")).join(" | "); }
async function runAsk(q){
  q=(q||"").trim(); if(!q) return; S.ask={q, res:null, loading:true}; render();
  const local=localFind(q);
  let res=local;
  if(!S.aiOff && contacts().length){
    let pool=contacts();
    if(pool.length>650){ const ids=new Set(local.groups.flatMap(g=>g.people.map(p=>p.id))); pool=[...pool.filter(k=>ids.has(k.id)), ...pool.filter(k=>!ids.has(k.id)).sort((a,b)=>completeness(b).pct-completeness(a).pct)].slice(0,650); }
    try{
      const {data,error}=await sb.functions.invoke("ask-network",{body:{query:q, lines:pool.map(askLine)}});
      if(error){ const st=error.context?.status; if(st===503) S.aiOff=true; else S.aiErr=true; }
      else if(data && Array.isArray(data.groups)){ res={mode:"ai", summary:data.summary||"", groups:data.groups.map(g=>({title:g.title, people:(g.people||[]).filter(p=>S.contacts.has(p.id))})).filter(g=>g.people.length), gaps:data.gaps||[], biz:local.biz, partners:local.partners, bizFirst:local.bizFirst}; }
    }catch(e){ S.aiErr=true; }
  }
  if(S.ask.q===q){ S.ask={q, res, loading:false}; if(S.view==="ask") render(); }
}
function askPerson(p){
  const k=S.contacts.get(p.id); if(!k) return "";
  return `<div class="rowi" style="align-items:flex-start"><button class="plain" data-contact="${esc(k.id)}" aria-label="Open ${esc(k.name)}">${avatarP(k)}</button><span class="main" data-contact="${esc(k.id)}" style="cursor:pointer"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block;white-space:normal">${esc(workLine(k)||TIERS[tierOf(k)].label)}</span><span class="t2" style="display:block;white-space:normal;color:var(--ink)">${esc(p.why||"")}</span><span class="t2" style="display:block">${knowers(k).length?`Known by ${esc(knowsTxt(k))}`:"No partner linked"}</span></span><span class="trail" style="flex-direction:row;gap:6px">${k.cell?`<a class="btn sm" href="${esc(telHref(k.cell))}" aria-label="Call ${esc(k.name)}">${ic("phone",18)}</a><a class="btn sm" href="${esc(waHref(k.cell))}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(k.name)}">${ic("wa",18)}</a>`:""}</span></div>`;
}
function vAsk(){
  const A=S.ask||{q:"",res:null}; const r=A.res;
  const ex=["We want to build an apartment block in Cape Town","I need new Bell equipment for the mushroom farm","Who can introduce us to citrus farm owners?","We need funding for an acquisition","Who knows the tourism industry in Limpopo?"];
  return `<div class="ph"><div><h1>Ask the network</h1><p>Describe what you need. We'll find the people across the whole team's network who can help, and who knows them.</p></div></div>
  <form id="askForm" class="askform"><textarea id="askQ" rows="2" placeholder="e.g. We want to build an apartment block in Cape Town">${esc(A.q||"")}</textarea><button type="submit" class="btn primary">${ic("spark",18)} Find people</button></form>
  ${!r&&!A.loading?`<div class="chips" style="flex-wrap:wrap;margin:6px 0 0">${ex.map(e=>`<button class="chip" data-act="ask-ex" data-k="${esc(e)}">${esc(e)}</button>`).join("")}</div>`:""}
  ${A.loading?`<div class="card empty"><b>Searching the network…</b>Looking at ${contacts().length} people.</div>`:""}
  ${r?`<div class="card box" style="margin-top:12px"><div class="lbl">${r.mode==="ai"?"Smart search (AI)":"Keyword match"}</div><div>${esc(r.summary)}</div>${r.mode!=="ai"&&S.aiOff?`<div class="tag">Smart AI search isn't switched on yet. Until then this is keyword matching on titles, industries and skills.</div>`:""}</div>
   ${r.groups.map(g=>`<div class="sec"><h2>${esc(g.title)}</h2><span class="tag">${g.people.length}</span></div><div class="group">${g.people.map(askPerson).join("")}</div>`).join("")}
   ${r.biz&&r.biz.length?`<div class="sec"><h2>Related businesses in our pipeline</h2></div><div class="group">${r.biz.map(id=>S.companies.get(id)).filter(Boolean).map(bizRow).join("")}</div>`:""}
   ${r.gaps&&r.gaps.length?`<div class="sec"><h2>Gaps in our network</h2></div><div class="card box"><div>${esc(r.gaps.join(" · "))}</div><div class="tag">Nobody tagged for these yet. Worth asking the B connectors for introductions.</div></div>`:""}`:""}`;
}

/* ---------- Target meeting ---------- */
function openMeeting(){ return S.meetings.find(m=>m.status==="open")||null; }
function lastDone(){ return S.meetings.filter(m=>m.status==="done").sort((a,b)=>b.held_on.localeCompare(a.held_on))[0]||null; }
function sinceDate(){ const l=lastDone(); if(l) return l.held_on; const d=new Date(); d.setDate(d.getDate()-21); return ymd(d); }
function vMeeting(){
  const m=openMeeting(); const last=lastDone(); const since=sinceDate();
  const nextDate= last? (()=>{ const d=parseD(last.held_on); d.setDate(d.getDate()+21); return ymd(d); })() : "";
  const newBiz=companies().filter(c=>(c.createdAt||"").slice(0,10)>=since);
  const chRows=CHANNELS.map(ch=>({ch, n:newBiz.filter(c=>c.source?.channel===ch.id).length, open:companies().filter(c=>isOpen(c)&&c.source?.channel===ch.id).length})).filter(r=>r.n||r.open);
  const pRows=S.partners.map(p=>{ const mine=contacts().filter(k=>knowers(k).some(x=>x.partner===p) && (k.createdAt||"").slice(0,10)>=since); const ci=companies().reduce((n,c)=>n+(c.log||[]).filter(e=>e.d>=since && e.by===p && /^Checked in/.test(e.text)).length,0); return {p, A:mine.filter(k=>tierOf(k)==="A").length, B:mine.filter(k=>tierOf(k)==="B").length, C:mine.filter(k=>tierOf(k)==="C").length, ci}; });
  const openC=S.commitments.filter(x=>x.status==="open").sort((a,b)=>(a.owner||"").localeCompare(b.owner||"")||(a.due||"").localeCompare(b.due||""));
  const thisC=m? S.commitments.filter(x=>x.meetingId===m.id) : [];
  const dec=m? Object.fromEntries((m.decisions||[]).map(d=>[d.companyId,d.decision])) : {};
  const live=companies().filter(c=>!isPartnerCo(c) && ["target","active"].includes(grp(c))).sort((a,b)=>(grp(b)==="active")-(grp(a)==="active")||(a.name||"").localeCompare(b.name||""));
  const newNet=companies().filter(c=>grp(c)==="network" && !isPartnerCo(c) && (c.createdAt||"").slice(0,10)>=since);
  const past=S.meetings.filter(x=>x.status==="done").sort((a,b)=>b.held_on.localeCompare(a.held_on)).slice(0,6);
  if(!m) return `<div class="ph"><div><h1>Target meeting</h1><p>Every three weeks, 60 minutes. Accountability before new ideas.</p></div></div>
   <div class="card box"><div class="lbl">${last?`Last meeting ${esc(fmtD(last.held_on))}`:"No meetings yet"}</div><div class="next">${nextDate?`Next due ${esc(fmtD(nextDate))}`:"Start your first target meeting"}</div>${S.readOnly?"":`<button class="btn primary block" data-act="meet-start">${ic("flag",18)} Start today's meeting</button>`}</div>
   ${openC.length?`<div class="sec"><h2>Open commitments</h2><span class="tag">${openC.length}</span></div><div class="group">${openC.map(cmtRow).join("")}</div>`:""}
   ${past.length?`<div class="sec"><h2>Past meetings</h2></div><div class="group">${past.map(x=>`<button class="rowi" data-act="meet-minutes" data-id="${esc(x.id)}"><span class="avatar biz">${ic("flag",20)}</span><span class="main"><span class="t1" style="display:block">${esc(fmtD(x.held_on))}</span><span class="t2" style="display:block">${(x.decisions||[]).length} decisions · ${S.commitments.filter(c=>c.meetingId===x.id).length} commitments</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`).join("")}</div>`:""}`;
  const blk=(n,t,mins)=>`<div class="sec"><h2>${n} · ${t}</h2><span class="tag">${mins} min</span></div>`;
  return `<div class="ph"><div><div class="eyebrow">Target meeting · ${esc(fmtD(m.held_on))}</div><h1>Run-sheet</h1><p>Since ${esc(fmtD(since))}.</p></div></div>
  ${blk(1,"Check-in",5)}<div class="card box tag">Each partner: one win and one lesson since the last meeting.</div>
  ${blk(2,"Scorecard",5)}
  <div class="card box"><div class="lbl">New businesses per channel</div>${chRows.length?`<table class="mini"><thead><tr><th>Channel</th><th>New</th><th>Open</th></tr></thead><tbody>${chRows.map(r=>`<tr><td>${esc(r.ch.label)}</td><td>${r.n||"–"}</td><td>${r.open||"–"}</td></tr>`).join("")}</tbody></table>`:`<div class="tag">No businesses yet.</div>`}</div>
  <div class="card box" style="margin-top:10px"><div class="lbl">Network sweep and check-ins per team member</div><table class="mini"><thead><tr><th>Partner</th><th>A</th><th>B</th><th>C</th><th>Check-ins</th></tr></thead><tbody>${pRows.map(r=>`<tr><td>${esc(r.p)}</td><td>${r.A||"–"}</td><td>${r.B||"–"}</td><td>${r.C||"–"}</td><td>${r.ci||"–"}</td></tr>`).join("")}</tbody></table></div>
  ${blk(3,"Commitment review",15)}
  ${openC.filter(x=>x.meetingId!==m.id).length?`<div class="group">${openC.filter(x=>x.meetingId!==m.id).map(cmtRow).join("")}</div>`:`<div class="card empty">No open commitments from before.</div>`}
  ${blk(4,"Targets & live deals: chase, keep warm or drop",15)}
  ${live.length?`<div class="group">${live.map(c=>`<div class="rowi" style="flex-wrap:wrap"><span class="main" data-open="${esc(c.id)}" style="cursor:pointer;min-width:160px"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([STAGE[c.status]?.label,c.partner].filter(Boolean).join(" · "))}</span></span><span class="decide">${[["chase","Chase"],["keep","Keep warm"],["drop","Drop"]].map(([k,l])=>`<button class="${dec[c.id]===k?"on "+k:""}" data-act="decide" data-id="${esc(c.id)}" data-k="${k}">${l}</button>`).join("")}</span></div>`).join("")}</div>`:`<div class="card empty">No targets yet.</div>`}
  <div class="hint">Chase moves a target into an active conversation. Keep warm leaves it as a target with its check-ins. Drop marks it Not for us.</div>
  ${blk(5,"Channel review",10)}<div class="card box tag">Agree which channels get the most time until the next meeting. Capture it as commitments below.</div>
  ${blk(6,"New targets & networks",5)}
  ${newNet.length?`<div class="group">${newNet.map(c=>`<div class="rowi"><span class="main" data-open="${esc(c.id)}" style="cursor:pointer"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([industryShort(c)!=="—"?industryShort(c):"",c.createdByName].filter(Boolean).join(" · "))}</span></span><button class="btn sm" data-act="like" data-id="${esc(c.id)}">★ We like it</button></div>`).join("")}</div>`:`<div class="card box tag">Nothing new in the network since the last meeting. Use + to capture new businesses now.</div>`}
  ${blk(7,"Commitments",5)}
  ${thisC.length?`<div class="group" style="margin-bottom:10px">${thisC.map(cmtRow).join("")}</div>`:""}
  <div class="fields">
   <div class="fld"><label for="cmOwner">Who</label><select id="cmOwner">${opts(S.partners,defaultPartner())}</select></div>
   <div class="fld"><label for="cmAction">Action</label><input id="cmAction" placeholder="One clear action, e.g. Call 5 Hatstone clients"></div>
   <div class="fld"><label for="cmDue">By when</label><input id="cmDue" type="date" value="${(()=>{const d=new Date(); d.setDate(d.getDate()+21); return ymd(d);})()}"></div>
   <div class="fld"><label for="cmBiz">Linked business (optional)</label><select id="cmBiz">${opts(companies().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>({v:c.id,l:c.name})),"","None")}</select></div>
  </div>
  <div style="margin-top:10px"><button class="btn block" data-act="cmt-add">+ Add commitment</button></div>
  <div class="fsec">Notes</div>
  <div class="fields"><div class="fld"><label for="mtNotes">Meeting notes</label><textarea id="mtNotes" rows="4">${esc(m.notes||"")}</textarea></div></div>
  <div style="margin-top:16px;display:grid;gap:10px"><button class="btn" data-act="meet-copy" data-id="${esc(m.id)}">Copy minutes for WhatsApp</button><button class="btn primary" data-act="meet-finish" data-id="${esc(m.id)}">${ic("check",18)} Finish meeting</button></div>`;
}
function minutesText(m){
  const decs=(m.decisions||[]).map(d=>`• ${S.companies.get(d.companyId)?.name||"?"}: ${({chase:"CHASE",keep:"KEEP WARM",drop:"DROP",park:"PARK"})[d.decision]||d.decision}`).join("\n")||"• None";
  const cm=S.commitments.filter(c=>c.meetingId===m.id).map(c=>`• ${c.owner}: ${c.action}${c.due?` (by ${fmtD(c.due)})`:""}`).join("\n")||"• None";
  return `MUNGER TARGET MEETING · ${fmtD(m.held_on)}\n\nDecisions\n${decs}\n\nCommitments\n${cm}${m.notes?`\n\nNotes\n${m.notes}`:""}`;
}
async function decide(companyId, decision){
  const m=openMeeting(); const c=S.companies.get(companyId); if(!m||!c) return;
  const by=await myName(); const decs=(m.decisions||[]).filter(d=>d.companyId!==companyId); decs.push({companyId, decision, by, at:today()});
  const {error}=await sb.from("meetings").update({decisions:decs}).eq("id",m.id); if(error){ writeErr(error); return; }
  const patch={log:[...(c.log||[]),{d:today(),by,text:`Target meeting: ${decision}`}].slice(-200)};
  if(decision==="chase" && grp(c)==="target"){ patch.status="talks"; }
  if(decision==="keep"){ if(grp(c)!=="target") patch.status="target"; if(!c.nextCheckIn){ patch.followUpMonths=Number(c.followUpMonths)||3; patch.nextCheckIn=addMonths(today(),patch.followUpMonths); } }
  if(decision==="drop"){ patch.status="passed"; patch.nextCheckIn=""; }
  await dbUpdate("companies/"+companyId, patch); await loadMeetings(); toast(`${c.name}: ${decision}`);
}

/* ---------- Network map: every partner connection + people at businesses ---------- */
function netBuildGraph(){
  const old=G.byId; const nodes=[], edges=[]; const by=new Map();
  const add=(id,type,label,extra)=>{ const o=old.get(id); const n={id,type,label,x:o?.x??(Math.random()-.5)*400,y:o?.y??(Math.random()-.5)*400,vx:0,vy:0,...extra}; nodes.push(n); by.set(id,n); return n; };
  const partnerSet=new Set(S.partners); contacts().forEach(k=>knowers(k).forEach(x=>partnerSet.add(x.partner))); companies().forEach(c=>{ if(c.partner) partnerSet.add(c.partner); });
  if(G.show.p) [...partnerSet].filter(Boolean).forEach(p=>add("p:"+p,"p",p,{r:16}));
  const netK=contacts().filter(netKOK); const fOn=netFilterOn(); const coIds=new Set(netK.flatMap(k=>[k.companyId,...(k.otherRoles||[]).map(r=>r.companyId)]).filter(Boolean));
  if(G.show.k) netK.forEach(k=>add("k:"+k.id,"k",k.name,{r:8+(Number(k.influence)||0)*1.6,sub:workLine(k),tier:tierOf(k)}));
  if(G.show.c) companies().filter(c=>!fOn||coIds.has(c.id)).forEach(c=>add("c:"+c.id,"c",c.name,{r:7,group:isPartnerCo(c)?"pfirm":stageOf(c.status).group,sub:isPartnerCo(c)?"Partner · "+(PKINDS[c.kind]||""):industryShort(c)}));
  const link=(a,b,kind)=>{ if(by.has(a)&&by.has(b)) edges.push({a:by.get(a),b:by.get(b),kind}); };
  contacts().forEach(k=>{ knowers(k).forEach(x=>link("k:"+k.id,"p:"+x.partner,x.relation==="friend"?"friend":"network")); if(k.companyId) link("k:"+k.id,"c:"+k.companyId,"works"); });
  (S.links||[]).forEach(l=>link("k:"+l.a,"k:"+l.b,"family"));
  companies().forEach(c=>{ if(c.parentId) link("c:"+c.id,"c:"+c.parentId,"group"); });
  contacts().forEach(k=>(k.otherRoles||[]).forEach(r=>link("k:"+k.id,"c:"+r.companyId,"works")));
  companies().forEach(c=>{ if(c.source?.contactId) link("c:"+c.id,"k:"+c.source.contactId,"referred"); if(c.source?.partner) link("c:"+c.id,"p:"+c.source.partner,"referred"); if(c.partner) link("c:"+c.id,"p:"+c.partner,"lead"); });
  nodes.forEach(n=>n.deg=0); edges.forEach(e=>{e.a.deg++; e.b.deg++;});
  nodes.forEach(n=>{ if(n.type!=="p") n.r += Math.min(8, n.deg*1.2); });
  G.nodes=nodes; G.edges=edges; G.byId=by;
}
function netInfo(){
  const box=$("#netinfo"); if(!box) return; const n=G.sel; if(!n){ box.classList.remove("on"); return; }
  const links=G.edges.filter(e=>e.a===n||e.b===n).map(e=>({m:e.a===n?e.b:e.a,kind:e.kind}));
  let head="", extra="";
  if(n.type==="p"){ const ppl=contacts().filter(k=>knowers(k).some(x=>x.partner===n.label)); head="Munger team"; extra=`<div class="tag">${["A","B","C"].map(t=>`${ppl.filter(k=>tierOf(k)===t).length} ${t}`).join(" · ")} · ${ppl.filter(k=>knowers(k).some(x=>x.partner===n.label&&x.relation==="friend")).length} friends · ${companies().filter(c=>c.partner===n.label).length} deals led</div>`; }
  if(n.type==="k"){ const k=S.contacts.get(n.id.slice(2)); head=`${n.tier} · ${TIERS[n.tier].label}`; extra=k?`<div class="tag">${esc(workLine(k))}</div><div class="tag">Known by ${esc(knowsTxt(k)||"nobody yet")}</div>`:""; }
  if(n.type==="c"){ const c=S.companies.get(n.id.slice(2)); head="Business"; extra=c?`<div>${stagePill(c.status)}</div><div class="tag">${peopleAt(c).length} people we know here</div>`:""; }
  const kindTxt={friend:"friend",network:"knows",works:"works at",referred:"introduced",lead:"lead partner"};
  box.innerHTML=`<span class="tag">${esc(head)}</span><b style="font-size:15px">${esc(n.label)}</b>${extra}<div class="section-t" style="margin-top:4px">Connected to (${links.length})</div><div style="max-height:150px;overflow:auto">${links.map(({m,kind})=>`<div>${esc(m.label)} <span class="tag">${kindTxt[kind]||""}</span></div>`).join("")||`<span class="tag">Nothing yet</span>`}</div>${n.type!=="p"?`<button class="btn sm" data-act="net-open" data-k="${n.type}:${esc(n.id.slice(2))}">Open</button>`:""}`;
  box.classList.add("on");
}

function likeModal(id){
  const c=S.companies.get(id); if(!c) return; const isT=grp(c)!=="network"||isPartnerCo(c);
  showModal(`${ovHead(isT?"Check-ins":"We like it",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 12px;font-size:15.5px">${isT?"":`<b>${esc(c.name)}</b> becomes a target. `}When should we check in?</p>
   <div class="fields"><div class="fld"><label for="lkCad">Check in</label><select id="lkCad">${opts(CADENCE.filter(x=>x.m).map(x=>({v:x.m,l:x.l})),Number(c.followUpMonths)||3)}</select></div>
   <div class="fld"><label for="lkDate">First / next check-in date</label><input id="lkDate" type="date" value="${esc(c.nextCheckIn||addMonths(today(),Number(c.followUpMonths)||3))}"></div>
   <div class="fld"><label>Responsible to follow up</label><div class="rolechips" style="margin-top:6px">${S.partners.map(p=>`<label><input type="checkbox" name="lkResp" value="${esc(p)}" ${(respOf(c).length?respOf(c):[defaultResp()]).includes(p)?"checked":""}><span>${esc(p.split(" ")[0])}</span></label>`).join("")}</div></div></div>
   ${isT?"":`<div class="hint">Next: add the owners and key people at ${esc(c.name)} so we know our way in.</div>`}
   <div style="margin-top:14px"><button class="btn primary block" data-act="like-save" data-id="${esc(c.id)}">${isT?"Save":"★ Make it a target"}</button></div></div>`, true);
}
/* ---------- Phase 2 events ---------- */
document.addEventListener("click", async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return;
  const a=t.dataset.act, k=t.dataset.k, id=t.dataset.id;
  switch(a){
    case "complete-profile": contactForm(id); break;
    case "like": likeModal(id); break;
    case "like-save": { const c=S.companies.get(id); if(!c) break; const by=await myName(); const was=grp(c);
      const patch={followUpMonths:Number($("#lkCad").value)||3, nextCheckIn:$("#lkDate").value||addMonths(today(),3)}; { const R=[...document.querySelectorAll("input[name=lkResp]:checked")].map(x=>x.value); if(R.length) patch.responsible=R; }
      if(!isPartnerCo(c)&&(was==="network"||was==="closed")){ patch.status="target"; patch.log=[...(c.log||[]),{d:today(),by,text:"★ We like it – now a target"}].slice(-200); }
      if(await dbUpdate("companies/"+id,patch)){ closeModal(); toast(was==="network"?"Now a target":"Check-ins updated"); } break; }
    case "not-for-us": { const c=S.companies.get(id); const by=await myName(); if(await dbUpdate("companies/"+id,{status:"passed", nextCheckIn:"", log:[...(c.log||[]),{d:today(),by,text:"Not for us"}].slice(-200)})) toast("Marked not for us"); break; }
    case "start-deal": { const c=S.companies.get(id); const by=await myName(); if(await dbUpdate("companies/"+id,{status:"talks", log:[...(c.log||[]),{d:today(),by,text:"Started a conversation – now an active deal"}].slice(-200)})) toast("Now an active deal"); break; }
    case "biz-network": S.f.group="network"; break;
    case "person-at": { const c=S.companies.get(id); contactForm(null,{companyId:id, firm:"", industry:c?.industry||"", town:c?.town||"", province:c?.province||""}); break; }
    case "ask-ex": $("#askQ").value=k; runAsk(k); break;
    case "meet-start": { const {error}=await sb.from("meetings").insert({held_on:today()}); if(error) writeErr(error); else { await loadMeetings(); toast("Meeting started"); } break; }
    case "meet-finish": { const notes=$("#mtNotes")?.value||""; const {error}=await sb.from("meetings").update({status:"done", notes}).eq("id",id); if(error) writeErr(error); else { await loadMeetings(); const m=S.meetings.find(x=>x.id===id); toast("Meeting saved"); if(m) showOut("Minutes", minutesText(m)); } break; }
    case "meet-copy": { const m=S.meetings.find(x=>x.id===id); if(m){ const notes=$("#mtNotes")?.value||m.notes; copyText(minutesText({...m,notes})); } break; }
    case "meet-minutes": { const m=S.meetings.find(x=>x.id===id); if(m) showOut("Minutes · "+fmtD(m.held_on), minutesText(m)); break; }
    case "decide": decide(id,k); break;
    case "cmt-add": { const action=$("#cmAction").value.trim(); if(!action){ toast("Write the action first"); break; } const m=openMeeting();
      const {error}=await sb.from("commitments").insert({owner:$("#cmOwner").value, action, due:$("#cmDue").value||null, company_id:$("#cmBiz").value||null, meeting_id:m?.id||null}); if(error) writeErr(error); else { await loadCommitments(); toast("Commitment added"); } break; }
    case "cmt-done": { const {error}=await sb.from("commitments").update({status:"done"}).eq("id",id); if(error) writeErr(error); else { await loadCommitments(); toast("Done. Nice."); } break; }
    case "cmt-not": showModal(`${ovHead("Not done",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><div class="fields"><div class="fld"><label for="cmWhy">Why wasn't it done? ${esc((S.commitments.find(c=>c.id===id)?.owner||"").split(" ")[0])}'s reason</label><textarea id="cmWhy" rows="3" placeholder="e.g. Owner was away – rescheduled to next week"></textarea></div></div><div style="margin-top:12px"><button class="btn primary block" data-act="cmt-not-save" data-id="${esc(id)}">Save</button></div></div>`, true); break;
    case "cmt-not-save": { if(!$("#cmWhy").value.trim()){ toast("Add a short reason"); $("#cmWhy").focus(); break; } const {error}=await sb.from("commitments").update({status:"not_done", why:$("#cmWhy").value.trim()}).eq("id",id); if(error) writeErr(error); else { closeModal(); await loadCommitments(); toast("Recorded"); } break; }
  }
});
document.addEventListener("submit",e=>{ if(e.target.id==="askForm"){ e.preventDefault(); runAsk($("#askQ").value); } });
document.addEventListener("input",e=>{ if(e.target.closest && e.target.closest("#contactForm")) kFormUpdate(); });
document.addEventListener("change",e=>{ if(e.target.closest && e.target.closest("#contactForm")) kFormUpdate(); if(e.target.id==="mtNotes"){ const m=openMeeting(); if(m) sb.from("meetings").update({notes:e.target.value}).eq("id",m.id).then(()=>{}); } if(e.target.id==="impRel"){ S.imp.rel=e.target.value; } });
document.addEventListener("keydown",e=>{ if(e.target.id==="askQ" && e.key==="Enter" && !e.shiftKey){ e.preventDefault(); runAsk(e.target.value); } });
