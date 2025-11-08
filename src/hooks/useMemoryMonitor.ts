import { useState, useEffect, useCallback, useMemo } from 'react';

export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
  isHighUsage: boolean;
}

export interface MemoryMonitorOptions {
  updateInterval?: number; // in milliseconds
  highUsageThreshold?: number; // percentage (0-100)
  enableMonitoring?: boolean;
}

const defaultOptions: Required<MemoryMonitorOptions> = {
  updateInterval: 5000, // 5 seconds
  highUsageThreshold: 80, // 80%
  enableMonitoring: true,
};

/**
 * Custom hook for monitoring memory usage
 * Uses performance.memory API when available
 * Provides warnings when memory usage is high
 */
export function useMemoryMonitor(options: MemoryMonitorOptions = {}): {
  memoryUsage: MemoryUsage | null;
  isSupported: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  forceUpdate: () => void;
} {
  // Memoize config to prevent unnecessary re-renders
  // React Compiler prefers options object as dependency for proper memoization
  const config = useMemo(
    () => ({ ...defaultOptions, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.updateInterval,
      options.highUsageThreshold,
      options.enableMonitoring,
    ]
  );
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Check if performance.memory is supported
  const isSupported =
    typeof performance !== 'undefined' && 'memory' in performance;

  const updateMemoryUsage = useCallback(() => {
    if (!isSupported) return;

    try {
      const memory = (
        performance as Performance & { memory?: PerformanceMemory }
      ).memory;
      if (memory) {
        const usedPercentage =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        const isHighUsage = usedPercentage > config.highUsageThreshold;

        setMemoryUsage({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedPercentage,
          isHighUsage,
        });
      }
    } catch (error) {
      console.warn('Failed to read memory usage:', error);
    }
  }, [isSupported, config.highUsageThreshold]);

  const startMonitoring = useCallback(() => {
    if (!isSupported || !config.enableMonitoring) return;
    setIsMonitoring(true);
  }, [isSupported, config.enableMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const forceUpdate = useCallback(() => {
    updateMemoryUsage();
  }, [updateMemoryUsage]);

  // Set up monitoring interval
  useEffect(() => {
    if (!isMonitoring || !config.enableMonitoring) return;

    // Initial update - use requestAnimationFrame to avoid synchronous setState
    const rafId = requestAnimationFrame(() => {
      updateMemoryUsage();
    });

    // Set up interval
    const interval = setInterval(updateMemoryUsage, config.updateInterval);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
    };
  }, [
    isMonitoring,
    config.enableMonitoring,
    config.updateInterval,
    updateMemoryUsage,
  ]);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (config.enableMonitoring) {
      // Use requestAnimationFrame to avoid synchronous setState
      const rafId = requestAnimationFrame(() => {
        startMonitoring();
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [config.enableMonitoring, startMonitoring]);

  return {
    memoryUsage,
    isSupported,
    startMonitoring,
    stopMonitoring,
    forceUpdate,
  };
}

/**
 * Utility function to format memory size in human-readable format
 */
export function formatMemorySize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Hook for monitoring content size and memory impact
 * Memoized to prevent unnecessary re-renders
 */
export function useContentMemoryMonitor(content: string): {
  contentSize: number;
  estimatedMemoryUsage: number;
  isLargeContent: boolean;
  recommendations: string[];
} {
  // Memoize the result to prevent creating new objects on every render
  return useMemo(() => {
    // Safely handle non-string content (null, undefined, etc.)
    const safeContent = typeof content === 'string' ? content : '';

    const contentSize = new Blob([safeContent]).size;

    // Rough estimation: content size * 2-3 for DOM representation + processing overhead
    const estimatedMemoryUsage = contentSize * 2.5;

    const isLargeContent = contentSize > 1024 * 1024; // 1MB threshold

    const recommendations: string[] = [];

    if (contentSize > 5 * 1024 * 1024) {
      // 5MB
      recommendations.push(
        'Consider splitting large content into smaller chunks'
      );
    }

    const lineCount = safeContent.split('\n').length;
    if (lineCount > 10000) {
      recommendations.push('Enable virtual scrolling for better performance');
    }

    if (estimatedMemoryUsage > 50 * 1024 * 1024) {
      // 50MB estimated
      recommendations.push('Content may cause high memory usage');
    }

    return {
      contentSize,
      estimatedMemoryUsage,
      isLargeContent,
      recommendations,
    };
  }, [content]);
}
