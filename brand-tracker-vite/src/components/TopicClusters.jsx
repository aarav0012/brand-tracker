import React, { useState } from 'react';
import { getSentimentEmoji, SENTIMENT_COLORS } from '../utils/helpers.js';

const TopicClusters = ({ clusters, loading, onClusterClick }) => {
  const [expandedCluster, setExpandedCluster] = useState(null);

  const toggleCluster = (clusterId) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId);
  };

  const getClusterColor = (index) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    return colors[index % colors.length];
  };

  const getClusterIcon = (label) => {
    const iconMap = {
      'product issues': '🔧',
      'pricing complaints': '💰',
      'shipping problems': '📦',
      'positive reviews': '⭐',
      'customer support': '👤',
      'bugs or errors': '🐛',
      'feature requests': '💡',
      'comparison with competitors': '⚖️',
      'delivery delays': '🚚',
      'brand perception': '🎯',
      'marketing reactions': '📢',
    };
    return iconMap[label.toLowerCase()] || '📊';
  };

  if (loading) {
    return (
      <div style={{
        background: '#1e293b',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>📊 Topic Clusters</h3>
        <div style={{
          color: '#94a3b8',
          textAlign: 'center',
          padding: '40px',
          background: '#0f172a',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
          Analyzing topics...
        </div>
      </div>
    );
  }

  if (!clusters || clusters.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: '#1e293b',
      padding: '25px',
      borderRadius: '12px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>
        📊 Topic Clusters ({clusters.length} topics found)
      </h3>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {clusters.map((cluster, index) => {
          const color = getClusterColor(index);
          const isExpanded = expandedCluster === cluster.clusterId;

          return (
            <div
              key={cluster.clusterId}
              style={{
                background: '#0f172a',
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${color}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => toggleCluster(cluster.clusterId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{getClusterIcon(cluster.label)}</span>
                  <div>
                    <div style={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '1.1rem',
                      textTransform: 'capitalize'
                    }}>
                      {cluster.label}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {cluster.count} mentions
                    </div>
                  </div>
                </div>
                <div style={{
                  background: `${color}22`,
                  color: color,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {cluster.count}
                </div>
              </div>

              {/* Sentiment breakdown */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #334155'
              }}>
                {['positive', 'neutral', 'negative'].map(sentiment => {
                  const count = cluster.mentions.filter(m => m.sentiment === sentiment).length;
                  if (count === 0) return null;
                  return (
                    <div key={sentiment} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      background: `${SENTIMENT_COLORS[sentiment]}22`,
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      <span>{getSentimentEmoji(sentiment)}</span>
                      <span style={{ color: SENTIMENT_COLORS[sentiment], fontWeight: 'bold' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Expand/Collapse indicator */}
              <div style={{ 
                marginTop: '10px', 
                color: color, 
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {isExpanded ? '▲ Click to collapse' : '▼ Click to view mentions'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded cluster mentions */}
      {expandedCluster !== null && (
        <div style={{
          background: '#0f172a',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          border: `2px solid ${getClusterColor(clusters.findIndex(c => c.clusterId === expandedCluster))}`
        }}>
          {clusters.find(c => c.clusterId === expandedCluster)?.mentions.map((mention, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                borderLeft: `4px solid ${SENTIMENT_COLORS[mention.sentiment]}`
              }}
            >
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{getSentimentEmoji(mention.sentiment)}</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  background: `${SENTIMENT_COLORS[mention.sentiment]}22`,
                  color: SENTIMENT_COLORS[mention.sentiment],
                  fontWeight: 'bold'
                }}>
                  {mention.sentiment.toUpperCase()}
                </span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  background: '#3b82f622',
                  color: '#3b82f6',
                  fontWeight: 'bold'
                }}>
                  {mention.source}
                </span>
              </div>
              <p style={{ color: '#e2e8f0', lineHeight: '1.5', fontSize: '0.95rem' }}>
                {mention.text.substring(0, 200)}{mention.text.length > 200 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicClusters;