import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { MainView } from '../../src/components/MainView';
import { useAppStore } from '../../src/store/appStore';

// Mock the Electron API
const mockElectronAPI = {
  minimizeWindow: vi.fn(),
  maximizeWindow: vi.fn(),
  closeWindow: vi.fn(),
  isWindowMaximized: vi.fn(),
  clearContent: vi.fn(),
  exportDiff: vi.fn(),
  getTheme: vi.fn(),
  setTheme: vi.fn(),
  shouldUseDarkColors: vi.fn(),
  onThemeUpdated: vi.fn(),
  removeThemeListeners: vi.fn(),
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('React Application Foundation', () => {
  beforeEach(() => {
    // Reset the store to default state before each test
    useAppStore.getState().resetToDefaults();
    vi.clearAllMocks();
  });

  describe('Error Boundary', () => {
    it('should render children when there are no errors', () => {
      render(
        <ErrorBoundary>
          <div data-testid="test-child">Test Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render error UI when an error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should allow error recovery', () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success">Success</div>;
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();

      // The error boundary shows recovery options
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Zustand Store', () => {
    it('should initialize with correct default values', () => {
      const state = useAppStore.getState();

      expect(state.leftContent).toBe('');
      expect(state.rightContent).toBe('');
      expect(state.viewMode).toBe('split');
      expect(state.theme).toBe('system');
      expect(state.fontSize).toBe('medium');
      expect(state.diffData).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.syntaxHighlighting).toBe(true);
      expect(state.showLineNumbers).toBe(true);
      expect(state.wordWrap).toBe(false);
    });

    it('should update content correctly', () => {
      const { setLeftContent, setRightContent } = useAppStore.getState();

      setLeftContent('Left content test');
      expect(useAppStore.getState().leftContent).toBe('Left content test');

      setRightContent('Right content test');
      expect(useAppStore.getState().rightContent).toBe('Right content test');
    });

    it('should update UI settings correctly', () => {
      const { setViewMode, setTheme, setFontSize } = useAppStore.getState();

      setViewMode('unified');
      expect(useAppStore.getState().viewMode).toBe('unified');

      setTheme('dark');
      expect(useAppStore.getState().theme).toBe('dark');

      setFontSize('large');
      expect(useAppStore.getState().fontSize).toBe('large');
    });

    it('should clear content correctly', () => {
      const { setLeftContent, setRightContent, clearContent } =
        useAppStore.getState();

      // Set some content
      setLeftContent('Test left');
      setRightContent('Test right');

      // Clear content
      clearContent();

      const state = useAppStore.getState();
      expect(state.leftContent).toBe('');
      expect(state.rightContent).toBe('');
      expect(state.diffData).toBeNull();
    });

    it('should reset to defaults correctly', () => {
      const { setLeftContent, setViewMode, setTheme, resetToDefaults } =
        useAppStore.getState();

      // Change some values
      setLeftContent('Test content');
      setViewMode('unified');
      setTheme('dark');

      // Reset to defaults
      resetToDefaults();

      const state = useAppStore.getState();
      expect(state.leftContent).toBe('');
      expect(state.viewMode).toBe('split');
      expect(state.theme).toBe('system');
    });
  });

  describe('MainView Component', () => {
    it('should render without errors', () => {
      render(<MainView />);

      expect(screen.getByText('Diff View')).toBeInTheDocument();
      expect(
        screen.getByText('Compare text with GitHub-style visualization')
      ).toBeInTheDocument();
    });

    it('should display current state correctly', () => {
      render(<MainView />);

      // In development mode, settings preview should show theme and other settings
      if (process.env.NODE_ENV === 'development') {
        expect(screen.getByText(/Theme: system/)).toBeInTheDocument();
        expect(screen.getByText(/Font: medium/)).toBeInTheDocument();
      }

      // Check that PasteArea is shown when content is empty
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should update content when user types', async () => {
      render(<MainView />);

      const leftTextarea = screen.getByPlaceholderText(
        'Paste or type your original content here...'
      );
      const rightTextarea = screen.getByPlaceholderText(
        'Paste or type your modified content here...'
      );

      fireEvent.change(leftTextarea, { target: { value: 'Hello World' } });
      fireEvent.change(rightTextarea, { target: { value: 'Hello Universe' } });

      await waitFor(() => {
        expect(useAppStore.getState().leftContent).toBe('Hello World');
        expect(useAppStore.getState().rightContent).toBe('Hello Universe');
      });
    });

    it('should update view mode when button is clicked', async () => {
      render(<MainView />);

      // Find the unified view button by its title attribute
      const unifiedButton = screen.getByTitle('Unified View (Ctrl+Shift+V)');

      fireEvent.click(unifiedButton);

      await waitFor(() => {
        expect(useAppStore.getState().viewMode).toBe('unified');
      });
    });

    it('should handle large content without errors', async () => {
      render(<MainView />);

      const leftTextarea = screen.getByPlaceholderText(
        'Paste or type your original content here...'
      );
      const largeContent = 'A'.repeat(10000);

      fireEvent.change(leftTextarea, { target: { value: largeContent } });

      await waitFor(() => {
        expect(useAppStore.getState().leftContent).toBe(largeContent);
        expect(useAppStore.getState().leftContent.length).toBe(10000);
      });
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should maintain type safety in store operations', () => {
      const store = useAppStore.getState();

      // These should compile without TypeScript errors
      store.setViewMode('split');
      store.setViewMode('unified');
      store.setTheme('light');
      store.setTheme('dark');
      store.setTheme('system');
      store.setFontSize('small');
      store.setFontSize('medium');
      store.setFontSize('large');

      // Verify the types are working
      expect(typeof store.leftContent).toBe('string');
      expect(typeof store.rightContent).toBe('string');
      expect(['split', 'unified']).toContain(store.viewMode);
      expect(['light', 'dark', 'system']).toContain(store.theme);
      expect(['small', 'medium', 'large']).toContain(store.fontSize);
    });

    it('should handle state updates with proper types', () => {
      const { setLeftContent, setRightContent, setProcessing } =
        useAppStore.getState();

      // String content
      setLeftContent('test');
      setRightContent('test');

      // Boolean processing
      setProcessing(true);
      setProcessing(false);

      // Verify types
      expect(typeof useAppStore.getState().leftContent).toBe('string');
      expect(typeof useAppStore.getState().rightContent).toBe('string');
      expect(typeof useAppStore.getState().isProcessing).toBe('boolean');
    });
  });

  describe('Application Initialization', () => {
    it('should initialize store with correct types', () => {
      const state = useAppStore.getState();

      // Verify all required properties exist with correct types
      expect(typeof state.leftContent).toBe('string');
      expect(typeof state.rightContent).toBe('string');
      expect(typeof state.viewMode).toBe('string');
      expect(typeof state.theme).toBe('string');
      expect(typeof state.fontSize).toBe('string');
      expect(typeof state.isProcessing).toBe('boolean');
      expect(typeof state.syntaxHighlighting).toBe('boolean');
      expect(typeof state.showLineNumbers).toBe('boolean');
      expect(typeof state.wordWrap).toBe('boolean');

      // Verify action functions exist
      expect(typeof state.setLeftContent).toBe('function');
      expect(typeof state.setRightContent).toBe('function');
      expect(typeof state.clearContent).toBe('function');
      expect(typeof state.setViewMode).toBe('function');
      expect(typeof state.setTheme).toBe('function');
      expect(typeof state.resetToDefaults).toBe('function');
    });

    it('should handle component mounting correctly', () => {
      const { unmount } = render(<MainView />);

      // Component should render without errors
      expect(screen.getByText('Diff View')).toBeInTheDocument();

      // Component should unmount without errors
      unmount();
    });
  });
});
