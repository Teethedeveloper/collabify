const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system', 'image'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text' || this.type === 'system';
    },
    maxlength: [1000, 'Message content cannot exceed 1000 characters']
  },
  file_url: {
    type: String,
    required: function() {
      return this.type === 'file' || this.type === 'image';
    }
  },
  file_name: {
    type: String,
    required: function() {
      return this.type === 'file' || this.type === 'image';
    }
  },
  file_size: {
    type: Number,
    required: function() {
      return this.type === 'file' || this.type === 'image';
    }
  },
  mime_type: {
    type: String,
    required: function() {
      return this.type === 'file' || this.type === 'image';
    }
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date,
    default: null
  },
  reply_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  is_deleted: {
    type: Boolean,
    default: false
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Method to soft delete message
messageSchema.methods.softDelete = function() {
  this.is_deleted = true;
  this.deleted_at = new Date();
  this.content = 'This message has been deleted';
  this.file_url = null;
  this.file_name = null;
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Check if user already reacted with this emoji
  const existingReaction = this.reactions.find(
    r => r.user_id.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction if already exists
    this.reactions = this.reactions.filter(
      r => !(r.user_id.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    // Add new reaction
    this.reactions.push({
      user_id: userId,
      emoji: emoji
    });
  }
  
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  if (this.type !== 'text') {
    throw new Error('Only text messages can be edited');
  }
  
  this.content = newContent;
  this.is_edited = true;
  this.edited_at = new Date();
  return this.save();
};

// Virtual for formatted message
messageSchema.virtual('formatted').get(function() {
  return {
    id: this._id,
    room_id: this.room_id,
    user_id: this.user_id,
    type: this.type,
    content: this.is_deleted ? 'This message has been deleted' : this.content,
    file_url: this.is_deleted ? null : this.file_url,
    file_name: this.is_deleted ? null : this.file_name,
    file_size: this.file_size,
    mime_type: this.mime_type,
    is_edited: this.is_edited,
    edited_at: this.edited_at,
    reply_to: this.reply_to,
    reactions: this.reactions,
    is_deleted: this.is_deleted,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
});

// Indexes for faster queries
messageSchema.index({ room_id: 1, created_at: -1 });
messageSchema.index({ user_id: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ is_deleted: 1 });

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);