import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  HardDrive,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

import type { AppError, ErrorType } from '../types/app';

export interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  onClear?: () => void;
  showDetails?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * ErrorMessage component for displaying user-friendly error messages
 * Provides context-aware styling, recovery actions, and detailed error information
 * Supports different error types with appropriate visual styling and recovery options
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  onClear,
  showDetails = false,
  className = '',
  compact = false,
}) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Error type configuration
  const errorConfig: Record<
    ErrorType,
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bgColor: string;
      borderColor: string;
      title: string;
      suggestions: string[];
    }
  > = {
    'diff-computation': {
      icon: AlertTriangle,
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Diff Computation Failed',
      suggestions: [
        'Try with smaller content',
        'Check for unusual characters',
        'Retry the operation',
      ],
    },
    'content-size': {
      icon: HardDrive,
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      title: 'Content Size Limit',
      suggestions: [
        'Reduce content size',
        'Split into smaller sections',
        'Remove unnecessary content',
      ],
    },
    'memory-limit': {
      icon: AlertCircle,
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      title: 'Memory Limit Reached',
      suggestions: [
        'Close other applications',
        'Reduce content size',
        'Restart the application',
      ],
    },
    'processing-timeout': {
      icon: Clock,
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: 'Processing Timeout',
      suggestions: [
        'Try with smaller content',
        'Check system performance',
        'Retry the operation',
      ],
    },
    'invalid-content': {
      icon: XCircle,
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      title: 'Invalid Content',
      suggestions: [
        'Check content format',
        'Remove special characters',
        'Try different content',
      ],
    },
    unknown: {
      icon: AlertTriangle,
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      title: 'Unexpected Error',
      suggestions: [
        'Retry the operation',
        'Refresh the application',
        'Check console for details',
      ],
    },
  };

  const config = errorConfig[error.type];
  const IconComponent = config.icon;

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Determine available actions
  const canRetry = error.recoverable && onRetry;
  const canDismiss = onDismiss;
  const canClear = onClear;

  const containerClasses = `
    ${config.bgColor} ${config.borderColor} border rounded-lg p-4
    ${compact ? 'space-y-2' : 'space-y-3'}
    ${className}
  `;

  return (
    <div
      className={containerClasses}
      role="alert"
      aria-live="assertive"
      data-testid={`error-message-${error.type}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent
              className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} ${config.color}`}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`${compact ? 'text-sm' : 'text-base'} font-medium ${config.color}`}
            >
              {config.title}
            </h3>
            <p
              className={`${compact ? 'text-xs' : 'text-sm'} ${config.color} mt-1`}
            >
              {error.message}
            </p>
            {!compact && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Occurred at {formatTimestamp(error.timestamp)}
              </p>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {canDismiss && (
          <button
            onClick={onDismiss}
            className={`
              flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
              ${config.color.replace('text-', 'focus:ring-')}
            `}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {!compact && config.suggestions.length > 0 && (
        <div className="mt-3">
          <p className={`text-sm font-medium ${config.color} mb-2`}>
            Suggestions:
          </p>
          <ul className={`text-sm ${config.color} space-y-1 ml-4`}>
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {(canRetry || canClear || (showDetails && error.details)) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-current/20">
          {canRetry && (
            <button
              onClick={onRetry}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 border border-current/30 hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                ${config.color} ${config.color.replace('text-', 'focus:ring-')}
              `}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}

          {canClear && (
            <button
              onClick={onClear}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 border border-current/30 hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                ${config.color} ${config.color.replace('text-', 'focus:ring-')}
              `}
            >
              <Trash2 className="h-4 w-4" />
              Clear Content
            </button>
          )}

          {showDetails && error.details && (
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 border border-current/30 hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                ${config.color} ${config.color.replace('text-', 'focus:ring-')}
              `}
            >
              {isDetailsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {isDetailsExpanded ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
      )}

      {/* Error details */}
      {showDetails && error.details && isDetailsExpanded && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className={`text-sm font-medium ${config.color} mb-2`}>
            Technical Details:
          </p>
          <div className="bg-black/5 dark:bg-white/5 rounded-md p-3 overflow-auto max-h-32">
            <pre
              className={`text-xs ${config.color} whitespace-pre-wrap font-mono`}
            >
              {error.details}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Preset error message components for common error types
export const DiffComputationError: React.FC<
  Omit<ErrorMessageProps, 'error'> & { error: AppError }
> = (props) => <ErrorMessage {...props} />;

export const ContentSizeError: React.FC<
  Omit<ErrorMessageProps, 'error'> & { error: AppError }
> = (props) => <ErrorMessage {...props} />;

export const ProcessingTimeoutError: React.FC<
  Omit<ErrorMessageProps, 'error'> & { error: AppError }
> = (props) => <ErrorMessage {...props} />;

// Error toast component for non-blocking error notifications
export interface ErrorToastProps extends ErrorMessageProps {
  visible: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  visible,
  autoHide = true,
  autoHideDelay = 5000,
  onDismiss,
  ...errorProps
}) => {
  useEffect(() => {
    if (visible && autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, autoHideDelay, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-full duration-300"
      role="alert"
      aria-live="assertive"
    >
      <ErrorMessage
        {...errorProps}
        onDismiss={onDismiss}
        compact={true}
        className="shadow-lg"
      />
    </div>
  );
};
