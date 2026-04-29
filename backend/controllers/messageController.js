const Message = require('../models/Message');
const Item = require('../models/Item');

// @desc    Send a message to a seller (creates or appends to conversation thread)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { itemId, body } = req.body;

        if (!itemId || !body || !body.trim()) {
            return res.status(400).json({ message: 'Item ID and message body are required.' });
        }

        const item = await Item.findById(itemId).populate('seller', '_id name');
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        if (!item.seller) {
            return res.status(404).json({ message: 'The seller of this item no longer exists.' });
        }

        // Prevent sellers from messaging themselves
        if (item.seller._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot contact yourself about your own listing.' });
        }

        // Find existing conversation or create new one
        let conversation = await Message.findOne({ item: itemId, buyer: req.user._id });
        let newMessageEntry = { from: req.user._id, body: body.trim() };

        if (conversation) {
            conversation.messages.push(newMessageEntry);
            conversation.lastMessageAt = new Date();
            await conversation.save();
        } else {
            conversation = await Message.create({
                item: itemId,
                buyer: req.user._id,
                seller: item.seller._id,
                messages: [newMessageEntry],
                lastMessageAt: new Date()
            });
        }

        // Emit real-time message
        const io = req.app.get('io');
        const messageToEmit = { ...newMessageEntry, createdAt: new Date() };
        io.to(conversation._id.toString()).emit('new_message', {
            conversationId: conversation._id.toString(),
            message: messageToEmit
        });

        // Notify receiver
        const receiverId = item.seller._id.toString();
        io.to(receiverId).emit('message_notification', { hasNew: true });

        res.status(201).json({ success: true, conversationId: conversation._id });
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ message: 'Server error sending message.' });
    }
};

// @desc    Get all conversations for the logged-in user (as buyer or seller)
// @route   GET /api/messages
// @access  Private
const getMyConversations = async (req, res) => {
    try {
        let conversations = await Message.find({
            $or: [{ buyer: req.user._id }, { seller: req.user._id }]
        })
            .populate('item', 'title images price')
            .populate('buyer', 'name')
            .populate('seller', 'name')
            .sort({ lastMessageAt: -1 });

        // Filter out conversations with missing references (orphaned data from before cascading deletes)
        conversations = conversations.filter(conv => conv.item && conv.buyer && conv.seller);

        res.json(conversations);
    } catch (err) {
        console.error('getMyConversations error:', err);
        res.status(500).json({ message: 'Server error fetching conversations.' });
    }
};

// @desc    Get a single conversation by ID with full message thread
// @route   GET /api/messages/:id
// @access  Private (must be buyer or seller of that conversation)
const getConversation = async (req, res) => {
    try {
        const conversation = await Message.findById(req.params.id)
            .populate('item', 'title images price')
            .populate('buyer', 'name _id')
            .populate('seller', 'name _id')
            .populate('messages.from', 'name _id');

        if (!conversation || !conversation.item || !conversation.buyer || !conversation.seller) {
            return res.status(404).json({ message: 'Conversation or related entities no longer exist.' });
        }

        const userId = req.user._id.toString();
        if (
            conversation.buyer._id.toString() !== userId &&
            conversation.seller._id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized to view this conversation.' });
        }

        res.json(conversation);
    } catch (err) {
        console.error('getConversation error:', err);
        res.status(500).json({ message: 'Server error fetching conversation.' });
    }
};

// @desc    Reply to an existing conversation
// @route   POST /api/messages/:id/reply
// @access  Private
const replyToConversation = async (req, res) => {
    try {
        const { body } = req.body;
        if (!body || !body.trim()) {
            return res.status(400).json({ message: 'Reply body cannot be empty.' });
        }

        const conversation = await Message.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        const userId = req.user._id.toString();
        if (
            conversation.buyer.toString() !== userId &&
            conversation.seller.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized to reply to this conversation.' });
        }

        const newMessageEntry = { from: req.user._id, body: body.trim() };
        conversation.messages.push(newMessageEntry);
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Emit real-time message
        const io = req.app.get('io');
        const messageToEmit = { ...newMessageEntry, createdAt: new Date() };
        io.to(conversation._id.toString()).emit('new_message', {
            conversationId: conversation._id.toString(),
            message: messageToEmit
        });

        // Notify receiver
        const receiverId = conversation.buyer.toString() === req.user._id.toString() 
            ? conversation.seller.toString() 
            : conversation.buyer.toString();
        io.to(receiverId).emit('message_notification', { hasNew: true });

        res.status(201).json({ success: true });
    } catch (err) {
        console.error('replyToConversation error:', err);
        res.status(500).json({ message: 'Server error sending reply.' });
    }
};

module.exports = { sendMessage, getMyConversations, getConversation, replyToConversation };
