require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  newsApiKey: process.env.NEWS_API_KEY,
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};