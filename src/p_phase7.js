/* ================= Phase 7: no duplicates ================= */
function normName(s){ return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim(); }
function nameKeyLoose(s){ const t=normName(s).split(" ").filter(Boolean); return t.length>=2? t[0]+" "+t[t.length-1] : t.join(" "); }
function dupPeople(d, exceptId){
  const out=[]; const p=phoneKey(d.cell), em=String(d.email||"").trim().toLowerCase(), nk=normName(d.name), nl=nameKeyLoose(d.name);
  contacts().forEach(k=>{ if(k.id===exceptId) return; const why=[];
    if(p && phoneKey(k.cell)===p) why.push("same cell number");
    if(em && String(k.email||"").trim().toLowerCase()===em) why.push("same email");
    if(nk && (normName(k.name)===nk || (nl.includes(" ") && nameKeyLoose(k.name)===nl))) why.push("same name");
    if(why.length) out.push({k, why, strong:why.some(w=>w!=="same name")}); });
  return out.sort((a,b)=>b.strong-a.strong);
}
function dupCompany(name, exceptId){ const n=normName(name); return n? companies().find(c=>c.id!==exceptId && normName(c.name)===n) : null; }
function contactDupCheck(){
  const w=$("#kDup"); if(!w) return;
  const hits=dupPeople({name:$("#kName").value, cell:$("#kCell").value, email:$("#kEmail")?.value}, FORM.id);
  w.innerHTML=hits.length? hits.slice(0,3).map(h=>`<div>${h.strong?"⚠ Already in Munger: ":h.why.includes("same name")?"Already in Munger: ":"Did you mean "}<a href="#" data-act="open-dup-contact" data-id="${esc(h.k.id)}">${esc(h.k.name)}</a> (${esc(h.why.join(", "))}${h.k.companyId&&S.companies.get(h.k.companyId)?` · ${esc(S.companies.get(h.k.companyId).name)}`:""})</div>`).join("") : "";
}
function dupCheck(){
  const w=$("#dupWarn"); if(!w) return; const hit=dupCompany($("#cName").value, FORM.id);
  w.innerHTML = hit? `⚠ Already in Munger: <a href="#" data-act="open-dup" data-id="${esc(hit.id)}">${esc(hit.name)}</a> · ${esc(isPartnerCo(hit)?"Partner · "+(PKINDS[hit.kind]||""):(STAGE[hit.status]?.label||""))}` : "";
}
function dupModal(hits, onNew){
  const strong=hits.some(h=>h.strong);
  FORM.dupHits=hits; FORM.dupNew=onNew;
  const formEl=$("#contactForm"); if(formEl) formEl.style.display="none";
  const box=document.createElement("div"); box.className="dupbox"; box.id="dupBox";
  box.innerHTML=`${ovHead("Already in Munger?",`<button class="hbtn" data-act="dup-back">Back</button>`)}<div class="ovb">
   <p style="margin:0 2px 12px;font-size:15.5px">${strong?"This person is already in the network. Update them instead of adding a duplicate.":hits.some(h=>h.why.includes("same name"))?"Someone with this name is already in the network. Is it the same person?":"Did you mean one of these people? If so, update them instead of adding a duplicate."}</p>
   <div class="group">${hits.slice(0,4).map(h=>`<div class="rowi" style="flex-wrap:wrap;gap:8px">${avatarP(h.k)}<span class="main" style="min-width:150px"><span class="t1" style="display:block">${esc(h.k.name)}</span><span class="t2" style="display:block">${esc([h.why.join(", "), workLine(h.k), h.k.cell, knowsTxt(h.k)].filter(Boolean).join(" · "))}</span></span><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm primary" data-act="dup-merge" data-id="${esc(h.k.id)}">Add my details to them</button><button class="btn sm" data-act="dup-open" data-id="${esc(h.k.id)}">Open</button></span></div>`).join("")}</div>
   ${strong?`<p class="tag" style="margin:12px 2px">The same cell number or email can't be saved twice.</p>`:`<div style="margin-top:14px"><button class="btn block" data-act="dup-new">It's a different person – add them</button></div>`}
  </div>`;
  formEl.parentNode.appendChild(box);
}
function closeDupBox(){ $("#dupBox")?.remove(); ["#contactForm","#dealForm"].forEach(s=>{ const f=$(s); if(f) f.style.display="contents"; }); }
async function mergeIntoExisting(id){
  const k=S.contacts.get(id); if(!k) return; const d=kFormRead(); const by=await myName();
  const patch={}; const fill=(f,v)=>{ if(v && !k[f]) patch[f]=v; };
  ["cell","email","town","province","title","industry","expertise","linkedin","type","companyRole","wealthSource"].forEach(f=>fill(f,d[f]));
  if(d.companyId && !k.companyId){ patch.companyId=d.companyId; patch.firm=""; if(OWNER_ROLES.includes(d.companyRole)) patch.ownsCompanyId=d.companyId; } else if(!k.companyId && !k.firm && d.firm) patch.firm=d.firm;
  if(d.tier && d.tier!=="D" && (!k.tier || k.tier==="D")) patch.tier=d.tier;
  if(d.influence>(k.influence||0)) patch.influence=d.influence;
  if(d.hnwi && !k.hnwi) patch.hnwi=true;
  if(d.talent?.on && !(k.talent||{}).on) patch.talent=d.talent;
  const ci=ciRead(); if(ci.nextCheckIn && !k.nextCheckIn) Object.assign(patch,ci);
  if(d.notes && !(k.notes||"").includes(d.notes)) patch.notes=[k.notes,d.notes].filter(Boolean).join("\n\n");
  patch.log=[...(k.log||[]),{d:today(),by,text:"Details added (duplicate prevented)"}].slice(-200);
  const ok=await dbUpdate("contacts/"+id,patch); if(!ok) return;
  const have=knowers(k).map(x=>({partner:x.partner,relation:x.relation})); const add=d.conns.filter(c=>!have.some(h=>h.partner===c.partner));
  if(add.length) await saveConns(id,[...have,...add]);
  closeModal(); toast(`Updated ${k.name} – no duplicate created`); openSheet("contact",id,true);
}
{ const base=submitContact;
  submitContact=async function(){
    const d=kFormRead(); if(!d.name){ return base(); }
    if(!FORM.dupOk){ const hits=dupPeople(d, FORM.id); if(hits.length){ dupModal(hits); return; } }
    FORM.dupOk=false; return base();
  };
}
{ const base=submitDeal;
  submitDeal=async function(){
    const hit=dupCompany($("#cName")?.value, FORM.id);
    if(hit){ toast(`${hit.name} is already in Munger`); dupCheck(); $("#dupWarn")?.scrollIntoView({block:"center"}); return; }
    return base();
  };
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act, id=t.dataset.id;
  if(a==="dup-back") closeDupBox();
  if(a==="dup-new"){ closeDupBox(); FORM.dupOk=true; submitContact(); }
  if(a==="dup-open"){ closeModal(); openSheet("contact",id,true); }
  if(a==="dup-merge"){ t.disabled=true; await mergeIntoExisting(id); }
});
