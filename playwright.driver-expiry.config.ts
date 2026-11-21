import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'driver-expiry.spec.ts',outputDir:'driver-expiry-results',timeout:60000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'}});
