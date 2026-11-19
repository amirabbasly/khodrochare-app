import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'hall.spec.ts',timeout:45000,workers:1,
  use:{...devices['Desktop Chrome'],channel:process.env.PLAYWRIGHT_EXECUTABLE_PATH?undefined:'chrome',launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{},trace:'retain-on-failure'},
  webServer:process.env.HALL_E2E_EXTERNAL_SERVER==='1'?undefined:{command:'node node_modules/next/dist/bin/next start --port 3310',url:'http://localhost:3310',reuseExistingServer:!process.env.CI,timeout:120000},
});
