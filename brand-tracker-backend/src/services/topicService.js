const natural = require('natural');
const { kmeans } = require('ml-kmeans');

// TF-IDF for text vectorization (no API needed!)
const TfIdf = natural.TfIdf;

// Generate embeddings using TF-IDF (works locally)
const generateLocalEmbeddings = (texts) => {
  const tfidf = new TfIdf();
  
  // Add documents
  texts.forEach(text => {
    tfidf.addDocument(text.toLowerCase());
  });

  // Get all terms
  const allTerms = new Set();
  tfidf.documents.forEach(doc => {
    Object.keys(doc).forEach(term => allTerms.add(term));
  });
  
  const termArray = Array.from(allTerms);
  
  // Create vectors
  const vectors = texts.map((text, docIndex) => {
    return termArray.map(term => {
      return tfidf.tfidf(term, docIndex) || 0;
    });
  });
  
  return vectors;
};

// Extract keywords from cluster
const extractKeywords = (texts, topN = 5) => {
  const tfidf = new TfIdf();
  
  // Comprehensive stop words
  const stopWords = new Set([
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
    'below', 'between', 'because', 'while', 'until', 'since', 'apple', 'watch',
    'get', 'got', 'getting', 'make', 'makes', 'made', 'goes', 'going', 'went',
    'come', 'comes', 'came', 'coming', 'take', 'takes', 'took', 'taking',
    'see', 'sees', 'saw', 'seen', 'know', 'knows', 'knew', 'known', 'think',
    'thinks', 'thought', 'tell', 'tells', 'told', 'feel', 'feels', 'felt',
    'try', 'tried', 'trying', 'work', 'works', 'worked', 'working', 'give',
    'gives', 'gave', 'given', 'find', 'finds', 'found', 'use', 'uses', 'used',
    'using', 'seem', 'seems', 'seemed', 'like', 'likes', 'liked', 'look',
    'looks', 'looked', 'looking', 'say', 'says', 'said', 'saying', 'new',
    'first', 'last', 'long', 'good', 'little', 'old', 'right', 'big', 'high',
    'different', 'small', 'large', 'next', 'early', 'young', 'important',
    'public', 'bad', 'able', 'reddit', 'twitter', 'post', 'posts', 'comment',
    'comments', 'via', 'http', 'https', 'www', 'com', 'org', 'net'
  ]);
  
  const combinedText = texts.join(' ').toLowerCase();
  tfidf.addDocument(combinedText);
  
  const terms = [];
  tfidf.listTerms(0).forEach(item => {
    const term = item.term;
    // Strict filtering: length > 4, not stop word, not number, not URL-like
    if (term.length > 4 && 
        !stopWords.has(term) && 
        isNaN(term) &&
        !term.includes('http') &&
        !term.includes('.com') &&
        /^[a-z]+$/.test(term)) { // Only alphabetic characters
      terms.push(term);
    }
  });
  
  return terms.slice(0, topN);
};

// Label cluster based on keywords and patterns
const labelCluster = (clusterMentions) => {
  const texts = clusterMentions.map(m => m.text);
  
  // Count sentiments
  const sentimentCounts = {
    positive: clusterMentions.filter(m => m.sentiment === 'positive').length,
    negative: clusterMentions.filter(m => m.sentiment === 'negative').length,
    neutral: clusterMentions.filter(m => m.sentiment === 'neutral').length
  };
  
  const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
    sentimentCounts[a] > sentimentCounts[b] ? a : b
  );
  
  const allText = texts.join(' ').toLowerCase();
  
  // Expanded patterns with minimum match requirements
  const patterns = [
    { regex: /\b(price|prices|pricing|cost|costs|expensive|cheap|afford|dollar|money|payment|paid|pay|worth|value)\b/gi, label: '💰 Pricing & Cost', minMatches: 3 },
    { regex: /\b(deliver|delivery|ship|shipping|shipped|package|packages|arrive|arrived|carrier|tracking|transit|freight)\b/gi, label: '📦 Shipping & Delivery', minMatches: 3 },
    { regex: /\b(support|service|customer|help|helpful|representative|agent|contact|contacts|call|called|email|emailed|response|respond)\b/gi, label: '👥 Customer Support', minMatches: 3 },
    { regex: /\b(quality|build|built|made|material|materials|durable|durability|premium|construction|craftsmanship)\b/gi, label: '⭐ Build Quality', minMatches: 3 },
    { regex: /\b(bug|bugs|error|errors|broken|crash|crashes|crashing|issue|issues|problem|problems|glitch|glitches|fail|failed|failing)\b/gi, label: '🐛 Technical Problems', minMatches: 3 },
    { regex: /\b(feature|features|functionality|function|capability|option|options|need|needs|want|wants|wish|wishes|should|could|add|adding|improve|improvement)\b/gi, label: '💡 Features & Improvements', minMatches: 3 },
    { regex: /\b(love|loves|loved|loving|great|amazing|excellent|perfect|awesome|fantastic|wonderful|best|impressed|impressive|outstanding|superb)\b/gi, label: '❤️ Highly Positive', minMatches: 3 },
    { regex: /\b(hate|hates|hated|terrible|worst|awful|bad|horrible|disappointing|disappointed|waste|useless|poor|pathetic)\b/gi, label: '😠 Very Negative', minMatches: 3 },
    { regex: /\b(design|designed|look|looks|style|styles|styled|color|colors|appearance|aesthetic|aesthetics|beautiful|elegant|sleek|modern)\b/gi, label: '🎨 Design & Style', minMatches: 3 },
    { regex: /\b(battery|batteries|screen|display|camera|cameras|performance|performing|speed|fast|slow|processor|storage|memory|ram)\b/gi, label: '🔧 Technical Specs', minMatches: 3 },
    { regex: /\b(recommend|recommends|recommended|suggest|suggests|suggested|buy|buying|purchase|purchasing|considering|thinking|worth)\b/gi, label: '💬 Buying Advice', minMatches: 3 },
    { regex: /\b(update|updates|updated|updating|upgrade|upgrades|upgraded|version|versions|release|released|launch|launched|launching|new)\b/gi, label: '🆕 Updates & News', minMatches: 3 },
    { regex: /\b(warranty|warranties|guarantee|guaranteed|return|returns|returned|refund|refunds|refunded|replace|replacement|exchange)\b/gi, label: '🔄 Returns & Warranty', minMatches: 3 },
    { regex: /\b(compare|compares|compared|comparison|versus|against|better|worse|alternative|competitor|competition|competitive)\b/gi, label: '⚖️ Comparisons', minMatches: 3 },
    { regex: /\b(available|availability|stock|stocks|stocked|order|orders|ordered|ordering|wait|waiting|preorder)\b/gi, label: '📋 Availability & Orders', minMatches: 3 },
  ];
  
  // Check patterns with higher threshold
  for (const pattern of patterns) {
    const matches = allText.match(pattern.regex);
    if (matches && matches.length >= pattern.minMatches) {
      return pattern.label;
    }
  }
  
  // Fallback to sentiment-based clusters with better names
  const sentimentLabels = {
    positive: '😊 General Praise',
    negative: '😞 General Complaints',
    neutral: '💬 General Discussion'
  };
  
  return sentimentLabels[dominantSentiment];
};

