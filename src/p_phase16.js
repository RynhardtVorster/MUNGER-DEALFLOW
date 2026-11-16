/* ================= Phase 16: several types per person, industry search, smarter Ask ================= */
const TIER_PRIO=["A","D","C","B"];
function tagsOf(k){ const t=(k&&Array.isArray(k.tags)&&k.tags.length)? k.tags.filter(x=>TIERS[x]) : [tierOf(k)]; return TIER_PRIO.filter(x=>t.includes(x)); }
function hasTag(k,t){ return tagsOf(k).includes(t); }
function indList(){ return `<datalist id="indList">${SECTORS.flatMap(g=>INDUSTRIES[g].map(i=>`<option value="${esc(g+" › "+i)}"></option>`)).join("")}</datalist>`; }
document.addEventListener("change",e=>{ if(e.target.id==="kIndustry"||e.target.id==="cIndustry"){ const v=e.target.value.trim(); if(!v||v.includes(" › ")) return; const lv=v.toLowerCase(); let hit=null; SECTORS.forEach(g=>INDUSTRIES[g].forEach(i=>{ if(!hit && i.toLowerCase()===lv) hit=g+" › "+i; })); if(hit) e.target.value=hit; } });
INTENTS.push(
 {keys:["private","equity","pe","buyout","investor","investors","co-invest"], groups:[["Private equity & investors",["private equity","investment","asset management","family office","investor","venture"]]]},
 {keys:["betting","bookmaker","bookmakers","casino","casinos","gaming","gambling","lottery"], groups:[["Gaming & betting",["betting","bookmaker","casino","gaming","lotter"]]]}
);
/* richer context for the AI */
function kindTxt(c){ return isPartnerCo(c)? "PARTNER: "+(PKINDS[c.kind]||"") : c.kind==="other"? "NETWORK COMPANY (not to buy)" : grp(c)==="network"? "PROSPECT" : "TARGET ("+(STAGE[c.status]?.label||"")+")"; }
askLine=function(k){ const co=companyOf(k);
  const fam=familyOf(k).map(x=>`${x.rel} of ${x.o.name}`).join(", ");
  return [k.id,k.name,tagsOf(k).map(t=>TIERS[t].label).join("+"),[k.title,k.type].filter(Boolean).join(", "),
    co?`${co.name} (${k.companyRole||"works there"}; ${kindTxt(co)}; ${co.industry||""})`:k.firm, k.industry, k.expertise,
    [k.town,k.province,k.country].filter(Boolean).join(", "), knowsTxt(k), fam?`family: ${fam}`:"",
    [isTalent(k)?`talent ${(k.talent?.roles||[]).join("/")} ${k.talent?.rating||""}/5`:"", k.hnwi?`HNWI ${k.wealthSource||""}`:"", k.influence?`influence ${k.influence}/5`:"", k.doNotContact?"DO NOT CONTACT":""].filter(Boolean).join("; "),
    [(k.notes||""),(k.log||[]).slice(-4).map(e=>e.text).join(" "),k.checkInNote||""].join(" ").replace(/\s+/g," ").slice(0,400)
  ].map(v=>String(v||"").replace(/\|/g,"/")).join(" | "); };
function companyLine(c){ const ppl=peopleAt(c).map(k=>`${k.name} (${k.companyRole||k.title||"works there"}; known by ${knowers(k).map(x=>x.partner.split(" ")[0]).join("/")||"-"})`).join(", ");
  return [c.id,c.name,kindTxt(c),c.industry,[c.town,c.province,c.hqCountry].filter(Boolean).join(", "),ppl?`people: ${ppl}`:"",c.source?.contactId&&S.contacts.get(c.source.contactId)?`introduced by ${S.contacts.get(c.source.contactId).name}`:"",sigCount(c)?`sale signals: ${SIGNALS.filter(([s])=>(c.signals||{})[s]).map(([,l])=>l).join(", ")}`:"",[(c.notes||""),(c.log||[]).slice(-3).map(e=>e.text).join(" ")].join(" ").replace(/\s+/g," ").slice(0,300)].map(v=>String(v||"").replace(/\|/g,"/")).join(" | "); }
runAsk=async function(q){
  q=(q||"").trim(); if(!q) return; S.ask={q, res:null, loading:true}; render();
  const local=localFind(q); let res=local;
  if(!S.aiOff && (contacts().length||companies().length)){
    let pool=contacts(); if(pool.length>600){ const ids=new Set(local.groups.flatMap(g=>g.people.map(p=>p.id))); pool=[...pool.filter(k=>ids.has(k.id)),...pool.filter(k=>!ids.has(k.id)).sort((a,b)=>completeness(b).pct-completeness(a).pct)].slice(0,600); }
    try{
      const {data,error}=await sb.functions.invoke("ask-network",{body:{query:q, lines:pool.map(askLine), companies:companies().slice(0,400).map(companyLine), team:S.partners, asker:myPartner()}});
      if(error){ const st=error.context?.status; if(st===503) S.aiOff=true; else S.aiErr=true; }
      else if(data && Array.isArray(data.groups)){ res={mode:"ai", summary:data.summary||"", groups:data.groups.map(g=>({title:g.title, people:(g.people||[]).filter(p=>S.contacts.has(p.id))})).filter(g=>g.people.length), gaps:data.gaps||[],
        biz:(data.companies||[]).map(x=>x.id).filter(id=>S.companies.has(id)&&!isPartnerCo(S.companies.get(id))), partners:(data.companies||[]).map(x=>x.id).filter(id=>S.companies.has(id)&&isPartnerCo(S.companies.get(id))),
        coWhy:Object.fromEntries((data.companies||[]).map(x=>[x.id,x.why])), routes:data.routes||[], next:data.next||[], bizFirst:local.bizFirst}; }
    }catch(e){ S.aiErr=true; }
  }
  if(S.ask.q===q){ S.ask={q, res, loading:false}; if(S.view==="ask") render(); }
};
function aiExtras(r){
  if(!r || r.mode!=="ai") return "";
  return `${(r.routes||[]).length?`<div class="sec"><h2>Best routes in</h2></div><div class="group">${r.routes.map(x=>`<div class="rowi" style="align-items:flex-start"><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(x.path||"")}</span>${x.why?`<span class="t2" style="display:block;white-space:normal">${esc(x.why)}</span>`:""}</span></div>`).join("")}</div>`:""}
  ${(r.next||[]).length?`<div class="sec"><h2>Suggested next steps</h2></div><div class="card box">${r.next.map(n=>`<div>• ${esc(n)}</div>`).join("")}</div>`:""}`;
}
