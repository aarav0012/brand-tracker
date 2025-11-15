import React from 'react';

const StatsCards = ({ stats, activeFilter, onFilterChange }) => {
  const cards = [
    { 
      label: 'Total Mentions', 
      value: stats.total, 
      color: '#3b82f6',
      filter: 'all'
    },
    { 
      label: 'Positive 😊', 
      value: stats.positive, 
      color: '#10b981',
      filter: 'positive'
    },
    { 
      label: 'Neutral 😐', 
      value: stats.neutral, 
      color: '#6b7280',
      filter: 'neutral'
    },
    { 
      label: 'Negative 😠', 
      value: stats.negative, 
      color: '#ef4444',
      filter: 'negative'
    }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      {cards.map((card, index) => (
        <div 
          key={index}
          onClick={() => onFilterChange(card.filter)}
          style={{ 
            background: activeFilter === card.filter ? '#334155' : '#1e293b',
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: activeFilter === card.filter ? `2px solid ${card.color}` : '2px solid transparent',
            transform: activeFilter === card.filter ? 'scale(1.02)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (activeFilter !== card.filter) {
              e.currentTarget.style.background = '#334155';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeFilter !== card.filter) {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '0.9rem' }}>
            {card.label}
            {activeFilter === card.filter && (
              <span style={{ marginLeft: '10px', fontSize: '0.8rem' }}>✓ Active</span>
            )}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: card.color }}>
            {card.value}
          </div>
          <div style={{ 
            color: '#64748b', 
            fontSize: '0.8rem', 
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            Click to filter
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

