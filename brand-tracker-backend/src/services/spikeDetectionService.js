// Detect spikes in conversation volume and sentiment changes
const { extractTokens, getWordFrequency } = require('../utils/textProcessing');

// Calculate statistics
const calculateStats = (data) => {
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / data.length;
  
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  
  return { mean, stdDev };
};

// Group mentions by time intervals (hourly)
const groupByHour = (mentions) => {
  const hourlyData = {};
  
  mentions.forEach(mention => {
    const date = new Date(mention.timestamp);
    const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = {
        hour: date,
        count: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        mentions: []
      };
    }
    
    hourlyData[hourKey].count++;
    hourlyData[hourKey][mention.sentiment]++;
    hourlyData[hourKey].mentions.push(mention);
  });
  
  return Object.values(hourlyData).sort((a, b) => a.hour - b.hour);
};

// Detect volume spikes
const detectVolumeSpikes = (hourlyData) => {
  if (hourlyData.length < 3) return [];
  
  const counts = hourlyData.map(h => h.count);
  const { mean, stdDev } = calculateStats(counts);
  
  const threshold = mean + (2.5 * stdDev);
  
  const spikes = [];
  hourlyData.forEach((hour, index) => {
    if (hour.count > threshold && hour.count > mean * 2) {
      const increase = ((hour.count - mean) / mean * 100).toFixed(0);
      
      if (parseFloat(increase) >= 100) {
        // Deduplicate mentions by similarity
        const uniqueMentions = deduplicateMentions(hour.mentions);
        
        spikes.push({
          type: 'volume',
          severity: hour.count > mean * 4 ? 'critical' : 'warning',
          timestamp: hour.hour,
          value: hour.count,
          baseline: Math.round(mean),
          increase: `${increase}%`,
          message: `${increase}% spike in mentions (${hour.count} vs avg ${Math.round(mean)})`,
          affectedMentions: uniqueMentions.slice(0, 10) // Show only top 10 unique
        });
      }
    }
  });
  
  return spikes;
};

const deduplicateMentions = (mentions) => {
  const unique = [];
  const seen = new Set();
  
  mentions.forEach(mention => {
    // Create a signature: first 100 chars of text
    const signature = mention.text.toLowerCase().trim().substring(0, 100);
    
    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(mention);
    }
  });
  
  return unique;
};

// Detect sentiment shifts
const detectSentimentSpikes = (hourlyData, mentions) => {
  if (hourlyData.length < 2) return [];
  
  const overallSentiment = {
    positive: mentions.filter(m => m.sentiment === 'positive').length / mentions.length,
    negative: mentions.filter(m => m.sentiment === 'negative').length / mentions.length,
    neutral: mentions.filter(m => m.sentiment === 'neutral').length / mentions.length
  };
  
  const spikes = [];
  
  hourlyData.forEach(hour => {
    if (hour.count < 3) return; // Skip hours with too few mentions
    
    const hourSentiment = {
      positive: hour.positive / hour.count,
      negative: hour.negative / hour.count,
      neutral: hour.neutral / hour.count
    };
    
    // Alert if negative sentiment is significantly higher than overall
    if (hourSentiment.negative > overallSentiment.negative * 2 && hourSentiment.negative > 0.5) {
      spikes.push({
        type: 'negative_sentiment',
        severity: hourSentiment.negative > 0.7 ? 'critical' : 'warning',
        timestamp: hour.hour,
        value: `${(hourSentiment.negative * 100).toFixed(0)}%`,
        baseline: `${(overallSentiment.negative * 100).toFixed(0)}%`,
        message: `High negative sentiment: ${(hourSentiment.negative * 100).toFixed(0)}% negative (${hour.negative}/${hour.count} mentions)`,
        affectedMentions: hour.mentions.filter(m => m.sentiment === 'negative')
      });
    }
    
    // Alert if positive sentiment drops significantly
    if (overallSentiment.positive > 0.4 && hourSentiment.positive < overallSentiment.positive * 0.5 && hour.count >= 5) {
      spikes.push({
        type: 'sentiment_drop',
        severity: 'warning',
        timestamp: hour.hour,
        value: `${(hourSentiment.positive * 100).toFixed(0)}%`,
        baseline: `${(overallSentiment.positive * 100).toFixed(0)}%`,
        message: `Positive sentiment dropped to ${(hourSentiment.positive * 100).toFixed(0)}% (normally ${(overallSentiment.positive * 100).toFixed(0)}%)`,
        affectedMentions: hour.mentions
      });
    }
  });
  
  return spikes;
};

