const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');



router.post('/create',
  authMiddleware,
  roleMiddleware(['VALIDADOR', 'ADMIN', 'SUPERADMIN']),
  tagController.createTags
);

router.get('/:user_id/print',
  tagController.printUserTags
);

router.get('/search',
  tagController.searchTags
);

router.get('/', tagController.getTags);

// TODO: forum-scoped tag routes consumed by the frontend admin panel:
//   GET    /tags/forum/:forum_id          -> tags attached to a forum
//   DELETE /tags/forum/:forum_id/:tag_id  -> detach a tag from a forum
// Blocked on the publico functions to associate/list/detach forum tags (see TO-DO.md ### DB).

module.exports = router;
