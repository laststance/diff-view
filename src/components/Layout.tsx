import React from 'react';
import { GitCompare } from 'lucide-react';

import { Toolbar } from './Toolbar';

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
 */
export const Layout: React.FC<LayoutProps> = ({ children, diffStats }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <GitCompare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <Toolbar />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4">{children}</div>
      </main>

      {/* Status Bar */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {diffStats ? (
              <>
                <span className="text-green-600 dark:text-green-400">
                  +{diffStats.additions} additions
                </span>
                <span className="text-red-600 dark:text-red-400">
                  -{diffStats.deletions} deletions
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {diffStats.changes} changes
                </span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                Ready to compare
              </span>
            )}
          </div>

          <div className="text-gray-500 dark:text-gray-400">Offline Mode</div>
        </div>
      </footer>
    </div>
  );
};
