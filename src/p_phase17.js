/* ================= Phase 17: background & context, public profiles, map filters, business check-in report ================= */
const PROFILES=["Doctor / medical","Sportsperson","Artist","Influencer","Media personality","Academic"];
const PROFILE_PL={"Doctor / medical":"Doctors",Sportsperson:"Sports people",Artist:"Artists",Influencer:"Influencers","Media personality":"Media","Academic":"Academics"};
const CEO_RX=/\b(ceo|chief executive|managing director|md|group ceo|founder)\b/i;
const CSUITE_RX=/\b(ceo|cfo|coo|cto|cio|cmo|cro|chief|managing director|md|executive director|chair(man|person)?)\b/i;
function isCEO(k){ return CEO_RX.test([k.title,k.companyRole].join(" ")) || ((k.tags||[]).includes("A") && /owner|founder/i.test(k.companyRole||"")); }
function isCSuite(k){ return CSUITE_RX.test([k.title,k.companyRole].join(" ")); }
function bgFields(k){ const pr=k.profiles||[];
  return `<div class="fsec">Background & context</div>
  <p class="tag" style="margin:-4px 2px 8px">Optional. The more context here, the better the AI can find the right person later.</p>
  <div class="fields">
   <div class="fld"><label for="kEdu">Education</label><input id="kEdu" value="${esc(k.education||"")}" placeholder="e.g. BEng Stellenbosch; CA(SA); MBA GIBS"></div>
   ${fldNote("kBg","Career & backstory",k.background||"","e.g. Chemist at Sasol for 10 years, then engineer at ASML; actuary at PwC before starting his own firm",3)}
   <div class="fld"><label for="kPol">Public or political role</label><input id="kPol" value="${esc(k.publicRole||"")}" placeholder="e.g. Ward councillor, Stellenbosch; former MEC; serves on a state board"></div>
  </div>
  <div class="lbl" style="margin:10px 2px 6px">Public profile</div>
  <div class="rolechips">${PROFILES.map(p=>`<label><input type="checkbox" name="kProf" value="${esc(p)}" ${pr.includes(p)?"checked":""}><span>${esc(p)}</span></label>`).join("")}</div>`; }
function bgRead(){ if(!$("#kEdu")) return {}; return {education:$("#kEdu").value.trim(), background:$("#kBg").value.trim(), publicRole:$("#kPol").value.trim(), profiles:[...document.querySelectorAll("input[name=kProf]:checked")].map(x=>x.value)}; }
function bgHTML(k){ const pr=k.profiles||[]; if(!k.education && !k.background && !k.publicRole && !pr.length) return "";
  return `<div class="fsec">Background & context</div><div class="card box">
   ${pr.length?`<div class="sigs">${pr.map(p=>`<span class="pill">${esc(p)}</span>`).join("")}</div>`:""}
   ${k.education?`<div><span class="lbl">Education</span><br>${esc(k.education)}</div>`:""}
   ${k.background?`<div><span class="lbl">Career & backstory</span><div style="white-space:pre-wrap">${esc(k.background)}</div></div>`:""}
   ${k.publicRole?`<div><span class="lbl">Public or political role</span><br>${esc(k.publicRole)}</div>`:""}
  </div>`; }
