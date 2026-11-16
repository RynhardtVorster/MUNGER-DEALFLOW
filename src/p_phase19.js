/* ================= Phase 19: works offline, real map, team emails, schedule target meetings ================= */

/* ---------- 1. Offline: read from the last copy on this phone, queue changes, sync when signal is back ---------- */
const OFF={q:"munger.outbox.v1", c:"munger.cache.v1:", u:"munger.uid"};
const WRITES=new Set(["insert","upsert","update","delete"]);
const CACHE_TABLES=new Set(["companies","contacts","settings","connections","commitments","meetings","person_links","members"]);
const offRead=k=>{ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(_){ return null; } };
const offWrite=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(_){ return false; } };
function outbox(){ return offRead(OFF.q)||[]; }
function setOutbox(L){ offWrite(OFF.q,L); offBadge(); }
function isNetErr(e){ if(!e) return false; const m=String(e.message||e.details||e); return (!e.code||e.code==="") && /fetch|network|load failed|timed? ?out|offline|internet/i.test(m); }
S.net=navigator.onLine;
function setNet(on){ if(S.net!==on){ S.net=on; offBadge(); } }
function offBadge(){
  if(!document.body) return; let el=document.getElementById("offBar"); const n=outbox().length; const off=!S.net||!navigator.onLine;
  if(!el){ el=document.createElement("button"); el.id="offBar"; el.type="button"; document.body.appendChild(el); el.addEventListener("click",()=>flushOutbox(true)); }
  el.hidden=!(off||n); el.className=off?"off":"sync";
  el.textContent= off? `Offline – you can keep working${n?` · ${n} change${n===1?"":"s"} will sync`:""}` : `${n} change${n===1?"":"s"} waiting to sync – tap to sync`;
}
const realFrom=sb.from.bind(sb);
function buildQ(table,chain){ let q=realFrom(table); for(const [m,a] of chain) q=q[m](...a); return q; }
const INSERT_DEFAULTS={meetings:{status:"open",notes:"",decisions:[],items:[],review:{},attendees:[],title:""}, commitments:{status:"open"}};
function prepChain(table,chain){
  if(table==="settings") return chain;
  return chain.map(([m,a])=>{ if(m!=="insert"&&m!=="upsert") return [m,a];
    const fix=r=>(r&&typeof r==="object"&&!r.id)?{...r,id:newId()}:r;
    return [m,[Array.isArray(a[0])?a[0].map(fix):fix(a[0]),...a.slice(1)]]; });
}
function applyLocal(table,chain){
  const op=chain.find(([m])=>WRITES.has(m)); if(!op) return; const [m,a]=op;
  const eqs=chain.filter(([x])=>x==="eq").map(([,args])=>args);
  const match=r=>eqs.every(([c,v])=>String(r[c])===String(v));
  const pk=table==="settings"?"key":"id"; const now=new Date().toISOString();
  const keys=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.startsWith(OFF.c+table+"|")) keys.push(k); }
  keys.forEach(k=>{ const c=offRead(k); if(!c||!Array.isArray(c.d)) return; let d=c.d;
    if(m==="insert"||m==="upsert"){ (Array.isArray(a[0])?a[0]:[a[0]]).forEach(row=>{ const j=d.findIndex(r=>row[pk]!=null && r[pk]===row[pk]); if(j>=0) d[j]={...d[j],...row,updated_at:now}; else d.push({...(m==="insert"?INSERT_DEFAULTS[table]:{}),created_at:now,updated_at:now,created_by:S.uid,...row}); }); }
    else if(m==="update") d=d.map(r=>match(r)?{...r,...a[0],updated_at:now}:r);
    else if(m==="delete") d=d.filter(r=>!match(r));
    offWrite(k,{t:table,d}); });
}
let offToldAt=0;
function queueOp(table,chain){
  const L=outbox(); L.push({table,chain,at:Date.now()}); setOutbox(L); applyLocal(table,chain);
  if(Date.now()-offToldAt>20000){ offToldAt=Date.now(); setTimeout(()=>toast("Saved on this phone – it syncs when you have signal"),50); }
  try{ reloadSoon(table); }catch(_){}
}
async function execChain(table,chain){
  const isW=chain.some(([m])=>WRITES.has(m));
  if(isW){
    chain=prepChain(table,chain);
    if(!navigator.onLine || outbox().length){ queueOp(table,chain); if(navigator.onLine) setTimeout(flushOutbox,200); return {data:null,error:null,status:202,statusText:"queued"}; }
    let r; try{ r=await buildQ(table,chain); }catch(e){ r={data:null,error:e}; }
    if(r && r.error && isNetErr(r.error)){ setNet(false); queueOp(table,chain); return {data:null,error:null,status:202,statusText:"queued"}; }
    if(r && !r.error) setNet(true);
    return r;
  }
  const key=OFF.c+table+"|"+JSON.stringify(chain);
  let r; try{ r=await buildQ(table,chain); }catch(e){ r={data:null,error:e}; }
  if(r && !r.error){ setNet(true); if(CACHE_TABLES.has(table) && chain[0]?.[0]==="select"){ let d=r.data; // keep changes still waiting to sync visible
      offWrite(key,{t:table,d}); if(outbox().some(o=>o.table===table)) { outbox().filter(o=>o.table===table).forEach(o=>applyLocal(table,o.chain)); const c=offRead(key); if(c) r={...r,data:c.d}; } }
    return r; }
  if(isNetErr(r?.error) || !navigator.onLine){ setNet(false); const c=offRead(key); if(c) return {data:c.d,error:null,status:200,cached:true}; }
  return r;
}
function mkQ(table,chain){ return new Proxy({}, {get(_,prop){ if(typeof prop==="symbol") return undefined; if(prop==="then") return (res,rej)=>execChain(table,chain).then(res,rej); return (...args)=>mkQ(table,[...chain,[prop,args]]); }}); }
sb.from=function(table){ return mkQ(table,[]); };

let flushing=false;
async function flushOutbox(manual){
  if(flushing) return; if(!outbox().length){ offBadge(); return; }
  if(!navigator.onLine){ if(manual) toast("Still no signal – your changes are safe on this phone"); return; }
  let sess=null; try{ sess=(await sb.auth.getSession())?.data?.session||null; }catch(_){}
  if(!sess){ if(manual) toast("Sign in again to sync your offline changes"); if(manual||S.offAuth) showLogin(true); return; }
  flushing=true; let done=0, failed=0;
  try{ for(;;){ const L=outbox(); if(!L.length) break; const op=L[0]; let r; try{ r=await buildQ(op.table,op.chain); }catch(e){ r={error:e}; }
      if(r && r.error && isNetErr(r.error)){ setNet(false); break; }
      if(r && r.error){ failed++; console.warn("Offline change could not be saved",r.error,op); } else done++;
      setOutbox(outbox().slice(1)); } }
  finally{ flushing=false; }
  if(done||failed){ setNet(true); toast(failed?`Synced ${done} offline change${done===1?"":"s"}. ${failed} couldn't be saved – please check and redo it.`:`Back online – ${done} change${done===1?"":"s"} synced`); if(S.me) reloadAll(); }
  offBadge();
}
function reloadAll(){ loadMembers(); loadCompanies(); loadContacts(); loadSettings(); loadConnections(); loadCommitments(); loadMeetings(); loadLinks(); }
window.addEventListener("online",()=>{ setNet(true); if(S.offAuth) offResume(); else { flushOutbox(); if(S.me) reloadAll(); } });
window.addEventListener("offline",()=>setNet(false));
setInterval(()=>{ if(outbox().length && navigator.onLine) flushOutbox(); },30000);
{ const _lm=loadMembers; loadMembers=async function(){ const keep=S.members; await _lm(); if(!S.members.length && keep.length){ S.members=keep; S.me=keep.find(m=>m.user_id===S.uid)||null; S.readOnly=!S.me; } }; }
{ const _sd=startData; startData=async function(){ await _sd(); offBadge(); flushOutbox(); }; }
async function offResume(){ let session=null; try{ session=(await sb.auth.getSession())?.data?.session||null; }catch(_){}
  if(session){ S.offAuth=false; S.session=session; S.uid=session.user.id; offWrite(OFF.u,S.uid); await startData(); } else showLogin(true); }
init=async function(){
  render(); offBadge();
  let session=null; try{ session=(await sb.auth.getSession())?.data?.session||null; }catch(_){}
  if(session){ S.session=session; S.uid=session.user.id; offWrite(OFF.u,S.uid); showLogin(false); startData(); return; }
  const uid=offRead(OFF.u);
  if(uid && !navigator.onLine){ S.uid=uid; S.offAuth=true; showLogin(false); startData(); return; }
  showLogin(true);
};
sb.auth.onAuthStateChange((ev,session)=>{ if(session?.user?.id){ offWrite(OFF.u,session.user.id); if(S.offAuth){ S.offAuth=false; } } });

/* ---------- 2. Team emails ---------- */
S.teamEmails=S.teamEmails||{}; S.meet=S.meet||{};
function teamEmail(p){ if(!p) return ""; const e=S.teamEmails[p]; if(e) return e; const f=String(p).toLowerCase().split(" ")[0];
  const m=S.members.find(x=>x.name && (x.name===p || x.name.toLowerCase().split(" ")[0]===f)); return m?.email||""; }
