require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'News proxy service is running' });
});

// Endpoint to fetch news by procedure category
app.get('/api/news/procedure-category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 4 } = req.query;
    
    const cacheKey = `news-procedure-${categoryId}-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Fetch from your actual database
    const response = await axios.get(
      `${process.env.SUPABASE_URL}/rest/v1/v_news_by_procedure_category?procedure_category_id=eq.${categoryId}&limit=${limit}`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    );
    
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news by procedure category:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Endpoint to fetch news by industry
app.get('/api/news/industry/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { limit = 10, featured } = req.query;
    
    const cacheKey = `news-industry-${industry}-${limit}-${featured || 'all'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Build the query
    let url = `${process.env.SUPABASE_URL}/rest/v1/news_articles?`;
    
    // Only add industry filter if it's not 'all'
    if (industry !== 'all') {
      url += `industry=eq.${industry}&`;
    }
    
    // Add featured filter if provided
    if (featured === 'true') {
      url += 'featured=eq.true&';
    }
    
    url += `limit=${limit}&order=published_date.desc`;
    
    // Fetch from your actual database
    const response = await axios.get(url, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news by industry:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Endpoint to fetch news by category
app.get('/api/news/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 6 } = req.query;
    
    const cacheKey = `news-category-${categoryId}-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Fetch from your actual database
    const response = await axios.get(
      `${process.env.SUPABASE_URL}/rest/v1/news_articles?select=*,news_article_categories!inner(category_id)&news_article_categories.category_id=eq.${categoryId}&limit=${limit}&order=published_date.desc`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    );
    
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Endpoint to generate image for news article
app.post('/api/news/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }
    
    const cacheKey = `image-${prompt.substring(0, 100)}`;
    const cachedImage = cache.get(cacheKey);
    
    if (cachedImage) {
      return res.json({ imageUrl: cachedImage });
    }
    
    // For demo purposes, return a placeholder image
    // In production, you would integrate with an actual image generation API
    const placeholderImages = [
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5',
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04',
      'https://images.unsplash.com/photo-1595003500447-88ce9a0c0144',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
      'https://images.unsplash.com/photo-1571942676516-bcab84649e44',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c'
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    cache.set(cacheKey, randomImage);
    
    res.json({ imageUrl: randomImage });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Endpoint to search for news articles
app.get('/api/news/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const cacheKey = `news-search-${query}-${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Fetch from your actual database
    const response = await axios.get(
      `${process.env.SUPABASE_URL}/rest/v1/news_articles?or=(title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%)&limit=${limit}&order=published_date.desc`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    );
    
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: 'Failed to search news articles' });
  }
});

// Endpoint to fetch real-time news for a procedure using Brave Search
app.get('/api/news/realtime/:procedureId', async (req, res) => {
  try {
    const { procedureId } = req.params;
    const { limit = 5 } = req.query;

    const query = encodeURIComponent(procedureId);
    const cacheKey = `brave-news-${query}-${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get('https://api.search.brave.com/res/v1/news/search', {
      params: { q: query, count: limit },
      headers: { 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY }
    });

    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Brave news:', error);
    res.status(500).json({ error: 'Failed to fetch Brave news' });
  }
});

// Endpoint to fetch stock quotes for given symbols using Alpha Vantage
app.get('/api/stocks/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ error: 'Symbols query parameter is required' });
    }

    const symbolList = String(symbols).split(',').map(s => s.trim().toUpperCase());
    const results = [];

    for (const sym of symbolList) {
      const cacheKey = `stock-${sym}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        results.push(cached);
        continue;
      }

      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: sym,
          apikey: process.env.ALPHA_VANTAGE_API_KEY
        }
      });

      const data = response.data['Global Quote'] || {};
      const quote = {
        symbol: sym,
        price: parseFloat(data['05. price']) || null,
        changePercent: parseFloat((data['10. change percent'] || '0').replace('%', ''))
      };

      cache.set(cacheKey, quote, 300); // cache for 5 minutes
      results.push(quote);
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    res.status(500).json({ error: 'Failed to fetch stock quotes' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`News proxy service running on port ${port}`);
});
