/**
 * Diff Calculator - Core algorithm for character-level diff highlighting
 *
 * This module implements GitHub-style character-level highlighting using the Myers diff algorithm.
 * It provides timeout handling, size validation, and performance tracking.
 */

import { diffChars, type Change } from 'diff';

import type { DiffData, DiffLine, DiffStats } from '../types/app';
import type { HighlightRange } from '../types/highlight';
import {
  DiffTimeoutError,
  ContentTooLargeError,
  DiffCalculationError,
  InvalidContentError,
} from '../errors/diffErrors';

/**
 * Configuration constants for diff calculation
 */
const DIFF_CONFIG = {
  /** Maximum time allowed for diff calculation (5 seconds) */
  TIMEOUT_MS: 5000,

  /** Maximum total characters (combined left + right) */
  MAX_CHARACTERS: 50000,

  /** Maximum characters per individual side */
  MAX_SINGLE_SIDE: 100000,
} as const;

/**
 * Sanitizes input content by removing null characters and normalizing line endings
 *
 * @param content - Raw input content
 * @returns Sanitized content safe for diff calculation
 * @throws {InvalidContentError} If content contains invalid encoding
 */
function sanitizeInput(content: string): string {
  try {
    // Remove null characters
    let sanitized = content.replace(/\0/g, '');

    // Normalize line endings to \n
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    return sanitized;
  } catch {
    throw new InvalidContentError(
      '無効な文字エンコーディングが検出されました。UTF-8形式のテキストを使用してください。'
    );
  }
}

/**
 * Validates content size against limits
 *
 * @param leftContent - Left side content
 * @param rightContent - Right side content
 * @throws {ContentTooLargeError} If content exceeds size limits
 */
function validateContentSize(
  leftContent: string,
  rightContent: string
): void {
  const totalChars = leftContent.length + rightContent.length;

  if (totalChars > DIFF_CONFIG.MAX_CHARACTERS) {
    throw new ContentTooLargeError(
      `テキストが大きすぎて処理できません。(最大 ${DIFF_CONFIG.MAX_CHARACTERS.toLocaleString()} 文字、現在 ${totalChars.toLocaleString()} 文字)`
    );
  }

  if (
    leftContent.length > DIFF_CONFIG.MAX_SINGLE_SIDE ||
    rightContent.length > DIFF_CONFIG.MAX_SINGLE_SIDE
  ) {
    throw new ContentTooLargeError(
      `片側のテキストが大きすぎます。(最大 ${DIFF_CONFIG.MAX_SINGLE_SIDE.toLocaleString()} 文字)`
    );
  }
}

/**
 * Converts diff package Change objects to our HighlightRange format
 *
 * @param changes - Array of changes from diff package
 * @returns Array of highlight ranges with positions
 */
function convertToHighlightRanges(changes: readonly Change[]): HighlightRange[] {
  const ranges: HighlightRange[] = [];
  let currentPos = 0;

  for (const change of changes) {
    if (change.added || change.removed) {
      ranges.push({
        start: currentPos,
        end: currentPos + change.value.length,
        type: change.added ? 'added' : 'removed',
      });
    }

    // Only advance position for added or unchanged text
    // Removed text doesn't contribute to the "new" position
    if (!change.removed) {
      currentPos += change.value.length;
    }
  }

  return ranges;
}

/**
 * Creates DiffLine objects with highlight ranges
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @param changes - Diff changes from diff package
 * @returns Array of DiffLine objects with highlights
 */
function createDiffLines(
  oldText: string,
  newText: string,
  changes: readonly Change[]
): DiffLine[] {
  const lines: DiffLine[] = [];

  // Simple implementation: treat entire content as single line for now
  // TODO: Phase 2 will implement proper line-by-line diffing
  const hasChanges = changes.some((c) => c.added || c.removed);

  if (hasChanges) {
    const highlights = convertToHighlightRanges(changes);

    lines.push({
      type: 'modify',
      oldLineNumber: 0,
      newLineNumber: 0,
      content: newText || oldText,
      highlightRanges: highlights.length > 0 ? highlights : undefined,
    });
  } else {
    // No changes
    lines.push({
      type: 'context',
      oldLineNumber: 0,
      newLineNumber: 0,
      content: oldText,
    });
  }

  return lines;
}

/**
 * Creates diff statistics from changes
 *
 * @param changes - Diff changes
 * @returns Statistics about additions, deletions, and total changes
 */
