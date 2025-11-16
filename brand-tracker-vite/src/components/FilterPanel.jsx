import React from 'react';

const FilterPanel = ({ 
  activeFilter, 
  onFilterChange, 
  stats, 
  sourcesFilter, 
  onSourceToggle,
  dateRange,
  onDateRangeChange 
}) => {
  const sources = ['Reddit', 'Twitter', 'News'];

  return (
    
    <div style={{
      background: '#1e293b',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
        
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#e2e8f0' }}>
        🔍 Filters
      </h3>

      {/* Sentiment Filter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 'bold' }}>
          Sentiment
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { key: 'all', label: 'All', icon: '📊', count: stats.total },
            { key: 'positive', label: 'Positive', icon: '😊', count: stats.positive },
            { key: 'neutral', label: 'Neutral', icon: '😐', count: stats.neutral },
            { key: 'negative', label: 'Negative', icon: '😠', count: stats.negative }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 15px',
                background: activeFilter === filter.key ? '#334155' : '#0f172a',
                border: activeFilter === filter.key ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== filter.key) {
                  e.currentTarget.style.background = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== filter.key) {
                  e.currentTarget.style.background = '#0f172a';
                }
              }}
            >
              <span>
                <span style={{ marginRight: '8px' }}>{filter.icon}</span>
                {filter.label}
              </span>
              <span style={{ 
                background: '#334155', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Source Filter */}
      <div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '10px', fontWeight: 'bold' }}>
          Sources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map(source => (
            <label
              key={source}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#0f172a',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
            >
              <input
                type="checkbox"
                checked={sourcesFilter[source]}
                onChange={() => onSourceToggle(source)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem' }}>{source}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;