import React from 'react';

// Simple main view component without store dependencies for testing
export const SimpleMainView: React.FC = () => {

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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Simple Test View
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is a simple view to test React rendering without store
            dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};
