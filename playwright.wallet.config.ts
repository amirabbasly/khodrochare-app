import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
export default defineConfig({...base,testMatch:'wallet.spec.ts',outputDir:'wallet-test-results'});
