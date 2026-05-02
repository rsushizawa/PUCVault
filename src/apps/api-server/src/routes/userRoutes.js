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

router.get('/me',
  authMiddleware,
  userController.me
);

router.get(':user_id',
  userController.userInfo
);


module.exports = router;
