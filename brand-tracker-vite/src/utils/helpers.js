export const formatTime = (data) => {
    const now  = new Date();
    const diff  = Math.floor((now - new Date(data)) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export const getSentimentEmoji = (sentiment) => {
    switch(sentiment) {
        case 'positive': return '😊';
        case 'negative': return '😠';
        default: return '😐';
    }
};

export const SENTIMENT_COLORS = {
    positive : '#10b981',
    neutral: '#6b7280',
    negative: '#ef4444'
};