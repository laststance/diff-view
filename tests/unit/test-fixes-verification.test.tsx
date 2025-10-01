import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  setupTimers,
  cleanupTimers,
  advanceTimersAsync,
  createLocationReloadMock,
  createConfirmMock,
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

// Test component that uses window.location.reload
const ReloadComponent: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return <button onClick={handleReload}>Reload</button>;
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

describe('Test Fixes Verification', () => {
  let reloadSpy: any;
  let confirmSpy: any;

  beforeEach(() => {
    setupTimers();
    reloadSpy = createLocationReloadMock();
    confirmSpy = createConfirmMock();
  });

  afterEach(() => {
    cleanupTimers();
    if (reloadSpy && reloadSpy.mockRestore) {
      reloadSpy.mockRestore();
    }
    if (confirmSpy && confirmSpy.mockRestore) {
      confirmSpy.mockRestore();
    }
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
  });

  describe('Window.location.reload Mocking Fixes', () => {
    it('should mock window.location.reload without conflicts', () => {
      render(<ReloadComponent />);

      const reloadButton = screen.getByText('Reload');
      fireEvent.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple reload calls', () => {
      render(<ReloadComponent />);

      const reloadButton = screen.getByText('Reload');
      fireEvent.click(reloadButton);
      fireEvent.click(reloadButton);
      fireEvent.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalledTimes(3);
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

      fireEvent.change(fileInput);

      // Wait for async file reading
      await waitFor(() => {
        expect(onFileRead).toHaveBeenCalledWith('File content');
      });
    });

    it('should handle multiple file operations', async () => {
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
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(onFileRead).toHaveBeenCalledWith('File content');
      });

      // Second file
      const testFile2 = createTestFile('content2', 'test2.txt');
      Object.defineProperty(fileInput, 'files', {
        value: [testFile2],
        writable: false,
        configurable: true,
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(onFileRead).toHaveBeenCalledTimes(2);
      });
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
  });

  describe('Global Mocks Availability', () => {
    it('should have ResizeObserver mock available', () => {
      expect(global.ResizeObserver).toBeDefined();

      const observer = new ResizeObserver(() => {});
      expect(observer.observe).toBeDefined();
      expect(observer.unobserve).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });

    it('should have matchMedia mock available', () => {
      expect(window.matchMedia).toBeDefined();

      const mediaQuery = window.matchMedia('(max-width: 768px)');
      expect(mediaQuery.matches).toBe(false);
      expect(mediaQuery.addEventListener).toBeDefined();
    });

    it('should have ClipboardEvent and DataTransfer mocks available', () => {
      expect(global.ClipboardEvent).toBeDefined();
      expect(global.DataTransfer).toBeDefined();

      const clipboardEvent = new ClipboardEvent('paste');
      expect(clipboardEvent).toBeInstanceOf(Event);

      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', 'test');
      expect(dataTransfer.getData('text/plain')).toBe('test');
    });
  });
});
