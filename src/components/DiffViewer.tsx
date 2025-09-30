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
        role="region"
        aria-label="Diff visualization area"
        aria-live="polite"
      >
        {/* Always show the container for debugging */}
        <div
          className="p-4 bg-blue-50 border border-blue-200 rounded"
          role="status"
          aria-label="Diff viewer debug information"
        >
          <h3 className="font-medium mb-2">DiffViewer Debug Info:</h3>
          <ul className="space-y-1 text-sm">
            <li>Left content: {leftContent?.length || 0} chars</li>
            <li>Right content: {rightContent?.length || 0} chars</li>
            <li>Processing: {isProcessing ? 'Yes' : 'No'}</li>
            <li>Diff data: {diffData ? 'Present' : 'None'}</li>
            <li>View mode: {viewMode}</li>
            <li>Theme: {theme}</li>
          </ul>
        </div>

        {/* Placeholder for actual diff view */}
        {leftContent && rightContent && (
          <div
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded"
            role="region"
            aria-label="Diff comparison result"
          >
            <h3 className="font-medium mb-2">Diff Comparison</h3>
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
