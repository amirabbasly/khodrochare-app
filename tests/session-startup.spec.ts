import {test,expect,type Page,type Route} from '@playwright/test';
const base='https://api.khodrochare.ir/api/v1',url=`http://localhost:${Number(process.env.HALL_E2E_PORT||3320)}`;
const user={id:'session-owner',role:'CUSTOMER',fullName:'کاربر سشن',phone:'09121234567',nationalId:'1234567891',services:[],vehicles:[]};
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r;});return{promise,resolve};}
async function setup(page:Page,cached=false){
 await page.addInitScript(({cached,user})=>{
  localStorage.setItem('khodrochare_location_choice_v2','dismissed');
  if(cached)localStorage.setItem('khodrochare_customer_session_v2',JSON.stringify({token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString(),user}));
  const scope=window as Window&{loginSeen?:boolean};scope.loginSeen=false;
  new MutationObserver(()=>{if(document.getElementById('login-heading'))scope.loginSeen=true;}).observe(document,{childList:true,subtree:true});
 },{cached,user});
 await page.route('**/socket.io/**',r=>r.abort());
}
async function common(route:Route){const path=new URL(route.request().url()).pathname;const send=(json:unknown)=>route.fulfill({json});if(path.endsWith('/requests'))return send([]);if(path.endsWith('/wallet'))return send({balanceToman:0,entries:[],mode:'sandbox'});return send({items:[],total:0});}
async function noLoginFlash(page:Page){expect(await page.evaluate(()=>(window as Window&{loginSeen?:boolean}).loginSeen)).toBe(false);}

for(const cached of [false,true])test(`slow ${cached?'cached':'cookie-only'} session stays on splash until home is ready without mounting login`,async({page})=>{
 await setup(page,cached);await page.clock.install();const gate=deferred();let checks=0;
 await page.route(base+'/**',async r=>{if(new URL(r.request().url()).pathname==='/api/v1/me'){checks++;await gate.promise;return r.fulfill({json:user});}return common(r);});
 try{await page.goto(url+'/');await expect.poll(()=>checks).toBe(1);await page.clock.fastForward(5000);await expect(page.locator('.launch-splash')).toBeVisible();await expect(page.locator('#login-heading')).toHaveCount(0);await expect(page.locator('.app-frame')).toHaveCount(0);await noLoginFlash(page);gate.resolve();await expect(page).toHaveURL(url+'/home');await expect(page.locator('.app-frame')).toBeAttached();await page.clock.fastForward(1000);await expect(page.locator('.launch-splash')).toHaveCount(0);expect(checks).toBe(1);await noLoginFlash(page);}finally{gate.resolve();}
});

test('expired server session keeps splash until rejection and then shows login without mounting home',async({page})=>{
 await setup(page,true);await page.clock.install();const gate=deferred();let checks=0;
 await page.route(base+'/**',async r=>{if(new URL(r.request().url()).pathname==='/api/v1/me'){checks++;await gate.promise;return r.fulfill({status:401,json:{error:'Authentication required'}});}return common(r);});
 try{await page.goto(url+'/home');await expect.poll(()=>checks).toBe(1);await page.clock.fastForward(5000);await expect(page.locator('.launch-splash')).toBeVisible();await expect(page.locator('.app-frame')).toHaveCount(0);await expect(page.locator('#login-heading')).toHaveCount(0);gate.resolve();await expect(page).toHaveURL(url+'/');await expect(page.locator('#login-heading')).toBeAttached();await page.clock.fastForward(1000);await expect(page.locator('.launch-splash')).toHaveCount(0);await expect(page.locator('#login-heading')).toBeVisible();expect(checks).toBe(1);}finally{gate.resolve();}
});

