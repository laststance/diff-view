import { test, expect } from '@playwright/test';
import { Page } from 'playwright';

import { electronHelper } from '../utils/electron-helpers';

test.describe('UI Layout and Components', () => {
  let page: Page;

  test.beforeEach(async () => {
    await electronHelper.launch();
    page = electronHelper.getWindow();

    // Wait for the app to be fully loaded
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await electronHelper.close();
  });

  test.describe('Layout Component', () => {
    test('should render main layout structure correctly', async () => {
      // Check header exists
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Check main content area exists
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check footer/status bar exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should display branding with GitCompare icon', async () => {
      // Check for the GitCompare icon (Lucide React icon)
      const gitCompareIcon = page.locator('svg.lucide-git-compare');
      await expect(gitCompareIcon).toBeVisible();

      // Check for application title
      await expect(page.locator('h1')).toContainText('Diff View');

      // Check for subtitle
      await expect(
        page.locator('text=Compare text with GitHub-style visualization')
      ).toBeVisible();
    });

    test('should show status bar with default state', async () => {
      // Check status bar shows "Ready to compare" when no content
      await expect(page.locator('footer')).toContainText('Ready to compare');

      // Check offline mode indicator
      await expect(page.locator('footer')).toContainText('Offline Mode');
    });

    test('should update status bar with diff stats when content is present', async () => {
      // Add some content to both text areas
      const leftTextarea = page.locator('textarea').first();
      const rightTextarea = page.locator('textarea').last();

      await leftTextarea.fill('Line 1\nLine 2\nLine 3');
      await rightTextarea.fill('Line 1\nModified Line 2\nLine 3\nNew Line 4');

      // Wait for status bar to update
      await page.waitForTimeout(100);

      // Check that diff stats are displayed
      await expect(page.locator('footer')).toContainText('additions');
      await expect(page.locator('footer')).toContainText('deletions');
      await expect(page.locator('footer')).toContainText('changes');
    });
  });

  test.describe('Toolbar Component', () => {
    test('should display view mode toggle buttons', async () => {
      // Check split view button
      const splitViewButton = page.locator('button[title="Split View"]');
      await expect(splitViewButton).toBeVisible();

      // Check unified view button
      const unifiedViewButton = page.locator('button[title="Unified View"]');
      await expect(unifiedViewButton).toBeVisible();

      // One of the buttons should be active (have bg-white class)
      const splitActive = await splitViewButton.evaluate((el) =>
        el.className.includes('bg-white')
      );
      const unifiedActive = await unifiedViewButton.evaluate((el) =>
        el.className.includes('bg-white')
      );
      expect(splitActive || unifiedActive).toBe(true);
    });

    test('should toggle between split and unified view modes', async () => {
      const splitViewButton = page.locator('button[title="Split View"]');
      const unifiedViewButton = page.locator('button[title="Unified View"]');

      // Determine initial state
      const initialSplitActive = await splitViewButton.evaluate((el) =>
        el.className.includes('bg-white')
      );

      if (initialSplitActive) {
        // Start with split active, click unified
        await unifiedViewButton.click();
        await expect(unifiedViewButton).toHaveClass(/bg-white/);
        await expect(splitViewButton).not.toHaveClass(/bg-white/);

        // Click split view again
        await splitViewButton.click();
        await expect(splitViewButton).toHaveClass(/bg-white/);
        await expect(unifiedViewButton).not.toHaveClass(/bg-white/);
      } else {
        // Start with unified active, click split
        await splitViewButton.click();
        await expect(splitViewButton).toHaveClass(/bg-white/);
        await expect(unifiedViewButton).not.toHaveClass(/bg-white/);

        // Click unified view again
        await unifiedViewButton.click();
        await expect(unifiedViewButton).toHaveClass(/bg-white/);
        await expect(splitViewButton).not.toHaveClass(/bg-white/);
      }
    });

    test('should display theme toggle button with correct icon', async () => {
      const themeButton = page.locator('button[title*="Theme:"]');
      await expect(themeButton).toBeVisible();

      // Should show one of the theme icons (monitor, sun, or moon)
      const themeIcons = await page
        .locator('svg.lucide-monitor, svg.lucide-sun, svg.lucide-moon')
        .count();
      expect(themeIcons).toBeGreaterThan(0);
    });

    test('should cycle through theme options', async () => {
      const themeButton = page.locator('button[title*="Theme:"]');

      // Get initial icon class
      const initialIcon = await themeButton.locator('svg').getAttribute('class');

      // Click three times to cycle through all themes (light → dark → system)
      await themeButton.click();
      const secondIcon = await themeButton.locator('svg').getAttribute('class');
      expect(secondIcon).not.toBe(initialIcon);

      await themeButton.click();
      const thirdIcon = await themeButton.locator('svg').getAttribute('class');
      expect(thirdIcon).not.toBe(secondIcon);

      await themeButton.click();
      const finalIcon = await themeButton.locator('svg').getAttribute('class');

      // After three clicks, should cycle back to initial state
      expect(finalIcon).toBe(initialIcon);
    });

    test('should display font size control', async () => {
      const fontSizeButton = page.locator('button[title*="Font Size:"]');
      await expect(fontSizeButton).toBeVisible();

      // Font size button should exist and be clickable
      // The actual icon/text depends on persisted state (small/medium/large)
    });

    test('should cycle through font sizes', async () => {
      const fontSizeButton = page.locator('button[title*="Font Size:"]');

      // Get initial state from title attribute
      const initialTitle = await fontSizeButton.getAttribute('title');

      // Click three times to cycle through all sizes (small → medium → large → small)
      await fontSizeButton.click();
      const secondTitle = await fontSizeButton.getAttribute('title');
      expect(secondTitle).not.toBe(initialTitle);

      await fontSizeButton.click();
      const thirdTitle = await fontSizeButton.getAttribute('title');
      expect(thirdTitle).not.toBe(secondTitle);

      await fontSizeButton.click();
      const finalTitle = await fontSizeButton.getAttribute('title');

      // After three clicks, should cycle back to initial state
      expect(finalTitle).toBe(initialTitle);
    });

    test('should display clear content button', async () => {
      const clearButton = page.locator('button[title="Clear All Content"]');
      await expect(clearButton).toBeVisible();

      // Should show Trash2 icon
      const trashIcon = clearButton.locator('svg.lucide-trash-2');
      await expect(trashIcon).toBeVisible();

      // Should be disabled when no content
      await expect(clearButton).toBeDisabled();
    });

    test('should enable clear button when content is present', async () => {
      const clearButton = page.locator('button[title="Clear All Content"]');
      const leftTextarea = page.locator('textarea').first();

      // Add some content
      await leftTextarea.fill('Some content');

      // Clear button should now be enabled
      await expect(clearButton).toBeEnabled();
    });

    test('should display reset button', async () => {
      const resetButton = page.locator('button[title="Reset Application"]');
      await expect(resetButton).toBeVisible();

      // Should show RotateCcw icon
      const resetIcon = resetButton.locator('svg.lucide-rotate-ccw');
      await expect(resetIcon).toBeVisible();
    });

    test('should display disabled settings button', async () => {
      const settingsButton = page.locator(
        'button[title="Settings (Coming Soon)"]'
      );
      await expect(settingsButton).toBeVisible();
      await expect(settingsButton).toBeDisabled();

      // Should show Settings icon
      const settingsIcon = settingsButton.locator('svg.lucide-settings');
      await expect(settingsIcon).toBeVisible();
    });
  });

  test.describe('Lucide React Icons', () => {
    test('should display all required icons correctly', async () => {
      // Header icons
      await expect(page.locator('svg.lucide-git-compare')).toBeVisible();

      // Toolbar icons
      await expect(
        page.locator('svg.lucide-square-split-horizontal')
      ).toBeVisible();
      await expect(page.locator('svg.lucide-text-align-start')).toBeVisible();
      await expect(page.locator('svg.lucide-trash-2')).toBeVisible();
      await expect(page.locator('svg.lucide-rotate-ccw')).toBeVisible();
      await expect(page.locator('svg.lucide-settings')).toBeVisible();

      // Theme icon (one of: monitor, sun, moon)
      const themeIcons = await page
        .locator(
          'svg.lucide-monitor, svg.lucide-sun, svg.lucide-moon'
        )
        .count();
      expect(themeIcons).toBeGreaterThan(0);

      // Font size icon (one of: zoom-out, zoom-in) or Aa text
      const fontSizeButton = page.locator('button[title*="Font Size:"]');
      await expect(fontSizeButton).toBeVisible();

      // Content area icons - file-text icons appear in pane headers and file upload areas
      await expect(page.locator('svg.lucide-file-text')).toHaveCount(4); // 2 pane headers + 2 upload areas
    });

    test('should have proper accessibility attributes on icons', async () => {
      const icons = page.locator('svg[aria-hidden="true"]');
      const iconCount = await icons.count();

      // All icons should have aria-hidden="true" for accessibility
      expect(iconCount).toBeGreaterThan(0);

      // Check that parent buttons have proper titles for screen readers
      await expect(page.locator('button[title="Split View"]')).toBeVisible();
      await expect(page.locator('button[title="Unified View"]')).toBeVisible();
      await expect(page.locator('button[title*="Theme:"]')).toBeVisible();
      await expect(page.locator('button[title*="Font Size:"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for different screen sizes', async () => {
      // Test desktop size (default)
      await page.setViewportSize({ width: 1200, height: 800 });

      // Content should be in grid layout
      const contentGrid = page.locator('.grid');
      await expect(contentGrid).toBeVisible();

      // Test tablet size
      await page.setViewportSize({ width: 768, height: 600 });

      // Layout should still be functional
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });

      // Layout should adapt to smaller screen
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should maintain toolbar functionality on smaller screens', async () => {
      await page.setViewportSize({ width: 768, height: 600 });

      // Toolbar buttons should still be clickable
      const splitViewButton = page.locator('button[title="Split View"]');
      const unifiedViewButton = page.locator('button[title="Unified View"]');

      await expect(splitViewButton).toBeVisible();
      await expect(unifiedViewButton).toBeVisible();

      // Should be able to toggle view mode
      await unifiedViewButton.click();
      await expect(unifiedViewButton).toHaveClass(/bg-white/);
    });
  });

  test.describe('Content Areas', () => {
    test('should display left and right content panes', async () => {
      // Check both textareas are present
      const textareas = page.locator('textarea');
      await expect(textareas).toHaveCount(2);

      // Check pane headers
      await expect(page.locator('text=Original')).toBeVisible();
      await expect(page.locator('text=Modified')).toBeVisible();

      // Check placeholders
      await expect(page.locator('textarea').first()).toHaveAttribute(
        'placeholder',
        'Paste or type your original content here...'
      );
      await expect(page.locator('textarea').last()).toHaveAttribute(
        'placeholder',
        'Paste or type your modified content here...'
      );
    });

    test('should accept content in text panes', async () => {
      const leftTextarea = page.locator('textarea').first();
      const rightTextarea = page.locator('textarea').last();

      // Add content to left pane
      await leftTextarea.fill('Hello\nWorld');
      await expect(leftTextarea).toHaveValue('Hello\nWorld');

      // Add content to right pane
      await rightTextarea.fill('Hello\nWorld\nTest');
      await expect(rightTextarea).toHaveValue('Hello\nWorld\nTest');
    });

    test('should apply font size changes to content areas', async () => {
      const fontSizeButton = page.locator('button[title*="Font Size:"]');
      const leftTextarea = page.locator('textarea').first();

      // Add some content
      await leftTextarea.fill('Sample text for font size testing');

      // Get initial classes
      const initialClasses = await leftTextarea.getAttribute('class');

      // Click to cycle font size
      await fontSizeButton.click();
      const secondClasses = await leftTextarea.getAttribute('class');
      expect(secondClasses).not.toBe(initialClasses);

      // Click again to cycle
      await fontSizeButton.click();
      const thirdClasses = await leftTextarea.getAttribute('class');
      expect(thirdClasses).not.toBe(secondClasses);

      // Click once more to cycle back
      await fontSizeButton.click();
      const finalClasses = await leftTextarea.getAttribute('class');
      expect(finalClasses).toBe(initialClasses);
    });
  });
});
