const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.get("/print/logins", authController.print);
router.post("/login", authController.login);
router.post("/sign-in", authController.signin);

module.exports = router;
