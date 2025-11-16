import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const searchNews = async (brandName, pageSize = 50) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/news/search`, {
      params: {
        query: brandName,
        pageSize: pageSize
      }
    });

    return response.data.map(article => ({
      ...article,
      timestamp: new Date(article.timestamp)
    }));
  } catch (error) {
    console.error('News API Error:', error);
    return [];
  }
};