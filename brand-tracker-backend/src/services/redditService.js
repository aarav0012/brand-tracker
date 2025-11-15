const axios = require('axios');
const { detectLanguage } = require('./translationService');

const searchReddit = async (query, limit = 10) => {
  try {
    const response = await axios.get('https://www.reddit.com/search.json', {
      params: {
        q: query,
        limit: Math.min(limit, 100),
        sort: 'new'
      },
      headers: {
        'User-Agent': 'BrandTrackerApp/1.0 (https://yourdomain.com; admin@yourdomain.com)'
      }
    });

    const posts = response?.data?.data?.children || [];

    const results = await Promise.all(
      posts.map(async (post, index) => {
        const p = post?.data || {};
        const title = p.title || '';
        const selftext = p.selftext || '';
        const text = `${title} ${selftext}`.trim();

        if (!text) return null;

        return {
          id: p.name || `reddit-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text,
          language: await detectLanguage(text),
          source: 'Reddit',
          subreddit: p.subreddit || 'unknown',
          timestamp: p.created_utc
            ? new Date(p.created_utc * 1000).toISOString()
            : null,
          author: p.author || 'unknown',
          url: p.permalink
            ? `https://reddit.com${encodeURI(p.permalink)}`
            : null,
          score: typeof p.score === 'number' ? p.score : 0,
          numComments: typeof p.num_comments === 'number' ? p.num_comments : 0
        };
      })
    );

    return results.filter(Boolean);
  } catch (error) {
    console.error('redditService.searchReddit error:', error.response?.data || error.message);
    return [];
  }
};

module.exports = { searchReddit };
