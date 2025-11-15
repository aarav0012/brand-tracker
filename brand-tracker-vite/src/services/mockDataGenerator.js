import { analyzeSentiment } from './sentimentAnalysis';

export const generateMockMentions = (brand) => {
  const sources = ['Twitter', 'Reddit', 'Facebook', 'Instagram', 'Blog', 'News Site'];
  const templates = [
    `Just bought ${brand} shoes and they're amazing!`,
    `${brand}'s new campaign is so inspiring`,
    `Not impressed with ${brand}'s customer service`,
    `${brand} quality has gone downhill lately`,
    `Loving my new ${brand} gear!`,
    `${brand} prices are getting too high`,
    `Best ${brand} product I've ever owned`,
    `${brand} should really improve their delivery`,
    `Can't stop recommending ${brand} to everyone!`,
    `Disappointed with ${brand}'s latest release`,
    `${brand} is setting industry standards`,
    `Had a terrible experience with ${brand} support`,
    `${brand}'s sustainability efforts are impressive`,
    `${brand} needs to step up their game`,
    `Absolutely love what ${brand} is doing!`,
    `${brand} has the best customer loyalty program`,
    `${brand}'s marketing is getting annoying`,
    `Perfect quality from ${brand} as always`,
    `${brand} is overpriced for what you get`,
    `Excited about ${brand}'s new product line!`,
  ];

  const mockData = [];
  const now = Date.now();
  
  for (let i = 0; i < 50; i++) {
    const text = templates[Math.floor(Math.random() * templates.length)];
    const timestamp = now - (Math.random() * 48 * 60 * 60 * 1000); // Last 48 hours
    
    mockData.push({
      id: i,
      text: text,
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: new Date(timestamp),
      sentiment: analyzeSentiment(text),
      author: `User${Math.floor(Math.random() * 1000)}`
    });
  }
  
  return mockData.sort((a, b) => b.timestamp - a.timestamp);
};

export const generateTimelineData = (mentions) => {
  const hourlyData = {};
  
  mentions.forEach(mention => {
    const hour = new Date(mention.timestamp).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { hour: `${hour}:00`, mentions: 0, positive: 0, negative: 0, neutral: 0 };
    }
    hourlyData[hour].mentions++;
    hourlyData[hour][mention.sentiment]++;
  });
  
  return Object.values(hourlyData).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
};