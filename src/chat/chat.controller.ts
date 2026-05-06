import { Controller, Post, Get, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    try {
      return await this.chatService.createConversation(
        createConversationDto.creator_user_id,
        createConversationDto.participant_user_id
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    try {
      return await this.chatService.getConversationsForUser(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('conversations/detail/:id')
  async getConversation(@Param('id') id: string) {
    try {
      return await this.chatService.getConversationById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('update-last-message')
  async updateLastMessage(@Body() data: { conversation_id: string; lastMessage: string }) {
    try {
      await this.chatService.updateLastMessage(data.conversation_id, data.lastMessage);
      return { success: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
