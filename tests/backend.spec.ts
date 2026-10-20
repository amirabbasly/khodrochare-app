import { test, expect, type Page } from "@playwright/test";

const endpoint = "https://api.khodrochare.ir/api/v1";
const makeUser = (role: "CUSTOMER" | "DRIVER") => ({ id: `${role}-user`, role, fullName: role === "CUSTOMER" ? "کاربر آزمایشی" : "امدادگر آزمایشی", phone: "09121234567", nationalId: "1234567891", services: ["REPAIR", "TOWING"], vehicleType: "نیسان", vehiclePlate: "12 ب 345 - 67", identityDocumentId: role === "DRIVER" ? "document-id" : null, vehicles: [] });
type TestPayment = { id: string; status: string; cardNumber: string; accountName: string; serviceToman: number; partsToman: number; amountToman: number; commissionPercent: number; commissionToman: number; driverShareToman: number; attempts: { bankReference: string; status: string }[] };
type TestUser = ReturnType<typeof makeUser>;
type TestRequest = { id: string; status: string; service: string; customerId: string; driverId: string | null; vehicleName: string; vehiclePlate: string; originLat: number; originLng: number; destinationLat: number | null; destinationLng: number | null; distanceMeters: number | null; priceToman: number | null; originAddress?: string; destinationAddress?: string; partsQuoteToman?: number | null; partsApprovedToman?: number | null; partsQuoteVersion?: number; problem: string | null; createdAt: string; updatedAt: string };
function makeRequest(): TestRequest {
  return { id: "request-1", status: "PENDING", service: "REPAIR", customerId: "CUSTOMER-user", driverId: null, vehicleName: "پژو ۲۰۶", vehiclePlate: "12 ب 345 - 67", originLat: 35.7, originLng: 51.4, destinationLat: null, destinationLng: null, distanceMeters: null, priceToman: 800000, problem: "خودرو روشن نمی‌شود", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
async function mockBackend(page: Page, user: TestUser, seed: TestRequest[] = []) {
  const calls: { route: string; method: string; body: Record<string, unknown> | null }[] = [];
  const state = { requests: seed, gps: false, cookieAuthenticated: false, payment: null as TestPayment | null };
  await page.route("**/socket.io/**", route => route.abort());
  await page.route("https://tile.openstreetmap.org/**", route => route.abort());
  await page.route(`${endpoint}/**`, async route => {
    const req = route.request();
    const suffix = new URL(req.url()).pathname.replace("/api/v1", "");
    const method = req.method();
    const body = req.headers()["content-type"]?.includes("application/json") ? req.postDataJSON() : null;
    calls.push({ route: suffix, method, body });
    const send = (data: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
    if (method === "OPTIONS") return route.fulfill({ status: 204 });
    if (suffix.includes("/login") || suffix.includes("/register")) return send({ token: "a".repeat(64), expiresAt: new Date(Date.now() + 86400000).toISOString(), user }, suffix.endsWith("register") ? 201 : 200);
    if (suffix !== "/documents" && req.headers().authorization !== `Bearer ${"a".repeat(64)}` && !state.cookieAuthenticated) return send({ error: "Authentication required" }, 401);
    if (suffix === "/me") return send(user);
    if (suffix === "/drivers/earnings") return send({ entries: [], totalToman: 0 });
    if (suffix === "/vehicle-models") return send([{ id: "vm_test206", name: "پژو ۲۰۶", groupId: "GROUP_1", group: { id: "GROUP_1", title: "گروه اول", nissanBaseToman: 1600000, nissanPerKmToman: 60000, flatbedBaseToman: 2000000, flatbedPerKmToman: 75000 } }]);
    if (suffix === "/locations/search") {
      const destination = new URL(req.url()).searchParams.get("q")?.includes("آزادی");
      return send([{ id: (destination ? "b" : "a").repeat(64), label: destination ? "تهران، خیابان آزادی" : "تهران، خیابان ولیعصر", city: "تهران", street: destination ? "خیابان آزادی" : "خیابان ولیعصر", latitude: destination ? 35.8 : 35.7, longitude: destination ? 51.3 : 51.4 }]);
    }
    if (suffix === "/requests/towing/estimate") return send({ priceToman: 2200000, distanceMeters: 10000, pricingBreakdown: { service: "TOWING", baseToman: 1600000, perKmToman: 60000, totalToman: 2200000, requiresAgreement: false } });
    if (suffix.endsWith("/parts-quote/approve")) { state.requests[0].partsApprovedToman = state.requests[0].partsQuoteToman; return send(state.requests[0]); }
    if (suffix.endsWith("/parts-quote")) { state.requests[0].partsQuoteToman = Number(body!.amountToman); state.requests[0].partsQuoteVersion = 1; state.requests[0].partsApprovedToman = null; return send(state.requests[0]); }
    if (suffix.endsWith("/payment/report")) { state.payment!.status = "SUBMITTED"; state.payment!.attempts = [{ bankReference: String(body!.bankReference), status: "SUBMITTED" }]; return send(state.payment); }
    if (suffix.endsWith("/payment")) {
      if (method === "GET") return send(state.payment);
      const request = state.requests[0];
      if (request.service === "REPAIR" && request.partsApprovedToman == null) return send({ error: "Parts quote must be approved before payment" }, 409);
      const serviceToman = request.priceToman || 0; const partsToman = request.partsApprovedToman || 0;
      const amountToman = serviceToman + partsToman; const commissionPercent = request.service === "REPAIR" ? 30 : 20;
      state.payment = { id: "payment-1", status: "AWAITING_TRANSFER", cardNumber: "6219861435789192", accountName: "حساب خودرو چاره", serviceToman, partsToman, amountToman, commissionPercent, commissionToman: amountToman * commissionPercent / 100, driverShareToman: amountToman * (100 - commissionPercent) / 100, attempts: [] };
      return send(state.payment, 201);
    }
    if (suffix === "/documents") return send({ id: "c9a7152f-41d8-4fc5-a69c-6ae71152d474", token: "b".repeat(64), expiresInSeconds: 86400 }, 201);
    if (suffix === "/drivers/location") { state.gps = true; return send({ recordedAt: new Date().toISOString() }); }
    if (suffix === "/drivers/requests/available") return send(state.requests.filter(r => r.status === "PENDING").map(r => ({ id: r.id, service: r.service, vehicleName: r.vehicleName, originLat: r.originLat, originLng: r.originLng, destinationLat: r.destinationLat, destinationLng: r.destinationLng, distanceMeters: r.distanceMeters, priceToman: r.priceToman, createdAt: r.createdAt })));
    if (suffix === "/requests") return send(user.role === "DRIVER" ? state.requests.filter(r => r.driverId === user.id) : state.requests);
    if (suffix === "/requests/repair" || suffix === "/requests/towing") {
      const request = { ...makeRequest(), service: suffix.endsWith("towing") ? "TOWING" : "REPAIR", vehicleName: String(body!.vehicleName), vehiclePlate: String(body!.vehiclePlate), originAddress: "تهران، خیابان ولیعصر", destinationAddress: suffix.endsWith("towing") ? "تهران، خیابان آزادی" : undefined };
      state.requests.push(request); return send(request, 201);
    }
    if (suffix.endsWith("/accept")) {
      if (!state.gps) return send({ error: "Send a fresh GPS location before accepting" }, 409);
      state.requests[0].status = "ACCEPTED"; state.requests[0].driverId = user.id; return send(state.requests[0]);
    }
    if (suffix.endsWith("/status")) { state.requests[0].status = String(body!.status); return send(state.requests[0]); }
    if (suffix.endsWith("/tracking")) return send(state.requests[0]?.driverId ? { driver: { latitude: 35.71, longitude: 51.41, recordedAt: new Date().toISOString() }, distanceToOriginMeters: 1400, stale: false } : { driver: null });
    if (suffix.startsWith("/requests/")) return send(state.requests[0]);
    if (suffix === "/auth/logout") return route.fulfill({ status: 204 });
    return send({ error: "Unexpected test route" }, 404);
  });
  return { calls, state };
}
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.locator(".launch-splash").waitFor({ state: "detached" });
  if (url.endsWith("/home")) await dismissLocation(page);
}
async function dismissLocation(page: Page) {
  await page.getByRole("button", { name: "فعلاً ادامه بدون موقعیت", exact: true }).click();
}
async function seedSession(page: Page, user: TestUser) {
  await page.addInitScript(({ user }) => {
    localStorage.setItem(`khodrochare_${user.role.toLowerCase()}_session_v2`, JSON.stringify({ token: "a".repeat(64), expiresAt: new Date(Date.now() + 86400000).toISOString(), user }));
  }, { user });
}

test("customer registration sends national ID and never stores a password", async ({ page }) => {
  const { calls } = await mockBackend(page, makeUser("CUSTOMER"));
  await open(page, "http://localhost:3310/register");
  await page.getByLabel("نام و نام خانوادگی", { exact: true }).fill("کاربر آزمایشی");
  await page.getByLabel("شماره تماس", { exact: true }).fill("۰۹۱۲۱۲۳۴۵۶۷");
  await page.getByLabel("کد ملی", { exact: true }).fill("۱۲۳۴۵۶۷۸۹۱");
  await page.getByLabel("رمز عبور", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "ساخت حساب کاربری" }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(calls.find(c => c.route === "/auth/customers/register")?.body).toMatchObject({ phone: "09121234567", nationalId: "1234567891" });
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toContain("password123");
  await expect(page.locator(".header-profile-text strong")).toHaveText("کاربر آزمایشی");
});

test("customer repair persists before waiting and cancellation calls the server", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  const { calls } = await mockBackend(page, user);
  await seedSession(page, user);
  await open(page, "http://localhost:3310/home");
  await page.locator(".main-service-card--roadside").click();
  await page.getByRole("button", { name: "فهمیدم", exact: true }).click();
  await page.getByPlaceholder("نام خودرو", { exact: true }).fill("پژو ۲۰۶");
  await page.getByPlaceholder("۱۲ ب ۳۴۵ - ۶۷", { exact: true }).fill("12 ب 345 - 67");
  await page.locator("textarea").first().fill("خودرو روشن نمی‌شود");
  await expect(page.locator(".leaflet-container").first()).toBeVisible();
  await page.getByRole("button", { name: "ثبت درخواست خدمت" }).click();
  await expect(page.locator(".waiting-page")).toBeVisible();
  expect(calls.find(c => c.route === "/requests/repair")?.body).toMatchObject({ vehicleName: "پژو ۲۰۶", vehiclePlate: "12 ب 345 - 67", problem: "خودرو روشن نمی‌شود" });
  await expect(page.locator(".waiting-timer-digits")).toHaveText("—");
  await page.getByRole("button", { name: "انصراف از درخواست" }).click();
  await expect(page.locator(".waiting-page")).toHaveCount(0);
  expect(calls.find(c => c.route.endsWith("/status"))?.body).toEqual({ status: "CANCELLED" });
});

test("driver login, GPS, acceptance and status changes use real API contracts", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 35.71, longitude: 51.41 });
  const { calls, state } = await mockBackend(page, makeUser("DRIVER"), [makeRequest()]);
  await open(page, "http://localhost:3311/");
  await page.getByLabel("شماره تماس", { exact: true }).fill("09121234567");
  await page.getByLabel("رمز عبور", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "ورود به حساب" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await dismissLocation(page);
  await page.locator(".header-ready-switch").click();
  await page.getByRole("button", { name: "تأیید و گرفتن بار" }).click();
  await expect(page.locator(".job-layout")).toBeVisible();
  expect(state.gps).toBe(true);
  expect(calls.some(c => c.route === "/auth/drivers/login")).toBe(true);
  await page.locator(".job-actions .primary-button").click();
  await expect.poll(() => state.requests[0].status).toBe("ARRIVED");
  await page.locator(".job-actions .primary-button").click();
  await page.locator(".job-actions .primary-button").click();
  await expect.poll(() => state.requests[0].status).toBe("COMPLETED");
});

