import {test,expect,type Page} from '@playwright/test';
import sharp from 'sharp';
const customer='http://localhost:3384',driver='http://localhost:3385';
async function setup(page:Page,isDriver=false){
 const user={id:'owner',role:isDriver?'DRIVER':'CUSTOMER',fullName:'کاربر نمونه',phone:'09121234567',nationalId:'1234567891',services:['REPAIR'],vehicles:[],verificationStatus:'APPROVED',profileComplete:true};
 await page.addInitScript(user=>{localStorage.setItem(`khodrochare_${user.role.toLowerCase()}_session_v2`,JSON.stringify({user,token:'a'.repeat(64),expiresAt:'2099-01-01T00:00:00Z'}));localStorage.setItem('khodrochare_location_choice_v2','dismissed');},user);
 await page.route('**/socket.io/**',r=>r.abort());await page.route('**/*tile*',r=>r.abort());
 const draft={id:'00000000-0000-4000-8000-000000000001',status:'DRAFT',version:0,details:{},photos:[] as {id:string;url:string}[],services:[]};let uploads=0;
 await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname.replace('/api/v1','');const send=(json:unknown)=>r.fulfill({json});
  if(p==='/me')return send(user);if(p==='/requests'||p.endsWith('/available'))return send([]);
  if(p==='/hall/catalog')return send({plans:[],banners:[]});
  if(p==='/hall/mine'&&r.request().method()==='POST'){draft.photos=[];return send(draft);}
  if(p.endsWith('/photos')&&r.request().method()==='POST'){uploads++;draft.photos.push({id:'photo-'+uploads,url:'/slides/hall-buy.webp'});return send(draft.photos.at(-1));}
  if(p==='/hall/mine/'+draft.id)return send(draft);
  return send({items:[],featured:[],total:0,page:1,limit:12,balanceToman:0,entries:[],totalToman:0});
 });return {uploads:()=>uploads};
}
async function wizard(page:Page){await page.goto(customer+'/home?view=hall');await page.locator('.launch-splash').waitFor({state:'detached'});await page.locator('.ch-heading').getByRole('button',{name:/ثبت آگهی/}).click();await expect(page.getByLabel('تصاویر خودرو',{exact:true})).toBeAttached();}

test('customer-only 3D shortcuts animate, remain single-line at 320px and respect reduced motion',async({page})=>{
 await setup(page);await page.setViewportSize({width:320,height:800});await page.goto(customer+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});
 const row=page.locator('.main-service-shortcuts');await expect(row.locator('.service-art3d')).toHaveCount(4);await expect(row.locator('.service-art3d svg')).toHaveCount(4);
 expect(await row.locator('linearGradient').count()).toBeGreaterThanOrEqual(8);await expect(row.locator('.service-art3d').first()).toHaveCSS('animation-name','icon3d-float');
 const label=row.locator('.shortcut-parts-label');await expect(label).toHaveCSS('white-space','nowrap');expect(await label.evaluate(el=>el.getBoundingClientRect().width<=el.parentElement!.getBoundingClientRect().width)).toBe(true);
 await row.screenshot({path:'hall-photo-icon-results/customer-shortcuts-mobile.png',animations:'disabled'});
 await page.setViewportSize({width:1440,height:1000});await row.screenshot({path:'hall-photo-icon-results/customer-shortcuts-desktop.png',animations:'disabled'});
 await page.emulateMedia({reducedMotion:'reduce'});for(const icon of await row.locator('.service-art3d').all())await expect(icon).toHaveCSS('animation-name','none');await expect(row.locator('.shortcut-import-arrow').first()).toHaveCSS('animation-name','none');
 await row.getByRole('button',{name:'واردات خودرو',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'متوجه شدم',exact:true}).click();await row.getByRole('button',{name:'فروش خودرو',exact:true}).click();await expect(page.locator('.ch-hall')).toBeVisible();
});
test('driver home no longer has any of the four customer-only shortcuts',async({page})=>{
 await setup(page,true);await page.goto(driver+'/home');await page.locator('.launch-splash').waitFor({state:'detached'});await expect(page.locator('.main-service-shortcuts')).toHaveCount(0);for(const name of ['واردات خودرو','واردات قطعات خاص','فروش خودرو','جمعه بازار'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0);
});
test('Hall validates all selected images before upload and rejects exact 8 MiB, oversized, empty, HEIC and unsupported formats',async({page})=>{
 const state=await setup(page);await wizard(page);const input=page.getByLabel('تصاویر خودرو',{exact:true});
 const png=await sharp({create:{width:40,height:30,channels:3,background:'#ffaa44'}}).png().toBuffer();
 for(const size of [8*1024*1024,8*1024*1024+1]){await input.setInputFiles([{name:'valid.png',mimeType:'image/png',buffer:png},{name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(size)}]);await expect(page.locator('.ch-wizard [role="alert"]')).toContainText('کمتر از ۸ مگابایت');expect(state.uploads()).toBe(0);}
 for(const [name,mime,buffer,expected] of [['empty.png','image/png',Buffer.alloc(0),'خالی'],['bad.svg','image/svg+xml',Buffer.from('<svg/>'),'تصویر JPG'],['phone.heic','image/heic',Buffer.from('heic'),'HEIC']] as const){await input.setInputFiles({name,mimeType:mime,buffer});await expect(page.locator('.ch-wizard [role="alert"]')).toContainText(expected);expect(state.uploads()).toBe(0);}
 await input.setInputFiles(Array.from({length:6},(_,i)=>({name:`car-${i}.png`,mimeType:'image/png',buffer:png})));await expect(page.locator('.ch-wizard [role="alert"]')).toContainText('حداکثر ۵ عکس');expect(state.uploads()).toBe(0);
});
test('Hall file picker accepts real standard images including the former 5-8 MiB gap',async({page})=>{
 test.setTimeout(120000);const state=await setup(page);
 for(const format of ['jpeg','png','webp','avif','gif','tiff'] as const){await wizard(page);const input=page.getByLabel('تصاویر خودرو',{exact:true});await expect(input).toHaveAttribute('accept',new RegExp(format));let buffer=await sharp({create:{width:80,height:60,channels:3,background:'#ee9944'}}).toFormat(format).toBuffer();if(format==='jpeg')buffer=Buffer.concat([buffer,Buffer.alloc(6*1024*1024-buffer.length)]);const before=state.uploads();await input.setInputFiles({name:`car.${format}`,mimeType:`image/${format}`,buffer});await expect.poll(()=>state.uploads()).toBe(before+1);await expect(page.locator('.ch-upload-photo')).toHaveCount(1);await expect(input).toBeEnabled();await expect(page.locator('.ch-wizard [role="alert"]')).toHaveCount(0);}
});
