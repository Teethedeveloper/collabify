const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  host_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host user is required']
  },
  is_private: {
    type: Boolean,
    default: false
  },
  join_code: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8).toUpperCase()
  },
  max_participants: {
    type: Number,
    default: 6,
    min: [2, 'Minimum 2 participants required'],
    max: [50, 'Maximum 50 participants allowed']
  },
  current_participants: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joined_at: {
      type: Date,
      default: Date.now
    },
    is_host: {
      type: Boolean,
      default: false
    },
    socket_id: String,
    video_enabled: {
      type: Boolean,
      default: true
    },
    audio_enabled: {
      type: Boolean,
      default: true
    },
    screen_sharing: {
      type: Boolean,
      default: false
    }
  }],
  room_settings: {
    allow_screen_share: {
      type: Boolean,
      default: true
    },
    allow_chat: {
      type: Boolean,
      default: true
    },
    allow_file_share: {
      type: Boolean,
      default: true
    },
    allow_whiteboard: {
      type: Boolean,
      default: true
    },
    require_approval: {
      type: Boolean,
      default: false
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  ended_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Method to add participant
roomSchema.methods.addParticipant = function(userId, socketId, isHost = false) {
  // Check if user is already in the room
  const existingParticipant = this.current_participants.find(
    p => p.user_id.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    // Update socket ID if user reconnects
    existingParticipant.socket_id = socketId;
    return this.save();
  }
  
  // Check room capacity
  if (this.current_participants.length >= this.max_participants) {
    throw new Error('Room is at maximum capacity');
  }
  
  // Add new participant
  this.current_participants.push({
    user_id: userId,
    socket_id: socketId,
    is_host: isHost,
    joined_at: new Date()
  });
  
  return this.save();
};

// Method to remove participant
roomSchema.methods.removeParticipant = function(userId) {
  this.current_participants = this.current_participants.filter(
    p => p.user_id.toString() !== userId.toString()
  );
  
  // If no participants left, mark room as inactive
  if (this.current_participants.length === 0) {
    this.is_active = false;
    this.ended_at = new Date();
  }
  
  return this.save();
};

// Method to update participant status
roomSchema.methods.updateParticipantStatus = function(userId, updates) {
  const participant = this.current_participants.find(
    p => p.user_id.toString() === userId.toString()
  );
  
  if (participant) {
    Object.assign(participant, updates);
    return this.save();
  }
  
  throw new Error('Participant not found in room');
};

// Method to get room info without sensitive data
roomSchema.methods.getRoomInfo = function() {
  return {
    id: this._id,
    name: this.name,
    host_user_id: this.host_user_id,
    is_private: this.is_private,
    max_participants: this.max_participants,
    current_participant_count: this.current_participants.length,
    room_settings: this.room_settings,
    is_active: this.is_active,
    created_at: this.created_at
  };
};

// Indexes for faster queries
roomSchema.index({ join_code: 1 });
roomSchema.index({ host_user_id: 1 });
roomSchema.index({ is_active: 1 });
roomSchema.index({ 'current_participants.user_id': 1 });

module.exports = mongoose.model('Room', roomSchema);