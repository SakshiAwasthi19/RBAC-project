const express = require('express');
const router = express.Router();
const {
    getAllOrganizations,
    updateOrganizationStatus,
    deleteOrganization,
    getAllEvents,
    deleteEvent,
    getAllActivities,
    updateActivityStatus,
    getDashboard,
} = require('../controllers/admin.controller');
const { authenticate, authorize: authorizeRoles } = require('../middleware/auth.middleware');

// All routes require authentication and 'admin' role
router.use(authenticate, authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Organization Management
router.get('/organizations', getAllOrganizations);
router.patch('/organizations/:orgId/status', updateOrganizationStatus);
router.delete('/organizations/:orgId', deleteOrganization);

// Event Monitoring
router.get('/events', getAllEvents);
router.delete('/events/:eventId', deleteEvent);

// Activity / Points Verification
router.get('/activities', getAllActivities);
router.patch('/activities/:activityId/status', updateActivityStatus);

module.exports = router;
