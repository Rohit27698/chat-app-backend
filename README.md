# Chat App Backend

A real-time chat application backend built with NestJS, MongoDB, and Socket.IO.

## AI Development Notice

**This backend was built with significant AI assistance from Cascade (Cognition AI).** 

The AI developer helped with:
- Complete NestJS application architecture
- MongoDB schema design and integration
- Socket.IO real-time communication
- File upload handling with Multer
- Authentication and authorization systems
- RESTful API endpoints
- Error handling and validation
- Environment configuration

## Features

- Real-time messaging with Socket.IO
- File and image sharing
- User authentication and authorization
- Conversation management
- Typing indicators
- Read receipts
- Online status tracking
- File upload with validation (16MB limit)
- CORS configuration

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Authentication**: JWT
- **Validation**: NestJS ValidationPipe
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:8080
   ```

4. Start MongoDB server

5. Run the application:
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## Project Structure

```bash
src/
├── app.controller.ts          # Main application controller
├── app.module.ts            # Root module
├── app.service.ts           # Main application service
├── auth/                   # Authentication module
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.module.ts       # Auth module configuration
│   ├── auth.service.ts      # Auth business logic
│   ├── dto/               # Data transfer objects
│   ├── jwt-auth.guard.ts   # JWT authentication guard
│   └── jwt.strategy.ts    # JWT authentication strategy
├── chat/                   # Chat module
│   ├── chat.controller.ts   # Chat endpoints
│   ├── chat.module.ts       # Chat module configuration
│   ├── chat.service.ts      # Chat business logic
│   └── dto/              # Chat data transfer objects
├── database/               # Database module
│   └── database.module.ts  # MongoDB configuration
├── gateway/               # Socket.IO gateway
│   └── chat.gateway.ts    # Real-time chat events
├── message/               # Message module
│   ├── message.controller.ts # Message endpoints
│   ├── message.module.ts     # Message module configuration
│   └── message.service.ts    # Message business logic
├── schemas/               # MongoDB schemas
│   ├── chat.schema.ts      # Chat message schema
│   ├── conversation.schema.ts # Conversation schema
│   └── user.schema.ts     # User schema
└── main.ts               # Application entry point
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/users/search` - Search users

### Chat
- `POST /chat/conversations` - Create conversation
- `GET /chat/conversations/:userId` - Get user conversations
- `POST /chat/update-last-message` - Update last message

### Messages
- `POST /message/send` - Send message (text/file/image)
- `GET /message/messages/:conversationId` - Get conversation messages
- `POST /message/mark-read` - Mark messages as read
- `POST /message/typing` - Set typing status

### File Upload
- Files are uploaded to `/uploads` directory
- Accessible via `/uploads/filename` endpoint
- Supported formats: Images, PDF, Word documents, text files
- Maximum file size: 16MB

## Socket.IO Events

### Client to Server
- `join_room` - Join conversation room
- `send_message` - Send message
- `typing` - Set typing status
- `update_status` - Update online status

### Server to Client
- `new_message` - Receive new message
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `user_status` - User online status update

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8080 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/chat-app |
| JWT_SECRET | JWT secret key | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| BACKEND_URL | Backend URL for file access | http://localhost:8080 |

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Notes

- Built with AI assistance for rapid development and best practices
- Follows NestJS conventions and patterns
- Implements proper error handling and validation
- Uses TypeScript for type safety
- Configured for development and production environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with significant assistance from **Cascade AI** (Cognition AI)
- NestJS framework
- Socket.IO for real-time communication
- MongoDB for data storage
- The open-source community
