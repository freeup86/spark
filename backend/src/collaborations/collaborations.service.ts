import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class CollaborationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createCollaborationDto: CreateCollaborationDto) {
    const collaboration = await this.prisma.collaboration.create({
      data: {
        ...createCollaborationDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        idea: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create notification for idea owner
    if (collaboration.idea.user.id !== userId) {
      await this.notificationsService.create({
        userId: collaboration.idea.user.id,
        type: NotificationType.COLLABORATION_REQUEST,
        title: 'New collaboration request',
        message: `${collaboration.user.name} wants to collaborate on "${collaboration.idea.title}"`,
      });
    }

    return collaboration;
  }

  async findAll(userId: string) {
    return this.prisma.collaboration.findMany({
      where: { userId },
      include: {
        user: true,
        idea: true,
      },
    });
  }

  async findByIdea(ideaId: string) {
    return this.prisma.collaboration.findMany({
      where: { ideaId },
      include: {
        user: true,
      },
    });
  }
}
