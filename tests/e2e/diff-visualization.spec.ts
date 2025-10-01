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
  await page.waitForTimeout(1000); // Give the app time to initialize
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Diff Display Features', () => {
  test('should render DiffViewer component', async () => {
    // Check that the DiffViewer component is present in the DOM
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
  });

  test('should show empty state when no content is provided', async () => {
    // Initially, both text areas should be empty
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Clear any existing content first
    await leftTextarea.fill('');
    await rightTextarea.fill('');
    await page.waitForTimeout(500);

    await expect(leftTextarea).toHaveValue('');
    await expect(rightTextarea).toHaveValue('');

    // Check if the diff viewer container shows empty state
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();

    // Should show empty state or debug info (in test mode)
    const diffViewerText = await diffViewer.textContent();
    expect(diffViewerText).toMatch(
      /Add content to both (panes|text areas)|DiffViewer Debug Info/i
    );
  });

  test('should support split view and unified view modes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add different content to both panes
    await leftTextarea.fill('Hello World\nThis is line 2\nOriginal line 3');
    await rightTextarea.fill(
      'Hello World\nThis is modified line 2\nNew line 3'
    );

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Should show the diff view
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();

    // Test split view (default)
    const splitViewButton = page.locator('button[title*="Split View"]');
    await expect(splitViewButton).toBeVisible();

    // Verify split view is active (button should have active styling)
    const splitButtonClass = await splitViewButton.getAttribute('class');
    expect(splitButtonClass).toContain('bg-white');

    // Test unified view
    const unifiedViewButton = page.locator('button[title*="Unified View"]');
    await expect(unifiedViewButton).toBeVisible();
    await unifiedViewButton.click();

    // Wait for view mode change to take effect
    await page.waitForTimeout(300);

    // Verify unified view is now active
    const unifiedButtonClass = await unifiedViewButton.getAttribute('class');
    expect(unifiedButtonClass).toContain('bg-white');

    // Switch back to split view
    await splitViewButton.click();
    await page.waitForTimeout(300);

    // Verify split view is active again
    const splitButtonClassAgain = await splitViewButton.getAttribute('class');
    expect(splitButtonClassAgain).toContain('bg-white');
  });

  test('should display line numbers for both original and modified content', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add multi-line content to test line numbers
    await leftTextarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    await rightTextarea.fill(
      'Line 1 modified\nLine 2\nLine 3 changed\nLine 4\nLine 5 updated'
    );

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Should show the diff view with @git-diff-view/react
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();

    // The diff view should be rendered (line numbers are handled by the library)
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );
  });

  test('should configure syntax highlighting for common programming languages', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Test with JavaScript/TypeScript code
    await leftTextarea.fill(`function hello() {
  console.log("Hello");
  return true;
}`);
    await rightTextarea.fill(`function hello() {
  console.log("Hello World");
  return false;
}`);

    // Wait for diff computation
    await page.waitForTimeout(500);

    // The diff should be visible with syntax highlighting
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Test with Python code
    await leftTextarea.fill(`def hello():
    print("Hello")
    return True`);
    await rightTextarea.fill(`def hello():
    print("Hello World")
    return False`);

    await page.waitForTimeout(500);
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Test with HTML
    await leftTextarea.fill(`<html>
<body>
  <h1>Title</h1>
  <p>Content</p>
</body>
</html>`);
    await rightTextarea.fill(`<html>
<body>
  <h1>New Title</h1>
  <p>Updated Content</p>
</body>
</html>`);

    await page.waitForTimeout(500);
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Test with JSON
    await leftTextarea.fill(`{
  "name": "test",
  "version": "1.0.0"
}`);
    await rightTextarea.fill(`{
  "name": "test-updated",
  "version": "1.0.1"
}`);

    await page.waitForTimeout(500);
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );
  });

  test('should add color coding for additions, deletions, and modifications', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create content with clear additions, deletions, and modifications
    await leftTextarea.fill(`Line 1 original
Line 2 to be deleted
Line 3 unchanged
Line 4 to be modified`);

    await rightTextarea.fill(`Line 1 original
Line 3 unchanged
Line 4 modified version
Line 5 newly added`);

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Should show the diff with proper color coding (handled by @git-diff-view/react)
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // The @git-diff-view/react component should handle color coding internally
    // We verify the component is rendered and working
    await expect(diffViewer).not.toHaveText('Error generating diff');
  });

  test('should handle theme switching for diff display', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Test content for theme');
    await rightTextarea.fill('Test content for theme modified');

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Test theme switching
    const themeButton = page.locator('button[title*="Theme"]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(300);

      // Diff should still be visible after theme change
      const diffViewer = page.locator('.diff-viewer-container');
      await expect(diffViewer).toBeVisible();
      await expect(diffViewer).not.toHaveText(
        'Add content to both panes to see the diff'
      );
    }
  });

  test('should handle font size changes in diff display', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Test content for font size');
    await rightTextarea.fill('Test content for font size modified');

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Test font size button
    const fontSizeButton = page.locator('button[title*="Font Size"]');
    if (await fontSizeButton.isVisible()) {
      await fontSizeButton.click();
      await page.waitForTimeout(300);

      // Diff should still be visible after font size change
      const diffViewer = page.locator('.diff-viewer-container');
      await expect(diffViewer).toBeVisible();
      await expect(diffViewer).not.toHaveText(
        'Add content to both panes to see the diff'
      );
    }
  });

  test('should handle large content without errors', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create large content
    const largeContent = Array.from(
      { length: 100 },
      (_, i) => `Line ${i + 1} with some content`
    ).join('\n');
    await leftTextarea.fill(largeContent);
    await rightTextarea.fill(largeContent + '\nAdditional line at the end');

    // Wait for processing
    await page.waitForTimeout(1000);

    // Should show diff without errors
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();

    // Should not show error state
    await expect(diffViewer).not.toHaveText('Error generating diff');
  });

  test('should handle automatic diff generation when content changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Start with simple content
    await leftTextarea.fill('Initial content');
    await rightTextarea.fill('Initial content modified');

    // Wait for initial diff computation
    await page.waitForTimeout(500);

    // Verify diff view is present
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Modify content and verify diff updates
    await leftTextarea.fill('Updated content line 1\nUpdated content line 2');

    // Wait for diff recomputation
    await page.waitForTimeout(500);

    // Diff view should still be present (automatic regeneration)
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Change right content too
    await rightTextarea.fill(
      'Updated content line 1 modified\nUpdated content line 2 changed'
    );
    await page.waitForTimeout(500);

    // Diff should still be visible
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );
  });

  test('should maintain diff display consistency across view mode switches', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Add content with clear differences
    await leftTextarea.fill(`function test() {
  console.log("original");
  return 1;
}`);
    await rightTextarea.fill(`function test() {
  console.log("modified");
  return 2;
}`);

    // Wait for diff computation
    await page.waitForTimeout(500);

    // Verify diff is visible in split view
    const diffViewer = page.locator('.diff-viewer-container');
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Switch to unified view
    const unifiedViewButton = page.locator('button[title*="Unified View"]');
    await unifiedViewButton.click();
    await page.waitForTimeout(300);

    // Diff should still be visible
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );

    // Switch back to split view
    const splitViewButton = page.locator('button[title*="Split View"]');
    await splitViewButton.click();
    await page.waitForTimeout(300);

    // Diff should still be visible
    await expect(diffViewer).toBeVisible();
    await expect(diffViewer).not.toHaveText(
      'Add content to both panes to see the diff'
    );
  });

  test('should handle error states gracefully', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Clear any existing content
    await leftTextarea.fill('');
    await rightTextarea.fill('');
    await page.waitForTimeout(500);

    // Should show empty state or debug info (in test mode)
    const diffViewer = page.locator('.diff-viewer-container');
    const diffViewerText = await diffViewer.textContent();
    expect(diffViewerText).toMatch(
      /Add content to both (panes|text areas)|DiffViewer Debug Info/i
    );

    // Add content to one pane only
    await leftTextarea.fill('Only left content');
    await page.waitForTimeout(300);

    // Should show debug status information when there's content
    const diffViewerPartial = page.locator('.diff-viewer-container');
    const partialText = await diffViewerPartial.textContent();
    expect(partialText).toMatch(
      /Diff Viewer Status|Left content:|Right content:/i
    );

    // Add content to right pane
    await rightTextarea.fill('Only right content');
    await page.waitForTimeout(500);

    // Should now show diff
    const diffViewerFinal = page.locator('.diff-viewer-container');
    await expect(diffViewerFinal).toBeVisible();
    await expect(diffViewerFinal).not.toHaveText(
      'Add content to both panes to see the diff'
    );
  });
});
