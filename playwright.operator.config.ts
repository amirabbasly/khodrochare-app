import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';
export default defineConfig({testDir:'./tests',testMatch:'operator-panel.spec.ts',timeout:45000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',trace:'retain-on-failure'},webServer:{command:'node ../node_modules/next/dist/bin/next start --port 3350',cwd:path.resolve(__dirname,'../khodrochare-operator-panel/frontend'),url:'http://localhost:3350',reuseExistingServer:!process.env.CI,timeout:120000}});
