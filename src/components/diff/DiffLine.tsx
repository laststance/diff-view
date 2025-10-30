import React, { useMemo } from 'react';

import type { DiffLine as DiffLineType } from '../../types/app';
import { getThemeColors } from '../../config/diffThemes';
import { useDiffTheme, useTheme } from '../../store/appStore';

import { HighlightSpan } from './HighlightSpan';

interface DiffLineProps {
  /** Line data from Phase 1's diff calculation */
  line: DiffLineType;
  /** View mode for layout (split or unified) */
  viewMode?: 'split' | 'unified';
  /** Additional CSS classes */
  className?: string;
  /** Change index if this line is a change (Phase 3 Feature 2) */
  changeIndex?: number | null;
  /** Whether this is the currently selected change (Phase 3 Feature 2) */
  isCurrentChange?: boolean;
  /** Callback to set ref for navigation (Phase 3 Feature 2) */
  setChangeRef?: (changeIndex: number, element: HTMLDivElement | null) => void;
}

/**
 * DiffLine renders a single line from the diff with character-level highlights.
 *
 * This component implements the core rendering algorithm for Phase 2:
 * 1. Parse line.content using line.highlightRanges
 * 2. Split content into segments (plain text and highlights)
 * 3. Render each segment with appropriate styling
 *
 * Handles edge cases:
 * - Empty highlight ranges (start === end): Skipped
 * - No highlight ranges: Renders plain text
 * - Ranges exceeding content length: Clamped
 */
export const DiffLine: React.FC<DiffLineProps> = ({
  line,
  viewMode = 'split',
  className = '',
  changeIndex = null,
  isCurrentChange = false,
  setChangeRef,
}) => {
  // Get current theme settings (Phase 3 Feature 3)
  const diffTheme = useDiffTheme();
  const theme = useTheme();

  // Memoize dark mode detection to avoid unnecessary re-renders
  const isDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // system theme
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  const themeColors = getThemeColors(diffTheme, isDark);

  // Determine line background color based on type and theme
  const getLineBackgroundClass = (): string => {
    switch (line.type) {
      case 'add':
        return themeColors.addBg;
      case 'delete':
        return themeColors.deleteBg;
      case 'modify':
        // In unified view, modified lines are shown as delete + add pairs
        // In split view, show modify background
        return viewMode === 'unified'
          ? themeColors.contextBg
          : themeColors.modifyBg;
      case 'context':
      default:
        return themeColors.contextBg;
    }
  };

  // Determine line prefix symbol
  const getLinePrefix = (): string => {
    switch (line.type) {
      case 'add':
        return '+';
      case 'delete':
        return '-';
      default:
        return ' ';
    }
  };

  /**
   * Render line content with character-level highlights.
   *
   * Algorithm:
   * 1. Sort highlight ranges by start position
   * 2. Walk through content, building segments
   * 3. For each range: add plain text before, then highlighted segment
   * 4. After last range: add remaining plain text
   */
  const renderContent = (): React.ReactNode => {
    const { content, highlightRanges } = line;

    // If no highlights, render plain text
    if (!highlightRanges || highlightRanges.length === 0) {
      return <span className="select-text">{content}</span>;
    }

    // Sort ranges by start position to ensure correct order
    const sortedRanges = [...highlightRanges].sort((a, b) => a.start - b.start);

    const segments: React.ReactNode[] = [];
    let currentPos = 0;

    sortedRanges.forEach((range, index) => {
      // Skip empty ranges (start === end)
      if (range.start === range.end) {
        return;
      }

      // Clamp range to content length
      const start = Math.max(0, Math.min(range.start, content.length));
      const end = Math.max(0, Math.min(range.end, content.length));

      // Add plain text before this highlight (if any)
      if (start > currentPos) {
        const plainText = content.slice(currentPos, start);
        segments.push(
          <span key={`plain-${index}-${currentPos}`} className="select-text">
            {plainText}
          </span>,
        );
      }

      // Add highlighted segment
      const highlightedText = content.slice(start, end);
      segments.push(
        <HighlightSpan
          key={`highlight-${index}-${start}`}
          text={highlightedText}
          type={range.type}
        />,
      );

      currentPos = end;
    });

    // Add remaining plain text after last highlight (if any)
    if (currentPos < content.length) {
      const remainingText = content.slice(currentPos);
      segments.push(
        <span key={`plain-end-${currentPos}`} className="select-text">
          {remainingText}
        </span>,
      );
    }

    return <>{segments}</>;
  };

  const lineBackgroundClass = getLineBackgroundClass();
  const linePrefix = getLinePrefix();

  // Determine which line number to show in unified view
  const getUnifiedLineNumber = (): number | undefined => {
    // For deleted lines, show old line number
    if (line.type === 'delete' && line.oldLineNumber !== undefined) {
      return line.oldLineNumber;
    }
    // For added and context lines, show new line number
    return line.newLineNumber;
  };

  return (
    <div
      ref={(el) => {
        if (changeIndex !== null && setChangeRef) {
          setChangeRef(changeIndex, el);
        }
      }}
      className={`flex font-mono text-sm ${lineBackgroundClass} ${className} ${
        isCurrentChange
          ? 'ring-2 ring-inset ring-blue-500 dark:ring-blue-400'
          : ''
      }`}
      data-line-type={line.type}
      data-change-index={changeIndex !== null ? changeIndex : undefined}
    >
      {/* Line prefix ('+', '-', ' ') */}
      <span
        className="inline-block w-6 flex-shrink-0 select-none text-center text-gray-500"
        aria-label={`${line.type} line`}
      >
        {linePrefix}
      </span>

      {/* Line numbers - different logic for split vs unified */}
      {viewMode === 'split' ? (
        <>
          {/* Split view: Show both old and new line numbers */}
          {line.oldLineNumber !== undefined && (
            <span
              className="inline-block w-12 flex-shrink-0 select-none pr-2 text-right text-gray-400"
              data-testid="old-line-number"
            >
              {line.oldLineNumber}
            </span>
          )}
          {line.newLineNumber !== undefined && (
            <span
              className="inline-block w-12 flex-shrink-0 select-none pr-2 text-right text-gray-400"
              data-testid="new-line-number"
            >
              {line.newLineNumber}
            </span>
          )}
        </>
      ) : (
        <>
          {/* Unified view: Show single line number */}
          {getUnifiedLineNumber() !== undefined && (
            <span
              className="inline-block w-12 flex-shrink-0 select-none pr-2 text-right text-gray-400"
              data-testid="unified-line-number"
            >
              {getUnifiedLineNumber()}
            </span>
          )}
        </>
      )}

      {/* Line content with highlights */}
      <div className="min-w-0 flex-grow px-2 py-0.5">{renderContent()}</div>
    </div>
  );
};
