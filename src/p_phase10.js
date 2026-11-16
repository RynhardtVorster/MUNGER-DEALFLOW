/* ================= Phase 10: Ask the network – better examples and intents ================= */
["looking","connect","connecting","introduce","introduction","industry","industries","sector","works","working","work","business","businesses","company","companies","doing","does","key","influential","most","best","top","biggest","person","know","knows","anyone","sell","selling","x"].forEach(w=>STOP.add(w));
INTENTS.forEach(it=>{ if(it.keys.includes("funding")) ["financing","fund","funds","funder","funders","lender","lenders","lending","credit"].forEach(k=>{ if(!it.keys.includes(k)) it.keys.push(k); }); });
const ASK_EX=[
 "I need financing for an acquisition in agri",
 "I'm looking for a business doing cold storage in the Western Cape",
 "Who can connect me with someone in the mining industry?",
 "Who works in the tourism industry?",
 "Who is the most influential person in the citrus industry?",
 "We want to build an apartment block in Cape Town"
];
{ const base=localFind;
  localFind=function(q){
    const r=base(q); const ql=q.toLowerCase();
    const wantsFunding=/financ|fund|loan|lend|capital|debt|bank|credit/.test(ql);
    const wantsBiz=/business|company|companies|firm doing|operator|manufacturer|supplier/.test(ql) && /looking for|find|need|want|acquire|buy/.test(ql);
    const wantsTop=/influential|most connected|best connected|key person|key people|top person|biggest name|who matters/.test(ql);
    if(wantsFunding){
      const fins=companies().filter(c=>isPartnerCo(c) && FUNDING_KINDS.includes(c.kind)).sort((a,b)=>partnerLeads(b).length-partnerLeads(a).length||peopleAt(b).length-peopleAt(a).length);
      r.partners=fins.map(c=>c.id);
      const ppl=fins.flatMap(c=>peopleAt(c)).filter(k=>!r.groups.some(g=>g.people.some(p=>p.id===k.id)));
      if(ppl.length) r.groups.unshift({title:"People at our banks & strategic funders", people:ppl.slice(0,10).map(k=>({id:k.id, why:`${k.companyRole||k.title||"Works"} at ${companyOf(k)?.name||""}`}))});
      if(!fins.length) r.gaps=[...(r.gaps||[]),"No banks or strategic funders added under Partners yet"];
    }
    if(wantsBiz){ r.bizFirst=true; }
    if(wantsTop){
      r.groups.forEach(g=>g.people.sort((a,b)=>influenceScore(S.contacts.get(b.id))-influenceScore(S.contacts.get(a.id))));
      r.summary=(r.groups.length? "Ranked by influence (your star ratings, who knows them and the leads they've brought). " : "")+r.summary;
    }
    const matchedCos=(r.biz||[]).map(id=>S.companies.get(id)).filter(Boolean);
    const inGroups=new Set(r.groups.flatMap(g=>g.people.map(p=>p.id)));
    const atCos=matchedCos.flatMap(c=>peopleAt(c).map(k=>({k,c}))).filter(x=>!inGroups.has(x.k.id));
    if(atCos.length){ r.groups.push({title:"People at matching businesses", people:atCos.slice(0,10).map(x=>({id:x.k.id, why:`${x.k.companyRole||x.k.title||"Works"} at ${x.c.name}`}))}); if(/Nobody in the network matches/.test(r.summary)) r.summary=`Found ${atCos.length} ${atCos.length===1?"person":"people"} at businesses that match.`; }
    if(wantsTop) r.groups.forEach(g=>g.people.sort((a,b)=>influenceScore(S.contacts.get(b.id))-influenceScore(S.contacts.get(a.id))));
    r.biz=(r.biz||[]).filter(id=>{ const c=S.companies.get(id); return c && !isPartnerCo(c); });
    return r;
  };
}
function vAsk(){
  const A=S.ask||{q:"",res:null}; const r=A.res;
  const bizHTML= r&&r.biz&&r.biz.length? `<div class="sec"><h2>Businesses that match</h2></div><div class="group">${r.biz.map(id=>S.companies.get(id)).filter(Boolean).map(bizRow).join("")}</div>` : "";
  const partHTML= r&&r.partners&&r.partners.length? `<div class="sec"><h2>Our banks & strategic funders</h2></div><div class="group">${r.partners.map(id=>S.companies.get(id)).filter(Boolean).map(partnerRow).join("")}</div>` : "";
  return `<div class="ph"><div><h1>Ask the network</h1><p>Say what you need in plain words: funding, a type of business, an introduction, or who matters in an industry. We'll find the people, firms and businesses, and who in our team knows them.</p></div></div>
  <form id="askForm" class="askform"><div class="fldh" style="margin:0 2px 6px"><label for="askQ" class="lbl" style="margin:0">What do you need?</label>${micBtn("askQ")}</div><textarea id="askQ" rows="3" placeholder="e.g. I need financing for an acquisition in agri, or who can get us into SuperB Maize?">${esc(A.q||"")}</textarea><button type="submit" class="btn primary">${ic("spark",18)} Ask</button></form>
  ${!r&&!A.loading?`<div class="lbl" style="margin:14px 4px 6px">Try one of these</div><div class="group">${ASK_EX.map(e=>`<button class="rowi" data-act="ask-ex" data-k="${esc(e)}"><span class="avatar biz">${ic("spark",18)}</span><span class="main"><span class="t1" style="display:block;white-space:normal;font-weight:500">${esc(e)}</span></span></button>`).join("")}</div>`:""}
  ${A.loading?`<div class="card empty"><b>Searching the network…</b>Looking at ${contacts().length} people and ${companies().length} companies.</div>`:""}
  ${r?`<div class="card box" style="margin-top:12px"><div class="lbl">${r.mode==="ai"?"Smart search (AI)":"Basic search"}</div><div>${esc(r.summary)}</div>${r.mode!=="ai"&&S.aiOff?`<div class="tag">Smart AI search isn't switched on yet, so this is a basic match on titles, industries, skills, companies, towns and notes. Rynhardt can switch on the AI under Supabase → Edge Functions → Secrets (ANTHROPIC_API_KEY).</div>`:""}</div>${aiExtras(r)}
   ${r.bizFirst?bizHTML:""}${partHTML}
   ${r.groups.map(g=>`<div class="sec"><h2>${esc(g.title)}</h2><span class="tag">${g.people.length}</span></div><div class="group">${g.people.map(askPerson).join("")}</div>`).join("")}
   ${r.bizFirst?"":bizHTML}
   ${r.gaps&&r.gaps.length?`<div class="sec"><h2>Gaps in our network</h2></div><div class="card box"><div>${esc(r.gaps.join(" · "))}</div><div class="tag">Nobody tagged for these yet. Worth asking around for introductions.</div></div>`:""}
   <div style="text-align:center;margin-top:14px"><button class="btn sm" data-act="ask-clear">Ask something else</button></div>`:""}`;
}
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act=ask-clear]"); if(!t) return; S.ask={q:"",res:null}; render(); setTimeout(()=>$("#askQ")?.focus(),50); });
