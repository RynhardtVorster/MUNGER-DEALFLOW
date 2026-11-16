/* ================= Phase 14: family links, extra numbers/emails, wrapping filters ================= */
S.links=S.links||[];
async function loadLinks(){ const {data,error}=await sb.from("person_links").select("*"); if(error){ console.warn(error); return; } S.links=data||[]; queueRender(); }
const FAM=["father","mother","son","daughter","brother","sister","husband","wife","partner","parent","child","sibling","spouse","grandfather","grandmother","grandson","granddaughter","grandparent","grandchild","uncle","aunt","nephew","niece","cousin","father-in-law","mother-in-law","son-in-law","daughter-in-law","brother-in-law","sister-in-law","family"];
const FAM_REV={father:"child",mother:"child",son:"parent",daughter:"parent",brother:"sibling",sister:"sibling",husband:"wife",wife:"husband",partner:"partner",parent:"child",child:"parent",sibling:"sibling",spouse:"spouse",grandfather:"grandchild",grandmother:"grandchild",grandson:"grandparent",granddaughter:"grandparent",grandparent:"grandchild",grandchild:"grandparent",uncle:"nephew",aunt:"nephew",nephew:"uncle",niece:"uncle",cousin:"cousin","father-in-law":"son-in-law","mother-in-law":"son-in-law","son-in-law":"father-in-law","daughter-in-law":"father-in-law","brother-in-law":"brother-in-law","sister-in-law":"brother-in-law",family:"family"};
const famLabel=s=>String(s||"family").replace(/^./,m=>m.toUpperCase());
function familyOf(k){ return (S.links||[]).filter(l=>l.a===k.id||l.b===k.id).map(l=>{ const mine=l.a===k.id; const o=S.contacts.get(mine?l.b:l.a); return o? {l, o, rel: mine? l.b_is : l.a_is} : null; }).filter(Boolean); }
function familyHTML(k){
  const F=familyOf(k);
  return `<div class="fsec">Family in our network</div>
  ${F.length?`<div class="group">${F.map(({l,o,rel})=>{ const same=o.companyId&&o.companyId===k.companyId? S.companies.get(o.companyId) : null; return `<div class="rowi">${avatarP(o)}<span class="main" data-contact="${esc(o.id)}" style="cursor:pointer"><span class="t1" style="display:block">${esc(o.name)} <span class="pill A">${esc(famLabel(rel))}</span></span><span class="t2" style="display:block">${esc([workLine(o), same?`also at ${same.name}`:"", l.note].filter(Boolean).join(" · "))}</span></span>${S.readOnly?"":`<button class="btn sm" data-act="fam-del" data-id="${esc(l.id)}" aria-label="Remove link">✕</button>`}</div>`; }).join("")}</div>`:""}
  ${S.readOnly?"":`<button class="linkbtn" data-act="fam-add" data-id="${esc(k.id)}">+ Link a family member</button>`}`;
}
function famModal(id){
  const k=S.contacts.get(id); if(!k) return; const linked=new Set(familyOf(k).map(x=>x.o.id));
  const others=contacts().filter(o=>o.id!==id && !linked.has(o.id)).sort((a,b)=>a.name.localeCompare(b.name));
  const first=k.name.split(" ")[0];
  showModal(`${ovHead("Link a family member",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   ${others.length?`<div class="fields">
    <div class="fld"><label for="famQ">Find the person</label><input id="famQ" type="search" placeholder="Type a name…" autocomplete="off"></div>
    <div class="fld"><label for="famWho">Person</label><select id="famWho">${opts(others.map(o=>({v:o.id,l:o.name+(o.companyId&&S.companies.get(o.companyId)?" · "+S.companies.get(o.companyId).name:"")})),"","Choose…")}</select></div>
    <div class="fld"><label for="famB" id="famBL">They are ${esc(first)}'s</label><select id="famB">${opts(FAM.map(f=>({v:f,l:famLabel(f)})),"","Choose…")}</select></div>
    <div class="fld"><label for="famA">${esc(first)} is their</label><select id="famA">${opts(FAM.map(f=>({v:f,l:famLabel(f)})),"","Choose…")}</select></div>
    <div class="fld"><label for="famNote">Note (optional)</label><input id="famNote" placeholder="e.g. runs the farm with his father"></div>
   </div>
   <div style="margin-top:14px"><button class="btn primary block" data-act="fam-save" data-id="${esc(id)}">Link them</button></div>
   <p class="tag" style="margin:10px 2px">Family member not in Munger yet? Add them as a person first, then link them here.</p>`:`<div class="card empty">Add the family member as a person first, then link them here.</div>`}
  </div>`, true);
}
/* extra numbers and emails */
const XLABELS={cell:["Mobile 2","Work","Home","WhatsApp","Office","Other"],email:["Work","Personal","Other"]};
function extraRow(kind,i,x){ return `<div class="fld xrow" data-x="${kind}"><label>${kind==="cell"?"Another number":"Another email"}</label><div class="xin"><select class="xlab" aria-label="Label">${opts(XLABELS[kind],x?.label||XLABELS[kind][0])}</select><input class="xval" ${kind==="cell"?'type="tel" inputmode="tel"':'type="email" inputmode="email" autocapitalize="off"'} value="${esc(x?.v||"")}"><button type="button" class="xdel" data-act="x-del" aria-label="Remove">✕</button></div></div>`; }
function readExtras(kind){ return [...document.querySelectorAll(`.xrow[data-x=${kind}]`)].map(r=>({label:r.querySelector(".xlab").value, v:r.querySelector(".xval").value.trim()})).filter(x=>x.v); }
{ const base=dupPeople; dupPeople=function(d,exceptId){ const out=base(d,exceptId);
  const xs=[...document.querySelectorAll(".xrow .xval")].map(i=>i.value.trim()).filter(Boolean);
  const pk=new Set([d.cell,...xs].map(phoneKey).filter(Boolean)), ek=new Set([d.email,...xs].map(v=>String(v||"").trim().toLowerCase()).filter(v=>v.includes("@")));
  contacts().forEach(k=>{ if(k.id===exceptId) return; const kp=[k.cell,...(k.cells||[]).map(x=>x.v)].map(phoneKey).filter(Boolean), ke=[k.email,...(k.emails||[]).map(x=>x.v)].map(v=>String(v||"").trim().toLowerCase()).filter(Boolean);
    const why=[]; if(kp.some(p=>pk.has(p))) why.push("same cell number"); if(ke.some(e=>ek.has(e))) why.push("same email");
    if(!why.length) return; const h=out.find(x=>x.k.id===k.id); if(h){ why.forEach(w=>{ if(!h.why.includes(w)) h.why.push(w); }); h.strong=true; } else out.unshift({k,why,strong:true}); });
  return out.sort((a,b)=>b.strong-a.strong); }; }