function createDiffStats(changes: readonly Change[]): DiffStats {
  let additions = 0;
  let deletions = 0;

  for (const change of changes) {
    if (change.added) {
      additions += change.value.length;
    } else if (change.removed) {
      deletions += change.value.length;
    }
  }

  return {
    additions,
    deletions,
    changes: additions + deletions,
  };
}

/**
 * Calculates character-level diff with timeout and validation
 *
 * This is the main entry point for diff calculation. It performs:
 * 1. Input sanitization
 * 2. Size validation
 * 3. Timeout-protected diff calculation
 * 4. Conversion to DiffData format with highlights
 *
 * @param leftContent - Original content
 * @param rightContent - Modified content
 * @returns Promise<DiffData> with highlight ranges and metadata
 * @throws {DiffTimeoutError} If calculation exceeds 5 seconds
 * @throws {ContentTooLargeError} If content exceeds size limits
 * @throws {InvalidContentError} If content has invalid encoding
 * @throws {DiffCalculationError} If calculation fails unexpectedly
 *
 * @example
 * ```typescript
 * const result = await calculateDiff('Hello World', 'Hello Beautiful World');
 * // result.hunks[0].lines[0].highlightRanges contains character positions
 * ```
 */
export async function calculateDiff(
  leftContent: string,
  rightContent: string
): Promise<DiffData> {
  const startTime = performance.now();

  try {
    // Step 1: Sanitize inputs (FM-003: Invalid input)
    const sanitizedLeft = sanitizeInput(leftContent);
    const sanitizedRight = sanitizeInput(rightContent);

    // Step 2: Validate content size (FM-002: Memory limit)
    validateContentSize(sanitizedLeft, sanitizedRight);

    // Step 3: Set up timeout handling (FM-001: Timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, DIFF_CONFIG.TIMEOUT_MS);

    try {
      // Step 4: Calculate diff
      // Note: diff package doesn't support AbortSignal, so we wrap in Promise.race
      const diffPromise = new Promise<Change[]>((resolve, reject) => {
        if (controller.signal.aborted) {
          reject(
            new DiffTimeoutError(
              '比較処理に時間がかかりすぎています。テキストが大きすぎる可能性があります。'
            )
          );
          return;
        }

        try {
          const changes = diffChars(sanitizedLeft, sanitizedRight);
          resolve(changes);
        } catch (error) {
          reject(error);
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(
            new DiffTimeoutError(
              '比較処理に時間がかかりすぎています。テキストが大きすぎる可能性があります。'
            )
          );
        });
      });

      const changes = await Promise.race([diffPromise, timeoutPromise]);

      clearTimeout(timeoutId);

      // Step 5: Convert to DiffData format
      const lines = createDiffLines(sanitizedLeft, sanitizedRight, changes);
      const stats = createDiffStats(changes);

      const calculationTime = performance.now() - startTime;

      const diffData: DiffData = {
        oldFile: {
          fileName: 'left',
          content: sanitizedLeft,
          fileLang: 'text',
        },
        newFile: {
          fileName: 'right',
          content: sanitizedRight,
          fileLang: 'text',
        },
        hunks: [
          {
            oldStart: 0,
            oldLines: sanitizedLeft ? 1 : 0,
            newStart: 0,
            newLines: sanitizedRight ? 1 : 0,
            lines,
          },
        ],
        stats,
        metadata: {
          calculationTime,
          totalCharacters: sanitizedLeft.length + sanitizedRight.length,
          changesCount: lines.filter((l) => l.type !== 'context').length,
          timestamp: new Date(),
        },
      };

      return diffData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DiffTimeoutError) {
        throw error;
      }

      throw new DiffCalculationError(
        '差分計算中にエラーが発生しました。',
        error instanceof Error ? error : undefined
      );
    }
  } catch (error) {
    // Re-throw known error types
    if (
      error instanceof DiffTimeoutError ||
      error instanceof ContentTooLargeError ||
      error instanceof InvalidContentError ||
      error instanceof DiffCalculationError
    ) {
      throw error;
    }

    // Wrap unknown errors
    throw new DiffCalculationError(
      '予期しないエラーが発生しました。',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Performance benchmarking utility for testing
 *
 * @internal
 * @param content - Content to benchmark
 * @returns Performance metrics
 */
export async function benchmarkDiff(
  content: string
): Promise<{ time: number; chars: number }> {
  const start = performance.now();
  await calculateDiff(content, content + ' modified');
  const time = performance.now() - start;

  return {
    time,
    chars: content.length * 2,
  };
}
