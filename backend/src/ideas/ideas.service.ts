import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Idea, Prisma, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class IdeasService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Prisma.IdeaCreateInput): Promise<Idea> {
    return this.prisma.idea.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            votes: true,
            collaborations: true,
          },
        },
      },
    });
  }

  async findAll(skip = 0, take = 10, category?: string): Promise<Idea[]> {
    const where: Prisma.IdeaWhereInput = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (category && category !== 'All Categories') {
      where.category = category;
    }

    return this.prisma.idea.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            votes: true,
            collaborations: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Idea | null> {
    return this.prisma.idea.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
        collaborations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        comments: {
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
          },
        },
        votes: true,
        _count: {
          select: {
            comments: true,
            votes: true,
            collaborations: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Idea[]> {
    return this.prisma.idea.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            votes: true,
            collaborations: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            votes: true,
            collaborations: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Idea> {
    return this.prisma.idea.delete({
      where: { id },
    });
  }

  async vote(ideaId: string, userId: string, type: 'UPVOTE' | 'DOWNVOTE') {
    // Check if user already voted
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        ideaId_userId: {
          ideaId,
          userId,
        },
      },
    });

    let vote;
    if (existingVote) {
      // Update existing vote
      vote = await this.prisma.vote.update({
        where: {
          ideaId_userId: {
            ideaId,
            userId,
          },
        },
        data: { type },
      });
    } else {
      // Create new vote
      vote = await this.prisma.vote.create({
        data: {
          ideaId,
          userId,
          type,
        },
      });

      // Get idea and voter details for notification
      const idea = await this.prisma.idea.findUnique({
        where: { id: ideaId },
        include: {
          user: { select: { id: true } },
        },
      });

      const voter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      // Create notification for idea owner if voter is not the owner
      if (idea && voter && idea.user.id !== userId) {
        await this.notificationsService.create({
          userId: idea.user.id,
          type: NotificationType.VOTE,
          title: 'Your idea received a new vote',
          message: `${voter.name} ${type === 'UPVOTE' ? 'upvoted' : 'downvoted'} "${idea.title}"`,
        });
      }
    }

    return vote;
  }

  async removeVote(ideaId: string, userId: string) {
    return this.prisma.vote.delete({
      where: {
        ideaId_userId: {
          ideaId,
          userId,
        },
      },
    });
  }
}