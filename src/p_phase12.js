/* ================= Phase 12: a person's own business is never "their lead" ================= */
function ownsOrWorks(k,c){ return !!k && !!c && (k.companyId===c.id || k.ownsCompanyId===c.id || (c.owners||[]).some(o=>normName(o.name)===normName(k.name))); }
dealsFrom=function(contactId){ const k=S.contacts.get(contactId); return companies().filter(c=>c.source?.contactId===contactId && !ownsOrWorks(k,c)); };
ownerDealForm=function(contactId, ownPlace){
  const kk=S.contacts.get(contactId); if(!kk) return; const t=tierOf(kk); const owner=t==="A"||OWNER_ROLES.includes(kk.companyRole);
  const map={"Accountant / auditor":"accounting","Attorney":"law","Tax advisor":"tax","Banker / financier":"bank","Business broker":"broker","Well-connected friend":"friend"};
  const theirs=owner||ownPlace;
  const preset={source: theirs? {} : {channel:map[kk?.type]||"connector", contactId}, partner:kk?.partner||defaultPartner()};
  preset.name= theirs? (kk.firm||"") : "";
  if(theirs){ preset.province=kk.province||""; preset.town=kk.town||""; preset.industry=kk.industry||""; }
  if(owner) preset.owners=[{name:kk.name,cell:kk.cell||"",email:kk.email||"",language:kk.language||"af",role:kk.companyRole||"Owner"}];
  dealForm(null,preset);
  FORM.fromOwner= theirs? contactId : null; FORM.fromRole= kk.companyRole||(owner?"Owner":""); FORM.fromIsOwner=owner;
};
function ownsLine(k){
  const xr=new Set((k.otherRoles||[]).map(r=>r.companyId)); const owned=companies().filter(c=>c.id!==k.companyId && !xr.has(c.id) && (k.ownsCompanyId===c.id || (c.owners||[]).some(o=>normName(o.name)===normName(k.name))));
  return owned.length? `<div class="fsec">Owns</div><div class="group">${owned.map(bizRow).join("")}</div>` : "";
}
/* Don't lose a work link by accident when editing */
{ const base=submitContact;
  submitContact=async function(){
    if(FORM.id && !FORM.unlinkOk){ const prev=S.contacts.get(FORM.id); const W=whereRead(); const pc=prev?.companyId? S.companies.get(prev.companyId) : null;
      if(pc && !W.co && !W.isNew){
        fuzzyBox("#contactForm","Remove the link?",`${esc(prev.name)} is linked to <b>${esc(pc.name)}</b>. Saving like this removes that link.`, "",
          `<div style="display:grid;gap:10px"><button class="btn primary block" data-act="unlink-keep" data-id="${esc(pc.id)}">Keep the link to ${esc(pc.name)}</button><button class="btn block" data-act="unlink-ok">They don't work there any more – remove it</button></div>`);
        return; } }
    FORM.unlinkOk=false; return base();
  };
}
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="unlink-keep"){ closeDupBox(); const c=S.companies.get(t.dataset.id); if(!c) return; const r=document.querySelector(`input[name=kWhere][value=${isPartnerCo(c)?"partner":c.kind==="other"?"company":"business"}]`); if(r) r.checked=true; fillCoPick(); $("#kCoPick").value=c.id; kFormUpdate(); FORM.unlinkOk=false; submitContact(); }
  if(a==="unlink-ok"){ closeDupBox(); FORM.unlinkOk=true; submitContact(); }
});
