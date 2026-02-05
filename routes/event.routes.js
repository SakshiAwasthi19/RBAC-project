const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getNearbyEvents,
    getEventById,
    registerForEvent,
    getEventPass
} = require('../controllers/event.controller');
const { authenticate, authorize: authorizeRoles } = require('../middleware/auth.middleware');

// Public Routes
router.get('/', getAllEvents);

// Protected Routes (Student Only) - Specific paths first!
router.get('/nearby', authenticate, authorizeRoles('student'), getNearbyEvents);

// Parameterized Routes
router.get('/:eventId', getEventById); // Public
router.post('/:eventId/register', authenticate, authorizeRoles('student'), registerForEvent);
router.get('/:eventId/pass', authenticate, authorizeRoles('student'), getEventPass);

module.exports = router;
