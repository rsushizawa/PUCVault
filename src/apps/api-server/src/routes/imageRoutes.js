const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const imgController = require('../controllers/imageController');

const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/upload/:location',
  authMiddleware,
  upload.single('file'),
  imgController.uploadImage
);

router.get('/get/:user_id',
  imgController.getImageUrl
);

module.exports = router;
