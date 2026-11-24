import {test,expect} from '@playwright/test';
for(const driver of [false,true])test(`${driver?'driver':'customer'} can edit identity and verify a new phone from profile`,async({page})=>{
 const user={id:'owner',role:driver?'DRIVER':'CUSTOMER',fullName:'کاربر نمونه',phone:'09121234567',nationalId:'1234567891',profileComplete:true,hasPassword:true,services:['REPAIR'],vehicles:[],activityCity:'تهران',activityDistrict:'منطقه ۲',vehicleType:'نیسان',vehiclePlate:'12 ب 345 - 67'};
 const saved:any[]=[];
 await page.addInitScript(({user,driver})=>{localStorage.setItem(`khodrochare_${driver?'driver':'customer'}_session_v2`,JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_readiness_v2','1');localStorage.setItem('khodrochare_location_choice_v2','dismissed');},{user,driver});
 await page.route('**/socket.io/**',r=>r.abort());
 await page.route('**/api/v1/**',async r=>{const p=new URL(r.request().url()).pathname,method=r.request().method();
  if(p.endsWith('/me/phone/otp')){expect(r.request().postDataJSON()).toEqual({phone:'09120000003',currentPassword:'currentPassword123'});return r.fulfill({json:{challengeId:'00000000-0000-4000-8000-000000000003',expiresInSeconds:300,retryAfterSeconds:60}});}
  if(p.endsWith('/me/phone')){expect(r.request().postDataJSON()).toMatchObject({code:'864209'});user.phone='09120000003';return r.fulfill({json:user});}
  if(p.endsWith('/me')){if(method==='PATCH'){const body=r.request().postDataJSON();saved.push(body);Object.assign(user,body);}return r.fulfill({json:user});}
  if(p.endsWith('/requests')||p.endsWith('/available'))return r.fulfill({json:[]});
  return r.fulfill({json:{balanceToman:0,entries:[],totalToman:0,driver:null}});
 });
 await page.goto(`http://localhost:${driver?3365:3364}/home${driver?'':'?view=profile'}`);await page.locator('.launch-splash').waitFor({state:'detached'});
 if(driver)await page.getByRole('button',{name:'پروفایل',exact:true}).click();
 await page.getByLabel('نام و نام خانوادگی',{exact:true}).fill('کاربر ویرایش‌شده');await page.getByLabel('کد ملی',{exact:true}).fill('1234567891');
 if(driver){await page.getByLabel('شهر محل فعالیت',{exact:true}).fill('مشهد');await page.getByLabel('بخش / منطقه محل فعالیت',{exact:true}).fill('بخش مرکزی');}
 await page.getByRole('button',{name:driver?'ذخیرهٔ تغییرات':'ذخیره اطلاعات',exact:true}).click();await expect.poll(()=>saved.length).toBe(1);
 expect(saved[0]).toMatchObject({fullName:'کاربر ویرایش‌شده',nationalId:'1234567891',...(driver?{activityCity:'مشهد',activityDistrict:'بخش مرکزی'}:{})});expect(saved[0].phone).toBeUndefined();
 await page.getByLabel('شماره همراه جدید',{exact:true}).fill('۰۹۱۲۰۰۰۰۰۰۳');await page.getByLabel('رمز عبور فعلی',{exact:true}).fill('currentPassword123');await page.getByRole('button',{name:'دریافت کد شماره جدید',exact:true}).click();
 await page.getByLabel('کد تأیید شماره جدید',{exact:true}).fill('۸۶۴۲۰۹');await page.getByRole('button',{name:'تأیید و تغییر شماره همراه',exact:true}).click();await expect(page.getByText('شماره همراه با موفقیت تغییر کرد. نشست‌های دیگر بسته شدند.',{exact:true})).toBeVisible();
 const session=await page.evaluate(driver=>JSON.parse(localStorage.getItem(`khodrochare_${driver?'driver':'customer'}_session_v2`)! ),driver);expect(session.user.phone).toBe('09120000003');
 await page.reload();await page.locator('.launch-splash').waitFor({state:'detached'});if(driver)await page.getByRole('button',{name:'پروفایل',exact:true}).click();await expect(page.getByLabel('نام و نام خانوادگی',{exact:true})).toHaveValue('کاربر ویرایش‌شده');
 if(driver){await expect(page.getByLabel('شهر محل فعالیت',{exact:true})).toHaveValue('مشهد');await expect(page.getByLabel('بخش / منطقه محل فعالیت',{exact:true})).toHaveValue('بخش مرکزی');}
 await page.screenshot({path:`profile-test-results/${driver?'driver':'customer'}-profile.png`,fullPage:true});
});
test('registration asks for activity area and panel displays it in rescuer accounts',async({page})=>{
 await page.route('**/api/v1/me',r=>r.fulfill({status:401,json:{error:'Authentication required'}}));
 await page.goto('http://localhost:3365/register');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.getByLabel('شهر محل فعالیت',{exact:true})).toBeVisible();await expect(page.getByLabel('بخش / منطقه محل فعالیت',{exact:false})).toBeVisible();
 const admin={id:'1',role:'operator',firstName:'اپراتور',lastName:'نمونه',fullName:'اپراتور نمونه'};
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','fixture');localStorage.setItem('kcrm.user',JSON.stringify(user));},admin);
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;if(p==='/api/auth/me')return r.fulfill({json:{user:admin}});return r.fulfill({json:{items:p==='/api/super-app/users'?[{id:'d',role:'DRIVER',fullName:'امدادگر نمونه',phone:'09121234567',activityCity:'مشهد',activityDistrict:'بخش مرکزی',isActive:true,createdAt:new Date().toISOString()}]:[],pagination:{page:1,limit:20,total:1,totalPages:1}}});});
 await page.goto('http://localhost:3366/rescuers');const accounts=page.getByRole('region',{name:'حساب‌های امدادگران اپلیکیشن',exact:true});await expect(accounts).toContainText('مشهد');await expect(accounts).toContainText('بخش مرکزی');
});
