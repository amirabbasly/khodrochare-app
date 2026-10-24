import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  workers: 1,
  use: { ...devices["Desktop Chrome"], channel: "chrome", trace: "retain-on-failure" },
  webServer: [
    { command: "node node_modules/next/dist/bin/next start --port 3312", cwd: path.resolve(__dirname, "../khodrochare-admin"), env: { ADMIN_API_BASE_URL: 'http://127.0.0.1:4198/api/v1' }, url: "http://localhost:3312", reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: "node node_modules/next/dist/bin/next start --port 3310", url: "http://localhost:3310", reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: "node node_modules/next/dist/bin/next start --port 3311", cwd: path.resolve(__dirname, "../khodrochare-driver"), url: "http://localhost:3311", reuseExistingServer: !process.env.CI, timeout: 120000 },
  ],
});
