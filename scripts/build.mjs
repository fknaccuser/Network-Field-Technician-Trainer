import {mkdir,readFile,writeFile,cp,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
await import('./icons.mjs');
async function files(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await files(p));else result.push(p);}return result.sort();}
const sources=[...(await files('src')),...(await files('public')),'index.html'];
const digest=createHash('sha256');for(const p of sources){digest.update(p);digest.update(await readFile(p));}const release=digest.digest('hex').slice(0,12);
await rm('dist',{recursive:true,force:true});await mkdir(`dist/releases/${release}`,{recursive:true});
await cp('src',`dist/releases/${release}/src`,{recursive:true});await cp('public','dist',{recursive:true});
let html=(await readFile('index.html','utf8')).replaceAll('./src/',`./releases/${release}/src/`);
await writeFile('dist/index.html',html);await writeFile('dist/404.html',html);await writeFile('dist/.nojekyll','');
const assets=(await files('dist')).filter(p=>!p.endsWith('_headers')).map(p=>'./'+p.slice(5));
await writeFile('dist/sw.js',`const VERSION='field-${release}';const ASSETS=${JSON.stringify(['./',...assets])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/'))return;
  event.respondWith((async()=>{
    const own=await caches.open(VERSION);const match=await own.match(event.request,{ignoreSearch:event.request.mode==='navigate'});if(match)return match;
    if(url.pathname.includes('/releases/')){const retained=await caches.match(event.request);if(retained)return retained;}
    try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate'){const shell=await own.match(new URL('./index.html',self.registration.scope).href);if(shell)return shell;}throw error;}
  })());
});
`);
await writeFile('dist/build.json',JSON.stringify({version:'0.1.0',release,assets:assets.length}));
console.log(`Built The Field 0.1.0 · ${release} · ${assets.length} offline assets`);
