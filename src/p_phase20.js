/* ================= Phase 20: Investment scorecard on every business we'd buy ================= */
/* 10 criteria scored automatically from the numbers you enter; Proceed (>60) / Debate (50–60) / Kill (<50); EBIT below 10% kills; largest client over 30% is a red flag */
const SC=[
 {k:"rev",  n:"Revenue growth – 3 yr CAGR", unit:"%", type:"num", hint:"e.g. 8", bands:[[x=>x<0,0,"<0%"],[x=>x<5,5,"0–5%"],[x=>x<10,7,"5–10%"],[x=>x<=15,9,"10–15%"],[x=>true,10,">15%"]]},
 {k:"ebitdag",n:"EBITDA growth – 3 yr CAGR", unit:"%", type:"num", hint:"e.g. 12", bands:[[x=>x<0,0,"<0%"],[x=>x<5,5,"0–5%"],[x=>x<10,7,"5–10%"],[x=>x<=15,9,"10–15%"],[x=>true,10,">15%"]]},
 {k:"gp",   n:"GP% – material", unit:"%", type:"num", hint:"e.g. 45", bands:[[x=>x<30,0,"<30%"],[x=>x<40,5,"30–40%"],[x=>x<50,7,"40–50%"],[x=>x<=60,9,"50–60%"],[x=>true,10,">60%"]]},
 {k:"ebit", n:"EBIT% (min 10%) – adjusted", unit:"%", type:"num", hint:"e.g. 14", bands:[[x=>x<10,0,"<10%",{kill:true}],[x=>x<13,6,"10–13%"],[x=>x<16,7,"13–16%"],[x=>x<=20,9,"16–20%"],[x=>true,10,">20%"]]},
 {k:"rona", n:"RONA – EBIT / (NWC + FA)", unit:"%", type:"num", hint:"e.g. 25", bands:[[x=>x<15,0,"<15%"],[x=>x<20,4,"15–20%"],[x=>x<30,6,"20–30%"],[x=>x<=40,8,"30–40%"],[x=>true,10,">40%"]]},
 {k:"fit",  n:"Platform fit", type:"pick", opts:[["no",0,"No fit"],["medium",5,"Medium fit"],["good",8,"Good fit"],["excellent",10,"Excellent fit"]]},
 {k:"cash", n:"Day-one cash equity (× EBIT)", unit:"×", type:"num", hint:"e.g. 1.6", bands:[[x=>x>2.8,0,">2.8×"],[x=>x>=2.4,4,"2.4–2.8×"],[x=>x>=1.75,7,"1.75–2.4×"],[x=>x>=1.25,8,"1.25–1.75×"],[x=>true,10,"<1.25×"]]},
 {k:"def",  n:"Defensibility", type:"pick", opts:[["poor",0,"Poor"],["low",3,"Low"],["medium",5,"Medium"],["high",7,"High"],["vhigh",10,"Very high"]]},
 {k:"conc", n:"Customer concentration – largest client % of sales", unit:"%", type:"num", hint:"e.g. 18", bands:[[x=>x>30,0,">30%",{flag:true}],[x=>x>=20,3,"20–30%"],[x=>x>=10,6,"10–20%"],[x=>true,10,"<10%"]]},
 {k:"price",n:"Price (PV PBIAT multiple)", unit:"×", type:"num", hint:"e.g. 9.5", bands:[[x=>x>13,2,">13×"],[x=>x>=11,6,"11–13×"],[x=>x>=10,8,"10–11×"],[x=>x>=8,9,"8–10×"],[x=>true,10,"<8×"]]}];
const VERD={proceed:{l:"Proceed",cls:"v-go",t:"Score above 60 – pursue it heavily."},debate:{l:"Debate",cls:"v-deb",t:"Score 50–60 – discuss at the target meeting before spending more time."},kill:{l:"Kill",cls:"v-kill",t:"Score below 50 – spend the time on something else."}};
function scLine(def,inp){ if(!inp||inp.v===""||inp.v==null) return null; if(def.type==="pick"){ const o=def.opts.find(o=>o[0]===inp.v); return o?{pts:o[1],band:o[2]}:null; }
  const x=parseFloat(String(inp.v).replace(",",".").replace(/[%x×\s]/gi,"")); if(!isFinite(x)) return null; const b=def.bands.find(b=>b[0](x)); return {pts:b[1],band:b[2],kill:!!b[3]?.kill,flag:!!b[3]?.flag}; }
