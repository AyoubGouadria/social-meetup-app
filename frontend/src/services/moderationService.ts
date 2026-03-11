/**
 * Moderation Service
 * Handles blocking, unblocking, and reporting users/events
 * Compliant with NetzDG (German Network Enforcement Act)
 */

import api from './api';

export interface BlockUserRequest {
  userId: string;
  reason: 'harassment' | 'spam' | 'inappropriate' | 'safety' | 'fake_profile' | 'other';
  notes?: string;
}

export interface ReportUserRequest {
  userId: string;
  reason: 'harassment' | 'spam' | 'inappropriate_content' | 'fake_profile' | 'hate_speech' | 'violence_threat' | 'illegal_activity' | 'underage' | 'scam' | 'other';
  description: string;
  screenshots?: File[];
}

export interface ReportEventRequest {
  eventId: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'hate_speech' | 'violence' | 'illegal_activity' | 'scam' | 'fake_event' | 'other';
  description: string;
}

export interface BlockedUser {
  id: string;
  blockedUserId: string;
  reason: string;
  notes?: string;
  createdAt: string;
  blockedUser: {
    id: string;
    name: string;
    photo?: string;
  };
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedEventId?: string;
  reason: string;
  description: string;
  screenshots?: string[];
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Block a user
 * Prevents the blocked user from seeing your profile, events, or contacting you
 */
export const blockUser = async (request: BlockUserRequest): Promise<void> => {
  await api.post('/api/moderation/block', request);
};

/**
 * Unblock a previously blocked user
 */
export const unblockUser = async (userId: string): Promise<void> => {
  await api.delete(`/api/moderation/block/${userId}`);
};

/**
 * Get list of users you have blocked
 */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  const response = await api.get('/api/moderation/blocked-users');
  return response.data;
};

/**
 * Report a user for violating community guidelines or laws
 * Reports are reviewed by moderators and may be forwarded to authorities if required by NetzDG
 */
export const reportUser = async (request: ReportUserRequest): Promise<Report> => {
  const formData = new FormData();
  formData.append('userId', request.userId);
  formData.append('reason', request.reason);
  formData.append('description', request.description);

  if (request.screenshots && request.screenshots.length > 0) {
    request.screenshots.forEach((file, index) => {
      formData.append(`screenshots`, file);
    });
  }

  const response = await api.post('/api/moderation/report-user', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Report an event for violating community guidelines
 */
export const reportEvent = async (request: ReportEventRequest): Promise<Report> => {
  const response = await api.post('/api/moderation/report-event', request);
  return response.data;
};

/**
 * Get list of reports you have submitted
 */
export const getMyReports = async (): Promise<Report[]> => {
  const response = await api.get('/api/moderation/my-reports');
  return response.data;
};

export default {
  blockUser,
  unblockUser,
  getBlockedUsers,
  reportUser,
  reportEvent,
  getMyReports,
};
