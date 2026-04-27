const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    deleteUser,
    getAllItems,
    approveItem,
    removeItem,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Item management
router.get('/items', getAllItems);
router.put('/items/:id/approve', approveItem);
router.delete('/items/:id', removeItem);

module.exports = router;
