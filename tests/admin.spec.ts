import { test, expect } from '@playwright/test';
import http from 'node:http';
let upstream: http.Server;
test.beforeAll(async () => {
  upstream = http.createServer(async (req, res) => {
    let text = ''; for await (const chunk of req) text += chunk;
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/api/v1/admin/session' && req.method === 'POST') {
      const credentials = JSON.parse(text);
      if (credentials.username !== 'observer' || credentials.password !== 'server-test-password') { res.writeHead(401).end('{}'); return; }
      res.end(JSON.stringify({ token: 'd'.repeat(64) })); return;
    }
    if (req.headers.authorization !== `Bearer ${'d'.repeat(64)}`) { res.writeHead(401).end('{}'); return; }
    if (req.method === 'DELETE') { res.writeHead(204).end(); return; }
    res.end(JSON.stringify(overview));
  });
  await new Promise<void>(resolve => upstream.listen(4198, '127.0.0.1', resolve));
});
test.afterAll(async () => { await new Promise<void>(resolve => upstream.close(() => resolve())); });
const now = new Date().toISOString();
const overview = {
  generatedAt: now, locationMaxAgeSeconds: 120, limits: { people: 2000, requests: 2000 },
  people: [
    { id: 'd1', role: 'DRIVER', fullName: 'امدادگر تهران', phone: '09121234567', vehiclePlate: '12 ب 345 - 67', vehicleType: 'نیسان', services: ['REPAIR'], province: 'تهران', status: 'ARRIVED', activeRequestId: 'r1', location: { latitude: 35.7, longitude: 51.4, recordedAt: now, fresh: true }, _count: { requests: 0, assignments: 2 } },
    { id: 'c1', role: 'CUSTOMER', fullName: 'مشتری فارس', phone: '09171234567', vehiclePlate: null, vehicleType: null, services: [], province: 'فارس', status: 'OFFLINE', activeRequestId: null, location: { latitude: 29.6, longitude: 52.5, recordedAt: new Date(Date.now()-600000).toISOString(), fresh: false }, _count: { requests: 3, assignments: 0 } },
  ],
  requests: [{ id: 'r1', customerId: 'c1', driverId: 'd1', service: 'REPAIR', status: 'ARRIVED', vehicleName: 'پژو ۲۰۶', vehiclePlate: '12 ب 345 - 67', originProvince: 'تهران', originAddress: 'تهران، ولیعصر', destinationAddress: null, createdAt: now, priceToman: 800000, partsQuoteToman: 200000, partsApprovedToman: 200000, problem: 'خودرو روشن نمی‌شود', payment: { status: 'SUBMITTED', amountToman: 1000000, commissionToman: 300000, driverShareToman: 700000 } }],
  payments: [{ status: 'SUBMITTED', _count: 1, _sum: { amountToman: 1000000 } }], revenue: [{ day: new Date().toLocaleDateString('en-CA',{ timeZone: 'Asia/Tehran' }), driverId: 'd1', appToman: 300000, driverToman: 700000 }],
  totals: { customers: 1, drivers: 1, requests: 1, appToman: 300000, driverToman: 700000, categories: [{ service: 'REPAIR', status: 'ARRIVED', _count: 1 }] },
};
for (const width of [1440, 390]) test(`read-only admin filters provinces, shows stale GPS and financial details at ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 950 });
  const mutations: string[] = [];
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.route('**/api/admin/**', route => {
    if (route.request().method() !== 'GET') mutations.push(route.request().url());
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(overview) });
  });
  await page.goto('http://localhost:3312');
  await expect(page.getByRole('heading', { name: 'نبض زنده ناوگان' })).toBeVisible();
  await expect(page.locator('.live-map.leaflet-container')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: /مشتریان/ }).click();
  await expect(page.locator('tbody')).toContainText('مشتری فارس');
  await expect(page.locator('tbody')).toContainText('بدون موقعیت تازه');
  await page.getByLabel('استان', { exact: true }).selectOption('تهران');
  await expect(page.getByText('حسابی با این فیلتر پیدا نشد.')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: /امدادگران/ }).click();
  await expect(page.locator('tbody')).toContainText('امدادگر تهران');
  await page.getByRole('button', { name: 'مشاهده', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'جزئیات' })).toContainText('امدادگر تهران');
  await page.getByRole('button', { name: 'بستن جزئیات' }).click();
  await page.getByRole('navigation').getByRole('button', { name: /درآمد و پرداخت/ }).click();
  await expect(page.getByRole('img', { name: 'نمودار درآمد ۳۰ روز اخیر' })).toBeVisible();
  await expect(page.locator('.financial-summary')).toContainText('۱٬۰۰۰٬۰۰۰');
  await page.getByRole('navigation').getByRole('button', { name: /نمای کلی/ }).click();
  await page.getByRole('button', { name: 'جزئیات', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('هزینه قطعات پیشنهادی');
  await expect(page.getByRole('dialog')).toContainText('۳۰۰٬۰۰۰ تومان');
  await page.getByRole('button', { name: 'بستن جزئیات' }).click();
  expect(mutations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath(`admin-${width}.png`), fullPage: true });
});
test('admin login shows errors and does not store credentials in browser storage', async ({ page }) => {
  let loggedIn = false;
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.route('**/api/admin/**', route => {
    const req = route.request();
    if (req.method() === 'POST') { loggedIn = req.postDataJSON().password === 'correct-password'; return route.fulfill({ status: loggedIn?200:401, contentType: 'application/json', body: '{}' }); }
    return route.fulfill({ status: loggedIn?200:401, contentType: 'application/json', body: JSON.stringify(loggedIn?overview:{}) });
  });
  await page.goto('http://localhost:3312');
  await page.getByLabel('نام کاربری', { exact: true }).fill('observer');
  await page.getByLabel('رمز عبور', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'ورود به پنل مشاهده‌ای' }).click();
  await expect(page.locator('.error-banner')).toContainText('صحیح نیست');
  await page.getByLabel('رمز عبور', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: 'ورود به پنل مشاهده‌ای' }).click();
  await expect(page.getByRole('heading', { name: 'نبض زنده ناوگان' })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('password');
});

test('admin server proxy protects its HttpOnly session and rejects arbitrary writes and cross-origin login', async ({ request }) => {
  const base = 'http://localhost:3312/api/admin';
  expect((await request.get(`${base}/overview`)).status()).toBe(401);
  expect((await request.post(`${base}/session`, { headers: { Origin: 'https://untrusted.example' }, data: { username: 'observer', password: 'server-test-password' } })).status()).toBe(403);
  const login = await request.post(`${base}/session`, { headers: { Origin: 'http://localhost:3312' }, data: { username: 'observer', password: 'server-test-password' } });
  expect(login.status()).toBe(200);
  expect(await login.json()).toEqual({ ok: true });
  expect(login.headers()['set-cookie']).toContain('HttpOnly');
  expect(login.headers()['set-cookie']).toContain('SameSite=strict');
  expect((await request.get(`${base}/overview`)).status()).toBe(200);
  expect((await request.post(`${base}/overview`, { headers: { Origin: 'http://localhost:3312' }, data: {} })).status()).toBe(405);
  expect((await request.post(`${base}/requests/r1/status`, { headers: { Origin: 'http://localhost:3312' }, data: { status: 'COMPLETED' } })).status()).toBe(405);
  expect((await request.delete(`${base}/session`, { headers: { Origin: 'http://localhost:3312' } })).status()).toBe(204);
  expect((await request.get(`${base}/overview`)).status()).toBe(401);
});
