import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private websocketsGateway: WebsocketsGateway,
  ) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const messageData = {
      content: createMessageDto.content,
      sender: {
        connect: { id: req.user.userId },
      },
      receiver: {
        connect: { id: createMessageDto.receiverId },
      },
    };

    const message = await this.messagesService.create(messageData);
    
    // Send real-time message to the recipient
    this.websocketsGateway.sendMessageToUser(createMessageDto.receiverId, message);
    
    return message;
  }

  @Get('conversations')
  async findConversations(@Request() req) {
    return this.messagesService.findConversations(req.user.userId);
  }

  @Get('conversation/:userId')
  async findConversation(@Param('userId') userId: string, @Request() req) {
    return this.messagesService.findConversation(req.user.userId, userId);
  }

  @Patch('read/:senderId')
  async markAsRead(@Param('senderId') senderId: string, @Request() req) {
    await this.messagesService.markAsRead(senderId, req.user.userId);
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // TODO: Add authorization check to ensure user owns the message
    return this.messagesService.delete(id);
  }
}