/**
 * Character-level diff highlighting types
 *
 * These types support GitHub-style character-level highlighting within diff lines.
 * They extend the existing diff infrastructure without replacing it.
 */

/**
 * Represents a range of characters to be highlighted within a line
 *
 * @example
 * ```typescript
 * const addedRange: HighlightRange = {
 *   start: 6,
 *   end: 16,
 *   type: 'added'
 * };
 * // Highlights "Beautiful " in "Hello Beautiful World"
 * ```
 */
export interface HighlightRange {
  /** Starting character position (0-indexed, inclusive) */
  readonly start: number;

  /** Ending character position (0-indexed, exclusive) */
  readonly end: number;

  /** Type of change: added (green) or removed (red/pink) */
  readonly type: 'added' | 'removed';
}

/**
 * Metadata about diff calculation performance and statistics
 *
 * Used for performance monitoring and debugging
 */
export interface DiffMetadata {
  /** Time taken to calculate diff in milliseconds */
  readonly calculationTime: number;

  /** Total characters processed (left + right content) */
  readonly totalCharacters: number;

  /** Number of changed lines detected */
  readonly changesCount: number;

  /** When the diff was calculated */
  readonly timestamp: Date;
}