function scoreOf(c){ const I=c?.scorecard?.inputs||{}; let total=0,done=0,kill=false; const flags=[];
  const lines=SC.map(d=>{ const r=scLine(d,I[d.k]); if(r){ total+=r.pts; done++; if(r.kill) kill=true; if(r.flag) flags.push(d.n); } return {d,r,inp:I[d.k]}; });
  return {total,done,kill,flags,lines,verdict: kill? "kill" : total>60? "proceed" : total>=50? "debate" : "kill"}; }
function scoreCardHTML(c,ro){ const s=scoreOf(c); const v=VERD[s.verdict];
  if(!s.done) return `<div class="fsec">Investment scorecard</div><div class="card box"><div class="tag">Not scored yet. Score it on the 10 criteria – growth, margins, RONA, platform fit, day-one cash equity, defensibility, customer concentration and price – to see whether to proceed, debate or kill.</div>${ro?"":`<button class="btn primary block" data-act="sc20" data-id="${esc(c.id)}" style="margin-top:10px">Score this business</button>`}</div>`;
  return `<div class="fsec">Investment scorecard</div><div class="card box sc20card" ${ro?"":`role="button" tabindex="0" data-act="sc20" data-id="${esc(c.id)}"`}>
   <div class="scsum"><div class="scnum ${v.cls}">${s.total}<small>/100</small></div><div><div class="scverd ${v.cls}">${v.l}${s.kill?" – EBIT below 10%":""}</div><div class="tag">${esc(v.t)}${s.done<10?` Provisional – ${s.done} of 10 scored.`:""}</div>${s.flags.length?`<div class="scflag">⚑ Red flag: largest client is over 30% of sales</div>`:""}</div></div>
   <div class="scbar"><span style="width:${s.total}%"></span><i style="left:50%"></i><i style="left:60%"></i></div>
   <div class="sclines">${s.lines.map(({d,r,inp})=>`<div class="scl"><span>${esc(d.n)}</span><b>${r?r.pts:"–"}</b><small>${r?`${esc(d.type==="pick"?r.band:`${inp.v}${d.unit} · ${r.band}`)}${inp?.reason?` – ${esc(inp.reason)}`:""}`:"not scored"}${r?.kill?` <em class="red">kill</em>`:""}${r?.flag?` <em class="red">red flag</em>`:""}</small></div>`).join("")}</div>
   <div class="tag" style="margin-top:8px">${c.scorecard?.by?`Scored by ${esc(c.scorecard.by)} · ${esc(fmtD(c.scorecard.d||""))}`:""}${ro?"":" · tap to update"}</div></div>`; }
function scModal(id){ const c=S.companies.get(id); if(!c) return; const I=c.scorecard?.inputs||{};
  showModal(`${ovHead("Investment scorecard",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 8px"><b>${esc(c.name)}</b> – enter the numbers; the points and the total work themselves out.</p>
   <div class="scsticky" id="scLive"></div>
   ${SC.map((d,i)=>`<div class="card box scq"><div class="lbl">${i+1}. ${esc(d.n)}</div>
     ${d.type==="pick"? `<div class="chips">${d.opts.map(o=>`<button type="button" class="chip ${I[d.k]?.v===o[0]?"on":""}" data-act="sc20-pick" data-k="${d.k}" data-v="${o[0]}">${esc(o[2])} <span class="n">${o[1]}</span></button>`).join("")}</div>`
       : `<div class="scin"><input type="text" inputmode="decimal" id="sc_${d.k}" value="${esc(I[d.k]?.v??"")}" placeholder="${esc(d.hint)}" aria-label="${esc(d.n)}"><span>${d.unit}</span><b id="scp_${d.k}"></b></div><div class="scbands">${d.bands.map(b=>`<span>${esc(b[2])} → ${b[3]?.kill?"kill":b[3]?.flag?"red flag":b[1]}</span>`).join("")}</div>`}
     <input type="text" class="screason" id="scr_${d.k}" value="${esc(I[d.k]?.reason||"")}" placeholder="Reason (optional)"></div>`).join("")}
   <button class="btn primary block" data-act="sc20-save" data-id="${esc(id)}" style="margin-top:12px">Save scorecard</button>
   ${Object.keys(I).length?`<button class="linkbtn" data-act="sc20-clear" data-id="${esc(id)}" style="margin-top:8px;color:var(--bad,#b3261e)">Clear the scorecard</button>`:""}</div>`,true);
  scLiveUpdate(); }
