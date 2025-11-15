const redditService = require('../services/redditService');

const searchPosts = async (req, res) => {
  try {
    let { query, limit = 50 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Validate and convert limit
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit <= 0) limit = 50;

    const posts = await redditService.searchReddit(query.trim(), limit);
    return res.json(posts);

  } catch (error) {
    console.error('Reddit Controller Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: 'Failed to fetch Reddit posts',
      details: error.message
    });
  }
};

module.exports = { searchPosts };
