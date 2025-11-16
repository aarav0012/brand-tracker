const spikeDetectionService = require('../services/spikeDetectionService');

const analyzeSpikes = async (req, res) => {
  try {
    const { mentions } = req.body;
    
    if (!mentions || !Array.isArray(mentions)) {
      return res.status(400).json({ error: 'Mentions array is required' });
    }

    const spikeAnalysis = spikeDetectionService.detectSpikes(mentions);
    res.json(spikeAnalysis);
  } catch (error) {
    console.error('Spike Detection Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze spikes', 
      details: error.message 
    });
  }
};

module.exports = { analyzeSpikes };