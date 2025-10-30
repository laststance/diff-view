import { test, expect } from '@playwright/test';
import { Page } from 'playwright';

import { electronHelper } from '../utils/electron-helpers';

/**
 * Regression test for GitHub issue: Maximum update depth exceeded
 *
 * Bug: Deleting characters from right textarea caused infinite re-render loop
 * Root cause: useEffect in DiffViewer had computeDiff in dependencies, causing
 * circular updates when recalculateDiff() updated store state
 *
 * Fix: Removed wrapper function and call recalculateDiff() directly in useEffect
 * with only debounced content as dependencies
 */
test.describe('Infinite Loop Regression Tests', () => {
  let page: Page;

  test.beforeEach(async () => {
    await electronHelper.launch();
    page = electronHelper.getWindow();
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await electronHelper.close();
  });

  test('should not crash when deleting characters from right textarea', async () => {
    const testContent = `# Sophisicated WebApp

 - [ ] 新規AppleIDをryota.murakami@laststance.ioで作成する
 - [ ] apple developer programへ登録する

- cursor
ポート確認
あなたがmodifyしたことの挙動をvalidate`;

    // Setup error detection
    let errorDetected = false;
    page.on('pageerror', (error) => {
      console.error('Page error:', error.message);
      if (error.message.includes('Maximum update depth exceeded')) {
        errorDetected = true;
      }
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
        if (msg.text().includes('Maximum update depth exceeded')) {
          errorDetected = true;
        }
      }
    });

    // Step 1: Paste content into left textarea
    const leftTextarea = page.locator('[data-testid="textarea-left"]');
    await leftTextarea.click();
    await leftTextarea.fill(testContent);
    await page.waitForTimeout(500);

    // Step 2: Paste content into right textarea
    const rightTextarea = page.locator('[data-testid="textarea-right"]');
    await rightTextarea.click();
    await rightTextarea.fill(testContent);
    await page.waitForTimeout(1000);

    // Step 3: Delete characters one by one from right textarea
    // This was the trigger for the infinite loop bug
    await rightTextarea.click();
    await page.keyboard.press('End'); // Move to end of content

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(100);
    }

    // Wait a bit to see if any errors occur
    await page.waitForTimeout(2000);

    // Verify no infinite loop error occurred
    expect(errorDetected).toBe(false);

    // Verify app is still responsive
    const content = await rightTextarea.inputValue();
    expect(content.length).toBeLessThan(testContent.length);
  });

  test('should handle rapid content changes without crashing', async () => {
    let errorDetected = false;
    page.on('pageerror', (error) => {
      if (error.message.includes('Maximum update depth exceeded')) {
        errorDetected = true;
      }
    });

    const leftTextarea = page.locator('[data-testid="textarea-left"]');
    const rightTextarea = page.locator('[data-testid="textarea-right"]');

    // Rapidly type and delete content
    await leftTextarea.click();
    await leftTextarea.type('Hello');
    await leftTextarea.press('Backspace');
    await leftTextarea.press('Backspace');
    await leftTextarea.type('World');

    await rightTextarea.click();
    await rightTextarea.type('Test');
    await rightTextarea.press('Backspace');
    await rightTextarea.type('ing');

    await page.waitForTimeout(1000);

    expect(errorDetected).toBe(false);
  });

  test('should handle continuous character deletion without infinite loop', async () => {
    let errorDetected = false;
    page.on('pageerror', (error) => {
      if (error.message.includes('Maximum update depth exceeded')) {
        errorDetected = true;
      }
    });

    const leftTextarea = page.locator('[data-testid="textarea-left"]');
    const rightTextarea = page.locator('[data-testid="textarea-right"]');

    // Fill with substantial content
    const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n';
    await leftTextarea.fill(content);
    await rightTextarea.fill(content);
    await page.waitForTimeout(500);

    // Delete all content from right textarea character by character
    await rightTextarea.click();
    await page.keyboard.press('End');

    const charCount = content.length;
    for (let i = 0; i < Math.min(charCount, 20); i++) {
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(1000);

    expect(errorDetected).toBe(false);
  });
});
