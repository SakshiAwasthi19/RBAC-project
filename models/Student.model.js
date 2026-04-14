const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: true, // Redundant but good for quick access
    },
    studentId: {
        type: String,
        required: [true, 'Student ID (USN) is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    collegeName: {
        type: String,
        required: [true, 'College name is required'],
    },
    year: {
        type: String,
    },
    branch: {
        type: String,
    },
    semester: {
        type: Number,
        default: 1,
        min: 1,
        max: 8,
    },
    graduationYear: {
        type: String,
    },
    school_id: {
        type: String,
        required: false,
        index: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    address: {
        type: String,
    },
    profilePicture: {
        url: String,
        publicId: String,
    },
    activities: [{
        title: { type: String, required: true },
        description: String,
        domain: {
            type: String,
            enum: ['Technical', 'Soft Skills', 'Community Service', 'Cultural', 'Sports', 'Environmental'],
            required: true
        },
        aictePoints: { type: Number, required: true },
        date: { type: Date, required: true },
        semester: { type: Number, required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        remarks: String,
        certificates: [{
            url: String,
            publicId: String,
            uploadedAt: Date
        }],
        photos: [{
            url: String,
            publicId: String,
            uploadedAt: Date
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    registeredEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    totalPoints: {
        type: Number,
        default: 0,
    },
    semesterWisePoints: {
        type: [{
            semester: { type: Number, required: true },
            points: { type: Number, default: 0 },
        }],
        default: Array.from({ length: 8 }, (_, i) => ({ semester: i + 1, points: 0 })),
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere',
        },
        address: String,
        city: String,
        state: String,
        pincode: String,
    },
}, { 
    timestamps: true 
});

// Index for geospacial queries
StudentSchema.index({ location: '2dsphere' });

// Method to calculate total points & semester-wise distribution
StudentSchema.methods.calculateTotalPoints = function () {
    // Filter for approved activities
    const approvedActivities = this.activities.filter(a => a.status === 'approved');

    // 1. Total Points - with robust NaN handling
    this.totalPoints = approvedActivities.reduce((sum, act) => {
        const points = Number(act.aictePoints) || 0;
        return sum + points;
    }, 0);

    // 2. Semester Wise Points
    // Reset to 0 first (ensure 8 semesters exist)
    if (!this.semesterWisePoints || this.semesterWisePoints.length !== 8) {
        this.semesterWisePoints = Array.from({ length: 8 }, (_, i) => ({ semester: i + 1, points: 0 }));
    } else {
        this.semesterWisePoints.forEach(p => p.points = 0);
    }

    // Aggregation
    approvedActivities.forEach(act => {
        if (act.semester >= 1 && act.semester <= 8) {
            const index = act.semester - 1;
            if (this.semesterWisePoints[index]) {
                const points = Number(act.aictePoints) || 0;
                this.semesterWisePoints[index].points += points;
            }
        }
    });

    return this.totalPoints;
};

// Method to get progress
StudentSchema.methods.getProgress = function () {
    const target = 100;
    this.calculateTotalPoints();
    return {
        current: this.totalPoints,
        target,
        percentage: Math.min((this.totalPoints / target) * 100, 100),
        remaining: Math.max(target - this.totalPoints, 0),
    };
};

module.exports = mongoose.model('Student', StudentSchema);
