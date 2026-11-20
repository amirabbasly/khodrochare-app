import {test, expect, type Page} from '@playwright/test';

const url = `http://localhost:${Number(process.env.HALL_E2E_PORT || 3320)}`;

async function open(page: Page) {
  await page.route('https://api.khodrochare.ir/api/v1/me', route => route.fulfill({status:401,json:{error:'Authentication required'}}));
  await page.goto(url + '/register');
  await page.locator('.launch-splash').waitFor({state: 'detached'});
}

test('page zoom shortcuts and trackpad pinch are blocked while typing and ordinary wheel scrolling work', async ({page}) => {
  await open(page);
  const events = await page.evaluate(() => {
    const fire = (event: Event) => { window.dispatchEvent(event); return event.defaultPrevented; };
    return {
      ctrlPlus: fire(new KeyboardEvent('keydown', {key: '+', ctrlKey: true, cancelable: true})),
      macMinus: fire(new KeyboardEvent('keydown', {key: '-', metaKey: true, cancelable: true})),
      numpad: fire(new KeyboardEvent('keydown', {code: 'NumpadAdd', ctrlKey: true, cancelable: true})),
      pinch: fire(new WheelEvent('wheel', {deltaY: -100, ctrlKey: true, cancelable: true})),
      scroll: fire(new WheelEvent('wheel', {deltaY: 100, cancelable: true})),
      typing: fire(new KeyboardEvent('keydown', {key: '+', cancelable: true})),
      selectAll: fire(new KeyboardEvent('keydown', {key: 'a', ctrlKey: true, cancelable: true})),
      reset: fire(new KeyboardEvent('keydown', {key: '0', ctrlKey: true, cancelable: true})),
      gesture: fire(new Event('gesturestart', {cancelable: true})),
    };
  });
  expect(events).toEqual({ctrlPlus:true,macMinus:true,numpad:true,pinch:true,scroll:false,typing:false,selectAll:false,reset:false,gesture:true});
  const original = await page.evaluate(() => ({width: innerWidth, ratio: devicePixelRatio}));
  await page.keyboard.press('Control+=');
  expect(await page.evaluate(() => ({width: innerWidth, ratio: devicePixelRatio}))).toEqual(original);
  await page.keyboard.press('Control+-');
  expect(await page.evaluate(() => ({width: innerWidth, ratio: devicePixelRatio}))).toEqual(original);
  const name = page.getByRole('textbox', {name: 'نام و نام خانوادگی'});
  await name.fill('کاربر تست');
  await expect(name).toHaveValue('کاربر تست');
});

test.describe('touch page scale', () => {
  test.use({isMobile:true,hasTouch:true,deviceScaleFactor:2,viewport:{width:390,height:844}});

  test('real pinch, double tap and input focus keep the app at scale one without blocking scrolling', async ({page,context}) => {
    await open(page);
    const meta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(meta).toContain('maximum-scale=1');
    expect(meta).toContain('minimum-scale=1');
    expect(meta).toContain('user-scalable=no');
    await expect(page.locator('body')).toHaveCSS('touch-action', 'pan-x pan-y');
    const input = page.getByRole('textbox', {name: 'نام و نام خانوادگی'});
    expect(await input.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await input.tap();
    await expect(input).toBeFocused();
    expect(await page.evaluate(() => visualViewport?.scale)).toBe(1);
    await input.blur();
    await page.evaluate(() => window.scrollTo(0,0));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:165,y:220},{x:225,y:220}]});
    for (const spread of [40,60,80]) {
      await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:195-spread,y:220},{x:195+spread,y:220}]});
    }
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await page.touchscreen.tap(195,150);
    await page.touchscreen.tap(195,150);
    expect(await page.evaluate(() => visualViewport?.scale)).toBe(1);
    // Swipe on the page margin rather than synthesizing a wheel gesture over an input.
    await page.setViewportSize({width:390,height:640});
    await page.evaluate(() => window.scrollTo(0,0));
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:385,y:580}]});
    for (const y of [530,480,430,380,330]) {
      await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:385,y}]});
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    }
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('multi-touch fallback cancels browser gestures and leaves single-finger input available', async ({page}) => {
    await open(page);
    const result = await page.evaluate(() => {
      const target = document.body;
      const a = new Touch({identifier:1,target,clientX:100,clientY:150});
      const b = new Touch({identifier:2,target,clientX:200,clientY:150});
      const fire = (touches:Touch[]) => {
        const event = new TouchEvent('touchstart', {touches,bubbles:true,cancelable:true});
        target.dispatchEvent(event);
        return event.defaultPrevented;
      };
      return {single:fire([a]),pinch:fire([a,b])};
    });
    expect(result).toEqual({single:false,pinch:true});
    await page.goto(url + '/offline.html');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /maximum-scale=1.*user-scalable=no/);
    await expect(page.locator('body')).toHaveCSS('touch-action', 'pan-x pan-y');
  });
});
