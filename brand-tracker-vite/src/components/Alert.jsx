import React from 'react';

const Alert = ({ show }) => {
    if(!show) return null;

    return (
        <div style={{ 
            background: 'linear-gradient(to right, #dc2626, #991b1b)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '30px',
            border: '2px solid #ef4444',
            animation: 'pulse 2s infinite'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>⚠️</span>
                <div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>
                        Negative Sentiment Alert!
                    </h3>
                    <p style={{ color: '#fecaca' }}>
                        High volume of negative mentions detected. Immediate attention recommended.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Alert;