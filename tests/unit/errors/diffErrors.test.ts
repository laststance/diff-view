/**
 * Comprehensive unit tests for custom diff error classes
 *
 * Tests error construction, inheritance, stack traces, and error mapping
 */

import { describe, it, expect } from 'vitest';

import {
  DiffTimeoutError,
  ContentTooLargeError,
  DiffCalculationError,
  InvalidContentError,
} from '../../../src/errors/diffErrors';

// =============================================================================
// DiffTimeoutError Tests
// =============================================================================

describe('DiffTimeoutError', () => {
  it('should create error with message', () => {
    const error = new DiffTimeoutError('Timeout occurred');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DiffTimeoutError);
    expect(error.message).toBe('Timeout occurred');
  });

  it('should have correct error name', () => {
    const error = new DiffTimeoutError('Test');

    expect(error.name).toBe('DiffTimeoutError');
  });

  it('should capture stack trace', () => {
    const error = new DiffTimeoutError('Test');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('DiffTimeoutError');
  });

  it('should work with instanceof checks', () => {
    const error = new DiffTimeoutError('Test');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof DiffTimeoutError).toBe(true);
    expect(error instanceof ContentTooLargeError).toBe(false);
  });

  it('should support Japanese error messages', () => {
    const message = '比較処理に時間がかかりすぎています。';
    const error = new DiffTimeoutError(message);

    expect(error.message).toBe(message);
  });

  it('should be throwable and catchable', () => {
    const throwError = () => {
      throw new DiffTimeoutError('Test timeout');
    };

    expect(throwError).toThrow(DiffTimeoutError);
    expect(throwError).toThrow('Test timeout');
  });

  it('should maintain proper prototype chain', () => {
    const error = new DiffTimeoutError('Test');

    expect(Object.getPrototypeOf(error)).toBe(DiffTimeoutError.prototype);
    expect(Object.getPrototypeOf(DiffTimeoutError.prototype)).toBe(Error.prototype);
  });
});

// =============================================================================
// ContentTooLargeError Tests
// =============================================================================

describe('ContentTooLargeError', () => {
  it('should create error with message', () => {
    const error = new ContentTooLargeError('Content too large');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ContentTooLargeError);
    expect(error.message).toBe('Content too large');
  });

  it('should have correct error name', () => {
    const error = new ContentTooLargeError('Test');

    expect(error.name).toBe('ContentTooLargeError');
  });

  it('should capture stack trace', () => {
    const error = new ContentTooLargeError('Test');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ContentTooLargeError');
  });

  it('should work with instanceof checks', () => {
    const error = new ContentTooLargeError('Test');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof ContentTooLargeError).toBe(true);
    expect(error instanceof DiffTimeoutError).toBe(false);
  });

  it('should support Japanese error messages', () => {
    const message = 'テキストが大きすぎて処理できません。';
    const error = new ContentTooLargeError(message);

    expect(error.message).toBe(message);
  });

  it('should support detailed size information in message', () => {
    const message = 'Content size: 60,000 characters (max: 50,000)';
    const error = new ContentTooLargeError(message);

    expect(error.message).toContain('60,000');
    expect(error.message).toContain('50,000');
  });

  it('should be throwable and catchable', () => {
    const throwError = () => {
      throw new ContentTooLargeError('Too large');
    };

    expect(throwError).toThrow(ContentTooLargeError);
    expect(throwError).toThrow('Too large');
  });

  it('should distinguish between total and single-side limits', () => {
    const totalLimit = new ContentTooLargeError('Total content exceeds limit');
    const singleLimit = new ContentTooLargeError('Single side exceeds limit');

    expect(totalLimit.message).toContain('Total');
    expect(singleLimit.message).toContain('Single');
  });
});

// =============================================================================
// InvalidContentError Tests
// =============================================================================

