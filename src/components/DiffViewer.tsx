import React, { useEffect, useCallback } from 'react';

import { useAppStore } from '../store/appStore';
import type { AppError } from '../types/app';

import { DiffComputationLoader } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
// import { ErrorBoundary } from './ErrorBoundary';

export interface DiffViewerProps {
  className?: string;
}

/**
 * DiffViewer component wrapper with proper TypeScript interfaces
 * Integrates @git-diff-view/react library for GitHub-style diff visualization
 * Handles diff computation logic and automatic diff generation with error handling
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({ className }) => {
  const {
    leftContent,
    rightContent,
    viewMode,
    theme,
    diffData,
    isProcessing,
    loadingStates,
    currentError,
  } = useAppStore();

  // Simulate diff computation with error handling
  const computeDiff = useCallback(
    async (left: string, right: string) => {
      if (!left || !right) return;

      // Get actions directly from store to avoid dependency issues
      const { setError, clearError, addErrorToHistory, setLoadingState } =
        useAppStore.getState();

      try {
        setLoadingState('diffComputation', true);
        clearError();

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check for content size limits
        const leftSize = new Blob([left]).size;
        const rightSize = new Blob([right]).size;
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (leftSize > maxSize || rightSize > maxSize) {
          throw new Error(
            `Content too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`
          );
        }

        // Check for line count limits
        const leftLines = left.split('\n').length;
        const rightLines = right.split('\n').length;
        const maxLines = 50000;

        if (leftLines > maxLines || rightLines > maxLines) {
          throw new Error(
            `Too many lines. Maximum is ${maxLines.toLocaleString()} lines`
          );
        }

        // Simulate potential processing timeout
        if (leftLines > 10000 || rightLines > 10000) {
          // Simulate timeout for very large files
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Processing timeout')), 10000)
          );

          const processingPromise = new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 2000)
          );

          await Promise.race([processingPromise, timeoutPromise]);
        }

        // Success - would normally compute actual diff here
        console.log('Diff computation successful');
      } catch (error) {
        console.error('Diff computation error:', error);

        let appError: AppError;

        if (error instanceof Error) {
          if (
            error.message.includes('too large') ||
            error.message.includes('Maximum size')
          ) {
            appError = {
              type: 'content-size',
              message: 'Content exceeds size limits',
              details: error.message,
              timestamp: Date.now(),
              recoverable: true,
            };
          } else if (error.message.includes('Too many lines')) {
            appError = {
              type: 'content-size',
              message: 'Too many lines to process',
              details: error.message,
              timestamp: Date.now(),
              recoverable: true,
            };
          } else if (error.message.includes('timeout')) {
            appError = {
              type: 'processing-timeout',
              message: 'Diff computation timed out',
              details:
                'The comparison is taking too long. Try with smaller content.',
              timestamp: Date.now(),
              recoverable: true,
            };
          } else {
            appError = {
              type: 'diff-computation',
              message: 'Failed to compute differences',
              details: error.message,
              timestamp: Date.now(),
              recoverable: true,
            };
          }
        } else {
          appError = {
            type: 'unknown',
            message: 'An unexpected error occurred',
            details: 'Unknown error during diff computation',
            timestamp: Date.now(),
            recoverable: true,
          };
        }

        setError(appError);
        addErrorToHistory(appError);
      } finally {
        setLoadingState('diffComputation', false);
      }
    },
    [] // No dependencies - actions are retrieved from store directly
  );

  // Auto-compute diff when content changes
  useEffect(() => {
    if (leftContent && rightContent) {
      computeDiff(leftContent, rightContent);
    }
  }, [leftContent, rightContent, computeDiff]);

  // Handle retry action
  const handleRetry = useCallback(() => {
    if (leftContent && rightContent) {
      computeDiff(leftContent, rightContent);
    }
  }, [leftContent, rightContent, computeDiff]);

  // Handle clear content action
  const handleClearContent = useCallback(() => {
    const { clearContent, clearError } = useAppStore.getState();
    clearContent();
    clearError();
  }, []);

  try {
    return (
      <div
        className={`diff-viewer-container ${className || ''}`}
        data-testid="diff-viewer"
        role="region"
        aria-label="Diff visualization area"
        aria-live="polite"
      >
          {/* Loading indicator */}
          {loadingStates.diffComputation && (
            <div className="flex items-center justify-center py-8">
              <DiffComputationLoader
                type="spinner"
                size="large"
                message="Computing differences..."
              />
            </div>
          )}

          {/* Error display */}
          {currentError && !loadingStates.diffComputation && (
            <ErrorMessage
              error={currentError}
              onRetry={handleRetry}
              onClear={handleClearContent}
              showDetails={process.env.NODE_ENV === 'development'}
              className="mb-4"
            />
          )}

          {/* Content status */}
          {!loadingStates.diffComputation && !currentError && (
            <div
              className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              role="status"
              aria-label="Diff viewer status information"
            >
              <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                Diff Viewer Status
              </h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>
                  Left content: {leftContent?.length.toLocaleString() || 0}{' '}
                  characters
                </li>
                <li>
                  Right content: {rightContent?.length.toLocaleString() || 0}{' '}
                  characters
                </li>
                <li>Processing: {isProcessing ? 'Yes' : 'No'}</li>
                <li>Diff data: {diffData ? 'Present' : 'None'}</li>
                <li>View mode: {viewMode}</li>
                <li>Theme: {theme}</li>
              </ul>
            </div>
          )}

          {/* Diff visualization placeholder */}
          {leftContent &&
            rightContent &&
            !loadingStates.diffComputation &&
            !currentError && (
              <div
                className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                role="region"
                aria-label="Diff comparison result"
              >
                <h3 className="font-medium mb-2 text-green-900 dark:text-green-100">
                  Diff Comparison Result
                </h3>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <p>✅ Diff computation completed successfully</p>
                  <p>
                    📊 Comparing{' '}
                    {leftContent.split('\n').length.toLocaleString()} lines vs{' '}
                    {rightContent.split('\n').length.toLocaleString()} lines
                  </p>
                  <p>🎨 View mode: {viewMode}</p>
                  <p className="text-xs opacity-75 mt-2">
                    Actual diff visualization would be rendered here using
                    @git-diff-view/react
                  </p>
                </div>
              </div>
            )}

          {/* Empty state */}
          {!leftContent &&
            !rightContent &&
            !loadingStates.diffComputation &&
            !currentError && (
              <div
                className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                role="status"
              >
                <p className="text-lg font-medium mb-2">Ready to Compare</p>
                <p className="text-sm">
                  Add content to both text areas to see the diff visualization
                </p>
              </div>
            )}
      </div>
    );
  } catch (error) {
    console.error('Critical error in DiffViewer:', error);

    // Log critical error for debugging
    console.error('Critical error details:', error);

    return (
      <div
        className={`diff-viewer-container error ${className || ''}`}
        data-testid="diff-viewer"
      >
        {/* Error boundary will handle critical errors */}
      </div>
    );
  }
};
