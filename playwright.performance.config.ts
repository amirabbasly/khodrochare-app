import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'performance.spec.ts',outputDir:'performance-results/run',snapshotPathTemplate:'{testDir}/../performance-results/baseline/{testFilePath}/{arg}{ext}',timeout:60000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'}});
