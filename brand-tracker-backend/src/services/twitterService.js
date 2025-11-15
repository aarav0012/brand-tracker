const axios = require('axios');
const config = require('../config/config');
const { detectLanguage } = require('./translationService');

const searchTwitter = async (query, maxResults = 5) => {
  try {
    if (!query?.trim()) {
      throw new Error('Query parameter cannot be empty');
    }

    if (!config.twitterBearerToken) {
      throw new Error('Twitter Bearer Token is not configured');
    }

    const safeQuery = query.replace(/"/g, '\\"');

    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: safeQuery,
        max_results: Math.max(10, Math.min(maxResults, 100)),
        'tweet.fields': 'created_at,public_metrics,author_id',
        'user.fields': 'username',
        expansions: 'author_id'
      },
      headers: {
        Authorization: `Bearer ${config.twitterBearerToken}`
      }
    });

    const tweets = response?.data?.data || [];
    const users = response?.data?.includes?.users || [];

    const mapped = await Promise.all(
      tweets.map(async (tweet, index) => {
        try {
          const author = users.find(u => u.id === tweet?.author_id) || {};
          const text = tweet?.text || '';

          if (!text.trim()) return null;

          return {
            id: tweet?.id || `twitter-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text,
            language: await detectLanguage(text),
            source: 'Twitter',
            timestamp: tweet?.created_at || null,
            author: author?.username || 'Unknown',
            url: tweet?.id ? `https://twitter.com/i/web/status/${tweet.id}` : null,
            likes: tweet?.public_metrics?.like_count || 0,
            retweets: tweet?.public_metrics?.retweet_count || 0,
            replies: tweet?.public_metrics?.reply_count || 0
          };
        } catch (mapErr) {
          console.error('twitterService: failed to map tweet:', mapErr.message || mapErr);
          return null;
        }
      })
    );

    return mapped.filter(Boolean);

  } catch (error) {
    console.error('Twitter Search Error:', {
      message: error.message || error,
      status: error?.response?.status,
      data: error?.response?.data
    });
    return [];
  }
};

module.exports = { searchTwitter };
