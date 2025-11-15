import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { searchReddit } from './services/redditAPI.js';
import { analyzeSentiment } from './services/sentimentAnalysis.js';
import { searchTwitter } from './services/twitterAPI.js';
import { searchNews } from './services/newsAPI.js';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import Alert from './components/Alert.jsx';
import TopicClusters from './components/TopicClusters.jsx';
import StatsCards from './components/StatsCards.jsx';
import Charts from './components/Charts.jsx';
import MentionsFeed from './components/MentionsFeed.jsx';
import { generateTimelineData } from './services/mockDataGenerator.js';
import './App.css';

function App() {
  const [brandName, setBrandName] = useState('Nike');
  const [mentions, setMentions] = useState([]);
  const [filteredMentions, setFilteredMentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0, total: 0 });
  const [timelineData, setTimelineData] = useState([]);
  const [alertShown, setAlertShown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [topicClusters, setTopicClusters] = useState([]);
  const [clusteringLoading, setClusteringLoading] = useState(false);

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
    setActiveFilter('all');

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

      mentionsWithSentiment.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


      setMentions(mentionsWithSentiment);
      setFilteredMentions(mentionsWithSentiment);
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
      if (mentionsWithSentiment.length > 0) {
        setClusteringLoading(true);
        try {
          const clusterResponse = await axios.post('http://localhost:5000/api/topics/cluster', {
            mentions: mentionsWithSentiment
          });
          setTopicClusters(clusterResponse.data);
        } catch (clusterError) {
          console.error('Clustering error:', clusterError);
        } finally {
          setClusteringLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      alert('Failed to fetch data from Reddit. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

   const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredMentions(mentions);
    } else {
      const filtered = mentions.filter(m => m.sentiment === filter);
      setFilteredMentions(filtered);
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
        <StatsCards 
          stats={stats} 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        {activeFilter !== 'all' && (
          <div style={{
            background: '#1e293b',
            padding: '15px 25px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Showing: </span>
              <span style={{ 
                color: activeFilter === 'positive' ? '#10b981' : activeFilter === 'negative' ? '#ef4444' : '#6b7280',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {activeFilter} Mentions ({filteredMentions.length})
              </span>
            </div>
            <button
              onClick={() => handleFilterChange('all')}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
        <Charts timelineData={timelineData} pieData={pieData} />
        <TopicClusters 
          clusters={topicClusters} 
          loading={clusteringLoading}
        />
        <MentionsFeed mentions={filteredMentions} />
      </div>
    </div>
  );
}

export default App;