import {test,expect} from '@playwright/test';
for(const width of [390,1440])test(`request locations, live updates and immutable snapshot at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});
 const user={id:'1',role:'operator',firstName:'اپراتور',lastName:'آزمایش',fullName:'اپراتور آزمایش',username:'test'};
 const customer={id:'00000000-0000-4000-8000-000000000001',fullName:'مشتری نمونه',phone:'09120000001'};
 const request={id:'00000000-0000-4000-8000-000000000003',customer,vehicleName:'پژو ۲۰۷',createdAt:new Date().toISOString(),status:'ACCEPTED',service:'REPAIR'};
 const current={origin:{latitude:35.7,longitude:51.4,recordedAt:request.createdAt,source:'REQUEST_ORIGIN'},customer:{latitude:35.701234,longitude:51.401234,recordedAt:request.createdAt,source:'DEVICE_GPS'},driver:{latitude:35.711234,longitude:51.411234,recordedAt:new Date(Date.now()-180000).toISOString(),source:'DRIVER_GPS'}};
 const snapshots:any[]=[];let captures=0;
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','browser-test');localStorage.setItem('kcrm.user',JSON.stringify(user));},user);
 await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e2e8f0"/><path d="M0 128H256M128 0V256" stroke="white" stroke-width="12"/></svg>'}));
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),p=url.pathname;const send=(value:unknown,status=200)=>route.fulfill({status,json:value});
  if(p==='/api/auth/me')return send({user});
  if(p.endsWith('/locations')){
   if(route.request().method()==='POST'){expect(route.request().postDataJSON()).toEqual({});captures++;const snapshot={id:'saved',actorName:user.fullName,capturedAt:new Date().toISOString(),locations:JSON.parse(JSON.stringify(current))};snapshots.push(snapshot);current.customer.latitude=35.801234;return send(snapshot,201);}
   return send({requestId:request.id,customerName:customer.fullName,driverName:'امدادگر نمونه',generatedAt:new Date().toISOString(),maxAgeSeconds:120,current,snapshots});
  }
  return send({items:[request],pagination:{page:1,total:1,totalPages:1}});
 });
 await page.goto('http://127.0.0.1:3350/super-app');
 await page.getByRole('tab',{name:'نقشه درخواست‌ها',exact:true}).click();
 await page.getByLabel('درخواست برای نمایش روی نقشه').selectOption(request.id);
 await expect(page.getByRole('heading',{name:'موقعیت دقیق مشتری و امدادگر',exact:true})).toBeVisible();
 await expect(page.locator('.request-location-marker')).toHaveCount(3);
 await expect(page.getByText('آخرین موقعیت قدیمی؛ موقعیت فعلی تأیید نشده')).toBeVisible();
 await page.getByRole('button',{name:'بزرگ‌نمایی نقشه'}).click();await page.getByRole('button',{name:'نمایش همه',exact:true}).click();
 await page.getByRole('button',{name:'ثبت موقعیت فعلی طرفین',exact:true}).click();
 await expect(page.locator('.request-locations [role=status]')).toContainText('ثبت شدند');
 await expect(page.getByText('35.801234, 51.401234',{exact:true})).toBeVisible();
 await page.getByLabel('موقعیت زنده یا سابقه ثبت').selectOption('saved');
 await expect(page.getByText('35.701234, 51.401234',{exact:true})).toBeVisible();
 await expect(page.getByText(/این نما زنده نیست/)).toBeVisible();expect(captures).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:`location-test-results/map-${width}.png`,fullPage:true});
});
