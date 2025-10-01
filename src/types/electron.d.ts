// Type definitions for Electron API exposed via preload script

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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
