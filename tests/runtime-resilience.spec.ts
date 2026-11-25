import {test,expect,type Page} from '@playwright/test';
const customer='http://localhost:3384',driver='http://localhost:3385';
const user={id:'resilience-owner',role:'CUSTOMER',fullName:'کاربر تست',phone:'09121234567',nationalId:'1234567891',profileComplete:true,vehicles:[],services:[]};
async function mock(page:Page,signed=false){
 await page.addInitScript(({signed,user})=>{localStorage.setItem('khodrochare_location_choice_v2','dismissed');if(signed)localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));},{signed,user});
 await page.route('**/socket.io/**',r=>r.abort());
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({status:p.endsWith('/me')&&!signed?401:200,json:p.endsWith('/me')?signed?user:{error:'Authentication required'}:p.endsWith('/wallet')?{balanceToman:0,entries:[]}:p.endsWith('/hall/catalog')?{plans:[],banners:[]}:p.endsWith('/hall/listings')?{items:[],featured:[],total:0,page:1,limit:12}:[]});});
}
for(const root of [customer,driver])test(`missing bootstrap chunk recovers once without clearing session: ${root}`,async({page})=>{
 await mock(page);let failed=false,navigations=0;page.on('request',request=>{if(request.isNavigationRequest()&&request.resourceType()==='document')navigations++;});
 await page.route(/\/_next\/static\/.*\.js(?:\?|$)/,r=>{if(!failed){failed=true;return r.abort('failed');}return r.continue();});
 await page.goto(root+'/').catch(error=>{if(!String(error).includes('ERR_ABORTED'))throw error;});
 await expect(page.locator('.auth-page')).toBeVisible({timeout:30000});await expect(page.locator('.launch-splash')).toHaveCount(0);expect(failed).toBe(true);expect(navigations).toBe(2);
 expect(await page.evaluate(()=>sessionStorage.getItem('khodrochare:chunk-recovery'))).toBeTruthy();
});
test('render error offers a Persian retry that restores the Hall',async({page})=>{
 await mock(page,true);let fail=true;
 await page.route('**/hall/listings?*',r=>r.fulfill({json:{items:fail?[null]:[],featured:[],total:0,page:1,limit:12}}));
 await page.goto(customer+'/home?view=hall');await expect(page.getByRole('heading',{name:'بارگذاری صفحه انجام نشد'})).toBeVisible({timeout:30000});
 fail=false;await page.getByRole('button',{name:'تلاش دوباره',exact:true}).click();await expect(page.locator('.ch-hall')).toBeVisible();await expect(page.getByRole('heading',{name:'بارگذاری صفحه انجام نشد'})).toHaveCount(0);
});
test('mobile touch feedback and smooth scrolling respect reduced motion',async({page})=>{
 await mock(page,true);await page.setViewportSize({width:390,height:844});await page.goto(customer+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 const button=page.locator('.bottom-nav button').first();await expect(button).toBeVisible();expect(await button.evaluate(el=>getComputedStyle(el).touchAction)).toMatch(/^(manipulation|pan-x pan-y)$/);
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test.describe('installed web app cache',()=>{
 test.use({serviceWorkers:'allow'});
 test('a warmed hashed script is available offline without caching API responses',async({page,context})=>{
  await mock(page);await page.goto(customer+'/');await expect(page.locator('.auth-page')).toBeVisible({timeout:30000});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
  const asset=await page.locator('script[src*="/_next/static/"]').first().getAttribute('src');expect(asset).toBeTruthy();
  const before=await page.evaluate(async url=>{const r=await fetch(url!);return r.text();},asset);expect(before.length).toBeGreaterThan(100);
  await context.setOffline(true);const cached=await page.evaluate(async url=>{const r=await fetch(url!);return r.text();},asset);expect(cached).toBe(before);await context.setOffline(false);
  const apiKeys=await page.evaluate(async()=>{const keys=await caches.keys(),urls:string[]=[];for(const key of keys){const cache=await caches.open(key);urls.push(...(await cache.keys()).map(r=>r.url));}return urls.filter(url=>new URL(url).pathname.startsWith('/api/'));});expect(apiKeys).toEqual([]);
 });
});