function scRead(){ const inputs={}; SC.forEach(d=>{ const reason=($(`#scr_${d.k}`)?.value||"").trim(); let v="";
  if(d.type==="pick") v=document.querySelector(`[data-act="sc20-pick"][data-k="${d.k}"].on`)?.dataset.v||""; else v=($(`#sc_${d.k}`)?.value||"").trim().replace(",",".");
  if(v!==""||reason) inputs[d.k]={v,reason}; }); return inputs; }
function scLiveUpdate(){ const box=$("#scLive"); if(!box) return; const s=scoreOf({scorecard:{inputs:scRead()}}); const v=VERD[s.verdict];
  SC.forEach(d=>{ if(d.type!=="num") return; const r=scLine(d,{v:$(`#sc_${d.k}`)?.value}); const el=$(`#scp_${d.k}`); if(el){ el.textContent= r? (r.kill?"kill":r.flag?"red flag":`${r.pts} pts`) : ""; el.className= r&&(r.kill||r.flag)?"red":""; } });
  box.innerHTML=`<div class="scsum"><div class="scnum ${v.cls}">${s.total}<small>/100</small></div><div><div class="scverd ${v.cls}">${v.l}${s.kill?" – EBIT below 10%":""}</div><div class="tag">${s.done} of 10 scored${s.flags.length?" · ⚑ customer concentration red flag":""}</div></div></div>`; }
document.addEventListener("input",e=>{ if(e.target.id && e.target.id.startsWith("sc_")) scLiveUpdate(); });
document.addEventListener("click",async e=>{ const t=e.target.closest('[data-act^="sc20"]'); if(!t) return; e.preventDefault(); e.stopPropagation(); const a=t.dataset.act;
  if(a==="sc20"){ if(!S.readOnly) scModal(t.dataset.id); return; }
  if(a==="sc20-pick"){ const on=t.classList.contains("on"); t.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.remove("on")); if(!on) t.classList.add("on"); scLiveUpdate(); return; }
  const c=S.companies.get(t.dataset.id); if(!c) return; const by=await myName();
  if(a==="sc20-clear"){ confirmBox("Clear the scorecard?","All scores and reasons for this business are removed.","Clear",async()=>{ if(await dbUpdate("companies/"+c.id,{scorecard:{}})){ closeModal(); toast("Scorecard cleared"); try{ renderSheet(); }catch(_){} } }); return; }
  const inputs=scRead(); const s=scoreOf({scorecard:{inputs}}); t.disabled=true;
  const ok=await dbUpdate("companies/"+c.id,{scorecard:{inputs,total:s.total,verdict:s.verdict,by,d:today()}, log:[...(c.log||[]),{d:today(),by,type:"note",text:`Scorecard: ${s.total}/100 – ${VERD[s.verdict].l}${s.kill?" (EBIT below 10%)":""}${s.done<10?` · ${s.done} of 10 scored`:""}`}].slice(-200)});
  t.disabled=false; if(ok){ closeModal(); toast(`Scored ${s.total}/100 – ${VERD[s.verdict].l}`); try{ renderSheet(); }catch(_){} } },true);
document.addEventListener("keydown",e=>{ if(e.key==="Enter" && e.target.matches && e.target.matches(".sc20card")) e.target.click(); });
/* the score shows next to the business in lists and in the target meeting pipeline */
function scPill(c){ const s=c&&c.scorecard; if(!s||s.total==null||!s.inputs||!Object.keys(s.inputs).length) return ""; const v=VERD[s.verdict]||VERD.kill; return `<span class="pill scpill ${v.cls}">${s.total} · ${v.l}</span>`; }
{ const base=bizRow; bizRow=function(c){ const h=base(c); const p=scPill(c); if(!p) return h; const i=h.lastIndexOf("</span></span>"); return i<0? h : h.slice(0,i+14)+p+h.slice(i+14); }; }