loadSettings=async function(){
  const {data}=await sb.from("settings").select("*"); if(!data && S.loaded.settings) return; const rows=data||[];
  const team=rows.find(r=>r.key==="team"); const p=team?.value?.partners; S.partners=Array.isArray(p)?p.filter(Boolean):[];
  const em=team?.value?.emails; S.teamEmails=(em&&typeof em==="object")?em:{};
  const ch=rows.find(r=>r.key==="channels"); if(ch && Array.isArray(ch.value?.list)) applyChannels(ch.value.list);
  const mt=rows.find(r=>r.key==="meeting"); S.meet={...(mt?.value||{})}; S.meetNext=S.meet.next||"";
  S.loaded.settings=true; queueRender();
};
{ const base=dbSet; dbSet=async function(path,data){ if(path==="settings/team" && data && !("emails" in data)) data={...data,emails:S.teamEmails||{}}; return base(path,data); }; }
{ const base=vSettings; vSettings=function(){ const admin=S.me?.is_admin;
  return base().replace(/<label for="p(\d+)">Team member (\d+)<\/label><input id="p\1" ([^>]*)>/g,(all,i,n,rest)=>{ const name=S.partners[+i]||"";
      return `<label for="p${i}">Team member ${n}</label><input id="p${i}" ${rest} placeholder="Name"><input id="pe${i}" type="email" inputmode="email" autocapitalize="off" autocomplete="off" placeholder="Email for meeting invites" value="${esc(teamEmail(name))}" style="margin-top:6px" ${admin?"":"disabled"} aria-label="Email for team member ${n}">`; })
    .replace(">Save team names<",">Save team names and emails<")
    .replace('<div class="fsec">Munger team</div>','<div class="fsec">Munger team</div><p class="tag" style="margin:0 2px 8px">Names and emails. The emails are used to send target-meeting invites.</p>'); }; }
document.addEventListener("click",async e=>{ const t=e.target.closest('[data-act="save-partners"]'); if(!t) return; e.preventDefault(); e.stopImmediatePropagation();
  const names=[], emails={}; for(let i=0;i<12;i++){ const n=$("#p"+i)?.value.trim(); if(!n) continue; names.push(n); const em=($("#pe"+i)?.value||"").trim().toLowerCase();
    if(em){ if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ toast(`Check the email for ${n}`); $("#pe"+i).focus(); return; } emails[n]=em; } }
  if(await dbSet("settings/team",{partners:names,emails})){ S.teamEmails=emails; toast("Team saved"); } },true);

/* ---------- 3. Schedule target meetings and send invites ---------- */
function meetSched(){ const M=S.meet||{}; const last=lastDone();
  if(M.next && (!last || M.next>last.held_on)) return {...M, scheduled:!!M.time||!!M.sentAt||!!M.place, overdue:daysUntil(M.next)<0};
  return {next:last?.next_date||(last?plus21(last.held_on):""), time:M.time, duration:M.duration, place:M.place, scheduled:false}; }
function liveTargets(){ return companies().filter(c=>isAcq(c) && ["target","active"].includes(grp(c))).sort((a,b)=>(grp(b)==="active")-(grp(a)==="active")||(a.name||"").localeCompare(b.name||"")); }
function meetWhenTxt(X){ return X.next? `${fmtD(X.next)}${X.time?` at ${X.time}`:""}` : ""; }
function relTxt(s){ const d=daysUntil(s); return d===null?"":d<0?`${-d} days overdue`:d===0?"today":d===1?"tomorrow":`in ${d} days`; }
function nextMeetCard(){ const X=meetSched(); if(!X.next && S.readOnly) return "";
  const sub=[X.next?relTxt(X.next):"", X.scheduled?(X.place||""):(X.next?"Suggested date – not scheduled yet":""), X.scheduled?(X.sentAt?"Invites sent":"Invites not sent"):""].filter(Boolean).join(" · ");
  return `<div class="card box nextmeet2"><a href="#meeting" class="nm-main"><span class="lbl">${ic("flag",15)} Next target meeting</span><b>${esc(X.next?meetWhenTxt(X):"Not scheduled yet")}</b>${sub?`<span class="tag">${esc(sub)}</span>`:""}</a>${S.readOnly?"":`<button class="btn sm ${X.scheduled&&X.sentAt?"":"primary"}" data-act="m19-sched">${ic("cal",16)} ${X.scheduled?"Edit or invite":"Schedule"}</button>`}</div>`; }
{ const base=targetsBlock; targetsBlock=function(mine){ let h=base(mine).replace(/<a class="card box nextmeet"[\s\S]*?<\/a>/,""); const i=h.indexOf("</div>"); return h.slice(0,i+6)+nextMeetCard()+h.slice(i+6); }; }
{ const base=meetHome; meetHome=function(){ const X=meetSched();
  const block=`<div class="schedbox">${X.scheduled?`<div><b>${esc(meetWhenTxt(X))}</b> · ${esc(String(X.duration||60))} min${X.place?` · ${esc(X.place)}`:""}</div><div class="tag">${X.sentAt?`Invites sent ${esc(fmtD(X.sentAt.slice(0,10)))}`:"Invites not sent yet"}${(X.targets||[]).length?` · ${X.targets.length} target${X.targets.length===1?"":"s"} on the agenda`:""}</div>`:`<div class="tag">${X.next?`Suggested: ${esc(fmtD(X.next))}. Pick a time and send the invites.`:"Pick a date and time and send the invites."}</div>`}
    <button class="btn ${X.scheduled?"":"primary"} block" data-act="m19-sched">${ic("cal",18)} ${X.scheduled?"Change meeting or resend invites":"Schedule meeting & invite the team"}</button></div>`;
  return base().replace(/<div class="fields" style="margin-top:6px"><div class="fld"><label for="m8Next">[\s\S]*?<\/div><\/div>/,block); }; }
{ const base=meetRun; meetRun=function(m){ const h=base(m); const M=S.meet||{}; const near=M.next && Math.abs((parseD(M.next)-parseD(m.held_on))/864e5)<=10;
  if(!near || !((M.targets||[]).length||M.agenda)) return h;
  const T=(M.targets||[]).map(id=>S.companies.get(id)).filter(Boolean);
  const card=`<div class="card box agenda19"><div class="lbl">Agenda for today</div>${M.agenda?`<div style="white-space:pre-wrap">${esc(M.agenda)}</div>`:""}${T.length?`<div class="lbl" style="margin-top:6px">Targets to discuss</div><div class="sigs">${T.map(c=>`<button class="pill" data-open="${esc(c.id)}">${esc(c.name)}</button>`).join("")}</div>`:""}</div>`;
  return h.replace('<div class="lbl" style="margin:12px 4px 6px">Who\'s here?',card+'<div class="lbl" style="margin:12px 4px 6px">Who\'s here?'); }; }
saveNextMeeting=async function(d,quiet){ const keep=S.meet||{}; const M={next:d||"", time:keep.time||"", duration:keep.duration||60, place:keep.place||""};
  const {error}=await sb.from("settings").upsert({key:"meeting", value:M}); if(error){ writeErr(error); return; } S.meet=M; S.meetNext=M.next;
  if(!quiet){ toast(d?`Next meeting set for ${fmtD(d)}`:"Next meeting cleared"); queueRender(); } };

function schedModal(){
  const X=meetSched(); const M=S.meet||{}; const date=X.next && daysUntil(X.next)>=0? X.next : addDays(21);
  const T=liveTargets(); const pick=new Set(X.scheduled&&Array.isArray(M.targets)? M.targets : T.map(c=>c.id));
  const who=new Set(Array.isArray(M.invitees)&&M.invitees.length? M.invitees : S.partners);
  showModal(`${ovHead("Schedule target meeting",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <div class="fields">
    <div class="fld"><label for="sDate">Date</label><input type="date" id="sDate" value="${esc(date)}" min="${esc(today())}"></div>
    <div class="fld"><label for="sTime">Time</label><input type="time" id="sTime" value="${esc(M.time||"09:00")}" step="900"></div>
    <div class="fld"><label for="sDur">How long</label><select id="sDur">${[30,45,60,90,120].map(n=>`<option value="${n}" ${Number(M.duration||60)===n?"selected":""}>${n<60?n+" min":n===60?"1 hour":n===90?"1½ hours":"2 hours"}</option>`).join("")}</select></div>
    <div class="fld"><label for="sPlace">Where</label><input id="sPlace" value="${esc(M.place||"")}" placeholder="Office address, or a Teams, Zoom or Meet link"></div>
   </div>
   <div class="lbl" style="margin:14px 4px 6px">Invite</div>
   <div class="group">${S.partners.map(p=>{ const em=teamEmail(p); return `<label class="rowi chk19"><input type="checkbox" name="sWho" value="${esc(p)}" ${who.has(p)&&em?"checked":""} ${em?"":"disabled"}><span class="main"><span class="t1" style="display:block">${esc(p)}</span><span class="t2" style="display:block">${esc(em||"No email yet – add it in Team & settings")}</span></span></label>`; }).join("")}</div>
   <div class="lbl" style="margin:14px 4px 6px">Targets to discuss</div>
   ${T.length?`<div class="rolechips">${T.map(c=>`<label><input type="checkbox" name="sT" value="${esc(c.id)}" ${pick.has(c.id)?"checked":""}><span>${esc(c.name)}</span></label>`).join("")}</div>`:`<p class="tag" style="margin:0 4px">No targets yet. Prospects you promote will show here.</p>`}
   <div class="fields" style="margin-top:12px"><div class="fld"><label for="sAgenda">Anything else on the agenda</label><textarea id="sAgenda" rows="3" placeholder="e.g. Hatstone pipeline; financing for SuperB Maize">${esc(X.scheduled?(M.agenda||""):"")}</textarea></div></div>
   <p class="tag" style="margin:8px 4px 0">The invite lists last time's open actions, the targets above and your notes.</p>
   <div style="margin-top:14px;display:grid;gap:10px"><button class="btn primary block" data-act="m19-save" data-k="invite">${ic("send",18)} Save & send invites</button><button class="btn block" data-act="m19-save" data-k="save">Save without inviting</button></div></div>`, true);
}
function schedRead(){ const d=$("#sDate").value; if(!d){ toast("Pick a date"); return null; }
  return {next:d, time:$("#sTime").value||"09:00", duration:Number($("#sDur").value)||60, place:$("#sPlace").value.trim(), agenda:$("#sAgenda").value.trim(),
    targets:[...document.querySelectorAll('input[name=sT]:checked')].map(x=>x.value), invitees:[...document.querySelectorAll('input[name=sWho]:checked')].map(x=>x.value)}; }
