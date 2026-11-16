h=open('p_head.html').read()
parts=['p_ref.js','p_state.js','p_utils.js','p_lists.js','p_data.js','p_ui.js','p_net.js','p_phase2.js','p_phase3.js','p_phase4.js','p_phase5.js','p_phase6.js','p_phase7.js','p_phase8.js','p_phase9.js','p_phase10.js','p_phase11.js','p_phase12.js','p_phase13.js','p_phase14.js','p_phase15.js','p_phase16.js','p_phase17.js','p_phase18.js','p_phase19.js','p_net2.js','p_net3.js']
import re
v=re.search(r'munger-(v\d+)',open('/home/claude/munger-dealflow/sw.js').read()).group(1)
js='const APP_V="'+v+'";\n'+"\n".join(open(p).read() for p in parts)
open('index.html','w').write(h+js+'''
init();
if("serviceWorker" in navigator){ window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").then(reg=>{ document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") reg.update().catch(()=>{}); }); setInterval(()=>reg.update().catch(()=>{}),30*60*1000); }).catch(()=>{}); });
  let swReloaded=false; const hadCtl=!!navigator.serviceWorker.controller; navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(!hadCtl||swReloaded) return; swReloaded=true; if(!document.querySelector("#modal.on")) location.reload(); else toast("A new version of Munger is ready – it loads next time you open the app"); }); }
</script>
</body>
</html>
''')
