/**
 * Error logging utility
 * Provides centralized error logging with support for file logging and Sentry integration
 */

import type { ErrorInfo } from 'react';

export interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  errorInfo?: string;
  timestamp: number;
  environment: string;
  errorName?: string;
  context?: Record<string, unknown>;
}

/**
 * Log error with comprehensive information
 * Supports file logging via Electron IPC and optional Sentry integration
 */
export async function logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): Promise<void> {
  const environment = process.env.NODE_ENV === 'development' 
    ? 'development' 
    : process.env.ELECTRON_TEST_MODE === 'true' 
    ? 'test' 
    : 'production';

  const errorData: ErrorLogData = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    componentStack: errorInfo?.componentStack || undefined,
    errorInfo: errorInfo ? JSON.stringify(errorInfo, null, 2) : undefined,
    timestamp: Date.now(),
    environment,
    errorName: error.name,
    context,
  };

  // Enhanced console logging
  console.group('🚨 Error Logger - Detailed Error Information');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  console.error('Error Stack:', error.stack);
  if (errorInfo?.componentStack) {
    console.error('Component Stack:', errorInfo.componentStack);
  }
  console.error('Environment:', environment);
  if (context) {
    console.error('Context:', context);
  }
  console.error('Full Error Object:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }
  console.groupEnd();

  // Send to Electron main process for file logging
  if (window.electronAPI?.logError) {
    try {
      const result = await window.electronAPI.logError({
        message: errorData.message,
        stack: errorData.stack,
        componentStack: errorData.componentStack,
        errorInfo: errorData.errorInfo,
        timestamp: errorData.timestamp,
        environment: errorData.environment,
      });
      if (result.success && result.logPath) {
        console.log('✅ Error logged to file:', result.logPath);
      } else {
        console.warn('⚠️ Failed to log error to file:', result.error);
      }
    } catch (ipcError) {
      console.error('Failed to send error via IPC:', ipcError);
    }
  } else {
    console.warn('⚠️ Electron API not available, error not logged to file');
  }

  // Optional: Send to Sentry if configured
  // To enable Sentry, install @sentry/react and @sentry/electron:
  //   npm install @sentry/react @sentry/electron
  // Then uncomment the following code and configure SENTRY_DSN in your environment
  /*
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.captureException(error, {
        contexts: {
          react: errorInfo ? {
            componentStack: errorInfo.componentStack,
          } : undefined,
        },
        tags: {
          errorBoundary: !!errorInfo,
          environment,
        },
        extra: {
          errorInfo: errorInfo?.componentStack,
          context,
        },
      });
      console.log('✅ Error sent to Sentry');
    } catch (sentryError) {
      console.warn('⚠️ Failed to send error to Sentry:', sentryError);
    }
  }
  */
}

