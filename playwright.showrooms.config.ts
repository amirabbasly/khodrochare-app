import {defineConfig} from '@playwright/test';
import base from './playwright.service-updates.config';
export default defineConfig({...base,testMatch:'showrooms.spec.ts',outputDir:'service-update-test-results/showrooms',timeout:90000});
