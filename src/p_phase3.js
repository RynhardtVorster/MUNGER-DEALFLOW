/* ================= Phase 3: workflow streams, location, voice, banks, talent, history ================= */
ICON.mic='<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>';
ICON.pin='<path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>';
ICON.star='<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>';
ICON.bank='<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20.5h17"/>';
ICON.gps='<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>';
ICON.history='<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4.5l3 2"/>';

/* ---------- Gazetteer: South Africa + neighbours + key African cities ---------- */
const GAZ_LIST=[
["Johannesburg",-26.204,28.047,"Gauteng"],["Sandton",-26.107,28.057,"Gauteng"],["Rosebank",-26.146,28.041,"Gauteng"],["Randburg",-26.094,28.001,"Gauteng"],["Fourways",-26.017,28.011,"Gauteng"],["Bryanston",-26.052,28.021,"Gauteng"],["Midrand",-25.989,28.128,"Gauteng"],["Pretoria",-25.747,28.229,"Gauteng"],["Centurion",-25.860,28.189,"Gauteng"],["Roodepoort",-26.163,27.872,"Gauteng"],["Soweto",-26.267,27.858,"Gauteng"],["Kempton Park",-26.100,28.230,"Gauteng"],["Benoni",-26.188,28.321,"Gauteng"],["Boksburg",-26.212,28.262,"Gauteng"],["Germiston",-26.218,28.167,"Gauteng"],["Springs",-26.254,28.442,"Gauteng"],["Krugersdorp",-26.101,27.769,"Gauteng"],["Vereeniging",-26.673,27.926,"Gauteng"],["Vanderbijlpark",-26.700,27.837,"Gauteng"],["Cullinan",-25.672,28.521,"Gauteng"],["Bronkhorstspruit",-25.810,28.741,"Gauteng"],["Heidelberg",-26.504,28.358,"Gauteng"],["Magaliesburg",-25.995,27.542,"Gauteng"],
["Cape Town",-33.925,18.424,"Western Cape"],["Bellville",-33.900,18.630,"Western Cape"],["Durbanville",-33.833,18.647,"Western Cape"],["Constantia",-34.022,18.428,"Western Cape"],["Hout Bay",-34.043,18.355,"Western Cape"],["Stellenbosch",-33.932,18.860,"Western Cape"],["Paarl",-33.734,18.963,"Western Cape"],["Pearl Valley",-33.800,18.972,"Western Cape"],["Franschhoek",-33.913,19.121,"Western Cape"],["Wellington",-33.640,19.011,"Western Cape"],["Somerset West",-34.080,18.849,"Western Cape"],["Grabouw",-34.152,19.016,"Western Cape"],["Hermanus",-34.418,19.235,"Western Cape"],["Caledon",-34.230,19.427,"Western Cape"],["Worcester",-33.646,19.448,"Western Cape"],["Robertson",-33.802,19.884,"Western Cape"],["Bonnievale",-33.928,20.102,"Western Cape"],["Montagu",-33.785,20.122,"Western Cape"],["Swellendam",-34.022,20.442,"Western Cape"],["Ceres",-33.369,19.311,"Western Cape"],["Tulbagh",-33.287,19.138,"Western Cape"],["Malmesbury",-33.461,18.727,"Western Cape"],["Riebeek-Kasteel",-33.383,18.895,"Western Cape"],["Citrusdal",-32.590,19.014,"Western Cape"],["Clanwilliam",-32.179,18.891,"Western Cape"],["Vredenburg",-32.906,17.990,"Western Cape"],["Saldanha",-33.011,17.944,"Western Cape"],["Langebaan",-33.093,18.033,"Western Cape"],["George",-33.963,22.462,"Western Cape"],["Mossel Bay",-34.183,22.146,"Western Cape"],["Knysna",-34.036,23.048,"Western Cape"],["Plettenberg Bay",-34.053,23.372,"Western Cape"],["Oudtshoorn",-33.592,22.203,"Western Cape"],["Beaufort West",-32.357,22.583,"Western Cape"],
["Gqeberha",-33.961,25.602,"Eastern Cape"],["Kariega",-33.758,25.397,"Eastern Cape"],["East London",-33.015,27.912,"Eastern Cape"],["Mthatha",-31.589,28.784,"Eastern Cape"],["Makhanda",-33.311,26.526,"Eastern Cape"],["Jeffreys Bay",-34.049,24.910,"Eastern Cape"],["Graaff-Reinet",-32.252,24.531,"Eastern Cape"],["Komani",-31.897,26.875,"Eastern Cape"],["Port Alfred",-33.590,26.891,"Eastern Cape"],["Cradock",-32.164,25.619,"Eastern Cape"],
["Durban",-29.858,31.022,"KwaZulu-Natal"],["Umhlanga",-29.726,31.085,"KwaZulu-Natal"],["Ballito",-29.539,31.214,"KwaZulu-Natal"],["Hillcrest",-29.781,30.763,"KwaZulu-Natal"],["Pietermaritzburg",-29.601,30.379,"KwaZulu-Natal"],["Howick",-29.479,30.232,"KwaZulu-Natal"],["Richards Bay",-28.780,32.038,"KwaZulu-Natal"],["Empangeni",-28.745,31.893,"KwaZulu-Natal"],["Newcastle",-27.758,29.932,"KwaZulu-Natal"],["Ladysmith",-28.556,29.780,"KwaZulu-Natal"],["Vryheid",-27.769,30.791,"KwaZulu-Natal"],["Port Shepstone",-30.741,30.455,"KwaZulu-Natal"],
["Bloemfontein",-29.118,26.214,"Free State"],["Welkom",-27.977,26.735,"Free State"],["Bethlehem",-28.230,28.307,"Free State"],["Kroonstad",-27.650,27.234,"Free State"],["Sasolburg",-26.814,27.817,"Free State"],["Parys",-26.900,27.457,"Free State"],["Clarens",-28.517,28.422,"Free State"],["Harrismith",-28.273,29.129,"Free State"],["Ficksburg",-28.873,27.877,"Free State"],
["Rustenburg",-25.667,27.242,"North West"],["Mahikeng",-25.865,25.644,"North West"],["Potchefstroom",-26.716,27.103,"North West"],["Klerksdorp",-26.852,26.667,"North West"],["Brits",-25.634,27.780,"North West"],["Hartbeespoort",-25.744,27.861,"North West"],["Lichtenburg",-26.152,26.160,"North West"],["Zeerust",-25.538,26.075,"North West"],["Vryburg",-26.957,24.729,"North West"],
["Polokwane",-23.904,29.469,"Limpopo"],["Tzaneen",-23.833,30.163,"Limpopo"],["Hoedspruit",-24.351,30.958,"Limpopo"],["Phalaborwa",-23.943,31.141,"Limpopo"],["Mokopane",-24.194,29.010,"Limpopo"],["Bela-Bela",-24.885,28.293,"Limpopo"],["Modimolle",-24.700,28.406,"Limpopo"],["Makhado",-23.044,29.903,"Limpopo"],["Thohoyandou",-22.946,30.484,"Limpopo"],["Musina",-22.352,30.040,"Limpopo"],["Lephalale",-23.678,27.700,"Limpopo"],
["Mbombela",-25.475,30.970,"Mpumalanga"],["White River",-25.331,31.011,"Mpumalanga"],["Hazyview",-25.047,31.130,"Mpumalanga"],["eMalahleni",-25.871,29.233,"Mpumalanga"],["Middelburg",-25.775,29.464,"Mpumalanga"],["Secunda",-26.552,29.170,"Mpumalanga"],["Ermelo",-26.533,29.983,"Mpumalanga"],["Mashishing",-25.099,30.455,"Mpumalanga"],["Barberton",-25.786,31.053,"Mpumalanga"],["Malelane",-25.481,31.513,"Mpumalanga"],["Graskop",-24.932,30.842,"Mpumalanga"],["Standerton",-26.950,29.241,"Mpumalanga"],
["Kimberley",-28.739,24.764,"Northern Cape"],["Upington",-28.449,21.256,"Northern Cape"],["Springbok",-29.664,17.886,"Northern Cape"],["Kuruman",-27.453,23.432,"Northern Cape"],["Kakamas",-28.773,20.620,"Northern Cape"],["Kathu",-27.696,23.050,"Northern Cape"],["De Aar",-30.650,24.012,"Northern Cape"],
["Windhoek",-22.560,17.083,"Namibia"],["Walvis Bay",-22.957,14.505,"Namibia"],["Swakopmund",-22.678,14.527,"Namibia"],["Oshakati",-17.788,15.704,"Namibia"],["Keetmanshoop",-26.578,18.134,"Namibia"],
["Gaborone",-24.654,25.906,"Botswana"],["Francistown",-21.170,27.508,"Botswana"],["Maun",-19.983,23.416,"Botswana"],["Mbabane",-26.305,31.137,"Eswatini"],["Manzini",-26.485,31.380,"Eswatini"],["Maseru",-29.310,27.478,"Lesotho"],
["Harare",-17.829,31.052,"Zimbabwe"],["Bulawayo",-20.150,28.583,"Zimbabwe"],["Maputo",-25.966,32.573,"Mozambique"],["Beira",-19.844,34.839,"Mozambique"],["Lusaka",-15.387,28.322,"Zambia"],["Lilongwe",-13.963,33.774,"Malawi"],["Nairobi",-1.292,36.822,"Kenya"],["Dar es Salaam",-6.792,39.208,"Tanzania"],["Kigali",-1.950,30.059,"Rwanda"],["Kampala",0.347,32.582,"Uganda"],["Luanda",-8.839,13.289,"Angola"],["Lagos",6.524,3.379,"Nigeria"],["Accra",5.603,-0.187,"Ghana"],["Port Louis",-20.161,57.501,"Mauritius"],["Cairo",30.044,31.236,"Egypt"],["Casablanca",33.573,-7.589,"Morocco"]
];
const GAZ=new Map(GAZ_LIST.map(g=>[g[0].toLowerCase(),{name:g[0],lat:g[1],lng:g[2],region:g[3]}]));
const GAZ_ALIAS={"port elizabeth":"gqeberha","pe":"gqeberha","uitenhage":"kariega","nelspruit":"mbombela","witbank":"emalahleni","grahamstown":"makhanda","queenstown":"komani","lydenburg":"mashishing","louis trichardt":"makhado","joburg":"johannesburg","jozi":"johannesburg","jhb":"johannesburg","pta":"pretoria","tshwane":"pretoria","cpt":"cape town","kaapstad":"cape town","pmb":"pietermaritzburg","val de vie":"pearl valley","pearl valley golf estate":"pearl valley","umhlanga rocks":"umhlanga","plett":"plettenberg bay","mafikeng":"mahikeng","warmbaths":"bela-bela","nylstroom":"modimolle","potgietersrus":"mokopane","pietersburg":"polokwane","hartebeespoort":"hartbeespoort","jbay":"jeffreys bay"};
const PROV_C={"Western Cape":[-33.6,19.6],"Eastern Cape":[-32.4,26.4],"Northern Cape":[-29.2,21.9],"Free State":[-28.6,26.7],"KwaZulu-Natal":[-28.8,30.9],"North West":[-26.4,26.0],"Gauteng":[-26.1,28.1],"Mpumalanga":[-25.7,30.3],"Limpopo":[-23.6,29.6],"Namibia":[-22.56,17.08],"Botswana":[-24.65,25.91],"Eswatini":[-26.31,31.14]};
Object.keys(GAZ_ALIAS).forEach(a=>{ const g=GAZ.get(GAZ_ALIAS[a]); if(g) PLACES[a]=PLACES[a]||[g.name.toLowerCase(), g.region.toLowerCase()]; });
GAZ.forEach((g,k)=>{ if(!PLACES[k]) PLACES[k]=[k, g.region.toLowerCase()]; });
function gazFind(s){ s=String(s||"").trim().toLowerCase(); if(!s) return null; return GAZ.get(s)||GAZ.get(GAZ_ALIAS[s])||null; }
function geoOf(town, province, country){ const g=gazFind(town); if(g) return {lat:g.lat,lng:g.lng,exact:true,label:g.name}; const pc=PROV_C[province]; if(pc) return {lat:pc[0],lng:pc[1],exact:false,label:province}; const cc=country&&country!=="South Africa"? gazFind(({Namibia:"windhoek",Botswana:"gaborone",Eswatini:"mbabane",Lesotho:"maseru",Zimbabwe:"harare",Mozambique:"maputo",Zambia:"lusaka",Malawi:"lilongwe",Kenya:"nairobi",Mauritius:"port louis"})[country]||"") : null; return cc? {lat:cc.lat,lng:cc.lng,exact:false,label:country} : null; }
function geoK(k){ return geoOf(k.town,k.province,k.country) || (companyOf(k)? geoC(companyOf(k)) : null); }
function geoC(c){ return geoOf(c.town,c.province,c.hqCountry); }
function distKm(a,b){ const R=6371, t=x=>x*Math.PI/180; const dl=t(b.lat-a.lat), dn=t(b.lng-a.lng); const h=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
function townList(){ return `<datalist id="townList">${GAZ_LIST.map(g=>`<option value="${esc(g[0])}">${esc(g[3])}</option>`).join("")}</datalist>`; }
function autoProvince(town, province){ if(province) return province; const g=gazFind(town); return g && PROVINCES.includes(g.region)? g.region : province; }

/* ---------- Editable deal-flow channels ---------- */
function applyChannels(list){ if(!Array.isArray(list)||!list.length) return; CHANNELS=list.map(c=>({id:c.id,label:c.label,contact:c.kind==="contact",partner:c.kind==="partner",kind:c.kind||"none",archived:!!c.archived})); CHANNEL=Object.fromEntries(CHANNELS.map(c=>[c.id,c])); }
function activeChannels(cur){ return CHANNELS.filter(c=>!c.archived||c.id===cur); }
function chKind(c){ return c.kind || (c.contact?"contact":c.partner?"partner":"none"); }

/* ---------- Voice typing ---------- */
let REC=null, REC_BTN=null;
function voiceLang(){ try{ return localStorage.getItem("munger-voice")||"en-ZA"; }catch(e){ return "en-ZA"; } }
function micBtn(target){ return `<button type="button" class="mic" data-act="mic" data-for="${target}" aria-label="Speak instead of typing">${ic("mic",18)}<span>Speak</span></button>`; }
function startMic(btn){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(REC){ try{ REC.stop(); }catch(e){} return; }
  const ta=document.getElementById(btn.dataset.for); if(!ta) return;
  if(!SR){ toast("Tap the microphone on your keyboard to dictate"); ta.focus(); return; }
  const r=new SR(); r.lang=voiceLang(); r.continuous=true; r.interimResults=true;
  const base=ta.value? ta.value.replace(/\s*$/,"")+" " : ""; let fin="";
  r.onresult=e=>{ let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const t=e.results[i][0].transcript; if(e.results[i].isFinal) fin+=t.trim()+" "; else interim+=t; } ta.value=(base+fin+interim).replace(/\s+$/," "); ta.dispatchEvent(new Event("input",{bubbles:true})); };
  r.onerror=ev=>{ if(ev.error==="not-allowed"||ev.error==="service-not-allowed") toast("Voice isn't allowed here. Tap the microphone on your keyboard instead."); };
  r.onend=()=>{ REC=null; if(REC_BTN) REC_BTN.classList.remove("rec"); REC_BTN=null; ta.value=ta.value.trim(); ta.dispatchEvent(new Event("input",{bubbles:true})); };
  REC=r; REC_BTN=btn; btn.classList.add("rec");
  try{ r.start(); toast("Listening… tap Stop when done"); }catch(e){ REC=null; btn.classList.remove("rec"); toast("Tap the microphone on your keyboard to dictate"); }
}
function fldNote(id,label,value,ph,rows){ return `<div class="fld"><div class="fldh"><label for="${id}">${label}</label>${micBtn(id)}</div><textarea id="${id}" rows="${rows||3}" placeholder="${ph||""}">${esc(value||"")}</textarea></div>`; }

