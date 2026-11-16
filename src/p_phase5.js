/* ================= Phase 5: check-ins with people ================= */
const CI_OPTS=[{v:0,l:"No check-in"},{v:1,l:"In 1 week"},{v:2,l:"In 2 weeks"},{v:3,l:"In 3 weeks"},{v:4,l:"In 4 weeks"},{v:6,l:"In 6 weeks"},{v:8,l:"In 2 months"},{v:13,l:"In 3 months"},{v:26,l:"In 6 months"},{v:52,l:"In a year"},{v:-1,l:"On a specific date"}];
const addWeeks=(w)=>{ const d=new Date(); d.setDate(d.getDate()+7*w); return ymd(d); };
const ciEveryTxt=w=>!w? "" : w===1? "every week" : w<8? `every ${w} weeks` : w===8? "every 2 months" : w===13? "every 3 months" : w===26? "every 6 months" : w===52? "every year" : `every ${w} weeks`;
function peopleCheckins(mine){ const me=myPartner(); return contacts().filter(k=>k.nextCheckIn && (!mine || (k.checkInOwner||k.partner)===me)); }
const isPersonRec=x=>S.contacts.has(x.id) && !S.companies.has(x.id);
function personDueCard(k){
  const d=dueInfo(k); const dnc=k.doNotContact;
  return `<div class="card due"><div class="top" data-contact="${esc(k.id)}">${avatarP(k)}<div class="main" style="flex:1;min-width:0"><div class="t1" style="font-weight:600">${esc(k.name)}</div><div class="t2" style="color:var(--muted);font-size:14px">${esc([k.checkInNote||workLine(k)||TIERS[tierOf(k)].label, k.checkInOwner].filter(Boolean).join(" · "))}</div></div><span class="pill ${d.cls}">${esc(d.txt)}</span></div>
  <div class="acts"><a class="act" ${k.cell&&!dnc?`href="${esc(telHref(k.cell))}"`:'aria-disabled="true"'}>${ic("phone",18)}Call</a><a class="act" ${k.cell&&!dnc?`href="${esc(waHref(k.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",18)}WhatsApp</a><button class="act dark" data-act="k-ci-done" data-id="${esc(k.id)}">${ic("check",18)}Done</button></div></div>`;
}
function personCiRow(k){ const d=dueInfo(k); return `<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">${esc([k.checkInNote||workLine(k), fmtD(k.nextCheckIn), k.checkInOwner].filter(Boolean).join(" · "))}</span></span><span class="trail">${d?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}</span></button>`; }
const anyDueCard=x=>isPersonRec(x)? personDueCard(x) : dueCard(x);
const anyRow=x=>isPersonRec(x)? personCiRow(x) : bizRow(x);

