
function vNetwork(){
  return `<div class="ph"><div><h1>Network map</h1><p>Every partner, everyone they know, and the businesses those people own, work at or brought in. Tap a dot.</p></div></div>
  <div class="chips"><button class="chip on" data-net="p">Partners</button><button class="chip on" data-net="k">People</button><button class="chip on" data-net="c">Businesses</button><button class="chip" data-net="reset">Re-centre</button></div>
  <div class="netwrap"><canvas id="net" aria-label="Network map of partners, people and businesses"></canvas>
  <div class="legend"><span><i style="background:var(--ink)"></i>Partner</span><span><i style="background:var(--tierA)"></i>A · Owner</span><span><i style="background:var(--tierB)"></i>B · Employee</span><span><i style="background:var(--tierC)"></i>C · Potential hire</span><span><i style="background:var(--tierD)"></i>D · Great contact</span><span><i class="sq" style="background:var(--ok)"></i>Business</span></div>
  <div class="netinfo" id="netinfo"></div></div>`;
}
