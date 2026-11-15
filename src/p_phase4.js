/* ================= Phase 4: People · Partners · Businesses ================= */
const PKINDS={financier:"Bank / funder",accounting:"Accounting firm",legal:"Law firm",advisory:"Advisor / broker",service:"Other partner"};
const PIND={financier:"Business & financial services › Financial services & lending",accounting:"Business & financial services › Accounting & tax",legal:"Business & financial services › Legal",advisory:"Business & financial services › Consulting"};
const PKW={financier:"bank banker financier funding finance lender credit loan",accounting:"accountant accounting audit auditor tax",legal:"attorney lawyer legal law conveyancer",advisory:"advisor adviser broker corporate finance consultant m&a",other:"",service:""};
function isPartnerKind(k){ return !!k && !["target","other","network","acquire"].includes(k); }
const BIZSEL=[{v:"network",l:"Just in our network"},{v:"acquire",l:"We'd like to own it (target)"},{v:"other",l:"Other"}];
function kindFromSel(v){ return v==="network"||v==="acquire"? "target" : (v||"target"); }
function bizSelOf(c){ return c.kind==="other"? "other" : stageOf(c.status).group==="network"? "network" : "acquire"; }
function isPartnerCo(c){ return !!c && isPartnerKind(c.kind); }
function partnerHay(co){ return isPartnerCo(co)? `partner firm ${PKINDS[co.kind]||""} ${PKW[co.kind]||""}` : ""; }
Object.keys(KINDS).forEach(k=>delete KINDS[k]);
Object.assign(KINDS,{target:"Business we might buy",financier:"Partner · Bank / funder",accounting:"Partner · Accounting firm",legal:"Partner · Law firm",advisory:"Partner · Advisor / broker",other:"Partner · Other"});
const pkIcon=c=>c.kind==="financier"?"bank":"biz";
function partnerLeads(c){ const ids=new Set(peopleAt(c).map(k=>k.id)); return companies().filter(x=>!isPartnerCo(x) && x.source?.contactId && ids.has(x.source.contactId)); }
function partnerCover(c){ return [...new Set(peopleAt(c).flatMap(k=>knowers(k).map(x=>x.partner.split(" ")[0])))]; }
function partnerRow(c){
  const ppl=peopleAt(c), leads=partnerLeads(c).length, cov=partnerCover(c);
  return `<button class="rowi" data-open="${esc(c.id)}"><span class="avatar biz">${ic(pkIcon(c),20)}</span><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([PKINDS[c.kind], c.town, ppl.length?`${ppl.length} ${ppl.length===1?"person":"people"}`:"", cov.join(", ")].filter(Boolean).join(" · "))}</span></span><span class="trail">${leads?`<span class="pill won">${leads} lead${leads>1?"s":""}</span>`:""}${ppl.length?"":`<span class="pill late">Gap</span>`}</span></button>`;
}
function partnerLeadsHTML(c){
  const L=partnerLeads(c);
  return `<div class="fsec">Leads through them (${L.length})</div>${L.length?`<div class="group">${L.map(bizRow).join("")}</div>`:`<div class="card box tag">No businesses introduced yet. When you add a business, pick the person who referred it and it counts here.</div>`}`;
}

