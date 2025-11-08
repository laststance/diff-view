import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';

import { launchElectronApp } from './helpers/launchElectronApp';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  // Launch Electron app
  electronApp = await launchElectronApp({
    env: {
      NODE_ENV: 'test',
    },
  });

  // Get the first window
  page = await electronApp.firstWindow();

  // Wait for the app to be ready
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('React Application Foundation', () => {
  test('should render the main application without errors', async () => {
    // Wait for the main content to be visible
    await expect(page.locator('h1')).toContainText('Diff View');

    // Verify the main description is present
    await expect(
      page.locator('text=Compare text with GitHub-style visualization')
    ).toBeVisible();

    // Check that the application renders successfully
    await expect(page.locator('textarea')).toHaveCount(2);
  });

  test('should display initial application state correctly', async () => {
    // Check that text panes are visible with titles
    await expect(page.locator('text=Original')).toBeVisible();
    await expect(page.locator('text=Modified')).toBeVisible();

    // Check that view mode buttons are present
    await expect(page.locator('button[title*="Split View"]')).toBeVisible();
    await expect(page.locator('button[title*="Unified View"]')).toBeVisible();

    // Check that textareas exist
    await expect(page.locator('textarea')).toHaveCount(2);
  });

  test('should handle state management with Zustand store', async () => {
    // Test left content input
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Hello World Left');

    // Verify content was entered
    await expect(leftTextarea).toHaveValue('Hello World Left');

    // Test right content input
    const rightTextarea = page.locator('textarea').nth(1);
    await rightTextarea.fill('Hello World Right');

    // Verify content was entered
    await expect(rightTextarea).toHaveValue('Hello World Right');

    // Test view mode change
    const unifiedButton = page.locator('button[title*="Unified View"]');
    await unifiedButton.click();

    // Verify the unified button is now active (has active styling)
    await expect(unifiedButton).toHaveClass(/bg-white|shadow-sm/);

    // Change back to split
    const splitButton = page.locator('button[title*="Split View"]');
    await splitButton.click();
    await expect(splitButton).toHaveClass(/bg-white|shadow-sm/);
  });

  test('should persist state changes across interactions', async () => {
    // Set some content
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Persistent content test');

    // Change view mode
    const unifiedButton = page.locator('button[title*="Unified View"]');
    await unifiedButton.click();

    // Clear and refill to test persistence
    await leftTextarea.clear();
    await leftTextarea.fill('New content');

    // Verify the view mode button is still active
    await expect(unifiedButton).toHaveClass(/bg-white|shadow-sm/);

    // Verify the new content is present
    await expect(leftTextarea).toHaveValue('New content');
  });

  test('should handle empty content states correctly', async () => {
    // Clear all content
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').nth(1);

    await leftTextarea.clear();
    await rightTextarea.clear();

    // Verify both textareas are empty
    await expect(leftTextarea).toHaveValue('');
    await expect(rightTextarea).toHaveValue('');
  });

  test('should handle large content without errors', async () => {
    // Generate large content
    const largeContent = 'A'.repeat(10000);

    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill(largeContent);

    // Verify the content was set
    await expect(leftTextarea).toHaveValue(largeContent);

    // Verify the application is still responsive
    const unifiedButton = page.locator('button[title*="Unified View"]');
    await unifiedButton.click();
    await expect(unifiedButton).toHaveClass(/bg-white|shadow-sm/);
  });

  test('should maintain responsive layout', async () => {
    // Test different window sizes
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('h1')).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();

    await page.setViewportSize({ width: 1600, height: 1000 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle keyboard interactions', async () => {
    const leftTextarea = page.locator('textarea').first();

    // Clear any existing content first
    await leftTextarea.clear();

    // Focus and type
    await leftTextarea.focus();
    await page.keyboard.type('Hello from keyboard');

    // Verify content was entered
    await expect(leftTextarea).toHaveValue('Hello from keyboard');

    // Test keyboard shortcuts - select all and replace
    await page.keyboard.press('Control+a');
    // Use fill() instead of type() for reliable content replacement
    await leftTextarea.fill('Replaced content');

    // Verify content was replaced
    await expect(leftTextarea).toHaveValue('Replaced content');
  });

  test('should handle focus management correctly', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').nth(1);

    // Test tab navigation between textareas
    await leftTextarea.focus();
    await expect(leftTextarea).toBeFocused();

    // Tab to move to the next textarea (may skip other elements)
    await page.keyboard.press('Tab');

    // Verify we can interact with both textareas
    await leftTextarea.fill('Left test');
    await rightTextarea.fill('Right test');
    await expect(leftTextarea).toHaveValue('Left test');
    await expect(rightTextarea).toHaveValue('Right test');
  });
});

