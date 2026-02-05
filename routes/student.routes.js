const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    getDashboard,
    getPointsSummary,
    getActivityLog,
    addActivity,
    deleteActivity,
    uploadCertificate,
    getCertificates,
    deleteCertificate,
    getNotifications,
    markNotificationsRead,
    clearNotifications
} = require('../controllers/student.controller');
const { authenticate, authorize: authorizeRoles } = require('../middleware/auth.middleware');
const { uploadProfile, uploadCertificate: uploadCertMiddleware, handleUploadError } = require('../middleware/upload.middleware');

// Routes apply to students only
router.use(authenticate, authorizeRoles('student'));

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/picture', uploadProfile.single('profilePicture'), uploadProfilePicture, handleUploadError);

// Dashboard & Points
router.get('/dashboard', getDashboard);
router.get('/points', getPointsSummary);

// Activity Management
router.get('/activities', getActivityLog);
router.post('/activities', addActivity);
router.delete('/activities/:activityId', deleteActivity);
router.get('/certificates', getCertificates);
router.post('/activities/:activityId/upload', uploadCertMiddleware.single('file'), uploadCertificate, handleUploadError);
router.delete('/activities/:activityId/certificates/:certificateId', deleteCertificate);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsRead);
router.delete('/notifications', clearNotifications);

module.exports = router;