describe('InvalidContentError', () => {
  it('should create error with message', () => {
    const error = new InvalidContentError('Invalid content');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidContentError);
    expect(error.message).toBe('Invalid content');
  });

  it('should have correct error name', () => {
    const error = new InvalidContentError('Test');

    expect(error.name).toBe('InvalidContentError');
  });

  it('should capture stack trace', () => {
    const error = new InvalidContentError('Test');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('InvalidContentError');
  });

  it('should work with instanceof checks', () => {
    const error = new InvalidContentError('Test');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof InvalidContentError).toBe(true);
    expect(error instanceof ContentTooLargeError).toBe(false);
  });

  it('should support Japanese error messages', () => {
    const message = '無効な文字エンコーディングが検出されました。';
    const error = new InvalidContentError(message);

    expect(error.message).toBe(message);
  });

  it('should be throwable and catchable', () => {
    const throwError = () => {
      throw new InvalidContentError('Invalid encoding');
    };

    expect(throwError).toThrow(InvalidContentError);
    expect(throwError).toThrow('Invalid encoding');
  });

  it('should support detailed encoding information', () => {
    const message = 'Invalid UTF-8 encoding detected at position 1024';
    const error = new InvalidContentError(message);

    expect(error.message).toContain('UTF-8');
    expect(error.message).toContain('1024');
  });
});

// =============================================================================
// DiffCalculationError Tests
// =============================================================================

describe('DiffCalculationError', () => {
  it('should create error with message only', () => {
    const error = new DiffCalculationError('Calculation failed');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DiffCalculationError);
    expect(error.message).toBe('Calculation failed');
    expect(error.cause).toBeUndefined();
  });

  it('should create error with message and cause', () => {
    const originalError = new Error('Original error');
    const error = new DiffCalculationError('Wrapped error', originalError);

    expect(error.message).toBe('Wrapped error');
    expect(error.cause).toBe(originalError);
  });

  it('should have correct error name', () => {
    const error = new DiffCalculationError('Test');

    expect(error.name).toBe('DiffCalculationError');
  });

  it('should capture stack trace', () => {
    const error = new DiffCalculationError('Test');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('DiffCalculationError');
  });

  it('should work with instanceof checks', () => {
    const error = new DiffCalculationError('Test');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof DiffCalculationError).toBe(true);
    expect(error instanceof DiffTimeoutError).toBe(false);
  });

  it('should support Japanese error messages', () => {
    const message = '差分計算中にエラーが発生しました。';
    const error = new DiffCalculationError(message);

    expect(error.message).toBe(message);
  });

  it('should preserve original error information', () => {
    const original = new Error('Database connection failed');
    original.stack = 'Original stack trace';

    const wrapped = new DiffCalculationError('Failed to calculate diff', original);

    expect(wrapped.cause).toBe(original);
    expect(wrapped.cause?.message).toBe('Database connection failed');
    expect(wrapped.cause?.stack).toBe('Original stack trace');
  });

  it('should be throwable and catchable', () => {
    const throwError = () => {
      throw new DiffCalculationError('Calculation error');
    };

    expect(throwError).toThrow(DiffCalculationError);
    expect(throwError).toThrow('Calculation error');
  });

  it('should handle error chaining', () => {
    const rootCause = new Error('Root cause');
    const intermediateCause = new DiffCalculationError('Intermediate', rootCause);
    const topError = new DiffCalculationError('Top level', intermediateCause);

    expect(topError.cause).toBe(intermediateCause);
    expect((topError.cause as DiffCalculationError).cause).toBe(rootCause);
  });
});

// =============================================================================
// Error Type Mapping Tests
// =============================================================================

