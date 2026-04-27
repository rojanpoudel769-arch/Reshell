const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMyConversations,
    getConversation,
    replyToConversation,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Send a new message / start a conversation
router.post('/', protect, sendMessage);

// Get all conversations for logged-in user
router.get('/', protect, getMyConversations);

// Get a single conversation thread
router.get('/:id', protect, getConversation);

// Reply to an existing conversation
router.post('/:id/reply', protect, replyToConversation);

module.exports = router;
