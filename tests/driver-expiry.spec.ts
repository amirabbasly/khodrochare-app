import {test,expect,type Page} from '@playwright/test';
const api='https://api.khodrochare.ir/api/v1',url='http://localhost:3335',lifetime=6*60*60*1000;
async function setup(page:Page){
 const user={id:'owner',role:'DRIVER',fullName:'سفیر تست',phone:'09121234567',nationalId:'1234567891',services:['REPAIR'],vehicles:[],vehiclePlate:'12 ب 345',vehicleType:'PICKUP'};
 await page.addInitScript(user=>{localStorage.setItem('khodrochare_driver_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:'2099-01-01T00:00:00Z',user}));localStorage.setItem('khodrochare_readiness_v2','1');localStorage.setItem('khodrochare_location_choice_v2','dismissed');Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:()=>{},watchPosition:()=>1,clearWatch:()=>{}}});},user);
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());
 await page.route(api+'/**',r=>{const p=new URL(r.request().url()).pathname;return r.fulfill({json:p.endsWith('/me')?user:p.endsWith('/requests')||p.endsWith('/available')?[]:{balanceToman:0,entries:[],totalToman:0}});});
}
async function open(page:Page){await page.goto(url+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.locator('.home-content')).toBeVisible();}

test('unfinished entry points show the modal without navigation or market calls and announced loads has the new label',async({page})=>{
 await page.setViewportSize({width:390,height:844});await setup(page);let marketCalls=0;await page.route(api+'/market/**',r=>{marketCalls++;return r.fulfill({json:{items:[]}});});await open(page);
 const dialog=page.getByRole('dialog',{name:'ماژول در حال تکمیل است'});
 await page.getByRole('button',{name:'همهٔ قطعات',exact:false}).click();await expect(dialog).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
 await page.locator('.parts-row button').first().click();await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'متوجه شدم'}).click();
 for(const name of ['خرید لوازم یدکی','خدمات فنی و بیمه','آموزش امداد','آخرین سرویس‌های من','دعوت از همکاران','پشتیبانی ناوگان','اعلان‌ها','اعلام بار']){
  await page.getByRole('button',{name:'باز کردن منو'}).click();await page.locator('.app-drawer').getByRole('button',{name,exact:true}).click();await expect(dialog).toBeVisible();await expect(page.locator('.home-content')).toBeVisible();await dialog.getByRole('button',{name:'متوجه شدم'}).click();
 }
 await page.getByRole('navigation',{name:'ناوبری اصلی'}).getByRole('button',{name:'اعلام بار',exact:true}).click();await expect(dialog).toBeVisible();await page.keyboard.press('Escape');
 await expect(page.getByText('تالار ایرانشهر',{exact:true})).toHaveCount(0);expect(marketCalls).toBe(0);
 await page.getByRole('navigation',{name:'ناوبری اصلی'}).getByRole('button',{name:'پروفایل',exact:true}).click();await expect(page.getByRole('heading',{name:'پروفایل',exact:true})).toBeVisible();await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'باز کردن منو'}).click();await page.locator('.app-drawer').getByRole('button',{name:'مدارک و احراز هویت',exact:true}).click();await expect(page.getByRole('heading',{name:'مدارک و احراز هویت',exact:true})).toBeVisible();
 const documents=page.locator('.document-row');let fileChoosers=0;page.on('filechooser',()=>{fileChoosers++;});await documents.nth(1).locator('.document-upload').click();await expect(dialog).toBeVisible();expect(fileChoosers).toBe(0);await page.keyboard.press('Escape');
});

test('expired cached offers stay hidden; a pending card expires while the page is open and accepted work survives',async({page})=>{
 const now=Date.parse('2026-11-21T08:00:00Z');await page.clock.install({time:new Date(now)});await setup(page);
 const offer=(id:string,age:number)=>({id,service:'REPAIR',vehicleName:id,originLat:35.7,originLng:51.4,priceToman:800000,createdAt:new Date(now-age).toISOString(),status:'PENDING',driverId:null});
 await page.route(api+'/drivers/requests/available',r=>r.fulfill({json:[offer('expired-vehicle',lifetime+1000),offer('expiring-vehicle',lifetime-60000)]}));
 await page.route(api+'/requests',r=>r.fulfill({json:[{...offer('accepted-vehicle',lifetime*2),status:'ACCEPTED',driverId:'owner'}, {...offer('expired-history',lifetime*2),status:'EXPIRED',driverId:'owner'}]}));
 await open(page);await expect(page.locator('.load-request-meta')).toContainText('expiring-vehicle');await expect(page.locator('.load-request-meta')).not.toContainText('expired-vehicle');
 await page.clock.runFor(65000);await expect(page.locator('.lh-accept')).toHaveCount(0);await expect(page.locator('.lh-top-empty')).toContainText('بار آزادی');
 await page.getByRole('button',{name:'باز کردن منو'}).click();await page.locator('.app-drawer').getByRole('button',{name:'بارهای من',exact:true}).click();await page.getByRole('tab',{name:/در حال انجام/}).click();await expect(page.locator('.loads-list')).toContainText('accepted-vehicle');await expect(page.locator('.loads-list')).not.toContainText('expired-history');
});

test('customer history labels expired requests without presenting them as active or losing the record',async({page})=>{
 const user={id:'customer',role:'CUSTOMER',fullName:'مشتری تست',phone:'09121234567',services:[],vehicles:[]};
 await page.addInitScript(user=>{localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:'2099-01-01T00:00:00Z',user}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');},user);
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());
 const request={id:'expired',customerId:user.id,driverId:null,status:'EXPIRED',service:'REPAIR',priceToman:800000,vehicleName:'خودروی درخواست منقضی',vehiclePlate:'12 ب 345',originLat:35.7,originLng:51.4,createdAt:new Date(Date.now()-lifetime).toISOString()};
 let trackingCalls=0;await page.route(api+'/**',r=>{const p=new URL(r.request().url()).pathname;if(p.endsWith('/tracking'))trackingCalls++;return r.fulfill({json:p.endsWith('/me')?user:p.endsWith('/requests')?[request]:p.endsWith('/requests/expired')?request:{balanceToman:0,entries:[]}});});
 await page.goto('http://localhost:3334/home');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.locator('.bento-main')).toContainText('مهلت پذیرش درخواست تمام شد');await expect(page.getByRole('progressbar',{name:'پیشرفت آخرین خدمت'})).toHaveAttribute('aria-valuenow','0');await page.locator('.bento-main').click();await expect(page.locator('.history-list')).toContainText('خودروی درخواست منقضی');await expect(page.locator('.history-list')).toContainText('منقضی‌شده');await page.getByRole('button',{name:'گزینه‌ها',exact:true}).click();await expect(page.getByRole('heading',{name:'درخواست منقضی شد',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'انصراف از درخواست',exact:true})).toHaveCount(0);await expect(page.locator('.waiting-cancel')).toHaveText('بازگشت به خانه');await expect(page.locator('.pay-button')).toBeDisabled();expect(trackingCalls).toBe(0);
});
