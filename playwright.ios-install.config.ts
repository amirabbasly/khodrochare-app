import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';
export default defineConfig({testDir:'./tests',testMatch:'ios-install.spec.ts',outputDir:'ios-install-test-results',timeout:45000,workers:1,use:{...devices['Desktop Chrome'],channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'},webServer:[
 {command:'node node_modules/next/dist/bin/next start --port 3374',url:'http://localhost:3374',timeout:120000,reuseExistingServer:!process.env.CI},
 {command:'node node_modules/next/dist/bin/next start --port 3375',cwd:path.resolve(__dirname,'../khodrochare-driver'),url:'http://localhost:3375',timeout:120000,reuseExistingServer:!process.env.CI}
]});