function inviteBody(M){
  const T=(M.targets||[]).map(id=>S.companies.get(id)?.name).filter(Boolean); const open=S.commitments.filter(x=>x.status==="open").length;
  return ["Munger target meeting","","Agenda",`1. Last time's actions (${open} open)`,`2. Targets${T.length?": "+T.join(", "):""}`,"3. New prospects – which become targets",`4. Discussion${M.agenda?": "+M.agenda:""}`,"5. New actions and the next meeting","",
    M.place?`Where: ${M.place}`:"", `Open the meeting in the Munger app: ${location.origin+location.pathname}#meeting`].filter(Boolean).join("\n").replace("\nAgenda","\n\nAgenda").replace(/\n(Where|Open)/,"\n\n$1"); }
function meetTimes(M){ const s=new Date(`${M.next}T${M.time||"09:00"}:00`); const e=new Date(s.getTime()+(Number(M.duration)||60)*60000); return {s,e}; }
const utcStamp=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
function inviteLinks(M){
  const {s,e}=meetTimes(M); const emails=(M.invitees||[]).map(teamEmail).filter(Boolean); const mine=(S.me?.email||"").toLowerCase();
  const others=emails.filter(x=>x.toLowerCase()!==mine); const title="Munger target meeting"; const body=inviteBody(M); const enc=encodeURIComponent;
  return {emails:others, title, body,
    google:`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${utcStamp(s)}/${utcStamp(e)}&details=${enc(body)}&location=${enc(M.place||"")}${others.length?`&add=${enc(others.join(","))}`:""}`,
    outlook:`https://outlook.office.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject=${enc(title)}&startdt=${enc(s.toISOString())}&enddt=${enc(e.toISOString())}&location=${enc(M.place||"")}&body=${enc(body)}${others.length?`&to=${enc(others.join(","))}`:""}`,
    mail:`mailto:${others.map(enc).join(",")}?subject=${enc(`${title} – ${fmtD(M.next)} at ${M.time}`)}&body=${enc(`${fmtD(M.next)} at ${M.time} (${M.duration} min)\n\n${body}`)}`}; }
function icsText(M){
  const {s,e}=meetTimes(M); const L=inviteLinks(M); const esc2=t=>String(t||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/([,;])/g,"\\$1");
  const fold=line=>{ const out=[]; let x=line; while(x.length>73){ out.push(x.slice(0,73)); x=" "+x.slice(73); } out.push(x); return out.join("\r\n"); };
  const me=S.me; const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Munger//Deal Flow//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:munger-target-${M.next.replace(/-/g,"")}@munger-dealflow`,`DTSTAMP:${utcStamp(new Date())}`,`DTSTART:${utcStamp(s)}`,`DTEND:${utcStamp(e)}`,
    `SUMMARY:${esc2(L.title)}`, M.place?`LOCATION:${esc2(M.place)}`:"", `DESCRIPTION:${esc2(L.body)}`,
    me?.email?`ORGANIZER;CN=${esc2(me.name||me.email)}:mailto:${me.email}`:"",
    ...(M.invitees||[]).map(p=>teamEmail(p)?`ATTENDEE;CN=${esc2(p)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${teamEmail(p)}`:""),
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Munger target meeting","TRIGGER:-PT1H","END:VALARM","END:VEVENT","END:VCALENDAR"].filter(Boolean);
  return lines.map(fold).join("\r\n")+"\r\n"; }
function inviteModal(){ const M=S.meet; if(!M?.next) return; const L=inviteLinks(M);
  showModal(`${ovHead("Send the invites",`<button class="hbtn" data-act="close-modal">Done</button>`)}<div class="ovb">
   <p style="margin:0 2px 10px;font-size:15.5px"><b>${esc(meetWhenTxt(M))}</b> · ${esc(String(M.duration))} min${M.place?` · ${esc(M.place)}`:""}</p>
   <p class="tag" style="margin:0 2px 12px">${L.emails.length?`Inviting ${esc((M.invitees||[]).filter(p=>teamEmail(p).toLowerCase()!==(S.me?.email||"").toLowerCase()).join(", "))}. Open your calendar below – the team is already added; just tap Save or Send.`:"Nobody to invite yet: add team emails in Team & settings."}</p>
   <div style="display:grid;gap:10px">
    <a class="btn primary block" href="${esc(L.outlook)}" target="_blank" rel="noopener" data-act="m19-sent">Outlook / Microsoft 365</a>
    <a class="btn block" href="${esc(L.google)}" target="_blank" rel="noopener" data-act="m19-sent">Google Calendar</a>
    <button class="btn block" data-act="m19-ics">${ic("cal",18)} iPhone / other calendar (invite file)</button>
    <a class="btn block" href="${esc(L.mail)}" data-act="m19-sent">${ic("mail",18)} Email the team the details</a>
   </div>
   <p class="tag" style="margin:12px 2px 0">The invite file opens in your phone's calendar, or share it to Mail or WhatsApp. Everyone also sees the meeting on Today in the app.</p></div>`, true);
}
async function markSent(){ if(S.meet?.sentAt) return; const M={...S.meet, sentAt:new Date().toISOString()}; S.meet=M; await sb.from("settings").upsert({key:"meeting", value:M}); queueRender(); }
document.addEventListener("click",async e=>{ const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="m19-sched"){ e.preventDefault(); e.stopPropagation(); if(!S.readOnly) schedModal(); }
  if(a==="m19-save"){ e.preventDefault(); const M=schedRead(); if(!M) return; const old=S.meet||{}; const same=old.next===M.next && old.time===M.time; if(same && old.sentAt) M.sentAt=old.sentAt;
    t.disabled=true; const {error}=await sb.from("settings").upsert({key:"meeting", value:M}); t.disabled=false; if(error){ writeErr(error); return; }
    S.meet=M; S.meetNext=M.next; queueRender(); toast(`Target meeting set for ${fmtD(M.next)} at ${M.time}`); if(t.dataset.k==="invite") inviteModal(); else closeModal(); }
  if(a==="m19-sent"){ setTimeout(markSent,300); }
  if(a==="m19-ics"){ e.preventDefault(); const M=S.meet; const name=`Munger target meeting ${M.next}.ics`; const file=new File([icsText(M)],name,{type:"text/calendar"});
    if(navigator.canShare && navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file],title:"Munger target meeting",text:`${fmtD(M.next)} at ${M.time}`}); markSent(); return; }catch(err){ if(err && err.name==="AbortError") return; } }
    const u=URL.createObjectURL(file); const x=document.createElement("a"); x.href=u; x.download=name; document.body.appendChild(x); x.click(); setTimeout(()=>{ URL.revokeObjectURL(u); x.remove(); },800); markSent(); }
});

