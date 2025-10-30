/**
 * Custom error classes for diff calculation failures
 *
 * These errors map to the existing ErrorType system for consistent error handling
 */

/**
 * Thrown when diff calculation exceeds the timeout limit (5 seconds)
 *
 * Maps to ErrorType: 'processing-timeout'
 *
 * @example
 * ```typescript
 * throw new DiffTimeoutError('比較処理に時間がかかりすぎています。テキストが大きすぎる可能性があります。');
 * ```
 */
export class DiffTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiffTimeoutError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DiffTimeoutError);
    }
  }
}

/**
 * Thrown when content exceeds size limits (50,000 characters)
 *
 * Maps to ErrorType: 'content-size'
 *
 * @example
 * ```typescript
 * throw new ContentTooLargeError('テキストが大きすぎて処理できません。(最大 50,000 文字)');
 * ```
 */
export class ContentTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentTooLargeError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContentTooLargeError);
    }
  }
}

/**
 * Thrown when diff calculation fails unexpectedly
 *
 * Maps to ErrorType: 'diff-computation'
 *
 * @example
 * ```typescript
 * throw new DiffCalculationError('差分計算中にエラーが発生しました。', originalError);
 * ```
 */
export class DiffCalculationError extends Error {
  /**
   * Original error that caused the diff calculation to fail
   */
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DiffCalculationError';
    this.cause = cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DiffCalculationError);
    }
  }
}

/**
 * Thrown when input content contains invalid characters or encoding issues
 *
 * Maps to ErrorType: 'invalid-content'
 *
 * @example
 * ```typescript
 * throw new InvalidContentError('無効な文字が含まれています。');
 * ```
 */
export class InvalidContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidContentError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidContentError);
    }
  }
}
