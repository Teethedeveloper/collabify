const mongoose = require('mongoose');
const path = require('path');

const fileSchema = new mongoose.Schema({
  uploader_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader user ID is required']
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  original_name: {
    type: String,
    required: [true, 'Original filename is required']
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB in bytes
  },
  mime_type: {
    type: String,
    required: [true, 'MIME type is required']
  },
  file_type: {
    type: String,
    enum: ['image', 'document', 'video', 'audio', 'other'],
    required: true
  },
  download_count: {
    type: Number,
    default: 0
  },
  is_public: {
    type: Boolean,
    default: false
  },
  thumbnail_url: {
    type: String,
    default: null
  },
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

// Pre-save middleware to determine file type based on MIME type
fileSchema.pre('save', function(next) {
  if (this.mime_type) {
    if (this.mime_type.startsWith('image/')) {
      this.file_type = 'image';
    } else if (this.mime_type.startsWith('video/')) {
      this.file_type = 'video';
    } else if (this.mime_type.startsWith('audio/')) {
      this.file_type = 'audio';
    } else if (
      this.mime_type.includes('pdf') ||
      this.mime_type.includes('document') ||
      this.mime_type.includes('spreadsheet') ||
      this.mime_type.includes('presentation') ||
      this.mime_type.includes('text/')
    ) {
      this.file_type = 'document';
    } else {
      this.file_type = 'other';
    }
  }
  next();
});

// Method to increment download count
fileSchema.methods.incrementDownload = function() {
  this.download_count += 1;
  return this.save();
};

// Method to soft delete file
fileSchema.methods.softDelete = function() {
  this.is_deleted = true;
  this.deleted_at = new Date();
  return this.save();
};

// Method to get file extension
fileSchema.methods.getExtension = function() {
  return path.extname(this.original_name).toLowerCase();
};

// Method to check if file is image
fileSchema.methods.isImage = function() {
  return this.file_type === 'image';
};

// Method to check if file is video
fileSchema.methods.isVideo = function() {
  return this.file_type === 'video';
};

// Method to format file size
fileSchema.methods.getFormattedSize = function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Virtual for file info
fileSchema.virtual('info').get(function() {
  return {
    id: this._id,
    uploader_user_id: this.uploader_user_id,
    room_id: this.room_id,
    filename: this.filename,
    original_name: this.original_name,
    url: this.url,
    size: this.size,
    formatted_size: this.getFormattedSize(),
    mime_type: this.mime_type,
    file_type: this.file_type,
    extension: this.getExtension(),
    download_count: this.download_count,
    is_public: this.is_public,
    thumbnail_url: this.thumbnail_url,
    is_deleted: this.is_deleted,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
});

// Static method to get allowed file types
fileSchema.statics.getAllowedTypes = function() {
  return [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    // Video (small files only)
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ];
};

// Indexes for faster queries
fileSchema.index({ room_id: 1, created_at: -1 });
fileSchema.index({ uploader_user_id: 1 });
fileSchema.index({ file_type: 1 });
fileSchema.index({ is_deleted: 1 });
fileSchema.index({ mime_type: 1 });

// Ensure virtual fields are serialized
fileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);