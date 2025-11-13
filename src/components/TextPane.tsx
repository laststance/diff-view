import { FileText, Copy } from 'lucide-react';
import React, { useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { List } from 'react-window';

import { useContentMemoryMonitor } from '../hooks/useMemoryMonitor';
import {
  useVirtualTextScrolling,
  VirtualScrollingUtils,
} from '../hooks/useVirtualScrolling';

// import {
//   ContentSizeWarning,
//   useContentSizeValidation,
// } from './ContentSizeWarning';
// import { ErrorBoundary } from './ErrorBoundary';

export interface TextPaneProps {
  id: 'left' | 'right';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  language?: string;
  readOnly?: boolean;
  title?: string;
  fontSize?: 'small' | 'medium' | 'large';
  wordWrap?: boolean;
  showLineNumbers?: boolean;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  scrollTop?: number;
  scrollLeft?: number;
  fixedHeight?: boolean;
}

/**
 * TextPane component for left and right text areas
 * Supports paste functionality with clipboard API integration
 * Displays character and line count
 * Optimized with virtual scrolling for large content and memoization
 */
export const TextPane: React.FC<TextPaneProps> = memo(function TextPane({
  id,
  value,
  onChange,
  placeholder,
  language,
  readOnly = false,
  title,
  fontSize = 'medium',
  wordWrap = false,
  showLineNumbers = true,
  onScroll,
  scrollTop,
  scrollLeft,
  fixedHeight = false,
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor content memory impact
  const contentMemory = useContentMemoryMonitor(value);

  // Calculate content statistics (memoized for performance)
  const stats = useMemo(() => {
    const lines = value.split('\n').length;
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    return { lines, chars, words };
  }, [value]);

  // Calculate optimal item height for virtual scrolling
  const itemHeight = useMemo(
    () => VirtualScrollingUtils.calculateItemHeight(fontSize),
    [fontSize]
  );

  // Virtual scrolling configuration
  const virtualScrolling = useVirtualTextScrolling(value, {
    itemHeight,
    containerHeight: fixedHeight
      ? 400
      : Math.min(600, Math.max(300, stats.lines * itemHeight)),
    overscan: 10,
    lineThreshold: 1000, // Use virtual scrolling for content with >1000 lines
  });

  const shouldUseVirtualScrolling =
    virtualScrolling.shouldUseVirtualScrolling && !readOnly;

  // Handle paste functionality with clipboard API (memoized for performance)
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      e.preventDefault();

      try {
        // Try to use the modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue =
                value.substring(0, start) + text + value.substring(end);
              onChange(newValue);

              // Restore cursor position after the pasted text
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                  start + text.length;
                textarea.focus();
              }, 0);
            }
          }
        } else {
          // Fallback to clipboardData for older browsers
          const text = e.clipboardData.getData('text/plain');
          if (text) {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue =
                value.substring(0, start) + text + value.substring(end);
              onChange(newValue);

              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                  start + text.length;
                textarea.focus();
              }, 0);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to read from clipboard:', error);
        // Let the default paste behavior handle it
        setTimeout(() => {
          if (textareaRef.current) {
            onChange(textareaRef.current.value);
          }
        }, 0);
      }
    },
    [value, onChange]
  );

  // Handle copy functionality
  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.select();
          document.execCommand('copy');
        }
      }
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+A / Cmd+A - Select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (textareaRef.current) {
        textareaRef.current.select();
      }
    }

    // Ctrl+C / Cmd+C - Copy (when text is selected)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const textarea = textareaRef.current;
      if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
        // Let the default copy behavior handle it
        return;
      }
    }
  }, []);

  // Auto-resize textarea height based on content (only if not fixed height)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && !fixedHeight) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(300, textarea.scrollHeight)}px`;
    }
  }, [value, fixedHeight]);

  // Handle scroll synchronization
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      if (onScroll) {
        onScroll(target.scrollTop, target.scrollLeft);
      }
    },
    [onScroll]
  );

  // Apply external scroll position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && scrollTop !== undefined && scrollLeft !== undefined) {
      // Only update if the scroll position is different to avoid infinite loops
      if (
        textarea.scrollTop !== scrollTop ||
        textarea.scrollLeft !== scrollLeft
      ) {
        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;
      }
    }
  }, [scrollTop, scrollLeft]);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[fontSize];

  return (
    // <ErrorBoundary level="component">
    <div
      data-testid={`text-pane-${id}`}
      className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full"
      role="region"
      aria-label={`${title || (id === 'left' ? 'Original' : 'Modified')} text pane`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-t-lg"
        role="banner"
        aria-label="Text pane header"
      >
        <div className="flex items-center space-x-2">
          <FileText
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title || (id === 'left' ? 'Original' : 'Modified')}
          </h2>
          {language && (
            <span
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
              aria-label={`Language: ${language}`}
            >
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Content Statistics with Size Indicator */}
          <div
            id={`text-pane-${id}-stats`}
            className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2"
            role="status"
            aria-live="polite"
            aria-label={`Content statistics: ${stats.chars} characters, ${stats.lines} lines, ${stats.words} words`}
          >
            <span aria-label={`${stats.chars} characters`}>
              {stats.chars} chars
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span aria-label={`${stats.lines} lines`}>{stats.lines} lines</span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span aria-label={`${stats.words} words`}>{stats.words} words</span>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div
              className="flex items-center space-x-1"
              role="group"
              aria-label="Text actions"
            >
              <button
                onClick={handleCopy}
                disabled={!value}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                title="Copy content to clipboard"
                aria-label="Copy content to clipboard"
                type="button"
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text Area - with virtual scrolling for large content */}
      <div className="flex-1 relative" ref={containerRef}>
        {shouldUseVirtualScrolling ? (
          /* Virtual scrolling for large content (read-only mode) */
          <div className="h-full">
            <List
              {...virtualScrolling.listProps}
              className="font-mono"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
              rowComponent={virtualScrolling.renderLine}
              rowProps={{}}
            />
            {/* Performance indicator */}
            <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
              Virtual scrolling enabled ({stats.lines.toLocaleString()} lines)
            </div>
          </div>
        ) : (
          /* Standard textarea for normal content */
          <>
            <textarea
              ref={textareaRef}
              data-testid={`textarea-${id}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder={placeholder}
              readOnly={readOnly}
              className={`w-full ${fixedHeight || value.length > 100 ? 'h-[400px]' : 'h-full min-h-[300px]'} resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${showLineNumbers ? 'pl-14 pr-3 py-3' : 'p-3'} ${fontSizeClass} ${
                wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
              }`}
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label={`${title || (id === 'left' ? 'Original' : 'Modified')} text content`}
              aria-describedby={`text-pane-${id}-stats`}
              aria-multiline="true"
              role="textbox"
            />

            {/* Line Numbers Overlay (if enabled and not using virtual scrolling) */}
            {showLineNumbers && value && !shouldUseVirtualScrolling && (
              <div className="absolute left-0 top-0 py-3 pl-3 w-14 pointer-events-none select-none">
                <div
                  className={`text-gray-400 dark:text-gray-500 ${fontSizeClass}`}
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    lineHeight: '1.5',
                  }}
                >
                  {value.split('\n').map((_, index) => (
                    <div key={index} className="text-right pr-3">
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Performance and Memory Information */}
      {contentMemory.isLargeContent && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">⚠️ Large Content Detected</p>
            <div className="space-y-1">
              <p>Size: {(contentMemory.contentSize / 1024).toFixed(1)}KB</p>
              <p>
                Estimated memory:{' '}
                {(contentMemory.estimatedMemoryUsage / 1024 / 1024).toFixed(1)}
                MB
              </p>
              {contentMemory.recommendations.length > 0 && (
                <div>
                  <p className="font-medium">Recommendations:</p>
                  <ul className="list-disc list-inside ml-2">
                    {contentMemory.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Size Warning - Temporarily disabled for debugging */}
      {/* {sizeValidation.hasWarning && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <ContentSizeWarning
            content={value}
            limits={contentLimits}
            onOptimize={() => {
              // Simple optimization: remove extra whitespace
              const optimized = value
                .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove multiple empty lines
                .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
                .trim();
              onChange(optimized);
            }}
            showDetails={false}
            className="text-xs"
          />
        </div>
      )} */}
    </div>
    // </ErrorBoundary>
  );
});
