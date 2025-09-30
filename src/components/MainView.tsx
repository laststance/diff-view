import React, { useMemo } from 'react';
import { FileText, Type, Palette } from 'lucide-react';

import { useAppStore } from '../store/appStore';

import { Layout } from './Layout';

/**
 * Main view component with proper layout structure
 * Uses the Layout component for consistent header, content, and status bar
 */
export const MainView: React.FC = () => {
  const {
    leftContent,
    rightContent,
    viewMode,
    theme,
    fontSize,
    syntaxHighlighting,
    showLineNumbers,
    wordWrap,
  } = useAppStore();
  const { setLeftContent, setRightContent } = useAppStore();

  // Calculate mock diff stats for status bar
  const diffStats = useMemo(() => {
    if (!leftContent || !rightContent) return undefined;

    const leftLines = leftContent.split('\n');
    const rightLines = rightContent.split('\n');

    // Simple mock calculation - in real implementation this would use proper diff algorithm
    const additions = Math.max(0, rightLines.length - leftLines.length);
    const deletions = Math.max(0, leftLines.length - rightLines.length);
    const changes = Math.min(leftLines.length, rightLines.length);

    return { additions, deletions, changes };
  }, [leftContent, rightContent]);

  return (
    <Layout diffStats={diffStats}>
      {/* Main Content Area with Responsive Grid */}
      <div className="h-full flex flex-col space-y-4">
        {/* Content Input Section */}
        <div
          className={`grid gap-4 h-full ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Left Content Pane */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {leftContent.length} chars, {leftContent.split('\n').length}{' '}
                lines
              </div>
            </div>
            <div className="flex-1 p-3">
              <textarea
                value={leftContent}
                onChange={(e) => setLeftContent(e.target.value)}
                placeholder="Paste or type your original content here..."
                className={`w-full h-full min-h-[300px] resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 ${
                  fontSize === 'small'
                    ? 'text-sm'
                    : fontSize === 'large'
                      ? 'text-lg'
                      : 'text-base'
                } ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }}
              />
            </div>
          </div>

          {/* Right Content Pane */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modified
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {rightContent.length} chars, {rightContent.split('\n').length}{' '}
                lines
              </div>
            </div>
            <div className="flex-1 p-3">
              <textarea
                value={rightContent}
                onChange={(e) => setRightContent(e.target.value)}
                placeholder="Paste or type your modified content here..."
                className={`w-full h-full min-h-[300px] resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 ${
                  fontSize === 'small'
                    ? 'text-sm'
                    : fontSize === 'large'
                      ? 'text-lg'
                      : 'text-base'
                } ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }}
              />
            </div>
          </div>
        </div>

        {/* Settings Preview Section (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Current Settings (Development Preview)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <Palette className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">
                  Theme: {theme}
                </span>
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                Font: {fontSize}
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                Syntax: {syntaxHighlighting ? 'On' : 'Off'}
              </div>
              <div className="text-blue-800 dark:text-blue-200">
                Line Numbers: {showLineNumbers ? 'On' : 'Off'}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
