const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const { all } = require('../middlewares/uploadMiddleware');
const optionalauthMiddleware = require('../middlewares/optionalauthMiddleware');

router.post('/:forum_id/create',
  authMiddleware,
  all.array('file', 10),
  postController.createPosts
);

router.get('/:forum_id/page/:page_num',
  optionalauthMiddleware,
  postController.getPosts
);


router.post('/:father_id/comments/create',
  authMiddleware,
  postController.createComment
);

router.get('/:post_id',
  optionalauthMiddleware,
  postController.getSinglePost,
);

router.get('/:post_id/files',
  postController.getFileFromPost,
);

router.get('/:post_id/comments',
  postController.listComments
);

router.get('/user/:user_id',
  optionalauthMiddleware,
  postController.userPosts
);

router.delete('/:post_id/delete',
  authMiddleware,
  postController.deletePost
);


router.patch('/rate-content',
  authMiddleware,
  postController.rateContent
);


module.exports = router;
