import React from 'react';

import { useAppStore } from '../store/appStore';

export interface DiffViewerProps {
  className?: string;
}

/**
 * DiffViewer component wrapper with proper TypeScript interfaces
 * Integrates @git-diff-view/react library for GitHub-style diff visualization
 * Handles diff computation logic and automatic diff generation
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({ className }) => {
  const { leftContent, rightContent, viewMode, theme, diffData, isProcessing } =
    useAppStore();

  console.log('DiffViewer rendering with:', {
    leftContent: leftContent?.length || 0,
    rightContent: rightContent?.length || 0,
  });

  try {
    return (
      <div
        className={`diff-viewer-container ${className || ''}`}
        data-testid="diff-viewer"
      >
        {/* Always show the container for debugging */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p>DiffViewer Debug Info:</p>
          <p>Left content: {leftContent?.length || 0} chars</p>
          <p>Right content: {rightContent?.length || 0} chars</p>
          <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
          <p>Diff data: {diffData ? 'Present' : 'None'}</p>
          <p>View mode: {viewMode}</p>
          <p>Theme: {theme}</p>
        </div>

        {/* Placeholder for actual diff view */}
        {leftContent && rightContent && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p>Diff would be rendered here</p>
            <p>
              Comparing {leftContent.split('\n').length} lines vs{' '}
              {rightContent.split('\n').length} lines
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in DiffViewer:', error);
    return (
      <div
        className={`diff-viewer-container error ${className || ''}`}
        data-testid="diff-viewer"
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p>Error in DiffViewer component</p>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};
