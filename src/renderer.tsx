import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from './components/ErrorBoundary';
import { MainView } from './components/MainView';
import { useAppStore } from './store/appStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import './index.css';

// Root App component with error boundaries and global setup
const App: React.FC = () => {
  const { theme } = useAppStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Expose store to window in test mode for Playwright access
  useEffect(() => {
    if (window.electronAPI?.isTestMode) {
      window.useAppStore = useAppStore;
    }
  }, []);

  // Initialize theme and listen for system theme changes
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        if (window.electronAPI) {
          // Get initial theme from system
          const shouldUseDark = await window.electronAPI.shouldUseDarkColors();

          // Apply theme to document
          updateDocumentTheme(theme, shouldUseDark);

          // Listen for theme changes
          window.electronAPI.onThemeUpdated(({ shouldUseDarkColors }) => {
            updateDocumentTheme(theme, shouldUseDarkColors);
          });
        }
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
      }
    };

    initializeTheme();

    // Cleanup theme listeners on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeThemeListeners();
      }
    };
  }, [theme]);

  // Update document theme classes
  const updateDocumentTheme = (
    currentTheme: string,
    shouldUseDark: boolean
  ) => {
    const isDark =
      currentTheme === 'dark' || (currentTheme === 'system' && shouldUseDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ErrorBoundary
      fallback={(error, _errorInfo) => (
        <div className="min-h-screen bg-red-50 dark:bg-red-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Application Error
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The diff view application encountered an unexpected error and
              needs to restart.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Restart Application
            </button>
          </div>
        </div>
      )}
    >
      <MainView />
    </ErrorBoundary>
  );
};

// Initialize and render the application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Failed to find root container element');
}
