import {test,expect,type Page} from '@playwright/test';
const api='https://api.khodrochare.ir/api/v1';
const pid='00000000-0000-4000-8000-000000000001';
const product={id:pid,name:'لنت ترمز جلو پژو ۲۰۶ تیپ ۵',brand:{id:'b1',name:'TRW'},category:{id:'c1',name:'سیستم ترمز',slug:'brakes'},condition:'NEW',authenticity:'AFTERMARKET',description:'اطلاعات آزمایشی',partNumber:'GDB1330',oemNumber:null,images:[],specifications:{محور:'جلو'},minPriceToman:950000,maxPriceToman:1100000,avgPriceToman:1025000,offerCount:2,dropPercent:0,dealScore:0,fitments:[{id:'f1',car:{id:'car1',maker:'پژو',model:'۲۰۶',trim:'تیپ ۵'},yearFrom:1380,yearTo:1399}]};
const pageData=(items:unknown[])=>({items,total:items.length,page:1,limit:100});
async function mock(page:Page,role:'CUSTOMER'|'DRIVER'){
  const calls:{path:string;body:unknown}[]=[];
  await page.addInitScript(role=>{localStorage.setItem('khodrochare_location_choice_v2','dismissed');localStorage.setItem(`khodrochare_${role.toLowerCase()}_session_v2`,JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user:{id:'u',role,fullName:'کاربر تست جمعه‌بازار',phone:'09121234567',nationalId:'1234567891',services:['REPAIR','TOWING'],vehiclePlate:'12 ب 345 - 67',vehicleType:'نیسان',vehicles:[]}}));},role);
  await page.route('**/socket.io/**',r=>r.abort());await page.route('https://tile.openstreetmap.org/**',r=>r.abort());
  await page.route(api+'/**',r=>{
    const request=r.request(),url=new URL(request.url()),path=url.pathname.replace('/api/v1','');calls.push({path,body:request.postData()?JSON.parse(request.postData()!):null});
    const send=(value:unknown,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
    if(request.method()==='OPTIONS')return r.fulfill({status:204});
    if(path==='/me')return send({id:'u',role,fullName:'کاربر تست جمعه‌بازار',phone:'09121234567',nationalId:'1234567891',services:['REPAIR','TOWING'],vehicles:[]});
    if(path==='/requests'||path==='/drivers/requests/available')return send([]);
    if(path==='/drivers/earnings')return send({entries:[],totalToman:0});
    if(path==='/market/categories')return send(pageData([{id:'c1',slug:'brakes',name:'سیستم ترمز'}]));
    if(path==='/market/brands')return send(pageData([{id:'b1',name:'TRW'}]));
    if(path==='/market/cars')return send(pageData([{id:'car1',maker:'پژو',model:'۲۰۶',trim:'تیپ ۵'}]));
    if(path==='/market/products'||path==='/market/deals')return send(pageData([product]));
    if(path.endsWith('/offers'))return send(pageData([{id:'o1',priceToman:950000,shippingToman:null,quantity:2,checkedAt:new Date().toISOString(),listing:{url:'https://seller-a.fixture-shop.ir/p1',seller:{name:'فروشگاه آزمایشی',verified:true,reputation:80},source:{name:'منبع آزمایشی'}}}]));
    if(path.endsWith('/history'))return send({daily:[{day:'2026-11-01',min:1000000,max:1100000,average:1050000},{day:'2026-11-02',min:950000,max:1100000,average:1025000}],statistics:{min:950000,max:1100000,average:1037500},items:[],archive:[]});
    if(path==='/market/alerts'&&request.method()==='POST')return send({id:'alert1'},201);
    if(path.startsWith('/market/products/'))return send(product);
    return send(pageData([]));
  });return calls;
}
for(const[role,port]of[['CUSTOMER',3310],['DRIVER',3311]] as const)test(`${role} real market UI uses fixture API for matching parts, offers, history and price alerts`,async({page},info)=>{
  await page.setViewportSize({width:390,height:844});const calls=await mock(page,role);
  await page.goto(`http://localhost:${port}/home`);await page.locator('.launch-splash').waitFor({state:'detached'});
  if(role==='CUSTOMER')await page.locator('.bottom-nav').getByRole('button',{name:'جمعه‌بازار',exact:true}).click();
  else{await page.getByRole('button',{name:'باز کردن منو',exact:true}).click();await page.locator('.drawer-nav button').filter({hasText:'خرید لوازم یدکی'}).click();}
  await page.getByRole('textbox',{name:'جست‌وجوی قطعه',exact:true}).fill('لنت ۲۰۶');
  await expect(page.getByRole('heading',{name:product.name,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'مشاهده '+product.name,exact:true}).click();
  await expect(page.getByRole('heading',{name:'مقایسه پیشنهاد فروشندگان'})).toBeVisible();
  await expect(page.getByRole('link',{name:/خرید از فروشنده/})).toHaveAttribute('href','https://seller-a.fixture-shop.ir/p1');
  await expect(page.getByRole('img',{name:'نمودار کمترین قیمت روزانه'})).toBeVisible();
  await page.getByRole('textbox',{name:'قیمت هدف (تومان)',exact:true}).fill('۹۰۰۰۰۰');
  await page.getByRole('button',{name:'ثبت هشدار قیمت',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'هشدار شما ثبت شد'})).toBeVisible();
  expect(calls.find(c=>c.path==='/market/alerts')?.body).toMatchObject({productId:pid,targetToman:900000,sms:false});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath(`market-${role}.png`),fullPage:true});
});
test('Torob admin stores a manually selected browse category with bounded scan settings',async({page})=>{
 await page.setViewportSize({width:1100,height:850});const writes:{path:string;body:Record<string,unknown>}[]=[];
 await page.route('**/api/admin/market/**',r=>{const req=r.request(),path=new URL(req.url()).pathname,body=req.postData()?req.postDataJSON():null;if(req.method()!=='GET')writes.push({path,body});return r.fulfill({contentType:'application/json',body:JSON.stringify(path.endsWith('/stats')?{products:0,sellers:0,pending:0,suspicious:0}:path.includes('/categories')?pageData([{id:'cat',slug:'batteries',name:'باتری خودرو'}]):req.method()==='GET'?pageData([]):{id:'seed',...body})});});
 await page.goto('http://localhost:3312/market');await page.getByRole('button',{name:'افزودن لینک دسته ترب',exact:true}).click();
 await page.getByLabel('لینک دستی دسته ترب').fill('https://torob.com/browse/541/battery/');await page.getByRole('button',{name:'ذخیره لینک',exact:true}).click();
 await expect.poll(()=>writes.length).toBe(1);expect(writes[0].body).toMatchObject({url:'https://torob.com/browse/541/battery/',category:'batteries',active:true,maxScrolls:1000,maxProducts:10000});expect(writes[0].body).not.toHaveProperty('adapter');
});
