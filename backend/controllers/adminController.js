const User = require('../models/User');
const Item = require('../models/Item');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user (cannot delete self)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Also remove all items listed by this user
        await Item.deleteMany({ seller: user._id });
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User and their listings removed successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all items (including pending/unapproved)
// @route   GET /api/admin/items
// @access  Admin
const getAllItems = async (req, res, next) => {
    try {
        const items = await Item.find({})
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve an item (make it publicly visible)
// @route   PUT /api/admin/items/:id/approve
// @access  Admin
const approveItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.isApproved = true;
        await item.save();
        res.json({ message: 'Item approved and is now publicly visible', item });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject/remove an item
// @route   DELETE /api/admin/items/:id
// @access  Admin
const removeItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        await Item.deleteOne({ _id: item._id });
        res.json({ message: 'Item removed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllItems,
    approveItem,
    removeItem,
};
