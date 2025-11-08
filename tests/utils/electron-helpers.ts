import type { ElectronApplication, Page } from 'playwright';

import { launchElectronApp } from '../e2e/helpers/launchElectronApp';

export class ElectronTestHelper {
  private app: ElectronApplication | null = null;
  private window: Page | null = null;

  async launch(): Promise<void> {
    this.app = await launchElectronApp();

    this.window = await this.app.firstWindow();
    await this.window.waitForLoadState('domcontentloaded');

    // Wait for the React app to be ready
    await this.window.waitForSelector('#root', { timeout: 10000 });
  }

  async close(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = null;
      this.window = null;
    }
  }

  getApp(): ElectronApplication {
    if (!this.app) {
      throw new Error('Electron app not launched. Call launch() first.');
    }
    return this.app;
  }

  getWindow(): Page {
    if (!this.window) {
      throw new Error('Electron window not available. Call launch() first.');
    }
    return this.window;
  }

  async waitForAppReady(): Promise<void> {
    const window = this.getWindow();
    await window.waitForSelector('#root', { timeout: 10000 });
  }

  async takeScreenshot(name: string): Promise<void> {
    const window = this.getWindow();
    await window.screenshot({ path: `tests/screenshots/${name}.png` });
  }

  async getWindowTitle(): Promise<string> {
    const window = this.getWindow();
    return window.title();
  }

  async isWindowVisible(): Promise<boolean> {
    const window = this.getWindow();
    // Check if the window/page is visible by checking if it's not closed
    return !window.isClosed();
  }
}

export const electronHelper = new ElectronTestHelper();

// Helper functions for simple test cases
export async function startElectronApp(): Promise<ElectronApplication> {
  return launchElectronApp();
}

export async function stopElectronApp(app: ElectronApplication): Promise<void> {
  await app.close();
}
