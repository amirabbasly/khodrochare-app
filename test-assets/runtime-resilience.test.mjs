import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function worker(file){
 const listeners={},stores=new Map();let calls=0,network=async()=>new Response('network',{headers:{'content-type':'text/html'}});
 const key=r=>typeof r==='string'?new URL(r,'https://app.test').href:r.url;
 const caches={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{
  if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);
  return {addAll:async paths=>{for(const p of paths)entries.set(key(p),new Response('offline'));},put:async(r,v)=>entries.set(key(r),v),match:async(r,options)=>{const url=key(r);for(const [k,v] of entries)if(k===url||(options?.ignoreSearch&&k.split('?')[0]===url.split('?')[0]))return v.clone();}};
 },match:async r=>{for(const name of stores.keys()){const found=await(await caches.open(name)).match(r);if(found)return found;}}};
 vm.runInNewContext(readFileSync(new URL(file,import.meta.url),'utf8'),{self:{location:{origin:'https://app.test'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>listeners[name]=fn},URL,Response,caches,fetch:async(...args)=>{calls++;return network(...args);}});
 async function run(name,request){let response;const tasks=[];listeners[name]({request,waitUntil:p=>tasks.push(p),respondWith:p=>response=p});const result=await response;await Promise.all(tasks);return result;}
 return {run,caches,stores,get calls(){return calls;},set network(fn){network=fn;}};
}
for(const [file,current,previous] of [['../public/sw.js','khodro-chare-shell-v16','khodro-chare-shell-v15'],['../../khodrochare-driver/public/sw.js','khodro-chare-fleet-v9','khodro-chare-fleet-v8']]){
 test(`${file}: hashed assets reuse cache; API and mutations bypass it; activation retains previous chunks`,async()=>{
  const w=worker(file),request={url:'https://app.test/_next/static/chunks/hash.js',mode:'cors',method:'GET',destination:'script'};
  await w.caches.open(previous);await w.caches.open('unrelated-app');await w.run('install');await w.run('activate');
  assert(w.stores.has(previous));assert(w.stores.has('unrelated-app'));
  assert.equal(await(await w.run('fetch',request)).text(),'network');assert.equal(await(await w.run('fetch',request)).text(),'network');assert.equal(w.calls,1);
  await(await w.caches.open(previous)).put({...request,url:'https://app.test/_next/static/chunks/old.js'},new Response('old build'));
  assert.equal(await(await w.run('fetch',{...request,url:'https://app.test/_next/static/chunks/old.js'})).text(),'old build');assert.equal(w.calls,1);
  assert.equal(await w.run('fetch',{...request,url:'https://app.test/api/v1/wallet'}),undefined);
  assert.equal(await w.run('fetch',{...request,method:'POST'}),undefined);assert.equal(w.calls,1);
  assert(w.stores.has(current));
 });
 test(`${file}: never cache failed navigation or restore old-build HTML; offline fallback stays usable`,async()=>{
  const w=worker(file),request={url:'https://app.test/home',mode:'navigate',method:'GET'};await w.run('install');
  await(await w.caches.open(previous)).put(request,new Response('stale html'));
  w.network=async()=>{throw new Error('offline');};assert.equal(await(await w.run('fetch',request)).text(),'offline');
  w.network=async()=>new Response('server error',{status:500,headers:{'content-type':'text/html'}});assert.equal((await w.run('fetch',request)).status,500);assert.equal(await(await w.caches.open(current)).match(request),undefined);
  w.network=async()=>new Response('fresh html',{headers:{'content-type':'text/html'}});await w.run('fetch',request);
  w.network=async()=>{throw new Error('offline');};assert.equal(await(await w.run('fetch',request)).text(),'fresh html');
 });
}
function recovery({offline=false,blocked=false}={}){
 const listeners={},storage=new Map(),module={exports:{}};let reloads=0;
 const js=ts.transpileModule(readFileSync(new URL('../src/lib/chunk-recovery.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(js,{module,exports:module.exports});class Script{constructor(src){this.src=src;}}
 vm.runInNewContext(module.exports.chunkRecoveryScript,{addEventListener:(n,fn)=>listeners[n]=fn,navigator:{onLine:!offline},location:{origin:'https://app.test',href:'https://app.test/home',reload:()=>reloads++},HTMLScriptElement:Script,URL,Date,sessionStorage:{getItem:k=>{if(blocked)throw new Error();return storage.get(k);},setItem:(k,v)=>storage.set(k,v)},setTimeout:fn=>fn()});
 return {listeners,Script,storage,get reloads(){return reloads;}};
}
test('chunk recovery retries only code failures once and preserves session/form data',()=>{
 const r=recovery();r.storage.set('session','keep');r.listeners.unhandledrejection({reason:new Error('Payment failed')});assert.equal(r.reloads,0);
 r.listeners.error({target:new r.Script('https://other.test/_next/static/hash.js')});assert.equal(r.reloads,0);
 r.listeners.error({target:new r.Script('https://app.test/_next/static/hash.js')});r.listeners.unhandledrejection({reason:new Error('Failed to load chunk hash')});assert.equal(r.reloads,1);assert.equal(r.storage.get('session'),'keep');
 for(const options of [{offline:true},{blocked:true}]){const noRetry=recovery(options);noRetry.listeners.unhandledrejection({reason:new Error('ChunkLoadError')});assert.equal(noRetry.reloads,0);}
 const cooling=recovery();cooling.storage.set('khodrochare:chunk-recovery',String(Date.now()));cooling.listeners.unhandledrejection({reason:new Error('ChunkLoadError')});assert.equal(cooling.reloads,0);
});
