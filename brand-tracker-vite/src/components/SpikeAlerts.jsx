import React, { useState } from 'react';

const SpikeAlerts = ({ spikeData, loading }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);

  if (loading) {
    return (
      <div style={{
        background: '#1e293b',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>⚡ Spike Detection</h3>
        <div style={{
          color: '#94a3b8',
          textAlign: 'center',
          padding: '20px',
          background: '#0f172a',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
          Analyzing conversation patterns...
        </div>
      </div>
    );
  }

  if (!spikeData || !spikeData.hasSpikes) {
    return (
      <div style={{
        background: '#1e293b',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>⚡ Spike Detection</h3>
        <div style={{
          color: '#10b981',
          textAlign: 'center',
          padding: '30px',
          background: '#0f172a',
          borderRadius: '8px',
          border: '2px solid #10b98133'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            No Unusual Activity
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Conversation patterns are normal
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'volume': return 'Volume Spike';
      case 'negative_sentiment': return 'Negative Sentiment Spike';
      case 'sentiment_drop': return 'Sentiment Drop';
      case 'trending_topic': return 'Trending Topic';
      default: return 'Alert';
    }
  };

  return (
    <div style={{
      background: '#1e293b',
      padding: '25px',
      borderRadius: '12px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.3rem' }}>⚡ Spike Detection</h3>
        <span style={{
          background: '#ef444422',
          color: '#ef4444',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {spikeData.alerts.length} Alert{spikeData.alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ marginBottom: '20px', color: '#94a3b8', fontSize: '0.95rem' }}>
        {spikeData.summary}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {spikeData.alerts.map((alert, index) => {
          const color = getSeverityColor(alert.severity);
          const isExpanded = expandedAlert === index;

          return (
            <div
              key={index}
              style={{
                background: '#0f172a',
                border: `2px solid ${color}33`,
                borderLeft: `4px solid ${color}`,
                padding: '20px',
                borderRadius: '8px',
                cursor: alert.affectedMentions ? 'pointer' : 'default'
              }}
              onClick={() => alert.affectedMentions && setExpandedAlert(isExpanded ? null : index)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>{getSeverityIcon(alert.severity)}</span>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: `${color}22`,
                      color: color,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity}
                    </span>
                    <span style={{
                      background: '#3b82f622',
                      color: '#3b82f6',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {getTypeLabel(alert.type)}
                    </span>
                  </div>

                  <div style={{
                    color: 'white',
                    fontSize: '1.05rem',
                    marginBottom: '10px',
                    lineHeight: '1.5'
                  }}>
                    {alert.message}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {alert.timestamp && (
                      <span>📅 {new Date(alert.timestamp).toLocaleString()}</span>
                    )}
                    {alert.value && alert.baseline && (
                      <span>📊 {alert.value} (baseline: {alert.baseline})</span>
                    )}
                    {alert.increase && (
                      <span style={{ color: color, fontWeight: 'bold' }}>📈 {alert.increase}</span>
                    )}
                  </div>

                  {alert.affectedMentions && (
                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                      {isExpanded ? '▲' : '▼'} Click to {isExpanded ? 'hide' : 'view'} {alert.affectedMentions.length} affected mention{alert.affectedMentions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded mentions */}
              {isExpanded && alert.affectedMentions && (
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #334155',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {alert.affectedMentions.slice(0, 5).map((mention, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e293b',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        color: '#e2e8f0'
                      }}
                    >
                      {mention.text.substring(0, 150)}{mention.text.length > 150 ? '...' : ''}
                    </div>
                  ))}
                  {alert.affectedMentions.length > 5 && (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: '10px' }}>
                      + {alert.affectedMentions.length - 5} more mentions
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpikeAlerts;