// Re-export all services for easy import
export { default as authService } from './authService';
export { default as eventService } from './eventService';
export { default as joinRequestService } from './joinRequestService';
export { default as chatService } from './chatService';
export { default as notificationService } from './notificationService';
export { default as userService } from './userService';
export { default as uploadService } from './uploadService';
export { default as testimonialService } from './testimonialService';
export { default as api } from './api';

// Re-export types
export type { RegisterData, LoginData, User, AuthResponse } from './authService';
export type { Event, CreateEventData, EventFilters } from './eventService';
export type { JoinRequest } from './joinRequestService';
export type { Message } from './chatService';
export type { Notification } from './notificationService';
export type { Testimonial } from './testimonialService';
