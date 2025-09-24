const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('is_private')
    .optional()
    .isBoolean()
    .withMessage('is_private must be a boolean'),
  body('max_participants')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('max_participants must be between 2 and 50')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, is_private, max_participants, room_settings } = req.body;

    // Create new room
    const room = new Room({
      name,
      host_user_id: req.user.userId,
      is_private: is_private || false,
      max_participants: max_participants || 6,
      room_settings: {
        allow_screen_share: room_settings?.allow_screen_share ?? true,
        allow_chat: room_settings?.allow_chat ?? true,
        allow_file_share: room_settings?.allow_file_share ?? true,
        allow_whiteboard: room_settings?.allow_whiteboard ?? true,
        require_approval: room_settings?.require_approval ?? false
      }
    });

    await room.save();

    // Add creator as host participant
    await room.addParticipant(req.user.userId, null, true);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: room.getRoomInfo(),
      join_code: room.join_code
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating room'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host_user_id', 'display_name avatar_url')
      .populate('current_participants.user_id', 'display_name avatar_url is_online');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has access to room
    const isParticipant = room.current_participants.some(
      p => p.user_id._id.toString() === req.user.userId
    );
    const isHost = room.host_user_id._id.toString() === req.user.userId;

    if (room.is_private && !isParticipant && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private room'
      });
    }

    res.json({
      success: true,
      room
    });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting room'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room settings (host only)
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('max_participants')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('max_participants must be between 2 and 50')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the host
    if (room.host_user_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only room host can update settings'
      });
    }

    const { name, max_participants, room_settings } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (max_participants) updates.max_participants = max_participants;
    if (room_settings) {
      updates.room_settings = {
        ...room.room_settings,
        ...room_settings
      };
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom.getRoomInfo()
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating room'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room (host only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the host
    if (room.host_user_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only room host can delete room'
      });
    }

    // Mark room as inactive and ended
    room.is_active = false;
    room.ended_at = new Date();
    room.current_participants = [];
    await room.save();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting room'
    });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Join room with join code
// @access  Private
router.post('/:id/join', [
  auth,
  body('join_code')
    .optional()
    .isLength({ min: 8, max: 8 })
    .withMessage('Join code must be 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { join_code } = req.body;
    let room;

    // Find room by ID or join code
    if (join_code) {
      room = await Room.findOne({ join_code, is_active: true });
    } else {
      room = await Room.findOne({ _id: req.params.id, is_active: true });
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or inactive'
      });
    }

    // Check if room is at capacity
    if (room.current_participants.length >= room.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Room is at maximum capacity'
      });
    }

    // Check if user is already in the room
    const isAlreadyParticipant = room.current_participants.some(
      p => p.user_id.toString() === req.user.userId
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this room'
      });
    }

    // Add user to room participants
    await room.addParticipant(req.user.userId);

    // Update user's joined rooms
    const user = await User.findById(req.user.userId);
    if (user && !user.rooms_joined.includes(room._id)) {
      user.rooms_joined.push(room._id);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Successfully joined room',
      room: room.getRoomInfo()
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining room'
    });
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Leave room
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Remove user from room participants
    await room.removeParticipant(req.user.userId);

    // Update user's joined rooms
    const user = await User.findById(req.user.userId);
    if (user) {
      user.rooms_joined = user.rooms_joined.filter(
        roomId => roomId.toString() !== room._id.toString()
      );
      await user.save();
    }

    res.json({
      success: true,
      message: 'Successfully left room'
    });

  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving room'
    });
  }
});

// @route   GET /api/rooms/code/:join_code
// @desc    Get room by join code
// @access  Private
router.get('/code/:join_code', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ 
      join_code: req.params.join_code.toUpperCase(),
      is_active: true 
    }).populate('host_user_id', 'display_name avatar_url');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found with this join code'
      });
    }

    res.json({
      success: true,
      room: room.getRoomInfo()
    });

  } catch (error) {
    console.error('Get room by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error finding room'
    });
  }
});

module.exports = router;