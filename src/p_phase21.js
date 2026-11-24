ICON.doc='<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4"/>';
/* ================= Phase 21: Meeting notes on every company (owners, sellers, partners) – paste from Granola / Wispr Flow, timestamped, editable ================= */
function nowHM(){ const d=new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function mtgList(c){ return [...(c.meetings||[])].sort((a,b)=>((b.d||"")+(b.t||"")).localeCompare((a.d||"")+(a.t||""))); }
function mtgWho(m){ const theirs=(m.with||[]).map(id=>S.contacts.get(id)?.name).filter(Boolean).concat(m.withOther?[m.withOther]:[]); return theirs; }
function mtgSectionHTML(c){ const L=mtgList(c); const ro=S.readOnly;
  const card=m=>{ const who=mtgWho(m); const prev=String(m.notes||"").trim().split(/\n+/).slice(0,3).join(" · ");
    return `<button class="rowi mtg21" data-act="mtg21-view" data-c="${esc(c.id)}" data-m="${esc(m.id)}"><span class="mtgdate"><b>${esc(new Date((m.d||today())+"T00:00").getDate())}</b><small>${esc(new Date((m.d||today())+"T00:00").toLocaleString("en-ZA",{month:"short"}))}</small></span><span class="main"><span class="t1" style="display:block">${esc(m.title||"Meeting")}</span><span class="t2" style="display:block">${esc([m.t, who.length?`with ${who.join(", ")}`:"", (m.ours||[]).length?`· ${(m.ours||[]).map(p=>p.split(" ")[0]).join(" & ")}`:""].filter(Boolean).join(" "))}</span>${prev?`<span class="t2 mtgprev">${esc(prev.slice(0,160))}${prev.length>160?"…":""}</span>`:`<span class="t2 mtgprev" style="font-style:italic">No notes yet – tap to add</span>`}</span></button>`; };
  return `<div class="fsec" id="mtg21">Meeting notes${L.length?` (${L.length})`:""}</div>
   ${ro?"":`<button class="btn primary block mtgadd" data-act="mtg21-add" data-c="${esc(c.id)}">${ic("plus",18)} Add meeting notes</button>`}
   ${L.length?`<div class="group" style="margin-top:8px">${L.slice(0,5).map(card).join("")}</div>${L.length>5?`<details class="histd"><summary>Show all ${L.length} meetings</summary><div class="group" style="margin-top:8px">${L.slice(5).map(card).join("")}</div></details>`:""}`:`<div class="tag" style="margin:8px 4px 0">Paste the notes from Granola or Wispr Flow after every meeting with the owner, seller or partner. They're kept here, dated and timed, and you can edit them any time.</div>`}`; }
/* put the section on every company page: above Follow-up, or above the activity list */
{ const base=renderSheet; renderSheet=function(){ base(); try{ if(S.sheet?.kind!=="company") return; const c=S.companies.get(S.sheet.id); const sh=document.getElementById("sheet"); if(!c||!sh||sh.querySelector("#mtg21")) return;
  const fs=[...sh.querySelectorAll(".fsec")]; const at=fs.find(f=>f.textContent.trim()==="Follow-up")||fs.find(f=>/^Activity/.test(f.textContent.trim()))||fs.find(f=>/^Last updated|History/.test(f.textContent.trim()));
  const wrap=document.createElement("div"); wrap.innerHTML=mtgSectionHTML(c); if(at) at.before(...wrap.childNodes); else (sh.querySelector(".ovb")||sh).append(...wrap.childNodes); }catch(err){ console.warn(err); } }; }
function mtgModal(cid,mid){ const c=S.companies.get(cid); if(!c) return; const m=mid? (c.meetings||[]).find(x=>x.id===mid) : null; const ppl=peopleAt(c);
  const withSet=new Set(m?.with||(ppl.length===1?[ppl[0].id]:[])); const ours=new Set(m?.ours||[myPartner()].filter(Boolean));
  showModal(`${ovHead(m?"Edit meeting notes":"Meeting notes",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 10px"><b>${esc(c.name)}</b></p>
   <div class="fields">
    <div class="fld"><label for="mtT">What was it?</label><input id="mtT" value="${esc(m?.title||"")}" placeholder="e.g. First meeting with the owner"></div>
    <div class="fld" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label for="mtD">Date</label><input type="date" id="mtD" value="${esc(m?.d||today())}"></div><div><label for="mtH">Time</label><input type="time" id="mtH" value="${esc(m?.t||nowHM())}"></div></div>
   </div>
   <div class="lbl" style="margin:12px 4px 6px">Who was there from ${esc(c.name.split(" ")[0])}</div>
   ${ppl.length?`<div class="rolechips">${ppl.map(k=>`<label><input type="checkbox" name="mtW" value="${esc(k.id)}" ${withSet.has(k.id)?"checked":""}><span>${esc(k.name)}</span></label>`).join("")}</div>`:""}
   <input id="mtWO" class="ss-input" style="margin-top:6px" value="${esc(m?.withOther||"")}" placeholder="${ppl.length?"Someone else? Type their name":"Who did you meet? e.g. the owner, Piet"}">
   <div class="lbl" style="margin:12px 4px 6px">From our team</div>
   <div class="rolechips">${S.partners.map(p=>`<label><input type="checkbox" name="mtO" value="${esc(p)}" ${ours.has(p)?"checked":""}><span>${esc(p.split(" ")[0])}</span></label>`).join("")}</div>
   <div class="lbl" style="margin:14px 4px 6px;display:flex;justify-content:space-between;align-items:center"><span>Notes</span><span style="display:flex;gap:6px"><button type="button" class="btn sm" data-act="mtg21-paste">${ic("doc",16)} Paste</button>${micBtn("mtN")}</span></div>
   <textarea id="mtN" rows="12" class="mtgnotes" placeholder="Paste the Granola or Wispr Flow notes here, or type your own…">${esc(m?.notes||"")}</textarea>
   <div class="tag" id="mtCount" style="margin:4px 4px 0"></div>
   ${m?"":`<label class="check" style="margin:12px 4px 0"><input type="checkbox" id="mtCI" checked> Count this as a check-in (we spoke / met)</label>
   <div class="lbl" style="margin:12px 4px 6px">Next follow-up (optional)</div><div class="chips">${CI_WHEN.map(([l,n])=>`<button type="button" class="chip" data-act="mtg21-when" data-k="${addDays(n)}">${l}</button>`).join("")}</div><input type="hidden" id="mtNext" value="">`}
   <button class="btn primary block" data-act="mtg21-save" data-c="${esc(cid)}" data-m="${esc(mid||"")}" style="margin-top:14px">${ic("check",18)} Save meeting notes</button>
   ${m?`<button class="linkbtn" data-act="mtg21-del" data-c="${esc(cid)}" data-m="${esc(mid)}" style="margin-top:8px;color:var(--bad,#b3261e)">Delete this meeting</button>`:""}</div>`,true);
  mtgCount(); setTimeout(()=>{ (m?$("#mtN"):$("#mtT"))?.focus(); },80); }
function mtgCount(){ const n=$("#mtN"); const el=$("#mtCount"); if(!n||!el) return; const w=n.value.trim()?n.value.trim().split(/\s+/).length:0; el.textContent= w? `${w} words` : ""; }
function mtgView(cid,mid){ const c=S.companies.get(cid); const m=(c?.meetings||[]).find(x=>x.id===mid); if(!m) return; const who=mtgWho(m);
  showModal(`${ovHead(m.title||"Meeting",`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb">
   <p style="margin:0 2px 4px"><b>${esc(c.name)}</b></p>
   <div class="tag" style="margin:0 2px 12px">${esc([fmtD(m.d), m.t, who.length?`with ${who.join(", ")}`:"", (m.ours||[]).length?`· ${(m.ours||[]).join(" & ")}`:""].filter(Boolean).join(" "))}</div>
   <div class="card box mtgfull">${m.notes?esc(m.notes):`<span class="tag">No notes yet.</span>`}</div>
   <div class="tag" style="margin:8px 4px 0">Saved by ${esc(m.by||"")}${m.at?` · ${esc(new Date(m.at).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}))}`:""}${m.editedAt?` · edited by ${esc(m.editedBy||"")} ${esc(new Date(m.editedAt).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}))}`:""}</div>
   <div class="acts" style="margin-top:14px;grid-template-columns:1fr 1fr 1fr">${S.readOnly?"":`<button class="act dark" data-act="mtg21-edit" data-c="${esc(cid)}" data-m="${esc(mid)}">${ic("edit",18)}Edit</button>`}<button class="act" data-act="mtg21-copy" data-c="${esc(cid)}" data-m="${esc(mid)}">${ic("doc",18)}Copy</button><button class="act" data-act="mtg21-dl" data-c="${esc(cid)}" data-m="${esc(mid)}">${ic("dl",18)}Download</button></div></div>`,true); }
function mtgText(c,m){ const who=mtgWho(m); return `${c.name} – ${m.title||"Meeting"}\n${fmtD(m.d)}${m.t?` ${m.t}`:""}${who.length?`\nWith: ${who.join(", ")}`:""}${(m.ours||[]).length?`\nMunger: ${(m.ours||[]).join(", ")}`:""}\n\n${m.notes||""}\n`; }
document.addEventListener("input",e=>{ if(e.target.id==="mtN") mtgCount(); });
document.addEventListener("click",async e=>{ const t=e.target.closest('[data-act^="mtg21-"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); const a=t.dataset.act; const cid=t.dataset.c, mid=t.dataset.m;
  if(a==="mtg21-add"){ mtgModal(cid); return; }
  if(a==="mtg21-view"){ mtgView(cid,mid); return; }
  if(a==="mtg21-edit"){ mtgModal(cid,mid); return; }
  if(a==="mtg21-when"){ $("#mtNext").value=t.dataset.k; t.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===t)); return; }
  if(a==="mtg21-paste"){ try{ const txt=await navigator.clipboard.readText(); if(!txt){ toast("Nothing copied yet"); return; } const n=$("#mtN"); n.value= n.value.trim()? n.value.replace(/\s*$/,"\n\n")+txt : txt; mtgCount(); toast("Pasted"); }catch(_){ $("#mtN").focus(); toast("Tap in the box and paste (hold → Paste)"); } return; }
  if(a==="mtg21-mic"){ if(typeof startMic==="function"){ $("#mtN").focus(); try{ startMic("mtN"); }catch(_){ toast("Use the microphone on your keyboard"); } } else { $("#mtN").focus(); toast("Use the microphone on your keyboard"); } return; }
  const c=S.companies.get(cid); if(!c) return; const m=(c.meetings||[]).find(x=>x.id===mid);
  if(a==="mtg21-copy"){ try{ await navigator.clipboard.writeText(mtgText(c,m)); toast("Copied"); }catch(_){ toast("Couldn't copy"); } return; }
  if(a==="mtg21-dl"){ dlText(`${c.name} – ${m.title||"meeting"} – ${m.d}.txt`.replace(/[\\/:*?"<>|]/g,"-"), mtgText(c,m)); return; }
  if(a==="mtg21-del"){ confirmBox("Delete this meeting?","The meeting notes are removed from this company.","Delete",async()=>{ if(await dbUpdate("companies/"+cid,{meetings:(c.meetings||[]).filter(x=>x.id!==mid)})){ closeModal(); toast("Meeting deleted"); try{ renderSheet(); }catch(_){} } }); return; }
  if(a==="mtg21-save"){ const by=await myName(); const notes=$("#mtN").value.replace(/\s+$/,""); const title=$("#mtT").value.trim()||"Meeting"; const d=$("#mtD").value||today(), tm=$("#mtH").value||"";
    const rec={id:m?.id||newId(), title, d, t:tm, with:[...document.querySelectorAll("input[name=mtW]:checked")].map(x=>x.value), withOther:$("#mtWO").value.trim(), ours:[...document.querySelectorAll("input[name=mtO]:checked")].map(x=>x.value), notes,
      by:m?.by||by, at:m?.at||new Date().toISOString(), ...(m?{editedBy:by, editedAt:new Date().toISOString()}:{})};
    const meetings=m? (c.meetings||[]).map(x=>x.id===m.id?rec:x) : [...(c.meetings||[]),rec];
    const patch={meetings};
    if(!m){ const asCI=$("#mtCI")?.checked; const who=mtgWho(rec); const next=$("#mtNext")?.value||"";
      patch.log=[...(c.log||[]),{d, by, type:asCI?"checkin":"note", text:`Meeting: ${title}${who.length?` (with ${who.join(", ")})`:""} – notes saved`}].slice(-200);
      if(asCI && (!c.lastContact || d>=c.lastContact)) patch.lastContact=d;
      if(next) patch.nextCheckIn=next; }
    t.disabled=true; const ok=await dbUpdate("companies/"+cid,patch); t.disabled=false;
    if(ok){ closeModal(); toast(m?"Meeting notes updated":"Meeting notes saved"); try{ renderSheet(); setTimeout(()=>document.getElementById("mtg21")?.scrollIntoView({behavior:"smooth",block:"start"}),120); }catch(_){} } }
},true);
/* a person's page lists the meetings they were in */
{ const base=renderSheet; renderSheet=function(){ base(); try{ if(S.sheet?.kind!=="contact") return; const k=S.contacts.get(S.sheet.id); const sh=document.getElementById("sheet"); if(!k||!sh||sh.querySelector("#mtg21k")) return;
  const L=[]; companies().forEach(c=>(c.meetings||[]).forEach(m=>{ if((m.with||[]).includes(k.id)) L.push({c,m}); })); if(!L.length) return; L.sort((a,b)=>((b.m.d||"")+(b.m.t||"")).localeCompare((a.m.d||"")+(a.m.t||"")));
  const at=[...sh.querySelectorAll(".fsec")].find(f=>/businesses/.test(f.textContent)); const html=`<div class="fsec" id="mtg21k">Meetings with ${esc(k.name.split(" ")[0])} (${L.length})</div><div class="group">${L.slice(0,5).map(({c,m})=>`<button class="rowi mtg21" data-act="mtg21-view" data-c="${esc(c.id)}" data-m="${esc(m.id)}"><span class="mtgdate"><b>${new Date(m.d+"T00:00").getDate()}</b><small>${new Date(m.d+"T00:00").toLocaleString("en-ZA",{month:"short"})}</small></span><span class="main"><span class="t1" style="display:block">${esc(m.title||"Meeting")}</span><span class="t2" style="display:block">${esc(c.name)}${m.t?` · ${esc(m.t)}`:""}</span></span></button>`).join("")}</div>`;
  const w=document.createElement("div"); w.innerHTML=html; if(at) at.before(...w.childNodes); else (sh.querySelector(".ovb")||sh).append(...w.childNodes); }catch(err){ console.warn(err); } }; }
