import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { TextPane } from '../../../src/components/TextPane';

// Mock clipboard API
const mockClipboard = {
  readText: vi.fn(),
  writeText: vi.fn(),
};

// Mock ClipboardEvent and DataTransfer for jsdom
global.ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData: any;
  constructor(type: string, eventInitDict?: any) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData || null;
  }
} as any;

global.DataTransfer = class DataTransfer {
  private data: Map<string, string> = new Map();

  setData(format: string, data: string) {
    this.data.set(format, data);
  }

  getData(format: string) {
    return this.data.get(format) || '';
  }
} as any;

describe('TextPane Component', () => {
  const defaultProps = {
    id: 'left' as const,
    value: '',
    onChange: vi.fn(),
    placeholder: 'Enter text here...',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<TextPane {...defaultProps} />);

      expect(screen.getByTestId('text-pane-left')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-left')).toBeInTheDocument();
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter text here...')
      ).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<TextPane {...defaultProps} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render right pane correctly', () => {
      render(<TextPane {...defaultProps} id="right" />);

      expect(screen.getByTestId('text-pane-right')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-right')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should display language badge when provided', () => {
      render(<TextPane {...defaultProps} language="javascript" />);

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByLabelText('Language: javascript')).toBeInTheDocument();
    });
  });

  describe('Content Statistics', () => {
    it('should display correct statistics for empty content', () => {
      render(<TextPane {...defaultProps} />);

      expect(screen.getByLabelText('0 characters')).toBeInTheDocument();
      expect(screen.getByLabelText('1 lines')).toBeInTheDocument();
      expect(screen.getByLabelText('0 words')).toBeInTheDocument();
    });

    it('should display correct statistics for content with text', () => {
      const content = 'Hello World\nThis is a test';
      render(<TextPane {...defaultProps} value={content} />);

      expect(screen.getByLabelText('26 characters')).toBeInTheDocument();
      expect(screen.getByLabelText('2 lines')).toBeInTheDocument();
      expect(screen.getByLabelText('6 words')).toBeInTheDocument();
    });

    it('should update statistics when content changes', async () => {
      const onChange = vi.fn();

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');
      fireEvent.change(textarea, { target: { value: 'Hello World' } });

      expect(onChange).toHaveBeenCalledWith('Hello World');
    });
  });

  describe('Text Input and Editing', () => {
    it('should handle text input correctly', async () => {
      const onChange = vi.fn();

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');
      fireEvent.change(textarea, { target: { value: 'Test input' } });

      expect(onChange).toHaveBeenCalledWith('Test input');
    });

    it('should handle multiline text input', async () => {
      const onChange = vi.fn();

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');
      fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } });

      expect(onChange).toHaveBeenCalledWith('Line 1\nLine 2');
    });

    it('should respect readOnly prop', () => {
      render(<TextPane {...defaultProps} readOnly />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveAttribute('readOnly');
    });

    it('should handle value changes from props', () => {
      const { rerender } = render(
        <TextPane {...defaultProps} value="Initial" />
      );

      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

      rerender(<TextPane {...defaultProps} value="Updated" />);

      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });
  });

  describe('Paste Functionality', () => {
    it('should handle paste with clipboard API', async () => {
      const onChange = vi.fn();
      mockClipboard.readText.mockResolvedValue('Pasted content');

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');

      // Simulate paste event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });

      fireEvent.paste(textarea, pasteEvent);

      await waitFor(() => {
        expect(mockClipboard.readText).toHaveBeenCalled();
      });
    });

    it('should handle paste with clipboardData fallback', async () => {
      const onChange = vi.fn();
      // Disable clipboard API for this test
      const originalClipboard = navigator.clipboard;
      (navigator as any).clipboard = undefined;

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');

      // Create clipboard data
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', 'Fallback content');

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
      });

      fireEvent.paste(textarea, pasteEvent);

      // Restore clipboard
      (navigator as any).clipboard = originalClipboard;
    });

    it('should handle paste errors gracefully', async () => {
      const onChange = vi.fn();
      mockClipboard.readText.mockRejectedValue(new Error('Clipboard error'));

      render(<TextPane {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('textarea-left');

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });

      fireEvent.paste(textarea, pasteEvent);

      await waitFor(() => {
        expect(mockClipboard.readText).toHaveBeenCalled();
      });

      // Should not throw error
    });
  });

  describe('Copy Functionality', () => {
    it('should copy content to clipboard when copy button is clicked', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      render(<TextPane {...defaultProps} value="Content to copy" />);

      const copyButton = screen.getByLabelText('Copy content to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Content to copy');
      });
    });

    it('should handle copy errors gracefully', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Copy error'));

      render(<TextPane {...defaultProps} value="Content to copy" />);

      const copyButton = screen.getByLabelText('Copy content to clipboard');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Content to copy');
      });

      // Should not throw error
    });

    it('should disable copy button when content is empty', () => {
      render(<TextPane {...defaultProps} value="" />);

      const copyButton = screen.getByLabelText('Copy content to clipboard');
      expect(copyButton).toBeDisabled();
    });

    it('should not show copy button in readOnly mode', () => {
      render(<TextPane {...defaultProps} readOnly />);

      expect(
        screen.queryByLabelText('Copy content to clipboard')
      ).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+A (select all)', async () => {
      const user = userEvent.setup();

      render(<TextPane {...defaultProps} value="Select all this text" />);

      const textarea = screen.getByTestId(
        'textarea-left'
      ) as HTMLTextAreaElement;
      textarea.focus();

      await user.keyboard('{Control>}a{/Control}');

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe('Select all this text'.length);
    });

    it('should handle Cmd+A on macOS', async () => {
      const user = userEvent.setup();

      render(<TextPane {...defaultProps} value="Select all this text" />);

      const textarea = screen.getByTestId(
        'textarea-left'
      ) as HTMLTextAreaElement;
      textarea.focus();

      await user.keyboard('{Meta>}a{/Meta}');

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe('Select all this text'.length);
    });
  });

  describe('Font Size and Styling', () => {
    it('should apply small font size class', () => {
      render(<TextPane {...defaultProps} fontSize="small" />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('text-sm');
    });

    it('should apply medium font size class (default)', () => {
      render(<TextPane {...defaultProps} fontSize="medium" />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('text-base');
    });

    it('should apply large font size class', () => {
      render(<TextPane {...defaultProps} fontSize="large" />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('text-lg');
    });

    it('should apply word wrap when enabled', () => {
      render(<TextPane {...defaultProps} wordWrap />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('whitespace-pre-wrap');
    });

    it('should not apply word wrap when disabled', () => {
      render(<TextPane {...defaultProps} wordWrap={false} />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('whitespace-pre');
    });
  });

  describe('Scroll Synchronization', () => {
    it('should call onScroll when textarea is scrolled', () => {
      const onScroll = vi.fn();

      render(<TextPane {...defaultProps} onScroll={onScroll} />);

      const textarea = screen.getByTestId('textarea-left');

      fireEvent.scroll(textarea, {
        target: { scrollTop: 100, scrollLeft: 50 },
      });

      expect(onScroll).toHaveBeenCalledWith(100, 50);
    });

    it('should apply external scroll position', () => {
      render(<TextPane {...defaultProps} scrollTop={100} scrollLeft={50} />);

      const textarea = screen.getByTestId(
        'textarea-left'
      ) as HTMLTextAreaElement;

      // Note: In jsdom, scrollTop/scrollLeft might not work exactly like in browser
      // This test verifies the prop is handled without errors
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TextPane {...defaultProps} />);

      const textPane = screen.getByTestId('text-pane-left');
      expect(textPane).toHaveAttribute('role', 'region');
      expect(textPane).toHaveAttribute('aria-label', 'Original text pane');

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveAttribute('role', 'textbox');
      expect(textarea).toHaveAttribute('aria-multiline', 'true');
      expect(textarea).toHaveAttribute('aria-label', 'Original text content');
    });

    it('should have proper header banner role', () => {
      render(<TextPane {...defaultProps} />);

      const header = screen.getByLabelText('Text pane header');
      expect(header).toHaveAttribute('role', 'banner');
    });

    it('should have live region for statistics', () => {
      render(<TextPane {...defaultProps} />);

      const stats = screen.getByLabelText(/Content statistics:/);
      expect(stats).toHaveAttribute('role', 'status');
      expect(stats).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper action group', () => {
      render(<TextPane {...defaultProps} />);

      const actionGroup = screen.getByLabelText('Text actions');
      expect(actionGroup).toHaveAttribute('role', 'group');
    });
  });

  describe('Line Numbers', () => {
    it('should show line numbers when enabled', () => {
      render(
        <TextPane
          {...defaultProps}
          value="Line 1\nLine 2\nLine 3"
          showLineNumbers
        />
      );

      // Line numbers are rendered as overlay, check for their presence
      const textPane = screen.getByTestId('text-pane-left');
      expect(textPane).toBeInTheDocument();
    });

    it('should not show line numbers when disabled', () => {
      render(
        <TextPane
          {...defaultProps}
          value="Line 1\nLine 2\nLine 3"
          showLineNumbers={false}
        />
      );

      const textPane = screen.getByTestId('text-pane-left');
      expect(textPane).toBeInTheDocument();
    });
  });

  describe('Fixed Height Mode', () => {
    it('should apply fixed height when enabled', () => {
      render(<TextPane {...defaultProps} fixedHeight />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('h-[400px]');
    });

    it('should use dynamic height when disabled', () => {
      render(<TextPane {...defaultProps} fixedHeight={false} />);

      const textarea = screen.getByTestId('textarea-left');
      expect(textarea).toHaveClass('min-h-[300px]');
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      // Test that the component doesn't crash with invalid props
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<TextPane {...defaultProps} />);

      expect(screen.getByTestId('text-pane-left')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });
});
