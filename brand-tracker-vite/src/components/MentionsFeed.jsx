import React, { useState } from 'react';
import { formatTime, getSentimentEmoji, SENTIMENT_COLORS } from '../utils/helpers.js';

const MentionsFeed = ({ mentions }) => {
  const [expandedPosts, setExpandedPosts] = useState({});

  const toggleExpand = (id) => {
    setExpandedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div style={{ 
      background: '#1e293b', 
      padding: '25px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Recent Mentions</h3>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {mentions.map((mention) => {
          const isExpanded = expandedPosts[mention.id];
          const shouldTruncate = mention.text.length > 200;

          return (
            <div
              key={mention.id}
              style={{
                background: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                borderLeft: `4px solid ${SENTIMENT_COLORS[mention.sentiment]}`
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '10px' 
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getSentimentEmoji(mention.sentiment)}</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    background: SENTIMENT_COLORS[mention.sentiment] + '22',
                    color: SENTIMENT_COLORS[mention.sentiment],
                    fontWeight: 'bold'
                  }}>
                    {mention.sentiment.toUpperCase()}
                  </span>
                  {mention.subreddit && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      background: '#3b82f622',
                      color: '#3b82f6',
                      fontWeight: 'bold'
                    }}>
                      r/{mention.subreddit}
                    </span>
                  )}
                  {mention.wasTranslated && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      background: '#f59e0b22',
                      color: '#f59e0b',
                      fontWeight: 'bold',
                    }}>
                      🌐 Translated from {mention.originalLanguage?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <div>{mention.source}</div>
                  <div>{formatTime(mention.timestamp)}</div>
                </div>
              </div>

              <p style={{ 
                color: '#e2e8f0', 
                lineHeight: '1.6', 
                marginBottom: '10px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {isExpanded ? mention.text : truncateText(mention.text)}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => toggleExpand(mention.id)}
                  style={{
                    background: 'transparent',
                    color: '#3b82f6',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    padding: 0
                  }}
                >
                  {isExpanded ? '▲ Show Less' : '▼ Read More'}
                </button>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #334155'
              }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  by @{mention.author}
                  {mention.score !== undefined && (
                    <span style={{ marginLeft: '15px' }}>
                      👍 {mention.score} upvotes
                    </span>
                  )}
                  {mention.numComments !== undefined && (
                    <span style={{ marginLeft: '15px' }}>
                      💬 {mention.numComments} comments
                    </span>
                  )}
                </div>
                
                  {mention.url && (
                
                  <a href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                  {mention.source === 'Reddit' && 'View on Reddit →'}
                  {mention.source === 'Twitter' && 'View on Twitter →'}
                  {mention.source.includes('News') && 'Read Article →'}
                </a>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MentionsFeed;