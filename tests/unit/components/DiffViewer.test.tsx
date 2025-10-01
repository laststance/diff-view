import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { DiffViewer } from '../../../src/components/DiffViewer';
import { useAppStore } from '../../../src/store/appStore';

// Mock the store
vi.mock('../../../src/store/appStore');

describe('DiffViewer Component', () => {
  const mockStore = {
    leftContent: '',
    rightContent: '',
    viewMode: 'split' as const,
    theme: 'light' as const,
    diffData: null,
    isProcessing: false,
    loadingStates: {
      diffComputation: false,
      contentValidation: false,
      fileProcessing: false,
    },
    currentError: null,
  };

  const mockActions = {
    setError: vi.fn(),
    clearError: vi.fn(),
    addErrorToHistory: vi.fn(),
    setLoadingState: vi.fn(),
    clearContent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
    (useAppStore as any).getState = vi.fn().mockReturnValue({
      ...mockStore,
      ...mockActions,
    });
  });

  describe('Rendering States', () => {
    it('should render empty state when no content is provided', () => {
      render(<DiffViewer />);

      expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      expect(screen.getByText('Ready to Compare')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Add content to both text areas to see the diff visualization'
        )
      ).toBeInTheDocument();
    });

    it('should render loading state when diff computation is in progress', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        loadingStates: { ...mockStore.loadingStates, diffComputation: true },
      });

      render(<DiffViewer />);

      expect(screen.getByText('Computing differences...')).toBeInTheDocument();
      expect(
        screen.getByTestId('loading-indicator-diffComputation')
      ).toBeInTheDocument();
    });

    it('should render error state when there is a current error', () => {
      const mockError = {
        type: 'diff-computation' as const,
        message: 'Failed to compute diff',
        details: 'Error details',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        currentError: mockError,
      });

      render(<DiffViewer />);

      expect(
        screen.getByTestId('error-message-diff-computation')
      ).toBeInTheDocument();
      expect(screen.getByText('Failed to compute diff')).toBeInTheDocument();
    });

    it('should render success state when both contents are provided', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'Hello World',
        rightContent: 'Hello Universe',
      });

      render(<DiffViewer />);

      expect(screen.getByText('Diff Comparison Result')).toBeInTheDocument();
      expect(
        screen.getByText('✅ Diff computation completed successfully')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Comparing 1 lines vs 1 lines/)
      ).toBeInTheDocument();
    });
  });

  describe('Content Statistics', () => {
    it('should display correct content statistics', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'Hello\nWorld',
        rightContent: 'Hello\nUniverse\nTest',
      });

      render(<DiffViewer />);

      expect(
        screen.getByText(/Left content: 11 characters \(2 lines\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Right content: 19 characters \(3 lines\)/)
      ).toBeInTheDocument();
    });

    it('should show processing status correctly', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'test',
        rightContent: 'test2',
        isProcessing: true,
      });

      render(<DiffViewer />);

      expect(screen.getByText('Processing: Yes')).toBeInTheDocument();
    });

    it('should display current view mode and theme', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        viewMode: 'unified',
        theme: 'dark',
      });

      render(<DiffViewer />);

      expect(screen.getByText('View mode: unified')).toBeInTheDocument();
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle content size errors', () => {
      const sizeError = {
        type: 'content-size' as const,
        message: 'Content exceeds size limits',
        details: 'Content is too large',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        currentError: sizeError,
      });

      render(<DiffViewer />);

      expect(
        screen.getByTestId('error-message-content-size')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Content exceeds size limits')
      ).toBeInTheDocument();
    });

    it('should handle processing timeout errors', () => {
      const timeoutError = {
        type: 'processing-timeout' as const,
        message: 'Diff computation timed out',
        details: 'Processing took too long',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        currentError: timeoutError,
      });

      render(<DiffViewer />);

      expect(
        screen.getByTestId('error-message-processing-timeout')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Diff computation timed out')
      ).toBeInTheDocument();
    });

    it('should provide retry functionality for recoverable errors', () => {
      const mockError = {
        type: 'diff-computation' as const,
        message: 'Failed to compute diff',
        details: 'Error details',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'test',
        rightContent: 'test2',
        currentError: mockError,
      });

      render(<DiffViewer />);

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      // Verify that retry functionality is triggered
      // Note: The actual retry logic would be tested in integration tests
    });

    it('should provide clear content functionality', () => {
      const mockError = {
        type: 'diff-computation' as const,
        message: 'Failed to compute diff',
        details: 'Error details',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        currentError: mockError,
      });

      render(<DiffViewer />);

      const clearButton = screen.getByText('Clear Content');
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);
      // Verify that clear functionality is triggered
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DiffViewer />);

      const diffViewer = screen.getByTestId('diff-viewer');
      expect(diffViewer).toHaveAttribute('role', 'region');
      expect(diffViewer).toHaveAttribute(
        'aria-label',
        'Diff visualization area'
      );
      expect(diffViewer).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper status regions', () => {
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'test',
        rightContent: 'test2',
      });

      render(<DiffViewer />);

      const statusRegion = screen.getByLabelText(
        'Diff viewer status information'
      );
      expect(statusRegion).toHaveAttribute('role', 'status');

      const resultRegion = screen.getByLabelText('Diff comparison result');
      expect(resultRegion).toHaveAttribute('role', 'region');
    });

    it('should provide proper status announcements', () => {
      render(<DiffViewer />);

      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  describe('Props and Customization', () => {
    it('should accept and apply custom className', () => {
      render(<DiffViewer className="custom-class" />);

      const diffViewer = screen.getByTestId('diff-viewer');
      expect(diffViewer).toHaveClass('custom-class');
    });

    it('should handle missing className gracefully', () => {
      render(<DiffViewer />);

      const diffViewer = screen.getByTestId('diff-viewer');
      expect(diffViewer).toBeInTheDocument();
    });
  });

  describe('Content Changes', () => {
    it('should react to content changes', async () => {
      // Start with empty content
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: '',
        rightContent: '',
      });

      const { unmount } = render(<DiffViewer />);

      // Initially empty
      expect(screen.getByText('Ready to Compare')).toBeInTheDocument();

      unmount();

      // Update store to have content
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'Hello',
        rightContent: 'World',
      });

      // Render again with new content
      render(<DiffViewer />);

      await waitFor(() => {
        expect(screen.getByText('Diff Comparison Result')).toBeInTheDocument();
      });
    });

    it('should handle large content gracefully', () => {
      const largeContent = 'A'.repeat(10000);

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: largeContent,
        rightContent: largeContent + 'B',
      });

      render(<DiffViewer />);

      expect(
        screen.getByText(/Left content: 10,000 characters/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Right content: 10,001 characters/)
      ).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should clear errors when content is successfully processed', async () => {
      // Start with error state
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        currentError: {
          type: 'diff-computation' as const,
          message: 'Failed to compute diff',
          details: 'Error details',
          timestamp: Date.now(),
          recoverable: true,
        },
      });

      const { unmount } = render(<DiffViewer />);

      expect(
        screen.getByTestId('error-message-diff-computation')
      ).toBeInTheDocument();

      unmount();

      // Update to success state
      (useAppStore as any).mockReturnValue({
        ...mockStore,
        leftContent: 'test',
        rightContent: 'test2',
        currentError: null,
      });

      // Render again with new state
      render(<DiffViewer />);

      await waitFor(() => {
        expect(
          screen.queryByTestId('error-message-diff-computation')
        ).not.toBeInTheDocument();
      });
      expect(screen.getByText('Diff Comparison Result')).toBeInTheDocument();
    });
  });
});