/* ---------- Talent, HNWI, signals ---------- */
const TALENT_ROLES=["CEO / MD","CFO / Finance","COO / Operations","Sales & marketing lead","CTO / Tech","Turnaround / hit squad","Board / NED","Specialist / technical expert"];
const AVAIL={"":"Unknown","no":"Not looking","open":"Open to the right thing","yes":"Actively looking"};
const SIGNALS=[["age","Owner 60 or older"],["nosucc","No successor in place"],["kids","Children not taking over"],["tired","Owner tired or wants out"],["dispute","Shareholder or family dispute"],["health","Health concerns"],["capital","Needs growth capital"],["approached","Approached by other buyers"]];
const KINDS={target:"Potential acquisition",financier:"Bank or funder",service:"Service provider",other:"Other"};
const isTalent=k=>!!(k.talent&&(k.talent||{}).on)||k.tier==="C"||(k.tags||[]).includes("C");
function sigCount(c){ return SIGNALS.filter(([s])=>(c.signals||{})[s]).length; }
const likelySeller=c=>sigCount(c)>=2;
function personBadges(k){ return `${isTalent(k)?`<span class="pill won">★ Talent</span>`:""}${k.hnwi?`<span class="pill A">HNWI</span>`:""}${k.doNotContact?`<span class="pill late">Do not contact</span>`:""}`; }

/* ---------- Rows ---------- */
function personRow(k){
  const n=dealsFrom(k.id).length; const cp=completeness(k).pct;
  const who=knowers(k).map(x=>x.partner.split(" ")[0]).join(", ");
  const dist=S.near?.pt && geoK(k)? Math.round(distKm(S.near.pt,geoK(k))) : null;
  return `<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)} ${stars(k.influence)}</span><span class="t2" style="display:block">${esc([workLine(k)||TIERS[tierOf(k)].label, dist!==null&&S.view==="near"?`${dist} km`:"", who].filter(Boolean).join(" · "))}</span></span><span class="trail">${isTalent(k)?`<span class="pill won">Talent</span>`:""}${k.hnwi?`<span class="pill A">HNWI</span>`:""}${n?`<span class="pill">${n} lead${n>1?"s":""}</span>`:""}${cp<50&&!isTalent(k)&&!k.hnwi?`<span class="pill soon">Add details</span>`:""}</span></button>`;
}
function bizRow(c){
  if(isPartnerCo(c)) return partnerRow(c); if(0){ const ppl=peopleAt(c); const cov=[...new Set(ppl.flatMap(k=>knowers(k).map(x=>x.partner.split(" ")[0])))];
    return `<button class="rowi" data-open="${esc(c.id)}"><span class="avatar biz">${ic("bank",20)}</span><span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${ppl.length? `${ppl.length} ${ppl.length===1?"person":"people"} we know · ${esc(cov.join(", ")||"nobody in our team linked")}` : "Nobody we know there yet"}</span></span><span class="trail">${ppl.length?`<span class="pill won">${ppl.length}</span>`:`<span class="pill late">Gap</span>`}</span></button>`; }
  const d=dueInfo(c); const o=bizContact(c); const dist=S.near?.pt && geoC(c)? Math.round(distKm(S.near.pt,geoC(c))) : null;
  return `<button class="rowi" data-open="${esc(c.id)}">${avatarB(c)}<span class="main"><span class="t1" style="display:block">${esc(c.name)}</span><span class="t2" style="display:block">${esc([industryShort(c)!=="—"?industryShort(c):"",c.town||c.province, dist!==null&&S.view==="near"?`${dist} km`:"", o?.name].filter(Boolean).join(" · ")||"No details yet")}</span></span><span class="trail">${stagePill(c.status)}${d&&isOpen(c)?`<span class="pill ${d.cls}">${esc(d.txt)}</span>`:likelySeller(c)?`<span class="pill soon">Likely seller</span>`:fitPill(c)}</span></button>`;
}

/* ---------- Today ---------- */
function newRow(r){ const x=r.x; const by=r.k==="company"? x.createdByName : (S.members.find(m=>m.user_id===x.createdBy)?.name||"");
  const who=x.createdBy&&x.createdBy===S.uid? "you" : (by||"the team"); const what=r.k==="company"? (["target","active"].includes(grp(x))?"Target":"Prospect") : "";
  const h=r.k==="company"?bizRow(x):personRow(x);
  return h.replace(/(<span class="t2" style="display:block">)/, `$1<span class="addedby">${esc([`added by ${who}`,fmtD((x.createdAt||"").slice(0,10))].filter(Boolean).join(" · "))}</span><br>`); }
