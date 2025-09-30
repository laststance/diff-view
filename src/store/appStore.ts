import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  AppStore,
  AppState,
  AppError,
  ErrorType,
  LoadingStates,
  ContentLimits,
} from '../types/app';

// Default content limits (10MB as mentioned in design doc)
const defaultContentLimits: ContentLimits = {
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  maxLines: 50000, // Maximum lines to process
  maxCharacters: 1000000, // Maximum characters
  warningThreshold: 0.8, // Warn at 80% of limits
};

// Default loading states
const defaultLoadingStates: LoadingStates = {
  diffComputation: false,
  contentValidation: false,
  fileProcessing: false,
};

// Utility function to create error objects
const createError = (
  type: ErrorType,
  message: string,
  details?: string,
  recoverable: boolean = true
): AppError => ({
  type,
  message,
  details,
  timestamp: Date.now(),
  recoverable,
});

// Content size validation utility
const validateContentSize = (content: string, limits: ContentLimits) => {
  const warnings: string[] = [];
  const sizeInBytes = new Blob([content]).size;
  const lineCount = content.split('\n').length;
  const charCount = content.length;

  const warningSize = limits.maxFileSize * limits.warningThreshold;
  const warningLines = limits.maxLines * limits.warningThreshold;
  const warningChars = limits.maxCharacters * limits.warningThreshold;

  if (sizeInBytes >= warningSize) {
    warnings.push(
      `File size is ${(sizeInBytes / 1024 / 1024).toFixed(1)}MB (approaching ${(limits.maxFileSize / 1024 / 1024).toFixed(0)}MB limit)`
    );
  }

  if (lineCount >= warningLines) {
    warnings.push(
      `Line count is ${lineCount.toLocaleString()} (approaching ${limits.maxLines.toLocaleString()} limit)`
    );
  }

  if (charCount >= warningChars) {
    warnings.push(
      `Character count is ${charCount.toLocaleString()} (approaching ${limits.maxCharacters.toLocaleString()} limit)`
    );
  }

  const valid =
    sizeInBytes <= limits.maxFileSize &&
    lineCount <= limits.maxLines &&
    charCount <= limits.maxCharacters;

  return { valid, warnings };
};

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

  // Error state
  currentError: null,
  errorHistory: [],

  // Loading states
  loadingStates: { ...defaultLoadingStates },

  // Content limits and warnings
  contentLimits: { ...defaultContentLimits },


  // Settings
  syntaxHighlighting: true,
  showLineNumbers: true,
  wordWrap: false,
};

// Create the Zustand store with persistence and devtools
const isTestMode = process.env.ELECTRON_TEST_MODE === 'true';

