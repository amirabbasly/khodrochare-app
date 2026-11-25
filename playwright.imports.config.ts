import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
export default defineConfig({...base,testMatch:'imports.spec.ts',outputDir:'service-update-test-results/imports'});
