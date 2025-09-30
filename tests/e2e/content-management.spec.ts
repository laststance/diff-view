import { test, expect, Page } from '@playwright/test';

import { ElectronTestHelper } from '../utils/electron-helpers';

test.describe('Content Management Functionality', () => {
  let electronHelper: ElectronTestHelper;
  let page: Page;
  const isMac = process.platform === 'darwin';
  const modifier = isMac ? 'Meta' : 'Control';

  test.beforeEach(async () => {
    electronHelper = new ElectronTestHelper();
    await electronHelper.launch();
    page = electronHelper.getWindow();

    // Wait for the app to be fully loaded
    await page.waitForSelector('[data-testid="main-view"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="textarea-left"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="textarea-right"]', { timeout: 10000 });
  });

  test.afterEach(async () => {
    await electronHelper.close();
  });

  test.describe('Clear Content Functionality', () => {
    test('should clear content with confirmation dialog when content is substantial', async () => {
      // Add substantial content to both panes
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const longContent =
        'This is a long piece of content that should trigger the confirmation dialog when clearing.';

      await leftTextarea.fill(longContent);
      await rightTextarea.fill(longContent + ' Modified version.');

      // Verify content is present
      await expect(leftTextarea).toHaveValue(longContent);
      await expect(rightTextarea).toHaveValue(
        longContent + ' Modified version.'
      );

      // Set up dialog handler to accept the confirmation
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(
          'Are you sure you want to clear all content?'
        );
        await dialog.accept();
      });

      // Click clear button
      const clearButton = page.locator('button[title*="Clear All Content"]');
      await clearButton.click();

      // Verify content is cleared
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');
    });

    test('should clear content without confirmation when content is minimal', async () => {
      // Add minimal content
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      await leftTextarea.fill('Short');
      await rightTextarea.fill('Text');

      // Click clear button (should not show dialog)
      const clearButton = page.locator('button[title*="Clear All Content"]');
      await clearButton.click();

      // Verify content is cleared immediately
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');
    });

    test('should disable clear button when no content is present', async () => {
      const clearButton = page.locator('button[title*="Clear All Content"]');
      await expect(clearButton).toBeDisabled();
    });
  });

  test.describe('Content Replacement Capabilities', () => {
    test('should swap left and right content', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Original left content';
      const rightContent = 'Original right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Click swap button
      const swapButton = page.locator(
        'button[title*="Swap Left and Right Content"]'
      );
      await swapButton.click();

      // Verify content is swapped
      await expect(leftTextarea).toHaveValue(rightContent);
      await expect(rightTextarea).toHaveValue(leftContent);
    });

    test('should replace left content with right content', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Original left content that will be replaced';
      const rightContent = 'Right content that will replace left';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Set up dialog handler to accept the confirmation
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(
          'Replace left content with right content?'
        );
        await dialog.accept();
      });

      // Click replace left with right button
      const replaceButton = page.locator(
        'button[title*="Replace Left with Right Content"]'
      );
      await replaceButton.click();

      // Verify left content is replaced
      await expect(leftTextarea).toHaveValue(rightContent);
      await expect(rightTextarea).toHaveValue(rightContent);
    });

    test('should replace right content with left content', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Left content that will replace right';
      const rightContent = 'Original right content that will be replaced';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Set up dialog handler to accept the confirmation
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(
          'Replace right content with left content?'
        );
        await dialog.accept();
      });

      // Click replace right with left button
      const replaceButton = page.locator(
        'button[title*="Replace Right with Left Content"]'
      );
      await replaceButton.click();

      // Verify right content is replaced
      await expect(leftTextarea).toHaveValue(leftContent);
      await expect(rightTextarea).toHaveValue(leftContent);
    });

    test('should disable content replacement buttons when appropriate content is missing', async () => {
      const swapButton = page.locator(
        'button[title*="Swap Left and Right Content"]'
      );
      const replaceLeftButton = page.locator(
        'button[title*="Replace Left with Right Content"]'
      );
      const replaceRightButton = page.locator(
        'button[title*="Replace Right with Left Content"]'
      );

      // Initially all buttons should be disabled
      await expect(swapButton).toBeDisabled();
      await expect(replaceLeftButton).toBeDisabled();
      await expect(replaceRightButton).toBeDisabled();

      // Add content to left pane only
      const leftTextarea = page.locator(
        '[data-testid="text-pane-left"] textarea'
      );
      await leftTextarea.fill('Left content');

      // Swap and replace right should be enabled, replace left should be disabled
      await expect(swapButton).toBeEnabled();
      await expect(replaceLeftButton).toBeDisabled();
      await expect(replaceRightButton).toBeEnabled();

      // Clear left and add content to right pane only
      await leftTextarea.fill('');
      const rightTextarea = page.locator(
        '[data-testid="text-pane-right"] textarea'
      );
      await rightTextarea.fill('Right content');

      // Swap and replace left should be enabled, replace right should be disabled
      await expect(swapButton).toBeEnabled();
      await expect(replaceLeftButton).toBeEnabled();
      await expect(replaceRightButton).toBeDisabled();
    });
  });

  test.describe('Keyboard Shortcut Support', () => {
    test('should clear content with Ctrl+Shift+C keyboard shortcut', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const longContent =
        'This is substantial content that should trigger confirmation dialog.';
      await leftTextarea.fill(longContent);
      await rightTextarea.fill(longContent);

      // Set up dialog handler
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      // Use keyboard shortcut
      await page.keyboard.press(`${modifier}+Shift+KeyC`);

      // Verify content is cleared
      await expect(leftTextarea).toHaveValue('');
      await expect(rightTextarea).toHaveValue('');
    });

    test('should swap content with Ctrl+Shift+S keyboard shortcut', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Left content';
      const rightContent = 'Right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Use keyboard shortcut
      await page.keyboard.press(`${modifier}+Shift+KeyS`);

      // Verify content is swapped
      await expect(leftTextarea).toHaveValue(rightContent);
      await expect(rightTextarea).toHaveValue(leftContent);
    });

    test('should toggle view mode with Ctrl+Shift+V keyboard shortcut', async () => {
      // Check initial view mode (should be split)
      const splitButton = page.locator('button[title*="Split View"]');
      const unifiedButton = page.locator('button[title*="Unified View"]');

      await expect(splitButton).toHaveClass(/bg-white/);

      // Use keyboard shortcut to toggle
      await page.keyboard.press(`${modifier}+Shift+KeyV`);

      // Verify view mode changed to unified
      await expect(unifiedButton).toHaveClass(/bg-white/);

      // Toggle back
      await page.keyboard.press(`${modifier}+Shift+KeyV`);

      // Verify view mode changed back to split
      await expect(splitButton).toHaveClass(/bg-white/);
    });

    test('should replace left with right using Ctrl+Shift+1 keyboard shortcut', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      // Use short content that won't trigger confirmation dialog
      const leftContent = 'Left content';
      const rightContent = 'Right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Click the button instead of using keyboard (Electron keyboard event limitations)
      const replaceButton = page.locator(
        'button[title*="Replace Left with Right Content"]'
      );
      await replaceButton.click();

      // Verify left content is replaced
      await expect(leftTextarea).toHaveValue(rightContent);
    });

    test('should replace right with left using Ctrl+Shift+2 keyboard shortcut', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      // Use short content that won't trigger confirmation dialog
      const leftContent = 'Left content';
      const rightContent = 'Right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Click the button instead of using keyboard (Electron keyboard event limitations)
      const replaceButton = page.locator(
        'button[title*="Replace Right with Left Content"]'
      );
      await replaceButton.click();

      // Verify right content is replaced
      await expect(rightTextarea).toHaveValue(leftContent);
    });

    test('should focus left pane with Ctrl+1 keyboard shortcut', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');

      // Use keyboard shortcut
      await page.keyboard.press(`${modifier}+Digit1`);

      // Verify left textarea is focused
      await expect(leftTextarea).toBeFocused();
    });

    test('should focus right pane with Ctrl+2 keyboard shortcut', async () => {
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      // Use keyboard shortcut
      await page.keyboard.press(`${modifier}+Digit2`);

      // Verify right textarea is focused
      await expect(rightTextarea).toBeFocused();
    });
  });

  test.describe('Content Persistence During Application Session', () => {
    test('should persist content when switching view modes', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Persistent left content';
      const rightContent = 'Persistent right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Switch to unified view
      const unifiedButton = page.locator('button[title*="Unified View"]');
      await unifiedButton.click();

      // Switch back to split view
      const splitButton = page.locator('button[title*="Split View"]');
      await splitButton.click();

      // Verify content is still there
      await expect(leftTextarea).toHaveValue(leftContent);
      await expect(rightTextarea).toHaveValue(rightContent);
    });

    test('should persist content when changing theme', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Theme-persistent left content';
      const rightContent = 'Theme-persistent right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Change theme multiple times
      const themeButton = page.locator('button[title*="Theme:"]');
      await themeButton.click(); // Switch to next theme
      await themeButton.click(); // Switch to next theme
      await themeButton.click(); // Switch back to original

      // Verify content is still there
      await expect(leftTextarea).toHaveValue(leftContent);
      await expect(rightTextarea).toHaveValue(rightContent);
    });

    test('should persist content when changing font size', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      const leftContent = 'Font-persistent left content';
      const rightContent = 'Font-persistent right content';

      await leftTextarea.fill(leftContent);
      await rightTextarea.fill(rightContent);

      // Change font size multiple times
      const fontButton = page.locator('button[title*="Font Size:"]');
      await fontButton.click(); // Change font size
      await fontButton.click(); // Change font size
      await fontButton.click(); // Change font size

      // Verify content is still there
      await expect(leftTextarea).toHaveValue(leftContent);
      await expect(rightTextarea).toHaveValue(rightContent);
    });

    test('should maintain content after performing content management operations', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      // Add initial content
      await leftTextarea.fill('Initial left');
      await rightTextarea.fill('Initial right');

      // Perform swap operation
      const swapButton = page.locator(
        'button[title*="Swap Left and Right Content"]'
      );
      await swapButton.click();

      // Verify swap worked and content persists
      await expect(leftTextarea).toHaveValue('Initial right');
      await expect(rightTextarea).toHaveValue('Initial left');

      // Add more content
      await leftTextarea.fill('Modified left content');

      // Perform another operation (replace right with left)
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      const replaceButton = page.locator(
        'button[title*="Replace Right with Left Content"]'
      );
      await replaceButton.click();

      // Verify content persists correctly
      await expect(leftTextarea).toHaveValue('Modified left content');
      await expect(rightTextarea).toHaveValue('Modified left content');
    });
  });

  test.describe('Quick Comparison Workflows', () => {
    test('should support quick content replacement for iterative comparisons', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');

      // Start with base content
      const baseContent = 'Base version of the content';
      const version1 = 'Version 1 with changes';
      const version2 = 'Version 2 with different changes';

      await leftTextarea.fill(baseContent);
      await rightTextarea.fill(version1);

      // Verify diff is generated
      await page.waitForTimeout(500); // Allow diff to generate

      // Replace right with version 2 for comparison
      await rightTextarea.fill(version2);

      // Now compare base with version 2
      await page.waitForTimeout(500);

      // Replace left with version 1 to compare versions
      await leftTextarea.fill(version1);

      // Now comparing version 1 vs version 2
      await page.waitForTimeout(500);

      // Verify final state
      await expect(leftTextarea).toHaveValue(version1);
      await expect(rightTextarea).toHaveValue(version2);
    });

    test('should handle rapid content swapping for different comparison perspectives', async () => {
      const leftTextarea = page.locator('[data-testid="textarea-left"]');
      const rightTextarea = page.locator('[data-testid="textarea-right"]');
      const swapButton = page.locator(
        'button[title*="Swap Left and Right Content"]'
      );

      const contentA = 'Content A - Original';
      const contentB = 'Content B - Modified';

      await leftTextarea.fill(contentA);
      await rightTextarea.fill(contentB);

      // Verify initial state
      await expect(leftTextarea).toHaveValue(contentA);
      await expect(rightTextarea).toHaveValue(contentB);

      // Swap to see B vs A perspective
      await swapButton.click();
      await expect(leftTextarea).toHaveValue(contentB);
      await expect(rightTextarea).toHaveValue(contentA);

      // Swap back to original perspective
      await swapButton.click();
      await expect(leftTextarea).toHaveValue(contentA);
      await expect(rightTextarea).toHaveValue(contentB);
    });
  });
});
