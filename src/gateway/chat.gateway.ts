import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private connectedClients: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = (client.handshake.auth?.userId || client.handshake.query?.userId) as string | undefined;
    console.log(`Client connected: ${client.id} userId=${userId}`);
    this.connectedClients.set(client.id, client);

    if (userId) {
      client.data.userId = userId;
      client.join(`user_${userId}`);
      this.server.emit('user_status', { user_id: userId, isOnline: true });
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId as string | undefined;
    console.log(`Client disconnected: ${client.id} userId=${userId}`);
    this.connectedClients.delete(client.id);

    if (userId) {
      this.server.emit('user_status', { user_id: userId, isOnline: false });
    }
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log('Message received:', payload);

    if (!payload || !payload.conversation_id || !payload.receiver_id) {
      console.warn('Invalid send_message payload received:', payload);
      return;
    }

    const conversationRoom = `conversation_${payload.conversation_id}`;
    const receiverRoom = `user_${payload.receiver_id}`;

    // Send to all participants in the conversation room except the sender.
    client.to(conversationRoom).emit('new_message', payload);

    const receiverSockets = this.server.sockets.adapter.rooms.get(receiverRoom);
    const conversationSockets = this.server.sockets.adapter.rooms.get(conversationRoom);
    const receiverInConversation = receiverSockets && conversationSockets
      ? [...receiverSockets].some((socketId) => conversationSockets.has(socketId))
      : false;

    if (!receiverInConversation) {
      this.server.to(receiverRoom).emit('new_message', payload);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversation_id: string; user_id: string; isTyping: boolean },
  ) {
    console.log('Typing event:', payload);

    const conversationRoom = `conversation_${payload.conversation_id}`;
    if (payload.isTyping) {
      this.server.to(conversationRoom).emit('user_typing', payload);
    } else {
      this.server.to(conversationRoom).emit('user_stop_typing', payload);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversation_id: string },
  ) {
    console.log(`Client ${client.id} joining room: ${payload.conversation_id}`);
    client.join(`conversation_${payload.conversation_id}`);
  }

  @SubscribeMessage('update_status')
  handleUserStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { user_id: string; isOnline: boolean },
  ) {
    console.log('User status update:', payload);
    
    // Broadcast user status to all connected clients
    this.server.emit('user_status', payload);
  }
}