describe('Error Type Mapping', () => {
  it('should map to correct ErrorType values', () => {
    // This tests the expected mapping documented in error classes

    const timeout = new DiffTimeoutError('Timeout');
    const tooLarge = new ContentTooLargeError('Too large');
    const invalid = new InvalidContentError('Invalid');
    const calculation = new DiffCalculationError('Failed');

    // Verify error names for type mapping
    expect(timeout.name).toBe('DiffTimeoutError'); // maps to 'processing-timeout'
    expect(tooLarge.name).toBe('ContentTooLargeError'); // maps to 'content-size'
    expect(invalid.name).toBe('InvalidContentError'); // maps to 'invalid-content'
    expect(calculation.name).toBe('DiffCalculationError'); // maps to 'diff-computation'
  });

  it('should be distinguishable by name property', () => {
    const errors = [
      new DiffTimeoutError('A'),
      new ContentTooLargeError('B'),
      new InvalidContentError('C'),
      new DiffCalculationError('D'),
    ];

    const names = errors.map((e) => e.name);

    expect(names).toEqual([
      'DiffTimeoutError',
      'ContentTooLargeError',
      'InvalidContentError',
      'DiffCalculationError',
    ]);
  });

  it('should support error type detection in catch blocks', () => {
    const throwRandomError = (type: number) => {
      switch (type) {
        case 0:
          throw new DiffTimeoutError('Timeout');
        case 1:
          throw new ContentTooLargeError('Too large');
        case 2:
          throw new InvalidContentError('Invalid');
        case 3:
          throw new DiffCalculationError('Failed');
        default:
          throw new Error('Unknown');
      }
    };

    for (let i = 0; i < 4; i++) {
      try {
        throwRandomError(i);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBeDefined();
      }
    }
  });
});

// =============================================================================
// Error Integration Tests
// =============================================================================

describe('Error Integration', () => {
  it('should work with Promise rejection', async () => {
    const promise = Promise.reject(new DiffTimeoutError('Async timeout'));

    await expect(promise).rejects.toThrow(DiffTimeoutError);
    await expect(promise).rejects.toThrow('Async timeout');
  });

  it('should work with async/await try-catch', async () => {
    const asyncFunction = async () => {
      throw new ContentTooLargeError('Async error');
    };

    await expect(asyncFunction()).rejects.toThrow(ContentTooLargeError);
  });

  it('should support error recovery patterns', () => {
    const attemptOperation = () => {
      throw new DiffCalculationError('Operation failed');
    };

    try {
      attemptOperation();
    } catch (error) {
      if (error instanceof DiffCalculationError) {
        expect(error.message).toBe('Operation failed');
        // Recovery logic would go here
      }
    }
  });

  it('should support error logging patterns', () => {
    const errors: Error[] = [];

    const logError = (error: Error) => {
      errors.push(error);
    };

    try {
      throw new DiffTimeoutError('Logged error');
    } catch (error) {
      logError(error as Error);
    }

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(DiffTimeoutError);
  });

  it('should support error aggregation', () => {
    const errors = [
      new DiffTimeoutError('Error 1'),
      new ContentTooLargeError('Error 2'),
      new InvalidContentError('Error 3'),
    ];

    const errorTypes = errors.map((e) => e.constructor.name);

    expect(errorTypes).toEqual([
      'DiffTimeoutError',
      'ContentTooLargeError',
      'InvalidContentError',
    ]);
  });
});

// =============================================================================
// Edge Cases and Error Behavior
// =============================================================================

describe('Error Edge Cases', () => {
  it('should handle empty error messages', () => {
    const error = new DiffTimeoutError('');

    expect(error.message).toBe('');
    expect(error.name).toBe('DiffTimeoutError');
  });

  it('should handle very long error messages', () => {
    const longMessage = 'x'.repeat(10000);
    const error = new ContentTooLargeError(longMessage);

    expect(error.message).toHaveLength(10000);
  });

  it('should handle special characters in messages', () => {
    const message = 'Error with\nnewlines\tand\ttabs';
    const error = new InvalidContentError(message);

    expect(error.message).toBe(message);
  });

  it('should handle Unicode in messages', () => {
    const message = 'エラー 🚨 occurred';
    const error = new DiffCalculationError(message);

    expect(error.message).toBe(message);
  });

  it('should be comparable by type', () => {
    const error1 = new DiffTimeoutError('Test');
    const error2 = new DiffTimeoutError('Different message');

    expect(error1.constructor).toBe(error2.constructor);
    expect(error1.name).toBe(error2.name);
  });

  it('should maintain error identity across re-throws', () => {
    const original = new DiffTimeoutError('Original');

    try {
      throw original;
    } catch (caught) {
      expect(caught).toBe(original);
    }
  });
});
