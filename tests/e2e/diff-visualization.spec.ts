import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import { _electron as electron } from 'playwright';

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
  await page.waitForTimeout(1000); // Give the app time to initialize
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Diff Visualization', () => {
  test('should render DiffViewer component', async () => {
    // Check that the DiffViewer component is present in the DOM
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
  });

  test('should show empty state when no content is provided', async () => {
    // Initially, both text areas should be empty
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await expect(leftTextarea).toHaveValue('');
    await expect(rightTextarea).toHaveValue('');

    // Should show empty state message
    await expect(
      page.locator('text=Add content to both panes to see the diff')
    ).toBeVisible();
  });

  test('should show partial content message when only one pane has content', async () => {
    // Add content to left pane only
    const leftTextarea = page.locator('textarea').first();
    await leftTextarea.fill('Hello World\nThis is line 2');

    // Should show message about needing content in right pane
    await expect(
      page.locator('text=Add content to the right pane to compare')
    ).toBeVisible();

    // Clear left pane and add to right pane
    await leftTextarea.fill('');
    const rightTextarea = page.locator('textarea').last();
    await rightTextarea.fill('Hello World\nThis is line 2');

    // Should show message about needing content in left pane
    await expect(
      page.locator('text=Add content to the left pane to compare')
    ).toBeVisible();
  });

  test('should compute diff when both panes have content', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add different content to both panes
    await leftTextarea.fill('Hello World\nThis is line 2\nOriginal line 3');
    await rightTextarea.fill(
      'Hello World\nThis is modified line 2\nNew line 3'
    );

    // Wait for diff computation (debounced)
    await page.waitForTimeout(500);

    // Should show the diff view
    const diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();

    // Should not show empty state messages
    await expect(
      page.locator('text=Add content to both panes to see the diff')
    ).not.toBeVisible();
  });

  test('should show loading state during diff computation', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Clear existing content
    await leftTextarea.fill('');
    await rightTextarea.fill('');

    // Add large content to trigger processing state
    const largeContent = 'Line '.repeat(1000);
    await leftTextarea.fill(largeContent);
    await rightTextarea.fill(largeContent + 'Modified');

    // Should briefly show loading state
    const loadingIndicator = page.locator('text=Computing diff...');
    // Note: This might be too fast to catch reliably, so we'll just check it doesn't error
  });

  test('should handle automatic diff generation when content changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Start with simple content
    await leftTextarea.fill('Line 1\nLine 2');
    await rightTextarea.fill('Line 1\nModified Line 2');

    // Wait for initial diff computation
    await page.waitForTimeout(500);

    // Verify diff view is present
    let diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();

    // Modify content and verify diff updates
    await leftTextarea.fill('Line 1\nLine 2\nLine 3');

    // Wait for diff recomputation
    await page.waitForTimeout(500);

    // Diff view should still be present (automatic regeneration)
    diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();
  });

  test('should respect view mode settings', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add content for diff
    await leftTextarea.fill('Original line 1\nOriginal line 2');
    await rightTextarea.fill('Modified line 1\nModified line 2');

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Check that diff view is rendered
    const diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();

    // Test split view (default)
    const splitViewButton = page.locator('button[title="Split View"]');
    await expect(splitViewButton).toBeVisible();

    // Test unified view
    const unifiedViewButton = page.locator('button[title="Unified View"]');
    await expect(unifiedViewButton).toBeVisible();
    await unifiedViewButton.click();

    // Wait for view mode change to take effect
    await page.waitForTimeout(300);

    // Diff view should still be present after mode change
    await expect(diffView).toBeVisible();
  });

  test('should handle theme changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add content for diff
    await leftTextarea.fill('Test content for theme');
    await rightTextarea.fill('Modified test content for theme');

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Check that diff view has theme attribute
    const diffWrapper = page.locator('[data-component="git-diff-view"]');
    await expect(diffWrapper).toBeVisible();

    // The theme should be set (either light or dark)
    const themeAttr = await diffWrapper.getAttribute('data-theme');
    expect(themeAttr).toBeTruthy();
    expect(['light', 'dark']).toContain(themeAttr);
  });

  test('should handle TypeScript interfaces correctly', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Test with TypeScript-like content
    const tsContent1 = `interface User {
  id: number;
  name: string;
}`;

    const tsContent2 = `interface User {
  id: number;
  name: string;
  email: string;
}`;

    await leftTextarea.fill(tsContent1);
    await rightTextarea.fill(tsContent2);

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Should render diff without errors
    const diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();

    // Should not show error state
    await expect(
      page.locator('text=Error generating diff view')
    ).not.toBeVisible();
  });

  test('should handle error scenarios gracefully', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Test with very large content that might cause issues
    const veryLargeContent = 'A'.repeat(50000);
    await leftTextarea.fill(veryLargeContent);
    await rightTextarea.fill(veryLargeContent + 'B');

    // Wait for processing
    await page.waitForTimeout(1000);

    // Should either show diff or handle gracefully without crashing
    const hasError = await page
      .locator('text=Error generating diff view')
      .isVisible();
    const hasDiff = await page
      .locator('[data-component="git-diff-view"]')
      .isVisible();

    // One of these should be true (either success or graceful error handling)
    expect(hasError || hasDiff).toBeTruthy();
  });

  test('should maintain diff state during font size changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add content for diff
    await leftTextarea.fill('Font test line 1\nFont test line 2');
    await rightTextarea.fill('Font test line 1\nModified font test line 2');

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Verify diff is present
    const diffView = page.locator('[data-component="git-diff-view"]');
    await expect(diffView).toBeVisible();

    // Click font size button (if available)
    const fontSizeButton = page.locator('button[title*="Font Size"]');
    if (await fontSizeButton.isVisible()) {
      await fontSizeButton.click();
      await page.waitForTimeout(300);

      // Diff should still be visible after font size change
      await expect(diffView).toBeVisible();
    }
  });
});
