import React from 'react';

const SearchBar = ({ brandName, setBrandName, onSearch, loading }) => {
  return (
    <div style={{ 
      background: '#1e293b', 
      padding: '30px', 
      borderRadius: '12px', 
      marginBottom: '30px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
    }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter brand name..."
          style={{ 
            flex: 1, 
            padding: '15px 20px', 
            borderRadius: '8px', 
            border: '2px solid #334155',
            background: '#0f172a',
            color: 'white',
            fontSize: '1.1rem',
            outline: 'none'
          }}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button
          onClick={onSearch}
          disabled={loading}
          style={{
            padding: '15px 40px',
            background: loading ? '#475569' : 'linear-gradient(to right, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {loading ? 'Searching...' : 'Track Brand'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;