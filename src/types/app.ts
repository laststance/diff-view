// Application state types based on design document

import type { HighlightRange, DiffMetadata } from './highlight';

export type ViewMode = 'split' | 'unified';
export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

// Diff data structures
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'delete' | 'context' | 'modify';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  /** Character-level highlights for this line (GitHub-style highlighting) */
  highlightRanges?: HighlightRange[];
}

export interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
}

export interface DiffData {
  oldFile: {
    fileName: string;
    content: string;
    fileLang: string;
  };
  newFile: {
    fileName: string;
    content: string;
    fileLang: string;
  };
  hunks: DiffHunk[];
  stats: DiffStats;
  /** Performance and calculation metadata */
  metadata?: DiffMetadata;
}

// Main application state interface
export interface AppState {
  // Content state
  leftContent: string;
  rightContent: string;

  // UI state
  viewMode: ViewMode;
  theme: Theme;
  fontSize: FontSize;

  // Diff state
  diffData: DiffData | null;
  isProcessing: boolean;

  // Error state
  currentError: AppError | null;
  errorHistory: AppError[];

  // Loading states
  loadingStates: LoadingStates;

  // Content limits
  contentLimits: ContentLimits;

  // Performance monitoring
  performanceMetrics: PerformanceMetrics;

  // Settings
  syntaxHighlighting: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
}

// User settings interface
export interface UserSettings {
  theme: Theme;
  fontSize: FontSize;
  defaultViewMode: ViewMode;
  syntaxHighlighting: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  autoDetectLanguage: boolean;
}

// Actions interface for Zustand store
export interface AppActions {
  // Content actions
  setLeftContent: (content: string) => void;
  setRightContent: (content: string) => void;
  clearContent: () => void;

  // Content management actions
  swapContent: () => void;
  replaceLeftWithRight: () => void;
  replaceRightWithLeft: () => void;

  // UI actions
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;

  // Diff actions
  setDiffData: (data: DiffData | null) => void;
  setProcessing: (processing: boolean) => void;
  recalculateDiff: () => Promise<void>;

  // Error handling actions
  setError: (error: AppError | null) => void;
  clearError: () => void;
  addErrorToHistory: (error: AppError) => void;
  clearErrorHistory: () => void;

  // Loading state actions
  setLoadingState: (operation: keyof LoadingStates, loading: boolean) => void;
  clearAllLoadingStates: () => void;

  // Content validation actions
  validateContentSize: (content: string) => {
    valid: boolean;
    warnings: string[];
  };
  setContentLimits: (limits: Partial<ContentLimits>) => void;

  // Settings actions
  setSyntaxHighlighting: (enabled: boolean) => void;
  setShowLineNumbers: (enabled: boolean) => void;
  setWordWrap: (enabled: boolean) => void;

  // Performance monitoring actions
  updateMemoryUsage: (usage: MemoryUsage | null) => void;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  clearPerformanceMetrics: () => void;

  // Utility actions
  resetToDefaults: () => void;
}

// Combined store interface
export interface AppStore extends AppState, AppActions {}

// Error types for different kinds of application errors
export type ErrorType =
  | 'diff-computation'
  | 'content-size'
  | 'memory-limit'
  | 'processing-timeout'
  | 'invalid-content'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
  recoverable: boolean;
}

// Content size limits and warnings
export interface ContentLimits {
  maxFileSize: number; // in bytes
  maxLines: number;
  maxCharacters: number;
  warningThreshold: number; // percentage of max before warning
}

// Loading states for different operations
export interface LoadingStates {
  diffComputation: boolean;
  contentValidation: boolean;
  fileProcessing: boolean;
}

// Memory monitoring types
export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
  isHighUsage: boolean;
}

export interface PerformanceMetrics {
  memoryUsage: MemoryUsage | null;
  renderTime: number;
  diffComputationTime: number;
  lastUpdated: number;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}
