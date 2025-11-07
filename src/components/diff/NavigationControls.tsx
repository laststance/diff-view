import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';

import {
  useCurrentChangeIndex,
  useTotalChanges,
  useNavigationActions,
} from '../../store/appStore';

/**
 * NavigationControls provides UI for navigating between diff changes.
 *
 * Phase 3 Feature 2: Diff Navigation
 * - Shows "Change X of Y" counter
 * - Previous/Next/First/Last navigation buttons
 * - Keyboard shortcuts: n/p/g/G (shown in tooltips)
 * - Disabled state when no changes available
 */
export const NavigationControls: React.FC = () => {
  const currentChangeIndex = useCurrentChangeIndex();
  const totalChanges = useTotalChanges();
  const {
    navigateFirst,
    navigatePrevious,
    navigateNext,
    navigateLast,
  } = useNavigationActions();

  const hasChanges = totalChanges > 0;
  const displayIndex =
    currentChangeIndex !== null ? currentChangeIndex + 1 : 0;

  return (
    <div
      className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800"
      role="group"
      aria-label="Diff navigation controls"
    >
      {/* Counter */}
      <span
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
        data-testid="navigation-counter"
        aria-live="polite"
      >
        {hasChanges ? (
          <>
            Change <span className="font-bold">{displayIndex}</span> of{' '}
            <span className="font-bold">{totalChanges}</span>
          </>
        ) : (
          'No changes'
        )}
      </span>

      {/* Divider */}
      {hasChanges && (
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
      )}

      {/* Navigation buttons */}
      {hasChanges && (
        <>
          {/* First change */}
          <button
            onClick={navigateFirst}
            disabled={!hasChanges || currentChangeIndex === 0}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent dark:disabled:hover:text-gray-400"
            title="First change (g)"
            aria-label="Navigate to first change (g)"
            data-testid="nav-first"
            type="button"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Previous change */}
          <button
            onClick={navigatePrevious}
            disabled={!hasChanges || currentChangeIndex === 0}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent dark:disabled:hover:text-gray-400"
            title="Previous change (p)"
            aria-label="Navigate to previous change (p)"
            data-testid="nav-previous"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Next change */}
          <button
            onClick={navigateNext}
            disabled={!hasChanges || currentChangeIndex === totalChanges - 1}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent dark:disabled:hover:text-gray-400"
            title="Next change (n)"
            aria-label="Navigate to next change (n)"
            data-testid="nav-next"
            type="button"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Last change */}
          <button
            onClick={navigateLast}
            disabled={!hasChanges || currentChangeIndex === totalChanges - 1}
            className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent dark:disabled:hover:text-gray-400"
            title="Last change (Shift+G)"
            aria-label="Navigate to last change (Shift+G)"
            data-testid="nav-last"
            type="button"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};
