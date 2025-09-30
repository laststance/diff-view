import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AppStore, AppState } from '../types/app';

// Default state values
const defaultState: AppState = {
  // Content state
  leftContent: '',
  rightContent: '',

  // UI state
  viewMode: 'split',
  theme: 'system',
  fontSize: 'medium',

  // Diff state
  diffData: null,
  isProcessing: false,

  // Settings
  syntaxHighlighting: true,
  showLineNumbers: true,
  wordWrap: false,
};

// Create the Zustand store with persistence and devtools
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, _get) => ({
        ...defaultState,

        // Content actions
        setLeftContent: (content: string) =>
          set(
            (state) => ({ ...state, leftContent: content }),
            false,
            'setLeftContent'
          ),

        setRightContent: (content: string) =>
          set(
            (state) => ({ ...state, rightContent: content }),
            false,
            'setRightContent'
          ),

        clearContent: () =>
          set(
            (state) => ({
              ...state,
              leftContent: '',
              rightContent: '',
              diffData: null,
            }),
            false,
            'clearContent'
          ),

        // UI actions
        setViewMode: (mode) =>
          set((state) => ({ ...state, viewMode: mode }), false, 'setViewMode'),

        setTheme: (theme) =>
          set((state) => ({ ...state, theme }), false, 'setTheme'),

        setFontSize: (size) =>
          set((state) => ({ ...state, fontSize: size }), false, 'setFontSize'),

        // Diff actions
        setDiffData: (data) =>
          set((state) => ({ ...state, diffData: data }), false, 'setDiffData'),

        setProcessing: (processing) =>
          set(
            (state) => ({ ...state, isProcessing: processing }),
            false,
            'setProcessing'
          ),

        // Settings actions
        setSyntaxHighlighting: (enabled) =>
          set(
            (state) => ({ ...state, syntaxHighlighting: enabled }),
            false,
            'setSyntaxHighlighting'
          ),

        setShowLineNumbers: (enabled) =>
          set(
            (state) => ({ ...state, showLineNumbers: enabled }),
            false,
            'setShowLineNumbers'
          ),

        setWordWrap: (enabled) =>
          set(
            (state) => ({ ...state, wordWrap: enabled }),
            false,
            'setWordWrap'
          ),

        // Utility actions
        resetToDefaults: () =>
          set(() => ({ ...defaultState }), false, 'resetToDefaults'),
      }),
      {
        name: 'diff-view-storage', // unique name for localStorage key
        // Only persist user preferences, not temporary state
        partialize: (state) => ({
          viewMode: state.viewMode,
          theme: state.theme,
          fontSize: state.fontSize,
          syntaxHighlighting: state.syntaxHighlighting,
          showLineNumbers: state.showLineNumbers,
          wordWrap: state.wordWrap,
        }),
      }
    ),
    {
      name: 'diff-view-store', // name for devtools
    }
  )
);

// Selector hooks for better performance
export const useLeftContent = () => useAppStore((state) => state.leftContent);
export const useRightContent = () => useAppStore((state) => state.rightContent);
export const useViewMode = () => useAppStore((state) => state.viewMode);
export const useTheme = () => useAppStore((state) => state.theme);
export const useDiffData = () => useAppStore((state) => state.diffData);
export const useIsProcessing = () => useAppStore((state) => state.isProcessing);

// Action selectors
export const useContentActions = () =>
  useAppStore((state) => ({
    setLeftContent: state.setLeftContent,
    setRightContent: state.setRightContent,
    clearContent: state.clearContent,
  }));

export const useUIActions = () =>
  useAppStore((state) => ({
    setViewMode: state.setViewMode,
    setTheme: state.setTheme,
    setFontSize: state.setFontSize,
  }));

export const useDiffActions = () =>
  useAppStore((state) => ({
    setDiffData: state.setDiffData,
    setProcessing: state.setProcessing,
  }));
