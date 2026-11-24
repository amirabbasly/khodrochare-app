import {defineConfig,devices} from '@playwright/test';
const port=Number(process.env.HALL_E2E_PORT||3310);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid HALL_E2E_PORT');
export default defineConfig({
  testDir:'./tests',testMatch:'onsite.spec.ts',timeout:45000,workers:1,
  use:{...devices['Desktop Chrome'],channel:process.env.PLAYWRIGHT_EXECUTABLE_PATH?undefined:'chrome',launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{},trace:'retain-on-failure'},
  webServer:process.env.HALL_E2E_EXTERNAL_SERVER==='1'?undefined:{command:`node node_modules/next/dist/bin/next start --port ${port}`,url:`http://localhost:${port}`,reuseExistingServer:!process.env.CI,timeout:120000},
});
