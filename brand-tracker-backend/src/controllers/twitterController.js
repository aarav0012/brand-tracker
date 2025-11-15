const twitterService = require('../services/twitterService');

const searchTweets = async (req, res) => {
  try {
    const { query, max_results = "50" } = req.query;

    // Validate query
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    if (query.length > 200) {
      return res.status(400).json({ error: "Query too long (max 200 chars)" });
    }

    // Convert and validate max_results
    const maxResults = parseInt(max_results, 10) || 50;

    if (maxResults < 10 || maxResults > 100) {
      return res.status(400).json({ 
        error: "max_results must be between 10 and 100" 
      });
    }

    const tweets = await twitterService.searchTwitter(query.trim(), maxResults);
    res.json(tweets);

  } catch (error) {
    console.error("Twitter Controller Error:", error.response?.data || error);

    res.status(500).json({
      error: "Failed to fetch tweets",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { searchTweets };
