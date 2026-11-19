import {test,expect,type Page} from '@playwright/test';
const base='https://api.khodrochare.ir/api/v1';
const listing=(i:number)=>({id:`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,status:'PUBLISHED',version:0,contactPhone:'09901234567',make:'پژو',model:`۲۰۷ مدل ${i}`,trim:'پانوراما',year:1403,mileage:25000,city:'تهران',color:'سفید',bodyCondition:'سالم',technicalCondition:'سالم',description:'خودروی آزمایشی برای تست رابط تالار، نه آگهی تولید.',priceToman:3500000000,inspectionStatus:'NOT_INSPECTED',photos:Array.from({length:4},(_,n)=>({id:`image-${i}-${n}`,url:'/slides/hall-buy.webp'})),publishedAt:new Date(Date.now()-1200000).toISOString(),services:[],viewCount:0,featuredUntil:new Date(Date.now()+86400000).toISOString()});
async function setup(page:Page){
 await page.addInitScript(()=>{localStorage.setItem('khodrochare_location_choice_v2','dismissed');localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user:{id:'owner',role:'CUSTOMER',fullName:'مالک تست',phone:'09121234567',services:[],vehicles:[]}}));});
 await page.route('**/socket.io/**',r=>r.abort());
 const calls:{path:string;method:string;body:Record<string,unknown>|null}[]=[];let draft={...listing(30),status:'DRAFT',details:{},photos:[] as {id:string;url:string}[]};
 await page.route(base+'/**',async r=>{
  const req=r.request(),path=new URL(req.url()).pathname.replace('/api/v1',''),method=req.method();
  const body=req.headers()['content-type']?.includes('application/json')&&req.postData()?JSON.parse(req.postData()!):null;calls.push({path,method,body});
  const send=(data:unknown,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(method==='OPTIONS')return r.fulfill({status:204});
  if(path==='/me')return send({id:'owner',role:'CUSTOMER',fullName:'مالک تست',phone:'09121234567',services:[],vehicles:[]});
  if(path==='/requests')return send([]);
  if(path==='/wallet')return send({balanceToman:0,sandboxBalanceToman:0,entries:[],mode:'sandbox'});
  if(path==='/hall/catalog')return send({plans:[{code:'FREE',name:'آگهی رایگان',kind:'PLAN',description:'انتشار آگهی بدون هزینه',priceToman:0,services:['انتشار مستقیم'],terms:'صحت اطلاعات با مالک است.',active:true,durationHours:168},...['MANAGED','REPAIR_SELL','EXPRESS48'].map(code=>({code,name:code,kind:'PLAN',description:'طرح دیگر',priceToman:1500000,services:[],terms:'شرایط',active:true,durationHours:168})),{code:'FEATURED',name:'تبلیغ ویژه',kind:'BOOST',description:'نمایش بیشتر',priceToman:50000,services:[],terms:'اختیاری',active:true,durationHours:48}],banners:[],paymentMode:'sandbox',tariffNotice:'تعرفه آزمایشی'});
  if(path==='/hall/vehicles')return send({items:[{maker:'پژو',model:'۲۰۷',trim:'پانوراما'}]});
  if(path==='/hall/listings')return send({items:Array.from({length:8},(_,i)=>listing(i+1)),featured:Array.from({length:12},(_,i)=>listing(100+i)),total:8,page:1,limit:12});
  if(path==='/hall/mine'&&method==='POST')return send(draft,201);
  if(path==='/hall/mine')return send({items:[draft],total:1,page:1,limit:12});
  if(path.endsWith('/photos')&&method==='POST'){draft.photos=[{id:'photo',url:'/hall/photos/photo'}];return send(draft.photos[0],201);}
  if(path.startsWith('/hall/photos/'))return r.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')});
  if(path.endsWith('/captcha/solve'))return Number(body?.x)<100?send({error:'قطعه در جای درست قرار نگرفت'},400):send({proof:'proof-token'});
  if(path.endsWith('/captcha'))return send({id:'challenge',y:50,image:'data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect x="150" y="50" width="42" height="42"/></svg>').toString('base64')});
  if(path.startsWith('/hall/listings/'))return send(listing(1));
  if(path.startsWith('/hall/mine/')&&method==='DELETE')return r.fulfill({status:204});
  if(path.startsWith('/hall/mine/')&&method==='PATCH'){draft={...draft,version:draft.version+1,details:body.details};return send(draft);}
  if(path.endsWith('/publish')){draft.status='PUBLISHED';return send(draft);}
  if(path.startsWith('/hall/mine/'))return send(draft);
  if(path==='/hall/estimate')return send({sampleCount:0,isEstimate:true,min:null,max:null,average:null,median:null,suggested:null,notice:'داده کافی نداریم.',source:'آگهی‌های واقعی تالار',criteria:'مشخصات یکسان',checkedAt:new Date().toISOString()});
  return send({items:[],total:0});
 });return calls;
}
test('Hall inserts distinct horizontally scrolling promotions after each four cards and stays within mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});
 await expect(page.locator('.ch-feed-group')).toHaveCount(2);await page.getByRole('button',{name:'خرید خودرو',exact:true}).click();await expect(page.locator('.ch-card')).toHaveCount(8);for(const group of await page.locator('.ch-feed-group').all())await expect(group.locator('.ch-card')).toHaveCount(4);
 await expect(page.locator('.ch-story-row')).toHaveCount(2);const labels=await page.locator('.ch-story>strong').allTextContents();expect(new Set(labels).size).toBe(labels.length);
 expect(await page.locator('.ch-hall').evaluate(el=>el.getBoundingClientRect().right)).toBeLessThanOrEqual(391);
});
test('Hall four-step free publication keeps an independent contact and never requests payment',async({page})=>{
 const calls=await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.locator('.ch-heading').getByRole('button',{name:/ثبت آگهی/}).click();
 await page.getByLabel('برند',{exact:true}).fill('پژو');await page.getByLabel('مدل',{exact:true}).fill('۲۰۷');await page.getByLabel('سال تولید',{exact:true}).fill('۱۴۰۳');await page.getByLabel('کارکرد (کیلومتر)',{exact:true}).fill('۲۵۰۰۰');await page.getByLabel('رنگ',{exact:true}).fill('سفید');await page.getByLabel('شهر',{exact:true}).fill('تهران');await page.getByLabel('شماره تماس آگهی',{exact:false}).fill('09901234567');await page.getByRole('textbox',{name:'توضیحات خودرو',exact:true}).fill('خودروی سالم با نگهداری منظم برای بررسی کامل جریان ثبت آگهی.');
 await page.locator('input[type=file]').setInputFiles({name:'car.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')});
 await expect(page.locator('.ch-upload-photo')).toHaveCount(1);await page.getByRole('button',{name:'ادامه و تحلیل قیمت'}).click();await expect(page.getByText('هنوز نمونه کافی نداریم.')).toBeVisible();await page.getByLabel('قیمت انتخابی شما (تومان)').fill('۳۵۰۰۰۰۰۰۰۰');await page.getByRole('button',{name:'انتخاب طرح فروش',exact:true}).click();await expect(page.locator('.ch-plan.is-disabled')).toHaveCount(3);await expect(page.locator('.ch-plan.is-disabled input:disabled')).toHaveCount(3);expect((await page.locator('.ch-plan.is-disabled').allTextContents()).join(' ')).not.toContain('۱٬۵۰۰٬۰۰۰');await expect(page.getByRole('checkbox',{name:/تبلیغ ویژه/})).not.toBeChecked();await page.getByRole('button',{name:'پیش‌نمایش آگهی'}).click();await page.getByRole('checkbox',{name:'صحت اطلاعات و شرایط طرح انتخابی را تأیید می‌کنم.'}).check();await page.getByRole('button',{name:'انتشار رایگان آگهی',exact:true}).click();await expect(page.getByRole('dialog',{name:'تکمیل پازل برای انتشار'})).toBeVisible();expect(calls.some(c=>c.path.endsWith('/publish'))).toBe(false);await page.getByRole('button',{name:'تأیید جای قطعه'}).click();await expect(page.getByText('قطعه در جای درست قرار نگرفت',{exact:true})).toBeVisible();const piece=page.locator('.ch-puzzle-piece'),box=await piece.boundingBox(),board=await page.locator('.ch-puzzle').boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await page.mouse.move(board!.x+170,box!.y+box!.height/2,{steps:10});await page.mouse.up();await expect(page.getByText('آگهی شما به تالار رسید.')).toBeVisible();expect(calls.find(c=>c.path.endsWith('/publish'))?.body?.proof).toBe('proof-token');
 expect(calls.some(c=>c.path.endsWith('/checkout'))).toBe(false);expect(calls.some(c=>c.method==='PATCH'&&JSON.stringify(c.body).includes('09901234567'))).toBe(true);
});

test('filters open in a focus-trapped modal and direct contact replaces inquiry forms on a small phone',async({page})=>{
 await page.setViewportSize({width:375,height:812});await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});
 await page.getByRole('button',{name:'فیلترهای بیشتر'}).click();const dialog=page.getByRole('dialog',{name:'فیلتر خودروها'});await expect(dialog).toBeVisible();await dialog.getByLabel('شهر',{exact:true}).fill('تهران');await page.screenshot({path:test.info().outputPath('filters-mobile.png')});
 expect(await dialog.evaluate(el=>el.getBoundingClientRect().width)).toBeLessThanOrEqual(375);await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(page.getByRole('button',{name:'فیلترهای بیشتر'})).toBeFocused();
 await page.locator('.ch-card-photo').first().click();await expect(page.locator('a[href="tel:09901234567"]')).toBeVisible();await expect(page.getByRole('button',{name:'چت با فروشنده'})).toBeVisible();await expect(page.getByText('درخواست خرید و دریافت شماره')).toHaveCount(0);
 await page.setViewportSize({width:812,height:375});expect(await page.locator('.ch-hall').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});

test('owner deletion asks in a modal and rejects more than five selected images before uploading',async({page})=>{
 const calls=await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('button',{name:'آگهی‌ها و پیش‌نویس‌های من'}).click();await expect(page.locator('.ch-mine')).toHaveCount(1);await page.getByRole('button',{name:'حذف آگهی',exact:true}).click();const dialog=page.getByRole('dialog',{name:'حذف آگهی'});await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'حذف آگهی',exact:true}).click();await expect(dialog).not.toBeVisible();expect(calls.some(c=>c.method==='DELETE'&&c.path.startsWith('/hall/mine/'))).toBe(true);
 await page.locator('.ch-heading').getByRole('button',{name:/ثبت آگهی/}).click();await page.locator('input[type=file]').setInputFiles(Array.from({length:6},(_,i)=>({name:`car${i}.png`,mimeType:'image/png',buffer:Buffer.from('image')})));await expect(page.getByText('حداکثر ۵ عکس می‌توانید بارگذاری کنید.')).toBeVisible();expect(calls.some(c=>c.method==='POST'&&c.path.endsWith('/photos'))).toBe(false);
});

test('chat restores conversation history on mobile and keeps sending disabled while disconnected',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await setup(page);
 const conversation={id:'00000000-0000-4000-8000-000000000201',buyerId:'owner',sellerId:'seller',buyerReadAt:new Date(0).toISOString(),sellerReadAt:new Date(0).toISOString(),listing:{make:'پژو',model:'۲۰۷',status:'PUBLISHED'},seller:{fullName:'فروشنده نمونه'},unread:1};
 const message={id:'00000000-0000-4000-8000-000000000202',conversationId:conversation.id,senderId:'seller',clientId:'00000000-0000-4000-8000-000000000203',body:'سلام، خودرو برای بازدید موجود است.',createdAt:new Date().toISOString()};
 await page.route(base+'/hall/conversations**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().includes('/messages')?{items:[message],hasMore:false,conversation}:{items:[{...conversation,messages:[message]}],page:1})}));
 await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('button',{name:'گفتگوهای من'}).click();const dialog=page.getByRole('dialog',{name:'گفتگوهای تالار خودرو'});await dialog.getByRole('button',{name:/فروشنده نمونه/}).click();await expect(dialog.getByRole('log')).toContainText(message.body);await dialog.getByLabel('پیام شما').fill('سلام، چه ساعتی مناسب است؟');await expect(dialog.getByRole('button',{name:'ارسال',exact:true})).toBeDisabled();expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:test.info().outputPath('chat-mobile.png')});await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});

test('photo carousel and horizontal cards match the reference on desktop and small phones',async({page})=>{
 await setup(page);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1280,height:900});await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});
 const carousel=page.getByRole('region',{name:'پیشنهادهای تالار خودرو'});await expect(page.locator('.ch-hero')).toHaveCount(0);await expect(page.locator('.ch-carousel-image')).toHaveAttribute('src','/slides/hall-buy.webp');
 await page.getByRole('button',{name:'اسلاید بعد',exact:true}).click();await expect(page.locator('.ch-carousel-image')).toHaveAttribute('src','/slides/hall-inspection.webp');await expect(page.getByRole('button',{name:'نمایش اسلاید ۲'})).toHaveAttribute('aria-current','true');await page.getByRole('button',{name:'اسلاید قبل',exact:true}).click();await expect(page.locator('.ch-carousel-image')).toHaveAttribute('src','/slides/hall-buy.webp');
 const card=page.locator('.ch-card').first();await expect(card.locator('.ch-card-photo-count')).toHaveText('۴');await expect(card.locator('time')).toContainText('دقیقه پیش');await expect.poll(()=>page.locator('.ch-carousel-image').evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const image=await card.locator('.ch-card-photo').boundingBox(),body=await card.locator('.ch-card-body').boundingBox();expect(image!.x).toBeGreaterThan(body!.x);expect(Math.abs(image!.y-body!.y)).toBeLessThan(3);await page.screenshot({path:test.info().outputPath('hall-desktop.png'),fullPage:true});
 await page.setViewportSize({width:375,height:812});await card.scrollIntoViewIfNeeded();expect(await page.locator('.ch-hall').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);const mobileImage=await card.locator('.ch-card-photo').boundingBox(),mobileBody=await card.locator('.ch-card-body').boundingBox();expect(mobileImage!.x).toBeGreaterThan(mobileBody!.x);expect(Math.abs(mobileImage!.y-mobileBody!.y)).toBeLessThan(3);await page.screenshot({path:test.info().outputPath('hall-mobile.png')});
 await page.setViewportSize({width:812,height:375});expect(await page.locator('.ch-hall').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await expect(carousel).toBeAttached();
});

test('splash shows equal logo boxes with the wordmark on the right and the transparent symbol on the left',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await setup(page);await page.clock.install({time:new Date('2026-11-19T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-19T12:00:01Z'));await page.goto('http://localhost:3310/home?view=hall');
 const row=page.locator('.splash-brand-row');await expect(row).toBeVisible();const wordmark=await row.locator('.splash-brand-wordmark').boundingBox(),symbol=await row.locator('.splash-brand-symbol').boundingBox();expect(wordmark!.x).toBeGreaterThan(symbol!.x);expect(Math.abs(wordmark!.y-symbol!.y)).toBeLessThan(1);expect(Math.abs(wordmark!.width-symbol!.width)).toBeLessThan(1);expect(Math.abs(wordmark!.height-symbol!.height)).toBeLessThan(1);await expect(row.locator('.splash-brand-symbol')).toHaveAttribute('src',/symbol-transparent/);await expect.poll(()=>row.locator('.splash-brand-symbol').evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);await page.screenshot({path:test.info().outputPath('splash-mobile.png')});
 await page.clock.fastForward(4000);await expect(page.locator('.launch-splash')).toHaveCount(0);await expect(page.locator('.bottom-nav-rescue img')).toHaveAttribute('src',/symbol-transparent/);
});
