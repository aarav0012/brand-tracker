export const analyzeSentiment = (text) => {
  const positiveWords = ['love', 'great', 'awesome', 'excellent', 'amazing', 'best', 'good', 'perfect', 'happy', 'fantastic', 'wonderful', 'outstanding', 'superb'];
  const negativeWords = ['hate', 'bad', 'terrible', 'worst', 'awful', 'poor', 'disappointing', 'disappointed', 'angry', 'upset', 'horrible', 'useless', 'waste'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};