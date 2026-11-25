import {test,expect,type Page} from '@playwright/test';
const root='http://localhost:3384',uuid='00000000-0000-4000-8000-000000000001';
const image=root+'/slides/hall-buy.webp';
const account={userId:'owner',name:'اتوگالری نمونه',ownerName:'مالک نمونه',activityType:'نمایشگاه',province:'تهران',city:'تهران',district:'مرکزی',landline:'02112345678',address:'تهران خیابان نمونه پلاک ۱۲',isActive:true,user:{phone:'09121234567'}};
const showroom=()=>({id:uuid,ownerId:'owner',status:'PUBLISHED',isActive:true,version:1,draft:{name:'اتوگالری نمونه',slogan:'همراه مطمئن معامله',biography:'معرفی نمایشگاه و سابقه فعالیت در بازار خودرو',manager:{name:'مدیر نمونه',phone:'09121234567',bio:'معرفی مدیر و خدمات نمایشگاه',position:'مدیر نمایشگاه',photoId:'person'},staff:[{name:'مشاور نمونه',phone:'09120000002',position:'کارشناس خرید و فروش',bio:'همراه شما در انتخاب خودرو',photoId:'person'}]},location:account,account,photos:[{id:'shop',kind:'SHOP',url:image},{id:'shop2',kind:'SHOP',url:image},{id:'person',kind:'PERSON',url:image}],campaign:null});
const listing=(index:number)=>({id:`listing-${index}`,status:'PUBLISHED',version:0,make:'پژو',model:'۲۰۷ '+index,trim:'پانوراما',year:1403,mileage:25000,city:'تهران',priceToman:3500000000,inspectionStatus:'NOT_INSPECTED',photos:[{id:'photo-'+index,url:image}],services:[],publishedAt:new Date().toISOString(),_count:{inquiries:0},details:{}});
async function session(page:Page){const user={id:'owner',role:'CUSTOMER',fullName:'مالک نمونه',phone:'09121234567',nationalId:'1234567891',profileComplete:true,services:[],vehicles:[]};await page.addInitScript(user=>{localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');},user);await page.route('**/socket.io/**',r=>r.abort());return user;}
test('Hall navigation moves private sections to profile and inserts a golden preview after ten ads',async({page})=>{
 const user=await session(page),room=showroom(),items=Array.from({length:12},(_,i)=>listing(i));let clicks=0;
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/hall/catalog'))return r.fulfill({json:{plans:[],banners:[]}});
  if(p.endsWith('/hall/listings')||p.endsWith('/hall/mine'))return r.fulfill({json:{items,featured:[],total:12,page:1,limit:12}});
  if(p.endsWith('/showrooms/gold/ads'))return r.fulfill({json:{items:[{showroom:room,token:'token'}]}});
  if(p.endsWith('/showrooms/gold/click')){clicks++;return r.fulfill({json:{showroomId:uuid,charged:true}});}
  if(p.endsWith('/showrooms/'+uuid))return r.fulfill({json:{...room,inventory:{items:[listing(1)],total:1,page:1,limit:12}}});
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:0,entries:[]}});
  return r.fulfill({json:[]});
 });
 await page.goto(root+'/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});const nav=page.getByRole('navigation',{name:'بخش‌های تالار'});await expect(nav.getByRole('button',{name:'خرید خودرو',exact:true})).toBeVisible();await expect(nav.getByRole('link',{name:'نمایشگاه',exact:true})).toHaveAttribute('href','/hall/showrooms');await expect(nav.getByRole('button',{name:'پروفایل',exact:true})).toBeVisible();await expect(nav.getByText('گفتگوهای من')).toHaveCount(0);
 await expect(page.locator('.sr-gold-ad')).toHaveCount(1);expect(await page.locator('.ch-list-grid').evaluate(el=>Array.from(el.children).findIndex(child=>child.classList.contains('sr-gold-ad')))).toBe(10);
 await nav.getByRole('button',{name:'پروفایل',exact:true}).click();await expect(page.getByRole('button',{name:'آگهی‌ها و پیش‌نویس‌های من',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'گفتگوهای من',exact:true})).toBeVisible();await nav.getByRole('button',{name:'خرید خودرو',exact:true}).click();await page.locator('.sr-gold-banner').click();await expect(page).toHaveURL(root+'/hall/showrooms/'+uuid);expect(clicks).toBe(1);
});
test('directory opens showroom carousel, manager, advisors and real inventory',async({page})=>{
 const room=showroom();await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;if(p.endsWith('/showrooms/gold/ads'))return r.fulfill({json:{items:[]}});if(p.endsWith('/showrooms/'+uuid))return r.fulfill({json:{...room,inventory:{items:[listing(1)],total:1,page:1,limit:12}}});if(p.endsWith('/showrooms'))return r.fulfill({json:{items:[room],total:1,page:1,limit:12}});return r.fulfill({json:[]});});
 await page.setViewportSize({width:390,height:844});await page.goto(root+'/hall/showrooms');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.locator('.sr-directory-card')).toHaveCount(1);await page.locator('.sr-directory-cover').click();await expect(page.getByRole('heading',{name:'اتوگالری نمونه',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'مدیر نمونه',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'مشاور نمونه',exact:true})).toBeVisible();await expect(page.locator('.sr-inventory-card')).toHaveCount(1);await page.getByRole('button',{name:'اسلاید بعدی نمایشگاه'}).click();await expect(page.locator('.sr-hero>img')).toHaveAttribute('alt',/تصویر 2/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:test.info().outputPath('showroom-mobile.png'),fullPage:true});
});
test('owner registers by OTP, adds a showroom and submits only after captcha',async({page})=>{
 const user=await session(page),room=showroom();room.status='DRAFT';room.draft.staff=[];room.photos=[];room.draft.manager.photoId='';let submitCount=0,uploadCount=0;
 await page.route('**/api/v1/**',async r=>{const p=new URL(r.request().url()).pathname,method=r.request().method(),body=r.request().headers()['content-type']?.includes('json')?r.request().postDataJSON():null;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/showrooms/catalog'))return r.fulfill({json:{provinces:['تهران'],activityTypes:['نمایشگاه','شرکت']}});
  if(p.endsWith('/showrooms/auth/otp'))return r.fulfill({json:{challengeId:uuid}});
  if(p.endsWith('/showrooms/auth/verify'))return r.fulfill({json:{token:'b'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}});
  if(p.endsWith('/showrooms/account'))return r.fulfill({json:account,status:method==='POST'?201:200});
  if(p.endsWith('/showrooms/mine'))return r.fulfill({json:method==='POST'?room:{items:[]},status:method==='POST'?201:200});
  if(p.endsWith('/gold'))return r.fulfill({json:{campaign:null,averageCompetitorBidToman:8000}});
  if(p.endsWith('/hall/catalog'))return r.fulfill({json:{plans:[],banners:[]}});
  if(p.endsWith('/listings'))return r.fulfill({json:{items:[]}});
  if(p.endsWith('/photos')){uploadCount++;const kind=uploadCount===1?'SHOP':'PERSON',photo={id:'uploaded-'+uploadCount,kind,url:image};room.photos.push(photo);room.version++;return r.fulfill({json:photo,status:201});}
  if(p.endsWith('/captcha/solve'))return r.fulfill({json:{proof:uuid}});
  if(p.endsWith('/captcha'))return r.fulfill({json:{id:uuid,y:50,image:'data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect width="320" height="160" fill="#234456"/></svg>').toString('base64')}});
  if(p.endsWith('/submit')){submitCount++;room.status='PENDING_REVIEW';room.version++;return r.fulfill({json:room});}
  if(p.endsWith('/showrooms/mine/'+uuid)){if(method==='PATCH'){room.draft=body.draft;room.version++;}return r.fulfill({json:room});}
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:50000,entries:[]}});
  return r.fulfill({json:[]});
 });
 await page.goto(root+'/hall/showrooms/join');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByLabel('نام نمایشگاه',{exact:true}).fill('اتوگالری نمونه');await page.getByLabel('نام و نام خانوادگی مالک نمایشگاه',{exact:true}).fill('مالک نمونه');await page.getByLabel('شهر',{exact:true}).fill('تهران');await page.getByLabel('تلفن ثابت',{exact:true}).fill('02112345678');await page.getByLabel('نشانی',{exact:true}).fill('تهران خیابان نمونه پلاک ۱۲');await page.getByLabel('شماره موبایل مالک',{exact:true}).fill('09121234567');await page.getByRole('button',{name:'دریافت کد فعال‌سازی',exact:true}).click();await page.getByLabel('کد فعال‌سازی',{exact:true}).fill('123456');await page.getByRole('button',{name:'تأیید و ادامه',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('مالک نمونه عزیز');await page.getByRole('button',{name:'اضافه کردن نمایشگاه',exact:true}).click();await page.getByRole('button',{name:'نمایشگاه جدید',exact:true}).click();
 const file={name:'photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+WQAAAAASUVORK5CYII=','base64')};await page.getByLabel('تصاویر مغازه برای اسلایدر (حداکثر ۶ تصویر)',{exact:true}).setInputFiles(file);await expect.poll(()=>uploadCount).toBe(1);await expect(page.getByLabel('عکس مدیر',{exact:true})).toBeEnabled();await page.getByLabel('عکس مدیر',{exact:true}).setInputFiles(file);await expect.poll(()=>uploadCount).toBe(2);await page.getByRole('button',{name:'ثبت نمایشگاه و حل کپچا',exact:true}).click();const modal=page.getByRole('dialog',{name:'تکمیل پازل برای ثبت نمایشگاه'});await expect(modal).toBeVisible();expect(submitCount).toBe(0);const box=await modal.locator('.ch-puzzle-piece').boundingBox(),board=await modal.locator('.ch-puzzle').boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await page.mouse.move(board!.x+170,box!.y+box!.height/2,{steps:8});await page.mouse.up();await expect(page.getByRole('status').filter({hasText:'نمایشگاه در صف بررسی قرار گرفت'})).toBeVisible();expect(submitCount).toBe(1);
});
test('operator reviews showrooms and can disable the showroom account',async({page})=>{
 const user={id:1,role:'admin',first_name:'مدیر',last_name:'تست',username:'admin'},room=showroom();room.status='PENDING_REVIEW';room.draft.staff=[];let approvals=0,accountUpdates=0;
 await page.addInitScript(user=>{localStorage.setItem('kcrm.token','test-token');localStorage.setItem('kcrm.user',JSON.stringify(user));},user);
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/auth/me'))return r.fulfill({json:{user}});
  if(p.endsWith('/showrooms'))return r.fulfill({json:{items:[room],pagination:{page:1,limit:20,total:1,totalPages:1}}});
  if(p.endsWith('/showrooms/'+uuid)){approvals++;const input=r.request().postDataJSON();room.status=input.status;room.version++;return r.fulfill({json:room});}
  if(p.includes('/showroom-accounts/')){accountUpdates++;expect(r.request().postDataJSON().isActive).toBe(false);return r.fulfill({json:{...account,isActive:false}});}
  return r.fulfill({json:{items:[],pagination:{page:1,limit:20,total:0,totalPages:1}}});
 });
 await page.goto('http://localhost:3386/super-app');await page.getByRole('tab',{name:'نمایشگاه‌ها',exact:true}).click();await page.getByRole('button',{name:'بررسی و مدیریت نمایشگاه',exact:true}).click();const modal=page.getByRole('dialog');await modal.getByRole('button',{name:'تأیید و انتشار نمایشگاه',exact:true}).click();await expect.poll(()=>approvals).toBe(1);await modal.getByRole('checkbox',{name:'حساب نمایشگاهی مالک فعال باشد',exact:true}).uncheck();await modal.getByRole('button',{name:'ذخیره اطلاعات و وضعیت حساب',exact:true}).click();await expect.poll(()=>accountUpdates).toBe(1);
});

test('featured option is disabled at six slots and shows the release timer',async({page})=>{
 const user=await session(page),item=listing(1);
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;
  if(p.endsWith('/me'))return r.fulfill({json:user});
  if(p.endsWith('/hall/catalog'))return r.fulfill({json:{plans:[{code:'FEATURED',name:'ویژه',kind:'BOOST',description:'اسلاید ویژه',priceToman:199000,durationHours:6,services:[],terms:'۶ ساعت'}],banners:[],featuredAvailability:{available:0,nextAvailableAt:new Date(Date.now()+3600000).toISOString(),durationHours:6}}});
  if(p.endsWith('/hall/mine'))return r.fulfill({json:{items:[item],total:1,page:1,limit:12}});
  if(p.endsWith('/hall/listings'))return r.fulfill({json:{items:[],featured:[],total:0,page:1,limit:12}});
  if(p.endsWith('/wallet'))return r.fulfill({json:{balanceToman:500000,entries:[]}});
  return r.fulfill({json:[]});
 });
 await page.goto(root+'/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('navigation',{name:'بخش‌های تالار'}).getByRole('button',{name:'پروفایل',exact:true}).click();await page.getByRole('button',{name:'آگهی‌ها و پیش‌نویس‌های من',exact:true}).click();await page.getByRole('button',{name:'ارتقای آگهی',exact:true}).click();const modal=page.getByRole('dialog');await expect(modal.getByRole('checkbox',{name:'انتخاب ویژه',exact:true})).toBeDisabled();await expect(modal).toContainText('ظرفیت ۶ اسلاید ویژه تکمیل است');await expect(modal).toContainText('دقیقه');
});
