/* ---------------- Reference data ---------------- */
const STAGES = [
  {id:"network", label:"Prospect – we'd look at it", group:"network"},
  {id:"target", label:"Target – going for it", group:"target"},
  {id:"talks", label:"In discussions", group:"active"},
  {id:"won", label:"Deal done", group:"won"},
  {id:"sold", label:"Sold to someone else", group:"closed"},
  {id:"passed", label:"Not for us", group:"closed"}
];
const STAGE = Object.fromEntries(STAGES.map(s=>[s.id,s]));
const LEGACY_STAGE={info:"talks",eval:"talks",offer:"talks",dd:"talks",lead:"network",research:"network",contacted:"network",parked:"network",nurture:"target"};
function stageOf(id){ return STAGE[id]||STAGE[LEGACY_STAGE[id]]||STAGE.network; }
const GROUPS = {network:"Prospects", target:"Targets", active:"In discussions", won:"Deal done", closed:"Closed"};

let CHANNELS = [
  {id:"direct", label:"Direct marketing"},
  {id:"mapping", label:"Industry mapping / vertical integration"},
  {id:"accounting", label:"Accounting firm", contact:true},
  {id:"law", label:"Law firm", contact:true},
  {id:"tax", label:"Tax advisor", contact:true},
  {id:"hatstone", label:"Hatstone client base", contact:true},
  {id:"whatsapp", label:"Partner network (WhatsApp sweep)", contact:true},
  {id:"c2c", label:"Coast to Coast (past deal flow)"},
  {id:"pearl", label:"Pearl Valley roadshow"},
  {id:"friend", label:"Friend / personal referral", contact:true},
  {id:"connector", label:"Connector / intermediary", contact:true},
  {id:"bank", label:"Bank / financier", contact:true},
  {id:"broker", label:"Business broker", contact:true},
  {id:"inbound", label:"Inbound – owner approached us"},
  {id:"other", label:"Other"}
];
let CHANNEL = Object.fromEntries(CHANNELS.map(c=>[c.id,c]));
const TIERS = {
  A:{label:"Owner", desc:"Owns or runs a business that could fit the mandate", action:"Personal call or coffee", types:["Business owner","Managing director / CEO","Family shareholder"]},
  B:{label:"Employee", desc:"Works at a business or partner firm we know: a 2IC, manager, banker, accountant or attorney", action:"Stay in touch: they see what happens inside first", types:["2IC / right hand","Senior manager","Banker / financier","Accountant / auditor","Attorney","Tax advisor","Business broker","Consultant","Wealth / financial adviser","Employee"]},
  C:{label:"Potential hire", desc:"Potential employee: a CEO, CFO, C-suite or hit-squad person we'd love to work with", action:"Keep warm and know when they're open to a move", types:["CEO / MD","CFO / Finance","COO / Operations","Sales & marketing lead","CTO / Tech","Turnaround / hit squad","Board / NED","Specialist / technical expert"]},
  D:{label:"Great contact", desc:"Not an owner, employee or hire, but someone we want in our network: influential, well connected, or great to know", action:"Ask for introductions", types:["Well-connected friend","Sector insider","Community / town figure","Industry body / association","Investor","Creative / media","Service provider","Other"]}
};
const CONTACT_TYPES = [...TIERS.A.types,...TIERS.B.types,...TIERS.C.types];
const LEGACY_TIER = {"Accounting firm":"B","Law firm":"B","Tax advisor":"B","Bank / financier":"B","Business broker":"B","Connector / intermediary":"B","Friend":"D","Business owner":"A","Industry body":"D","Investor":"D","Other":"D"};
function tierOf(k){ return (k&&k.tier&&TIERS[k.tier])? k.tier : (TIERS.A.types.includes(k?.type)?"A":TIERS.B.types.includes(k?.type)?"B":LEGACY_TIER[k?.type]||"D"); }
function tierBadge(t){ return `<span class="tier ${t}" title="${t} – ${esc(TIERS[t].label)}">${t}</span>`; }
const CHANNEL_TO_TYPE = {accounting:"Accountant / auditor",law:"Attorney",tax:"Tax advisor",friend:"Well-connected friend",connector:"Sector insider",bank:"Banker / financier",broker:"Business broker",hatstone:"Attorney",whatsapp:"Business owner"};
const CHANNEL_TO_TIER = {accounting:"B",law:"B",tax:"B",bank:"B",broker:"B",hatstone:"B",friend:"C",connector:"C",whatsapp:"A"};

const INDUSTRIES = {
  "Agriculture":["Fruit & citrus","Grain & field crops","Vegetables & horticulture","Livestock & dairy","Poultry & eggs","Wine & viticulture","Nuts (macadamia, pecan)","Mushrooms & specialty crops","Forestry & timber","Aquaculture & fishing","Agri inputs & services"],
  "Agro-processing & food":["Food manufacturing","Juice & concentrates","Meat processing","Milling & bakery","Packhouses & cold storage","Beverages, wineries & breweries","Animal feed"],
  "Manufacturing":["Engineering & metal fabrication","Plastics & packaging","Chemicals","Automotive components","Textiles & clothing","Furniture & wood products","Building materials","Electrical equipment","Printing & signage"],
  "Mining & energy":["Mining & quarrying","Mining services & equipment","Renewable energy & solar","Fuel distribution","Water & waste management"],
  "Construction & property":["Construction & civils","Specialist contractors (electrical, HVAC, plumbing)","Property development","Property management","Equipment & plant hire"],
  "Trade & distribution":["Wholesale & distribution","Retail","FMCG brands","Franchise groups","Automotive dealerships & aftermarket","E-commerce"],
  "Logistics & transport":["Road freight","Cold chain logistics","Warehousing","Courier & last mile","Passenger transport","Marine & aviation services"],
  "Tourism & hospitality":["Hotels & guesthouses","Game lodges & reserves","Tour operators","Restaurants & catering","Golf & leisure estates","Events & venues"],
  "Health & education":["Private clinics & practices","Pharmacies","Pharmaceuticals & medical devices","Veterinary","Frail care & retirement","Private schools","Training & skills development"],
  "Business & financial services":["Accounting & tax","Legal","Consulting","Insurance & brokers","Financial services & lending","Staffing & labour","Security services","Facilities management & cleaning","Marketing & media"],
  "Technology":["Software & SaaS","IT & managed services","Telecoms & ISPs","Data & fintech"],
  "Creative & media":["Video, film & editing","Photography","Content & social media","Graphic design & branding","Copywriting, PR & communications","Events, MCs & presenters","Music & audio"],
  "Professional services":["Architecture & interior design","Engineering consulting","Quantity surveying","Town planning","Property valuation","Recruitment & executive search","Coaching & training"],
  "Other":["Funeral services","Other"]
};
const SECTORS = Object.keys(INDUSTRIES);
const PROVINCES = ["Western Cape","Eastern Cape","Northern Cape","Free State","KwaZulu-Natal","North West","Gauteng","Mpumalanga","Limpopo","Namibia","Eswatini","Botswana","Other"];
const EBIT = ["Unknown","< R10m","R10–30m","R30–50m","R50m+"];
const LANGS = {af:"Afrikaans", en:"English", both:"Both"};
const CADENCE = [{m:0,l:"No scheduled check-in"},{m:1,l:"Every month"},{m:3,l:"Every 3 months"},{m:6,l:"Every 6 months"},{m:12,l:"Every 12 months"}];