export const useAppStore = create<AppStore>()(
  devtools(
    isTestMode
      ? // In test mode, skip persist to avoid potential issues
        (set, _get) => ({
        ...defaultState,

        // Content actions with validation
        setLeftContent: (content: string) =>
          set(
            (state) => {
              const validation = validateContentSize(
                content,
                state.contentLimits
              );

              if (!validation.valid) {
                const error = createError(
                  'content-size',
                  'Content exceeds size limits',
                  `Content is too large. ${validation.warnings.join(', ')}`,
                  true
                );
                return {
                  ...state,
                  currentError: error,
                  leftContent: content, // Still set content but show error
                };
              }

              return {
                ...state,
                leftContent: content,
                currentError: null, // Clear any previous errors
              };
            },
            false,
            'setLeftContent'
          ),

        setRightContent: (content: string) =>
          set(
            (state) => {
              const validation = validateContentSize(
                content,
                state.contentLimits
              );

              if (!validation.valid) {
                const error = createError(
                  'content-size',
                  'Content exceeds size limits',
                  `Content is too large. ${validation.warnings.join(', ')}`,
                  true
                );
                return {
                  ...state,
                  currentError: error,
                  rightContent: content, // Still set content but show error
                };
              }

              return {
                ...state,
                rightContent: content,
                currentError: null, // Clear any previous errors
              };
            },
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

        // Content management actions
        swapContent: () =>
          set(
            (state) => ({
              ...state,
              leftContent: state.rightContent,
              rightContent: state.leftContent,
              diffData: null, // Reset diff data when content changes
            }),
            false,
            'swapContent'
          ),

        replaceLeftWithRight: () =>
          set(
            (state) => ({
              ...state,
              leftContent: state.rightContent,
              diffData: null, // Reset diff data when content changes
            }),
            false,
            'replaceLeftWithRight'
          ),

        replaceRightWithLeft: () =>
          set(
            (state) => ({
              ...state,
              rightContent: state.leftContent,
              diffData: null, // Reset diff data when content changes
            }),
            false,
            'replaceRightWithLeft'
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

        // Error handling actions
        setError: (error: AppError | null) =>
          set(
            (state) => ({ ...state, currentError: error }),
            false,
            'setError'
          ),

        clearError: () =>
          set(
            (state) => ({ ...state, currentError: null }),
            false,
            'clearError'
          ),

        addErrorToHistory: (error: AppError) =>
          set(
            (state) => ({
              ...state,
              errorHistory: [...state.errorHistory.slice(-9), error], // Keep last 10 errors
            }),
            false,
            'addErrorToHistory'
          ),

        clearErrorHistory: () =>
          set(
            (state) => ({ ...state, errorHistory: [] }),
            false,
            'clearErrorHistory'
          ),

        // Loading state actions
        setLoadingState: (operation: keyof LoadingStates, loading: boolean) =>
          set(
            (state) => ({
              ...state,
              loadingStates: {
                ...state.loadingStates,
                [operation]: loading,
              },
            }),
            false,
            'setLoadingState'
          ),

        clearAllLoadingStates: () =>
          set(
            (state) => ({
              ...state,
              loadingStates: { ...defaultLoadingStates },
            }),
            false,
            'clearAllLoadingStates'
          ),

        // Content validation actions
        validateContentSize: (content: string) => {
          const state = _get();
          return validateContentSize(content, state.contentLimits);
        },

        setContentLimits: (limits: Partial<ContentLimits>) =>
          set(
            (state) => ({
              ...state,
              contentLimits: { ...state.contentLimits, ...limits },
            }),
            false,
            'setContentLimits'
          ),



        // Utility actions
        resetToDefaults: () =>
          set(() => ({ ...defaultState }), false, 'resetToDefaults'),
      })
      : persist(
          (set, _get) => ({
            ...defaultState,

            // Content actions with validation
            setLeftContent: (content: string) =>
              set(
                (state) => {
                  const validation = validateContentSize(
                    content,
                    state.contentLimits
                  );

                  if (!validation.valid) {
                    const error = createError(
                      'content-size',
                      'Content exceeds size limits',
                      `Content is too large. ${validation.warnings.join(', ')}`,
                      true
                    );
                    return {
                      ...state,
                      currentError: error,
                      leftContent: content, // Still set content but show error
                    };
                  }

                  return {
                    ...state,
                    leftContent: content,
                    currentError: null, // Clear any previous errors
                  };
                },
                false,
                'setLeftContent'
              ),

            setRightContent: (content: string) =>
              set(
                (state) => {
                  const validation = validateContentSize(
                    content,
                    state.contentLimits
                  );

                  if (!validation.valid) {
                    const error = createError(
                      'content-size',
                      'Content exceeds size limits',
                      `Content is too large. ${validation.warnings.join(', ')}`,
                      true
                    );
                    return {
                      ...state,
                      currentError: error,
                      rightContent: content, // Still set content but show error
                    };
                  }

                  return {
                    ...state,
                    rightContent: content,
                    currentError: null, // Clear any previous errors
                  };
                },
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

            // Content management actions
            swapContent: () =>
              set(
                (state) => ({
                  ...state,
                  leftContent: state.rightContent,
                  rightContent: state.leftContent,
                  diffData: null, // Reset diff data when content changes
                }),
                false,
                'swapContent'
              ),

            replaceLeftWithRight: () =>
              set(
                (state) => ({
                  ...state,
                  leftContent: state.rightContent,
                  diffData: null, // Reset diff data when content changes
                }),
                false,
                'replaceLeftWithRight'
              ),

            replaceRightWithLeft: () =>
              set(
                (state) => ({
                  ...state,
                  rightContent: state.leftContent,
                  diffData: null, // Reset diff data when content changes
                }),
                false,
                'replaceRightWithLeft'
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

            // Error handling actions
            setError: (error: AppError | null) =>
              set(
                (state) => ({ ...state, currentError: error }),
                false,
                'setError'
              ),

            clearError: () =>
              set(
                (state) => ({ ...state, currentError: null }),
                false,
                'clearError'
              ),

            addErrorToHistory: (error: AppError) =>
              set(
                (state) => ({
                  ...state,
                  errorHistory: [...state.errorHistory.slice(-9), error], // Keep last 10 errors
                }),
                false,
                'addErrorToHistory'
              ),

            clearErrorHistory: () =>
              set(
                (state) => ({ ...state, errorHistory: [] }),
                false,
                'clearErrorHistory'
              ),

            // Loading state actions
            setLoadingState: (operation: keyof LoadingStates, loading: boolean) =>
              set(
                (state) => ({
                  ...state,
                  loadingStates: {
                    ...state.loadingStates,
                    [operation]: loading,
                  },
                }),
                false,
                'setLoadingState'
              ),

            clearAllLoadingStates: () =>
              set(
                (state) => ({
                  ...state,
                  loadingStates: { ...defaultLoadingStates },
                }),
                false,
                'clearAllLoadingStates'
              ),

            // Content validation actions
            validateContentSize: (content: string) => {
              const state = _get();
              return validateContentSize(content, state.contentLimits);
            },

            setContentLimits: (limits: Partial<ContentLimits>) =>
              set(
                (state) => ({
                  ...state,
                  contentLimits: { ...state.contentLimits, ...limits },
                }),
                false,
                'setContentLimits'
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

// Error handling selectors
export const useCurrentError = () => useAppStore((state) => state.currentError);
export const useErrorHistory = () => useAppStore((state) => state.errorHistory);
export const useLoadingStates = () =>
  useAppStore((state) => state.loadingStates);
export const useContentLimits = () =>
  useAppStore((state) => state.contentLimits);


// Action selectors
export const useContentActions = () =>
  useAppStore((state) => ({
    setLeftContent: state.setLeftContent,
    setRightContent: state.setRightContent,
    clearContent: state.clearContent,
    swapContent: state.swapContent,
    replaceLeftWithRight: state.replaceLeftWithRight,
    replaceRightWithLeft: state.replaceRightWithLeft,
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

// Error handling action selectors
export const useErrorActions = () =>
  useAppStore((state) => ({
    setError: state.setError,
    clearError: state.clearError,
    addErrorToHistory: state.addErrorToHistory,
    clearErrorHistory: state.clearErrorHistory,
  }));

export const useLoadingActions = () =>
  useAppStore((state) => ({
    setLoadingState: state.setLoadingState,
    clearAllLoadingStates: state.clearAllLoadingStates,
  }));

export const useValidationActions = () =>
  useAppStore((state) => ({
    validateContentSize: state.validateContentSize,
    setContentLimits: state.setContentLimits,

  }));
