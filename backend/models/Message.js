const mongoose = require('mongoose');

const messageEntrySchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: [true, 'Message body cannot be empty'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
        required: true
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [messageEntrySchema],
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// One conversation per (item, buyer) pair
messageSchema.index({ item: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('Message', messageSchema);
