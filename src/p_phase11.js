/* ================= Phase 11: reliable voice + Granola / Wispr Flow meeting import ================= */
const IS_IOS=/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const IS_STANDALONE=(()=>{ try{ return navigator.standalone===true || matchMedia("(display-mode: standalone)").matches; }catch(_){ return false; } })();
function micHint(ta, msg){
  const id="mh-"+ta.id; document.getElementById(id)?.remove();
  const d=document.createElement("div"); d.id=id; d.className="michint"; d.innerHTML=msg+` <button type="button" class="linkbtn" data-act="mic-hint-x">OK</button>`;
  ta.insertAdjacentElement("afterend", d);
}
startMic=function(btn){
  const ta=document.getElementById(btn.dataset.for); if(!ta) return;
  if(REC){ try{ REC.stop(); }catch(e){} return; }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const keyboardWay=()=>{ ta.focus(); micHint(ta, IS_IOS? "Tap the <b>🎤 microphone on your keyboard</b> (bottom right) and speak – it types straight into this box. The Wispr Flow keyboard works too." : "Tap the <b>🎤 microphone on your keyboard</b> and speak – it types straight into this box."); };
  if(!SR || (IS_IOS && IS_STANDALONE)){ keyboardWay(); return; }
  let r; try{ r=new SR(); }catch(_){ keyboardWay(); return; }
  r.lang=voiceLang(); r.continuous=!IS_IOS; r.interimResults=true;
  const base=ta.value? ta.value.replace(/\s*$/,"")+" " : ""; let fin="", got=false;
  const dog=setTimeout(()=>{ if(!got){ try{ r.abort(); }catch(_){} keyboardWay(); } },7000);
  r.onresult=e=>{ got=true; let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const t=e.results[i][0].transcript; if(e.results[i].isFinal) fin+=t.trim()+" "; else interim+=t; } ta.value=(base+fin+interim); ta.dispatchEvent(new Event("input",{bubbles:true})); };
  r.onerror=ev=>{ clearTimeout(dog); if(ev.error==="no-speech") { toast("Didn't hear anything – try again"); return; } if(ev.error==="aborted") return; keyboardWay(); };
  r.onend=()=>{ clearTimeout(dog); REC=null; if(REC_BTN){ REC_BTN.classList.remove("rec"); } REC_BTN=null; ta.value=ta.value.trim(); ta.dispatchEvent(new Event("input",{bubbles:true})); ta.dispatchEvent(new Event("change",{bubbles:true})); };
  REC=r; REC_BTN=btn; btn.classList.add("rec");
  try{ r.start(); toast("Listening… tap Stop when done"); }catch(_){ clearTimeout(dog); REC=null; btn.classList.remove("rec"); keyboardWay(); }
};

