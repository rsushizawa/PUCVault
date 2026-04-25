const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:forum_id/create',
  authMiddleware,
  postController.createPosts
);

router.get('/:forum_id/page/:page_num',
  postController.getPosts
);


router.post('/:father_id/comments/create',
  authMiddleware,
  commentController.createComment
);

router.get('/:post_id/comments', commentController.listComments);



module.exports = router;
