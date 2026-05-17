const express = require("express");
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const { all } = require('../middlewares/uploadMiddleware');

router.post('/:forum_id/create',
  authMiddleware,
  all.array('file', 10),
  postController.createPosts
);

router.get('/:forum_id/page/:page_num',
  postController.getPosts
);


router.post('/:father_id/comments/create',
  authMiddleware,
  postController.createComment
);

router.get('/:post_id',
  postController.getSinglePost,
);

router.get('/:post_id/files',
  postController.getFileFromPost,
);

router.get('/:post_id/comments',
  postController.listComments
);

router.get('/user/:user_id',
  postController.userPosts
);

router.delete('/:post_id/delete',
  authMiddleware,
  postController.deletePost
);


router.patch(':content_id/rate',
  authMiddleware,
  postController.rateContent
);

module.exports = router;
