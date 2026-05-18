const express = require('express');
const router = express.Router();
const denunciaController = require('../controllers/denunciaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/usuario', authMiddleware, denunciaController.denunciarUsuario);
router.post('/conteudo', authMiddleware, denunciaController.denunciarConteudo);

router.get('/',
  authMiddleware,
  denunciaController.listarDenuncias
);

router.patch('/:denuncia_id/resolver',
  authMiddleware,
  denunciaController.resolverDenuncia
);

module.exports = router;