/* ---------- 4. A real map: street map with satellite option, numbered dots, tap for who's there ---------- */
const TILESETS=[
  {name:"Map", url:"https://tile.openstreetmap.org/{z}/{x}/{y}.png", o:{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}},
  {name:"Light", url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", o:{maxZoom:19,subdomains:"abcd",attribution:'&copy; OpenStreetMap &copy; CARTO'}},
  {name:"Satellite", url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", o:{maxZoom:18,attribution:'Imagery &copy; Esri'}}
];
function townGroups(){ const m=new Map();
  const bump=(t,id)=>{ const g=gazFind(t); if(!g) return; if(!m.has(g.name)) m.set(g.name,{g,ids:new Set()}); m.get(g.name).ids.add(id); };
  contacts().forEach(k=>{ bump(k.town,"k"+k.id); const co=companyOf(k); if(co) bump(co.town,"k"+k.id); });
  companies().forEach(c=>bump(c.town,"c"+c.id));
  const hays=[...contacts().map(k=>["k"+k.id,recHay(k,true)]),...companies().map(c=>["c"+c.id,recHay(c,false)])];
  GAZ.forEach(g=>{ const terms=townAliases(g.name); hays.forEach(([id,h])=>{ const hl=lc(h); if(terms.some(t=>hl.includes(t)) && mentionHit(h,terms)){ if(!m.has(g.name)) m.set(g.name,{g,ids:new Set()}); m.get(g.name).ids.add(id); } }); });
  return [...m.values()].map(x=>({g:x.g,ids:[...x.ids],n:x.ids.size}));
}
function townPopup(p){ const recs=p.ids.map(id=>id[0]==="k"?{t:"k",r:S.contacts.get(id.slice(1))}:{t:"c",r:S.companies.get(id.slice(1))}).filter(x=>x.r);
  const ppl=recs.filter(x=>x.t==="k"), cos=recs.filter(x=>x.t==="c");
  const row=x=>x.t==="k"?`<button class="pop-row" data-contact="${esc(x.r.id)}">${esc(x.r.name)}<span>${esc(x.r.title||roleAt?.(x.r,companyOf(x.r))||"")}</span></button>`:`<button class="pop-row" data-open="${esc(x.r.id)}">${esc(x.r.name)}<span>${esc(isPartnerCo(x.r)?(PKINDS[x.r.kind]||"Partner"):x.r.kind==="other"?"Network company":isAcq(x.r)&&["target","active"].includes(grp(x.r))?"Target":"Prospect")}</span></button>`;
  const L=[...ppl,...cos]; return `<div class="pop19"><b>${esc(p.g.name)}</b><div class="tag">${ppl.length} people · ${cos.length} companies</div>${L.slice(0,6).map(row).join("")}<button class="btn sm primary" data-act="pl-town" data-k="${esc(p.g.name)}" style="margin-top:6px;width:100%">See all ${p.n} and why</button></div>`; }
let PLEL=null;
function plMarkers(map){
  if(map._munLayer){ map.removeLayer(map._munLayer); } const grpL=L.layerGroup().addTo(map); map._munLayer=grpL;
  const pts=townGroups();
  pts.forEach(p=>{ const sel=S.pl.mode==="town" && lc(S.pl.val)===lc(p.g.name); const s=Math.round(24+Math.min(22,p.n*2.5));
    const icon=L.divIcon({className:"mdot-wrap",html:`<div class="mdot${sel?" sel":""}" style="width:${s}px;height:${s}px">${p.n}</div>`,iconSize:[s,s],iconAnchor:[s/2,s/2]});
    const mk=L.marker([p.g.lat,p.g.lng],{icon,title:`${p.g.name}: ${p.n}`,riseOnHover:true}).addTo(grpL);
    mk.bindPopup(()=>townPopup(p),{maxWidth:260,minWidth:200,autoPanPadding:[20,20]}); });
  return pts;
}
initPlacesMap=function(){
  const ph=document.getElementById("plMap"); if(!ph || typeof L==="undefined") return;
  if(PLMAP && PLEL){ if(ph!==PLEL) ph.replaceWith(PLEL); setTimeout(()=>{ try{ PLMAP.invalidateSize(); }catch(_){} },30); plMarkers(PLMAP); return; }
  const map=L.map(ph,{zoomControl:true,attributionControl:true,zoomAnimation:true,fadeAnimation:true,markerZoomAnimation:true,tap:false,worldCopyJump:true}); PLMAP=map; PLEL=ph;
  const layers=TILESETS.map(t=>L.tileLayer(t.url,t.o));
  let cur=0, loaded=false, errs=0; layers[0].addTo(map);
  const watch=(ly,i)=>{ ly.on("tileload",()=>{ loaded=true; ph.classList.remove("notiles"); }); ly.on("tileerror",()=>{ if(loaded||i!==cur) return; if(++errs>=4){ errs=0; if(cur<layers.length-1){ map.removeLayer(layers[cur]); cur++; layers[cur].addTo(map); } else ph.classList.add("notiles"); } }); };
  layers.forEach(watch);
  L.control.layers(Object.fromEntries(TILESETS.map((t,i)=>[t.name,layers[i]])),null,{position:"topright"}).addTo(map);
  map.on("baselayerchange",ev=>{ cur=layers.indexOf(ev.layer); });
  const pts=plMarkers(map);
  if(S.pl.center) map.setView(S.pl.center,S.pl.zoom||5);
  else if(pts.length>1) map.fitBounds(L.latLngBounds(pts.map(p=>[p.g.lat,p.g.lng])).pad(.25),{maxZoom:9});
  else if(pts.length===1) map.setView([pts[0].g.lat,pts[0].g.lng],9);
  else map.setView([-29,24.5],5);
  map.on("moveend",()=>{ S.pl.center=map.getCenter(); S.pl.zoom=map.getZoom(); });
  setTimeout(()=>{ if(PLMAP===map) try{ map.invalidateSize(); }catch(_){} },60);
  if(!navigator.onLine) ph.classList.add("notiles");
};
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="pl-town"]'); if(!t) return; e.preventDefault(); if(PLMAP) PLMAP.closePopup(); S.pl={...S.pl,mode:"town",val:t.dataset.k}; render(); setTimeout(()=>document.querySelector(".plpick")?.scrollIntoView({behavior:"smooth",block:"start"}),60); });

/* ---------- 5. Better check-in logging: how we spoke, quick next dates, reach them from the log screen ---------- */
const CI_HOW=["Call","WhatsApp","Meeting","Email","Coffee / lunch","Event"];
const CI_WHEN=[["Tomorrow",1],["2 days",2],["1 week",7],["2 weeks",14],["1 month",30],["3 months",91],["6 months",182]];
function ciReach(rec,isK){ const p= isK? rec : (bizContact(rec)||rec.owners?.[0]||{}); const cell=p.cell||(p.cells||[])[0]?.v||""; const mail=p.email||(p.emails||[])[0]?.v||"";
  const nm=p.name&&p.name!==rec.name?` ${esc(p.name.split(" ")[0])}`:"";
  return (cell||mail)?`<div class="ci19reach">${cell?`<a class="btn sm" href="tel:${esc(cell)}">${ic("phone",16)} Call${nm}</a>`:""}${cell&&waHref(cell)?`<a class="btn sm" href="${esc(waHref(cell))}" target="_blank" rel="noopener">${ic("wa",16)} WhatsApp</a>`:""}${mail?`<a class="btn sm" href="mailto:${esc(mail)}">${ic("mail",16)} Email</a>`:""}</div>`:""; }
function ciEnhance(rec,isK){ const ov=document.querySelector("#modal .ovb"); if(!ov||ov.querySelector(".ci19how")) return;
  const fields=ov.querySelector(".fields"); if(!fields) return;
  fields.insertAdjacentHTML("beforebegin",`${ciReach(rec,isK)}<div class="lbl" style="margin:4px 4px 6px">How did you connect?</div><div class="chips ci19how">${CI_HOW.map(h=>`<button type="button" class="chip" data-act="ci19-how" data-k="${esc(h)}">${esc(h)}</button>`).join("")}</div>`);
  const dateFld=isK? ov.querySelector("#qkNext")?.closest(".fld") : ov.querySelector("#qCad")?.closest(".fld");
  if(dateFld) dateFld.insertAdjacentHTML("beforebegin",`<div class="ci19when"><div class="lbl" style="margin:2px 4px 6px">Next check-in</div><div class="chips">${CI_WHEN.map(([l,n])=>`<button type="button" class="chip" data-act="ci19-when" data-k="${addDays(n)}">${l}</button>`).join("")}</div></div>`); }
{ const b=quickCheckin; quickCheckin=function(id){ b(id); const c=S.companies.get(id); if(c) ciEnhance(c,false); }; }
{ const b=ciDoneModal; ciDoneModal=function(id){ b(id); const k=S.contacts.get(id); if(k) ciEnhance(k,true); }; }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="ci19-how"){ e.preventDefault(); const on=!t.classList.contains("on"); t.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.remove("on")); if(on) t.classList.add("on"); }
  if(a==="ci19-when"){ e.preventDefault(); t.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===t)); const d=t.dataset.k;
    if($("#qDate")){ $("#qDate").value=d; const o=$("#qOut"); if(o && o.value!=="keep"){ o.value="keep"; o.dispatchEvent(new Event("change",{bubbles:true})); } }
    if($("#qkNext")){ const s=$("#qkNext"); s.value="date"; s.dispatchEvent(new Event("change",{bubbles:true})); if($("#qkDate")) $("#qkDate").value=d; $("#qkDateW")&&( $("#qkDateW").hidden=false ); $("#qkTodoW")&&( $("#qkTodoW").hidden=false ); } }
},true);
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="do-checkin2"],[data-act="k-ci-log"]'); if(!t) return;
  const how=document.querySelector(".ci19how .chip.on")?.dataset.k; if(!how) return; const n=$("#qNote")||$("#qkNote"); if(!n || n.dataset.ci19) return;
  n.value= n.value.trim()? `${how}: ${n.value.trim()}` : how; n.dataset.ci19="1"; },true);

