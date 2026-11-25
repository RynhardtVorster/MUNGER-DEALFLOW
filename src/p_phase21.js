ICON.doc='<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4"/>';
/* ================= Phase 21: meeting notes live inside the follow-up log (Log → paste Granola / Wispr Flow notes, dated and timed) ================= */
function wordsOf(s){ s=String(s||"").trim(); return s? s.split(/\s+/).length : 0; }
function mnPasteBox(id,val,rows){ return `<div class="lbl" style="margin:12px 4px 6px;display:flex;justify-content:space-between;align-items:center;gap:8px"><span>Meeting notes <span class="tag" style="font-weight:400">– paste from Granola or Wispr Flow</span></span><button type="button" class="btn sm" data-act="mn21-paste" data-for="${id}">${ic("doc",16)} Paste</button></div>
  <textarea id="${id}" rows="${rows||8}" class="mtgnotes" placeholder="Paste the full meeting notes here – the more complete the better. They're saved with this entry, dated and timed.">${esc(val||"")}</textarea><div class="tag mn21count" data-for="${id}" style="margin:4px 4px 0">${wordsOf(val)?`${wordsOf(val)} words`:""}</div>`; }
/* 1. the Log screen gets a meeting-notes box under "What was discussed?" */
{ const base=ciEnhance; ciEnhance=function(rec,isK){ base(rec,isK); const ov=document.querySelector("#modal .ovb"); if(!ov||ov.querySelector("#ci21MN")) return;
  const fld=ov.querySelector("#qNote,#qkNote")?.closest(".fld"); if(!fld) return; fld.insertAdjacentHTML("afterend",`<div id="mn21wrap">${mnPasteBox("ci21MN","",7)}</div>`); }; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="ci19-out"]'); if(!t) return; const w=document.getElementById("mn21wrap"); if(w) w.hidden= t.dataset.k==="attempt"; });
document.addEventListener("input",e=>{ if(!e.target.classList?.contains("mtgnotes")) return; const c=document.querySelector(`.mn21count[data-for="${e.target.id}"]`); if(c){ const n=wordsOf(e.target.value); c.textContent=n?`${n} words`:""; } });
/* saving the log: the notes ride on the new entry, with the exact time */
{ const base=dbUpdate; dbUpdate=async function(path,patch){ const ta=document.querySelector("#modal #ci21MN"); const mn=(ta&&!ta.dataset.saved)? ta.value.replace(/\s+$/,"") : "";
  if(mn && patch && Array.isArray(patch.log) && /^(companies|contacts)\//.test(path)){ const L=patch.log; const e=L[L.length-1];
    if(e && e.d===today()){ ta.dataset.saved="1"; const e2={...e, id:e.id||newId(), mn, mnAt:new Date().toISOString(), mnBy:S.me?.name||e.by||""}; if(e2.type==="note" && /^(Note)?$/.test(actBody(e2))) e2.text="Meeting notes"; patch={...patch, log:[...L.slice(0,-1),e2]}; } }
  return base(path,patch); }; }
