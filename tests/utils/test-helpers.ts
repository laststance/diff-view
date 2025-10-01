import { vi } from 'vitest';

/**
 * Test utilities for consistent mocking across test files
 */

// Mock FileReader for file upload tests
export const createMockFileReader = (content: string = 'File content') => {
  return class MockFileReader {
    result: string | null = null;
    onload: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    readAsText(_file: File) {
      // Use queueMicrotask to make it async but not dependent on timers
      queueMicrotask(() => {
        this.result = content;
        if (this.onload) {
          this.onload({ target: { result: this.result } });
        }
      });
    }
  } as any;
};

// Mock clipboard API
export const createMockClipboard = () => ({
  readText: vi.fn(),
  writeText: vi.fn(),
});

// Mock ClipboardEvent and DataTransfer for jsdom
export const setupClipboardMocks = () => {
  global.ClipboardEvent = class ClipboardEvent extends Event {
    clipboardData: any;
    constructor(type: string, eventInitDict?: any) {
      super(type, eventInitDict);
      this.clipboardData = eventInitDict?.clipboardData || null;
    }
  } as any;

  global.DataTransfer = class DataTransfer {
    private data: Map<string, string> = new Map();

    setData(format: string, data: string) {
      this.data.set(format, data);
    }

    getData(format: string) {
      return this.data.get(format) || '';
    }
  } as any;
};

// Mock ResizeObserver
export const setupResizeObserverMock = () => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

// Mock matchMedia
export const setupMatchMediaMock = () => {
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
};

// Mock window.location.reload safely
export const createLocationReloadMock = () => {
  try {
    return vi.spyOn(window.location, 'reload').mockImplementation(() => {});
  } catch {
    // If already mocked, return a mock function
    return vi.fn();
  }
};

// Mock window.confirm
export const createConfirmMock = () => {
  return vi.spyOn(window, 'confirm').mockImplementation(() => true);
};

// Setup all common mocks
export const setupCommonMocks = () => {
  setupClipboardMocks();
  setupResizeObserverMock();
  setupMatchMediaMock();

  // Set up FileReader mock
  global.FileReader = createMockFileReader();

  // Set up clipboard mock
  const mockClipboard = createMockClipboard();
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true,
  });

  return {
    mockClipboard,
  };
};

// Timer utilities
export const setupTimers = () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
};

export const cleanupTimers = () => {
  vi.useRealTimers();
};

// Async timer advancement
export const advanceTimersAsync = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms);
};

// Console mocking utilities
export const suppressConsoleErrors = () => {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
};

export const suppressConsoleWarnings = () => {
  return vi.spyOn(console, 'warn').mockImplementation(() => {});
};

export const suppressConsoleLogs = () => {
  return vi.spyOn(console, 'log').mockImplementation(() => {});
};

// Electron API mock
export const createElectronAPIMock = () => ({
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
});

// Wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Create a test file for file upload tests
export const createTestFile = (
  content: string = 'test content',
  name: string = 'test.txt',
  type: string = 'text/plain'
) => {
  return new File([content], name, { type });
};

// Mock store utilities
export const createMockStore = (overrides: any = {}) => ({
  leftContent: '',
  rightContent: '',
  viewMode: 'split' as const,
  theme: 'light' as const,
  fontSize: 'medium' as const,
  diffData: null,
  isProcessing: false,
  loadingStates: {
    diffComputation: false,
    contentValidation: false,
    fileProcessing: false,
  },
  currentError: null,
  syntaxHighlighting: true,
  showLineNumbers: true,
  wordWrap: false,
  ...overrides,
});

export const createMockActions = () => ({
  setLeftContent: vi.fn(),
  setRightContent: vi.fn(),
  clearContent: vi.fn(),
  setViewMode: vi.fn(),
  setTheme: vi.fn(),
  setFontSize: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  addErrorToHistory: vi.fn(),
  setLoadingState: vi.fn(),
  swapContent: vi.fn(),
  replaceLeftWithRight: vi.fn(),
  replaceRightWithLeft: vi.fn(),
});
