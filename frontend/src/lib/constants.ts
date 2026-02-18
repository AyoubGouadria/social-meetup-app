// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
  TIMEOUT: 10000,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Meetly',
  DESCRIPTION: 'Social Connection Platform',
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'de', 'ar'],
} as const;

// Event Categories
export const EVENT_CATEGORIES = [
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'walk', label: 'Walk', icon: '🚶' },
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'explore', label: 'Explore', icon: '🗺️' },
  { value: 'other', label: 'Other', icon: '✨' },
] as const;

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MESSAGES_LIMIT: 50,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE_SETUP: '/profile-setup',
  PROFILE: '/profile',
  EVENT_DETAILS: '/event/:id',
  CREATE_EVENT: '/create-event',
  MY_EVENTS: '/my-events',
  JOINED_EVENTS: '/joined-events',
  JOIN_REQUESTS: '/join-requests/:eventId',
  CHAT: '/chat/:eventId',
  NOTIFICATIONS: '/notifications',
} as const;

// Validation Rules
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
  EVENT_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  EVENT_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
  JOIN_REQUEST_MESSAGE: {
    MAX_LENGTH: 200,
  },
  MAX_PARTICIPANTS: {
    MIN: 2,
    MAX: 50,
  },
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  FULL: 'MMM dd, yyyy HH:mm',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  JOIN_REQUEST: 'join_request',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_REJECTED: 'request_rejected',
  NEW_MESSAGE: 'new_message',
  EVENT_REMINDER: 'event_reminder',
  EVENT_CANCELLED: 'event_cancelled',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully',
  JOIN_REQUEST_SENT: 'Join request sent!',
  JOIN_REQUEST_ACCEPTED: 'Join request accepted!',
  JOIN_REQUEST_REJECTED: 'Join request rejected',
  MESSAGE_SENT: 'Message sent',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
} as const;
