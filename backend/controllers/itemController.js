const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Fetch all items with search, filter, and pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;

        // Search query using text index or regex
        const keyword = req.query.keyword
            ? {
                $or: [
                    { title: { $regex: req.query.keyword, $options: 'i' } },
                    { description: { $regex: req.query.keyword, $options: 'i' } },
                ],
            }
            : {};

        // Filter by category
        const category = req.query.category ? { category: req.query.category } : {};

        // Filter by seller
        const seller = req.query.seller ? { seller: req.query.seller } : {};

        // Filter by price range
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
        const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

        let userId = null;
        let isAdmin = false;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    userId = user._id.toString();
                    isAdmin = user.role === 'admin';
                }
            } catch (err) { }
        }

        // Only show approved items UNLESS the user is an admin OR the user is querying their OWN items
        let approvalFilter = { isApproved: { $ne: false } };
        
        if (isAdmin) {
             approvalFilter = {}; // Admins can see everything
        } else if (req.query.seller && userId && req.query.seller === userId) {
             approvalFilter = {}; // Sellers can see their own pending items
        }

        // Combine filters
        const filter = { ...keyword, ...category, ...seller, ...priceFilter, ...approvalFilter };

        const count = await Item.countDocuments(filter);
        let items = await Item.find(filter)
            .populate('seller', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        // Filter out items where seller is null (user deleted)
        items = items.filter(item => item.seller !== null);

        res.json({
            items,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Fetch single item
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller', 'name email');

        if (item) {
            // If item is not approved, only the seller or an admin can view it
            if (!item.isApproved) {
                let userRole = 'guest';
                let userId = null;
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                    try {
                        const token = req.headers.authorization.split(' ')[1];
                        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                        const user = await User.findById(decoded.id);
                        if (user) {
                            userRole = user.role;
                            userId = user._id.toString();
                        }
                    } catch (err) { }
                }

                if (userRole !== 'admin' && (!userId || item.seller._id.toString() !== userId)) {
                    return res.status(403).json({ message: 'This item is pending approval and cannot be viewed.' });
                }
            }

            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
    try {
        const { title, description, price, negotiable, condition, images, category, location } = req.body;

        const item = new Item({
            title,
            description,
            price,
            negotiable,
            condition,
            images,
            category,
            location,
            seller: req.user._id,
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res, next) => {
    try {
        const { title, description, price, negotiable, condition, images, category, location, status } = req.body;

        const item = await Item.findById(req.params.id);

        if (item) {
            // Check if user is the seller
            if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401).json({ message: 'Not authorized to update this item' });
                return;
            }

            item.title = title || item.title;
            item.description = description || item.description;
            item.price = price || item.price;
            item.negotiable = negotiable !== undefined ? negotiable : item.negotiable;
            item.condition = condition || item.condition;
            item.images = images || item.images;
            item.category = category || item.category;
            item.location = location || item.location;
            item.status = status || item.status;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401).json({ message: 'Not authorized to delete this item' });
                return;
            }
            await Item.deleteOne({ _id: item._id });

            // Cascading delete: Remove messages associated with this item
            const Message = require('../models/Message');
            await Message.deleteMany({ item: item._id });

            // Cascading update: Remove this item from all users' savedItems
            await User.updateMany(
                { savedItems: item._id },
                { $pull: { savedItems: item._id } }
            );

            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get item recommendations
// @route   GET /api/items/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
    try {
        // Based on categories from user's saved items
        const user = await User.findById(req.user._id).populate('savedItems');
        let categories = [];

        // Filter out null items in case they were deleted
        const activeSavedItems = (user.savedItems || []).filter(item => item !== null);

        if (activeSavedItems.length > 0) {
            categories = activeSavedItems.map(item => item.category);
        }

        // Weight categories by frequency
        const categoryWeights = {};
        categories.forEach(cat => {
            categoryWeights[cat] = (categoryWeights[cat] || 0) + 1;
        });

        // Sort categories by weight
        const sortedCategories = Object.keys(categoryWeights).sort((a, b) => categoryWeights[b] - categoryWeights[a]);

        let recommendations = [];
        if (sortedCategories.length > 0) {
            recommendations = await Item.find({
                category: { $in: sortedCategories },
                seller: { $ne: req.user._id },
                isApproved: { $ne: false },
                _id: { $nin: activeSavedItems.map(item => item._id) }
            })
                .limit(10)
                .sort({ createdAt: -1 })
                .populate('seller', 'name');
        }

        // Pad with newest items if needed
        if (recommendations.length < 4) {
            const extraItems = await Item.find({
                seller: { $ne: req.user._id },
                isApproved: { $ne: false },
                _id: { $nin: [...activeSavedItems.map(item => item._id), ...recommendations.map(r => r._id)] }
            })
                .limit(10 - recommendations.length)
                .sort({ createdAt: -1 })
                .populate('seller', 'name');

            recommendations = [...recommendations, ...extraItems];
        }

        res.json(recommendations.slice(0, 8));
    } catch (error) {
        next(error);
    }
};

// @desc    Get related items (same category)
// @route   GET /api/items/:id/related
// @access  Public
const getRelatedItems = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        const relatedItems = await Item.find({
            category: item.category,
            isApproved: { $ne: false },
            _id: { $ne: item._id }
        })
            .limit(4)
            .sort({ createdAt: -1 })
            .populate('seller', 'name');

        res.json(relatedItems);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle save an item (add/remove from user's saved items)
// @route   POST /api/items/:id/save
// @access  Private
const toggleSaveItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        const user = await User.findById(req.user._id);

        // Check if item is already saved
        const isSaved = user.savedItems.some(id => id.toString() === item._id.toString());

        if (isSaved) {
            // Remove from savedItems
            user.savedItems = user.savedItems.filter(id => id.toString() !== item._id.toString());
        } else {
            // Add to savedItems
            user.savedItems.push(item._id);
        }

        await user.save();
        res.json({
            message: isSaved ? 'Item removed from saved' : 'Item saved successfully',
            isSaved: !isSaved
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getRecommendations,
    getRelatedItems,
    toggleSaveItem,
};
