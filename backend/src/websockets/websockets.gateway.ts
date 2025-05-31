import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, AuthenticatedSocket>();
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    
    // Remove from user sockets mapping
    if (client.userId) {
      const userSocketIds = this.userSockets.get(client.userId);
      if (userSocketIds) {
        userSocketIds.delete(client.id);
        if (userSocketIds.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    client.userId = data.userId;
    
    // Add to user sockets mapping
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);
    
    client.emit('authenticated', { success: true });
    console.log(`User ${data.userId} authenticated with socket ${client.id}`);
  }

  @SubscribeMessage('join-idea')
  handleJoinIdea(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ideaId: string },
  ) {
    client.join(`idea-${data.ideaId}`);
    client.emit('joined-idea', { ideaId: data.ideaId });
  }

  @SubscribeMessage('leave-idea')
  handleLeaveIdea(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ideaId: string },
  ) {
    client.leave(`idea-${data.ideaId}`);
    client.emit('left-idea', { ideaId: data.ideaId });
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation-${data.conversationId}`);
    client.emit('joined-conversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation-${data.conversationId}`);
    client.emit('left-conversation', { conversationId: data.conversationId });
  }

  // Send real-time comment to idea viewers
  sendCommentToIdea(ideaId: string, comment: any) {
    this.server.to(`idea-${ideaId}`).emit('comment-added', comment);
  }

  // Send real-time message to specific user
  sendMessageToUser(userId: string, message: any) {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
          socket.emit('new-message', message);
        }
      });
    }
  }

  // Send notification to user
  sendNotificationToUser(userId: string, notification: any) {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
          socket.emit('notification', notification);
        }
      });
    }
  }

  // Send idea update to idea viewers
  sendIdeaUpdate(ideaId: string, update: any) {
    this.server.to(`idea-${ideaId}`).emit('idea-updated', update);
  }
}