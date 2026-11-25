import {test,expect,type Page} from '@playwright/test';
function gate(){let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return{promise,resolve};}
async function session(page:Page,driver:boolean){
 const user={verificationStatus:'APPROVED',id:'owner',role:driver?'DRIVER':'CUSTOMER',fullName:'کاربر نمونه',phone:'09121234567',nationalId:'1234567891',profileComplete:true,hasPassword:true,services:['REPAIR','TOWING','MOBILE_CARWASH','PERIODIC_SERVICE','INSPECTION'],vehicles:[]};
 await page.addInitScript(({user,driver})=>{localStorage.setItem(`khodrochare_${driver?'driver':'customer'}_session_v2`,JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_readiness_v2','1');localStorage.setItem('khodrochare_location_choice_v2','dismissed');Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:(success:PositionCallback)=>success({coords:{latitude:35.7,longitude:51.4,accuracy:10},timestamp:Date.now()} as GeolocationPosition),watchPosition:()=>1,clearWatch:()=>{}}});},{user,driver});
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());return user;
}

for(const driver of [false,true])test(`image only receipt ${driver?'driver':'customer'}`,async({page})=>{
 const user=await session(page,driver);let posted=false;
 await page.route('**/api/v1/**',async r=>{const p=new URL(r.request().url()).pathname;
 if(p.endsWith('/me'))return r.fulfill({json:user});
 if(p.endsWith('/wallet/receipts')){
 if(r.request().method()==='POST'){const body=r.request().postDataBuffer()!.toString();expect(body).toContain('name="file"');expect(body).not.toContain('name="amountToman"');expect(body).not.toContain('name="bankReference"');posted=true;return r.fulfill({json:{id:'receipt'}});}
 return r.fulfill({json:{destination:{cardNumber:'6219861435789192',accountName:'ابوالفضل سلیمانی قرخلو'},items:posted?[{id:'receipt',amountToman:null,bankReference:null,status:'SUBMITTED',createdAt:new Date().toISOString()}]:[]}});}
 if(p.endsWith('/requests')||p.endsWith('/available'))return r.fulfill({json:[]});
 return r.fulfill({json:{balanceToman:0,sandboxBalanceToman:0,mode:'live',entries:[],driver:null}});
 });
 await page.goto(`http://localhost:${driver?3385:3384}/home`);await page.locator('.launch-splash').waitFor({state:'detached'});
 await page.getByRole('button',{name:'باز کردن منو',exact:true}).click();await page.locator('.drawer-nav button').filter({hasText:'کیف پول'}).click();
 const section=page.locator('.wallet-receipts');await expect(section.getByRole('img')).toBeVisible();await expect(section.locator('input:not([type=file])')).toHaveCount(0);
 await expect(section.locator('input[type=file]')).toBeHidden();
 const chooser=page.waitForEvent('filechooser');await section.getByRole('button',{name:'بارگذاری رسید برای افزایش موجودی',exact:true}).click();
 await (await chooser).setFiles({name:'receipt.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+WQAAAAASUVORK5CYII=','base64')});
 await expect(section).toContainText('مبلغ در انتظار تعیین پشتیبانی');expect(posted).toBe(true);
});

test('Hall featured slider is above the feed and no inline promotion strips remain',async({page})=>{
 const user=await session(page,false),now=Date.now();
 const listing=(id:string,featured=false)=>({id,status:'PUBLISHED',version:0,make:'پژو',model:id,trim:'ساده',year:1403,mileage:10000,city:'تهران',priceToman:1000000000,photos:[{id:'photo-'+id,url:'/slides/hall-buy.webp'}],services:[],publishedAt:new Date(now).toISOString(),featuredUntil:featured?new Date(now+3600000).toISOString():null});
 const items=[listing('ladder-1'),listing('ordinary-1'),listing('ordinary-2'),listing('ordinary-3'),listing('ladder-2')];
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/hall/catalog'))return r.fulfill({json:{plans:[],banners:[],paymentMode:'sandbox'}});
  if(p.endsWith('/hall/listings'))return r.fulfill({json:{items,featured:[listing('special',true)],total:items.length,page:1,limit:12}});
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:0,entries:[]}});
  return r.fulfill({json:[]});
 });
 await page.goto('http://localhost:3384/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});
 const slider=page.getByRole('region',{name:'آگهی‌های ویژه تالار خودرو'});await expect(slider).toContainText('special');
 await expect(page.locator('.ch-list-grid .ch-card')).toHaveCount(5);await expect(page.locator('.ch-featured')).toHaveCount(0);
 expect(await page.locator('.ch-list-grid .ch-card').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-listing-id')))).toEqual(items.map(i=>i.id));
 expect((await slider.boundingBox())!.y).toBeLessThan((await page.locator('.ch-list-grid').boundingBox())!.y);
});

