import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'operator-locations.spec.ts',outputDir:'location-test-results',timeout:45000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'}});
