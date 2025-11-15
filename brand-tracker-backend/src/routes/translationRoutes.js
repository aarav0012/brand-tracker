const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

router.post('/translate', translationController.translateText);
router.post('/translate-batch', translationController.translateBatch);

module.exports = router;