test("driver registration uploads a document and maps services to backend codes", async ({ page }) => {
  const { calls } = await mockBackend(page, makeUser("DRIVER"));
  await open(page, "http://localhost:3311/register");
  await page.getByLabel("نام و نام خانوادگی", { exact: true }).fill("امدادگر آزمایشی");
  await page.locator("#national-code").fill("1234567891");
  await page.locator("#vehicle-type").fill("نیسان");
  await page.getByLabel("دو رقم پلاک", { exact: true }).fill("12");
  await page.getByLabel("سه رقم پلاک", { exact: true }).fill("345");
  await page.getByLabel("کد استان پلاک", { exact: true }).fill("67");
  await page.locator(".service-picker-item").filter({ hasText: "تعمیر در محل" }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "identity.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=", "base64") });
  await page.getByLabel("شماره تماس", { exact: true }).fill("09121234567");
  await page.getByLabel("رمز عبور", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "تکمیل ثبت‌نام و ورود" }).click();
  await expect(page).toHaveURL(/\/home$/);
  const payload = calls.find(c => c.route === "/auth/drivers/register")?.body;
  expect(payload).toMatchObject({ nationalId: "1234567891", vehicleType: "نیسان", services: ["REPAIR"], identityDocument: { token: "b".repeat(64) } });
  expect(payload).not.toHaveProperty("identityDocument.expiresInSeconds");
  expect(calls.some(c => c.route === "/documents")).toBe(true);
});

