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
  Query,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { VoteIdeaDto } from './dto/vote-idea.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ideas')
export class IdeasController {
  constructor(private ideasService: IdeasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createIdeaDto: CreateIdeaDto, @Request() req) {
    const ideaData = {
      ...createIdeaDto,
      user: {
        connect: { id: req.user.userId },
      },
      status: 'PUBLISHED' as const,
    };
    return this.ideasService.create(ideaData);
  }

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('category') category?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 10;
    return this.ideasService.findAll(skipNum, takeNum, category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ideasService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.ideasService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIdeaDto: UpdateIdeaDto,
    @Request() req,
  ) {
    // TODO: Add authorization check to ensure user owns the idea
    return this.ideasService.update(id, updateIdeaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // TODO: Add authorization check to ensure user owns the idea
    return this.ideasService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  async vote(
    @Param('id') id: string,
    @Body() voteIdeaDto: VoteIdeaDto,
    @Request() req,
  ) {
    return this.ideasService.vote(id, req.user.userId, voteIdeaDto.type);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/vote')
  async removeVote(@Param('id') id: string, @Request() req) {
    return this.ideasService.removeVote(id, req.user.userId);
  }
}