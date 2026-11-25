/* ================= Phase 6: target meetings that track everything ================= */
const REV={done:["Done","won"],not_done:["Not done","late"],carried:["Carried forward","soon"]};
function meetById(id){ return S.meetings.find(m=>m.id===id)||null; }
function prevMeeting(m){ return S.meetings.filter(x=>x.status==="done" && x.id!==m?.id && (!m || x.held_on<=m.held_on)).sort((a,b)=>b.held_on.localeCompare(a.held_on))[0]||null; }
function plus21(s){ const d=parseD(s)||new Date(); d.setDate(d.getDate()+21); return ymd(d); }
async function meetUpdate(id, patch, quiet){ const {error}=await sb.from("meetings").update(patch).eq("id",id); if(error){ writeErr(error); return false; } const m=meetById(id); if(m) Object.assign(m,patch); if(!quiet) queueRender(); return true; }
function cmtLine(x){ const co=x.companyId?S.companies.get(x.companyId):null; const k=x.contactId?S.contacts.get(x.contactId):null; return [x.owner, co?.name, k?.name, x.due?`by ${fmtD(x.due)}`:""].filter(Boolean).join(" · "); }
function cmtStatusPill(x){ return x.status==="done"?`<span class="pill won">Done</span>`:x.status==="not_done"?`<span class="pill late">Not done</span>`:(x.due&&daysUntil(x.due)<0?`<span class="pill late">Late</span>`:`<span class="pill">Open</span>`); }
function targetsAddedIn(m){ const from=m.held_on; return companies().filter(c=>!isPartnerCo(c) && ["target","active"].includes(grp(c)) && (c.log||[]).some(e=>e.d>=from && /We like it|Captured/.test(e.text)) && (c.log||[]).some(e=>e.d>=from)); }
function meetSteps(){ return [["m-last","Last time"],["m-actions","Actions"],["m-pipe","Pipeline"],["m-new","New targets"],["m-disc","Discussion"],["m-next","New actions"],["m-wrap","Wrap-up"]]; }

