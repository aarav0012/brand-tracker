const axios = require('axios');
const config = require('../config/config');
const { detectLanguage } = require('./translationService');

const searchNews = async (query, pageSize = 10) => {
  if (!config.newsApiKey) {
    console.warn('newsService: newsApiKey is not set in config. Requests may fail.');
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: `"${query}"`,
        searchIn: "title,description,content",
        pageSize: Math.min(pageSize, 100),
        sortBy: 'publishedAt',
        apiKey: config.newsApiKey
      }
    });

    const articles = response?.data?.articles || [];

    const processed = await Promise.all(
      articles.map(async (article, index) => {
        const text = `${article.title || ''}. ${article.description || ''}`.trim();
        if (!text || text === ".") return null;

        return {
          id: `news-${index}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text,
          language: await detectLanguage(text),
          source: article.source?.name || 'News',
          timestamp: article.publishedAt,
          author: article.author || 'Unknown',
          url: article.url,
          imageUrl: article.urlToImage,
          fullArticle: article.content
        };
      })
    );

    return processed.filter(Boolean);

  } catch (error) {
    console.error('newsService.searchNews error:', error.response?.data || error.message);
    return [];
  }
};

module.exports = { searchNews };
