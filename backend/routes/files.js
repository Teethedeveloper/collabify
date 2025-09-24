const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = File.getAllowedTypes();
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { roomId } = req.body;
    
    const fileRecord = new File({
      uploader_user_id: req.user.userId,
      room_id: roomId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype
    });

    await fileRecord.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileRecord.info
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading file'
    });
  }
});

module.exports = router;