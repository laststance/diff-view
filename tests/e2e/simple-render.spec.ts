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

  // Set up console logging
  page.on('console', (msg) => {
    console.log(`Browser Console ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', (error) => {
    console.log(`Page Error: ${error.message}`);
  });

  // Wait for the app to be ready
  await page.waitForLoadState('domcontentloaded');

  // Wait a bit more for React to render
  await page.waitForTimeout(3000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Simple Render Test', () => {
  test('should render something', async () => {
    // Take a screenshot to see what's happening
    await page.screenshot({ path: 'debug-screenshot.png' });

    // Check if there's any content
    const body = await page.locator('body').innerHTML();
    console.log('Body content length:', body.length);
    console.log('Body content preview:', body.substring(0, 500));

    // Wait a bit more to catch any delayed console messages
    await page.waitForTimeout(2000);

    // Basic check that the page loaded
    await expect(page.locator('body')).toBeVisible();

    // Check if root element exists
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();

    // Check root content
    const rootContent = await rootElement.innerHTML();
    console.log('Root content length:', rootContent.length);
    console.log('Root content preview:', rootContent.substring(0, 500));
  });
});
