const topicService = require("../services/topicService");

const analyzeTopics = async (req, res) => {
  try {
    const { mentions } = req.body;

    if (!mentions || !Array.isArray(mentions)) {
      return res.status(400).json({ error: "Mentions array is required" });
    }

    const result = await topicService.clusterTopics(mentions);
    res.json(result);
  } catch (err) {
    console.error("Topic Analysis Error:", err.message);
    res.status(500).json({
      error: "Failed to cluster topics",
      details: err.message
    });
  }
};

module.exports = { analyzeTopics };
