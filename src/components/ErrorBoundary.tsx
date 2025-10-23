import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

import type { ErrorBoundaryState, AppError } from '../types/app';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  onError?: (error: AppError) => void;
  level?: 'page' | 'component' | 'section';
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Create AppError object and notify parent
    if (this.props.onError) {
      // Map error types based on error.name for custom error classes
      let errorType: AppError['type'] = 'unknown';

      switch (error.name) {
        case 'DiffTimeoutError':
          errorType = 'processing-timeout';
          break;
        case 'ContentTooLargeError':
          errorType = 'content-size';
          break;
        case 'InvalidContentError':
          errorType = 'invalid-content';
          break;
        case 'DiffCalculationError':
          errorType = 'diff-computation';
          break;
        default:
          // Check message for legacy error detection
          if (error.message.includes('timeout') || error.message.includes('timed out')) {
            errorType = 'processing-timeout';
          } else if (error.message.includes('too large') || error.message.includes('size')) {
            errorType = 'content-size';
          } else if (error.message.includes('diff') || error.message.includes('calculation')) {
            errorType = 'diff-computation';
          }
      }

      const appError: AppError = {
        type: errorType,
        message: error.message || 'An unexpected error occurred',
        details: `${error.stack}\n\nComponent Stack:${errorInfo.componentStack}`,
        timestamp: Date.now(),
        recoverable: true,
      };
      this.props.onError(appError);

      // Enhanced logging for diff-specific errors
      if (errorType !== 'unknown') {
        console.group('🔍 Diff Error Detected');
        console.error('Error Type:', errorType);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        console.groupEnd();
      }
    }

    // In development, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Boundary Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default fallback UI based on error boundary level
      const isPageLevel = this.props.level === 'page';
      const containerClass = isPageLevel
        ? 'min-h-screen bg-red-50 dark:bg-red-900/10 flex items-center justify-center p-4'
        : 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800';

      return (
        <div className={containerClass}>
          <div
            className={`${isPageLevel ? 'max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6' : 'w-full'}`}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isPageLevel ? 'Application Error' : 'Component Error'}
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {isPageLevel
                  ? 'The application encountered an unexpected error. This is likely a temporary issue.'
                  : 'This component encountered an error and cannot be displayed properly.'}
              </p>

              {this.state.error && (
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Error: {this.state.error.message}
                  </p>

                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-2">
                      <summary className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:underline">
                        Show technical details (Development)
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                        {this.state.error.stack && (
                          <div className="mb-2">
                            <strong>Stack Trace:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              {isPageLevel && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reload App
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components that need error boundary functionality
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // In a real app, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Handler Details');
      console.error('Error:', error);
      if (errorInfo) {
        console.error('Error Info:', errorInfo);
      }
      console.groupEnd();
    }
  };
};
