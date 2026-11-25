import {test,expect} from '@playwright/test';
for(const service of ['maintenance','carwash'])test(`onsite checkbox list ${service}`,async({page})=>{
 const user={id:'owner',role:'CUSTOMER',fullName:'کاربر تست',phone:'09121234567',nationalId:'1234567891',profileComplete:true,services:[],vehicles:[]};
 await page.addInitScript(user=>{localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');},user);
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());
 await page.route('**/api/v1/**',r=>{
  const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/services/onsite'))return r.fulfill({json:{version:'test',checkedAt:'2026-11-25',city:'تهران',services:{PERIODIC_SERVICE:[{code:'ENGINE_OIL',name:'روغن موتور'},{code:'AIR_FILTER',name:'فیلتر هوا'}],MOBILE_CARWASH:[{code:'FULL',name:'کارواش کامل'},{code:'EXTERIOR',name:'روشویی'},{code:'TIRE_WAX',name:'واکس لاستیک'}]}}});
  if(p.endsWith('/estimate'))return r.fulfill({json:{priceToman:100000,pricingBreakdown:{originalPriceToman:150000,discountPercent:30,checkedAt:'2026-11-25',city:'تهران'}}});
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:0,entries:[]}});
  return r.fulfill({json:[]});
 });
 await page.setViewportSize({width:390,height:844});await page.goto(`http://localhost:3384/home?view=service&service=${service}`);await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('button',{name:'فهمیدم',exact:true}).click();
 const list=page.locator('.onsite-options');await expect(list.getByRole('radio')).toHaveCount(0);
 if(service==='maintenance'){await list.getByRole('checkbox',{name:'فیلتر هوا',exact:true}).check();await expect(list.getByRole('checkbox',{name:'روغن موتور',exact:true})).toBeChecked();}
 else{await list.getByRole('checkbox',{name:'روشویی',exact:true}).check();await list.getByRole('checkbox',{name:'واکس لاستیک',exact:true}).check();await expect(list.getByRole('checkbox',{name:'کارواش کامل',exact:true})).not.toBeChecked();}
 const rows=await list.locator('.onsite-option-row').all();expect(rows.length).toBeGreaterThan(1);expect((await rows[1].boundingBox())!.y).toBeGreaterThan((await rows[0].boundingBox())!.y);
});
for(const kind of ['cars','parts'])test(`import ${kind} requires captcha and posts the complete request`,async({page})=>{
 let submitted:any=null;
 await page.route('**/api/v1/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path.endsWith('/solve'))return r.fulfill({json:{proof:'00000000-0000-4000-8000-000000000001'}});
  if(path.includes('/imports/captcha/'))return r.fulfill({json:{id:'00000000-0000-4000-8000-000000000002',y:50,image:'data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#164e63"/></svg>').toString('base64')}});
  if(path.endsWith('/imports/requests')){submitted=r.request().postDataJSON();return r.fulfill({status:201,json:{id:submitted.id}});}
  return r.fulfill({json:[]});
 });
 await page.setViewportSize({width:390,height:844});await page.goto(`http://localhost:3384/imports/${kind}`);
 const root=page.locator('.import-services:visible'),partner=root.locator('details');await expect(partner).not.toHaveAttribute('open');await partner.locator('summary').click();await expect(partner).toContainText('اوژن تجارت کیان');await expect(partner).toContainText('۲۵ سال');
 const whatsapp=root.getByRole('link',{name:'گفتگو در واتساپ',exact:true});await expect(whatsapp).toHaveAttribute('href',/^https:\/\/wa.me\/989397979861\?text=/);await expect(whatsapp).not.toContainText('09397979861');
 await root.getByLabel('نام و نام خانوادگی',{exact:true}).fill('مشتری تست');await root.getByLabel('شماره همراه',{exact:true}).fill('09121234567');await root.getByLabel('شهر',{exact:true}).fill('تهران');await root.getByLabel(kind==='cars'?'برند و مدل خودرو':'نام قطعه و مدل خودرو',{exact:true}).fill(kind==='cars'?'BMW 530':'دیسک ترمز BMW');await root.getByLabel('توضیحات درخواست',{exact:true}).fill('لطفا شرایط و هزینه واردات را بررسی کنید.');
 if(kind==='parts')await root.getByLabel('کد قطعه (اختیاری)',{exact:true}).fill('ABC-123');
 await root.getByRole('button',{name:'ثبت درخواست',exact:true}).click();const captcha=page.getByRole('dialog',{name:'تکمیل پازل برای ثبت درخواست'});await expect(captcha).toBeVisible();expect(submitted).toBeNull();
 const piece=captcha.locator('.ch-puzzle-piece'),box=await piece.boundingBox(),board=await captcha.locator('.ch-puzzle').boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await page.mouse.move(board!.x+170,box!.y+box!.height/2,{steps:8});await page.mouse.up();
 await expect(root).toContainText('درخواست شما با موفقیت ثبت شد');expect(submitted).toMatchObject({kind:kind==='cars'?'CARS':'PARTS',phone:'09121234567',city:'تهران'});expect(submitted.proof).toBeTruthy();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('operator sees import requests with submitted contact and details',async({page})=>{
 const user={id:1,role:'admin',first_name:'مدیر',last_name:'تست',username:'admin'};
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','test-token');localStorage.setItem('kcrm.user',JSON.stringify(user));},user);
 await page.route('**/api/**',r=>{
  const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/auth/me'))return r.fulfill({json:{user}});
  if(p.endsWith('/imports'))return r.fulfill({json:{items:[{id:'import',kind:'PARTS',fullName:'مشتری تست',phone:'09121234567',city:'تهران',subject:'دیسک ترمز BMW',description:'بررسی هزینه واردات قطعه',partCode:'ABC-123',createdAt:new Date().toISOString()}],pagination:{page:1,limit:20,total:1,totalPages:1}}});
  return r.fulfill({json:{items:[],pagination:{page:1,limit:20,total:0,totalPages:1}}});
 });
 await page.goto('http://localhost:3386/super-app');await page.getByRole('tab',{name:'درخواست‌های واردات',exact:true}).click();await expect(page.getByRole('cell',{name:'دیسک ترمز BMW',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'09121234567',exact:true})).toHaveAttribute('href','tel:09121234567');
});