function thanksDue(){ return contacts().filter(k=>{ const ds=dealsFrom(k.id); if(!ds.length) return false; const last=(k.thanks||[]).map(t=>t.d).sort().pop()||""; return ds.some(c=>(c.createdAt||"").slice(0,10)>last); }); }
function vToday(){
  const first=(S.me?.name||"").split(" ")[0];
  const d=new Date(); const dateTxt=`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]} ${d.getDate()} ${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]}`;
  const mine=S.scope==="mine"; const me=myPartner();
  const open=companies().filter(isOpen); const pool=mine? open.filter(isMine) : open;
  const kpool=peopleCheckins(mine); const pool2=[...pool,...kpool];
  const due=pool2.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n<=7;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const soon=pool2.filter(c=>{const n=daysUntil(c.nextCheckIn); return n!==null&&n>7&&n<=30;}).sort((a,b)=>a.nextCheckIn.localeCompare(b.nextCheckIn));
  const targets=companies().filter(c=>!isPartnerCo(c)&&["target","active"].includes(grp(c))&&(!mine||isMine(c))).length;
  const ppl=mine? contacts().filter(isMineK) : contacts();
  const newNet=companies().filter(c=>grp(c)==="network" && isAcq(c) && daysSince(c.createdAt)<=21).length;
  const cm=S.commitments.filter(x=>x.status==="open" && (!mine || x.owner===me)).sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999"));
  const weak=contacts().filter(k=>isMineK(k)||k.createdBy===S.uid).map(k=>({k,c:completeness(k)})).filter(x=>x.c.pct<60).sort((a,b)=>a.c.pct-b.c.pct).slice(0,4);
  const thx=thanksDue().filter(k=>!mine||isMineK(k)).slice(0,4);
  const recent=[...companies().filter(c=>isAcq(c) && !["Munger setup","Munger"].includes(c.createdByName||"")).map(x=>({k:"company",x})),...contacts().map(x=>({k:"contact",x}))].filter(r=>daysSince(r.x.createdAt)<=14).sort((a,b)=>(b.x.createdAt||"").localeCompare(a.x.createdAt||"")).slice(0,8);
  const overdue=due.filter(c=>daysUntil(c.nextCheckIn)<0).length;
  return `<div class="ph"><div><div class="eyebrow">${esc(dateTxt)}</div><h1>${greet()}${first?`, ${esc(first)}`:""}</h1></div></div>
  <a class="askbar" href="#ask">${ic("spark",20)}<span>What do you need? Ask the network…</span></a>
  <div class="seg" role="tablist"><button class="${mine?"on":""}" data-act="scope" data-k="mine">Mine</button><button class="${!mine?"on":""}" data-act="scope" data-k="team">Whole team</button></div>
  <div class="stats">
    <a class="stat ${overdue?"alert":""}" href="#checkins"><span class="n">${due.length}</span><span class="l">Check-ins this week</span></a>
    <a class="stat" href="#businesses" data-act="biz-targets"><span class="n">${targets}</span><span class="l">Targets & discussions</span></a>
    <a class="stat" href="#people"><span class="n">${ppl.length}</span><span class="l">${mine?"People I know":"People tagged"}</span></a>
  </div>
  <div class="quick"><a class="act" href="#near">${ic("pin",18)}Map</a><a class="act" href="#partners">${ic("bank",18)}Partners</a><a class="act" href="#talent">${ic("star",18)}Talent</a></div>
  ${targetsBlock(mine)}
  <div class="sec"><h2>To call this week</h2>${due.length?`<a href="#checkins">All</a>`:""}</div>
  ${due.length? due.slice(0,5).map(anyDueCard).join("")+(due.length>5?`<a class="btn block" href="#checkins" style="margin-top:4px">See all ${due.length} check-ins</a>`:"") : `<div class="card empty"><b>You're up to date</b>${soon.length?`Next up: ${esc(soon[0].name)} on ${esc(fmtD(soon[0].nextCheckIn))}.`:"Set check-ins on targets you like and on people you want to stay close to."}</div>`}
  ${cm.length?`<div class="sec"><h2>${mine?"My commitments":"Team commitments"}</h2><a href="#meeting">Meeting</a></div><div class="group">${cm.slice(0,5).map(cmtRow).join("")}</div>`:""}
  ${thx.length?`<div class="sec"><h2>Say thank you</h2></div><div class="group">${thx.slice(0,4).map(k=>`<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">Introduced ${dealsFrom(k.id).length} lead${dealsFrom(k.id).length>1?"s":""} · ${(k.thanks||[]).length?"last thanked "+fmtD((k.thanks||[]).map(t=>t.d).sort().pop()):"not thanked yet"}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`).join("")}</div>`:""}
  ${newNet?`<div class="sec"><h2>New prospects</h2><a href="#businesses" data-act="biz-network">Review</a></div><div class="card box tag">${newNet} prospect${newNet>1?"s":""} added in the last three weeks. Open one and tap <b>Make it a target</b> if we want to go for it.</div>`:""}
  ${weak.length?`<div class="sec"><h2>Make these profiles stronger</h2></div><div class="group">${weak.slice(0,3).map(({k,c})=>`<button class="rowi" data-act="complete-profile" data-id="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">Add ${esc(c.missing.slice(0,3).join(", "))}</span></span><span class="trail"><span class="pill soon">${c.pct}%</span></span></button>`).join("")}</div>`:""}
  ${soon.length?`<div class="sec"><h2>Coming up</h2></div><div class="group">${soon.slice(0,4).map(anyRow).join("")}</div>`:""}
  ${recent.length?`<div class="sec"><h2>New in the network</h2><span class="tag">last 2 weeks</span></div><div class="group">${recent.slice(0,5).map(r=>newRow(r)).join("")}</div>`:""}
  <div style="text-align:center;margin-top:18px"><button class="btn sm" data-act="copy-week">Copy my week for WhatsApp</button></div>`;
}
function myWeekText(){
  const me=myPartner(); const due=companies().filter(c=>isOpen(c)&&isMine(c)&&daysUntil(c.nextCheckIn)!==null&&daysUntil(c.nextCheckIn)<=7);
  const kd=peopleCheckins(true).filter(k=>daysUntil(k.nextCheckIn)<=7);
  const cm=S.commitments.filter(x=>x.status==="open"&&x.owner===me); const thx=thanksDue().filter(isMineK);
  return `MUNGER · ${me||"My"} week (${fmtD(today())})\n\nCheck-ins\n${due.map(c=>`• ${c.name}${bizContact(c)?.name?` – ${bizContact(c).name}`:""} (${dueInfo(c).txt})`).join("\n")||"• None"}${kd.length?`\n\nPeople to check in with\n${kd.map(k=>`• ${k.name}${k.checkInNote?` – ${k.checkInNote}`:""} (${dueInfo(k).txt})`).join("\n")}`:""}\n\nCommitments\n${cm.map(x=>`• ${x.action}${x.due?` (by ${fmtD(x.due)})`:""}`).join("\n")||"• None"}${thx.length?`\n\nSay thank you\n${thx.map(k=>`• ${k.name}`).join("\n")}`:""}`;
}

/* ---------- People ---------- */
function vPeople(){
  const k=S.k, q=k.q.trim().toLowerCase(); const me=myPartner(); const all=contacts();
  const special={top:()=>true, talent:isTalent, hnwi:x=>x.hnwi, ceo:isCEO, pol:x=>!!x.publicRole, "pr:Sportsperson":x=>(x.profiles||[]).includes("Sportsperson"), "pr:Artist":x=>(x.profiles||[]).includes("Artist"), "pr:Influencer":x=>(x.profiles||[]).includes("Influencer"), "pr:Doctor / medical":x=>(x.profiles||[]).includes("Doctor / medical")};
  const arr=all.filter(c=>{ if(special[k.tier]){ if(!special[k.tier](c)) return false; } else if(k.tier&&!hasTag(c,k.tier)) return false; if(k.mine&&!isMineK(c)) return false; if(q){ const co=companyOf(c); const h=[c.name,c.firm,c.title,c.email,c.cell,c.town,c.province,c.country,c.notes,c.type,c.industry,c.expertise,c.companyRole,co?.name,knowsTxt(c),(c.talent?.roles||[]).join(" "),c.talent?.sectors,c.wealthSource].join(" ").toLowerCase(); if(!h.includes(q)) return false; } return true; })
    .sort((a,b)=> k.tier==="top"? influenceScore(b)-influenceScore(a) : k.tier==="talent"? (Number(b.talent?.rating)||0)-(Number(a.talent?.rating)||0) : (a.name||"").localeCompare(b.name||"",undefined,{sensitivity:"base"}));
  if(k.tier==="top") arr.splice(50);
  const cnt=t=>all.filter(c=>hasTag(c,t)).length;
  const chip=(t,l,n)=>`<button class="chip ${k.tier===t?"on":""}" data-act="k-tier" data-k="${t}">${l}${n!==undefined?` <span class="n">${n}</span>`:""}</button>`;
  let body="";
  if(!arr.length) body=`<div class="card empty">${all.length?"<b>Nobody matches</b>Try a different search or filter, or use Ask the network.":`<b>Your network starts here</b>Add the people who matter, one at a time.<div style="margin-top:14px"><button class="btn primary" data-act="new-contact">${ic("plus",18)} Add a person</button></div>`}</div>`;
  else { let last=""; const parts=[]; let buf=[]; const flush=()=>{ if(buf.length){ parts.push(`<div class="group">${buf.join("")}</div>`); buf=[]; } };
    for(const c of arr){ const L=(c.name||"#")[0].toUpperCase(); const letter=/[A-Z]/.test(L)?L:"#"; if(!special[k.tier] && letter!==last && arr.length>12){ flush(); parts.push(`<div class="letter">${letter}</div>`); last=letter; } buf.push(personRow(c)); }
    flush(); body=parts.join(""); }
  return `<div class="ph"><div><h1>People</h1><p>${all.length} in the network · A ${cnt("A")} · B ${cnt("B")} · C ${cnt("C")} · D ${cnt("D")}</p></div><button class="btn sm primary" data-act="new-contact">${ic("plus",18)} Add</button></div>
  <div class="search">${ic("search",20)}<input id="kq" type="search" placeholder="Search name, company, skill, town…" value="${esc(k.q)}" autocomplete="off" aria-label="Search people"></div>
  <div class="chips">${chip("","All",all.length)}${chip("A","A · Owners",cnt("A"))}${chip("B","B · Employees",cnt("B"))}${chip("C","C · Potential hires",cnt("C"))}${chip("D","D · Great contacts",cnt("D"))}${chip("top","★ Most influential")}${chip("talent","Talent",all.filter(isTalent).length)}${chip("hnwi","HNWI",all.filter(x=>x.hnwi).length)}${chip("ceo","CEOs & MDs",all.filter(isCEO).length)}${["Doctor / medical","Sportsperson","Artist","Influencer"].map(p=>chip("pr:"+p,PROFILE_PL[p],all.filter(x=>(x.profiles||[]).includes(p)).length)).join("")}${chip("pol","Public / political",all.filter(x=>x.publicRole).length)}${me?`<button class="chip ${k.mine?"on":""}" data-act="k-mine">People I know</button>`:""}</div>
  ${k.tier==="top"?`<p class="tag" style="margin:-4px 2px 10px">Ranked by your influence rating, how many of our team know them, friendships and the leads they've brought in.</p>`:""}
  ${body}`;
}

/* ---------- Businesses (acquisitions vs banks & funders) ---------- */
function filteredDeals(){
  const f=S.f, q=f.q.trim().toLowerCase(); const kind=S.view==="funders"?"financier":"target";
  return companies().filter(c=>{
    if(kind==="financier"? !isPartnerCo(c) : isPartnerCo(c)) return false;
    const g=grp(c);
    if(kind!=="financier"){ if(f.group==="likely"){ if(!likelySeller(c)||g==="closed"||g==="won") return false; } else if(f.group && g!==f.group) return false; }
    if(f.mine && !isMine(c)) return false;
    if(f.sector && sectorOf(c)!==f.sector) return false;
    if(f.partner && c.partner!==f.partner) return false;
    if(f.province && c.province!==f.province) return false;
    if(f.channel && c.source?.channel!==f.channel) return false;
    if(f.lang){ const ls=companyLangs(c); if(!(ls.includes(f.lang)||ls.includes("both"))) return false; }
    if(q){ const hay=[c.name,c.tradingAs,c.town,c.province,c.industry,c.notes,c.partner,sourceText(c),...(c.owners||[]).flatMap(o=>[o.name,o.email,o.cell]),...peopleAt(c).map(k=>k.name)].join(" ").toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  }).sort((a,b)=>{ if(kind==="financier") return peopleAt(b).length-peopleAt(a).length || a.name.localeCompare(b.name); const x=a.nextCheckIn||"9999", y=b.nextCheckIn||"9999"; return x.localeCompare(y) || (a.name||"").localeCompare(b.name||""); });
}
function vBusinesses(){
  const f=S.f; const kind=S.view==="funders"?"financier":"target"; const arr=filteredDeals();
  const acq=companies().filter(c=>!isPartnerCo(c)); const n=g=>acq.filter(c=>grp(c)===g).length;
  const nf=["sector","partner","province","channel","lang"].filter(x=>f[x]).length;
  const head=`<div class="seg"><button class="${kind!=="financier"?"on":""}" data-act="f-kind" data-k="target">Acquisitions</button><button class="${kind==="financier"?"on":""}" data-act="f-kind" data-k="financier">Banks & funders</button></div>`;
  if(kind==="financier"){
    const fin=companies().filter(c=>isPartnerCo(c)); const gaps=fin.filter(c=>!peopleAt(c).length).length;
    return `<div class="ph"><div><h1>Banks & funders</h1><p>Our relationships for financing deals. ${gaps?`${gaps} with nobody we know yet.`:"Every funder has a way in."}</p></div><button class="btn sm primary" data-act="new-funder">${ic("plus",18)} Add</button></div>${head}
    <div class="search">${ic("search",20)}<input id="fq" type="search" placeholder="Search bank, person…" value="${esc(f.q)}" autocomplete="off" aria-label="Search funders"></div>
    ${arr.length?`<div class="group">${arr.map(bizRow).join("")}</div>`:`<div class="card empty">No funders match.</div>`}
    <p class="tag" style="margin:12px 2px">Open a bank and tap “+ Add someone who works here” for every banker, credit or leveraged-finance contact you have. Ask the network will then find them when a deal needs funding.</p>`;
  }
  return `<div class="ph"><div><h1>Businesses</h1><p>Companies in our network, the ones we like, and where we stand.</p></div><button class="btn sm primary" data-act="new-deal">${ic("plus",18)} Add</button></div>${head}
  <div class="search">${ic("search",20)}<input id="fq" type="search" placeholder="Search business, owner, town…" value="${esc(f.q)}" autocomplete="off" aria-label="Search businesses"></div>
  <div class="chips">
    ${[["target","Targets"],["active","In discussions"],["network","In our network"],["likely","Likely sellers"],["won","Deal done"],["closed","Closed"],["","All"]].map(([g,l])=>`<button class="chip ${f.group===g?"on":""}" data-act="f-group" data-k="${g}">${l} <span class="n">${g==="likely"?acq.filter(c=>likelySeller(c)&&!["closed","won"].includes(grp(c))).length:g?n(g):acq.length}</span></button>`).join("")}
    ${myPartner()?`<button class="chip ${f.mine?"on":""}" data-act="f-mine">Mine</button>`:""}
    <button class="chip ${nf?"on":""}" data-act="f-sheet">${ic("sliders",16)} Filters${nf?` · ${nf}`:""}</button>
  </div>
  ${arr.length? `<div class="group">${arr.map(bizRow).join("")}</div>` : `<div class="card empty">${f.group==="target"?"<b>No targets yet</b>Open a business that's in our network and tap <b>We like it</b>.":"<b>Nothing here</b>Try another tab or clear the filters."}</div>`}
  ${arr.length?`<div style="text-align:center;margin-top:14px"><button class="btn sm" data-act="export-deals">${ic("dl",18)} Download this list</button></div>`:""}`;
}
function vFunders(){ return vBusinesses(); }

/* ---------- Near me ---------- */
function vNear(){
  const N=S.near||(S.near={town:"",pt:null,radius:50,label:""});
  const rad=N.radius;
  let body="";
  if(!N.pt) body=`<div class="card empty"><b>Where are you?</b>Type a town or use your phone's location to see who in the network is close by.</div>`;
  else {
    const near=(arr,geo)=>arr.map(x=>({x,g:geo(x)})).filter(r=>r.g).map(r=>({x:r.x,d:distKm(N.pt,r.g),exact:r.g.exact})).filter(r=>r.d<=rad).sort((a,b)=>a.d-b.d);
    const ppl=near(contacts(),geoK), biz=near(companies().filter(isAcq),geoC), fin=near(companies().filter(c=>isPartnerCo(c)),geoC);
    const unknown=contacts().filter(k=>!geoK(k)).length;
    body=`<div class="card box"><div class="lbl">Within ${rad} km of ${esc(N.label)}</div><div>${ppl.length} people · ${biz.length} businesses · ${fin.length} partners</div>${unknown?`<div class="tag">${unknown} people have no town captured yet, so they can't show here.</div>`:""}</div>
    ${ppl.length?`<div class="sec"><h2>People</h2><span class="tag">${ppl.length}</span></div><div class="group">${ppl.slice(0,60).map(r=>personRow(r.x)).join("")}</div>`:""}
    ${biz.length?`<div class="sec"><h2>Businesses</h2><span class="tag">${biz.length}</span></div><div class="group">${biz.slice(0,40).map(r=>bizRow(r.x)).join("")}</div>`:""}
    ${fin.length?`<div class="sec"><h2>Partners</h2></div><div class="group">${fin.map(r=>bizRow(r.x)).join("")}</div>`:""}
    ${!ppl.length&&!biz.length?`<div class="card empty">Nobody captured within ${rad} km yet. Try a bigger radius.</div>`:""}`;
  }
  return `<div class="ph"><div><h1>Near me</h1><p>Who in our network is close by, and who knows them.</p></div></div>
  <form id="nearForm" class="nearform"><input id="nearTown" list="townList" placeholder="Town or city, e.g. Pretoria" value="${esc(N.town)}" autocomplete="off" aria-label="Town or city">${townList()}<button type="submit" class="btn primary">Show</button></form>
  <button class="btn block" data-act="near-gps" style="margin:10px 0 12px">${ic("gps",18)} Use my location</button>
  <div class="chips">${[10,25,50,100,250,500].map(r=>`<button class="chip ${rad===r?"on":""}" data-act="near-rad" data-k="${r}">${r} km</button>`).join("")}</div>
  ${body}`;
}

/* ---------- Talent bench ---------- */
function vTalent(){
  const T=S.tal||(S.tal={role:""});
  const list=contacts().filter(isTalent).filter(k=>!T.role||((k.talent||{}).roles||[]).includes(T.role)).sort((a,b)=>(Number((b.talent||{}).rating)||0)-(Number((a.talent||{}).rating)||0)||a.name.localeCompare(b.name));
  return `<div class="ph"><div><h1>Talent bench</h1><p>People we'd love to build businesses with: future CEOs, CFOs and the hit squad we'd send in.</p></div><button class="btn sm primary" data-act="new-talent">${ic("plus",18)} Add</button></div>
  <div class="chips"><button class="chip ${!T.role?"on":""}" data-act="tal-role" data-k="">All <span class="n">${contacts().filter(isTalent).length}</span></button>${TALENT_ROLES.map(r=>`<button class="chip ${T.role===r?"on":""}" data-act="tal-role" data-k="${esc(r)}">${esc(r)} <span class="n">${contacts().filter(k=>isTalent(k)&&((k.talent||{}).roles||[]).includes(r)).length}</span></button>`).join("")}</div>
  ${list.length?`<div class="group">${list.map(k=>`<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)} ${stars((k.talent||{}).rating)}</span><span class="t2" style="display:block">${esc([((k.talent||{}).roles||[]).join(", "), (k.talent||{}).sectors, workLine(k)].filter(Boolean).join(" · "))}</span></span><span class="trail">${(k.talent||{}).availability?`<span class="pill ${(k.talent||{}).availability==="yes"?"won":(k.talent||{}).availability==="open"?"soon":""}">${esc(AVAIL[(k.talent||{}).availability])}</span>`:""}</span></button>`).join("")}</div>`:`<div class="card empty"><b>No talent captured yet</b>Met someone who thinks like us? Open their profile, tap Edit, and tick “We'd love to work with them”.</div>`}`;
}

/* ---------- More ---------- */
function vMore(){
  const item=(href,icn,t,s)=>`<a class="rowi" href="${href}"><span class="avatar biz">${ic(icn,20)}</span><span class="main"><span class="t1" style="display:block">${t}</span><span class="t2" style="display:block">${s}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</a>`;
  return `<div class="ph"><div><h1>More</h1></div></div>
  <div class="group">
   ${item("#ask","spark","Ask the network","Who should we talk to for…")}
   ${item("#near","pin","Map","Who's connected to a town, province or country")}
   ${item("#partners","bank","Partners","Banks, accountants, lawyers and advisors who help us do deals")}
   ${item("#talent","star","Talent bench","Future CEOs, CFOs and the hit squad")}
   ${item("#meeting","flag","Target meeting","Scorecard, commitments, chase / keep warm / drop")}
   ${item("#checkins","cal","Check-ins","Who to call and when")}
   ${item("#network","net","Network map","Our team, people, partners and businesses, connected")}
   ${item("#lists","send","Mail lists","Afrikaans and English recipient lists")}
   ${item("#settings","gear","Team & settings","Team members, channels, logins, privacy")}
  </div>
  <div class="sec"><h2>Export</h2></div>
  <div class="group">
   <button class="rowi" data-act="export-deals-all"><span class="avatar biz">${ic("dl",20)}</span><span class="main"><span class="t1" style="display:block">All businesses</span><span class="t2" style="display:block">CSV for Excel</span></span></button>
   <button class="rowi" data-act="export-contacts"><span class="avatar biz">${ic("dl",20)}</span><span class="main"><span class="t1" style="display:block">All people</span><span class="t2" style="display:block">CSV for Excel</span></span></button>
  </div>
  <div style="margin-top:22px"><button class="btn block danger" data-act="sign-out">${ic("out",18)} Sign out</button></div>
  <p class="tag" style="text-align:center;margin-top:14px">Signed in as ${esc(S.me?.email||S.session?.user?.email||"")}</p>`;
}

/* ---------- Settings (adds channels, voice, privacy) ---------- */
function vSettings(){
  const p=[...S.partners]; p.push(""); while(p.length<4) p.push(""); const admin=S.me?.is_admin;
  const chs=S.chDraft||CHANNELS.map(c=>({id:c.id,label:c.label,kind:chKind(c),archived:!!c.archived}));
  return `<div class="ph"><div><h1>Team & settings</h1></div></div>
  <div class="fsec">Munger team</div>
  <div class="fields">${p.map((n,i)=>`<div class="fld"><label for="p${i}">Team member ${i+1}</label><input id="p${i}" value="${esc(n)}" ${admin?"":"disabled"}></div>`).join("")}</div>
  ${admin?`<div style="margin-top:10px"><button class="btn block" data-act="save-partners">Save team names</button></div>`:""}
  <div class="fsec">Deal-flow channels</div>
  <p class="tag" style="margin:0 2px 8px">The workstreams new businesses come from, like the Pearl Valley roadshow or Hatstone's clients. ${admin?"Rename, add or switch off channels. Switched-off channels stay on old records.":"Only an admin can change these."}</p>
  <div class="group">${chs.map((c,i)=>`<div class="chrow ${c.archived?"off":""}"><input id="chL${i}" value="${esc(c.label)}" ${admin?"":"disabled"} aria-label="Channel name"><select id="chK${i}" ${admin?"":"disabled"} aria-label="What to ask"><option value="none"${c.kind==="none"?" selected":""}>No follow-up question</option><option value="contact"${c.kind==="contact"?" selected":""}>Ask who referred it</option><option value="partner"${c.kind==="partner"?" selected":""}>Ask which team member</option></select>${admin?`<label class="chon"><input type="checkbox" id="chA${i}" ${c.archived?"":"checked"}> On</label>`:""}</div>`).join("")}</div>
  ${admin?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><button class="btn" data-act="ch-add">+ Add channel</button><button class="btn primary" data-act="ch-save">Save channels</button></div>`:""}
  <div class="fsec">Team logins</div>
  <div class="group">${S.members.map(m=>`<div class="rowi"><span class="avatar biz">${esc(initials(m.name||m.email))}</span><span class="main"><span class="t1" style="display:block">${esc(m.name||m.email)}${m.is_admin?` <span class="pill">Admin</span>`:""}</span><span class="t2" style="display:block">${esc(m.email)}</span></span>${admin&&m.user_id!==S.uid?`<button class="btn sm danger" data-act="remove-member" data-id="${esc(m.user_id)}">Remove</button>`:""}</div>`).join("")}</div>
  ${admin?`<div class="fsec">Add a team member</div><div class="fields"><div class="fld"><label for="mName">Name</label><input id="mName" autocomplete="off"></div><div class="fld"><label for="mEmail">Email</label><input id="mEmail" type="email" autocomplete="off" autocapitalize="off"></div><div class="fld"><label for="mPw">Temporary password</label><input id="mPw" autocomplete="off" value="${esc(tempPw())}"></div></div>
   <label class="check"><input type="checkbox" id="mAdmin"> Admin (can add team members and edit channels)</label>
   <button class="btn primary block" data-act="add-member">Add team member</button>`:""}
  <div class="fsec">Voice notes</div>
  <div class="fields"><div class="fld"><label for="voiceLang">Language I speak my notes in</label><select id="voiceLang">${opts([{v:"en-ZA",l:"English (South Africa)"},{v:"af-ZA",l:"Afrikaans"}],voiceLang())}</select></div></div>
  <p class="tag" style="margin:6px 2px 0">If the Speak button doesn't work on your phone, tap the microphone on your keyboard: it does the same.</p>
  <div class="fsec">Privacy (POPIA)</div>
  <div class="card box" style="font-size:14.5px;gap:6px"><div>We keep business contact details of people we know, for building relationships, financing and recruitment. Only the Munger team can see them.</div><div>If someone asks us not to contact them, open their profile, tap Edit and tick <b>Do not contact</b>. If they ask to be removed, delete their profile. Every edit is recorded with who made it and when.</div><div class="tag">Have your attorney confirm this notice before wider use.</div></div>
  <div class="fsec">Your login</div>
  <div class="fields"><div class="fld"><label for="newPw">New password</label><input id="newPw" type="password" autocomplete="new-password" placeholder="At least 8 characters"></div></div>
  <div style="margin-top:10px;display:grid;gap:10px"><button class="btn block" data-act="change-pw">Change password</button><button class="btn block danger" data-act="sign-out">Sign out</button></div>`;
}

/* ---------- Edit history ---------- */
const FIELD_LABELS={name:"name",tier:"A/B/C tag",type:"type",firm:"company",partner:"lead partner",company_id:"company",company_role:"role at company",owns_company_id:"company",cell:"cell",email:"email",language:"language",province:"province",town:"town",notes:"notes",title:"job title",country:"country",industry:"industry",expertise:"skills",linkedin:"LinkedIn",influence:"influence",talent:"talent profile",hnwi:"HNWI",wealth_source:"wealth source",do_not_contact:"do-not-contact",thanks:"thank-yous",log:"notes",past_roles:"past roles",trading_as:"trading name",website:"website",ebit:"EBIT estimate",turnover:"turnover",employees:"employees",owners:"owners",source_channel:"source",source_contact_id:"referrer",source_partner:"source partner",source_detail:"source detail",status:"stage",follow_up_months:"check-in schedule",next_check_in:"next check-in",last_contact:"last contact",hq_country:"head office",footprint:"footprint",countries:"countries",reg_no:"reg no",ebit_confirmed:"confirmed EBIT",turnover_confirmed:"confirmed turnover",financials_year:"financial year",fit:"mandate fit",kind:"kind",signals:"sale signals",example:"example"};
S.hist=S.hist||{};
async function loadHistory(id){
  const {data,error}=await sb.from("changes").select("action,fields,changed_by_name,at").eq("row_id",id).order("at",{ascending:false}).limit(25);
  if(error){ console.warn(error); return; } S.hist[id]={at:Date.now(), rows:data||[]}; const box=document.getElementById("hist-"+id); if(box) box.innerHTML=histHTML(id);
}
function histHTML(id){
  const h=S.hist[id]; if(!h) return `<div class="tag" style="padding:12px 14px">Loading…</div>`; if(!h.rows.length) return `<div class="tag" style="padding:12px 14px">No changes recorded yet.</div>`;
  return h.rows.map(r=>`<div class="e"><small>${esc(fmtD(String(r.at).slice(0,10)))}${r.changed_by_name?` · ${esc(r.changed_by_name)}`:""}</small>${r.action==="created"?"Added":r.action==="deleted"?"Deleted":"Changed "+esc([...new Set((r.fields||[]).map(f=>FIELD_LABELS[f]||f.replace(/_/g," ")))].join(", "))}</div>`).join("");
}
function histBlock(id, updatedAt, by){ if(!S.hist[id] || Date.now()-S.hist[id].at>20000) setTimeout(()=>loadHistory(id),0);
  return `<div class="fsec">Last updated</div><div class="card box" style="gap:2px"><div><b>${esc(fmtD(String(updatedAt||"").slice(0,10)))}</b>${by?` by ${esc(by)}`:""}</div></div><details class="histd"><summary>${ic("history",16)} Change history</summary><div class="group log" id="hist-${esc(id)}" style="margin-top:8px">${histHTML(id)}</div></details>`; }

/* ---------- Warmest way in ---------- */
const REL_W={friend:3,family:3,business:2,acquaintance:1,"":1};
function wayIn(c){
  const routes=[];
  peopleAt(c).forEach(k=>knowers(k).forEach(x=>routes.push({w:REL_W[x.relation]*2+(OWNER_ROLES.includes(k.companyRole)?2:0), partner:x.partner, via:null, to:k, txt:`${RELS[x.relation]||"knows"}`})));
  const sk=c.source?.contactId? S.contacts.get(c.source.contactId) : null;
  if(sk && !peopleAt(c).includes(sk)) knowers(sk).forEach(x=>routes.push({w:REL_W[x.relation]+1, partner:x.partner, via:sk, to:null, txt:"introduced it"}));
  const g=geoC(c); const sect=sectorOf(c);
  contacts().filter(k=>tierOf(k)==="B" && k.id!==sk?.id && !peopleAt(c).includes(k) && knowers(k).length).map(k=>{ const gk=geoK(k); const d=g&&gk? distKm(g,gk) : 9999; const ind=sect && (k.industry||"").startsWith(sect); return {k,d,ind}; }).filter(r=>r.d<=80||r.ind).sort((a,b)=>(b.ind-a.ind)||(a.d-b.d)).slice(0,3)
    .forEach(r=>knowers(r.k).slice(0,1).forEach(x=>routes.push({w:REL_W[x.relation]*0.5, partner:x.partner, via:r.k, to:null, txt:`could introduce${r.d<9999?` (${Math.round(r.d)} km away)`:""}${r.ind?" · same industry":""}`, possible:true})));
  return routes.sort((a,b)=>b.w-a.w).slice(0,6);
}
function wayInHTML(c){
  const r=wayIn(c);
  if(!r.length) return `<div class="card box tag">No way in yet. Add the people we know here, or ask the people we know near ${esc(c.town||"this business")} for an introduction.</div>`;
  return `<div class="group">${r.map(x=>`<div class="rowi" style="min-height:54px"><span class="main"><span class="t1 route" style="display:block;white-space:normal">${esc(x.partner)} → ${x.via?`<a href="#" data-contact="${esc(x.via.id)}">${esc(x.via.name)}</a>${x.to?" → ":""}`:""}${x.to?`<a href="#" data-contact="${esc(x.to.id)}">${esc(x.to.name)}</a>`:x.via?"":""}${!x.via&&!x.to?"":""}${!x.via&&x.to?"":""}${x.via&&!x.to?` → ${esc(c.name)}`:""}</span><span class="t2" style="display:block">${esc(x.to?`${x.to.companyRole||"works here"} · ${x.txt}`:x.txt)}</span></span>${x.possible?`<span class="pill">Possible</span>`:`<span class="pill ${x.w>=6?"won":"soon"}">${x.w>=6?"Warm":"OK"}</span>`}</div>`).join("")}</div>`;
}

/* ---------- Detail sheet ---------- */
function renderSheet(){
  const el=$("#sheet"); const D=S.sheet; if(!D) return;
  const keepNote=el.querySelector("#noteTxt")?.value||""; const st=el.querySelector(".ovb")?.scrollTop||0; const histOpen=el.querySelector(".histd")?.open;
  const ro=S.readOnly;
  if(D.kind==="company"){
    const c=S.companies.get(D.id); if(!c){ closeSheet(); return; }
    const fin=isPartnerCo(c);
    const due=dueInfo(c); const o=bizContact(c); const src=c.source||{}; const sk=src.contactId?S.contacts.get(src.contactId):null;
    const ppl=peopleAt(c); const fp=fitPct(c); const g=grp(c);
    el.innerHTML=`${ovHead(c.name,null,ro?"":`<button class="hbtn" data-act="edit-deal" data-id="${esc(c.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${fin?`<span class="avatar biz lg">${ic(pkIcon(c),30)}</span>`:avatarB(c,true)}<h2>${esc(c.name)}</h2><div class="sub">${esc([fin?"Partner · "+(PKINDS[c.kind]||""):(industryShort(c)!=="—"?industryShort(c):""),[c.town,c.province].filter(Boolean).join(", "),c.hqCountry&&c.hqCountry!=="South Africa"?c.hqCountry:""].filter(Boolean).join(" · ")||"No details yet")}</div><div class="pills">${fin||c.kind==="other"?"":stagePill(c.status)}${c.partner&&c.kind!=="other"?`<span class="pill">${esc(c.partner)}</span>`:""}${fin||c.kind==="other"?"":fitPill(c)}${!fin&&likelySeller(c)?`<span class="pill soon">Likely seller</span>`:""}${c.kind==="other"?`<span class="pill">Network company – not to buy</span>${c.kindNote?`<span class="pill">${esc(c.kindNote)}</span>`:""}`:""}</div></div>
    <div class="bigacts">
      <a class="bigact" ${o?.cell?`href="${esc(telHref(o.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${o?.cell?`href="${esc(waHref(o.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${o?.email?`href="mailto:${esc(o.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      ${g==="network"&&!fin&&c.kind!=="other"?`<button class="bigact" data-act="like" data-id="${esc(c.id)}" ${ro?'aria-disabled="true"':""}><span style="font-size:20px;line-height:22px">★</span>Like</button>`:c.kind==="other"?`<button class="bigact" data-act="link19" data-mode="c" data-id="${esc(c.id)}" ${ro?'aria-disabled="true"':""}>${ic("plus",22)}Add person</button>`:`<button class="bigact" data-act="quick-checkin" data-id="${esc(c.id)}" ${ro||(!c.nextCheckIn&&fin)?'aria-disabled="true"':""}>${ic("check",22)}Check in</button>`}
    </div>
    ${!fin&&c.kind!=="other"&&g==="network"?`<div class="card box likebox"><div class="lbl">Prospect</div><div class="next">Make it a target?</div><div class="tag">A target goes on Today and into every target meeting: map the owners and key people, then check in until we get it.</div>${ro?"":`<div class="acts" style="grid-template-columns:2fr 1fr"><button class="act dark" data-act="like" data-id="${esc(c.id)}">★ Make it a target</button><button class="act" data-act="not-for-us" data-id="${esc(c.id)}">Not for us</button></div>`}</div>`:""}
    ${!fin&&g==="target"&&!ro?`<div class="acts" style="grid-template-columns:1fr 1fr;margin-top:12px"><button class="act dark" data-act="start-deal" data-id="${esc(c.id)}">Start discussions</button><button class="act" data-act="like" data-id="${esc(c.id)}">Change check-ins</button></div>`:""}
    ${false?`<div class="fsec">${fin?"Relationship check-ins":"Check-in"}</div>
    <div class="card box">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="lbl">Next check-in</div><div class="next">${c.nextCheckIn?esc(fmtD(c.nextCheckIn)):"Not scheduled"}</div></div>${due?`<span class="pill ${due.cls}">${esc(due.txt)}</span>`:""}</div>
      <div class="tag">${esc(CADENCE.find(x=>x.m===Number(c.followUpMonths))?.l||"No scheduled check-in")} · last contact ${esc(fmtD(c.lastContact))}</div>
      ${ciMoreHTML(c,"c")}
      ${fin&&!ro?`<button class="btn sm" data-act="like" data-id="${esc(c.id)}">${c.nextCheckIn?"Change check-ins":"Set check-ins"}</button>`:""}
    </div>`:""}
    ${!fin&&!ro&&c.kind!=="other"?`<div class="fields" style="margin-top:12px"><div class="fld"><label for="dStage">Stage</label><select id="dStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),stageOf(c.status).id)}</select></div></div>`:""}
    ${!fin&&c.kind!=="other"?teamCardHTML(c,ro)+ciReportHTML(c):`<div class="card box" style="margin-top:12px"><div class="lbl">Network company – not to buy</div><div class="tag">We know people here, so Ask the network can find a contact. No stages or check-ins.${ro?"":` <button class="linkbtn" data-act="net2prospect" data-id="${esc(c.id)}">Change to a prospect</button>`}</div></div>`}
    ${!fin&&g!=="network"?`<div class="fsec">Our way in</div>${wayInHTML(c)}`:""}
    <div class="fsec">People we know here</div>
    ${(c.owners||[]).length||ppl.length? `<div class="group">${(c.owners||[]).filter(w=>!ppl.some(k=>k.name.toLowerCase()===String(w.name||"").toLowerCase())).map(w=>`<div class="rowi"><span class="avatar biz">${esc(initials(w.name))}</span><span class="main"><span class="t1" style="display:block">${esc(w.name||"Unnamed")} ${langTag(w.language)}</span><span class="t2" style="display:block">${esc([w.role||"Owner",w.cell,w.email].filter(Boolean).join(" · "))}</span></span>${w.cell?`<a class="btn sm" href="${esc(telHref(w.cell))}" aria-label="Call ${esc(w.name)}">${ic("phone",18)}</a>`:""}</div>`).join("")}${ppl.map(k=>`<button class="rowi" data-contact="${esc(k.id)}">${avatarP(k)}<span class="main"><span class="t1" style="display:block">${esc(k.name)}</span><span class="t2" style="display:block">${esc([k.companyRole||k.title||"Works here", knowers(k).length?"known by "+knowers(k).map(x=>x.partner.split(" ")[0]).join(", "):""].filter(Boolean).join(" · "))}</span></span>${ic("chev",18).replace('class="ic"','class="ic chev"')}</button>`).join("")}</div>` : `<div class="card empty">${fin?"Nobody we know here yet. Add the bankers, partners or advisors we deal with.":"Nobody linked yet."}</div>`}
    ${ro?"":`<button class="btn block" data-act="link19" data-mode="c" data-id="${esc(c.id)}" style="margin-top:8px">+ Add owner or employee</button>`}
    ${fin?partnerLeadsHTML(c):""}
    ${!fin&&c.kind!=="other"?`<div class="fsec">Sale signals</div>${sigCount(c)?`<div class="card box"><div class="sigs">${SIGNALS.filter(([s])=>(c.signals||{})[s]).map(([,l])=>`<span class="pill soon">${esc(l)}</span>`).join("")}</div></div>`:`<div class="card box tag">None captured. Edit the business to tick what you know: owner's age, no successor, wants out…</div>`}
    <div class="fsec">${c.kind==="other"?"Size":"Size & mandate fit"}</div>
    <div class="card kv"><div class="k">Profit</div><div class="v">${esc(sizeTxt(c))}</div><div class="k">Turnover</div><div class="v">${esc(c.turnoverConfirmed!=null&&c.turnoverConfirmed!==""?`R${c.turnoverConfirmed}m (confirmed)`:(c.turnover?`${c.turnover} (estimate)`:"—"))}</div><div class="k">Employees</div><div class="v">${esc(c.employees||"—")}</div><div class="k">Mandate fit</div><div class="v">${fp===null?"Not scored":`${fp}%`}</div>${FITDIMS.filter(([d])=>(c.fit||{})[d]).map(([d,l])=>`<div class="k">${esc(l)}</div><div class="v">${"●".repeat(Number(c.fit[d]))}${"○".repeat(5-Number(c.fit[d]))}</div>`).join("")}</div>`:""}
    ${groupHTML(c)}
    <div class="fsec">Where it operates</div>
    <div class="card kv"><div class="k">Head office</div><div class="v">${esc([c.town,c.hqCountry||"South Africa"].filter(Boolean).join(", "))}</div>${fin?"":`<div class="k">Footprint</div><div class="v">${esc(c.footprint||"—")}</div>`}${c.countries?`<div class="k">Countries</div><div class="v">${esc(c.countries)}</div>`:""}${fin?"":`<div class="k">Industry</div><div class="v">${esc(c.industry||"—")}</div>`}${c.regNo?`<div class="k">Reg. no.</div><div class="v">${esc(c.regNo)}</div>`:""}<div class="k">Website</div><div class="v">${c.website?`<a href="${esc(/^https?:/i.test(c.website)?c.website:"https://"+c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>`:"—"}</div></div>
    ${!fin?`<div class="fsec">How we heard</div>
    <div class="card kv"><div class="k">Source</div><div class="v">${esc(CHANNEL[src.channel]?.label||"—")}</div>${sk?`<div class="k">Introduced by</div><div class="v"><a href="#" data-contact="${esc(sk.id)}">${esc(sk.name)}</a></div>`:""}${src.partner?`<div class="k">Partner</div><div class="v">${esc(src.partner)}</div>`:""}${src.detail?`<div class="k">Detail</div><div class="v">${esc(src.detail)}</div>`:""}<div class="k">Captured</div><div class="v">${esc(fmtD((c.createdAt||"").slice(0,10)))}${c.createdByName?` · ${esc(c.createdByName)}`:""}</div></div>`:""}
    ${c.notes?`<div class="fsec">Notes</div><div class="card box" style="white-space:pre-wrap">${esc(c.notes)}</div>`:""}
    <div class="fsec">Activity & notes</div>
    ${ro?"":`<div class="fields">${fldNote("noteTxt","Add a note (type or speak)",keepNote,"What happened? Why does this business matter?")}</div><div style="margin:8px 0 12px"><button class="btn block" data-act="add-note" data-id="${esc(c.id)}">Save note</button></div>`}
    ${(c.log||[]).length?`<div class="group log">${[...c.log].reverse().map(e=>`<div class="e"${logAttr(c,e)}><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div>`:`<div class="card empty">No activity yet.</div>`}
    ${histBlock(c.id, c.updatedAt, c.updatedByName)}
    ${ro?"":(S.me?.is_admin? `<div style="margin-top:26px"><button class="btn block danger" data-act="del-deal" data-id="${esc(c.id)}">${ic("trash",18)} Delete</button></div>` : `<p class="tag" style="text-align:center;margin-top:22px">Only an admin can delete. Ask Rynhardt if this should be removed.</p>`)}
    </div>`;
  } else {
    const k=S.contacts.get(D.id); if(!k){ closeSheet(); return; }
    const t=tierOf(k); const deals=dealsFrom(k.id); const co=companyOf(k); const cp=completeness(k); const tal=k.talent||{};
    const lastThx=(k.thanks||[]).map(x=>x.d).sort().pop();
    el.innerHTML=`${ovHead(k.name,null,ro?"":`<button class="hbtn" data-act="edit-contact" data-id="${esc(k.id)}">Edit</button>`)}<div class="ovb">
    <div class="hero">${avatarP(k,true)}<h2>${esc(k.name)}</h2><div class="sub">${esc(workLine(k)||TIERS[t].label)}</div><div class="pills">${tagsOf(k).map(x=>`<span class="pill ${x}">${x} · ${esc(TIERS[x].label)}</span>`).join("")}${k.influence?`<span class="pill">${stars(k.influence)}</span>`:""}${personBadges(k)}${k.industry?`<span class="pill">${esc(k.industry.split(" › ").pop())}</span>`:""}${langTag(k.language)}</div></div>
    <div class="bigacts">
      <a class="bigact" ${k.cell&&!k.doNotContact?`href="${esc(telHref(k.cell))}"`:'aria-disabled="true"'}>${ic("phone",22)}Call</a>
      <a class="bigact" ${k.cell&&!k.doNotContact?`href="${esc(waHref(k.cell))}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${ic("wa",22)}WhatsApp</a>
      <a class="bigact" ${k.email&&!k.doNotContact?`href="mailto:${esc(k.email)}"`:'aria-disabled="true"'}>${ic("mail",22)}Email</a>
      <button class="bigact" data-act="new-deal-from" data-id="${esc(k.id)}" ${ro?'aria-disabled="true"':""}>${ic("bizplus",22)}Add lead</button>
    </div>
    ${personCheckinCard(k)}
    ${k.doNotContact?`<div class="notice err" style="margin-top:12px"><span>This person asked not to be contacted. Respect it.</span></div>`:""}
    ${cp.pct<100&&!ro?`<button class="card box nudge" data-act="complete-profile" data-id="${esc(k.id)}"><div style="display:flex;justify-content:space-between;align-items:center"><b>Profile ${cp.pct}% complete</b><span class="pill soon">Add details</span></div><div class="meter"><span style="width:${cp.pct}%"></span></div><div class="tag">Missing: ${esc(cp.missing.join(", "))}. The more we capture, the better Ask the network works.</div></button>`:""}
    ${isTalent(k)?`<div class="fsec">Talent</div><div class="card box"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc((tal.roles||[]).join(", ")||"Potential leader")}</b>${stars(tal.rating)}</div>${tal.sectors?`<div class="tag">Could lead: ${esc(tal.sectors)}</div>`:""}${tal.availability?`<div><span class="pill ${tal.availability==="yes"?"won":tal.availability==="open"?"soon":""}">${esc(AVAIL[tal.availability])}</span></div>`:""}${tal.why?`<div style="white-space:pre-wrap">${esc(tal.why)}</div>`:""}</div>`:""}
    ${k.hnwi?`<div class="fsec">High net worth</div><div class="card box">${esc(k.wealthSource||"Wealth source not captured")}</div>`:""}
    ${bizSectionHTML(k)}
    <div class="fsec">Who knows ${esc(k.name.split(" ")[0])}</div>
    ${knowers(k).length?`<div class="group">${knowers(k).map(x=>`<div class="rowi" style="min-height:52px"><span class="avatar biz" style="width:34px;height:34px;font-size:13px">${esc(initials(x.partner))}</span><span class="main"><span class="t1" style="display:block">${esc(x.partner)}</span></span><span class="pill ${x.relation==="friend"?"won":x.relation==="family"?"A":""}">${esc(RELS[x.relation]||"Not set")}</span></div>`).join("")}</div>`:`<div class="card empty">Nobody in our team linked yet.</div>`}
    ${bgHTML(k)}
    ${familyHTML(k)}
    <div class="fsec">Work</div>
    <div class="card kv">${co?`<div class="k">Works at</div><div class="v"><a href="#" data-open="${esc(co.id)}">${esc(co.name)}</a></div><div class="k">Role there</div><div class="v">${esc(k.companyRole||"—")}</div>`:`<div class="k">Company</div><div class="v">${esc(k.firm||"—")}</div>`}<div class="k">Title</div><div class="v">${esc(k.title||k.type||"—")}</div><div class="k">Industry</div><div class="v">${esc(k.industry||"—")}</div><div class="k">Can help with</div><div class="v">${esc(k.expertise||"—")}</div></div>
    ${(co||k.firm)&&!ro?`<button class="linkbtn" data-act="left-company" data-id="${esc(k.id)}">No longer works there</button>`:""}
    ${(k.pastRoles||[]).length?`<div class="tag" style="margin:4px 2px 0">Previously: ${esc(k.pastRoles.map(r=>`${r.role?r.role+" at ":""}${r.company} (until ${fmtD(r.until)})`).join("; "))}</div>`:""}
    <div class="card box" style="margin-top:12px"><div class="lbl">Next step for ${({A:"an owner",B:"an employee",C:"a potential hire",D:"a great contact"})[t]||"a contact"}</div><div class="next">${esc(TIERS[t].action)}</div></div>
    ${deals.length||t==="B"?`<div class="fsec">Leads they brought in (${deals.length})</div>${deals.length?`<div class="group">${deals.map(bizRow).join("")}</div>`:`<div class="card empty">None yet.</div>`}
    <div class="card box" style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div class="lbl">Thank-yous</div><div>${(k.thanks||[]).length?`${k.thanks.length} logged · last ${esc(fmtD(lastThx))}`:"Not thanked yet"}</div></div>${ro?"":`<button class="btn sm" data-act="thank" data-id="${esc(k.id)}">Log a thank-you</button>`}</div>${(k.thanks||[]).slice(-3).reverse().map(x=>`<div class="tag">${esc(fmtD(x.d))} · ${esc(x.what)}${x.by?` · ${esc(x.by)}`:""}</div>`).join("")}</div>`:""}
    <div class="fsec">Contact details</div>
    <div class="card kv"><div class="k">Cell</div><div class="v">${linkTel(k.cell)}</div>${(k.cells||[]).filter(x=>x.v).map(x=>`<div class="k">${esc(x.label||"Other number")}</div><div class="v">${linkTel(x.v)}</div>`).join("")}<div class="k">Email</div><div class="v">${linkMail(k.email)}</div>${(k.emails||[]).filter(x=>x.v).map(x=>`<div class="k">${esc(x.label||"Other email")}</div><div class="v">${linkMail(x.v)}</div>`).join("")}${k.linkedin?`<div class="k">LinkedIn</div><div class="v"><a href="${esc(/^https?:/i.test(k.linkedin)?k.linkedin:"https://"+k.linkedin)}" target="_blank" rel="noopener">Profile</a></div>`:""}<div class="k">Location</div><div class="v">${esc([k.town,k.province,k.country].filter(Boolean).join(", ")||"—")}</div><div class="k">Speaks</div><div class="v">${esc(LANGS[k.language]||"—")}</div></div>
    ${k.notes?`<div class="fsec">About</div><div class="card box" style="white-space:pre-wrap">${esc(k.notes)}</div>`:""}
    <div class="fsec">Notes & activity</div>
    ${ro?"":`<div class="fields">${fldNote("noteTxt","Add a note (type or speak)",keepNote,"Why are they in our network? What did you talk about?")}</div><div style="margin:8px 0 12px"><button class="btn block" data-act="add-pnote" data-id="${esc(k.id)}">Save note</button></div>`}
    ${(k.log||[]).length?`<div class="group log">${[...k.log].reverse().map(e=>`<div class="e"${logAttr(k,e)}><small>${esc(fmtD(e.d))}${e.by?` · ${esc(e.by)}`:""}</small>${esc(e.text)}</div>`).join("")}</div>`:""}
    ${histBlock(k.id, k.updatedAt, k.updatedByName)}
    ${ro?"":(S.me?.is_admin? `<div style="margin-top:26px"><button class="btn block danger" data-act="del-contact" data-id="${esc(k.id)}">${ic("trash",18)} Delete person</button></div>` : `<p class="tag" style="text-align:center;margin-top:22px">Only an admin can delete. Ask Rynhardt if this should be removed.</p>`)}
    </div>`;
  }
  const b=el.querySelector(".ovb"); if(b&&st) b.scrollTop=st; if(histOpen){ const h=el.querySelector(".histd"); if(h) h.open=true; }
}

/* ---------- Person form (adds town list, talent, HNWI, do-not-contact, voice) ---------- */
function contactForm(id, preset){
  const k=id? {...S.contacts.get(id)} : {language:"af", country:"South Africa", tier:"", ...(preset||{})};
  const tier=id? tierOf(k) : (k.tier||"D");
  FORM={kind:"contact", id};
  const co=k.companyId? S.companies.get(k.companyId) : null; const tal=k.talent||{};
  const whereInit= co? (isPartnerCo(co)?"partner":"business") : k.firm? "other" : tier==="B"? "partner" : tier==="A"? "business" : "other"; FORM.coInit=co?co.id:"";
  const rel={}; (id? knowers(k) : [{partner:defaultPartner(),relation:""}]).forEach(x=>rel[x.partner]=x.relation||"business");
  showModal(`<form id="contactForm" novalidate style="display:contents">${formHead(id?"Edit person":"New person","contactForm")}<div class="ovb">
  <div class="scorebar" id="kScore"></div>
  <div class="fsec">Who is this?</div>
  <p class="tag" style="margin:-4px 2px 8px">Tick all that apply, e.g. an employee who is also a great contact.</p><div class="tiers3" role="group">${["A","B","C","D"].map(t=>`<label><input type="checkbox" name="kTier" value="${t}" ${(id?tagsOf(k):[tier]).includes(t)?"checked":""}><span class="avatar ${t}" style="width:34px;height:34px;font-family:var(--display)">${t}</span><b>${esc(TIERS[t].label)}</b></label>`).join("")}</div>
  <div class="hint" id="kTierHint"></div>
  <div class="fsec">Contact</div>
  <div class="fields">
   <div class="fld"><label for="kName">Full name *</label><input id="kName" value="${esc(k.name)}" autocomplete="off" autocapitalize="words"></div>
   <div class="fld"><label for="kCell">Cell</label><input id="kCell" type="tel" inputmode="tel" value="${esc(k.cell)}" placeholder="082 123 4567"></div>
   <div id="kCellsX">${(k.cells||[]).map((x,i)=>extraRow("cell",i,x)).join("")}</div>
   <button type="button" class="linkbtn addx" data-act="x-add" data-k="cell">+ Add another number</button>
   <div class="fld"><label for="kEmail">Email</label><input id="kEmail" type="email" inputmode="email" autocapitalize="off" value="${esc(k.email)}"></div>
   <div id="kEmailsX">${(k.emails||[]).map((x,i)=>extraRow("email",i,x)).join("")}</div>
   <button type="button" class="linkbtn addx" data-act="x-add" data-k="email">+ Add another email</button>
   <div class="fld"><label for="kTown">Town / city</label><input id="kTown" list="townList" value="${esc(k.town)}" autocomplete="off" placeholder="e.g. Pretoria, Stellenbosch">${townList()}</div>
   <div class="fld"><label for="kCountry">Country</label><input id="kCountry" list="countryList" value="${esc(k.country||"South Africa")}" autocomplete="off" placeholder="Start typing a country">${countryList()}</div>
  </div><div id="kDup" class="warnline"></div>
  <div class="fsec">Where do they work?</div>
  <div class="seg3 where" role="radiogroup" aria-label="Where do they work?"><label><input type="radio" name="kWhere" value="partner" ${whereInit==="partner"?"checked":""}><span>${ic("bank",18)} At a partner</span></label><label><input type="radio" name="kWhere" value="business" ${whereInit==="business"?"checked":""}><span>${ic("biz",18)} At a business</span></label><label><input type="radio" name="kWhere" value="other" ${whereInit==="other"?"checked":""}><span>No company</span></label></div>
  <div class="fields" style="margin-top:10px">
   <div class="fld" id="kCoPickW"><label for="kCoPick" id="kCoPickL">Which partner?</label><select id="kCoPick"></select></div>
   <div class="fld" id="kCoNewW" hidden><label for="kCoNew" id="kCoNewL">Name of the new partner firm</label><input id="kCoNew" autocomplete="off" autocapitalize="words" value="${esc(!co&&k.firm&&whereInit!=="other"?k.firm:"")}"></div>
   <div id="kCoSim" class="warnline"></div>
   <div class="fld" id="kBuyW" hidden><label for="kBuy">Would we like to buy this business?</label><select id="kBuy">${opts([{v:"no",l:"No – a network company (they just work there)"},{v:"network",l:"Yes, a prospect – we'd look at it"},{v:"target",l:"Yes, a target – we go full out"}],"no")}</select></div>
   <div class="fld" id="kNewCoKindW" hidden><label for="kNewCoKind">What kind of partner?</label><select id="kNewCoKind">${opts(Object.entries(PKINDS).map(([v,l])=>({v,l})),"")}</select></div>
   <div class="fld" id="kFirmW" hidden><label for="kFirm">Company (optional)</label><input id="kFirm" autocomplete="off" value="${esc(!co&&whereInit==="other"?k.firm:"")}" placeholder="Where they work, if anywhere"></div>
   <div class="fld"><label for="kRole">Role at the company</label><select id="kRole">${opts(ROLES,k.companyRole,"Choose…")}</select></div>
   <div class="fld"><label for="kTitle">Job title</label><input id="kTitle" value="${esc(k.title)}" placeholder="e.g. Head of leveraged finance, Videographer"></div>
   <div class="fld"><label for="kIndustry">Industry</label><input id="kIndustry" list="indList" value="${esc(k.industry)}" autocomplete="off" placeholder="Type to search, e.g. betting, private equity">${indList()}</div>
   ${fldNote("kExpertise","What are they great at?",k.expertise,"e.g. e-commerce growth; brand films and editing; acquisition finance",2)}
  </div>
  <div class="hint" id="kCoHint"></div>
  ${otherRolesFields(k)}
  ${bgFields(k)}
  <div class="fsec">Who in our team knows them?</div>
  <div class="fields">${S.partners.map((p,i)=>`<div class="fld"><label for="rel${i}">${esc(p)}</label><select id="rel${i}" data-partner="${esc(p)}">${opts([{v:"",l:"Doesn't know them"},...Object.entries(RELS).map(([v,l])=>({v,l}))],rel[p]||"")}</select></div>`).join("")}</div>
  <div class="fields" style="margin-top:10px"><div class="fld"><label for="kInfl">How influential are they?</label><select id="kInfl">${opts([{v:0,l:"Not rated"},{v:1,l:"★ Some reach"},{v:2,l:"★★ Well connected locally"},{v:3,l:"★★★ Respected in their industry"},{v:4,l:"★★★★ Opens doors nationally"},{v:5,l:"★★★★★ Top of the network"}],k.influence||0)}</select></div></div>
  <div class="fsec">Check in with them?</div>
  ${ciFields(k)}
  <label class="check"><input type="checkbox" id="kHnwi" ${k.hnwi?"checked":""}> High net worth individual</label>
  <div class="fields" id="kWealthWrap" ${k.hnwi?"":"hidden"}><div class="fld"><label for="kWealth">Where their wealth comes from</label><input id="kWealth" value="${esc(k.wealthSource)}" placeholder="e.g. sold a logistics business; property; agri"></div></div>
  <label class="check"><input type="checkbox" id="kTal" ${tal.on||tier==="C"?"checked":""}> ★ We'd love to work with them (talent)</label>
  <div id="kTalWrap" ${tal.on||tier==="C"?"":"hidden"}>
   <div class="rolechips">${TALENT_ROLES.map(r=>`<label><input type="checkbox" name="kTalRole" value="${esc(r)}" ${(tal.roles||[]).includes(r)?"checked":""}><span>${esc(r)}</span></label>`).join("")}</div>
   <div class="fields" style="margin-top:8px">
    <div class="fld"><label for="kTalRate">How strong are they?</label><select id="kTalRate">${opts([{v:0,l:"Not rated"},{v:3,l:"★★★ Strong"},{v:4,l:"★★★★ Excellent"},{v:5,l:"★★★★★ Superstar"}],tal.rating||0)}</select></div>
    <div class="fld"><label for="kTalSect">Industries they could lead</label><input id="kTalSect" value="${esc(tal.sectors)}" placeholder="e.g. agri, food processing, e-commerce"></div>
    <div class="fld"><label for="kTalAvail">Open to a move?</label><select id="kTalAvail">${opts(Object.entries(AVAIL).map(([v,l])=>({v,l})),tal.availability||"")}</select></div>
    ${fldNote("kTalWhy","Why we rate them",tal.why,"How they think, what they've built…",2)}
   </div>
  </div>
  
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} More details</summary>
   <div class="fsec">More</div>
   <div class="fields">
    ${fldNote("kNotes","Why are they in our network?",k.notes,"How we met, who they know, what they could help with…",3)}
    <div class="fld"><label for="kType">Type</label><select id="kType">${opts(tier?TIERS[tier].types:CONTACT_TYPES,k.type,"Choose…")}</select></div>
    <div class="fld"><label for="kLang">Speaks</label><select id="kLang">${opts(LANG_OPTS,k.language||"af")}</select></div>
    <div class="fld"><label for="kProv">Province</label><select id="kProv">${opts(PROVINCES,k.province,"Fills in from the town")}</select></div>
    <div class="fld"><label for="kLinkedin">LinkedIn</label><input id="kLinkedin" inputmode="url" autocapitalize="off" value="${esc(k.linkedin)}"></div>
   </div>
   <label class="check"><input type="checkbox" id="kDnc" ${k.doNotContact?"checked":""}> Do not contact (they asked us not to)</label>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save person"}</button></div>
  <p class="tag" style="text-align:center;margin-top:8px">Only the name is required. Everything else makes the network smarter.</p>
  </div></form>`);
  kFormUpdate();
  setTimeout(()=>{ if(!id) $("#kName")?.focus(); },300);
}
function kFormRead(){
  const tags=[...document.querySelectorAll('input[name=kTier]:checked')].map(x=>x.value); const tier=TIER_PRIO.find(t=>tags.includes(t))||"";
  const W=whereRead(); const cname=W.coName; const co=W.co;
  const conns=[...document.querySelectorAll("[data-partner]")].filter(s=>s.value).map(s=>({partner:s.dataset.partner, relation:s.value}));
  const town=$("#kTown").value.trim(); const g=gazFind(town);
  return {tier, tags, name:$("#kName").value.trim(), cell:$("#kCell").value.trim(), email:$("#kEmail").value.trim(), country:$("#kCountry").value, companyId:co?co.id:"", firm: co? "" : cname, companyRole:$("#kRole").value, title:$("#kTitle").value.trim(), industry:$("#kIndustry").value, expertise:$("#kExpertise").value.trim(), type:$("#kType").value, language:$("#kLang").value, province:autoProvince(town,$("#kProv").value), town: g? g.name : town, linkedin:$("#kLinkedin").value.trim(), notes:$("#kNotes").value.trim(), influence:Number($("#kInfl").value)||0, conns, coName:cname, coFound:!!co,
    hnwi:$("#kHnwi").checked, wealthSource:$("#kWealth").value.trim(), doNotContact:$("#kDnc").checked,
    talent: $("#kTal").checked? {on:true, roles:[...document.querySelectorAll('input[name=kTalRole]:checked')].map(x=>x.value), rating:Number($("#kTalRate").value)||0, sectors:$("#kTalSect").value.trim(), availability:$("#kTalAvail").value, why:$("#kTalWhy").value.trim()} : {}};
}
function kFormUpdate(){
  if(!$("#kName")) return; const d=kFormRead();
  const known=d.conns.some(c=>c.relation); const ch=[[d.name,"name"],[d.cell,"cell"],[d.email,"email"],[d.coName,"company"],[d.companyRole||d.title||d.type,"role or title"],[d.industry,"industry"],[d.expertise,"what they're great at"],[d.town||d.province,"town"],[known,"who knows them"]];
  const miss=ch.filter(c=>!c[0]).map(c=>c[1]); const pct=Math.round((ch.length-miss.length)/ch.length*100);
  $("#kScore").innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;font-size:14px"><b>Profile ${pct}%</b><span class="tag">${miss.length?`Next: ${esc(miss.slice(0,3).join(", "))}${miss.length>3?"…":""}`:"Complete. Great work."}</span></div><div class="meter"><span style="width:${pct}%"></span></div>`;
  $("#kTierHint").textContent = d.tier? TIERS[d.tier].desc : "Optional. A owns a business we might buy, B is an employee at a business or partner we know, C is a potential hire, D is an influential person or great contact to have.";
  $("#kCoHint").innerHTML = d.coName&&d.coFound? (()=>{ const co=companies().find(c=>c.name.toLowerCase()===d.coName.toLowerCase()); return isPartnerCo(co)? `Linked to <b>${esc(co.name)}</b> in Partners (${esc(PKINDS[co.kind]||"")}).` : `Linked to <b>${esc(co.name)}</b> in Businesses.`; })() : "";
  newCoUpdate(d);
  $("#kTalWrap").hidden=!$("#kTal").checked; $("#kWealthWrap").hidden=!$("#kHnwi").checked;
}
async function submitContact(){
  const d=kFormRead();
  if(!d.name){ toast("Add a name"); $("#kName").focus(); return; }
  const tier=d.tier || (OWNER_ROLES.includes(d.companyRole)?"A":"D"); const tags=(d.tags&&d.tags.length)? d.tags : [tier];
  const me=myPartner(); const primary=(d.conns.find(c=>c.partner===me)||d.conns[0]||{}).partner||"";
  const prev=FORM.id? S.contacts.get(FORM.id):null;
  const data={name:d.name, tier, tags, firm:d.firm, type:d.type, partner:primary, companyId:d.companyId, companyRole:d.companyRole, ownsCompanyId: OWNER_ROLES.includes(d.companyRole)? d.companyId : "", title:d.title, country:d.country, industry:d.industry, expertise:d.expertise, linkedin:d.linkedin, cell:d.cell, email:d.email, language:d.language, province:d.province, town:d.town, notes:d.notes, influence:d.influence, hnwi:d.hnwi, wealthSource:d.hnwi?d.wealthSource:"", doNotContact:d.doNotContact, talent:d.talent, example:prev?.example||false};
  Object.assign(data, ciRead(), bgRead(), otherRolesRead()); data.cells=readExtras("cell"); data.emails=readExtras("email");
  if(prev && prev.companyId && prev.companyId!==d.companyId){ const pc=S.companies.get(prev.companyId); data.pastRoles=[...(prev.pastRoles||[]),{company:pc?.name||"", role:prev.companyRole||prev.title||"", until:today()}]; }
  const id=FORM.id||newId();
  const nc=newCoChoice(d); let addBiz=false;
  if(nc.what==="partner"){ const cid=newId(); const by=await myName(); const g2=gazFind(d.town); if(!await dbSet("companies/"+cid,{name:d.coName, kind:nc.kind, status:"network", industry:PIND[nc.kind]||"", town:d.town, province:d.province, hqCountry:d.country||"South Africa", partner:primary, owners:[], fit:{}, signals:{}, source:{}, log:[{d:today(),by,text:`Added as partner firm via ${d.name}`}], createdByName:by})) return; data.companyId=cid; data.firm=""; }
  if(nc.what==="business" && nc.buy==="no"){ const cid=newId(); const by=await myName(); if(!await dbSet("companies/"+cid,{name:d.coName, kind:"other", status:"network", town:d.town, province:d.province, hqCountry:d.country||"South Africa", partner:primary, owners:[], fit:{}, signals:{}, source:{}, log:[{d:today(),by,text:`Added as ${d.name}'s workplace (not for acquisition)`}], createdByName:by})) return; data.companyId=cid; data.firm=""; }
  if(nc.what==="business" && nc.buy!=="no"){ addBiz=true; FORM.buyAs=nc.buy; }
  document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=true);
  const ok=await dbSet("contacts/"+id,data) && await saveConns(id,d.conns);
  document.querySelectorAll('button[type=submit]').forEach(b=>b.disabled=false);
  if(!ok) return;
  toast(FORM.id?"Saved":"Added to People");
  if(addBiz){ const b=FORM.buyAs; ownerDealForm(id,true); setTimeout(()=>{ const s=$("#cKind"); if(s){ s.value=b==="target"?"acquire":"network"; s.dispatchEvent(new Event("change",{bubbles:true})); } },60); return; }
  if(sheetOpen() && S.sheet?.kind==="contact" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("contact",id,true);
}

/* ---------- Business form (adds kind, sale signals, town list, voice) ---------- */
function dealForm(id, preset){
  const c = id? JSON.parse(JSON.stringify(S.companies.get(id)||{})) : {status:"network", kind:"target", followUpMonths:0, owners:[{language:"af"}], source:{}, partner:defaultPartner(), ebit:"Unknown", hqCountry:"South Africa", fit:{}, signals:{}, ...(preset||{})};
  FORM={kind:"deal", id, owners:(c.owners&&c.owners.length?c.owners:[{language:"af"}])};
  const src=c.source||{}; const fit=c.fit||{}; const sig=c.signals||{}; const fin=isPartnerCo(c);
  showModal(`<form id="dealForm" novalidate style="display:contents">${formHead(id?"Edit":(isPartnerKind(c.kind)?"New partner":"New business"),"dealForm")}<div class="ovb">
  <div class="fsec">The business</div>
  <div class="fields">
    ${isPartnerKind(c.kind)? `<div class="fld"><label for="cKind">What kind of partner?</label><select id="cKind">${opts(Object.entries(PKINDS).map(([v,l])=>({v,l})),c.kind)}</select></div>` : `<div class="fld"><label for="cKind">What is it?</label><select id="cKind">${opts(BIZSEL,bizSelOf(c))}</select></div><div class="fld" id="cKindNoteW" ${c.kind==="other"?"":"hidden"}><label for="cKindNote">Describe it</label><input id="cKindNote" value="${esc(c.kindNote)}" placeholder="What is this business to us?"></div>`}
    <div class="fld"><label for="cName">Name *</label><input id="cName" value="${esc(c.name)}" autocomplete="off" autocapitalize="words"></div>
    <div class="fld nofin"><label for="cIndustry">Industry</label><input id="cIndustry" list="indList" value="${esc(c.industry)}" autocomplete="off" placeholder="Type to search, e.g. betting, private equity">${indList()}</div>
    <div class="fld"><label for="cTown">Town / city</label><input id="cTown" list="townList" value="${esc(c.town)}" autocomplete="off">${townList()}</div>
    <div class="fld"><label for="cHq">Head office country</label><input id="cHq" list="countryList" value="${esc(c.hqCountry||"South Africa")}" autocomplete="off" placeholder="Start typing a country">${countryList()}</div>
    <div class="fld nofin"><label for="cFoot">Where it operates</label><select id="cFoot">${opts(FOOTPRINTS,c.footprint,"Choose…")}</select></div>
  </div><div id="dupWarn" class="warnline"></div>
  <div class="nofin"><div id="owners"></div><button type="button" class="linkbtn" data-act="add-owner" id="addOwnerBtn">+ Add another owner</button></div>
  <div class="nofin"><div class="fsec">Who brought it to us?</div>
  <div class="fields"><div class="fld"><label for="sChannel">Source</label><select id="sChannel">${opts(activeChannels(src.channel).map(x=>({v:x.id,l:x.label})),src.channel,"Choose…")}</select></div><div id="srcExtra"></div></div>
  <div id="newContact"></div></div>
  <div class="fsec">Munger</div>
  <div class="fields">
    <div class="fld"><label for="cPartner">Brought in by (our team)</label><select id="cPartner">${opts(S.partners,c.partner,"Unassigned")}</select></div>${respFields(c,!id)}
    <div class="fld nofin"><label for="cStage">Stage</label><select id="cStage">${opts(STAGES.map(s=>({v:s.id,l:s.label})),stageOf(c.status).id)}</select></div>
    <div class="fld cadw"><label for="cCad">Check in</label><select id="cCad">${opts(CADENCE.map(x=>({v:x.m,l:x.l})),c.followUpMonths??0)}</select></div>
    <div class="fld cadw"><label for="cNext">Next check-in (or pick a specific date)</label><input id="cNext" type="date" value="${esc(c.nextCheckIn||"")}"></div>
  </div><div class="hint" id="nextHint"></div><div class="hint" id="cadOff">Prospects have no check-ins. Make it a target when we want to go full out: it then shows on Today and in every target meeting.</div>
  <div class="fields" style="margin-top:12px">${fldNote("cNotes","Why are we adding it?",c.notes,"Type or speak: succession situation, culture, why it's interesting…",3)}</div>
  <details class="more" ${id?"open":""}><summary>${ic("plus",18)} Size, sale signals and more</summary>
   <div class="nofin"><div class="fsec">Sale signals</div>
   <p class="tag" style="margin:0 2px 8px">Tick what you know. Two or more puts it on the Likely sellers list.</p><div class="checklist">${SIGNALS.map(([s,l])=>`<label><input type="checkbox" name="cSig" value="${s}" ${sig[s]?"checked":""}><span class="box" aria-hidden="true"></span><span class="txt">${esc(l)}</span></label>`).join("")}</div>
   <div class="fsec">How big is it?</div>
   <div class="fields">
    <div class="fld"><label for="cEbit">EBIT – our estimate</label><select id="cEbit">${opts(EBIT,c.ebit)}</select></div>
    <div class="fld"><label for="cTurnover">Turnover – our estimate</label><input id="cTurnover" value="${esc(c.turnover)}" placeholder="e.g. R180m"></div>
    <div class="fld"><label for="cEbitC">EBIT – confirmed (R million)</label><input id="cEbitC" inputmode="decimal" value="${esc(c.ebitConfirmed??"")}" placeholder="Once we've seen the numbers"></div>
    <div class="fld"><label for="cTurnC">Turnover – confirmed (R million)</label><input id="cTurnC" inputmode="decimal" value="${esc(c.turnoverConfirmed??"")}"></div>
    <div class="fld"><label for="cFy">Financial year of confirmed numbers</label><input id="cFy" value="${esc(c.financialsYear)}" placeholder="e.g. FY2026"></div>
    <div class="fld"><label for="cEmp">Employees (a number or a range)</label><input id="cEmp" list="empList" autocomplete="off" placeholder="e.g. 300–500" value="${esc(c.employees)}"><datalist id="empList">${["1–10","10–50","50–100","100–200","200–300","300–500","500–1,000","1,000–2,000","2,000–5,000","5,000+"].map(x=>`<option value="${x}">`).join("")}</datalist></div>
   </div>
   <div class="fsec">Mandate fit (1 = poor, 5 = excellent)</div>
   <div class="fields">${FITDIMS.map(([d,l])=>`<div class="fld"><label for="fit_${d}">${esc(l)}</label><select id="fit_${d}">${opts([1,2,3,4,5].map(n=>({v:n,l:`${n} ${"●".repeat(n)}${"○".repeat(5-n)}`})),fit[d]||"","Not scored")}</select></div>`).join("")}</div></div>
   <div class="fsec">More</div>
   <div class="fields">
    <div class="fld"><label for="cTrading">Trading as</label><input id="cTrading" value="${esc(c.tradingAs)}"></div>
    <div class="fld"><label for="cProvince">Province</label><select id="cProvince">${opts(PROVINCES,c.province,"Fills in from the town")}</select></div>
    <div class="fld"><label for="cCountries">Countries it trades in</label><input id="cCountries" value="${esc(c.countries)}" placeholder="e.g. Namibia, Botswana, UK exports"></div>
    ${groupFields(c)}
    <div class="fld"><label for="cReg">Company registration no.</label><input id="cReg" value="${esc(c.regNo)}"></div>
    <div class="fld"><label for="cWeb">Website</label><input id="cWeb" inputmode="url" autocapitalize="off" value="${esc(c.website)}"></div>
   </div>
  </details>
  <div style="margin-top:18px"><button type="submit" class="btn primary block">${id?"Save changes":"Save"}</button></div>
  <p class="tag" style="text-align:center;margin-top:8px">Only the name is required.</p>
  </div></form>`);
  drawOwners(); drawSrcExtra(src); kindVis(); cadVis(); if(fin||["target","active"].includes(stageOf(c.status).group)) autoNext(!c.nextCheckIn);
  setTimeout(()=>{ if(!id) $("#cName")?.focus(); },300);
}
function kindVis(){ const fin=isPartnerKind($("#cKind")?.value); const nw=$("#cKindNoteW"); if(nw) nw.hidden=$("#cKind")?.value!=="other"; document.querySelectorAll(".nofin").forEach(e=>e.hidden=fin); }
function cadVis(){ const fin=isPartnerKind($("#cKind")?.value); const on=fin||["target","active"].includes(stageOf($("#cStage")?.value).group); document.querySelectorAll(".cadw").forEach(e=>e.hidden=!on); const o=$("#cadOff"); if(o) o.hidden=on||fin; const h=$("#nextHint"); if(h&&!on) h.textContent=""; if(!on){ const n=$("#cNext"); if(n) n.value=""; } }
async function submitDeal(){
  const name=$("#cName").value.trim(); if(!name){ toast("Add the name"); $("#cName").focus(); return; }
  const kind=kindFromSel($("#cKind").value); const fin=isPartnerKind(kind);
  const channel=fin? "" : $("#sChannel").value; const ch=CHANNEL[channel]; const source={channel, detail:$("#sDetail")?.value.trim()||""};
  let newContact=null;
  if(ch&&ch.contact){
    const sel=$("#sContact").value;
    if(sel==="__new"){ const nm=$("#nkName").value.trim(); if(!nm){ toast("Add the name of the person who referred it"); $("#nkName").focus(); return; }
      const kid=newId(); newContact={id:kid, partner:$("#nkPartner").value, data:{name:nm, firm:$("#nkFirm").value.trim(), tier:$("#nkTier").value, type:$("#nkType").value, partner:$("#nkPartner").value, cell:$("#nkCell").value.trim(), email:$("#nkEmail").value.trim(), language:$("#nkLang").value, province:$("#cProvince").value, country:"South Africa"}}; source.contactId=kid; }
    else if(sel) source.contactId=sel;
  }
  if(ch&&ch.partner) source.partner=$("#sPartner").value;
  const owners=fin? [] : readOwners().filter(o=>o.name||o.email||o.cell);
  const prev=FORM.id? S.companies.get(FORM.id):null;
  const status=fin? "network" : $("#cStage").value; const fit={}; FITDIMS.forEach(([d])=>{ const v=Number($("#fit_"+d).value); if(v) fit[d]=v; });
  const signals={}; document.querySelectorAll('input[name=cSig]:checked').forEach(x=>signals[x.value]=true);
  const town=$("#cTown").value.trim(); const g=gazFind(town); const cad=fin||["target","active"].includes(stageOf(status).group);
  const data={
    name, kind, kindNote:kind==="other"?($("#cKindNote")?.value.trim()||""):"", tradingAs:$("#cTrading").value.trim(), industry:fin? (PIND[kind]||"") : $("#cIndustry").value, province:autoProvince(town,$("#cProvince").value), town:g?g.name:town,
    website:$("#cWeb").value.trim(), ebit:$("#cEbit").value, turnover:$("#cTurnover").value.trim(), employees:$("#cEmp").value.trim(),
    hqCountry:$("#cHq").value, footprint:fin?"":$("#cFoot").value, countries:$("#cCountries").value.trim(), regNo:$("#cReg").value.trim(), ...groupRead(),
    ebitConfirmed:numOrNull($("#cEbitC").value), turnoverConfirmed:numOrNull($("#cTurnC").value), financialsYear:$("#cFy").value.trim(), fit, signals,
    owners, language: owners.length? (new Set(owners.map(o=>o.language)).size>1?"both":owners[0].language) : "",
    source, partner:$("#cPartner").value, status, followUpMonths:cad?Number($("#cCad").value):0, nextCheckIn:cad?($("#cNext").value||""):"",
    notes:$("#cNotes").value.trim(), lastContact: prev?.lastContact||"", log: prev?.log? [...prev.log] : [],
    createdByName: prev?.createdByName||await myName(), example: prev?.example||false
  };
  if(!prev) data.log.push({d:today(), by:data.createdByName, text:fin?"Added as bank / funder":`Captured${ch?` · ${ch.label}`:""}`});
  else if(prev.status!==status && !fin) data.log.push({d:today(), by:await myName(), text:`Stage: ${stageOf(prev.status).label} → ${stageOf(status).label}`});
  const btns=document.querySelectorAll('button[type=submit]'); btns.forEach(b=>b.disabled=true);
  if(newContact){ const ok=await dbSet("contacts/"+newContact.id, newContact.data) && (newContact.partner? await saveConns(newContact.id,[{partner:newContact.partner,relation:"business"}]) : true); if(!ok){ btns.forEach(b=>b.disabled=false); return; } }
  const id=FORM.id||newId();
  const ok=await dbSet("companies/"+id, data);
  btns.forEach(b=>b.disabled=false);
  if(ok){
    if(!FORM.id && FORM.fromOwner) await dbUpdate("contacts/"+FORM.fromOwner,{companyId:id, companyRole:FORM.fromRole||"Owner", ownsCompanyId:(OWNER_ROLES.includes(FORM.fromRole||"Owner")||FORM.fromIsOwner)?id:"", firm:""});
    if(!fin) await syncOwnersToPeople(id, owners, data, FORM.fromOwner);
    toast(FORM.id?"Saved":"Added");
    if(sheetOpen() && S.sheet?.kind==="company" && S.sheet.id===id){ closeModal(); renderSheet(); } else openSheet("company",id,true);
  }
}

/* ---------- Check-in with outcomes ---------- */
function quickCheckin(id){
  const c=S.companies.get(id); if(!c) return; const m=Number(c.followUpMonths)||3; const fin=isPartnerCo(c);
  showModal(`${ovHead("Log check-in",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb">
   <p style="margin:0 2px 12px;font-size:15px">Spoke to <b>${esc(bizContact(c)?.name||c.name)}</b>?</p>
   ${historyHTML(c)}
   <div class="fields">${fldNote("qNote","What was discussed? (optional)","","Still not selling, son joining the business…",3)}
   ${fin?"":`<div class="fld"><label for="qOut">Where does it stand?</label><select id="qOut">${opts([{v:"keep",l:"Keep following up"},{v:"won",l:"We did the deal"},{v:"sold",l:"Sold to someone else"},{v:"passed",l:"Not for us any more"}],"keep")}</select></div>`}
   <div class="fld qkeep"><label for="qCad">Check in again</label><select id="qCad">${opts(CADENCE.filter(x=>x.m).map(x=>({v:x.m,l:x.l})),m)}</select></div>
   <div class="fld qkeep"><label for="qDate">Next check-in</label><input id="qDate" type="date" value="${esc(addMonths(today(),m))}"></div>
   <div class="fld qkeep"><label for="qTodo">What to do next time</label><input id="qTodo" value="${esc(c.checkInNote||"")}" placeholder="e.g. Ask about the son's plans; send NDA"></div>
   <div class="fld" id="qSoldW" hidden><label for="qSold">Sold to whom?</label><input id="qSold" placeholder="Buyer, if known"></div></div>
   <div style="margin-top:14px"><button class="btn primary block" data-act="do-checkin2" data-id="${esc(c.id)}">${ic("check",18)} Save</button></div></div>`, true);
}

/* ---------- Ask: talent, funders, location ---------- */
INTENTS.push(
 {keys:["ceo","cfo","coo","cto","md","managing","executive","executives","recruit","recruiting","hire","hiring","talent","leader","leaders","leadership","turnaround","head","manager","management","board","ned"], groups:[["Leaders we'd love to work with",["ceo","cfo","coo","cto","managing director","turnaround","hit squad","operations","finance","sales","board","specialist"]]]},
 {keys:["investor","investors","hnwi","wealthy","co-invest","coinvest","family office","angel"], groups:[["High net worth & investors",["hnwi","high net worth","investor","family office","private equity"]]]}
);
function hayOf(k){ const co=companyOf(k); const fin=isPartnerCo(co); const tal=isTalent(k)? ["talent",...((k.talent||{}).roles||[]),(k.talent||{}).sectors||""].join(" ") : ""; return {role:[k.title,k.type,k.companyRole,k.expertise].join(" ").toLowerCase(), ind:[subInd(k.industry),subInd(co?.industry), partnerHay(co)].join(" ").toLowerCase(), sect:[k.industry,co?.industry||""].join(" ").toLowerCase(), firm:[k.firm,co?.name||""].join(" ").toLowerCase(), notes:[k.notes||"",(k.log||[]).map(e=>e.text).join(" ")].join(" ").toLowerCase(), place:[k.town,k.province,k.country,co?.town||"",co?.province||""].join(" ").toLowerCase(), talent:tal.toLowerCase(), hnwi:k.hnwi?("hnwi high net worth investor "+(k.wealthSource||"")).toLowerCase():""}; }
function termScore(h,term){ let s=0; if(h.role.includes(term)) s+=6; if(h.talent&&h.talent.includes(term)) s+=8; if(h.hnwi&&h.hnwi.includes(term)) s+=8; if(h.ind.includes(term)) s+=4; else if(h.sect.includes(term)) s+=1; if(h.firm.includes(term)) s+=2; if(h.notes.includes(term)) s+=2; return s; }
function askLine(k){ const co=companyOf(k); const tal=isTalent(k)? `TALENT: ${((k.talent||{}).roles||[]).join("/")} ${(k.talent||{}).sectors||""} rating ${(k.talent||{}).rating||"?"} ${AVAIL[(k.talent||{}).availability||""]}` : ""; return [k.id,k.name,tierOf(k),[k.title,k.type].filter(Boolean).join(", "),co?`${co.name} (${k.companyRole||"works there"}; ${isPartnerCo(co)?"PARTNER FIRM: "+(PKINDS[co.kind]||""):co.industry||""})`:k.firm,k.industry,k.expertise,[k.town,k.province,k.country].filter(Boolean).join(", "),knowsTxt(k),[tal,k.hnwi?`HNWI ${k.wealthSource||""}`:"",k.influence?`influence ${k.influence}/5`:"",k.doNotContact?"DO NOT CONTACT":""].filter(Boolean).join("; "),[(k.notes||""),(k.log||[]).slice(-3).map(e=>e.text).join(" ")].join(" ").replace(/\s+/g," ").slice(0,200)].map(v=>String(v||"").replace(/\|/g,"/")).join(" | "); }

/* ---------- Phase 3 events ---------- */
document.addEventListener("click", async e=>{
  const t=e.target.closest("[data-act]"); if(!t) return;
  const a=t.dataset.act, k=t.dataset.k, id=t.dataset.id;
  switch(a){
    case "mic": e.preventDefault(); startMic(t); break;
    case "f-kind": location.hash=k==="financier"?"funders":"businesses"; break;
    case "biz-targets": S.f.group="target"; break;
    case "new-funder": dealForm(null,{kind:"financier", status:"network"}); break;
    case "new-talent": contactForm(null,{talent:{on:true}}); break;
    case "tal-role": S.tal.role=k; render(); break;
    case "near-rad": S.near.radius=Number(k); render(); break;
    case "near-gps": if(!navigator.geolocation){ toast("Location isn't available on this device"); break; } toast("Finding you…"); navigator.geolocation.getCurrentPosition(p=>{ const pt={lat:p.coords.latitude,lng:p.coords.longitude}; let best=null; GAZ.forEach(g=>{ const d=distKm(pt,g); if(!best||d<best.d) best={g,d}; }); S.near={...S.near, pt, town:"", label: best? `you (near ${best.g.name})` : "you"}; render(); }, err=>toast(err.code===1?"Allow location access for Munger in your phone settings":"Couldn't get your location"), {enableHighAccuracy:false, timeout:12000, maximumAge:300000}); break;
    case "copy-week": copyText(myWeekText()); break;
    case "thank": showModal(`${ovHead("Log a thank-you",`<button class="hbtn" data-act="close-modal">Cancel</button>`)}<div class="ovb"><div class="fields"><div class="fld"><label for="thxWhat">What did we do?</label><input id="thxWhat" placeholder="e.g. Dinner, bottle of wine, referral fee"></div></div><div style="margin-top:12px"><button class="btn primary block" data-act="thank-save" data-id="${esc(id)}">Save</button></div></div>`, true); break;
    case "thank-save": { const kk=S.contacts.get(id); const what=$("#thxWhat").value.trim()||"Thank-you"; if(await dbUpdate("contacts/"+id,{thanks:[...(kk.thanks||[]),{d:today(),by:await myName(),what}]})){ closeModal(); toast("Thank-you logged"); } break; }
    case "add-pnote": { const kk=S.contacts.get(id); const txt=($("#noteTxt")?.value||"").trim(); if(!txt){ toast("Type or speak a note first"); break; } if(await dbUpdate("contacts/"+id,{log:[...(kk.log||[]),{d:today(),by:await myName(),text:txt}].slice(-200)})){ $("#noteTxt").value=""; toast("Note saved"); renderSheet(); } break; }
    case "left-company": { const kk=S.contacts.get(id); const co=companyOf(kk); confirmBox("No longer works there?", `${kk.name} will be unlinked from ${co?.name||kk.firm}. We'll keep it in their history.`, "Update", async()=>{ const past=[...(kk.pastRoles||[]),{company:co?.name||kk.firm, role:kk.companyRole||kk.title||"", until:today()}]; if(await dbUpdate("contacts/"+id,{companyId:"", companyRole:"", ownsCompanyId:"", firm:"", pastRoles:past, log:[...(kk.log||[]),{d:today(),by:await myName(),text:`Left ${co?.name||kk.firm}`}]})){ closeModal(); toast("Updated. Where are they now? Tap Edit."); } }); break; }
    case "do-checkin2": { const c=S.companies.get(id); if(!c) break; t.disabled=true; const by=await myName(); const note=($("#qNote")?.value||"").trim(); const out=$("#qOut")?.value||"keep";
      const patch={lastContact:today()}; let text="";
      patch.checkInNote= out==="keep"? ($("#qTodo")?.value||"").trim() : "";
      if(out==="keep"){ patch.followUpMonths=Number($("#qCad").value)||3; patch.nextCheckIn=$("#qDate").value||addMonths(today(),patch.followUpMonths); text=`Checked in${note?`: ${note}`:""} · next ${fmtD(patch.nextCheckIn)}`; }
      if(out==="won"){ patch.status="won"; patch.nextCheckIn=""; text=`🎉 Deal done${note?`: ${note}`:""}`; }
      if(out==="sold"){ patch.status="sold"; patch.nextCheckIn=""; const to=$("#qSold").value.trim(); text=`Sold to ${to||"someone else"}${note?`: ${note}`:""}`; }
      if(out==="passed"){ patch.status="passed"; patch.nextCheckIn=""; text=`Not for us any more${note?`: ${note}`:""}`; }
      patch.log=[...(c.log||[]),{d:today(),by,text,type:"checkin"}].slice(-200);
      const ok=await dbUpdate("companies/"+id, patch); t.disabled=false; if(ok){ closeModal(); toast(out==="won"?"Congratulations!":out==="keep"?"Check-in logged":"Updated – off the check-in list"); } break; }
    case "ch-add": { S.chDraft=readChannels(); S.chDraft.push({id:"", label:"", kind:"none", archived:false}); render(); setTimeout(()=>{ const i=S.chDraft.length-1; $("#chL"+i)?.focus(); },50); break; }
    case "ch-save": { const list=readChannels().filter(c=>c.label.trim()); list.forEach(c=>{ if(!c.id) c.id=(c.label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,24)||"ch")+"-"+Math.random().toString(36).slice(2,6); });
      const {error}=await sb.from("settings").upsert({key:"channels", value:{list}}); if(error){ writeErr(error); break; } applyChannels(list); S.chDraft=null; toast("Channels saved"); render(); break; }
  }
});
function readChannels(){ const base=S.chDraft||CHANNELS.map(c=>({id:c.id,label:c.label,kind:chKind(c),archived:!!c.archived})); return base.map((c,i)=>({id:c.id, label:($("#chL"+i)?.value??c.label).trim(), kind:$("#chK"+i)?.value||c.kind, archived: $("#chA"+i)? !$("#chA"+i).checked : !!c.archived})); }
document.addEventListener("submit",e=>{ if(e.target.id==="nearForm"){ e.preventDefault(); const v=$("#nearTown").value.trim(); const g=gazFind(v); if(!g){ toast("Pick a town from the list"); return; } S.near={...S.near, town:g.name, pt:{lat:g.lat,lng:g.lng}, label:g.name}; render(); } });
document.addEventListener("change",e=>{
  const id=e.target.id;
  if(id==="voiceLang"){ try{ localStorage.setItem("munger-voice",e.target.value); }catch(_){} toast("Voice language saved"); }
  if(id==="cKind"){ const v=e.target.value, st=$("#cStage"); if(st){ if(v==="network") st.value="network"; else if(v==="acquire" && stageOf(st.value).group==="network") st.value="target"; } kindVis(); cadVis(); if(v==="acquire"){ const cc=$("#cCad"); if(cc&&!Number(cc.value)) cc.value="3"; autoNext(true); } }
  if(id==="cStage"){ const k=$("#cKind"); const g=stageOf(e.target.value).group; if(k&&["network","acquire"].includes(k.value)) k.value= g==="network"?"network":"acquire"; }
  if(id==="cStage"){ cadVis(); }
  if(id==="qOut"){ const v=e.target.value; document.querySelectorAll(".qkeep").forEach(x=>x.hidden=v!=="keep"); $("#qSoldW").hidden=v!=="sold"; }
  if(id==="qCad"){ $("#qDate").value=addMonths(today(),Number(e.target.value)||3); }
  if(id==="cTown"){ const g=gazFind(e.target.value); if(g && $("#cProvince") && !$("#cProvince").value && PROVINCES.includes(g.region)) $("#cProvince").value=g.region; }
});
