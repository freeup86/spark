import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId1,
            receiverId: userId2,
          },
          {
            senderId: userId2,
            receiverId: userId1,
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findConversations(userId: string) {
    // Get all unique conversations for a user
    const conversations = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by conversation partner and get the latest message for each
    const conversationMap = new Map();
    
    conversations.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      // Count unread messages (messages sent to current user that are not read)
      if (message.receiverId === userId && !message.read) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async delete(id: string): Promise<Message> {
    return this.prisma.message.delete({
      where: { id },
    });
  }
}