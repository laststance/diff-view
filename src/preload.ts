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
}

// Note: IPC channel validation is handled by the specific method implementations
// This ensures only predefined channels can be used

// Secure API implementation
const electronAPI: ElectronAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Application actions
  clearContent: () => ipcRenderer.invoke('app:clearContent'),
  exportDiff: (content: string) =>
    ipcRenderer.invoke('app:exportDiff', content),

  // Theme management
  getTheme: () => ipcRenderer.invoke('theme:get'),
  setTheme: (theme: 'light' | 'dark' | 'system') =>
    ipcRenderer.invoke('theme:set', theme),
  shouldUseDarkColors: () => ipcRenderer.invoke('theme:shouldUseDarkColors'),

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
};

// Expose the secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
