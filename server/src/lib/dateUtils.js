import { format, parseISO } from 'date-fns';

/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date to be used in datetime-local inputs
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted datetime string (YYYY-MM-DDTHH:MM)
 */
export const formatForDateTimeInput = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 
        ? `${interval} ${unit} ago` 
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

export default {
  formatDate,
  formatForDateTimeInput,
  formatRelativeTime
};
