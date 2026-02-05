const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
