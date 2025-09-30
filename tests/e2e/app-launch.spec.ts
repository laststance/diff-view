import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('Electron app launches and closes successfully', async () => {
  // Launch Electron app in headless mode
  const electronApp = await electron.launch({
    args: ['.'],
    cwd: process.cwd(),
    headless: true,
  });

  // Verify the app launched
  expect(electronApp).toBeTruthy();

  // Wait for the app to be ready
  await electronApp.evaluate(async ({ app }) => {
    return app.whenReady();
  });

  // Verify we can get the app name
  const appName = await electronApp.evaluate(async ({ app }) => {
    return app.getName();
  });

  expect(appName).toBeTruthy();

  // Close the app
  await electronApp.close();
});

test('Electron app basic functionality', async () => {
  // Launch Electron app in headless mode
  const electronApp = await electron.launch({
    args: ['.'],
    cwd: process.cwd(),
    headless: true,
  });

  // Wait for the app to be ready
  await electronApp.evaluate(async ({ app }) => {
    return app.whenReady();
  });

  // Verify the app is ready
  const isReady = await electronApp.evaluate(async ({ app }) => {
    return app.isReady();
  });

  expect(isReady).toBe(true);

  // Close the app
  await electronApp.close();
});
