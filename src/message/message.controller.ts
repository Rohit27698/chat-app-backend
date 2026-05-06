import { Controller, Post, Get, Param, Query, Body, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('send')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExtension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
        },
      }),
    }),
  )
  async sendMessage(
    @UploadedFile() file: any,
    @Body() data: {
      conversation_id: string;
      sender_id: string;
      receiver_id: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      fileName?: string;
    },
  ) {
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let messageType: 'text' | 'image' | 'file' = data.type || 'text';

      if (file) {
        const host = process.env.BACKEND_URL || 'http://localhost:8080';
        fileUrl = `${host}/uploads/${file.filename}`;
        fileName = file.originalname;
        messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
      }

      return await this.messageService.sendMessage(
        data.conversation_id,
        data.sender_id,
        data.receiver_id,
        data.message || '',
        messageType,
        fileUrl,
        fileName,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('messages/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNumber = page ? parseInt(page, 10) : 1;
      const limitNumber = limit ? parseInt(limit, 10) : 50;
      if (isNaN(pageNumber) || pageNumber <= 0) {
        throw new HttpException('Invalid page', HttpStatus.BAD_REQUEST);
      }
      if (isNaN(limitNumber) || limitNumber <= 0) {
        throw new HttpException('Invalid limit', HttpStatus.BAD_REQUEST);
      }
      return await this.messageService.getMessagesByConversation(
        conversationId,
        pageNumber,
        limitNumber
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mark-read')
  async markAsRead(@Body() data: { conversation_id: string; user_id: string }) {
    try {
      await this.messageService.markAsRead(data.conversation_id, data.user_id);
      return { success: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('typing')
  async setTyping(@Body() data: { conversation_id: string; user_id: string; isTyping: boolean }) {
    try {
      await this.messageService.setTypingStatus(data.conversation_id, data.user_id, data.isTyping);
      return { success: true };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