/* ---------- 6. No contact import, anywhere ---------- */
vImport=function(){ setTimeout(()=>{ if(location.hash==="#import") location.hash="people"; },0); return ""; };

/* ---------- 7. Mail lists: nothing pre-selected, All / Afrikaans / English ---------- */
S.lists={lang:"all", groups:[], sector:"", includeContacts:true, tiers:[]};
listRows=function(){
  const L=S.lists; const rows=[]; const any=!L.groups.length && !L.tiers.length;
  const langOK=l=> L.lang==="all" || l===L.lang || l==="both";
  if(any || L.groups.length) companies().forEach(c=>{ if(!isAcq(c)) return; const g=stageOf(c.status).group; if(!any && !L.groups.includes(g)) return;
    (c.owners||[]).forEach(o=>{ const lang=o.language||c.language; if(!langOK(lang)) return; if(!o.email&&!o.cell) return; rows.push({name:o.name,email:o.email||"",cell:o.cell||"",org:c.name,kind:"Business owner",lang}); }); });
  if(any || L.tiers.length) contacts().forEach(k=>{ if(k.doNotContact) return; if(!any && !tagsOf(k).some(t=>L.tiers.includes(t))) return; if(!langOK(k.language)) return;
    const email=k.email||(k.emails||[])[0]?.v||"", cell=k.cell||(k.cells||[])[0]?.v||""; if(!email&&!cell) return;
    rows.push({name:k.name,email,cell,org:companyOf(k)?.name||k.firm||"",kind:`${tierOf(k)} · ${k.type||TIERS[tierOf(k)]?.label||"Contact"}`,lang:k.language}); });
  const seen=new Set(); return rows.filter(r=>{ const key=(r.email||r.cell).toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true; }).sort((a,b)=>a.name.localeCompare(b.name));
};
vLists=function(){
  const L=S.lists; const rows=listRows(); const emails=rows.filter(r=>r.email); const any=!L.groups.length&&!L.tiers.length;
  const gchip=(k,l)=>`<button class="chip ${L.groups.includes(k)?"on":""}" data-act="l-group" data-k="${k}">${l}</button>`;
  return `<div class="ph"><div><h1>Mail lists</h1><p>Start with everyone, then narrow it down if you need to.</p></div></div>
  <div class="seg3" role="radiogroup">${[["all","All languages"],["af","Afrikaans"],["en","English"]].map(([v,l])=>`<label><input type="radio" name="lLang" value="${v}" ${L.lang===v?"checked":""}><span>${l}</span></label>`).join("")}</div>
  <div class="chips" style="margin-top:10px"><button class="chip ${any?"on":""}" data-act="l-all">Everyone</button></div>
  <div class="sec" style="margin-top:6px"><h2>Only business owners of</h2></div>
  <div class="chips">${gchip("network","Prospects")}${gchip("target","Targets")}${gchip("active","In discussions")}${gchip("won","Acquired")}${gchip("closed","Not for us")}</div>
  <div class="sec" style="margin-top:0"><h2>Only people tagged</h2></div>
  <div class="chips">${["A","B","C","D"].map(t=>`<button class="chip ${L.tiers.includes(t)?"on":""}" data-act="l-tier" data-k="${t}">${t} · ${esc(TIERS[t].label)}</button>`).join("")}</div>
  <div class="stats"><div class="stat"><span class="n">${rows.length}</span><span class="l">Recipients</span></div><div class="stat"><span class="n">${emails.length}</span><span class="l">With email</span></div><div class="stat"><span class="n">${rows.filter(r=>r.cell).length}</span><span class="l">With cell</span></div></div>
  <div class="acts" style="margin-top:12px"><button class="act" data-act="copy-emails" ${emails.length?"":"disabled"}>${ic("mail",18)}Emails</button><button class="act" data-act="copy-cells">${ic("phone",18)}Cells</button><button class="act dark" data-act="export-list">${ic("dl",18)}CSV</button></div>
  <p class="tag" style="margin:8px 4px 0">People marked Do not contact are always left out.</p>
  <div class="sec"><h2>Recipients</h2></div>
  ${rows.length?`<div class="group tbl-list">${rows.slice(0,400).map(r=>`<div class="rowi"><span class="main"><span class="t1" style="display:block">${esc(r.name)}</span><span class="t2" style="display:block">${esc([r.org,r.email||r.cell,r.lang==="af"?"Afrikaans":r.lang==="en"?"English":r.lang==="both"?"Both":""].filter(Boolean).join(" · "))}</span></span><span class="pill">${esc(r.kind.split(" · ")[0])}</span></div>`).join("")}${rows.length>400?`<div class="rowi tag">…and ${rows.length-400} more in the CSV</div>`:""}</div>`:`<div class="card empty">Nobody on this list yet.</div>`}`;
};
document.addEventListener("change",e=>{ if(e.target.name==="lLang"){ S.lists.lang=e.target.value; render(); } });
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="l-all"],[data-act="export-list"]'); if(!t) return;
  if(t.dataset.act==="l-all"){ S.lists.groups=[]; S.lists.tiers=[]; render(); return; }
  e.preventDefault(); e.stopImmediatePropagation(); const L=S.lists;
  download(`munger-mail-list-${L.lang==="af"?"afrikaans":L.lang==="en"?"english":"all"}-${today()}.csv`, [["Name","Organisation","Type","Email","Cell","Language"], ...listRows().map(r=>[r.name,r.org,r.kind,r.email,r.cell,LANGS[r.lang]||r.lang||""])]); },true);

/* ---------- 8. Search inside every long dropdown (people, companies, partners) ---------- */
const ssNorm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const ssSpecial=v=>!v || /^_|^\+|^new$/i.test(v);
function ssFilter(sel,inp){
  const q=ssNorm(inp.value).trim(); const words=q.split(/\s+/).filter(Boolean);
  if(!sel._ssOrig) sel._ssOrig=[...sel.childNodes].map(n=>n.cloneNode(true));
  const cur=sel.value; sel.innerHTML="";
  if(!words.length){ sel._ssOrig.forEach(n=>sel.appendChild(n.cloneNode(true))); sel._ssOrig=null; sel.value=cur; inp.classList.remove("nohit"); return; }
  let first=null, hits=0;
  const keep=(o,grp)=>{ const v=o.value; if(ssSpecial(v) || v===cur) return true; const hay=ssNorm(o.textContent+" "+(grp||"")); return words.every(w=>hay.includes(w)); };
  sel._ssOrig.forEach(n=>{
    if(n.tagName==="OPTGROUP"){ const g=n.cloneNode(false); [...n.children].forEach(o=>{ if(keep(o,n.label)){ g.appendChild(o.cloneNode(true)); if(!ssSpecial(o.value)){ hits++; first=first||o.value; } } }); if(g.children.length) sel.appendChild(g); }
    else if(n.tagName==="OPTION"){ if(keep(n)){ sel.appendChild(n.cloneNode(true)); if(!ssSpecial(n.value) && n.value!==cur){ hits++; first=first||n.value; } else if(n.value===cur && cur && words.every(w=>ssNorm(n.textContent).includes(w))){ hits++; first=first||n.value; } } }
  });
  inp.classList.toggle("nohit",!hits);
  const want=first||cur; if(want!==undefined){ sel.value=want; if(want!==cur) sel.dispatchEvent(new Event("change",{bubbles:true})); }
}
function ssEnhance(root){
  (root||document).querySelectorAll("select:not([data-ss])").forEach(sel=>{
    const n=sel.querySelectorAll("option").length; if(n<=20 || sel.disabled || sel.id==="famA" || sel.id==="famB") return; sel.dataset.ss="1";
    const inp=document.createElement("input"); inp.type="search"; inp.className="ss-input"; inp.autocomplete="off"; inp.setAttribute("autocapitalize","off");
    const lab=sel.id && document.querySelector(`label[for="${sel.id}"]`)?.textContent; inp.placeholder=`Search ${n-1} – type to find…`; inp.setAttribute("aria-label",`Search ${lab||"the list"}`);
    sel.parentNode.insertBefore(inp,sel); inp.addEventListener("input",()=>ssFilter(sel,inp));
    inp.addEventListener("keydown",ev=>{ if(ev.key==="Enter"){ ev.preventDefault(); inp.blur(); } });
  });
}
new MutationObserver(muts=>{ for(const m of muts) for(const n of m.addedNodes){ if(n.nodeType===1 && (n.tagName==="SELECT" || n.querySelector?.("select"))){ requestAnimationFrame(()=>ssEnhance()); return; } } }).observe(document.body,{childList:true,subtree:true});

/* ---------- 9. Admin (and the author) can correct or remove notes and check-ins ---------- */
function canEditLog(e){ if(S.readOnly) return false; if(S.me?.is_admin) return true; const me=(S.me?.name||"").toLowerCase(); return !!me && String(e?.by||"").toLowerCase().split(" ")[0]===me.split(" ")[0]; }
function logAttr(rec,e){ if(!rec||!e||!canEditLog(e)) return ""; const i=(rec.log||[]).indexOf(e); if(i<0) return "";
  const kind=S.companies.has(rec.id)?"c":"k"; return ` data-act="log-edit" data-kind="${kind}" data-id="${esc(rec.id)}" data-i="${i}" role="button" tabindex="0" title="Tap to edit"`; }
