const express = require("express");
const router = express.Router();
const denunciaController = require("../controllers/denunciaController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/usuario", authMiddleware, denunciaController.denunciarUsuario);

router.post("/conteudo", authMiddleware, denunciaController.denunciarConteudo);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  denunciaController.listarDenuncias,
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  denunciaController.listarUsuariosDenunciados,
);
router.get(
  "/posts",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  denunciaController.listarPostagensDenunciados,
);
router.get(
  "/comentarios",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  denunciaController.listarComentariosDenunciados,
);

router.patch(
  "/:denuncia_id/resolver",
  authMiddleware,
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  denunciaController.resolverDenuncia,
);

module.exports = router;
