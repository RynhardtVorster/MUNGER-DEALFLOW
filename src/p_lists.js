function listRows(){
  const L=S.lists; const rows=[];
  companies().forEach(c=>{
    const g=stageOf(c.status).group; if(!L.groups.includes(g)) return;
    if(L.sector && sectorOf(c)!==L.sector) return;
    (c.owners||[]).forEach(o=>{ const lang=o.language||c.language; if(!(lang===L.lang||lang==="both")) return; if(!o.email&&!o.cell) return; rows.push({name:o.name,email:o.email||"",cell:o.cell||"",org:c.name,kind:"Business owner",lang}); });
  });
  if(L.includeContacts) contacts().forEach(k=>{ if(!tagsOf(k).some(t=>L.tiers.includes(t)) || k.doNotContact) return; if(!(k.language===L.lang||k.language==="both")) return; if(!k.email&&!k.cell) return; rows.push({name:k.name,email:k.email||"",cell:k.cell||"",org:k.firm||"",kind:`${tierOf(k)} · ${k.type||"Contact"}`,lang:k.language}); });
  const seen=new Set(); return rows.filter(r=>{const key=(r.email||r.cell).toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true;});
}
