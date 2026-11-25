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
/* ================= Phase 25: people get the same Follow-up card as businesses (log with meeting notes, next date, reschedule, note) ================= */
personCheckinCard=function(k){ const ro=S.readOnly; const d=dueInfo(k); const first=k.name.split(" ")[0]; const co=companyOf(k);
  const lastC=[...(k.log||[])].reverse().find(e=>actType(e)==="checkin");
  return `<div class="fsec">Follow-up</div><div class="card box fu25">
   <div class="kvline"><span class="tag">Last spoke / met</span><b>${k.lastContact?esc(fmtD(k.lastContact)):"Not yet"}</b></div>
   ${lastC?`<div class="editable19" data-act="log-edit" data-kind="k" data-id="${esc(k.id)}" data-i="${(k.log||[]).lastIndexOf(lastC)}" style="margin-top:4px">${esc(actBody(lastC))}</div>`:""}
   <div class="kvline" style="margin-top:10px"><span class="tag">Next follow-up</span><span>${k.nextCheckIn?`<b>${esc(fmtD(k.nextCheckIn))}</b> ${d?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}`:`<b>Not set</b>`}</span></div>
   ${k.checkInNote?`<div style="margin-top:6px"><b>To do:</b> ${esc(k.checkInNote)}</div>`:""}
   <div class="tag" style="margin-top:6px">${esc([k.nextCheckIn?`Who: ${k.checkInOwner||k.partner||"not set"}`:"", k.nextCheckIn?(k.checkInRepeat?ciEveryTxt(k.checkInWeeks):"once"):"", co&&isPartnerCo(co)?`at ${co.name} (partner)`:co?`at ${co.name}`:""].filter(Boolean).join(" · "))}</div>
   ${ro?"":`<div class="acts" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px"><button class="act dark" data-act="k-ci-done" data-id="${esc(k.id)}">${ic("check",18)}Log</button><button class="act" data-act="${k.nextCheckIn?"ci-move":"k-ci-set"}" data-kind="k" data-id="${esc(k.id)}">${ic("cal",18)}${k.nextCheckIn?"Reschedule":"Set date"}</button><button class="act" data-act="note19" data-kind="k" data-id="${esc(k.id)}">${ic("edit",18)}Note</button></div>`}
   ${!k.nextCheckIn&&!ro?`<div class="tag" style="margin-top:8px">Just spoke to ${esc(first)}? Tap <b>Log</b> – paste the meeting notes and pick when to follow up. It shows on Today on that day.</div>`:""}
  </div>`; };
/* Log screen for a person: start with no repeat; quick "follow up in…" chips set the date */
/* partner firms: who we're following up with there */
{ const base=renderSheet; renderSheet=function(){ base(); try{ if(S.sheet?.kind!=="company") return; const c=S.companies.get(S.sheet.id); const sh=document.getElementById("sheet"); if(!c||!sh||!isPartnerCo(c)||sh.querySelector("#fu25p")) return;
  const P=peopleAt(c); if(!P.length) return; const due=P.filter(k=>k.nextCheckIn).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn)); const none=P.filter(k=>!k.nextCheckIn);
  const html=`<div class="fsec" id="fu25p">Follow-ups with people here</div><div class="group">${due.map(personCiRow).join("")}${none.map(k=>`<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">${esc(k.lastContact?`Last spoke ${fmtD(k.lastContact)}`:"Not spoken to yet")} · no follow-up set</span></span><span class="trail"><span class="pill">Set</span></span></button>`).join("")}</div>`;
  const at=[...sh.querySelectorAll(".fsec")].find(f=>/People we know here/i.test(f.textContent)); if(at) at.insertAdjacentHTML("beforebegin",html); }catch(err){ console.warn(err); } }; }
