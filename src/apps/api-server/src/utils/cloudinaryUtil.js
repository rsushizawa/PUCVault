const cloudinary = require('cloudinary').v2;
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

const result = require('dotenv').config({ path: envPath });

console.log('--- DOTENV DEBUG ---');
console.log('Path searched:', envPath);
if (result.error) {
  console.log('Error loading .env:', result.error.message);
} else {
  console.log('CLOUDINARY_SECRET loaded:', process.env.CLOUDINARY_SECRET ? 'YES' : 'NO');
}
console.log('--------------------');

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
