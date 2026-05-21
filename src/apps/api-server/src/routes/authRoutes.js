const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const authController = require("../controllers/authController.js");

router.get("/print/logins", authController.print);
router.post("/login", authController.login);
router.post("/sign-in", authController.signin);
=======
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
>>>>>>> 3c7af4a (otimizado backend, adicionado verificacao de email quando fizer signin, adicionar opcao de habilitar 2fa, adicionado opcao, overhaul de arquivos, feito um código pra teste backend, entre outras coisas)

router.post('/sign-in',
  authController.signin
);

router.post('/verify-sign-in',
  authController.verifySignup
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

router.post('/logout',
  authMiddleware,
  authController.logout
);

module.exports = router;
