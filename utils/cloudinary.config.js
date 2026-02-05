const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `pointmate/${folder}`,
            resource_type: 'auto',
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};

exports.deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return false;
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        return false;
    }
};

exports.deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        if (!publicIds || publicIds.length === 0) return false;
        await cloudinary.api.delete_resources(publicIds);
        return true;
    } catch (error) {
        console.error('Cloudinary Multiple Delete Error:', error);
        return false;
    }
};

module.exports = {
    cloudinary,
    ...exports
};
