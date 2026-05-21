const express = require('express');
const router = express.Router();
const imgController = require('../controllers/imageController');

const { onlyImage } = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.patch('/upload/:location',
  authMiddleware,
  onlyImage.single('file'),
  imgController.uploadImageUser
);

router.get('/get/user/:user_id',
  imgController.getImageUrlUser
);

router.patch('/:forum_id/upload/:location',
  authMiddleware,
  roleMiddleware(['SUPERADMIN']),
  onlyImage.single('file'),
  imgController.uploadImageForum
);

router.get('/get/forum/:forum_id',
  imgController.getImageUrlForum
);


module.exports = router;
