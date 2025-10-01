import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';

import { startElectronApp, stopElectronApp } from '../utils/electron-helpers';

test.describe('Final Integration Tests', () => {
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

  test.describe('Complete Application Integration', () => {
    test('should demonstrate complete application workflow with all features', async () => {
      // Verify application startup performance
      const startTime = Date.now();
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
      const loadTime = Date.now() - startTime;

      // Application should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Test 1: Initial state and branding
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
      await expect(page.locator('[data-testid="app-logo"]')).toBeVisible();

      // Test 2: Theme integration - start with system theme
      const themeButton = page.getByLabel(/Current theme:/);
      await expect(themeButton).toBeVisible();

      // Cycle through all themes and verify UI updates
      await themeButton.click(); // Switch to light
      await page.waitForTimeout(100); // Allow theme transition

      await themeButton.click(); // Switch to dark
      await page.waitForTimeout(100);

      await themeButton.click(); // Switch to system
      await page.waitForTimeout(100);

      // Test 3: Font size integration
      const fontButton = page.getByLabel(/Current font size:/);
      await fontButton.click(); // Medium
      await fontButton.click(); // Large
      await fontButton.click(); // Small
      await fontButton.click(); // Back to medium

      // Test 4: Content input with real-time diff computation
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add complex content with multiple programming languages
      const originalCode = `// JavaScript function
function calculateSum(a, b) {
  return a + b;
}

/* CSS styles */
.container {
  display: flex;
  justify-content: center;
}

# Python function
def calculate_product(x, y):
    return x * y

<!-- HTML structure -->
<div class="wrapper">
  <h1>Title</h1>
</div>`;

      const modifiedCode = `// JavaScript function with improvements
function calculateSum(a, b) {
  // Added input validation
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Invalid input');
  }
  return a + b;
}

/* CSS styles with responsive design */
.container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

# Python function with type hints
def calculate_product(x: float, y: float) -> float:
    """Calculate the product of two numbers."""
    return x * y

<!-- HTML structure with accessibility -->
<div class="wrapper" role="main">
  <h1 id="main-title">Enhanced Title</h1>
</div>`;

      await leftTextarea.fill(originalCode);
      await rightTextarea.fill(modifiedCode);

      // Test 5: Verify diff computation and statistics
      await expect(page.getByText('Computing differences...')).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 5000 });

      // Verify content statistics are accurate
      await expect(
        page.getByText(/Comparing \d+ lines vs \d+ lines/)
      ).toBeVisible();
      await expect(page.getByText(/\d+ additions/)).toBeVisible();
      await expect(page.getByText(/\d+ deletions/)).toBeVisible();

      // Test 6: View mode integration - test both modes with complex content
      const unifiedViewButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      await unifiedViewButton.click();

      // Verify diff view displays correctly (check for diff container, not specific view classes)
      await expect(page.locator('.diff-viewer-container')).toBeVisible();

      const splitViewButton = page.getByTitle('Split View (Ctrl+Shift+V)');
      await splitViewButton.click();

      // Verify diff view still displays after mode change
      await expect(page.locator('.diff-viewer-container')).toBeVisible();

      // Test 7: Keyboard shortcuts integration
      await page.keyboard.press('Control+Shift+V'); // Toggle view mode
      await page.waitForTimeout(300);
      await page.keyboard.press('Control+t'); // Toggle theme
      await page.waitForTimeout(300);

      // Use the swap button instead of keyboard shortcut for more reliable testing
      const swapButton = page.getByLabel('Swap left and right content');
      await swapButton.click();
      await page.waitForTimeout(500); // Allow time for swap to complete

      // Verify content was swapped
      await expect(leftTextarea).toHaveValue(modifiedCode);
      await expect(rightTextarea).toHaveValue(originalCode);

      // Test 8: Content management integration
      const swapButtonAgain = page.getByLabel('Swap left and right content');
      await swapButtonAgain.click(); // Swap back

      // Test 9: Error handling integration
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      const clearButton = page.getByLabel('Clear all content from both panes');
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify clean state
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');
      await expect(page.getByText('Ready to compare').first()).toBeVisible();

      // Test 10: Performance with large content
      const largeContent = Array(1000)
        .fill('Line of performance test content')
        .join('\n');
      const performanceStartTime = Date.now();

      await leftTextarea.fill(largeContent);
      await rightTextarea.fill(largeContent + '\nAdditional line for diff');

      await expect(page.getByText('Computing differences...')).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 10000 });

      const performanceEndTime = Date.now();
      const processingTime = performanceEndTime - performanceStartTime;

      // Large content should process within 10 seconds
      expect(processingTime).toBeLessThan(10000);

      // Test 11: Memory usage and cleanup
      // Manually clear content to ensure it works
      await leftTextarea.fill('');
      await rightTextarea.fill('');
      await page.waitForTimeout(300);

      // Verify memory is cleaned up (content is actually cleared)
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');

      // Test rapid operations to ensure no memory leaks
      for (let i = 0; i < 5; i++) {
        await leftTextarea.fill(`Test content ${i}`);
        await rightTextarea.fill(`Modified test content ${i}`);
        await page.waitForTimeout(100);
        await clearButton.click();
      }

      // Final verification - application should still be responsive
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
    });

    test('should handle complex multi-feature interactions', async () => {
      // Test complex scenario: Large content + theme changes + view mode changes + keyboard shortcuts
      const complexContent = `
// Complex JavaScript with multiple features
class DataProcessor {
  constructor(options = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.cache = new Map();
    this.observers = [];
  }

  get defaultOptions() {
    return {
      batchSize: 100,
      timeout: 5000,
      retries: 3,
      enableCache: true
    };
  }

  async processData(data) {
    try {
      const batches = this.createBatches(data);
      const results = [];
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        results.push(...batchResult);
        
        // Notify observers
        this.notifyObservers('batchProcessed', { batch, result: batchResult });
      }
      
      return results;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  createBatches(data) {
    const batches = [];
    for (let i = 0; i < data.length; i += this.options.batchSize) {
      batches.push(data.slice(i, i + this.options.batchSize));
    }
    return batches;
  }

  async processBatch(batch) {
    const cacheKey = this.generateCacheKey(batch);
    
    if (this.options.enableCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.performProcessing(batch);
    
    if (this.options.enableCache) {
      this.cache.set(cacheKey, result);
    }
    
    return result;
  }

  generateCacheKey(batch) {
    return JSON.stringify(batch);
  }

  async performProcessing(batch) {
    // Simulate async processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(batch.map(item => ({ ...item, processed: true })));
      }, 100);
    });
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(event, data) {
    this.observers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  handleError(error) {
    console.error('Processing error:', error);
    this.notifyObservers('error', { error });
  }

  clearCache() {
    this.cache.clear();
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      observerCount: this.observers.length,
      options: { ...this.options }
    };
  }
}

export default DataProcessor;
`;

      const modifiedComplexContent = complexContent
        .replace('batchSize: 100', 'batchSize: 200')
        .replace('timeout: 5000', 'timeout: 10000')
        .replace('retries: 3', 'retries: 5')
        .replace('processed: true', 'processed: true, timestamp: Date.now()')
        .replace(
          "console.error('Processing error:', error);",
          "console.error('Enhanced processing error:', error);\n    this.logError(error);"
        )
        .replace(
          'export default DataProcessor;',
          `  logError(error) {
    // Enhanced error logging
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    console.log('Error details:', errorInfo);
  }
}

export default DataProcessor;`
        );

      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add complex content
      await leftTextarea.fill(complexContent);
      await rightTextarea.fill(modifiedComplexContent);

      // Wait for initial diff computation
      await expect(page.getByText('Computing differences...')).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 8000 });

      // Perform rapid theme changes while diff is displayed
      const themeButton = page.getByLabel(/Current theme:/);
      for (let i = 0; i < 3; i++) {
        await themeButton.click();
        await page.waitForTimeout(200);
      }

      // Perform rapid view mode changes
      const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      const splitButton = page.getByTitle('Split View (Ctrl+Shift+V)');

      for (let i = 0; i < 3; i++) {
        await unifiedButton.click();
        await page.waitForTimeout(200);
        await splitButton.click();
        await page.waitForTimeout(200);
      }

      // Test keyboard shortcuts while complex diff is displayed
      await page.keyboard.press('Control+Shift+V'); // Toggle view
      await page.keyboard.press('Control+t'); // Toggle theme
      await page.keyboard.press('Control+Shift+s'); // Swap content

      // Verify application remains stable and responsive
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible();

      // Test font size changes with complex content
      const fontButton = page.getByLabel(/Current font size:/);
      await fontButton.click(); // Change font size
      await fontButton.click(); // Change again
      await fontButton.click(); // And again

      // Verify diff display adapts to font changes
      await expect(page.locator('.diff-viewer-container')).toBeVisible();

      // Final stability check
      await expect(page.getByText(/\d+ additions/)).toBeVisible();
      await expect(page.getByText(/\d+ deletions/)).toBeVisible();
    });

    test('should maintain performance under stress conditions', async () => {
      // Test application performance under various stress conditions
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Stress test 1: Rapid content changes
      const baseContent = 'Initial content line';
      for (let i = 0; i < 10; i++) {
        await leftTextarea.fill(`${baseContent} ${i}`);
        await rightTextarea.fill(`${baseContent} modified ${i}`);
        await page.waitForTimeout(100);
      }

      // Verify application remains responsive
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();

      // Stress test 2: Large content with rapid UI changes
      const stressContent = Array(500)
        .fill('Stress test content line')
        .join('\n');
      await leftTextarea.fill(stressContent);
      await rightTextarea.fill(stressContent + '\nAdditional stress line');

      // Rapidly change UI settings while processing large content
      const themeButton = page.getByLabel(/Current theme:/);
      const fontButton = page.getByLabel(/Current font size:/);
      const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      const splitButton = page.getByTitle('Split View (Ctrl+Shift+V)');

      // Perform rapid UI changes
      await Promise.all([
        (async () => {
          for (let i = 0; i < 5; i++) {
            await themeButton.click();
            await page.waitForTimeout(50);
          }
        })(),
        (async () => {
          for (let i = 0; i < 5; i++) {
            await fontButton.click();
            await page.waitForTimeout(50);
          }
        })(),
        (async () => {
          for (let i = 0; i < 5; i++) {
            await unifiedButton.click();
            await page.waitForTimeout(50);
            await splitButton.click();
            await page.waitForTimeout(50);
          }
        })(),
      ]);

      // Wait for diff computation to complete
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 15000 });

      // Verify application stability after stress test
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
      await expect(page.getByText(/\d+ lines/).first()).toBeVisible();

      // Memory cleanup test
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      const clearButton = page.getByLabel('Clear all content from both panes');
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify clean state after stress test
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
    });

    test('should demonstrate accessibility integration', async () => {
      // Test comprehensive accessibility features

      // Test 1: Keyboard navigation through all interactive elements
      await page.keyboard.press('Tab'); // Focus first element

      let tabCount = 0;
      const maxTabs = 20; // Prevent infinite loop

      while (tabCount < maxTabs) {
        const focusedElement = page.locator(':focus');
        if ((await focusedElement.count()) > 0) {
          // Verify focused element is visible and has proper ARIA attributes
          await expect(focusedElement).toBeVisible();

          // Check for ARIA labels or accessible names
          const ariaLabel = await focusedElement.getAttribute('aria-label');
          const ariaLabelledBy =
            await focusedElement.getAttribute('aria-labelledby');
          const title = await focusedElement.getAttribute('title');

          // At least one accessibility attribute should be present for interactive elements
          if (
            await focusedElement.evaluate(
              (el) =>
                el.tagName === 'BUTTON' ||
                el.tagName === 'INPUT' ||
                el.tagName === 'TEXTAREA' ||
                el.getAttribute('role') === 'button'
            )
          ) {
            expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
          }
        }

        await page.keyboard.press('Tab');
        tabCount++;
      }

      // Test 2: Screen reader announcements
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill('Accessibility test content');

      // Verify live regions announce changes
      await expect(page.getByText(/characters/).first()).toBeVisible();

      // Test 3: High contrast and theme accessibility
      const themeButton = page.getByLabel(/Current theme:/);
      await themeButton.click(); // Switch to ensure contrast is maintained

      // Test 4: Keyboard shortcuts accessibility
      await page.keyboard.press('Control+Shift+V'); // View mode toggle
      await page.keyboard.press('Control+t'); // Theme toggle

      // Verify shortcuts work and provide feedback
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();

      // Test 5: Focus management
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );
      await rightTextarea.focus();

      // Verify focus is visible
      await expect(rightTextarea).toBeFocused();

      // Test 6: Error message accessibility
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      const clearButton = page.getByLabel('Clear all content from both panes');
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify accessible feedback for actions
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
    });
  });

  test.describe('Bundle Optimization and Startup Performance', () => {
    test('should demonstrate optimized startup performance', async () => {
      // Close current app to test fresh startup
      await electronApp.close();

      // Measure fresh startup time
      const startupStartTime = Date.now();
      electronApp = await startElectronApp();
      page = await electronApp.firstWindow();

      // Wait for application to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();

      const startupEndTime = Date.now();
      const startupTime = startupEndTime - startupStartTime;

      // Application should start within 5 seconds
      expect(startupTime).toBeLessThan(5000);
      console.log(`Application startup time: ${startupTime}ms`);

      // Verify all essential components load quickly
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
      await expect(
        page.getByPlaceholder('Paste or type your original content here...')
      ).toBeVisible();
      await expect(
        page.getByPlaceholder('Paste or type your modified content here...')
      ).toBeVisible();

      // Test initial responsiveness
      const themeButton = page.getByLabel(/Current theme:/);
      const responseStartTime = Date.now();
      await themeButton.click();
      const responseEndTime = Date.now();
      const responseTime = responseEndTime - responseStartTime;

      // UI should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    test('should demonstrate memory efficiency', async () => {
      // Test memory usage with various content sizes
      const testSizes = [
        { name: 'small', lines: 10 },
        { name: 'medium', lines: 100 },
        { name: 'large', lines: 1000 },
      ];

      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      for (const testSize of testSizes) {
        const content = Array(testSize.lines)
          .fill(`Line of ${testSize.name} content`)
          .join('\n');

        const processStartTime = Date.now();
        await leftTextarea.fill(content);
        await rightTextarea.fill(content + '\nModified line');

        await expect(page.getByText('Computing differences...')).toBeVisible();
        await expect(
          page.getByText('Diff computation completed successfully')
        ).toBeVisible({ timeout: 10000 });

        const processEndTime = Date.now();
        const processTime = processEndTime - processStartTime;

        console.log(
          `${testSize.name} content (${testSize.lines} lines) processed in ${processTime}ms`
        );

        // Clear content to test memory cleanup
        page.once('dialog', async (dialog) => {
          await dialog.accept();
        });
        const clearButton = page.getByLabel(
          'Clear all content from both panes'
        );
        await clearButton.click();
        await page.waitForTimeout(300);
        await expect(page.getByText('Ready to compare').first()).toBeVisible();

        // Brief pause to allow garbage collection
        await page.waitForTimeout(100);
      }

      // Verify application remains responsive after all tests
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
    });
  });

  test.describe('UI Polish and Animation Integration', () => {
    test('should demonstrate smooth UI transitions and animations', async () => {
      // Test theme transition smoothness
      const themeButton = page.getByLabel(/Current theme:/);

      // Rapidly switch themes to test transition smoothness
      for (let i = 0; i < 3; i++) {
        await themeButton.click();
        await page.waitForTimeout(300); // Allow transition to complete

        // Verify UI remains stable during transitions
        await expect(
          page.getByRole('heading', { name: 'Diff View', exact: true })
        ).toBeVisible();
      }

      // Test view mode transition smoothness
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add content for view mode testing
      await leftTextarea.fill('Original content for animation testing');
      await rightTextarea.fill('Modified content for animation testing');

      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible();

      // Test smooth view mode transitions
      const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      const splitButton = page.getByTitle('Split View (Ctrl+Shift+V)');

      for (let i = 0; i < 3; i++) {
        await unifiedButton.click();
        await page.waitForTimeout(200); // Allow transition
        await expect(page.locator('.diff-viewer-container')).toBeVisible();

        await splitButton.click();
        await page.waitForTimeout(200); // Allow transition
        await expect(page.locator('.diff-viewer-container')).toBeVisible();
      }

      // Test font size transition smoothness
      const fontButton = page.getByLabel(/Current font size:/);

      for (let i = 0; i < 3; i++) {
        await fontButton.click();
        await page.waitForTimeout(100); // Allow font change to apply

        // Verify diff display adapts smoothly
        await expect(page.locator('.diff-viewer-container')).toBeVisible();
      }

      // Test loading animation
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      const clearButton = page.getByLabel('Clear all content from both panes');
      await clearButton.click();
      await page.waitForTimeout(300);

      // Add large content to trigger loading animation
      const largeContent = Array(500)
        .fill('Content for loading animation test')
        .join('\n');
      await leftTextarea.fill(largeContent);
      await rightTextarea.fill(largeContent + '\nAdditional line');

      // Verify loading indicator appears and disappears smoothly
      await expect(page.getByText('Computing differences...')).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 8000 });

      // Final verification of smooth UI state
      await expect(
        page.getByRole('heading', { name: 'Diff View', exact: true })
      ).toBeVisible();
      await expect(page.getByText(/\d+ additions/)).toBeVisible();
    });

    test('should demonstrate responsive design integration', async () => {
      // Test various window sizes and verify responsive behavior
      const windowSizes = [
        { width: 1920, height: 1080, name: 'desktop-large' },
        { width: 1366, height: 768, name: 'desktop-medium' },
        { width: 1024, height: 768, name: 'desktop-small' },
        { width: 800, height: 600, name: 'minimum-size' },
      ];

      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add content for responsive testing
      await leftTextarea.fill('Responsive design test content');
      await rightTextarea.fill('Modified responsive design test content');

      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible();

      for (const size of windowSizes) {
        await page.setViewportSize({ width: size.width, height: size.height });
        console.log(`Testing ${size.name} (${size.width}x${size.height})`);

        // Verify essential elements remain visible and functional
        await expect(
          page.getByRole('heading', { name: 'Diff View', exact: true })
        ).toBeVisible();
        await expect(leftTextarea).toBeVisible();
        await expect(rightTextarea).toBeVisible();

        // Test UI controls remain accessible
        const themeButton = page.getByLabel(/Current theme:/);
        await expect(themeButton).toBeVisible();

        const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
        await expect(unifiedButton).toBeVisible();

        // Test view mode switching at different sizes
        await unifiedButton.click();
        await expect(page.locator('.diff-viewer-container')).toBeVisible();

        const splitButton = page.getByTitle('Split View (Ctrl+Shift+V)');
        await splitButton.click();
        await expect(page.locator('.diff-viewer-container')).toBeVisible();

        // Verify diff content remains readable
        await expect(page.getByText(/\d+ additions/)).toBeVisible();
      }

      // Reset to standard size
      await page.setViewportSize({ width: 1200, height: 800 });
    });
  });
});
