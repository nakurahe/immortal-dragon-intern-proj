const express = require('express');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Chat routes - protected
router.use(protect);

router.post('/message', chatController.processChat);

module.exports = router;