import React from 'react';

import { useChangeNavigation } from '../../hooks/useChangeNavigation';
import type { DiffData } from '../../types/app';

import { DiffHunk } from './DiffHunk';
import { NavigationControls } from './NavigationControls';

interface DiffRendererProps {
  /** Diff data from Phase 1's Myers algorithm calculation */
  diffData: DiffData | null;
  /** View mode for layout (split or unified) */
  viewMode?: 'split' | 'unified';
  /** Additional CSS classes */
  className?: string;
}

/**
 * DiffRenderer is the container component for rendering complete diff output.
 *
 * This is the top-level component for Phase 2's UI integration. It:
 * 1. Consumes DiffData from the Zustand store (via DiffViewer)
 * 2. Renders all hunks with character-level highlights
 * 3. Handles empty states and error conditions
 * 4. Provides GitHub-style diff visualization
 *
 * Data flow:
 * Store → DiffViewer → DiffRenderer → DiffHunk → DiffLine → HighlightSpan
 */
export const DiffRenderer: React.FC<DiffRendererProps> = ({
  diffData,
  viewMode = 'split',
  className = '',
}) => {
  // Phase 3 Feature 2: Diff navigation
  const { setChangeRef, getChangeIndex, currentChangeIndex } = useChangeNavigation(diffData);
  // Handle empty/null state
  if (!diffData) {
    return (
      <div
        className={`rounded border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 ${className}`}
        data-testid="diff-renderer"
        role="region"
        aria-label="Diff comparison result"
      >
        No diff data available. Enter text in both panes to see comparison.
      </div>
    );
  }

  // Handle case where diff has no hunks (identical content)
  if (diffData.hunks.length === 0) {
    return (
      <div
        className={`rounded border border-gray-200 bg-green-50 p-4 text-center dark:border-gray-700 dark:bg-green-950 ${className}`}
        data-testid="diff-renderer"
        role="region"
        aria-label="Diff comparison result"
      >
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          ✓ No differences found
        </p>
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          Both texts are identical
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded border border-gray-200 dark:border-gray-700 ${className}`}
      data-testid="diff-renderer"
      role="region"
      aria-label="Diff comparison result"
    >
      {/* Diff stats header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {diffData.hunks.length} {diffData.hunks.length === 1 ? 'hunk' : 'hunks'}
          </span>
          <span className="text-green-600 dark:text-green-400">
            +{diffData.stats.additions}{' '}
            {diffData.stats.additions === 1 ? 'addition' : 'additions'}
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{diffData.stats.deletions}{' '}
            {diffData.stats.deletions === 1 ? 'deletion' : 'deletions'}
          </span>
          {diffData.metadata?.calculationTime && (
            <span className="text-xs text-gray-500">
              {diffData.metadata.calculationTime.toFixed(2)}ms
            </span>
          )}

          {/* Navigation Controls (Phase 3 Feature 2) */}
          <div className="ml-auto">
            <NavigationControls />
          </div>
        </div>
      </div>

      {/* Render all hunks */}
      <div className="bg-white dark:bg-gray-900">
        {diffData.hunks.map((hunk, index) => (
          <DiffHunk
            key={`hunk-${index}`}
            hunk={hunk}
            viewMode={viewMode}
            hunkIndex={index}
            getChangeIndex={getChangeIndex}
            currentChangeIndex={currentChangeIndex}
            setChangeRef={setChangeRef}
          />
        ))}
      </div>
    </div>
  );
};
