import { format, formatDistance, parseISO, isAfter, isBefore, addDays } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Check if event is upcoming
 */
export const isUpcoming = (eventDate: string | Date): boolean => {
  const dateObj = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
  return isAfter(dateObj, new Date());
};

/**
 * Check if event is past
 */
export const isPast = (eventDate: string | Date): boolean => {
  const dateObj = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
  return isBefore(dateObj, new Date());
};

/**
 * Get days until event
 */
export const getDaysUntil = (eventDate: string | Date): number => {
  const dateObj = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
  const diff = dateObj.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Validate if date is in the future
 */
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Get formatted time (e.g., "14:30")
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

/**
 * Combine date and time strings into Date object
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  return new Date(`${dateStr}T${timeStr}`);
};
