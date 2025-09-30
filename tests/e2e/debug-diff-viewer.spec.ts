import { test, expect } from '@playwright/test';
import { ElectronApplication, Page , _electron as electron } from 'playwright';

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

test.describe('Debug Diff Viewer', () => {
  test('should debug what is actually rendered', async () => {
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'debug-diff-viewer.png', fullPage: true });

    // Log the HTML content
    const bodyContent = await page.locator('body').innerHTML();
    console.log('Body content length:', bodyContent.length);
    console.log('Body content preview:', bodyContent.substring(0, 500));

    // Check for any elements with "diff" in their class or id
    const diffElements = await page
      .locator('[class*="diff"], [id*="diff"]')
      .count();
    console.log('Elements with "diff" in class/id:', diffElements);

    // Check for the main view component
    const mainView = page.locator('[class*="min-h-screen"]');
    await expect(mainView).toBeVisible();

    // Check for text areas
    const textareas = await page.locator('textarea').count();
    console.log('Number of textareas:', textareas);

    // Check for the grid layout
    const gridElements = await page.locator('[class*="grid"]').count();
    console.log('Number of grid elements:', gridElements);

    // Check for space-y elements
    const spaceYElements = await page.locator('[class*="space-y"]').count();
    console.log('Number of space-y elements:', spaceYElements);

    // Check for min-h elements
    const minHElements = await page.locator('[class*="min-h"]').count();
    console.log('Number of min-h elements:', minHElements);

    // Get the full HTML of the main content area
    const mainContent = await page
      .locator('main, [class*="flex-col"] > div')
      .first()
      .innerHTML();
    console.log('Main content HTML length:', mainContent.length);
    console.log('Main content preview:', mainContent.substring(0, 1000));

    // Check if DiffViewer component exists at all
    const diffViewerExists = await page
      .locator('.diff-viewer-container')
      .count();
    console.log('DiffViewer container count:', diffViewerExists);

    // Get the DiffViewer container content
    if (diffViewerExists > 0) {
      const diffViewerContent = await page
        .locator('.diff-viewer-container')
        .innerHTML();
      console.log('DiffViewer content:', diffViewerContent.substring(0, 500));
    }

    // Check for specific DiffViewer content
    const emptyStateText = await page
      .locator('text=Add content to both panes to see the diff')
      .count();
    console.log('Empty state text count:', emptyStateText);

    // Check for any error messages
    const errorMessages = await page.locator('text=Error').count();
    console.log('Error messages count:', errorMessages);

    // Check console logs and errors
    const logs: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`);
    });

    // Wait a bit to collect logs
    await page.waitForTimeout(1000);
    console.log('Console logs:', logs);
    console.log('Console errors:', errors);
  });
});
