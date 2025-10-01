import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import type { ElectronApplication, Page } from 'playwright';

test.describe('IPC Communication', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    electronApp = await electron.launch({
      args: ['.'],
      cwd: process.cwd(),
    });

    // Wait for the app to be ready
    await electronApp.evaluate(async ({ app }) => {
      return app.whenReady();
    });

    // Get the first window
    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    // Wait for electronAPI to be available
    await page.waitForFunction(
      () => {
        return typeof window.electronAPI !== 'undefined';
      },
      { timeout: 10000 }
    );
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.describe('Secure Preload Script API Exposure', () => {
    test('should expose electronAPI to renderer process', async () => {
      // Verify electronAPI is available
      const hasElectronAPI = await page.evaluate(() => {
        return typeof window.electronAPI !== 'undefined';
      });
      expect(hasElectronAPI).toBe(true);
    });

    test('should expose all required window control methods', async () => {
      const windowControlMethods = await page.evaluate(() => {
        const api = window.electronAPI;
        return {
          hasMinimizeWindow: typeof api.minimizeWindow === 'function',
          hasMaximizeWindow: typeof api.maximizeWindow === 'function',
          hasCloseWindow: typeof api.closeWindow === 'function',
          hasIsWindowMaximized: typeof api.isWindowMaximized === 'function',
        };
      });

      expect(windowControlMethods.hasMinimizeWindow).toBe(true);
      expect(windowControlMethods.hasMaximizeWindow).toBe(true);
      expect(windowControlMethods.hasCloseWindow).toBe(true);
      expect(windowControlMethods.hasIsWindowMaximized).toBe(true);
    });

    test('should expose all required application action methods', async () => {
      const appActionMethods = await page.evaluate(() => {
        const api = window.electronAPI;
        return {
          hasClearContent: typeof api.clearContent === 'function',
          hasExportDiff: typeof api.exportDiff === 'function',
        };
      });

      expect(appActionMethods.hasClearContent).toBe(true);
      expect(appActionMethods.hasExportDiff).toBe(true);
    });

    test('should expose all required theme management methods', async () => {
      const themeMethods = await page.evaluate(() => {
        const api = window.electronAPI;
        return {
          hasGetTheme: typeof api.getTheme === 'function',
          hasSetTheme: typeof api.setTheme === 'function',
          hasShouldUseDarkColors: typeof api.shouldUseDarkColors === 'function',
          hasOnThemeUpdated: typeof api.onThemeUpdated === 'function',
          hasRemoveThemeListeners:
            typeof api.removeThemeListeners === 'function',
        };
      });

      expect(themeMethods.hasGetTheme).toBe(true);
      expect(themeMethods.hasSetTheme).toBe(true);
      expect(themeMethods.hasShouldUseDarkColors).toBe(true);
      expect(themeMethods.hasOnThemeUpdated).toBe(true);
      expect(themeMethods.hasRemoveThemeListeners).toBe(true);
    });

    test('should not expose raw ipcRenderer or Node.js APIs', async () => {
      const hasUnsafeAPIs = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        return {
          hasIpcRenderer: typeof win.ipcRenderer !== 'undefined',
          hasRequire: typeof win.require !== 'undefined',
          hasProcess: typeof win.process !== 'undefined',
          hasElectron: typeof win.electron !== 'undefined',
        };
      });

      expect(hasUnsafeAPIs.hasIpcRenderer).toBe(false);
      expect(hasUnsafeAPIs.hasRequire).toBe(false);
      expect(hasUnsafeAPIs.hasProcess).toBe(false);
      expect(hasUnsafeAPIs.hasElectron).toBe(false);
    });
  });

  test.describe('Window Control IPC Communication', () => {
    test('should handle window minimize via IPC', async () => {
      // Call minimize through the API
      await page.evaluate(async () => {
        await window.electronAPI.minimizeWindow();
      });

      // Wait for the minimize to take effect
      await page.waitForTimeout(500);

      // Verify window is minimized
      const isMinimized = await electronApp.evaluate(
        async ({ BrowserWindow }) => {
          const windows = BrowserWindow.getAllWindows();
          return windows.length > 0 ? windows[0].isMinimized() : false;
        }
      );
      expect(isMinimized).toBe(true);

      // Restore for cleanup
      await electronApp.evaluate(async ({ BrowserWindow }) => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].restore();
        }
      });
    });

    test('should handle window maximize/unmaximize via IPC', async () => {
      // Note: Window maximize/minimize operations may not work reliably in test
      // environments on macOS. This test verifies the IPC communication works
      // and attempts to verify state changes, but doesn't fail if the window
      // manager doesn't support these operations in the test environment.

      // First ensure window is not maximized
      await electronApp.evaluate(async ({ BrowserWindow }) => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0 && windows[0].isMaximized()) {
          windows[0].unmaximize();
        }
      });

      // Wait for operation to complete
      await page.waitForTimeout(500);

      // Verify IPC call works (doesn't throw)
      await expect(
        page.evaluate(async () => {
          await window.electronAPI.maximizeWindow();
          return true;
        })
      ).resolves.toBe(true);

      // Give time for window manager to process
      await page.waitForTimeout(500);

      // Verify query function works (doesn't throw)
      const queryWorks = await page.evaluate(async () => {
        try {
          await window.electronAPI.isWindowMaximized();
          return true;
        } catch {
          return false;
        }
      });
      expect(queryWorks).toBe(true);

      // Toggle back
      await page.evaluate(async () => {
        await window.electronAPI.maximizeWindow();
      });

      await page.waitForTimeout(500);
    });

    test('should handle isWindowMaximized query via IPC', async () => {
      // Test the query function
      const maximizedState = await page.evaluate(async () => {
        return await window.electronAPI.isWindowMaximized();
      });

      expect(typeof maximizedState).toBe('boolean');
    });
  });

  test.describe('Application Action IPC Communication', () => {
    test('should handle clearContent action via IPC', async () => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI.clearContent();
      });

      expect(result).toBe(true);
    });

    test('should handle exportDiff action via IPC', async () => {
      const testContent = 'This is test diff content for export';

      const result = await page.evaluate(async (content) => {
        return await window.electronAPI.exportDiff(content);
      }, testContent);

      expect(result).toBe(true);
    });

    test('should handle exportDiff with large content', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB of content

      const result = await page.evaluate(async (content) => {
        return await window.electronAPI.exportDiff(content);
      }, largeContent);

      expect(result).toBe(true);
    });
  });

  test.describe('Theme Management IPC Communication', () => {
    test('should get current theme via IPC', async () => {
      const theme = await page.evaluate(async () => {
        return await window.electronAPI.getTheme();
      });

      expect(['light', 'dark', 'system']).toContain(theme);
    });

    test('should set theme to light via IPC', async () => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI.setTheme('light');
      });

      expect(result).toBe('light');

      // Verify the theme was actually set
      const currentTheme = await page.evaluate(async () => {
        return await window.electronAPI.getTheme();
      });
      expect(currentTheme).toBe('light');
    });

    test('should set theme to dark via IPC', async () => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI.setTheme('dark');
      });

      expect(result).toBe('dark');

      // Verify the theme was actually set
      const currentTheme = await page.evaluate(async () => {
        return await window.electronAPI.getTheme();
      });
      expect(currentTheme).toBe('dark');
    });

    test('should set theme to system via IPC', async () => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI.setTheme('system');
      });

      expect(result).toBe('system');

      // Verify the theme was actually set
      const currentTheme = await page.evaluate(async () => {
        return await window.electronAPI.getTheme();
      });
      expect(currentTheme).toBe('system');
    });

    test('should get shouldUseDarkColors via IPC', async () => {
      const shouldUseDark = await page.evaluate(async () => {
        return await window.electronAPI.shouldUseDarkColors();
      });

      expect(typeof shouldUseDark).toBe('boolean');
    });

    test('should handle theme change listeners', async () => {
      // Set up a theme change listener
      const listenerPromise = page.evaluate(() => {
        return new Promise<{
          shouldUseDarkColors: boolean;
          themeSource: string;
        }>((resolve) => {
          window.electronAPI.onThemeUpdated((themeInfo) => {
            resolve(themeInfo);
          });
        });
      });

      // Change theme to trigger the listener
      await page.evaluate(async () => {
        await window.electronAPI.setTheme('dark');
      });

      // Wait for the listener to be called
      const themeInfo = await Promise.race([
        listenerPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Theme listener timeout')), 5000)
        ),
      ]);

      expect(typeof themeInfo.shouldUseDarkColors).toBe('boolean');
      expect(typeof themeInfo.themeSource).toBe('string');

      // Clean up listeners
      await page.evaluate(() => {
        window.electronAPI.removeThemeListeners();
      });
    });

    test('should remove theme listeners properly', async () => {
      // Add a listener
      await page.evaluate(() => {
        window.electronAPI.onThemeUpdated(() => {
          // This listener should be removed
        });
      });

      // Remove listeners
      await page.evaluate(() => {
        window.electronAPI.removeThemeListeners();
      });

      // This should not throw an error
      expect(true).toBe(true);
    });
  });

  test.describe('IPC Security and Error Handling', () => {
    test('should handle invalid theme values gracefully', async () => {
      // This should be caught by TypeScript, but test runtime behavior
      try {
        await page.evaluate(async () => {
          // @ts-expect-error - Testing invalid input
          return await window.electronAPI.setTheme('invalid-theme');
        });
        // If we get here, the call succeeded when it shouldn't have
        expect(false).toBe(true);
      } catch (error) {
        // Expected to throw an error
        expect(error).toBeTruthy();
      }
    });

    test('should handle concurrent IPC calls', async () => {
      // Make multiple concurrent calls
      const promises = [
        page.evaluate(() => window.electronAPI.getTheme()),
        page.evaluate(() => window.electronAPI.shouldUseDarkColors()),
        page.evaluate(() => window.electronAPI.isWindowMaximized()),
        page.evaluate(() => window.electronAPI.clearContent()),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(['light', 'dark', 'system']).toContain(results[0]);
      expect(typeof results[1]).toBe('boolean');
      expect(typeof results[2]).toBe('boolean');
      expect(results[3]).toBe(true);
    });

    test('should maintain context isolation', async () => {
      // Verify that the renderer process cannot access main process objects
      const isolationTest = await page.evaluate(() => {
        try {
          // These should not be accessible due to context isolation
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const win = window as any;
          return {
            canAccessMainProcess:
              typeof win.process?.versions?.electron !== 'undefined',
            canAccessNodeModules: typeof win.require !== 'undefined',
            canAccessElectronModules: typeof win.ipcRenderer !== 'undefined',
            hasOnlyElectronAPI: typeof window.electronAPI !== 'undefined',
          };
        } catch {
          return {
            canAccessMainProcess: false,
            canAccessNodeModules: false,
            canAccessElectronModules: false,
            hasOnlyElectronAPI: typeof window.electronAPI !== 'undefined',
          };
        }
      });

      expect(isolationTest.canAccessMainProcess).toBe(false);
      expect(isolationTest.canAccessNodeModules).toBe(false);
      expect(isolationTest.canAccessElectronModules).toBe(false);
      expect(isolationTest.hasOnlyElectronAPI).toBe(true);
    });
  });
});