test("home without a backend session redirects to login", async ({ page }) => {
  await mockBackend(page, makeUser("CUSTOMER"));
  await page.goto("http://localhost:3310/home");
  await expect(page).toHaveURL("http://localhost:3310/");
});

test("towing searches city/street text and a database vehicle, then displays the server estimate", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  const { calls } = await mockBackend(page, user);
  await seedSession(page, user);
  await open(page, "http://localhost:3310/home");
  await page.locator(".main-service-card--transport").click();
  await page.getByRole("button", { name: "فهمیدم", exact: true }).click();
  await page.getByPlaceholder("نام خودرو", { exact: true }).fill("۲۰۶");
  await page.getByRole("option", { name: "پژو ۲۰۶ · گروه اول" }).getByRole("button").click();
  await page.getByPlaceholder("۱۲ ب ۳۴۵ - ۶۷", { exact: true }).fill("12 ب 345 - 67");
  await page.getByRole("combobox", { name: "مبدأ حمل (شهر و خیابان)" }).fill("تهران ولیعصر");
  await page.getByRole("option", { name: "تهران، خیابان ولیعصر" }).getByRole("button").click();
  await page.getByRole("combobox", { name: "مقصد حمل (شهر و خیابان)" }).fill("تهران آزادی");
  await page.getByRole("option", { name: "تهران، خیابان آزادی" }).getByRole("button").click();
  await expect(page.getByRole("status").filter({ hasText: "۲٬۲۰۰٬۰۰۰" })).toBeVisible();
  await expect(page.locator(".map-coords-chip")).toHaveCount(0);
  await page.getByRole("button", { name: "ثبت درخواست خدمت" }).click();
  await expect(page.locator(".waiting-page")).toBeVisible();
  const payload = calls.find(c => c.route === "/requests/towing")?.body;
  expect(payload).toMatchObject({ vehicleModelId: "vm_test206", vehicleName: "پژو ۲۰۶", originPlaceId: "a".repeat(64), destinationPlaceId: "b".repeat(64) });
  expect(payload).not.toHaveProperty("priceToman");
  expect(payload).not.toHaveProperty("problem");
});

