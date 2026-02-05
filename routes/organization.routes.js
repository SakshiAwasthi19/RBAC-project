const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    uploadLogo,
    getDashboard,
    createEvent,
    getMyEvents,
    getEventRegistrations,
    deleteEvent,
    updateRegistrationStatus,
    markAttendance,
    reviewActivity
} = require('../controllers/organization.controller');
const { authenticate, authorize: authorizeRoles } = require('../middleware/auth.middleware');
const { uploadProfile, uploadPoster, handleUploadError } = require('../middleware/upload.middleware');

// All routes require authentication and 'organization' role
router.use(authenticate, authorizeRoles('organization'));

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/logo', uploadProfile.single('organizationLogo'), uploadLogo, handleUploadError);

// Dashboard
router.get('/dashboard', getDashboard);

// Event Management
router.post('/events', uploadPoster.single('poster'), createEvent, handleUploadError);
router.get('/events', getMyEvents);
router.get('/events/:eventId/registrations', getEventRegistrations);
router.delete('/events/:eventId', deleteEvent);
router.patch('/events/:eventId/registrations/:studentId', updateRegistrationStatus);
router.patch('/events/:eventId/attendance/:studentId', markAttendance);
router.patch('/review-activity/:studentId/:activityId', reviewActivity);

module.exports = router;
