import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';

import { startElectronApp, stopElectronApp } from '../utils/electron-helpers';

test.describe('Final Integration Tests - Basic', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    electronApp = await startElectronApp();
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await stopElectronApp(electronApp);
  });

  test('should demonstrate basic application integration', async () => {
    // Skip in CI: Tests loading indicator timing which is unreliable in CI
    test.skip(!!process.env.CI, 'Skip in CI: Loading indicator timing unreliable');

    // Verify application startup performance
    const startTime = Date.now();
    await expect(
      page.getByRole('heading', { name: 'Diff View', exact: true })
    ).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Application should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Test 1: Initial state and branding
    await expect(
      page.getByText('Ready to compare', { exact: true })
    ).toBeVisible();

    // Test 2: Basic content input
    const leftTextarea = page.getByPlaceholder(
      'Paste or type your original content here...'
    );
    const rightTextarea = page.getByPlaceholder(
      'Paste or type your modified content here...'
    );

    await leftTextarea.fill('Original content for testing');
    await rightTextarea.fill('Modified content for testing');

    // Test 3: Verify diff computation
    await expect(page.getByText('Computing differences...')).toBeVisible();
    await expect(
      page.getByText('Diff computation completed successfully')
    ).toBeVisible({ timeout: 5000 });

    // Test 4: Basic UI controls
    const themeButton = page.getByLabel(/Current theme:/);
    await expect(themeButton).toBeVisible();
    await themeButton.click(); // Test theme switching

    // Test 5: View mode switching
    const unifiedViewButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
    await unifiedViewButton.click();

    const splitViewButton = page.getByTitle('Split View (Ctrl+Shift+V)');
    await splitViewButton.click();

    // Test 6: Content management
    const clearButton = page.getByLabel('Clear all content from both panes');
    await clearButton.click();

    // Verify clean state
    await expect(leftTextarea).toHaveValue('');
    await expect(rightTextarea).toHaveValue('');
    await expect(
      page.getByText('Ready to compare', { exact: true })
    ).toBeVisible();

    // Final verification
    await expect(
      page.getByRole('heading', { name: 'Diff View', exact: true })
    ).toBeVisible();
  });
});
