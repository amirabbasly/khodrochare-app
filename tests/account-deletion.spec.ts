import {test,expect} from '@playwright/test';
for(const actorRole of ['admin','operator'])for(const targetRole of ['CUSTOMER','DRIVER'])test(`${actorRole} manages ${targetRole}: suspension allowed, permanent deletion admin-only`,async({page})=>{
 const actor={id:1,role:actorRole,first_name:'مدیر',last_name:'تست',username:'staff'},target={id:'00000000-0000-4000-8000-000000000001',role:targetRole,fullName:'حساب نمونه',phone:'09120000001',nationalId:'1234567891',isActive:true,services:['REPAIR'],vehicles:[],createdAt:new Date().toISOString(),verificationStatus:'PENDING',verificationVersion:0};let removed=false,deletes=0,suspensions=0;
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','fixture');localStorage.setItem('kcrm.user',JSON.stringify(user));},actor);
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;const list=(items:unknown[])=>r.fulfill({json:{items,pagination:{page:1,limit:20,total:items.length,totalPages:1},summary:{total:0,active:0,garages:0}}});
  if(p.endsWith('/auth/me'))return r.fulfill({json:{user:actor}});
  if(p.endsWith('/super-app/users'))return list(removed?[]:[target]);
  if(p.endsWith('/users/'+target.id))return r.fulfill({json:{user:target,requests:[],wallet:[],tickets:[],activity:[],listingCount:0,balanceToman:0,driverEarningsToman:0}});
  if(p.endsWith('/driver-verifications/'+target.id))return r.fulfill({json:{user:target,documents:[]}});
  if(p.endsWith('/active')){suspensions++;target.isActive=r.request().postDataJSON().isActive;return r.fulfill({json:target});}
  if(p.endsWith('/users/'+target.id+'/delete')){expect(actorRole).toBe('admin');expect(r.request().postDataJSON()).toEqual({confirmation:'DELETE',phone:target.phone,reason:'درخواست حذف حساب'});deletes++;removed=true;return r.fulfill({json:{deleted:true}});}
  return list([]);
 });
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:3386'+(targetRole==='DRIVER'?'/rescuers':'/super-app'));if(targetRole==='CUSTOMER')await page.getByRole('tab',{name:'مشتریان اپلیکیشن',exact:true}).click();
 await page.getByRole('button',{name:'مدیریت حساب و فعالیت',exact:true}).click();const modal=page.getByRole('dialog');await modal.getByLabel('علت تغییر وضعیت',{exact:true}).fill('تعلیق موقت حساب');await modal.getByRole('button',{name:'غیرفعال کردن حساب',exact:true}).click();await expect.poll(()=>suspensions).toBe(1);await expect(modal.getByRole('button',{name:'فعال کردن حساب',exact:true})).toBeVisible();
 if(actorRole==='operator'){await expect(modal.getByText('حذف دائمی حساب — فقط مدیر',{exact:true})).toHaveCount(0);expect(deletes).toBe(0);return;}
 await modal.getByText('حذف دائمی حساب — فقط مدیر',{exact:true}).click();const button=modal.getByRole('button',{name:'حذف دائمی حساب',exact:true});await expect(button).toBeDisabled();await modal.getByLabel('شماره همراه حساب برای تأیید حذف',{exact:true}).fill(target.phone);await modal.getByLabel('علت حذف حساب',{exact:true}).fill('درخواست حذف حساب');await expect(button).toBeEnabled();await button.click();await expect.poll(()=>deletes).toBe(1);await expect(modal).toHaveCount(0);await expect(page.getByText(target.fullName,{exact:true})).toHaveCount(0);
});
