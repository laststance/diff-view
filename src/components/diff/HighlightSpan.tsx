import React, { useMemo } from 'react';

import { getThemeColors } from '../../config/diffThemes';
import { useDiffTheme, useTheme } from '../../store/appStore';

interface HighlightSpanProps {
  /** Text content to render */
  text: string;
  /** Type of highlight (added or removed) */
  type: 'added' | 'removed';
  /** Additional CSS classes */
  className?: string;
}

/**
 * HighlightSpan renders a character-level highlight with theme-based colors.
 *
 * This is the leaf component in the diff rendering tree. It applies background
 * colors to character ranges that differ between the old and new content.
 *
 * Colors are dynamically determined by the selected diff theme (Phase 3 Feature 3):
 * - GitHub, GitLab, Classic, or High Contrast
 * - Each theme has light and dark mode variants
 */
export const HighlightSpan: React.FC<HighlightSpanProps> = ({
  text,
  type,
  className = '',
}) => {
  // Get current theme settings (Phase 3 Feature 3)
  const diffTheme = useDiffTheme();
  const theme = useTheme();

  // Memoize dark mode detection to avoid unnecessary re-renders
  const isDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // system theme
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  const themeColors = getThemeColors(diffTheme, isDark);

  // Apply theme-based colors based on highlight type
  const highlightClass =
    type === 'added'
      ? themeColors.addHighlight
      : themeColors.deleteHighlight;

  return (
    <span className={`${highlightClass} ${className}`} data-highlight-type={type}>
      {text}
    </span>
  );
};
