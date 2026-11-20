// Munger app shell: network first, cached copy when offline. Data is cached on the phone by the app itself.
const CACHE = "munger-v67";
const TILES = "munger-tiles-v1";
const SHELL = ["./", "index.html", "supabase.js", "leaflet.js", "leaflet.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const TILE_HOSTS = /(^|\.)tile\.openstreetmap\.org$|basemaps\.cartocdn\.com$|server\.arcgisonline\.com$|fonts\.(googleapis|gstatic)\.com$/;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== TILES).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function trimTiles(){ const c = await caches.open(TILES); const ks = await c.keys(); if (ks.length > 1500) for (const k of ks.slice(0, ks.length - 1200)) await c.delete(k); }
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (TILE_HOSTS.test(u.hostname)) {
    // Map tiles and fonts: use the saved copy if we have it, so the map works with weak or no signal
    e.respondWith(caches.open(TILES).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === "opaque") { c.put(e.request, r.clone()); if (Math.random() < 0.05) trimTiles(); } return r; }))));
    return;
  }
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