/* ---------- Partners view ---------- */
S.pf=S.pf||{kind:"",q:""};
function vPartners(){
  const P=S.pf; if(S.view==="funders"&&!P._f){ P.kind="financier"; P._f=1; }
  const all=companies().filter(isPartnerCo); const q=P.q.trim().toLowerCase();
  const kk=c=>c.kind==="service"?"other":c.kind;
  const arr=all.filter(c=>(!P.kind||kk(c)===P.kind) && (!q || [c.name,c.town,PKINDS[c.kind],c.notes,...peopleAt(c).map(k=>k.name)].join(" ").toLowerCase().includes(q)))
    .sort((a,b)=>partnerLeads(b).length-partnerLeads(a).length || peopleAt(b).length-peopleAt(a).length || a.name.localeCompare(b.name));
  const gaps=all.filter(c=>!peopleAt(c).length).length;
  const chip=(k,l)=>`<button class="chip ${P.kind===k?"on":""}" data-act="pf-kind" data-k="${k}">${l} <span class="n">${k?all.filter(c=>kk(c)===k).length:all.length}</span></button>`;
  return `<div class="ph"><div><h1>Partners</h1><p>Banks, funders, accounting and law firms, and advisors who help us find and fund deals.${gaps?` ${gaps} where we know nobody yet.`:""}</p></div><button class="btn sm primary" data-act="new-partner">${ic("plus",18)} Add</button></div>
  <div class="search">${ic("search",20)}<input id="pfq" type="search" placeholder="Search firm or person…" value="${esc(P.q)}" autocomplete="off" aria-label="Search partners"></div>
  <div class="chips">${chip("","All")}${chip("financier","Banks & funders")}${chip("accounting","Accounting")}${chip("legal","Law firms")}${chip("advisory","Advisors & brokers")}${chip("other","Other")}</div>
  ${arr.length?`<div class="group">${arr.map(partnerRow).join("")}</div>`:`<div class="card empty"><b>No partners here yet</b>Tap Add, or add a person and type their firm under “Works at”.</div>`}
  <p class="tag" style="margin:12px 2px">Open a partner and tap “+ Add someone who works here” for each person we deal with there. Leads they send us are counted against the firm.</p>`;
}

