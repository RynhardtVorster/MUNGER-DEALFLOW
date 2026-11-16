h=open('p_head.html').read()
parts=['p_ref.js','p_state.js','p_utils.js','p_lists.js','p_data.js','p_ui.js','p_net.js','p_phase2.js','p_phase3.js','p_phase4.js','p_phase5.js','p_phase6.js','p_phase7.js','p_phase8.js','p_phase9.js','p_phase10.js','p_phase11.js','p_phase12.js','p_phase13.js','p_phase14.js','p_net2.js','p_net3.js']
js="\n".join(open(p).read() for p in parts)
open('index.html','w').write(h+js+'''
init();
if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{})); }
</script>
</body>
</html>
''')
