const express = require('express');
const router = express.Router();
const denunciaController = require('../controllers/denunciaController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas para usuários autenticados
router.post('/usuario', authMiddleware, denunciaController.denunciarUsuario);
router.post('/conteudo', authMiddleware, denunciaController.denunciarConteudo);

// Rotas administrativas (Requerem ADMIN ou MODERADOR, conforme sua lógica de cargos)
// Nota: O roleMiddleware atual espera que o cargo esteja no token JWT.
router.get('/', 
  authMiddleware, 
  roleMiddleware(['ADMIN', 'MODERADOR']), 
  denunciaController.listarDenuncias
);

router.patch('/:denuncia_id/resolver', 
  authMiddleware, 
  roleMiddleware(['ADMIN', 'MODERADOR']), 
  denunciaController.resolverDenuncia
);

module.exports = router;