/* 2. every log entry with notes shows a button; the Follow-up card links to all notes */
function mnRec(kind,id){ return kind==="c"?S.companies.get(id):S.contacts.get(id); }
function mnTime(e){ return e.mnAt? new Date(e.mnAt).toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"}) : ""; }
function mnList(rec){ return (rec?.log||[]).map((e,i)=>({e,i})).filter(x=>x.e.mn).sort((a,b)=>((b.e.d||"")+(b.e.mnAt||"")).localeCompare((a.e.d||"")+(a.e.mnAt||""))); }
{ const base=renderSheet; renderSheet=function(){ base(); try{ const sh=document.getElementById("sheet"); if(!sh||!S.sheet) return; const kind=S.sheet.kind==="company"?"c":"k"; const rec=mnRec(kind,S.sheet.id); if(!rec) return;
  sh.querySelectorAll('[data-act="log-edit"]').forEach(el=>{ if(el.querySelector(".mnchip")) return; const e=rec.log?.[Number(el.dataset.i)]; if(!e?.mn) return;
    el.insertAdjacentHTML("beforeend",`<button type="button" class="mnchip" data-act="mn21-view" data-kind="${kind}" data-id="${esc(rec.id)}" data-i="${el.dataset.i}">${ic("doc",15)} Meeting notes · ${wordsOf(e.mn)} words</button>`); });
  const L=mnList(rec); if(!L.length||sh.querySelector(".mnall")) return;
  const btn=`<button class="btn block mnall" data-act="mn21-all" data-kind="${kind}" data-id="${esc(rec.id)}" style="margin-top:10px">${ic("doc",18)} All meeting notes (${L.length})</button>`;
  const fu=[...sh.querySelectorAll(".fsec")].find(f=>f.textContent.trim()==="Follow-up"); const card=fu?.nextElementSibling;
  if(card){ const acts=card.querySelector(".acts"); acts? acts.insertAdjacentHTML("afterend",btn) : card.insertAdjacentHTML("beforeend",btn); return; }
  const anchor=[...sh.querySelectorAll(".fsec")].find(f=>/activity|history|check-in|notes/i.test(f.textContent)); if(anchor) anchor.insertAdjacentHTML("beforebegin",`<div style="margin:6px 0 4px">${btn}</div>`); }catch(err){ console.warn(err); } }; }
/* editing an entry: a button to add or edit its meeting notes */
{ const base=logEditModal; logEditModal=function(kind,id,i){ base(kind,id,i); const e=mnRec(kind,id)?.log?.[i]; const f=document.querySelector("#modal .ovb .fields"); if(!e||!f) return;
  f.insertAdjacentHTML("afterend",`<button class="btn block" style="margin-top:10px" data-act="mn21-edit" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">${ic("doc",18)} ${e.mn?`Meeting notes (${wordsOf(e.mn)} words) – open`:"+ Add meeting notes to this entry"}</button>`); }; }
function mnHead(rec,e){ return `${fmtD(e.d)}${mnTime(e)?` ${mnTime(e)}`:""} · ${ACT[actType(e)]?.short||""}${e.by?` · ${e.by}`:""}`; }
function mnText(rec,e){ return `${rec.name} – meeting notes\n${mnHead(rec,e)}${actBody(e)&&actBody(e)!=="Meeting notes"?`\n${actBody(e)}`:""}\n\n${e.mn}\n`; }
function mnView(kind,id,i){ const rec=mnRec(kind,id); const e=rec?.log?.[i]; if(!e) return;
  showModal(`${ovHead("Meeting notes",`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb">
   <p style="margin:0 2px 2px"><b>${esc(rec.name)}</b></p><div class="tag" style="margin:0 2px 10px">${esc(mnHead(rec,e))}</div>
   ${actBody(e)&&actBody(e)!=="Meeting notes"?`<p style="margin:0 2px 10px">${esc(actBody(e))}</p>`:""}
   <div class="card box mtgfull">${esc(e.mn)}</div>
   <div class="tag" style="margin:8px 4px 0">${wordsOf(e.mn)} words · saved by ${esc(e.mnBy||e.by||"")}${e.mnAt?` ${esc(new Date(e.mnAt).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}))}`:""}${e.mnEditedAt?` · edited by ${esc(e.mnEditedBy||"")} ${esc(new Date(e.mnEditedAt).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}))}`:""}</div>
   <div class="acts" style="margin-top:14px;grid-template-columns:1fr 1fr 1fr">${S.readOnly?"":`<button class="act dark" data-act="mn21-edit" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">${ic("edit",18)}Edit</button>`}<button class="act" data-act="mn21-copy" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">${ic("doc",18)}Copy</button><button class="act" data-act="mn21-dl" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">${ic("dl",18)}Download</button></div></div>`,true); }
function mnEdit(kind,id,i){ const rec=mnRec(kind,id); const e=rec?.log?.[i]; if(!e) return;
  showModal(`${ovHead(e.mn?"Edit meeting notes":"Add meeting notes",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 2px"><b>${esc(rec.name)}</b></p><div class="tag" style="margin:0 2px 4px">${esc(mnHead(rec,e))}</div>
   ${mnPasteBox("mn21E",e.mn,14)}
   <button class="btn primary block" style="margin-top:14px" data-act="mn21-save" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">${ic("check",18)} Save meeting notes</button></div>`,true); setTimeout(()=>$("#mn21E")?.focus(),80); }
function mnAll(kind,id){ const rec=mnRec(kind,id); const L=mnList(rec); if(!rec) return;
  showModal(`${ovHead(`Meeting notes (${L.length})`,`<button class="hbtn" data-act="close-modal">Close</button>`)}<div class="ovb">
   <p style="margin:0 2px 10px"><b>${esc(rec.name)}</b> – every meeting, newest first.</p>
   <div class="acts" style="grid-template-columns:1fr 1fr;margin-bottom:12px"><button class="act" data-act="mn21-copyall" data-kind="${kind}" data-id="${esc(id)}">${ic("doc",18)}Copy all</button><button class="act" data-act="mn21-dlall" data-kind="${kind}" data-id="${esc(id)}">${ic("dl",18)}Download all</button></div>
   ${L.map(({e,i})=>`<div class="lbl" style="margin:14px 4px 6px;display:flex;justify-content:space-between;gap:8px"><span>${esc(mnHead(rec,e))}</span>${S.readOnly?"":`<button class="linkbtn" data-act="mn21-edit" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">Edit</button>`}</div>${actBody(e)&&actBody(e)!=="Meeting notes"?`<p style="margin:0 4px 6px">${esc(actBody(e))}</p>`:""}<div class="card box mtgfull" style="max-height:none">${esc(e.mn)}</div>`).join("")}</div>`,true); }
const mnAllText=rec=>mnList(rec).map(({e})=>mnText(rec,e)).join("\n――――――――――\n\n");
document.addEventListener("click",async ev=>{ const t=ev.target.closest('[data-act^="mn21-"]'); if(!t) return; ev.preventDefault(); ev.stopPropagation(); const a=t.dataset.act, {kind,id}=t.dataset, i=Number(t.dataset.i);
  if(a==="mn21-paste"){ const ta=document.getElementById(t.dataset.for); try{ const txt=await navigator.clipboard.readText(); if(!txt){ toast("Nothing copied yet"); return; } ta.value= ta.value.trim()? ta.value.replace(/\s*$/,"\n\n")+txt : txt; ta.dispatchEvent(new Event("input",{bubbles:true})); toast("Pasted"); }catch(_){ ta?.focus(); toast("Tap in the box and paste (hold → Paste)"); } return; }
  if(a==="mn21-view"){ mnView(kind,id,i); return; }
  if(a==="mn21-edit"){ mnEdit(kind,id,i); return; }
  if(a==="mn21-all"){ mnAll(kind,id); return; }
  const rec=mnRec(kind,id); if(!rec) return; const e=rec.log?.[i];
  if(a==="mn21-copy"||a==="mn21-copyall"){ try{ await navigator.clipboard.writeText(a==="mn21-copy"?mnText(rec,e):mnAllText(rec)); toast("Copied"); }catch(_){ toast("Couldn't copy"); } return; }
  if(a==="mn21-dl"){ dlText(`${rec.name} – meeting notes – ${e.d}.txt`.replace(/[\\/:*?"<>|]/g,"-"), mnText(rec,e)); return; }
  if(a==="mn21-dlall"){ dlText(`${rec.name} – all meeting notes.txt`.replace(/[\\/:*?"<>|]/g,"-"), mnAllText(rec)); return; }
  if(a==="mn21-save"){ if(!e) return; const mn=$("#mn21E").value.replace(/\s+$/,""); const me=S.me?.name||""; const now=new Date().toISOString(); t.disabled=true;
    const ok=await logWrite(kind,id,L=>{ const j=L.findIndex(x=>(e.id&&x.id===e.id)||(x.d===e.d&&x.text===e.text&&x.by===e.by)); if(j<0) return; const x={...L[j], id:L[j].id||newId()};
      if(!mn){ delete x.mn; delete x.mnAt; delete x.mnBy; } else if(!x.mn){ Object.assign(x,{mn,mnAt:now,mnBy:me}); } else { Object.assign(x,{mn,mnEditedAt:now,mnEditedBy:me}); } L[j]=x; });
    t.disabled=false; if(ok){ closeModal(); toast(mn?"Meeting notes saved":"Meeting notes removed"); try{ renderSheet(); }catch(_){} } return; }
},true);

/* ================= Phase 22: key numbers on every business – EBIT, turnover, price and multiple discussed – visible at the top and on the lists ================= */
const EBIT_MID={"< R10m":5,"R10–30m":20,"R30–50m":40,"R50m+":60};
const num22=v=>{ if(v==null||v==="") return null; const x=parseFloat(String(v).replace(/\s/g,"").replace(",",".").replace(/[^\d.\-]/g,"")); return isFinite(x)?x:null; };
const rm=x=>`R${(Math.round(x*10)/10).toLocaleString("en-ZA")}m`;
function kn(c){ const d=c.deal||{}; const ebit=num22(c.ebitConfirmed); const est=c.ebit&&c.ebit!=="Unknown"?c.ebit:""; const turn=num22(c.turnoverConfirmed);
  let price=num22(d.price), mult=num22(d.multiple), multCalc=false, priceCalc=false;
  if(mult==null && price!=null && ebit) { mult=price/ebit; multCalc=true; }
  if(price==null && mult!=null && ebit) { price=mult*ebit; priceCalc=true; }
  return {ebit,est,turn,price,mult,multCalc,priceCalc,margin: ebit&&turn? ebit/turn*100 : null, d}; }
function knShort(c){ const k=kn(c); const p=[]; if(k.ebit!=null) p.push(`EBIT ${rm(k.ebit)}`); else if(k.est) p.push(`EBIT ~${k.est}`); if(k.mult!=null) p.push(`${(Math.round(k.mult*10)/10)}× EBIT`); if(k.price!=null) p.push(`Price ${rm(k.price)}`); return p.join(" · "); }
function knHTML(c){ const k=kn(c); const ro=S.readOnly;
  const row=(l,v,sub)=>`<div class="k">${l}</div><div class="v">${v?`<b>${esc(v)}</b>`:`<span class="kn22add">${ro?"–":"Add"}</span>`}${sub?`<small>${esc(sub)}</small>`:""}</div>`;
  const s=c.scorecard; const v=s&&s.total!=null&&s.inputs&&Object.keys(s.inputs).length? (VERD[s.verdict]||VERD.kill) : null;
  return `<div class="fsec" id="kn22">Key numbers</div><div class="card kn22" ${ro?"":`data-act="kn22-edit" data-id="${esc(c.id)}" role="button" tabindex="0"`}><div class="kv">
   ${row("EBIT",k.ebit!=null?rm(k.ebit):k.est?`~${k.est}`:"",k.ebit!=null?`confirmed${c.financialsYear?` · ${c.financialsYear}`:""}`:k.est?"our estimate":"")}
   ${row("Turnover",k.turn!=null?rm(k.turn):c.turnover?`~${c.turnover}`:"",k.margin!=null?`EBIT margin ${Math.round(k.margin*10)/10}%`:k.turn!=null?"":c.turnover?"estimate":"")}
   ${row("Price discussed",k.price!=null?rm(k.price):"",k.priceCalc?"from the multiple":"")}
   ${row("Multiple",k.mult!=null?`${Math.round(k.mult*10)/10}× EBIT`:"",k.multCalc?"price ÷ EBIT":"")}</div>
   ${k.d.note?`<div class="kn22note">${esc(k.d.note)}</div>`:""}
   <div class="kn22foot"><span>${k.d.at?`Updated by ${esc(k.d.by||"")} · ${esc(fmtD(k.d.at.slice(0,10)))}`:ro?"":"Tap to fill in the numbers"}</span>${v?`<span class="pill scpill ${v.cls}">Score ${s.total} · ${v.l}</span>`:ro?"":`<span class="kn22edit">${ic("edit",16)} Edit</span>`}</div></div>`; }
{ const base=renderSheet; renderSheet=function(){ base(); try{ if(S.sheet?.kind!=="company") return; const c=S.companies.get(S.sheet.id); const sh=document.getElementById("sheet"); if(!c||!sh||!isAcq(c)||sh.querySelector("#kn22")) return;
  const first=sh.querySelector(".ovb .fsec"); const w=document.createElement("div"); w.innerHTML=knHTML(c); if(first) first.before(...w.childNodes); else (sh.querySelector(".ovb")||sh).append(...w.childNodes); }catch(err){ console.warn(err); } }; }
function knModal(id){ const c=S.companies.get(id); if(!c) return; const d=c.deal||{};
  showModal(`${ovHead("Key numbers",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><p style="margin:0 2px 10px"><b>${esc(c.name)}</b></p>
   <div class="fields">
    <div class="fld" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label for="knE">EBIT (R million)</label><input id="knE" inputmode="decimal" value="${esc(c.ebitConfirmed??"")}" placeholder="e.g. 12"></div><div><label for="knFy">Financial year</label><input id="knFy" value="${esc(c.financialsYear||"")}" placeholder="e.g. FY2025"></div></div>
    <div class="fld"><label for="knEst">Not confirmed yet? Our EBIT estimate</label><select id="knEst">${opts(EBIT,c.ebit||"Unknown")}</select></div>
    <div class="fld"><label for="knT">Turnover (R million)</label><input id="knT" inputmode="decimal" value="${esc(c.turnoverConfirmed??"")}" placeholder="e.g. 85"></div>
    <div class="fld" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label for="knP">Price discussed (R million)</label><input id="knP" inputmode="decimal" value="${esc(d.price??"")}" placeholder="e.g. 66"></div><div><label for="knM">Multiple (× EBIT)</label><input id="knM" inputmode="decimal" value="${esc(d.multiple??"")}" placeholder="e.g. 5.5"></div></div>
    <div class="tag" id="knCalc" style="margin:-2px 4px 4px"></div>
    ${fldNote("knN","What was said about price and terms",d.note||"","e.g. Owner wants R70m, open to an earn-out; we said 5× maintainable EBIT",3)}
   </div>
   <button class="btn primary block" style="margin-top:14px" data-act="kn22-save" data-id="${esc(id)}">${ic("check",18)} Save numbers</button></div>`,true); knCalc(); }
function knCalc(){ const el=$("#knCalc"); if(!el) return; const e=num22($("#knE").value), p=num22($("#knP").value), m=num22($("#knM").value), t=num22($("#knT").value); const out=[];
  if(e&&p!=null&&m==null) out.push(`= ${Math.round(p/e*10)/10}× EBIT`); if(e&&m!=null&&p==null) out.push(`= price ${rm(m*e)}`); if(e&&t) out.push(`EBIT margin ${Math.round(e/t*1000)/10}%`); el.textContent=out.join(" · "); }
document.addEventListener("input",e=>{ if(["knE","knP","knM","knT"].includes(e.target.id)) knCalc(); });
document.addEventListener("click",async ev=>{ const t=ev.target.closest('[data-act="kn22-edit"],[data-act="kn22-save"],[data-act="sort22"]'); if(!t) return; ev.preventDefault(); ev.stopPropagation();
  if(t.dataset.act==="sort22"){ S.f.sort=t.dataset.k; render(); return; }
  const id=t.dataset.id; if(t.dataset.act==="kn22-edit"){ knModal(id); return; }
  const c=S.companies.get(id); if(!c) return; const by=await myName();
  const deal={price:num22($("#knP").value), multiple:num22($("#knM").value), note:$("#knN").value.trim(), by, at:new Date().toISOString()};
  const patch={ebitConfirmed:num22($("#knE").value), financialsYear:$("#knFy").value.trim(), ebit:$("#knEst").value, turnoverConfirmed:num22($("#knT").value), deal};
  const after=knShort({...c,...patch}); const before=knShort(c); if(after!==before) patch.log=[...(c.log||[]),{d:today(),by,type:"note",text:`Key numbers: ${after||"cleared"}`}];
  t.disabled=true; const ok=await dbUpdate("companies/"+id,patch); t.disabled=false; if(ok){ closeModal(); toast("Numbers saved"); queueRender(); try{ renderSheet(); }catch(_){} } },true);
/* lists: the numbers under every business, and sort by them */
{ const base=bizRow; bizRow=function(c){ const h=base(c); if(!isAcq(c)) return h; const s=knShort(c); const line=`<span class="t2 kn22l" style="display:block">${s?esc(s):`<span class="kn22none">No numbers yet</span>`}</span>`; const i=h.indexOf('</span><span class="trail">'); return i<0? h : h.slice(0,i)+line+h.slice(i); }; }
const knSortVal={ebit:c=>{ const k=kn(c); return k.ebit!=null?k.ebit:EBIT_MID[k.est]??null; }, mult:c=>kn(c).mult, score:c=>{ const s=c.scorecard; return s&&s.inputs&&Object.keys(s.inputs).length? s.total : null; }};
{ const base=filteredDeals; filteredDeals=function(){ const arr=base(); const k=S.f?.sort; const f=knSortVal[k]; if(!f) return arr; const dir=k==="mult"?1:-1;
  return [...arr].sort((a,b)=>{ const x=f(a), y=f(b); if(x==null&&y==null) return 0; if(x==null) return 1; if(y==null) return -1; return (x-y)*dir; }); }; }
{ const base=vBusinesses; vBusinesses=function(){ const h=base(); if(S.view==="funders") return h; const k=S.f?.sort||"";
  const row=`<div class="chips sort22"><span class="tag" style="align-self:center;margin-right:2px">Sort</span>${[["","Default"],["ebit","Biggest EBIT"],["mult","Cheapest multiple"],["score","Best score"]].map(([v,l])=>`<button class="chip ${k===v?"on":""}" data-act="sort22" data-k="${v}">${l}</button>`).join("")}</div>`;
  const i=h.indexOf('<div class="group">'); return i<0? h : h.slice(0,i)+row+h.slice(i); }; }
