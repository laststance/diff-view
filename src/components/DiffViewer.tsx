import React, { useEffect, useCallback, useMemo, memo } from 'react';

import { useAppStore } from '../store/appStore';
import { useDebounce } from '../hooks/useDebounce';
import {
  useMemoryMonitor,
  useContentMemoryMonitor,
} from '../hooks/useMemoryMonitor';

import { DiffComputationLoader } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { DiffRenderer } from './diff';
// import { ErrorBoundary } from './ErrorBoundary';

export interface DiffViewerProps {
  className?: string;
}

/**
 * DiffViewer component wrapper with proper TypeScript interfaces
 * Integrates @git-diff-view/react library for GitHub-style diff visualization
 * Handles diff computation logic and automatic diff generation with error handling
 * Optimized with debounced input handling and memory monitoring
 */
export const DiffViewer: React.FC<DiffViewerProps> = memo(function DiffViewer({
  className,
}) {
  const {
    leftContent,
    rightContent,
    viewMode,
    theme,
    diffData,
    isProcessing,
    loadingStates,
    currentError,
    recalculateDiff,
  } = useAppStore();

  // Debounce content changes to avoid excessive diff computations (300ms as per design doc)
  const debouncedLeftContent = useDebounce(leftContent, 300);
  const debouncedRightContent = useDebounce(rightContent, 300);

  // Monitor memory usage for performance insights
  const { memoryUsage } = useMemoryMonitor({
    updateInterval: 5000,
    highUsageThreshold: 80,
  });

  // Monitor content memory impact
  const leftContentMemory = useContentMemoryMonitor(leftContent);
  const rightContentMemory = useContentMemoryMonitor(rightContent);

  // Memoize content statistics to avoid recalculation
  const contentStats = useMemo(() => {
    const leftLines = leftContent.split('\n').length;
    const rightLines = rightContent.split('\n').length;
    const totalSize =
      leftContentMemory.contentSize + rightContentMemory.contentSize;
    const isLargeComparison =
      leftLines > 5000 || rightLines > 5000 || totalSize > 5 * 1024 * 1024;

    return {
      leftLines,
      rightLines,
      totalSize,
      isLargeComparison,
      recommendations: [
        ...leftContentMemory.recommendations,
        ...rightContentMemory.recommendations,
      ],
    };
  }, [leftContent, rightContent, leftContentMemory, rightContentMemory]);

  // Compute diff using Phase 1's Myers algorithm
  const computeDiff = useCallback(async () => {
    // recalculateDiff handles all error states and loading indicators
    await recalculateDiff();
  }, [recalculateDiff]);

  // Auto-compute diff when debounced content changes
  useEffect(() => {
    if (debouncedLeftContent && debouncedRightContent) {
      computeDiff();
    }
  }, [debouncedLeftContent, debouncedRightContent, computeDiff]);

  // Handle retry action
  const handleRetry = useCallback(() => {
    if (debouncedLeftContent && debouncedRightContent) {
      computeDiff();
    }
  }, [debouncedLeftContent, debouncedRightContent, computeDiff]);

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

        {/* Content status - only show when there's content */}
        {!loadingStates.diffComputation && !currentError && (leftContent || rightContent) && (
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
                characters ({contentStats.leftLines.toLocaleString()} lines)
              </li>
              <li>
                Right content: {rightContent?.length.toLocaleString() || 0}{' '}
                characters ({contentStats.rightLines.toLocaleString()} lines)
              </li>
              <li>Processing: {isProcessing ? 'Yes' : 'No'}</li>
              <li>Diff data: {diffData ? 'Present' : 'None'}</li>
              <li>View mode: {viewMode}</li>
              <li>Theme: {theme}</li>
              {memoryUsage && (
                <li>
                  Memory usage:{' '}
                  {(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB (
                  {memoryUsage.usedPercentage.toFixed(1)}%)
                  {memoryUsage.isHighUsage && (
                    <span className="text-orange-600 dark:text-orange-400 ml-1">
                      ⚠️ High
                    </span>
                  )}
                </li>
              )}
              {contentStats.isLargeComparison && (
                <li className="text-orange-600 dark:text-orange-400">
                  ⚠️ Large comparison - performance may be affected
                </li>
              )}
            </ul>

            {/* Performance recommendations */}
            {contentStats.recommendations.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Performance Recommendations:
                </p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                  {contentStats.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Diff visualization with Phase 2 renderer */}
        {leftContent &&
          rightContent &&
          !loadingStates.diffComputation &&
          !currentError && (
            <DiffRenderer diffData={diffData} viewMode={viewMode} className="mt-4" />
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
});
