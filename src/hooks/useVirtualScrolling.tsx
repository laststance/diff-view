import React, { useMemo, useCallback } from 'react';
// import { FixedSizeList } from 'react-window';

export interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number; // Number of items to trigger virtual scrolling
}

export interface VirtualScrollingResult {
  shouldUseVirtualScrolling: boolean;
  listProps: {
    height: number;
    itemCount: number;
    itemSize: number;
    overscanCount: number;
  };
  renderItem: (props: {
    index: number;
    style: React.CSSProperties;
  }) => React.ReactElement;
}

/**
 * Custom hook for virtual scrolling implementation
 * Determines when to use virtual scrolling based on content size
 * Provides optimized rendering for large lists
 */
export function useVirtualScrolling<T>(
  items: T[],
  renderItemContent: (item: T, index: number) => React.ReactNode,
  options: VirtualScrollingOptions
): VirtualScrollingResult {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 100,
  } = options;

  const shouldUseVirtualScrolling = items.length > threshold;

  const listProps = useMemo(
    () => ({
      height: containerHeight,
      itemCount: items.length,
      itemSize: itemHeight,
      overscanCount: overscan,
    }),
    [containerHeight, items.length, itemHeight, overscan]
  );

  const renderItem = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      return (
        <div style={style} key={index}>
          {renderItemContent(items[index], index)}
        </div>
      );
    },
    [items, renderItemContent]
  );

  return {
    shouldUseVirtualScrolling,
    listProps,
    renderItem,
  };
}

/**
 * Hook for virtual scrolling text content (line-based)
 */
export function useVirtualTextScrolling(
  content: string,
  options: Omit<VirtualScrollingOptions, 'threshold'> & {
    lineThreshold?: number;
  }
): {
  lines: string[];
  shouldUseVirtualScrolling: boolean;
  listProps: {
    height: number;
    itemCount: number;
    itemSize: number;
    overscanCount: number;
  };
  renderLine: (props: {
    index: number;
    style: React.CSSProperties;
  }) => React.ReactElement;
} {
  const { lineThreshold = 1000, ...virtualOptions } = options;

  const lines = useMemo(() => content.split('\n'), [content]);

  const shouldUseVirtualScrolling = lines.length > lineThreshold;

  const listProps = useMemo(
    () => ({
      height: virtualOptions.containerHeight,
      itemCount: lines.length,
      itemSize: virtualOptions.itemHeight,
      overscanCount: virtualOptions.overscan || 10,
    }),
    [
      virtualOptions.containerHeight,
      lines.length,
      virtualOptions.itemHeight,
      virtualOptions.overscan,
    ]
  );

  const renderLine = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      return (
        <div
          style={style}
          key={index}
          className="font-mono text-sm whitespace-pre"
        >
          <span className="text-gray-400 select-none pr-4 text-right inline-block w-12">
            {index + 1}
          </span>
          <span>{lines[index]}</span>
        </div>
      );
    },
    [lines]
  );

  return {
    lines,
    shouldUseVirtualScrolling,
    listProps,
    renderLine,
  };
}

/**
 * Performance utilities for virtual scrolling
 */
export const VirtualScrollingUtils = {
  /**
   * Calculate optimal item height based on font size and line height
   */
  calculateItemHeight: (fontSize: 'small' | 'medium' | 'large'): number => {
    const baseSizes = {
      small: 16,
      medium: 18,
      large: 20,
    };
    return baseSizes[fontSize] * 1.5; // line-height factor
  },

  /**
   * Calculate container height based on available space
   */
  calculateContainerHeight: (maxHeight: number, itemHeight: number): number => {
    return Math.floor(maxHeight / itemHeight) * itemHeight;
  },

  /**
   * Determine if virtual scrolling should be used based on performance metrics
   */
  shouldUseVirtualScrolling: (
    itemCount: number,
    itemHeight: number,
    containerHeight: number,
    performanceThreshold: number = 100
  ): boolean => {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const renderRatio = visibleItems / itemCount;

    // Use virtual scrolling if we're rendering less than 20% of items
    // or if item count exceeds performance threshold
    return itemCount > performanceThreshold || renderRatio < 0.2;
  },
};
