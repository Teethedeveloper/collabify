**"Collaboration Simplified"**

A modern real-time video conferencing and collaboration platform built with the MERN stack, featuring multi-user video/audio calls, screen sharing, text chat, file sharing, and collaborative whiteboard.

## 🏗️ Project Structure

```
collabify/
├── frontend/                    # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoCall/
│   │   │   │   ├── VideoGrid.tsx
│   │   │   │   └── VideoControls.tsx
│   │   │   ├── Chat/
│   │   │   │   └── Chat.tsx
│   │   │   ├── Whiteboard/
│   │   │   │   └── Whiteboard.tsx
│   │   │   ├── Participants/
│   │   │   │   └── ParticipantsList.tsx
│   │   │   └── ui/              # Shadcn UI components
│   │   ├── pages/
│   │   │   ├── Index.tsx        # Landing page
│   │   │   ├── VideoRoom.tsx    # Main room interface
│   │   │   └── NotFound.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities
│   │   └── integrations/        # Third-party integrations
│   ├── public/
│   └── package.json
└── backend/                     # Node.js + Express Backend
    ├── server.js                # Main server entry point
    ├── config/
    │   └── database.js          # MongoDB connection
    ├── models/
    │   ├── User.js              # User schema
    │   ├── Room.js              # Room schema
    │   ├── Message.js           # Chat message schema
    │   ├── File.js              # File upload schema
    │   └── WhiteboardState.js   # Whiteboard data schema
    ├── routes/
    │   ├── auth.js              # Authentication routes
    │   ├── rooms.js             # Room management routes
    │   ├── messages.js          # Chat message routes
    │   ├── files.js             # File upload routes
    │   └── whiteboard.js        # Whiteboard routes
    ├── middleware/
    │   ├── auth.js              # JWT authentication
    │   ├── upload.js            # File upload handling
    │   └── validation.js        # Input validation
    ├── socket/
    │   ├── socketHandlers.js    # Socket.io event handlers
    │   └── webrtc.js            # WebRTC signaling
    ├── utils/
    │   └── helpers.js           # Utility functions
    └── package.json
```

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Socket.io-client** for real-time communication
- **WebRTC** for peer-to-peer media streaming

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time signaling
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Infrastructure
- **STUN/TURN servers** for NAT traversal
- **WebSocket Secure (WSS)** for signaling
- **HTTPS** for secure communication

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/collabify
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collabify
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # CORS
   CLIENT_URL=http://localhost:5173
   
   # File Upload
   MAX_FILE_SIZE=10485760  # 10MB in bytes
   UPLOAD_PATH=./uploads
   
   # STUN/TURN Server (optional)
   STUN_SERVER=stun:stun.l.google.com:19302
   # TURN_SERVER=turn:your-turn-server.com:3478
   # TURN_USERNAME=username
   # TURN_CREDENTIAL=credential
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** `mongod`
   - **MongoDB Atlas:** Ensure your cluster is running

5. **Run the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to project root (frontend is already here):**
   ```bash
   # You're already in the frontend directory
   ```

2. **Install additional dependencies for WebRTC:**
   ```bash
   npm install socket.io-client simple-peer
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room settings
- `DELETE /api/rooms/:id` - Delete room
- `POST /api/rooms/:id/join` - Join room with code

### Messages
- `GET /api/messages/:roomId` - Get chat history
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:roomId` - Get room files
- `DELETE /api/files/:id` - Delete file

### Whiteboard
- `GET /api/whiteboard/:roomId` - Get whiteboard state
- `PUT /api/whiteboard/:roomId` - Update whiteboard state

## 🔌 Socket.io Events

### Connection Management
- `connection` - User connects
- `disconnect` - User disconnects
- `join-room` - User joins a room
- `leave-room` - User leaves a room

### WebRTC Signaling
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate exchange
- `screen-share-start` - Start screen sharing
- `screen-share-stop` - Stop screen sharing

### Chat & Collaboration
- `message` - New chat message
- `typing` - User typing indicator
- `whiteboard-update` - Whiteboard state change
- `participant-update` - Participant status change

## 🗃️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  display_name: String,
  avatar_url: String,
  created_at: Date,
  updated_at: Date
}
```

### Rooms Collection
```javascript
{
  _id: ObjectId,
  name: String,
  host_user_id: ObjectId,
  is_private: Boolean,
  join_code: String (unique),
  max_participants: Number,
  created_at: Date,
  updated_at: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  room_id: ObjectId,
  user_id: ObjectId,
  type: String, // 'text', 'file', 'system'
  content: String,
  file_url: String,
  created_at: Date,
  updated_at: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  uploader_user_id: ObjectId,
  room_id: ObjectId,
  filename: String,
  original_name: String,
  url: String,
  size: Number,
  mime_type: String,
  created_at: Date
}
```

### WhiteboardState Collection
```javascript
{
  _id: ObjectId,
  room_id: ObjectId,
  data: Object, // Canvas drawing data
  last_updated_by: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **HTTPS/WSS** for encrypted communication
- **File Upload Validation** with size and type restrictions
- **Input Sanitization** to prevent XSS attacks
- **Rate Limiting** on API endpoints
- **CORS Configuration** for cross-origin requests

## 🎯 MVP Features

- ✅ User authentication (email/password)
- ✅ Create/join video rooms
- ✅ Multi-user video/audio calls (up to 6 participants)
- ✅ Screen sharing
- ✅ Real-time text chat
- ✅ File sharing (images, documents)
- ✅ Collaborative whiteboard
- ✅ Participant management

## 🚀 Stretch Features

- [ ] End-to-end encryption (E2EE)
- [ ] Call recording
- [ ] Breakout rooms
- [ ] Emoji reactions
- [ ] Live transcripts
- [ ] Mobile-responsive UI
- [ ] Cloud storage integration
- [ ] SFU scaling for larger groups

## 🛠️ Development Commands

### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📋 Environment Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB running (local/cloud)
- [ ] Backend `.env` file configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] STUN/TURN server configured (optional)
- [ ] SSL certificates for HTTPS (production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
