import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'hall.spec.ts',timeout:45000,workers:1,
  use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'},
  webServer:{command:'node node_modules/next/dist/bin/next start --port 3310',url:'http://localhost:3310',reuseExistingServer:!process.env.CI,timeout:120000},
});
