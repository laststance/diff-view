import { renderHook, act } from '@testing-library/react';

import {
  useMemoryMonitor,
  useContentMemoryMonitor,
  formatMemorySize,
} from '../../../src/hooks/useMemoryMonitor';

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  totalJSHeapSize: 60 * 1024 * 1024, // 60MB
  jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
};

describe('useMemoryMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: mockMemory,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up mock
    delete (performance as any).memory;
  });

  it('should detect memory API support', () => {
    const { result } = renderHook(() => useMemoryMonitor());
    expect(result.current.isSupported).toBe(true);
  });

  it('should start monitoring automatically when enabled', () => {
    const { result } = renderHook(() =>
      useMemoryMonitor({ enableMonitoring: true })
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.memoryUsage).toEqual({
      usedJSHeapSize: mockMemory.usedJSHeapSize,
      totalJSHeapSize: mockMemory.totalJSHeapSize,
      jsHeapSizeLimit: mockMemory.jsHeapSizeLimit,
      usedPercentage: 50, // 50MB / 100MB * 100
      isHighUsage: false, // 50% < 80% threshold
    });
  });

  it('should detect high memory usage', () => {
    // Mock high memory usage
    const highMemory = {
      ...mockMemory,
      usedJSHeapSize: 85 * 1024 * 1024, // 85MB
    };
    Object.defineProperty(performance, 'memory', {
      value: highMemory,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useMemoryMonitor({
        enableMonitoring: true,
        highUsageThreshold: 80,
      })
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.memoryUsage?.isHighUsage).toBe(true);
    expect(result.current.memoryUsage?.usedPercentage).toBe(85);
  });

  it('should update at specified intervals', () => {
    const { result } = renderHook(() =>
      useMemoryMonitor({
        enableMonitoring: true,
        updateInterval: 1000,
      })
    );

    // Initial update
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.memoryUsage).toBeTruthy();

    // Change memory values
    const newMemory = {
      ...mockMemory,
      usedJSHeapSize: 60 * 1024 * 1024,
    };
    Object.defineProperty(performance, 'memory', {
      value: newMemory,
      configurable: true,
    });

    // Advance by interval
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.memoryUsage?.usedJSHeapSize).toBe(60 * 1024 * 1024);
  });

  it('should handle manual start/stop', () => {
    const { result } = renderHook(() =>
      useMemoryMonitor({ enableMonitoring: false })
    );

    expect(result.current.memoryUsage).toBeNull();

    act(() => {
      result.current.startMonitoring();
      // Force immediate update after starting
      result.current.forceUpdate();
    });

    expect(result.current.memoryUsage).toBeTruthy();

    act(() => {
      result.current.stopMonitoring();
    });

    // Memory usage should still be there but monitoring stopped
    expect(result.current.memoryUsage).toBeTruthy();
  });

  it('should force update memory usage', () => {
    const { result } = renderHook(() =>
      useMemoryMonitor({ enableMonitoring: false })
    );

    expect(result.current.memoryUsage).toBeNull();

    act(() => {
      result.current.forceUpdate();
    });

    expect(result.current.memoryUsage).toBeTruthy();
  });

  it('should handle unsupported environment', () => {
    // Remove memory API
    delete (performance as any).memory;

    const { result } = renderHook(() => useMemoryMonitor());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.memoryUsage).toBeNull();
  });
});

describe('useContentMemoryMonitor', () => {
  it('should calculate content size correctly', () => {
    const content = 'Hello, World!';
    const { result } = renderHook(() => useContentMemoryMonitor(content));

    expect(result.current.contentSize).toBe(new Blob([content]).size);
    expect(result.current.estimatedMemoryUsage).toBe(
      result.current.contentSize * 2.5
    );
    expect(result.current.isLargeContent).toBe(false);
  });

  it('should detect large content', () => {
    const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
    const { result } = renderHook(() => useContentMemoryMonitor(largeContent));

    expect(result.current.isLargeContent).toBe(true);
  });

  it('should provide recommendations for large content', () => {
    const veryLargeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
    const { result } = renderHook(() =>
      useContentMemoryMonitor(veryLargeContent)
    );

    expect(result.current.recommendations).toContain(
      'Consider splitting large content into smaller chunks'
    );
  });

  it('should recommend virtual scrolling for many lines', () => {
    const manyLines = Array(15000).fill('line').join('\n');
    const { result } = renderHook(() => useContentMemoryMonitor(manyLines));

    expect(result.current.recommendations).toContain(
      'Enable virtual scrolling for better performance'
    );
  });

  it('should warn about high memory usage', () => {
    const highMemoryContent = 'x'.repeat(25 * 1024 * 1024); // 25MB content = ~62.5MB estimated
    const { result } = renderHook(() =>
      useContentMemoryMonitor(highMemoryContent)
    );

    expect(result.current.recommendations).toContain(
      'Content may cause high memory usage'
    );
  });
});

describe('formatMemorySize', () => {
  it('should format bytes correctly', () => {
    expect(formatMemorySize(512)).toBe('512.0 B');
    expect(formatMemorySize(1024)).toBe('1.0 KB');
    expect(formatMemorySize(1536)).toBe('1.5 KB');
    expect(formatMemorySize(1024 * 1024)).toBe('1.0 MB');
    expect(formatMemorySize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(formatMemorySize(1024 * 1024 * 1024)).toBe('1.0 GB');
  });

  it('should handle zero and negative values', () => {
    expect(formatMemorySize(0)).toBe('0.0 B');
    expect(formatMemorySize(-100)).toBe('-100.0 B');
  });
});
