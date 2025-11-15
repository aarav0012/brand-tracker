const express = require('express');
const router = express.Router();
const sentimentService = require('../services/sentimentService');

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const sentiment = await sentimentService.analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    console.error('Sentiment endpoint error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

module.exports = router;