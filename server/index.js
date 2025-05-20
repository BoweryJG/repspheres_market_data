require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Middleware
app.use(cors());
// Stripe webhook needs the raw body, so register this route before express.json
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received webhook event:', event.type);
  // TODO: handle subscription events and update database

  res.json({ received: true });
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'News proxy service is running' });
});

// Create a Stripe checkout session for subscriptions
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
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

// Start the server
app.listen(port, () => {
  console.log(`News proxy service running on port ${port}`);
});
