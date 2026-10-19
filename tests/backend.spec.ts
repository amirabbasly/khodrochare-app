import { test, expect, type Page } from "@playwright/test";

const endpoint = "https://api.khodrochare.ir/api/v1";
const makeUser = (role: "CUSTOMER" | "DRIVER") => ({ id: `${role}-user`, role, fullName: role === "CUSTOMER" ? "کاربر آزمایشی" : "امدادگر آزمایشی", phone: "09121234567", nationalId: "1234567891", services: ["REPAIR", "TOWING"], vehicleType: "نیسان", vehiclePlate: "12 ب 345 - 67", identityDocumentId: role === "DRIVER" ? "document-id" : null, vehicles: [] });
type TestUser = ReturnType<typeof makeUser>;
type TestRequest = { id: string; status: string; service: string; customerId: string; driverId: string | null; vehicleName: string; vehiclePlate: string; originLat: number; originLng: number; destinationLat: number | null; destinationLng: number | null; distanceMeters: number | null; priceToman: number | null; problem: string | null; createdAt: string; updatedAt: string };
function makeRequest(): TestRequest {
  return { id: "request-1", status: "PENDING", service: "REPAIR", customerId: "CUSTOMER-user", driverId: null, vehicleName: "پژو ۲۰۶", vehiclePlate: "12 ب 345 - 67", originLat: 35.7, originLng: 51.4, destinationLat: null, destinationLng: null, distanceMeters: null, priceToman: null, problem: "خودرو روشن نمی‌شود", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
async function mockBackend(page: Page, user: TestUser, seed: TestRequest[] = []) {
  const calls: { route: string; method: string; body: Record<string, unknown> | null }[] = [];
  const state = { requests: seed, gps: false };
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
    if (suffix !== "/documents" && req.headers().authorization !== `Bearer ${"a".repeat(64)}`) return send({ error: "Authentication required" }, 401);
    if (suffix === "/me") return send(user);
    if (suffix === "/documents") return send({ id: "c9a7152f-41d8-4fc5-a69c-6ae71152d474", token: "b".repeat(64), expiresInSeconds: 86400 }, 201);
    if (suffix === "/drivers/location") { state.gps = true; return send({ recordedAt: new Date().toISOString() }); }
    if (suffix === "/drivers/requests/available") return send(state.requests.filter(r => r.status === "PENDING").map(r => ({ id: r.id, service: r.service, vehicleName: r.vehicleName, originLat: r.originLat, originLng: r.originLng, destinationLat: r.destinationLat, destinationLng: r.destinationLng, distanceMeters: r.distanceMeters, priceToman: r.priceToman, createdAt: r.createdAt })));
    if (suffix === "/requests") return send(user.role === "DRIVER" ? state.requests.filter(r => r.driverId === user.id) : state.requests);
    if (suffix === "/requests/repair" || suffix === "/requests/towing") {
      const request = { ...makeRequest(), service: suffix.endsWith("towing") ? "TOWING" : "REPAIR", vehicleName: String(body!.vehicleName), vehiclePlate: String(body!.vehiclePlate) };
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

test("towing submits destination to its separate route", async ({ page }) => {
  const user = makeUser("CUSTOMER");
  const { calls } = await mockBackend(page, user);
  await seedSession(page, user);
  await open(page, "http://localhost:3310/home");
  await page.locator(".main-service-card--transport").click();
  await page.getByRole("button", { name: "فهمیدم", exact: true }).click();
  await page.getByPlaceholder("نام خودرو", { exact: true }).fill("تارا");
  await page.getByPlaceholder("۱۲ ب ۳۴۵ - ۶۷", { exact: true }).fill("12 ب 345 - 67");
  await expect(page.locator(".leaflet-container")).toHaveCount(2);
  await page.locator(".map-canvas").nth(1).click({ position: { x: 190, y: 100 } });
  await page.getByRole("button", { name: "ثبت درخواست خدمت" }).click();
  await expect(page.locator(".waiting-page")).toBeVisible();
  const payload = calls.find(c => c.route === "/requests/towing")?.body;
  expect(payload).toMatchObject({ vehicleName: "تارا", vehiclePlate: "12 ب 345 - 67", destination: { latitude: expect.any(Number), longitude: expect.any(Number) } });
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
