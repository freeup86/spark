import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment, Prisma, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        idea: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create notification for idea owner if commenter is not the owner
    if (comment.idea && comment.idea.userId !== comment.user.id) {
      await this.notificationsService.create({
        userId: comment.idea.userId,
        type: NotificationType.COMMENT,
        title: 'New comment on your idea',
        message: `${comment.user.name} commented on "${comment.idea.title}"`,
      });
    }

    return comment;
  }

  async findByIdeaId(ideaId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        ideaId,
        parentId: null, // Only top-level comments
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}