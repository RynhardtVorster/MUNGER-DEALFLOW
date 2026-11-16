/* ================= Phase 13: countries, network companies, check-ins with memory ================= */
const COUNTRY_LIST=["South Africa","Namibia","Botswana","Zimbabwe","Mozambique","Zambia","Malawi","Eswatini","Lesotho","Angola","Mauritius","Madagascar","Seychelles","Kenya","Tanzania","Uganda","Rwanda","Ethiopia","DR Congo","Republic of the Congo","Gabon","Cameroon","Nigeria","Ghana","Côte d'Ivoire","Senegal","Mali","Burkina Faso","Benin","Togo","Sierra Leone","Liberia","Guinea","Gambia","Cabo Verde","Mauritania","Morocco","Algeria","Tunisia","Libya","Egypt","Sudan","South Sudan","Somalia","Djibouti","Eritrea","Burundi","Comoros","Chad","Niger","Central African Republic","Equatorial Guinea","São Tomé and Príncipe",
"United Kingdom","Ireland","Netherlands","Belgium","Luxembourg","Germany","France","Switzerland","Austria","Italy","Spain","Portugal","Malta","Cyprus","Greece","Denmark","Norway","Sweden","Finland","Iceland","Poland","Czech Republic","Slovakia","Hungary","Romania","Bulgaria","Croatia","Slovenia","Serbia","Estonia","Latvia","Lithuania","Ukraine","Turkey","Monaco","Liechtenstein","Jersey","Guernsey","Isle of Man",
"United States","Canada","Mexico","Brazil","Argentina","Chile","Colombia","Peru","Uruguay",
"United Arab Emirates","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","Israel","Jordan",
"India","China","Hong Kong","Singapore","Japan","South Korea","Taiwan","Malaysia","Indonesia","Thailand","Vietnam","Philippines","Pakistan","Bangladesh","Sri Lanka",
"Australia","New Zealand","British Virgin Islands","Cayman Islands","Bermuda"];
function countryList(){ return `<datalist id="countryList">${COUNTRY_LIST.map(c=>`<option value="${esc(c)}"></option>`).join("")}</datalist>`; }
document.addEventListener("change",e=>{ if(e.target.id==="kCountry"||e.target.id==="cHq"){ const v=e.target.value.trim(); const hit=COUNTRY_LIST.find(c=>c.toLowerCase()===v.toLowerCase()); if(hit) e.target.value=hit; else if(v) e.target.value=v.replace(/\b\w/g,m=>m.toUpperCase()); } });

/* ---- Network companies (not for acquisition) live under Businesses ---- */
function bizSeg(on){ const n=companies().filter(c=>c.kind==="other").length; return `<div class="seg"><a class="${on==="acq"?"on":""}" href="#businesses">To acquire</a><a class="${on==="net"?"on":""}" href="#others">Network companies${n?` · ${n}`:""}</a></div>`; }
{ const base=vBusinesses; vBusinesses=function(){ const h=base(); return h.replace('<div class="search">', bizSeg("acq")+'<div class="search">').replace(/<a class="linkbtn" href="#others"[\s\S]*?<\/a>/,""); }; }
S.oq=S.oq||"";
function vOthers(){
  const q=S.oq.trim().toLowerCase();
  const L=companies().filter(c=>c.kind==="other").filter(c=>!q||[c.name,c.town,c.industry,...peopleAt(c).map(k=>k.name)].join(" ").toLowerCase().includes(q)).sort((a,b)=>peopleAt(b).length-peopleAt(a).length||a.name.localeCompare(b.name));
  return `<div class="ph"><div><h1>Businesses</h1><p>Network companies: where people we know work. Part of our network, but not businesses we want to buy.</p></div><button class="btn sm primary" data-act="new-netco">${ic("plus",18)} Add</button></div>
  ${bizSeg("net")}
  <div class="search">${ic("search",20)}<input id="oq" type="search" placeholder="Search company or person…" value="${esc(S.oq)}" autocomplete="off" aria-label="Search network companies"></div>
  ${L.length?`<div class="group">${L.map(c=>{ const ppl=peopleAt(c); return `<button class="rowi" data-open="${esc(c.id)}"><span class="avatar biz">${ic("biz",20)}</span><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([ppl.map(k=>k.name).join(", ")||"Nobody linked yet", c.town].filter(Boolean).join(" · "))}</span></span>${ppl.length?`<span class="pill">${ppl.length}</span>`:""}</button>`; }).join("")}</div>
   <p class="tag" style="margin:12px 2px">Want to buy one after all? Open it, tap Edit and change “What is it?” to Prospect or Target.</p>`:`<div class="card empty"><b>No network companies yet</b>When you add a person at a company we don't want to buy, it lands here.</div>`}`;
}
TITLES.others="BUSINESSES";
document.addEventListener("input",e=>{ if(e.target.id==="oq"){ S.oq=e.target.value; const pos=e.target.selectionStart; render(); const i=$("#oq"); if(i){ i.focus(); try{ i.setSelectionRange(pos,pos); }catch(_){} } } });
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act=new-netco]"); if(t && !S.readOnly) dealForm(null,{kind:"other",status:"network"}); });
{ const base=fillCoPick; fillCoPick=function(){ base(); const w=whereVal(), sel=$("#kCoPick"); if(!sel||w!=="business") return; const cur=sel.value;
  const acq=companies().filter(isAcq).sort((a,b)=>a.name.localeCompare(b.name)), net=companies().filter(c=>c.kind==="other").sort((a,b)=>a.name.localeCompare(b.name));
  const o=c=>`<option value="${esc(c.id)}">${esc(c.name)}${isAcq(c)?` · ${grp(c)==="network"?"Prospect":"Target"}`:""}</option>`;
  sel.innerHTML=`<option value="">Choose…</option>${net.length?`<optgroup label="Network companies (not to buy)">${net.map(o).join("")}</optgroup>`:""}${acq.length?`<optgroup label="Businesses we want to buy">${acq.map(o).join("")}</optgroup>`:""}<option value="__new">+ New business…</option>`;
  sel.value=cur; }; }

