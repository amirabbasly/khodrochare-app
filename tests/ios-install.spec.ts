import {test,expect,type Browser,type BrowserContext,type Page} from '@playwright/test';
const ios='Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
const mac='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const android='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
async function setup(browser:Browser,ua=ios,mode='browser'){
 const context=await browser.newContext({userAgent:ua,viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.addInitScript(mode=>{
  Object.defineProperty(navigator,'platform',{value:mode==='ipad'?'MacIntel':mode==='desktop'?'MacIntel':'iPhone'});
  Object.defineProperty(navigator,'maxTouchPoints',{value:mode==='ipad'?5:mode==='desktop'?0:1});
  if(mode==='standalone')Object.defineProperty(navigator,'standalone',{value:true});
  if(mode==='native')(window as any).Capacitor={isNativePlatform:()=>true};
  if(mode==='display'){const original=window.matchMedia.bind(window);window.matchMedia=(query:string)=>{const result=original(query);if(query==='(display-mode: standalone)')Object.defineProperty(result,'matches',{value:true});return result;};}
  (window as any).__installSeen=false;new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element&&(node.matches('.ios-install-page')||node.querySelector('.ios-install-page')))(window as any).__installSeen=true;}).observe(document,{subtree:true,childList:true});
 },mode);
 const page=await context.newPage();let authCalls=0;
 await page.route('**/socket.io/**',route=>route.abort());
 await page.route('**/api/v1/**',route=>{if(new URL(route.request().url()).pathname.endsWith('/me'))authCalls++;return route.fulfill({status:401,json:{error:'Authentication required'}});});
 return{context,page,authCalls:()=>authCalls};
}
for(const driver of [false,true]){
 const root=`http://localhost:${driver?3375:3374}`,app=driver?'driver':'customer';
 test(`${app}: iPhone browser gets branded installation first and can continue the same web session`,async({browser})=>{
  const{context,page,authCalls}=await setup(browser);
  try{await page.goto(root);await expect(page.locator('.ios-install-page')).toBeVisible();expect(authCalls()).toBe(0);
   await expect(page.getByRole('img',{name:'لوگوی اصلی خودرو چاره'})).toBeVisible();await expect.poll(()=>page.getByRole('img',{name:'لوگوی اصلی خودرو چاره'}).evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);await expect(page.getByRole('heading',{level:1})).toContainText('۴۰۰٬۰۰۰ نفری');
   await expect(page.getByText('یک قدم تا دسترسی به تمامی خدمات خودرویی',{exact:true})).toBeVisible();await expect(page.locator('.ios-install-steps')).toContainText('Add to Home Screen');await expect(page.locator('.ios-install-steps')).toContainText('Share');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`ios-install-test-results/${app}-iphone.png`,fullPage:true});
   await page.getByRole('button',{name:/فعلاً ادامه در نسخه وب/}).click();await expect(page.locator('#login-heading')).toBeVisible();
   await page.reload();await expect(page.locator('#login-heading')).toBeVisible();await expect(page.locator('.ios-install-page')).toHaveCount(0);
  }finally{await context.close();}
 });
 for(const mode of ['standalone','display','native','webview'])test(`${app}: installed ${mode} never renders installation even briefly`,async({browser})=>{
  const{context,page}=await setup(browser,mode==='webview'?ios.replace(' Version/26.0','').replace(' Safari/604.1',''):ios,mode);
  try{await page.goto(root);await expect(page.locator('#login-heading')).toBeVisible();await expect(page.locator('.ios-install-page')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__installSeen)).toBe(false);}finally{await context.close();}
 });
 test(`${app}: Android and desktop never get an installation or APK download page`,async({browser})=>{
  for(const[ua,mode]of [[android,'android'],[mac,'desktop']]){const{context,page}=await setup(browser,ua,mode);try{await page.goto(root);await expect(page.locator('#login-heading')).toBeVisible();await expect(page.locator('.ios-install-page')).toHaveCount(0);await expect(page.locator('a[href$=".apk"]')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__installSeen)).toBe(false);}finally{await context.close();}}
 });
 test(`${app}: desktop-style iPad Safari is detected and Chrome iOS gets Safari guidance`,async({browser})=>{
  const ipad=await setup(browser,mac,'ipad');try{await ipad.page.setViewportSize({width:1024,height:900});await ipad.page.goto(root);await expect(ipad.page.locator('.ios-install-page')).toBeVisible();await expect.poll(()=>ipad.page.locator('.ios-install-page img').evaluateAll((images:HTMLImageElement[])=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);await ipad.page.screenshot({path:`ios-install-test-results/${app}-ipad.png`,fullPage:true});}finally{await ipad.context.close();}
  const chrome=await setup(browser,ios.replace('Version/26.0','CriOS/140.0.0.0'));try{await chrome.page.goto(root);await expect(chrome.page.getByRole('button',{name:'کپی نشانی برای Safari'})).toBeVisible();}finally{await chrome.context.close();}
 });
 test(`${app}: installed-mode change removes active guidance and payment returns bypass it`,async({browser})=>{
  const{context,page}=await setup(browser);try{await page.goto(root);await expect(page.locator('.ios-install-page')).toBeVisible();await page.evaluate(()=>dispatchEvent(new Event('appinstalled')));await expect(page.locator('#login-heading')).toBeVisible();await page.reload();await expect(page.locator('#login-heading')).toBeVisible();}finally{await context.close();}
  const payment=await setup(browser);try{await payment.page.goto(root+'/payment/return');await expect.poll(payment.authCalls).toBeGreaterThan(0);await expect(payment.page.locator('.ios-install-page')).toHaveCount(0);expect(await payment.page.evaluate(()=>(window as any).__installSeen)).toBe(false);}finally{await payment.context.close();}
 });
}
