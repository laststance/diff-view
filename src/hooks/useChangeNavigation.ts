import { useEffect, useRef, useCallback } from 'react';

import type { DiffData } from '../types/app';
import { useAppStore } from '../store/appStore';

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
  const setCurrentChangeIndex = useAppStore((state) => state.setCurrentChangeIndex);

  // Calculate total changes and update store
  useEffect(() => {
    if (!diffData) {
      // No diff data, reset navigation
      useAppStore.setState({ totalChanges: 0, currentChangeIndex: null });
      changeRefs.current.clear();
      return;
    }

    // Count changes (add, delete, modify lines)
    let totalChanges = 0;
    diffData.hunks.forEach((hunk) => {
      hunk.lines.forEach((line) => {
        if (line.type === 'add' || line.type === 'delete' || line.type === 'modify') {
          totalChanges++;
        }
      });
    });

    // Update store with total changes
    useAppStore.setState({ totalChanges });

    // If currentChangeIndex is out of bounds, reset it
    if (currentChangeIndex !== null && currentChangeIndex >= totalChanges) {
      setCurrentChangeIndex(totalChanges > 0 ? 0 : null);
    }
  }, [diffData, currentChangeIndex, setCurrentChangeIndex]);

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
