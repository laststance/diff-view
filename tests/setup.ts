import '@testing-library/jest-dom';
import { vi } from 'vitest';

import type { ElectronAPI } from '../src/types/electron';

// Mock Electron APIs for unit tests
const mockElectronAPI: ElectronAPI = {
  minimizeWindow: vi.fn().mockResolvedValue(undefined),
  maximizeWindow: vi.fn().mockResolvedValue(undefined),
  closeWindow: vi.fn().mockResolvedValue(undefined),
  isWindowMaximized: vi.fn().mockResolvedValue(false),
  clearContent: vi.fn().mockResolvedValue(true),
  exportDiff: vi.fn().mockResolvedValue(true),
  getTheme: vi.fn().mockResolvedValue('light'),
  setTheme: vi.fn().mockResolvedValue('light'),
  shouldUseDarkColors: vi.fn().mockResolvedValue(false),
  onThemeUpdated: vi.fn(),
  removeThemeListeners: vi.fn(),
};

// Make the mock available globally
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
