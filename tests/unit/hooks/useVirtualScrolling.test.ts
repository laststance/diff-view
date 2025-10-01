import { renderHook } from '@testing-library/react';

import {
  useVirtualScrolling,
  useVirtualTextScrolling,
  VirtualScrollingUtils,
} from '../../../src/hooks/useVirtualScrolling';

describe('useVirtualScrolling', () => {
  const mockItems = Array.from({ length: 200 }, (_, i) => `Item ${i}`);
  const mockRenderItem = vi.fn(
    (item: string, _index: number) => `Rendered: ${item}`
  );

  const defaultOptions = {
    itemHeight: 30,
    containerHeight: 400,
    overscan: 5,
    threshold: 100,
  };

  it('should determine when to use virtual scrolling', () => {
    // Below threshold - should not use virtual scrolling
    const smallItems = Array.from({ length: 50 }, (_, i) => `Item ${i}`);
    const { result: smallResult } = renderHook(() =>
      useVirtualScrolling(smallItems, mockRenderItem, defaultOptions)
    );
    expect(smallResult.current.shouldUseVirtualScrolling).toBe(false);

    // Above threshold - should use virtual scrolling
    const { result: largeResult } = renderHook(() =>
      useVirtualScrolling(mockItems, mockRenderItem, defaultOptions)
    );
    expect(largeResult.current.shouldUseVirtualScrolling).toBe(true);
  });

  it('should provide correct list props', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, mockRenderItem, defaultOptions)
    );

    expect(result.current.listProps).toEqual({
      defaultHeight: 400,
      rowCount: 200,
      rowHeight: 30,
      overscanCount: 5,
    });
  });

  it('should create render function', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, mockRenderItem, defaultOptions)
    );

    const mockProps = {
      ariaAttributes: {
        'aria-posinset': 1,
        'aria-setsize': 200,
        role: 'listitem' as const,
      },
      index: 0,
      style: { height: 30, top: 0 },
    };

    const rendered = result.current.renderItem(mockProps);
    expect(rendered).toBeDefined();
    expect(typeof rendered).toBe('object');
  });

  it('should update when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useVirtualScrolling(items, mockRenderItem, defaultOptions),
      { initialProps: { items: mockItems } }
    );

    expect(result.current.listProps.rowCount).toBe(200);

    const newItems = Array.from({ length: 300 }, (_, i) => `New Item ${i}`);
    rerender({ items: newItems });

    expect(result.current.listProps.rowCount).toBe(300);
  });

  it('should respect custom threshold', () => {
    const customOptions = { ...defaultOptions, threshold: 250 };
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, mockRenderItem, customOptions)
    );

    expect(result.current.shouldUseVirtualScrolling).toBe(false);
  });
});

describe('useVirtualTextScrolling', () => {
  const multiLineContent = Array.from(
    { length: 1500 },
    (_, i) => `Line ${i + 1}: Some content here`
  ).join('\n');
  const smallContent = Array.from(
    { length: 50 },
    (_, i) => `Line ${i + 1}`
  ).join('\n');

  const defaultOptions = {
    itemHeight: 20,
    containerHeight: 400,
    overscan: 10,
    lineThreshold: 1000,
  };

  it('should split content into lines', () => {
    const { result } = renderHook(() =>
      useVirtualTextScrolling(multiLineContent, defaultOptions)
    );

    expect(result.current.lines).toHaveLength(1500);
    expect(result.current.lines[0]).toBe('Line 1: Some content here');
  });

  it('should determine when to use virtual scrolling for text', () => {
    // Small content - should not use virtual scrolling
    const { result: smallResult } = renderHook(() =>
      useVirtualTextScrolling(smallContent, defaultOptions)
    );
    expect(smallResult.current.shouldUseVirtualScrolling).toBe(false);

    // Large content - should use virtual scrolling
    const { result: largeResult } = renderHook(() =>
      useVirtualTextScrolling(multiLineContent, defaultOptions)
    );
    expect(largeResult.current.shouldUseVirtualScrolling).toBe(true);
  });

  it('should provide correct list props for text', () => {
    const { result } = renderHook(() =>
      useVirtualTextScrolling(multiLineContent, defaultOptions)
    );

    expect(result.current.listProps).toEqual({
      defaultHeight: 400,
      rowCount: 1500,
      rowHeight: 20,
      overscanCount: 10,
    });
  });

  it('should create line render function', () => {
    const { result } = renderHook(() =>
      useVirtualTextScrolling(multiLineContent, defaultOptions)
    );

    const mockProps = {
      ariaAttributes: {
        'aria-posinset': 1,
        'aria-setsize': 100,
        role: 'listitem' as const,
      },
      index: 0,
      style: { height: 20, top: 0 },
    };

    const rendered = result.current.renderLine(mockProps);
    expect(rendered).toBeDefined();
    // Verify it's a valid React element
    expect(typeof rendered).toBe('object');
  });

  it('should handle empty content', () => {
    const { result } = renderHook(() =>
      useVirtualTextScrolling('', defaultOptions)
    );

    expect(result.current.lines).toEqual(['']);
    expect(result.current.shouldUseVirtualScrolling).toBe(false);
  });

  it('should respect custom line threshold', () => {
    const customOptions = { ...defaultOptions, lineThreshold: 2000 };
    const { result } = renderHook(() =>
      useVirtualTextScrolling(multiLineContent, customOptions)
    );

    expect(result.current.shouldUseVirtualScrolling).toBe(false);
  });
});

describe('VirtualScrollingUtils', () => {
  describe('calculateItemHeight', () => {
    it('should calculate correct heights for different font sizes', () => {
      expect(VirtualScrollingUtils.calculateItemHeight('small')).toBe(24); // 16 * 1.5
      expect(VirtualScrollingUtils.calculateItemHeight('medium')).toBe(27); // 18 * 1.5
      expect(VirtualScrollingUtils.calculateItemHeight('large')).toBe(30); // 20 * 1.5
    });
  });

  describe('calculateContainerHeight', () => {
    it('should calculate container height based on item height', () => {
      expect(VirtualScrollingUtils.calculateContainerHeight(500, 25)).toBe(500); // 20 * 25 = 500
      expect(VirtualScrollingUtils.calculateContainerHeight(510, 25)).toBe(500); // Floor to 20 * 25
      expect(VirtualScrollingUtils.calculateContainerHeight(490, 25)).toBe(475); // Floor to 19 * 25
    });
  });

  describe('shouldUseVirtualScrolling', () => {
    it('should recommend virtual scrolling for large item counts', () => {
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(200, 25, 400, 100)
      ).toBe(true);
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(50, 25, 400, 100)
      ).toBe(false);
    });

    it('should recommend virtual scrolling for low render ratios', () => {
      // 400 / 25 = 16 visible items, 16 / 200 = 0.08 ratio (< 0.2)
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(200, 25, 400, 50)
      ).toBe(true);

      // 400 / 25 = 16 visible items, 16 / 20 = 0.8 ratio (> 0.2)
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(20, 25, 400, 50)
      ).toBe(false);
    });

    it('should use custom performance threshold', () => {
      // Test with high render ratio (>20%) to isolate threshold logic
      // 10 items, 400 container, 25 item height = 16/10 = 1.6 ratio (>20%)
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(10, 25, 400, 200)
      ).toBe(false); // Below threshold and high render ratio
      expect(
        VirtualScrollingUtils.shouldUseVirtualScrolling(150, 25, 400, 100)
      ).toBe(true); // Above threshold
    });
  });
});
