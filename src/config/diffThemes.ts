/**
 * Diff color theme configurations for Phase 3 Feature 3.
 *
 * Each theme defines colors for add/delete/modify line backgrounds
 * and character-level highlight colors, with variants for both
 * light and dark modes.
 *
 * Themes are inspired by popular diff viewing tools:
 * - GitHub: GitHub's diff color scheme
 * - GitLab: GitLab's diff color scheme
 * - Classic: Traditional diff colors (green/red)
 * - High Contrast: Enhanced visibility for accessibility
 */

export type DiffTheme = 'github' | 'gitlab' | 'classic' | 'high-contrast';

export interface DiffThemeColors {
  light: {
    // Line backgrounds
    addBg: string;
    deleteBg: string;
    modifyBg: string;
    contextBg: string;
    // Character-level highlights
    addHighlight: string;
    deleteHighlight: string;
  };
  dark: {
    // Line backgrounds
    addBg: string;
    deleteBg: string;
    modifyBg: string;
    contextBg: string;
    // Character-level highlights
    addHighlight: string;
    deleteHighlight: string;
  };
}

export const diffThemes: Record<DiffTheme, DiffThemeColors> = {
  /**
   * GitHub Theme
   * Matches GitHub's web interface diff colors
   */
  github: {
    light: {
      addBg: 'bg-green-50',
      deleteBg: 'bg-red-50',
      modifyBg: 'bg-yellow-50',
      contextBg: 'bg-white',
      addHighlight: 'bg-green-200',
      deleteHighlight: 'bg-red-200',
    },
    dark: {
      addBg: 'bg-green-950',
      deleteBg: 'bg-red-950',
      modifyBg: 'bg-yellow-950',
      contextBg: 'bg-gray-900',
      addHighlight: 'bg-green-800',
      deleteHighlight: 'bg-red-800',
    },
  },

  /**
   * GitLab Theme
   * Inspired by GitLab's diff interface
   * Slightly softer colors than GitHub
   */
  gitlab: {
    light: {
      addBg: 'bg-emerald-50',
      deleteBg: 'bg-rose-50',
      modifyBg: 'bg-amber-50',
      contextBg: 'bg-white',
      addHighlight: 'bg-emerald-200',
      deleteHighlight: 'bg-rose-200',
    },
    dark: {
      addBg: 'bg-emerald-950',
      deleteBg: 'bg-rose-950',
      modifyBg: 'bg-amber-950',
      contextBg: 'bg-gray-900',
      addHighlight: 'bg-emerald-800',
      deleteHighlight: 'bg-rose-800',
    },
  },

  /**
   * Classic Theme
   * Traditional diff colors with vibrant green/red
   * More saturated than modern themes
   */
  classic: {
    light: {
      addBg: 'bg-lime-50',
      deleteBg: 'bg-red-100',
      modifyBg: 'bg-orange-50',
      contextBg: 'bg-white',
      addHighlight: 'bg-lime-300',
      deleteHighlight: 'bg-red-300',
    },
    dark: {
      addBg: 'bg-lime-950',
      deleteBg: 'bg-red-900',
      modifyBg: 'bg-orange-950',
      contextBg: 'bg-gray-900',
      addHighlight: 'bg-lime-700',
      deleteHighlight: 'bg-red-700',
    },
  },

  /**
   * High Contrast Theme
   * Enhanced visibility for accessibility
   * Higher saturation and contrast ratios
   */
  'high-contrast': {
    light: {
      addBg: 'bg-green-100',
      deleteBg: 'bg-red-100',
      modifyBg: 'bg-yellow-100',
      contextBg: 'bg-white',
      addHighlight: 'bg-green-400',
      deleteHighlight: 'bg-red-400',
    },
    dark: {
      addBg: 'bg-green-900',
      deleteBg: 'bg-red-900',
      modifyBg: 'bg-yellow-900',
      contextBg: 'bg-gray-900',
      addHighlight: 'bg-green-600',
      deleteHighlight: 'bg-red-600',
    },
  },
};

/**
 * Get theme colors for the current theme and mode.
 * @param theme - The selected diff theme
 * @param isDark - Whether dark mode is active
 * @returns Theme colors for the current mode
 */
export function getThemeColors(
  theme: DiffTheme,
  isDark: boolean
): DiffThemeColors['light'] | DiffThemeColors['dark'] {
  return isDark ? diffThemes[theme].dark : diffThemes[theme].light;
}

/**
 * Get theme display name for UI.
 * @param theme - The diff theme identifier
 * @returns User-friendly display name
 */
export function getThemeDisplayName(theme: DiffTheme): string {
  const names: Record<DiffTheme, string> = {
    github: 'GitHub',
    gitlab: 'GitLab',
    classic: 'Classic',
    'high-contrast': 'High Contrast',
  };
  return names[theme];
}

/**
 * All available diff themes for selection.
 */
export const availableDiffThemes: DiffTheme[] = [
  'github',
  'gitlab',
  'classic',
  'high-contrast',
];
