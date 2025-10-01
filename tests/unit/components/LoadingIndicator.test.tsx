import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  LoadingIndicator,
  LoadingOverlay,
  DiffComputationLoader,
  FileProcessingLoader,
  ContentValidationLoader,
} from '../../../src/components/LoadingIndicator';

describe('LoadingIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<LoadingIndicator />);

      expect(
        screen.getByTestId('loading-indicator-general')
      ).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<LoadingIndicator />);

      const indicator = screen.getByTestId('loading-indicator-general');
      expect(indicator).toHaveAttribute('role', 'status');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(indicator).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should render custom message', () => {
      render(<LoadingIndicator message="Custom loading message" />);

      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });
  });

  describe('Loading Types', () => {
    it('should render spinner type by default', () => {
      render(<LoadingIndicator />);

      const spinner = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should render progress type with progress bar', () => {
      render(<LoadingIndicator type="progress" progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render skeleton type with animated placeholders', () => {
      render(<LoadingIndicator type="skeleton" />);

      const skeletonElements = screen
        .getByTestId('loading-indicator-general')
        .querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should render pulse type with bouncing dots', () => {
      render(<LoadingIndicator type="pulse" />);

      const pulseElements = screen
        .getByTestId('loading-indicator-general')
        .querySelectorAll('.animate-bounce');
      expect(pulseElements.length).toBe(3);
    });
  });

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      render(<LoadingIndicator size="small" />);

      const spinner = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should apply medium size classes by default', () => {
      render(<LoadingIndicator size="medium" />);

      const spinner = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('should apply large size classes', () => {
      render(<LoadingIndicator size="large" />);

      const spinner = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });
  });

  describe('Contexts', () => {
    it('should render diffComputation context correctly', () => {
      render(<LoadingIndicator context="diffComputation" />);

      expect(
        screen.getByTestId('loading-indicator-diffComputation')
      ).toBeInTheDocument();
      expect(screen.getByText('Computing differences...')).toBeInTheDocument();
    });

    it('should render fileProcessing context correctly', () => {
      render(<LoadingIndicator context="fileProcessing" />);

      expect(
        screen.getByTestId('loading-indicator-fileProcessing')
      ).toBeInTheDocument();
      expect(screen.getByText('Processing file...')).toBeInTheDocument();
    });

    it('should render contentValidation context correctly', () => {
      render(<LoadingIndicator context="contentValidation" />);

      expect(
        screen.getByTestId('loading-indicator-contentValidation')
      ).toBeInTheDocument();
      expect(screen.getByText('Validating content...')).toBeInTheDocument();
    });

    it('should render general context correctly', () => {
      render(<LoadingIndicator context="general" />);

      expect(
        screen.getByTestId('loading-indicator-general')
      ).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Progress Handling', () => {
    it('should handle progress values correctly', () => {
      render(<LoadingIndicator type="progress" progress={75} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '75%' });
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should clamp progress to 0-100 range', () => {
      const { rerender } = render(
        <LoadingIndicator type="progress" progress={-10} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '0%' });

      rerender(<LoadingIndicator type="progress" progress={150} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should display progress message when provided', () => {
      render(
        <LoadingIndicator
          type="progress"
          progress={60}
          message="Processing..."
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      render(<LoadingIndicator />);

      const icon = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      render(<LoadingIndicator showIcon={false} />);

      const icon = screen
        .getByTestId('loading-indicator-general')
        .querySelector('svg');
      expect(icon).not.toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Inline Display', () => {
    it('should use flex display by default', () => {
      render(<LoadingIndicator />);

      const indicator = screen.getByTestId('loading-indicator-general');
      expect(indicator).toHaveClass('flex');
    });

    it('should use inline-flex when inline is true', () => {
      render(<LoadingIndicator inline />);

      const indicator = screen.getByTestId('loading-indicator-general');
      expect(indicator).toHaveClass('inline-flex');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<LoadingIndicator className="custom-class" />);

      const indicator = screen.getByTestId('loading-indicator-general');
      expect(indicator).toHaveClass('custom-class');
    });
  });

  describe('Context-Specific Colors', () => {
    it('should apply correct colors for diffComputation context', () => {
      render(<LoadingIndicator context="diffComputation" />);

      const text = screen.getByText('Computing differences...');
      expect(text).toHaveClass('text-blue-600');
    });

    it('should apply correct colors for fileProcessing context', () => {
      render(<LoadingIndicator context="fileProcessing" />);

      const text = screen.getByText('Processing file...');
      expect(text).toHaveClass('text-green-600');
    });

    it('should apply correct colors for contentValidation context', () => {
      render(<LoadingIndicator context="contentValidation" />);

      const text = screen.getByText('Validating content...');
      expect(text).toHaveClass('text-yellow-600');
    });
  });
});

describe('LoadingOverlay Component', () => {
  it('should render when visible is true', () => {
    render(<LoadingOverlay visible />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    render(<LoadingOverlay visible={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should have proper modal attributes', () => {
    render(<LoadingOverlay visible />);

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
    expect(overlay).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render with backdrop by default', () => {
    render(<LoadingOverlay visible />);

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('bg-black/20');
  });

  it('should render without backdrop when disabled', () => {
    render(<LoadingOverlay visible backdrop={false} />);

    const overlay = screen.getByRole('dialog');
    expect(overlay).not.toHaveClass('bg-black/20');
  });

  it('should pass through loading indicator props', () => {
    render(
      <LoadingOverlay
        visible
        message="Overlay loading..."
        context="diffComputation"
      />
    );

    expect(screen.getByText('Overlay loading...')).toBeInTheDocument();
    expect(
      screen.getByTestId('loading-indicator-diffComputation')
    ).toBeInTheDocument();
  });

  it('should have proper z-index for overlay', () => {
    render(<LoadingOverlay visible />);

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('z-50');
  });
});

describe('Preset Loading Components', () => {
  it('should render DiffComputationLoader with correct context', () => {
    render(<DiffComputationLoader />);

    expect(
      screen.getByTestId('loading-indicator-diffComputation')
    ).toBeInTheDocument();
    expect(screen.getByText('Computing differences...')).toBeInTheDocument();
  });

  it('should render FileProcessingLoader with correct context', () => {
    render(<FileProcessingLoader />);

    expect(
      screen.getByTestId('loading-indicator-fileProcessing')
    ).toBeInTheDocument();
    expect(screen.getByText('Processing file...')).toBeInTheDocument();
  });

  it('should render ContentValidationLoader with correct context', () => {
    render(<ContentValidationLoader />);

    expect(
      screen.getByTestId('loading-indicator-contentValidation')
    ).toBeInTheDocument();
    expect(screen.getByText('Validating content...')).toBeInTheDocument();
  });

  it('should pass through props to preset components', () => {
    render(<DiffComputationLoader size="large" message="Custom message" />);

    expect(screen.getByText('Custom message')).toBeInTheDocument();
    const spinner = screen
      .getByTestId('loading-indicator-diffComputation')
      .querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });
});

describe('Loading Indicator Accessibility', () => {
  it('should provide proper screen reader announcements', () => {
    render(<LoadingIndicator message="Processing your request" />);

    const indicator = screen.getByTestId('loading-indicator-general');
    expect(indicator).toHaveAttribute('aria-label', 'Processing your request');
  });

  it('should use polite live region for non-critical loading', () => {
    render(<LoadingIndicator />);

    const indicator = screen.getByTestId('loading-indicator-general');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('should have proper progress bar accessibility', () => {
    render(<LoadingIndicator type="progress" progress={45} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading progress: 45%');
  });

  it('should hide decorative icons from screen readers', () => {
    render(<LoadingIndicator />);

    const icon = screen
      .getByTestId('loading-indicator-general')
      .querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Loading State Transitions', () => {
  it('should handle rapid state changes gracefully', async () => {
    const { rerender } = render(<LoadingIndicator type="spinner" />);

    expect(screen.getByTestId('loading-indicator-general')).toBeInTheDocument();

    rerender(<LoadingIndicator type="progress" progress={50} />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    rerender(<LoadingIndicator type="skeleton" />);

    await waitFor(() => {
      expect(
        screen
          .getByTestId('loading-indicator-general')
          .querySelector('.animate-pulse')
      ).toBeInTheDocument();
    });
  });

  it('should maintain accessibility during transitions', async () => {
    const { rerender } = render(<LoadingIndicator message="Initial loading" />);

    expect(screen.getByLabelText('Initial loading')).toBeInTheDocument();

    rerender(<LoadingIndicator message="Updated loading" />);

    await waitFor(() => {
      expect(screen.getByLabelText('Updated loading')).toBeInTheDocument();
    });
  });
});
