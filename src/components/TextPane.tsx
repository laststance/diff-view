import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { FileText, Copy } from 'lucide-react';

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
 */
export const TextPane: React.FC<TextPaneProps> = ({
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
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate content statistics
  const stats = useMemo(() => {
    const lines = value.split('\n').length;
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    return { lines, chars, words };
  }, [value]);

  // Handle paste functionality with clipboard API
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
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title || (id === 'left' ? 'Original' : 'Modified')}
          </span>
          {language && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Content Statistics */}
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
            <span>{stats.chars} chars</span>
            <span>•</span>
            <span>{stats.lines} lines</span>
            <span>•</span>
            <span>{stats.words} words</span>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                disabled={!value}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy content"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full ${fixedHeight || value.length > 100 ? 'h-[400px]' : 'h-full min-h-[300px]'} resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 p-3 ${fontSizeClass} ${
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
        />

        {/* Line Numbers Overlay (if enabled) */}
        {showLineNumbers && value && (
          <div className="absolute left-0 top-0 p-3 pointer-events-none select-none">
            <div
              className={`text-gray-400 dark:text-gray-500 ${fontSizeClass} leading-normal`}
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: '1.5',
              }}
            >
              {value.split('\n').map((_, index) => (
                <div key={index} className="text-right pr-2 min-w-[2rem]">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
