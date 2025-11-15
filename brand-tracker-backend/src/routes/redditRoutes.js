const express = require('express');
const router = express.Router();
const redditController = require('../controllers/redditController');

router.get('/search', redditController.searchPosts);

module.exports = router;