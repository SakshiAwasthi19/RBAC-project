const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary.config');

// File Filter (Images and PDFs only)
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
};

const fs = require('fs');
const path = require('path');

// Check if Cloudinary keys are configured
const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

// Local Storage Fallback
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

// Helper to create storage based on config
const getStorage = (folder, allowedFormats) => {
    if (isCloudinaryConfigured) {
        return new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: `pointmate/${folder}`,
                allowed_formats: allowedFormats,
                resource_type: 'auto',
            },
        });
    } else {
        console.warn(`Cloudinary not configured. Using local storage for ${folder}.`);
        return localStorage;
    }
};

// 1. Certificate Storage
const certificateStorage = getStorage('certificates', ['jpg', 'jpeg', 'png', 'pdf']);

exports.uploadCertificate = multer({
    storage: certificateStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter,
});

// 2. Poster Storage
// For posters, Cloudinary has transformation params which we lose in local storage, which is fine for dev.
const posterStorage = isCloudinaryConfigured ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pointmate/posters',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1200, height: 630, crop: 'limit', quality: 'auto' }],
    },
}) : localStorage;

exports.uploadPoster = multer({
    storage: posterStorage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed for posters'), false);
    },
});

// 3. Profile Storage
const profileStorage = isCloudinaryConfigured ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pointmate/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
}) : localStorage;

exports.uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed for profile pictures'), false);
    },
});

// Error Handling Middleware
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File too large.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};
