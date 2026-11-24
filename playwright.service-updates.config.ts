import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';
export default defineConfig({testDir:'./tests',testMatch:'service-updates.spec.ts',outputDir:'service-update-test-results',timeout:60000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'},webServer:[
 {command:'node node_modules/next/dist/bin/next start --port 3384',url:'http://localhost:3384',timeout:120000,reuseExistingServer:!process.env.CI},
 {command:'node node_modules/next/dist/bin/next start --port 3385',cwd:path.resolve(__dirname,'../khodrochare-driver'),url:'http://localhost:3385',timeout:120000,reuseExistingServer:!process.env.CI},
 {command:'node ../node_modules/next/dist/bin/next start --port 3386',cwd:path.resolve(__dirname,'../khodrochare-operator-panel/frontend'),url:'http://localhost:3386',timeout:120000,reuseExistingServer:!process.env.CI}
]});

