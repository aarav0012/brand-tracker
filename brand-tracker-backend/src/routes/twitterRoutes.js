const express = require('express');
const router = express.Router();
const twitterController = require('../controllers/twitterController');

router.get('/search', twitterController.searchTweets);

module.exports = router;