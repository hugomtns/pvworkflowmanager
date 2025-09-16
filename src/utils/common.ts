/**
 * Common utility functions for PV Workflow Manager
 * Consolidated functions to reduce code duplication across components
 */

/**
 * Date formatting utilities
 */

export interface DateFormatOptions {
  /** Fallback value when date is null/undefined. Default: '' */
  fallback?: string;
  /** Locale for date formatting. Default: user's locale */
  locale?: string;
  /** Date formatting options */
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Format a date for display with consistent handling across the application
 * Handles Date objects, ISO strings, and undefined/null values
 */
export const formatDate = (
  date: Date | string | undefined | null,
  config: DateFormatOptions = {}
): string => {
  const { fallback = '', locale, options } = config;

  if (!date) return fallback;

  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;

    // Check for invalid dates
    if (isNaN(dateObject.getTime())) {
      return fallback;
    }

    return dateObject.toLocaleDateString(locale, options);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Format date with time for detailed display
 */
export const formatDateTime = (
  date: Date | string | undefined | null,
  config: DateFormatOptions = {}
): string => {
  return formatDate(date, {
    ...config,
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...config.options
    }
  });
};

/**
 * Format date for form inputs (YYYY-MM-DD format)
 */
export const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return '';

  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    return dateObject.toISOString().substring(0, 10);
  } catch (error) {
    console.warn('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (
  date: Date | string | undefined | null,
  baseDate: Date = new Date()
): string => {
  if (!date) return '';

  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    const diffMs = dateObject.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (Math.abs(diffDays) >= 1) {
      return diffDays > 0 ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffHours) >= 1) {
      return diffHours > 0 ? `in ${diffHours} hour${diffHours > 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffMinutes) >= 1) {
      return diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return '';
  }
};

/**
 * String utilities
 */

/**
 * Truncate text to a specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert text to title case
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Generate a URL-friendly slug from text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[-\s]+/g, '-'); // Replace spaces and multiple hyphens with single hyphen
};

/**
 * Array and object utilities
 */

/**
 * Remove duplicates from an array by a key function
 */
export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Group array items by a key function
 */
export const groupBy = <T>(array: T[], keyFn: (item: T) => string | number): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = String(keyFn(item));
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by multiple criteria
 */
export const sortBy = <T>(
  array: T[],
  ...sortFns: Array<(item: T) => any>
): T[] => {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
};

/**
 * Validation utilities
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function execution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};