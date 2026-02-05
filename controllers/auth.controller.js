const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Organization = require('../models/Organization.model');
const { generateToken } = require('../middleware/auth.middleware');

// @desc    Register a new user (Student or Organization)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, userType, ...profileData } = req.body;

        // 1. Validation
        if (!email || !password || !userType) {
            return res.status(400).json({ success: false, message: 'Please provide email, password and user type' });
        }

        if (!['student', 'organization'].includes(userType)) {
            return res.status(400).json({ success: false, message: 'Invalid user type' });
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // 3. Create User
        const user = await User.create({
            email,
            password,
            userType
        });

        // 4. Create Profile based on userType
        let profile;
        try {
            if (userType === 'student') {
                // Check for unique studentId (USN) if provided, though model handles unique constraint
                // If USN conflict happens, database will throw error caught below.
                profile = await Student.create({
                    userId: user._id,
                    email: user.email, // Store email in profile as well per schema
                    ...profileData
                });
            } else if (userType === 'organization') {
                profile = await Organization.create({
                    userId: user._id,
                    organizationEmail: user.email,
                    ...profileData
                });
            }
        } catch (profileError) {
            // Rollback user creation if profile creation fails
            await User.findByIdAndDelete(user._id);

            // Handle unique constraint violations specifically for better messages
            if (profileError.code === 11000) {
                const field = Object.keys(profileError.keyPattern)[0];
                return res.status(400).json({ success: false, message: `Duplicate value for ${field}. Please use unique credentials.` });
            }

            throw profileError; // Re-throw to be caught by main catch block
        }

        // 5. Generate Token
        const token = generateToken(user._id, user.userType);

        // 6. Response
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType
            },
            profile
        });

    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // 2. Find User (explicitly select password)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 4. Check if active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
        }

        // 5. Get Profile
        let profile;
        if (user.userType === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.userType === 'organization') {
            profile = await Organization.findOne({ userId: user._id });
        }

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // 6. Update Last Login
        await user.updateLastLogin();

        // 7. Generate Token
        const token = generateToken(user._id, user.userType);

        // 8. Response
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                userType: user.userType
            },
            profile
        });

    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        let profile;
        if (user.userType === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.userType === 'organization') {
            profile = await Organization.findOne({ userId: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (err) {
        console.error('Get Me Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }

        // Get user with password
        const user = await User.findById(req.user.userId).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (err) {
        console.error('Change pwd Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
