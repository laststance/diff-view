import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  setupTimers,
  cleanupTimers,
  advanceTimersAsync,
  createTestFile,
  suppressConsoleErrors,
} from '../utils/test-helpers';

// Test component that uses timers
const TimerComponent: React.FC<{ onTimeout: () => void; delay: number }> = ({
  onTimeout,
  delay,
}) => {
  useEffect(() => {
    const timer = setTimeout(onTimeout, delay);
    return () => clearTimeout(timer);
  }, [onTimeout, delay]);

  return <div>Timer Component</div>;
};

// Test component that handles file uploads
const FileUploadComponent: React.FC<{
  onFileRead: (content: string) => void;
}> = ({ onFileRead }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileRead(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <input type="file" onChange={handleFileChange} data-testid="file-input" />
  );
};

describe('Core Fixes Verification', () => {
  beforeEach(() => {
    setupTimers();
  });

  afterEach(() => {
    cleanupTimers();
  });

  describe('Timer Mocking Fixes', () => {
    it('should handle async timer operations correctly', async () => {
      const onTimeout = vi.fn();
      render(<TimerComponent onTimeout={onTimeout} delay={1000} />);

      expect(onTimeout).not.toHaveBeenCalled();

      // Advance timers asynchronously
      await advanceTimersAsync(1000);

      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple timer operations', async () => {
      const onTimeout1 = vi.fn();
      const onTimeout2 = vi.fn();

      render(
        <div>
          <TimerComponent onTimeout={onTimeout1} delay={500} />
          <TimerComponent onTimeout={onTimeout2} delay={1000} />
        </div>
      );

      // Advance to first timer
      await advanceTimersAsync(500);
      expect(onTimeout1).toHaveBeenCalledTimes(1);
      expect(onTimeout2).not.toHaveBeenCalled();

      // Advance to second timer
      await advanceTimersAsync(500);
      expect(onTimeout2).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid timer sequences', async () => {
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];

      render(
        <div>
          <TimerComponent onTimeout={callbacks[0]} delay={100} />
          <TimerComponent onTimeout={callbacks[1]} delay={200} />
          <TimerComponent onTimeout={callbacks[2]} delay={300} />
        </div>
      );

      // Advance through all timers
      await advanceTimersAsync(100);
      expect(callbacks[0]).toHaveBeenCalledTimes(1);
      expect(callbacks[1]).not.toHaveBeenCalled();
      expect(callbacks[2]).not.toHaveBeenCalled();

      await advanceTimersAsync(100);
      expect(callbacks[1]).toHaveBeenCalledTimes(1);
      expect(callbacks[2]).not.toHaveBeenCalled();

      await advanceTimersAsync(100);
      expect(callbacks[2]).toHaveBeenCalledTimes(1);
    });
  });

  describe('FileReader Mocking Fixes', () => {
    it('should handle file reading operations', async () => {
      const onFileRead = vi.fn();
      render(<FileUploadComponent onFileRead={onFileRead} />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const testFile = createTestFile('test file content', 'test.txt');

      // Mock the files property
      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: false,
      });

      // Trigger file change
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Wait for async file reading
      await waitFor(
        () => {
          expect(onFileRead).toHaveBeenCalledWith('File content');
        },
        { timeout: 1000 }
      );
    });

    it('should handle multiple file operations sequentially', async () => {
      const onFileRead = vi.fn();
      render(<FileUploadComponent onFileRead={onFileRead} />);

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

      // First file
      const testFile1 = createTestFile('content1', 'test1.txt');
      Object.defineProperty(fileInput, 'files', {
        value: [testFile1],
        writable: false,
        configurable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      await waitFor(
        () => {
          expect(onFileRead).toHaveBeenCalledWith('File content');
        },
        { timeout: 1000 }
      );

      // Reset the mock to track second call
      onFileRead.mockClear();

      // Second file
      const testFile2 = createTestFile('content2', 'test2.txt');
      Object.defineProperty(fileInput, 'files', {
        value: [testFile2],
        writable: false,
        configurable: true,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      await waitFor(
        () => {
          expect(onFileRead).toHaveBeenCalledWith('File content');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Console Error Suppression', () => {
    it('should suppress console errors during tests', () => {
      const consoleSpy = suppressConsoleErrors();

      // This would normally log an error
      console.error('This error should be suppressed');

      expect(consoleSpy).toHaveBeenCalledWith(
        'This error should be suppressed'
      );

      consoleSpy.mockRestore();
    });

    it('should allow multiple console error suppressions', () => {
      const consoleSpy1 = suppressConsoleErrors();
      const consoleSpy2 = suppressConsoleErrors();

      console.error('Error 1');
      console.error('Error 2');

      expect(consoleSpy2).toHaveBeenCalledWith('Error 1');
      expect(consoleSpy2).toHaveBeenCalledWith('Error 2');

      consoleSpy1.mockRestore();
      consoleSpy2.mockRestore();
    });
  });

  describe('Clipboard Mocking', () => {
    it('should handle clipboard operations', async () => {
      // Test that clipboard is available and mocked
      expect(navigator.clipboard).toBeDefined();
      expect(navigator.clipboard.writeText).toBeDefined();
      expect(navigator.clipboard.readText).toBeDefined();

      // Test clipboard write
      await navigator.clipboard.writeText('test content');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'test content'
      );
    });

    it('should handle clipboard read operations', async () => {
      // Mock the readText to return a value
      (navigator.clipboard.readText as any).mockResolvedValue(
        'clipboard content'
      );

      const content = await navigator.clipboard.readText();
      expect(content).toBe('clipboard content');
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });
  });

  describe('Global Mocks Availability', () => {
    it('should have ResizeObserver mock available', () => {
      expect(global.ResizeObserver).toBeDefined();

      const observer = new ResizeObserver(() => {});
      expect(observer.observe).toBeDefined();
      expect(observer.unobserve).toBeDefined();
      expect(observer.disconnect).toBeDefined();

      // Test that methods can be called without errors
      const element = document.createElement('div');
      observer.observe(element);
      observer.unobserve(element);
      observer.disconnect();
    });

    it('should have matchMedia mock available', () => {
      expect(window.matchMedia).toBeDefined();

      const mediaQuery = window.matchMedia('(max-width: 768px)');
      expect(mediaQuery.matches).toBe(false);
      expect(mediaQuery.addEventListener).toBeDefined();
      expect(mediaQuery.removeEventListener).toBeDefined();

      // Test that methods can be called without errors
      const handler = vi.fn();
      mediaQuery.addEventListener('change', handler);
      mediaQuery.removeEventListener('change', handler);
    });

    it('should have ClipboardEvent and DataTransfer mocks available', () => {
      expect(global.ClipboardEvent).toBeDefined();
      expect(global.DataTransfer).toBeDefined();

      const clipboardEvent = new ClipboardEvent('paste');
      expect(clipboardEvent).toBeInstanceOf(Event);
      expect(clipboardEvent.type).toBe('paste');

      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', 'test');
      expect(dataTransfer.getData('text/plain')).toBe('test');
      expect(dataTransfer.getData('text/html')).toBe('');
    });
  });

  describe('Combined Operations', () => {
    it('should handle timers and file operations together', async () => {
      const onTimeout = vi.fn();
      const onFileRead = vi.fn();

      render(
        <div>
          <TimerComponent onTimeout={onTimeout} delay={500} />
          <FileUploadComponent onFileRead={onFileRead} />
        </div>
      );

      // Trigger file operation
      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const testFile = createTestFile('combined test', 'test.txt');
      Object.defineProperty(fileInput, 'files', {
        value: [testFile],
        writable: false,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Advance timer
      await advanceTimersAsync(500);

      // Both operations should complete
      expect(onTimeout).toHaveBeenCalledTimes(1);
      await waitFor(
        () => {
          expect(onFileRead).toHaveBeenCalledWith('File content');
        },
        { timeout: 1000 }
      );
    });
  });
});
