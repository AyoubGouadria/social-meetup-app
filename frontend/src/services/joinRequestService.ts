import api from './api';

export interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    bio: string;
    city: string;
    languages: string[];
  };
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

class JoinRequestService {
  async createJoinRequest(eventId: string, message?: string) {
    return await api.post('/join-requests', { eventId, message });
  }

  async getEventJoinRequests(eventId: string, status = 'pending') {
    return await api.get(`/join-requests/event/${eventId}?status=${status}`);
  }

  async getMyJoinRequests() {
    return await api.get('/join-requests/my');
  }

  async acceptJoinRequest(id: string) {
    return await api.put(`/join-requests/${id}/accept`);
  }

  async rejectJoinRequest(id: string) {
    return await api.put(`/join-requests/${id}/reject`);
  }

  async cancelJoinRequest(id: string) {
    return await api.delete(`/join-requests/${id}`);
  }
}

export default new JoinRequestService();
