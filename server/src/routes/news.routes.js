const express = require('express');
const newsController = require('../controllers/news.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// News routes - all protected
router.use(protect);

router.get('/task/:taskId/results', newsController.getTaskResults);
router.get('/results/:resultId', newsController.getResult);
router.post('/search', newsController.searchNews);
router.get('/category/:category', newsController.getLatestNewsByCategory);

module.exports = router;