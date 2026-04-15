const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/:user_id/change_role',
  authMiddleware,
  userController.changeRole
);


router.patch('/:target_id/follow',
  authMiddleware,
  userController.follow
);


module.exports = router;
