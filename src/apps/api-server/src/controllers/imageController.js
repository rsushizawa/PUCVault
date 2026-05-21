const imgService = require('../services/imageServices');
const userService = require('../services/userServices');
const forumService = require('../services/forumServices');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinaryUtil');
const envPath = path.resolve(__dirname, '../../src/.env');
require('dotenv').config({ path: envPath });

const { ok, paginated, fail } = require('../helpers/response');
const cloudinary = require('cloudinary').v2;
const placeholder = 'abc-123';

exports.uploadImageUser = async (req, res) => {
  try {
    const { location } = req.params;
    const user = req.user;
    const user_id = user.id;
    const imageFile = req.file;

    const result = await userService.getUserInfo(user_id);
    const usr = result.rows && result.rows[0];

    // CORREÇÃO: Validação de existência movida para antes de ler propriedades
    if (!usr) {
      console.log(`⚠️ ALERTA: O ID de usuário ${user_id} enviado pelo Token não foi encontrado no Banco de Dados.`);
      return res.status(404).json({
        message: 'usuário não encontrado no banco de dados',
        debug_user_id: user_id
      });
    }

    const visualidentity_id = usr.identidade_visual;
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

    const context = `profile/${location}`;
    const newImageId = await imgService.uploadImage(visualidentity_id, location, imageFile, context);

    console.log('new image id: ', newImageId);
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

exports.uploadImageForum = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { forum_id, location } = req.params;
    const imageFile = req.file;

    const result = await forumService.getSingleForum(forum_id);
    const forum = result.rows && result.rows[0];
    if (!forum) {
      return res.status(404).json({ message: 'fórum não encontrado' });
    }

    const validLocations = ['banner', 'perfil'];
    if (!validLocations.includes(location)) {
      return res.status(400).json({ message: 'localizacao inválida' });
    }

    if (!imageFile) {
      return res.status(400).json({ message: 'arquivo ausente' });
    }

    // CORREÇÃO: Removido o [0] daqui pois forum já é o objeto da linha
    const currentImageId = location === 'perfil' ? forum.img_perfil : forum.img_banner;

    console.log("ID da imagem antiga do fórum:", currentImageId);

    if (currentImageId && currentImageId != placeholder) {
      console.log(`Attempting to destroy: ${currentImageId}`);
      const deletionResult = await cloudinary.uploader.destroy(currentImageId, {
        resource_type: 'image',
        invalidate: true
      });
      console.log('Cloudinary Deletion Result:', deletionResult);
    }

    const context = `forum/${location}`;
    const newImageId = await imgService.uploadImageForum(forum_id, user_id, location, imageFile, context);

    return ok(res, { imageId: newImageId });

  } catch (error) {
    console.error('--- CONTROLLER ERROR ---');
    console.error(error);
    return fail(res, 500, 'erro interno ao processar imagem');
  }
};

exports.getImageUrlUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await userService.getUserInfo(user_id);
    const user = result.rows ? result.rows[0] : (Array.isArray(result) ? result[0] : result);

    if (!user) {
      return res.status(404).json({ message: 'image not found' });
    }

    const responseData = {};

    if (user.img_perfil && user.img_perfil !== placeholder) {
      responseData.img_perfil = cloudinary.url(user.img_perfil, {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
        secure: true,
        fetch_format: "auto"
      });
    } else {
      responseData.img_perfil = null;
    }

    if (user.img_banner && user.img_banner !== placeholder) {
      responseData.img_banner = cloudinary.url(user.img_banner, {
        width: 1200,
        height: 400,
        crop: "fill",
        secure: true,
        fetch_format: "auto"
      });
    } else {
      responseData.img_banner = null;
    }

    res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: 'erro interno ao processar imagem' });
  }
};

exports.getImageUrlForum = async (req, res) => {
  try {
    const { forum_id } = req.params;
    const result = await forumService.getSingleForum(forum_id);
    const forum = result.rows ? result.rows[0] : (Array.isArray(result) ? result[0] : result);

    if (!forum) {
      return res.status(404).json({ message: 'image not found' });
    }

    const responseData = {};

    if (forum.img_perfil && forum.img_perfil !== placeholder) {
      responseData.img_perfil = cloudinary.url(forum.img_perfil, {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
        secure: true,
        fetch_format: "auto"
      });
    } else {
      responseData.img_perfil = null;
    }

    if (forum.img_banner && forum.img_banner !== placeholder) {
      responseData.img_banner = cloudinary.url(forum.img_banner, {
        width: 1200,
        height: 400,
        crop: "fill",
        secure: true,
        fetch_format: "auto"
      });
    } else {
      responseData.img_banner = null;
    }

    res.status(200).json(responseData);
  } catch (error) {
    return fail(res, 500, 'erro interno ao processar imagem');
  }
};
