const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');
const optionalauthMiddleware = require('../middlewares/optionalauthMiddleware');

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

router.get('/by-username/:username',
  userController.userByUsername
);

router.get('/:user_id/forums',
  userController.followedForums
);

router.get('/:target_id/is-following',
  authMiddleware,
  userController.isFollowing
);

router.get('/:user_id/forum-follow/:forum_id',
  userController.checkForumFollow
);

router.get('/:user_id',
  optionalauthMiddleware,
  userController.userInfo
);

router.patch('/:user_id/description',
  authMiddleware,
  userController.changeDescription
);

router.patch('/toggle-2fa',
  authMiddleware,
  userController.toggle2FA
);

router.delete('/delete',
  authMiddleware,
  userController.deleteAccount
);
module.exports = router;