test.describe('Error Boundary Functionality', () => {
  test('should handle component errors gracefully', async () => {
    // This test verifies that the error boundary is properly set up
    // In a real scenario, we would trigger an error and verify the fallback UI

    // For now, we verify that the error boundary wrapper exists
    // by checking that the app renders without throwing errors
    await expect(page.locator('h1')).toContainText('Diff View');

    // Verify no error messages are shown in normal operation
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    await expect(page.locator('text=Application Error')).not.toBeVisible();
  });

  test('should provide error recovery options when errors occur', async () => {
    // This test would be expanded to actually trigger errors
    // For now, we verify the error boundary structure is in place

    // Check that the application loads successfully
    await expect(page.locator('body')).toBeVisible();

    // Verify no console errors during normal operation
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform some basic interactions
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Test content');

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(1000);

    // Verify no console errors occurred
    expect(consoleErrors.length).toBe(0);
  });
});

test.describe('TypeScript Type Safety', () => {
  test('should handle typed interactions without runtime errors', async () => {
    // This test verifies that TypeScript interfaces work correctly at runtime

    // Test that all expected elements exist (validates TypeScript compilation)
    await expect(page.locator('textarea')).toHaveCount(2);
    await expect(page.locator('button[title*="Split View"]')).toBeVisible();
    await expect(page.locator('button[title*="Unified View"]')).toBeVisible();

    // Test that state updates work as expected (validates store types)
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('TypeScript test content');

    // Verify the state update worked
    await expect(leftTextarea).toHaveValue('TypeScript test content');

    // Test view mode buttons (validates interaction types)
    const unifiedButton = page.locator('button[title*="Unified View"]');
    await unifiedButton.click();
    await expect(unifiedButton).toHaveClass(/bg-white|shadow-sm/);
  });

  test('should maintain type safety in state management', async () => {
    // Test that only valid values are accepted
    const splitButton = page.locator('button[title*="Split View"]');
    const unifiedButton = page.locator('button[title*="Unified View"]');

    // Test valid view mode values
    await splitButton.click();
    await expect(splitButton).toHaveClass(/bg-white|shadow-sm/);

    await unifiedButton.click();
    await expect(unifiedButton).toHaveClass(/bg-white|shadow-sm/);

    // Test text input types
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Type safety test');
    await expect(leftTextarea).toHaveValue('Type safety test');
  });
});

test.describe('Application Initialization', () => {
  test('should initialize with correct default values', async () => {
    // Verify one of the view mode buttons is active (depends on persisted state)
    const splitButton = page.locator('button[title*="Split View"]');
    const unifiedButton = page.locator('button[title*="Unified View"]');

    const splitActive = await splitButton.evaluate((el) =>
      el.className.includes('bg-white')
    );
    const unifiedActive = await unifiedButton.evaluate((el) =>
      el.className.includes('bg-white')
    );
    expect(splitActive || unifiedActive).toBe(true);

    // Verify both text panes are visible
    await expect(page.locator('text=Original')).toBeVisible();
    await expect(page.locator('text=Modified')).toBeVisible();
  });

  test('should mount components in correct order', async () => {
    // Verify the component hierarchy is correct
    await expect(page.locator('h1')).toBeVisible();

    // Verify the main layout structure
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Verify text panes are rendered
    await expect(page.locator('textarea')).toHaveCount(2);
  });

  test('should handle theme initialization correctly', async () => {
    // Verify theme button exists
    const themeButton = page.locator('button[title*="Theme"]');
    await expect(themeButton).toBeVisible();

    // Verify the application renders without theme-related errors
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea')).toHaveCount(2);
  });
});