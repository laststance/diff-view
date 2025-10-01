import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  ErrorBoundary,
  useErrorHandler,
} from '../../../src/components/ErrorBoundary';

// Mock window.location.reload
let mockReload: ReturnType<typeof vi.fn>;

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="success">Success</div>;
};

// Test component for useErrorHandler hook
const ErrorHandlerTest: React.FC = () => {
  const handleError = useErrorHandler();

  return (
    <button
      onClick={() => handleError(new Error('Hook error'))}
      data-testid="trigger-error"
    >
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.reload safely
    try {
      mockReload = vi
        .spyOn(window.location, 'reload')
        .mockImplementation(() => {}) as any;
    } catch {
      // If already mocked, create a simple mock
      mockReload = vi.fn() as any;
    }
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when there are no errors', () => {
      render(
        <ErrorBoundary>
          <div data-testid="test-child">Test Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should not render error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
      expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render error UI when an error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should render page-level error UI when level is page', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('Reload App')).toBeInTheDocument();
    });

    it('should render component-level error UI by default', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.queryByText('Reload App')).not.toBeInTheDocument();
    });

    it('should display custom error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Custom error message/)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should allow error recovery with Try Again button', () => {
      let shouldThrow = true;
      const ConditionalThrow = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success">Success</div>;
      };

      render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();

      // Fix the condition so it won't throw on next render
      shouldThrow = false;

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      // After clicking Try Again, the error boundary should reset and render successfully
      expect(screen.getByTestId('success')).toBeInTheDocument();
      expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    });

    it('should reload page when Reload App button is clicked', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload App');
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (error: Error) => (
        <div data-testid="custom-fallback">Custom Error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError message="Custom fallback test" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(
        screen.getByText('Custom Error: Custom fallback test')
      ).toBeInTheDocument();
      expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    });
  });

  describe('Error Callback', () => {
    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Callback test error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unknown',
          message: 'Callback test error',
          recoverable: true,
        })
      );
    });

    it('should include stack trace in error details', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.stringContaining('Component Stack:'),
        })
      );
    });
  });

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show technical details in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Show technical details (Development)')
      ).toBeInTheDocument();
    });

    it('should expand technical details when clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const detailsButton = screen.getByText(
        'Show technical details (Development)'
      );
      fireEvent.click(detailsButton);

      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
    });
  });

  describe('Production Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not show technical details in production mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.queryByText('Show technical details (Development)')
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary Levels', () => {
    it('should apply correct styling for page level', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError />
        </ErrorBoundary>
      );

      // Page level should have full-screen styling
      const container = screen.getByText('Application Error').closest('div');
      expect(container?.parentElement).toHaveClass('min-h-screen');
    });

    it('should apply correct styling for component level', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError />
        </ErrorBoundary>
      );

      // Component level should have contained styling
      const container = screen.getByText('Component Error').closest('div');
      expect(container?.parentElement).not.toHaveClass('min-h-screen');
    });

    it('should apply correct styling for section level', () => {
      render(
        <ErrorBoundary level="section">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error icons should be hidden from screen readers
      const alertIcon = screen
        .getByText('Component Error')
        .parentElement?.querySelector('svg');
      expect(alertIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper button accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple error occurrences', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError message="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('First error')).toBeInTheDocument();

      // Reset and throw different error
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      rerender(
        <ErrorBoundary>
          <ThrowError message="Second error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Second error')).toBeInTheDocument();
    });
  });
});

describe('useErrorHandler Hook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle errors when called', () => {
    render(<ErrorHandlerTest />);

    const triggerButton = screen.getByTestId('trigger-error');
    fireEvent.click(triggerButton);

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by error handler:',
      expect.any(Error),
      undefined
    );
  });

  it('should handle errors with error info', () => {
    const TestComponent: React.FC = () => {
      const handleError = useErrorHandler();

      return (
        <button
          onClick={() =>
            handleError(new Error('Hook error'), {
              componentStack: 'test stack',
            } as React.ErrorInfo)
          }
          data-testid="trigger-error-with-info"
        >
          Trigger Error with Info
        </button>
      );
    };

    render(<TestComponent />);

    const triggerButton = screen.getByTestId('trigger-error-with-info');
    fireEvent.click(triggerButton);

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by error handler:',
      expect.any(Error),
      expect.objectContaining({ componentStack: 'test stack' })
    );
  });
});
