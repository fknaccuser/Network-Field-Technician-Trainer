import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync,spawn} from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
import {newProfile} from '../src/core/store.js';
import {createMission} from '../src/core/network.js';
import {newStudy} from '../src/core/study.js';
import {redeemAuthorization} from '../src/core/authorization.js';
import * as views from '../src/ui/views.js';

execFileSync(process.execPath,['scripts/build.mjs']);
const html=await readFile('dist/index.html','utf8');

test('build references only existing relative assets and contains no owner private key',async()=>{
  for(const match of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)){assert.ok((await stat(path.join('dist',match[1]))).isFile());}
  assert.match(html,/releases\/[a-f0-9]{12}\/src\/app\.js/);assert.equal(await stat('dist/.owner').catch(()=>null),null);
  const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');for(const icon of manifest.icons)assert.ok((await stat(path.join('dist',icon.src))).size>100);
});
test('service worker precaches the entire bundle and serves cold offline requests at root and a GitHub project path',async()=>{
  const source=await readFile('dist/sw.js','utf8');
  for(const prefix of ['/','/Network-Field-Technician-Trainer/']){
    const base='https://example.test'+prefix,handlers={},saved=new Map();let network=true;
    const key=(request)=>new URL(typeof request==='string'?request:request.url,base).href;
    const fakeFetch=async request=>{if(!network)throw new Error('offline');const url=new URL(key(request));let relative=url.pathname.slice(prefix.length)||'index.html';const bytes=await readFile(path.join('dist',relative));return new Response(bytes);};
    const cache={addAll:async urls=>{for(const u of urls)saved.set(key(u),await fakeFetch(u));},match:async(request,options={})=>{const url=new URL(key(request));if(options.ignoreSearch)url.search='';return saved.get(url.href)?.clone();}};
    const context={URL,Response,self:{location:{origin:'https://example.test'},registration:{scope:base},clients:{claim:async()=>{}},skipWaiting:()=>{},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>cache,match:cache.match},fetch:fakeFetch};
    vm.runInNewContext(source,context);let install;handlers.install({waitUntil:p=>install=p});await install;assert.ok(saved.size>=20);network=false;
    async function request(url,mode='cors'){let response;handlers.fetch({request:{url:new URL(url,base).href,method:'GET',mode},respondWith:p=>response=p});return response;}
    assert.match(await (await request('./','navigate')).text(),/The Field/);
    const script=html.match(/src="(\.\/releases\/[^\"]+app\.js)"/)[1];assert.match(await (await request(script)).text(),/bootstrap/);
    const content=script.replace('app.js','data/curriculum.js');assert.match(await (await request(content)).text(),/QUESTIONS/);
    assert.match(await (await request('./missing-route','navigate')).text(),/The Field/);
    assert.equal(await request('./api/private'),undefined);
  }
});
test('all main view renderers and four study modes render with escaped personal content',()=>{
  const p=newProfile('<img src=x onerror=alert(1)>','ccna');p.gate='passed';const ui={saved:true,route:'today',domain:'all',missionTab:'overview'};
  for(const fn of [views.today,views.study,views.career,views.profileView,views.crewView,views.sandboxView]){const output=fn(p,ui);assert.ok(output.length>100);assert.doesNotMatch(output,/<img src=x/);}
  for(const mode of ['questions','flashcards','blank','wordbank']){p.session=newStudy({seed:mode,mode,count:5});assert.match(views.studySession(p,ui),/STUDY SESSION/);}
  p.activeMission=createMission('render');for(const missionTab of ['overview','terminal','evidence','ticket'])assert.ok(views.missionView(p,{...ui,missionTab}).length>100);
});
test('signed reassessment authorization is bound to one learner and consumed at redemption',async()=>{
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const issuer=await crypto.subtle.exportKey('jwk',pair.publicKey),p=newProfile('Learner','ccna');p.gate='locked';
  const payload=Buffer.from(JSON.stringify({id:'one-time',subject:p.id,purpose:'prerequisite-reassessment'})).toString('base64url');
  const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},pair.privateKey,new TextEncoder().encode(payload));const code=payload+'.'+Buffer.from(signature).toString('base64url');
  const other=newProfile('Other learner','ccna');await assert.rejects(redeemAuthorization(code,other,issuer),/not issued/);
  await redeemAuthorization(code,p,issuer);assert.equal(p.gate,'authorized');assert.equal(p.grant.id,'one-time');await assert.rejects(redeemAuthorization(code,p,issuer),/already been redeemed/);
  await assert.rejects(redeemAuthorization(code+'.tampered',p,issuer),/Invalid/);
});
test('preview HTTP server serves the built shell and correct module content types',async()=>{
  const server=spawn(process.execPath,['scripts/serve.mjs','dist'],{env:{...process.env,PORT:'43191'},stdio:['ignore','pipe','pipe']});
  try{
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server startup timed out')),5000);server.stdout.once('data',()=>{clearTimeout(timer);resolve();});server.once('error',reject);});
    const response=await fetch('http://localhost:43191/');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);
    const script=html.match(/src="(\.\/releases\/[^\"]+app\.js)"/)[1];const js=await fetch(new URL(script,'http://localhost:43191/'));assert.equal(js.status,200);assert.match(js.headers.get('content-type'),/javascript/);
    assert.equal((await fetch('http://localhost:43191/does-not-exist.js')).status,404);
  } finally {server.kill();}
});
