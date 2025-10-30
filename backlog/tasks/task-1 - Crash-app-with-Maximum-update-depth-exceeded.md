---
id: task-1
title: Crash app with Maximum update depth exceeded
status: Done
assignee: []
created_date: '2025-10-30 13:43'
updated_date: '2025-10-30 13:54'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
# Reproduction

1. paste bellow text left textarea and right

```
# Sophisicated WebApp

 - [ ] 新規AppleIDをryota.murakami@laststance.ioで作成する
 - [ ] apple developer programへ登録する

- cursor
ポート確認
あなたがmodifyしたことの挙動をvalidate
```
2. delete per charctar in right textarea

3. Crash app with below error message

```
Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.

Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
    at checkForNestedUpdates (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:19659:19)
    at scheduleUpdateOnFiber (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:18533:11)
    at forceStoreRerender (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:11999:13)
    at updateStoreInstance (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:11975:13)
    at commitHookEffectListMount (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:16915:34)
    at commitPassiveMountOnFiber (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:18156:19)
    at commitPassiveMountEffects_complete (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:18129:17)
    at commitPassiveMountEffects_begin (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:18119:15)
    at commitPassiveMountEffects (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:18109:11)
    at flushPassiveEffectsImpl (http://localhost:5173/node_modules/.vite/deps/chunk-PJEEZAML.js?v=abec3ad2:19490:11)
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Workwing app without Maximum update depth exceeded error even do repoduce action.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Fix Applied

**Root Cause**: Infinite re-render loop in DiffViewer.tsx caused by circular dependency in useEffect.

The useEffect had `computeDiff` function in its dependency array:
```typescript
useEffect(() => {
  if (debouncedLeftContent && debouncedRightContent) {
    computeDiff(); // wrapper function
  }
}, [debouncedLeftContent, debouncedRightContent, computeDiff]); // ❌ computeDiff causes loop
```

**Problem Flow**:
1. User types → content changes
2. Debounce triggers → useEffect runs
3. `recalculateDiff()` updates store (isProcessing, diffData, etc.)
4. Store update causes re-render
5. Zustand may return new reference for `recalculateDiff`
6. `computeDiff` recreates because dependency changed
7. useEffect sees `computeDiff` changed → triggers again
8. **INFINITE LOOP**

**Solution**: Remove wrapper function and call `recalculateDiff()` directly with only debounced content as dependencies:
```typescript
useEffect(() => {
  if (debouncedLeftContent && debouncedRightContent) {
    recalculateDiff(); // call directly
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedLeftContent, debouncedRightContent]); // ✅ Only content triggers
```

**Files Modified**:
- `src/components/DiffViewer.tsx`: Fixed useEffect dependencies (lines 75-85)
- `src/components/DiffViewer.tsx`: Fixed handleRetry callback (lines 87-94)

**Testing**:
- ✅ All 501 unit tests pass
- ✅ ESLint passes with no errors
- ✅ TypeScript type checking passes
- ✅ Created regression test: `tests/e2e/infinite-loop-regression.spec.ts`

**Date**: 2025-10-30
<!-- SECTION:NOTES:END -->
