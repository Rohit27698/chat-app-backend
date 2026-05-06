import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator_user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  participant_user_id: Types.ObjectId;

  @Prop({ default: false })
  isGroupChat: boolean;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ default: null })
  lastMessage?: string;

  @Prop({ default: null })
  lastMessageAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
