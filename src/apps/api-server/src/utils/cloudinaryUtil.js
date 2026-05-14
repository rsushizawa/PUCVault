const cloudinary = require('cloudinary').v2;
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');

const result = require('dotenv').config({ path: envPath });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const findFolder = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'Home/images';
  }
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('msword')) {
    return 'Home/documents';
  }
  return 'Home/source_codes';
};


const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const folderDestiny = findFolder(file.mimetype);
    const extensao = file.originalname.split('.').pop();
    const publicIdComExtensao = `file_${Date.now()}.${extensao}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderDestiny,
        resource_type: "raw",
        public_id: publicIdComExtensao,
        use_filename: true,
        unique_filename: true,
        timeout: 60000
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
