const translationService = require('../services/translationService');
const sentimentService = require('../services/sentimentService');

const analyzeWithTranslation = async (req, res) => {
  try {
    const { mentions } = req.body;

    if (!Array.isArray(mentions)) {
      return res.status(400).json({ error: 'Mentions array is required' });
    }

    // Validate text entries
    mentions.forEach((m, idx) => {
      if (!m || typeof m.text !== 'string' || !m.text.trim()) {
        throw new Error(`Invalid mention.text at index ${idx}`);
      }
    });

    const texts = mentions.map(m => m.text);

    // Translate all texts
    const translations = await translationService.translateBatch(texts);

    if (translations.length !== mentions.length) {
      throw new Error('Translation result length mismatch');
    }

    // Sentiment analysis
    const analyzedMentions = await Promise.all(
      mentions.map(async (mention, index) => {
        const translation = translations[index];

        const sentiment = await sentimentService.analyzeSentiment(
          translation.translatedText // ALWAYS AVAILABLE NOW
        );

        return {
          ...mention,
          originalLanguage: translation.originalLanguage,
          wasTranslated: translation.wasTranslated,
          translatedText: translation.translatedText,
          sentiment
        };
      })
    );

    return res.json(analyzedMentions);

  } catch (error) {
    console.error('Analysis Controller Error:', error);
    return res.status(500).json({
      error: 'Failed to analyze mentions',
      details: error.message
    });
  }
};

module.exports = { analyzeWithTranslation };
