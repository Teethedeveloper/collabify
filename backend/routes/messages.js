const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/messages/:roomId
// @desc    Get chat history for a room
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ 
      room_id: roomId, 
      is_deleted: false 
    })
    .populate('user_id', 'display_name avatar_url')
    .populate('reply_to', 'content user_id')
    .sort({ created_at: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ room_id: roomId, is_deleted: false })
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting messages'
    });
  }
});

module.exports = router;