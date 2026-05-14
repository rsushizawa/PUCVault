const express = require('express');
const router = express.Router();
const imgController = require('../controllers/imageController');

const { onlyImage } = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/upload/:location',
  authMiddleware,
  onlyImage.single('file'),
  imgController.uploadImage
);

router.get('/get/:user_id',
  imgController.getImageUrl
);

module.exports = router;
