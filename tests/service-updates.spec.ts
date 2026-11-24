import {test,expect,type Page} from '@playwright/test';
function gate(){let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return{promise,resolve};}
async function session(page:Page,driver:boolean){
 const user={verificationStatus:'APPROVED',id:'owner',role:driver?'DRIVER':'CUSTOMER',fullName:'کاربر نمونه',phone:'09121234567',nationalId:'1234567891',profileComplete:true,hasPassword:true,services:['REPAIR','TOWING','MOBILE_CARWASH','PERIODIC_SERVICE','INSPECTION'],vehicles:[]};
 await page.addInitScript(({user,driver})=>{localStorage.setItem(`khodrochare_${driver?'driver':'customer'}_session_v2`,JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_readiness_v2','1');localStorage.setItem('khodrochare_location_choice_v2','dismissed');Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:(success:PositionCallback)=>success({coords:{latitude:35.7,longitude:51.4,accuracy:10},timestamp:Date.now()} as GeolocationPosition),watchPosition:()=>1,clearWatch:()=>{}}});},{user,driver});
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());return user;
}
for(const service of ['REPAIR','TOWING','MOBILE_CARWASH','PERIODIC_SERVICE','INSPECTION'])test(`driver cash receipt enables completion for ${service}`,async({page})=>{
 const user=await session(page,true),repair=['REPAIR','PERIODIC_SERVICE'].includes(service),stale=gate();let hold=false,waiting=false,receipts=0,completed=false;
 const request:any={id:'request',customerId:'customer',customer:{fullName:'مشتری نمونه'},driverId:'owner',service,status:'ARRIVED',vehicleName:'پژو',vehiclePlate:'12 ب 345',originLat:35.7,originLng:51.4,originAddress:'تهران',priceToman:800000,createdAt:new Date().toISOString(),operationsStartedAt:repair?new Date().toISOString():null,partsQuoteToman:repair?0:null,partsApprovedToman:repair?0:null,driverCommissionConfirmedAt:repair?new Date().toISOString():null,payment:null};
 await page.route('**/api/v1/**',async r=>{const p=new URL(r.request().url()).pathname,send=(json:unknown)=>r.fulfill({json});
  if(p.endsWith('/me'))return send(user);
  if(p.endsWith('/requests/request/commission-confirm')||p.endsWith('/requests/request/payment/cash/confirm')){receipts++;request.payment={status:'VERIFIED',method:'CASH',amountToman:800000,checkouts:[]};request.driverCommissionConfirmedAt=new Date().toISOString();return send(request);}
  if(p.endsWith('/requests/request/status')){expect(r.request().postDataJSON()).toEqual({status:'COMPLETED'});request.status='COMPLETED';completed=true;return send(request);}
  if(p.endsWith('/requests/request'))return send(request);
  if(p.endsWith('/requests')){if(hold){hold=false;waiting=true;const old=JSON.parse(JSON.stringify(request));await stale.promise;return send([old]);}return send([request]);}
  if(p.endsWith('/available'))return send([]);
  return send({totalToman:0,balanceToman:0,entries:[],driver:null});
 });
 try{await page.goto('http://localhost:3385/home');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('button',{name:'باز کردن منو',exact:true}).click();await page.getByRole('button',{name:'بارهای من',exact:true}).click();await page.getByRole('tab',{name:/در حال انجام/}).click();await page.getByRole('button',{name:'ادامهٔ بار',exact:true}).click();
  const finish=page.locator('.job-actions .primary-button');await expect(finish).toBeDisabled();
  if(service==='REPAIR'){hold=true;await expect.poll(()=>waiting,{timeout:12000}).toBe(true);}
  {const checkbox=page.getByRole('checkbox',{name:'کمیسیون به من پرداخت کرد',exact:true});await expect(checkbox).toBeEnabled();await expect(checkbox).not.toBeChecked();await checkbox.check();}await expect(page.getByRole('button',{name:'وجه کامل را در محل دریافت کردم',exact:true})).toHaveCount(0);
  await expect(finish).toBeEnabled();expect(receipts).toBe(1);
  if(service==='REPAIR'){const oldResponse=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/requests'));stale.resolve();await oldResponse;await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));await expect(finish).toBeEnabled();}
  if(!repair)await finish.click();await finish.click();await expect.poll(()=>completed).toBe(true);expect(receipts).toBe(1);
 }finally{stale.resolve();}
});
for(const driver of [false,true])test(`${driver?'driver':'customer'} shortcuts and diagnostic offer preserve price and never start payment`,async({page})=>{
 const user=await session(page,driver);let payments=0;
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;if(p.endsWith('/me'))return r.fulfill({json:user});if(p.includes('/checkout')||p.includes('/payments'))payments++;if(p.endsWith('/requests')||p.endsWith('/available'))return r.fulfill({json:[]});return r.fulfill({json:{items:[],total:0,page:1,limit:12,pagination:{page:1,totalPages:1,total:0,limit:20},totalToman:0,balanceToman:0,entries:[],driver:null}});});
 const root=`http://localhost:${driver?3385:3384}`;await page.goto(root+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});const row=page.locator('.main-service-shortcuts');
 await expect(row.getByRole('button',{name:'واردات خودرو',exact:true})).toBeVisible();await expect(row.getByRole('button',{name:'واردات قطعات خاص',exact:true})).toBeVisible();await row.getByRole('button',{name:'واردات خودرو',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();
 if(driver)await expect(row.getByRole('link',{name:'فروش خودرو',exact:true})).toHaveAttribute('href','https://app.khodrochare.ir/home?view=hall');else{await row.getByRole('button',{name:'فروش خودرو',exact:true}).click();await expect(page.locator('.ch-hall')).toBeVisible();await page.goto(root+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});}
 await page.locator('.main-service-shortcuts').getByRole('button',{name:'جمعه بازار',exact:true}).click();await expect(page.locator('.jm-store')).toBeVisible();
 await page.goto(root+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});await page.locator('.service-card').filter({hasText:'دیاگ سیار'}).click();await expect(page.getByRole('heading',{name:'دیاگ سیار هوشمند',exact:true})).toBeVisible();
 await expect(page.locator('.diagnostic-price del')).toHaveText('۱٬۱۵۰٬۰۰۰ تومان');await expect(page.locator('.diagnostic-price>strong')).toContainText('۵۵۹٬۰۰۰');await page.getByRole('button',{name:'خرید دیاگ سیار',exact:true}).click();await expect(page.getByRole('dialog').getByRole('heading',{name:'این ماژول در حال تکمیل است',exact:true})).toBeVisible();expect(payments).toBe(0);await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();
 await page.goto(root+'/diagnostic');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.getByRole('heading',{name:'دیاگ سیار هوشمند',exact:true})).toBeVisible();await expect.poll(()=>page.getByRole('img',{name:'دستگاه دیاگ OBD-II خودرو چاره',exact:true}).evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`service-update-test-results/${driver?'driver':'customer'}-diagnostic-mobile.png`,fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`service-update-test-results/${driver?'driver':'customer'}-diagnostic-desktop.png`,fullPage:true});expect(payments).toBe(0);
});