function logEditModal(kind,id,i){ const rec=kind==="c"?S.companies.get(id):S.contacts.get(id); const e=rec?.log?.[i]; if(!e) return;
  const by=[...new Set([...S.partners,e.by].filter(Boolean))];
  showModal(`${ovHead("Edit note",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 10px;font-size:15px"><b>${esc(rec.name)}</b></p>
   <div class="fields">
    <div class="fld"><label for="leDate">Date</label><input type="date" id="leDate" value="${esc(e.d||today())}"></div>
    <div class="fld"><label for="leBy">Who in our team</label><select id="leBy">${opts(by,e.by||"")}</select></div>
    ${fldNote("leText","What happened",String(e.text||"").replace(/^Checked in:?\s*/,""),"",5)}
   </div>
   <p class="tag" style="margin:8px 4px 0">The correction is recorded in the edit history.</p>
   <div style="margin-top:14px;display:grid;gap:10px"><button class="btn primary block" data-act="log-save" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">Save</button><button class="linkbtn" style="color:var(--bad,#b3261e)" data-act="log-del" data-kind="${kind}" data-id="${esc(id)}" data-i="${i}">Delete this note</button></div></div>`, true);
}
async function logWrite(kind,id,fn){ const rec=kind==="c"?S.companies.get(id):S.contacts.get(id); if(!rec) return false; const log=[...(rec.log||[])].map(x=>({...x})); fn(log);
  log.sort((a,b)=>(a.d||"").localeCompare(b.d||"")); return dbUpdate(`${kind==="c"?"companies":"contacts"}/${id}`,{log}); }
document.addEventListener("click",async e=>{ const t=e.target.closest('[data-act="log-edit"],[data-act="log-save"],[data-act="log-del"]'); if(!t) return; e.preventDefault(); e.stopPropagation();
  const {kind,id}=t.dataset, i=Number(t.dataset.i), a=t.dataset.act;
  if(a==="log-edit"){ if(t.closest("details") && e.target.closest("summary")) return; logEditModal(kind,id,i); return; }
  const rec=kind==="c"?S.companies.get(id):S.contacts.get(id); const orig=rec?.log?.[i]; if(!orig) return;
  if(a==="log-save"){ let text=$("#leText").value.trim(); if(text && /^Checked in/.test(orig.text||"")) text="Checked in: "+text; if(!text){ toast("Write something, or delete the note"); return; } t.disabled=true;
    const ok=await logWrite(kind,id,L=>{ const j=L.findIndex(x=>x.d===orig.d&&x.text===orig.text&&x.by===orig.by); if(j>=0) L[j]={...L[j],d:$("#leDate").value||orig.d,by:$("#leBy").value||orig.by,text,editedBy:S.me?.name||"",editedAt:today()}; });
    t.disabled=false; if(ok){ closeModal(); toast("Note updated"); queueRender(); try{ renderSheet(); }catch(_){} } }
  if(a==="log-del"){ confirmBox("Delete this note?","It is removed from the history. The edit history still shows that it was changed.","Delete",async()=>{
    const ok=await logWrite(kind,id,L=>{ const j=L.findIndex(x=>x.d===orig.d&&x.text===orig.text&&x.by===orig.by); if(j>=0) L.splice(j,1); });
    if(ok){ closeModal(); toast("Note deleted"); queueRender(); try{ renderSheet(); }catch(_){} } }); }
},true);
document.addEventListener("keydown",e=>{ if(e.key==="Enter" && e.target.matches?.('[data-act="log-edit"]')) e.target.click(); });

/* ---------- 10. Today badge: only my check-ins that are due, and it clears once I've opened Today ---------- */
const SEEN_KEY="munger.todaySeen";
function myDueIds(){ if(!S.me) return []; const me=myPartner();
  const cos=companies().filter(c=>isOpen(c) && isMine(c) && daysUntil(c.nextCheckIn)!==null && daysUntil(c.nextCheckIn)<=0).map(c=>"c"+c.id+"@"+c.nextCheckIn);
  const ppl=peopleCheckins(true).filter(k=>daysUntil(k.nextCheckIn)!==null && daysUntil(k.nextCheckIn)<=0).map(k=>"k"+k.id+"@"+k.nextCheckIn);
  return [...cos,...ppl]; }
function todayBadge(){ const ids=myDueIds(); if(currentView()==="today" && ids.length){ offWrite(SEEN_KEY,ids); }
  const seen=new Set(offRead(SEEN_KEY)||[]); const n=ids.filter(x=>!seen.has(x)).length;
  try{ if(navigator.setAppBadge){ n? navigator.setAppBadge(n) : navigator.clearAppBadge(); } }catch(_){}
  return n; }

/* ---------- 11. Mail lists: people at partner firms by kind, and a mailer you can draft and send in batches ---------- */
S.lists.pkinds=S.lists.pkinds||[];
S.mailDraft=offRead("munger.mailDraft")||{subject:"",body:"Hi {first name}\n\n"};
function firstName(n){ return String(n||"").trim().split(/\s+/)[0]||""; }
function partnerKindOf(k){ const ids=[k.companyId,...(k.otherRoles||[]).map(r=>r.companyId||r.company_id||r.id)].filter(Boolean);
  return ids.map(id=>S.companies.get(id)).filter(c=>c&&isPartnerCo(c)).map(c=>({kind:c.kind,c})); }
listRows=function(){
  const L=S.lists; const rows=[]; const any=!L.groups.length && !L.tiers.length && !L.pkinds.length;
  const langOK=l=> L.lang==="all" || l===L.lang || l==="both";
  if(any || L.groups.length) companies().forEach(c=>{ if(!isAcq(c)) return; const g=stageOf(c.status).group; if(!any && !L.groups.includes(g)) return;
    (c.owners||[]).forEach(o=>{ const lang=o.language||c.language; if(!langOK(lang)) return; if(!o.email&&!o.cell) return; rows.push({name:o.name,email:o.email||"",cell:o.cell||"",org:c.name,kind:"Business owner",lang}); }); });
  contacts().forEach(k=>{ if(k.doNotContact || !langOK(k.language)) return;
    const pk=partnerKindOf(k); const byTier=L.tiers.length && tagsOf(k).some(t=>L.tiers.includes(t)); const byPartner=L.pkinds.length && pk.some(x=>L.pkinds.includes(x.kind));
    if(!any && !byTier && !byPartner) return;
    const email=k.email||(k.emails||[])[0]?.v||"", cell=k.cell||(k.cells||[])[0]?.v||""; if(!email&&!cell) return;
    const firm=(byPartner? pk.find(x=>L.pkinds.includes(x.kind))?.c : null) || companyOf(k);
    rows.push({name:k.name,email,cell,org:firm?.name||k.firm||"",kind: byPartner&&!byTier? (PKINDS[pk.find(x=>L.pkinds.includes(x.kind)).kind]||"Partner") : `${tierOf(k)} · ${k.type||TIERS[tierOf(k)]?.label||"Contact"}`,lang:k.language}); });
  const seen=new Set(); return rows.filter(r=>{ const key=(r.email||r.cell).toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true; }).sort((a,b)=>a.name.localeCompare(b.name));
};
{ const base=vLists; vLists=function(){ const L=S.lists; const any=!L.groups.length&&!L.tiers.length&&!L.pkinds.length;
  const firms=k=>companies().filter(c=>isPartnerCo(c)&&c.kind===k).length;
  const pchips=`<div class="sec" style="margin-top:0"><h2>Only people at partner firms</h2></div><div class="chips">${Object.entries(PKINDS).map(([k,l])=>`<button class="chip ${L.pkinds.includes(k)?"on":""}" data-act="l-pkind" data-k="${k}">${esc(l)}s <span class="n">${firms(k)}</span></button>`).join("")}</div>`;
  const rows=listRows(); const emails=rows.filter(r=>r.email); const D=S.mailDraft; const B=40; const batches=Math.ceil(emails.length/B);
  const composer=`<div class="sec"><h2>Write the mailer</h2></div>
   <div class="fields"><div class="fld"><label for="mdSubj">Subject</label><input id="mdSubj" value="${esc(D.subject)}" placeholder="e.g. Munger – partnering on deals in 2027"></div>
   ${fldNote("mdBody","Message",D.body,"Write your message. {first name} becomes each person's first name in a mail merge.",8)}</div>
   <p class="tag" style="margin:6px 4px 0">Saved on this phone as you type. ${emails.length} ${emails.length===1?"person":"people"} with email on this list.</p>
   ${emails.length?`<div class="lbl" style="margin:12px 4px 6px">Send it</div>
   <div class="group">${Array.from({length:batches},(_,i)=>`<a class="rowi" href="#" data-act="md-batch" data-i="${i}"><span class="avatar biz">${ic("mail",20)}</span><span class="main"><span class="t1" style="display:block">Open email ${batches>1?`${i+1} of ${batches}`:""}</span><span class="t2" style="display:block">${i*B+1}–${Math.min(emails.length,(i+1)*B)} · everyone in BCC · "{first name}" becomes "all"</span></span></a>`).join("")}</div>
   <div class="acts" style="margin-top:10px;grid-template-columns:1fr 1fr"><button class="act" data-act="md-copy">${ic("edit",18)}Copy message</button><button class="act dark" data-act="md-merge">${ic("dl",18)}Mail-merge file</button></div>
   <p class="tag" style="margin:8px 4px 0">For a personal "Hi Johan" to every person, use the mail-merge file (CSV with first names) in Outlook, Word or Gmail mail merge. For a quick group mail, open the emails above: they go out in groups of ${B} so your mail app doesn't choke.</p>`:""}`;
  let h=base();
  h=h.replace('<div class="stats">',pchips+'<div class="stats">');
  h=h.replace(/<button class="chip[^"]*" data-act="l-all">/,`<button class="chip ${any?"on":""}" data-act="l-all">`);
  h=h.replace('<div class="sec"><h2>Recipients</h2></div>',composer+'<div class="sec"><h2>Recipients</h2></div>');
  return h; }; }