/* ---- Check-ins that remember what was said ---- */
function histEntries(rec,n){ return [...(rec.log||[])].reverse().filter(e=>!/^(Captured|Added as|Details added|Stage:)/.test(e.text)).slice(0,n||3); }
function historyHTML(rec){ const H=histEntries(rec,3); const plan=rec.checkInNote?`<div class="card box" style="margin-bottom:12px"><div class="lbl">Planned for this check-in</div><div>${esc(rec.checkInNote)}</div></div>`:""; if(!H.length) return plan+`<div class="card box tag" style="margin-bottom:12px">No earlier notes yet. What you write now will show here next time.</div>`;
  return `<div class="lbl" style="margin:0 2px 6px">Last time</div><div class="group log" style="margin-bottom:12px">${H.map(e=>`<div class="e"${logAttr(rec,e)}><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div>${rec.checkInNote?`<div class="card box" style="margin-bottom:12px"><div class="lbl">Planned for this check-in</div><div>${esc(rec.checkInNote)}</div></div>`:""}`; }
function lastNoteHTML(rec){ const e=histEntries(rec,1)[0]; return e? `<div class="tag"><b>Last:</b> ${esc(fmtD(e.d))} · ${esc(e.text.length>140?e.text.slice(0,140)+"…":e.text)}</div>` : ""; }
function ciMoreHTML(c){ if(!c.nextCheckIn && !c.checkInNote) return lastNoteHTML(c); return `${c.checkInNote?`<div><b>To do:</b> ${esc(c.checkInNote)}</div>`:""}${lastNoteHTML(c)}${S.readOnly?"":`<div class="acts" style="grid-template-columns:2fr 1fr"><button class="act dark" data-act="quick-checkin" data-id="${esc(c.id)}">${ic("check",18)}Log check-in</button><button class="act" data-act="ci-move" data-kind="c" data-id="${esc(c.id)}">Move / edit</button></div>`}`; }
dueCard=function(c){
  const d=dueInfo(c); const o=bizContact(c); const last=histEntries(c,1)[0];
  return `<div class="card due"><div class="top" data-open="${esc(c.id)}">${avatarB(c)}<div class="main" style="flex:1;min-width:0"><div class="t1" style="font-weight:600">${esc(c.name)}</div><div class="t2" style="color:var(--muted);font-size:14px">${esc([o?.name||"No owner captured", c.partner].filter(Boolean).join(" · "))}</div></div><span class="pill ${d.cls}">${esc(d.txt)}</span></div>
  ${c.checkInNote?`<div class="due-note"><b>To do:</b> ${esc(c.checkInNote)}</div>`:""}${last?`<div class="due-note muted"><b>Last:</b> ${esc(fmtD(last.d))} · ${esc(last.text.length>110?last.text.slice(0,110)+"…":last.text)}</div>`:""}
  <div class="acts four"><a class="act" ${o?.cell?`href="${esc(telHref(o.cell))}"`:'aria-disabled="true"'}>${ic("phone",18)}Call</a><a class="act" ${o?.cell?`href="${esc(waHref(o.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",18)}WhatsApp</a><button class="act" data-act="ci-move" data-kind="c" data-id="${esc(c.id)}">${ic("cal",18)}Move</button><button class="act dark" data-act="quick-checkin" data-id="${esc(c.id)}">${ic("check",18)}Done</button></div></div>`;
};
personDueCard=function(k){
  const d=dueInfo(k); const dnc=k.doNotContact; const last=histEntries(k,1)[0];
  return `<div class="card due"><div class="top" data-contact="${esc(k.id)}">${avatarP(k)}<div class="main" style="flex:1;min-width:0"><div class="t1" style="font-weight:600">${esc(k.name)}</div><div class="t2" style="color:var(--muted);font-size:14px">${esc([workLine(k)||TIERS[tierOf(k)].label, k.checkInOwner].filter(Boolean).join(" · "))}</div></div><span class="pill ${d.cls}">${esc(d.txt)}</span></div>
  ${k.checkInNote?`<div class="due-note"><b>To do:</b> ${esc(k.checkInNote)}</div>`:""}${last?`<div class="due-note muted"><b>Last:</b> ${esc(fmtD(last.d))} · ${esc(last.text.length>110?last.text.slice(0,110)+"…":last.text)}</div>`:""}
  <div class="acts four"><a class="act" ${k.cell&&!dnc?`href="${esc(telHref(k.cell))}"`:'aria-disabled="true"'}>${ic("phone",18)}Call</a><a class="act" ${k.cell&&!dnc?`href="${esc(waHref(k.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",18)}WhatsApp</a><button class="act" data-act="ci-move" data-kind="k" data-id="${esc(k.id)}">${ic("cal",18)}Move</button><button class="act dark" data-act="k-ci-done" data-id="${esc(k.id)}">${ic("check",18)}Done</button></div></div>`;
};
function addDays(n){ const d=new Date(); d.setDate(d.getDate()+n); return ymd(d); }
function moveModal(kind,id){
  const rec= kind==="k"? S.contacts.get(id) : S.companies.get(id); if(!rec) return;
  const ownerOpts=S.partners; const owner= kind==="k"? (rec.checkInOwner||myPartner()) : (rec.partner||myPartner());
  showModal(`${ovHead("Move or edit check-in",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 10px;font-size:15.5px"><b>${esc(rec.name)}</b>${rec.nextCheckIn?` · now ${esc(fmtD(rec.nextCheckIn))}`:""}</p>
   <div class="chips" style="margin-bottom:8px">${[["Tomorrow",1],["+3 days",3],["+1 week",7],["+2 weeks",14],["+1 month",30],["+3 months",91]].map(([l,n])=>`<button class="chip" data-act="mv-quick" data-k="${addDays(n)}">${l}</button>`).join("")}</div>
   <div class="fields">
    <div class="fld"><label for="mvDate">Next check-in</label><input type="date" id="mvDate" value="${esc(rec.nextCheckIn||addDays(7))}"></div>
    <div class="fld"><label for="mvTodo">What to do</label><input id="mvTodo" value="${esc(rec.checkInNote||"")}" placeholder="e.g. Ask about the expansion; send NDA"></div>
    <div class="fld"><label for="mvOwner">${kind==="k"?"Who checks in":"Lead (our team)"}</label><select id="mvOwner">${opts(ownerOpts,owner)}</select></div>
   </div>
   ${historyHTML(rec).replace('margin-bottom:12px','margin:12px 0')}
   <div style="margin-top:14px;display:grid;gap:10px"><button class="btn primary block" data-act="mv-save" data-kind="${kind}" data-id="${esc(id)}">Save</button><button class="linkbtn" style="color:var(--bad,#b3261e)" data-act="mv-clear" data-kind="${kind}" data-id="${esc(id)}">Stop checking in</button></div></div>`, true);
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="ci-move"){ e.stopPropagation(); e.preventDefault(); if(!S.readOnly) moveModal(t.dataset.kind,t.dataset.id); }
  if(a==="mv-quick"){ $("#mvDate").value=t.dataset.k; document.querySelectorAll("[data-act=mv-quick]").forEach(b=>b.classList.toggle("on",b===t)); }
  if(a==="mv-save"||a==="mv-clear"){ const kind=t.dataset.kind, id=t.dataset.id; const path=(kind==="k"?"contacts/":"companies/")+id; const clear=a==="mv-clear";
    const patch= clear? {nextCheckIn:"", checkInNote:""} : {nextCheckIn:$("#mvDate").value||"", checkInNote:$("#mvTodo").value.trim()};
    if(!clear){ if(kind==="k") patch.checkInOwner=$("#mvOwner").value; else patch.partner=$("#mvOwner").value; }
    if(clear && kind==="k"){ patch.checkInWeeks=0; patch.checkInRepeat=false; }
    t.disabled=true; if(await dbUpdate(path,patch)){ closeModal(); toast(clear?"Check-in stopped":`Check-in on ${fmtD(patch.nextCheckIn)}`); } t.disabled=false; }
});
