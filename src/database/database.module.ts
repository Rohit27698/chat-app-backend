import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://rohit:0000@myproject.lrwjy0h.mongodb.net/chat-app'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}