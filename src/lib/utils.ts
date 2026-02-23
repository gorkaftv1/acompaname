/**
 * Utility Functions
 * Helper functions for common operations
 */

/**
 * Combines multiple class names into a single string
 * Filters out falsy values for conditional classes
 * 
 * @example
 * cn('base', isActive && 'active', 'another')
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date to a human-readable string
 * Uses date-fns under the hood
 */
export { format, formatDistance, formatRelative } from 'date-fns';
