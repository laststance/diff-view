import fs from 'node:fs';
import path from 'node:path';

import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for some diff functionality
    },
    show: false, // Don't show until ready-to-show
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (process.env.ELECTRON_TEST_MODE === 'true') {
      // app.hide();
      // // In test mode, show without stealing focus
      mainWindow?.showInactive();
      // // Mac Only: Hide from dock during test
      // app.setActivationPolicy('accessory');
    } else {
      // In normal mode, show and focus the window
      mainWindow?.show();
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// IPC Handlers for secure communication

// Window control handlers
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// Theme management handlers
ipcMain.handle('theme:get', () => {
  return nativeTheme.themeSource;
});

ipcMain.handle('theme:set', (_event, theme: 'system' | 'light' | 'dark') => {
  if (['system', 'light', 'dark'].includes(theme)) {
    nativeTheme.themeSource = theme;
    return theme;
  }
  throw new Error('Invalid theme value');
});

ipcMain.handle('theme:shouldUseDarkColors', () => {
  return nativeTheme.shouldUseDarkColors;
});

// Application action handlers
ipcMain.handle('app:clearContent', () => {
  // This will be handled by the renderer process
  // Just acknowledge the request
  return true;
});

ipcMain.handle('app:exportDiff', async (_event, content: string) => {
  // For now, just return success
  // In a full implementation, this would open a save dialog
  console.log('Export diff requested:', content.length, 'characters');
  return true;
});

// Error logging handler - writes errors to file for debugging
ipcMain.handle('error:log', async (_event, errorData: {
  message: string;
  stack?: string;
  componentStack?: string;
  errorInfo?: string;
  timestamp: number;
  environment: string;
}) => {
  try {
    const logsDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFileName = `error-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    const logEntry = {
      timestamp: new Date(errorData.timestamp).toISOString(),
      environment: errorData.environment,
      message: errorData.message,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      errorInfo: errorData.errorInfo,
    };

    const logLine = JSON.stringify(logEntry, null, 2) + '\n\n---\n\n';
    
    fs.appendFileSync(logFilePath, logLine, 'utf-8');
    
    // Also log to console for immediate visibility
    console.error('Error logged to file:', logFilePath);
    console.error('Error details:', logEntry);

    return { success: true, logPath: logFilePath };
  } catch (error) {
    console.error('Failed to write error log:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Listen for theme changes and notify renderer
nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('theme:updated', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      themeSource: nativeTheme.themeSource,
    });
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
