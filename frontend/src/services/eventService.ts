import api from './api';
import { User } from './authService';

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: 'coffee' | 'walk' | 'study' | 'gym' | 'explore' | 'other';
  date: string;
  time: string;
  location: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  maxParticipants: number;
  languages: string[];
  host: {
    _id: string;
    name: string;
    avatar: string;
    city: string;
    languages: string[];
  };
  participants: Array<{
    _id: string;
    name: string;
    avatar: string;
    city?: string;
    bio?: string;
    languages?: string[];
  }>;
  status: 'published' | 'cancelled' | 'completed';
  imageUrl?: string;
  currentParticipants: number;
  pendingRequestCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  maxParticipants: number;
  languages: string[];
  imageUrl?: string;
}

export interface EventFilters {
  category?: string;
  language?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

class EventService {
  async getEvents(filters: EventFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    return await api.get(`/events?${params.toString()}`);
  }

  async getEvent(id: string) {
    try {
      const response = await api.get(`/events/${id}`);
      return response;
    } catch (error) {
      console.error('EventService: Error fetching event', error);
      throw error;
    }
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventData>): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string) {
    return await api.delete(`/events/${id}`);
  }

  async getMyEvents() {
    return await api.get('/events/my/created');
  }

  async getJoinedEvents() {
    return await api.get('/events/my/joined');
  }

  async leaveEvent(id: string) {
    return await api.post(`/events/${id}/leave`);
  }
}

export default new EventService();
