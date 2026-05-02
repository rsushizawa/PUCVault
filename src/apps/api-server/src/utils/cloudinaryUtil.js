const cloudinary = require('cloudinary').v2;
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

const result = require('dotenv').config({ path: envPath });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "user_uploads",
        resource_type: "auto"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.public_id);
      }
    );
    uploadStream.end(file.buffer);
  });
};

module.exports = { uploadToCloudinary };
