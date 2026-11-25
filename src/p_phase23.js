/* ================= Phase 24: a lead can come through a partner firm (with or without a person there) ================= */
function partnerFirms(){ return companies().filter(isPartnerCo).sort((a,b)=>a.name.localeCompare(b.name)); }
function firmOfContact(k){ if(!k) return null; const ids=[k.companyId,...(k.otherRoles||[]).map(r=>r.companyId)].filter(Boolean); for(const id of ids){ const c=S.companies.get(id); if(isPartnerCo(c)) return c; } return null; }
function firmFieldHTML(sel){ const F=partnerFirms();
  return `<div class="fld" id="sFirmW"><label for="sFirm">Through a partner firm? <span class="tag" style="font-weight:400">(optional)</span></label><select id="sFirm"><option value="">No – not through a firm</option><option value="__new">+ New partner firm…</option>${Object.entries(PKINDS).map(([kk,lab])=>{ const g=F.filter(c=>c.kind===kk); return g.length?`<optgroup label="${esc(lab)}s">${g.map(c=>`<option value="${esc(c.id)}"${c.id===sel?" selected":""}>${esc(c.name)}</option>`).join("")}</optgroup>`:""; }).join("")}</select></div>
  <div id="sFirmNew" hidden><div class="fld"><label for="sFirmNm">Name of the firm</label><input id="sFirmNm" autocapitalize="words" placeholder="e.g. IJG"></div><div class="fld"><label for="sFirmKind">What kind of partner?</label><select id="sFirmKind">${opts(Object.entries(PKINDS).map(([v,l])=>({v,l})),"accounting")}</select></div></div>`; }
{ const base=drawSrcExtra; drawSrcExtra=function(src){ base(src); try{ src=src||{}; const box=$("#srcExtra"); if(!box||!$("#sChannel")?.value||box.querySelector("#sFirm")) return;
  let sel=src.firmId||""; if(!sel&&src.contactId) sel=firmOfContact(S.contacts.get(src.contactId))?.id||"";
  box.insertAdjacentHTML("beforeend",firmFieldHTML(sel)); try{ ssEnhance?.(box); }catch(_){} }catch(err){ console.warn(err); } }; }
/* picking the person fills in their firm; picking "+ New partner firm" asks the name */
document.addEventListener("change",e=>{
  if(e.target.id==="sContact"){ const f=$("#sFirm"); const c=firmOfContact(S.contacts.get(e.target.value)); if(f&&c&&(!f.value||f.dataset.auto)){ f.value=c.id; f.dataset.auto="1"; f.dispatchEvent(new Event("change",{bubbles:true})); toast(`Linked to ${c.name} too`); } }
  if(e.target.id==="sFirm"){ const n=$("#sFirmNew"); if(n) n.hidden=e.target.value!=="__new"; if(e.isTrusted) delete e.target.dataset.auto; if(e.target.value==="__new") setTimeout(()=>$("#sFirmNm")?.focus(),50); }
  if(e.target.id==="nkFirm"||e.target.id==="sChannel"){ /* nothing */ } });
/* saving: the firm rides on the business's source */
{ const base=dbSet; dbSet=async function(path,data){ const f=document.getElementById("sFirm");
  if(f && data && data.source && /^companies\//.test(path) && !isPartnerKind(data.kind)){ let fid=f.value;
    if(fid==="__new"){ const nm=$("#sFirmNm")?.value.trim(); if(!nm){ fid=""; } else { const ex=companies().find(c=>isPartnerCo(c)&&normName(c.name)===normName(nm)); if(ex) fid=ex.id; else { fid=newId(); const ok=await base("companies/"+fid,{name:nm, kind:$("#sFirmKind").value||"service", status:"network", source:{channel:""}}); if(!ok) fid=""; else f.value=fid; } } }
    data={...data, source:{...data.source, firmId:fid}}; }
  return base(path,data); }; }
/* the firm shows wherever the source shows, and counts as one of the firm's leads */
{ const base=sourceText; sourceText=function(c){ const t=base(c); const f=c.source?.firmId&&S.companies.get(c.source.firmId); if(!f) return t; return t.includes(f.name)? t : `${t} · via ${f.name}`; }; }
{ const base=partnerLeads; partnerLeads=function(c){ const L=base(c); const ids=new Set(L.map(x=>x.id)); companies().forEach(x=>{ if(!isPartnerCo(x)&&x.source?.firmId===c.id&&!ids.has(x.id)){ L.push(x); ids.add(x.id); } }); return L; }; }
{ const base=netBuildGraph; netBuildGraph=function(){ base(); try{ if(!G.byId) return; companies().forEach(c=>{ const a=G.byId.get("c:"+c.id), b=c.source?.firmId&&G.byId.get("c:"+c.source.firmId); if(a&&b&&!G.edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a))){ G.edges.push({a,b,kind:"referred"}); a.deg=(a.deg||0)+1; b.deg=(b.deg||0)+1; } }); try{ netCount(); }catch(_){} if(G.q) netSearchApply(false); }catch(err){ console.warn(err); } }; }
