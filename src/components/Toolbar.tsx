import React from 'react';
import {
  SplitSquareHorizontal,
  AlignLeft,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import { useAppStore } from '../store/appStore';

/**
 * Toolbar component with view controls and settings
 * Provides controls for view mode, theme, font size, and content management
 */
export const Toolbar: React.FC = () => {
  const viewMode = useAppStore((state) => state.viewMode);
  const theme = useAppStore((state) => state.theme);
  const fontSize = useAppStore((state) => state.fontSize);
  const leftContent = useAppStore((state) => state.leftContent);
  const rightContent = useAppStore((state) => state.rightContent);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const setTheme = useAppStore((state) => state.setTheme);
  const setFontSize = useAppStore((state) => state.setFontSize);

  const clearContent = useAppStore((state) => state.clearContent);
  const swapContent = useAppStore((state) => state.swapContent);
  const replaceLeftWithRight = useAppStore(
    (state) => state.replaceLeftWithRight
  );
  const replaceRightWithLeft = useAppStore(
    (state) => state.replaceRightWithLeft
  );

  const handleClearContent = () => {
    // Show confirmation if there's substantial content
    const hasContent = leftContent.length > 50 || rightContent.length > 50;

    if (hasContent) {
      const confirmed = window.confirm(
        'Are you sure you want to clear all content? This action cannot be undone.'
      );
      if (!confirmed) return;
    }

    clearContent();
  };

  const handleSwapContent = () => {
    if (leftContent || rightContent) {
      swapContent();
    }
  };

  const handleReplaceLeftWithRight = () => {
    if (rightContent) {
      const confirmed =
        leftContent.length > 50
          ? window.confirm(
              'Replace left content with right content? This action cannot be undone.'
            )
          : true;
      if (confirmed) {
        replaceLeftWithRight();
      }
    }
  };

  const handleReplaceRightWithLeft = () => {
    if (leftContent) {
      const confirmed =
        rightContent.length > 50
          ? window.confirm(
              'Replace right content with left content? This action cannot be undone.'
            )
          : true;
      if (confirmed) {
        replaceRightWithLeft();
      }
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = [
      'light',
      'dark',
      'system',
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const cycleFontSize = () => {
    const sizes: Array<'small' | 'medium' | 'large'> = [
      'small',
      'medium',
      'large',
    ];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  return (
    <div
      className="flex items-center space-x-2"
      role="toolbar"
      aria-label="Diff view controls"
    >
      {/* View Mode Toggle */}
      <div
        className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1"
        role="group"
        aria-label="View mode selection"
      >
        <button
          onClick={() => setViewMode('split')}
          className={`p-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 ${
            viewMode === 'split'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Split View (Ctrl+Shift+V)"
          aria-label="Switch to split view mode"
          aria-pressed={viewMode === 'split'}
          type="button"
        >
          <SplitSquareHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setViewMode('unified')}
          className={`p-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 ${
            viewMode === 'unified'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Unified View (Ctrl+Shift+V)"
          aria-label="Switch to unified view mode"
          aria-pressed={viewMode === 'unified'}
          type="button"
        >
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Separator */}
      <div
        className="h-6 w-px bg-gray-300 dark:bg-gray-600"
        role="separator"
        aria-hidden="true"
      />

      {/* Font Size Control */}
      <button
        onClick={cycleFontSize}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={`Font Size: ${fontSize} (Ctrl+Plus/Minus)`}
        aria-label={`Current font size: ${fontSize}. Click to cycle font size`}
        type="button"
      >
        {fontSize === 'small' && (
          <ZoomOut className="h-4 w-4" aria-hidden="true" />
        )}
        {fontSize === 'medium' && (
          <span className="text-sm font-medium" aria-hidden="true">
            Aa
          </span>
        )}
        {fontSize === 'large' && (
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={cycleTheme}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={`Theme: ${theme} (Ctrl+T)`}
        aria-label={`Current theme: ${theme}. Click to cycle theme`}
        type="button"
      >
        {getThemeIcon()}
      </button>

      {/* Separator */}
      <div
        className="h-6 w-px bg-gray-300 dark:bg-gray-600"
        role="separator"
        aria-hidden="true"
      />

      {/* Content Management Controls */}
      <div
        className="flex items-center space-x-1"
        role="group"
        aria-label="Content management"
      >
        {/* Swap Content */}
        <button
          onClick={handleSwapContent}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300"
          title="Swap Left and Right Content (Ctrl+Shift+S)"
          aria-label="Swap left and right content"
          disabled={!leftContent && !rightContent}
          type="button"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Replace Left with Right */}
        <button
          onClick={handleReplaceLeftWithRight}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300"
          title="Replace Left with Right Content (Ctrl+Shift+1)"
          aria-label="Replace left content with right content"
          disabled={!rightContent}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Replace Right with Left */}
        <button
          onClick={handleReplaceRightWithLeft}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300"
          title="Replace Right with Left Content (Ctrl+Shift+2)"
          aria-label="Replace right content with left content"
          disabled={!leftContent}
          type="button"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Separator */}
      <div
        className="h-6 w-px bg-gray-300 dark:bg-gray-600"
        role="separator"
        aria-hidden="true"
      />

      {/* Clear Content */}
      <button
        onClick={handleClearContent}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 dark:disabled:hover:text-gray-300"
        title="Clear All Content (Ctrl+Shift+C)"
        aria-label="Clear all content from both panes"
        disabled={!leftContent && !rightContent}
        type="button"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Reset/Refresh */}
      <button
        onClick={() => window.location.reload()}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        title="Reset Application"
        aria-label="Reset application to initial state"
        type="button"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Settings (placeholder for future) */}
      <button
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Settings (Coming Soon)"
        aria-label="Open settings (feature coming soon)"
        disabled
        type="button"
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
