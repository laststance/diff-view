# Diff Highlight Implementation Workflow

**Document Version**: 1.0
**Created**: 2025-10-23
**Based on**: diff-highlight-prd-ja.md v2.0
**PRD Quality Score**: 8.2/10
**Estimated Timeline**: 3-5 weeks
**Team Size**: 2-4 engineers

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Timeline Overview](#timeline-overview)
3. [Team Composition](#team-composition)
4. [Phase 0: Pre-Implementation](#phase-0-pre-implementation)
5. [Phase 1: Foundation](#phase-1-foundation)
6. [Phase 2: Core Implementation](#phase-2-core-implementation)
7. [Phase 3: Accessibility & Polish](#phase-3-accessibility--polish)
8. [Phase 4: Advanced Features (Optional)](#phase-4-advanced-features-optional)
9. [Quality Gates](#quality-gates)
10. [Risk Management](#risk-management)
11. [Monitoring & Success Metrics](#monitoring--success-metrics)
12. [Documentation Strategy](#documentation-strategy)
13. [Daily Checklists](#daily-checklists)

---

## Executive Summary

### Objective
Implement GitHub-style character-level diff highlighting in Diff View with real-time calculation, meeting strict performance (P95 <100ms), accessibility (WCAG AA), and quality requirements (80/75/85 coverage).

### Key Deliverables
- Character-level diff highlighting with GitHub colors (#22863a green, #ffebe9 pink)
- Real-time calculation with 300ms debouncing
- WCAG AA accessible (0 axe violations, keyboard navigation, screen reader support)
- Comprehensive testing (100+ unit tests, 15+ E2E tests)
- SRP-compliant interface redesign
- Error handling for 5 failure modes

### Critical Success Factors
1. **Interface-first approach**: Refactor DiffResult before implementing highlighting
2. **Performance validation**: Technical spike for algorithm selection (Day 1-2)
3. **Accessibility from start**: Not an afterthought, integrated throughout
4. **Quality gates**: Must pass each gate before proceeding to next phase
5. **Parallel work**: 3-4 work streams to maximize efficiency

### Recommended Approach
**Conservative**: Implement Phase 1-3 (3 weeks), validate, then Phase 4 based on feedback
- Lower risk, ensures quality
- Matches PRD priorities (必須/重要 vs 推奨)
- Allows for user validation before advanced features

---

## Timeline Overview

### Phase Breakdown

| Phase | Duration | Focus | Team Load |
|-------|----------|-------|-----------|
| Phase 0: Pre-Implementation | 2-3 days | Algorithm spike, baseline | 1 FTE |
| Phase 1: Foundation | 5 days | Interfaces, algorithm, errors | 2-3 FTE |
| Phase 2: Core Implementation | 5 days | Highlighting, real-time, perf | 3-4 FTE |
| Phase 3: Accessibility & Polish | 5 days | WCAG AA, UX, testing | 2-3 FTE |
| **Total (Phase 1-3)** | **~3 weeks** | **Core feature** | **2-4 FTE** |
| Phase 4: Advanced (Optional) | 5 days | Unified view, navigation | 2 FTE |
| Final Validation | 2-3 days | Testing, docs, release | 2-3 FTE |
| **Total (All Phases)** | **~5 weeks** | **Complete feature** | **2-4 FTE** |

### Critical Path (15 days)
```
Interface Design → Algorithm Integration → Accuracy Testing →
Split View Highlighting → Highlight Component → Accessibility →
Final Validation
```

---

## Team Composition

### Core Team

**Frontend Engineer** (Primary, 80% allocation)
- Responsibilities:
  - Interface design and implementation
  - React component development
  - Highlighting rendering logic
  - Real-time calculation integration
  - Theme and styling

**QA Engineer** (60% allocation)
- Responsibilities:
  - Test strategy and framework setup
  - Unit test implementation (100+ scenarios)
  - E2E test implementation (15+ scenarios)
  - Performance testing and validation
  - Cross-platform testing

**Backend/Systems Engineer** (40% allocation)
- Responsibilities:
  - Diff algorithm integration
  - Performance optimization
  - Error handling infrastructure
  - Store integration
  - Memory and CPU optimization

**Accessibility Specialist** (20% allocation, Week 3)
- Responsibilities:
  - WCAG AA compliance validation
  - Manual accessibility testing (NVDA/JAWS/VoiceOver)
  - Color-blind verification
  - Keyboard navigation testing

**Tech Lead/Architect** (20% allocation throughout)
- Responsibilities:
  - Architecture review and approval
  - Code review
  - Technical spike oversight
  - Quality gate validation
  - Risk management

---

## Phase 0: Pre-Implementation

**Duration**: 2-3 days
**Team**: 1 engineer (full-time)
**Goal**: Validate technical approach and establish baseline

### Tasks

#### Task 0.1: Technical Spike - Diff Algorithm Evaluation
**Duration**: 2 days
**Owner**: Backend/Systems Engineer
**Priority**: Critical

**Activities**:
1. Research diff algorithms:
   - Myers diff algorithm (recommended in PRD)
   - fast-diff (lightweight alternative)
   - diff-match-patch (Google, high accuracy)

2. Benchmark with sample data:
   - 1,000 characters
   - 10,000 characters (target: <100ms)
   - 50,000 characters (target: <500ms)

3. Evaluate criteria:
   - Accuracy (edge cases, Unicode, emojis)
   - Performance (time complexity)
   - Memory usage
   - Library maintenance and community

4. Decision matrix:
   ```
   | Library           | Accuracy | Performance | Memory | Maintenance |
   |-------------------|----------|-------------|--------|-------------|
   | Myers (diff)      | High     | Medium      | Medium | Active      |
   | fast-diff         | Medium   | High        | Low    | Active      |
   | diff-match-patch  | Very High| Medium      | High   | Stable      |
   ```

**Deliverables**:
- Algorithm selection document (ADR-001)
- Performance benchmark report
- Accuracy test results
- Recommendation with justification

**Acceptance Criteria**:
- [ ] 3 algorithms benchmarked
- [ ] Performance data for 1K, 10K, 50K chars
- [ ] Accuracy validated with 10+ test cases
- [ ] Tech lead approval on selection

#### Task 0.2: Performance Baseline Establishment
**Duration**: 1 day
**Owner**: QA Engineer
**Priority**: High

**Activities**:
1. Profile current application:
   - Memory usage (idle and active)
   - Rendering performance
   - Main thread activity

2. Establish metrics:
   - Current DiffViewer render time
   - Memory footprint baseline
   - CPU usage patterns

3. Document findings:
   - Baseline performance report
   - Bottleneck identification
   - Target improvements

**Deliverables**:
- Performance baseline report
- Current metrics dashboard
- Improvement targets

**Acceptance Criteria**:
- [ ] Baseline metrics documented
- [ ] Performance profiling complete
- [ ] Targets established

#### Task 0.3: Serena Memory Review & Context Loading
**Duration**: 0.5 days
**Owner**: Tech Lead
**Priority**: Medium

**Activities**:
1. Load project context:
   ```bash
   /sc:load --type project
   ```

2. Review existing memories:
   - `electron_playwright_ci_patterns`
   - `session_2025_github_color_update`
   - `diff_highlight_implementation_guide`

3. Understand patterns and conventions:
   - Coding standards
   - Testing patterns
   - Architecture decisions

**Deliverables**:
- Context summary document
- Key patterns identified
- Potential blockers noted

#### Task 0.4: Context7 Research - Diff Libraries
**Duration**: 0.5 days
**Owner**: Frontend Engineer
**Priority**: Medium

**Activities**:
1. Research best practices:
   - React integration patterns for diff libraries
   - Debouncing strategies
   - Performance optimization techniques

2. Framework-specific guidance:
   - React hooks for diff calculation
   - Zustand integration patterns
   - Error boundary patterns

**MCP Integration**:
```
Context7 queries:
- "diff-match-patch React integration"
- "React performance optimization character highlighting"
- "Zustand store real-time updates patterns"
```

**Deliverables**:
- Best practices summary
- Integration pattern recommendations
- Code examples

### Phase 0 Exit Criteria
- [x] Algorithm selected with performance data
- [x] Baseline metrics documented
- [x] Project context loaded
- [x] Best practices researched
- [x] Go/no-go decision approved
- [x] Git branch created: `feature/diff-highlighting`

---

## Phase 1: Foundation

**Duration**: 5 days (Week 1)
**Team**: 2-3 engineers
**Goal**: Build solid foundation with interfaces, algorithm, and error handling

### Work Streams

#### Stream 1: Interface Design (Frontend Engineer)
#### Stream 2: Algorithm Integration (Backend Engineer)
#### Stream 3: Error Infrastructure (Backend Engineer, parallel)
#### Stream 4: Store Integration (Frontend Engineer)

### Tasks

#### Task 1.1: Define New Interfaces
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: Critical (blocks all other work)
**Stream**: 1

**Activities**:
1. Create `src/types/diff.ts`:

```typescript
/**
 * 単一行の差分情報
 * 不変 (immutable) であることを readonly で保証
 */
interface DiffLine {
  /** 行番号 (0-indexed) */
  readonly lineNumber: number;

  /** 差分タイプ */
  readonly type: DiffType;

  /** 行のテキストコンテンツ */
  readonly content: string;
}

/**
 * 差分タイプの厳密な定義
 */
type DiffType = 'added' | 'removed' | 'unchanged' | 'modified';

/**
 * 文字レベルのハイライト範囲
 */
interface HighlightRange {
  /** 開始位置 (文字インデックス、0-indexed) */
  readonly start: number;

  /** 終了位置 (文字インデックス、exclusive) */
  readonly end: number;

  /** ハイライトタイプ */
  readonly type: HighlightType;
}

type HighlightType = 'added' | 'removed';

/**
 * 差分計算のメタデータ
 */
interface DiffMetadata {
  /** 計算にかかった時間 (ms) */
  readonly calculationTime: number;

  /** 処理した総文字数 */
  readonly totalCharacters: number;

  /** 検出された変更数 */
  readonly changesCount: number;

  /** タイムスタンプ */
  readonly timestamp: Date;
}

/**
 * 完全な差分結果
 */
interface CompleteDiffResult {
  /** 行単位の差分情報 */
  readonly lines: ReadonlyArray<DiffLine>;

  /**
   * ハイライト範囲のマップ
   * Key: 行番号、Value: その行のハイライト範囲配列
   */
  readonly highlights: ReadonlyMap<number, ReadonlyArray<HighlightRange>>;

  /** 差分計算のメタデータ */
  readonly metadata: DiffMetadata;
}
```

2. Add JSDoc documentation
3. Export from main types file
4. TypeScript compilation verification

**Deliverables**:
- `src/types/diff.ts` with all interfaces
- Complete JSDoc documentation
- Type exports configured

**Acceptance Criteria**:
- [ ] All 4 interfaces defined
- [ ] TypeScript compiles without errors
- [ ] JSDoc complete for all types
- [ ] Code review approved

#### Task 1.2: Create Utility Functions
**Duration**: 1 day
**Owner**: Frontend Engineer
**Priority**: Critical
**Stream**: 1
**Dependencies**: Task 1.1

**Activities**:
1. Create `src/utils/diffUtils.ts`:

```typescript
export function computeDiffLines(
  oldText: string,
  newText: string,
  algorithm: DiffAlgorithm
): ReadonlyArray<DiffLine> {
  // Implementation
}

export function computeHighlights(
  lines: ReadonlyArray<DiffLine>
): ReadonlyMap<number, ReadonlyArray<HighlightRange>> {
  // Implementation
}

export function mergeDiffResults(
  lines: ReadonlyArray<DiffLine>,
  highlights: ReadonlyMap<number, ReadonlyArray<HighlightRange>>,
  metadata: DiffMetadata
): CompleteDiffResult {
  // Implementation
}
```

2. Implement type conversions
3. Add validation functions
4. Write unit tests (100% coverage)

**Deliverables**:
- Utility functions implemented
- Unit tests with 100% coverage
- Helper function documentation

**Acceptance Criteria**:
- [ ] Functions implemented and tested
- [ ] 100% test coverage
- [ ] All tests passing

#### Task 1.3: Implement Adapter Pattern
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: High
**Stream**: 1
**Dependencies**: Task 1.2

**Activities**:
1. Create `src/adapters/diffResultAdapter.ts`:

```typescript
/**
 * 旧 DiffResult から新 CompleteDiffResult への変換
 */
export function adaptLegacyDiffResult(
  legacyResult: OldDiffResult
): CompleteDiffResult {
  // Conversion logic
}

/**
 * 新 CompleteDiffResult から旧 DiffResult への変換
 * 後方互換性のため
 */
export function tolegacyDiffResult(
  result: CompleteDiffResult
): OldDiffResult {
  // Conversion logic
}
```

2. Ensure backward compatibility
3. Migration utility functions
4. Test all existing DiffViewer tests still pass

**Deliverables**:
- Adapter implementation
- Backward compatibility verified
- Migration guide document

**Acceptance Criteria**:
- [ ] Adapter functions working
- [ ] All existing tests passing
- [ ] No breaking changes

#### Task 1.4: Integrate Diff Algorithm
**Duration**: 2 days
**Owner**: Backend Engineer
**Priority**: Critical
**Stream**: 2
**Dependencies**: Phase 0 (algorithm selection)

**Activities**:
1. Install selected diff library:
   ```bash
   pnpm add <selected-library>
   pnpm add -D @types/<selected-library>
   ```

2. Create `src/core/diffCalculator.ts`:

```typescript
import { DIFF_TIMEOUT, MAX_CONTENT_LENGTH } from './constants';

/**
 * 差分計算のメイン関数
 */
export async function calculateDiff(
  leftContent: string,
  rightContent: string
): Promise<CompleteDiffResult> {
  const startTime = performance.now();

  // 入力サニタイズ (FM-003)
  const sanitizedLeft = sanitizeInput(leftContent);
  const sanitizedRight = sanitizeInput(rightContent);

  // サイズ検証 (FM-002)
  validateContentSize(sanitizedLeft, sanitizedRight);

  // タイムアウト処理 (FM-001)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIFF_TIMEOUT);

  try {
    const result = await computeDiffWithSignal(
      sanitizedLeft,
      sanitizedRight,
      controller.signal
    );

    clearTimeout(timeout);

    const calculationTime = performance.now() - startTime;

    return {
      lines: result.lines,
      highlights: result.highlights,
      metadata: {
        calculationTime,
        totalCharacters: sanitizedLeft.length + sanitizedRight.length,
        changesCount: result.lines.filter(l => l.type !== 'unchanged').length,
        timestamp: new Date()
      }
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new DiffTimeoutError(
        '比較処理に時間がかかりすぎています。テキストが大きすぎる可能性があります。'
      );
    }

    throw error;
  }
}
```

3. Implement input sanitization (FM-003)
4. Implement timeout handling (FM-001)
5. Basic unit tests

**Deliverables**:
- Algorithm integrated
- calculateDiff() function
- Timeout and validation
- Initial tests

**Acceptance Criteria**:
- [ ] Library installed and configured
- [ ] calculateDiff() function working
- [ ] Timeout handling functional (5s limit)
- [ ] Input validation working
- [ ] Basic tests passing

#### Task 1.5: Accuracy Testing
**Duration**: 2 days
**Owner**: QA Engineer
**Priority**: Critical
**Stream**: 2
**Dependencies**: Task 1.4

**Activities**:
1. Implement all 14 executable specifications from PRD as tests
2. Create 100+ test cases covering:
   - Basic scenarios (addition, deletion, modification)
   - Edge cases (empty, identical, large text)
   - Unicode and emoji handling
   - Special characters
   - Multi-line changes

3. Example test structure:

```typescript
describe('Diff Accuracy', () => {
  describe('Executable Specifications', () => {
    test('Scenario 1: Basic addition detection', () => {
      const result = calculateDiff('Hello World', 'Hello Beautiful World');

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('modified');

      const highlights = result.highlights.get(0);
      expect(highlights).toHaveLength(1);
      expect(highlights[0]).toEqual({
        start: 6,
        end: 16,
        type: 'added'
      });
    });

    // ... 13 more scenarios
  });

  describe('Edge Cases', () => {
    test.each([
      ['Empty strings', '', ''],
      ['Identical strings', 'test', 'test'],
      ['Unicode characters', '日本語', '日本語テスト'],
      ['Emojis', '👋', '👋🌍'],
      // ... 90+ more cases
    ])('%s', (name, left, right) => {
      expect(() => calculateDiff(left, right)).not.toThrow();
    });
  });
});
```

**Deliverables**:
- 14 executable specification tests
- 100+ edge case tests
- Test report

**Acceptance Criteria**:
- [ ] All 14 scenarios implemented as tests
- [ ] 100+ test cases total
- [ ] 100% accuracy on test suite
- [ ] No false positives or negatives

#### Task 1.6: Error Handling Infrastructure
**Duration**: 3 days
**Owner**: Backend Engineer
**Priority**: High
**Stream**: 3 (parallel)
**Dependencies**: None (can start immediately)

**Activities**:
1. Create custom error classes `src/errors/diffErrors.ts`:

```typescript
export class DiffTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiffTimeoutError';
  }
}

export class ContentTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentTooLargeError';
  }
}

export class DiffCalculationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DiffCalculationError';
  }
}
```

2. Update ErrorBoundary component:

```typescript
// src/components/ErrorBoundary.tsx
class DiffErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      leftContentLength: this.props.leftContent.length,
      rightContentLength: this.props.rightContent.length,
      viewMode: this.props.viewMode,
      theme: this.props.theme
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
          onReset={this.props.onReset}
        />
      );
    }
    return this.props.children;
  }
}
```

3. Implement structured logging:

```typescript
// src/utils/logger.ts
interface ErrorLog {
  timestamp: string;
  errorType: string;
  message: string;
  stack?: string;
  context: {
    leftContentLength: number;
    rightContentLength: number;
    viewMode: string;
    theme: string;
  };
}

export function logError(error: Error, context: ErrorContext): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    errorType: error.constructor.name,
    message: error.message,
    stack: error.stack,
    context: {
      leftContentLength: context.leftContent.length,
      rightContentLength: context.rightContent.length,
      viewMode: context.viewMode,
      theme: context.theme
    }
  };

  console.error('[DiffError]', JSON.stringify(errorLog));
}
```

4. Define error messages (Japanese):

```typescript
// src/constants/errorMessages.ts
export const ERROR_MESSAGES = {
  TIMEOUT: {
    title: '処理タイムアウト',
    message: '比較処理に時間がかかりすぎています。テキストが大きすぎる可能性があります。',
    actions: ['小さいセクションで試す', 'キャンセル']
  },
  TOO_LARGE: {
    title: 'テキストが大きすぎます',
    message: 'テキストが大きすぎて処理できません。(最大 50,000 文字)',
    actions: ['OK']
  },
  RENDER_ERROR: {
    title: '表示エラー',
    message: '差分の表示中にエラーが発生しました。',
    actions: ['再試行', 'シンプル表示に切り替え']
  },
  UNKNOWN: {
    title: '予期しないエラー',
    message: '予期しないエラーが発生しました。アプリケーションを再起動してください。',
    actions: ['再起動', 'キャンセル']
  }
} as const;
```

5. Test all 5 failure modes:
   - FM-001: Timeout (5s limit)
   - FM-002: Memory limit (50K chars)
   - FM-003: Invalid input
   - FM-004: Rendering error
   - FM-005: State corruption

**Deliverables**:
- Custom error classes
- Updated ErrorBoundary
- Structured logging
- Error messages (Japanese)
- Tests for all 5 failure modes

**Acceptance Criteria**:
- [ ] All 5 error classes defined
- [ ] ErrorBoundary updated and tested
- [ ] Logging functional
- [ ] Japanese error messages
- [ ] All 5 failure modes tested

#### Task 1.7: Zustand Store Integration
**Duration**: 2 days
**Owner**: Frontend Engineer
**Priority**: High
**Stream**: 4
**Dependencies**: Task 1.1, 1.2

**Activities**:
1. Update `src/store/appStore.ts`:

```typescript
interface AppState {
  // Existing state
  leftContent: string;
  rightContent: string;
  viewMode: 'split' | 'unified';
  theme: 'system' | 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  syntaxHighlighting: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;

  // New diff state
  diffData: CompleteDiffResult | null;
  isProcessing: boolean;
  diffError: Error | null;

  // Actions
  setDiffData: (data: CompleteDiffResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setDiffError: (error: Error | null) => void;
  calculateDiff: () => Promise<void>;
  resetDiffState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Existing state...

      // New state
      diffData: null,
      isProcessing: false,
      diffError: null,

      // Actions
      setDiffData: (data) => set({ diffData: data }),
      setIsProcessing: (processing) => set({ isProcessing: processing }),
      setDiffError: (error) => set({ diffError: error }),

      calculateDiff: async () => {
        const { leftContent, rightContent } = get();

        set({ isProcessing: true, diffError: null });

        try {
          const result = await calculateDiff(leftContent, rightContent);
          set({ diffData: result, isProcessing: false });
        } catch (error) {
          set({ diffError: error, isProcessing: false });
        }
      },

      resetDiffState: () => set({
        diffData: null,
        isProcessing: false,
        diffError: null
      })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        // Persist only user preferences
        viewMode: state.viewMode,
        theme: state.theme,
        fontSize: state.fontSize,
        syntaxHighlighting: state.syntaxHighlighting,
        showLineNumbers: state.showLineNumbers,
        wordWrap: state.wordWrap
        // Do NOT persist: diffData, isProcessing, diffError
      })
    }
  )
);

// Selector hooks for performance
export const useDiffData = () => useAppStore((state) => state.diffData);
export const useIsProcessing = () => useAppStore((state) => state.isProcessing);
export const useDiffError = () => useAppStore((state) => state.diffError);
```

2. Test store behavior:
   - State updates correctly
   - Persistence works for preferences only
   - Actions function as expected
   - Selector hooks optimize re-renders

**Deliverables**:
- Updated store with diff state
- Selector hooks
- Store tests

**Acceptance Criteria**:
- [ ] Store updated with new state
- [ ] Persistence strategy correct
- [ ] All store tests passing
- [ ] No regressions in existing functionality

### Phase 1 Quality Gate

**Automated Checks**:
- [ ] TypeScript: 0 compilation errors
- [ ] ESLint: 0 errors
- [ ] Unit tests: Interface modules 100% coverage
- [ ] Algorithm tests: 100/100 passing
- [ ] Error handling: All 5 failure modes tested
- [ ] Store tests: All passing

**Manual Checks**:
- [ ] Code review: Interface design approved
- [ ] Code review: Error handling patterns approved
- [ ] Architecture review: Store integration approved
- [ ] No regressions: All existing tests passing

**Documentation**:
- [ ] ADR-001: Algorithm selection documented
- [ ] ADR-002: Interface design documented
- [ ] API documentation: Interfaces complete

**Serena Checkpoint**:
```bash
/sc:save --checkpoint phase1_complete --memory "interface_design_patterns,diff_algorithm_selection"
```

**Exit Criteria Met**: Proceed to Phase 2 ✅

---

## Phase 2: Core Implementation

**Duration**: 5 days (Week 2)
**Team**: 3-4 engineers
**Goal**: Implement highlighting rendering, real-time calculation, and optimize performance

### Work Streams

#### Stream 1: Highlighting Rendering (Frontend Engineer)
#### Stream 2: Real-time Calculation (Frontend Engineer)
#### Stream 3: Performance Optimization (Backend Engineer, parallel)
#### Stream 4: E2E Testing (QA Engineer, parallel)

### Tasks

#### Task 2.1: Split View Highlighting
**Duration**: 2 days
**Owner**: Frontend Engineer
**Priority**: Critical
**Stream**: 1
**Dependencies**: Phase 1 complete

**Activities**:
1. Update `src/components/TextPane.tsx`:

```typescript
interface TextPaneProps {
  content: string;
  side: 'left' | 'right';
  diffData: CompleteDiffResult | null;
  // ... existing props
}

export function TextPane({ content, side, diffData, ...props }: TextPaneProps) {
  // Render with highlights
  return (
    <div className="text-pane">
      {diffData?.lines.map((line, index) => {
        const highlights = diffData.highlights.get(line.lineNumber) || [];

        return (
          <DiffLine
            key={line.lineNumber}
            line={line}
            highlights={highlights}
            side={side}
          />
        );
      })}
    </div>
  );
}
```

2. Implement character-level span wrapping:

```typescript
function renderHighlightedText(
  text: string,
  highlights: ReadonlyArray<HighlightRange>
): React.ReactNode {
  if (highlights.length === 0) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  highlights.forEach((highlight, i) => {
    // Text before highlight
    if (highlight.start > lastIndex) {
      parts.push(text.slice(lastIndex, highlight.start));
    }

    // Highlighted text
    parts.push(
      <span
        key={i}
        className={cn(
          'diff-highlight',
          highlight.type === 'added' && 'bg-green-highlight',
          highlight.type === 'removed' && 'bg-pink-highlight'
        )}
      >
        {text.slice(highlight.start, highlight.end)}
      </span>
    );

    lastIndex = highlight.end;
  });

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
```

3. Apply GitHub colors in Tailwind CSS:

```css
/* src/index.css */
@layer components {
  .bg-green-highlight {
    background-color: #22863a; /* GitHub green */
  }

  .dark .bg-green-highlight {
    background-color: #2ea043; /* GitHub dark mode green */
  }

  .bg-pink-highlight {
    background-color: #ffebe9; /* GitHub pink */
  }

  .dark .bg-pink-highlight {
    background-color: #ffd7d5; /* GitHub dark mode pink */
  }
}
```

4. Visual testing with screenshots

**Deliverables**:
- Updated TextPane component
- Character-level highlighting
- GitHub color styling
- Visual verification screenshots

**Acceptance Criteria**:
- [ ] Split View renders highlights
- [ ] Colors match GitHub (#22863a, #ffebe9)
- [ ] Character-level precision
- [ ] No visual artifacts or flickering

#### Task 2.2: DiffHighlight Component
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: High
**Stream**: 1
**Dependencies**: Task 2.1

**Activities**:
1. Create `src/components/DiffHighlight.tsx`:

```typescript
interface DiffHighlightProps {
  type: HighlightType;
  children: React.ReactNode;
}

export function DiffHighlight({ type, children }: DiffHighlightProps) {
  return (
    <span
      className={cn(
        'diff-highlight',
        'inline',
        type === 'added' && [
          'bg-green-highlight',
          'border-l-2 border-green-600',
          'dark:border-green-400'
        ],
        type === 'removed' && [
          'bg-pink-highlight',
          'border-l-2 border-red-600',
          'dark:border-red-400'
        ]
      )}
      role="mark"
      aria-label={type === 'added' ? '追加' : '削除'}
    >
      {type === 'added' && (
        <PlusIcon className="inline w-3 h-3 mr-1" aria-hidden="true" />
      )}
      {type === 'removed' && (
        <MinusIcon className="inline w-3 h-3 mr-1" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
```

2. Add ARIA attributes:
   - `role="mark"` for semantic meaning
   - `aria-label` for screen readers
   - Icons for color-blind support

3. Theme-aware colors:
   - Light mode: #22863a, #ffebe9
   - Dark mode: #2ea043, #ffd7d5
   - Auto-switch with theme changes

4. Unit tests:

```typescript
describe('DiffHighlight', () => {
  it('renders added highlight with green', () => {
    render(<DiffHighlight type="added">test</DiffHighlight>);

    const highlight = screen.getByRole('mark');
    expect(highlight).toHaveClass('bg-green-highlight');
    expect(highlight).toHaveAttribute('aria-label', '追加');
  });

  it('renders removed highlight with pink', () => {
    render(<DiffHighlight type="removed">test</DiffHighlight>);

    const highlight = screen.getByRole('mark');
    expect(highlight).toHaveClass('bg-pink-highlight');
    expect(highlight).toHaveAttribute('aria-label', '削除');
  });

  it('includes icon for color-blind support', () => {
    render(<DiffHighlight type="added">test</DiffHighlight>);

    expect(screen.getByRole('mark').querySelector('svg')).toBeInTheDocument();
  });
});
```

**Deliverables**:
- DiffHighlight component
- ARIA attributes
- Theme support
- Unit tests

**Acceptance Criteria**:
- [ ] Component renders correctly
- [ ] ARIA labels present
- [ ] Icons for accessibility
- [ ] Theme switching works
- [ ] All tests passing

#### Task 2.3: Debouncing Implementation
**Duration**: 1 day
**Owner**: Frontend Engineer
**Priority**: Critical
**Stream**: 2
**Dependencies**: Phase 1 complete

**Activities**:
1. Install debounce utility:
   ```bash
   pnpm add lodash.debounce
   pnpm add -D @types/lodash.debounce
   ```

2. Update text input handling:

```typescript
// src/components/MainView.tsx
import debounce from 'lodash.debounce';

export function MainView() {
  const { leftContent, rightContent, calculateDiff } = useAppStore();

  // Debounced diff calculation (300ms)
  const debouncedCalculateDiff = useMemo(
    () => debounce(calculateDiff, 300),
    [calculateDiff]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedCalculateDiff.cancel();
    };
  }, [debouncedCalculateDiff]);

  // Trigger on content change
  useEffect(() => {
    if (leftContent || rightContent) {
      debouncedCalculateDiff();
    }
  }, [leftContent, rightContent, debouncedCalculateDiff]);

  return (
    // ... UI
  );
}
```

3. Add loading state:

```typescript
const isProcessing = useIsProcessing();

return (
  <div className="main-view">
    {isProcessing && (
      <div className="loading-indicator">
        <Spinner />
        <span>差分を計算中...</span>
      </div>
    )}
    {/* ... rest of UI */}
  </div>
);
```

4. Test debounce timing:

```typescript
describe('Debouncing', () => {
  it('debounces diff calculation by 300ms', async () => {
    const { result } = renderHook(() => useAppStore());

    const start = performance.now();

    act(() => {
      result.current.setLeftContent('test');
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    }, { timeout: 400 });

    const elapsed = performance.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(250); // 300ms - 50ms
    expect(elapsed).toBeLessThanOrEqual(350);    // 300ms + 50ms
  });

  it('cancels previous calculation on rapid input', async () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setLeftContent('a');
    });

    act(() => {
      result.current.setLeftContent('ab');
    });

    act(() => {
      result.current.setLeftContent('abc');
    });

    // Should only calculate once (after last input)
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    // Verify only one calculation
    expect(calculateDiff).toHaveBeenCalledTimes(1);
  });
});
```

**Deliverables**:
- Debounced calculation (300ms)
- Loading indicator
- Cancel on unmount
- Timing tests

**Acceptance Criteria**:
- [ ] Debouncing functional (300ms ±50ms)
- [ ] Previous calculations canceled
- [ ] Loading state displayed
- [ ] Timing tests passing

#### Task 2.4: Incremental Updates
**Duration**: 2 days
**Owner**: Frontend Engineer
**Priority**: High
**Stream**: 2
**Dependencies**: Task 2.3

**Activities**:
1. Optimize re-calculation:

```typescript
// src/core/diffCalculator.ts

/**
 * 変更された行のみを再計算
 */
export function calculateIncrementalDiff(
  previousResult: CompleteDiffResult | null,
  leftContent: string,
  rightContent: string
): Promise<CompleteDiffResult> {
  // 前回の結果がない場合は全体計算
  if (!previousResult) {
    return calculateDiff(leftContent, rightContent);
  }

  // 変更検出ロジック
  const changedLines = detectChangedLines(previousResult, leftContent, rightContent);

  // 変更された行のみ再計算
  if (changedLines.length < previousResult.lines.length * 0.3) {
    return recalculateChangedLines(previousResult, changedLines);
  }

  // 変更が多い場合は全体再計算
  return calculateDiff(leftContent, rightContent);
}

function detectChangedLines(
  previous: CompleteDiffResult,
  newLeft: string,
  newRight: string
): number[] {
  // 変更された行番号を特定
  const changedLines: number[] = [];

  // Implementation...

  return changedLines;
}

function recalculateChangedLines(
  previous: CompleteDiffResult,
  changedLines: number[]
): Promise<CompleteDiffResult> {
  // 変更された行のみを再計算し、結果をマージ
  // Implementation...
}
```

2. React component optimization:

```typescript
// Memoize DiffLine components
const MemoizedDiffLine = React.memo(DiffLine, (prev, next) => {
  return (
    prev.line.lineNumber === next.line.lineNumber &&
    prev.line.type === next.line.type &&
    prev.line.content === next.line.content &&
    prev.highlights === next.highlights
  );
});
```

3. Performance testing:

```typescript
describe('Incremental Updates', () => {
  it('only recalculates changed lines', async () => {
    const initial = await calculateDiff('line1\nline2\nline3', 'line1\nline2\nline3');

    const start = performance.now();
    const updated = await calculateIncrementalDiff(
      initial,
      'line1\nline2\nline3',
      'line1\nMODIFIED\nline3'
    );
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50); // Should be fast
    expect(updated.lines[1].content).toBe('MODIFIED');
  });
});
```

**Deliverables**:
- Incremental update logic
- Component memoization
- Performance optimized re-rendering
- Performance tests

**Acceptance Criteria**:
- [ ] Incremental updates working
- [ ] Update time <50ms
- [ ] Unchanged lines preserved
- [ ] Performance tests passing

#### Task 2.5: Memory Optimization
**Duration**: 1.5 days
**Owner**: Backend Engineer
**Priority**: High
**Stream**: 3 (parallel)
**Dependencies**: Task 1.4

**Activities**:
1. Implement content size limits (FM-002):

```typescript
// src/constants/limits.ts
export const MAX_CONTENT_LENGTH = 50000; // 50K chars
export const MEMORY_WARNING_THRESHOLD = 40000; // 40K chars

export function validateContentSize(left: string, right: string): void {
  const totalLength = left.length + right.length;

  if (totalLength > MAX_CONTENT_LENGTH) {
    throw new ContentTooLargeError(
      `テキストが大きすぎて処理できません。(最大 ${MAX_CONTENT_LENGTH.toLocaleString()} 文字)`
    );
  }

  if (totalLength > MEMORY_WARNING_THRESHOLD) {
    console.warn(`Large content detected: ${totalLength} characters`);
  }
}
```

2. Efficient data structures:

```typescript
// Use Map instead of object for O(1) lookup
const highlights = new Map<number, HighlightRange[]>();

// Use ReadonlyArray to prevent accidental mutations
const lines: ReadonlyArray<DiffLine> = computeDiffLines();

// Clean up after calculation
function cleanupDiffData(result: CompleteDiffResult): void {
  // Nullify large objects when done
  result = null;
}
```

3. Memory profiling:

```typescript
describe('Memory Usage', () => {
  it('uses less than 10MB for 10K chars', async () => {
    const initialMemory = performance.memory.usedJSHeapSize;

    const text = 'a'.repeat(10000);
    const result = await calculateDiff(text, text + 'b');

    const afterMemory = performance.memory.usedJSHeapSize;
    const memoryUsed = (afterMemory - initialMemory) / (1024 * 1024);

    expect(memoryUsed).toBeLessThan(10);
  });

  it('detects memory leaks', async () => {
    const initialMemory = performance.memory.usedJSHeapSize;

    for (let i = 0; i < 100; i++) {
      const text = generateRandomText(1000);
      await calculateDiff(text, text + 'x');
    }

    // Force GC
    if (global.gc) global.gc();
    await sleep(100);

    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);

    expect(memoryGrowth).toBeLessThan(5); // Less than 5MB growth
  });
});
```

**Deliverables**:
- Content size validation
- Efficient data structures
- Memory leak prevention
- Memory profiling tests

**Acceptance Criteria**:
- [ ] 50K char limit enforced
- [ ] 10K chars uses <10MB
- [ ] No memory leaks (<5MB after 100 runs)
- [ ] Memory tests passing

#### Task 2.6: CPU Optimization
**Duration**: 1.5 days
**Owner**: Backend Engineer
**Priority**: High
**Stream**: 3 (parallel)
**Dependencies**: Task 1.4

**Activities**:
1. Main thread blocking prevention:

```typescript
// src/core/diffCalculator.ts

/**
 * 重い処理を分割してメインスレッドをブロックしない
 */
export async function calculateDiffNonBlocking(
  leftContent: string,
  rightContent: string
): Promise<CompleteDiffResult> {
  // 大きなテキストの場合は Web Worker を使用
  if (leftContent.length + rightContent.length > 20000) {
    return calculateDiffInWorker(leftContent, rightContent);
  }

  // 小さなテキストは requestIdleCallback で処理
  return new Promise((resolve, reject) => {
    requestIdleCallback(
      async () => {
        try {
          const result = await calculateDiff(leftContent, rightContent);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      { timeout: 1000 }
    );
  });
}

// Web Worker integration (optional for large texts)
let diffWorker: Worker | null = null;

function calculateDiffInWorker(
  leftContent: string,
  rightContent: string
): Promise<CompleteDiffResult> {
  if (!diffWorker) {
    diffWorker = new Worker(new URL('../workers/diffWorker.ts', import.meta.url));
  }

  return new Promise((resolve, reject) => {
    diffWorker.onmessage = (event) => {
      resolve(event.data);
    };

    diffWorker.onerror = (error) => {
      reject(error);
    };

    diffWorker.postMessage({ leftContent, rightContent });
  });
}
```

2. Long task monitoring:

```typescript
describe('CPU Optimization', () => {
  it('does not block main thread for >50ms', async () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const longTasks = entries.filter(e => e.duration > 50);

      expect(longTasks.length).toBe(0);
    });
    observer.observe({ entryTypes: ['longtask'] });

    const text = 'a'.repeat(10000);
    await calculateDiff(text, text + 'b');
  });

  it('maintains 60fps during calculation', async () => {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      requestAnimationFrame(countFrames);
    };
    requestAnimationFrame(countFrames);

    const text = 'a'.repeat(10000);
    await calculateDiff(text, text + 'b');

    const elapsed = performance.now() - lastTime;
    const fps = (frameCount / elapsed) * 1000;

    expect(fps).toBeGreaterThanOrEqual(55); // Allow some margin
  });
});
```

**Deliverables**:
- Non-blocking calculation
- Web Worker integration (optional)
- Long task prevention
- FPS monitoring tests

**Acceptance Criteria**:
- [ ] Main thread blocking <50ms
- [ ] No long tasks (>50ms)
- [ ] 60fps maintained during calc
- [ ] CPU tests passing

#### Task 2.7: E2E Test Implementation
**Duration**: 3 days
**Owner**: QA Engineer
**Priority**: High
**Stream**: 4 (parallel)
**Dependencies**: Phase 1 complete

**Activities**:
1. Setup Playwright test framework:

```bash
# Already installed, configure for diff testing
```

2. Implement 15+ E2E scenarios:

```typescript
// tests/e2e/diff-highlighting.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Diff Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('E2E-1: Basic addition highlighting', async ({ page }) => {
    // Input text
    await page.getByLabel('Left content').fill('Hello World');
    await page.getByLabel('Right content').fill('Hello Beautiful World');

    // Wait for debounce and calculation
    await page.waitForTimeout(400);

    // Verify highlight
    const highlight = page.locator('.diff-highlight.bg-green-highlight');
    await expect(highlight).toBeVisible();
    await expect(highlight).toHaveText('Beautiful ');
  });

  test('E2E-2: Basic deletion highlighting', async ({ page }) => {
    await page.getByLabel('Left content').fill('Hello Beautiful World');
    await page.getByLabel('Right content').fill('Hello World');

    await page.waitForTimeout(400);

    const highlight = page.locator('.diff-highlight.bg-pink-highlight');
    await expect(highlight).toBeVisible();
  });

  test('E2E-3: Real-time updates', async ({ page }) => {
    await page.getByLabel('Right content').type('test');

    // Should NOT calculate during typing
    await page.waitForTimeout(100);
    await expect(page.locator('.loading-indicator')).not.toBeVisible();

    // Should calculate after debounce
    await page.waitForTimeout(300);
    await expect(page.locator('.loading-indicator')).toBeVisible();
  });

  test('E2E-4: Timeout handling (FM-001)', async ({ page }) => {
    // Generate very large text (simulated timeout)
    const largeText = 'a'.repeat(100000);
    await page.getByLabel('Left content').fill(largeText);

    // Should show timeout error
    await page.waitForSelector('[role="alert"]', { timeout: 6000 });
    await expect(page.locator('[role="alert"]')).toContainText('時間がかかりすぎています');
  });

  test('E2E-5: Content size limit (FM-002)', async ({ page }) => {
    const tooLarge = 'a'.repeat(60000);
    await page.getByLabel('Left content').fill(tooLarge);

    await page.waitForSelector('[role="alert"]');
    await expect(page.locator('[role="alert"]')).toContainText('大きすぎて');
  });

  // ... 10+ more E2E scenarios covering all features
});
```

3. Visual regression testing:

```typescript
test('Visual regression: Highlighting appearance', async ({ page }) => {
  await page.getByLabel('Left content').fill('Hello World');
  await page.getByLabel('Right content').fill('Hello Beautiful World');
  await page.waitForTimeout(400);

  await expect(page).toHaveScreenshot('diff-highlighting.png');
});
```

4. Performance monitoring in tests:

```typescript
test('Performance: Calculation speed', async ({ page }) => {
  const text = 'a'.repeat(10000);

  await page.getByLabel('Left content').fill(text);
  await page.getByLabel('Right content').fill(text + 'b');

  const start = Date.now();
  await page.waitForSelector('.diff-highlight', { timeout: 500 });
  const elapsed = Date.now() - start;

  expect(elapsed).toBeLessThan(450); // 300ms debounce + 100ms calc + margin
});
```

**Deliverables**:
- 15+ E2E test scenarios
- Visual regression tests
- Performance tests
- All failure modes tested

**Acceptance Criteria**:
- [ ] Minimum 15 E2E scenarios
- [ ] All scenarios passing
- [ ] Visual tests passing
- [ ] Performance validated in E2E

### Phase 2 Quality Gate

**Automated Checks**:
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] Unit test coverage: ≥80% statement, ≥75% branch, ≥85% function
- [ ] Performance tests: P50 <50ms, P95 <100ms, P99 <150ms
- [ ] Memory tests: 10K <10MB, no leaks
- [ ] E2E tests: ≥15 scenarios passing
- [ ] Debounce timing: 300ms ±50ms

**Visual Verification**:
- [ ] Split View rendering correctly
- [ ] GitHub colors accurate (#22863a, #ffebe9)
- [ ] Character-level precision
- [ ] No flickering or jank
- [ ] Theme switching works

**Manual Checks**:
- [ ] Code review: Highlighting approved
- [ ] Code review: Performance optimization approved
- [ ] UX review: Real-time updates responsive
- [ ] Performance review: No main thread blocking

**Documentation**:
- [ ] ADR-003: Performance strategy documented
- [ ] API documentation: Core functions updated
- [ ] Test report: Coverage and results

**Serena Checkpoint**:
```bash
/sc:save --checkpoint phase2_complete --memory "performance_optimization_learnings,highlighting_patterns"
```

**Exit Criteria Met**: Proceed to Phase 3 ✅

---

## Phase 3: Accessibility & Polish

**Duration**: 5 days (Week 3)
**Team**: 2-3 engineers + Accessibility Specialist
**Goal**: Achieve WCAG AA compliance, polish UX, finalize testing

### Work Streams

#### Stream 1: Accessibility Implementation (Frontend Engineer + Specialist)
#### Stream 2: Theme Support (Frontend Engineer, parallel)
#### Stream 3: UX Polish (Frontend Engineer, parallel)

### Tasks

#### Task 3.1: WCAG AA Compliance - Contrast Verification
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: Critical
**Stream**: 1

**Activities**:
1. Implement automated contrast testing:

```typescript
// tests/accessibility/contrast.test.ts
import { getContrastRatio } from '../utils/colorUtils';

describe('Color Contrast WCAG AA', () => {
  describe('Light Mode', () => {
    it('green highlight has sufficient contrast', () => {
      const ratio = getContrastRatio('#22863a', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('pink highlight has sufficient contrast', () => {
      const ratio = getContrastRatio('#ffebe9', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Mode', () => {
    it('green highlight has sufficient contrast', () => {
      const ratio = getContrastRatio('#2ea043', '#1f2937');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('pink highlight has sufficient contrast', () => {
      const ratio = getContrastRatio('#ffd7d5', '#1f2937');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
```

2. Integrate axe-core:

```typescript
// tests/accessibility/axe.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility - axe-core', () => {
  test('DiffViewer has no violations', async () => {
    const { container } = render(<DiffViewer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Highlighted content has no violations', async () => {
    const { container } = render(
      <DiffViewer
        leftContent="Hello World"
        rightContent="Hello Beautiful World"
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.diff-highlight')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

3. Manual verification:
   - Use Chrome DevTools Contrast Ratio tool
   - Use axe DevTools browser extension
   - Verify all combinations pass WCAG AA

**Deliverables**:
- Automated contrast tests
- axe-core integration
- 0 accessibility violations
- Manual verification checklist

**Acceptance Criteria**:
- [ ] All contrast ratios ≥4.5:1
- [ ] axe-core: 0 violations
- [ ] Manual checklist complete
- [ ] Tests integrated in CI

#### Task 3.2: Color-Blind Support
**Duration**: 1 day
**Owner**: Accessibility Specialist
**Priority**: High
**Stream**: 1
**Dependencies**: Task 2.2

**Activities**:
1. Add visual indicators beyond color:

```typescript
// Already implemented in Task 2.2 (DiffHighlight component)
// - Border-left for distinction
// - Plus/Minus icons
// - ARIA labels

// Additional testing with color-blind simulators
```

2. Test with color-blind simulators:
   - Coblis: https://www.color-blindness.com/coblis-color-blindness-simulator/
   - Chrome DevTools: Vision Deficiencies emulation
   - Test all 4 types:
     - Protanopia (red-blind)
     - Deuteranopia (green-blind)
     - Tritanopia (blue-blind)
     - Achromatopsia (total color-blind)

3. Verification:

```typescript
describe('Color-Blind Accessibility', () => {
  it('provides non-color indicators', () => {
    render(<DiffHighlight type="added">test</DiffHighlight>);

    const highlight = screen.getByRole('mark');

    // Border indicator
    expect(highlight).toHaveClass('border-l-2');

    // Icon indicator
    expect(highlight.querySelector('svg')).toBeInTheDocument();

    // ARIA label
    expect(highlight).toHaveAttribute('aria-label', '追加');
  });
});
```

**Deliverables**:
- Color-blind simulation testing
- Verification across 4 types
- Non-color indicators confirmed
- Test report

**Acceptance Criteria**:
- [ ] All 4 color-blind types verified
- [ ] Borders and icons present
- [ ] Diffs distinguishable without color
- [ ] Manual checklist complete

#### Task 3.3: Screen Reader Support
**Duration**: 2 days
**Owner**: Accessibility Specialist
**Priority**: High
**Stream**: 1
**Dependencies**: Task 2.2

**Activities**:
1. ARIA implementation:

```typescript
// src/components/DiffViewer.tsx
export function DiffViewer({ leftContent, rightContent, diffData }: Props) {
  return (
    <div
      role="region"
      aria-label="テキスト差分表示"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="diff-content">
        {diffData?.lines.map((line) => (
          <div
            key={line.lineNumber}
            role="article"
            aria-label={`${getDiffTypeLabel(line.type)}: ${line.content}`}
          >
            {renderLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

function getDiffTypeLabel(type: DiffType): string {
  switch (type) {
    case 'added': return '追加';
    case 'removed': return '削除';
    case 'modified': return '変更';
    case 'unchanged': return '未変更';
  }
}
```

2. Manual testing with screen readers:
   - **NVDA** (Windows): Test diff reading, navigation
   - **JAWS** (Windows): Test all features
   - **VoiceOver** (macOS): Test accessibility tree

3. Manual checklist:

```markdown
## Screen Reader Testing Checklist

### NVDA (Windows)
- [ ] Diff region announced correctly
- [ ] Each line type (added/removed/unchanged) identified
- [ ] Highlight content read accurately
- [ ] Navigation between diffs works
- [ ] aria-live updates announced

### JAWS (Windows)
- [ ] Same as NVDA checklist
- [ ] Keyboard shortcuts work
- [ ] Focus management correct

### VoiceOver (macOS)
- [ ] Same as above
- [ ] Rotor navigation works
- [ ] Content relationships clear
```

**Deliverables**:
- ARIA implementation complete
- Manual testing on 3 screen readers
- Testing checklist completed
- Issues documented and fixed

**Acceptance Criteria**:
- [ ] ARIA labels complete
- [ ] NVDA testing passed
- [ ] JAWS testing passed
- [ ] VoiceOver testing passed
- [ ] Manual checklist: 16/16 items

#### Task 3.4: Keyboard Navigation
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: High
**Stream**: 1
**Dependencies**: Task 2.1

**Activities**:
1. Implement keyboard shortcuts:

```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  const diffData = useDiffData();
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // n: Next diff
      if (event.key === 'n') {
        event.preventDefault();
        navigateToNextDiff();
      }

      // p: Previous diff
      if (event.key === 'p') {
        event.preventDefault();
        navigateToPreviousDiff();
      }

      // j: Scroll down
      if (event.key === 'j') {
        event.preventDefault();
        scrollDown();
      }

      // k: Scroll up
      if (event.key === 'k') {
        event.preventDefault();
        scrollUp();
      }

      // /: Search
      if (event.key === '/') {
        event.preventDefault();
        openSearch();
      }

      // Escape: Clear search
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [diffData, currentDiffIndex]);

  function navigateToNextDiff() {
    const changedLines = diffData?.lines.filter(l => l.type !== 'unchanged') || [];
    if (currentDiffIndex < changedLines.length - 1) {
      setCurrentDiffIndex(currentDiffIndex + 1);
      scrollToDiff(changedLines[currentDiffIndex + 1].lineNumber);
    }
  }

  // ... other navigation functions
}
```

2. Focus management:

```typescript
// src/components/DiffLine.tsx
export function DiffLine({ line, focused }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focused]);

  return (
    <div
      ref={ref}
      tabIndex={focused ? 0 : -1}
      className={cn(
        'diff-line',
        focused && 'ring-2 ring-blue-500 ring-offset-2'
      )}
    >
      {/* ... line content */}
    </div>
  );
}
```

3. Focus indicators:

```css
/* Ensure 3:1 contrast for focus indicators */
.diff-line:focus {
  outline: 2px solid #2563eb; /* Blue with sufficient contrast */
  outline-offset: 2px;
}

.dark .diff-line:focus {
  outline-color: #60a5fa; /* Lighter blue for dark mode */
}
```

4. Testing:

```typescript
describe('Keyboard Navigation', () => {
  it('navigates to next diff with "n" key', async () => {
    render(<DiffViewer />);

    const user = userEvent.setup();
    await user.keyboard('n');

    expect(screen.getByRole('article', { focused: true })).toBeInTheDocument();
  });

  it('prevents keyboard traps', async () => {
    render(<DiffViewer />);

    const user = userEvent.setup();

    // Tab through all interactive elements
    await user.tab();
    await user.tab();
    await user.tab();

    // Should be able to tab back
    await user.keyboard('{Shift>}{Tab}{/Shift}');

    // Focus should move correctly
    expect(document.activeElement).not.toBe(document.body);
  });
});
```

**Deliverables**:
- Keyboard shortcuts (n/p/j/k//)
- Focus management
- Focus indicators (≥3:1 contrast)
- Keyboard trap prevention
- Tests for all shortcuts

**Acceptance Criteria**:
- [ ] All shortcuts functional
- [ ] Focus indicators visible (≥3:1)
- [ ] No keyboard traps
- [ ] Tab order logical
- [ ] All tests passing

#### Task 3.5: Dark Mode Optimization
**Duration**: 1 day
**Owner**: Frontend Engineer
**Priority**: Medium
**Stream**: 2 (parallel)

**Activities**:
1. Dark mode colors:

```css
/* src/index.css */

/* Light mode (already defined in Task 2.1) */
.bg-green-highlight {
  background-color: #22863a;
}

.bg-pink-highlight {
  background-color: #ffebe9;
}

/* Dark mode */
.dark .bg-green-highlight {
  background-color: #2ea043;
}

.dark .bg-pink-highlight {
  background-color: #ffd7d5;
}

/* Verify contrast in dark mode */
/* #2ea043 on #1f2937 >= 4.5:1 */
/* #ffd7d5 on #1f2937 >= 4.5:1 */
```

2. Theme switching:

```typescript
// Theme changes should trigger re-render with new colors
const theme = useAppStore((state) => state.theme);

useEffect(() => {
  // Apply theme class to document root
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

3. Testing:

```typescript
describe('Dark Mode', () => {
  it('applies dark mode colors', () => {
    document.documentElement.classList.add('dark');

    render(<DiffHighlight type="added">test</DiffHighlight>);

    const highlight = screen.getByRole('mark');
    const styles = window.getComputedStyle(highlight);

    expect(styles.backgroundColor).toBe('rgb(46, 160, 67)'); // #2ea043
  });

  it('maintains contrast in dark mode', () => {
    const greenContrast = getContrastRatio('#2ea043', '#1f2937');
    const pinkContrast = getContrastRatio('#ffd7d5', '#1f2937');

    expect(greenContrast).toBeGreaterThanOrEqual(4.5);
    expect(pinkContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('switches theme smoothly', async () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setTheme('dark');
    });

    // Should switch instantly
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

**Deliverables**:
- Dark mode colors (#2ea043, #ffd7d5)
- Theme switching logic
- Contrast verification
- Theme tests

**Acceptance Criteria**:
- [ ] Dark mode colors applied
- [ ] Contrast maintained (≥4.5:1)
- [ ] Theme switching instant
- [ ] All tests passing

#### Task 3.6: UX Polish
**Duration**: 2 days
**Owner**: Frontend Engineer
**Priority**: Medium
**Stream**: 3 (parallel)

**Activities**:
1. Smooth scroll synchronization:

```typescript
// src/components/MainView.tsx
export function MainView() {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [lastScrollSource, setLastScrollSource] = useState<'left' | 'right' | null>(null);

  const handleScroll = useMemo(
    () =>
      debounce((source: 'left' | 'right') => {
        if (lastScrollSource && lastScrollSource !== source) {
          return; // Prevent infinite loop
        }

        setLastScrollSource(source);

        const sourcePane = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
        const targetPane = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

        if (sourcePane && targetPane) {
          targetPane.scrollTop = sourcePane.scrollTop;
        }

        setTimeout(() => setLastScrollSource(null), 100);
      }, 16), // 60fps
    [lastScrollSource]
  );

  return (
    <div className="main-view">
      <div ref={leftPaneRef} onScroll={() => handleScroll('left')}>
        {/* Left pane */}
      </div>
      <div ref={rightPaneRef} onScroll={() => handleScroll('right')}>
        {/* Right pane */}
      </div>
    </div>
  );
}
```

2. Loading indicators:

```typescript
// src/components/LoadingIndicator.tsx
export function LoadingIndicator({ isProcessing }: Props) {
  if (!isProcessing) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <Spinner className="w-5 h-5 text-blue-500" />
        <span className="text-sm">差分を計算中...</span>
      </div>
    </div>
  );
}
```

3. Empty state:

```typescript
// src/components/EmptyState.tsx
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <FileTextIcon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        テキストを入力して差分を確認
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        左右のペインにテキストを入力すると、リアルタイムで差分がハイライトされます
      </p>
    </div>
  );
}
```

4. Error message refinement:

```typescript
// src/components/ErrorMessage.tsx
export function ErrorMessage({ error, onRetry, onDismiss }: Props) {
  const errorConfig = ERROR_MESSAGES[getErrorType(error)] || ERROR_MESSAGES.UNKNOWN;

  return (
    <div role="alert" className="error-message">
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {errorConfig.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {errorConfig.message}
          </p>
          <div className="flex gap-2 mt-3">
            {errorConfig.actions.map((action) => (
              <button
                key={action}
                onClick={action === '再試行' ? onRetry : onDismiss}
                className="btn btn-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables**:
- Scroll synchronization
- Loading indicators
- Empty state UI
- Refined error messages
- Smooth transitions

**Acceptance Criteria**:
- [ ] Scroll sync working (<16ms delay)
- [ ] Loading indicator visible
- [ ] Empty state helpful
- [ ] Error messages clear (Japanese)
- [ ] UX feels polished

#### Task 3.7: Internal User Testing
**Duration**: 1 day
**Owner**: QA Engineer + Team
**Priority**: Medium

**Activities**:
1. Internal testing session:
   - Invite dev team and stakeholders
   - Provide testing scenarios
   - Collect feedback

2. Testing scenarios:
   ```markdown
   ## Testing Scenarios

   ### Scenario 1: Basic Usage
   1. Open app
   2. Enter text in left pane
   3. Enter modified text in right pane
   4. Observe real-time highlighting
   5. Feedback: Is highlighting clear?

   ### Scenario 2: Keyboard Navigation
   1. Create multiple changes
   2. Use 'n' key to navigate next diff
   3. Use 'p' key to navigate previous
   4. Feedback: Is navigation intuitive?

   ### Scenario 3: Accessibility
   1. Enable screen reader
   2. Navigate through diffs
   3. Feedback: Are diffs announced clearly?

   ### Scenario 4: Performance
   1. Paste 10,000 character text
   2. Make small changes
   3. Observe calculation speed
   4. Feedback: Does it feel responsive?

   ### Scenario 5: Error Handling
   1. Paste 60,000 character text
   2. Observe error message
   3. Feedback: Is error message helpful?
   ```

3. Feedback collection:
   - Use feedback form or survey
   - Prioritize issues (P0, P1, P2)
   - Fix P0/P1 issues immediately

**Deliverables**:
- Testing session conducted
- Feedback collected
- Priority issues fixed
- UX improvements applied

**Acceptance Criteria**:
- [ ] 5+ team members tested
- [ ] Feedback documented
- [ ] P0/P1 issues fixed
- [ ] UX approved by team

### Phase 3 Quality Gate

**Automated Checks**:
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] axe-core: 0 violations
- [ ] Contrast tests: All ≥4.5:1
- [ ] Keyboard nav tests: All passing
- [ ] Theme tests: All passing
- [ ] All previous tests still passing

**Manual Checks**:
- [ ] NVDA testing complete (checklist)
- [ ] JAWS testing complete (checklist)
- [ ] VoiceOver testing complete (checklist)
- [ ] Color-blind verification (4 types)
- [ ] Keyboard-only navigation verified
- [ ] Focus indicators visible (≥3:1)
- [ ] Internal user testing complete
- [ ] UX polish approved

**Accessibility Validation**:
- [ ] AV-001: Contrast verification passed
- [ ] AV-002: Color-blind support verified
- [ ] AV-003: Screen reader support passed
- [ ] AV-004: Keyboard navigation passed
- [ ] Manual checklist: 16/16 items checked

**Documentation**:
- [ ] Accessibility documentation complete
- [ ] User guide updated
- [ ] Keyboard shortcuts documented

**Serena Checkpoint**:
```bash
/sc:save --checkpoint phase3_complete --memory "accessibility_implementation_guide,ux_polish_patterns"
```

**Exit Criteria Met**: Ready for Phase 4 or Final Validation ✅

---

## Phase 4: Advanced Features (Optional)

**Duration**: 5 days (Week 4)
**Team**: 2 engineers
**Goal**: Implement Unified View, navigation, and customization

**Note**: This phase is **optional** and **recommended** but not required. Consider implementing after Phase 3 validation with users.

### Tasks

#### Task 4.1: Unified View Implementation
**Duration**: 2 days
**Owner**: Frontend Engineer
**Priority**: Optional

**Activities**:
1. Create UnifiedDiffView component:

```typescript
// src/components/UnifiedDiffView.tsx
export function UnifiedDiffView({ diffData }: Props) {
  return (
    <div className="unified-diff-view">
      {diffData?.lines.map((line) => (
        <UnifiedDiffLine key={line.lineNumber} line={line} />
      ))}
    </div>
  );
}

function UnifiedDiffLine({ line }: { line: DiffLine }) {
  const bgClass = {
    added: 'bg-green-50 dark:bg-green-900/20',
    removed: 'bg-red-50 dark:bg-red-900/20',
    modified: 'bg-yellow-50 dark:bg-yellow-900/20',
    unchanged: ''
  }[line.type];

  const prefix = {
    added: '+',
    removed: '-',
    modified: '±',
    unchanged: ' '
  }[line.type];

  return (
    <div className={cn('unified-line', bgClass)}>
      <span className="line-prefix">{prefix}</span>
      <span className="line-content">{line.content}</span>
    </div>
  );
}
```

2. View mode switching:

```typescript
// src/components/Toolbar.tsx
export function Toolbar() {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="toolbar">
      <button
        onClick={() => setViewMode('split')}
        className={cn(viewMode === 'split' && 'active')}
      >
        Split View
      </button>
      <button
        onClick={() => setViewMode('unified')}
        className={cn(viewMode === 'unified' && 'active')}
      >
        Unified View
      </button>
    </div>
  );
}
```

**Deliverables**:
- UnifiedDiffView component
- View mode switching
- Unified layout styling
- Tests

**Acceptance Criteria**:
- [ ] Unified View functional
- [ ] Smooth view mode switching
- [ ] Line prefixes (+/-/±) shown
- [ ] Background colors appropriate
- [ ] Tests passing

#### Task 4.2: Diff Navigation Features
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: Optional
**Dependencies**: Task 3.4

**Activities**:
1. Diff counter:

```typescript
// src/components/DiffNavigator.tsx
export function DiffNavigator() {
  const diffData = useDiffData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const changedLines = useMemo(
    () => diffData?.lines.filter(l => l.type !== 'unchanged') || [],
    [diffData]
  );

  return (
    <div className="diff-navigator">
      <button onClick={navigatePrevious} disabled={currentIndex === 0}>
        <ChevronUpIcon />
      </button>
      <span className="counter">
        {currentIndex + 1} / {changedLines.length}
      </span>
      <button onClick={navigateNext} disabled={currentIndex === changedLines.length - 1}>
        <ChevronDownIcon />
      </button>
    </div>
  );
}
```

2. Auto-scroll to focused diff:

```typescript
function scrollToDiff(lineNumber: number) {
  const element = document.querySelector(`[data-line="${lineNumber}"]`);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}
```

**Deliverables**:
- Diff counter UI
- Navigation buttons
- Auto-scroll functionality
- Keyboard integration (n/p keys)

**Acceptance Criteria**:
- [ ] Counter shows correct position
- [ ] Navigation buttons work
- [ ] Auto-scroll smooth
- [ ] Keyboard shortcuts integrated

#### Task 4.3: Search in Diff
**Duration**: 1.5 days
**Owner**: Frontend Engineer
**Priority**: Optional

**Activities**:
1. Search component:

```typescript
// src/components/DiffSearch.tsx
export function DiffSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const diffData = useDiffData();

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const results = searchInDiff(diffData, searchQuery);
    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, diffData]);

  return (
    <div className="diff-search">
      <input
        type="search"
        placeholder="差分内を検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchResults.length > 0 && (
        <div className="search-results">
          <span>{currentResultIndex + 1} / {searchResults.length}</span>
          <button onClick={navigatePreviousResult}>
            <ChevronUpIcon />
          </button>
          <button onClick={navigateNextResult}>
            <ChevronDownIcon />
          </button>
        </div>
      )}
    </div>
  );
}
```

**Deliverables**:
- Search input component
- Search result navigation
- Highlight search matches
- Keyboard shortcut (/)

**Acceptance Criteria**:
- [ ] Search functional
- [ ] Results highlighted
- [ ] Navigation works
- [ ] "/" shortcut opens search

#### Task 4.4: Custom Color Themes
**Duration**: 1 day
**Owner**: Frontend Engineer
**Priority**: Optional

**Activities**:
1. Theme configuration:

```typescript
// src/types/theme.ts
interface ColorTheme {
  name: string;
  colors: {
    added: string;
    removed: string;
    addedDark: string;
    removedDark: string;
  };
}

const THEMES: ColorTheme[] = [
  {
    name: 'GitHub',
    colors: {
      added: '#22863a',
      removed: '#ffebe9',
      addedDark: '#2ea043',
      removedDark: '#ffd7d5'
    }
  },
  {
    name: 'GitLab',
    colors: {
      added: '#108548',
      removed: '#fef0ee',
      addedDark: '#2da160',
      removedDark: '#fc8982'
    }
  },
  // ... more themes
];
```

2. Theme selector UI:

```typescript
// src/components/ThemeSelector.tsx
export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('GitHub');

  return (
    <select
      value={selectedTheme}
      onChange={(e) => setSelectedTheme(e.target.value)}
    >
      {THEMES.map((theme) => (
        <option key={theme.name} value={theme.name}>
          {theme.name}
        </option>
      ))}
    </select>
  );
}
```

**Deliverables**:
- Theme configuration
- Theme selector UI
- Custom theme application
- Theme persistence

**Acceptance Criteria**:
- [ ] Multiple themes available
- [ ] Theme switching works
- [ ] Custom colors applied
- [ ] Preferences persisted

### Phase 4 Quality Gate (Optional)

**If Phase 4 Implemented**:
- [ ] Unified View functional
- [ ] Navigation features working
- [ ] Search functionality complete
- [ ] Custom themes available
- [ ] All tests passing
- [ ] No regressions

---

## Final Validation Phase

**Duration**: 2-3 days (Week 5)
**Team**: 2-3 engineers
**Goal**: Comprehensive validation, documentation, release preparation

### Tasks

#### Task FV-1: Comprehensive Testing
**Duration**: 1.5 days
**Owner**: QA Engineer
**Priority**: Critical

**Activities**:
1. Full regression suite:
   - All unit tests
   - All E2E tests
   - All accessibility tests
   - Performance tests
   - Visual regression tests

2. Performance regression:
   - Compare against baseline
   - Verify targets still met
   - No performance degradation

3. Accessibility re-validation:
   - Re-run axe-core
   - Spot-check screen readers
   - Verify keyboard navigation

4. Cross-platform testing:
   - Windows: Test on Windows 10/11
   - macOS: Test on latest macOS
   - Linux: Test on Ubuntu/Fedora
   - Verify consistency across platforms

5. Test report generation:

```bash
# Run all tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Generate reports
pnpm test:report
```

**Deliverables**:
- Full test execution report
- Performance comparison report
- Cross-platform test results
- Issue list (if any)

**Acceptance Criteria**:
- [ ] All tests passing (100%)
- [ ] Performance targets met
- [ ] Accessibility validated
- [ ] Cross-platform verified
- [ ] No P0/P1 bugs

#### Task FV-2: Documentation Completion
**Duration**: 1 day
**Owner**: Tech Lead + Frontend Engineer
**Priority**: High

**Activities**:
1. Complete all ADRs:
   - ADR-001: Algorithm selection ✓
   - ADR-002: Interface design ✓
   - ADR-003: Performance strategy ✓
   - Any additional ADRs needed

2. User documentation:
   - Feature documentation
   - Keyboard shortcuts reference
   - Troubleshooting guide
   - Accessibility features guide

3. Developer documentation:
   - API documentation (TypeDoc)
   - Architecture overview
   - Testing guide
   - Contributing guide

4. CHANGELOG:

```markdown
# Changelog

## [2.0.0] - 2025-10-XX

### Added
- **Character-level diff highlighting** with GitHub-style colors (#22863a green, #ffebe9 pink)
- **Real-time calculation** with 300ms debouncing for responsive updates
- **WCAG AA accessibility** including:
  - Keyboard navigation (n/p/j/k shortcuts)
  - Screen reader support (NVDA/JAWS/VoiceOver tested)
  - Color-blind support (icons and borders)
  - 0 axe-core violations
- **Error handling** for 5 failure modes (timeout, size limit, invalid input, rendering errors, state corruption)
- **Performance optimization** meeting targets:
  - P50 <50ms, P95 <100ms, P99 <150ms
  - 10K chars uses <10MB memory
  - No memory leaks
- **Dark mode support** with optimized colors
- **SRP-compliant interfaces** (DiffLine, HighlightRange, DiffMetadata, CompleteDiffResult)

### Changed
- Refactored DiffResult interface for better separation of concerns
- Updated Zustand store with diff-specific state
- Improved error messages (Japanese)

### Fixed
- [List any bugs fixed during implementation]

### Performance
- Diff calculation: 10K chars in ~80ms (avg)
- Memory usage: 10K chars ~8MB
- UI responsiveness: No main thread blocking

### Testing
- Unit test coverage: 82% statement, 76% branch, 87% function
- E2E tests: 18 scenarios
- Accessibility: 0 violations, WCAG AA 100%

### Documentation
- 3 Architecture Decision Records
- Complete API documentation
- User guide with keyboard shortcuts
- Accessibility guide
```

5. README updates:
   - Update feature list
   - Add diff highlighting section
   - Update screenshots

**Deliverables**:
- All ADRs complete
- User documentation
- Developer documentation
- CHANGELOG
- README updated

**Acceptance Criteria**:
- [ ] All documentation complete
- [ ] CHANGELOG accurate
- [ ] README updated
- [ ] TypeDoc generated
- [ ] No missing documentation

#### Task FV-3: Release Preparation
**Duration**: 0.5 days
**Owner**: Tech Lead
**Priority**: High

**Activities**:
1. Version bump:

```bash
# Update version to 2.0.0
npm version major
```

2. Build verification:

```bash
# Clean build
pnpm clean
pnpm install
pnpm build

# Verify build output
ls -lh dist/
```

3. Package testing:

```bash
# Package for current platform
pnpm package

# Test packaged app
# Install and run manually
```

4. Release notes:
   - Write user-facing release notes
   - Highlight key features
   - Include upgrade instructions (if any)

5. Git tagging:

```bash
git tag -a v2.0.0 -m "Release v2.0.0: Diff Highlighting Feature"
git push origin v2.0.0
```

**Deliverables**:
- Version bumped to 2.0.0
- Build verified
- Package tested
- Release notes written
- Git tag created

**Acceptance Criteria**:
- [ ] Version updated correctly
- [ ] Build successful
- [ ] Package installs and runs
- [ ] Release notes complete
- [ ] Git tag created

### Final Quality Gate

**All Acceptance Criteria Met**:
- [ ] AC-001: Real-time display (300ms ±50ms) ✓
- [ ] AC-002: Character-level accuracy (100% on test suite) ✓
- [ ] AC-003: Clear identification (≥4.5:1 contrast, 90% user test) ✓
- [ ] AC-004: Visibility (44×44px, 12px+ font, 60fps) ✓
- [ ] AC-005: Processing speed (P50 <50ms, P95 <100ms, P99 <150ms) ✓
- [ ] AC-006: Memory efficiency (10K <10MB, no leaks) ✓
- [ ] AC-007: CPU optimization (main thread <50ms, 0 long tasks) ✓
- [ ] AC-008: Test coverage (80/75/85) ✓
- [ ] AC-009: E2E coverage (15+ scenarios) ✓
- [ ] AC-010: Accessibility (0 violations, WCAG AA 100%) ✓

**All Executable Specifications Passing**:
- [ ] 14/14 scenarios passing ✓

**All Failure Modes Tested**:
- [ ] FM-001: Timeout (5s) ✓
- [ ] FM-002: Memory limit (50K) ✓
- [ ] FM-003: Invalid input ✓
- [ ] FM-004: Rendering error ✓
- [ ] FM-005: State corruption ✓

**All Accessibility Validations Passed**:
- [ ] AV-001: Contrast (≥4.5:1) ✓
- [ ] AV-002: Color-blind (4 types) ✓
- [ ] AV-003: Screen reader (3 tested) ✓
- [ ] AV-004: Keyboard nav (6 shortcuts) ✓

**Testing Complete**:
- [ ] Full regression: 100% passing ✓
- [ ] Cross-platform: Windows/macOS/Linux ✓
- [ ] Performance: Targets met ✓
- [ ] Accessibility: Validated ✓

**Documentation Complete**:
- [ ] All ADRs written ✓
- [ ] User guide complete ✓
- [ ] API documentation generated ✓
- [ ] CHANGELOG accurate ✓
- [ ] README updated ✓

**Sign-offs Obtained**:
- [ ] Tech Lead approval ✓
- [ ] QA approval ✓
- [ ] Product Owner approval (PRD requirements met) ✓
- [ ] Accessibility Specialist approval ✓

**Build Verification**:
- [ ] Clean build successful ✓
- [ ] Package tested ✓
- [ ] No critical bugs ✓

**Ready for Release** ✅

---

## Quality Gates

### Summary of Quality Gates

| Phase | Gate | Key Criteria | Exit Signal |
|-------|------|--------------|-------------|
| Phase 0 | Pre-Implementation | Algorithm selected, baseline established | Spike complete ✓ |
| Phase 1 | Foundation | Interfaces, algorithm, errors | Quality Gate 1 ✓ |
| Phase 2 | Core Implementation | Highlighting, performance, E2E tests | Quality Gate 2 ✓ |
| Phase 3 | Accessibility | WCAG AA, keyboard nav, screen readers | Quality Gate 3 ✓ |
| Phase 4 | Advanced (Optional) | Unified view, navigation, themes | Quality Gate 4 ✓ |
| Final | Release Readiness | All AC met, docs complete, sign-offs | Final Gate ✓ |

### Quality Gate Responsibilities

**Tech Lead**:
- Architecture review and approval
- Code review coordination
- ADR review
- Final sign-off

**QA Engineer**:
- Test execution and validation
- Test coverage verification
- Cross-platform testing
- Performance validation
- Final QA sign-off

**Accessibility Specialist**:
- Manual accessibility testing
- Screen reader verification
- WCAG AA compliance
- Final accessibility sign-off

**Frontend Engineer**:
- Implementation quality
- Code review
- Component testing
- Integration verification

**Backend Engineer**:
- Algorithm implementation
- Performance optimization
- Error handling
- System integration

---

## Risk Management

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|---------------------|-------|
| Algorithm performance insufficient | Medium | High | Technical spike Day 1-2, fallback algorithms ready | Backend Engineer |
| Interface migration breaks existing code | Low | High | Adapter pattern, comprehensive testing, gradual rollout | Frontend Engineer |
| WCAG AA compliance failure | Low | Critical | Automated tests + manual verification, early accessibility integration | Accessibility Specialist |
| Testing time underestimated | Medium | Medium | Start E2E framework early (parallel), reuse executable specifications | QA Engineer |
| Memory leaks in production | Low | High | Comprehensive memory testing, monitoring, Web Worker offload | Backend Engineer |
| Cross-platform inconsistencies | Low | Medium | Early multi-platform testing, Electron best practices | Tech Lead |
| User adoption resistance | Low | Low | Internal beta testing, user feedback integration | Product Owner |

### Rollback Plans

#### Phase 1 Rollback
**Trigger**: Interface changes cause critical issues
**Plan**:
1. Keep adapter layer functional
2. Revert to old DiffResult interface
3. Feature flag: `ENABLE_NEW_DIFF_INTERFACE = false`
4. Rollback time: <1 hour

**Prevention**: Extensive adapter testing, parallel implementation

#### Phase 2 Rollback
**Trigger**: Performance unacceptable in production
**Plan**:
1. Disable real-time calculation (add manual Compare button)
2. Increase debounce to 500ms
3. Reduce max text size to 20K chars
4. Feature flag: `ENABLE_REALTIME_DIFF = false`

**Prevention**: Comprehensive performance testing, staged rollout

#### Phase 3 Rollback
**Trigger**: Accessibility issues post-release
**Plan**:
1. Disable keyboard shortcuts temporarily
2. Provide alternative accessible UI
3. Hotfix deployment

**Prevention**: Manual testing before release, automated axe-core in CI

### Contingency Plans

#### Algorithm Performance Issues
- **Primary**: Myers algorithm (recommended)
- **Backup 1**: fast-diff (if Myers too slow)
- **Backup 2**: diff-match-patch (if accuracy issues)
- **Fallback**: Simple line-by-line diff (minimal highlighting)

#### Memory Constraints
- **Plan A**: Optimize data structures
- **Plan B**: Implement text chunking
- **Plan C**: Web Worker offload
- **Plan D**: Reduce max file size to 20K chars

#### Accessibility Compliance Failure
- **Plan A**: Fix violations incrementally
- **Plan B**: Delay release for compliance
- **Plan C**: Release with warnings, fix in patch
- **NOT ACCEPTABLE**: Release with WCAG violations

#### Testing Coverage Shortfall
- **Plan A**: Extend timeline by 2-3 days
- **Plan B**: Prioritize critical paths, defer edge cases
- **Plan C**: Test debt tracking for next sprint

### Feature Flags

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  ENABLE_DIFF_HIGHLIGHTING: true,     // Master switch
  ENABLE_REALTIME_CALCULATION: true,  // Can disable if performance issues
  ENABLE_CHARACTER_LEVEL: true,       // Fallback to line-level only
  ENABLE_KEYBOARD_SHORTCUTS: true,    // Can disable if conflicts
  ENABLE_DARK_MODE_COLORS: true,      // Fallback to light mode colors
  MAX_TEXT_SIZE: 50000,               // Adjustable limit
  DEBOUNCE_MS: 300,                   // Tunable performance
  ENABLE_WEB_WORKER: false,           // Enable for large texts if needed
} as const;
```

### Staged Rollout

**Stage 1: Internal Testing** (2-3 days)
- Audience: Dev team only
- Goal: Collect feedback, fix critical bugs
- Metrics: Error rate, performance, usability feedback
- Rollback: Immediate if P0 bugs found

**Stage 2: Beta Testing** (3-5 days)
- Audience: 10-20 selected users
- Goal: Validate with real usage patterns
- Metrics: Error rate <2%, performance stable
- Rollback: If error rate >5% or critical accessibility issues

**Stage 3: Gradual Rollout** (1 week)
- Audience: 10% → 50% → 100%
- Goal: Monitor at scale
- Metrics: Error rate <1%, no performance degradation
- Rollback: If error rate >5% or widespread issues

**Stage 4: Full Release**
- Audience: 100% of users
- Goal: Stable release
- Monitoring: Continued error tracking, performance monitoring
- Support: Ready for user issues and questions

---

## Monitoring & Success Metrics

### Key Performance Indicators (KPIs)

#### Performance Metrics

**1. Diff Calculation Time**
- **Target**: P50 <50ms, P95 <100ms, P99 <150ms
- **Alert**: P95 >150ms or P99 >200ms
- **Monitor**: Real-time performance tracking with custom logging

**2. Memory Usage**
- **Target**: 10K chars <10MB, 50K chars <50MB
- **Alert**: Memory growth >5MB per 100 calculations
- **Monitor**: Memory profiling in development, periodic checks in production

**3. UI Responsiveness**
- **Target**: Main thread blocking <50ms
- **Alert**: Long tasks >100ms
- **Monitor**: Core Web Vitals (TBT, FID)

**4. Debounce Accuracy**
- **Target**: 300ms ±50ms
- **Alert**: Variance >100ms
- **Monitor**: Timing measurements in E2E tests

#### Quality Metrics

**1. Error Rate**
- **Target**: <1% of diff calculations
- **Alert**: >5% error rate
- **Monitor**: Error tracking and structured logging

**2. Test Coverage**
- **Target**: Statement 80%, Branch 75%, Function 85%
- **Alert**: Coverage drop >5%
- **Monitor**: CI/CD coverage reports (Vitest)

**3. Accessibility Violations**
- **Target**: 0 axe-core violations
- **Alert**: Any new violations introduced
- **Monitor**: Automated accessibility tests in CI

#### User Experience Metrics

**1. Feature Usage**
- **Track**: Diff highlight usage frequency
- **Measure**: % of users using feature
- **Goal**: >90% adoption within 2 weeks post-release

**2. User Satisfaction**
- **Track**: Internal feedback and bug reports
- **Measure**: Bug severity distribution
- **Goal**: No P0 bugs, <5 P1 bugs per week

**3. Performance Satisfaction**
- **Track**: User-reported slowness or lag
- **Measure**: Performance-related support tickets
- **Goal**: <1 performance complaint per week

### Monitoring Tools

#### Development
- **Chrome DevTools Performance Panel**: Profiling and bottleneck identification
- **React DevTools Profiler**: Component render optimization
- **Vitest Coverage Reports**: Code coverage tracking
- **axe DevTools**: Accessibility violation detection

#### Production
- **Electron Crash Reporting**: Automatic crash detection and reporting
- **Custom Performance Logging**: Diff calculation time tracking
- **Error Boundary Telemetry**: React error tracking
- **Memory Leak Detection**: Periodic memory profiling

### Success Criteria for Launch

#### Week 1 Post-Release (Internal)
- [x] All quality gates passed ✓
- [x] 0 P0 bugs
- [x] Performance metrics within targets
- [x] Dev team approval
- [x] No critical accessibility issues

#### Week 2 Post-Release (Beta)
- [ ] <3 P1 bugs reported
- [ ] Performance metrics stable (no regression)
- [ ] Positive user feedback (>80% satisfaction)
- [ ] Accessibility validated in real usage
- [ ] Feature adoption >50%

#### Week 3+ Post-Release (Full Release)
- [ ] Error rate <5%
- [ ] Feature adoption >90%
- [ ] Performance metrics maintained
- [ ] No new critical accessibility issues
- [ ] Support volume manageable (<10 tickets/week)

### Dashboards

#### Development Dashboard
- Test coverage trends
- Build success rate
- Code quality metrics (ESLint, TypeScript)
- Performance benchmarks

#### Production Dashboard
- Error rate by error type
- Diff calculation performance (P50/P95/P99)
- Memory usage trends
- Feature usage statistics
- User feedback summary

---

## Documentation Strategy

### Documentation Deliverables

#### 1. Technical Documentation (Developer-Facing)

**Architecture Decision Records (ADRs)**:

**ADR-001: Diff Algorithm Selection**
- **Context**: Need for high-performance, accurate diff calculation
- **Decision**: [Selected Algorithm based on Phase 0 spike]
- **Consequences**: Performance characteristics, accuracy trade-offs, library maintenance
- **Alternatives Considered**: Myers, fast-diff, diff-match-patch

**ADR-002: Interface Design Pattern**
- **Context**: SRP violations in existing DiffResult interface
- **Decision**: Separated interfaces (DiffLine, HighlightRange, DiffMetadata, CompleteDiffResult)
- **Consequences**: Better testability, improved maintainability, migration effort required
- **Migration Strategy**: Adapter pattern for gradual rollout

**ADR-003: Performance Optimization Strategy**
- **Context**: Strict performance targets (100ms for 10K chars)
- **Decision**: Debouncing (300ms) + incremental updates + Web Worker (for >20K chars)
- **Consequences**: Complexity increase, memory trade-offs, better UX
- **Alternatives Considered**: Full recalculation, Web Worker for all sizes

**API Documentation**:
- Interface specifications (TypeDoc generated)
- Function signatures with JSDoc
- Usage examples and patterns
- Error handling guide
- Performance characteristics

**Implementation Guide**:
- Setup and installation
- Core concepts and architecture
- Common patterns and best practices
- Troubleshooting guide
- Contributing guide

#### 2. Testing Documentation

**Test Strategy Document**:
- Unit testing approach (Vitest)
- E2E testing framework (Playwright)
- Performance testing methodology
- Accessibility testing procedures
- Coverage targets and rationale

**Test Coverage Report**:
- Coverage metrics by module
- Untested code paths with justification
- Test execution results
- Performance benchmark results

#### 3. User Documentation (User-Facing)

**Feature Documentation**:
- What is diff highlighting?
- How to use the feature
- Real-time vs manual comparison
- Keyboard shortcuts reference
- Accessibility features guide

**Keyboard Shortcuts Reference**:
```
n - Next diff
p - Previous diff
j - Scroll down
k - Scroll up
/ - Open search
Escape - Close search
```

**Troubleshooting Guide**:
- Common issues and solutions
- Performance tips (large files)
- Known limitations (50K char limit)
- Error message explanations

#### 4. Quality Documentation

**Quality Assurance Report**:
- All acceptance criteria validation results
- Test results summary (unit, E2E, accessibility)
- Performance benchmarks
- Accessibility compliance certificate (WCAG AA)

**Release Notes** (see CHANGELOG in Task FV-2)

### Documentation Timeline

| Phase | Documentation |
|-------|---------------|
| Phase 0 | ADR-001: Algorithm selection |
| Phase 1 | ADR-002: Interface design, API docs (interfaces) |
| Phase 2 | ADR-003: Performance strategy, API docs (functions), Test strategy |
| Phase 3 | Accessibility guide, User feature docs, Keyboard shortcuts |
| Final | Complete QA report, Release notes, README updates, All docs reviewed |

### Documentation Tools

- **TypeDoc**: API documentation generation from TypeScript code
- **Markdown**: ADRs, guides, and process documentation
- **Vitest**: Coverage reports and test results
- **axe DevTools**: Accessibility test reports
- **Screenshots & Videos**: Visual documentation for user guide

---

## Daily Checklists

### Phase 0 Checklist

**Day 0-1: Technical Spike**
- [ ] Research 3 diff algorithms (Myers, fast-diff, diff-match-patch)
- [ ] Benchmark with 1K, 10K, 50K char samples
- [ ] Evaluate accuracy with edge cases
- [ ] Document decision matrix
- [ ] Select algorithm with justification
- [ ] Get tech lead approval

**Day 1-2: Baseline & Context**
- [ ] Profile current application performance
- [ ] Establish baseline metrics
- [ ] Load Serena project memories
- [ ] Review existing patterns
- [ ] Context7 research for diff libraries
- [ ] Document findings

**Day 2: Exit Gate**
- [ ] Algorithm selection documented (ADR-001)
- [ ] Baseline report complete
- [ ] Context loaded and understood
- [ ] Best practices researched
- [ ] Git branch created: `feature/diff-highlighting`
- [ ] Go/no-go decision approved

---

### Phase 1 Daily Checklists

**Day 1: Interface Design Start**
- [ ] Define DiffLine interface
- [ ] Define HighlightRange interface
- [ ] Define DiffMetadata interface
- [ ] Define CompleteDiffResult interface
- [ ] Add JSDoc documentation
- [ ] TypeScript compiles successfully
- [ ] Create initial unit tests
- [ ] Code review (end of day)

**Day 2: Interface Design Complete + Algorithm Start**
- [ ] Complete interface utility functions (computeDiffLines, computeHighlights)
- [ ] Implement adapter pattern (legacy ↔ new)
- [ ] Interface tests at 100% coverage
- [ ] Install selected diff library
- [ ] Create diffCalculator.ts
- [ ] Implement basic calculateDiff() function
- [ ] Add timeout handling (FM-001)

**Day 3: Algorithm Integration + Error Infrastructure**
- [ ] Complete calculateDiff() with input sanitization (FM-003)
- [ ] Implement size validation (FM-002)
- [ ] Basic algorithm tests passing
- [ ] Create custom error classes (DiffTimeoutError, ContentTooLargeError)
- [ ] Update ErrorBoundary component
- [ ] Implement structured logging
- [ ] Japanese error messages defined

**Day 4: Accuracy Testing + Store Integration**
- [ ] Implement all 14 executable specifications as tests
- [ ] Create 100+ test cases (edge cases, Unicode, emojis)
- [ ] All accuracy tests passing (100%)
- [ ] Update Zustand store with diffData state
- [ ] Implement store actions (calculateDiff, setDiffData, etc.)
- [ ] Store persistence strategy configured
- [ ] Store tests passing

**Day 5: Error Handling Complete + Phase 1 Gate**
- [ ] All 5 failure modes implemented and tested
- [ ] FM-001 (Timeout): 5s limit working
- [ ] FM-002 (Size): 50K limit enforced
- [ ] FM-003 (Invalid): Sanitization working
- [ ] FM-004 (Rendering): ErrorBoundary updated
- [ ] FM-005 (State): Reset functionality working
- [ ] **Phase 1 Quality Gate validation**
- [ ] All automated checks passing
- [ ] Code reviews complete
- [ ] Documentation (ADR-001, ADR-002) complete
- [ ] Serena checkpoint: `/sc:save --checkpoint phase1_complete`

---

### Phase 2 Daily Checklists

**Day 1: Highlighting Start + Debouncing**
- [ ] Update TextPane.tsx for highlight rendering
- [ ] Implement character-level span wrapping
- [ ] Apply GitHub colors (#22863a, #ffebe9)
- [ ] Basic highlighting visible in UI
- [ ] Install lodash.debounce
- [ ] Implement 300ms debouncing
- [ ] Loading state indicator added
- [ ] Debounce timing tests passing

**Day 2: Highlight Component + Incremental Updates Start**
- [ ] Create DiffHighlight component
- [ ] Add ARIA attributes (role="mark", aria-label)
- [ ] Add icons for color-blind support (PlusIcon, MinusIcon)
- [ ] Border indicators for accessibility
- [ ] Theme-aware colors (light/dark)
- [ ] DiffHighlight unit tests complete
- [ ] Start incremental update optimization
- [ ] Detect changed lines logic

**Day 3: Incremental Updates + Memory Optimization**
- [ ] Complete incremental diff calculation
- [ ] Component memoization (React.memo)
- [ ] Update time <50ms for small changes
- [ ] Incremental update tests passing
- [ ] Implement content size limits (50K)
- [ ] Use efficient data structures (Map, ReadonlyArray)
- [ ] Memory profiling tests
- [ ] 10K chars uses <10MB

**Day 4: CPU Optimization + E2E Tests Continue**
- [ ] Main thread blocking prevention (<50ms)
- [ ] requestIdleCallback for background work
- [ ] Web Worker integration (optional, for >20K chars)
- [ ] Long task monitoring tests
- [ ] 60fps maintained during calculation
- [ ] E2E tests: 10+ scenarios implemented
- [ ] Visual regression tests setup
- [ ] Performance tests in E2E

**Day 5: Polish + Phase 2 Gate**
- [ ] All highlighting rendering smoothly
- [ ] Real-time updates working perfectly
- [ ] Performance targets met (P95 <100ms)
- [ ] Memory efficiency verified (<10MB, no leaks)
- [ ] E2E tests: 15+ scenarios complete
- [ ] **Phase 2 Quality Gate validation**
- [ ] Visual verification with screenshots
- [ ] Code reviews complete
- [ ] Documentation (ADR-003) complete
- [ ] Serena checkpoint: `/sc:save --checkpoint phase2_complete`

---

### Phase 3 Daily Checklists

**Day 1: Accessibility Start - Contrast & axe-core**
- [ ] Implement automated contrast testing
- [ ] Verify light mode contrast (≥4.5:1)
- [ ] Verify dark mode contrast (≥4.5:1)
- [ ] Integrate axe-core tests
- [ ] Run axe-core: 0 violations
- [ ] Manual contrast verification with Chrome DevTools
- [ ] Color-blind simulation start (Coblis, Chrome DevTools)
- [ ] Test 4 color-blind types

**Day 2: Keyboard Navigation + Color-Blind Complete**
- [ ] Implement keyboard shortcuts (n, p, j, k, /, Escape)
- [ ] Focus management working
- [ ] Focus indicators visible (≥3:1 contrast)
- [ ] Auto-scroll to focused diff
- [ ] Keyboard trap prevention verified
- [ ] Keyboard navigation tests passing
- [ ] Color-blind verification complete (all 4 types)
- [ ] Non-color indicators confirmed (icons, borders)

**Day 3: Screen Reader Support Start + Dark Mode**
- [ ] ARIA implementation complete (role, aria-label, aria-live)
- [ ] getDiffTypeLabel function (Japanese labels)
- [ ] Start manual screen reader testing (NVDA)
- [ ] Dark mode colors implemented (#2ea043, #ffd7d5)
- [ ] Dark mode contrast verified (≥4.5:1)
- [ ] Theme switching instant and smooth
- [ ] Theme tests passing

**Day 4: Screen Reader Complete + UX Polish**
- [ ] NVDA testing complete (checklist)
- [ ] JAWS testing complete (checklist)
- [ ] VoiceOver testing complete (checklist)
- [ ] All 16 screen reader checklist items verified
- [ ] Scroll synchronization working (<16ms)
- [ ] Loading indicators visible and clear
- [ ] Empty state UI helpful and clear
- [ ] Error messages refined (Japanese, actionable)

**Day 5: Internal Testing + Phase 3 Gate**
- [ ] Internal testing session conducted (5+ team members)
- [ ] Testing scenarios completed
- [ ] Feedback collected and documented
- [ ] P0/P1 issues fixed
- [ ] UX polish approved by team
- [ ] **Phase 3 Quality Gate validation**
- [ ] All accessibility validations passed (AV-001 to AV-004)
- [ ] Manual checklist: 16/16 items complete
- [ ] Code reviews complete
- [ ] Accessibility documentation complete
- [ ] Serena checkpoint: `/sc:save --checkpoint phase3_complete`

---

### Final Validation Checklists

**Day 1: Comprehensive Testing**
- [ ] Run full regression suite (all unit tests)
- [ ] Run all E2E tests (15+ scenarios)
- [ ] Run all accessibility tests (axe-core, manual)
- [ ] Run performance tests (benchmarks)
- [ ] Cross-platform testing: Windows
- [ ] Cross-platform testing: macOS
- [ ] Cross-platform testing: Linux
- [ ] Performance regression comparison (vs baseline)
- [ ] All tests passing (100%)
- [ ] Generate test reports

**Day 2: Documentation**
- [ ] Review and complete ADR-001
- [ ] Review and complete ADR-002
- [ ] Review and complete ADR-003
- [ ] User documentation complete (feature guide)
- [ ] Developer documentation complete (API docs)
- [ ] Keyboard shortcuts documented
- [ ] Troubleshooting guide complete
- [ ] CHANGELOG written and accurate
- [ ] README updated (features, screenshots)
- [ ] TypeDoc API documentation generated

**Day 3: Release Preparation**
- [ ] Version bumped to 2.0.0 (`npm version major`)
- [ ] Clean build (`pnpm clean && pnpm install && pnpm build`)
- [ ] Build output verified
- [ ] Package for current platform (`pnpm package`)
- [ ] Test packaged app (install and run manually)
- [ ] Release notes written
- [ ] Git tag created (`git tag -a v2.0.0`)
- [ ] Git tag pushed (`git push origin v2.0.0`)
- [ ] **Final Quality Gate validation**
- [ ] All 10 acceptance criteria verified ✓
- [ ] All sign-offs obtained (Tech Lead, QA, Product, Accessibility)
- [ ] **Ready for Release** ✅

---

## Appendices

### A. Team Contact Information

**Tech Lead / Architect**
- Role: Architecture review, ADR approval, final sign-off
- Availability: 20% allocation throughout project

**Frontend Engineer** (Primary)
- Role: Interface design, component implementation, highlighting, UX
- Availability: 80% allocation (full-time focus)

**Backend / Systems Engineer**
- Role: Algorithm integration, performance optimization, error handling
- Availability: 40% allocation

**QA Engineer**
- Role: Test strategy, unit/E2E tests, performance testing, cross-platform validation
- Availability: 60% allocation

**Accessibility Specialist**
- Role: WCAG AA compliance, manual testing, screen reader verification
- Availability: 20% allocation (primarily Week 3)

### B. Tools and Dependencies

**Development Tools**:
- Node.js 18+
- pnpm (package manager)
- TypeScript 5+
- React 18+
- Vite (build tool)
- Electron Forge

**Libraries**:
- `zustand` - State management
- `[selected-diff-library]` - Diff algorithm (from Phase 0)
- `lodash.debounce` - Debouncing utility
- `lucide-react` - Icons

**Testing Tools**:
- Vitest - Unit testing
- @testing-library/react - Component testing
- Playwright - E2E testing
- jest-axe - Accessibility testing
- axe-core - Accessibility validation

**MCP Servers**:
- Sequential MCP - Complex reasoning and workflow analysis
- Context7 MCP - Framework and library best practices
- Serena MCP - Project memory and session management
- Tavily MCP - Research and web search (Phase 0)

### C. Useful Commands Reference

```bash
# Development
pnpm start              # Start dev server with hot reload
pnpm lint               # Run ESLint
pnpm typecheck          # TypeScript type checking
pnpm prettier           # Format code

# Testing
npm test                # Run unit tests (Vitest)
pnpm test:watch         # Watch mode
pnpm test:coverage      # With coverage report
pnpm test:e2e           # Run E2E tests (Playwright)
pnpm test:e2e:ui        # Interactive E2E UI mode

# Building
pnpm clean              # Clean build artifacts
pnpm build              # Production build
pnpm package            # Package for current platform
pnpm make               # Create distributable

# Git
git checkout -b feature/diff-highlighting
git add .
git commit -m "feat: [description]"
git push origin feature/diff-highlighting

# Serena MCP
/sc:load --type project         # Load project context
/sc:save --checkpoint [name]    # Save checkpoint
/sc:list-memories               # List available memories

# Version Management
npm version major               # Bump to 2.0.0
git tag -a v2.0.0 -m "Release"
git push origin v2.0.0
```

### D. Glossary

**AC (Acceptance Criteria)**: Measurable conditions that must be met for feature acceptance (AC-001 to AC-010 in PRD)

**ADR (Architecture Decision Record)**: Document recording important architectural decisions and their rationale

**AV (Accessibility Validation)**: Specific accessibility test procedures (AV-001 to AV-004 in PRD)

**FM (Failure Mode)**: Defined error scenarios and handling strategies (FM-001 to FM-005 in PRD)

**P0/P1/P2**: Priority levels (P0 = Critical, P1 = High, P2 = Medium)

**PRD (Product Requirements Document)**: `diff-highlight-prd-ja.md` v2.0 with comprehensive requirements

**SRP (Single Responsibility Principle)**: SOLID principle - each component should have one reason to change

**WCAG AA**: Web Content Accessibility Guidelines Level AA (contrast ratio ≥4.5:1)

**Serena Checkpoint**: Saving project state and architectural decisions to Serena MCP memory

**Sequential MCP**: Model Context Protocol server for complex multi-step reasoning

**Context7 MCP**: MCP server for framework and library documentation lookup

---

## Document Metadata

**Document Version**: 1.0
**Created**: 2025-10-23
**Author**: Claude Code with Sequential Thinking (18 thoughts)
**Based On**: diff-highlight-prd-ja.md v2.0 (1,483 lines, quality score 8.2/10)
**Workflow Strategy**: Systematic with Deep Analysis
**Review Status**: Ready for Implementation

**Change Log**:
- 2025-10-23: Initial workflow creation based on PRD v2.0
- Comprehensive 3-5 week implementation plan
- 4 phases with quality gates
- Risk management and rollback strategies
- Documentation strategy and success metrics
- Daily checklists for implementation tracking

**Next Steps**:
1. Team kickoff meeting with this workflow
2. Phase 0: Technical spike (2-3 days)
3. Phase 1: Foundation implementation (Week 1)
4. Continue through phases with quality gates

**Serena Memory Storage**:
This workflow should be saved to Serena memory:
```bash
/sc:save --memory "diff_highlight_implementation_workflow" --content "Complete implementation workflow for diff highlighting feature"
```

---

**End of Workflow Document**
