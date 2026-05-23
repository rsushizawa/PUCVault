const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/page/:page_num',
  authMiddleware,
  feedController.getFeed
);


module.exports = router;
