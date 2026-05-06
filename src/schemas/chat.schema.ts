import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true })
  conversation_id: string;

  @Prop({ required: true })
  sender_id: string;

  @Prop({ required: true })
  receiver_id: string;

  @Prop({ required: false })
  message?: string;

  @Prop({ default: 'text' })
  type: 'text' | 'image' | 'file';

  @Prop({ default: null })
  fileUrl?: string;

  @Prop({ default: null })
  fileName?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isTyping: boolean;

  @Prop({ default: null })
  readAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
