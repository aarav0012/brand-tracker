import axios from 'axios';

const REDDIT_BASE_URL = 'https://www.reddit.com';

export const searchReddit = async (brandName, limit = 50) => {
  try {
    // Search across all of Reddit
    const response = await axios.get(`${REDDIT_BASE_URL}/search.json`, {
      params: {
        q: brandName,
        limit: limit,
        sort: 'new',
        t: 'week' // time filter: week
      },
      headers: {
        'User-Agent': 'BrandTrackerApp/1.0'
      }
    });

    const posts = response.data.data.children;
    
    return posts.map(post => ({
      id: post.data.id,
      text: post.data.title + ' ' + (post.data.selftext || ''),
      source: 'Reddit',
      subreddit: post.data.subreddit,
      timestamp: new Date(post.data.created_utc * 1000),
      author: post.data.author,
      url: `https://reddit.com${post.data.permalink}`,
      score: post.data.score,
      numComments: post.data.num_comments
    }));
  } catch (error) {
    console.error('Reddit API Error:', error);
    return [];
  }
};

// Get comments from a specific post (optional, for deeper analysis)
export const getPostComments = async (subreddit, postId) => {
  try {
    const response = await axios.get(
      `${REDDIT_BASE_URL}/r/${subreddit}/comments/${postId}.json`,
      {
        headers: {
          'User-Agent': 'BrandTrackerApp/1.0'
        }
      }
    );
    
    const comments = response.data[1].data.children;
    return comments.map(comment => ({
      text: comment.data.body,
      author: comment.data.author,
      score: comment.data.score,
      timestamp: new Date(comment.data.created_utc * 1000)
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};