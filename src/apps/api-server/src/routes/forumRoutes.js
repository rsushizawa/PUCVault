const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

const authMiddleware = require('../middlewares/authMiddleware');
const optionalauthMiddleware = require('../middlewares/optionalauthMiddleware');

router.get('/print/forums', forumController.print);

router.patch('/:forum_id/update',
  authMiddleware,
  forumController.updateForumDescription
);

router.post('/create', authMiddleware, forumController.createForum);

router.patch('/:forum_id/validate',
  authMiddleware,
  forumController.validateForum
);

router.patch('/:forum_id/page/:page_num',
  forumController.files
);

router.post('/:forum_id/follow',
  authMiddleware,
  forumController.follow
);

router.get('/:forum_id/list',
  forumController.listForumFollowers
);

router.patch('/:forum_id/files/page/:page_num',
  forumController.files
);

router.get('/:forum_id/files/year',
  forumController.listForumFilesYear
);

router.get('/:forum_id/files/year/:year',
  forumController.listTagsFilesYear
);

router.get('/:forum_id/files/year/:year/tag/:tag',
  forumController.listPostFilesYear
);

router.get('/by-name/:name', forumController.getForumByName);

router.get('/:forum_id',
  optionalauthMiddleware,
  forumController.getSingleForum
);

module.exports = router;