test('driver registration and approval notices appear once, pending can browse but cannot accept, debt blocks until settlement',async({page})=>{
 const user:any={...await session(page,true),verificationStatus:'PENDING',registrationNoticeSeenAt:null,verificationNoticeSeenAt:null};
 await page.addInitScript(()=>localStorage.setItem('khodrochare_readiness_v2','0'));
 let accepts=0,balance=-100,assigned=false;
 const offer={id:'new-job',service:'REPAIR',vehicleName:'پژو',originLat:35.7,originLng:51.4,priceToman:800000,createdAt:new Date().toISOString(),status:'PENDING'};
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.includes('/verification-notices/')){if(p.endsWith('/registration'))user.registrationNoticeSeenAt=new Date().toISOString();else user.verificationNoticeSeenAt=new Date().toISOString();return r.fulfill({json:user});}
  if(p.endsWith('/available'))return r.fulfill({json:assigned?[]:[offer]});
  if(p.endsWith('/requests'))return r.fulfill({json:[]});
  if(p.endsWith('/accept')){accepts++;assigned=true;return r.fulfill({json:{...offer,status:'ACCEPTED',driverId:user.id}});}
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:balance,sandboxBalanceToman:0,mode:'live',entries:[]}});
  return r.fulfill({json:{totalToman:0,driver:null}});
 });
 await page.goto('http://localhost:3385/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 await expect(page.getByRole('dialog')).toContainText('ثبت‌نام شما با موفقیت ثبت شد');await expect(page.getByRole('dialog')).toContainText('۲۴ ساعت');await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.reload();await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'تأیید و گرفتن بار',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('احراز هویت شما در صف بررسی');expect(accepts).toBe(0);await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();
 await page.locator('.service-card').filter({hasText:'دیاگ سیار'}).click();await page.getByRole('button',{name:'خرید دیاگ سیار',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('احراز هویت شما در صف بررسی');await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();
 await page.getByRole('button',{name:'بازگشت',exact:true}).click();
 user.verificationStatus='APPROVED';await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.getByRole('dialog')).toContainText('۳۰ هزارنفری');await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();
 await page.goto('http://localhost:3385/home');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('switch',{name:/آمادگی دریافت بار/}).first().click();await page.getByRole('button',{name:'تأیید و گرفتن بار',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'تا زمان تسویه بدهی'})).toBeVisible();expect(accepts).toBe(0);
 balance=0;const walletReload=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/wallet'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await walletReload;await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
 await page.getByRole('button',{name:'تأیید و گرفتن بار',exact:true}).click();await expect.poll(()=>accepts).toBe(1);
});