/* AI + local search see the new context */
{ const base=askLine; askLine=function(k){ const extra=[k.education?`education: ${k.education}`:"", k.background?`background: ${k.background}`:"", k.publicRole?`public/political role: ${k.publicRole}`:"", (k.profiles||[]).length?`public profile: ${(k.profiles||[]).join(", ")}`:""].filter(Boolean).join("; ").replace(/\|/g,"/").replace(/\s+/g," ").slice(0,500); return base(k)+(extra?" | "+extra:""); }; }
{ const base=hayOf; hayOf=function(k){ const h=base(k); const x=[k.education,k.background,k.publicRole,(k.profiles||[]).join(" ")].join(" ").toLowerCase(); h.role+=" "+[(k.profiles||[]).join(" "),k.publicRole].join(" ").toLowerCase(); h.notes+=" "+x; return h; }; }
INTENTS.push(
 {keys:["athlete","athletes","sportsman","sportsmen","sportsperson","rugby","cricket","soccer","football","golfer","springbok"], groups:[["Sports people",["sportsperson","athlete","rugby","cricket","soccer","golf","springbok"]]]},
 {keys:["artist","artists","musician","singer","painter","influencer","influencers","celebrity","celebrities"], groups:[["Artists, influencers & media",["artist","influencer","media personality","musician","singer","painter"]]]},
 {keys:["political","politically","politician","politicians","government","councillor","minister","mec","mayor","municipality","public"], groups:[["Public & political roles",["councillor","minister","mec","mayor","government","political","public"]]]}
);
/* ---- Network map filters ---- */
S.netf=S.netf||{who:"",team:"",sector:""};
const NET_WHO=[["","Everyone"],["A","Owners"],["B","Employees"],["C","Potential hires"],["D","Great contacts"],["ceo","CEOs & MDs"],["csuite","C-suite"],["talent","Talent bench"],["hnwi","HNWI"],["pol","Public / political"],["pr:Sportsperson","Sports people"],["pr:Artist","Artists"],["pr:Influencer","Influencers"],["pr:Doctor / medical","Doctors"],["family","People with family links"]];
function netFilterOn(){ const f=S.netf; return !!(f.who||f.team||f.sector); }
function netKOK(k){ const f=S.netf;
  if(f.who){ const w=f.who; const ok= ["A","B","C","D"].includes(w)? hasTag(k,w) : w==="ceo"? isCEO(k) : w==="csuite"? isCSuite(k) : w==="talent"? isTalent(k) : w==="hnwi"? !!k.hnwi : w==="pol"? !!k.publicRole : w==="family"? familyOf(k).length>0 : w.startsWith("pr:")? (k.profiles||[]).includes(w.slice(3)) : true; if(!ok) return false; }
  if(f.team && !knowers(k).some(x=>x.partner===f.team)) return false;
  if(f.sector){ const co=companyOf(k); if(!String(k.industry||"").startsWith(f.sector) && !String(co?.industry||"").startsWith(f.sector)) return false; }
  return true; }
function netFilterUI(){ const f=S.netf; const n=contacts().filter(netKOK).length;
  return `<div class="netf"><select id="nfWho" aria-label="Show people">${NET_WHO.map(([v,l])=>`<option value="${v}"${f.who===v?" selected":""}>${l}</option>`).join("")}</select><select id="nfTeam" aria-label="Known by">${opts(S.partners,f.team,"Known by anyone")}</select><select id="nfSector" aria-label="Industry">${opts(SECTORS,f.sector,"Any industry")}</select></div>
  ${netFilterOn()?`<p class="tag" style="margin:-4px 2px 10px">${n} ${n===1?"person":"people"} match · <a href="#network" data-act="nf-clear">clear filters</a></p>`:""}`; }
document.addEventListener("change",e=>{ const id=e.target.id; if(id==="nfWho"||id==="nfTeam"||id==="nfSector"){ S.netf[{nfWho:"who",nfTeam:"team",nfSector:"sector"}[id]]=e.target.value; render(); setTimeout(()=>{ try{ netBuildGraph(); netCount(); netFit(true); }catch(_){} },120); } });
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act=nf-clear]"); if(t){ e.preventDefault(); S.netf={who:"",team:"",sector:""}; render(); } });
/* ---- Business check-in report ---- */
const isCheckinEntry=e=>e.type==="checkin" || /^(Checked in|🎉 Deal done|Sold to|Not for us any more)/.test(e.text||"");
function ciReportHTML(c){
  const H=[...(c.log||[])].filter(isCheckinEntry).reverse(); const last=H[0]; const d=dueInfo(c);
  return `<div class="fsec">Check-in report</div>
  <div class="card box">
   <div class="kvline"><span class="lbl">Last check-in</span><b>${last?`${esc(fmtD(last.d))}${last.by?` · ${esc(last.by)}`:""}`:"Not yet"}</b></div>
   ${last?`<div style="white-space:pre-wrap">${esc(last.text.replace(/^Checked in:?\s*/,""))}</div>`:`<div class="tag">Nobody has logged a check-in with ${esc(c.name)} yet.</div>`}
   <div class="kvline" style="margin-top:6px"><span class="lbl">Next follow-up</span><b>${c.nextCheckIn?esc(fmtD(c.nextCheckIn)):"Not set"}</b>${d?` <span class="pill ${d.cls}">${esc(d.txt)}</span>`:""}</div>
   ${c.checkInNote?`<div><b>Plan:</b> ${esc(c.checkInNote)}</div>`:""}
   <div class="tag">${respLine(c)}</div>
   ${S.readOnly?"":`<div class="acts" style="grid-template-columns:1fr 1fr"><button class="act dark" data-act="quick-checkin" data-id="${esc(c.id)}">${ic("check",18)}Log check-in</button><button class="act" data-act="ci-move" data-kind="c" data-id="${esc(c.id)}">${ic("cal",18)}Next follow-up</button></div>`}
  </div>
  ${H.length>1?`<details class="histd"><summary>${ic("history",16)} All check-ins (${H.length})</summary><div class="group log" style="margin-top:8px">${H.map(e=>`<div class="e"${logAttr(c,e)}><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div></details>`:""}`;
}
