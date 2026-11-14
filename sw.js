/* Atalaia System · app do celular e painel do Gestor funcionando sem internet
   Guarda as páginas e as bibliotecas. Os dados ficam no próprio app/painel (IndexedDB).
   Não intercepta a Matriz, a página do QR, os termos nem o servidor. */
const V="atalaia-app-0.3.22";
const CDN=["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
  "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js",
  "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js"];
const BASE=new URL("./",self.location).pathname;           // "/" no site
const PAGINAS={[BASE]:BASE+"index.html",[BASE+"index.html"]:BASE+"index.html",[BASE+"gestor/"]:BASE+"gestor/index.html",[BASE+"gestor/index.html"]:BASE+"gestor/index.html"};
self.addEventListener("install",ev=>{ev.waitUntil(caches.open(V).then(c=>Promise.all([
  c.add(new Request(BASE+"index.html",{cache:"reload"})).catch(()=>{}),
  c.add(new Request(BASE+"gestor/index.html",{cache:"reload"})).catch(()=>{}),
  ...CDN.map(u=>c.add(new Request(u,{mode:"cors"})).catch(()=>{}))])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",ev=>{ev.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("atalaia-app-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",ev=>{const r=ev.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin===self.location.origin&&PAGINAS[u.pathname]){const chave=PAGINAS[u.pathname];
    ev.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(chave,cp))}return res}).catch(()=>caches.match(chave).then(x=>x||Response.error())));return}
  if(u.origin===self.location.origin&&u.pathname===BASE+"versao.json"){ev.respondWith(fetch(r).catch(()=>new Response("{}",{headers:{"content-type":"application/json"}})));return}
  if(CDN.includes(u.origin+u.pathname)){ev.respondWith(caches.match(u.origin+u.pathname).then(x=>x||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(u.origin+u.pathname,cp))}return res})));return}
});
