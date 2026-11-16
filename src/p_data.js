/* ---------------- Data layer (Supabase) ---------------- */
const SUPABASE_URL="https://iraterfkhjquhmoezpiw.supabase.co";
const SUPABASE_KEY="sb_publishable_h_snfpBOHkOvfS4Vs8XLvQ_k7Drdl6f";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:false}});
S.members=[]; S.me=null; S.session=null;
let renderQueued=false;
function queueRender(){ if(renderQueued) return; renderQueued=true; requestAnimationFrame(()=>{ renderQueued=false; render(); }); }

const nz = v => (v===undefined||v===null||v==="") ? null : v;
function companyFromRow(r){ return {id:r.id, name:r.name, tradingAs:r.trading_as, industry:r.industry, province:r.province, town:r.town, website:r.website, ebit:r.ebit, turnover:r.turnover, employees:r.employees, owners:r.owners||[], language:r.language, source:{channel:r.source_channel, contactId:r.source_contact_id||"", partner:r.source_partner, detail:r.source_detail}, partner:r.partner, status:r.status, followUpMonths:r.follow_up_months, nextCheckIn:r.next_check_in||"", lastContact:r.last_contact||"", notes:r.notes, log:r.log||[], example:r.example, hqCountry:r.hq_country, footprint:r.footprint, countries:r.countries, regNo:r.reg_no, ebitConfirmed:r.ebit_confirmed, turnoverConfirmed:r.turnover_confirmed, financialsYear:r.financials_year, fit:r.fit||{}, kind:r.kind||"target", kindNote:r.kind_note||"", checkInNote:r.check_in_note||"", signals:r.signals||{}, updatedByName:r.updated_by_name||"", createdBy:r.created_by, createdByName:r.created_by_name, createdAt:r.created_at, updatedAt:r.updated_at}; }
function contactFromRow(r){ return {tags:Array.isArray(r.tags)?r.tags:[], cells:Array.isArray(r.cells)?r.cells:[], emails:Array.isArray(r.emails)?r.emails:[], nextCheckIn:r.next_check_in||"", checkInWeeks:r.check_in_weeks||0, checkInRepeat:!!r.check_in_repeat, checkInNote:r.check_in_note||"", checkInOwner:r.check_in_owner||"", lastContact:r.last_contact||"", id:r.id, name:r.name, tier:r.tier, type:r.type, firm:r.firm, partner:r.partner, ownsCompanyId:r.owns_company_id||"", companyId:r.company_id||r.owns_company_id||"", companyRole:r.company_role||(r.owns_company_id?"Owner":""), title:r.title||"", country:r.country||"", industry:r.industry||"", expertise:r.expertise||"", linkedin:r.linkedin||"", influence:r.influence||0, talent:r.talent||{}, hnwi:!!r.hnwi, wealthSource:r.wealth_source||"", doNotContact:!!r.do_not_contact, thanks:r.thanks||[], log:r.log||[], pastRoles:r.past_roles||[], updatedByName:r.updated_by_name||"", cell:r.cell, email:r.email, language:r.language, province:r.province, town:r.town, notes:r.notes, example:r.example, createdBy:r.created_by, createdAt:r.created_at, updatedAt:r.updated_at}; }
const CMAP={name:"name",tradingAs:"trading_as",industry:"industry",province:"province",town:"town",website:"website",ebit:"ebit",turnover:"turnover",employees:"employees",owners:"owners",language:"language",partner:"partner",status:"status",followUpMonths:"follow_up_months",nextCheckIn:"next_check_in",lastContact:"last_contact",notes:"notes",log:"log",example:"example",createdByName:"created_by_name",hqCountry:"hq_country",footprint:"footprint",countries:"countries",regNo:"reg_no",ebitConfirmed:"ebit_confirmed",turnoverConfirmed:"turnover_confirmed",financialsYear:"financials_year",fit:"fit",kind:"kind",kindNote:"kind_note",checkInNote:"check_in_note",signals:"signals"};
const KMAP={tags:"tags",cells:"cells",emails:"emails",nextCheckIn:"next_check_in",checkInWeeks:"check_in_weeks",checkInRepeat:"check_in_repeat",checkInNote:"check_in_note",checkInOwner:"check_in_owner",lastContact:"last_contact",name:"name",tier:"tier",type:"type",firm:"firm",partner:"partner",ownsCompanyId:"owns_company_id",cell:"cell",email:"email",language:"language",province:"province",town:"town",notes:"notes",example:"example",companyId:"company_id",companyRole:"company_role",title:"title",country:"country",industry:"industry",expertise:"expertise",linkedin:"linkedin",influence:"influence",talent:"talent",hnwi:"hnwi",wealthSource:"wealth_source",doNotContact:"do_not_contact",thanks:"thanks",log:"log",pastRoles:"past_roles"};
const NULLABLE=new Set(["next_check_in","last_contact","owns_company_id","source_contact_id","company_id","ebit_confirmed","turnover_confirmed"]);
function toRow(table, d){
  const map=table==="companies"?CMAP:KMAP; const row={};
  for(const [k,col] of Object.entries(map)) if(k in d){ let v=d[k]; if(NULLABLE.has(col)) v=nz(v); else if(v===undefined||v===null) continue; row[col]=v; }
  if(table==="companies" && d.source){ row.source_channel=d.source.channel||""; row.source_contact_id=nz(d.source.contactId); row.source_partner=d.source.partner||""; row.source_detail=d.source.detail||""; }
  if(row.follow_up_months!==undefined) row.follow_up_months=Number(row.follow_up_months)||0;
  return row;
}
function writeErr(e){
  console.warn(e);
  const m=(e&&(e.message||e.error_description))||"";
  if((e&&e.code==="23505")||/duplicate key|unique/i.test(m)){ toast(/compan/i.test(m)?"A business or partner with that name is already in Munger":"Already in Munger: someone has that cell number or email"); }
  else if(/row-level security|permission denied/i.test(m)){ toast("Your login isn't on the Munger team yet. Ask Rynhardt."); }
  else if(/JWT|session/i.test(m)){ toast("Your session expired – sign in again."); showLogin(true); }
  else toast("Couldn't save – check your connection and try again.");
}
async function run(q){ const {error}=await q; if(error){ writeErr(error); return false; } return true; }
async function dbSet(path, data){
  const [table,id]=path.split("/");
  if(table==="settings") { const ok=await run(sb.from("settings").upsert({key:id, value:data})); if(ok) await loadSettings(); return ok; }
  const row={id, ...toRow(table,data)};
  const ok=await run(sb.from(table).upsert(row));
  if(ok){ await (table==="companies"?loadCompanies():loadContacts()); }
  return ok;
}
async function dbUpdate(path, patch){
  const [table,id]=path.split("/");
  const ok=await run(sb.from(table).update(toRow(table,patch)).eq("id",id));
  if(ok){ await (table==="companies"?loadCompanies():loadContacts()); }
  return ok;
}
async function dbDel(path){
  const [table,id]=path.split("/");
  const ok=await run(sb.from(table).delete().eq("id",id));
  if(ok){ await Promise.all([loadCompanies(),loadContacts()]); }
  return ok;
}
function newId(){ return (crypto.randomUUID? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16))); }

async function loadCompanies(){ const {data,error}=await sb.from("companies").select("*").order("created_at"); if(error){ console.warn(error); S.stale=true; } else { S.companies=new Map(data.map(r=>[r.id,companyFromRow(r)])); S.loaded.companies=true; S.stale=false; } queueRender(); }
async function loadContacts(){ const {data,error}=await sb.from("contacts").select("*").order("created_at"); if(error){ console.warn(error); } else { S.contacts=new Map(data.map(r=>[r.id,contactFromRow(r)])); S.loaded.contacts=true; } queueRender(); }
async function loadSettings(){ const {data}=await sb.from("settings").select("*"); const rows=data||[]; const team=rows.find(r=>r.key==="team"); const p=team?.value?.partners; S.partners=Array.isArray(p)?p.filter(Boolean):[]; const ch=rows.find(r=>r.key==="channels"); if(ch && Array.isArray(ch.value?.list)) applyChannels(ch.value.list); const mt=rows.find(r=>r.key==="meeting"); S.meetNext=mt?.value?.next||""; S.loaded.settings=true; queueRender(); }
async function loadMembers(){ const {data}=await sb.from("members").select("user_id,email,name,is_admin").order("created_at"); S.members=data||[]; S.me=S.members.find(m=>m.user_id===S.uid)||null; S.readOnly=!S.me; queueRender(); }
async function loadConnections(){ const {data,error}=await sb.from("connections").select("contact_id,partner,relation"); if(error){ console.warn(error); return; } const m=new Map(); (data||[]).forEach(r=>{ if(!m.has(r.contact_id)) m.set(r.contact_id,[]); m.get(r.contact_id).push({partner:r.partner, relation:r.relation||""}); }); S.conns=m; queueRender(); }
async function loadCommitments(){ const {data,error}=await sb.from("commitments").select("*").order("created_at"); if(error){ console.warn(error); return; } S.commitments=(data||[]).map(r=>({id:r.id, meetingId:r.meeting_id, owner:r.owner, action:r.action, due:r.due||"", status:r.status, why:r.why, companyId:r.company_id||"", contactId:r.contact_id||"", createdAt:r.created_at})); queueRender(); }
async function loadMeetings(){ const {data,error}=await sb.from("meetings").select("*").order("held_on",{ascending:false}); if(error){ console.warn(error); return; } S.meetings=data||[]; queueRender(); }
let reloadT={}; function reloadSoon(table){ clearTimeout(reloadT[table]); reloadT[table]=setTimeout(()=>{ ({companies:loadCompanies,contacts:loadContacts,settings:loadSettings,connections:loadConnections,commitments:loadCommitments,meetings:loadMeetings,person_links:loadLinks})[table](); },300); }
let channel=null;
async function startData(){
  await loadMembers();
  if(!S.me){ S.readOnly=true; render(); return; }
  await Promise.all([loadCompanies(),loadContacts(),loadSettings(),loadConnections(),loadCommitments(),loadMeetings(),loadLinks()]);
  if(channel) sb.removeChannel(channel);
  channel=sb.channel("munger-live")
    .on("postgres_changes",{event:"*",schema:"public",table:"companies"},()=>reloadSoon("companies"))
    .on("postgres_changes",{event:"*",schema:"public",table:"contacts"},()=>reloadSoon("contacts"))
    .on("postgres_changes",{event:"*",schema:"public",table:"settings"},()=>reloadSoon("settings"))
    .on("postgres_changes",{event:"*",schema:"public",table:"connections"},()=>reloadSoon("connections"))
    .on("postgres_changes",{event:"*",schema:"public",table:"person_links"},()=>reloadSoon("person_links"))
    .on("postgres_changes",{event:"*",schema:"public",table:"commitments"},()=>reloadSoon("commitments"))
    .on("postgres_changes",{event:"*",schema:"public",table:"meetings"},()=>reloadSoon("meetings"))
    .subscribe();
}
function showLogin(on){ $("#login").hidden=!on; if(on) setTimeout(()=>$("#lEmail").focus(),50); }
async function init(){
  render();
  const {data:{session}}=await sb.auth.getSession();
  if(!session){ showLogin(true); return; }
  S.session=session; S.uid=session.user.id; showLogin(false); startData();
}
sb.auth.onAuthStateChange((ev,session)=>{
  if(ev==="SIGNED_OUT"){ S.session=null; S.companies=new Map(); S.contacts=new Map(); S.me=null; showLogin(true); render(); }
  else if(session){ S.session=session; S.uid=session.user.id; }
});
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible" && S.me){ loadCompanies(); loadContacts(); loadConnections(); loadLinks(); loadCommitments(); loadMeetings(); } });
document.getElementById("loginForm").addEventListener("submit",async e=>{
  e.preventDefault(); const btn=$("#lBtn"); const err=$("#lErr"); err.textContent=""; btn.disabled=true; btn.textContent="Signing in…";
  const {data,error}=await sb.auth.signInWithPassword({email:$("#lEmail").value.trim().toLowerCase(), password:$("#lPass").value});
  btn.disabled=false; btn.textContent="Sign in";
  if(error){ err.textContent= /invalid/i.test(error.message)? "That email and password don't match." : error.message; return; }
  S.session=data.session; S.uid=data.user.id; $("#lPass").value=""; showLogin(false); await startData();
  if(!S.me){ err.textContent="This login isn't on the Munger team. Ask Rynhardt to add you."; await sb.auth.signOut(); }
});

