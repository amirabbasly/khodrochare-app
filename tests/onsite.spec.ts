import {test,expect,type Page} from '@playwright/test';
const base='http://localhost:3310',apiBase='https://api.khodrochare.ir/api/v1';
const catalog={version:'test-tariff',checkedAt:'2026-11-23',city:'تهران',services:{MOBILE_CARWASH:[{code:'FULL',name:'کارواش کامل؛ روشویی و نظافت داخل'},{code:'TIRE_WAX',name:'واکس چهار لاستیک'}],INSPECTION:[{code:'FULL_INSPECTION',name:'کارشناسی کامل بدنه و فنی'}],PERIODIC_SERVICE:[{code:'ENGINE_OIL',name:'روغن موتور'},{code:'AIR_FILTER',name:'فیلتر هوا'}]}};
async function setup(page:Page){
 const user={id:'owner',role:'CUSTOMER',phone:'09121234567',fullName:'مشتری نمونه',nationalId:'1234567891',profileComplete:true,services:[],vehicles:[]};
 await page.addInitScript(user=>{localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');},user);
 await page.route('**/socket.io/**',r=>r.abort());await page.route('https://tile.openstreetmap.org/**',r=>r.abort());
 const calls:{path:string;method:string;body:Record<string,unknown>|null}[]=[],requests:Record<string,unknown>[]=[];
 let cash=false,receipt=false;
 await page.route(apiBase+'/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1',''),method=req.method(),body=req.headers()['content-type']?.includes('application/json')&&req.postData()?JSON.parse(req.postData()!):null;calls.push({path,method,body});
  const send=(data:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(path==='/me')return send(user);if(path==='/wallet')return send({balanceToman:0,sandboxBalanceToman:0,mode:'live',entries:[]});
  if(path==='/wallet/receipts'){if(method==='POST'){receipt=true;return send({id:'receipt',status:'SUBMITTED'},201);}return send({destination:{cardNumber:'0000000000000000',accountName:'حساب آزمایشی'},items:receipt?[{id:'receipt',amountToman:300000,bankReference:'123456789',status:'SUBMITTED',createdAt:new Date().toISOString()}]:[]});}
  if(path==='/services/onsite')return send(catalog);
  if(path.includes('/estimate')){const code=path.split('/')[3],original=code==='INSPECTION'?4000000:code==='PERIODIC_SERVICE'?0:(body.options.includes('TIRE_WAX')?980000:800000);return send({priceToman:original*0.7,pricingBreakdown:{originalPriceToman:original,discountPercent:30,checkedAt:catalog.checkedAt,city:'تهران'}});}
  if(path==='/requests')return send(requests);
  if(path.endsWith('/payment/cash')){cash=true;return send({id:'payment',status:'AWAITING_PAYMENT',method:'CASH_PENDING',serviceToman:560000,partsToman:0,amountToman:560000,commissionToman:168000,commissionPercent:30,driverShareToman:392000});}
  if(path.endsWith('/payment'))return send({id:'payment',status:'AWAITING_PAYMENT',method:cash?'CASH_PENDING':'GATEWAY',serviceToman:560000,partsToman:0,amountToman:560000,commissionToman:168000,commissionPercent:30,driverShareToman:392000});
  if(['/requests/carwash','/requests/inspection','/requests/maintenance'].includes(path)&&method==='POST'){const service=path.endsWith('carwash')?'MOBILE_CARWASH':path.endsWith('inspection')?'INSPECTION':'PERIODIC_SERVICE';const row={...body,id:'request',customerId:'owner',service,status:'PENDING',originLat:body.origin.latitude,originLng:body.origin.longitude,driverId:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),priceToman:service==='PERIODIC_SERVICE'?0:560000};requests.push(row);return send(row,201);}
  if(path.includes('/tracking'))return send({driver:null});if(path==='/requests/request')return send(requests[0]);return send({});
 });return calls;
}
for(const [id,code] of [['carwash','MOBILE_CARWASH'],['maintenance','PERIODIC_SERVICE'],['inspection','INSPECTION']])test(`new onsite request ${id} on mobile`,async({page})=>{
 await page.setViewportSize({width:390,height:844});const calls=await setup(page);await page.goto(base+`/home?view=service&service=${id}`);await page.locator('.launch-splash').waitFor({state:'detached'});
 if(id==='inspection'){const dialog=page.getByRole('dialog',{name:'انتخاب کارشناسی خودرو'});await expect(dialog.getByRole('button',{name:/کارشناسی رایگان تا فروش/})).toBeDisabled();await expect(dialog.getByRole('button',{name:'رفتن به تالار خودرو'})).toBeVisible();await dialog.getByRole('button',{name:'فقط کارشناسی خودرو'}).click();}else{if(id==='maintenance')await expect(page.getByRole('dialog')).toContainText('اجرت تعویض رایگان است');await page.getByRole('button',{name:'فهمیدم',exact:true}).click();}
 await page.getByPlaceholder('نام خودرو',{exact:true}).fill('پژو ۲۰۷');await page.getByLabel('دو رقم پلاک',{exact:true}).fill('12');await page.getByLabel('سه رقم پلاک',{exact:true}).fill('345');await page.getByLabel('کد ایران پلاک',{exact:true}).fill('67');
 if(id==='carwash'){await page.getByRole('checkbox',{name:'واکس چهار لاستیک'}).check();await expect(page.locator('.onsite-options')).toContainText('۶۸۶٬۰۰۰');}
 else if(id==='inspection')await expect(page.locator('.onsite-options')).toContainText('۲٬۸۰۰٬۰۰۰');else await expect(page.locator('.onsite-options')).toContainText('اجرت تعویض: رایگان');
 await page.locator('.leaflet-container').first().click({position:{x:120,y:120}});await page.screenshot({path:`performance-results/onsite-${id}.png`,fullPage:true});
 await page.getByRole('button',{name:'ثبت درخواست خدمت'}).click();await expect(page.getByRole('heading',{name:'در حال اعزام امدادگر'})).toBeVisible();const sent=calls.find(c=>c.path===`/requests/${id}`&&c.method==='POST');expect(sent?.body?.tariffVersion).toBe('test-tariff');expect(sent?.body?.options).toBeTruthy();expect(calls.some(c=>c.path==='/requests/repair')).toBe(false);expect(code).toBeTruthy();
 if(id==='carwash'){await page.getByRole('button',{name:'پرداخت',exact:true}).click();await page.getByRole('button',{name:'پرداخت در محل به امدادگر'}).click();await expect(page.getByRole('dialog',{name:'پرداخت خدمات'})).toContainText('منتظر تأیید دریافت وجه');}
});
test('wallet receipt stays pending and never immediately credits a customer',async({page})=>{
 await setup(page);await page.goto(base+'/home?view=wallet');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByLabel('مبلغ واریز (تومان)').fill('300000');await page.getByLabel('شماره پیگیری بانکی').fill('123456789');await page.getByLabel(/تصویر رسید/).setInputFiles({name:'receipt.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')});await page.getByRole('button',{name:'ثبت رسید برای بررسی'}).click();await expect(page.getByText(/رسید ثبت شد؛ شارژ حساب فقط/)).toBeVisible();await expect(page.getByText(/در انتظار تأیید اپراتور/)).toBeVisible();await expect(page.locator('.wallet-balance')).toHaveText('۰ تومان');
});
