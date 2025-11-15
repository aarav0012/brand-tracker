const newsService = require('../services/newsService');

const searchArticles = async (req, res) => {
  try {
    const { query } = req.query;
    let { pageSize = 50 } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Validate and convert pageSize
    pageSize = parseInt(pageSize, 10);
    if (isNaN(pageSize) || pageSize <= 0) pageSize = 50;

    const articles = await newsService.searchNews(query, pageSize);
    return res.json(articles);

  } catch (error) {
    console.error('News Controller Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: 'Failed to fetch news',
      details: error.message
    });
  }
};

module.exports = { searchArticles };
