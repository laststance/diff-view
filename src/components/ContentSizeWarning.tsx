import {
  AlertTriangle,
  Info,
  HardDrive,
  FileText,
  Hash,
  Scissors,
  Zap,
  X,
} from 'lucide-react';
import React, { useMemo } from 'react';

import type { ContentLimits } from '../types/app';

export interface ContentSizeWarningProps {
  content: string;
  limits: ContentLimits;
  onOptimize?: () => void;
  onIgnore?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

// Progress bar component - defined outside render to avoid recreation
interface ProgressBarProps {
  percentage: number;
  label: string;
  current: string;
  max: string;
  icon: React.ComponentType<{ className?: string }>;
  warning: boolean;
  critical: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  current,
  max,
  icon: Icon,
  warning,
  critical,
}) => {
  const barColor = critical
    ? 'bg-red-500'
    : warning
      ? 'bg-orange-500'
      : 'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs">
          {current} / {max} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${percentage.toFixed(1)}%`}
        />
      </div>
    </div>
  );
};

/**
 * ContentSizeWarning component for displaying content size warnings and limits
 * Shows current usage vs limits with visual progress indicators
 * Provides suggestions and actions for handling large content
 */
export const ContentSizeWarning: React.FC<ContentSizeWarningProps> = ({
  content,
  limits,
  onOptimize,
  onIgnore,
  onDismiss,
  className = '',
  showDetails = true,
}) => {
  // Calculate content metrics
  const metrics = useMemo(() => {
    const sizeInBytes = new Blob([content]).size;
    const lineCount = content.split('\n').length;
    const charCount = content.length;

    // Calculate percentages
    const sizePercentage = (sizeInBytes / limits.maxFileSize) * 100;
    const linePercentage = (lineCount / limits.maxLines) * 100;
    const charPercentage = (charCount / limits.maxCharacters) * 100;

    // Determine warning levels
    const warningThreshold = limits.warningThreshold * 100;
    const criticalThreshold = 95; // 95% is critical

    const sizeWarning = sizePercentage >= warningThreshold;
    const lineWarning = linePercentage >= warningThreshold;
    const charWarning = charPercentage >= warningThreshold;

    const sizeCritical = sizePercentage >= criticalThreshold;
    const lineCritical = linePercentage >= criticalThreshold;
    const charCritical = charPercentage >= criticalThreshold;

    const hasWarning = sizeWarning || lineWarning || charWarning;
    const hasCritical = sizeCritical || lineCritical || charCritical;

    return {
      sizeInBytes,
      lineCount,
      charCount,
      sizePercentage,
      linePercentage,
      charPercentage,
      sizeWarning,
      lineWarning,
      charWarning,
      sizeCritical,
      lineCritical,
      charCritical,
      hasWarning,
      hasCritical,
    };
  }, [content, limits]);

  // Don't render if no warnings
  if (!metrics.hasWarning) {
    return null;
  }

  // Determine overall warning level
  const isError = metrics.hasCritical;

  // Styling based on warning level
  const warningConfig = {
    error: {
      icon: AlertTriangle,
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Content Size Critical',
      progressColor: 'bg-red-500',
    },
    warning: {
      icon: Info,
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      title: 'Content Size Warning',
      progressColor: 'bg-orange-500',
    },
  };

  const config = isError ? warningConfig.error : warningConfig.warning;
  const IconComponent = config.icon;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 space-y-3 ${className}`}
      role="alert"
      aria-live="polite"
      data-testid="content-size-warning"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent
              className={`h-5 w-5 ${config.color}`}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${config.color}`}>
              {config.title}
            </h3>
            <p className={`text-xs ${config.color} mt-1`}>
              {isError
                ? 'Content is approaching or exceeding size limits. Performance may be affected.'
                : 'Content is getting large. Consider optimizing for better performance.'}
            </p>
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`
              flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
              ${config.color} ${config.color.replace('text-', 'focus:ring-')}
            `}
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress indicators */}
      {showDetails && (
        <div className="space-y-3">
          {metrics.sizeWarning && (
            <ProgressBar
              percentage={metrics.sizePercentage}
              label="File Size"
              current={formatFileSize(metrics.sizeInBytes)}
              max={formatFileSize(limits.maxFileSize)}
              icon={HardDrive}
              warning={metrics.sizeWarning}
              critical={metrics.sizeCritical}
            />
          )}

          {metrics.lineWarning && (
            <ProgressBar
              percentage={metrics.linePercentage}
              label="Line Count"
              current={formatNumber(metrics.lineCount)}
              max={formatNumber(limits.maxLines)}
              icon={FileText}
              warning={metrics.lineWarning}
              critical={metrics.lineCritical}
            />
          )}

          {metrics.charWarning && (
            <ProgressBar
              percentage={metrics.charPercentage}
              label="Characters"
              current={formatNumber(metrics.charCount)}
              max={formatNumber(limits.maxCharacters)}
              icon={Hash}
              warning={metrics.charWarning}
              critical={metrics.charCritical}
            />
          )}
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${config.color}`}>Suggestions:</p>
        <ul className={`text-sm ${config.color} space-y-1 ml-4`}>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Remove unnecessary whitespace or comments</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Split content into smaller sections</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Focus on specific parts of the content</span>
          </li>
          {isError && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span className="font-medium">
                Consider using external diff tools for very large files
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      {(onOptimize || onIgnore) && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-current/20">
          {onOptimize && (
            <button
              onClick={onOptimize}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 border border-current/30 hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                ${config.color} ${config.color.replace('text-', 'focus:ring-')}
              `}
            >
              <Scissors className="h-4 w-4" />
              Optimize Content
            </button>
          )}

          {onIgnore && !isError && (
            <button
              onClick={onIgnore}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                bg-white dark:bg-gray-800 border border-current/30 hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                ${config.color} ${config.color.replace('text-', 'focus:ring-')}
              `}
            >
              <Zap className="h-4 w-4" />
              Continue Anyway
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for inline warnings
export const ContentSizeWarningCompact: React.FC<ContentSizeWarningProps> = (
  props
) => <ContentSizeWarning {...props} showDetails={false} className="p-2" />;

// Hook for content size validation
export const useContentSizeValidation = (
  content: string,
  limits: ContentLimits
) => {
  return useMemo(() => {
    const sizeInBytes = new Blob([content]).size;
    const lineCount = content.split('\n').length;
    const charCount = content.length;

    const sizePercentage = (sizeInBytes / limits.maxFileSize) * 100;
    const linePercentage = (lineCount / limits.maxLines) * 100;
    const charPercentage = (charCount / limits.maxCharacters) * 100;

    const warningThreshold = limits.warningThreshold * 100;
    const hasWarning =
      sizePercentage >= warningThreshold ||
      linePercentage >= warningThreshold ||
      charPercentage >= warningThreshold;

    const isValid =
      sizeInBytes <= limits.maxFileSize &&
      lineCount <= limits.maxLines &&
      charCount <= limits.maxCharacters;

    return {
      isValid,
      hasWarning,
      metrics: {
        sizeInBytes,
        lineCount,
        charCount,
        sizePercentage,
        linePercentage,
        charPercentage,
      },
    };
  }, [content, limits]);
};
