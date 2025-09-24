const express = require('express');
const WhiteboardState = require('../models/WhiteboardState');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/whiteboard/:roomId
// @desc    Get whiteboard state
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
  try {
    let whiteboardState = await WhiteboardState.findOne({ room_id: req.params.roomId });
    
    if (!whiteboardState) {
      whiteboardState = new WhiteboardState({
        room_id: req.params.roomId,
        last_updated_by: req.user.userId
      });
      await whiteboardState.save();
    }

    res.json({
      success: true,
      whiteboard: whiteboardState.getWhiteboardInfo()
    });

  } catch (error) {
    console.error('Get whiteboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting whiteboard'
    });
  }
});

module.exports = router;