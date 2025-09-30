# Design Document

## Overview

The diff-view application is a cross-platform desktop application built using Electron Forge with React and TypeScript. The application provides an offline text comparison tool with a GitHub-style interface, allowing users to paste content into dual panes and visualize differences with syntax highlighting and multiple view modes.

The architecture follows modern Electron best practices with clear separation between main process, preload scripts, and renderer process. The application uses the @git-diff-view/react library for high-quality diff visualization and Lucide React for consistent iconography.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
│  ├── Window Management                                      │
│  ├── Menu System                                           │
│  ├── Application Lifecycle                                 │
│  └── IPC Communication Hub                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IPC
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Preload Script                           │
│  ├── Secure API Exposure                                   │
│  ├── Context Bridge                                        │
│  └── IPC Event Handlers                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                 React Renderer Process                     │
│  ├── App Component (Root)                                  │
│  ├── Layout Components                                     │
│  ├── Diff Viewer Components                               │
│  ├── Text Input Components                                │
│  ├── Control Components                                   │
│  └── State Management (React Context/Zustand)             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Electron with Electron Forge
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite (via @electron-forge/plugin-vite)
- **Diff Engine**: @git-diff-view/react
- **Icons**: Lucide React
- **Styling**: CSS Modules + Tailwind CSS
- **State Management**: Zustand (lightweight alternative to Redux)
- **Development**: Hot reload, TypeScript strict mode

## Components and Interfaces

### Main Process Components

#### Application Manager (`src/main/app.ts`)

- Manages application lifecycle (ready, window-all-closed, activate)
- Handles application menu creation
- Manages global shortcuts and system integration

#### Window Manager (`src/main/window.ts`)

- Creates and manages the main application window
- Handles window state (minimize, maximize, close)
- Manages window preferences and restoration

#### Menu System (`src/main/menu.ts`)

- Creates native application menus
- Handles menu item actions via IPC
- Provides platform-specific menu behaviors

### Preload Script (`src/preload/index.ts`)

```typescript
interface ElectronAPI {
  // Window controls
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // Application actions
  clearContent: () => void
  exportDiff: (content: string) => Promise<boolean>

  // Theme management
  getTheme: () => Promise<'light' | 'dark' | 'system'>
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}
```

### React Components Architecture

#### Core Components

**App Component (`src/renderer/App.tsx`)**

- Root application component
- Manages global state and theme
- Handles keyboard shortcuts
- Provides error boundaries

**Layout Component (`src/renderer/components/Layout.tsx`)**

- Main application layout structure
- Header with controls and branding
- Content area with responsive design
- Status bar with diff statistics

**DiffViewer Component (`src/renderer/components/DiffViewer.tsx`)**

- Wraps @git-diff-view/react component
- Manages diff computation and rendering
- Handles view mode switching (split/unified)
- Provides syntax highlighting configuration

#### Input Components

**TextPane Component (`src/renderer/components/TextPane.tsx`)**

```typescript
interface TextPaneProps {
  id: 'left' | 'right'
  value: string
  onChange: (value: string) => void
  placeholder: string
  language?: string
  readOnly?: boolean
}
```

**PasteArea Component (`src/renderer/components/PasteArea.tsx`)**

- Handles text input and paste operations
- Provides drag-and-drop file support
- Shows character/line count
- Supports syntax detection

#### Control Components

**Toolbar Component (`src/renderer/components/Toolbar.tsx`)**

- View mode toggle (split/unified)
- Theme switcher
- Clear content button
- Export functionality
- Settings panel toggle

**ViewModeToggle Component (`src/renderer/components/ViewModeToggle.tsx`)**

- Switch between split and unified diff views
- Visual indicators for current mode
- Keyboard shortcut support

## Data Models

### Application State

```typescript
interface AppState {
  // Content state
  leftContent: string
  rightContent: string

  // UI state
  viewMode: 'split' | 'unified'
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'

  // Diff state
  diffData: DiffFile | null
  isProcessing: boolean

  // Settings
  syntaxHighlighting: boolean
  showLineNumbers: boolean
  wordWrap: boolean
}
```

### Diff Data Model

```typescript
interface DiffData {
  oldFile: {
    fileName: string
    content: string
    fileLang: string
  }
  newFile: {
    fileName: string
    content: string
    fileLang: string
  }
  hunks: DiffHunk[]
  stats: {
    additions: number
    deletions: number
    changes: number
  }
}
```

### Settings Model

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  defaultViewMode: 'split' | 'unified'
  syntaxHighlighting: boolean
  showLineNumbers: boolean
  wordWrap: boolean
  autoDetectLanguage: boolean
}
```

## Error Handling

### Error Boundary Strategy

- React Error Boundaries at component level
- Graceful degradation for diff computation failures
- User-friendly error messages with recovery options
- Logging system for debugging (development only)

### Error Types and Handling

**Content Processing Errors**

- Large file handling (>10MB warning)
- Invalid character encoding detection
- Memory usage monitoring

**Diff Computation Errors**

- Fallback to simple line-by-line comparison
- Progress indicators for large diffs
- Timeout handling for complex comparisons

**UI State Errors**

- State recovery mechanisms
- Local storage backup for content
- Graceful handling of theme/settings corruption

## Testing Strategy

### Unit Testing

- **Framework**: Vitest
- **Coverage**: Components, utilities, state management
- **Mocking**: Electron APIs, file system operations

### Integration Testing

- **Framework**: Playwright for Electron
- **Scope**: Main process + renderer interaction
- **Coverage**: IPC communication, window management

### End-to-End Testing

- **Framework**: Playwright
- **Scenarios**: Complete user workflows
- **Coverage**: Text input, diff generation, export functionality

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   ├── utils/
│   └── stores/
├── integration/
│   ├── ipc/
│   └── window/
└── e2e/
    ├── diff-workflow.spec.ts
    ├── keyboard-shortcuts.spec.ts
    └── theme-switching.spec.ts
```

## Performance Considerations

### Diff Computation Optimization

- Web Workers for large file processing
- Incremental diff updates for real-time editing
- Debounced input handling (300ms delay)
- Virtual scrolling for large diffs

### Memory Management

- Content size limits with user warnings
- Garbage collection optimization
- Efficient string handling for large texts
- Component memoization with React.memo

### Rendering Performance

- Code splitting for diff library
- Lazy loading of syntax highlighting
- Optimized re-renders with proper dependencies
- CSS-in-JS performance considerations

## Security Considerations

### Content Security Policy

```typescript
const CSP = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data:",
  'connect-src': "'none'",
}
```

### Secure Practices

- No external network requests
- Sandboxed renderer process
- Secure preload script with context isolation
- Input sanitization for diff content
- No eval() or dangerous innerHTML usage

### Data Privacy

- No telemetry or analytics
- Local-only data processing
- No cloud storage integration
- Clear data handling policies