/* business filters: active filters shown as removable pills */
{ const base=vBusinesses; vBusinesses=function(){ const h=base(); const f=S.f; const L=[["sector","Sector"],["partner","Lead"],["province","Province"],["channel","Source"],["lang","Language"]].filter(([k])=>f[k]);
  if(!L.length) return h; const lab=(k,v)=>k==="channel"?(CHANNEL[v]?.label||v):k==="lang"?(LANGS[v]||v):v;
  const pills=`<div class="activef">${L.map(([k,l])=>`<button class="chip on" data-act="f-clear" data-k="${k}">${esc(l)}: ${esc(lab(k,f[k]))} ✕</button>`).join("")}<button class="chip" data-act="f-clear" data-k="*">Clear all</button></div>`;
  return h.replace('<div class="group">', pills+'<div class="group">'); }; }
document.addEventListener("input",e=>{ if(e.target.id==="famQ"){ const q=e.target.value.toLowerCase(); const s=$("#famWho"); [...s.options].forEach(o=>{ if(o.value) o.hidden=!o.textContent.toLowerCase().includes(q); }); const vis=[...s.options].filter(o=>o.value&&!o.hidden); if(vis.length===1) s.value=vis[0].value; } });
document.addEventListener("change",e=>{
  if(e.target.id==="famA"){ const r=FAM_REV[e.target.value]; if(r && !$("#famB").dataset.touched) $("#famB").value=r; }
  if(e.target.id==="famB"){ e.target.dataset.touched="1"; const r=FAM_REV[e.target.value]; if(r && !$("#famA").dataset.touched) $("#famA").value=r; }
  if(e.target.id==="famA") e.target.dataset.touched="1";
});
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="fam-add"){ famModal(t.dataset.id); }
  if(a==="fam-save"){ const id=t.dataset.id, o=$("#famWho").value, aIs=$("#famA").value||"family", bIs=$("#famB").value||"family"; if(!o){ toast("Choose the person"); return; }
    t.disabled=true; const {error}=await sb.from("person_links").insert({a:id,b:o,a_is:aIs,b_is:bIs,note:$("#famNote").value.trim()}); t.disabled=false;
    if(error){ if(error.code==="23505") toast("They're already linked"); else writeErr(error); return; } closeModal(); await loadLinks(); toast("Family linked"); }
  if(a==="fam-del"){ const id=t.dataset.id; confirmBox("Remove this family link?","The people stay in the network; only the link is removed.","Remove",async()=>{ const {error}=await sb.from("person_links").delete().eq("id",id); if(error) writeErr(error); else { closeModal(); await loadLinks(); toast("Link removed"); } }); }
  if(a==="x-add"){ const k=t.dataset.k; const box=$(k==="cell"?"#kCellsX":"#kEmailsX"); if(!box) return; box.insertAdjacentHTML("beforeend", extraRow(k, box.children.length, null)); box.lastElementChild.querySelector(".xval").focus(); }
  if(a==="x-del"){ t.closest(".xrow")?.remove(); }
  if(a==="f-clear"){ const k=t.dataset.k; if(k==="*") ["sector","partner","province","channel","lang"].forEach(x=>S.f[x]=""); else S.f[k]=""; render(); }
});
