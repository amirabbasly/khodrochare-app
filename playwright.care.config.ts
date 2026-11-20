import {defineConfig,devices} from '@playwright/test';
process.env.HALL_E2E_PORT ||= '3320';
const port=Number(process.env.HALL_E2E_PORT);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid HALL_E2E_PORT');
export default defineConfig({testDir:'./tests',testMatch:['hall.spec.ts','customer-care.spec.ts','app-zoom.spec.ts','session-startup.spec.ts'],timeout:45000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'},webServer:process.env.CARE_EXTERNAL_SERVER==='1'?undefined:{command:`node node_modules/next/dist/bin/next start --port ${port}`,url:`http://localhost:${port}`,reuseExistingServer:false,timeout:120000}});