function vMeeting(){
  const m=openMeeting();
  return m? meetRun(m) : meetHome();
}
function meetHome(){
  const last=lastDone(); const nextDate=S.meetNext || last?.next_date || (last? plus21(last.held_on) : "");
  const openC=S.commitments.filter(x=>x.status==="open"&&cmLive(x)).sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999"));
  const byOwner={}; openC.forEach(x=>(byOwner[x.owner||"Unassigned"]=byOwner[x.owner||"Unassigned"]||[]).push(x));
  const past=S.meetings.filter(x=>x.status==="done").sort((a,b)=>b.held_on.localeCompare(a.held_on));
  return `<div class="ph"><div><h1>Target meeting</h1><p>Every three weeks. Review what we promised, decide on targets, agree new actions.</p></div></div>
  <div class="card box">
   <div class="lbl">${last?`Last meeting ${esc(fmtD(last.held_on))}`:"No meetings yet"}</div>
   <div class="next">${nextDate?`Next meeting ${esc(fmtD(nextDate))}`:"Start your first meeting"}${nextDate&&daysUntil(nextDate)!==null?` <span class="pill ${daysUntil(nextDate)<0?"late":daysUntil(nextDate)<=7?"soon":""}">${daysUntil(nextDate)<0?`${-daysUntil(nextDate)} days overdue`:daysUntil(nextDate)===0?"Today":`in ${daysUntil(nextDate)} days`}</span>`:""}</div>
   ${S.readOnly?"":`<div class="fields" style="margin-top:6px"><div class="fld"><label for="m8Next">Next meeting is on</label><input type="date" id="m8Next" value="${esc(nextDate||"")}"></div></div>
   <div class="fields" style="margin-top:6px"><div class="fld"><label for="m6Date">Meeting date</label><input type="date" id="m6Date" value="${esc(today())}"></div></div>
   <button class="btn primary block" data-act="m6-start">${ic("flag",18)} Start meeting</button>
   <p class="tag" style="margin:0">Pick an earlier date to capture a meeting you already had.</p>`}
  </div>
  <div class="sec"><h2>Open actions</h2><span class="tag">${openC.length}</span></div>
  ${openC.length? Object.entries(byOwner).map(([o,list])=>`<div class="lbl" style="margin:10px 4px 6px">${esc(o)} · ${list.length}</div><div class="group">${list.map(cmtRow).join("")}</div>`).join("") : `<div class="card empty">No open actions. Add them during the meeting.</div>`}
  ${past.length?`<div class="sec"><h2>Past meetings</h2><button class="btn sm" data-act="m8-dl-all">${ic("dl",16)} All minutes</button></div><div class="group">${past.map(x=>{ const cm=S.commitments.filter(c=>c.meetingId===x.id); const dn=cm.filter(c=>c.status==="done").length; return `<button class="rowi" data-act="m6-view" data-id="${esc(x.id)}"><span class="avatar biz">${ic("flag",20)}</span><span class="main"><span class="t1" style="display:block">${esc(fmtD(x.held_on))}${x.title?` · ${esc(x.title)}`:""}</span><span class="t2" style="display:block">${esc([(x.attendees||[]).join(", "), `${(x.decisions||[]).length} decisions`, `${(x.items||[]).length} topics`, cm.length?`${dn}/${cm.length} actions done`:""].filter(Boolean).join(" · "))}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`; }).join("")}</div>`:""}`;
}
function meetRun(m){
  const prev=prevMeeting(m); const since=prev?.held_on || (()=>{ const d=parseD(m.held_on)||new Date(); d.setDate(d.getDate()-21); return ymd(d); })();
  const att=m.attendees||[]; const review=m.review||{};
  const toReview=S.commitments.filter(x=>x.meetingId!==m.id && cmLive(x) && (x.status==="open" || review[x.id])).sort((a,b)=>(a.owner||"").localeCompare(b.owner||"")||(a.due||"").localeCompare(b.due||""));
  const reviewed=toReview.filter(x=>review[x.id]).length;
  const dec=Object.fromEntries((m.decisions||[]).map(d=>[d.companyId,d.decision]));
  const live=companies().filter(c=>isAcq(c) && ["target","active"].includes(grp(c))).sort((a,b)=>(grp(b)==="active")-(grp(a)==="active")||(a.name||"").localeCompare(b.name||""));
  const newNet=companies().filter(c=>grp(c)==="network" && isAcq(c)).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  const added=targetsAddedIn(m);
  const thisC=S.commitments.filter(x=>x.meetingId===m.id);
  const items=m.items||[];
  const prevC=prev? S.commitments.filter(x=>x.meetingId===prev.id) : [];
  const inAct=companies().filter(c=>isAcq(c)&&c.kind==="target"&&["target","active","won"].includes(grp(c)));
  const chRows=[...CHANNELS.filter(ch=>!ch.archived),{id:"",label:"Channel missing"}].map(ch=>{ const L=inAct.filter(c=>(CHANNEL[c.source?.channel]?c.source.channel:"")===ch.id); return {ch, t:L.filter(c=>grp(c)==="target").length, a:L.filter(c=>grp(c)==="active").length, w:L.filter(c=>grp(c)==="won").length, n:L.length}; }).filter(r=>r.n);
  const newSince={b:companies().filter(c=>isAcq(c)&&c.kind==="target"&&(c.createdAt||"").slice(0,10)>=since).length, p:contacts().filter(k=>(k.createdAt||"").slice(0,10)>=since).length};
  const pRows=S.partners.map(p=>{ const ppl=contacts().filter(k=>knowers(k).some(x=>x.partner===p) && (k.createdAt||"").slice(0,10)>=since).length; const ci=[...companies(),...contacts()].reduce((n,c)=>n+(c.log||[]).filter(e=>e.d>=since && e.by===p && /^Checked in/.test(e.text)).length,0); return {p,ppl,ci}; });
  const sec=(id,n,t,extra)=>`<div class="sec mstep" id="${id}"><h2>${n}. ${t}</h2>${extra?`<span class="tag">${extra}</span>`:""}</div>`;
  return `<div class="ph"><div><div class="eyebrow">Target meeting in progress</div><h1>${esc(fmtD(m.held_on))}</h1></div></div>
  <div class="mnav">${meetSteps().map(([id,l],i)=>`<a href="#meeting" data-act="m6-jump" data-k="${id}">${i+1} ${l}</a>`).join("")}</div>
  <div class="fields"><div class="fld"><label for="m6When">Date</label><input type="date" id="m6When" value="${esc(m.held_on)}"></div><div class="fld"><label for="m6Title">Focus (optional)</label><input id="m6Title" value="${esc(m.title||"")}" placeholder="e.g. Agri targets, Hatstone pipeline"></div></div>
  <div class="lbl" style="margin:12px 4px 6px">Who's here?</div>
  <div class="rolechips">${S.partners.map(p=>`<label><input type="checkbox" name="m6Att" value="${esc(p)}" ${att.includes(p)?"checked":""}><span>${esc(p)}</span></label>`).join("")}</div>

  ${S.readOnly?"":importCard(m)}
  ${sec("m-last",1,"Last time",prev?fmtD(prev.held_on):"")}
  ${prev? `<div class="card box">
    ${prev.title?`<div><b>${esc(prev.title)}</b></div>`:""}
    ${(prev.items||[]).length?`<div class="lbl">We discussed</div>${prev.items.map(it=>`<div>• <b>${esc(it.topic)}</b>${it.notes?` – ${esc(it.notes)}`:""}</div>`).join("")}`:""}
    ${(prev.decisions||[]).length?`<div class="lbl" style="margin-top:6px">Decisions</div><div class="sigs">${prev.decisions.map(d=>`<span class="pill ${d.decision==="chase"?"won":d.decision==="drop"?"late":"soon"}">${esc(S.companies.get(d.companyId)?.name||"?")}: ${esc(({chase:"Chase",keep:"Keep warm",drop:"Drop",new:"New target"})[d.decision]||d.decision)}</span>`).join("")}</div>`:""}
    ${prev.notes?`<div class="lbl" style="margin-top:6px">Notes</div><div style="white-space:pre-wrap">${esc(prev.notes)}</div>`:""}
    ${prevC.length?`<div class="lbl" style="margin-top:6px">Actions agreed (${prevC.filter(c=>c.status==="done").length}/${prevC.length} done)</div>${prevC.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>${esc(c.owner)}: ${esc(c.action)}</span>${cmtStatusPill(c)}</div>`).join("")}`:""}
    ${!(prev.items||[]).length&&!(prev.decisions||[]).length&&!prev.notes&&!prevC.length?`<div class="tag">Nothing was captured at the last meeting.</div>`:""}
  </div>` : `<div class="card box tag">This is the first meeting in the app.</div>`}
  <details class="histd"><summary>${ic("sliders",16)} Scorecard – deals by channel and what's new since ${esc(fmtD(since))}</summary><div class="card box" style="margin-top:8px"><div class="lbl">Deals in action by channel</div>${chRows.length?`<table class="mini"><thead><tr><th></th><th>Targets</th><th>In disc.</th><th>Done</th></tr></thead><tbody>${chRows.map(r=>`<tr><td>${esc(r.ch.label)}</td><td>${r.t||"–"}</td><td>${r.a||"–"}</td><td>${r.w||"–"}</td></tr>`).join("")}<tr><td><b>Total</b></td><td><b>${inAct.filter(c=>grp(c)==="target").length}</b></td><td><b>${inAct.filter(c=>grp(c)==="active").length}</b></td><td><b>${inAct.filter(c=>grp(c)==="won").length}</b></td></tr></tbody></table><a href="#channels" class="tag" style="display:block;margin-top:4px">Open the channel report →</a>`:`<div class="tag">No targets or discussions yet.</div>`}
  <div class="lbl" style="margin-top:8px">Added since ${esc(fmtD(since))}</div><a href="#new" data-act="new28-since" data-k="${esc(since)}" style="display:block">${newSince.b} business${newSince.b===1?"":"es"} · ${newSince.p} ${newSince.p===1?"person":"people"} – review them →</a><div class="lbl" style="margin-top:8px">Per team member</div><table class="mini"><thead><tr><th></th><th>New people</th><th>Check-ins</th></tr></thead><tbody>${pRows.map(r=>`<tr><td>${esc(r.p)}</td><td>${r.ppl||"–"}</td><td>${r.ci||"–"}</td></tr>`).join("")}</tbody></table></div></details>

  ${sec("m-actions",2,"Actions review",toReview.length?`${reviewed}/${toReview.length} reviewed`:"")}
  ${toReview.length?`<div class="group">${toReview.map(x=>{ const r=review[x.id]; return `<div class="rowi revrow"><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(x.action)}</span><span class="t2" style="display:block">${esc(cmtLine(x))}${r?.note?` · ${esc(r.note)}`:""}</span></span>${r?`<span class="pill ${REV[r.s][1]}">${REV[r.s][0]}</span><button class="btn sm" data-act="m6-rev-undo" data-id="${esc(x.id)}">Undo</button>`:`<span class="revbtns"><button data-act="m6-rev" data-k="done" data-id="${esc(x.id)}">Done</button><button data-act="m6-rev" data-k="carried" data-id="${esc(x.id)}">Carry</button><button data-act="m6-rev" data-k="not_done" data-id="${esc(x.id)}">Not done</button></span>`}</div>`; }).join("")}</div>`:`<div class="card empty">No open actions from before.</div>`}

  ${sec("m-pipe",3,"Pipeline: chase, keep warm or drop",live.length?`${Object.keys(dec).filter(id=>live.some(c=>c.id===id)).length}/${live.length} decided`:"")}
  ${live.length?`<div class="group">${live.map(c=>{ const d=dueInfo(c); return `<div class="rowi" style="flex-wrap:wrap;gap:8px"><span class="main" data-open="${esc(c.id)}" style="cursor:pointer;min-width:170px"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([STAGE[c.status]?.label,c.partner,d?d.txt:""].filter(Boolean).join(" · "))}</span></span><span class="decide">${[["chase","Chase"],["keep","Keep warm"],["drop","Drop"]].map(([k,l])=>`<button class="${dec[c.id]===k?"on "+k:""}" data-act="decide" data-id="${esc(c.id)}" data-k="${k}">${l}</button>`).join("")}<button data-act="m6-cnote" data-id="${esc(c.id)}" aria-label="Add a note">${ic("plus",16)} Note</button></span></div>`; }).join("")}</div>`:`<div class="card empty">No targets yet. Add some in step 4.</div>`}
  <div class="hint">Chase = start discussions. Keep warm = stays a target with check-ins. Drop = not for us. Notes go into the meeting and the business's history.</div>

  ${sec("m-new",4,"New targets",added.length?`${added.length} added`:"")}
  ${added.length?`<div class="lbl" style="margin:6px 4px">Added at this meeting</div><div class="group">${added.map(bizRow).join("")}</div>`:""}
  ${newNet.length?`<div class="lbl" style="margin:10px 4px 6px">Prospects: any to make a target?</div><div class="group">${newNet.map(c=>`<div class="rowi"><span class="main" data-open="${esc(c.id)}" style="cursor:pointer"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([industryShort(c)!=="—"?industryShort(c):"",c.town,c.createdByName].filter(Boolean).join(" · "))}</span></span><button class="btn sm" data-act="like" data-id="${esc(c.id)}">★ Make target</button></div>`).join("")}</div>`:""}
  ${S.readOnly?"":`<button class="btn block" style="margin-top:10px" data-act="m6-newtarget">${ic("plus",18)} Add a new target business</button>`}

  ${sec("m-disc",5,"Discussion",items.length?`${items.length} topics`:"")}
  ${items.length?`<div class="group">${items.map(it=>{ const co=it.companyId?S.companies.get(it.companyId):null; const k=it.contactId?S.contacts.get(it.contactId):null; return `<div class="rowi edit19" style="align-items:flex-start"${S.readOnly?"":` role="button" tabindex="0" data-act="it19-edit" data-m="${esc(m.id)}" data-k="${esc(it.id)}"`}><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(it.topic)}</span>${it.notes?`<span class="t2" style="display:block;white-space:pre-wrap">${esc(it.notes)}</span>`:""}<span class="t2" style="display:block">${esc([co?.name,k?.name,it.by].filter(Boolean).join(" · "))}</span></span>${S.readOnly?"":`<button class="btn sm" data-act="m6-item-del" data-k="${esc(it.id)}" aria-label="Remove">✕</button>`}</div>`; }).join("")}</div>`:""}
  ${S.readOnly?"":`<div class="fields" style="margin-top:10px">
    <div class="fld"><label for="m6Topic">Topic</label><input id="m6Topic" placeholder="e.g. Funding for Paarl Engineering"></div>
    ${fldNote("m6ItemNotes","What was said / agreed","","Type or speak…",3)}
    <div class="fld"><label for="m6ItemBiz">About a business or partner (optional)</label><select id="m6ItemBiz">${opts(companies().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>({v:c.id,l:c.name+(isPartnerCo(c)?" · Partner":"")})),"","None")}</select></div>
    <div class="fld"><label for="m6ItemPerson">About a person (optional)</label><select id="m6ItemPerson">${opts(contacts().sort((a,b)=>a.name.localeCompare(b.name)).map(k=>({v:k.id,l:k.name})),"","None")}</select></div>
  </div><button class="btn block" style="margin-top:10px" data-act="m6-item-add">+ Add to discussion</button>`}

  ${sec("m-next",6,"New actions",thisC.length?`${thisC.length}`:"")}
  ${thisC.length?`<div class="group" style="margin-bottom:10px">${thisC.map(x=>`<div class="rowi edit19"${S.readOnly?"":` role="button" tabindex="0" data-act="cm19-edit" data-id="${esc(x.id)}"`}><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(x.action)}</span><span class="t2" style="display:block">${esc(cmtLine(x))}</span></span>${cmtStatusPill(x)}</div>`).join("")}</div>`:""}
  ${S.readOnly?"":`<div class="fields">
   <div class="fld"><label for="cmOwner">Who</label><select id="cmOwner">${opts(S.partners,defaultPartner())}</select></div>
   <div class="fld"><label for="cmAction">Action</label><input id="cmAction" placeholder="One clear action, e.g. Call 5 Hatstone clients"></div>
   <div class="fld"><label for="cmDue">By when</label><input id="cmDue" type="date" value="${esc(m.next_date||plus21(m.held_on))}"></div>
   <div class="fld"><label for="cmBiz">Business or partner (optional)</label><select id="cmBiz">${opts(companies().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>({v:c.id,l:c.name})),"","None")}</select></div>
   <div class="fld"><label for="cmPerson">Person (optional)</label><select id="cmPerson">${opts(contacts().sort((a,b)=>a.name.localeCompare(b.name)).map(k=>({v:k.id,l:k.name})),"","None")}</select></div>
  </div>
  <button class="btn block" style="margin-top:10px" data-act="m6-cmt-add">+ Add action</button>`}

  ${sec("m-wrap",7,"Wrap-up")}
  <div class="fields">${fldNote("m6Notes","Other notes",m.notes||"","Anything else worth remembering…",4)}
   <div class="fld"><label for="m6Next">Next meeting</label><input type="date" id="m6Next" value="${esc(m.next_date||plus21(m.held_on))}"></div></div>
  <div style="margin-top:16px;display:grid;gap:10px"><button class="btn" data-act="m6-copy" data-id="${esc(m.id)}">Copy minutes for WhatsApp</button>${S.readOnly?"":`<button class="btn primary" data-act="m6-finish" data-id="${esc(m.id)}">${ic("check",18)} Finish meeting</button><button class="linkbtn" style="color:var(--bad,#b3261e)" data-act="m6-discard" data-id="${esc(m.id)}">Discard this meeting</button>`}</div>`;
}
function minutesText(m){
  const L=[]; const nm=id=>S.companies.get(id)?.name||"?";
  L.push(`MUNGER TARGET MEETING · ${fmtD(m.held_on)}${m.title?` · ${m.title}`:""}`);
  if((m.attendees||[]).length) L.push(`Present: ${m.attendees.join(", ")}`);
  const rv=Object.entries(m.review||{}); if(rv.length){ L.push("","Actions reviewed"); rv.forEach(([cid,r])=>{ const c=S.commitments.find(x=>x.id===cid); if(c) L.push(`• ${c.owner}: ${c.action} – ${REV[r.s]?.[0]||r.s}${r.note?` (${r.note})`:""}`); }); }
  const decs=(m.decisions||[]); if(decs.length){ L.push("","Pipeline decisions"); decs.forEach(d=>L.push(`• ${nm(d.companyId)}: ${({chase:"CHASE",keep:"KEEP WARM",drop:"DROP",new:"NEW TARGET"})[d.decision]||d.decision}`)); }
  const added=m.status==="open"? targetsAddedIn(m) : (m.new_targets||[]); if(m.status==="open"&&added.length){ L.push("","New targets"); added.forEach(c=>L.push(`• ${c.name}`)); }
  if((m.items||[]).length){ L.push("","Discussion"); m.items.forEach(it=>L.push(`• ${it.topic}${it.notes?`: ${it.notes.replace(/\n+/g," ")}`:""}`)); }
  const cm=S.commitments.filter(c=>c.meetingId===m.id); L.push("","New actions"); cm.length? cm.forEach(c=>L.push(`• ${c.owner}: ${c.action}${c.due?` (by ${fmtD(c.due)})`:""}`)) : L.push("• None");
  if(m.notes) L.push("","Notes",m.notes);
  if(m.next_date) L.push("",`Next meeting: ${fmtD(m.next_date)}`);
  return L.join("\n");
}
function meetViewModal(id){
  const m=meetById(id); if(!m) return;
  const cm=S.commitments.filter(c=>c.meetingId===m.id);
  showModal(`${ovHead(fmtD(m.held_on),`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb">
   ${m.title?`<h2 style="margin:0 2px 6px">${esc(m.title)}</h2>`:""}${(m.attendees||[]).length?`<p class="tag" style="margin:0 2px 10px">Present: ${esc(m.attendees.join(", "))}</p>`:""}
   ${(m.items||[]).length?`<div class="fsec">Discussion</div><div class="group">${m.items.map(it=>`<div class="rowi" style="align-items:flex-start"><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(it.topic)}</span>${it.notes?`<span class="t2" style="display:block;white-space:pre-wrap">${esc(it.notes)}</span>`:""}</span></div>`).join("")}</div>`:""}
   ${(m.decisions||[]).length?`<div class="fsec">Pipeline decisions</div><div class="card box"><div class="sigs">${m.decisions.map(d=>`<span class="pill ${d.decision==="chase"?"won":d.decision==="drop"?"late":"soon"}">${esc(S.companies.get(d.companyId)?.name||"?")}: ${esc(({chase:"Chase",keep:"Keep warm",drop:"Drop",new:"New target"})[d.decision]||d.decision)}</span>`).join("")}</div></div>`:""}
   <div class="fsec">Actions agreed (${cm.filter(c=>c.status==="done").length}/${cm.length} done)</div>${cm.length?`<div class="group">${cm.map(x=>`<div class="rowi"><span class="main"><span class="t1" style="display:block;white-space:normal">${esc(x.action)}</span><span class="t2" style="display:block">${esc(cmtLine(x))}</span></span>${cmtStatusPill(x)}</div>`).join("")}</div>`:`<div class="card empty">None.</div>`}
   ${m.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(m.notes)}</div>`:""}
   <div style="margin-top:16px;display:grid;gap:10px"><button class="btn" data-act="m6-copy" data-id="${esc(m.id)}">Copy minutes for WhatsApp</button><button class="btn" data-act="m8-dl" data-id="${esc(m.id)}">${ic("dl",18)} Download minutes</button>${!S.readOnly&&!openMeeting()?`<button class="btn" data-act="m6-reopen" data-id="${esc(m.id)}">Reopen to edit</button>`:""}</div>
  </div>`, true);
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act, id=t.dataset.id, k=t.dataset.k; if(!a.startsWith("m6-")) return;
  const m=openMeeting();
  switch(a){
    case "m6-start": { if(openMeeting()){ toast("A meeting is already open"); break; } const d=$("#m6Date")?.value||today(); const me=myPartner(); const {error}=await sb.from("meetings").insert({held_on:d, attendees:me?[me]:[], next_date:plus21(d)}); if(error) writeErr(error); else { await loadMeetings(); toast("Meeting started"); window.scrollTo(0,0); } break; }
    case "m6-jump": { e.preventDefault(); document.getElementById(k)?.scrollIntoView({behavior:"smooth",block:"start"}); break; }
    case "m6-rev": { if(!m) break; const c=S.commitments.find(x=>x.id===id); if(!c) break;
      if(k==="not_done"){ showModal(`${ovHead("Not done",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><div class="fields">${fldNote("m6Why","Why not? (honest report)","","",3)}<div class="fld"><label for="m6Again">Try again?</label><select id="m6Again">${opts([{v:"no",l:"No, close it"},{v:"yes",l:"Yes, carry it to the next meeting"}],"no")}</select></div></div><div style="margin-top:12px"><button class="btn primary block" data-act="m6-rev-not" data-id="${esc(id)}">Save</button></div></div>`, true); break; }
      const rv={...(m.review||{})}; const by=await myName();
      if(k==="done"){ await sb.from("commitments").update({status:"done"}).eq("id",id); rv[id]={s:"done",by}; }
      if(k==="carried"){ const nd=m.next_date||plus21(m.held_on); await sb.from("commitments").update({due:nd}).eq("id",id); rv[id]={s:"carried",by,note:`now by ${fmtD(nd)}`}; }
      await meetUpdate(m.id,{review:rv},true); await loadCommitments(); break; }
    case "m6-rev-not": { if(!m) break; const why=($("#m6Why")?.value||"").trim(); const again=$("#m6Again").value==="yes"; const rv={...(m.review||{})}; const by=await myName(); const nd=m.next_date||plus21(m.held_on);
      if(again) await sb.from("commitments").update({due:nd, why}).eq("id",id); else await sb.from("commitments").update({status:"not_done", why}).eq("id",id);
      rv[id]={s:again?"carried":"not_done",by,note:[why,again?`carried to ${fmtD(nd)}`:""].filter(Boolean).join(" · ")}; closeModal(); await meetUpdate(m.id,{review:rv},true); await loadCommitments(); break; }
    case "m6-rev-undo": { if(!m) break; const rv={...(m.review||{})}; const r=rv[id]; delete rv[id]; if(r?.s==="done"||r?.s==="not_done") await sb.from("commitments").update({status:"open"}).eq("id",id); await meetUpdate(m.id,{review:rv},true); await loadCommitments(); break; }
    case "m6-cnote": { const c=S.companies.get(id); if(!c||!m) break; showModal(`${ovHead(c.name,`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><div class="fields">${fldNote("m6CNote","What did we say about it?","","Type or speak…",4)}</div><div style="margin-top:12px"><button class="btn primary block" data-act="m6-cnote-save" data-id="${esc(id)}">Save note</button></div></div>`, true); break; }
    case "m6-cnote-save": { const c=S.companies.get(id); const txt=($("#m6CNote")?.value||"").trim(); if(!txt||!m){ toast("Type or speak a note first"); break; } const by=await myName();
      await dbUpdate("companies/"+id,{log:[...(c.log||[]),{d:today(),by,text:`Target meeting: ${txt}`}].slice(-200)});
      await meetUpdate(m.id,{items:[...(m.items||[]),{id:Math.random().toString(36).slice(2,9),topic:c.name,notes:txt,companyId:id,by}]}); closeModal(); toast("Note saved"); break; }
    case "m6-newtarget": { dealForm(null,{kind:"target",status:"target",followUpMonths:3}); break; }
    case "m6-item-add": { if(!m) break; const topic=($("#m6Topic")?.value||"").trim(); const notes=($("#m6ItemNotes")?.value||"").trim(); if(!topic&&!notes){ toast("Add a topic first"); break; } const by=await myName();
      const it={id:Math.random().toString(36).slice(2,9),topic:topic||notes.slice(0,60),notes:topic?notes:"",companyId:$("#m6ItemBiz").value||"",contactId:$("#m6ItemPerson").value||"",by};
      ["m6Topic","m6ItemNotes"].forEach(i=>{ const el=$("#"+i); if(el) el.value=""; }); ["m6ItemBiz","m6ItemPerson"].forEach(i=>{ const el=$("#"+i); if(el) el.value=""; });
      if(await meetUpdate(m.id,{items:[...(m.items||[]),it]})){ toast("Added"); if(it.companyId){ const c=S.companies.get(it.companyId); if(c) dbUpdate("companies/"+c.id,{log:[...(c.log||[]),{d:today(),by,text:`Target meeting: ${it.topic}${it.notes?` – ${it.notes}`:""}`}].slice(-200)}); } if(it.contactId){ const kk=S.contacts.get(it.contactId); if(kk) dbUpdate("contacts/"+kk.id,{log:[...(kk.log||[]),{d:today(),by,text:`Target meeting: ${it.topic}${it.notes?` – ${it.notes}`:""}`}].slice(-200)}); } } break; }
    case "m6-item-del": { if(!m) break; await meetUpdate(m.id,{items:(m.items||[]).filter(x=>x.id!==k)}); break; }
    case "m6-cmt-add": { const action=$("#cmAction").value.trim(); if(!action){ toast("Write the action first"); break; }
      const row={owner:$("#cmOwner").value, action, due:$("#cmDue").value||null, company_id:$("#cmBiz").value||null, contact_id:$("#cmPerson").value||null, meeting_id:m?.id||null}; $("#cmAction").value=""; $("#cmBiz").value=""; $("#cmPerson").value="";
      const {error}=await sb.from("commitments").insert(row); if(error){ writeErr(error); $("#cmAction").value=action; } else { await loadCommitments(); toast("Action added"); } break; }
    case "m6-copy": { const mm=meetById(id); if(mm){ const notes=$("#m6Notes")?.value??mm.notes; copyText(minutesText({...mm,notes})); } break; }
    case "m6-finish": { if(!m) break; const notes=$("#m6Notes")?.value??m.notes; const nd=$("#m6Next")?.value||m.next_date||null;
      const added=targetsAddedIn(m); const decs=[...(m.decisions||[])]; added.forEach(c=>{ if(!decs.some(d=>d.companyId===c.id)) decs.push({companyId:c.id,decision:"new",at:today()}); });
      if(await meetUpdate(m.id,{status:"done",notes,next_date:nd,decisions:decs},true)){ if(nd) saveNextMeeting(nd,true); await loadMeetings(); toast("Meeting saved"); const mm=meetById(m.id); if(mm) showOut("Minutes", minutesText(mm)); } break; }
    case "m6-discard": { if(!m) break; confirmBox("Discard this meeting?","Its notes, decisions and the actions added in it will be deleted.","Discard",async()=>{ await sb.from("commitments").delete().eq("meeting_id",m.id); await loadCommitments(); const {error}=await sb.from("meetings").delete().eq("id",m.id); if(error) writeErr(error); else { closeModal(); await loadMeetings(); toast("Discarded"); } }); break; }
    case "m6-view": meetViewModal(id); break;
    case "m6-reopen": { if(openMeeting()){ toast("Finish the open meeting first"); break; } if(await meetUpdate(id,{status:"open"},true)){ closeModal(); await loadMeetings(); toast("Reopened"); } break; }
  }
});
document.addEventListener("change",async e=>{
  const m=openMeeting(); if(!m) return; const id=e.target.id;
  if(id==="m6When" && e.target.value) await meetUpdate(m.id,{held_on:e.target.value});
  if(id==="m6Title") await meetUpdate(m.id,{title:e.target.value.trim()},true);
  if(id==="m6Notes") await meetUpdate(m.id,{notes:e.target.value},true);
  if(id==="m6Next") await meetUpdate(m.id,{next_date:e.target.value||null},true);
  if(e.target.name==="m6Att"){ const att=[...document.querySelectorAll("input[name=m6Att]:checked")].map(x=>x.value); await meetUpdate(m.id,{attendees:att},true); }
});
/* keep half-typed meeting fields when the screen refreshes (e.g. a partner saves something) */
{ const KEEP=/^(m6Topic|m6ItemNotes|m6ItemBiz|m6ItemPerson|cmAction|cmOwner|cmDue|cmBiz|cmPerson|m6Notes|m6Date)$/;
  const base=render;
  render=function(){
    const keep={}; const act=document.activeElement;
    if(S.view==="meeting") document.querySelectorAll("#main input[id],#main textarea[id],#main select[id]").forEach(el=>{ if(KEEP.test(el.id)) keep[el.id]={v:el.value,f:act===el,s:el.selectionStart}; });
    base();
    if(currentView()==="meeting") for(const [id,o] of Object.entries(keep)){ const el=document.getElementById(id); if(!el) continue; if(el.value!==o.v) el.value=o.v; if(o.f){ el.focus(); try{ el.setSelectionRange(o.s,o.s); }catch(_){} } }
  };
}
