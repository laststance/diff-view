import '@testing-library/jest-dom';

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

// Export for use in tests
export { mockClipboard, mockElectronAPI };
