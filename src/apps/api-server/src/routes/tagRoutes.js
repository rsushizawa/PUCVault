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



module.exports = router;
