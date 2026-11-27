import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
export default defineConfig({...base,testMatch:['wallet-clarity.spec.ts','wallet.spec.ts'],outputDir:'wallet-test-results/clarity',timeout:60000});
