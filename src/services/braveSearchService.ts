import axios from 'axios';

const NEWS_PROXY_URL = process.env.NODE_ENV === 'production'
  ? 'https://repspheres-news-proxy.onrender.com'
  : 'http://localhost:3001';

export async function search(query: string, limit: number = 10): Promise<any> {
  const response = await axios.get(`${NEWS_PROXY_URL}/api/search/brave`, {
    params: { query, limit }
  });
  return response.data;
}

export default { search };
