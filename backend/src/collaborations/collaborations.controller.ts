import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createCollaborationDto: CreateCollaborationDto) {
    return this.collaborationsService.create(req.user.userId, createCollaborationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.collaborationsService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('idea/:ideaId')
  findByIdea(@Param('ideaId') ideaId: string) {
    return this.collaborationsService.findByIdea(ideaId);
  }
}
