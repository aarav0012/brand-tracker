import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const searchReddit = async (brandName, limit = 50) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/reddit/search`, {
      params: {
        query: brandName,
        limit: limit
      }
    });

    return response.data.map(post => ({
      ...post,
      timestamp: new Date(post.timestamp)
    }));
  } catch (error) {
    console.error('Reddit API Error:', error);
    return [];
  }
};