test("server rejection keeps the customer on the request form", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  await mockBackend(page, user);
  await page.route(`${endpoint}/requests/repair`, route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Unavailable" }) }));
  await seedSession(page, user);
  await open(page, "http://localhost:3310/home");
  await page.locator(".main-service-card--roadside").click();
  await page.getByRole("button", { name: "فهمیدم", exact: true }).click();
  await page.getByPlaceholder("نام خودرو", { exact: true }).fill("پژو ۲۰۶");
  await page.getByPlaceholder("۱۲ ب ۳۴۵ - ۶۷", { exact: true }).fill("12 ب 345 - 67");
  await page.locator("textarea").first().fill("خودرو روشن نمی‌شود");
  await expect(page.locator(".leaflet-container").first()).toBeVisible();
  await page.getByRole("button", { name: "ثبت درخواست خدمت" }).click();
  await expect(page.getByText("سرویس موقتاً در دسترس نیست؛ دوباره تلاش کنید.", { exact: true })).toBeVisible();
  await expect(page.locator(".waiting-page")).toHaveCount(0);
});

test("expired backend session clears credentials and redirects", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  await mockBackend(page, user);
  await seedSession(page, user);
  await page.route(`${endpoint}/me`, route => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Session expired" }) }));
  await page.goto("http://localhost:3310/home");
  await expect(page).toHaveURL("http://localhost:3310/");
  expect(await page.evaluate(() => localStorage.getItem("khodrochare_customer_session_v2"))).toBeNull();
});