/* ---- Meeting import from Granola / Wispr Flow ---- */
function importCard(m){
  return `<div class="card box importcard" id="m-import">
   <div class="lbl">Recorded it in Granola or Wispr Flow?</div>
   <div>Copy the meeting notes or transcript there, paste it here, and Munger turns it into discussion points, decisions, action reviews and new actions for you to check.</div>
   <div class="fields" style="margin-top:6px"><div class="fld"><label for="m11Text">Paste notes or transcript</label><textarea id="m11Text" rows="5" placeholder="Paste from Granola or Wispr Flow…"></textarea></div></div>
   <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px"><button class="btn primary" data-act="m11-go">${ic("spark",18)} Turn into minutes</button><button class="btn" data-act="m11-notes">Just save as notes</button></div>
  </div>`;
}
async function m11Go(btn){
  const m=openMeeting(); if(!m) return; const text=($("#m11Text")?.value||"").trim(); if(text.length<20){ toast("Paste the notes or transcript first"); return; }
  btn.disabled=true; btn.textContent="Reading the meeting…";
  const targets=companies().filter(c=>isAcq(c)&&["target","active","network"].includes(grp(c))).map(c=>`${c.id} | ${c.name}`);
  const open=S.commitments.filter(x=>x.status==="open"&&x.meetingId!==m.id).map(x=>`${x.id} | ${x.owner} | ${x.action}`);
  let data=null, err=null;
  try{ const res=await sb.functions.invoke("meeting-minutes",{body:{text, date:m.held_on, team:S.partners, targets, open}}); data=res.data; err=res.error; }catch(e){ err=e; }
  btn.disabled=false; btn.innerHTML=`${ic("spark",18)} Turn into minutes`;
  if(err || !data || data.error){ const code=data?.error || (err?.context?.status===503?"not_configured":""); 
    if(code==="not_configured" || /503/.test(String(err?.message||""))) showModal(`${ovHead("AI not switched on yet",`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb"><p style="margin:0 2px 10px">To turn transcripts into minutes automatically, Rynhardt needs to add the Anthropic API key in Supabase (Edge Functions → Secrets → <b>ANTHROPIC_API_KEY</b>). The same key switches on smart Ask the network.</p><p class="tag" style="margin:0 2px 12px">Until then you can save the text as the meeting's notes.</p><button class="btn primary block" data-act="m11-notes">Save it as notes for now</button></div>`, true);
    else toast("Couldn't read the meeting – try again, or save it as notes"); return; }
  S.m11=data; m11Preview(data);
}
function m11Preview(d){
  const nm=id=>S.companies.get(id)?.name; const cm=id=>S.commitments.find(x=>x.id===id);
  const row=(key,i,html)=>`<label class="pickrow"><input type="checkbox" data-m11="${key}:${i}" checked><span>${html}</span></label>`;
  const items=(d.items||[]), acts=(d.actions||[]), decs=(d.decisions||[]).filter(x=>nm(x.companyId)), rev=(d.review||[]).filter(x=>cm(x.id));
  showModal(`${ovHead("Check the minutes",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   ${d.summary?`<div class="card box" style="margin-bottom:10px">${esc(d.summary)}</div>`:""}
   <p class="tag" style="margin:0 2px 8px">Untick anything that's wrong. You can still edit it all in the meeting afterwards.</p>
   ${rev.length?`<div class="fsec">Actions reviewed</div><div class="group picklist">${rev.map((x,i)=>row("r",i,`<b>${esc(cm(x.id).action)}</b> – ${esc(REV[x.status]?.[0]||x.status)}${x.note?` (${esc(x.note)})`:""}`)).join("")}</div>`:""}
   ${decs.length?`<div class="fsec">Pipeline decisions</div><div class="group picklist">${decs.map((x,i)=>row("d",i,`<b>${esc(nm(x.companyId))}</b>: ${esc(({chase:"Chase",keep:"Keep warm",drop:"Drop"})[x.decision]||x.decision)}`)).join("")}</div>`:""}
   ${items.length?`<div class="fsec">Discussion</div><div class="group picklist">${items.map((x,i)=>row("i",i,`<b>${esc(x.topic)}</b>${x.notes?` – ${esc(x.notes)}`:""}`)).join("")}</div>`:""}
   ${acts.length?`<div class="fsec">New actions</div><div class="group picklist">${acts.map((x,i)=>row("a",i,`<b>${esc(x.owner||"Unassigned")}</b>: ${esc(x.action)}${x.due?` (by ${esc(fmtD(x.due))})`:""}`)).join("")}</div>`:""}
   ${d.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(d.notes)}</div>`:""}
   <div style="margin-top:16px"><button class="btn primary block" data-act="m11-apply">${ic("check",18)} Add to the meeting</button></div></div>`, true);
}
async function m11Apply(btn){
  const m=openMeeting(); const d=S.m11; if(!m||!d) return; btn.disabled=true;
  const on=k=>!!document.querySelector(`[data-m11="${k}"]:checked`); const by=await myName();
  const decs=(d.decisions||[]).filter(x=>S.companies.get(x.companyId)), rev=(d.review||[]).filter(x=>S.commitments.find(c=>c.id===x.id));
  for(const [i,x] of decs.entries()){ if(on("d:"+i) && ["chase","keep","drop"].includes(x.decision)){ try{ await decide(x.companyId,x.decision); }catch(_){} } }
  const rv={...(meetById(m.id)?.review||{})}; const nd=m.next_date||plus21(m.held_on);
  for(const [i,x] of rev.entries()){ if(!on("r:"+i)) continue;
    if(x.status==="done") await sb.from("commitments").update({status:"done"}).eq("id",x.id);
    else if(x.status==="carried") await sb.from("commitments").update({due:nd}).eq("id",x.id);
    else if(x.status==="not_done") await sb.from("commitments").update({status:"not_done",why:x.note||""}).eq("id",x.id);
    rv[x.id]={s:x.status,by,note:x.note||""}; }
  const items=[...(meetById(m.id)?.items||[]), ...(d.items||[]).filter((_,i)=>on("i:"+i)).map(x=>({id:Math.random().toString(36).slice(2,9),topic:x.topic,notes:x.notes||"",companyId:S.companies.has(x.companyId)?x.companyId:"",by:"Granola / Wispr Flow"}))];
  const rows=(d.actions||[]).filter((_,i)=>on("a:"+i)).map(x=>({owner:S.partners.find(p=>p.toLowerCase()===String(x.owner||"").toLowerCase())||S.partners.find(p=>p.split(" ")[0].toLowerCase()===String(x.owner||"").split(" ")[0].toLowerCase())||x.owner||"", action:x.action, due:/^\d{4}-\d{2}-\d{2}$/.test(x.due||"")?x.due:nd, company_id:S.companies.has(x.companyId)?x.companyId:null, meeting_id:m.id}));
  if(rows.length){ const {error}=await sb.from("commitments").insert(rows); if(error) writeErr(error); }
  const notes=[meetById(m.id)?.notes, d.summary?`Summary: ${d.summary}`:"", d.notes].filter(Boolean).join("\n\n");
  await meetUpdate(m.id,{items, review:rv, notes},true);
  await loadCommitments(); await loadMeetings(); closeModal(); $("#m11Text") && ($("#m11Text").value=""); btn.disabled=false; toast("Added to the meeting – check each step");
}
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="mic-hint-x"){ t.closest(".michint")?.remove(); }
  if(a==="m11-go") m11Go(t);
  if(a==="m11-apply") m11Apply(t);
  if(a==="m11-notes"){ const m=openMeeting(); const txt=($("#m11Text")?.value||"").trim(); if(!m||!txt){ toast("Paste the notes first"); return; } await meetUpdate(m.id,{notes:[m.notes,txt].filter(Boolean).join("\n\n")}); closeModal(); const ta=$("#m11Text"); if(ta) ta.value=""; toast("Saved in the meeting notes"); }
});
