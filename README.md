# Diff View

[![Lint](https://github.com/laststance/diff-view/actions/workflows/lint.yml/badge.svg)](https://github.com/laststance/diff-view/actions/workflows/lint.yml)
[![Type Check](https://github.com/laststance/diff-view/actions/workflows/typecheck.yml/badge.svg)](https://github.com/laststance/diff-view/actions/workflows/typecheck.yml)
[![Unit Tests](https://github.com/laststance/diff-view/actions/workflows/test.yml/badge.svg)](https://github.com/laststance/diff-view/actions/workflows/test.yml)
[![E2E Tests](https://github.com/laststance/diff-view/actions/workflows/e2e.yml/badge.svg)](https://github.com/laststance/diff-view/actions/workflows/e2e.yml)

An offline Electron desktop application for GitHub-style text comparison and diff visualization. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **GitHub-Style Diff Visualization** - Professional diff rendering with syntax highlighting
- **Dual View Modes** - Switch between split and unified diff views
- **Offline-First** - No internet connection required, all processing happens locally
- **Syntax Highlighting** - Code-aware diff visualization for better readability
- **Customizable Display** - Adjust font size, line numbers, and word wrap settings
- **Theme Support** - System, light, and dark themes with automatic detection
- **Cross-Platform** - Available for Windows, macOS, and Linux
- **Scroll Synchronization** - Synchronized scrolling between left and right panes

## Installation

### From Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/laststance/diff-view/releases) page.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/laststance/diff-view.git
cd diff-view

# Install dependencies (requires pnpm)
pnpm install

# Start development server
npm start

# Package for your platform
pnpm package

# Create distributable
pnpm make
```

## Usage

1. Launch the application
2. Paste or type text in the left pane
3. Paste or type text in the right pane
4. View the diff automatically generated
5. Switch between split and unified views using the toolbar
6. Customize display settings as needed

## Development

### Prerequisites

- Node.js 22.x or later
- pnpm 10.x or later

### Development Commands

```bash
# Start development server with hot reload
npm start

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Format code
pnpm prettier

# Run unit tests (Vitest)
npm test
pnpm test:watch      # Watch mode
pnpm test:coverage   # With coverage

# Run E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui     # Interactive UI mode

# Build & package
pnpm package         # Package for current platform
pnpm make           # Create distributable
```

### Platform-Specific Builds

```bash
# Build for specific platforms
pnpm build:windows
pnpm build:macos
pnpm build:linux

# Package for specific platforms
pnpm package:windows
pnpm package:macos
pnpm package:linux
```

## Architecture

### Tech Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **@git-diff-view/react** - GitHub-style diff visualization
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework

### Project Structure

```
diff-view/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script for IPC bridge
│   ├── renderer.tsx         # React application entry
│   ├── components/          # React components
│   ├── store/               # Zustand state management
│   └── index.css            # Global styles
├── tests/
│   ├── unit/                # Unit tests (Vitest)
│   ├── e2e/                 # E2E tests (Playwright)
│   └── setup.ts             # Test configuration
├── .github/workflows/       # CI/CD workflows
├── forge.config.ts          # Electron Forge configuration
├── vite.*.config.ts         # Vite configurations
└── tailwind.config.js       # Tailwind CSS configuration
```

### Electron Process Architecture

- **Main Process** (`src/main.ts`) - Window management, IPC handlers, theme management
- **Renderer Process** (`src/renderer.tsx`) - React application, UI state
- **Preload Script** (`src/preload.ts`) - Secure IPC bridge with context isolation

### State Management

The application uses Zustand for state management with:
- Persistent user preferences (view mode, theme, font size)
- Temporary state (content, diff data, processing status)
- Selector hooks for performance optimization

## Testing

The project includes comprehensive test coverage:

- **Unit Tests** - Component behavior, store logic, utilities (Vitest + Testing Library)
- **E2E Tests** - Full application workflows, window management (Playwright)

All tests run in CI on every push and pull request.

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Lint** - ESLint checks on every push and PR
- **Type Check** - TypeScript compilation verification
- **Unit Tests** - Vitest test suite execution
- **E2E Tests** - Playwright E2E test suite with artifact uploads

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test && pnpm test:e2e`)
2. No lint errors (`pnpm lint`)
3. No type errors (`pnpm typecheck`)
4. Code is formatted (`pnpm prettier`)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Ryota Murakami**
- Email: dojce1048@gmail.com
- GitHub: [@laststance](https://github.com/laststance)

## Acknowledgments

- [@git-diff-view/react](https://github.com/git-diff-view/git-diff-view) for the excellent diff visualization library
- [Electron](https://www.electronjs.org/) for the desktop application framework
- [React](https://react.dev/) for the UI framework
