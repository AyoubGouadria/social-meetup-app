import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar: string;
  };
  type: 'join_request' | 'request_accepted' | 'request_rejected' | 'new_message' | 
        'event_reminder' | 'event_cancelled' | 'participant_joined' | 'participant_left';
  title: string;
  message: string;
  event?: {
    _id: string;
    title: string;
    date: string;
    location: string;
  };
  joinRequest?: string;
  isRead: boolean;
  actionable: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return await api.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  async markAsRead(id: string) {
    return await api.put(`/notifications/${id}/read`);
  }

  async markAllAsRead() {
    return await api.put('/notifications/read-all');
  }

  async deleteNotification(id: string) {
    return await api.delete(`/notifications/${id}`);
  }
}

export default new NotificationService();
