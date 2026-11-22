import {test,expect,type Page} from '@playwright/test';
const base='https://api.khodrochare.ir/api/v1';
const user={id:'otp-owner',role:'CUSTOMER',phone:'09121234567',fullName:'کاربر خودرو چاره',nationalId:null,profileComplete:false,hasPassword:false,services:[],vehicles:[]};
async function setup(page:Page,authenticated=false){
 await page.addInitScript(({user,authenticated})=>{localStorage.setItem('khodrochare_location_choice_v2','dismissed');if(authenticated)localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));},{user,authenticated});
 await page.route('**/socket.io/**',r=>r.abort());
 await page.route(base+'/**',r=>{const path=new URL(r.request().url()).pathname;if(path==='/api/v1/me')return r.fulfill({status:authenticated?200:401,json:authenticated?user:{error:'Authentication required'}});if(path.endsWith('/otp/request'))return r.fulfill({json:{challengeId:'test-challenge',expiresInSeconds:300,retryAfterSeconds:60}});if(path.endsWith('/wallet'))return r.fulfill({json:{balanceToman:0,entries:[],mode:'sandbox'}});return r.fulfill({json:[]});});
}
async function phone(page:Page,path:string){await page.goto(path);await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByLabel('شماره تماس',{exact:true}).fill('۰۹۱۲۱۲۳۴۵۶۷');await page.getByRole('button',{name:'دریافت کد تأیید',exact:true}).click();await expect(page.getByLabel('کد تأیید',{exact:true})).toBeVisible();}
for(const width of [390,1440])test(`registration and deferred profile preserve return destination at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await setup(page);
 await page.route(base+'/auth/customers/otp/verify',r=>r.fulfill({json:{user,token:'b'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString()}}));
 await phone(page,'/register');await expect(page.locator('input[type=password]')).toHaveCount(0);await expect(page.getByRole('button',{name:/ارسال دوباره کد/})).toBeDisabled();await page.screenshot({path:`performance-results/customer-auth/otp-${width}.png`});
 await page.getByLabel('کد تأیید',{exact:true}).fill('۸۶۴۲۰۹');await page.getByRole('button',{name:'تأیید و ورود',exact:true}).click();await expect(page).toHaveURL(/\/home$/);
 await page.route(base+'/me',r=>r.fulfill({json:user}));await page.goto('/home?view=service&service=roadside');await expect(page).toHaveURL(/\/complete-profile\?next=/,{timeout:15000});await expect(page.getByLabel('نام و نام خانوادگی',{exact:true})).toBeVisible();
 let completed:unknown;await page.route(base+'/me/complete-profile',r=>{completed=r.request().postDataJSON();return r.fulfill({json:{...user,fullName:'کاربر آزمایشی',nationalId:'1234567891',hasPassword:true,profileComplete:true}});});
 await page.getByLabel('نام و نام خانوادگی',{exact:true}).fill('کاربر آزمایشی');await page.getByLabel('کد ملی',{exact:true}).fill('۱۲۳۴۵۶۷۸۹۱');await page.getByLabel('رمز عبور',{exact:true}).fill('new-password123');await page.getByRole('button',{name:'تکمیل مشخصات و ادامه',exact:true}).click();await expect(page).toHaveURL(/\/home\?view=service&service=roadside$/);await expect(page.getByText('ورودی تعمیر در محل برای همه خودروها ۸۰۰٬۰۰۰ تومان است.',{exact:false})).toBeVisible();expect(completed).toEqual({fullName:'کاربر آزمایشی',nationalId:'1234567891',password:'new-password123'});
});
test('password recovery handles invalid code and retries without losing form',async({page})=>{
 await setup(page);let attempts=0;await page.route(base+'/auth/customers/password/reset',r=>{attempts++;expect(r.request().postDataJSON()).toMatchObject({challengeId:'test-challenge',password:'new-password123'});return r.fulfill({status:attempts===1?400:200,json:attempts===1?{error:'کد تأیید نادرست است'}:{reset:true}});});
 await phone(page,'/forgot-password');await page.getByLabel('کد تأیید',{exact:true}).fill('864209');await page.getByLabel('رمز عبور جدید',{exact:true}).fill('new-password123');await page.getByLabel('تکرار رمز عبور جدید',{exact:true}).fill('new-password123');await page.getByRole('button',{name:'تغییر رمز عبور',exact:true}).click();await expect(page.locator('.form-error[role=alert]')).toContainText('کد تأیید نادرست است');await page.getByRole('button',{name:'تغییر رمز عبور',exact:true}).click();await expect(page.getByRole('status')).toContainText('با موفقیت');await page.getByRole('link',{name:'ورود با رمز عبور',exact:true}).click();await expect(page.locator('#login-heading')).toBeVisible();expect(attempts).toBe(2);
});
test('OTP login uses temporary session when remember is disabled',async({page})=>{
 await setup(page);await page.route(base+'/auth/customers/otp/verify',r=>{expect(r.request().postDataJSON()).toMatchObject({remember:false,code:'864209'});return r.fulfill({json:{user:{...user,profileComplete:true,hasPassword:true,nationalId:'1234567891'},token:'c'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString()}});});
 await phone(page,'/login-otp');await page.getByLabel('مرا به خاطر بسپار',{exact:true}).uncheck();await page.getByLabel('کد تأیید',{exact:true}).fill('864209');await page.getByRole('button',{name:'تأیید و ورود',exact:true}).click();await expect(page).toHaveURL(/\/home$/);expect(await page.evaluate(()=>localStorage.getItem('khodrochare_customer_session_v2'))).toBeNull();expect(await page.evaluate(()=>sessionStorage.getItem('khodrochare_customer_session_v2'))).not.toBeNull();
});

for(const width of [390,1440])test(`account deletion with OTP at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await setup(page,true);
 await page.addInitScript(()=>localStorage.setItem('khodrochare_hall_otp-owner_draft','private draft'));
 await page.route(base+'/me/account-deletion/otp',r=>{expect(r.request().postDataJSON()).toEqual({});return r.fulfill({json:{challengeId:'delete-challenge',expiresInSeconds:300,retryAfterSeconds:60}});});
 let deleted=false,attempts=0;
 await page.route(base+'/me',r=>{if(r.request().method()==='DELETE'){attempts++;expect(r.request().postDataJSON()).toEqual({challengeId:'delete-challenge',code:'864209',confirmation:'DELETE'});if(attempts===1)return r.fulfill({status:400,json:{error:'کد تأیید نادرست است'}});deleted=true;return r.fulfill({json:{deleted:true}});}return r.fulfill({status:deleted?401:200,json:deleted?{error:'Authentication required'}:user});});
 await page.goto('/home?view=profile');await page.locator('.launch-splash').waitFor({state:'detached'});
 await page.getByRole('button',{name:'حذف حساب کاربری',exact:true}).click();const dialog=page.getByRole('dialog',{name:'حذف حساب کاربری',exact:true});await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'دریافت کد حذف حساب',exact:true}).click();await expect(dialog.getByRole('button',{name:/ارسال مجدد کد/})).toBeDisabled();await expect(dialog.getByRole('button',{name:'حذف دائمی حساب',exact:true})).toBeDisabled();
 await dialog.getByLabel('کد تأیید حذف حساب',{exact:true}).fill('۸۶۴۲۰۹');await dialog.getByLabel('پیامدهای حذف دائمی حساب را می‌پذیرم.').check();await page.screenshot({path:`performance-results/customer-auth/delete-${width}.png`});
 await dialog.getByRole('button',{name:'حذف دائمی حساب',exact:true}).click();await expect(dialog.locator('[role=alert]')).toContainText('کد تأیید نادرست است');await dialog.getByRole('button',{name:'حذف دائمی حساب',exact:true}).click();await expect(page).toHaveURL('/');await expect(page.locator('#login-heading')).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('khodrochare_customer_session_v2'))).toBeNull();expect(await page.evaluate(()=>localStorage.getItem('khodrochare_hall_otp-owner_draft'))).toBeNull();
});
