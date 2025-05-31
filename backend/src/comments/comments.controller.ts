import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private websocketsGateway: WebsocketsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    const commentData = {
      content: createCommentDto.content,
      user: {
        connect: { id: req.user.userId },
      },
      idea: {
        connect: { id: createCommentDto.ideaId },
      },
      ...(createCommentDto.parentId && {
        parent: {
          connect: { id: createCommentDto.parentId },
        },
      }),
    };

    const comment = await this.commentsService.create(commentData);
    
    // Send real-time update to all users viewing this idea
    this.websocketsGateway.sendCommentToIdea(createCommentDto.ideaId, comment);
    
    return comment;
  }

  @Get('idea/:ideaId')
  async findByIdea(@Param('ideaId') ideaId: string) {
    return this.commentsService.findByIdeaId(ideaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    // TODO: Add authorization check to ensure user owns the comment
    return this.commentsService.update(id, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // TODO: Add authorization check to ensure user owns the comment
    return this.commentsService.delete(id);
  }
}