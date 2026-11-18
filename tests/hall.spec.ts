import {test,expect,type Page} from '@playwright/test';
const base='https://api.khodrochare.ir/api/v1';
const listing=(i:number)=>({id:`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,status:'PUBLISHED',version:0,make:'پژو',model:`۲۰۷ مدل ${i}`,trim:'پانوراما',year:1403,mileage:25000,city:'تهران',color:'سفید',bodyCondition:'سالم',technicalCondition:'سالم',description:'خودروی آزمایشی برای تست رابط تالار، نه آگهی تولید.',priceToman:3500000000,inspectionStatus:'NOT_INSPECTED',photos:[],services:[],viewCount:0,featuredUntil:new Date(Date.now()+86400000).toISOString()});
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
  if(path==='/hall/catalog')return send({plans:[{code:'FREE',name:'آگهی رایگان',kind:'PLAN',description:'انتشار آگهی بدون هزینه',priceToman:0,services:['انتشار مستقیم'],terms:'صحت اطلاعات با مالک است.',active:true,durationHours:168}],banners:[],paymentMode:'sandbox',tariffNotice:'تعرفه آزمایشی'});
  if(path==='/hall/vehicles')return send({items:[{maker:'پژو',model:'۲۰۷',trim:'پانوراما'}]});
  if(path==='/hall/listings')return send({items:Array.from({length:8},(_,i)=>listing(i+1)),featured:Array.from({length:12},(_,i)=>listing(100+i)),total:8,page:1,limit:12});
  if(path==='/hall/mine'&&method==='POST')return send(draft,201);
  if(path==='/hall/mine')return send({items:[draft],total:1,page:1,limit:12});
  if(path.endsWith('/photos')&&method==='POST'){draft.photos=[{id:'photo',url:'/hall/photos/photo'}];return send(draft.photos[0],201);}
  if(path.startsWith('/hall/photos/'))return r.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')});
  if(path.startsWith('/hall/mine/')&&method==='PATCH'){draft={...draft,version:draft.version+1,details:body.details};return send(draft);}
  if(path.endsWith('/publish')){draft.status='PUBLISHED';return send(draft);}
  if(path.startsWith('/hall/mine/'))return send(draft);
  if(path==='/hall/estimate')return send({sampleCount:0,isEstimate:true,min:null,max:null,average:null,median:null,suggested:null,notice:'داده کافی نداریم.',source:'آگهی‌های واقعی تالار',criteria:'مشخصات یکسان',checkedAt:new Date().toISOString()});
  return send({items:[],total:0});
 });return calls;
}
test('Hall inserts distinct horizontally scrolling promotions after each four cards and stays within mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});
 await expect(page.locator('.ch-feed-group')).toHaveCount(2);for(const group of await page.locator('.ch-feed-group').all())await expect(group.locator('.ch-card')).toHaveCount(4);
 await expect(page.locator('.ch-story-row')).toHaveCount(2);const labels=await page.locator('.ch-story>strong').allTextContents();expect(new Set(labels).size).toBe(labels.length);
 expect(await page.locator('.ch-hall').evaluate(el=>el.getBoundingClientRect().right)).toBeLessThanOrEqual(391);
});
test('Hall four-step free publication keeps an independent contact and never requests payment',async({page})=>{
 const calls=await setup(page);await page.goto('http://localhost:3310/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.locator('.ch-heading').getByRole('button',{name:/ثبت آگهی/}).click();
 await page.getByLabel('برند',{exact:true}).fill('پژو');await page.getByLabel('رنگ',{exact:true}).fill('سفید');await page.getByLabel('توضیحات خودرو',{exact:true}).fill('خودرو سالم و سرویس شده با شرایط مناسب برای بازدید');await page.getByLabel('شماره تماس آگهی').fill('09901234567');await page.getByLabel('شهر',{exact:true}).fill('تهران');await page.getByLabel('مدل',{exact:true}).fill('۲۰۷');await page.getByLabel('سال تولید',{exact:true}).fill('۱۴۰۳');await page.getByLabel('کارکرد (کیلومتر)',{exact:true}).fill('۲۵۰۰۰');await page.getByLabel('رنگ',{exact:true}).fill('سفید');await page.getByLabel('شهر',{exact:true}).fill('تهران');await page.getByLabel('شماره تماس آگهی',{exact:false}).fill('09901234567');await page.getByLabel('توضیحات خودرو',{exact:true}).fill('خودروی سالم با نگهداری منظم برای بررسی کامل جریان ثبت آگهی.');
 await page.locator('input[type=file]').setInputFiles({name:'car.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jgS8AAAAASUVORK5CYII=','base64')});
 await expect(page.locator('.ch-upload-photo')).toHaveCount(1);await page.getByRole('button',{name:'ادامه و تحلیل قیمت'}).click();await expect(page.getByText('هنوز نمونه کافی نداریم.')).toBeVisible();await page.getByLabel('قیمت انتخابی شما (تومان)').fill('۳۵۰۰۰۰۰۰۰۰');await page.getByRole('button',{name:'انتخاب طرح فروش',exact:true}).click();await page.getByRole('button',{name:'پیش‌نمایش آگهی'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'انتشار رایگان آگهی',exact:true}).click();await expect(page.getByText('آگهی شما به تالار رسید.')).toBeVisible();
 expect(calls.some(c=>c.path.endsWith('/checkout'))).toBe(false);expect(calls.some(c=>c.method==='PATCH'&&JSON.stringify(c.body).includes('09901234567'))).toBe(true);
});
