const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const { all } = require('../middlewares/uploadMiddleware');

router.post('/:forum_id/create',
  authMiddleware,
  all.single('file'),
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


router.patch('/:content_id/upvote',
  authMiddleware,
  postController.upvoteContent
);

router.patch('/:content_id/downvote',
  authMiddleware,
  postController.downvoteContent
);

module.exports = router;
