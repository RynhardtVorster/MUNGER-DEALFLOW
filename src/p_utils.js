/* ---------------- Utils ---------------- */
const $ = s=>document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n=>String(n).padStart(2,"0");
const ymd = d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today = ()=>ymd(new Date());
function parseD(s){ if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function addMonths(s,m){ const d=parseD(s)||new Date(); const day=d.getDate(); const r=new Date(d.getFullYear(), d.getMonth()+m, 1); const last=new Date(r.getFullYear(), r.getMonth()+1, 0).getDate(); r.setDate(Math.min(day,last)); return ymd(r); }
function daysUntil(s){ const d=parseD(s); if(!d) return null; const t=parseD(today()); return Math.round((d-t)/86400000); }
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtD(s){ const d=parseD(s); return d? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "—"; }
function dueInfo(c){
  if(!c.nextCheckIn) return null;
  const n=daysUntil(c.nextCheckIn);
  if(n<0) return {cls:"late", txt:`${-n} day${n===-1?"":"s"} overdue`, n};
  if(n===0) return {cls:"late", txt:"Due today", n};
  if(n<=14) return {cls:"soon", txt:`In ${n} day${n===1?"":"s"}`, n};
  return {cls:"ok", txt:fmtD(c.nextCheckIn), n};
}
function stagePill(id){ const s=stageOf(id); const cls={network:"",target:"nurture",active:"active",won:"won",closed:"closed"}[s.group]; return `<span class="pill ${cls}">${esc(s.label)}</span>`; }
function langTag(l){ return l? `<span class="lang" title="${esc(LANGS[l]||l)}">${l==="both"?"AF/EN":esc(String(l).toUpperCase())}</span>`:""; }
function sourceText(c){
  const s=c.source||{}; const ch=CHANNEL[s.channel]; if(!ch) return "—";
  if(ch.contact && s.contactId){ const k=S.contacts.get(s.contactId); if(k) return `${ch.label} · ${k.name}${k.firm?` (${k.firm})`:""}`; }
  if(ch.partner && s.partner) return `${ch.label} · ${s.partner}`;
  return ch.label + (s.detail?` · ${s.detail}`:"");
}
function companyLangs(c){ const set=new Set(); (c.owners||[]).forEach(o=>{ if(o.language) set.add(o.language); }); if(!set.size && c.language) set.add(c.language); return [...set]; }
function primaryLang(c){ const l=companyLangs(c); return l.length>1? "both" : (l[0]||""); }
let toastT; function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("on"),2600); }
function nowISO(){ return new Date().toISOString(); }
function opts(list, val, blank){ return (blank!==undefined?`<option value="">${esc(blank)}</option>`:"") + list.map(o=>{ const v=typeof o==="string"?o:o.v; const l=typeof o==="string"?o:o.l; return `<option value="${esc(v)}"${String(v)===String(val??"")?" selected":""}>${esc(l)}</option>`; }).join(""); }
function industryOpts(val){ return `<option value="">Choose industry…</option>`+SECTORS.map(g=>`<optgroup label="${esc(g)}">${INDUSTRIES[g].map(i=>{const v=`${g} › ${i}`; return `<option value="${esc(v)}"${v===val?" selected":""}>${esc(i)}</option>`;}).join("")}</optgroup>`).join(""); }
const sectorOf = c => (c.industry||"").split(" › ")[0] || "";
const industryShort = c => (c.industry||"").split(" › ")[1] || c.industry || "—";
const companies = ()=>[...S.companies.values()];
const contacts = ()=>[...S.contacts.values()];
function dealsFrom(contactId){ return companies().filter(c=>c.source?.contactId===contactId); }
async function copyText(t){ try{ await navigator.clipboard.writeText(t); toast("Copied to clipboard"); }catch(e){ toast("Couldn't copy – select the text and copy it manually"); } }

