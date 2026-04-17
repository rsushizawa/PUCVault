const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware');



router.post('/create', authMiddleware, tagController.createTags);

router.patch('/:tag_id/validate',
  authMiddleware, tagController.validateTags
);

router.patch('/:user_id/print',
  tagController.printUserTags
);

module.exports = router;
