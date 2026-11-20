import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {performance as hostClock} from 'node:perf_hooks';
const phase=process.env.PERFORMANCE_PHASE||'after',api='https://api.khodrochare.ir/api/v1',jobId='00000000-0000-4000-8000-000000000301';
type Instrumentation={lcp:number|null;cls:number;inpCandidate:number|null;blockingMs:number;longTasks:number;markerAdds:number;markerRemoves:number;mapInitAt:number|null};
declare global{interface Window{__p2:Instrumentation;}}
async function instrument(page:Page,driver:boolean){
 await page.addInitScript(({driver})=>{
  const user={id:'phase2-owner',role:driver?'DRIVER':'CUSTOMER',fullName:'Phase Two',phone:'09121234567',nationalId:'1234567891',services:['REPAIR'],vehicles:[],vehiclePlate:'12 B 345',vehicleType:'PICKUP'};
  localStorage.setItem(`khodrochare_${driver?'driver':'customer'}_session_v2`,JSON.stringify({token:'a'.repeat(64),user,expiresAt:'2099-01-01T00:00:00Z'}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');localStorage.setItem('khodrochare_readiness_v2','0');
  Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:()=>{},watchPosition:()=>1,clearWatch:()=>{}}});
  window.__p2={lcp:null,cls:0,inpCandidate:null,blockingMs:0,longTasks:0,markerAdds:0,markerRemoves:0,mapInitAt:null};
  for(const type of ['largest-contentful-paint','layout-shift','event','longtask'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){
   const extra=e as PerformanceEntry&{value?:number;hadRecentInput?:boolean;interactionId?:number};
   if(type==='largest-contentful-paint')window.__p2.lcp=e.startTime;
   if(type==='layout-shift'&&!extra.hadRecentInput)window.__p2.cls+=extra.value||0;
   if(type==='event'&&extra.interactionId)window.__p2.inpCandidate=Math.max(window.__p2.inpCandidate||0,e.duration);
   if(type==='longtask'){window.__p2.blockingMs+=Math.max(0,e.duration-50);window.__p2.longTasks++;}
  }}).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});}catch{}
  new MutationObserver(records=>{for(const r of records){for(const [nodes,key]of [[r.addedNodes,'markerAdds'],[r.removedNodes,'markerRemoves']] as const)for(const n of nodes){if(!(n instanceof Element))continue;window.__p2[key]+=(n.matches('.leaflet-rescuer-pin')?1:0)+n.querySelectorAll('.leaflet-rescuer-pin').length;if(key==='markerAdds'&&window.__p2.mapInitAt===null&&(n.matches('.leaflet-map-pane')||n.querySelector('.leaflet-map-pane')))window.__p2.mapInitAt=performance.now();}}}).observe(document,{childList:true,subtree:true});
 },{driver});
 await page.route('**/socket.io/**',r=>r.abort());await page.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')}));
}
async function fixture(page:Page,driver:boolean,active:boolean){
 const request={id:jobId,customerId:'phase2-owner',driverId:driver?'phase2-owner':'driver',service:'REPAIR',status:'ACCEPTED',vehicleName:'Test Vehicle',vehiclePlate:'12 B 345',originLat:35.7,originLng:51.4,originAddress:'Origin street',destinationLat:null,destinationLng:null,priceToman:800000,problem:'Inspection',createdAt:'2026-11-20T08:00:00Z',partsQuoteToman:null,payment:null};
 const calls:{path:string;start:number;end:number}[]=[],apiDurations:{path:string;ms:number}[]=[];let trackingReads=0;
 page.on('requestfinished',r=>{if(r.url().startsWith(api)){const t=r.timing();apiDurations.push({path:new URL(r.url()).pathname,ms:t.responseEnd});}});
 await page.route(api+'/**',async r=>{const path=new URL(r.request().url()).pathname.replace('/api/v1',''),row={path,start:hostClock.now(),end:0};calls.push(row);let json:unknown={items:[],total:0},delay=80;
  if(path==='/me')json={id:'phase2-owner',role:driver?'DRIVER':'CUSTOMER',fullName:'Phase Two',phone:'09121234567',nationalId:'1234567891',services:['REPAIR'],vehicles:[],vehiclePlate:'12 B 345',vehicleType:'PICKUP'};
  else if(path==='/requests')json=active?[request]:[];
  else if(path===`/requests/${jobId}`){json=request;delay=300;}
  else if(path.endsWith('/tracking')){trackingReads++;delay=400;json={driver:{latitude:35.71,longitude:51.41,recordedAt:new Date().toISOString()},distanceToOriginMeters:1200,stale:false};}
  else if(path==='/wallet')json={balanceToman:500000,sandboxBalanceToman:0,mode:'live',entries:[]};
  else if(path==='/drivers/requests/available')json=[];
  else if(path==='/drivers/earnings')json={totalToman:0};
  await new Promise(resolve=>setTimeout(resolve,delay));row.end=hostClock.now();await r.fulfill({json,headers:{'Timing-Allow-Origin':'*','Cache-Control':'no-store'}});
 });return{calls,apiDurations,complete:()=>{request.status='COMPLETED';},get trackingReads(){return trackingReads;}};
}
async function metrics(page:Page){return page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;return{...window.__p2,ttfbMs:n?n.responseStart-n.requestStart:null,fcpMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,domContentLoadedMs:n?.domContentLoadedEventEnd??null,jsDecodedBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('.js')).reduce((s,r)=>s+(r as PerformanceResourceTiming).decodedBodySize,0)};});}
function save(name:string,value:unknown){mkdirSync('performance-results/phase2',{recursive:true});writeFileSync(`performance-results/phase2/${phase}-${name}.json`,JSON.stringify(value,null,2));}
for(const driver of [false,true])for(const mobile of [false,true])test(`${driver?'driver':'customer'} ${mobile?'mobile':'desktop'} startup and existing wallet/profile navigation`,async({page,context})=>{
 await page.setViewportSize(mobile?{width:390,height:844}:{width:1280,height:900});await instrument(page,driver);const fixtureData=await fixture(page,driver,false),cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const start=hostClock.now();await page.goto(`http://localhost:${driver?3335:3334}/home`);await page.locator('.launch-splash').waitFor({state:'detached'});const startupMs=hostClock.now()-start,startup=await metrics(page);
 const walletStart=hostClock.now();await page.locator(driver?'.bottom-nav button':'.wallet-strip-cta').nth(driver?1:0).click();await expect(page.locator('.wallet-balance')).toContainText('۵۰۰');const walletNavMs=hostClock.now()-walletStart;
 await expect(page).toHaveScreenshot(`${driver?'driver':'customer'}-${mobile?'mobile':'desktop'}-wallet.png`,{animations:'disabled',maxDiffPixels:0});
 await page.locator('.back-button').first().click();const profileStart=hostClock.now();await page.locator('.bottom-nav').getByRole('button',{name:'پروفایل',exact:true}).click();await expect(page.locator('.bottom-nav .is-active')).toContainText('پروفایل');await expect(page.locator('.subpage')).toBeVisible();const profileNavMs=hostClock.now()-profileStart;
 await expect(page).toHaveScreenshot(`${driver?'driver':'customer'}-${mobile?'mobile':'desktop'}-profile.png`,{animations:'disabled',maxDiffPixels:0});expect(errors).toEqual([]);
 const cpu=await cdp.send('Performance.getMetrics');save(`${driver?'driver':'customer'}-${mobile?'mobile':'desktop'}-startup`,{startupMs,startup,walletNavMs,profileNavMs,final:await metrics(page),api:fixtureData.apiDurations,cpu:Object.fromEntries(cpu.metrics.filter(m=>['TaskDuration','ScriptDuration','JSHeapUsedSize','LayoutDuration','RecalcStyleDuration'].includes(m.name)).map(m=>[m.name,m.value]))});
});
for(const driver of [false,true])for(const mobile of [false,true])test(`${driver?'driver':'customer'} ${mobile?'mobile':'desktop'} active request data and map updates`,async({page,context})=>{
 await page.setViewportSize(mobile?{width:390,height:844}:{width:1280,height:900});await instrument(page,driver);const fixtureData=await fixture(page,driver,true),cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://localhost:${driver?3335:3334}/home`);await page.locator('.launch-splash').waitFor({state:'detached'});
 let navigationMs:number|null=null,mapInitMs:number|null=null;
 if(driver){await page.getByRole('button',{name:'باز کردن منو'}).click();await page.getByRole('button',{name:'بارهای من',exact:true}).click();await page.getByRole('tab',{name:/در حال انجام/}).click();await page.evaluate(()=>{window.__p2.mapInitAt=null;});const start=await page.evaluate(()=>performance.now());await page.getByRole('button',{name:'ادامهٔ بار',exact:true}).click();await expect(page.locator('.leaflet-rescuer-pin')).toHaveCount(1);mapInitMs=await page.evaluate(start=>window.__p2.mapInitAt===null?null:window.__p2.mapInitAt-start,start);}
 else{await page.locator('.waiting-title-row .back-button').click();await page.locator('.bento-main').click();await expect(page.locator('.history-row')).toHaveCount(1);await page.evaluate(()=>{window.__p2.mapInitAt=null;});const start=hostClock.now(),mapStart=await page.evaluate(()=>performance.now());await page.locator('.row-more').first().click();await expect(page.locator('.leaflet-rescuer-pin')).toHaveCount(1);navigationMs=hostClock.now()-start;mapInitMs=await page.evaluate(start=>window.__p2.mapInitAt===null?null:window.__p2.mapInitAt-start,mapStart);}
 // Preserve the existing delayed initialization retry and map settle period.
 await page.waitForTimeout(650);await expect(page).toHaveScreenshot(`${driver?'driver':'customer'}-${mobile?'mobile':'desktop'}-active.png`,{animations:'disabled',maxDiffPixels:0});
 await page.evaluate(()=>{window.__p2.markerAdds=0;window.__p2.markerRemoves=0;});const reads=fixtureData.trackingReads;await expect.poll(()=>fixtureData.trackingReads,{timeout:15000}).toBeGreaterThanOrEqual(reads+2);await page.waitForTimeout(850);
 const mapChurn=await page.evaluate(()=>({adds:window.__p2.markerAdds,removes:window.__p2.markerRemoves}));if(phase==='before')expect(mapChurn.removes).toBeGreaterThan(0);else expect(mapChurn.removes).toBe(0);await expect(page.locator('.leaflet-rescuer-pin')).toHaveCount(1);expect(errors).toEqual([]);
 const cpu=await cdp.send('Performance.getMetrics');save(`${driver?'driver':'customer'}-${mobile?'mobile':'desktop'}-active`,{navigationMs,mapInitMs,mapChurn,trackingReads:fixtureData.trackingReads,calls:fixtureData.calls,metrics:await metrics(page),api:fixtureData.apiDurations,cpu:Object.fromEntries(cpu.metrics.filter(m=>['TaskDuration','ScriptDuration','JSHeapUsedSize','LayoutDuration','RecalcStyleDuration'].includes(m.name)).map(m=>[m.name,m.value]))});
});

test('GPS that arrives before a fresh terminal detail response stays hidden',async({page})=>{
 test.skip(phase==='before','Additional concurrency safety check for the optimized implementation');await instrument(page,false);await fixture(page,false,true);
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);let delivered=0;
 await page.route(api+`/requests/${jobId}`,async r=>{await gate;return r.fulfill({json:{id:jobId,service:'REPAIR',status:'COMPLETED',driverId:'driver',priceToman:800000}});});
 await page.route(api+`/requests/${jobId}/tracking`,async r=>{delivered++;return r.fulfill({json:{driver:{latitude:35.71,longitude:51.41,recordedAt:new Date().toISOString()},distanceToOriginMeters:1200}});});
 try{await page.goto('http://localhost:3334/home');await expect(page.locator('.waiting-page')).toBeAttached();await expect.poll(()=>delivered).toBeGreaterThan(0);await expect(page.locator('.leaflet-rescuer-pin')).toHaveCount(0);release();await expect(page.locator('.map-frame-tag')).toContainText('انجام شد');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.locator('.leaflet-rescuer-pin')).toHaveCount(0);await page.locator('.waiting-title-row .back-button').click();await expect(page.locator('.waiting-page')).toHaveCount(0);}finally{release();}
});
