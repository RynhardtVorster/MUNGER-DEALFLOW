/* ---------------- State ---------------- */
const S = {
  db:null, uid:null,
  companies:new Map(), contacts:new Map(), conns:new Map(), commitments:[], meetings:[], ask:{q:"",res:null,loading:false}, aiOff:false, partners:[], members:[], me:null, session:null,
  loaded:{companies:false, contacts:false, settings:false}, stale:false, readOnly:false,
  view:"today",
  f:{q:"", group:"target", sector:"", partner:"", province:"", lang:"", channel:"", mine:false},
  k:{q:"", tier:"", mine:false},
  scope:null,
  lists:{lang:"af", groups:["network","target","active"], sector:"", includeContacts:true, tiers:["A","B","C","D"]},
  imp:{rows:[], tags:{}, partner:"", lang:"af", rel:"business", q:"", shown:60, hideExisting:true, source:""},
  sheet:null
};
