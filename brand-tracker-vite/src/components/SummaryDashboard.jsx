import React from 'react';

const SummaryDashboard = ({ stats, brandName, totalSources, lastUpdated }) => {
  const sentimentScore = stats.total > 0 
    ? ((stats.positive - stats.negative) / stats.total * 100).toFixed(0)
    : 0;

  const getScoreColor = (score) => {
    if (score > 30) return '#10b981';
    if (score > 0) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '30px',
      borderRadius: '16px',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>
            Currently Tracking
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {brandName}
          </h2>
          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
            <span>📊 {stats.total} mentions</span>
            <span>•</span>
            <span>🌐 {totalSources} sources</span>
            <span>•</span>
            <span>🕐 Updated {lastUpdated}</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          padding: '20px 30px',
          borderRadius: '12px',
          textAlign: 'center',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px' }}>
            Sentiment Score
          </div>
          <div style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            color: getScoreColor(sentimentScore)
          }}>
            {sentimentScore > 0 ? '+' : ''}{sentimentScore}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            {sentimentScore > 30 ? '🎉 Very Positive' : 
             sentimentScore > 0 ? '👍 Positive' : 
             sentimentScore === 0 ? '😐 Neutral' :
             sentimentScore > -30 ? '👎 Negative' : '⚠️ Very Negative'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;