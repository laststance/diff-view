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

// Mock requestAnimationFrame and cancelAnimationFrame for tests
// These are needed for hooks that use requestAnimationFrame
let rafId = 0;
const rafCallbacks = new Map<number, () => void>();

const requestAnimationFrameMock = (cb: () => void): number => {
  const id = ++rafId;
  rafCallbacks.set(id, cb);
  // Use setTimeout to make it work with fake timers
  // The callback will be executed when vi.advanceTimersByTime() is called
  // setTimeout(0) will be executed by vi.advanceTimersByTime(1) or higher
  setTimeout(() => {
    if (rafCallbacks.has(id)) {
      try {
        cb();
      } catch {
        // Ignore errors in callbacks during tests
      }
    }
  }, 0);
  return id;
};

const cancelAnimationFrameMock = (id: number): void => {
  rafCallbacks.delete(id);
};

// Set on global scope
(global as any).requestAnimationFrame = requestAnimationFrameMock;
(global as any).cancelAnimationFrame = cancelAnimationFrameMock;

// Also set on window for browser-like environment
if (typeof window !== 'undefined') {
  (window as any).requestAnimationFrame = requestAnimationFrameMock;
  (window as any).cancelAnimationFrame = cancelAnimationFrameMock;
}

// Also set on globalThis for compatibility
if (typeof globalThis !== 'undefined') {
  (globalThis as any).requestAnimationFrame = requestAnimationFrameMock;
  (globalThis as any).cancelAnimationFrame = cancelAnimationFrameMock;
}

// Export for use in tests
export { mockClipboard, mockElectronAPI };
