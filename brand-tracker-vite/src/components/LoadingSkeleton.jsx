import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Stats Cards Skeleton */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '12px',
            height: '120px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            background: '#1e293b',
            padding: '25px',
            borderRadius: '12px',
            height: '350px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;