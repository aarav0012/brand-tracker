import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import SummaryDashboard from './components/SummaryDashboard.jsx';
import Alert from './components/Alert.jsx';
import SpikeAlerts from './components/SpikeAlerts.jsx';
import StatsCards from './components/StatsCards.jsx';
import Charts from './components/Charts.jsx';
import TopicClusters from './components/TopicClusters.jsx';
import MentionsFeed from './components/MentionsFeed.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import { searchReddit } from './services/redditAPI.js';
import { searchTwitter } from './services/twitterAPI.js';
import { searchNews } from './services/newsAPI.js';
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
  const [spikeData, setSpikeData] = useState(null);
  const [spikeLoading, setSpikeLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('just now');
  const [sourcesFilter, setSourcesFilter] = useState({
    Reddit: true,
    Twitter: true,
    News: true
  });

  const handleSearch = async () => {
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
      applyFilters(mentionsWithSentiment, 'all', sourcesFilter);
      
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
      setLastUpdated('just now');
      
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

      if (mentionsWithSentiment.length > 0) {
        setSpikeLoading(true);
        try {
          const spikeResponse = await axios.post('http://localhost:5000/api/spikes/detect', {
            mentions: mentionsWithSentiment
          });
          setSpikeData(spikeResponse.data);
        } catch (spikeError) {
          console.error('Spike detection error:', spikeError);
        } finally {
          setSpikeLoading(false);
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (allMentions, sentimentFilter, sources) => {
    let filtered = allMentions;
    
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(m => m.sentiment === sentimentFilter);
    }
    
    filtered = filtered.filter(m => sources[m.source]);
    
    setFilteredMentions(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilters(mentions, filter, sourcesFilter);
  };

  const handleSourceToggle = (source) => {
    const newSourcesFilter = { ...sourcesFilter, [source]: !sourcesFilter[source] };
    setSourcesFilter(newSourcesFilter);
    applyFilters(mentions, activeFilter, newSourcesFilter);
  };

  const resetAllFilters = () => {
    setActiveFilter('all');
    setSourcesFilter({ Reddit: true, Twitter: true, News: true });
    applyFilters(mentions, 'all', { Reddit: true, Twitter: true, News: true });
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

  const activeSources = Object.keys(sourcesFilter).filter(s => sourcesFilter[s]).length;
  const hasActiveFilters = activeFilter !== 'all' || activeSources < 3;

  return (
    <div className="app-container">
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px' }}>
        <Header />
        
        {/* Search Section */}
        <div style={{ marginBottom: '30px' }}>
          <SearchBar 
            brandName={brandName}
            setBrandName={setBrandName}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Summary Dashboard */}
            <SummaryDashboard 
              stats={stats}
              brandName={brandName}
              totalSources={activeSources}
              lastUpdated={lastUpdated}
            />

            {/* Main Layout: Sidebar + Content */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '260px 1fr', 
              gap: '30px',
              alignItems: 'start'
            }}>
              
              {/* Left Sidebar - Filters */}
              <div style={{ position: 'sticky', top: '20px' }}>
                {/* Filter Panel */}
                <div style={{
                  background: '#1e293b',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🔍</span>
                    <h3 style={{ fontSize: '1.1rem', color: '#e2e8f0', margin: 0 }}>
                      Filters
                    </h3>
                  </div>

                  {/* Quick Stats */}
                  {hasActiveFilters && (
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '5px' }}>
                        Showing
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {filteredMentions.length}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        of {stats.total} mentions
                      </div>
                    </div>
                  )}

                  {/* Sentiment Filters */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#94a3b8', 
                      marginBottom: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Sentiment
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'all', label: 'All', icon: '📊', count: stats.total, color: '#3b82f6' },
                        { key: 'positive', label: 'Positive', icon: '😊', count: stats.positive, color: '#10b981' },
                        { key: 'neutral', label: 'Neutral', icon: '😐', count: stats.neutral, color: '#6b7280' },
                        { key: 'negative', label: 'Negative', icon: '😠', count: stats.negative, color: '#ef4444' }
                      ].map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => handleFilterChange(filter.key)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 14px',
                            background: activeFilter === filter.key ? '#334155' : '#0f172a',
                            border: activeFilter === filter.key 
                              ? `2px solid ${filter.color}` 
                              : '2px solid transparent',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem',
                            fontWeight: activeFilter === filter.key ? '600' : '400'
                          }}
                        >
                          <span>
                            <span style={{ marginRight: '10px', fontSize: '1.1rem' }}>
                              {filter.icon}
                            </span>
                            {filter.label}
                          </span>
                          <span style={{ 
                            background: activeFilter === filter.key ? filter.color + '33' : '#334155',
                            color: activeFilter === filter.key ? filter.color : '#94a3b8',
                            padding: '3px 10px', 
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            minWidth: '35px',
                            textAlign: 'center'
                          }}>
                            {filter.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Source Filters */}
                  <div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#94a3b8', 
                      marginBottom: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Sources
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.keys(sourcesFilter).map(source => (
                        <label
                          key={source}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: '#0f172a',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '2px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1e293b';
                            e.currentTarget.style.borderColor = '#334155';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#0f172a';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={sourcesFilter[source]}
                            onChange={() => handleSourceToggle(source)}
                            style={{ 
                              marginRight: '12px', 
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px',
                              accentColor: '#3b82f6'
                            }}
                          />
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            {source}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ✕ Clear All Filters
                    </button>
                  )}
                </div>

                {/* Pro Tip */}
                <div style={{
                  background: '#0f172a',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  border: '1px solid #1e293b'
                }}>
                  <div style={{ marginBottom: '5px', fontWeight: '600', color: '#94a3b8' }}>
                    💡 Pro Tip
                  </div>
                  Click on stat cards below to quickly filter by sentiment
                </div>
              </div>

              {/* Right Content Area */}
              <div>
                {/* Active Filter Banner */}
                {hasActiveFilters && (
                  <div style={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.3rem' }}>🔍</span>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                          Filters Active
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                          Showing {filteredMentions.length} of {stats.total} mentions
                          {activeFilter !== 'all' && ` • ${activeFilter} sentiment`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                <Alert show={alertShown} />
                <SpikeAlerts spikeData={spikeData} loading={spikeLoading} />

                {/* Stats Cards */}
                <StatsCards 
                  stats={stats} 
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                />

                {/* Charts */}
                <Charts timelineData={timelineData} pieData={pieData} />

                {/* Topic Clusters */}
                <TopicClusters 
                  clusters={topicClusters} 
                  loading={clusteringLoading}
                />

                {/* Mentions Feed or Empty State */}
                {filteredMentions.length > 0 ? (
                  <MentionsFeed mentions={filteredMentions} />
                ) : (
                  <div style={{
                    background: '#1e293b',
                    padding: '60px 40px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>
                      🔍
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#e2e8f0' }}>
                      No mentions found
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                      Try adjusting your filters or search for a different brand
                    </p>
                    <button
                      onClick={resetAllFilters}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;