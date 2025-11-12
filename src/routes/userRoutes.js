const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes are protected
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', UserController.getAllUsers);

// Get single user
router.get('/:userId', UserController.getUser);

// Create user (admin only)
router.post('/', UserController.createUser);

// Update user
router.put('/:userId', UserController.updateUser);

// Delete user (admin only)
router.delete('/:userId', UserController.deleteUser);

module.exports = router;
