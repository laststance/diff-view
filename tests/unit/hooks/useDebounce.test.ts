import { renderHook, act } from '@testing-library/react';

import {
  useDebounce,
  useDebouncedCallback,
} from '../../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time but not enough
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Fast forward past delay
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    // Rapid changes
    rerender({ value: 'change1', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'change2', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'final', delay: 300 });

    // Should still be initial after 200ms total
    expect(result.current).toBe('initial');

    // After full delay from last change
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('final');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    rerender({ value: 'updated', delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback updates', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ callback, delay }) => useDebouncedCallback(callback, delay),
      {
        initialProps: { callback: callback1, delay: 300 },
      }
    );

    const initialCallback = result.current;
    expect(typeof initialCallback).toBe('function');

    // Change callback
    rerender({ callback: callback2, delay: 300 });

    // Should still have old callback before delay
    expect(result.current).toBe(initialCallback);

    // After delay, should have new callback
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).not.toBe(initialCallback);
  });
});
