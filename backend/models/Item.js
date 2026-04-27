const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be positive']
    },
    images: {
        type: [String],
        validate: [v => v.length > 0, 'Please provide at least one image']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: [
            'Electronics',
            'Clothing',
            'Home',
            'Books',
            'Toys',
            'Sports',
            'Other'
        ]
    },
    condition: {
        type: String,
        required: [true, 'Please select a condition'],
        enum: ['Used', 'Like New', 'New']
    },
    negotiable: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Reserved'],
        default: 'Available'
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create text index for search
itemSchema.index({ title: 'text', description: 'text', category: 'text' });
// Also indexing category and price for regular filtering
itemSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Item', itemSchema);
