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


const uploadToCloudinary = async (file, context = "") => {
  return new Promise((resolve, reject) => {
    const folderDestiny = findFolder(file.mimetype);

    // CORREÇÃO: O public_id deve ser limpo, sem o ".extensao" no final
    const publicIdSemExtensao = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const directory = context ? `${folderDestiny}/${context}` : folderDestiny;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: directory,
        resource_type: "auto",
        public_id: publicIdSemExtensao, // <--- Enviando o ID limpo
        use_filename: true,
        unique_filename: true,
        timeout: 60000
      },
      (error, result) => {
        if (error) return reject(error);
        // Retorna o public_id completo com as pastas (ex: Home/images/profile/perfil/file_177888)
        resolve(result.public_id);
      }
    );
    uploadStream.end(file.buffer);
  });
};

module.exports = { uploadToCloudinary };