function ciSel(k){ return k.nextCheckIn? (k.checkInWeeks||-1) : 0; }
function ciFields(k,defRep){
  const sel=ciSel(k), on=sel!==0;
  return `<div class="fields">
   <div class="fld"><label for="kCi">Check in</label><select id="kCi">${opts(CI_OPTS,sel)}</select></div>
   <div class="fld kciw" ${on?"":"hidden"}><label for="kCiDate">Next check-in</label><input type="date" id="kCiDate" value="${esc(k.nextCheckIn||"")}"></div>
   <div class="fld kciw" ${on?"":"hidden"}><label for="kCiNote">What to do</label><input id="kCiNote" value="${esc(k.checkInNote||"")}" placeholder="e.g. Coffee; ask about the Cape Town deal"></div>
   <div class="fld kciw" ${on?"":"hidden"}><label for="kCiOwner">Who checks in</label><select id="kCiOwner">${opts(S.partners,k.checkInOwner||myPartner()||defaultPartner())}</select></div>
  </div>
  <label class="check kciw kcirep" ${on&&sel>0?"":"hidden"}><input type="checkbox" id="kCiRep" ${k.checkInRepeat||!k.nextCheckIn||defRep?"checked":""}> Keep checking in at this rhythm</label>`;
}
function ciVis(){ const v=Number($("#kCi")?.value||0); document.querySelectorAll(".kciw").forEach(e=>e.hidden=v===0); const r=document.querySelector(".kcirep"); if(r) r.hidden=!(v>0); }
function ciRead(){
  const s=$("#kCi"); if(!s) return {};
  const v=Number(s.value||0);
  if(!v) return {nextCheckIn:"", checkInWeeks:0, checkInRepeat:false};
  const date=$("#kCiDate").value || (v>0? addWeeks(v) : "");
  return {nextCheckIn:date, checkInWeeks:v>0?v:0, checkInRepeat:v>0 && $("#kCiRep").checked, checkInNote:$("#kCiNote").value.trim(), checkInOwner:$("#kCiOwner").value||myPartner()||""};
}
function personCheckinCard(k){
  if(S.readOnly && !k.nextCheckIn) return "";
  if(!k.nextCheckIn) return `<button class="card box nudge cibtn" data-act="k-ci-set" data-id="${esc(k.id)}">${ic("cal",20)} <b>Set a check-in</b><span class="tag">Remind us to get back to ${esc(k.name.split(" ")[0])} in a few weeks</span></button>`;
  const d=dueInfo(k);
  return `<div class="fsec">Check-in</div><div class="card box">
   <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="lbl">Next check-in</div><div class="next">${esc(fmtD(k.nextCheckIn))}</div></div>${d?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}</div>
   ${k.checkInNote?`<div><b>To do:</b> ${esc(k.checkInNote)}</div>`:""}
   ${lastNoteHTML(k)}
   <div class="tag">${esc([k.checkInOwner, k.checkInRepeat?ciEveryTxt(k.checkInWeeks):"once", k.lastContact?`last contact ${fmtD(k.lastContact)}`:""].filter(Boolean).join(" · "))}</div>
   ${S.readOnly?"":`<div class="acts" style="grid-template-columns:2fr 1fr"><button class="act dark" data-act="k-ci-done" data-id="${esc(k.id)}">${ic("check",18)}Done</button><button class="act" data-act="ci-move" data-kind="k" data-id="${esc(k.id)}">Move / edit</button></div>`}
  </div>`;
}
function ciSetModal(id){
  const k=S.contacts.get(id); if(!k) return;
  showModal(`${ovHead("Check-in",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><p style="margin:0 2px 12px;font-size:15.5px">When should we get back to <b>${esc(k.name)}</b>?</p>${ciFields(k.nextCheckIn?k:{...k,checkInWeeks:3,nextCheckIn:addWeeks(3)}, !k.nextCheckIn)}<div style="margin-top:14px"><button class="btn primary block" data-act="k-ci-save" data-id="${esc(id)}">Save</button></div></div>`, true);
  ciVis();
}
function ciDoneModal(id){
  const k=S.contacts.get(id); if(!k) return; const w=k.checkInWeeks||0;
  const nextOpts=[...(w&&k.checkInRepeat?[{v:"same",l:`Again ${ciEveryTxt(w).replace("every","in")}`}]:[]),...CI_OPTS.filter(o=>o.v>0).map(o=>({v:String(o.v),l:o.l})),{v:"date",l:"On a specific date"},{v:"none",l:"No more check-ins"}];
  showModal(`${ovHead("Log check-in",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 12px;font-size:15px">Caught up with <b>${esc(k.name)}</b>?</p>
   ${historyHTML(k)}
   <div class="fields">${fldNote("qkNote","What happened? (optional)","","Type or speak…",3)}
    <div class="fld"><label for="qkNext">Next check-in</label><select id="qkNext">${opts(nextOpts, w&&k.checkInRepeat?"same":"none")}</select></div>
    <div class="fld" id="qkDateW" hidden><label for="qkDate">Date</label><input type="date" id="qkDate"></div>
    <div class="fld" id="qkTodoW" ${w&&k.checkInRepeat?"":"hidden"}><label for="qkTodo">What to do next time</label><input id="qkTodo" value="${esc(k.checkInNote||"")}"></div></div>
   <div style="margin-top:14px"><button class="btn primary block" data-act="k-ci-log" data-id="${esc(id)}">${ic("check",18)} Save</button></div></div>`, true);
}
function vCheckins(){
  const mine=S.scope==="mine";
  const open=companies().filter(isOpen).filter(c=>!mine||isMine(c));
  const sch=[...open.filter(c=>c.nextCheckIn), ...peopleCheckins(mine)].sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const B=[["Overdue",c=>daysUntil(c.nextCheckIn)<0],["This week",c=>{const n=daysUntil(c.nextCheckIn); return n>=0&&n<=7;}],["Next 30 days",c=>{const n=daysUntil(c.nextCheckIn); return n>7&&n<=30;}],["Next 3 months",c=>{const n=daysUntil(c.nextCheckIn); return n>30&&n<=92;}],["Later",c=>daysUntil(c.nextCheckIn)>92]];
  const none=open.filter(c=>!c.nextCheckIn);
  return `<div class="ph"><div><h1>Check-ins</h1><p>People and businesses we keep warm. Logging a check-in sets the next date.</p></div></div>
  <div class="seg"><button class="${mine?"on":""}" data-act="scope" data-k="mine">Mine</button><button class="${!mine?"on":""}" data-act="scope" data-k="team">Whole team</button></div>
  ${B.map(([l,fn])=>{ const it=sch.filter(fn); if(!it.length) return ""; return `<div class="sec"><h2>${l}</h2><span class="tag">${it.length}</span></div>${l==="Overdue"||l==="This week"? it.map(anyDueCard).join("") : `<div class="group">${it.map(anyRow).join("")}</div>`}`; }).join("") || `<div class="card empty"><b>Nothing scheduled</b>Open a person or a target business and set a check-in.</div>`}
  ${none.length?`<div class="sec"><h2>Targets with no check-in set</h2><span class="tag">${none.length}</span></div><div class="group">${none.map(bizRow).join("")}</div>`:""}
  <div style="text-align:center;margin-top:16px"><button class="btn sm" data-act="export-follow">${ic("dl",18)} Download business check-ins</button></div>`;
}
document.addEventListener("change",e=>{
  if(e.target.id==="kCi"){ const v=Number(e.target.value); if(v>0) $("#kCiDate").value=addWeeks(v); if(v===0) $("#kCiDate").value=""; ciVis(); if(v===-1) setTimeout(()=>$("#kCiDate")?.focus(),50); }
  if(e.target.id==="qkNext"){ const v=e.target.value; $("#qkDateW").hidden=v!=="date"; $("#qkTodoW").hidden=v==="none"; }
});
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act, id=t.dataset.id;
  if(a==="k-ci-set"){ e.stopPropagation(); if(!S.readOnly) ciSetModal(id); }
  if(a==="k-ci-done"){ e.stopPropagation(); if(!S.readOnly) ciDoneModal(id); }
  if(a==="k-ci-save"){ const p=ciRead(); t.disabled=true; if(await dbUpdate("contacts/"+id,p)){ closeModal(); toast(p.nextCheckIn?`Check-in set for ${fmtD(p.nextCheckIn)}`:"Check-in removed"); } t.disabled=false; }
  if(a==="k-ci-log"){ const k=S.contacts.get(id); if(!k) return; t.disabled=true; const by=await myName(); const v=$("#qkNext").value; const note=($("#qkNote")?.value||"").trim();
    let next="", weeks=k.checkInWeeks||0, rep=k.checkInRepeat;
    if(v==="same") next=addWeeks(weeks); else if(v==="date") { next=$("#qkDate").value||""; rep=false; } else if(v!=="none"){ weeks=Number(v); next=addWeeks(weeks); rep=true; }
    const patch={lastContact:today(), nextCheckIn:next, checkInWeeks:next?weeks:0, checkInRepeat:!!next&&rep, checkInNote: next? ($("#qkTodo")?.value||"").trim() : "", log:[...(k.log||[]),{d:today(),by,type:"checkin",text:`Checked in${note?`: ${note}`:""}${next?` · next ${fmtD(next)}`:""}`}].slice(-200)};
    if(await dbUpdate("contacts/"+id,patch)){ closeModal(); toast(next?`Logged · next ${fmtD(next)}`:"Logged"); } t.disabled=false; }
});
