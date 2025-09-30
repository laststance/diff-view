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

      {/* Content Management Controls */}
      <div className="flex items-center space-x-1">
        {/* Swap Content */}
        <button
          onClick={handleSwapContent}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Swap Left and Right Content (Ctrl+Shift+S)"
          disabled={!leftContent && !rightContent}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        {/* Replace Left with Right */}
        <button
          onClick={handleReplaceLeftWithRight}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Replace Left with Right Content (Ctrl+Shift+1)"
          disabled={!rightContent}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Replace Right with Left */}
        <button
          onClick={handleReplaceRightWithLeft}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Replace Right with Left Content (Ctrl+Shift+2)"
          disabled={!leftContent}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Clear Content */}
      <button
        onClick={handleClearContent}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Clear All Content (Ctrl+Shift+C)"
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
