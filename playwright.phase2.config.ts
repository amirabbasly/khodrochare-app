import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'performance-phase2.spec.ts',outputDir:'performance-results/phase2-run',snapshotPathTemplate:'{testDir}/../performance-results/phase2-baseline/{testFilePath}/{arg}{ext}',timeout:90000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'}});
