"use client";

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://spark-backend-l0dm.onrender.com', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      
      // Authenticate with user ID if available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        this.authenticate(user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  authenticate(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { userId });
    }
  }

  // Idea-related events
  joinIdea(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-idea', { ideaId });
    }
  }

  leaveIdea(ideaId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-idea', { ideaId });
    }
  }

  onCommentAdded(callback: (comment: any) => void) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  offCommentAdded() {
    if (this.socket) {
      this.socket.off('comment-added');
    }
  }

  onIdeaUpdated(callback: (update: any) => void) {
    if (this.socket) {
      this.socket.on('idea-updated', callback);
    }
  }

  offIdeaUpdated() {
    if (this.socket) {
      this.socket.off('idea-updated');
    }
  }

  // Message-related events
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', { conversationId });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

export const socketService = new SocketService();