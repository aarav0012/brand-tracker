const express = require('express');
const cors = require('cors');
const config = require('./config/config');

const twitterRoutes = require('./routes/twitterRoutes');
const redditRoutes = require('./routes/redditRoutes');
const newsRoutes = require('./routes/newsRoutes');
const translationRoutes = require('./routes/translationRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const topicRoutes = require('./routes/topicRoutes');

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Routes
app.use('/api/twitter', twitterRoutes);
app.use('/api/reddit', redditRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/topics', topicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

module.exports = app;