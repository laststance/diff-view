import { defineConfig } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Global timeout for all tests
  timeout: 3 * 1000,
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // Electron tests should run sequentially
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Electron tests need to run one at a time
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for Electron */
  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
    },
  ],

  /* No web server needed for Electron tests */
});