// Detect trending topics (sudden increase in specific keywords)
// Detect trending topics with better filtering
const detectTrendingTopics = (mentions) => {
  if (mentions.length < 20) return [];
  
  // Deduplicate mentions by text (remove exact duplicates)
  const uniqueMentions = [];
  const seenTexts = new Set();
  
  mentions.forEach(mention => {
    const normalizedText = mention.text.toLowerCase().trim().substring(0, 100);
    if (!seenTexts.has(normalizedText)) {
      seenTexts.add(normalizedText);
      uniqueMentions.push(mention);
    }
  });
  
  if (uniqueMentions.length < 20) return [];
  
  const sortedByTime = [...uniqueMentions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentCount = Math.floor(sortedByTime.length * 0.3);
  const recent = sortedByTime.slice(0, recentCount);
  const older = sortedByTime.slice(recentCount);
  
  const recentTexts = recent.map(m => m.text);
  const olderTexts = older.map(m => m.text);
  
  const recentKeywords = getWordFrequency(recentTexts);
  const olderKeywords = getWordFrequency(olderTexts);
  
  const trending = [];
  
  Object.keys(recentKeywords).forEach(keyword => {
    const recentCount = recentKeywords[keyword];
    const olderCount = olderKeywords[keyword] || 0;
    const recentFreq = recentCount / recent.length;
    const olderFreq = olderCount / Math.max(older.length, 1); // Prevent division by zero
    
    // Stricter criteria:
    // - At least 5 mentions
    // - 5x more frequent (increased from 4x)
    // - Recent frequency > 15% (increased from 10%)
    // - Not present in older mentions OR significantly increased
    if (recentCount >= 5 && 
        recentFreq > Math.max(olderFreq * 5, 0.15) && 
        recentFreq > 0.15) {
      
      let increasePercent;
      if (olderFreq === 0) {
        increasePercent = 'new';
      } else {
        const increase = ((recentFreq / olderFreq - 1) * 100);
        // Cap at 500% to avoid ridiculous numbers
        increasePercent = Math.min(increase, 500).toFixed(0);
      }
      
      trending.push({
        type: 'trending_topic',
        severity: 'info',
        keyword: keyword,
        recentCount: recentCount,
        increase: increasePercent,
        message: `"${keyword}" is trending (${recentCount} unique mentions${increasePercent === 'new' ? ', new topic' : ', ' + increasePercent + '% increase'})`,
        affectedMentions: recent.filter(m => m.text.toLowerCase().includes(keyword))
      });
    }
  });
  
  // Return top 3, sorted by count
  return trending
    .sort((a, b) => b.recentCount - a.recentCount)
    .slice(0, 3);
};

// Main spike detection function
const detectSpikes = (mentions) => {
  if (mentions.length < 10) {
    return {
      hasSpikes: false,
      alerts: [],
      summary: 'Not enough data for spike detection (minimum 10 mentions required)'
    };
  }
  
  const hourlyData = groupByHour(mentions);
  
  const volumeSpikes = detectVolumeSpikes(hourlyData);
  const sentimentSpikes = detectSentimentSpikes(hourlyData, mentions);
  // const trendingTopics = detectTrendingTopics(mentions);
  
  const allAlerts = [...volumeSpikes, ...sentimentSpikes]
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  
  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = allAlerts.filter(a => a.severity === 'warning').length;
  
  return {
    hasSpikes: allAlerts.length > 0,
    alerts: allAlerts,
    summary: allAlerts.length > 0 
      ? `Found ${criticalCount} critical and ${warningCount} warning alerts`
      : 'No unusual activity detected',
    hourlyData
  };
};

module.exports = { detectSpikes };