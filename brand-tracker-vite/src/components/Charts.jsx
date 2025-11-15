import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SENTIMENT_COLORS } from '../utils/helpers';

const Charts = ({ timelineData, pieData }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Mention Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="hour" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
            <Legend />
            <Line type="monotone" dataKey="mentions" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        background: '#1e293b', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Sentiment Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name.toLowerCase()]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;