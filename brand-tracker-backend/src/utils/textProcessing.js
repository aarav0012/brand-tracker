// Comprehensive stop words list
const STOP_WORDS = new Set([
  // Common words
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our',
  'their', 'just', 'about', 'even', 'also', 'really', 'very', 'much',
  'more', 'most', 'some', 'any', 'all', 'both', 'each', 'few', 'other',
  'such', 'only', 'own', 'same', 'so', 'than', 'too', 'from', 'up', 'down',
  'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'who', 'what', 'which', 'not',
  'no', 'nor', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'because', 'while', 'until', 'since',
  
  // Actions
  'get', 'got', 'getting', 'make', 'makes', 'made', 'goes', 'going', 'went',
  'come', 'comes', 'came', 'coming', 'take', 'takes', 'took', 'taking',
  'see', 'sees', 'saw', 'seen', 'know', 'knows', 'knew', 'known', 'think',
  'thinks', 'thought', 'tell', 'tells', 'told', 'feel', 'feels', 'felt',
  'try', 'tried', 'trying', 'work', 'works', 'worked', 'working', 'give',
  'gives', 'gave', 'given', 'find', 'finds', 'found', 'use', 'uses', 'used',
  'using', 'seem', 'seems', 'seemed', 'like', 'likes', 'liked', 'look',
  'looks', 'looked', 'looking', 'say', 'says', 'said', 'saying',
  
  // Descriptors
  'new', 'first', 'last', 'long', 'good', 'little', 'old', 'right', 'big',
  'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'public', 'bad', 'able',
  
  // Platform-specific
  'reddit', 'twitter', 'post', 'posts', 'comment', 'comments', 'tweet',
  'tweets', 'retweet', 'retweets', 'like', 'likes', 'share', 'shares',
  'follow', 'following', 'follower', 'followers', 'via', 'article', 'articles',
  'source', 'sources', 'link', 'links', 'click', 'read', 'view', 'check',
  'timestamped', 'authentic', 'original', 'content',
  
  // Web-related and spam
  'http', 'https', 'www', 'com', 'net', 'org', 'html', 'website', 'page',
  'weidian', 'itemid', 'pandabuy', 'taobao', 'aliexpress', 'alibaba',
  'imgur', 'youtube', 'facebook', 'instagram', 'tiktok', 'snapchat',
  'amazon', 'ebay', 'shopify', 'etsy',
  
  // Brand-specific (add more as needed)
  'apple', 'watch', 'nike', 'adidas', 'samsung', 'google'
]);

// Check if a word is a stop word
const isStopWord = (word) => {
  return STOP_WORDS.has(word.toLowerCase());
};

// Clean and validate a word
const isValidWord = (word, minLength = 5, maxLength = 15) => {
  if (!word || typeof word !== 'string') return false;
  
  const cleaned = word.toLowerCase().trim();
  
  // Check length
  if (cleaned.length < minLength || cleaned.length > maxLength) return false;
  
  // Check if stop word
  if (isStopWord(cleaned)) return false;
  
  // Only alphabetic characters
  if (!/^[a-z]+$/.test(cleaned)) return false;
  
  // Not a number
  if (!isNaN(cleaned)) return false;
  
  // Doesn't look like a URL component
  if (cleaned.includes('http') || 
      cleaned.includes('www') || 
      cleaned.includes('item') ||
      cleaned.includes('shop')) return false;
  
  // Filter out words that appear in common spam patterns
  const spamPatterns = ['itemid', 'shopid', 'userid', 'productid'];
  if (spamPatterns.some(pattern => cleaned.includes(pattern))) return false;
  
  return true;
};

// Extract clean tokens from text
const extractTokens = (text, minLength = 5, maxLength = 15) => {
  if (!text) return [];
  
  const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  
  return tokens.filter(token => isValidWord(token, minLength, maxLength));
};

// Get word frequency from texts
const getWordFrequency = (texts, minLength = 5, maxLength = 15) => {
  const frequency = {};
  
  texts.forEach(text => {
    const tokens = extractTokens(text, minLength, maxLength);
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
  });
  
  return frequency;
};

// Get top N words by frequency
const getTopWords = (frequency, n = 10) => {
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({ word, count }));
};

module.exports = {
  STOP_WORDS,
  isStopWord,
  isValidWord,
  extractTokens,
  getWordFrequency,
  getTopWords
};