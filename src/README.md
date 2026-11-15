# Munger Deal Flow – source

The live app (`../index.html`) is built from these parts. Edit the parts, then:

```
cd src && python3 build.py && cp index.html ../index.html
```

Bump the cache name in `../sw.js` (munger-vN) on every deploy so phones pick up the new version.

Parts load in this order (later files override earlier functions): p_head.html (CSS + markup), p_ref, p_state, p_utils, p_lists, p_data, p_ui, p_net, p_phase2 … p_phase7, p_net2, p_net3.
supabase.js / 591.supabase.js (vendored supabase-js 2.45.4) sit in the repo root.
