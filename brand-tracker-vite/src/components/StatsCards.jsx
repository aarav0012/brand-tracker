import React from 'react';

const StatsCards = ({ stats }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem' }}>
          Total Mentions
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
          {stats.total}
        </div>
      </div>
      
      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem' }}>
          Positive 😊
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
          {stats.positive}
        </div>
      </div>
      
      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem' }}>
          Neutral 😐
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6b7280' }}>
          {stats.neutral}
        </div>
      </div>
      
      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem' }}>
          Negative 😠
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>
          {stats.negative}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;

