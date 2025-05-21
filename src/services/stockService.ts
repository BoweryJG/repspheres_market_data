import axios from 'axios';

export interface StockQuote {
  symbol: string;
  price: number | null;
  changePercent: number | null;
}

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  if (!symbols.length) return [];
  const NEWS_PROXY_URL = process.env.NODE_ENV === 'production'
    ? 'https://repspheres-news-proxy.onrender.com'
    : 'http://localhost:3001';

  const params = new URLSearchParams();
  params.append('symbols', symbols.join(','));

  const response = await axios.get(`${NEWS_PROXY_URL}/api/stocks/quotes`, { params });
  return response.data as StockQuote[];
};
