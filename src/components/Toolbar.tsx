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
} from 'lucide-react';

import { useAppStore } from '../store/appStore';

/**
 * Toolbar component with view controls and settings
 * Provides controls for view mode, theme, font size, and content management
 */
export const Toolbar: React.FC = () => {
  const {
    viewMode,
    theme,
    fontSize,
    leftContent,
    rightContent,
    setViewMode,
    setTheme,
    setFontSize,
    clearContent,
  } = useAppStore();

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
    <div className="flex items-center space-x-2">
      {/* View Mode Toggle */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
        <button
          onClick={() => setViewMode('split')}
          className={`p-2 rounded text-sm font-medium transition-colors ${
            viewMode === 'split'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Split View"
        >
          <SplitSquareHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('unified')}
          className={`p-2 rounded text-sm font-medium transition-colors ${
            viewMode === 'unified'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Unified View"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Font Size Control */}
      <button
        onClick={cycleFontSize}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title={`Font Size: ${fontSize}`}
      >
        {fontSize === 'small' && <ZoomOut className="h-4 w-4" />}
        {fontSize === 'medium' && (
          <span className="text-sm font-medium">Aa</span>
        )}
        {fontSize === 'large' && <ZoomIn className="h-4 w-4" />}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={cycleTheme}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title={`Theme: ${theme}`}
      >
        {getThemeIcon()}
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Clear Content */}
      <button
        onClick={handleClearContent}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Clear All Content"
        disabled={!leftContent && !rightContent}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Reset/Refresh */}
      <button
        onClick={() => window.location.reload()}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Reset Application"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* Settings (placeholder for future) */}
      <button
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Settings (Coming Soon)"
        disabled
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
};
