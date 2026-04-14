const Organization = require('../models/Organization.model');
const Event = require('../models/Event.model');
const Activity = require('../models/Activity.model');
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const Registration = require('../models/Registration.model');

// ──────────────────────────────────────────────
// 1. Organization Management
// ──────────────────────────────────────────────

// @desc    Get all organizations (optionally filter by verificationStatus)
// @route   GET /api/admin/organizations
// @access  Admin
exports.getAllOrganizations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.verificationStatus = status;

        const skip = (page - 1) * limit;
        const total = await Organization.countDocuments(filter);

        const organizations = await Organization.find(filter)
            .populate('userId', 'email isActive isVerified lastLogin')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                organizations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Admin - Get Orgs Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update organization verification status
// @route   PATCH /api/admin/organizations/:orgId/status
// @access  Admin
exports.updateOrganizationStatus = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { status, remarks } = req.body;

        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, verified, or rejected.' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        organization.verificationStatus = status;
        await Organization.findByIdAndUpdate(orgId, { verificationStatus: status }, { runValidators: false });

        // Notify the organization if a user account is linked
        if (organization.userId) {
            await Notification.create({
                recipientId: organization.userId,
                title: status === 'verified' ? 'Organization Verified!' : 'Organization Status Updated',
                message: status === 'verified'
                    ? 'Your organization has been verified by an admin. You can now create events.'
                    : `Your organization status has been updated to "${status}".${remarks ? ' Remarks: ' + remarks : ''}`,
                type: status === 'verified' ? 'success' : 'info',
            });
        }

        res.status(200).json({
            success: true,
            message: `Organization status updated to "${status}"`,
            data: organization
        });
    } catch (error) {
        console.error('Admin - Update Org Status Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete an organization and its associated data
// @route   DELETE /api/admin/organizations/:orgId
// @access  Admin
exports.deleteOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        // Delete associated User account
        if (organization.userId) {
            await User.findByIdAndDelete(organization.userId);
        }

        // Find all events hosted by this organization
        const events = await Event.find({ organizationId: orgId });
        const eventIds = events.map(e => e._id);

        if (eventIds.length > 0) {
            // Delete all registrations for these events
            await Registration.deleteMany({ eventId: { $in: eventIds } });
            
            // Delete all activities linked to these events
            await Activity.deleteMany({ eventId: { $in: eventIds } });

            // Delete all events hosted by this organization
            await Event.deleteMany({ _id: { $in: eventIds } });
        }

        // Finally delete the organization profile
        await Organization.findByIdAndDelete(orgId);

        res.status(200).json({ success: true, message: 'Organization deleted along with its user account and events' });
    } catch (error) {
        console.error('Admin - Delete Org Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ──────────────────────────────────────────────
// 2. Event Monitoring
// ──────────────────────────────────────────────

// @desc    Get all events (optionally filter by status, domain)
// @route   GET /api/admin/events
// @access  Admin
exports.getAllEvents = async (req, res) => {
    try {
        const { status, domain, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (domain) filter.domain = domain;

        const skip = (page - 1) * limit;
        const total = await Event.countDocuments(filter);

        const events = await Event.find(filter)
            .populate('organizationId', 'institutionName organizationEmail verificationStatus')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Admin - Get Events Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete an event (moderation)
// @route   DELETE /api/admin/events/:eventId
// @access  Admin
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Remove from organization's eventsHosted
        await Organization.findByIdAndUpdate(event.organizationId, {
            $pull: { eventsHosted: event._id }
        });

        await Event.findByIdAndDelete(eventId);

        res.status(200).json({ success: true, message: 'Event deleted by admin' });
    } catch (error) {
        console.error('Admin - Delete Event Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ──────────────────────────────────────────────
// 3. Activity / Points Verification
// ──────────────────────────────────────────────

// @desc    Get all activities (optionally filter by status)
// @route   GET /api/admin/activities
// @access  Admin
exports.getAllActivities = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const total = await Activity.countDocuments(filter);

        const activities = await Activity.find(filter)
            .populate('studentId', 'firstName lastName email studentId')
            .populate('eventId', 'title domain')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                activities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Admin - Get Activities Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve or reject a student activity
// @route   PATCH /api/admin/activities/:activityId/status
// @access  Admin
exports.updateActivityStatus = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { status, remarks } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
        }

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        activity.status = status;
        if (remarks) activity.remarks = remarks;
        await activity.save();

        // Notify the student
        const student = await Student.findById(activity.studentId);
        if (student) {
            // [SYNC] Find and update the activity in the embedded student array
            // Since double-writing started after some legacy data might exist, 
            // we match by title and date as a fallback, or use eventId/time.
            console.log(`[SYNC] Looking for activity "${activity.title}" in student "${student.firstName}" profile...`);
            
            const studentActivity = student.activities.find(a => {
                const titleMatch = a.title.toLowerCase().trim() === activity.title.toLowerCase().trim();
                const dateMatch = new Date(a.date).toDateString() === new Date(activity.date).toDateString();
                const eventMatch = a.eventId && activity.eventId && a.eventId.toString() === activity.eventId.toString();
                
                return eventMatch || (titleMatch && dateMatch);
            });

            if (studentActivity) {
                console.log(`[SYNC] Match found! Updating internal status to ${status}`);
                studentActivity.status = status;
                if (remarks) studentActivity.remarks = remarks;
            } else {
                console.warn(`[SYNC] No matching activity found in student's embedded array for "${activity.title}"`);
                console.debug(`[SYNC] Activity count in student: ${student.activities.length}`);
                student.activities.forEach((a, i) => console.debug(`  ${i}: [${a.status}] ${a.title} (${new Date(a.date).toDateString()})`));
            }

            // Recalculate points
            student.calculateTotalPoints();
            await student.save();

            await Notification.create({
                recipientId: student.userId,
                title: status === 'approved' ? 'Activity Approved by Admin!' : 'Activity Rejected by Admin',
                message: status === 'approved'
                    ? `Your submission "${activity.title}" has been approved. +${activity.aictePoints} points awarded.`
                    : `Your submission "${activity.title}" was rejected.${remarks ? ' Remarks: ' + remarks : ''}`,
                type: status === 'approved' ? 'success' : 'warning',
                link: '/student/activity-log',
            });
        }

        res.status(200).json({
            success: true,
            message: `Activity ${status} successfully`,
            data: activity
        });
    } catch (error) {
        console.error('Admin - Update Activity Status Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ──────────────────────────────────────────────
// 4. Dashboard / Stats
// ──────────────────────────────────────────────

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalStudents,
            totalOrganizations,
            pendingOrgs,
            verifiedOrgs,
            totalEvents,
            totalActivities,
            pendingActivities
        ] = await Promise.all([
            User.countDocuments({ userType: 'student' }),
            Organization.countDocuments(),
            Organization.countDocuments({ verificationStatus: 'pending' }),
            Organization.countDocuments({ verificationStatus: 'verified' }),
            Event.countDocuments(),
            Activity.countDocuments(),
            Activity.countDocuments({ status: 'pending' }),
        ]);

        // Recent pending organizations
        const recentPendingOrgs = await Organization.find({ verificationStatus: 'pending' })
            .populate('userId', 'email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent pending activities
        const recentPendingActivities = await Activity.find({ status: 'pending' })
            .populate('studentId', 'firstName lastName email studentId')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalOrganizations,
                    pendingOrgs,
                    verifiedOrgs,
                    totalEvents,
                    totalActivities,
                    pendingActivities,
                },
                recentPendingOrgs,
                recentPendingActivities,
            }
        });
    } catch (error) {
        console.error('Admin - Dashboard Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
