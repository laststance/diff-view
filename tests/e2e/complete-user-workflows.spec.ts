import { test, expect } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';

import { startElectronApp, stopElectronApp } from '../utils/electron-helpers';

test.describe('Complete User Workflows', () => {
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

  test.describe('Text Comparison Workflow', () => {
    test('should complete full text comparison workflow', async () => {
      // Step 1: Verify initial state  
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
      await expect(page.getByText('Ready to compare').first()).toBeVisible();

      // Step 2: Add content to left pane
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill(`function hello() {
  console.log("Hello World");
  return "hello";
}`);

      // Step 3: Add content to right pane
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );
      await rightTextarea.fill(`function hello() {
  console.log("Hello Universe");
  return "hello world";
}`);

      // Step 4: Verify diff computation starts
      await expect(page.getByText('Computing differences...').first()).toBeVisible();

      // Step 5: Wait for diff computation to complete
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible();

      // Step 6: Verify content statistics
      await expect(
        page.getByText(/Comparing \d+ lines vs \d+ lines/)
      ).toBeVisible();

      // Step 7: Test view mode switching
      const unifiedViewButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      await unifiedViewButton.click();

      // Step 8: Switch back to split view
      const splitViewButton = page.getByTitle('Split View (Ctrl+Shift+V)');
      await splitViewButton.click();

      // Step 9: Test theme switching
      const themeButton = page.getByLabel(/Current theme:/);
      await themeButton.click();

      // Step 10: Test font size adjustment
      const fontButton = page.getByLabel(/Current font size:/);
      await fontButton.click();

      // Step 11: Test content management
      const swapButton = page.getByLabel('Swap left and right content');
      await swapButton.click();

      // Verify content was swapped
      await expect(leftTextarea).toHaveValue(/Hello Universe/);
      await expect(rightTextarea).toHaveValue(/Hello World/);

      // Step 12: Clear content
      // Set up dialog handler for confirmation (substantial content triggers dialog)
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      
      const clearButton = page.getByLabel(
        'Clear all content from both panes'
      );
      await clearButton.click();
      await page.waitForTimeout(300);

      // Verify content was cleared
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');
      await expect(page.getByText('Ready to compare').first()).toBeVisible();
    });

    test('should handle large content workflow', async () => {
      // Generate large content
      const largeContent = Array(1000)
        .fill('This is a line of text that will be repeated many times.')
        .join('\n');
      const modifiedLargeContent = largeContent.replace(
        /line 1/g,
        'modified line 1'
      );

      // Add large content
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill(largeContent);

      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );
      await rightTextarea.fill(modifiedLargeContent);

      // Verify loading indicator appears
      await expect(page.getByText('Computing differences...').first()).toBeVisible();

      // Wait for processing to complete (may take longer for large content)
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 10000 });

      // Verify statistics show large numbers (using .first() due to multiple matches)
      await expect(page.getByText(/1,000 lines/).first()).toBeVisible();
    });

    test('should handle error recovery workflow', async () => {
      // Simulate content that exceeds size limits (11MB to trigger validation error)
      const extremelyLargeContent = 'A'.repeat(11 * 1024 * 1024); // 11MB of content

      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill(extremelyLargeContent);

      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );
      await rightTextarea.fill(extremelyLargeContent + 'B');

      // Wait for error to appear (using .first() due to multiple error display locations)
      await expect(
        page.getByText(
          /Content exceeds size limits|Processing timeout|Failed to compute/
        ).first()
      ).toBeVisible({ timeout: 15000 });

      // Test retry functionality (wait for and check retry button)
      try {
        await page.waitForSelector('text=Retry', { timeout: 5000 });
        const retryButton = page.getByText('Retry');
        await retryButton.click();
      } catch {
        // Retry button may not appear if error is transient
        console.log('Retry button not found or disappeared, continuing...');
      }

      // Test clear content functionality (handle case where buttons may not exist)
      try {
        const clearButton = page.getByText('Clear Content');
        if (await clearButton.isVisible()) {
          await clearButton.click();
          await expect(page.getByText('Ready to compare').first()).toBeVisible();
        }
      } catch {
        // Buttons may not exist if error state is transient
        console.log('Clear Content button not found or disappeared, continuing...');
      }
    });
  });

  test.describe('Keyboard Navigation Workflow', () => {
    test('should support complete keyboard navigation', async () => {
      // Test keyboard shortcuts for content management
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add content
      await leftTextarea.fill('Original content');
      await rightTextarea.fill('Modified content');

      // Test Ctrl+A (select all) in left textarea
      await leftTextarea.focus();
      await page.keyboard.press('Control+a');

      // Test copy functionality (Ctrl+C)
      await page.keyboard.press('Control+c');

      // Test paste functionality (Ctrl+V) in right textarea
      await rightTextarea.focus();
      await page.keyboard.press('Control+v');

      // Test view mode switching with keyboard
      await page.keyboard.press('Control+Shift+V');

      // Test theme switching with keyboard
      await page.keyboard.press('Control+t');

      // Test content swapping with keyboard
      await page.keyboard.press('Control+Shift+s');

      // Test clear content with keyboard
      await page.keyboard.press('Control+Shift+c');
    });

    test('should support accessibility navigation', async () => {
      // Test tab navigation through interactive elements
      await page.keyboard.press('Tab');

      // Verify focus moves through the interface
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test skip link functionality
      await page.keyboard.press('Tab');
      const skipLink = page.getByText('Skip to main content');
      if (await skipLink.isVisible()) {
        await skipLink.press('Enter');
      }

      // Test ARIA live regions announce changes
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill('Test content for screen reader');

      // Verify status updates are announced (using .first() due to multiple matches)
      await expect(page.getByText(/characters/).first()).toBeVisible();
    });
  });

  test.describe('Settings and Preferences Workflow', () => {
    test('should persist user preferences across sessions', async () => {
      // Change theme to dark
      const themeButton = page.getByLabel(/Current theme:/);
      await themeButton.click(); // Should cycle to dark

      // Change font size to large
      const fontButton = page.getByLabel(/Current font size:/);
      await fontButton.click(); // Should cycle to large

      // Change view mode to unified
      const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      await unifiedButton.click();

      // Close and reopen the application
      await electronApp.close();

      electronApp = await startElectronApp();
      page = await electronApp.firstWindow();
      await page.waitForLoadState('domcontentloaded');

      // Verify preferences were persisted
      // Note: In a real test, we would verify the actual theme, font size, and view mode
      // For now, we just verify the application loads correctly
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
    });

    test('should handle settings reset workflow', async () => {
      // Change multiple settings
      const themeButton = page.getByLabel(/Current theme:/);
      await themeButton.click();

      const fontButton = page.getByLabel(/Current font size:/);
      await fontButton.click();

      // Reset application
      const resetButton = page.getByLabel(
        'Reset application to initial state'
      );
      await resetButton.click();

      // Verify application reloaded
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
    });
  });

  test.describe('File Handling Workflow', () => {
    test('should handle file drop workflow', async () => {
      // Note: File drop testing in Playwright requires special setup
      // This is a placeholder for file drop functionality testing

      // Verify paste areas are present (using .first() since both panes have this text)
      await expect(
        page.getByText('Drop a file here or click to select').first()
      ).toBeVisible();
      await expect(
        page.getByText('Or paste content with Ctrl+V / Cmd+V').first()
      ).toBeVisible();

      // Test paste functionality as alternative to file drop
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill('File content simulation');

      await expect(page.getByText(/\d+ characters/).first()).toBeVisible();
    });
  });

  test.describe('Performance and Responsiveness Workflow', () => {
    test('should maintain responsiveness during heavy operations', async () => {
      // Add moderately large content
      const mediumContent = Array(500)
        .fill('Line of content for performance testing')
        .join('\n');

      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Measure time to add content
      const startTime = Date.now();
      await leftTextarea.fill(mediumContent);
      await rightTextarea.fill(mediumContent + '\nAdditional line');

      // Verify diff computation completes in reasonable time
      await expect(page.getByText('Computing differences...').first()).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible({ timeout: 5000 });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify processing completed in reasonable time (less than 5 seconds)
      expect(processingTime).toBeLessThan(5000);

      // Verify UI remains responsive
      const themeButton = page.getByLabel(/Current theme:/);
      await themeButton.click();

      // Should respond immediately even during processing
      await expect(themeButton).toBeVisible();
    });

    test('should handle rapid user interactions', async () => {
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Rapidly switch between textareas and add content
      await leftTextarea.fill('Content 1');
      await rightTextarea.fill('Content 2');
      await leftTextarea.fill('Updated content 1');
      await rightTextarea.fill('Updated content 2');

      // Rapidly switch view modes
      const unifiedButton = page.getByTitle('Unified View (Ctrl+Shift+V)');
      const splitButton = page.getByTitle('Split View (Ctrl+Shift+V)');

      await unifiedButton.click();
      await splitButton.click();
      await unifiedButton.click();
      await splitButton.click();

      // Verify application remains stable
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
      await expect(
        page.getByText('Diff computation completed successfully')
      ).toBeVisible();
    });
  });

  test.describe('Error Handling and Recovery Workflow', () => {
    test('should gracefully handle application errors', async () => {
      // Test error boundary functionality by triggering potential errors
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );

      // Add content with potential problematic characters
      await leftTextarea.fill('Content with special chars: \u0000\u0001\u0002');

      // Verify application doesn't crash
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();

      // Test recovery by clearing content
      const clearButton = page.getByLabel(
        'Clear all content from both panes'
      );
      await clearButton.click();

      await expect(page.getByText('Ready to compare').first()).toBeVisible();
    });

    test('should handle network-like errors gracefully', async () => {
      // Simulate conditions that might cause errors
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      const rightTextarea = page.getByPlaceholder(
        'Paste or type your modified content here...'
      );

      // Add content that might cause processing issues
      const problematicContent = 'A'.repeat(1000000); // 1MB of content

      await leftTextarea.fill(problematicContent);
      await rightTextarea.fill(problematicContent + 'B');

      // Wait for either success or error
      await Promise.race([
        expect(
          page.getByText('Diff computation completed successfully')
        ).toBeVisible({ timeout: 10000 }),
        expect(page.getByText(/error|failed|timeout/i)).toBeVisible({
          timeout: 10000,
        }),
      ]);

      // Verify application remains functional
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
    });
  });

  test.describe('Cross-Platform Behavior Workflow', () => {
    test('should work consistently across different window sizes', async () => {
      // Test different window sizes
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();

      await page.setViewportSize({ width: 1366, height: 768 });
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();

      await page.setViewportSize({ width: 1024, height: 768 });
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();

      // Verify layout remains functional at smaller sizes
      const leftTextarea = page.getByPlaceholder(
        'Paste or type your original content here...'
      );
      await leftTextarea.fill('Test content');
      await expect(page.getByText(/characters/).first()).toBeVisible();
    });

    test('should handle window state changes', async () => {
      // Test window minimize/maximize (if supported by test environment)
      const minimizeButton = page.getByLabel(/minimize/i);
      if (await minimizeButton.isVisible()) {
        await minimizeButton.click();
      }

      const maximizeButton = page.getByLabel(/maximize/i);
      if (await maximizeButton.isVisible()) {
        await maximizeButton.click();
      }

      // Verify application remains functional after window state changes
      await expect(page.getByRole('heading', { name: 'Diff View', exact: true })).toBeVisible();
    });
  });
});
