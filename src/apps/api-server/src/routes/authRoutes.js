const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.get('/print/logins',
  authController.print
);

router.post('/login',
  authController.login
);

router.post('/verify-login',
  authController.verifyLogin
);

router.post('/sign-in',
  authController.signin
);

router.post('/verify-sign-in',
  authController.verifySignup
);

// No authMiddleware: logout must succeed even with an expired/invalid token.
router.post('/logout',
  authController.logout
);

router.patch('/change-password',
  authMiddleware,
  authController.changePassword
);

router.post('/forgot-send-email',
  authController.forgotPasswordSendEmail
);

router.patch('/forgot-password',
  authController.forgotChangePassword
);

module.exports = router;
