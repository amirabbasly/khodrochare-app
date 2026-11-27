import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
export default defineConfig({...base,testMatch:'account-deletion.spec.ts',webServer:Array.isArray(base.webServer)?base.webServer.slice(2):base.webServer,outputDir:'service-update-test-results/account-deletion',timeout:60000});
