import {defineConfig,devices} from '@playwright/test';
const port=3336;
export default defineConfig({testDir:'./tests',testMatch:['customer-auth.spec.ts'],workers:1,timeout:45000,outputDir:'performance-results/customer-auth',use:{...devices['Desktop Chrome'],channel:'chrome',baseURL:`http://localhost:${port}`,serviceWorkers:'block',trace:'retain-on-failure'},webServer:process.env.AUTH_EXTERNAL_SERVER==='1'?undefined:{command:`node node_modules/next/dist/bin/next start --port ${port}`,url:`http://localhost:${port}`,reuseExistingServer:false}});