for(const failure of ['server','network'])test(`${failure} failure retains session and offers retry on splash instead of flashing login`,async({page})=>{
 await setup(page,true);await page.clock.install();let checks=0;
 await page.route(base+'/**',async r=>{if(new URL(r.request().url()).pathname==='/api/v1/me'){checks++;if(checks===1)return failure==='network'?r.abort('failed'):r.fulfill({status:503,json:{error:'Unavailable'}});return r.fulfill({json:user});}return common(r);});
 await page.goto(url+'/');await expect(page.locator('.splash-session-error')).toBeVisible();for(const viewport of [{width:375,height:812},{width:812,height:375}]){await page.setViewportSize(viewport);const button=await page.getByRole('button',{name:'تلاش دوباره',exact:true}).boundingBox(),logo=await page.locator('.splash-brand-symbol').boundingBox();expect(button!.y).toBeGreaterThanOrEqual(0);expect(button!.y+button!.height).toBeLessThanOrEqual(viewport.height);expect(Math.abs(logo!.x+logo!.width/2-viewport.width/2)).toBeLessThan(1);expect(Math.abs(logo!.y+logo!.height/2-viewport.height/2)).toBeLessThan(1);}await page.clock.fastForward(5000);await expect(page.locator('.launch-splash')).toBeVisible();await expect(page.locator('#login-heading')).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('khodrochare_customer_session_v2'))).not.toBeNull();await page.getByRole('button',{name:'تلاش دوباره',exact:true}).click();await expect(page).toHaveURL(url+'/home');await expect(page.locator('.app-frame')).toBeAttached();await page.clock.fastForward(1000);await expect(page.locator('.launch-splash')).toHaveCount(0);expect(checks).toBe(2);await noLoginFlash(page);
});

test('sign-in updates the shared session and sign-out returns to login without bouncing home',async({page})=>{
 await setup(page);let checks=0;
 await page.route(base+'/**',async r=>{const path=new URL(r.request().url()).pathname;if(path==='/api/v1/me'){checks++;return r.fulfill({status:401,json:{error:'Authentication required'}});}if(path.endsWith('/login'))return r.fulfill({json:{user,token:'a'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString()}});if(path.endsWith('/logout'))return r.fulfill({status:204});return common(r);});
 await page.goto(url+'/');await page.locator('.launch-splash').waitFor({state:'detached'});await page.getByRole('textbox',{name:'شماره تماس',exact:true}).fill('09121234567');await page.getByLabel('رمز عبور',{exact:true}).fill('password123');await page.getByRole('button',{name:'ورود به حساب',exact:false}).click();await expect(page).toHaveURL(url+'/home');await expect(page.locator('.app-frame')).toBeVisible();await page.getByRole('button',{name:'باز کردن منو'}).click();await page.getByRole('button',{name:'خروج',exact:true}).click();await expect(page).toHaveURL(url+'/');await expect(page.locator('#login-heading')).toBeVisible();await expect(page.locator('.app-frame')).toHaveCount(0);expect(checks).toBe(1);
});


test('phone-only registration enters the shared session without rechecking or collecting identity',async({page})=>{
 await setup(page);let checks=0;const sent:Record<string,unknown>[]=[];
 const newcomer={...user,fullName:'کاربر خودرو چاره',nationalId:null,profileComplete:false,hasPassword:false};
 await page.route(base+'/**',async r=>{const path=new URL(r.request().url()).pathname;if(path==='/api/v1/me'){checks++;return r.fulfill({status:401,json:{error:'Authentication required'}});}if(path.endsWith('/otp/request')){sent.push(r.request().postDataJSON());return r.fulfill({json:{challengeId:'otp-test',expiresInSeconds:300,retryAfterSeconds:60}});}if(path.endsWith('/otp/verify')){sent.push(r.request().postDataJSON());return r.fulfill({json:{user:newcomer,token:'b'.repeat(64),expiresAt:new Date(Date.now()+86400000).toISOString()}});}return common(r);});
 await page.goto(url+'/register');await page.locator('.launch-splash').waitFor({state:'detached'});
 await expect(page.getByLabel('نام و نام خانوادگی',{exact:true})).toHaveCount(0);await expect(page.getByLabel('کد ملی',{exact:true})).toHaveCount(0);await expect(page.locator('input[type=password]')).toHaveCount(0);
 await page.getByLabel('شماره تماس',{exact:true}).fill('۰۹۱۲۱۲۳۴۵۶۷');await page.getByRole('button',{name:'دریافت کد تأیید',exact:true}).click();await page.getByLabel('کد تأیید',{exact:true}).fill('۸۶۴۲۰۹');await page.getByRole('button',{name:'تأیید و ورود',exact:true}).click();await expect(page).toHaveURL(url+'/home');await expect(page.locator('.header-profile-text strong')).toHaveText('کاربر خودرو چاره');await expect(page.locator('.auth-page')).toHaveCount(0);expect(checks).toBe(1);expect(sent).toEqual([{phone:'09121234567',purpose:'REGISTER'},{challengeId:'otp-test',code:'864209',remember:true}]);expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('864209');
});
