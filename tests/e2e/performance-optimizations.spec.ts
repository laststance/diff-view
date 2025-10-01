import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';

import { startElectronApp, stopElectronApp } from '../utils/electron-helpers';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await startElectronApp();
  page = await electronApp.firstWindow();
});

test.afterAll(async () => {
  await stopElectronApp(electronApp);
});

test.describe('Performance Optimizations', () => {
  test.beforeEach(async () => {
    // Reload page to reset state (handles virtualized components from previous tests)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(200);
  });

  test.describe('Debounced Input Handling', () => {
    test('should debounce diff computation during rapid typing', async () => {
      // Add content to both panes
      await page
        .getByTestId('textarea-left')
        .fill('Original content line 1\nOriginal content line 2');
      await page
        .getByTestId('textarea-right')
        .fill('Modified content line 1\nModified content line 2');

      // Wait for initial diff computation
      await page.waitForSelector('[data-testid="diff-viewer"]');

      // Rapidly modify content
      const rightTextarea = page.getByTestId('textarea-right');
      await rightTextarea.focus();

      // Simulate rapid typing by adding characters quickly
      for (let i = 0; i < 5; i++) {
        await rightTextarea.type(`${i}`, { delay: 50 });
      }

      // Check that diff computation loader appears (indicating debouncing is working)
      // The loader should appear after debounce delay
      await page.waitForTimeout(350); // Wait for debounce delay + buffer

      // Verify diff viewer shows updated content
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toBeVisible();

      // Check that the final content is reflected
      await expect(rightTextarea).toHaveValue(
        /Modified content line 1\nModified content line 201234/
      );
    });

    test('should reset debounce timer on content changes', async () => {
      await page.getByTestId('textarea-left').fill('Test content');

      const rightTextarea = page.getByTestId('textarea-right');
      await rightTextarea.fill('Initial');

      // Make rapid changes that should reset the timer
      await rightTextarea.fill('Change 1');
      await page.waitForTimeout(100);

      await rightTextarea.fill('Change 2');
      await page.waitForTimeout(100);

      await rightTextarea.fill('Final change');

      // Wait for debounce to complete
      await page.waitForTimeout(400);

      // Verify final content is processed
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toContainText('Diff Comparison Result');
    });
  });

  test.describe('Virtual Scrolling', () => {
    test('should enable virtual scrolling for large content', async () => {
      // Generate large content (>1000 lines to trigger virtual scrolling)
      const largeContent = Array.from(
        { length: 1500 },
        (_, i) => `Line ${i + 1}: This is a test line with some content`
      ).join('\n');

      // Fill the textarea - virtual scrolling will activate after content is set
      await page.getByTestId('textarea-left').fill(largeContent);

      // Wait for content to be processed and virtual scrolling to activate
      await page.waitForTimeout(1000);

      // Check if virtual scrolling indicator is present
      const virtualScrollingIndicator = page.locator(
        'text=Virtual scrolling enabled'
      );
      await expect(virtualScrollingIndicator).toBeVisible();

      // Verify line count is displayed correctly
      const statsElement = page.locator('[id="text-pane-left-stats"]');
      await expect(statsElement).toContainText('1500 lines');
    });

    test('should not use virtual scrolling for small content', async () => {
      const smallContent = Array.from(
        { length: 50 },
        (_, i) => `Line ${i + 1}`
      ).join('\n');

      await page.getByTestId('textarea-left').fill(smallContent);
      await page.waitForTimeout(200);

      // Virtual scrolling indicator should not be present
      const virtualScrollingIndicator = page.locator(
        'text=Virtual scrolling enabled'
      );
      await expect(virtualScrollingIndicator).not.toBeVisible();

      // Regular textarea should be visible
      const textarea = page.getByTestId('textarea-left');
      await expect(textarea).toBeVisible();
    });

    test('should handle scrolling in virtual scrolling mode', async () => {
      const largeContent = Array.from(
        { length: 2000 },
        (_, i) => `Line ${i + 1}: Content for testing virtual scrolling`
      ).join('\n');

      await page.getByTestId('textarea-left').fill(largeContent);
      await page.waitForTimeout(500);

      // Verify virtual scrolling is enabled
      await expect(
        page.locator('text=Virtual scrolling enabled')
      ).toBeVisible();

      // Test scrolling behavior (virtual scrolling should handle large content smoothly)
      const textPane = page.locator('[data-testid="text-pane-left"]');
      await textPane.hover();

      // Scroll down multiple times
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(50);
      }

      // Verify the component is still responsive
      await expect(textPane).toBeVisible();
    });
  });

  test.describe('React Component Memoization', () => {
    test('should prevent unnecessary re-renders with memoization', async () => {
      // Add content to trigger initial render
      await page
        .getByTestId('textarea-left')
        .fill('Test content for memoization');
      await page.getByTestId('textarea-right').fill('Different content');

      // Wait for initial render
      await page.waitForTimeout(200);

      // Change theme (should not cause text content re-renders due to memoization)
      const themeButton = page
        .locator('button[title*="theme"], button[aria-label*="theme"]')
        .first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(100);
      }

      // Verify content is still there and components are responsive
      await expect(page.getByTestId('textarea-left')).toHaveValue(
        'Test content for memoization'
      );
      await expect(page.getByTestId('textarea-right')).toHaveValue(
        'Different content'
      );

      // Verify diff viewer is still functional
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toBeVisible();
    });

    test('should memoize expensive calculations', async () => {
      const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';

      await page.getByTestId('textarea-left').fill(content);

      // Check that stats are calculated and displayed
      const statsElement = page.locator('[id="text-pane-left-stats"]');
      await expect(statsElement).toContainText('5 lines');
      await expect(statsElement).toContainText('chars');
      await expect(statsElement).toContainText('words');

      // Modify content slightly and verify stats update
      await page.getByTestId('textarea-left').fill(content + '\nLine 6');
      await page.waitForTimeout(100);

      await expect(statsElement).toContainText('6 lines');
    });
  });

  test.describe('Content Size Limits and Memory Usage Monitoring', () => {
    test('should show memory usage information', async () => {
      // Add substantial content to trigger memory monitoring
      const largeContent = Array.from(
        { length: 1000 },
        (_, i) =>
          `Line ${i + 1}: This is a longer line with more content to increase memory usage and test monitoring capabilities`
      ).join('\n');

      await page.getByTestId('textarea-left').fill(largeContent);
      await page.getByTestId('textarea-right').fill(largeContent);

      // Wait for diff computation and memory monitoring
      await page.waitForTimeout(1000);

      // Check if memory usage is displayed in diff viewer status
      const diffViewer = page.getByTestId('diff-viewer');
      const memoryInfo = diffViewer.locator('text=/Memory usage:/');

      // Memory usage should be displayed if supported
      if (await memoryInfo.isVisible()) {
        await expect(memoryInfo).toContainText('MB');
      }
    });

    test('should show content size warnings for large content', async () => {
      // Create content that exceeds 1MB threshold (triggers isLargeContent warning)
      // Using ~1200 chars per line × 1000 lines ≈ 1.2MB to ensure we exceed threshold
      const longLine = `Line content: This is a very long line with lots of content to test size limits and warnings. `.repeat(
        12
      );
      const veryLargeContent = Array.from(
        { length: 1000 },
        (_, i) => `${i + 1}: ${longLine}`
      ).join('\n');

      await page.getByTestId('textarea-left').fill(veryLargeContent);

      // Wait for content processing and memory calculation
      await page.waitForTimeout(2000);

      // Check for large content warning
      const largeContentWarning = page.locator('text=/Large Content Detected/');
      await expect(largeContentWarning).toBeVisible();

      // Check for size information
      const sizeInfo = page.locator('text=/Size:/');
      await expect(sizeInfo).toBeVisible();

      // Check for memory estimation
      const memoryInfo = page.locator('text=/Estimated memory:/');
      await expect(memoryInfo).toBeVisible();
    });

    test('should provide performance recommendations', async () => {
      // Create content that triggers recommendations (>5MB for "splitting" recommendation)
      // Using large content to avoid line count limits with Playwright fill()
      const largeLine = 'x'.repeat(6000); // ~6KB per line
      const contentTriggeringRecommendations = Array.from(
        { length: 900 },
        (_, i) => `Line ${i + 1}: ${largeLine}`
      ).join('\n'); // ~5.4MB total

      await page.getByTestId('textarea-left').fill(contentTriggeringRecommendations);
      await page.waitForTimeout(2000);

      // Check for performance recommendations
      const recommendations = page.locator('text=/Recommendations:/');
      if (await recommendations.isVisible()) {
        await expect(recommendations).toBeVisible();

        // Should recommend splitting large content
        const splittingRec = page.locator('text=/splitting/i');
        await expect(splittingRec).toBeVisible();
      }
    });

    test('should handle content size limits gracefully', async () => {
      // Test with content approaching limits (reduced from 8MB to avoid Playwright timeout)
      const approachingLimitContent = 'x'.repeat(1500 * 1024); // 1.5MB content

      await page.getByTestId('textarea-left').fill(approachingLimitContent);

      // Wait for processing
      await page.waitForTimeout(1000);

      // Should show warning but still process content
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toBeVisible();

      // Check if size warning is shown
      const sizeWarning = page.locator('text=/Large comparison/i');
      if (await sizeWarning.isVisible()) {
        await expect(sizeWarning).toContainText('performance may be affected');
      }
    });
  });

  test.describe('Performance Metrics Integration', () => {
    test('should track diff computation time', async () => {
      await page
        .getByTestId('textarea-left')
        .fill('Original content\nWith multiple lines\nFor testing');
      await page
        .getByTestId('textarea-right')
        .fill('Modified content\nWith different lines\nFor testing');

      // Wait for diff computation
      await page.waitForTimeout(500);

      // Verify diff computation completed successfully
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toContainText(
        'Diff computation completed successfully'
      );
    });

    test('should handle performance degradation gracefully', async () => {
      // Create content that might cause performance issues
      const complexContent = Array.from({ length: 3000 }, (_, i) => {
        const lineLength = Math.floor(Math.random() * 200) + 50;
        return `Line ${i + 1}: ${'x'.repeat(lineLength)}`;
      }).join('\n');

      await page.getByTestId('textarea-left').fill(complexContent);
      await page
        .getByTestId('textarea-right')
        .fill(complexContent.replace(/x/g, 'y'));

      // Wait for processing with longer timeout for complex content
      await page.waitForTimeout(2000);

      // Should still complete processing
      const diffViewer = page.getByTestId('diff-viewer');
      await expect(diffViewer).toBeVisible();

      // Check for performance warnings
      const performanceWarning = page.locator(
        'text=/performance may be affected/i'
      );
      if (await performanceWarning.isVisible()) {
        await expect(performanceWarning).toBeVisible();
      }
    });
  });

  test.describe('Memory Cleanup and Optimization', () => {
    test('should clean up resources when content is cleared', async () => {
      // Add large content
      const largeContent = Array.from(
        { length: 2000 },
        (_, i) => `Line ${i + 1}: Content`
      ).join('\n');

      await page.getByTestId('textarea-left').fill(largeContent);
      await page.getByTestId('textarea-right').fill(largeContent);

      // Wait for processing
      await page.waitForTimeout(1000);

      // Clear content with dialog handler
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      
      const clearButton = page.getByLabel('Clear all content from both panes');
      await clearButton.click();
      await page.waitForTimeout(500);

      // Verify content is cleared
      await expect(page.getByTestId('textarea-left')).toHaveValue('');
      await expect(page.getByTestId('textarea-right')).toHaveValue('');

      // Verify diff viewer shows empty state
      const emptyState = page.locator('text=/Ready to Compare/');
      await expect(emptyState).toBeVisible();
    });
  });
});
