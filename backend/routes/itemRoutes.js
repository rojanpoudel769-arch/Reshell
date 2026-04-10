const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getRecommendations,
    getRelatedItems,
    toggleSaveItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with search & filtering
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Item created
 */
router.route('/')
    .get(getItems)
    .post(protect, createItem);

/**
 * @swagger
 * /api/items/recommendations:
 *   get:
 *     summary: Get recommended items for a user
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended items
 */
router.route('/recommendations').get(protect, getRecommendations);

/**
 * @swagger
 * /api/items/{id}/save:
 *   post:
 *     summary: Toggle save an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Action successful
 */
router.route('/:id/save').post(protect, toggleSaveItem);

/**
 * @swagger
 * /api/items/{id}/related:
 *   get:
 *     summary: Get related items in the same category
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of related items
 */
router.route('/:id/related').get(getRelatedItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item updated
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 */
router.route('/:id')
    .get(getItemById)
    .put(protect, updateItem)
    .delete(protect, deleteItem);

module.exports = router;
