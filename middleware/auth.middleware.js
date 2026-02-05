const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Generate JWT Token
exports.generateToken = (userId, userType) => {
    return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Protect routes
exports.authenticate = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists and is active
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is deactivated' });
        }

        // Attach user to request
        req.user = {
            userId: user._id,
            email: user.email,
            userType: user.userType
        };

        next();
    } catch (err) {
        console.error('Auth Error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.userType)) {
            return res.status(403).json({
                message: `Access denied. Only ${roles.join(', ')} can access this resource.`,
            });
        }
        next();
    };
};
