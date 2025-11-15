import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { searchReddit } from './services/redditAPI.js';
import { analyzeSentiment } from './services/sentimentAnalysis.js';
import { searchTwitter } from './services/twitterAPI.js';
import { searchNews } from './services/newsAPI.js';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import Alert from './components/Alert.jsx';
import StatsCards from './components/StatsCards.jsx';
import Charts from './components/Charts.jsx';
import MentionsFeed from './components/MentionsFeed.jsx';
import { generateTimelineData } from './services/mockDataGenerator.js';
import './App.css';

function App() {
  const [brandName, setBrandName] = useState('Nike');
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0, total: 0 });
  const [timelineData, setTimelineData] = useState([]);
  const [alertShown, setAlertShown] = useState(false);

  const analyzeMentionsSentiment = async (mentions) => {
    const sentimentPromises = mentions.map(async (mention) => {
      try {
        const response = await axios.post('http://localhost:5000/api/sentiment/analyze', {
          text: mention.text
        });
        return {...mention, sentiment: response.data.sentiment};
      } catch (error) {
        return {...mention, sentiment: analyzeSentiment(mention.text)};
      }
    });
    return await Promise.all(sentimentPromises)
  };

  const handleSearch = async() => {
    setLoading(true);
    setAlertShown(false);

    try {
      const [redditPosts, tweets, newsArticles] = await Promise.all([
        searchReddit(brandName, 50),
        searchTwitter(brandName, 50),
        searchNews(brandName, 50)
      ]);

      const allMentions = [...redditPosts, ...tweets, ...newsArticles];

      const response = await axios.post('http://localhost:5000/api/analysis/analyze-mentions', {
        mentions: allMentions
      });

      const mentionsWithSentiment = response.data;

      mentionsWithSentiment.sort((a, b) => b.timestamp - a.timestamp);


      setMentions(mentionsWithSentiment);
      const positiveCount = mentionsWithSentiment.filter(m => m.sentiment === 'positive').length;
      const negativeCount = mentionsWithSentiment.filter(m => m.sentiment === 'negative').length;
      const neutralCount = mentionsWithSentiment.filter(m => m.sentiment === 'neutral').length;

      setStats({
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        total: mentionsWithSentiment.length
      });
      setTimelineData(generateTimelineData(mentionsWithSentiment));
    
      // Show alert if negative sentiment is high
      if (negativeCount > mentionsWithSentiment.length * 0.25) {
        setAlertShown(true);
      }
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      alert('Failed to fetch data from Reddit. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  const pieData = [
    { name: 'Positive', value: stats.positive },
    { name: 'Neutral', value: stats.neutral },
    { name: 'Negative', value: stats.negative }
  ];

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Header />
        <SearchBar 
          brandName={brandName}
          setBrandName={setBrandName}
          onSearch={handleSearch}
          loading={loading}
        />
        <Alert show={alertShown} />
        <StatsCards stats={stats} />
        <Charts timelineData={timelineData} pieData={pieData} />
        <MentionsFeed mentions={mentions} />
      </div>
    </div>
  );
}

export default App;