test("accepted customer request restores server distance after reopening", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  await mockBackend(page, user, [{ ...makeRequest(), status: "ACCEPTED", driverId: "DRIVER-user" }]);
  await seedSession(page, user);
  await open(page, "http://localhost:3310/home");
  await expect(page.locator(".waiting-page")).toBeVisible();
  await expect(page.locator(".waiting-timer-digits")).toContainText("۱٫۴");
  await expect(page.locator(".waiting-timer-label")).toHaveText("امدادگر در مسیر شماست");
});

for (const [role, port] of [["CUSTOMER", 3310], ["DRIVER", 3311]] as const) {
  test(`${role} location dialog requests GPS and opens again on returning home`, async ({ page, context }) => {
    const user = makeUser(role);
    await mockBackend(page, user);
    await seedSession(page, user);
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 35.72, longitude: 51.42 });
    await page.goto(`http://localhost:${port}/home`);
    await page.locator(".launch-splash").waitFor({ state: "detached" });
    await expect(page.getByRole("dialog", { name: "دسترسی به موقعیت مکانی" })).toBeVisible();
    await page.getByRole("button", { name: "اجازه دسترسی به موقعیت", exact: true }).click();
    await expect(page.locator("dialog.location-permission")).not.toBeVisible();
    const position = await page.evaluate(() => JSON.parse(sessionStorage.getItem("khodrochare_location_v1") || "null"));
    expect(position.latitude).toBe(35.72);
    await page.getByRole("button", { name: "بازگشت به خانه", exact: true }).click();
    await expect(page.locator("dialog.location-permission")).toBeVisible();
    await dismissLocation(page);
  });
  test(`${role} cookie session restores login without a saved bearer token`, async ({ page }) => {
    const { state } = await mockBackend(page, makeUser(role));
    state.cookieAuthenticated = true;
    await page.goto(`http://localhost:${port}/`);
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("dialog.location-permission")).toBeVisible();
    const session = await page.evaluate(role => JSON.parse(localStorage.getItem(`khodrochare_${role.toLowerCase()}_session_v2`) || "null"), role);
    expect(session.user.role).toBe(role);
    expect(session.token).toBe("");
  });
}

