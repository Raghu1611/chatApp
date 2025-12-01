const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const config = require('../config/env');
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

// Use disk storage for temporary file handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

async function uploadToCloudinary(filePath) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'chatapp_uploads',
            use_filename: true,
            resource_type: 'auto',
        });
        // Remove file from local storage after upload
        fs.unlinkSync(filePath);
        return result.secure_url;
    } catch (error) {
        // Remove file even if upload fails
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw error;
    }
}

module.exports = { upload, uploadToCloudinary };
