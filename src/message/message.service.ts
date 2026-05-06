import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from '../schemas/chat.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {}

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    message: string,
    type: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
  ): Promise<Chat> {
    // Validation
    if (type === 'text' && !message?.trim()) {
      throw new Error('Text message cannot be empty');
    }
    
    if ((type === 'image' || type === 'file') && (!fileUrl || !fileName)) {
      throw new Error('File messages must have fileUrl and fileName');
    }

    const chat = new this.chatModel({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message?.trim() || undefined,
      type,
      fileUrl,
      fileName,
      isRead: false,
    });

    return chat.save();
  }

  async getMessagesByConversation(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Chat[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const messages = await this.chatModel
      .find({ conversation_id: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.chatModel.countDocuments({ conversation_id: conversationId });

    return { messages, total };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.chatModel.updateMany(
      { conversation_id: conversationId, receiver_id: userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    await this.chatModel.updateOne(
      { conversation_id: conversationId, sender_id: userId },
      { isTyping }
    );
  }
}
