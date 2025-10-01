import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  ContentSizeWarning,
  ContentSizeWarningCompact,
  useContentSizeValidation,
} from '../../../src/components/ContentSizeWarning';
import type { ContentLimits } from '../../../src/types/app';

describe('ContentSizeWarning Component', () => {
  const defaultLimits: ContentLimits = {
    maxFileSize: 1024 * 1024, // 1MB
    maxLines: 1000,
    maxCharacters: 10000,
    warningThreshold: 0.8,
  };

  const mockHandlers = {
    onOptimize: vi.fn(),
    onIgnore: vi.fn(),
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Warning Threshold Detection', () => {
    it('should not render when content is below warning threshold', () => {
      const smallContent = 'Small content';
      const { container } = render(
        <ContentSizeWarning content={smallContent} limits={defaultLimits} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when content exceeds warning threshold', () => {
      const largeContent = 'A'.repeat(8500); // 85% of 10000 character limit
      render(
        <ContentSizeWarning content={largeContent} limits={defaultLimits} />
      );

      expect(screen.getByTestId('content-size-warning')).toBeInTheDocument();
      expect(screen.getByText('Content Size Warning')).toBeInTheDocument();
    });

    it('should show critical warning when content is near limits', () => {
      const criticalContent = 'A'.repeat(9600); // 96% of 10000 character limit
      render(
        <ContentSizeWarning content={criticalContent} limits={defaultLimits} />
      );

      expect(screen.getByText('Content Size Critical')).toBeInTheDocument();
    });
  });

  describe('Progress Indicators', () => {
    it('should show character count progress when over threshold', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails
        />
      );

      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('8,500 / 10,000 (85.0%)')).toBeInTheDocument();
    });

    it('should show line count progress when over threshold', () => {
      const manyLines = Array(850).fill('line').join('\n'); // 850 lines (85% of 1000)
      render(
        <ContentSizeWarning
          content={manyLines}
          limits={defaultLimits}
          showDetails
        />
      );

      expect(screen.getByText('Line Count')).toBeInTheDocument();
      expect(screen.getByText('850 / 1,000 (85.0%)')).toBeInTheDocument();
    });

    it('should show file size progress when over threshold', () => {
      // Create content that's about 85% of 1MB
      const largeContent = 'A'.repeat(870000); // Approximately 870KB
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails
        />
      );

      expect(screen.getByText('File Size')).toBeInTheDocument();
      expect(screen.getByText(/KB \/ 1.0 MB/)).toBeInTheDocument();
    });

    it('should have proper progress bar accessibility', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '85');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Action Buttons', () => {
    it('should show optimize button when onOptimize is provided', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          onOptimize={mockHandlers.onOptimize}
        />
      );

      const optimizeButton = screen.getByText('Optimize Content');
      expect(optimizeButton).toBeInTheDocument();

      fireEvent.click(optimizeButton);
      expect(mockHandlers.onOptimize).toHaveBeenCalled();
    });

    it('should show ignore button when onIgnore is provided and not critical', () => {
      const largeContent = 'A'.repeat(8500); // Warning but not critical
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          onIgnore={mockHandlers.onIgnore}
        />
      );

      const ignoreButton = screen.getByText('Continue Anyway');
      expect(ignoreButton).toBeInTheDocument();

      fireEvent.click(ignoreButton);
      expect(mockHandlers.onIgnore).toHaveBeenCalled();
    });

    it('should not show ignore button when content is critical', () => {
      const criticalContent = 'A'.repeat(9600); // Critical level
      render(
        <ContentSizeWarning
          content={criticalContent}
          limits={defaultLimits}
          onIgnore={mockHandlers.onIgnore}
        />
      );

      expect(screen.queryByText('Continue Anyway')).not.toBeInTheDocument();
    });

    it('should show dismiss button when onDismiss is provided', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          onDismiss={mockHandlers.onDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss warning');
      expect(dismissButton).toBeInTheDocument();

      fireEvent.click(dismissButton);
      expect(mockHandlers.onDismiss).toHaveBeenCalled();
    });
  });

  describe('Suggestions', () => {
    it('should display optimization suggestions', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning content={largeContent} limits={defaultLimits} />
      );

      expect(screen.getByText('Suggestions:')).toBeInTheDocument();
      expect(
        screen.getByText('Remove unnecessary whitespace or comments')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Split content into smaller sections')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Focus on specific parts of the content')
      ).toBeInTheDocument();
    });

    it('should show additional suggestion for critical content', () => {
      const criticalContent = 'A'.repeat(9600);
      render(
        <ContentSizeWarning content={criticalContent} limits={defaultLimits} />
      );

      expect(
        screen.getByText(
          'Consider using external diff tools for very large files'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Details Toggle', () => {
    it('should show details by default when showDetails is true', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails
        />
      );

      expect(screen.getByText('Characters')).toBeInTheDocument();
    });

    it('should not show details when showDetails is false', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails={false}
        />
      );

      expect(screen.queryByText('Characters')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning content={largeContent} limits={defaultLimits} />
      );

      const warning = screen.getByTestId('content-size-warning');
      expect(warning).toHaveAttribute('role', 'alert');
      expect(warning).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper progress bar labels', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          showDetails
        />
      );

      const progressBar = screen.getByLabelText('Characters: 85.0%');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const largeContent = 'A'.repeat(8500);
      render(
        <ContentSizeWarning
          content={largeContent}
          limits={defaultLimits}
          className="custom-class"
        />
      );

      const warning = screen.getByTestId('content-size-warning');
      expect(warning).toHaveClass('custom-class');
    });
  });

  describe('Warning vs Critical Styling', () => {
    it('should use warning colors for warning level', () => {
      const warningContent = 'A'.repeat(8500); // 85% - warning level
      render(
        <ContentSizeWarning content={warningContent} limits={defaultLimits} />
      );

      const warning = screen.getByTestId('content-size-warning');
      expect(warning).toHaveClass('bg-orange-50', 'border-orange-200');
    });

    it('should use error colors for critical level', () => {
      const criticalContent = 'A'.repeat(9600); // 96% - critical level
      render(
        <ContentSizeWarning content={criticalContent} limits={defaultLimits} />
      );

      const warning = screen.getByTestId('content-size-warning');
      expect(warning).toHaveClass('bg-red-50', 'border-red-200');
    });
  });
});

