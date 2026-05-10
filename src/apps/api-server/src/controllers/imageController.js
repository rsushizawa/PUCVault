const imgService = require('../services/imageServices');
const userService = require('../services/userServices');
const { ok, fail } = require('../helpers/response');
const path = require('path');
const envPath = path.resolve(__dirname, '../../src/.env');
require('dotenv').config({ path: envPath });

const cloudinary = require('cloudinary').v2;

const placeholder = 'abc-123';


exports.uploadImage = async (req, res) => {
  try {
    const { location } = req.params;
    const user = req.user;
    const user_id = user.id;
    const imageFile = req.file;
    const visualidentity_id = user.identidade_visual;

    const result = await userService.getUserInfo(user_id);
    const usr = result.rows && result.rows[0];

    const validLocations = ['banner', 'perfil'];
    if (!validLocations.includes(location)) {
      return fail(res, 400, 'localizacao inválida');
    }

    if (!imageFile) {
      return fail(res, 400, 'arquivo ausente');
    }

    const currentImageId = location === 'perfil' ? usr.img_perfil : usr.img_banner;

    console.log(currentImageId);

    if (currentImageId && currentImageId != placeholder) {
      console.log(`Attempting to destroy: ${currentImageId}`);

      const deletionResult = await cloudinary.uploader.destroy(currentImageId, {
        resource_type: 'image',
        invalidate: true
      });

      console.log('Cloudinary Deletion Result:', deletionResult);
    }


    const newImageId = await imgService.uploadImage(visualidentity_id, location, imageFile);

    return ok(res, { imageId: newImageId });

  } catch (error) {
    console.error('--- CONTROLLER ERROR ---');
    console.error(error);
    return fail(res, 500, 'erro interno ao processar imagem');
  }
};

exports.getImageUrl = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await userService.getUserInfo(user_id);
    const user = result.rows && result.rows[0];

    if (!user || !user.img_perfil) {
      return fail(res, 404, 'image not found');
    }

    const img_perfil = cloudinary.url(user.img_perfil, {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "face",
      secure: true
    });

    const img_banner = cloudinary.url(user.img_banner, {
      width: 1500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      secure: true
    });

    return ok(res, { img_perfil, img_banner });
  } catch (error) {
    return fail(res, 500, 'erro interno ao processar imagem');
  }
};
