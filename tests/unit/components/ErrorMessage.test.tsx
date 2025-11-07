import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  ErrorMessage,
  ErrorToast,
  DiffComputationError,
  ContentSizeError,
  ProcessingTimeoutError,
} from '../../../src/components/ErrorMessage';
import type { AppError } from '../../../src/types/app';

describe('ErrorMessage Component', () => {
  const baseError: AppError = {
    type: 'diff-computation',
    message: 'Test error message',
    details: 'Detailed error information',
    timestamp: Date.now(),
    recoverable: true,
  };

  const mockHandlers = {
    onRetry: vi.fn(),
    onDismiss: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render error message with basic props', () => {
      render(<ErrorMessage error={baseError} />);

      expect(
        screen.getByTestId('error-message-diff-computation')
      ).toBeInTheDocument();
      expect(screen.getByText('Diff Computation Failed')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      const error = {
        ...baseError,
        timestamp: new Date('2023-01-01T12:00:00Z').getTime(),
      };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText(/Occurred at/)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<ErrorMessage error={baseError} />);

      const errorContainer = screen.getByTestId(
        'error-message-diff-computation'
      );
      expect(errorContainer).toHaveAttribute('role', 'alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Error Types', () => {
    it('should render diff-computation error correctly', () => {
      const error: AppError = { ...baseError, type: 'diff-computation' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Diff Computation Failed')).toBeInTheDocument();
      expect(screen.getByText('Try with smaller content')).toBeInTheDocument();
    });

    it('should render content-size error correctly', () => {
      const error: AppError = { ...baseError, type: 'content-size' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Content Size Limit')).toBeInTheDocument();
      expect(screen.getByText('Reduce content size')).toBeInTheDocument();
    });

    it('should render memory-limit error correctly', () => {
      const error: AppError = { ...baseError, type: 'memory-limit' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Memory Limit Reached')).toBeInTheDocument();
      expect(screen.getByText('Close other applications')).toBeInTheDocument();
    });

    it('should render processing-timeout error correctly', () => {
      const error: AppError = { ...baseError, type: 'processing-timeout' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Processing Timeout')).toBeInTheDocument();
      expect(screen.getByText('Try with smaller content')).toBeInTheDocument();
    });

    it('should render invalid-content error correctly', () => {
      const error: AppError = { ...baseError, type: 'invalid-content' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Invalid Content')).toBeInTheDocument();
      expect(screen.getByText('Check content format')).toBeInTheDocument();
    });

    it('should render unknown error correctly', () => {
      const error: AppError = { ...baseError, type: 'unknown' };
      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
      expect(screen.getByText('Retry the operation')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show retry button when onRetry is provided and error is recoverable', () => {
      render(<ErrorMessage error={baseError} onRetry={mockHandlers.onRetry} />);

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockHandlers.onRetry).toHaveBeenCalled();
    });

    it('should not show retry button when error is not recoverable', () => {
      const nonRecoverableError = { ...baseError, recoverable: false };
      render(
        <ErrorMessage
          error={nonRecoverableError}
          onRetry={mockHandlers.onRetry}
        />
      );

      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    it('should show clear button when onClear is provided', () => {
      render(<ErrorMessage error={baseError} onClear={mockHandlers.onClear} />);

      const clearButton = screen.getByText('Clear Content');
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);
      expect(mockHandlers.onClear).toHaveBeenCalled();
    });

    it('should show dismiss button when onDismiss is provided', () => {
      render(
        <ErrorMessage error={baseError} onDismiss={mockHandlers.onDismiss} />
      );

      const dismissButton = screen.getByLabelText('Dismiss error');
      expect(dismissButton).toBeInTheDocument();

      fireEvent.click(dismissButton);
      expect(mockHandlers.onDismiss).toHaveBeenCalled();
    });
  });

  describe('Details Expansion', () => {
    it('should show details button when showDetails is true and details exist', () => {
      render(<ErrorMessage error={baseError} showDetails />);

      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    it('should not show details button when showDetails is false', () => {
      render(<ErrorMessage error={baseError} showDetails={false} />);

      expect(screen.queryByText('Show Details')).not.toBeInTheDocument();
    });

    it('should expand details when details button is clicked', () => {
      render(<ErrorMessage error={baseError} showDetails />);

      const detailsButton = screen.getByText('Show Details');
      fireEvent.click(detailsButton);

      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      expect(screen.getByText('Technical Details:')).toBeInTheDocument();
      expect(
        screen.getByText('Detailed error information')
      ).toBeInTheDocument();
    });

    it('should collapse details when hide button is clicked', () => {
      render(<ErrorMessage error={baseError} showDetails />);

      const detailsButton = screen.getByText('Show Details');
      fireEvent.click(detailsButton);

      const hideButton = screen.getByText('Hide Details');
      fireEvent.click(hideButton);

      expect(screen.getByText('Show Details')).toBeInTheDocument();
      expect(screen.queryByText('Technical Details:')).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(<ErrorMessage error={baseError} compact />);

      expect(
        screen.getByTestId('error-message-diff-computation')
      ).toBeInTheDocument();
      expect(screen.getByText('Diff Computation Failed')).toBeInTheDocument();
    });

    it('should not show suggestions in compact mode', () => {
      render(<ErrorMessage error={baseError} compact />);

      expect(screen.queryByText('Suggestions:')).not.toBeInTheDocument();
    });

    it('should not show timestamp in compact mode', () => {
      render(<ErrorMessage error={baseError} compact />);

      expect(screen.queryByText(/Occurred at/)).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<ErrorMessage error={baseError} className="custom-class" />);

      const errorContainer = screen.getByTestId(
        'error-message-diff-computation'
      );
      expect(errorContainer).toHaveClass('custom-class');
    });
  });

  describe('Suggestions', () => {
    it('should display suggestions for each error type', () => {
      render(<ErrorMessage error={baseError} />);

      expect(screen.getByText('Suggestions:')).toBeInTheDocument();
      expect(screen.getByText('Try with smaller content')).toBeInTheDocument();
      expect(
        screen.getByText('Check for unusual characters')
      ).toBeInTheDocument();
      expect(screen.getByText('Retry the operation')).toBeInTheDocument();
    });
  });
});

describe('ErrorToast Component', () => {
  const baseError: AppError = {
    type: 'diff-computation',
    message: 'Toast error message',
    details: 'Toast error details',
    timestamp: Date.now(),
    recoverable: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render when visible is true', () => {
    render(<ErrorToast error={baseError} visible />);

    expect(
      screen.getByTestId('error-message-diff-computation')
    ).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    render(<ErrorToast error={baseError} visible={false} />);

    expect(
      screen.queryByTestId('error-message-diff-computation')
    ).not.toBeInTheDocument();
  });

  it('should auto-hide after delay', async () => {
    const onDismiss = vi.fn();
    render(
      <ErrorToast
        error={baseError}
        visible
        autoHide
        autoHideDelay={3000}
        onDismiss={onDismiss}
      />
    );

    expect(
      screen.getByTestId('error-message-diff-computation')
    ).toBeInTheDocument();

    // Use async timer advancement
    await vi.advanceTimersByTimeAsync(3000);

    // Check that onDismiss was called
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should not auto-hide when autoHide is false', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorToast
        error={baseError}
        visible
        autoHide={false}
        onDismiss={onDismiss}
      />
    );

    vi.advanceTimersByTime(5000);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should have proper positioning classes', () => {
    render(<ErrorToast error={baseError} visible />);

    const toastContainer = screen.getByTestId(
      'error-message-diff-computation'
    ).parentElement;
    expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
  });

  it('should have proper ARIA attributes for toast', () => {
    render(<ErrorToast error={baseError} visible />);

    const toastContainer = screen.getByTestId(
      'error-message-diff-computation'
    ).parentElement;
    expect(toastContainer).toHaveAttribute('role', 'alert');
    expect(toastContainer).toHaveAttribute('aria-live', 'assertive');
  });
});

describe('Preset Error Components', () => {
  const baseError: AppError = {
    type: 'diff-computation',
    message: 'Preset error message',
    details: 'Preset error details',
    timestamp: Date.now(),
    recoverable: true,
  };

  it('should render DiffComputationError', () => {
    render(<DiffComputationError error={baseError} />);

    expect(
      screen.getByTestId('error-message-diff-computation')
    ).toBeInTheDocument();
  });

  it('should render ContentSizeError', () => {
    const sizeError = { ...baseError, type: 'content-size' as const };
    render(<ContentSizeError error={sizeError} />);

    expect(
      screen.getByTestId('error-message-content-size')
    ).toBeInTheDocument();
  });

  it('should render ProcessingTimeoutError', () => {
    const timeoutError = { ...baseError, type: 'processing-timeout' as const };
    render(<ProcessingTimeoutError error={timeoutError} />);

    expect(
      screen.getByTestId('error-message-processing-timeout')
    ).toBeInTheDocument();
  });
});

describe('Error Message Accessibility', () => {
  const baseError: AppError = {
    type: 'diff-computation',
    message: 'Accessibility test error',
    details: 'Error details for accessibility testing',
    timestamp: Date.now(),
    recoverable: true,
  };

  it('should have proper focus management', () => {
    render(<ErrorMessage error={baseError} onRetry={vi.fn()} />);

    const retryButton = screen.getByText('Retry');
    retryButton.focus();

    expect(retryButton).toHaveFocus();
  });

  it('should have proper color contrast indicators', () => {
    render(<ErrorMessage error={baseError} />);

    const errorContainer = screen.getByTestId('error-message-diff-computation');
    expect(errorContainer).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should announce error changes to screen readers', () => {
    render(<ErrorMessage error={baseError} />);

    const errorContainer = screen.getByTestId('error-message-diff-computation');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });
});
