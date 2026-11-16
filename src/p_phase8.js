/* ================= Phase 8: prospects vs targets vs other companies; meeting file history ================= */
function isAcq(c){ return !!c && !isPartnerCo(c) && c.kind!=="other"; }
function targetsBlock(mine){
  const T=companies().filter(c=>isAcq(c) && ["target","active"].includes(grp(c)) && (!mine||isMine(c))).sort((a,b)=>(grp(b)==="active")-(grp(a)==="active") || (a.nextCheckIn||"9999").localeCompare(b.nextCheckIn||"9999"));
  const nm=S.meetNext || lastDone()?.next_date || "";
  const meet=nm? `<a class="card box nextmeet" href="#meeting"><span>${ic("flag",18)} Next target meeting</span><b>${esc(fmtD(nm))}${daysUntil(nm)!==null?` · ${daysUntil(nm)<0?`${-daysUntil(nm)} days overdue`:daysUntil(nm)===0?"today":`in ${daysUntil(nm)} days`}`:""}</b></a>` : "";
  return `<div class="sec"><h2>${mine?"My targets":"Our targets"}</h2><a href="#businesses" data-act="biz-targets">All</a></div>${meet}
  ${T.length? `<div class="group">${T.slice(0,8).map(c=>{ const d=dueInfo(c); const o=bizContact(c); return `<button class="rowi" data-open="${esc(c.id)}">${avatarB(c)}<span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([grp(c)==="active"?"In discussions":"", industryShort(c)!=="—"?industryShort(c):"", o?.name, c.partner].filter(Boolean).join(" · ")||"Target")}</span></span><span class="trail">${d?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:`<span class="pill soon">Set check-in</span>`}</span></button>`; }).join("")}</div>${T.length>8?`<a class="linkbtn" href="#businesses" data-act="biz-targets">See all ${T.length} targets</a>`:""}`
   : `<div class="card empty"><b>No targets yet</b>Open a prospect and tap <b>Make it a target</b>, or add a business as a target. Targets show here and in every target meeting.</div>`}`;
}
function vOthers(){
  const L=companies().filter(c=>c.kind==="other").sort((a,b)=>a.name.localeCompare(b.name));
  return `<div class="ph"><div><h1>Other companies</h1><p>Where people we know work. Not for acquisition, so they stay out of Businesses.</p></div></div>
  ${L.length?`<div class="group">${L.map(c=>{ const ppl=peopleAt(c); return `<button class="rowi" data-open="${esc(c.id)}"><span class="avatar biz">${ic("biz",20)}</span><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc(ppl.map(k=>k.name).join(", ")||"Nobody linked")}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`; }).join("")}</div><p class="tag" style="margin:12px 2px">Want to buy one after all? Open it, tap Edit and change “What is it?” to Prospect or Target.</p>`:`<div class="card empty">None yet.</div>`}`;
}
TITLES.others="COMPANIES";
async function saveNextMeeting(d, quiet){ const {error}=await sb.from("settings").upsert({key:"meeting", value:{next:d||""}}); if(error){ writeErr(error); return; } S.meetNext=d||""; if(!quiet){ toast(d?`Next meeting set for ${fmtD(d)}`:"Next meeting cleared"); queueRender(); } }
function dlText(name, text){ const b=new Blob([text],{type:"text/plain;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }
document.addEventListener("change",e=>{ if(e.target.id==="m8Next") saveNextMeeting(e.target.value); });
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="m8-dl"){ const m=meetById(t.dataset.id); if(m) dlText(`Munger target meeting ${m.held_on}.txt`, minutesText(m)); }
  if(a==="m8-dl-all"){ const all=S.meetings.filter(x=>x.status==="done").sort((a,b)=>b.held_on.localeCompare(a.held_on)); dlText(`Munger target meetings – all minutes (${today()}).txt`, all.map(minutesText).join("\n\n"+"=".repeat(40)+"\n\n")); }
});
