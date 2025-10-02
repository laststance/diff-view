import { test, expect } from '@playwright/test';

import { launchElectronApp } from './helpers/launchElectronApp';

test('Electron app launches and closes successfully', async () => {
  const electronApp = await launchElectronApp();

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
  // Launch Electron app in controlled test mode
  const electronApp = await launchElectronApp();

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