test('customer supplemental services have four distinct icons and the parts label stays on one line at 320px',async({page})=>{
 const user=await session(page,false);await page.route('**/api/v1/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('/me')?user:[]}));
 await page.setViewportSize({width:320,height:800});await page.goto('http://localhost:3384/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 const row=page.locator('.main-service-shortcuts');await expect(row.locator('svg')).toHaveCount(4);
 const check=await row.locator('.shortcut-parts-label').evaluate(el=>{const style=getComputedStyle(el),parent=el.parentElement!;return{nowrap:style.whiteSpace,within:el.getBoundingClientRect().width<=parent.getBoundingClientRect().width,text:el.textContent};});expect(check.nowrap).toBe('nowrap');expect(check.within).toBe(true);expect(check.text).toBe('واردات قطعات خاص');
 await row.screenshot({path:'service-update-test-results/customer-main-shortcuts-320.png'});
});

test('operator verification tab previews private documents, approves drivers and edits approved information',async({page})=>{
 const operator={id:1,role:'admin',first_name:'مدیر',last_name:'نمونه',username:'admin'};
 const driver:any={id:'00000000-0000-4000-8000-000000000001',role:'DRIVER',fullName:'امدادگر نمونه',phone:'09120000002',nationalId:'1234567891',vehicleType:'نیسان',vehiclePlate:'12 ب 345',activityCity:'تهران',activityDistrict:'مرکزی',services:['REPAIR'],isActive:true,identityDocumentId:'doc',verificationStatus:'PENDING',verificationVersion:0,createdAt:new Date().toISOString()};
 let approved=0,edits=0;
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','test-token');localStorage.setItem('kcrm.user',JSON.stringify(user));},operator);
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/auth/me'))return r.fulfill({json:{user:operator}});
  if(p.endsWith('/driver-verifications'))return r.fulfill({json:{items:[driver],pagination:{page:1,total:1,totalPages:1,limit:20}}});
  if(p.endsWith('/documents/doc'))return r.fulfill({json:{image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+WQAAAAASUVORK5CYII='}});
  if(p.endsWith('/profile')){edits++;Object.assign(driver,r.request().postDataJSON());driver.verificationVersion++;return r.fulfill({json:driver});}
  if(p.endsWith('/review')){approved++;driver.verificationStatus='APPROVED';driver.verificationVersion++;driver.verificationReviewedAt=new Date().toISOString();return r.fulfill({json:driver});}
  if(p.endsWith('/'+driver.id))return r.fulfill({json:{user:driver,documents:[{id:'doc',createdAt:new Date().toISOString()}]}});
  return r.fulfill({json:{items:[],pagination:{page:1,total:0,totalPages:1,limit:20}}});
 });
 await page.goto('http://localhost:3386/super-app');await page.getByRole('tab',{name:'احراز امدادگران',exact:true}).click();await page.getByRole('button',{name:'بررسی مدارک و ویرایش',exact:true}).click();
 const modal=page.getByRole('dialog');await expect(modal).toContainText('امدادگر');await expect(modal.getByRole('link',{name:'09120000002'})).toHaveAttribute('href','tel:09120000002');
 await modal.getByRole('button',{name:/مشاهده مدرک هویتی فعلی/}).click();await expect(modal.getByRole('img')).toBeVisible();
 await modal.getByRole('button',{name:'تأیید مدارک و فعال‌سازی ماژول‌ها',exact:true}).click();await expect(modal.getByRole('button',{name:'تأیید مدارک و فعال‌سازی ماژول‌ها',exact:true})).toBeDisabled();expect(approved).toBe(1);
 await modal.getByLabel('شهر فعالیت',{exact:true}).fill('مشهد');await modal.getByRole('button',{name:'ذخیره اطلاعات',exact:true}).click();await expect.poll(()=>edits).toBe(1);expect(driver.activityCity).toBe('مشهد');expect(driver.verificationStatus).toBe('APPROVED');
 await page.screenshot({path:'service-update-test-results/operator-driver-verification.png',fullPage:true});
});
