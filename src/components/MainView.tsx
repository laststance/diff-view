import React, { useMemo } from 'react';
import { Type, Palette } from 'lucide-react';

import { useAppStore } from '../store/appStore';

import { Layout } from './Layout';
import { TextPane } from './TextPane';
import { PasteArea } from './PasteArea';

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
          <div className="flex flex-col space-y-4 h-full">
            <TextPane
              id="left"
              value={leftContent}
              onChange={setLeftContent}
              placeholder="Paste or type your original content here..."
              title="Original"
              fontSize={fontSize}
              wordWrap={wordWrap}
              showLineNumbers={showLineNumbers}
            />

            {/* PasteArea for left pane when empty */}
            {!leftContent && (
              <PasteArea
                onContentPaste={(content, _fileName) => {
                  setLeftContent(content);
                }}
                className="min-h-[120px]"
              />
            )}
          </div>

          {/* Right Content Pane */}
          <div className="flex flex-col space-y-4 h-full">
            <TextPane
              id="right"
              value={rightContent}
              onChange={setRightContent}
              placeholder="Paste or type your modified content here..."
              title="Modified"
              fontSize={fontSize}
              wordWrap={wordWrap}
              showLineNumbers={showLineNumbers}
            />

            {/* PasteArea for right pane when empty */}
            {!rightContent && (
              <PasteArea
                onContentPaste={(content, _fileName) => {
                  setRightContent(content);
                }}
                className="min-h-[120px]"
              />
            )}
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
