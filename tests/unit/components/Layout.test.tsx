import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { Layout } from '../../../src/components/Layout';
import { useAppStore } from '../../../src/store/appStore';

// Mock the store
vi.mock('../../../src/store/appStore');

// Mock the Toolbar component
vi.mock('../../../src/components/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

describe('Layout Component', () => {
  const mockStore = {
    currentError: null,
    loadingStates: {
      diffComputation: false,
      contentValidation: false,
      fileProcessing: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
  });

  describe('Basic Rendering', () => {
    it('should render layout with children', () => {
      render(
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render header with branding', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByText('Diff View')).toBeInTheDocument();
      expect(
        screen.getByText('Compare text with GitHub-style visualization')
      ).toBeInTheDocument();
    });

    it('should render toolbar', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    it('should render footer with status', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByText('Ready to compare')).toBeInTheDocument();
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper landmark roles', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have skip to main content link', () => {
      render(<Layout>Content</Layout>);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have proper ARIA labels', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByLabelText('Application header')).toBeInTheDocument();
      expect(screen.getByLabelText('Main toolbar')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Text comparison interface')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Application status')).toBeInTheDocument();
    });

    it('should have proper logo accessibility', () => {
      render(<Layout>Content</Layout>);

      const logoContainer = screen.getByLabelText('Diff View application logo');
      expect(logoContainer).toBeInTheDocument();

      const logoIcon = logoContainer.querySelector('svg');
      expect(logoIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Diff Statistics', () => {
    it('should display diff statistics when provided', () => {
      const diffStats = {
        additions: 5,
        deletions: 3,
        changes: 2,
      };

      render(<Layout diffStats={diffStats}>Content</Layout>);

      expect(screen.getByLabelText('5 additions')).toBeInTheDocument();
      expect(screen.getByLabelText('3 deletions')).toBeInTheDocument();
      expect(screen.getByLabelText('2 changes')).toBeInTheDocument();
      expect(screen.getByText('+5 additions')).toBeInTheDocument();
      expect(screen.getByText('-3 deletions')).toBeInTheDocument();
      expect(screen.getByText('2 changes')).toBeInTheDocument();
    });

    it('should show ready state when no diff stats provided', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByText('Ready to compare')).toBeInTheDocument();
    });

    it('should have proper status region for diff stats', () => {
      const diffStats = {
        additions: 1,
        deletions: 1,
        changes: 1,
      };

      render(<Layout diffStats={diffStats}>Content</Layout>);

      const statusRegion = screen.getByLabelText('Diff statistics');
      expect(statusRegion).toHaveAttribute('role', 'status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Display', () => {
    it('should display error in status bar when present', () => {
      const mockError = {
        type: 'diff-computation' as const,
        message: 'Test error message',
        details: 'Error details',
        timestamp: Date.now(),
        recoverable: true,
      };

      (useAppStore as any).mockImplementation((selector: any) => {
        const storeWithError = {
          ...mockStore,
          currentError: mockError,
        };
        if (typeof selector === 'function') {
          return selector(storeWithError);
        }
        return storeWithError;
      });

      render(<Layout>Content</Layout>);

      expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
    });

    it('should not display error text when no error present', () => {
      render(<Layout>Content</Layout>);

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should not show diff stats when loading', () => {
      const diffStats = {
        additions: 5,
        deletions: 3,
        changes: 2,
      };

      (useAppStore as any).mockReturnValue({
        ...mockStore,
        loadingStates: {
          ...mockStore.loadingStates,
          diffComputation: true,
        },
      });

      render(<Layout diffStats={diffStats}>Content</Layout>);

      expect(screen.queryByText('+5 additions')).not.toBeInTheDocument();
      expect(screen.queryByText('Ready to compare')).not.toBeInTheDocument();
    });

    it('should show diff stats when not loading', () => {
      const diffStats = {
        additions: 5,
        deletions: 3,
        changes: 2,
      };

      render(<Layout diffStats={diffStats}>Content</Layout>);

      expect(screen.getByText('+5 additions')).toBeInTheDocument();
    });

    it('should show ready state when not loading and no stats', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByText('Ready to compare')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper responsive classes', () => {
      render(<Layout>Content</Layout>);

      const container = screen.getByText('Diff View').closest('.min-h-screen');
      expect(container).toHaveClass(
        'min-h-screen',
        'bg-gray-50',
        'dark:bg-gray-900',
        'flex',
        'flex-col'
      );
    });

    it('should have proper header styling', () => {
      render(<Layout>Content</Layout>);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'border-b',
        'border-gray-200',
        'dark:border-gray-700',
        'shadow-sm'
      );
    });

    it('should have proper main content styling', () => {
      render(<Layout>Content</Layout>);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have proper footer styling', () => {
      render(<Layout>Content</Layout>);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'border-t',
        'border-gray-200',
        'dark:border-gray-700'
      );
    });
  });

  describe('Content Layout', () => {
    it('should render children in main content area', () => {
      render(
        <Layout>
          <div data-testid="main-content">Main Content</div>
        </Layout>
      );

      const mainElement = screen.getByRole('main');
      const content = screen.getByTestId('main-content');

      expect(mainElement).toContainElement(content);
    });

    it('should apply proper padding to content area', () => {
      render(<Layout>Content</Layout>);

      const contentWrapper = screen.getByRole('main').querySelector('.p-4');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Header Layout', () => {
    it('should have proper header structure', () => {
      render(<Layout>Content</Layout>);

      const header = screen.getByRole('banner');
      const headerContent = header.querySelector('.px-4.py-3');
      expect(headerContent).toBeInTheDocument();

      const flexContainer = headerContent?.querySelector(
        '.flex.items-center.justify-between'
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it('should position branding and toolbar correctly', () => {
      render(<Layout>Content</Layout>);

      const brandingContainer = screen.getByLabelText(
        'Diff View application logo'
      );
      const toolbarContainer = screen.getByLabelText('Main toolbar');

      expect(brandingContainer).toBeInTheDocument();
      expect(toolbarContainer).toBeInTheDocument();
    });
  });

  describe('Footer Layout', () => {
    it('should have proper footer structure', () => {
      render(<Layout>Content</Layout>);

      const footer = screen.getByRole('contentinfo');
      const footerContent = footer.querySelector(
        '.flex.items-center.justify-between'
      );
      expect(footerContent).toBeInTheDocument();
    });

    it('should position status and mode info correctly', () => {
      render(<Layout>Content</Layout>);

      expect(screen.getByText('Ready to compare')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Application mode: Offline')
      ).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      render(<Layout>Content</Layout>);

      const container = screen.getByText('Diff View').closest('.min-h-screen');
      expect(container).toHaveClass('dark:bg-gray-900');

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Skip Link Functionality', () => {
    it('should have proper skip link styling and behavior', () => {
      render(<Layout>Content</Layout>);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass(
        'absolute',
        '-top-40',
        'left-6',
        'bg-blue-600',
        'text-white',
        'px-4',
        'py-2',
        'rounded-md',
        'z-50',
        'transition-all',
        'focus:top-6'
      );
    });

    it('should have proper focus management for skip link', () => {
      render(<Layout>Content</Layout>);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      );
    });
  });
});
