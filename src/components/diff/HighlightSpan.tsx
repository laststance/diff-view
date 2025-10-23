import React from 'react';

interface HighlightSpanProps {
  /** Text content to render */
  text: string;
  /** Type of highlight (added or removed) */
  type: 'added' | 'removed';
  /** Additional CSS classes */
  className?: string;
}

/**
 * HighlightSpan renders a character-level highlight with GitHub-style colors.
 *
 * This is the leaf component in the diff rendering tree. It applies background
 * colors to character ranges that differ between the old and new content.
 *
 * Colors match GitHub's diff view:
 * - Added: Darker green (#22863a) on light green background
 * - Removed: Darker red (#f85149) on light pink background
 */
export const HighlightSpan: React.FC<HighlightSpanProps> = ({
  text,
  type,
  className = '',
}) => {
  // Apply GitHub-style colors based on highlight type
  const highlightClass =
    type === 'added'
      ? 'bg-green-200 dark:bg-green-900' // Darker green for added text
      : 'bg-red-200 dark:bg-red-900'; // Darker red for removed text

  return (
    <span className={`${highlightClass} ${className}`} data-highlight-type={type}>
      {text}
    </span>
  );
};
