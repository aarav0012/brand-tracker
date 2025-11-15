const translationService = require('../services/translationService');

const translateText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Valid text is required" });
    }

    const result = await translationService.translateToEnglish(text.trim());
    res.json(result);

  } catch (error) {
    console.error("Translation Controller Error:", error);
    res.status(500).json({
      error: "Failed to translate text",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const translateBatch = async (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({ error: "Texts array is required" });
    }

    // Limit batch size for safety
    if (texts.length > 100) {
      return res.status(400).json({ error: "Batch size limit exceeded (max 100)" });
    }

    // Validate each input
    texts.forEach((t, i) => {
      if (!t || typeof t !== "string" || !t.trim()) {
        throw new Error(`Invalid text at index ${i}`);
      }
    });

    const results = await translationService.translateBatch(texts.map(t => t.trim()));
    res.json(results);

  } catch (error) {
    console.error("Batch Translation Error:", error);
    res.status(500).json({
      error: "Failed to translate texts",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { translateText, translateBatch };
