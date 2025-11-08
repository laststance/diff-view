import { useEffect, useRef, useCallback } from 'react';

import { useAppStore } from '../store/appStore';
import type { DiffData } from '../types/app';

/**
 * Custom hook for managing diff change navigation.
 *
 * Phase 3 Feature 2: Diff Navigation
 * - Detects changes (add/delete/modify lines) from diffData
 * - Creates refs for each change line
 * - Updates totalChanges in store
 * - Provides scrollToChange function
 * - Handles scrollIntoView when currentChangeIndex changes
 */
export const useChangeNavigation = (diffData: DiffData | null) => {
  const changeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const currentChangeIndex = useAppStore((state) => state.currentChangeIndex);
  // Don't subscribe to setCurrentChangeIndex to avoid re-renders - use getState() instead
  const lastTotalChangesRef = useRef<number>(0);
  const hasAdjustedIndexRef = useRef<boolean>(false);

  // Calculate total changes when diffData changes
  useEffect(() => {
    if (!diffData) {
      // No diff data, reset navigation
      // Only update if values actually changed
      // Use setTimeout to defer state update and avoid synchronous setState in effect
      const currentState = useAppStore.getState();
      if (currentState.totalChanges !== 0 || currentState.currentChangeIndex !== null) {
        setTimeout(() => {
          useAppStore.setState({ totalChanges: 0, currentChangeIndex: null });
        }, 0);
      }
      changeRefs.current.clear();
      lastTotalChangesRef.current = 0;
      hasAdjustedIndexRef.current = false;
      return;
    } else {
      // Count changes (add, delete, modify lines)
      let totalChanges = 0;
      diffData.hunks.forEach((hunk) => {
        hunk.lines.forEach((line) => {
          if (line.type === 'add' || line.type === 'delete' || line.type === 'modify') {
            totalChanges++;
          }
        });
      });

      // Update store with total changes only if it actually changed
      // This prevents unnecessary re-renders and React error #185
      // Use setTimeout to defer state update and avoid synchronous setState in effect
      const previousTotalChanges = lastTotalChangesRef.current;
      if (previousTotalChanges !== totalChanges) {
        // Only update if value changed to prevent unnecessary store updates
        // Defer update to avoid synchronous setState in effect
        setTimeout(() => {
          useAppStore.setState({ totalChanges });
        }, 0);
        lastTotalChangesRef.current = totalChanges;
        hasAdjustedIndexRef.current = false;
      }
    }
  }, [diffData]);

  // Adjust currentChangeIndex only when it's out of bounds (separate effect to prevent loop)
  useEffect(() => {
    // Skip if we've already adjusted or if there's no diff data
    if (hasAdjustedIndexRef.current || !diffData) {
      return;
    }

    const totalChanges = lastTotalChangesRef.current;
    const storeState = useAppStore.getState();
    const currentIndex = storeState.currentChangeIndex;

    // Initialize currentChangeIndex to 0 when it's null and we have changes
    if (currentIndex === null && totalChanges > 0) {
      hasAdjustedIndexRef.current = true;
      setTimeout(() => {
        storeState.setCurrentChangeIndex(0);
      }, 0);
    }
    // If currentChangeIndex is out of bounds, reset it
    // Use getState() to get setCurrentChangeIndex to avoid subscription re-renders
    // Only update if value actually needs to change
    // Use setTimeout to defer state update and avoid synchronous setState in effect
    else if (currentIndex !== null && currentIndex >= totalChanges && totalChanges > 0) {
      if (storeState.currentChangeIndex !== 0) {
        hasAdjustedIndexRef.current = true;
        setTimeout(() => {
          storeState.setCurrentChangeIndex(0);
        }, 0);
      }
    } else if (currentIndex !== null && totalChanges === 0) {
      if (storeState.currentChangeIndex !== null) {
        hasAdjustedIndexRef.current = true;
        setTimeout(() => {
          storeState.setCurrentChangeIndex(null);
        }, 0);
      }
    }
    // Only depend on diffData, not on setCurrentChangeIndex function

  }, [diffData]);

  // Scroll to current change when currentChangeIndex changes
  useEffect(() => {
    if (currentChangeIndex === null) return;

    const changeElement = changeRefs.current.get(currentChangeIndex);
    if (changeElement) {
      changeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentChangeIndex]);

  // Callback to set ref for a change
  const setChangeRef = useCallback((changeIndex: number, element: HTMLDivElement | null) => {
    if (element) {
      changeRefs.current.set(changeIndex, element);
    } else {
      changeRefs.current.delete(changeIndex);
    }
  }, []);

  // Get change index for a hunk line
  const getChangeIndex = useCallback(
    (hunkIndex: number, lineIndex: number): number | null => {
      if (!diffData) return null;

      let changeIndex = 0;
      for (let h = 0; h < diffData.hunks.length; h++) {
        const hunk = diffData.hunks[h];
        for (let l = 0; l < hunk.lines.length; l++) {
          const line = hunk.lines[l];
          if (line.type === 'add' || line.type === 'delete' || line.type === 'modify') {
            if (h === hunkIndex && l === lineIndex) {
              return changeIndex;
            }
            changeIndex++;
          }
        }
      }
      return null;
    },
    [diffData]
  );

  return {
    setChangeRef,
    getChangeIndex,
    currentChangeIndex,
  };
};
