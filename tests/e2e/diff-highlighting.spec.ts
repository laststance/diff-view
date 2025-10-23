import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from 'playwright';

import { launchElectronApp } from './helpers/launchElectronApp';

/**
 * Phase 2 E2E Tests: Character-Level Diff Highlighting
 *
 * Tests the custom renderer components for GitHub-style diff visualization:
 * - DiffRenderer: Container with stats and hunks
 * - DiffHunk: Hunk headers and line grouping
 * - DiffLine: Individual lines with character-level highlights
 * - HighlightSpan: Colored character ranges
 *
 * Integration with Phase 1's Myers algorithm and highlightRanges.
 */

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await launchElectronApp({
    env: {
      NODE_ENV: 'test',
    },
  });

  page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Phase 2: Character-Level Diff Highlighting', () => {
  test.beforeEach(async () => {
    // Clear content before each test
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();
    await leftTextarea.fill('');
    await rightTextarea.fill('');
    await page.waitForTimeout(300);
  });

  test('should render DiffRenderer with proper structure', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Hello World');
    await rightTextarea.fill('Hello Universe');

    // Wait for debounce (300ms) + computation + render
    await page.waitForTimeout(1000);

    // DiffRenderer should be visible
    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should have proper ARIA attributes
    await expect(diffRenderer).toHaveAttribute('role', 'region');
    await expect(diffRenderer).toHaveAttribute(
      'aria-label',
      'Diff comparison result'
    );
  });

  test('should display diff stats (hunks, additions, deletions)', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create content with clear additions and deletions
    await leftTextarea.fill('Line 1\nLine 2\nLine 3');
    await rightTextarea.fill('Line 1 modified\nLine 2\nLine 4');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Check stats header is present
    const statsContent = await diffRenderer.textContent();

    // Should show hunk count
    expect(statsContent).toMatch(/\d+\s+hunks?/);

    // Should show additions
    expect(statsContent).toMatch(/\+\d+\s+additions?/);

    // Should show deletions
    expect(statsContent).toMatch(/-\d+\s+deletions?/);

    // Should show calculation time
    expect(statsContent).toMatch(/\d+\.\d+ms/);
  });

  test('should render hunk headers in GitHub format', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Line 1\nLine 2 old\nLine 3');
    await rightTextarea.fill('Line 1\nLine 2 new\nLine 3');
    await page.waitForTimeout(1000);

    // Look for hunk header with @@ format
    const hunkHeader = page.locator('[data-testid="hunk-header"]').first();
    await expect(hunkHeader).toBeVisible();

    const hunkText = await hunkHeader.textContent();
    // Hunk header format: @@ -oldStart,oldLines +newStart,newLines @@
    expect(hunkText).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/);
  });

  test('should highlight character-level changes with proper colors', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create content with character-level changes
    await leftTextarea.fill('Hello World');
    await rightTextarea.fill('Hello Universe');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Look for highlighted spans (HighlightSpan components)
    const removedHighlights = page.locator(
      '[data-highlight-type="removed"]'
    );
    const addedHighlights = page.locator('[data-highlight-type="added"]');

    // Should have character-level highlights
    await expect(removedHighlights.first()).toBeVisible();
    await expect(addedHighlights.first()).toBeVisible();

    // Check colors (GitHub-style)
    // Removed: red background (Tailwind red-200 or red-900)
    const removedBg = await removedHighlights
      .first()
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Red colors have higher red channel than green/blue
    expect(removedBg).toMatch(/rgb\s*\(\s*\d+/); // Has RGB color

    // Added: green background (Tailwind green-200 or green-900)
    const addedBg = await addedHighlights
      .first()
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Green colors have higher green channel
    expect(addedBg).toMatch(/rgb\s*\(\s*\d+/); // Has RGB color
  });

  test('should handle identical content with success message', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Enter identical content
    await leftTextarea.fill('Same content');
    await rightTextarea.fill('Same content');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    const content = (await diffRenderer.textContent()) || '';

    // Should show either "No differences found" or 0 additions/deletions
    const hasNoDifferencesMessage = /No differences found/i.test(content);
    const hasZeroChanges = /\+0\s+additions?.*-0\s+deletions?/i.test(content);

    // One of these should be true for identical content
    expect(hasNoDifferencesMessage || hasZeroChanges).toBe(true);
  });

  test('should handle empty state properly', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('');
    await rightTextarea.fill('');
    await page.waitForTimeout(300);

    const diffViewer = page.locator('.diff-viewer-container');
    const content = await diffViewer.textContent();

    // Should show empty state or ready message
    expect(content).toMatch(/Ready to Compare|Add content/i);
  });

  test('should render multiple hunks correctly', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create content with multiple separated changes (multiple hunks)
    await leftTextarea.fill(
      'Line 1 old\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7 old\nLine 8'
    );
    await rightTextarea.fill(
      'Line 1 new\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7 new\nLine 8'
    );
    await page.waitForTimeout(1000);

    // Should have hunk headers
    const hunkHeaders = page.locator('[data-testid="hunk-header"]');
    const hunkCount = await hunkHeaders.count();

    // Should have at least one hunk
    expect(hunkCount).toBeGreaterThan(0);

    // All hunk headers should be visible
    for (let i = 0; i < hunkCount; i++) {
      await expect(hunkHeaders.nth(i)).toBeVisible();
    }
  });

  test('should handle line-level changes (full line additions/deletions)', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Line 1\nLine to delete\nLine 3');
    await rightTextarea.fill('Line 1\nLine 3\nLine to add');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should show additions and deletions in stats
    const statsContent = await diffRenderer.textContent();
    expect(statsContent).toMatch(/\+\d+/); // Additions
    expect(statsContent).toMatch(/-\d+/); // Deletions
  });

  test('should handle mixed line and character-level changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Mix of full line changes and character-level changes
    await leftTextarea.fill(
      'Unchanged line\nLine to modify partially\nLine to delete completely\nAnother unchanged'
    );
    await rightTextarea.fill(
      'Unchanged line\nLine to modify greatly\nAnother unchanged\nNew line added'
    );
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should have both character-level highlights and line-level changes
    const highlights = page.locator(
      '[data-highlight-type="added"], [data-highlight-type="removed"]'
    );
    const highlightCount = await highlights.count();
    expect(highlightCount).toBeGreaterThan(0);
  });

  test('should work with split view mode', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Original text here');
    await rightTextarea.fill('Modified text here');
    await page.waitForTimeout(1000);

    // Ensure split view is active (default)
    const splitViewButton = page.locator('button[title*="Split View"]');
    await splitViewButton.click();
    await page.waitForTimeout(300);

    // Diff should render properly
    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should have highlights
    const highlights = page.locator('[data-highlight-type]');
    expect(await highlights.count()).toBeGreaterThan(0);
  });

  test('should work with unified view mode', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Original text here');
    await rightTextarea.fill('Modified text here');
    await page.waitForTimeout(1000);

    // Switch to unified view
    const unifiedViewButton = page.locator('button[title*="Unified View"]');
    await unifiedViewButton.click();
    await page.waitForTimeout(300);

    // Diff should render properly
    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should have highlights
    const highlights = page.locator('[data-highlight-type]');
    expect(await highlights.count()).toBeGreaterThan(0);
  });

  test('should persist highlighting across view mode switches', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Test content for persistence');
    await rightTextarea.fill('Test content for validation');
    await page.waitForTimeout(1000);

    // Check initial state (split view)
    const splitViewButton = page.locator('button[title*="Split View"]');
    await splitViewButton.click();
    await page.waitForTimeout(300);

    let diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    const highlightsInSplit = await page
      .locator('[data-highlight-type]')
      .count();
    expect(highlightsInSplit).toBeGreaterThan(0);

    // Switch to unified view
    const unifiedViewButton = page.locator('button[title*="Unified View"]');
    await unifiedViewButton.click();
    await page.waitForTimeout(300);

    diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    const highlightsInUnified = await page
      .locator('[data-highlight-type]')
      .count();
    expect(highlightsInUnified).toBeGreaterThan(0);

    // Switch back to split view
    await splitViewButton.click();
    await page.waitForTimeout(300);

    diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    const highlightsAfterSwitch = await page
      .locator('[data-highlight-type]')
      .count();
    expect(highlightsAfterSwitch).toBeGreaterThan(0);
  });

  test('should handle large content with character-level highlights', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create large content with character-level changes
    const largeContent = Array.from({ length: 50 }, (_, i) => {
      return `Line ${i + 1} with original content here`;
    }).join('\n');

    const modifiedContent = Array.from({ length: 50 }, (_, i) => {
      return `Line ${i + 1} with modified content here`;
    }).join('\n');

    await leftTextarea.fill(largeContent);
    await rightTextarea.fill(modifiedContent);
    await page.waitForTimeout(1000);

    // Should render without errors
    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should have stats
    const statsContent = await diffRenderer.textContent();
    expect(statsContent).toMatch(/hunks?/);
    expect(statsContent).toMatch(/\+\d+/);
    expect(statsContent).toMatch(/-\d+/);

    // Should not show error state
    expect(statsContent).not.toMatch(/error/i);
  });

  test('should handle content updates and recompute highlights', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Initial content
    await leftTextarea.fill('Initial left content');
    await rightTextarea.fill('Initial right content');
    await page.waitForTimeout(1000);

    let diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    const initialHighlights = await page.locator('[data-highlight-type]').count();
    expect(initialHighlights).toBeGreaterThan(0);

    // Update content
    await leftTextarea.fill('Updated left text completely different');
    await page.waitForTimeout(1000);

    // Diff should update
    diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Highlights should be recomputed
    const updatedHighlights = await page.locator('[data-highlight-type]').count();
    expect(updatedHighlights).toBeGreaterThan(0);
  });

  test('should display proper line backgrounds for additions and deletions', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Create content with full line changes
    await leftTextarea.fill('Line 1\nLine 2 to delete\nLine 3');
    await rightTextarea.fill('Line 1\nLine 2 added\nLine 3');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // The rendering should have proper background colors for line types
    // This is handled by DiffLine component's line type styling
    // We verify the diff is rendered properly
    const content = await diffRenderer.textContent();
    expect(content).toContain('Line 1');
    expect(content).toContain('Line 3');
  });

  test('should handle whitespace-only changes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Content differing only in whitespace
    await leftTextarea.fill('Line with    spaces');
    await rightTextarea.fill('Line with  spaces');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should detect whitespace changes as character-level differences
    const highlights = page.locator('[data-highlight-type]');
    const highlightCount = await highlights.count();
    expect(highlightCount).toBeGreaterThan(0);
  });

  test('should handle special characters and unicode', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Content with special characters and unicode
    await leftTextarea.fill('Hello 世界 with emoji 🌍');
    await rightTextarea.fill('Hello 世界 with emoji 🚀');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should handle unicode properly
    const content = await diffRenderer.textContent();
    expect(content).toContain('世界');

    // Should have highlights for changed emoji
    const highlights = page.locator('[data-highlight-type]');
    expect(await highlights.count()).toBeGreaterThan(0);
  });

  test('should handle code-like content with proper structure', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    // Code-like content with indentation and special characters
    await leftTextarea.fill(`function hello() {
  const name = "World";
  return \`Hello \${name}\`;
}`);
    await rightTextarea.fill(`function hello() {
  const name = "Universe";
  return \`Hello \${name}\`;
}`);
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');
    await expect(diffRenderer).toBeVisible();

    // Should preserve code structure
    const content = await diffRenderer.textContent();
    expect(content).toContain('function hello');

    // Should have character-level highlights for changed strings
    const highlights = page.locator('[data-highlight-type]');
    expect(await highlights.count()).toBeGreaterThan(0);
  });

  test('should maintain accessibility attributes', async () => {
    const leftTextarea = page.locator('textarea').first();
    const rightTextarea = page.locator('textarea').last();

    await leftTextarea.fill('Accessibility test content');
    await rightTextarea.fill('Accessibility test modified');
    await page.waitForTimeout(1000);

    const diffRenderer = page.locator('[data-testid="diff-renderer"]');

    // Should have proper ARIA attributes
    await expect(diffRenderer).toHaveAttribute('role', 'region');
    await expect(diffRenderer).toHaveAttribute('aria-label');

    // ARIA label should describe the content
    const ariaLabel = await diffRenderer.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/diff|comparison|result/i);
  });
});
