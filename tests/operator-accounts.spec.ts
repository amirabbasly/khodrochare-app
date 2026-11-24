import {test,expect} from '@playwright/test';
for(const width of [390,1440])test(`customer accounts stay in super-app and driver accounts move to rescuers at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});
 const user={id:'1',role:'operator',firstName:'اپراتور',lastName:'آزمایشی',fullName:'اپراتور آزمایشی',username:'test'};
 const customer={id:'00000000-0000-4000-8000-000000000001',role:'CUSTOMER',fullName:'مشتری نمونه',phone:'09120000001',isActive:true,services:[],vehicles:[],createdAt:new Date().toISOString()};
 const driver={...customer,id:'00000000-0000-4000-8000-000000000002',role:'DRIVER',activityCity:'مشهد',activityDistrict:'بخش مرکزی',fullName:'امدادگر اپلیکیشن نمونه',phone:'09120000002',services:['REPAIR']};
 const calls:{role:string|null;q:string|null}[]=[];
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','fixture');localStorage.setItem('kcrm.user',JSON.stringify(user));},user);
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),p=url.pathname;const send=(data:unknown)=>route.fulfill({json:data});
  const list=(items:unknown[])=>send({items,pagination:{page:1,limit:20,total:items.length,totalPages:1},summary:{total:1,active:1,garages:0}});
  if(p==='/api/auth/me')return send({user});
  if(p==='/api/meta/zones')return send({items:[]});
  if(p==='/api/rescuers')return list([{id:9,fullName:'امدادگر ثبت‌شده پنل',phone:'09120000009',vehicle:'نیسان',plate:'نمونه',workType:'transport',workTypeLabel:'حملی',isActive:true,stats:{total:1,confirmed:1,cancelled:0}}]);
  if(p==='/api/super-app/users'){const role=url.searchParams.get('role');calls.push({role,q:url.searchParams.get('q')});return list(role==='CUSTOMER'?[customer]:role==='DRIVER'?[driver]:[customer,driver]);}
  if(p===`/api/super-app/users/${driver.id}`)return send({user:driver,requests:[],listingCount:0,balanceToman:700000,driverEarningsToman:700000,wallet:[],tickets:[],activity:[]});
  if(p.endsWith('/active')){expect(route.request().postDataJSON()).toMatchObject({isActive:false});driver.isActive=false;return send(driver);}
  if(p.endsWith('/password'))return send({changed:true});
  return list([]);
 });
 await page.goto('http://localhost:3350/super-app');await page.getByRole('tab',{name:'مشتریان اپلیکیشن',exact:true}).click();
 await expect(page.locator('tbody')).toContainText(customer.fullName);await expect(page.locator('tbody')).not.toContainText(driver.fullName);
 await expect(page.getByLabel('نوع حساب',{exact:true})).toHaveCount(0);
 await page.getByRole('searchbox').fill('مشتری');await expect.poll(()=>calls.at(-1)).toEqual({role:'CUSTOMER',q:'مشتری'});
 await page.goto('http://localhost:3350/rescuers');const accounts=page.getByRole('region',{name:'حساب‌های امدادگران اپلیکیشن',exact:true});await expect(accounts.locator('tbody')).toContainText(driver.fullName);await expect(accounts.locator('tbody')).not.toContainText(customer.fullName);await expect(page.getByRole('tab',{name:'امدادگران اپلیکیشن',exact:true})).toHaveCount(0);
 expect(calls.at(-1)?.role).toBe('DRIVER');await expect(accounts).toContainText('مشهد');await expect(accounts).toContainText('بخش مرکزی');
 await page.getByRole('button',{name:'مدیریت حساب و فعالیت',exact:true}).click();const dialog=page.getByRole('dialog');
 await expect(dialog.getByText('امدادگر اپلیکیشن نمونه',{exact:true})).toBeVisible();
 await dialog.getByLabel('علت تغییر وضعیت').fill('درخواست پشتیبانی');await dialog.getByRole('button',{name:'غیرفعال کردن حساب',exact:true}).click();await expect(dialog.getByRole('button',{name:'فعال کردن حساب',exact:true})).toBeVisible();
 await dialog.getByLabel('رمز جدید').fill('test-new-password123');await dialog.getByRole('button',{name:'ثبت رمز جدید و خروج نشست‌های قبلی'}).click();await expect(dialog.getByLabel('رمز جدید')).toHaveValue('');
 await dialog.getByRole('button',{name:'بستن',exact:true}).click();
 await page.screenshot({path:`performance-results/rescuer-app-accounts-${width}.png`,fullPage:true});
 await expect(page.getByText('امدادگر ثبت‌شده پنل',{exact:true})).toBeVisible();await expect(accounts.locator('tbody')).toContainText(driver.fullName);
});
