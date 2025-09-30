// Application state types based on design document

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

  // Settings actions
  setSyntaxHighlighting: (enabled: boolean) => void;
  setShowLineNumbers: (enabled: boolean) => void;
  setWordWrap: (enabled: boolean) => void;

  // Utility actions
  resetToDefaults: () => void;
}

// Combined store interface
export interface AppStore extends AppState, AppActions {}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}