test("driver service choices and complete Iran flag fit on mobile", async ({ page }, info) => {
  await mockBackend(page, makeUser("DRIVER"));
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "http://localhost:3311/register");
  await expect(page.locator(".plate-flag img")).toHaveAttribute("src", "/iran-flag.svg");
  expect(await page.locator(".plate-flag img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.locator(".service-picker").scrollIntoViewIfNeeded();
  await expect(page.locator(".service-picker-item")).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator(".service-picker").screenshot({ path: info.outputPath("driver-services-mobile.png") });
});

test("repair payment includes approved parts and reports a transfer without marking it paid", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const user = makeUser('CUSTOMER');
  const request = { ...makeRequest(), status: 'ARRIVED', driverId: 'DRIVER-user', partsQuoteToman: 200000, partsQuoteVersion: 1, partsApprovedToman: null };
  const { state, calls } = await mockBackend(page, user, [request]);
  await seedSession(page, user);
  await open(page, 'http://localhost:3310/home');
  await page.getByRole('button', { name: 'تأیید هزینه قطعات', exact: true }).click();
  await expect.poll(() => state.requests[0].partsApprovedToman).toBe(200000);
  await page.locator('.pay-button').click();
  const dialog = page.getByRole('dialog', { name: 'پرداخت کارت‌به‌کارت' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.bank-card-number')).toHaveText('6219 8614 3578 9192');
  await expect(dialog.getByText('حساب خودرو چاره', { exact: true })).toBeVisible();
  await expect(dialog.locator('.payment-breakdown')).toContainText('۱٬۰۰۰٬۰۰۰ تومان');
  await expect(dialog.locator('.payment-breakdown')).toContainText('۳۰۰٬۰۰۰ تومان');
  await expect(dialog.locator('.payment-breakdown')).toContainText('۷۰۰٬۰۰۰ تومان');
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await dialog.screenshot({ path: info.outputPath('payment-mobile.png') });
  await dialog.getByLabel('شماره پیگیری واریز').fill('123456789012');
  await dialog.getByLabel('زمان واریز').fill('2026-10-20T14:30');
  await dialog.getByRole('button', { name: 'ثبت اطلاعات واریز', exact: true }).click();
  await expect(dialog.getByText('واریز اعلام شده؛ در انتظار بررسی', { exact: true })).toBeVisible();
  expect(state.payment?.status).toBe('SUBMITTED');
  expect(calls.find(c => c.route.endsWith('/payment/report'))?.body).toMatchObject({ bankReference: '123456789012' });
});

test("driver can send an inspected parts quote for customer approval", async ({ page }) => {
  const user = makeUser('DRIVER');
  const { calls, state } = await mockBackend(page, user, [{ ...makeRequest(), status: 'ARRIVED', driverId: user.id }]);
  await seedSession(page, user);
  await open(page, 'http://localhost:3311/home');
  await page.getByRole('button', { name: 'باز کردن منو', exact: true }).click();
  await page.locator('.drawer-nav button').filter({ hasText: 'بارهای من' }).click();
  await page.getByRole('tab', { name: /در حال انجام/ }).click();
  await page.getByRole('button', { name: /ادامه.*بار/ }).click();
  await page.getByLabel('مبلغ قطعات (تومان)').fill('۲۰۰۰۰۰');
  await page.getByRole('button', { name: 'ارسال هزینه قطعات', exact: true }).click();
  await expect.poll(() => state.requests[0].partsQuoteToman).toBe(200000);
  expect(calls.find(c => c.route.endsWith('/parts-quote'))?.body).toEqual({ amountToman: 200000 });
});

test("completed request payment remains accessible from history after reopening", async ({ page }) => {
  const user = makeUser('CUSTOMER');
  await mockBackend(page, user, [{ ...makeRequest(), status: 'COMPLETED', driverId: 'DRIVER-user', partsQuoteToman: 0, partsApprovedToman: 0, partsQuoteVersion: 1 }]);
  await seedSession(page, user);
  await open(page, 'http://localhost:3310/home');
  await page.getByRole('button', { name: 'باز کردن منو', exact: true }).click();
  await page.locator('.drawer-nav button').filter({ hasText: 'تاریخچه' }).click();
  await page.getByRole('button', { name: 'گزینه‌ها', exact: true }).click();
  await page.locator('.pay-button').click();
  const dialog = page.getByRole('dialog', { name: 'پرداخت کارت‌به‌کارت' });
  await expect(dialog.locator('.payment-breakdown')).toContainText('۸۰۰٬۰۰۰ تومان');
  await expect(dialog.locator('.payment-breakdown')).toContainText('۲۴۰٬۰۰۰ تومان');
  await dialog.getByRole('button', { name: 'بستن', exact: true }).click();
  await page.getByRole('button', { name: 'بازگشت', exact: true }).click();
  await expect(page.locator('dialog.location-permission')).toBeVisible();
});
