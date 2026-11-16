/* ================= Phase 9: "Did you mean…?" for near-matches ================= */
const CO_STOP=new Set(["pty","ltd","limited","inc","incorporated","sa","cc","co","company","group","holdings","holding","the","rf","plc","llc","and","south","africa","za","pvt","proprietary"]);
function lev(a,b){ if(a===b) return 0; const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let prev=Array.from({length:n+1},(_,j)=>j); for(let i=1;i<=m;i++){ const cur=[i]; for(let j=1;j<=n;j++) cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); prev=cur; } return prev[n]; }
const coTokens=s=>normName(s).split(" ").filter(t=>t&&!CO_STOP.has(t));
function similarCo(a,b){
  const ta=coTokens(a), tb=coTokens(b); if(!ta.length||!tb.length) return false;
  const A=ta.join(" "), B=tb.join(" "); if(A===B) return true;
  if(A.replace(/ /g,"")===B.replace(/ /g,"")) return true;
  const [sh,lo]=ta.length<=tb.length?[ta,tb]:[tb,ta];
  if(sh[0]===lo[0] && sh.every(t=>lo.includes(t)) && sh.join("").length>=3) return true;
  const L=Math.max(A.length,B.length); return L>=5 && (1-lev(A,B)/L)>=0.8;
}
function fuzzyCompanies(name, exceptId){ const n=normName(name); if(!n||n.length<3) return []; return companies().filter(c=>c.id!==exceptId && normName(c.name)!==n && similarCo(name,c.name)).slice(0,4); }
function similarPerson(a,b){
  const ta=normName(a).split(" ").filter(Boolean), tb=normName(b).split(" ").filter(Boolean); if(!ta.length||!tb.length) return false;
  const A=ta.join(" "), B=tb.join(" "); if(A===B) return false;
  if(ta.length>=2 && tb.length>=2){ const la=ta[ta.length-1], lb=tb[tb.length-1], fa=ta[0], fb=tb[0];
    const ml=Math.min(la.length,lb.length); const lastOk= la===lb || (ml>=4 && lev(la,lb)<=(ml>=6?2:1));
    const firstOk= fa===fb || lev(fa,fb)<=2 || (Math.min(fa.length,fb.length)>=2 && (fa.startsWith(fb)||fb.startsWith(fa)));
    if(lastOk && firstOk) return true; }
  const L=Math.max(A.length,B.length); return L>=6 && (1-lev(A,B)/L)>=0.85;
}
{ const base=dupPeople;
  dupPeople=function(d, exceptId){
    const out=base(d, exceptId); if(!d.name) return out;
    contacts().forEach(k=>{ if(k.id===exceptId || out.some(h=>h.k.id===k.id)) return; if(similarPerson(d.name,k.name)) out.push({k, why:["similar name"], strong:false}); });
    return out.slice(0,5);
  };
}
function coLabel(c){ return isPartnerCo(c)? "Partner · "+(PKINDS[c.kind]||"") : c.kind==="other"? "Other company" : (grp(c)==="network"?"Prospect":STAGE[c.status]?.label||"Business"); }
{ const base=dupCheck;
  dupCheck=function(){ base(); const w=$("#dupWarn"); if(!w||w.innerHTML) return; const L=fuzzyCompanies($("#cName")?.value||"", FORM.id);
    w.innerHTML=L.map(c=>`<div>Did you mean <a href="#" data-act="open-dup" data-id="${esc(c.id)}">${esc(c.name)}</a>? (${esc(coLabel(c))})</div>`).join(""); };
}
function coSimCheck(){
  const w=$("#kCoSim"); if(!w) return; const nm=$("#kCoNew")?.value||""; const vis=!$("#kCoNewW")?.hidden;
  const ex=vis&&nm? companies().find(c=>normName(c.name)===normName(nm)) : null;
  const L=vis? fuzzyCompanies(nm) : [];
  w.innerHTML= ex? `<div>Already in Munger: <b>${esc(ex.name)}</b> (${esc(coLabel(ex))}) – they'll be linked to it.</div>` : L.map(c=>`<div>Did you mean <b>${esc(c.name)}</b> (${esc(coLabel(c))})? <button type="button" class="btn sm" data-act="co-use" data-id="${esc(c.id)}">Use this</button></div>`).join("");
}
function useCompany(id){
  const c=S.companies.get(id); if(!c) return; const want=isPartnerCo(c)?"partner":c.kind==="other"?"company":"business";
  const r=document.querySelector(`input[name=kWhere][value=${want}]`); if(r) r.checked=true; FORM.whereTouched=true;
  $("#kCoNew").value=""; fillCoPick(); $("#kCoPick").value=id; kFormUpdate(); coSimCheck(); toast(`Linked to ${c.name}`);
}
function fuzzyBox(formSel, title, msg, list, btns){
  const f=$(formSel); if(!f) return; f.style.display="none";
  const box=document.createElement("div"); box.className="dupbox"; box.id="dupBox";
  box.innerHTML=`${ovHead(title,`<button class="hbtn" data-act="dup-back">Back</button>`)}<div class="ovb"><p style="margin:0 2px 12px;font-size:15.5px">${msg}</p><div class="group">${list}</div><div style="margin-top:14px">${btns}</div></div>`;
  f.parentNode.appendChild(box);
}
{ const base=submitDeal;
  submitDeal=async function(){
    const nm=$("#cName")?.value||""; const L=FORM.coFuzzyOk? [] : fuzzyCompanies(nm, FORM.id);
    if(L.length && !dupCompany(nm, FORM.id)){
      fuzzyBox("#dealForm","Did you mean…?",`Something similar to <b>${esc(nm)}</b> is already in Munger.`,
        L.map(c=>`<div class="rowi"><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([coLabel(c),c.town].filter(Boolean).join(" · "))}</span></span><button class="btn sm primary" data-act="open-dup" data-id="${esc(c.id)}">Open it</button></div>`).join(""),
        `<button class="btn block" data-act="co-fuzzy-ok" data-k="deal">It's a different company – save it</button>`);
      return;
    }
    FORM.coFuzzyOk=false; return base();
  };
}
{ const base=submitContact;
  submitContact=async function(){
    const W=typeof whereRead==="function"? whereRead() : null;
    if(W && W.isNew && !FORM.coFuzzyOk){ const L=fuzzyCompanies(W.coName);
      if(L.length){ fuzzyBox("#contactForm","Did you mean…?",`Something similar to <b>${esc(W.coName)}</b> is already in Munger. Link them to it instead?`,
        L.map(c=>`<div class="rowi"><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc(coLabel(c))}</span></span><button class="btn sm primary" data-act="co-use-save" data-id="${esc(c.id)}">Use this</button></div>`).join(""),
        `<button class="btn block" data-act="co-fuzzy-ok" data-k="contact">It's a new company – carry on</button>`); return; } }
    return base();
  };
}
document.addEventListener("input",e=>{ if(e.target.id==="kCoNew") coSimCheck(); });
document.addEventListener("change",e=>{ if(e.target.id==="kCoPick"||e.target.name==="kWhere") setTimeout(coSimCheck,0); });
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]"); if(!t) return; const a=t.dataset.act;
  if(a==="co-use"){ e.preventDefault(); useCompany(t.dataset.id); }
  if(a==="co-use-save"){ closeDupBox(); useCompany(t.dataset.id); FORM.coFuzzyOk=false; submitContact(); }
  if(a==="co-fuzzy-ok"){ closeDupBox(); FORM.coFuzzyOk=true; if(t.dataset.k==="deal") submitDeal(); else submitContact(); }
});
