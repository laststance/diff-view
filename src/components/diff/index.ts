/**
 * Diff rendering components for Phase 2 UI integration.
 *
 * These components render Phase 1's DiffData with character-level highlights:
 * - DiffRenderer: Container component that consumes DiffData
 * - DiffHunk: Renders hunk header and lines
 * - DiffLine: Core component with highlight rendering algorithm
 * - HighlightSpan: Leaf component for colored character ranges
 */

export { DiffRenderer } from './DiffRenderer';
export { DiffHunk } from './DiffHunk';
export { DiffLine } from './DiffLine';
export { HighlightSpan } from './HighlightSpan';
