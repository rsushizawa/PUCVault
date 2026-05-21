const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');



router.post('/create',
  authMiddleware,
  tagController.createTags
);

router.patch('/:tag_id/validate',
  authMiddleware,
  roleMiddleware(['VALIDADOR', 'ADMIN', 'SUPERADMIN']),
  tagController.validateTags
);

router.get('/:user_id/print',
  tagController.printUserTags
);

router.get('/search',
  tagController.searchTags
);

router.get('/', tagController.getTags);



module.exports = router;
