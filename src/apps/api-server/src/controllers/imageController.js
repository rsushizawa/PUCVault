const imgService = require('../services/imageServices');
const userService = require('../services/userServices');
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');
require('dotenv').config({ path: envPath });

const cloudinary = require('cloudinary').v2;


exports.uploadImage = async (req, res) => {
  try {
    const { location } = req.params;
    const visualidentity_id = req.user.identidade_visual;
    const imageFile = req.file;

    const validLocations = ['banner', 'perfil'];
    if (!validLocations.includes(location)) {
      return res.status(400).json({ message: 'localizacao inválida' });
    }

    if (!imageFile) {
      return res.status(400).json({ message: 'arquivo ausente' });
    }


    console.log(`Attempting to update ${location} for Visual Identity ID: ${visualidentity_id}`);

    const newImageId = await imgService.uploadImage(visualidentity_id, location, imageFile);

    // 3. Success Response
    // We send back the ID we just got from Cloudinary/DB
    res.status(200).json({
      message: 'success',
      imageId: newImageId
    });

  } catch (error) {
    console.error('--- CONTROLLER ERROR ---');
    console.error(error);
    return res.status(500).json({ message: 'erro interno ao processar imagem' });
  }
};
exports.getImageUrl = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await userService.getUserInfo(user_id);
    const user = result.rows && result.rows[0];

    if (!user || !user.img_perfil) {
      return res.status(404).json({ message: 'image not found' });
    }

    const url = cloudinary.url(user.img_perfil, {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "face",
      secure: true
    });
    res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ message: 'erro interno ao processar imagem' });
  }
};
