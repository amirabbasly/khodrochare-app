import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
// The shared customer server in this suite runs on 3384.
process.env.HALL_E2E_PORT='3384';
export default defineConfig({...base,testMatch:['driver-affiliation.spec.ts','runtime-resilience.spec.ts','showrooms.spec.ts','wallet.spec.ts','service-updates.spec.ts','onsite.spec.ts','session-startup.spec.ts'],outputDir:'service-update-test-results/resilience',timeout:90000});
