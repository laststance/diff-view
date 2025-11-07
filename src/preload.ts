import { contextBridge, ipcRenderer } from 'electron';

// Define the ElectronAPI interface for type safety
export interface ElectronAPI {
  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;

  // Application actions
  clearContent: () => Promise<boolean>;
  exportDiff: (content: string) => Promise<boolean>;

  // Theme management
  getTheme: () => Promise<'light' | 'dark' | 'system'>;
  setTheme: (
    theme: 'light' | 'dark' | 'system'
  ) => Promise<'light' | 'dark' | 'system'>;
  shouldUseDarkColors: () => Promise<boolean>;
  onThemeUpdated: (
    callback: (themeInfo: {
      shouldUseDarkColors: boolean;
      themeSource: string;
    }) => void
  ) => void;
  removeThemeListeners: () => void;

  // Environment info
  isTestMode: boolean;

  // Error logging
  logError: (errorData: {
    message: string;
    stack?: string;
    componentStack?: string;
    errorInfo?: string;
    timestamp: number;
    environment: string;
  }) => Promise<{ success: boolean; logPath?: string; error?: string }>;
}

// Note: IPC channel validation is handled by the specific method implementations
// This ensures only predefined channels can be used

// Secure API implementation
const electronAPI: ElectronAPI = {
  // Window controls
  minimizeWindow: async () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: async () => ipcRenderer.invoke('window:maximize'),
  closeWindow: async () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: async () => ipcRenderer.invoke('window:isMaximized'),

  // Application actions
  clearContent: async () => ipcRenderer.invoke('app:clearContent'),
  exportDiff: async (content: string) =>
    ipcRenderer.invoke('app:exportDiff', content),

  // Theme management
  getTheme: async () => ipcRenderer.invoke('theme:get'),
  setTheme: async (theme: 'light' | 'dark' | 'system') =>
    ipcRenderer.invoke('theme:set', theme),
  shouldUseDarkColors: async () => ipcRenderer.invoke('theme:shouldUseDarkColors'),

  // Theme change listener
  onThemeUpdated: (callback) => {
    const wrappedCallback = (
      _event: Electron.IpcRendererEvent,
      themeInfo: { shouldUseDarkColors: boolean; themeSource: string }
    ) => {
      callback(themeInfo);
    };
    ipcRenderer.on('theme:updated', wrappedCallback);
  },

  removeThemeListeners: () => {
    ipcRenderer.removeAllListeners('theme:updated');
  },

  // Environment info
  isTestMode: process.env.ELECTRON_TEST_MODE === 'true',

  // Error logging
  logError: async (errorData) => {
    return ipcRenderer.invoke('error:log', errorData);
  },
};

// Expose the secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
