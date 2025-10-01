import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { PasteArea } from '../../../src/components/PasteArea';

// Mock FileReader
global.FileReader = class FileReader {
  result: string | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsText(_file: File) {
    // Use Promise.resolve to make it async but immediate
    Promise.resolve().then(() => {
      this.result = 'File content';
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    });
  }
} as any;

describe('PasteArea Component', () => {
  const defaultProps = {
    onContentPaste: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<PasteArea {...defaultProps} />);

      expect(
        screen.getByText('Drop a file here or click to select')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Or paste content with Ctrl+V / Cmd+V')
      ).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');
      expect(dropArea).toHaveAttribute(
        'aria-label',
        'Drop files, click to select, or paste content with Ctrl+V'
      );
      expect(dropArea).toHaveAttribute('tabIndex', '0');
    });

    it('should display file size limit', () => {
      render(<PasteArea {...defaultProps} maxFileSize={5 * 1024 * 1024} />);

      expect(
        screen.getByText('Supports text files up to 5MB')
      ).toBeInTheDocument();
    });

    it('should display supported file types', () => {
      render(<PasteArea {...defaultProps} />);

      expect(screen.getByText('Supported formats:')).toBeInTheDocument();
      expect(screen.getByText(/text\/plain, \.txt, \.md/)).toBeInTheDocument();
    });
  });

  describe('File Drop Functionality', () => {
    it('should handle drag enter event', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.dragEnter(dropArea, {
        dataTransfer: {
          items: [{ kind: 'file' }],
        },
      });

      // Should show drag over state
      expect(dropArea.parentElement).toHaveClass('border-blue-500');
    });

    it('should handle drag leave event', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.dragEnter(dropArea, {
        dataTransfer: {
          items: [{ kind: 'file' }],
        },
      });

      fireEvent.dragLeave(dropArea);

      // Should remove drag over state
      expect(dropArea.parentElement).not.toHaveClass('border-blue-500');
    });

    it('should handle file drop', async () => {
      const onContentPaste = vi.fn();
      render(<PasteArea {...defaultProps} onContentPaste={onContentPaste} />);

      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });

      // Wait for async file processing with longer timeout
      await waitFor(
        () => {
          expect(onContentPaste).toHaveBeenCalledWith(
            'File content',
            'test.txt'
          );
        },
        { timeout: 1000 }
      );
    });

    it('should show error for multiple files', () => {
      render(<PasteArea {...defaultProps} />);

      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file1, file2],
        },
      });

      expect(
        screen.getByText('Please drop only one file at a time')
      ).toBeInTheDocument();
    });

    it('should show error for no files', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [],
        },
      });

      expect(screen.getByText('No files were dropped')).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('should reject files that are too large', async () => {
      render(<PasteArea {...defaultProps} maxFileSize={1024} />);

      const largeFile = new File(['x'.repeat(2000)], 'large.txt', {
        type: 'text/plain',
      });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [largeFile],
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText(/File size.*exceeds maximum allowed size/)
        ).toBeInTheDocument();
      });
    });

    it('should reject unsupported file types', async () => {
      render(
        <PasteArea {...defaultProps} acceptedFileTypes={['text/plain']} />
      );

      const unsupportedFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [unsupportedFile],
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText(/File type.*is not supported/)
        ).toBeInTheDocument();
      });
    });

    it('should reject empty files', async () => {
      // Mock FileReader to return empty content
      global.FileReader = class FileReader {
        result: string | null = null;
        onload: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        readAsText(_file: File) {
          queueMicrotask(() => {
            this.result = '';
            if (this.onload) {
              this.onload({ target: { result: this.result } });
            }
          });
        }
      } as any;

      render(<PasteArea {...defaultProps} />);

      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [emptyFile],
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText('File appears to be empty')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Click to Select', () => {
    it('should open file dialog when clicked', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');
      const fileInput = dropArea.parentElement?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = vi
        .spyOn(fileInput, 'click')
        .mockImplementation(() => {});

      fireEvent.click(dropArea);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle keyboard activation', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');
      const fileInput = dropArea.parentElement?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = vi
        .spyOn(fileInput, 'click')
        .mockImplementation(() => {});

      fireEvent.keyDown(dropArea, { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle space key activation', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');
      const fileInput = dropArea.parentElement?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = vi
        .spyOn(fileInput, 'click')
        .mockImplementation(() => {});

      fireEvent.keyDown(dropArea, { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Paste Functionality', () => {
    it('should handle text paste from clipboard', () => {
      const onContentPaste = vi.fn();
      render(<PasteArea {...defaultProps} onContentPaste={onContentPaste} />);

      const dropArea = screen.getByRole('button');

      fireEvent.paste(dropArea, {
        clipboardData: {
          getData: vi.fn().mockReturnValue('Pasted text content'),
          items: [],
        },
      });

      expect(onContentPaste).toHaveBeenCalledWith('Pasted text content');
    });

    it('should handle empty clipboard paste', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.paste(dropArea, {
        clipboardData: {
          getData: vi.fn().mockReturnValue(''),
          items: [],
        },
      });

      expect(
        screen.getByText('No text content found in clipboard')
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during file processing', async () => {
      render(<PasteArea {...defaultProps} />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(screen.getByText('Processing file...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should auto-clear errors after delay', async () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [],
        },
      });

      expect(screen.getByText('No files were dropped')).toBeInTheDocument();

      // Fast-forward time
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(
          screen.queryByText('No files were dropped')
        ).not.toBeInTheDocument();
      });
    });

    it('should show retry option on error', () => {
      render(<PasteArea {...defaultProps} />);

      const dropArea = screen.getByRole('button');

      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [],
        },
      });

      expect(
        screen.getByText('Click to try again or drag a different file')
      ).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should not respond to interactions when disabled', () => {
      render(<PasteArea {...defaultProps} disabled />);

      const dropArea = screen.getByRole('button');
      expect(dropArea).toHaveAttribute('tabIndex', '-1');

      fireEvent.dragEnter(dropArea, {
        dataTransfer: {
          items: [{ kind: 'file' }],
        },
      });

      // Should not show drag over state when disabled
      expect(dropArea.parentElement).not.toHaveClass('border-blue-500');
    });

    it('should not open file dialog when disabled and clicked', () => {
      render(<PasteArea {...defaultProps} disabled />);

      const dropArea = screen.getByRole('button');
      const fileInput = dropArea.parentElement?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      const clickSpy = vi
        .spyOn(fileInput, 'click')
        .mockImplementation(() => {});

      fireEvent.click(dropArea);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<PasteArea {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('should use custom accepted file types', () => {
      render(
        <PasteArea {...defaultProps} acceptedFileTypes={['.js', '.ts']} />
      );

      expect(screen.getByText('.js, .ts')).toBeInTheDocument();
    });
  });

  describe('File Input Change', () => {
    it('should handle file input change', async () => {
      const onContentPaste = vi.fn();
      render(<PasteArea {...defaultProps} onContentPaste={onContentPaste} />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen
        .getByRole('button')
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(onContentPaste).toHaveBeenCalledWith('File content', 'test.txt');
      });
    });

    it('should reset input value after processing', async () => {
      render(<PasteArea {...defaultProps} />);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen
        .getByRole('button')
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });
  });
});
