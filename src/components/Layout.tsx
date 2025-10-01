import React from 'react';
import { GitCompare } from 'lucide-react';

import { useAppStore } from '../store/appStore';

import { Toolbar } from './Toolbar';
// ErrorToast and LoadingIndicator components removed

interface LayoutProps {
  children: React.ReactNode;
  diffStats?: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

/**
 * Main Layout component with header, content area, and status bar
 * Implements responsive design with CSS Grid/Flexbox
 * Includes global error handling and loading state management
 */
export const Layout: React.FC<LayoutProps> = ({ children, diffStats }) => {
  const { currentError, loadingStates } = useAppStore();

  // Check if any loading operation is active
  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="absolute -top-40 left-6 bg-blue-600 text-white px-4 py-2 rounded-md z-50 transition-all focus:top-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
        role="banner"
        aria-label="Application header"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div
              className="flex items-center space-x-3"
              role="img"
              aria-label="Diff View application logo"
              data-testid="app-logo"
            >
              <GitCompare
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Diff View
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compare text with GitHub-style visualization
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <nav role="navigation" aria-label="Main toolbar">
              <Toolbar />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 flex flex-col overflow-hidden"
        role="main"
        aria-label="Text comparison interface"
      >
        <div className="flex-1 p-4">{children}</div>
      </main>

      {/* Status Bar */}
      <footer
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2"
        role="contentinfo"
        aria-label="Application status"
      >
        <div className="flex items-center justify-between text-sm">
          <div
            className="flex items-center space-x-4"
            role="status"
            aria-live="polite"
            aria-label="Diff statistics"
          >
            {/* Diff statistics */}
            {!isAnyLoading && diffStats ? (
              <>
                <span
                  className="text-green-600 dark:text-green-400"
                  aria-label={`${diffStats.additions} additions`}
                >
                  +{diffStats.additions} additions
                </span>
                <span
                  className="text-red-600 dark:text-red-400"
                  aria-label={`${diffStats.deletions} deletions`}
                >
                  -{diffStats.deletions} deletions
                </span>
                <span
                  className="text-blue-600 dark:text-blue-400"
                  aria-label={`${diffStats.changes} changes`}
                >
                  {diffStats.changes} changes
                </span>
              </>
            ) : !isAnyLoading ? (
              <span className="text-gray-500 dark:text-gray-400">
                Ready to compare
              </span>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            {/* Error indicator in status bar */}
            {currentError && (
              <span className="text-red-600 dark:text-red-400 text-xs">
                Error: {currentError.message}
              </span>
            )}

            <div
              className="text-gray-500 dark:text-gray-400"
              aria-label="Application mode: Offline"
            >
              Offline Mode
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