/* ---------- Businesses: only companies we might buy ---------- */
function filteredDeals(){
  const f=S.f, q=f.q.trim().toLowerCase();
  return companies().filter(c=>{
    if(isPartnerCo(c)) return false;
    const g=grp(c);
    if(f.group==="likely"){ if(!likelySeller(c)||g==="closed"||g==="won") return false; } else if(f.group && g!==f.group) return false;
    if(f.mine && !isMine(c)) return false;
    if(f.sector && sectorOf(c)!==f.sector) return false;
    if(f.partner && c.partner!==f.partner) return false;
    if(f.province && c.province!==f.province) return false;
    if(f.channel && c.source?.channel!==f.channel) return false;
    if(f.lang){ const ls=companyLangs(c); if(!(ls.includes(f.lang)||ls.includes("both"))) return false; }
    if(q){ const hay=[c.name,c.tradingAs,c.town,c.province,c.industry,c.notes,c.partner,sourceText(c),...(c.owners||[]).flatMap(o=>[o.name,o.email,o.cell]),...peopleAt(c).map(k=>k.name)].join(" ").toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  }).sort((a,b)=>{ const x=a.nextCheckIn||"9999", y=b.nextCheckIn||"9999"; return x.localeCompare(y) || (a.name||"").localeCompare(b.name||""); });
}
function vBusinesses(){
  const f=S.f; const arr=filteredDeals(); const acq=companies().filter(c=>!isPartnerCo(c)); const n=g=>acq.filter(c=>grp(c)===g).length;
  const nf=["sector","partner","province","channel","lang"].filter(x=>f[x]).length;
  return `<div class="ph"><div><h1>Businesses</h1><p>Companies we might buy: in our network, the ones we like, and where we stand.</p></div><button class="btn sm primary" data-act="new-deal">${ic("plus",18)} Add</button></div>
  <div class="search">${ic("search",20)}<input id="fq" type="search" placeholder="Search business, owner, town…" value="${esc(f.q)}" autocomplete="off" aria-label="Search businesses"></div>
  <div class="chips">
    ${[["target","Targets"],["active","In discussions"],["network","In our network"],["likely","Likely sellers"],["won","Deal done"],["closed","Closed"],["","All"]].map(([g,l])=>`<button class="chip ${f.group===g?"on":""}" data-act="f-group" data-k="${g}">${l} <span class="n">${g==="likely"?acq.filter(c=>likelySeller(c)&&!["closed","won"].includes(grp(c))).length:g?n(g):acq.length}</span></button>`).join("")}
    ${myPartner()?`<button class="chip ${f.mine?"on":""}" data-act="f-mine">Mine</button>`:""}
    <button class="chip ${nf?"on":""}" data-act="f-sheet">${ic("sliders",16)} Filters${nf?` · ${nf}`:""}</button>
  </div>
  ${arr.length? `<div class="group">${arr.map(bizRow).join("")}</div>` : `<div class="card empty">${f.group==="target"?"<b>No targets yet</b>Open a business that's in our network and tap <b>We like it</b>.":"<b>Nothing here</b>Try another tab or clear the filters."}</div>`}
  ${arr.length?`<div style="text-align:center;margin-top:14px"><button class="btn sm" data-act="export-deals">${ic("dl",18)} Download this list</button></div>`:""}`;
}

/* ---------- Person form: new company → partner firm or business ---------- */
function guessPKind(d){ const t=[d.type,d.title,d.expertise,d.coName].join(" ").toLowerCase();
  if(/bank|financ|credit|lend|capital|fund/.test(t)) return "financier"; if(/account|audit|tax|chartered/.test(t)) return "accounting"; if(/attorney|lawyer|legal|advocate|incorporated|\binc\b/.test(t)) return "legal"; return "advisory"; }
const PROLES=["Partner / director","Relationship manager / banker","Credit / deal team","Head of region / branch","Senior manager","Associate / analyst","Other"];
function whereVal(){ return (document.querySelector("input[name=kWhere]:checked")||{}).value||"other"; }
function fillCoPick(){
  const w=whereVal(), sel=$("#kCoPick"); if(!sel) return; const cur=sel.value||FORM.coInit||"";
  const list=companies().filter(c=> w==="partner"? isPartnerCo(c) : !isPartnerCo(c)).sort((a,b)=>a.name.localeCompare(b.name));
  sel.innerHTML=`<option value="">Choose…</option>${list.map(c=>`<option value="${esc(c.id)}"${c.id===cur?" selected":""}>${esc(c.name)}${w==="partner"?` · ${esc(PKINDS[c.kind]||"")}`:""}</option>`).join("")}<option value="__new"${cur==="__new"?" selected":""}>+ New ${w==="partner"?"partner firm":"business"}…</option>`;
  if(!list.some(c=>c.id===cur) && cur!=="__new" && $("#kCoNew")?.value) sel.value="__new";
  $("#kCoPickL").textContent= w==="partner"? "Which partner?" : "Which business?";
  $("#kCoNewL").textContent= w==="partner"? "Name of the new partner firm" : "Name of the business";
  const role=$("#kRole"); if(role){ const rv=role.value; const L=w==="partner"? PROLES : ROLES; role.innerHTML=opts(L.includes(rv)||!rv? L : [rv,...L], rv, "Choose…"); }
}
function whereRead(){
  const w=whereVal();
  if(w==="other"){ const f=($("#kFirm")?.value||"").trim(); const co=f? companies().find(c=>c.name.toLowerCase()===f.toLowerCase()) : null; return {where:w, co, coName:co?co.name:f, isNew:false}; }
  const v=$("#kCoPick")?.value||"";
  if(v==="__new"){ const nm=($("#kCoNew")?.value||"").trim(); const ex=nm? companies().find(c=>c.name.toLowerCase()===nm.toLowerCase()) : null; return {where:w, co:ex, coName:ex?ex.name:nm, isNew:!ex && !!nm}; }
  const co=v? S.companies.get(v) : null; return {where:w, co, coName:co?co.name:"", isNew:false};
}
function newCoUpdate(d){
  if(!$("#kCoPick")) return;
  if(!FORM.whereTouched && !FORM.id){ const want=(d.tier==="A"||OWNER_ROLES.includes(d.companyRole))? "business" : d.tier==="B"? "partner" : null; if(want && !FORM.coInit && whereVal()!==want){ const r=document.querySelector(`input[name=kWhere][value=${want}]`); if(r){ r.checked=true; fillCoPick(); } } }
  if(!$("#kCoPick").options.length) fillCoPick();
  const w=whereVal(), v=$("#kCoPick").value;
  $("#kCoPickW").hidden= w==="other"; $("#kFirmW").hidden= w!=="other";
  $("#kCoNewW").hidden= !(w!=="other" && v==="__new");
  const kw=$("#kNewCoKindW"), was=kw.hidden; kw.hidden= !(w==="partner" && v==="__new");
  if(was && !kw.hidden && !FORM.nkTouched) $("#kNewCoKind").value=guessPKind(d);
}
function newCoChoice(d){ const W=whereRead(); if(!W.isNew) return {what:"none"}; return {what:W.where==="partner"?"partner":"business", kind:$("#kNewCoKind")?.value||"advisory"}; }

/* ---------- Events ---------- */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act, k=t.dataset.k;
  if(a==="pf-kind"){ S.pf.kind=k; render(); }
  if(a==="new-partner" && !S.readOnly){ dealForm(null,{kind:S.pf.kind? (S.pf.kind==="other"?"service":S.pf.kind) : "financier", status:"network"}); }
});
document.addEventListener("change",e=>{
  if(e.target.name==="kWhere"){ FORM.whereTouched=true; $("#kCoPick").value=""; fillCoPick(); kFormUpdate(); }
  if(e.target.id==="kCoPick"){ kFormUpdate(); if(e.target.value==="__new") setTimeout(()=>$("#kCoNew")?.focus(),50); }
  if(e.target.id==="cKind"){ const h=document.querySelector("#modal .ovh h2, #modal .ovhead b"); }
});
document.addEventListener("input",e=>{ if(e.target.id==="pfq"){ S.pf.q=e.target.value; const pos=e.target.selectionStart; render(); const i=$("#pfq"); if(i){ i.focus(); try{ i.setSelectionRange(pos,pos); }catch(_){} } } });

