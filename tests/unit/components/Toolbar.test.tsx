import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { Toolbar } from '../../../src/components/Toolbar';
import { useAppStore } from '../../../src/store/appStore';

// Mock the store
vi.mock('../../../src/store/appStore');

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('Toolbar Component', () => {
  const mockStore = {
    viewMode: 'split' as const,
    theme: 'light' as const,
    fontSize: 'medium' as const,
    leftContent: '',
    rightContent: '',
  };

  const mockActions = {
    setViewMode: vi.fn(),
    setTheme: vi.fn(),
    setFontSize: vi.fn(),
    clearContent: vi.fn(),
    swapContent: vi.fn(),
    replaceLeftWithRight: vi.fn(),
    replaceRightWithLeft: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear global reload mock
    if ((global as any).mockLocationReload) {
      (global as any).mockLocationReload.mockClear();
    }
    mockConfirm.mockReturnValue(true);

    (useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ ...mockStore, ...mockActions });
      }
      return { ...mockStore, ...mockActions };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render toolbar with all controls', () => {
      render(<Toolbar />);

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByLabelText('View mode selection')).toBeInTheDocument();
      expect(screen.getByLabelText('Content management')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<Toolbar />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Diff view controls');
    });
  });

  describe('View Mode Toggle', () => {
    it('should show split view as active by default', () => {
      render(<Toolbar />);

      const splitButton = screen.getByLabelText('Switch to split view mode');
      const unifiedButton = screen.getByLabelText(
        'Switch to unified view mode'
      );

      expect(splitButton).toHaveAttribute('aria-pressed', 'true');
      expect(unifiedButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should show unified view as active when selected', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            ...mockStore,
            ...mockActions,
            viewMode: 'unified',
          });
        }
        return { ...mockStore, ...mockActions, viewMode: 'unified' };
      });

      render(<Toolbar />);

      const splitButton = screen.getByLabelText('Switch to split view mode');
      const unifiedButton = screen.getByLabelText(
        'Switch to unified view mode'
      );

      expect(splitButton).toHaveAttribute('aria-pressed', 'false');
      expect(unifiedButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should call setViewMode when split button is clicked', () => {
      render(<Toolbar />);

      const splitButton = screen.getByLabelText('Switch to split view mode');
      fireEvent.click(splitButton);

      expect(mockActions.setViewMode).toHaveBeenCalledWith('split');
    });

    it('should call setViewMode when unified button is clicked', () => {
      render(<Toolbar />);

      const unifiedButton = screen.getByLabelText(
        'Switch to unified view mode'
      );
      fireEvent.click(unifiedButton);

      expect(mockActions.setViewMode).toHaveBeenCalledWith('unified');
    });
  });

  describe('Font Size Control', () => {
    it('should display current font size correctly', () => {
      render(<Toolbar />);

      const fontButton = screen.getByLabelText(/Current font size: medium/);
      expect(fontButton).toBeInTheDocument();
    });

    it('should cycle through font sizes when clicked', () => {
      render(<Toolbar />);

      const fontButton = screen.getByLabelText(/Current font size: medium/);
      fireEvent.click(fontButton);

      expect(mockActions.setFontSize).toHaveBeenCalledWith('large');
    });

    it('should show small font size icon when size is small', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ ...mockStore, ...mockActions, fontSize: 'small' });
        }
        return { ...mockStore, ...mockActions, fontSize: 'small' };
      });

      render(<Toolbar />);

      const fontButton = screen.getByLabelText(/Current font size: small/);
      expect(fontButton).toBeInTheDocument();
    });

    it('should show large font size icon when size is large', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ ...mockStore, ...mockActions, fontSize: 'large' });
        }
        return { ...mockStore, ...mockActions, fontSize: 'large' };
      });

      render(<Toolbar />);

      const fontButton = screen.getByLabelText(/Current font size: large/);
      expect(fontButton).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should display current theme correctly', () => {
      render(<Toolbar />);

      const themeButton = screen.getByLabelText(/Current theme: light/);
      expect(themeButton).toBeInTheDocument();
    });

    it('should cycle through themes when clicked', () => {
      render(<Toolbar />);

      const themeButton = screen.getByLabelText(/Current theme: light/);
      fireEvent.click(themeButton);

      expect(mockActions.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should show correct icon for dark theme', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ ...mockStore, ...mockActions, theme: 'dark' });
        }
        return { ...mockStore, ...mockActions, theme: 'dark' };
      });

      render(<Toolbar />);

      const themeButton = screen.getByLabelText(/Current theme: dark/);
      expect(themeButton).toBeInTheDocument();
    });

    it('should show correct icon for system theme', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ ...mockStore, ...mockActions, theme: 'system' });
        }
        return { ...mockStore, ...mockActions, theme: 'system' };
      });

      render(<Toolbar />);

      const themeButton = screen.getByLabelText(/Current theme: system/);
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe('Content Management Controls', () => {
    describe('Swap Content', () => {
      it('should be disabled when no content is present', () => {
        render(<Toolbar />);

        const swapButton = screen.getByLabelText('Swap left and right content');
        expect(swapButton).toBeDisabled();
      });

      it('should be enabled when content is present', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              leftContent: 'left content',
              rightContent: 'right content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            leftContent: 'left content',
            rightContent: 'right content',
          };
        });

        render(<Toolbar />);

        const swapButton = screen.getByLabelText('Swap left and right content');
        expect(swapButton).not.toBeDisabled();
      });

      it('should call swapContent when clicked', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              leftContent: 'left content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            leftContent: 'left content',
          };
        });

        render(<Toolbar />);

        const swapButton = screen.getByLabelText('Swap left and right content');
        fireEvent.click(swapButton);

        expect(mockActions.swapContent).toHaveBeenCalled();
      });
    });

    describe('Replace Left with Right', () => {
      it('should be disabled when no right content is present', () => {
        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace left content with right content'
        );
        expect(replaceButton).toBeDisabled();
      });

      it('should be enabled when right content is present', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              rightContent: 'right content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            rightContent: 'right content',
          };
        });

        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace left content with right content'
        );
        expect(replaceButton).not.toBeDisabled();
      });

      it('should call replaceLeftWithRight when clicked', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              rightContent: 'right content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            rightContent: 'right content',
          };
        });

        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace left content with right content'
        );
        fireEvent.click(replaceButton);

        expect(mockActions.replaceLeftWithRight).toHaveBeenCalled();
      });

      it('should show confirmation for large left content', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              leftContent: 'A'.repeat(100), // Large content
              rightContent: 'right content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            leftContent: 'A'.repeat(100),
            rightContent: 'right content',
          };
        });

        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace left content with right content'
        );
        fireEvent.click(replaceButton);

        expect(mockConfirm).toHaveBeenCalledWith(
          'Replace left content with right content? This action cannot be undone.'
        );
      });
    });

    describe('Replace Right with Left', () => {
      it('should be disabled when no left content is present', () => {
        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace right content with left content'
        );
        expect(replaceButton).toBeDisabled();
      });

      it('should be enabled when left content is present', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              leftContent: 'left content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            leftContent: 'left content',
          };
        });

        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace right content with left content'
        );
        expect(replaceButton).not.toBeDisabled();
      });

      it('should call replaceRightWithLeft when clicked', () => {
        (useAppStore as any).mockImplementation((selector: any) => {
          if (typeof selector === 'function') {
            return selector({
              ...mockStore,
              ...mockActions,
              leftContent: 'left content',
            });
          }
          return {
            ...mockStore,
            ...mockActions,
            leftContent: 'left content',
          };
        });

        render(<Toolbar />);

        const replaceButton = screen.getByLabelText(
          'Replace right content with left content'
        );
        fireEvent.click(replaceButton);

        expect(mockActions.replaceRightWithLeft).toHaveBeenCalled();
      });
    });
  });

  describe('Clear Content', () => {
    it('should be disabled when no content is present', () => {
      render(<Toolbar />);

      const clearButton = screen.getByLabelText(
        'Clear all content from both panes'
      );
      expect(clearButton).toBeDisabled();
    });

    it('should be enabled when content is present', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            ...mockStore,
            ...mockActions,
            leftContent: 'some content',
          });
        }
        return {
          ...mockStore,
          ...mockActions,
          leftContent: 'some content',
        };
      });

      render(<Toolbar />);

      const clearButton = screen.getByLabelText(
        'Clear all content from both panes'
      );
      expect(clearButton).not.toBeDisabled();
    });

    it('should call clearContent when clicked with small content', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            ...mockStore,
            ...mockActions,
            leftContent: 'small',
          });
        }
        return {
          ...mockStore,
          ...mockActions,
          leftContent: 'small',
        };
      });

      render(<Toolbar />);

      const clearButton = screen.getByLabelText(
        'Clear all content from both panes'
      );
      fireEvent.click(clearButton);

      expect(mockActions.clearContent).toHaveBeenCalled();
    });

    it('should show confirmation for large content', () => {
      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            ...mockStore,
            ...mockActions,
            leftContent: 'A'.repeat(100), // Large content
          });
        }
        return {
          ...mockStore,
          ...mockActions,
          leftContent: 'A'.repeat(100),
        };
      });

      render(<Toolbar />);

      const clearButton = screen.getByLabelText(
        'Clear all content from both panes'
      );
      fireEvent.click(clearButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all content? This action cannot be undone.'
      );
    });

    it('should not clear content if user cancels confirmation', () => {
      mockConfirm.mockReturnValue(false);

      (useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            ...mockStore,
            ...mockActions,
            leftContent: 'A'.repeat(100),
          });
        }
        return {
          ...mockStore,
          ...mockActions,
          leftContent: 'A'.repeat(100),
        };
      });

      render(<Toolbar />);

      const clearButton = screen.getByLabelText(
        'Clear all content from both panes'
      );
      fireEvent.click(clearButton);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockActions.clearContent).not.toHaveBeenCalled();
    });
  });

  describe('Reset Application', () => {
    // Note: Skipped because window.location.reload cannot be mocked in jsdom
    // Test this functionality with E2E tests using Playwright
    it.skip('should reload the page when reset button is clicked', () => {
      render(<Toolbar />);

      const resetButton = screen.getByLabelText(
        'Reset application to initial state'
      );
      fireEvent.click(resetButton);

      // The global mock should have been called
      expect((global as any).mockLocationReload).toHaveBeenCalled();
    });
  });

  describe('Settings Button', () => {
    it('should be disabled (coming soon feature)', () => {
      render(<Toolbar />);

      const settingsButton = screen.getByLabelText(
        'Open settings (feature coming soon)'
      );
      expect(settingsButton).toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should display keyboard shortcut hints in titles', () => {
      render(<Toolbar />);

      expect(
        screen.getByTitle('Split View (Ctrl+Shift+V)')
      ).toBeInTheDocument();
      expect(
        screen.getByTitle('Unified View (Ctrl+Shift+V)')
      ).toBeInTheDocument();
      expect(
        screen.getByTitle(/Font Size: medium \(Ctrl\+Plus\/Minus\)/)
      ).toBeInTheDocument();
      expect(screen.getByTitle(/Theme: light \(Ctrl\+T\)/)).toBeInTheDocument();
      expect(
        screen.getByTitle('Swap Left and Right Content (Ctrl+Shift+S)')
      ).toBeInTheDocument();
      expect(
        screen.getByTitle('Clear All Content (Ctrl+Shift+C)')
      ).toBeInTheDocument();
    });
  });

  describe('Separators', () => {
    it('should have proper separator elements', () => {
      const { container } = render(<Toolbar />);

      // Query separators using class selector since role="separator" with aria-hidden="true"
      // may not be accessible via getAllByRole in some testing library versions
      const separators = container.querySelectorAll('[role="separator"]');
      expect(separators.length).toBe(3); // There are exactly 3 separators in the toolbar

      separators.forEach((separator) => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
