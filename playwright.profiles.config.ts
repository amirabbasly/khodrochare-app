import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';
export default defineConfig({testDir:'./tests',testMatch:'profile-editing.spec.ts',outputDir:'profile-test-results',timeout:60000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'},webServer:[
 {command:'node node_modules/next/dist/bin/next start --port 3364',url:'http://localhost:3364',timeout:120000,reuseExistingServer:!process.env.CI},
 {command:'node node_modules/next/dist/bin/next start --port 3365',cwd:path.resolve(__dirname,'../khodrochare-driver'),url:'http://localhost:3365',timeout:120000,reuseExistingServer:!process.env.CI},
 {command:'node ../node_modules/next/dist/bin/next start --port 3366',cwd:path.resolve(__dirname,'../khodrochare-operator-panel/frontend'),url:'http://localhost:3366',timeout:120000,reuseExistingServer:!process.env.CI}
]});