document.addEventListener("input",e=>{ if(e.target.id==="mdSubj"||e.target.id==="mdBody"){ S.mailDraft={subject:$("#mdSubj").value, body:$("#mdBody").value}; offWrite("munger.mailDraft",S.mailDraft); } });
function mdText(fill){ const D=S.mailDraft; return {subject:D.subject||"", body:String(D.body||"").replace(/\{first ?name\}/gi,fill)}; }
document.addEventListener("click",async e=>{ const t=e.target.closest('[data-act="l-pkind"],[data-act="l-all"],[data-act="md-batch"],[data-act="md-copy"],[data-act="md-merge"]'); if(!t) return; const a=t.dataset.act, k=t.dataset.k;
  if(a==="l-pkind"){ const p=S.lists.pkinds; S.lists.pkinds=p.includes(k)?p.filter(x=>x!==k):[...p,k]; render(); return; }
  if(a==="l-all"){ S.lists.pkinds=[]; render(); return; }
  e.preventDefault(); const emails=listRows().filter(r=>r.email);
  if(a==="md-batch"){ if(!S.mailDraft.subject.trim()){ toast("Add a subject first"); $("#mdSubj")?.focus(); return; } const i=Number(t.dataset.i); const part=emails.slice(i*40,(i+1)*40).map(r=>r.email); const me=S.me?.email||"";
    const m=mdText("all"); location.href=`mailto:${encodeURIComponent(me)}?bcc=${part.map(encodeURIComponent).join(",")}&subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`; t.classList.add("done19"); }
  if(a==="md-copy"){ const m=mdText("{first name}"); try{ await navigator.clipboard.writeText(`${m.subject}\n\n${m.body}`); toast("Subject and message copied"); }catch(_){ toast("Couldn't copy – select the text and copy it"); } }
  if(a==="md-merge"){ const L=S.lists; download(`munger-mail-merge-${today()}.csv`,[["First name","Name","Email","Organisation","Type","Subject","Message"],...emails.map(r=>[firstName(r.name),r.name,r.email,r.org,r.kind,S.mailDraft.subject||"",String(S.mailDraft.body||"").replace(/\{first ?name\}/gi,firstName(r.name))])]); }
},true);

/* ---------- 12. "Add lead" on a person always means a business they introduced (owners can still add their own) ---------- */
function leadFrom(contactId){ const kk=S.contacts.get(contactId); if(!kk) return;
  const map={"Accountant / auditor":"accounting","Attorney":"law","Tax advisor":"tax","Banker / financier":"bank","Business broker":"broker","Well-connected friend":"friend"};
  const ch=map[kk.type] || (activeChannels("").some(x=>x.id==="friend")?"friend":"connector");
  dealForm(null,{source:{channel:ch, contactId}, partner:kk.partner||defaultPartner(), name:""}); FORM.fromOwner=null; }
function ownBizMissing(k){ return (tierOf(k)==="A"||OWNER_ROLES.includes(k.companyRole)) && !(k.companyId && S.companies.get(k.companyId)) && !companies().some(c=>(c.owners||[]).some(o=>normName(o.name)===normName(k.name))); }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="new-deal-from"],[data-act="lead-pick"]'); if(!t) return; e.preventDefault(); e.stopImmediatePropagation(); if(S.readOnly) return;
  const id=t.dataset.id; const k=S.contacts.get(id); if(!k) return;
  if(t.dataset.act==="lead-pick"){ closeModal(); setTimeout(()=> t.dataset.k==="own"? ownerDealForm(id,true) : leadFrom(id), 80); return; }
  if(!ownBizMissing(k)){ leadFrom(id); return; }
  const first=k.name.split(" ")[0];
  showModal(`${ovHead("Add a business",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><div class="choice">
   <button type="button" data-act="lead-pick" data-k="lead" data-id="${esc(id)}"><span class="ci">${ic("bizplus",24)}</span><span><b>A lead ${esc(first)} introduced</b><span>Someone else's business ${esc(first)} brought to us. It counts as ${esc(first)}'s lead.</span></span></button>
   <button type="button" data-act="lead-pick" data-k="own" data-id="${esc(id)}"><span class="ci">${ic("biz",24)}</span><span><b>${esc(first)}'s own business</b><span>The company ${esc(first)} owns, if it isn't in Munger yet.</span></span></button>
  </div></div>`, true);
},true);

/* ---------- 13. Link family while capturing a person ---------- */
function famRowHTML(i){ return `<div class="famrow19" data-i="${i}"><div class="fld"><label>Family member in our network</label><select class="famWho19">${opts(contacts().filter(o=>o.id!==FORM.id).sort((a,b)=>a.name.localeCompare(b.name)).map(o=>({v:o.id,l:o.name+(companyOf(o)?" · "+companyOf(o).name:"")})),"","Choose…")}</select></div>
  <div class="fld"><label>They are this person's</label><select class="famB19" data-ss="off">${opts(FAM.map(f=>({v:f,l:famLabel(f)})),"","Choose…")}</select></div>
  <div class="fld"><label>This person is their</label><select class="famA19" data-ss="off">${opts(FAM.map(f=>({v:f,l:famLabel(f)})),"","Choose…")}</select></div>
  <button type="button" class="linkbtn" data-act="fam19-del" style="color:var(--bad,#b3261e);margin:2px 4px 8px">Remove</button></div>`; }
{ const base=contactForm; contactForm=function(id,preset){ base(id,preset); const ov=document.querySelector("#contactForm .ovb"); if(!ov || S.readOnly) return;
  const anchor=[...ov.querySelectorAll(".fsec")].find(x=>/Check in with them/.test(x.textContent));
  const fam=id&&S.contacts.get(id)? familyOf(S.contacts.get(id)) : [];
  const html=`<div class="fsec">Family in our network</div>${fam.length?`<p class="tag" style="margin:0 4px 6px">Already linked: ${esc(fam.map(x=>`${x.o.name} (${famLabel(x.rel)})`).join(", "))}</p>`:""}<div id="famRows19" class="fields" hidden></div><button type="button" class="linkbtn" data-act="fam19-add" style="margin:6px 4px 0">+ Link a family member</button>`;
  if(anchor) anchor.insertAdjacentHTML("beforebegin",html); else ov.insertAdjacentHTML("beforeend",html); }; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-act="fam19-add"],[data-act="fam19-del"]'); if(!t) return; e.preventDefault();
  if(t.dataset.act==="fam19-add"){ const w=$("#famRows19"); w.hidden=false; w.insertAdjacentHTML("beforeend",famRowHTML(w.children.length)); }
  else { const r=t.closest(".famrow19"); const w=r.parentElement; r.remove(); if(!w.children.length) w.hidden=true; } });
document.addEventListener("change",e=>{ const r=e.target.closest?.(".famrow19"); if(!r) return;
  if(e.target.classList.contains("famB19")){ e.target.dataset.touched="1"; const v=FAM_REV[e.target.value]; const a=r.querySelector(".famA19"); if(v && !a.dataset.touched) a.value=v; }
  if(e.target.classList.contains("famA19")){ e.target.dataset.touched="1"; const v=FAM_REV[e.target.value]; const b=r.querySelector(".famB19"); if(v && !b.dataset.touched) b.value=v; } });
function famRead19(){ return [...document.querySelectorAll(".famrow19")].map(r=>({o:r.querySelector(".famWho19").value, bIs:r.querySelector(".famB19").value||"family", aIs:r.querySelector(".famA19").value||"family"})).filter(x=>x.o); }
{ const base=submitContact; submitContact=async function(){ const fam=famRead19(); const editId=FORM.id; const before=new Set(S.contacts.keys()); const name=($("#kName")?.value||"").trim();
  const r=await base(); if(!fam.length) return r;
  let id=editId; if(!id){ const nw=[...S.contacts.values()].filter(k=>!before.has(k.id)); id=(nw.find(k=>k.name===name)||nw[0])?.id; }
  if(!id || !S.contacts.has(id)) return r;
  const have=new Set((S.links||[]).filter(l=>l.a===id||l.b===id).map(l=>l.a===id?l.b:l.a)); const rows=fam.filter(x=>x.o!==id && !have.has(x.o)).map(x=>({a:id,b:x.o,a_is:x.aIs,b_is:x.bIs,note:""}));
  if(rows.length){ const {error}=await sb.from("person_links").insert(rows); if(error) writeErr(error); else { await loadLinks(); toast(rows.length===1?"Family member linked":`${rows.length} family members linked`); try{ if(sheetOpen()) renderSheet(); }catch(_){} } }
  return r; }; }

