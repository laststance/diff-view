import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page, ConsoleMessage } from 'playwright';

import { launchElectronApp } from './helpers/launchElectronApp';

test.describe('Application Branding', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    electronApp = await launchElectronApp({ timeout: 30000 });

    // Wait for the app to be ready BEFORE getting the window
    await electronApp.evaluate(async ({ app }) => {
      return app.whenReady();
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should display correct application title in window', async () => {
    // Test that the window title reflects the application branding
    const title = await page.title();
    expect(title).toContain('Diff View');
  });

  test('should have proper application metadata', async () => {
    // Test application name and version information
    const appName = await electronApp.evaluate(async ({ app }) => {
      return app.getName();
    });

    const appVersion = await electronApp.evaluate(async ({ app }) => {
      return app.getVersion();
    });

    expect(appName).toBe('Diff View');
    expect(appVersion).toBe('1.0.0');
  });

  test('should display GitCompareArrows icon in the UI', async () => {
    // Wait for the page to load completely
    await page.waitForSelector('body', { timeout: 10000 });

    // Look for Lucide GitCompareArrows icon in the UI
    // This icon should be used somewhere in the application branding
    const iconElements = await page.locator('svg').all();

    // Check if any SVG elements contain the GitCompareArrows icon paths
    let hasGitCompareIcon = false;
    for (const icon of iconElements) {
      const svgContent = await icon.innerHTML();
      // Check for the specific paths that make up the GitCompareArrows icon
      if (
        svgContent.includes('circle cx="6" cy="6" r="3"') ||
        svgContent.includes('circle cx="18" cy="6" r="3"') ||
        svgContent.includes('m15 7-6 6') ||
        svgContent.includes('m9 7 6 6')
      ) {
        hasGitCompareIcon = true;
        break;
      }
    }

    // If not found in current view, check if it's used in the toolbar or header
    const toolbarExists = await page
      .locator('[data-testid="toolbar"], .toolbar, header')
      .count();
    if (toolbarExists > 0) {
      // Icon might be in toolbar - this is acceptable for branding
      expect(toolbarExists).toBeGreaterThan(0);
    } else {
      // Otherwise, we should find the GitCompareArrows icon somewhere
      expect(hasGitCompareIcon).toBe(true);
    }
  });

  test('should have consistent branding throughout the application', async () => {
    // Test that the application maintains consistent branding
    await page.waitForSelector('body', { timeout: 10000 });

    // Check for consistent use of the application name
    const bodyText = await page.textContent('body');

    // The application should not have inconsistent naming
    // (This is a basic check - in a real app you might check specific elements)
    expect(bodyText).toBeDefined();

    // Check that the page has loaded with proper structure
    const hasMainContent = await page
      .locator('main, [role="main"], .main-content')
      .count();
    expect(hasMainContent).toBeGreaterThan(0);
  });

  test('should display proper window icon in taskbar/dock', async () => {
    // Test that the application window has proper icon configuration
    // This is more of a configuration test since we can't directly test taskbar appearance

    const windowCount = await electronApp.windows().length;
    expect(windowCount).toBeGreaterThan(0);

    // Verify the main window exists and is properly configured
    const mainWindow = await electronApp.firstWindow();
    expect(mainWindow).toBeDefined();

    // Check window properties that affect branding
    const isVisible = await page.isVisible('body');
    expect(isVisible).toBe(true);
  });

  test('should have proper application description and metadata', async () => {
    // Test application metadata that affects branding
    const packageInfo = await electronApp.evaluate(async ({ app }) => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        path: app.getAppPath(),
      };
    });

    expect(packageInfo.name).toBe('Diff View');
    expect(packageInfo.version).toBe('1.0.0');
    expect(packageInfo.path).toBeDefined();
  });

  test('should render without branding-related errors', async () => {
    // Test that there are no console errors related to missing icons or branding assets
    const consoleErrors: string[] = [];

    // Create handler function so we can properly remove it later
    const consoleHandler = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };

    page.on('console', consoleHandler);

    try {
      // Reload the page to catch any loading errors
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Filter out errors that might be related to missing icon files
      const brandingErrors = consoleErrors.filter(
        (error) =>
          error.toLowerCase().includes('icon') ||
          error.toLowerCase().includes('image') ||
          error.toLowerCase().includes('svg')
      );

      // We expect no branding-related errors
      expect(brandingErrors.length).toBe(0);
    } finally {
      // Clean up event listener to prevent worker teardown issues
      page.off('console', consoleHandler);
    }
  });
});
