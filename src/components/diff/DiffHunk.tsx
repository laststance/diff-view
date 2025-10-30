import React from 'react';

import type { DiffHunk as DiffHunkType } from '../../types/app';

import { DiffLine } from './DiffLine';

interface DiffHunkProps {
  /** Hunk data from Phase 1's diff calculation */
  hunk: DiffHunkType;
  /** View mode for layout (split or unified) */
  viewMode?: 'split' | 'unified';
  /** Additional CSS classes */
  className?: string;
  /** Hunk index in the diff (Phase 3 Feature 2) */
  hunkIndex?: number;
  /** Function to get change index for a line (Phase 3 Feature 2) */
  getChangeIndex?: (hunkIndex: number, lineIndex: number) => number | null;
  /** Currently selected change index (Phase 3 Feature 2) */
  currentChangeIndex?: number | null;
  /** Callback to set ref for navigation (Phase 3 Feature 2) */
  setChangeRef?: (changeIndex: number, element: HTMLDivElement | null) => void;
}

/**
 * DiffHunk renders a single hunk (a contiguous block of changed lines) from the diff.
 *
 * Structure:
 * 1. Hunk header: "@@ -oldStart,oldLines +newStart,newLines @@"
 * 2. All lines in the hunk with character-level highlights
 *
 * A hunk represents a continuous section of changes. Each hunk has:
 * - oldStart: Starting line number in the old file
 * - oldLines: Number of lines in this hunk from the old file
 * - newStart: Starting line number in the new file
 * - newLines: Number of lines in this hunk from the new file
 * - lines: Array of DiffLine objects with content and highlights
 */
export const DiffHunk: React.FC<DiffHunkProps> = ({
  hunk,
  viewMode = 'split',
  className = '',
  hunkIndex = 0,
  getChangeIndex,
  currentChangeIndex = null,
  setChangeRef,
}) => {
  /**
   * Format the hunk header in GitHub's standard format:
   * @@ -oldStart,oldLines +newStart,newLines @@
   */
  const formatHunkHeader = (): string => {
    const { oldStart, oldLines, newStart, newLines } = hunk;
    return `@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`;
  };

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Hunk header */}
      <div
        className="bg-gray-100 px-4 py-1 font-mono text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        data-testid="hunk-header"
      >
        {formatHunkHeader()}
      </div>

      {/* Lines in this hunk */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {hunk.lines.map((line, index) => {
          const changeIndex = getChangeIndex ? getChangeIndex(hunkIndex, index) : null;
          const isCurrentChange =
            changeIndex !== null && changeIndex === currentChangeIndex;

          return (
            <DiffLine
              key={`line-${index}-${line.oldLineNumber}-${line.newLineNumber}`}
              line={line}
              viewMode={viewMode}
              changeIndex={changeIndex}
              isCurrentChange={isCurrentChange}
              setChangeRef={setChangeRef}
            />
          );
        })}
      </div>
    </div>
  );
};
