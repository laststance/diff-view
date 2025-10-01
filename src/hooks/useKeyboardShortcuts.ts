import { useEffect, useCallback, useMemo } from 'react';

import { useAppStore } from '../store/appStore';

export interface KeyboardShortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts throughout the application
 * Provides centralized keyboard shortcut handling with proper platform detection
 */
export const useKeyboardShortcuts = () => {
  const store = useAppStore();

  // Detect if we're on macOS for proper modifier key handling
  const isMac = useCallback(() => {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }, []);

  // Helper to check if the correct modifier key is pressed
  const isModifierPressed = useCallback(
    (event: KeyboardEvent, ctrlOrCmd: boolean) => {
      return ctrlOrCmd ? (isMac() ? event.metaKey : event.ctrlKey) : false;
    },
    [isMac]
  );

  // Focus management utilities
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }, []);

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // Content management shortcuts
      {
        key: 'c',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          const hasContent =
            store.leftContent.length > 50 || store.rightContent.length > 50;
          if (hasContent) {
            const confirmed = window.confirm(
              'Are you sure you want to clear all content? This action cannot be undone.'
            );
            if (confirmed) {
              store.clearContent();
            }
          } else {
            store.clearContent();
          }
        },
        description: 'Clear all content',
        preventDefault: true,
      },
      {
        key: 's',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          if (store.leftContent || store.rightContent) {
            store.swapContent();
          }
        },
        description: 'Swap left and right content',
        preventDefault: true,
      },
      {
        key: '1',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          if (store.rightContent) {
            const confirmed =
              store.leftContent.length > 50
                ? window.confirm(
                    'Replace left content with right content? This action cannot be undone.'
                  )
                : true;
            if (confirmed) {
              store.replaceLeftWithRight();
            }
          }
        },
        description: 'Replace left with right content',
        preventDefault: true,
      },
      {
        key: '2',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          if (store.leftContent) {
            const confirmed =
              store.rightContent.length > 50
                ? window.confirm(
                    'Replace right content with left content? This action cannot be undone.'
                  )
                : true;
            if (confirmed) {
              store.replaceRightWithLeft();
            }
          }
        },
        description: 'Replace right with left content',
        preventDefault: true,
      },

      // View mode shortcuts
      {
        key: 'v',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          store.setViewMode(store.viewMode === 'split' ? 'unified' : 'split');
        },
        description: 'Toggle view mode (split/unified)',
        preventDefault: true,
      },

      // Theme and UI shortcuts
      {
        key: 't',
        ctrlOrCmd: true,
        action: () => {
          const themes: Array<'light' | 'dark' | 'system'> = [
            'light',
            'dark',
            'system',
          ];
          const currentIndex = themes.indexOf(store.theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          store.setTheme(themes[nextIndex]);
        },
        description: 'Cycle theme (light/dark/system)',
        preventDefault: true,
      },

      // Font size shortcuts
      {
        key: '=',
        ctrlOrCmd: true,
        action: () => {
          const sizes: Array<'small' | 'medium' | 'large'> = [
            'small',
            'medium',
            'large',
          ];
          const currentIndex = sizes.indexOf(store.fontSize);
          if (currentIndex < sizes.length - 1) {
            store.setFontSize(sizes[currentIndex + 1]);
          }
        },
        description: 'Increase font size',
        preventDefault: true,
      },
      {
        key: '-',
        ctrlOrCmd: true,
        action: () => {
          const sizes: Array<'small' | 'medium' | 'large'> = [
            'small',
            'medium',
            'large',
          ];
          const currentIndex = sizes.indexOf(store.fontSize);
          if (currentIndex > 0) {
            store.setFontSize(sizes[currentIndex - 1]);
          }
        },
        description: 'Decrease font size',
        preventDefault: true,
      },

      // Navigation shortcuts
      {
        key: '1',
        ctrlOrCmd: true,
        action: () => {
          focusElement('[data-testid="textarea-left"]');
        },
        description: 'Focus left text pane',
        preventDefault: true,
      },
      {
        key: '2',
        ctrlOrCmd: true,
        action: () => {
          focusElement('[data-testid="textarea-right"]');
        },
        description: 'Focus right text pane',
        preventDefault: true,
      },

      // Accessibility shortcuts
      {
        key: 'h',
        ctrlOrCmd: true,
        shift: true,
        action: () => {
          // Show keyboard shortcuts help (could be implemented as a modal)
          const shortcuts = [
            'Ctrl+Shift+C: Clear all content',
            'Ctrl+Shift+S: Swap content',
            'Ctrl+Shift+V: Toggle view mode',
            'Ctrl+T: Cycle theme',
            'Ctrl+1: Focus left pane',
            'Ctrl+2: Focus right pane',
            'Ctrl+Plus: Increase font size',
            'Ctrl+Minus: Decrease font size',
          ];
          alert('Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
        },
        description: 'Show keyboard shortcuts help',
        preventDefault: true,
      },
    ],
    [store, focusElement]
  );

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if user is typing in an input field (except for global shortcuts)
      const target = event.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);

      // Allow certain global shortcuts even in input fields
      const globalShortcuts = ['t', 'h', 'c', 's', 'v', '1', '2']; // theme toggle, help, and app shortcuts
      const isGlobalShortcut = globalShortcuts.includes(
        event.key.toLowerCase()
      );
      const hasModifier = event.ctrlKey || event.metaKey || event.shiftKey;

      if (isInputField && !isGlobalShortcut && !hasModifier) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlOrCmd
          ? isModifierPressed(event, true)
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    },
    [shortcuts, isModifierPressed]
  );

  // Set up keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return shortcuts for documentation/help purposes
  return {
    shortcuts,
    isMac: isMac(),
  };
};