test('driver debt notice opens each launch, reaches wallet and disappears after settlement',async({page})=>{
 const user=await session(page,true);let balance=-120000;
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:balance,sandboxBalanceToman:0,mode:'live',entries:[]}});
  if(p.endsWith('/wallet/receipts'))return r.fulfill({json:{items:[],destination:{cardNumber:'6219861435789192',accountName:'KhodroChare'}}});
  return r.fulfill({json:[]});
 });
 await page.goto('http://localhost:3385/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 const notice=page.getByRole('dialog',{name:'پرداخت کمیسیون ناوگان'});
 await expect(notice).toContainText('کاربر نمونه عزیز');await expect(notice).toContainText('۱۲۰٬۰۰۰');
 await notice.getByRole('button',{name:'پرداخت کمیسیون',exact:true}).click();await expect(page.getByRole('heading',{name:'کیف پول',exact:true})).toBeVisible();
 await page.reload();await page.locator('.launch-splash').waitFor({state:'detached'});await expect(notice).toBeVisible();
 balance=0;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(notice).not.toBeVisible();
 await page.reload();await page.locator('.launch-splash').waitFor({state:'detached'});await expect(notice).not.toBeVisible();
});

for(const service of ['REPAIR','TOWING','PERIODIC_SERVICE','MOBILE_CARWASH','INSPECTION'])test(`customer wallet checkout ${service}`,async({page})=>{
 const user=await session(page,false);let charged=false;
 const payment={id:'pay',amountToman:100000,serviceToman:100000,partsToman:0,commissionPercent:30,commissionToman:30000,driverShareToman:70000,status:'AWAITING_PAYMENT',method:null};
 const request={id:'job',customerId:'owner',driverId:'driver',service,status:'COMPLETED',vehicleName:'پژو',vehiclePlate:'12 ب 345',originLat:35.7,originLng:51.4,priceToman:100000,createdAt:new Date().toISOString(),partsApprovedToman:0,payment};
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p==='/api/v1/wallet')return r.fulfill({json:{balanceToman:charged?200000:300000,sandboxBalanceToman:0,mode:'live',entries:[]}});
  if(p.endsWith('/payment/wallet')){expect(r.request().postDataJSON()).toEqual({confirmed:true});charged=true;return r.fulfill({json:{...payment,status:'VERIFIED',method:'WALLET'}});}
  if(p.endsWith('/payment'))return r.fulfill({json:payment});
  if(p.endsWith('/requests/job'))return r.fulfill({json:request});
  if(p.endsWith('/requests'))return r.fulfill({json:[request]});
  return r.fulfill({json:[]});
 });
 await page.goto('http://localhost:3384/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 await page.getByRole('button',{name:'باز کردن منو',exact:true}).click();await page.locator('.drawer-nav button').filter({hasText:'تاریخچه'}).click();
 await page.getByRole('button',{name:'گزینه‌ها',exact:true}).click();await page.locator('.pay-button').click();
 const dialog=page.getByRole('dialog',{name:'پرداخت خدمات'});await expect(dialog.getByRole('button',{name:'پرداخت آنلاین',exact:true})).toBeVisible();await expect(dialog).toContainText('۳۰۰٬۰۰۰ تومان');
 await dialog.getByRole('button',{name:'برداشت از کیف پول',exact:true}).click();await expect(dialog).toContainText('پرداخت از کیف پول با موفقیت انجام شد.');expect(charged).toBe(true);
});
