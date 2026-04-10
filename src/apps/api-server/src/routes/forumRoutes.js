const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/:forum_id/description',
  authMiddleware,
  forumController.updateForumDescription
);

router.post('/create', authMiddleware, forumController.createForum);



module.exports = router;