describe('ContentSizeWarningCompact Component', () => {
  const defaultLimits: ContentLimits = {
    maxFileSize: 1024 * 1024,
    maxLines: 1000,
    maxCharacters: 10000,
    warningThreshold: 0.8,
  };

  it('should render compact version without details', () => {
    const largeContent = 'A'.repeat(8500);
    render(
      <ContentSizeWarningCompact
        content={largeContent}
        limits={defaultLimits}
      />
    );

    expect(screen.getByTestId('content-size-warning')).toBeInTheDocument();
    expect(screen.queryByText('Characters')).not.toBeInTheDocument();
  });

  it('should have compact styling', () => {
    const largeContent = 'A'.repeat(8500);
    render(
      <ContentSizeWarningCompact
        content={largeContent}
        limits={defaultLimits}
      />
    );

    const warning = screen.getByTestId('content-size-warning');
    expect(warning).toHaveClass('p-2');
  });
});

describe('useContentSizeValidation Hook', () => {
  const TestComponent: React.FC<{ content: string; limits: ContentLimits }> = ({
    content,
    limits,
  }) => {
    const validation = useContentSizeValidation(content, limits);

    return (
      <div>
        <div data-testid="is-valid">{validation.isValid.toString()}</div>
        <div data-testid="has-warning">{validation.hasWarning.toString()}</div>
        <div data-testid="size-bytes">{validation.metrics.sizeInBytes}</div>
        <div data-testid="line-count">{validation.metrics.lineCount}</div>
        <div data-testid="char-count">{validation.metrics.charCount}</div>
      </div>
    );
  };

  const defaultLimits: ContentLimits = {
    maxFileSize: 1024 * 1024,
    maxLines: 1000,
    maxCharacters: 10000,
    warningThreshold: 0.8,
  };

  it('should return valid for small content', () => {
    render(<TestComponent content="Small content" limits={defaultLimits} />);

    expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
    expect(screen.getByTestId('has-warning')).toHaveTextContent('false');
  });

  it('should return warning for large content', () => {
    const largeContent = 'A'.repeat(8500); // 85% of character limit
    render(<TestComponent content={largeContent} limits={defaultLimits} />);

    expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
    expect(screen.getByTestId('has-warning')).toHaveTextContent('true');
  });

  it('should return invalid for content exceeding limits', () => {
    const tooLargeContent = 'A'.repeat(15000); // Exceeds character limit
    render(<TestComponent content={tooLargeContent} limits={defaultLimits} />);

    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
    expect(screen.getByTestId('has-warning')).toHaveTextContent('true');
  });

  it('should calculate metrics correctly', () => {
    const content = 'Hello\nWorld\nTest';
    render(<TestComponent content={content} limits={defaultLimits} />);

    expect(screen.getByTestId('char-count')).toHaveTextContent('16');
    expect(screen.getByTestId('line-count')).toHaveTextContent('3');
    expect(screen.getByTestId('size-bytes')).toHaveTextContent('16');
  });

  it('should recalculate when content changes', () => {
    const { rerender } = render(
      <TestComponent content="Short" limits={defaultLimits} />
    );

    expect(screen.getByTestId('char-count')).toHaveTextContent('5');

    rerender(
      <TestComponent content="Much longer content" limits={defaultLimits} />
    );

    expect(screen.getByTestId('char-count')).toHaveTextContent('19');
  });

  it('should recalculate when limits change', () => {
    const strictLimits: ContentLimits = {
      ...defaultLimits,
      maxCharacters: 10,
      warningThreshold: 0.5,
    };

    const { rerender } = render(
      <TestComponent content="Hello World" limits={defaultLimits} />
    );

    expect(screen.getByTestId('has-warning')).toHaveTextContent('false');

    rerender(<TestComponent content="Hello World" limits={strictLimits} />);

    expect(screen.getByTestId('has-warning')).toHaveTextContent('true');
  });
});
