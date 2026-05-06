import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas/conversation.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createConversation(creatorUserId: string, participantUserId: string): Promise<Conversation> {
    const creatorObjId = new Types.ObjectId(creatorUserId);
    const participantObjId = new Types.ObjectId(participantUserId);

    const existingConversation = await this.conversationModel.findOne({
      $or: [
        { creator_user_id: creatorObjId, participant_user_id: participantObjId },
        { creator_user_id: participantObjId, participant_user_id: creatorObjId }
      ]
    })
    .populate('creator_user_id', 'username avatar isOnline')
    .populate('participant_user_id', 'username avatar isOnline')
    .exec();

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = new this.conversationModel({
      creator_user_id: creatorObjId,
      participant_user_id: participantObjId,
      isGroupChat: false,
    });

    await conversation.save();
    
    const populatedConversation = await this.conversationModel.findById(conversation._id)
      .populate('creator_user_id', 'username avatar isOnline')
      .populate('participant_user_id', 'username avatar isOnline')
      .exec();
    
    return populatedConversation as Conversation;
  }

  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const userObjId = new Types.ObjectId(userId);
    const conversations = await this.conversationModel
      .find({
        $or: [
          { creator_user_id: userObjId },
          { participant_user_id: userObjId }
        ]
      })
      .populate('creator_user_id', 'username avatar isOnline')
      .populate('participant_user_id', 'username avatar isOnline')
      .sort({ lastMessageAt: -1 })
      .exec();

    return conversations;
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('creator_user_id', 'username avatar isOnline')
      .populate('participant_user_id', 'username avatar isOnline')
      .exec();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  async updateLastMessage(conversationId: string, message: string): Promise<void> {
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: new Date(),
    });
  }
}
