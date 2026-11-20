import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'hall-navigation.spec.ts',outputDir:'performance-results/hall-ux-run',timeout:60000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'}});
