const mongoose = require('mongoose');

const whiteboardStateSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required'],
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      objects: [],
      background: '#ffffff',
      version: '1.0'
    }
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Last updated by user ID is required']
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    data: mongoose.Schema.Types.Mixed,
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'clear'],
      default: 'update'
    }
  }],
  settings: {
    max_history: {
      type: Number,
      default: 50
    },
    auto_save: {
      type: Boolean,
      default: true
    },
    allow_anonymous: {
      type: Boolean,
      default: false
    }
  },
  is_locked: {
    type: Boolean,
    default: false
  },
  locked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lock_expires_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Method to update whiteboard data
whiteboardStateSchema.methods.updateData = function(newData, userId, action = 'update') {
  // Save current state to history
  if (this.settings.max_history > 0) {
    this.history.push({
      data: this.data,
      updated_by: this.last_updated_by,
      updated_at: this.updated_at,
      action: action
    });
    
    // Keep only the last N entries in history
    if (this.history.length > this.settings.max_history) {
      this.history = this.history.slice(-this.settings.max_history);
    }
  }
  
  // Update current data
  this.data = newData;
  this.last_updated_by = userId;
  this.version += 1;
  
  return this.save();
};

// Method to lock whiteboard for editing
whiteboardStateSchema.methods.lock = function(userId, duration = 30000) { // 30 seconds default
  if (this.is_locked && this.lock_expires_at > new Date()) {
    throw new Error('Whiteboard is already locked by another user');
  }
  
  this.is_locked = true;
  this.locked_by = userId;
  this.lock_expires_at = new Date(Date.now() + duration);
  
  return this.save();
};

// Method to unlock whiteboard
whiteboardStateSchema.methods.unlock = function(userId) {
  // Only the user who locked it or after expiration can unlock
  if (this.locked_by && this.locked_by.toString() !== userId.toString() && 
      this.lock_expires_at > new Date()) {
    throw new Error('Cannot unlock whiteboard locked by another user');
  }
  
  this.is_locked = false;
  this.locked_by = null;
  this.lock_expires_at = null;
  
  return this.save();
};

// Method to check if user can edit
whiteboardStateSchema.methods.canEdit = function(userId) {
  if (!this.is_locked) return true;
  
  // Check if lock has expired
  if (this.lock_expires_at && this.lock_expires_at <= new Date()) {
    // Auto-unlock expired locks
    this.is_locked = false;
    this.locked_by = null;
    this.lock_expires_at = null;
    this.save();
    return true;
  }
  
  // Check if the same user has the lock
  return this.locked_by && this.locked_by.toString() === userId.toString();
};

// Method to get history entry by version
whiteboardStateSchema.methods.getHistoryByVersion = function(version) {
  return this.history.find(entry => entry.version === version);
};

// Method to revert to previous version
whiteboardStateSchema.methods.revertToVersion = function(version, userId) {
  const historyEntry = this.getHistoryByVersion(version);
  if (!historyEntry) {
    throw new Error('Version not found in history');
  }
  
  return this.updateData(historyEntry.data, userId, 'revert');
};

// Method to clear whiteboard
whiteboardStateSchema.methods.clear = function(userId) {
  const clearData = {
    objects: [],
    background: '#ffffff',
    version: '1.0'
  };
  
  return this.updateData(clearData, userId, 'clear');
};

// Method to get whiteboard info
whiteboardStateSchema.methods.getWhiteboardInfo = function() {
  return {
    id: this._id,
    room_id: this.room_id,
    data: this.data,
    last_updated_by: this.last_updated_by,
    version: this.version,
    is_locked: this.is_locked,
    locked_by: this.locked_by,
    lock_expires_at: this.lock_expires_at,
    settings: this.settings,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Pre-save middleware to auto-unlock expired locks
whiteboardStateSchema.pre('save', function(next) {
  if (this.is_locked && this.lock_expires_at && this.lock_expires_at <= new Date()) {
    this.is_locked = false;
    this.locked_by = null;
    this.lock_expires_at = null;
  }
  next();
});

// Indexes for faster queries
whiteboardStateSchema.index({ room_id: 1 });
whiteboardStateSchema.index({ last_updated_by: 1 });
whiteboardStateSchema.index({ is_locked: 1 });
whiteboardStateSchema.index({ version: 1 });

module.exports = mongoose.model('WhiteboardState', whiteboardStateSchema);
