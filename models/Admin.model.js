const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    permissions: {
        manageOrganizations: { type: Boolean, default: true },
        manageEvents: { type: Boolean, default: true },
        manageActivities: { type: Boolean, default: true },
        manageUsers: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Admin', AdminSchema);
