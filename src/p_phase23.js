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
/* ================= Phase 26: Today shows every planned follow-up (people, partners, businesses) – this week first, then what's next ================= */
peopleCheckins=function(mine){ const me=myPartner(); return contacts().filter(k=>k.nextCheckIn && (!mine || (partnerFor(k.checkInOwner||k.partner||"")||k.checkInOwner||k.partner)===me || (!k.checkInOwner && !k.partner && k.createdBy===S.uid))); };
function fuPlanned(mine){ const open=companies().filter(isOpen); const pool=mine? open.filter(isMine) : open; return [...pool,...peopleCheckins(mine)].filter(x=>x.nextCheckIn).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn)); }
function fuRow(x){ const d=dueInfo(x); const isK=isPersonRec(x); const who=isK? (x.checkInOwner||x.partner||"") : respOf(x).join(" & ");
  const sub=[isK? workLine(x) : (isPartnerCo(x)? `Partner · ${PKINDS[x.kind]||""}` : STAGE[x.status]?.label||""), x.checkInNote, who&&`· ${who.split(" ")[0]}`].filter(Boolean).join(" · ").replace(" · ·"," ·");
  return `<button class="rowi" ${isK?`data-contact="${esc(x.id)}"`:`data-open="${esc(x.id)}"`}>${isK?avatarP(x):(isPartnerCo(x)?`<span class="avatar biz">${ic(pkIcon(x),20)}</span>`:avatarB(x))}<span class="main"><span class="t1" style="display:block">${esc(x.name)}</span><span class="t2" style="display:block">${esc(sub)}</span></span><span class="trail"><span class="fu26d">${esc(fmtD(x.nextCheckIn).replace(/ \d{4}$/,""))}</span>${d&&daysUntil(x.nextCheckIn)<=30?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}</span></button>`; }
{ const base=vToday; vToday=function(){ let h=base(); try{ const mine=S.scope==="mine";
  h=h.replace(/<div class="sec"><h2>Coming up<\/h2><\/div><div class="group">[\s\S]*?<\/button><\/div>(?=\s*(<div class="sec">|<div style="text-align:center))/, "");
  const L=fuPlanned(mine).filter(x=>daysUntil(x.nextCheckIn)>7); if(!L.length) return h;
  const B=[["Next week",x=>daysUntil(x.nextCheckIn)<=14],["Later this month and next",x=>{const n=daysUntil(x.nextCheckIn); return n>14&&n<=60;}],["Further ahead",x=>daysUntil(x.nextCheckIn)>60]];
  const sec=`<div class="sec"><h2>Follow-ups planned</h2><a href="#checkins">All ${L.length}</a></div>${B.map(([l,f])=>{ const it=L.filter(f); return it.length?`<div class="fu26h">${l} <span class="tag">${it.length}</span></div><div class="group">${it.slice(0,l==="Next week"?8:5).map(fuRow).join("")}</div>${it.length>(l==="Next week"?8:5)?`<a class="btn block sm" href="#checkins" style="margin-top:4px">See all ${it.length}</a>`:""}`:""; }).join("")}`;
  const i=h.indexOf("<h2>To call this week</h2>"); const j=i<0?-1:h.indexOf('<div class="sec">',i+30); if(j>0) return h.slice(0,j)+sec+h.slice(j);
  const k=h.indexOf('<div style="text-align:center;margin-top:18px">'); return k>0? h.slice(0,k)+sec+h.slice(k) : h+sec; }catch(err){ console.warn(err); return h; } }; }
