import { Loader2, FileText, Zap, Clock } from 'lucide-react';
import React from 'react';

export type LoadingType = 'spinner' | 'progress' | 'skeleton' | 'pulse';
export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingContext =
  | 'diffComputation'
  | 'fileProcessing'
  | 'contentValidation'
  | 'general';

export interface LoadingIndicatorProps {
  type?: LoadingType;
  size?: LoadingSize;
  message?: string;
  progress?: number; // 0-100 for progress type
  context?: LoadingContext;
  className?: string;
  showIcon?: boolean;
  inline?: boolean;
}

/**
 * LoadingIndicator component for various loading states
 * Provides accessible loading feedback with different visual styles
 * Integrates with application loading states and provides context-aware messaging
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'spinner',
  size = 'medium',
  message,
  progress = 0,
  context = 'general',
  className = '',
  showIcon = true,
  inline = false,
}) => {
  // Size classes
  const sizeClasses = {
    small: {
      spinner: 'h-4 w-4',
      container: 'gap-2 text-sm',
      skeleton: 'h-4',
    },
    medium: {
      spinner: 'h-6 w-6',
      container: 'gap-3 text-base',
      skeleton: 'h-6',
    },
    large: {
      spinner: 'h-8 w-8',
      container: 'gap-4 text-lg',
      skeleton: 'h-8',
    },
  };

  // Context-specific icons and default messages
  const contextConfig = {
    diffComputation: {
      icon: Zap,
      defaultMessage: 'Computing differences...',
      color: 'text-blue-600 dark:text-blue-400',
    },
    fileProcessing: {
      icon: FileText,
      defaultMessage: 'Processing file...',
      color: 'text-green-600 dark:text-green-400',
    },
    contentValidation: {
      icon: Clock,
      defaultMessage: 'Validating content...',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    general: {
      icon: Loader2,
      defaultMessage: 'Loading...',
      color: 'text-gray-600 dark:text-gray-400',
    },
  };

  const config = contextConfig[context];
  const IconComponent = config.icon;
  const displayMessage = message || config.defaultMessage;

  // Container classes
  const containerClasses = `
    ${inline ? 'inline-flex' : 'flex'} 
    items-center justify-center
    ${sizeClasses[size].container}
    ${className}
  `;

  // Render different loading types
  const renderLoadingContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <>
            {showIcon && (
              <IconComponent
                className={`${sizeClasses[size].spinner} ${config.color} animate-spin`}
                aria-hidden="true"
              />
            )}
            {displayMessage && (
              <span className={`${config.color} font-medium`}>
                {displayMessage}
              </span>
            )}
          </>
        );

      case 'progress':
        return (
          <div className="w-full max-w-xs">
            {displayMessage && (
              <div className={`${config.color} font-medium mb-2 text-center`}>
                {displayMessage}
              </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  context === 'diffComputation'
                    ? 'bg-blue-600'
                    : context === 'fileProcessing'
                      ? 'bg-green-600'
                      : context === 'contentValidation'
                        ? 'bg-yellow-600'
                        : 'bg-gray-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Loading progress: ${progress}%`}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {progress.toFixed(0)}%
            </div>
          </div>
        );

      case 'skeleton':
        return (
          <div className="animate-pulse space-y-2 w-full max-w-md">
            <div
              className={`bg-gray-300 dark:bg-gray-600 rounded ${sizeClasses[size].skeleton}`}
            />
            <div
              className={`bg-gray-300 dark:bg-gray-600 rounded ${sizeClasses[size].skeleton} w-3/4`}
            />
            <div
              className={`bg-gray-300 dark:bg-gray-600 rounded ${sizeClasses[size].skeleton} w-1/2`}
            />
          </div>
        );

      case 'pulse':
        return (
          <div className="flex items-center space-x-2">
            <div className={`${config.color} animate-pulse`}>
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
            {displayMessage && (
              <span className={`${config.color} font-medium`}>
                {displayMessage}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
      data-testid={`loading-indicator-${context}`}
    >
      {renderLoadingContent()}
    </div>
  );
};

// Preset loading indicators for common use cases
export const DiffComputationLoader: React.FC<
  Omit<LoadingIndicatorProps, 'context'>
> = (props) => <LoadingIndicator {...props} context="diffComputation" />;

export const FileProcessingLoader: React.FC<
  Omit<LoadingIndicatorProps, 'context'>
> = (props) => <LoadingIndicator {...props} context="fileProcessing" />;

export const ContentValidationLoader: React.FC<
  Omit<LoadingIndicatorProps, 'context'>
> = (props) => <LoadingIndicator {...props} context="contentValidation" />;

// Loading overlay component for full-screen loading states
export interface LoadingOverlayProps extends LoadingIndicatorProps {
  visible: boolean;
  backdrop?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  backdrop = true,
  ...loadingProps
}) => {
  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${backdrop ? 'bg-black/20 dark:bg-black/40 backdrop-blur-sm' : ''}
      `}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <LoadingIndicator {...loadingProps} size="large" />
      </div>
    </div>
  );
};
