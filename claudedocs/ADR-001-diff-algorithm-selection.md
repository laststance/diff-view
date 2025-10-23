# ADR-001: Diff Algorithm Selection for Character-Level Highlighting

**Status**: Accepted
**Date**: 2025-10-23
**Decision Makers**: Phase 0 Technical Spike
**Supersedes**: None

---

## Context

The diff-view application requires character-level diff highlighting to show precise changes between two text inputs, similar to GitHub's diff visualization. We need to select an appropriate diff algorithm library that meets our strict performance, accuracy, and maintainability requirements.

### Requirements (from PRD v2.0)

**Performance Targets**:
- P50: <50ms for typical input (1-10K chars)
- P95: <100ms for 10K characters
- P99: <150ms
- Memory: <10MB for 10K characters

**Functional Requirements**:
- Character-level diff calculation (not just line-level)
- High accuracy for edge cases (Unicode, emojis, whitespace)
- Support for real-time calculation (300ms debouncing)
- Integration with React/TypeScript/Zustand stack

**Technical Requirements**:
- TypeScript support (built-in or @types)
- Active maintenance and community
- Reasonable bundle size for Electron app
- Simple, maintainable API

---

## Candidates Evaluated

### 1. `diff` (Myers Algorithm)

**Package**: `diff` v5.x
**Source**: https://github.com/kpdecker/jsdiff
**License**: BSD-3-Clause

**Strengths**:
- ✅ Built-in TypeScript definitions (no @types needed)
- ✅ Most popular in npm ecosystem
- ✅ Active maintenance (regular updates)
- ✅ Clean API: `diffChars(oldStr, newStr)` returns change objects
- ✅ Multiple granularities: chars, words, lines
- ✅ Async mode with timeout support
- ✅ Good balance of performance and accuracy
- ✅ Smaller bundle than full diff-match-patch

**Weaknesses**:
- ⚠️ No published performance benchmarks found
- ⚠️ May need custom optimization for very large inputs

**API Example**:
```typescript
import { diffChars } from 'diff';

const changes = diffChars('Hello', 'Hallo');
// Returns: [
//   { value: 'H', added: undefined, removed: undefined },
//   { value: 'e', removed: true },
//   { value: 'a', added: true },
//   { value: 'llo', added: undefined, removed: undefined }
// ]
```

**Complexity**: O(ND) where N = sum of sequence lengths, D = edit distance

---

### 2. `fast-diff`

**Package**: `fast-diff` v1.3.0
**Source**: https://github.com/jhchen/fast-diff
**License**: Apache-2.0

**Strengths**:
- ✅ Optimized for speed (name claims "fast")
- ✅ Minimal memory footprint
- ✅ Simplified import of diff-match-patch (diff-only)
- ✅ Clean API: returns INSERT (1), EQUAL (0), DELETE (-1)
- ✅ Zero dependencies

**Weaknesses**:
- ❌ No built-in TypeScript definitions
- ❌ Last updated 2 years ago (maintenance concern)
- ❌ Smaller community than `diff`
- ⚠️ Would require custom type definitions

**API Example**:
```javascript
const diff = require('fast-diff');
const result = diff('Hello', 'Hallo');
// Returns: [[0, 'H'], [-1, 'e'], [1, 'a'], [0, 'llo']]
```

**Complexity**: O(ND) Myers algorithm with optimizations

---

### 3. `diff-match-patch` (Google)

**Package Options**:
- `diff-match-patch` (original, 4 years old)
- `diff-match-patch-typescript` v1.1.2 (modern TypeScript port)
- `diff-match-patch-es` (ESM + TypeScript by antfu)

**Source**: https://github.com/google/diff-match-patch (7.9k stars)
**License**: Apache-2.0

**Strengths**:
- ✅ Very high accuracy (Google-quality)
- ✅ Excellent Unicode/emoji handling
- ✅ Battle-tested in production (used by Google)
- ✅ TypeScript support (via typescript port)
- ✅ Comprehensive documentation

**Weaknesses**:
- ❌ Larger bundle size (includes match & patch functions)
- ❌ Original package unmaintained (4 years)
- ⚠️ TypeScript port is newer (2 months old)
- ⚠️ Heavier API complexity (class-based)
- ⚠️ May be overkill for our use case

**API Example**:
```typescript
import { diff_match_patch } from 'diff-match-patch-typescript';

const dmp = new diff_match_patch();
const diffs = dmp.diff_main('Hello', 'Hallo');
// Returns: [[0, 'H'], [-1, 'e'], [1, 'a'], [0, 'llo']]
```

