import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export const searchTwitter = async (brandName, maxResults = 50) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/twitter/search`, {
      params: {
        query: brandName,
        max_results: maxResults
      }
    });

    return response.data.map(tweet => ({
      ...tweet,
      timestamp: new Date(tweet.timestamp)
    }));
  } catch (error) {
    console.error('Twitter API Error:', error);
    return [];
  }
};