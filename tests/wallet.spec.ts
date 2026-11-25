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
 await section.getByLabel('تصویر فیش واریزی',{exact:true}).setInputFiles({name:'receipt.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+WQAAAAASUVORK5CYII=','base64')});
 await section.getByRole('button',{name:'ثبت فیش برای افزایش موجودی',exact:true}).click();await expect(section).toContainText('مبلغ در انتظار تعیین پشتیبانی');expect(posted).toBe(true);
});