/* ---------- 14. Show the app version in settings ---------- */
{ const base=vSettings; vSettings=function(){ return base()+`<p class="tag" style="text-align:center;margin-top:14px">Munger app ${typeof APP_V!=="undefined"?APP_V:""} · updates load by themselves when you open the app</p>`; }; }

/* ---------- 15. A person's lead type follows their tags: Owner > Potential hire > Great contact > Employee ---------- */
{ const base=tierOf; tierOf=function(k){ const t=k&&Array.isArray(k.tags)? k.tags.filter(x=>TIERS[x]) : []; return t.length? TIER_PRIO.find(x=>t.includes(x)) : base(k); }; }

/* ---------- 16. Responsible partner(s): who follows up, separate from who brought the business in ---------- */
function respOf(c){ const R=Array.isArray(c?.responsible)?c.responsible.filter(Boolean):[]; return R.length? R : (c?.partner?[c.partner]:[]); }
function respLine(c){ const R=respOf(c); return `Responsible: <b>${esc(R.join(" & ")||"not set")}</b>${c.partner&&!(R.length===1&&R[0]===c.partner)?` · brought in by ${esc(c.partner)}`:""}`; }
function defaultResp(){ return S.partners.find(p=>/^rynhardt/i.test(p)) || myPartner() || S.partners[0] || ""; }
function respFields(c,isNew){ if(!S.partners.length) return "";
  const R=new Set(Array.isArray(c.responsible)&&c.responsible.length? c.responsible : isNew? [defaultResp()] : (c.partner?[c.partner]:[]));
  return `<div class="fld" style="grid-column:1/-1"><label>Responsible to follow up (one or more)</label><div class="rolechips" id="cResp" style="margin-top:6px">${S.partners.map(p=>`<label><input type="checkbox" name="cResp" value="${esc(p)}" ${R.has(p)?"checked":""}><span>${esc(p.split(" ")[0])}</span></label>`).join("")}</div></div>`; }
function respRead(){ const box=document.querySelector("#dealForm #cResp"); if(!box) return null; return [...box.querySelectorAll("input[name=cResp]:checked")].map(x=>x.value); }
{ const base=dbSet; dbSet=async function(path,data){ if(String(path).startsWith("companies/") && data && "name" in data && document.querySelector("#dealForm #cResp")){ const R=respRead(); if(R) data={...data,responsible:R}; } return base(path,data); }; }
{ const base=dbUpdate; dbUpdate=async function(path,patch){ if(String(path).startsWith("companies/") && patch && "name" in patch && document.querySelector("#dealForm #cResp")){ const R=respRead(); if(R) patch={...patch,responsible:R}; } return base(path,patch); }; }

/* ---------- 17. Network map: people at the same company are connected to each other ---------- */
{ const base=netBuildGraph; netBuildGraph=function(){ base(); if(!G.byId) return;
  const groups=new Map(); contacts().forEach(k=>{ if(!G.byId.has("k:"+k.id)) return; [k.companyId,...(k.otherRoles||[]).map(r=>r.companyId)].filter(Boolean).forEach(cid=>{ if(!groups.has(cid)) groups.set(cid,new Set()); groups.get(cid).add(k.id); }); });
  const have=new Set(G.edges.map(e=>[e.a.id,e.b.id].sort().join("|")));
  const add=(a,b)=>{ const A=G.byId.get("k:"+a), B=G.byId.get("k:"+b); const key=[A.id,B.id].sort().join("|"); if(have.has(key)) return; have.add(key); G.edges.push({a:A,b:B,kind:"colleague"}); A.deg=(A.deg||0)+1; B.deg=(B.deg||0)+1; };
  groups.forEach(set=>{ const ids=[...set]; if(ids.length<2) return; if(ids.length<=6){ for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++) add(ids[i],ids[j]); } else ids.forEach((id,i)=>add(id,ids[(i+1)%ids.length])); }); }; }

/* ---------- 18. "Also owns or works at": search every company, or add a new one on the spot ---------- */
const XR_ROLES=["Owner","Co-owner","Shareholder","Director","CEO / MD","Chair","Board member / NED","Employee","Advisor","Investor"];
roleRow=function(r){ const cos=companies().sort((a,b)=>a.name.localeCompare(b.name)); const lab=c=>c.name+(isPartnerCo(c)?` · ${PKINDS[c.kind]||"Partner"}`:c.kind==="other"?" · Network company":isAcq(c)?` · ${grp(c)==="network"?"Prospect":grp(c)==="target"?"Target":"Business"}`:"");
  return `<div class="fld xrow xrole"><input type="search" class="xq" placeholder="Search companies…" autocomplete="off" aria-label="Search companies">
   <div class="xin"><select class="xco" data-ss="1" aria-label="Company"><option value="">Choose company…</option>${cos.map(c=>`<option value="${esc(c.id)}"${c.id===r?.companyId?" selected":""}>${esc(lab(c))}</option>`).join("")}<option value="__new">+ New company…</option></select><select class="xrl" aria-label="Role">${opts(XR_ROLES,r?.role||"Owner")}</select><button type="button" class="xdel" data-act="x-del" aria-label="Remove">✕</button></div>
   <div class="xnew" hidden><input class="xnm" placeholder="Name of the company" autocapitalize="words" autocomplete="off"><select class="xbuy" aria-label="What is it?">${opts([{v:"network",l:"A business we'd look at buying (prospect)"},{v:"target",l:"A target – we go full out"},{v:"other",l:"Network company – not to buy"}],"network")}</select></div></div>`; };
document.addEventListener("input",e=>{ if(!e.target.classList?.contains("xq")) return; const row=e.target.closest(".xrole"); const sel=row.querySelector(".xco"); const q=e.target.value.trim();
  ssFilter(sel,e.target); const hit=[...sel.options].some(o=>o.value && o.value!=="__new" && o.value===sel.value);
  if(q && !hit){ sel.value="__new"; row.querySelector(".xnew").hidden=false; row.querySelector(".xnm").value=q.replace(/\b\w/g,m=>m.toUpperCase()); } else row.querySelector(".xnew").hidden= sel.value!=="__new"; });
document.addEventListener("change",e=>{ if(!e.target.classList?.contains("xco")) return; const row=e.target.closest(".xrole"); const nw=row.querySelector(".xnew"); nw.hidden= e.target.value!=="__new"; if(!nw.hidden && !row.querySelector(".xnm").value) row.querySelector(".xnm").focus(); });
{ const base=submitContact; submitContact=async function(){
  const rows=[...document.querySelectorAll("#contactForm .xrole")].filter(r=>r.querySelector(".xco").value==="__new");
  for(const r of rows){ const nm=r.querySelector(".xnm").value.trim(); if(!nm){ toast("Type the name of the new company, or remove that row"); r.querySelector(".xnm").focus(); return; }
    const ex=companies().find(c=>normName(c.name)===normName(nm)); let id=ex?.id;
    if(!id){ id=newId(); const buy=r.querySelector(".xbuy").value; const role=r.querySelector(".xrl").value; const pname=($("#kName")?.value||"").trim(); const by=await myName();
      const owner=["Owner","Co-owner","Shareholder"].includes(role) && pname? [{name:pname, cell:($("#kCell")?.value||"").trim(), email:($("#kEmail")?.value||"").trim(), role, language:"af"}] : [];
      const ok=await dbSet("companies/"+id,{name:nm, kind:buy==="other"?"other":"target", status:buy==="target"?"target":"network", partner:myPartner()||"", responsible:buy==="other"?[]:[defaultResp()], owners:owner, hqCountry:"South Africa", log:[{d:today(),by,text:`Captured · added with ${pname||"a person"}`}], createdByName:by});
      if(!ok) return; }
    const sel=r.querySelector(".xco"); if(![...sel.options].some(o=>o.value===id)) sel.insertAdjacentHTML("beforeend",`<option value="${esc(id)}">${esc(nm)}</option>`); sel.value=id; r.querySelector(".xnew").hidden=true; }
  return base(); }; }

/* ---------- 19. "No company": no company questions (role, job title, company name) ---------- */
function noCoToggle(){ if(!$("#contactForm")) return; const none=whereVal()==="other";
  ["#kRole","#kTitle"].forEach(s=>{ const f=$(s)?.closest(".fld"); if(f) f.hidden=none; });
  const fw=$("#kFirmW"); if(fw && none) fw.hidden=true;
  if(none && $("#kRole")) $("#kRole").value=""; }
{ const base=newCoUpdate; newCoUpdate=function(d){ base(d); noCoToggle(); }; }
{ const base=contactForm; contactForm=function(id,preset){ base(id,preset); noCoToggle(); }; }
document.addEventListener("change",e=>{ if(e.target.name==="kWhere") setTimeout(noCoToggle,0); });
