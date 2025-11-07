import { Palette } from 'lucide-react';
import React from 'react';

import {
  availableDiffThemes,
  getThemeDisplayName,
  type DiffTheme,
} from '../config/diffThemes';
import { useAppStore } from '../store/appStore';

/**
 * ThemeSelector component for choosing diff color themes.
 *
 * Phase 3 Feature 3: Custom Color Themes
 *
 * Provides a dropdown selector for switching between different diff themes:
 * - GitHub: GitHub's web interface colors
 * - GitLab: GitLab's softer color palette
 * - Classic: Traditional vibrant green/red
 * - High Contrast: Enhanced visibility for accessibility
 *
 * Each theme has light and dark mode variants that automatically adapt
 * to the application's light/dark theme setting.
 */
export const ThemeSelector: React.FC = () => {
  const diffTheme = useAppStore((state) => state.diffTheme);
  const setDiffTheme = useAppStore((state) => state.setDiffTheme);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDiffTheme(event.target.value as DiffTheme);
  };

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Diff theme selector"
    >
      <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <select
        value={diffTheme}
        onChange={handleThemeChange}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500"
        aria-label="Select diff color theme"
        data-testid="theme-selector"
      >
        {availableDiffThemes.map((theme) => (
          <option key={theme} value={theme}>
            {getThemeDisplayName(theme)}
          </option>
        ))}
      </select>
    </div>
  );
};
