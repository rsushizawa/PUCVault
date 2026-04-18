const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/:forum_id/create',
  authMiddleware,
  postController.createPosts
);

router.get('/:forum_id',
  postController.getPosts
);

module.exports = router;
