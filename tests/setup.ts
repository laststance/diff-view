import '@testing-library/jest-dom';
import { vi } from 'vitest';

import type { ElectronAPI } from '../src/types/electron';

import { setupCommonMocks, createElectronAPIMock } from './utils/test-helpers';

// Set up all common mocks
const { mockClipboard } = setupCommonMocks();

// Mock Electron APIs for unit tests
const mockElectronAPI: ElectronAPI = createElectronAPIMock();

// Make the mock available globally
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
});

// Create global reload mock that tests can access
const mockReload = vi.fn();

// Try to replace window.location.reload (might fail in some jsdom versions)
try {
  Object.defineProperty(window.location, 'reload', {
    value: mockReload,
    writable: true,
    configurable: true,
  });
} catch {
  // If we can't replace it, tests will need to spy on it differently
  // This is expected in some jsdom environments
}

// Make mockReload available globally so tests can access it
(global as any).mockLocationReload = mockReload;

// Export for use in tests
export { mockClipboard, mockElectronAPI };