// Main clustering function
const clusterTopics = async (mentions) => {
  try {
    console.log(`Starting topic clustering for ${mentions.length} mentions...`);
    
    if (mentions.length < 5) {
      return [{
        clusterId: '0',
        label: '📊 All Mentions',
        count: mentions.length,
        mentions: mentions,
        keywords: extractKeywords(mentions.map(m => m.text), 5)
      }];
    }

    const texts = mentions.map(m => m.text || '');
    
    // Generate local embeddings (no API!)
    console.log('Generating embeddings locally...');
    const embeddings = generateLocalEmbeddings(texts);
    
    // Determine number of clusters (fewer clusters for better grouping)
    const numClusters = Math.min(5, Math.max(2, Math.floor(mentions.length / 20)));
    console.log(`Clustering into ${numClusters} groups...`);
    
    // K-means clustering
    const result = kmeans(embeddings, numClusters);
    
    // Group by cluster
    const clusterGroups = {};
    result.clusters.forEach((clusterId, index) => {
      if (!clusterGroups[clusterId]) {
        clusterGroups[clusterId] = [];
      }
      clusterGroups[clusterId].push(mentions[index]);
    });
    
    // Label clusters with uniqueness check
    const usedLabels = new Set();
    const labeledClusters = Object.entries(clusterGroups).map(([clusterId, clusterMentions]) => {
      let label = labelCluster(clusterMentions);
      
      // If label already used, try with sentiment prefix
      if (usedLabels.has(label)) {
        const sentimentCounts = {
          positive: clusterMentions.filter(m => m.sentiment === 'positive').length,
          negative: clusterMentions.filter(m => m.sentiment === 'negative').length,
          neutral: clusterMentions.filter(m => m.sentiment === 'neutral').length
        };
        const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
          sentimentCounts[a] > sentimentCounts[b] ? a : b
        );
        
        // Add keywords to make it unique
        const keywords = extractKeywords(clusterMentions.map(m => m.text), 2);
        if (keywords.length > 0) {
          const keywordLabel = keywords
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' & ');
          label = `${keywordLabel} Discussion`;
        } else {
          label = `${dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)} - Cluster ${clusterId}`;
        }
      }
      
      usedLabels.add(label);
      
      const keywords = extractKeywords(clusterMentions.map(m => m.text), 5);
      
      return {
        clusterId,
        label,
        count: clusterMentions.length,
        mentions: clusterMentions,
        keywords,
        sentimentBreakdown: {
          positive: clusterMentions.filter(m => m.sentiment === 'positive').length,
          neutral: clusterMentions.filter(m => m.sentiment === 'neutral').length,
          negative: clusterMentions.filter(m => m.sentiment === 'negative').length
        }
      };
    });
    
    // Sort by size
    labeledClusters.sort((a, b) => b.count - a.count);
    
    console.log('Clustering completed!');
    console.log('Labels:', labeledClusters.map(c => c.label));
    return labeledClusters;
    
  } catch (error) {
    console.error("Clustering error:", error);
    
    // Fallback: group by sentiment with better labels
    const groups = [
      { sentiment: 'positive', emoji: '😊', label: 'Positive Reviews' },
      { sentiment: 'negative', emoji: '😠', label: 'Issues & Complaints' },
      { sentiment: 'neutral', emoji: '😐', label: 'General Discussion' }
    ].map((config, index) => {
      const group = mentions.filter(m => m.sentiment === config.sentiment);
      if (group.length === 0) return null;
      
      return {
        clusterId: String(index),
        label: `${config.emoji} ${config.label}`,
        count: group.length,
        mentions: group,
        keywords: extractKeywords(group.map(m => m.text), 5)
      };
    }).filter(Boolean);
    
    return groups;
  }
};

module.exports = { clusterTopics };