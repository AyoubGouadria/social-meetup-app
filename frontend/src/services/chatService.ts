import api from './api';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export interface Message {
  _id: string;
  event: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  type: 'user' | 'system';
  isRead: string[];
  createdAt: string;
}

class ChatService {
  private socket: Socket | null = null;

  // Initialize WebSocket connection
  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      // Connected to chat server
    });

    this.socket.on('disconnect', () => {
      // Disconnected from chat server
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join event chat room
  joinEventRoom(eventId: string) {
    this.socket?.emit('join_event', { eventId });
  }

  // Leave event chat room
  leaveEventRoom(eventId: string) {
    this.socket?.emit('leave_event', { eventId });
  }

  // Send message via WebSocket
  sendMessage(eventId: string, text: string) {
    this.socket?.emit('send_message', { eventId, text });
  }

  // Listen for new messages
  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback);
  }

  // Listen for user joined
  onUserJoined(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.on('user_joined', callback);
  }

  // Listen for user left
  onUserLeft(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.on('user_left', callback);
  }

  // Listen for typing indicator
  onUserTyping(callback: (data: { userId: string; userName: string }) => void) {
    this.socket?.on('user_typing', callback);
  }

  // Send typing indicator
  startTyping(eventId: string) {
    this.socket?.emit('typing_start', { eventId });
  }

  stopTyping(eventId: string) {
    this.socket?.emit('typing_stop', { eventId });
  }

  // Listen for real-time notifications
  onNewNotification(callback: (notification: any) => void) {
    this.socket?.on('new_notification', callback);
  }

  // Listen for notifications read event
  onNotificationsRead(callback: (data: { unreadCount: number }) => void) {
    this.socket?.on('notifications_read', callback);
  }

  // Remove notification listener
  offNewNotification() {
    this.socket?.off('new_notification');
  }

  // Remove notifications read listener
  offNotificationsRead() {
    this.socket?.off('notifications_read');
  }

  // REST API - Get user conversations
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return response;
    } catch (error) {
      console.error('ChatService: Error fetching conversations', error);
      throw error;
    }
  }

  // REST API - Get messages
  async getMessages(eventId: string, page = 1, limit = 50) {
    try {
      const response = await api.get(`/messages/event/${eventId}?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('ChatService: Error fetching messages', error);
      throw error;
    }
  }

  // REST API - Mark as read
  async markAsRead(eventId: string) {
    return await api.put(`/messages/read/${eventId}`);
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export default new ChatService();
