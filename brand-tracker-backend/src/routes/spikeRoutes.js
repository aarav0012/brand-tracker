const express = require('express');
const router = express.Router();
const spikeController = require('../controllers/spikeController');

router.post('/detect', spikeController.analyzeSpikes);

module.exports = router;