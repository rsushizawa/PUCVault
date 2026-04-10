const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/print/forums", forumController.print);

router.patch(
  "/:forum_id/description",
  authMiddleware,
  forumController.updateForumDescription,
);

router.post("/create", authMiddleware, forumController.createForum);

router.patch(
  "/:forum_id/validate",
  authMiddleware,
  forumController.validateForum,
);

router.patch("/:forum_id/follow", authMiddleware, forumController.follow);

router.patch("/:forum_id/list", forumController.listForumFollowers);

module.exports = router;
