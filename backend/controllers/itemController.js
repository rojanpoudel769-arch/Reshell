const Item = require('../models/Item');

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

        // Filter by price range
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
        const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

        // Combine filters
        const filter = { ...keyword, ...category, ...priceFilter };

        const count = await Item.countDocuments(filter);
        const items = await Item.find(filter)
            .populate('seller', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

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
        // Basic collaborative/content filtering based on user's saved items or roles
        // We'll find categories of items the user has saved
        const user = await req.user.populate('savedItems');
        let categories = [];

        if (user.savedItems && user.savedItems.length > 0) {
            categories = user.savedItems.map(item => item.category);
        }

        let filter = {};
        if (categories.length > 0) {
            filter = { category: { $in: categories } };
        }

        // Exclude user's own items
        filter.seller = { $ne: req.user._id };

        const recommendations = await Item.find(filter)
            .limit(8)
            .sort({ createdAt: -1 })
            .populate('seller', 'name');

        // If not enough recommendations, pad with newest items
        if (recommendations.length < 4) {
            const extraItems = await Item.find({ seller: { $ne: req.user._id } })
                .limit(8 - recommendations.length)
                .sort({ createdAt: -1 })
                .populate('seller', 'name');

            recommendations.push(...extraItems.filter(item => !recommendations.some(r => r._id.equals(item._id))));
        }

        res.json(recommendations);
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
};
