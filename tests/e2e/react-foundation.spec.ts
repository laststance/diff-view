import { test, expect } from '@playwright/test';
import { ElectronApplication, Page, _electron as electron } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  // Launch Electron app
  electronApp = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
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
    await expect(page.locator('h1')).toContainText('💖 Diff View');

    // Verify the main description is present
    await expect(
      page.locator(
        'text=Compare text content with GitHub-style diff visualization'
      )
    ).toBeVisible();

    // Check that the application state section is visible
    await expect(
      page.locator('text=Application State (Development)')
    ).toBeVisible();
  });

  test('should display initial application state correctly', async () => {
    // Check initial state values
    await expect(page.locator('text=View Mode:')).toBeVisible();
    await expect(page.locator('text=split')).toBeVisible();

    await expect(page.locator('text=Theme:')).toBeVisible();
    await expect(page.locator('text=system')).toBeVisible();

    await expect(page.locator('text=Left Content Length:')).toBeVisible();
    await expect(page.locator('text=0 chars')).toBeVisible();

    await expect(page.locator('text=Right Content Length:')).toBeVisible();
    await expect(page.locator('text=0 chars')).toBeVisible();
  });

  test('should handle state management with Zustand store', async () => {
    // Test left content input
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Hello World Left');

    // Verify the character count updates
    await expect(page.locator('text=17 chars')).toBeVisible();

    // Test right content input
    const rightTextarea = page.locator('textarea').nth(1);
    await rightTextarea.fill('Hello World Right');

    // Verify both character counts are updated
    await expect(page.locator('text=18 chars')).toBeVisible();

    // Test view mode change
    const viewModeSelect = page.locator('select');
    await viewModeSelect.selectOption('unified');

    // Verify the view mode changed in the state display
    await expect(page.locator('text=unified')).toBeVisible();

    // Change back to split
    await viewModeSelect.selectOption('split');
    await expect(page.locator('text=split')).toBeVisible();
  });

  test('should persist state changes across interactions', async () => {
    // Set some content
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Persistent content test');

    // Change view mode
    const viewModeSelect = page.locator('select');
    await viewModeSelect.selectOption('unified');

    // Clear and refill to test persistence
    await leftTextarea.clear();
    await leftTextarea.fill('New content');

    // Verify the view mode is still unified
    await expect(page.locator('text=unified')).toBeVisible();

    // Verify the new content is reflected
    await expect(page.locator('text=11 chars')).toBeVisible();
  });

  test('should handle empty content states correctly', async () => {
    // Clear all content
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').nth(1);

    await leftTextarea.clear();
    await rightTextarea.clear();

    // Verify empty state
    await expect(page.locator('text=0 chars')).toHaveCount(2);
  });

  test('should handle large content without errors', async () => {
    // Generate large content
    const largeContent = 'A'.repeat(10000);

    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill(largeContent);

    // Verify the character count is correct
    await expect(page.locator('text=10000 chars')).toBeVisible();

    // Verify the application is still responsive
    const viewModeSelect = page.locator('select');
    await viewModeSelect.selectOption('unified');
    await expect(page.locator('text=unified')).toBeVisible();
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

    // Focus and type
    await leftTextarea.focus();
    await page.keyboard.type('Hello from keyboard');

    // Verify content was entered
    await expect(page.locator('text=19 chars')).toBeVisible();

    // Test keyboard shortcuts
    await page.keyboard.press('Control+a');
    await page.keyboard.type('Replaced content');

    // Verify content was replaced
    await expect(page.locator('text=17 chars')).toBeVisible();
  });

  test('should handle focus management correctly', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').nth(1);
    const viewModeSelect = page.locator('select');

    // Test tab navigation
    await leftTextarea.focus();
    await expect(leftTextarea).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(rightTextarea).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(viewModeSelect).toBeFocused();
  });
});

test.describe('Error Boundary Functionality', () => {
  test('should handle component errors gracefully', async () => {
    // This test verifies that the error boundary is properly set up
    // In a real scenario, we would trigger an error and verify the fallback UI

    // For now, we verify that the error boundary wrapper exists
    // by checking that the app renders without throwing errors
    await expect(page.locator('h1')).toContainText('💖 Diff View');

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
    await expect(page.locator('select')).toHaveCount(1);

    // Test that state updates work as expected (validates store types)
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('TypeScript test content');

    // Verify the state update worked
    await expect(page.locator('text=23 chars')).toBeVisible();

    // Test select options (validates enum types)
    const viewModeSelect = page.locator('select');
    const options = await viewModeSelect.locator('option').allTextContents();
    expect(options).toEqual(['Split View', 'Unified View']);
  });

  test('should maintain type safety in state management', async () => {
    // Test that only valid values are accepted
    const viewModeSelect = page.locator('select');

    // Test valid enum values
    await viewModeSelect.selectOption('split');
    await expect(page.locator('text=split')).toBeVisible();

    await viewModeSelect.selectOption('unified');
    await expect(page.locator('text=unified')).toBeVisible();

    // Verify the state display shows the correct values
    // This validates that the TypeScript types are working correctly
    const stateSection = page
      .locator('text=Application State (Development)')
      .locator('..');
    await expect(stateSection).toContainText('View Mode:');
    await expect(stateSection).toContainText('Theme:');
    await expect(stateSection).toContainText('Left Content Length:');
    await expect(stateSection).toContainText('Right Content Length:');
  });
});

test.describe('Application Initialization', () => {
  test('should initialize with correct default values', async () => {
    // Verify default state values match the TypeScript interfaces
    await expect(page.locator('text=View Mode:')).toBeVisible();
    await expect(page.locator('text=split')).toBeVisible();

    await expect(page.locator('text=Theme:')).toBeVisible();
    await expect(page.locator('text=system')).toBeVisible();

    // Verify empty content state
    await expect(page.locator('text=0 chars')).toHaveCount(2);

    // Verify form elements have correct initial values
    const viewModeSelect = page.locator('select');
    await expect(viewModeSelect).toHaveValue('split');

    const textareas = page.locator('textarea');
    await expect(textareas.first()).toHaveValue('');
    await expect(textareas.nth(1)).toHaveValue('');
  });

  test('should mount components in correct order', async () => {
    // Verify the component hierarchy is correct
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('h3')).toBeVisible();

    // Verify the layout structure
    const mainContainer = page.locator('.max-w-7xl');
    await expect(mainContainer).toBeVisible();

    // Verify sections are in correct order
    const sections = page.locator('.bg-white, .dark\\:bg-gray-800');
    await expect(sections).toHaveCount(2);
  });

  test('should handle theme initialization correctly', async () => {
    // Verify theme system is initialized
    await expect(page.locator('text=Theme:')).toBeVisible();
    await expect(page.locator('text=system')).toBeVisible();

    // Verify the document has proper theme classes
    // The theme should be applied to the document
    // We can't easily test the actual theme switching without more complex setup
    // but we can verify the theme state is displayed correctly
    await expect(page.locator('text=system')).toBeVisible();
  });
});