/* ---------- Owners captured on a business become People (A · Owner), linked both ways ---------- */
const last9=s=>String(s||"").replace(/\D/g,"").slice(-9);
async function syncOwnersToPeople(cid, owners, biz, skipId){
  let made=0;
  for(const o of owners||[]){
    const nm=String(o.name||"").trim(); if(!nm) continue;
    const ph=last9(o.cell), em=String(o.email||"").toLowerCase();
    const same=contacts().find(k=>k.id===skipId && k.name.toLowerCase()===nm.toLowerCase()) || contacts().find(k=>(k.companyId===cid||k.ownsCompanyId===cid) && k.name.toLowerCase()===nm.toLowerCase()) || contacts().find(k=>(ph.length===9&&last9(k.cell)===ph)||(em&&String(k.email||"").toLowerCase()===em));
    if(same){ if(!same.companyId) await dbUpdate("contacts/"+same.id,{companyId:cid, companyRole:o.role||"Owner", ownsCompanyId:cid, firm:"", tier:same.tier||"A"}); continue; }
    const ok=await dbSet("contacts/"+newId(),{name:nm, tier:"A", type:"Business owner", companyId:cid, companyRole:o.role||"Owner", ownsCompanyId:cid, firm:"", cell:o.cell||"", email:o.email||"", language:o.language||"af", partner:biz.partner||"", town:biz.town||"", province:biz.province||"", country:biz.hqCountry||"South Africa", influence:0, notes:""});
    if(ok) made++;
  }
  if(made) toast(`${made} owner${made>1?"s":""} added to People`);
}
document.addEventListener("change",e=>{ if(e.target.name==="kTier" && e.target.value==="C"){ const c=$("#kTal"); if(c&&!c.checked){ c.checked=true; kFormUpdate(); } } });

document.addEventListener("change",e=>{ if(e.target.id==="kNewCoKind") FORM.nkTouched=true; if(e.target.name==="kWhere") FORM.whereTouched=true; },true);
