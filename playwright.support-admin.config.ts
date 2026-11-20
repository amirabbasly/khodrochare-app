import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'support-admin.spec.ts',timeout:30000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'}});
