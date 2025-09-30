import React from 'react';

import { useAppStore } from '../store/appStore';

// Main view component - placeholder for now, will be expanded in later tasks
export const MainView: React.FC = () => {
  const { leftContent, rightContent, viewMode, theme } = useAppStore();
  const { setLeftContent, setRightContent, setViewMode } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💖 Diff View
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Compare text content with GitHub-style diff visualization
          </p>
        </header>

        {/* Basic state display for testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application State (Development)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                View Mode:
              </strong>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {viewMode}
              </span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                Theme:
              </strong>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {theme}
              </span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                Left Content Length:
              </strong>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {leftContent.length} chars
              </span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                Right Content Length:
              </strong>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {rightContent.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Basic controls for testing state management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Controls
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Left Content:
              </label>
              <textarea
                value={leftContent}
                onChange={(e) => setLeftContent(e.target.value)}
                placeholder="Enter left content..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Right Content:
              </label>
              <textarea
                value={rightContent}
                onChange={(e) => setRightContent(e.target.value)}
                placeholder="Enter right content..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Mode:
              </label>
              <select
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value as 'split' | 'unified')
                }
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="split">Split View</option>
                <option value="unified">Unified View</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
