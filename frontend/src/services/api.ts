const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_PREFIX = process.env.NODE_ENV === 'production' ? '/api' : '';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'API request failed');
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If no content-type or not JSON, check if it's an empty response
      const text = await response.text();
      if (!text) {
        // Return empty object for 204 No Content responses
        return {} as T;
      }
      throw new Error('Response is not JSON');
    }

    const text = await response.text();
    if (!text) {
      // Return empty object for empty responses
      return {} as T;
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  // Ideas API
  async createIdea(data: { title: string; description: string; category: string; visibility?: string }) {
    return this.request('/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIdeas(skip = 0, take = 10, category?: string) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      take: take.toString(),
      ...(category && { category }),
    });
    return this.request(`/ideas?${params}`);
  }

  async getIdea(id: string) {
    return this.request(`/ideas/${id}`);
  }

  async getUserIdeas(userId: string) {
    return this.request(`/ideas/user/${userId}`);
  }

  async voteIdea(ideaId: string, type: 'UPVOTE' | 'DOWNVOTE') {
    return this.request(`/ideas/${ideaId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async removeVote(ideaId: string) {
    return this.request(`/ideas/${ideaId}/vote`, {
      method: 'DELETE',
    });
  }

  // Comments API
  async createComment(data: { content: string; ideaId: string; parentId?: string }) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComments(ideaId: string) {
    return this.request(`/comments/idea/${ideaId}`);
  }

  // Messages API
  async sendMessage(data: { content: string; receiverId: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getConversation(userId: string) {
    return this.request(`/messages/conversation/${userId}`);
  }

  async markMessagesAsRead(senderId: string) {
    return this.request(`/messages/read/${senderId}`, {
      method: 'PATCH',
    });
  }

  // Users API
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  // Collaborations API
  async createCollaboration(data: { 
    ideaId: string; 
    skillArea: string; 
    message: string; 
    commitment: string;
    status?: string;
  }) {
    return this.request('/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications API
  async getNotifications(take = 10, skip = 0) {
    const params = new URLSearchParams({
      take: take.toString(),
      skip: skip.toString(),
    });
    return this.request(`/notifications?${params}`);
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }
}

export const apiService = new ApiService();