const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const WhiteboardState = require('../models/WhiteboardState');

// Store active connections
const activeConnections = new Map();
const roomConnections = new Map();

const socketHandlers = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userInfo = {
        id: user._id,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        email: user.email
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userInfo.display_name} connected: ${socket.id}`);
    
    // Store active connection
    activeConnections.set(socket.userId, {
      socketId: socket.id,
      userInfo: socket.userInfo,
      connectedAt: new Date()
    });

    // Update user online status
    updateUserOnlineStatus(socket.userId, true);

    // Handle joining a room
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        
        // Find room and validate
        const room = await Room.findById(roomId);
        if (!room || !room.is_active) {
          socket.emit('error', { message: 'Room not found or inactive' });
          return;
        }

        // Add user to room participants if not already present
        try {
          await room.addParticipant(socket.userId, socket.id);
        } catch (error) {
          if (error.message === 'Room is at maximum capacity') {
            socket.emit('error', { message: 'Room is at maximum capacity' });
            return;
          }
        }

        // Join socket room
        socket.join(roomId);
        socket.currentRoom = roomId;

        // Track room connections
        if (!roomConnections.has(roomId)) {
          roomConnections.set(roomId, new Set());
        }
        roomConnections.get(roomId).add(socket.userId);

        // Get updated room with participants
        const updatedRoom = await Room.findById(roomId)
          .populate('current_participants.user_id', 'display_name avatar_url');

        // Notify all participants about new user
        socket.to(roomId).emit('user-joined', {
          user: socket.userInfo,
          roomId: roomId,
          participants: updatedRoom.current_participants
        });

        // Send room data to the joining user
        socket.emit('room-joined', {
          roomId: roomId,
          participants: updatedRoom.current_participants,
          room: updatedRoom.getRoomInfo()
        });

        console.log(`👥 User ${socket.userInfo.display_name} joined room ${roomId}`);

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave-room', async (data) => {
      try {
        const { roomId } = data;
        await leaveRoom(socket, roomId);
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // WebRTC Signaling Events
    socket.on('offer', (data) => {
      socket.to(data.target).emit('offer', {
        sdp: data.sdp,
        sender: socket.id,
        senderInfo: socket.userInfo
      });
    });

    socket.on('answer', (data) => {
      socket.to(data.target).emit('answer', {
        sdp: data.sdp,
        sender: socket.id,
        senderInfo: socket.userInfo
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.target).emit('ice-candidate', {
        candidate: data.candidate,
        sender: socket.id,
        senderInfo: socket.userInfo
      });
    });

    // Media control events
    socket.on('toggle-video', async (data) => {
      try {
        const { roomId, enabled } = data;
        if (socket.currentRoom === roomId) {
          const room = await Room.findById(roomId);
          await room.updateParticipantStatus(socket.userId, { video_enabled: enabled });
          
          socket.to(roomId).emit('participant-video-toggle', {
            userId: socket.userId,
            enabled,
            userInfo: socket.userInfo
          });
        }
      } catch (error) {
        console.error('Toggle video error:', error);
      }
    });

    socket.on('toggle-audio', async (data) => {
      try {
        const { roomId, enabled } = data;
        if (socket.currentRoom === roomId) {
          const room = await Room.findById(roomId);
          await room.updateParticipantStatus(socket.userId, { audio_enabled: enabled });
          
          socket.to(roomId).emit('participant-audio-toggle', {
            userId: socket.userId,
            enabled,
            userInfo: socket.userInfo
          });
        }
      } catch (error) {
        console.error('Toggle audio error:', error);
      }
    });

    socket.on('screen-share-start', (data) => {
      const { roomId } = data;
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('screen-share-started', {
          userId: socket.userId,
          userInfo: socket.userInfo
        });
      }
    });

    socket.on('screen-share-stop', (data) => {
      const { roomId } = data;
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('screen-share-stopped', {
          userId: socket.userId,
          userInfo: socket.userInfo
        });
      }
    });

    // Chat events
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, type = 'text', file_url, file_name, file_size, mime_type } = data;
        
        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'You are not in this room' });
          return;
        }

        // Create message in database
        const message = new Message({
          room_id: roomId,
          user_id: socket.userId,
          type,
          content,
          file_url,
          file_name,
          file_size,
          mime_type
        });

        await message.save();
        await message.populate('user_id', 'display_name avatar_url');

        // Broadcast message to all room participants
        io.to(roomId).emit('new-message', {
          message: message.formatted,
          user: message.user_id
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing-start', (data) => {
      const { roomId } = data;
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          userInfo: socket.userInfo,
          isTyping: true
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { roomId } = data;
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          userInfo: socket.userInfo,
          isTyping: false
        });
      }
    });

    // Whiteboard events
    socket.on('whiteboard-update', async (data) => {
      try {
        const { roomId, whiteboardData, action = 'update' } = data;
        
        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'You are not in this room' });
          return;
        }

        // Update whiteboard state in database
        let whiteboardState = await WhiteboardState.findOne({ room_id: roomId });
        
        if (!whiteboardState) {
          whiteboardState = new WhiteboardState({
            room_id: roomId,
            data: whiteboardData,
            last_updated_by: socket.userId
          });
          await whiteboardState.save();
        } else {
          await whiteboardState.updateData(whiteboardData, socket.userId, action);
        }

        // Broadcast whiteboard update to other participants
        socket.to(roomId).emit('whiteboard-updated', {
          data: whiteboardData,
          updatedBy: socket.userInfo,
          action,
          version: whiteboardState.version
        });

      } catch (error) {
        console.error('Whiteboard update error:', error);
        socket.emit('error', { message: 'Failed to update whiteboard' });
      }
    });

    socket.on('whiteboard-lock', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'You are not in this room' });
          return;
        }

        const whiteboardState = await WhiteboardState.findOne({ room_id: roomId });
        if (whiteboardState) {
          await whiteboardState.lock(socket.userId);
          
          socket.to(roomId).emit('whiteboard-locked', {
            lockedBy: socket.userInfo
          });
        }

      } catch (error) {
        console.error('Whiteboard lock error:', error);
        socket.emit('error', { message: 'Failed to lock whiteboard' });
      }
    });

    socket.on('whiteboard-unlock', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'You are not in this room' });
          return;
        }

        const whiteboardState = await WhiteboardState.findOne({ room_id: roomId });
        if (whiteboardState) {
          await whiteboardState.unlock(socket.userId);
          
          socket.to(roomId).emit('whiteboard-unlocked', {
            unlockedBy: socket.userInfo
          });
        }

      } catch (error) {
        console.error('Whiteboard unlock error:', error);
        socket.emit('error', { message: 'Failed to unlock whiteboard' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User ${socket.userInfo.display_name} disconnected: ${socket.id}`);
      
      try {
        // Update user online status
        await updateUserOnlineStatus(socket.userId, false);

        // Leave current room if any
        if (socket.currentRoom) {
          await leaveRoom(socket, socket.currentRoom);
        }

        // Remove from active connections
        activeConnections.delete(socket.userId);

      } catch (error) {
        console.error('Disconnect cleanup error:', error);
      }
    });
  });

  // Helper function to leave a room
  async function leaveRoom(socket, roomId) {
    try {
      socket.leave(roomId);

      // Remove from room connections tracking
      if (roomConnections.has(roomId)) {
        roomConnections.get(roomId).delete(socket.userId);
        if (roomConnections.get(roomId).size === 0) {
          roomConnections.delete(roomId);
        }
      }

      // Update room participants in database
      const room = await Room.findById(roomId);
      if (room) {
        await room.removeParticipant(socket.userId);

        // Notify other participants
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userInfo: socket.userInfo,
          roomId: roomId
        });
      }

      socket.currentRoom = null;
      console.log(`👋 User ${socket.userInfo.display_name} left room ${roomId}`);

    } catch (error) {
      console.error('Leave room error:', error);
      throw error;
    }
  }

  // Helper function to update user online status
  async function updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        is_online: isOnline,
        last_seen: new Date()
      });
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }
};

module.exports = socketHandlers;