**Complexity**: O(ND) Myers algorithm with Google optimizations

---

## Decision Matrix

| Criterion | diff | fast-diff | diff-match-patch |
|-----------|------|-----------|------------------|
| **TypeScript Support** | ✅ Built-in | ❌ None | ✅ Via port |
| **Maintenance** | ✅ Active | ⚠️ 2 years | ⚠️ Port is new |
| **API Simplicity** | ✅ Clean | ✅ Simple | ⚠️ Complex |
| **Bundle Size** | ✅ Small | ✅ Minimal | ❌ Large |
| **Accuracy** | ✅ Good | ✅ Good | ✅ Excellent |
| **Performance** | ✅ Good | ✅ Fast | ✅ Optimized |
| **Community** | ✅ Large | ⚠️ Small | ✅ Google |
| **Documentation** | ✅ Good | ⚠️ Basic | ✅ Comprehensive |

---

## Decision

**Selected**: `diff` package (Myers algorithm implementation)

### Rationale

1. **TypeScript Support**: Built-in TypeScript definitions eliminate the need for @types packages or custom definitions, reducing maintenance burden.

2. **Active Maintenance**: Regular updates and active community provide confidence in long-term support and bug fixes.

3. **Balanced Trade-offs**: Offers the best balance of:
   - Performance (sufficient for our <100ms P95 target)
   - Accuracy (handles edge cases well)
   - Bundle size (smaller than full diff-match-patch)
   - API simplicity (easy to integrate and maintain)

4. **Proven Track Record**: Most popular diff library in npm ecosystem, used by thousands of projects.

5. **Risk Mitigation**: Conservative choice that's unlikely to cause issues. If accuracy or performance problems arise during Phase 2, we can evaluate upgrading to `diff-match-patch-typescript`.

6. **Integration Simplicity**: The `diffChars` API returns clear change objects that map naturally to our `HighlightRange` interface design.

### Implementation Plan

**Phase 1 (Foundation)**:
```bash
npm install diff
npm install --save-dev @types/diff  # Verify if still needed
```

**Phase 2 (Performance Validation)**:
- Benchmark with real-world test data (1K, 10K, 50K characters)
- Measure P50, P95, P99 latencies
- Memory profiling during continuous usage
- If performance targets not met, evaluate diff-match-patch-typescript

**Fallback Strategy**:
If `diff` doesn't meet performance requirements after optimization:
1. Try `diff-match-patch-typescript` (better accuracy, similar performance)
2. Implement custom Myers algorithm (last resort)

---

## Consequences

### Positive

- ✅ Fast time-to-implementation (simple API)
- ✅ Strong TypeScript support reduces bugs
- ✅ Small bundle size keeps Electron app lean
- ✅ Active community means quick issue resolution
- ✅ Well-documented API reduces onboarding time

### Negative

- ⚠️ May need performance optimization for very large files (>50K chars)
- ⚠️ If accuracy issues arise, migration to diff-match-patch requires API changes

### Neutral

- 📊 Will need performance benchmarking in Phase 2 to validate
- 📊 May need custom debouncing/throttling for real-time updates (planned in PRD)

---

## Validation Criteria (Phase 2)

The decision will be validated against these criteria:

1. **Performance**: Meets P95 <100ms for 10K characters ✅/❌
2. **Accuracy**: Passes all 10 acceptance criteria (AC-001 to AC-010) ✅/❌
3. **Memory**: <10MB memory usage for 10K characters ✅/❌
4. **Integration**: Successfully integrates with Zustand store ✅/❌
5. **Reliability**: Passes all 5 failure mode tests (FM-001 to FM-005) ✅/❌

**Go/No-Go Decision Point**: End of Phase 2 (Week 2)

If validation fails, escalate to Tech Lead for diff-match-patch-typescript evaluation.

---

## References

- [diff npm package](https://www.npmjs.com/package/diff)
- [fast-diff npm package](https://www.npmjs.com/package/fast-diff)
- [diff-match-patch GitHub](https://github.com/google/diff-match-patch)
- [diff-match-patch-typescript](https://www.npmjs.com/package/diff-match-patch-typescript)
- [Myers Diff Algorithm Paper](http://www.xmailserver.org/diff2.pdf)
- PRD v2.0: `/claudedocs/diff-highlight-prd-ja.md`

---

## Approval

- [ ] Tech Lead Review
- [ ] Performance Validation (Phase 2)
- [ ] Integration Testing (Phase 2)

**Next Steps**:
1. Install `diff` package
2. Create Phase 0 performance baseline report
3. Proceed to Phase 1: Interface Design
