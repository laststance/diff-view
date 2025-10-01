import { ElectronApplication, _electron as electron, Page } from 'playwright';

export class ElectronTestHelper {
  private app: ElectronApplication | null = null;
  private window: Page | null = null;

  async launch(): Promise<void> {
    this.app = await electron.launch({
      args: ['.'],
      cwd: process.cwd(),
      env: {
        ...process.env,
        ELECTRON_TEST_MODE: 'true',
      },
    });

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
    return await window.title();
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
  const app = await electron.launch({
    args: ['.'],
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELECTRON_TEST_MODE: 'true',
    },
  });
  return app;
}

export async function stopElectronApp(app: ElectronApplication): Promise<void> {
  await app.close();
}
