import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:['fleet-updates.spec.ts','driver-zoom.spec.ts'],outputDir:'fleet-test-results',timeout:40000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'}});
