/* ================= Phase 18: listed/private, group structures, people at several companies ================= */
const OWNERSHIP=["Private company","Family-owned","Listed – JSE","Listed – other exchange","State-owned","Subsidiary of a group","Non-profit / NGO","Trust or foundation"];
peopleAt=function(c){ return contacts().filter(k=>k.companyId===c.id || (k.otherRoles||[]).some(r=>r.companyId===c.id)); };
function roleAt(k,c){ if(k.companyId===c.id) return k.companyRole||k.title||"Works here"; const r=(k.otherRoles||[]).find(r=>r.companyId===c.id); return r?.role||"Involved"; }
function subsOf(c){ return companies().filter(x=>x.parentId===c.id).sort((a,b)=>a.name.localeCompare(b.name)); }
function groupFields(c){
  const others=companies().filter(x=>x.id!==c.id && x.parentId!==c.id).sort((a,b)=>a.name.localeCompare(b.name));
  return `<div class="fld"><label for="cOwn">Listed or private?</label><select id="cOwn">${opts(OWNERSHIP,c.ownership||"","Not sure / skip")}</select></div>
   <div class="fld" id="cListW" ${/^Listed/.test(c.ownership||"")?"":"hidden"}><label for="cList">Exchange & share code</label><input id="cList" value="${esc(c.listing||"")}" placeholder="e.g. JSE: BEL"></div>
   <div class="fld"><label for="cParent">Part of a group? Parent company</label><select id="cParent">${opts(others.map(x=>({v:x.id,l:x.name})),c.parentId||"","Not part of a group")}</select></div>`; }
function groupRead(){ if(!$("#cOwn")) return {}; const own=$("#cOwn").value; return {ownership:own, listing:/^Listed/.test(own)? ($("#cList").value.trim()) : "", parentId:$("#cParent").value||""}; }
function groupHTML(c){
  const par=c.parentId? S.companies.get(c.parentId) : null; const subs=subsOf(c);
  const sib= par? subsOf(par).filter(x=>x.id!==c.id) : [];
  const own= c.ownership? `<div class="card box"><div class="kvline"><span class="lbl">Ownership</span><b>${esc(c.ownership)}${c.listing?` · ${esc(c.listing)}`:""}</b></div></div>` : "";
  if(!par && !subs.length) return own? `<div class="fsec">Ownership</div>${own}` : "";
  return `<div class="fsec">Group</div>${own}
   ${par?`<div class="lbl" style="margin:8px 4px 6px">Part of</div><div class="group">${bizRowAny(par)}</div>`:""}
   ${subs.length?`<div class="lbl" style="margin:8px 4px 6px">Companies in this group (${subs.length})</div><div class="group">${subs.map(bizRowAny).join("")}</div>`:""}
   ${sib.length?`<div class="lbl" style="margin:8px 4px 6px">Sister companies</div><div class="group">${sib.map(bizRowAny).join("")}</div>`:""}`;
}
function bizRowAny(c){ return isPartnerCo(c)? partnerRow(c) : bizRow(c); }
/* people involved in more than one company */
function otherRolesFields(k){
  return `<div class="lbl" style="margin:12px 2px 6px">Also owns or works at</div>
  <div id="kRolesX">${(k.otherRoles||[]).map(r=>roleRow(r)).join("")}</div>
  <button type="button" class="linkbtn addx" data-act="xr-add">+ Add another company</button>`; }
function roleRow(r){ const cos=companies().sort((a,b)=>a.name.localeCompare(b.name));
  return `<div class="fld xrow xrole"><div class="xin"><select class="xco" aria-label="Company">${opts(cos.map(c=>({v:c.id,l:c.name})),r?.companyId||"","Choose company…")}</select><select class="xrl" aria-label="Role">${opts(["Owner","Co-owner","Shareholder","Director","CEO / MD","Chair","Board member / NED","Employee","Advisor","Investor"],r?.role||"Owner")}</select><button type="button" class="xdel" data-act="x-del" aria-label="Remove">✕</button></div></div>`; }
function otherRolesRead(){ const main=($("#kCoPick")&&$("#kCoPick").value)||""; return {otherRoles:[...document.querySelectorAll(".xrole")].map(r=>({companyId:r.querySelector(".xco").value, role:r.querySelector(".xrl").value})).filter(r=>r.companyId && r.companyId!==main).filter((r,i,a)=>a.findIndex(x=>x.companyId===r.companyId)===i)}; }
function otherRolesHTML(k){ const L=(k.otherRoles||[]).map(r=>({r,c:S.companies.get(r.companyId)})).filter(x=>x.c); if(!L.length) return "";
  return `<div class="fsec">Also involved in</div><div class="group">${L.map(({r,c})=>`<button class="rowi" data-open="${esc(c.id)}">${isPartnerCo(c)?`<span class="avatar biz">${ic(pkIcon(c),20)}</span>`:avatarB(c)}<span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc(r.role)}${c.ownership?` · ${esc(c.ownership)}`:""}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`).join("")}</div>`; }
{ const base=ownsLine; ownsLine=function(k){ return otherRolesHTML(k)+base(k); }; }
/* AI context */
{ const base=companyLine; companyLine=function(c){ const par=c.parentId?S.companies.get(c.parentId):null; const subs=subsOf(c); const x=[c.ownership?`ownership: ${c.ownership}${c.listing?` (${c.listing})`:""}`:"", par?`part of group: ${par.name}`:"", subs.length?`group companies: ${subs.map(s=>s.name).join(", ")}`:""].filter(Boolean).join("; ").replace(/\|/g,"/"); return base(c)+(x?" | "+x:""); }; }
{ const base=askLine; askLine=function(k){ const x=(k.otherRoles||[]).map(r=>{ const c=S.companies.get(r.companyId); return c? `${r.role} at ${c.name}` : ""; }).filter(Boolean).join(", "); return base(k)+(x?" | also: "+x.replace(/\|/g,"/"):""); }; }
document.addEventListener("change",e=>{ if(e.target.id==="cOwn"){ const w=$("#cListW"); if(w) w.hidden=!/^Listed/.test(e.target.value); } });
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act=xr-add]"); if(!t) return; const box=$("#kRolesX"); if(box){ box.insertAdjacentHTML("beforeend",roleRow(null)); } });
