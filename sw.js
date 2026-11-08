/* Atalaia System · app do celular funcionando sem internet
   Guarda a página do app e as bibliotecas. Os dados ficam no próprio app (IndexedDB).
   Não intercepta o painel do Gestor, a Matriz, a página do QR nem o servidor. */
const V="atalaia-app-0.3.5";
const CDN=["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
  "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"];
const BASE=new URL("./",self.location).pathname;           // "/" no site
const PAGINA=BASE+"index.html";
self.addEventListener("install",ev=>{ev.waitUntil(caches.open(V).then(c=>Promise.all([
  c.add(new Request(PAGINA,{cache:"reload"})).catch(()=>{}),
  ...CDN.map(u=>c.add(new Request(u,{mode:"cors"})).catch(()=>{}))])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",ev=>{ev.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("atalaia-app-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",ev=>{const r=ev.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin===self.location.origin&&(u.pathname===BASE||u.pathname===PAGINA)){
    ev.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(PAGINA,cp))}return res}).catch(()=>caches.match(PAGINA).then(x=>x||Response.error())));return}
  if(u.origin===self.location.origin&&u.pathname===BASE+"versao.json"){ev.respondWith(fetch(r).catch(()=>new Response("{}",{headers:{"content-type":"application/json"}})));return}
  if(CDN.includes(u.origin+u.pathname)){ev.respondWith(caches.match(u.origin+u.pathname).then(x=>x||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(u.origin+u.pathname,cp))}return res})));return}
});
