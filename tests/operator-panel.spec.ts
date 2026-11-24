import {test,expect} from '@playwright/test';
const base='http://localhost:3350';
for(const variant of [{role:'admin',width:1440,height:1000},{role:'operator',width:390,height:844}])test(`operator module ${variant.role} ${variant.width}`,async({page})=>{
 await page.setViewportSize(variant);
 const user={id:'1',role:variant.role,firstName:'مدیر',lastName:'آزمایشی',fullName:'مدیر آزمایشی',username:'test'};
 const customer={id:'00000000-0000-4000-8000-000000000001',fullName:'مشتری نمونه',phone:'09120000001',role:'CUSTOMER',isActive:true,services:[],vehicles:[]};
 const driver={...customer,id:'00000000-0000-4000-8000-000000000002',fullName:'امدادگر نمونه',role:'DRIVER',services:['REPAIR']};
 const request={id:'00000000-0000-4000-8000-000000000003',customer,service:'REPAIR',vehicleName:'پژو ۲۰۷',vehiclePlate:'نمونه',status:'PENDING',createdAt:new Date().toISOString(),originAddress:'تهران',originLat:35.7,originLng:51.4,priceToman:800000,driver:null as typeof driver|null,driverId:undefined as string|undefined,operatorConfirmedAt:undefined as string|undefined};
 const receipt={id:'00000000-0000-4000-8000-000000000005',version:0,user:customer,amountToman:300000,bankReference:'123456789',status:'SUBMITTED',createdAt:new Date().toISOString(),image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII='};
 const listing={moderationNote:'',id:'00000000-0000-4000-8000-000000000004',make:'پژو',model:'۲۰۷',trim:'',year:1403,mileage:20000,version:0,contactPhone:customer.phone,status:'PENDING_REVIEW',owner:customer,photos:[],priceToman:800000000};
 await page.addInitScript(({user})=>{localStorage.setItem('kcrm.token','browser-fixture');localStorage.setItem('kcrm.user',JSON.stringify(user));},{user});
 const calls:{p:string;body:Record<string,unknown>|null;method:string}[]=[];
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),p=url.pathname,body=route.request().postDataJSON();calls.push({p,body,method:route.request().method()});
  const send=(data:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(p==='/api/auth/me')return send({user});
  if(p.endsWith('/locations'))return send({requestId:request.id,customerName:customer.fullName,driverName:request.driver?.fullName||null,generatedAt:new Date().toISOString(),maxAgeSeconds:120,current:{origin:{latitude:request.originLat,longitude:request.originLng,recordedAt:request.createdAt,source:'REQUEST_ORIGIN'},customer:null,driver:null},snapshots:[]});
  if(p.endsWith('/confirm')){request.operatorConfirmedAt=new Date().toISOString();return send({request,guidance:'لطفاً با امدادخواه تماس بگیرید و بار را به یکی از بچه‌های امدادی بسپرید و پرداخت را به شکل آنلاین از طریق اپلیکیشن یا در محل پیگیری کنید.'});}
  if(p.endsWith('/assign')){request.driver=driver;request.driverId=driver.id;request.status='ACCEPTED';return send(request);}
  if(p.endsWith('/active')){customer.isActive=body.isActive;return send(customer);}
  if(p.endsWith('/password'))return send({changed:true});
  if(p===`/api/super-app/receipts/${receipt.id}/review`){receipt.status=body.decision==='APPROVE'?'APPROVED':'REJECTED';return send({reviewed:true});}
  if(p===`/api/super-app/receipts/${receipt.id}`)return send(receipt);
  if(p.endsWith('/review')){listing.status=body.decision==='APPROVE'?'PUBLISHED':'REJECTED';listing.moderationNote=body.note;return send(listing);}
  if(p==='/api/super-app/requests/'+request.id)return send(request);
  if(p==='/api/super-app/users/'+customer.id)return send({user:customer,requests:[request],listingCount:1,driverEarningsToman:0,wallet:[],tickets:[],activity:[]});
  const items=p.endsWith('/requests')?[request]:p.endsWith('/users')?(url.searchParams.get('role')==='DRIVER'?[driver]:[customer]):p.endsWith('/listings')?[listing]:p.endsWith('/receipts')?[receipt]:[];
  return send({items,pagination:{page:1,limit:20,total:items.length,totalPages:1}});
 });
 await page.goto(base+'/super-app');await expect(page.getByRole('heading',{name:'سوپر اپلیکیشن خودرو چاره',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'جزئیات و پیگیری',exact:true}).click();
 await page.getByRole('button',{name:'تأیید و نمایش راهنمای پیگیری'}).click();
 const dialog=page.getByRole('dialog');await expect(dialog.getByText(/لطفاً با امدادخواه تماس بگیرید/)).toBeVisible();
 await expect(dialog.getByText('هنوز تخصیص نیافته',{exact:true})).toBeVisible();
 await dialog.getByLabel('امدادگر فعال و ارائه‌دهندهٔ این خدمت').selectOption(driver.id);
 await dialog.getByRole('button',{name:'ثبت تخصیص و اطلاع‌رسانی به اپلیکیشن'}).click();await expect(dialog.getByText('امدادگر نمونه',{exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'بستن',exact:true}).click();await page.getByRole('tab',{name:'مشتریان اپلیکیشن'}).click();await page.getByRole('button',{name:'مدیریت حساب و فعالیت'}).click();
 await expect(dialog.getByRole('button',{name:/حذف حساب/})).toHaveCount(0);
 await dialog.getByLabel('علت تغییر وضعیت').fill('درخواست پشتیبانی');await dialog.getByRole('button',{name:'غیرفعال کردن حساب',exact:true}).click();await expect(dialog.getByRole('button',{name:'فعال کردن حساب',exact:true})).toBeVisible();
 await dialog.getByLabel('رمز جدید').fill('temporary-test-password');await dialog.getByRole('button',{name:'ثبت رمز جدید و خروج نشست‌های قبلی'}).click();await expect(dialog.getByLabel('رمز جدید')).toHaveValue('');
 await dialog.getByRole('button',{name:'بستن',exact:true}).click();await page.getByRole('tab',{name:'بررسی آگهی‌های تالار'}).click();await page.getByRole('button',{name:'بازبینی آگهی',exact:true}).click();
 const reject=dialog.getByRole('button',{name:'رد آگهی و ثبت توضیح'});await expect(reject).toBeDisabled();await dialog.getByLabel('توضیح برای صاحب آگهی (برای رد الزامی)').fill('عکس واضح‌تر قرار دهید');await reject.click();await expect(dialog.getByText('ردشده',{exact:true})).toBeVisible();
 await page.screenshot({path:`performance-results/operator-${variant.role}.png`,fullPage:true});
 await dialog.getByRole('button',{name:'بستن',exact:true}).click();await page.getByRole('tab',{name:'رسیدهای واریز و کیف پول'}).click();await page.getByRole('button',{name:'مشاهده و بررسی رسید'}).click();await expect(dialog.getByRole('img',{name:'تصویر رسید واریز کاربر'})).toBeVisible();await dialog.getByRole('button',{name:'واریز بانکی تأیید شد؛ شارژ حساب'}).click();await expect(dialog).toHaveCount(0);expect(calls.find(c=>c.p.endsWith('/receipts/'+receipt.id+'/review'))?.body).toEqual({decision:'APPROVE',note:'',version:0});
 expect(calls.some(c=>c.method==='DELETE')).toBe(false);
});
